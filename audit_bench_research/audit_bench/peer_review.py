"""
Peer review of DISCUSSION_PAPER.md via a LangGraph multi-agent graph.

Personas (4):
  - MethodologyReviewer: scrutinises case selection, ground-truth construction, scoring validity
  - EmpiricalReviewer:   scrutinises whether the data supports the claims (n=4, "negative correlation", 9x latency)
  - ConceptualReviewer:  scrutinises whether "forced verdict gate" is a coherent construct
  - Editor:              synthesises, detects contradictions, decides

Graph:
  read_paper -> [methodology, empirical, conceptual] -> editor -> (conditional_edge) -> END
                          |                              |
                          |                       contradiction? -- yes --> reconsider_<X> -> editor (cap 1)
                          |                              |
                          +-- self-healing: retry LLM, re-prompt on parse failure, continue on partial state

Output: peer_review.md + peer_review.json + research_log.md in audit_bench/runs/peer_review_<ts>/
"""
import sys
import json
import re
import time
from pathlib import Path
from typing import TypedDict, Optional, List, Annotated, Dict
from operator import add

sys.path.insert(0, str(Path(__file__).parent))
from common import API_KEY, OLLAMA_BASE_URL, ResearchLog

PAPER_PATH = Path(__file__).parent / "DISCUSSION_PAPER.md"
RUNS_DIR = Path(__file__).parent / "runs"

MAX_REVIEWER_REVISITS = 1
MAX_LLM_RETRIES = 2
PARSE_REPROMPT_LIMIT = 1

REVIEWER_PERSONAS = {
    "MethodologyReviewer": {
        "role": "Senior methodologist with expertise in audit-judgement literature and experimental design",
        "goal": (
            "You scrutinise the benchmark's methodology: case selection bias (4 famous scandals), "
            "ground-truth construction (acceptable_ratings as a set of 2 per case), scoring rubric validity, "
            "the single-judge self-preference risk, and evidence curation as a confound. "
            "You are looking for material threats to validity that would undermine the paper's claims."
        ),
        "constraints": "Be specific — cite the section/paragraph you are criticising. Distinguish fatal flaws from minor threats. If the methodology is sound for a discussion paper (not a confirmatory test), say so.",
    },
    "EmpiricalReviewer": {
        "role": "Quantitative peer reviewer with expertise in agent benchmarks and empirical ML",
        "goal": (
            "You scrutinise whether the headline table and per-case data support the claims made. "
            "Specifically: does n=4 permit the implications drawn? Is the 'negative correlation' (Finding 2) "
            "real with 4 data points? Is the 9x latency claim meaningful? Are the 5-axis scores "
            "computed correctly? Are there alternative explanations for plain_python's win that the paper "
            "does not rule out?"
        ),
        "constraints": "Be specific — cite the exact claim (e.g., 'Finding 2, §5.2') and the exact data point that contradicts or supports it. Do not raise generic 'small sample' objections; raise specific 'this claim requires n>X' objections.",
    },
    "ConceptualReviewer": {
        "role": "Theorist in multi-agent systems and professional judgement",
        "goal": (
            "You scrutinise the paper's central construct: 'forced verdict gate'. Is it a coherent, "
            "distinguishable construct, or is it a relabeling of 'output contract enforcement'? "
            "Is the mapping to engagement quality review (PCAOB AS 1210) fair, given that EQR involves "
            "a *human* judgement call while the independence-checker in this paper is a prompt-driven LLM? "
            "Are there alternative explanations for plain_python's win — e.g., that the Blackboard pattern's "
            "input-digest reactivity happens to surface the independence-checker's rejection more forcefully "
            "than the other frameworks' control flow?"
        ),
        "constraints": "Engage with the paper's actual argument, not a strawman. If the construct is sound, say so and explain why. If it is under-specified, name the missing specification.",
    },
    "Editor": {
        "role": "Journal editor who synthesises reviewer reports and decides",
        "goal": (
            "You read the three reviewer reports and look for: (1) contradictions on material points, "
            "(2) convergence on the paper's contribution level, (3) any reviewer overreach or underreach. "
            "You produce an editorial decision: accept, minor revisions, major revisions, or reject — "
            "with consolidated comments and a list of contradictions (if any) that require reconsideration."
        ),
        "constraints": "You are not a fourth reviewer. You do not raise new substantive concerns. You synthesise and decide. If two reviewers contradict on a material point, you must flag the contradiction and name the reviewer whose position you want reconsidered.",
    },
}


