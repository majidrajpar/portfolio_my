# AI Audit Judgement: A Multi-Framework Benchmark on Real Scandal Cases

I benchmarked four multi-agent frameworks on a shared audit-judgement task to test whether AI agent teams can form audit opinions on evidence from real corporate scandals. The result was not what I expected.

---

## The setup

Four frameworks — plain Python (Blackboard pattern), CrewAI, OpenAI Swarm, LangGraph — each running four audit personas (Engagement Partner, Audit Senior, Skeptic Reviewer, Independence Checker). Same personas, same prompts, same model (glm-5.2:cloud). The only variable was the orchestration architecture.

Each team received pre-scandal public evidence from four cases: Enron (2001), Wirecard (2020), SVB (2023), Tesco (2014). They had to commit to one of five ratings: Clean, Qualified, Adverse, Disclaimer, or Unable. The ground truth was hidden from the agents and used only for scoring.

---

## The result

The real auditors issued Clean on all four cases. All four were wrong.

The AI teams issued Clean on zero of 16 runs. However, 9 of 16 runs returned "Unable" — a refusal to opine. The model produces auditor-grade reasoning (the LLM judge scored 5/5 reasoning on 7 of 16 runs, with citations to ASC 320, ISA 530, and specific footnote numbers) and then declines to commit.

The failure mode is not poor judgement. It is refusal to judge.

---

## Framework comparison

**plain Python** — Judgement accuracy 3.25/5, evidence recall 3.58/5. Committed. Got SVB right (Qualified) — the only framework that did.

**LangGraph** — Judgement accuracy 2.50/5, evidence recall 3.59/5. Conditional revisit loop fired on 3 of 4 cases but refined evidence, not the opinion.

**Swarm** — Judgement accuracy 1.50/5, evidence recall 4.44/5. Surfaced 100% of red flags on Tesco. Still said "Unable." The opinion step was never reached.

**CrewAI** — Judgement accuracy 0.00. Never emitted parseable structured output. Integration failure, not judgement failure.

The more "agentic" the framework (autonomy, handoffs, tool-calling), the worse it performed on judgement. The more "scripted" (fixed order, output contract, rejection loop), the better. This is a matching problem, not a ranking one — different task failure modes require different control flows.

---

## The confound

I initially attributed plain Python's win to the verdict gate — an independence-checker that rejects unsupported opinions and forces rework. A second LangGraph multi-agent system (three reviewer personas + editor, with a conditional reconsideration loop) peer-reviewed the paper and flagged the confound: only plain Python had a gate, so the gate was inseparable from the framework.

I ran a deconfounding experiment: added the same gate to LangGraph. It did not recover plain Python's score. The gate alone does not explain the result. The leading alternative explanation is the Blackboard pattern's input-digest reactivity — how upstream writes automatically propagate to downstream agents — but this cannot be distinguished from run-to-run variance at n=1 per cell.

The peer-review process is part of the methodology. A multi-agent graph, run on the same model that wrote the paper, identified a confound the author missed.

---

## What this suggests

1. AI agents can exercise audit judgement. 11 of 16 runs landed at or adjacent to the correct verdict. They did not replicate the human failure mode (issuing Clean on materially misstated accounts).

2. They cannot yet judge reliably. The dominant failure is over-caution — refusal to commit, not poor reasoning. This is the mirror image of the human under-caution problem. Same calibration failure, opposite threshold.

3. The bottleneck is architectural, not capability. The model can reason. What it cannot do without the right framework pressure is decide. The tuning knob is in the control flow, not the prompt.

4. Framework sophistication is not the answer for judgement tasks. The lowest-abstraction framework outperformed three production frameworks. More agentic features gave the agent more ways to avoid the one thing it was already bad at: committing.

---

## Caveats

- n=4 cases, n=1 per cell. This is a discussion paper, not a confirmatory test.
- Single LLM (glm-5.2:cloud). Framework effects may interact with model effects.
- Same model as judge. Known self-preference risk, mitigated by a tight rubric.
- No human baseline. Whether a competent senior auditor would perform better or worse on the same evidence under the same constraint is untested.
- All four cases are famous scandals. Training-data contamination is a real confound.

AI audit judgement is possible. The failure mode is different from the human one. The bottleneck is architectural. "Reliable" is a claim this benchmark cannot yet support.

---

## Full paper and code

Discussion paper (~7,500 words), benchmark code, six framework implementations, scorer, peer-review system, and full research logs from every run:

**Repository**: [github.com/majidrajpar/audit_bench_research](https://github.com/majidrajpar/audit_bench_research)

---

*Majid Mumtaz (ACCA, CIA, ACA) — Director of Internal Audit & Risk Advisory. Research conducted using Ollama Cloud's OpenAI-compatible endpoint with the glm-5.2:cloud reasoning model.*

#AuditJudgement #MultiAgentSystems #LLM #InternalAudit #Audit #FrameworkBenchmark #ProfessionalScepticism #CrewAI #LangGraph #OpenAISwarm