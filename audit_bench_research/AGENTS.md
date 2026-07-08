# AGENTS.md

Three independent Python experiments sharing one uv-managed venv (Python 3.13). Not a package, not a git repo — no build/test/lint toolchain exists. Verify changes by running the relevant script.

## Environment

- venv at `./.venv` (uv-managed, CPython 3.13). Activate: `./.venv/Scripts/Activate.ps1`
- Runtime deps already installed: `openai`, `fpdf2`, plus `crewai`, `langgraph`, `langchain-openai`, `openai-swarm` for `audit_bench/`. No `requirements.txt` / `pyproject.toml` exists — to rehydrate: `uv pip install openai fpdf2 crewai langgraph langchain-openai openai-swarm`
- LLM access uses Ollama Cloud's OpenAI-compatible endpoint (`base_url="https://ollama.com/v1"`), not OpenAI itself. API key read from `C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt` — path is hardcoded across scripts; do not assume `OPENAI_API_KEY` env var.
- XeLaTeX is required for `toto/` PDF generation, hardcoded to `C:\Users\sorat\AppData\Local\Programs\MiKTeX\miktex\bin\x64\xelatex.exe` in `toto/pdf_latex.py:10`. Won't run on other machines without editing.

## toto/ — Internal Audit Document Generator

**Entrypoint is `internal_audit_system_final.py`, not the unnumbered `internal_audit_system.py`.** The `_v2/_v3/_v4/_final` and unnumbered files are sequential iterations; `_final` is current. Older versions import different PDF backends (see below) — treat as historical, don't edit.

PDF backend split (critical, easy to break):
- `pdf_latex.py` — **active**, XeLaTeX + DejaVu Sans. Functions are `gen_*` (e.g. `gen_planning_memo`).
- `pdf_utils.py` — **abandoned**, fpdf2. Functions are `create_*_pdf`. Only `internal_audit_system.py` and `_v2` import it. Kept only because the abandoned fpdf2 attempt is referenced in the investigation report content.
- `dejavu/*.ttf` — used by both backends; do not delete.

All `toto/` scripts use `sys.path.insert(0, str(Path(__file__).parent))` and `BASE_DIR = Path("internal_audit_engagement")` (relative). **Run scripts from `toto/` as the CWD**, not from repo root, or output paths break.

The investigation/reporting scripts (`deep_investigation.py`, `generate_investigation_report.py`, `compile_investigation.py`, `generate_linkedin_article.py`, `generate_research_essay.py`) chain: each reads prior output from `internal_audit_engagement/4_Reports/`. Run in that order if regenerating.

`internal_audit_engagement/` is **generated output** with a fixed `0_Planning` → `5_FollowUp` directory layout — don't hand-edit; rerun the generator.

## audit_bench/ — Multi-Framework Audit Judgement Benchmark

Benchmarks four multi-agent frameworks (plain_python Blackboard, CrewAI, OpenAI Swarm, LangGraph) on a shared audit-judgement task: 4 real scandal cases (Enron, Wirecard, SVB, Tesco), 4 constant personas (EngagementPartner, AuditSenior, SkepticReviewer, IndependenceChecker), agents see only pre-scandal evidence and emit a structured opinion compared against hidden ground truth.

**Entrypoints:**
- `run_benchmark.py` — runs all (framework × case × model) combinations; writes `runs/bench_<ts>/` with `research_log.md` (the primary source for the research paper), per-run `result.json`/`score.json`, and `all_results.json`/`all_scores.json`.
- `rate_frameworks.py <all_scores.json>` — aggregates to `all_scores.report.md` (5-axis rating table).
- `_probe_tool_call.py` — Phase 0 probe; verified 2026-07-07 that both `glm-5.2:cloud` and `deepseek-v4-pro` emit native OpenAI-style `tool_calls` via Ollama Cloud.
- `scorer.py` — 4 scored axes (judgement accuracy, red-flag recall, reasoning quality via glm-5.2:cloud LLM judge, calibration) + framework_ergonomics (manual).

Framework modules in `frameworks/` share `common.py` (personas, `run_case` interface, `parse_opinion`, `call_llm`, `ResearchLog`). Each implements `run_case(case_dir, model, logger) -> dict`.

**Framework-specific gotchas (load-bearing, easy to break):**
- CrewAI `LLM(model=...)` must use the **bare model name** (`glm-5.2:cloud`), NOT `openai/glm-5.2:cloud` — the `openai/` prefix triggers LiteLLM provider routing which fails without `litellm` installed. `base_url=` + `api_key=` route the call to Ollama Cloud directly.
- OpenAI Swarm's `client.run()` uses `context_variables=` (not `context=`) and has no `max_tokens` parameter.
- Windows: model names containing `:` are invalid path chars; the harness sanitises to `_` when writing per-run dirs.
- `langgraph_fw.py` is the only framework with a conditional revisit loop (skeptic → senior); `MAX_SKEPTIC_REVISITS = 2`.
- `langgraph_gate_fw.py` and `langgraph_gate3_fw.py` are deconfounding variants: same as langgraph_fw.py but with an independence-checker rejection loop (gate) added. `_gate` caps at 2 revisits; `_gate3` caps at 3 (matching plain_python). Added in response to peer review; see `audit_bench/DECONFOUNDING_REPORT.md`.
- `peer_review.py` is a second LangGraph multi-agent system (4 personas: MethodologyReviewer, EmpiricalReviewer, ConceptualReviewer, Editor) that peer-reviews `DISCUSSION_PAPER.md`. Has a conditional reconsideration loop (editor → reviewer on contradiction, cap 1 per reviewer). Self-healing: retries LLM calls, re-prompts on parse failure, continues on partial state. Output in `runs/peer_review_<ts>/`.

Cases in `cases/<case>/`: `evidence/` (agent-visible) + `ground_truth.json` (agent-invisible, scored-against). Do not edit ground truth without re-running the benchmark.

Extra deps (already in `.venv`): `crewai`, `langgraph`, `langchain-openai`, `openai-swarm`. Rehydrate: `uv pip install crewai langgraph langchain-openai openai-swarm`.

## Root — blackboard pattern experiments

`blackboard_kitchen.py` and `contrarian_audit.py` are standalone multi-agent demos sharing a `Blackboard`/`Cook`/`Kitchen` architecture (duplicated in each file, not imported). Each runs as `python <file>.py` and reads the Ollama API key from the same hardcoded path. `audit_independence_contrarian.md` is the article output of `contrarian_audit.py`. The `Blackboard`/`Cook`/`Kitchen` pattern is reused (and extended) in `audit_bench/frameworks/plain_python.py` as the baseline framework.

## Conventions to preserve

- Don't introduce a package layout / `__init__.py` — these are throwaway scripts relying on `sys.path.insert`.
- Don't replace the hardcoded XeLaTeX path or API key path with env vars without user buy-in; the user's workflow depends on the current locations.
- `glm-5.2:cloud` is a reasoning model — needs `max_tokens >= 4096` and 120s+ timeout or it returns empty. `deepseek-v4-pro` is the fast fallback for batch generation. This is load-bearing context from prior failures.