OUTPUT_SCHEMA = """You MUST finish your response with a JSON block on its own line, enclosed in <REVIEW></REVIEW> tags:
<REVIEW>
{
  "verdict": "sound|minor_revisions|major_revisions|reject",
  "strengths": ["<strength 1>", "<strength 2>", "..."],
  "material_concerns": [{"claim": "<the paper's claim>", "issue": "<what is wrong>", "severity": "critical|major|minor"}],
  "minor_points": ["<minor point 1>", "..."],
  "questions_for_authors": ["<question 1>", "..."]
}
</REVIEW>
The tags and JSON must appear verbatim. verdict must be one of: sound, minor_revisions, major_revisions, reject."""


EDITOR_SCHEMA = """You MUST finish your response with a JSON block on its own line, enclosed in <EDITOR></EDITOR> tags:
<EDITOR>
{
  "decision": "accept|minor_revisions|major_revisions|reject",
  "contribution_level": "high|moderate|incremental|marginal",
  "consolidated_comments": "<one-paragraph editorial summary>",
  "contradictions": [{"reviewer_a": "<name>", "reviewer_b": "<name>", "point": "<the contradiction>", "reconsider": "<name of reviewer whose position should be reconsidered>"}],
  "required_revisions": ["<revision 1 required for acceptance>", "..."],
  "overall_assessment": "<one paragraph>"
}
</EDITOR>
The tags and JSON must appear verbatim. decision must be one of: accept, minor_revisions, major_revisions, reject."""


class PeerReviewState(TypedDict, total=False):
    paper_text: str
    reviews: Dict[str, dict]
    review_raw: Dict[str, str]
    editor_decisions: List[dict]
    editor_raw: List[str]
    reconsiderations: Dict[str, int]
    contradictions: List[dict]
    final_editor: Optional[dict]
    transcript: Annotated[List[dict], add]


def parse_review(text: str) -> dict:
    m = re.search(r"<REVIEW>\s*(\{.*?\})\s*</REVIEW>", text, re.DOTALL)
    if not m:
        return {"_parse_error": True, "_raw": text[:2000]}
    try:
        obj = json.loads(m.group(1))
        obj.setdefault("verdict", "major_revisions")
        obj.setdefault("strengths", [])
        obj.setdefault("material_concerns", [])
        obj.setdefault("minor_points", [])
        obj.setdefault("questions_for_authors", [])
        return obj
    except Exception as e:
        return {"_parse_error": True, "_raw": text[:2000], "_err": str(e)}


def parse_editor(text: str) -> dict:
    m = re.search(r"<EDITOR>\s*(\{.*?\})\s*</EDITOR>", text, re.DOTALL)
    if not m:
        return {"_parse_error": True, "_raw": text[:3000]}
    try:
        obj = json.loads(m.group(1))
        obj.setdefault("decision", "major_revisions")
        obj.setdefault("contribution_level", "moderate")
        obj.setdefault("consolidated_comments", "")
        obj.setdefault("contradictions", [])
        obj.setdefault("required_revisions", [])
        obj.setdefault("overall_assessment", "")
        return obj
    except Exception as e:
        return {"_parse_error": True, "_raw": text[:3000], "_err": str(e)}


def make_llm():
    from langchain_openai import ChatOpenAI
    return ChatOpenAI(
        model="glm-5.2:cloud",
        api_key=API_KEY,
        base_url=OLLAMA_BASE_URL,
        temperature=0.3,
        max_tokens=8192,
        timeout=180,
    )


