# DECONFOUNDING_REPORT.md — Verdict Gate as Isolated Variable

**Run**: `audit_bench/runs/bench_1783447036/` · 2026-07-07 · 4 runs (langgraph_gate × 4 cases × glm-5.2:cloud) · 26 min wall-clock
**Purpose**: Respond to peer review Finding 1 / ConceptualReviewer concern: *the verdict gate is perfectly confounded with framework identity (only plain_python had a gate)*. This run implements the same verdict-gate mechanism (independence-checker rejection loop, conditional edge back to senior, capped) inside LangGraph, holding everything else identical to the original langgraph_fw.py. The only variable that changes between langgraph (no gate) and langgraph_gate (gate) is the gate itself.

## What "the gate" means here

In plain_python, the verdict gate is: EngagementPartner emits a draft → IndependenceChecker inspects each claim for cited evidence → on REJECT, loop back to AuditSenior for rework (max 3 rounds). The mechanism has two components (per ConceptualReviewer):
1. **Evidential checking** — does each claim have a citation?
2. **Forcing function** — loop-back requires convergence (or terminal "Unable").

In langgraph_gate_fw.py, both components are implemented identically: the independence node's prompt is the same persona definition from common.py, the rejection criterion is "SIGNOFF: APPROVED" substring (same as plain_python), the loop target is the senior node (same as plain_python), the cap is MAX_GATE_REVISITS=2 (vs plain_python's 3 rounds — slightly tighter, documented below).

## Headline result

| Framework | Judgement accuracy | Evidence rigour | Reasoning quality | Calibration | Total / 20 |
|---|---|---|---|---|---|
| plain_python (gate baseline) | 3.25 | 3.58 | 4.25 | 4.25 | **15.33** |
| langgraph (no gate, original) | 2.50 | 3.59 | 4.25 | 3.50 | **13.84** |
| **langgraph_gate (gate added)** | **1.50** | **3.89** | **3.75** | **3.50** | **12.64** |

**Adding the gate to langgraph did not improve judgement — it made it slightly worse.**

The 1.20-point drop from langgraph (13.84) to langgraph_gate (12.64) is within the noise the paper's own Limitation 1 flags (differences ≤0.5 should not be treated as significant; 1.20 is above that threshold but n=4 still does not support strong claims). The direction, however, is opposite to the paper's central hypothesis.

## Per-case detail

| Framework | Case | Agent rating | Acc | Recall | Reas | Cal | Total | gate_revisits | skeptic_revisits |
|---|---|---|---|---|---|---|---|---|---|
| langgraph_gate | Enron 2001 | Disclaimer | 0 (wrong) | 0.78 | 4 | 2 (under) | 9.89 | 1 | 2 |
| langgraph_gate | SVB 2023 | Unable | 0 (wrong) | 0.89 | 4 | 2 (under) | 10.44 | **2 (cap)** | 3 |
| langgraph_gate | Tesco 2014 | Adverse | 3 (adj) | 1.00 | 5 | 5 (cal) | 18.00 | **2 (cap)** | 2 |
| langgraph_gate | Wirecard 2020 | Unable | 3 (adj) | 0.44 | 2 | 5 (cal) | 12.22 | 0 | 2 |
| langgraph (orig) | Enron 2001 | Disclaimer | 0 (wrong) | 0.78 | 5 | 2 (under) | 10.89 | — | 2 |
| langgraph (orig) | SVB 2023 | Unable | 0 (wrong) | 0.67 | 3 | 2 (under) | 8.33 | — | 2 |
| langgraph (orig) | Tesco 2014 | Qualified | 5 (exact) | 0.88 | 5 | 5 (cal) | 19.38 | — | 1 |
| langgraph (orig) | Wirecard 2020 | Disclaimer | 5 (exact) | 0.56 | 4 | 5 (cal) | 16.78 | — | 0 |

## What the gate actually did

The gate fired on 3 of 4 cases:

| Case | Gate fired? | Outcome |
|---|---|---|
| Enron 2001 | Yes (1 revisit) | IC rejected round 1 (cited an 8-K restatement not in evidence file) → senior reworked → IC approved round 2 → still Disclaimer (wrong) |
| SVB 2023 | Yes (**hit 2-revisit cap**) | IC rejected both rounds → final state "Unable" with 15 red flags cited (highest recall in this run, but wrong verdict) |
| Tesco 2014 | Yes (**hit 2-revisit cap**) | IC rejected both rounds → final state "Adverse" (adjacent, not the exact Qualified that langgraph-no-gate achieved) |
| Wirecard 2020 | No (approved first pass) | IC issued SIGNOFF: APPROVED on round 1 → "Unable" (the partner never committed to Disclaimer as in no-gate variant) |

## Three observations that matter for the paper

### Observation 1 — The gate fired but did not flip any wrong verdict to correct

