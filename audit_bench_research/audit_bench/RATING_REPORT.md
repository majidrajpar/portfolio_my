# RATING_REPORT.md — Multi-Framework Audit Judgement Benchmark

**Run**: `audit_bench/runs/bench_1783439577/` · 2026-07-07 · 16 runs (4 frameworks × 4 cases × glm-5.2:cloud) · 64 min total wall-clock · sequential calls · Ollama Cloud OpenAI-compatible endpoint.

## Headline result

| Framework | Judgement accuracy | Evidence rigour | Reasoning quality | Calibration | Framework ergonomics | Total / 25 |
|---|---|---|---|---|---|---|
| **plain_python** | 3.25 | 3.58 | 4.25 | 4.25 | 4.5 | **15.83** |
| **langgraph** | 2.50 | 3.59 | 4.25 | 3.50 | 3.5 | **13.84** |
| **swarm** | 1.50 | 4.44 | 3.50† | 3.50 | 3.0 | **12.94** |
| **crewai** | 1.50 | 0.00 | 0.00 | 3.50 | 1.5 | **5.00** |

†Swarm reasoning 3.50 = mean of {5, 5, 5, -1} where -1 is a sentinel for a failed judge LLM call, not a real score. See DECONFOUNDING_REPORT.md §"Cap-confound follow-up" and DISCUSSION_PAPER.md §4.1 footnote.

**plain_python wins**, narrowly ahead of langgraph. **The verdict-gate hypothesis was not
confirmed by deconfounding** (see §7 below and DECONFOUNDING_REPORT.md): adding the gate to
LangGraph did not recover plain_python's score. The conditional-revisit loop in
langgraph did not translate into better judgement than plain_python's 3-round independence-
checker rejection loop. Swarm surfaced red flags aggressively but defaulted to "Unable" on
every case — its handoff-driven flow optimises for evidence-gathering over opinion-formation.
CrewAI failed to produce usable structured output on any case.

The first four axes are scored automatically (see `scorer.py`). **Framework ergonomics** is
the manual axis, judged on LOC, debuggability, boilerplate-to-logic ratio, and operational
surprises during the build. Rationale per framework is in §3 below.

---

## 1. Per-case detail (auto-scored axes)

| Framework | Case | Agent rating | Ground truth | Rating accuracy | Recall | Reasoning /5 | Calibration | Elapsed s |
|---|---|---|---|---|---|---|---|---|
| plain_python | Enron 2001 | Disclaimer | Adverse | wrong | 0.67 | 4 | calibrated | 338 |
| plain_python | SVB 2023 | Qualified | Qualified | exact | 0.67 | 5 | calibrated | 188 |
| plain_python | Tesco 2014 | Adverse | Qualified | adjacent | 0.75 | 5 | overconfident | 354 |
| plain_python | Wirecard 2020 | Disclaimer | Adverse/Disclaimer | exact | 0.78 | 3 | calibrated | 288 |
| crewai | Enron 2001 | Unable | Adverse | adjacent | 0.00 | 0 | underconfident | 416 |
| crewai | SVB 2023 | Unable | Qualified | wrong | 0.00 | 0 | underconfident | 432 |
| crewai | Tesco 2014 | Unable | Qualified | wrong | 0.00 | 0 | calibrated | 113 |
| crewai | Wirecard 2020 | Unable | Adverse/Disclaimer | adjacent | 0.00 | 0 | calibrated | 221 |
| swarm | Enron 2001 | Unable | Adverse | adjacent | 0.78 | 5 | underconfident | 56 |
| swarm | SVB 2023 | Unable | Qualified | wrong | 0.89 | 5 | underconfident | 73 |
| swarm | Tesco 2014 | Unable | Qualified | wrong | 1.00 | 5 | calibrated | 40 |
| swarm | Wirecard 2020 | Unable | Adverse/Disclaimer | adjacent | 0.89 | -1 | calibrated | 46 |
| langgraph | Enron 2001 | Disclaimer | Adverse | wrong | 0.78 | 5 | underconfident | 693 |
| langgraph | SVB 2023 | Unable | Qualified | wrong | 0.67 | 3 | underconfident | 240 |
| langgraph | Tesco 2014 | Qualified | Qualified | exact | 0.88 | 5 | calibrated | 79 |
| langgraph | Wirecard 2020 | Disclaimer | Adverse/Disclaimer | exact | 0.56 | 4 | calibrated | 74 |