def call_llm_healing(llm, system: str, user: str, logger, tag: str,
                     parse_fn, schema: str, persona_name: str) -> tuple:
    """Self-healing LLM call: retries on transient errors, re-prompts on parse failure."""
    for attempt in range(1, MAX_LLM_RETRIES + 2):
        logger.log(f"[{tag}] attempt {attempt} calling glm-5.2:cloud")
        t0 = time.time()
        try:
            out = llm.invoke([
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ])
            dt = time.time() - t0
            content = out.content if hasattr(out, 'content') else str(out)
            logger.log(f"[{tag}] done in {dt:.1f}s, {len(content)} chars")
            parsed = parse_fn(content)
            if not parsed.get("_parse_error"):
                return parsed, content
            logger.log(f"[{tag}] parse failed; raw first 200: {content[:200]}")
            if attempt <= PARSE_REPROMPT_LIMIT:
                user = (
                    f"Your previous response did not contain valid <REVIEW>/<EDITOR> JSON. "
                    f"Please re-issue your full review with the required JSON block.\n\n"
                    f"REQUIRED FORMAT:\n{schema}\n\n"
                    f"YOUR PREVIOUS RAW OUTPUT (for reference, do NOT repeat it — issue a clean version):\n{content[:3000]}\n\n"
                    f"Now issue your review with the JSON block."
                )
                logger.log(f"[{tag}] re-prompting for parse recovery")
                continue
            logger.log(f"[{tag}] parse recovery exhausted; returning default")
            return {
                "verdict": "major_revisions",
                "strengths": [],
                "material_concerns": [{"claim": "reviewer output", "issue": f"failed to emit parseable JSON after {attempt} attempts; raw preserved", "severity": "minor"}],
                "minor_points": [f"raw output: {content[:500]}"],
                "questions_for_authors": [],
                "_degraded": True
            }, content
        except Exception as e:
            dt = time.time() - t0
            logger.log(f"[{tag}] LLM EXCEPTION ({dt:.1f}s) attempt {attempt}: {type(e).__name__}: {e}")
            if attempt > MAX_LLM_RETRIES:
                logger.log(f"[{tag}] retries exhausted; returning degraded review")
                return {
                    "verdict": "major_revisions",
                    "strengths": [],
                    "material_concerns": [{"claim": "reviewer LLM call", "issue": f"failed after {attempt} attempts: {type(e).__name__}: {e}", "severity": "critical"}],
                    "minor_points": [],
                    "questions_for_authors": [],
                    "_degraded": True
                }, f"LLM failed: {e}"
            time.sleep(min(2 ** attempt, 8))
    return {"verdict": "major_revisions", "strengths": [], "material_concerns": [{"claim": "reviewer", "issue": "unreachable", "severity": "critical"}], "minor_points": [], "questions_for_authors": [], "_degraded": True}, "unreachable"