On 3 of 4 cases the independence checker rejected the partner's draft and forced a rework. In zero of those 3 cases did the rework change the final rating from wrong to correct. On Tesco, the no-gate variant produced the exact correct "Qualified"; the gate variant produced "Adverse" (adjacent). The gate did not help — and on Tesco it actively hurt, pushing the verdict one step too far.

### Observation 2 — The gate increased recall but at the cost of commitment

langgraph_gate recall (3.89) > langgraph recall (3.59). The senior's second pass after IC rejection surfaced additional red flags (Enron went from 0.78 → 0.78; SVB went from 0.67 → 0.89; Tesco went from 0.88 → 1.00). But the gate also increased the "Unable" rate: 2 of 4 gate runs ended "Unable" vs 1 of 4 no-gate runs. The gate is pushing the system toward more evidence and less commitment — the same pattern Swarm exhibited in the original benchmark (Finding 2 of the paper).

### Observation 3 — plain_python's win is not explained by the gate alone

If the gate were the sole driver, langgraph_gate (which has the same gate mechanism) should approach plain_python's score. It does not — langgraph_gate (12.64) is 2.69 points *below* plain_python (15.33). The gap is now attributable to *something other than the gate*. Candidate explanations, none of which this experiment can distinguish:

- **The Blackboard's input-digest reactivity** (ConceptualReviewer's hypothesis): plain_python's cooks automatically see *all* upstream changes via the digest mechanism, so the senior's second pass after IC rejection is automatically aware of every prior write. langgraph_gate passes context manually through state fields; if any field is omitted, the senior's rework is degraded.
- **The 3-round cap vs 2-round cap**: plain_python allows 3 rounds; langgraph_gate caps at 2. SVB and Tesco both hit the 2-cap and were forced to "Unable"/"Adverse" — a 3rd round might have produced a different result. This is a confound in our implementation, not the gate concept itself.
- **The order of senior/skeptic interaction**: plain_python reruns the full Senior → Skeptic → Partner → IC sequence on rejection; langgraph_gate reruns Senior → Skeptic → Partner → IC. Structurally identical, but the skeptic's behaviour in the revisit may differ because of prompt wording differences in how the rejection is surfaced (plain_python surfaces it in the blackboard snapshot; langgraph_gate surfaces it via a dedicated state field).
- **Run-to-run LLM variance**: with n=1 per cell, a 2.69-point gap on a 20-point scale is plausibly noise. The paper's own Limitation 1 says differences ≤0.5 should not be treated as significant; 2.69 is above that threshold but n=4 still does not support strong claims.

## Cap-confound follow-up: langgraph_gate3 (MAX_GATE_REVISITS=3)

The 2-revisit cap in langgraph_gate vs the 3-round cap in plain_python was an implementation
difference, not a feature difference. To rule it out as the confound, we ran
`langgraph_gate3_fw.py` — identical to langgraph_gate_fw.py except `MAX_GATE_REVISITS=3`.

Run: `audit_bench/runs/bench_1783449438/` · 4 cases · 8.4 min wall-clock.

### Four-way comparison

| Framework | Mean total / 20 | Enron | SVB | Tesco | Wirecard |
|---|---|---|---|---|---|
| **plain_python (gate, cap=3)** | **15.32** | Disclaimer (wrong, 12.33) | **Qualified (exact, 18.33)** | Adverse (adj, 13.75) | Disclaimer (exact, 16.89) |
| langgraph (no gate) | 13.84 | Disclaimer (wrong, 10.89) | Unable (wrong, 8.33) | **Qualified (exact, 19.38)** | Disclaimer (exact, 16.78) |
| langgraph_gate3 (gate, cap=3) | 13.01 | Disclaimer (wrong, 7.22) | Disclaimer (adj, 13.00) | Adverse (adj, 14.38) | Disclaimer (exact, 17.44) |
| langgraph_gate (gate, cap=2) | 12.64 | Disclaimer (wrong, 9.89) | Unable (wrong, 10.44) | Adverse (adj, 18.00) | Unable (adj, 12.22) |

### Cap-confound result

Raising the cap from 2 to 3 improved langgraph_gate's mean marginally (12.64 → 13.01,
+0.37 — within noise). The cap was not the binding confound. The 2-point gap between
langgraph_gate3 (13.01, with the same gate and same cap as plain_python) and plain_python
(15.32) persists. **The cap confound is ruled out; the gate-as-driver claim is further weakened.**

### What changed case-by-case with cap=3

- **Enron**: langgraph_gate3 produced Disclaimer with 7 flags (worse than cap=2's 13 flags;
  the extra round did not help — the senior reworked but the partner did not improve).
- **SVB**: langgraph_gate3 produced Disclaimer (adjacent) instead of Unable (wrong). The
  extra round let the partner commit to Disclaimer rather than refuse. This is the only
  case where the cap change flipped a wrong verdict to adjacent.