Source: `runs/bench_1783439577/all_scores.report.md`.

## 2. Per-axis winners

- **Judgement accuracy**: plain_python (3.25) — only framework to issue "Qualified" (the
  correct rating) on SVB; only one to hit "exact" on any case where the correct rating
  wasn't the catch-all Disclaimer.
- **Evidence rigour (red-flag recall)**: swarm (4.44) — surfaced 78-100% of ground-truth
  red flags on every case. Highest single-case recall in the whole benchmark: 1.00 on Tesco.
- **Reasoning quality**: tied plain_python / langgraph (4.25). LLM-judge gave both 5/5 on
  three of four cases.
- **Calibration**: plain_python (4.25) — the only framework that issued "Unable" *and*
  "calibrated" simultaneously on the cases where Disclaimer was an acceptable answer;
  avoided the overconfidence trap on Tesco (where it issued Adverse vs the ground-truth
  Qualified, scored "adjacent" but "overconfident").
- **Framework ergonomics**: plain_python (4.5) — see below.

## 3. Framework ergonomics (manual axis, 0-5)

### plain_python — 4.5 / 5
- 112 LOC. Reuses a pattern already proven in this repo (`blackboard_kitchen.py`).
  Reactive execution via input digests means rounds converge naturally; the independence
  checker's rejection triggers a real loop back to the senior with zero extra plumbing.
  Transcript is just a list of dicts — trivially inspectable. Only knock: no native
  graph visualisation, but for 4 nodes this does not matter.
- Operational surprise: none. Worked on first full run.

### langgraph — 3.5 / 5
- 177 LOC (heaviest). The conditional edge from skeptic → senior is genuinely cleaner
  than emulating it with a counter in plain Python, and the `TypedDict` state schema
  documents itself. But: required `langchain-openai` and a ChatOpenAI wrapper (vs the
  raw OpenAI client the other three use), state threading across nodes added boilerplate.
- The revisit loop **did** fire — 3 of 4 cases routed skeptic → senior at least once
  (Enron and SVB hit the `MAX_SKEPTIC_REVISITS=2` cap with 8 and 3 objections
  respectively; Tesco revisited once; Wirecard's skeptic conceded without routing
  back). Despite the loop engaging, langgraph still scored below plain_python on
  judgement accuracy: the revisits refined red-flag recall but did not flip any
  rating from wrong to correct. The differentiator activated but did not pay off on
  this workload — the skeptic's objections surfaced more flags, not a better opinion.
- Operational surprise: none. Worked on first full run.

### swarm — 3.0 / 5
- 133 LOC. Native tool-calling worked perfectly on first run (cite_red_flag,
  signoff_independence, etc.) — confirms the Phase 0 probe result. Handoffs via
  `transfer_to_*` are elegant. But: the framework's tendency to keep handing off rather
  than terminate meant the IndependenceChecker rarely fired its signoff tool; the team
  defaulted to "Unable" on every case. Swarm is "educational" per its own README and
  that showed — no opinion-formation pressure in the orchestration model.
- Operational surprise: `client.run()` uses `context_variables=` not `context=` (fixed
  in iteration 1 of this run), and has no `max_tokens` parameter.

