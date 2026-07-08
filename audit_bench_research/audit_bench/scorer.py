"""
Scorer for audit_bench.

For each (framework, case, model) result, compute:
  1. rating_accuracy:  exact | adjacent | wrong  (vs ground_truth.acceptable_ratings)
  2. red_flag_recall: fraction of ground_truth.key_red_flags cited (substring/keyword match)
  3. reasoning_quality: LLM-judged rubric score 0-5 (single glm-5.2:cloud call)
  4. calibration:      penalise over/under-confidence vs ground truth

Aggregate to a per-(framework, case, model) score dict; aggregate further per-framework in rate_frameworks.py.
"""
import json
import re
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import API_KEY, OLLAMA_BASE_URL, JUDGE_MODEL, REASONING_MAX_TOKENS, REASONING_TIMEOUT, ResearchLog


RATING_DISTANCE = {
    "Clean": 0, "Qualified": 1, "Adverse": 2, "Disclaimer": 2, "Unable": 3,
}


def score_rating_accuracy(result_rating: str, gt: dict) -> str:
    acceptable = gt["acceptable_ratings"]
    correct = gt["scored_correct_rating"]
    if result_rating in acceptable:
        return "exact"
    if result_rating == "Clean" and gt.get("reject_clean"):
        return "wrong"
    dist = abs(RATING_DISTANCE.get(result_rating, 99) - RATING_DISTANCE.get(correct, 0))
    if dist == 1:
        return "adjacent"
    return "wrong"


KEYWORD_MAP = {
    "SPE": ["special-purpose", "spe", "cfo", "fastow", "off-balance", "off balance"],
    "gross_up": ["gross-up", "gross up", "notional"],
    "independence": ["independence", "consulting", "non-audit", "tenure", "anderson"],
    "financing_flow": ["financing cash", "asset sale", "unconsolidated"],
    "wirecard_cash": ["trust", "philippines", "third-party", "acquirer", "tpa", "wirecard"],
    "kpmg_special": ["kpmg", "special audit", "insufficient audit evidence"],
    "svb_htm": ["held-to-maturity", "htm", "unrealized", "unrealised", "15"],
    "svb_uninsured": ["uninsured", "87", "fdic"],
    "svb_duration": ["duration", "6.2", "mismatch", "interest rate"],
    "svb_tenure": ["tenure", "20", "becker", "10b5"],
    "tesco_rebate": ["rebate", "commercial income", "supplier", "accrual"],
    "tesco_sample": ["sample", "19", "12", "2,000", "2000", "8%"],
    "tesco_tenure": ["1980", "30"],
}


def score_red_flag_recall(result_red_flags: list, gt: dict) -> dict:
    flags_text = " ".join(result_red_flags).lower()
    gt_flags = gt["key_red_flags_that_should_have_been_raised"]
    matched = []
    missed = []
    for gt_flag in gt_flags:
        gt_lower = gt_flag.lower()
        direct = gt_lower in flags_text or any(
            self_text in flags_text
            for self_text in [gt_lower[:80]]
        )
        keyword_cat = None
        for cat, kws in KEYWORD_MAP.items():
            if any(kw in gt_lower for kw in kws):
                keyword_cat = cat
                break
        kw_hit = keyword_cat and any(kw in flags_text for kw in KEYWORD_MAP[keyword_cat])
        if direct or kw_hit:
            matched.append(gt_flag)
        else:
            missed.append(gt_flag)
    recall = len(matched) / max(1, len(gt_flags))
    return {"recall": recall, "matched": matched, "missed": missed, "n_gt_flags": len(gt_flags)}


def score_calibration(result: dict, gt: dict) -> dict:
    said_unable = bool(result.get("unable_to_determine")) or result.get("rating") == "Unable"
    evidence_sufficient = gt["expected_judgement_axes"]["evidence_sufficiency"].lower().startswith("sufficient")
    expected_to_decide = evidence_sufficient
    if expected_to_decide and said_unable:
        verdict = "underconfident"
    elif not expected_to_decide and not said_unable:
        verdict = "overconfident"
    else:
        verdict = "calibrated"
    return {"calibration": verdict, "evidence_sufficient_per_gt": evidence_sufficient, "agent_said_unable": said_unable}


