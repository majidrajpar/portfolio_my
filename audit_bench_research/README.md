# Multi-Framework AI Audit Judgement Benchmark

Can AI agent teams issue the right audit opinion on evidence from real corporate scandals — and if they fail, do they fail the way human auditors do?

This repository contains the benchmark, discussion paper, and full research logs from an experiment that tested four multi-agent orchestration frameworks on a shared audit-judgement task using four real-world scandal cases.

---

## The question

The audit profession has a recurring failure mode: auditors issue clean opinions on financial statements later revealed to be materially misstated. Enron (2001), Wirecard (2020), SVB (2023), and Tesco (2014) are four instances, each involving a different Big Four auditor, each ending in a clean opinion indefensible in hindsight.

If you give an AI agent team the same evidence a real auditor had *before* the scandal broke, will they issue the right opinion — or will they replicate the human failure?

---

## What's in this repo

| Path | What it is |
|---|---|
| `audit_bench/DISCUSSION_PAPER.md` | The full discussion paper (~7,500 words). Abstract, methodology, results, 7 findings, limitations, conclusion. |
| `audit_bench/RATING_REPORT.md` | Internal rating report with 5-axis scores, per-case detail, and correction log. |
| `audit_bench/DECONFOUNDING_REPORT.md` | Deconfounding experiment: adding the verdict gate to LangGraph. Cap-confound follow-up. |
| `audit_bench/LINKEDIN_ARTICLE.md` | Short version of the findings for social distribution. |
| `audit_bench/README.md` | How to run the benchmark (setup, commands, output structure). |
| `audit_bench/run_benchmark.py` | Harness — runs all (framework × case × model) combinations. |
| `audit_bench/rate_frameworks.py` | Aggregates scores into a per-framework rating table. |
| `audit_bench/scorer.py` | 4-axis scorer (judgement accuracy, evidence rigour, reasoning quality, calibration). |
| `audit_bench/peer_review.py` | LangGraph peer-review system (4 personas + conditional reconsideration loop). |
| `audit_bench/_probe_tool_call.py` | Phase 0 probe — verified native tool-calling on Ollama Cloud. |
| `audit_bench/common.py` | Shared personas, output contract, LLM config, research log. |
| `audit_bench/frameworks/` | 6 framework implementations (see below). |
| `audit_bench/cases/` | 4 scandal cases with agent-visible evidence and agent-invisible ground truth. |
| `toto/` | Prior experiment (internal audit document generator). Included for context. |
| `blackboard_kitchen.py`, `contrarian_audit.py` | Earlier blackboard-pattern experiments. |
| `AGENTS.md` | Instructions for AI coding agents working in this repo. |

---

## Frameworks benchmarked

| Framework | File | Architecture | LOC |
|---|---|---|---|
| plain Python | `frameworks/plain_python.py` | Blackboard/Cook/Kitchen pattern (reactive execution via input digests) | 112 |
| CrewAI | `frameworks/crewai_fw.py` | Sequential Crew with role-based agents | 111 |
| OpenAI Swarm | `frameworks/swarm_fw.py` | Handoff-driven agents with function-call tools | 133 |
| LangGraph | `frameworks/langgraph_fw.py` | StateGraph with conditional skeptic→senior revisit loop | 177 |
| LangGraph + gate (cap=2) | `frameworks/langgraph_gate_fw.py` | Deconfounding variant: adds independence-checker rejection loop | — |
| LangGraph + gate (cap=3) | `frameworks/langgraph_gate3_fw.py` | Deconfounding variant: matches plain_python's cap | — |

All frameworks share the same 4 audit personas (EngagementPartner, AuditSenior, SkepticReviewer, IndependenceChecker) defined in `common.py`. The only variable is the orchestration architecture.

---

## Cases

| Case | Entity | Auditor | FY | Real opinion | Hindsight-correct |
|---|---|---|---|---|---|
| Enron 2001 | Enron Corp | Arthur Andersen | FY2000 | Clean | Adverse |
| Wirecard 2020 | Wirecard AG | EY Munich | FY2019 | Clean | Adverse |
| SVB 2023 | SVB Financial | KPMG | FY2022 | Clean | Qualified |
| Tesco 2014 | Tesco PLC | PwC | FY2013/14 | Clean | Qualified |

Each case has `evidence/` (agent-visible, pre-scandal public information) and `ground_truth.json` (agent-invisible, scored against). The agent-visible/agent-invisible split tests forward reasoning, not pattern-matching.

---