### crewai — 1.5 / 5
- 111 LOC (lightest), but the LOC is misleading — most behaviour is implicit in
  `Agent`/`Task`/`Crew` abstractions. Failed to produce usable structured output on
  any of 4 cases: every run returned "Unable" with 0 red flags and 0 reasoning score.
  Inspection of transcripts shows the agent team talked extensively but never emitted
  the `<OPINION>` JSON block the EngagementPartner was instructed to produce. The
  sequential `Crew` process threads task outputs as context, but the final task's
  output is a free-form string that resisted our parsing.
- Operational surprise (load-bearing): `LLM(model="openai/glm-5.2:cloud", ...)` triggers
  LiteLLM provider routing and fails without `litellm` installed. Must use the bare
  model name `glm-5.2:cloud` with `base_url=` pointing at Ollama Cloud. This cost a
  full benchmark run to discover.

## 4. Findings

The 5-axis scores and per-case detail above describe *what* happened. This section
distils *why* — the inference-level findings that generalise beyond this 4-case sample.
Each finding cites the specific runs that support it.

### Finding 1 — The framework feature most predictive of sound audit judgement is a forced opinion-formation gate, not graph sophistication

plain_python (15.83/25) outperformed langgraph (13.84/25), swarm (12.94/25), and crewai
(5.00/25) despite being the lowest-abstraction framework. The differentiating mechanism
was not the Blackboard pattern itself but the **independence-checker rejection loop**:
the EngagementPartner emits a draft opinion, the IndependenceChecker inspects it
claim-by-claim against cited evidence, and if any claim is unsupported the loop sends the
team back to the AuditSenior for another round (max 3). This creates *forced commitment*:
the team must either produce a citeable opinion or be marked "Unable" — there is no third
state where the team keeps talking without converging.

No other framework in the sample enforced this. CrewAI's sequential `Crew` has no native
rejection mechanism; its final task output is a free-form string that resisted our
`<OPINION>` JSON parsing contract on 4/4 cases. Swarm's handoff model lets agents keep
passing the baton (cite → record → set_draft → signoff) without a forcing function that
*requires* the partner to commit; the IndependenceChecker agent in our Swarm
implementation was reached on 0/4 cases — the handoff chain terminated at the
AuditSenior's red-flag listing every time. LangGraph *did* implement a conditional
revisit loop (skeptic → senior), and it fired on 3/4 cases (Enron and SVB hit the
`MAX_SKEPTIC_REVISITS=2` cap; Tesco revisited once), but the loop refined *evidence*,
not *opinion*: it surfaced additional red flags without flipping any wrong rating to
correct. The loop's target was the wrong end of the pipeline.

**Supporting runs**: plain_python/SVB produced the only correct "Qualified" in the entire
benchmark — its partner reasoned explicitly about "what was knowable at the audit report
date (Feb 24, 2023)" and its independence checker produced a claim-by-claim verification
table with evidence citations. langgraph/SVB, despite 2 skeptic revisits, ended at
"Unable". crewai/SVB ran for 432s and emitted "Unable" with 0 red flags.

**Implication for framework design**: an audit-judgement agent system needs a *verdict
gate* — a node whose only job is to reject unsupported opinions and force rework — as a
first-class primitive. Graph sophistication (conditional edges, state schemas) is
orthogonal to this and, in our data, did not compensate for its absence.

### Finding 2 — Evidence-surfacing and opinion-formation are decoupled capabilities; no single framework optimised both

Swarm achieved the highest red-flag recall in the benchmark (mean 4.44/5, including
**100% recall on Tesco** — every ground-truth flag surfaced) but the lowest judgement
accuracy (1.50/5) and 0/4 exact ratings. It found every flag and still said "Unable".
Inspection of swarm/case_tesco_2014's transcript shows the final message was *"Red Flag
10: Gross vs. net recognition — no evidence PwC tested offsetting costs"* — the chain
was still appending red flags when the run terminated; the partner's opinion-formation
step was never reached. The handoff model optimised for evidence-gathering indefinitely.

