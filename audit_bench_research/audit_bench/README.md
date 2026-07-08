# audit_bench — Multi-Framework Audit Judgement Benchmark

Benchmark comparing how well four multi-agent frameworks exercise audit judgement on
real-world scandal cases, using Ollama Cloud LLMs (OpenAI-compatible endpoint).

## What it tests

Each framework runs the **same 4 audit-persona team** against the **same 4 real scandal cases**
with the **same model** (glm-5.2:cloud). Each team must produce a structured audit opinion:
rating (Clean / Qualified / Adverse / Disclaimer / Unable) + reasoning + cited red flags +
explicit "unable to determine" if evidence is genuinely insufficient.

The agents never see the ground truth. After they emit an opinion, the scorer compares it
against the known historical outcome on four axes.

### Frameworks compared
- **plain_python** — Blackboard/Cook/Kitchen pattern (baseline; reuses the proven pattern from
  this repo's `blackboard_kitchen.py`). Reactive execution via input digests, 3 rounds max,
  independence-checker can reject and loop back.
- **crewai** — `Crew` with 4 `Agent`s in `Process.sequential`. Each `Task`'s output is auto-
  threaded as context to the next. No native loop on rejection (framework limitation).
- **swarm** — OpenAI Swarm. 4 `Agent`s with explicit `transfer_to_*` handoffs and function-call
  tools (`cite_red_flag`, `record_skeptic_point`, `set_draft_opinion`, `signoff_independence`).
  Tests native tool-calling on Ollama Cloud.
- **langgraph** — `StateGraph` with a conditional edge from SkepticReviewer back to AuditSenior
  when objections are unresolved (max 2 revisits). This loop is the framework's main
  differentiator vs the others.

### Personas (constant across frameworks)
| Persona | Role | Stops if |
|---|---|---|
| EngagementPartner | Sets scope, materiality, gives final opinion | disagrees with manager's draft |
| AuditSenior | Substantive procedures, lists red flags with citations | no evidence to cite |
| SkepticReviewer | Adversarial — argues against prevailing view, hunts fraud | — |
| IndependenceChecker | Verifies cited evidence; flags unsupported claims | any claim lacks a citation |

### Cases (real scandals, abridged to pre-scandal public information)
- **Enron 2001** — correct hindsight opinion: Adverse
- **Wirecard 2020** — Adverse / Disclaimer
- **SVB 2023** — Qualified / Adverse
- **Tesco 2014** — Qualified / Disclaimer

Each case lives in `cases/<case>/` with:
- `evidence/` — agent-visible material (only what was publicly known *before* the scandal broke)
- `ground_truth.json` — agent-invisible; the actual scandal, correct opinion, key red flags

### Scoring axes (0-5 each, total / 20)
1. **Judgement accuracy** — exact/adjacent/wrong vs `ground_truth.acceptable_ratings`
2. **Evidence rigour** — fraction of ground-truth red flags cited (recall × 5)
3. **Reasoning quality** — LLM-judge rubric score (glm-5.2:cloud as judge, single call per run)
4. **Calibration** — calibrated / overconfident / underconfident vs ground-truth evidence sufficiency

A 5th axis, **framework ergonomics**, is filled in manually after building all four (LOC,
debuggability, boilerplate-vs-loop ratio).

## Setup

Uses the repo's existing uv-managed `.venv` (Python 3.13). Framework deps already installed:
```
uv pip install crewai langgraph langchain-openai openai-swarm
```
API key read from `C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt` (hardcoded, see
root `AGENTS.md`).

## How to run

### Full benchmark (4 fw × 4 cases × 1 model = 16 runs, ~90 min with glm-5.2:cloud)
```powershell
.\.venv\Scripts\python.exe audit_bench\run_benchmark.py --frameworks all --cases all --models glm-5.2:cloud
```
Outputs land in `audit_bench/runs/bench_<ts>/`:
- `research_log.md` — timestamped log of every LLM call (the basis for the research paper)
- `raw/<fw>/<model>/<case>/result.json` — full agent transcript + opinion
- `raw/<fw>/<model>/<case>/score.json` — per-run score
- `all_results.json`, `all_scores.json` — flat lists

### Generate the rating report
```powershell
.\.venv\Scripts\python.exe audit_bench\rate_frameworks.py audit_bench\runs\bench_<ts>\all_scores.json
```
Writes `all_scores.report.md` (markdown table) and `.report.json`.

### Probe a single (framework, case, model) combination
```powershell
.\.venv\Scripts\python.exe audit_bench\run_benchmark.py --frameworks langgraph --cases case_svb_2023 --models deepseek-v4-pro
```

### Phase 0 tool-call probe
```powershell
.\.venv\Scripts\python.exe audit_bench\_probe_tool_call.py
```
Result: `runs/probe_results_latest.json`. On 2026-07-07 both glm-5.2:cloud and deepseek-v4-pro
emitted native OpenAI-style `tool_calls` with valid args (3.7s and 1.7s respectively).

## Key findings

See `runs/bench_<ts>/all_scores.report.md` for the latest results. Headline findings and the
framework_ergonomics axis are written up in `RATING_REPORT.md` at the audit_bench root after
each completed run.

## Caveats

- **Run from repo root**, not from inside `audit_bench/` — the harness uses `Path(__file__)`
  for all internal paths so CWD does not matter for the harness itself, but framework modules
  use `sys.path.insert(0, str(Path(__file__).parent.parent))` to import `common.py`.
- Sequential calls, 180s timeout per LLM call (per root AGENTS.md reasoning-model note).
  Single-threaded to keep Ollama Cloud rate limits sane and logs readable.
- CrewAI's `LLM(model=...)` must NOT include the `openai/` prefix when using a custom
  `base_url` pointing at Ollama Cloud — the prefix triggers LiteLLM provider routing which
  fails without `litellm` installed. Bare model name works.
- OpenAI Swarm's `client.run()` uses `context_variables=` (not `context=`) and has no
  `max_tokens` parameter — those are set on the underlying OpenAI client / model config.
- Windows: model names containing `:` (e.g. `glm-5.2:cloud`) are not valid path characters;
  the harness sanitises them to `_` when writing per-run directories.

## For the research paper

The primary source material is `runs/bench_<ts>/research_log.md` — a timestamped, append-only
log of every LLM call across every framework on every case. Pair it with the per-run
`result.json` transcripts for qualitative analysis, and `all_scores.report.md` for the
quantitative comparison.