def run_peer_review():
    ts = int(time.time())
    run_dir = RUNS_DIR / f"peer_review_{ts}"
    logger = ResearchLog(run_dir)
    logger.section(f"PEER REVIEW RUN ts={ts}")
    logger.log(f"paper: {PAPER_PATH}")

    if not PAPER_PATH.exists():
        logger.log(f"FATAL: paper not found at {PAPER_PATH}")
        print(f"FATAL: {PAPER_PATH} not found")
        return

    paper_text = PAPER_PATH.read_text(encoding="utf-8")
    logger.log(f"paper loaded: {len(paper_text)} chars, {len(paper_text.split())} words")

    llm = make_llm()
    logger.log("LLM initialised (glm-5.2:cloud via Ollama Cloud)")

    from langgraph.graph import StateGraph, END

    def node_read_paper(state: PeerReviewState) -> dict:
        return {"paper_text": paper_text, "transcript": [{"agent": "read_paper", "message": f"loaded {len(paper_text)} chars"}]}

    def make_reviewer_node(persona_name: str, is_reconsideration: bool = False):
        def node(state: PeerReviewState) -> dict:
            p = REVIEWER_PERSONAS[persona_name]
            system = f"You are {p['role']}."
            user = (
                f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
                f"== PAPER UNDER REVIEW ==\n{state.get('paper_text','')}\n\n"
            )
            if is_reconsideration:
                editor_decisions = state.get("editor_decisions", [])
                last_editor = editor_decisions[-1] if editor_decisions else {}
                contradictions = last_editor.get("contradictions", [])
                my_contradiction = next((c for c in contradictions if c.get("reconsider") == persona_name), None)
                prior_review = state.get("reviews", {}).get(persona_name, {})
                user += (
                    f"\n== YOUR PRIOR REVIEW ==\n{json.dumps(prior_review, indent=2)}\n\n"
                    f"== EDITOR'S CHALLENGE ==\nThe editor flagged a contradiction in your position:\n"
                    f"{json.dumps(my_contradiction, indent=2)}\n\n"
                    f"Reconsider your position in light of the contradiction. You may hold your position "
                    f"(explain why) or revise it. Re-issue your full review.\n{OUTPUT_SCHEMA}"
                )
                tag = f"reconsider.{persona_name}"
            else:
                user += f"Issue your peer review.\n{OUTPUT_SCHEMA}"
                tag = persona_name

            parsed, raw = call_llm_healing(llm, system, user, logger, tag, parse_review, OUTPUT_SCHEMA, persona_name)
            reviews = dict(state.get("reviews", {}))
            reviews[persona_name] = parsed
            review_raw = dict(state.get("review_raw", {}))
            review_raw[persona_name] = raw
            reconsiderations = dict(state.get("reconsiderations", {}))
            if is_reconsideration:
                reconsiderations[persona_name] = reconsiderations.get(persona_name, 0) + 1
            return {
                "reviews": reviews,
                "review_raw": review_raw,
                "reconsiderations": reconsiderations,
                "transcript": [{"agent": persona_name, "reconsideration": is_reconsideration, "message": raw[:1500]}]
            }
        return node

    def node_editor(state: PeerReviewState) -> dict:
        p = REVIEWER_PERSONAS["Editor"]
        reviews = state.get("reviews", {})
        n_reviews = len(reviews)
        n_degraded = sum(1 for r in reviews.values() if r.get("_degraded"))
        logger.log(f"[editor] synthesising {n_reviews} reviews ({n_degraded} degraded)")

        system = f"You are {p['role']}."
        user = (
            f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
            f"== PAPER UNDER REVIEW ==\n{state.get('paper_text','')[:8000]}\n\n"
            f"== REVIEWER REPORTS ==\n{json.dumps(reviews, indent=2)}\n\n"
        )
        editor_decisions = state.get("editor_decisions", [])
        if editor_decisions:
            user += f"\n== YOUR PRIOR EDITORIAL DECISION ==\n{json.dumps(editor_decisions[-1], indent=2)}\n\n"
            user += "You previously flagged contradictions and triggered reconsideration. Review the updated reviewer positions and re-decide.\n"
        user += f"Issue your editorial decision.\n{EDITOR_SCHEMA}"

        parsed, raw = call_llm_healing(llm, system, user, logger, "editor", parse_editor, EDITOR_SCHEMA, "Editor")
        editor_decisions = list(editor_decisions) + [parsed]
        return {
            "editor_decisions": editor_decisions,
            "editor_raw": list(state.get("editor_raw", [])) + [raw],
            "contradictions": parsed.get("contradictions", []),
            "transcript": [{"agent": "editor", "round": len(editor_decisions), "message": raw[:2000]}]
        }

    def route_after_editor(state: PeerReviewState) -> str:
        editor_decisions = state.get("editor_decisions", [])
        if not editor_decisions:
            logger.log("[route] no editor decisions; END")
            return "end"
        last = editor_decisions[-1]
        if last.get("_parse_error") or last.get("_degraded"):
            logger.log("[route] editor degraded; END")
            return "end"
        contradictions = last.get("contradictions", [])
        if not contradictions:
            logger.log("[route] no contradictions; END")
            return "end"
        reconsiderations = state.get("reconsiderations", {})
        pending = []
        for c in contradictions:
            r = c.get("reconsider")
            if r and reconsiderations.get(r, 0) < MAX_REVIEWER_REVISITS:
                pending.append(r)
        if not pending:
            logger.log("[route] all contradictions already reconsidered; END")
            return "end"
        target = pending[0]
        logger.log(f"[route] contradiction found; reconsidering {target}")
        return f"reconsider_{target}"

    g = StateGraph(PeerReviewState)
    g.add_node("read_paper", node_read_paper)
    g.add_node("methodology", make_reviewer_node("MethodologyReviewer"))
    g.add_node("empirical", make_reviewer_node("EmpiricalReviewer"))
    g.add_node("conceptual", make_reviewer_node("ConceptualReviewer"))
    g.add_node("editor", node_editor)

    reconsider_targets = ["MethodologyReviewer", "EmpiricalReviewer", "ConceptualReviewer"]
    reconsider_node_names = {}
    for t in reconsider_targets:
        nname = f"reconsider_{t}"
        g.add_node(nname, make_reviewer_node(t, is_reconsideration=True))
        reconsider_node_names[t] = nname

    g.set_entry_point("read_paper")
    g.add_edge("read_paper", "methodology")
    g.add_edge("methodology", "empirical")
    g.add_edge("empirical", "conceptual")
    g.add_edge("conceptual", "editor")

    route_map = {"end": END, "editor": "editor"}
    for t in reconsider_targets:
        route_map[reconsider_node_names[t]] = reconsider_node_names[t]
    g.add_conditional_edges("editor", route_after_editor, route_map)
    for t in reconsider_targets:
        g.add_edge(reconsider_node_names[t], "editor")

    compiled = g.compile()
    logger.log("graph compiled; invoking")
    t0 = time.time()
    try:
        final_state = compiled.invoke({
            "paper_text": "",
            "reviews": {},
            "review_raw": {},
            "editor_decisions": [],
            "editor_raw": [],
            "reconsiderations": {},
            "contradictions": [],
            "transcript": []
        })
        dt = time.time() - t0
        logger.log(f"graph done in {dt:.1f}s")
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"GRAPH EXCEPTION ({dt:.1f}s): {type(e).__name__}: {e}")
        logger.log("attempting partial-state recovery: saving what we have")
        final_state = {
            "reviews": {},
            "review_raw": {},
            "editor_decisions": [],
            "editor_raw": [],
            "transcript": [{"agent": "graph", "message": f"graph failed: {e}"}],
            "_graph_failed": True
        }

    write_outputs(run_dir, final_state, logger)
    logger.section("PEER REVIEW COMPLETE")
    logger.log(f"run_dir: {run_dir}")
    print(f"\nPeer review complete. Output: {run_dir / 'peer_review.md'}")
    return run_dir