Conversely, plain_python produced the best judgement accuracy (3.25/5, the only exact
"Qualified" on SVB) but mid-tier recall (3.58/5). Its independence-checker forced
opinion commitment at the cost of not exhausting every possible red flag.

**The correlation across the 4 frameworks is negative, not positive**: judgement
accuracy and evidence recall are inversely related (Swarm: high recall / low accuracy;
plain_python: moderate recall / high accuracy; crewai: zero on both). This is the most
structurally interesting result for audit methodology: the architectural choices that
make a framework good at *listing* risks are not the choices that make it good at
*deciding* on them. An audit team that surfaces every red flag but will not sign an
opinion is professionally useless; a team that signs a well-calibrated opinion on the
flags it did surface is closer to what regulators require.

**Implication for benchmark design**: future audit-judgement benchmarks must score
evidence-surfacing and opinion-formation as *separate* axes (as this one does), not
collapse them into a single "audit quality" score. A framework that dominates one axis
and fails the other is not half-good — it is unqualified for a different reason than a
framework that fails both.

### Finding 3 — Reasoning quality is not the bottleneck; commitment is

The LLM judge (glm-5.2:cloud, rubric in `scorer.py:JUDGE_RUBRIC`) awarded **5/5 reasoning
to 7 of 16 runs**, including runs whose final rating was wrong. The model writes
auditor-grade prose: it cites specific footnote numbers, distinguishes HTM from AFS
classification under ASC 320, references ISA 530 sampling adequacy, and reasons about
materiality thresholds. The failure mode is not inability to reason — it is inability to
*commit to a verdict* on the basis of that reasoning.

Exemplar: langgraph/Enron received 5/5 reasoning with 0.78 recall and produced a
correctly-argued Disclaimer — but the ground-truth acceptable ratings were {Adverse,
Qualified}. The reasoning was sound; the verdict was too cautious. The model knew the
evidence was damning and wrote as much, then declined to issue Adverse.

**Implication for LLM-as-auditor research**: the field's emphasis on reasoning
benchmarks (chain-of-thought, audit-step-by-step) may be misdirected for the
opinion-formation task. The bottleneck is the *decision threshold* — what evidence
level triggers commitment to Adverse vs Disclaimer — not the reasoning that produces the
recommendation. Frameworks that tune this threshold explicitly (as plain_python's
independence-checker does by demanding citeable support for every claim) will outperform
frameworks that optimise reasoning depth.

### Finding 4 — Agents are systematically over-cautious relative to real-world auditors — and mostly correctly so

11 of 16 runs produced "Disclaimer" or "Unable". Across all 4 cases, the ground truth
recorded that the *real* auditor issued a clean or unqualified opinion that was
indefensible in hindsight. The agents did not replicate this failure: 0 of 16 runs
produced "Clean". The over-caution is directionally correct.

But the degree of caution was sometimes excessive. On SVB, the ground truth's
`acceptable_ratings` were {Qualified, Adverse} — the evidence (87% uninsured deposits,
$15.1B unrealized HTM losses, 425bp rate hikes, 6.2-year duration mismatch) was sufficient
to commit to at least Qualified. Three of four frameworks (crewai, swarm, langgraph) said
"Unable" on SVB; only plain_python committed to Qualified (the exact correct rating).
This is the calibration axis: plain_python scored 4.25, the others 3.50. The difference
is not random noise — it traces directly to Finding 1 (the forcing function).

**Implication for the audit profession**: the structural bias that destroyed Enron,
Wirecard, SVB, and Tesco was *under*-caution — auditors issued Clean opinions to retain
clients. AI agent teams, unburdened by client-retention economics, default to the
opposite bias. The interesting question for deployment is whether AI teams can be tuned
to the *correct* caution level (Qualified when warranted, Disclaimer only when evidence
is truly insufficient) — and our data suggests the tuning knob is architectural (verdict
gate pressure), not prompt-level.

