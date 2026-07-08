"""
Phase 0: Probe whether Ollama Cloud models emit native OpenAI tool_calls.

Decision rule:
- If at least one model emits working tool_calls with valid args -> native tools allowed for frameworks that need them.
- If neither model works -> all frameworks must emulate tools via JSON-in-text.
- Result written to probe_results.json.
"""
import json
import sys
import time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from common import API_KEY, OLLAMA_BASE_URL, ResearchLog


def make_tool_schema():
    return [{
        "type": "function",
        "function": {
            "name": "get_balance_sheet",
            "description": "Fetch the balance sheet for a given company and fiscal year.",
            "parameters": {
                "type": "object",
                "properties": {
                    "company": {"type": "string", "description": "Company name"},
                    "fiscal_year": {"type": "integer", "description": "Fiscal year, e.g. 2001"}
                },
                "required": ["company", "fiscal_year"]
            }
        }
    }]


def probe_model(model_name: str, logger) -> dict:
    import openai
    client = openai.OpenAI(api_key=API_KEY, base_url=OLLAMA_BASE_URL)
    logger.log(f"PROBE {model_name}: sending tool-calling request")
    t0 = time.time()
    try:
        resp = client.chat.completions.create(
            model=model_name,
            messages=[
                {"role": "system", "content": "You are an audit research assistant. Use tools to fetch data when asked."},
                {"role": "user", "content": "Fetch the balance sheet for Enron for fiscal year 2001."}
            ],
            tools=make_tool_schema(),
            tool_choice="auto",
            temperature=0,
            max_tokens=2048,
            timeout=120,
        )
        dt = time.time() - t0
        choice = resp.choices[0].message
        tool_calls = getattr(choice, "tool_calls", None)
        result = {
            "model": model_name,
            "elapsed_s": round(dt, 2),
            "has_tool_calls": bool(tool_calls),
            "n_tool_calls": len(tool_calls) if tool_calls else 0,
            "tool_calls_raw": None,
            "content_fallback": (choice.content or "")[:500] if not tool_calls else None,
            "error": None
        }
        if tool_calls:
            tc_list = []
            for tc in tool_calls:
                tc_list.append({
                    "id": getattr(tc, "id", None),
                    "type": getattr(tc, "type", None),
                    "function_name": tc.function.name,
                    "function_args_raw": tc.function.arguments,
                })
                try:
                    json.loads(tc.function.arguments)
                    parsed_ok = True
                except Exception:
                    parsed_ok = False
                tc_list[-1]["args_parsed_ok"] = parsed_ok
            result["tool_calls_raw"] = tc_list
            result["native_tool_call"] = any(tc["args_parsed_ok"] for tc in tc_list)
        else:
            result["native_tool_call"] = False
        logger.log(f"PROBE {model_name}: has_tool_calls={result['has_tool_calls']} native_tool_call={result['native_tool_call']} ({dt:.1f}s)")
        if tool_calls:
            logger.log(f"PROBE {model_name} tool_calls: {json.dumps(result['tool_calls_raw'], indent=2)}")
        else:
            logger.log(f"PROBE {model_name} no tool_calls; content fallback: {result['content_fallback'][:200]}")
        return result
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"PROBE {model_name}: EXCEPTION after {dt:.1f}s: {type(e).__name__}: {e}")
        return {
            "model": model_name,
            "elapsed_s": round(dt, 2),
            "has_tool_calls": False,
            "n_tool_calls": 0,
            "tool_calls_raw": None,
            "content_fallback": None,
            "error": f"{type(e).__name__}: {e}",
            "native_tool_call": False
        }


def main():
    run_dir = Path(__file__).parent / "runs" / f"probe_{int(time.time())}"
    logger = ResearchLog(run_dir)
    logger.section("PHASE 0: Tool-calling probe on Ollama Cloud")

    models = ["glm-5.2:cloud", "deepseek-v4-pro"]
    results = [probe_model(m, logger) for m in models]

    any_native = any(r["native_tool_call"] for r in results)
    decision = "NATIVE_AVAILABLE" if any_native else "EMULATE_ALL"
    summary = {
        "decision": decision,
        "any_model_supports_native_tool_call": any_native,
        "per_model": results,
        "implication": (
            "Frameworks may use native tool_calls for supported models; document per-model asymmetry."
            if any_native else
            "All frameworks must emulate tools via JSON-in-text; comparison stays fair but no native tools anywhere."
        )
    }
    (run_dir / "probe_results.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    (Path(__file__).parent / "runs" / "probe_results_latest.json").write_text(json.dumps(summary, indent=2), encoding="utf-8")
    logger.log(f"DECISION: {decision}")
    logger.log(f"Wrote probe_results.json to {run_dir}")
    print(json.dumps(summary, indent=2))


if __name__ == "__main__":
    main()