def write_outputs(run_dir: Path, state: dict, logger: ResearchLog):
    run_dir.mkdir(parents=True, exist_ok=True)
    reviews = state.get("reviews", {})
    editor_decisions = state.get("editor_decisions", [])
    final_editor = editor_decisions[-1] if editor_decisions else {"decision": "unknown", "overall_assessment": "editor did not run", "_degraded": True}
    transcript = state.get("transcript", [])
    reconsiderations = state.get("reconsiderations", {})

    (run_dir / "peer_review.json").write_text(json.dumps({
        "reviews": reviews,
        "editor_decisions": editor_decisions,
        "final_editor": final_editor,
        "reconsiderations": reconsiderations,
        "n_transcript_entries": len(transcript)
    }, indent=2), encoding="utf-8")
    logger.log("wrote peer_review.json")

    md = ["# Peer Review Report", ""]
    md.append(f"**Paper**: `audit_bench/DISCUSSION_PAPER.md`")
    md.append(f"**Date**: {time.strftime('%Y-%m-%d %H:%M:%S')}")
    md.append(f"**Model**: glm-5.2:cloud (same model that wrote the paper — self-preference risk noted)")
    md.append(f"**Reconsiderations triggered**: {json.dumps(reconsiderations)}")
    md.append("")

    if state.get("_graph_failed"):
        md.append("> ⚠️ The graph execution failed partway. This report contains partial output. See `research_log.md` for details.")
        md.append("")

    md.append("## Editorial Decision")
    md.append("")
    md.append(f"**Decision**: {final_editor.get('decision', 'unknown')}")
    md.append(f"**Contribution level**: {final_editor.get('contribution_level', 'unknown')}")
    md.append("")
    md.append("### Consolidated comments")
    md.append("")
    md.append(final_editor.get("consolidated_comments", "(none)"))
    md.append("")
    md.append("### Required revisions")
    md.append("")
    for r in final_editor.get("required_revisions", []):
        md.append(f"- {r}")
    md.append("")
    md.append("### Overall assessment")
    md.append("")
    md.append(final_editor.get("overall_assessment", "(none)"))
    md.append("")
    if final_editor.get("contradictions"):
        md.append("### Contradictions flagged (resolved via reconsideration or noted as unresolved)")
        md.append("")
        for c in final_editor["contradictions"]:
            md.append(f"- **{c.get('reviewer_a')}** vs **{c.get('reviewer_b')}** on: {c.get('point')} → reconsider: {c.get('reconsider')}")
        md.append("")

    for name in ["MethodologyReviewer", "EmpiricalReviewer", "ConceptualReviewer"]:
        r = reviews.get(name)
        md.append(f"## {name}")
        md.append("")
        if not r:
            md.append("*(did not run)*")
            md.append("")
            continue
        if r.get("_degraded"):
            md.append("> ⚠️ This review was produced in degraded mode (LLM or parse failure). Content may be incomplete.")
            md.append("")
        md.append(f"**Verdict**: {r.get('verdict', 'unknown')}")
        md.append("")
        md.append("### Strengths")
        md.append("")
        for s in r.get("strengths", []):
            md.append(f"- {s}")
        md.append("")
        md.append("### Material concerns")
        md.append("")
        for c in r.get("material_concerns", []):
            md.append(f"- [{c.get('severity', '?')}] **Claim**: {c.get('claim', '')} — **Issue**: {c.get('issue', '')}")
        md.append("")
        md.append("### Minor points")
        md.append("")
        for m in r.get("minor_points", []):
            md.append(f"- {m}")
        md.append("")
        md.append("### Questions for authors")
        md.append("")
        for q in r.get("questions_for_authors", []):
            md.append(f"- {q}")
        md.append("")

    md.append("## Editor rounds")
    md.append("")
    for i, e in enumerate(editor_decisions, 1):
        md.append(f"### Round {i}")
        md.append(f"- Decision: {e.get('decision', '?')}")
        md.append(f"- Contribution: {e.get('contribution_level', '?')}")
        if e.get("contradictions"):
            md.append(f"- Contradictions: {len(e['contradictions'])}")
        md.append("")

    md.append("## Transcript summary")
    md.append("")
    for t in transcript:
        agent = t.get("agent", "?")
        reconsider = t.get("reconsideration", False)
        marker = " (reconsideration)" if reconsider else ""
        msg_preview = str(t.get("message", ""))[:120].replace("\n", " ")
        md.append(f"- **{agent}**{marker}: {msg_preview}...")
    md.append("")

    (run_dir / "peer_review.md").write_text("\n".join(md), encoding="utf-8")
    logger.log("wrote peer_review.md")
    (run_dir / "transcript.json").write_text(json.dumps(transcript, indent=2), encoding="utf-8")
    logger.log("wrote transcript.json")


if __name__ == "__main__":
    run_peer_review()