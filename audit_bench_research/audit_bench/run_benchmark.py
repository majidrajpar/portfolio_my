"""
Benchmark harness. Runs every (framework, case, model) combination sequentially,
scores each result, and writes a full research log + raw results.

Usage:
    python audit_bench/run_benchmark.py [--frameworks all|plain_python,crewai,swarm,langgraph]
                                         [--cases all|case_enron_2001,...]
                                         [--models glm-5.2:cloud,deepseek-v4-pro]
"""
import sys
import json
import time
import argparse
import importlib
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import ResearchLog, load_ground_truth
from scorer import score_result

CASES_DIR = Path(__file__).parent / "cases"
RUNS_DIR = Path(__file__).parent / "runs"
FRAMEWORKS = {
    "plain_python": "frameworks.plain_python",
    "crewai": "frameworks.crewai_fw",
    "swarm": "frameworks.swarm_fw",
    "langgraph": "frameworks.langgraph_fw",
    "langgraph_gate": "frameworks.langgraph_gate_fw",
    "langgraph_gate3": "frameworks.langgraph_gate3_fw",
}


def load_framework(name: str):
    mod = importlib.import_module(FRAMEWORKS[name])
    return mod.run_case


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--frameworks", default="all")
    ap.add_argument("--cases", default="all")
    ap.add_argument("--models", default="glm-5.2:cloud")
    args = ap.parse_args()

    fw_names = list(FRAMEWORKS) if args.frameworks == "all" else args.frameworks.split(",")
    case_names = [c.name for c in sorted(CASES_DIR.iterdir()) if c.is_dir() and c.name.startswith("case_")] if args.cases == "all" else args.cases.split(",")
    models = args.models.split(",")

    ts = int(time.time())
    run_dir = RUNS_DIR / f"bench_{ts}"
    logger = ResearchLog(run_dir)
    logger.section(f"BENCHMARK RUN ts={ts}")
    logger.log(f"frameworks={fw_names}")
    logger.log(f"cases={case_names}")
    logger.log(f"models={models}")

    all_results = []
    all_scores = []

    for fw in fw_names:
        for model in models:
            for case_name in case_names:
                case_dir = CASES_DIR / case_name
                if not case_dir.exists():
                    logger.log(f"SKIP missing case dir {case_dir}")
                    continue
                gt = load_ground_truth(case_dir)
                logger.section(f"RUN fw={fw} model={model} case={case_name}")
                run_fn = load_framework(fw)
                t0 = time.time()
                try:
                    result = run_fn(case_dir, model, logger)
                except Exception as e:
                    logger.log(f"HARNESS EXCEPTION in run_case: {type(e).__name__}: {e}")
                    result = {
                        "framework": fw, "model": model, "case": case_name,
                        "rating": "Unable", "reasoning": f"harness exception: {e}",
                        "red_flags": [], "unable_to_determine": True,
                        "transcript": [{"agent": "harness", "message": str(e)}]
                    }
                dt = time.time() - t0
                logger.log(f"run_case took {dt:.1f}s")
                result["elapsed_s"] = round(dt, 1)

                model_path_safe = model.replace(":", "_")
                (run_dir / "raw" / fw / model_path_safe / case_name).mkdir(parents=True, exist_ok=True)
                (run_dir / "raw" / fw / model_path_safe / case_name / "result.json").write_text(json.dumps(result, indent=2), encoding="utf-8")
                logger.log(f"raw result saved")

                logger.log(f"scoring ...")
                try:
                    score = score_result(result, gt, logger)
                except Exception as e:
                    logger.log(f"scorer EXCEPTION: {type(e).__name__}: {e}")
                    score = {"case_id": case_name, "framework": fw, "model": model,
                             "rating_accuracy": "wrong", "red_flag_recall": {"recall": 0, "matched": [], "missed": [], "n_gt_flags": 0},
                             "reasoning_quality": {"reasoning_score": -1, "justification": f"scorer failed: {e}", "raw": ""},
                             "calibration": {"calibration": "calibrated", "evidence_sufficient_per_gt": False, "agent_said_unable": True},
                             "result_summary": {"rating": result.get("rating"), "unable_to_determine": result.get("unable_to_determine", False), "n_red_flags_cited": 0}}
                score["elapsed_s"] = round(dt, 1)
                (run_dir / "raw" / fw / model_path_safe / case_name / "score.json").write_text(json.dumps(score, indent=2), encoding="utf-8")
                all_results.append(result)
                all_scores.append(score)
                logger.log(f"score: rating_accuracy={score['rating_accuracy']} recall={score['red_flag_recall']['recall']:.2f} reasoning={score['reasoning_quality']['reasoning_score']} calibration={score['calibration']['calibration']}")

    (run_dir / "all_results.json").write_text(json.dumps(all_results, indent=2), encoding="utf-8")
    (run_dir / "all_scores.json").write_text(json.dumps(all_scores, indent=2), encoding="utf-8")
    (run_dir / "summary.json").write_text(json.dumps({
        "ts": ts,
        "frameworks": fw_names, "cases": case_names, "models": models,
        "n_runs": len(all_results)
    }, indent=2), encoding="utf-8")
    logger.section("BENCHMARK COMPLETE")
    logger.log(f"results dir: {run_dir}")
    print(json.dumps({
        "run_dir": str(run_dir),
        "n_runs": len(all_results),
        "n_scores": len(all_scores)
    }, indent=2))


if __name__ == "__main__":
    main()