## Headline result

- **16 runs** (4 frameworks × 4 cases × glm-5.2:cloud)
- The real auditors issued **Clean on all 4 cases**. All were wrong.
- The AI teams issued **Clean on 0 of 16 runs**. But **9 of 16 said "Unable"** — refusal to opine.
- **11 of 16** landed at or adjacent to the correct verdict.
- The failure mode is not poor judgement. It is refusal to judge — the mirror image of the human under-caution problem.

| Framework | Judgement accuracy | Evidence rigour | Reasoning quality | Calibration | Total / 20 |
|---|---|---|---|---|---|
| plain_python | 3.25 | 3.58 | 4.25 | 4.25 | **15.33** |
| langgraph | 2.50 | 3.59 | 4.25 | 3.50 | 13.84 |
| swarm | 1.50 | 4.44 | 3.50† | 3.50 | 12.94 |
| crewai | 1.50 | 0.00 | 0.00 | 3.50 | 5.00 |

†Swarm reasoning 3.50 = mean of {5, 5, 5, -1} where -1 is a failed-judge sentinel; true mean on 3 valid cases is 5.00.

---

## Peer review and deconfounding

The paper was peer-reviewed by a second LangGraph multi-agent system (`peer_review.py`) with 4 personas (MethodologyReviewer, EmpiricalReviewer, ConceptualReviewer, Editor) and a conditional reconsideration loop. The peer review:

- Flagged the gate-framework confound (all 3 reviewers independently)
- Corrected 5 factual errors in the original draft (negative correlation claim, latency ratio, rating distribution, scoring artefact, price-performance direction)
- Issued a `major_revisions` decision

The deconfounding experiment (`DECONFOUNDING_REPORT.md`) added the verdict gate to LangGraph. It did not recover plain_python's score, ruling out the gate as the sole driver. The leading alternative explanation is the Blackboard pattern's input-digest reactivity, though this cannot be distinguished from run-to-run variance at n=1 per cell.

---

## Setup

Requires Python 3.13 with `uv`. Uses Ollama Cloud's OpenAI-compatible endpoint (`https://ollama.com/v1`).

```powershell
# Create venv and install deps
uv venv .venv
uv pip install openai fpdf2 crewai langgraph langchain-openai openai-swarm

# Activate
.\.venv\Scripts\Activate.ps1

# Run the full benchmark (4 fw × 4 cases × 1 model, ~64 min)
python audit_bench/run_benchmark.py --frameworks all --cases all --models glm-5.2:cloud

# Generate the rating report
python audit_bench/rate_frameworks.py audit_bench/runs/bench_<ts>/all_scores.json

# Run the peer review on the discussion paper
python audit_bench/peer_review.py
```

Output lands in `audit_bench/runs/bench_<ts>/` (benchmark) and `audit_bench/runs/peer_review_<ts>/` (peer review).

---

## Key findings (summary)

1. **plain_python won; the verdict gate hypothesis was not confirmed.** Adding the gate to LangGraph did not recover plain_python's score.
2. **Evidence-surfacing and opinion-formation are decoupled.** Swarm had the highest recall and the lowest accuracy.
3. **Reasoning quality is not the bottleneck; commitment is.** The model writes auditor-grade prose and then declines to opine.
4. **Agents are over-cautious relative to real auditors — and mostly correctly so.** 0 of 16 issued Clean.
5. **CrewAI's failure was ergonomic, not judgemental.** Its output contract is fragile for structured-output tasks.
6. **Latency varies ~5.5× and is uncorrelated with quality.**
7. **The framework's control flow should match the task's dominant failure mode.** Scripted control flow for judgement tasks; agentic autonomy for exploration tasks.

See `audit_bench/DISCUSSION_PAPER.md` §5 for the full findings with implications.

---

## Limitations

- n=4 cases, n=1 per cell. Discussion paper, not confirmatory test.
- Single LLM (glm-5.2:cloud). Framework effects may interact with model effects.
- Same model as judge. Known self-preference risk.
- No human baseline.
- All four cases are famous scandals. Training-data contamination is a confound.

---

## Author

**Majid Mumtaz** (ACCA, CIA, ACA) — Director of Internal Audit & Risk Advisory

Research conducted using Ollama Cloud's OpenAI-compatible endpoint with the glm-5.2:cloud reasoning model.

---

## License

This research and code are provided for academic and professional reference. The discussion paper may be posted to arXiv/SSRN. If you use the benchmark or findings, cite the repository and the discussion paper.