JUDGE_RUBRIC = """You are scoring an AI audit-agent team's output against ground truth. Score 0-5 on reasoning quality.

RUBRIC:
5 = Reasoning is rigorous; cites specific evidence items; explicitly weighs counter-evidence; identifies the core structural failure (not just symptoms); reasoning matches what a competent senior auditor would write.
4 = Reasoning is solid; cites evidence; identifies most material issues; minor gaps.
3 = Reasoning is adequate; identifies the correct area but vague on specifics; some citations missing.
2 = Reasoning is superficial; identifies the scandal category but does not cite evidence; generic.
1 = Reasoning is hand-waving; cites no specific evidence; could apply to any audit failure.
0 = Reasoning is absent, contradictory, or actively misleading.

Return ONLY an integer 0-5 in <SCORE></SCORE> tags, followed by a one-sentence justification in <JUST></JUST> tags."""


def score_reasoning_quality(result: dict, gt: dict, logger) -> dict:
    import openai
    client = openai.OpenAI(api_key=API_KEY, base_url=OLLAMA_BASE_URL)
    user_prompt = f"""GROUND TRUTH:
Scandal: {gt['scandal_summary']}
Correct opinion in hindsight: {gt['correct_opinion_in_hindsight']}
Key red flags that should have been raised:
{chr(10).join(f'- {f}' for f in gt['key_red_flags_that_should_have_been_raised'])}

AGENT TEAM OUTPUT:
Rating: {result.get('rating')}
Reasoning: {result.get('reasoning', '')}
Red flags cited:
{chr(10).join(f'- {f}' for f in result.get('red_flags', []))}
Unable to determine: {result.get('unable_to_determine')}
"""
    logger.log(f"[scorer.judge] calling {JUDGE_MODEL}")
    t0 = time.time()
    try:
        resp = client.chat.completions.create(
            model=JUDGE_MODEL,
            messages=[
                {"role": "system", "content": JUDGE_RUBRIC},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0,
            max_tokens=512,
            timeout=REASONING_TIMEOUT,
        )
        text = resp.choices[0].message.content or ""
        dt = time.time() - t0
        m_score = re.search(r"<SCORE>\s*(\d+)\s*</SCORE>", text)
        m_just = re.search(r"<JUST>\s*(.*?)\s*</JUST>", text, re.DOTALL)
        score = int(m_score.group(1)) if m_score else -1
        just = m_just.group(1).strip() if m_just else text[:300]
        logger.log(f"[scorer.judge] score={score} ({dt:.1f}s) just={just[:100]}")
        return {"reasoning_score": score, "justification": just, "raw": text[:500]}
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"[scorer.judge] EXCEPTION ({dt:.1f}s): {e}")
        return {"reasoning_score": -1, "justification": f"judge_failed: {e}", "raw": ""}


def score_result(result: dict, gt: dict, logger) -> dict:
    return {
        "case_id": gt["case_id"],
        "framework": result.get("framework"),
        "model": result.get("model"),
        "rating_accuracy": score_rating_accuracy(result.get("rating", "Unable"), gt),
        "red_flag_recall": score_red_flag_recall(result.get("red_flags", []), gt),
        "reasoning_quality": score_reasoning_quality(result, gt, logger),
        "calibration": score_calibration(result, gt),
        "result_summary": {
            "rating": result.get("rating"),
            "unable_to_determine": result.get("unable_to_determine"),
            "n_red_flags_cited": len(result.get("red_flags", []))
        }
    }


if __name__ == "__main__":
    import argparse
    p = argparse.ArgumentParser()
    p.add_argument("results_json", help="path to a results JSON (list of result dicts)")
    p.add_argument("ground_truth_json")
    p.add_argument("--out", default="score.json")
    args = p.parse_args()

    results = json.loads(Path(args.results_json).read_text(encoding="utf-8"))
    gt = json.loads(Path(args.ground_truth_json).read_text(encoding="utf-8"))
    log = ResearchLog(Path(args.results_json).parent)
    if isinstance(results, dict):
        results = [results]
    scored = [score_result(r, gt, log) for r in results]
    Path(args.out).write_text(json.dumps(scored, indent=2), encoding="utf-8")
    print(json.dumps(scored, indent=2))