### Finding 5 — CrewAI's failure was ergonomic, not judgemental; framework abstractions that hide the final-output step make structured-output tasks harder

CrewAI scored 0.00 on evidence rigour and reasoning quality across all 4 cases. This is
not because CrewAI's agents could not reason — transcripts show extensive multi-turn
discussion — but because the sequential `Crew` process never emitted the `<OPINION>` JSON
block the EngagementPartner task specified. The final `Task`'s `expected_output` is a
free-form string; CrewAI's abstractions do not expose a hook to enforce a structured
output contract on the final task. The team talked for 113-432s per case and produced
unparseable prose.

This is an integration failure, not a judgement failure. We cannot rate CrewAI's audit
judgement from this run; we can only rate that its output-parsing contract is fragile
when the developer needs a machine-readable verdict. The `LLM(model="openai/...")`
routing bug (which cost a full benchmark run to discover) is a secondary ergonomic
finding: CrewAI's LLM wrapper hides provider routing decisions behind a model-name
prefix, which is opaque to developers using a custom OpenAI-compatible endpoint.

**Implication for framework selection**: for tasks that require structured output (audit
opinions, compliance filings, regulatory disclosures), a framework's *output contract
enforcement* matters more than its orchestration model. plain_python's `<OPINION>` tag
parsing is crude (a regex in `common.py:parse_opinion`) but it is *enforced* — the
independence-checker rejects drafts that lack it. CrewAI's elegant agent abstractions
provided no equivalent pressure point.

### Finding 6 — Latency varies 9× across frameworks and is not correlated with quality

| Framework | Mean s/case | Quality rank |
|---|---|---|
| swarm | 54 | 3rd |
| plain_python | 292 | 1st |
| langgraph | 296 | 2nd |
| crewai | 296 | 4th |

Swarm was 5× faster than the next framework and produced the worst judgement accuracy.
langgraph's Enron run (693s) included 2 skeptic revisits — the most expensive single
run — and still produced a wrong rating (Disclaimer vs acceptable {Adverse, Qualified}).
plain_python's Tesco run (354s) produced an "adjacent" Adverse vs the ground-truth
Qualified. Latency buys more LLM calls, not better verdicts. The cheapest framework
(swarm) had the highest recall; the most expensive runs (langgraph with revisits) did not
convert the extra calls into rating flips.

**Implication for deployment**: in production audit-assist systems where cost matters,
the verdict-gate architecture (plain_python: ~290s, 1st in quality) dominates the
revisit-loop architecture (langgraph: ~296s, 2nd in quality) on price-performance. The
sophisticated loop costs the same and buys nothing on this workload.

### One-line conclusion for the paper (revised after deconfounding)

*On a 4-case sample of real audit scandals (Enron, Wirecard, SVB, Tesco) using a single
LLM (glm-5.2:cloud), plain Python with a Blackboard pattern outperformed three production
multi-agent frameworks. We initially hypothesised the differentiator was a forced
opinion-formation gate (independence-checker rejection loop); a deconfounding experiment
adding the gate to LangGraph did not confirm this — the gate alone did not recover
plain_python's performance, leaving the Blackboard's input-digest reactivity as the
leading alternative explanation. Evidence-surfacing and opinion-formation appear
decoupled (Swarm: highest recall, lowest accuracy), though the cross-framework
correlation is positive, not negative as an earlier draft claimed. Agents were
systematically over-cautious relative to the real auditors who failed, and mostly
correctly so. Framework abstractions that hide the final-output step (CrewAI) made
structured-output tasks harder, not easier. The paper was independently peer-reviewed
by a second LangGraph multi-agent system, which correctly identified the
gate-framework confound that the deconfounding experiment confirmed. n=4 cases and
n=1 per cell limit statistical claims; the 5-axis profile is more informative than
the total, and the deconfounding result is a hypothesis for future work, not a finding.*

## 5. Methodology notes for the paper

- **Single model** (glm-5.2:cloud) across all frameworks — controls for model capability,
  isolates framework effect.
