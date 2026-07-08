"""
Aggregate per-(framework, case, model) scores into per-framework ratings on 5 axes.

Axes (0-5 each):
  1. judgement_accuracy  : mean rating_accuracy (exact=5, adjacent=3, wrong=0)
  2. evidence_rigour     : mean red_flag_recall * 5
  3. reasoning_quality   : mean reasoning_score (already 0-5)
  4. calibration         : calibrated=5, over/under=2, both=0
  5. framework_ergonomics: (manual column — left blank here, filled in by hand after building)

Writes rating_report.md.
"""
import sys
import json
import argparse
from pathlib import Path
from collections import defaultdict

sys.path.insert(0, str(Path(__file__).parent))


def accuracy_to_score(v: str) -> float:
    return {"exact": 5.0, "adjacent": 3.0, "wrong": 0.0}.get(v, 0.0)


def calibration_to_score(v: str) -> float:
    return {"calibrated": 5.0, "overconfident": 2.0, "underconfident": 2.0}.get(v, 0.0)


def aggregate(scores: list) -> dict:
    by_fw = defaultdict(list)
    for s in scores:
        by_fw[s["framework"]].append(s)
    out = {}
    for fw, fw_scores in by_fw.items():
        n = len(fw_scores)
        out[fw] = {
            "n_runs": n,
            "judgement_accuracy": round(sum(accuracy_to_score(s["rating_accuracy"]) for s in fw_scores) / max(1, n), 2),
            "evidence_rigour": round(sum(s["red_flag_recall"]["recall"] for s in fw_scores) / max(1, n) * 5, 2),
            "reasoning_quality": round(max(0, sum(s["reasoning_quality"]["reasoning_score"] for s in fw_scores)) / max(1, n), 2),
            "calibration": round(sum(calibration_to_score(s["calibration"]["calibration"]) for s in fw_scores) / max(1, n), 2),
            "per_case": [
                {
                    "case": s["case_id"],
                    "model": s["model"],
                    "rating_accuracy": s["rating_accuracy"],
                    "recall": round(s["red_flag_recall"]["recall"], 2),
                    "reasoning_score": s["reasoning_quality"]["reasoning_score"],
                    "calibration": s["calibration"]["calibration"],
                    "elapsed_s": s.get("elapsed_s", 0),
                    "agent_rating": s["result_summary"]["rating"],
                    "agent_unable": s["result_summary"]["unable_to_determine"]
                } for s in fw_scores
            ]
        }
    return out


def to_markdown(report: dict) -> str:
    lines = ["# Audit Bench Framework Rating Report", ""]
    lines.append("## Per-framework summary (axes scored 0-5; framework_ergonomics is filled manually)")
    lines.append("")
    lines.append("| Framework | n_runs | Judgement accuracy | Evidence rigour | Reasoning quality | Calibration | Total / 20 |")
    lines.append("|---|---|---|---|---|---|---|")
    for fw, m in report.items():
        total = m["judgement_accuracy"] + m["evidence_rigour"] + m["reasoning_quality"] + m["calibration"]
        lines.append(f"| {fw} | {m['n_runs']} | {m['judgement_accuracy']} | {m['evidence_rigour']} | {m['reasoning_quality']} | {m['calibration']} | {round(total,2)} |")
    lines.append("")
    lines.append("## Per-case detail")
    for fw, m in report.items():
        lines.append(f"\n### {fw}")
        lines.append("| Case | Model | Agent rating | Rating accuracy | Recall | Reasoning | Calibration | Elapsed s |")
        lines.append("|---|---|---|---|---|---|---|---|")
        for c in m["per_case"]:
            lines.append(f"| {c['case']} | {c['model']} | {c['agent_rating']} | {c['rating_accuracy']} | {c['recall']} | {c['reasoning_score']} | {c['calibration']} | {c['elapsed_s']} |")
    return "\n".join(lines)


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("scores_json", help="path to all_scores.json from run_benchmark")
    ap.add_argument("--out", default=None)
    args = ap.parse_args()

    scores = json.loads(Path(args.scores_json).read_text(encoding="utf-8"))
    report = aggregate(scores)
    out_json = args.out or str(Path(args.scores_json).with_suffix(".report.json"))
    out_md = Path(out_json).with_suffix(".md")
    Path(out_json).write_text(json.dumps(report, indent=2), encoding="utf-8")
    Path(out_md).write_text(to_markdown(report), encoding="utf-8")
    print(f"Wrote {out_json} and {out_md}")
    print(to_markdown(report))


if __name__ == "__main__":
    main()