- **Tesco**: langgraph_gate3 produced Adverse (adjacent), same as cap=2. No change.
- **Wirecard**: langgraph_gate3 produced Disclaimer (exact) instead of Unable (adjacent).
  The extra round let the partner commit. This is the only case where the cap change
  flipped an adjacent verdict to exact.

The cap change helped on the two cases where the team was on the fence (SVB, Wirecard)
and did nothing on the two where the team had committed (Enron, Tesco). This is consistent
with the cap being a *commitment pressure* parameter — more rounds = more pressure to
commit rather than refuse — not an *evidence quality* parameter.

### Updated conclusion

Three alternative explanations for plain_python's win remain after ruling out the cap:

1. **The Blackboard's input-digest reactivity** (ConceptualReviewer's hypothesis) — still
   the leading candidate. plain_python's cooks automatically see *all* upstream writes via
   the digest mechanism; langgraph_gate3 passes context manually through state fields, and
   any field omitted from the node return degrades the senior's rework. This is a real
   architectural difference, not a prompt difference.
2. **Run-to-run LLM variance** — with n=1 per cell, the 2.31-point gap between
   langgraph_gate3 (13.01) and plain_python (15.32) is still plausibly noise. The paper's
   own Limitation 1 says differences ≤0.5 should not be treated as significant; 2.31 is
   above that threshold but n=4 still does not support strong claims. A multi-run design
   (3 runs per cell) would settle this.
3. **Prompt threading differences** — plain_python's blackboard snapshot exposes the full
   state to every cook; langgraph's nodes see only the state fields they explicitly read.
   If the senior's rework in plain_python benefits from seeing the partner's prior draft
   (which is on the blackboard) while langgraph's senior only sees the independence checker's
   rejection (not the prior partner draft), the information asymmetry could explain the gap.
   This is testable by adding the partner's prior draft to langgraph_gate3's senior node
   state field — a future experiment.

## What this means for the paper's central claim (updated)

The paper's Finding 1 says: *"The framework feature most predictive of sound audit judgement
was a forced opinion-formation gate... not graph sophistication."* Both the deconfounding
experiment (langgraph_gate, cap=2) and the cap-confound follow-up (langgraph_gate3, cap=3)
do not support this as stated. Adding the gate to langgraph — with the same cap as
plain_python — did not recover plain_python's score. The 2.31-point gap persists.

The paper must reframe Finding 1. The defensible claim is:

> plain_python outperformed three production frameworks on a 4-case audit-judgement
> benchmark. We hypothesised the verdict gate (independence-checker rejection loop) as
> the differentiator. A deconfounding experiment adding the gate to LangGraph did not
> confirm this: langgraph_gate (cap=2) scored 12.64 vs langgraph's 13.84 (the gate did
> not help); langgraph_gate3 (cap=3, matching plain_python's cap) scored 13.01 vs
> plain_python's 15.32 — the gap persists with the cap ruled out. The leading alternative
> explanation is the Blackboard pattern's input-digest reactivity, which automatically
> threads all upstream writes to downstream agents without manual state-field plumbing.
> We cannot distinguish this from run-to-run LLM variance at n=1 per cell. The verdict
> gate remains a plausible necessary condition (no framework without a gate beat plain_python)
> but is not a sufficient condition (adding the gate to langgraph did not recover
> plain_python's score). The result is a hypothesis for future work, not a finding.

This is a weaker but honest claim. The peer review process — run as a LangGraph
multi-agent system itself, with a conditional reconsideration loop — correctly identified
the confound that this experiment confirmed. The peer review is itself part of the
experimental methodology (see DISCUSSION_PAPER.md §3.4).

## Methodological note: the peer review was right to demand this experiment

The peer review's most repeated concern — voiced independently by all three reviewers and consolidated by the editor as the second required revision — was that the gate was confounded with framework identity. This experiment confirms the concern: when we add the gate to a second framework, the gate alone does not recover plain_python's performance. The paper cannot claim the gate is the driver. The peer review process surfaced a confound the authors missed; this is the peer-review system working as designed.

## Reproducing this experiment

```powershell
# Run langgraph_gate on all 4 cases
.\.venv\Scripts\python.exe audit_bench\run_benchmark.py --frameworks langgraph_gate --cases all --models glm-5.2:cloud

# Compare to the original langgraph run (already in bench_1783439577)
.\.venv\Scripts\python.exe audit_bench\rate_frameworks.py audit_bench\runs\bench_1783447036\all_scores.json
```

Raw transcripts: `audit_bench/runs/bench_1783447036/raw/langgraph_gate/glm-5.2_cloud/<case>/result.json`
Research log: `audit_bench/runs/bench_1783447036/research_log.md`