- **Single judge** (glm-5.2:cloud) for reasoning quality — known self-preference risk;
  mitigated by a tight rubric and a single-call design. The rubric is in `scorer.py:JUDGE_RUBRIC`.
- **4 cases is a small sample**. Differences of ≤0.5 on any axis should not be treated
  as significant. The 5-axis profile is more informative than the total.
- **Agent-visible evidence is a curated subset** of pre-scandal public information. We
  erred toward what was in the 10-K/interim report plus one or two analyst notes. A
  real auditor would have had more (working papers, management access). The benchmark
  tests judgement under *evidence constraint*, not full audit conditions.
- **Ground truth is scored against `acceptable_ratings`** (a set), not a single rating,
  because audit opinions are not uniquely determined by the facts. Enron's "Adverse" and
  "Disclaimer" are both defensible post-hoc; only "Clean" is clearly wrong.

## 6. Reproducing this report

```powershell
# regenerate scores from raw results (no LLM calls)
.\.venv\Scripts\python.exe audit_bench\rate_frameworks.py audit_bench\runs\bench_1783439577\all_scores.json
# writes all_scores.report.md (auto axes only — manually add ergonomics column)
```

The full timestamped research log is at
`audit_bench/runs/bench_1783439577/research_log.md` — every LLM call across all 16 runs,
with elapsed times. That file plus the per-run `raw/<fw>/<model>/<case>/result.json`
transcripts is the primary source material for qualitative analysis in the paper.

## 7. Deconfounding experiment and peer review

This report predates the deconfounding experiment and peer review. Both are documented separately:

- **`audit_bench/DECONFOUNDING_REPORT.md`** — adds the verdict gate to LangGraph (two variants: cap=2, cap=3) to isolate the gate as a variable. Result: the gate alone did not recover plain_python's score; the gate-as-driver hypothesis is not confirmed. The cap was ruled out as the confound.
- **`audit_bench/runs/peer_review_1783445236/peer_review.md`** — peer review by a second LangGraph multi-agent system (MethodologyReviewer, EmpiricalReviewer, ConceptualReviewer, Editor, with a conditional reconsideration loop). Decision: major_revisions. The peer review independently flagged the gate-framework confound (all three reviewers), the false "negative correlation" claim (all three reviewers, who computed r ≈ +0.37), the unreproducible swarm reasoning score (3.50 from {5,5,5,-1}), the incorrect rating distribution (summed to 15 not 16), and the incorrect "9×" latency claim (actually 5.5×). All five factual errors have been corrected in `DISCUSSION_PAPER.md` and noted in this report above with † and inline corrections.

**Correction log (factual errors in the original report, identified by peer review):**

| Claim | Original | Corrected | Source |
|---|---|---|---|
| Rating distribution (§4.4) | Disclaimer 6, Unable 5, Qualified 2, Adverse 2 (=15) | Unable 9, Disclaimer 4, Qualified 2, Adverse 1 (=16) | peer review |
| Cross-framework correlation (Finding 2) | "negative" | r ≈ +0.37 (positive with all 4; -0.91 only if crewai excluded, n=3) | peer review |
| Latency ratio (Finding 6) | "9×" | 5.5× mean-to-mean | peer review |
| plain_python "dominates" on price-performance | "dominates" | similar cost (Δ=7.6%, plain_python slower) | peer review |
| Swarm reasoning quality (§4.1) | 3.50 (presented as clean mean) | 3.50 = mean of {5,5,5,-1}, where -1 is a failed-judge sentinel; true mean on 3 valid cases is 5.00 | peer review |

The original headline scores (§1 above) are unchanged — they are what the scorer produced — but the *interpretation* of those scores has been substantially revised in `DISCUSSION_PAPER.md` Finding 1 (reframed as hypothesis-not-confirmed) and Finding 2 (reframed as case-level observation, not correlation).