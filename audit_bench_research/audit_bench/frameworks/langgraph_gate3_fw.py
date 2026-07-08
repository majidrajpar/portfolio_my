"""
Framework D2: LangGraph WITH verdict gate (deconfounding variant).

Identical to langgraph_fw.py EXCEPT the independence checker is a real verdict gate:
on REJECT, the graph loops back to senior (full senior->skeptic->partner->independence
re-run), capped at MAX_GATE_REVISITS. This isolates the gate as the only variable
vs langgraph_fw.py (which has no gate loop).

The comparison langgraph (no gate) vs langgraph_gate (gate) within the same framework
tests whether the gate concept is the driver, independent of plain_python's Blackboard pattern.
"""
import sys
import json
from pathlib import Path
from typing import TypedDict, Optional, List, Annotated
from operator import add

sys.path.insert(0, str(Path(__file__).parent.parent))
from common import (
    PERSONAS, PERSONA_ORDER, OUTPUT_SCHEMA_INSTRUCTION, read_evidence,
    parse_opinion, API_KEY, OLLAMA_BASE_URL, ResearchLog
)

FRAMEWORK_NAME = "langgraph_gate3"

MAX_SKEPTIC_REVISITS = 2
MAX_GATE_REVISITS = 3


class CaseState(TypedDict, total=False):
    evidence: str
    senior_red_flags: List[str]
    senior_summary: str
    skeptic_objections: List[str]
    skeptic_summary: str
    skeptic_revisits: int
    partner_opinion: str
    partner_json: Optional[dict]
    independence_decision: str
    independence_approved: bool
    gate_revisits: int
    final_opinion: Optional[dict]
    transcript: Annotated[List[dict], add]


def run_case(case_dir: Path, model: str, logger: ResearchLog) -> dict:
    from langgraph.graph import StateGraph, END
    from langchain_openai import ChatOpenAI

    logger.log(f"[{FRAMEWORK_NAME}] start case={case_dir.name} model={model}")

    llm = ChatOpenAI(
        model=model,
        api_key=API_KEY,
        base_url=OLLAMA_BASE_URL,
        temperature=0.5,
        max_tokens=8196,
        timeout=180,
    )

    def _call(system: str, user: str, tag: str) -> str:
        logger.log(f"[{FRAMEWORK_NAME}.{tag}] calling {model}")
        import time
        t0 = time.time()
        out = llm.invoke([
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ])
        dt = time.time() - t0
        content = out.content if hasattr(out, 'content') else str(out)
        logger.log(f"[{FRAMEWORK_NAME}.{tag}] done in {dt:.1f}s, {len(content)} chars")
        return content

    def node_read_evidence(state: CaseState) -> dict:
        evidence = read_evidence(case_dir)
        return {"evidence": evidence, "transcript": [{"agent": "read_evidence", "round": 0, "message": f"loaded {len(evidence)} chars"}]}

    def node_senior(state: CaseState) -> dict:
        p = PERSONAS["AuditSenior"]
        gate_revisits = state.get("gate_revisits", 0)
        user = (
            f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
            f"== EVIDENCE ==\n{state.get('evidence','')}\n\n"
            f"== PREVIOUS SENIOR PASS (if any) ==\n{state.get('senior_summary','(none)')}\n\n"
            f"== SKEPTIC OBJECTIONS TO ADDRESS ==\n"
            + "\n".join(f"- {o}" for o in state.get("skeptic_objections", []))
            + f"\n\n== INDEPENDENCE CHECKER REJECTION (if gate revisit) ==\n{state.get('independence_decision','(none)')}"
            + "\n\nEnumerate red flags (each citing evidence). If revisiting after independence rejection, address the unsupported claims explicitly."
        )
        content = _call(f"You are {p['role']}.", user, "AuditSenior")
        import re
        flags = re.findall(r"^(?:\d+\.|-|\*)\s*(.+)$", content, re.MULTILINE)
        return {
            "senior_summary": content,
            "senior_red_flags": flags[:30],
            "transcript": [{"agent": "AuditSenior", "round": gate_revisits, "message": content}]
        }

    def node_skeptic(state: CaseState) -> dict:
        p = PERSONAS["SkepticReviewer"]
        user = (
            f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
            f"== SENIOR'S RED FLAGS ==\n{state.get('senior_summary','(none)')}\n\n"
            f"Argue against. Raise at least one counter-argument or new fraud indicator. "
            f"If the senior adequately addressed all material concerns, output exactly: 'CONCEDE'."
        )
        content = _call(f"You are {p['role']}.", user, "SkepticReviewer")
        conceded = content.strip().upper().startswith("CONCEDE")
        objections = [] if conceded else [ln[2:] for ln in content.split("\n") if ln.startswith("- ")]
        return {
            "skeptic_summary": content,
            "skeptic_objections": objections,
            "skeptic_revisits": state.get("skeptic_revisits", 0) + (0 if conceded else 1),
            "transcript": [{"agent": "SkepticReviewer", "round": state.get("skeptic_revisits", 0), "message": content}]
        }

    def route_after_skeptic(state: CaseState) -> str:
        revisits = state.get("skeptic_revisits", 0)
        objections = state.get("skeptic_objections", [])
        if not objections or revisits >= MAX_SKEPTIC_REVISITS:
            logger.log(f"[{FRAMEWORK_NAME}] routing skeptic -> partner (revisits={revisits})")
            return "partner"
        logger.log(f"[{FRAMEWORK_NAME}] routing skeptic -> senior (revisit; objections={len(objections)})")
        return "senior"

    def node_partner(state: CaseState) -> dict:
        p = PERSONAS["EngagementPartner"]
        gate_revisits = state.get("gate_revisits", 0)
        user = (
            f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
            f"== SENIOR RED FLAGS ==\n{state.get('senior_summary','')}\n\n"
            f"== SKEPTIC OBJECTIONS ==\n{state.get('skeptic_summary','')}\n\n"
        )
        if gate_revisits > 0:
            user += (
                f"== INDEPENDENCE CHECKER REJECTION (gate revisit {gate_revisits}) ==\n"
                f"{state.get('independence_decision','')}\n\n"
                f"The independence checker rejected your prior draft. Address the unsupported claims and re-issue.\n"
            )
        user += f"Give the final audit opinion.\n{OUTPUT_SCHEMA_INSTRUCTION}"
        content = _call(f"You are {p['role']}.", user, "EngagementPartner")
        opinion = parse_opinion(content)
        return {
            "partner_opinion": content,
            "partner_json": opinion,
            "transcript": [{"agent": "EngagementPartner", "round": gate_revisits + 1, "message": content}]
        }

    def node_independence(state: CaseState) -> dict:
        p = PERSONAS["IndependenceChecker"]
        gate_revisits = state.get("gate_revisits", 0)
        user = (
            f"{p['goal']}\nConstraints: {p['constraints']}\n\n"
            f"== DRAFT OPINION ==\n{state.get('partner_opinion','')}\n\n"
            f"== EVIDENCE AVAILABLE ==\n{state.get('evidence','')[:4000]}\n\n"
            f"List unsupported claims. If all supported, output 'SIGNOFF: APPROVED'. Else 'REJECT: <issues>'."
        )
        content = _call(f"You are {p['role']}.", user, "IndependenceChecker")
        approved = "SIGNOFF: APPROVED" in content.upper()
        opinion = state.get("partner_json", {})
        if not approved:
            opinion["unable_to_determine"] = True
        return {
            "independence_decision": content,
            "independence_approved": approved,
            "gate_revisits": gate_revisits + (0 if approved else 1),
            "final_opinion": opinion,
            "transcript": [{"agent": "IndependenceChecker", "round": gate_revisits + 1, "message": content}]
        }

    def route_after_independence(state: CaseState) -> str:
        approved = state.get("independence_approved", False)
        gate_revisits = state.get("gate_revisits", 0)
        if approved:
            logger.log(f"[{FRAMEWORK_NAME}] independence APPROVED; END (gate_revisits={gate_revisits})")
            return "end"
        if gate_revisits >= MAX_GATE_REVISITS:
            logger.log(f"[{FRAMEWORK_NAME}] gate rejected but cap hit ({gate_revisits}); END with Unable")
            return "end"
        logger.log(f"[{FRAMEWORK_NAME}] gate REJECTED; loop back to senior (gate_revisits={gate_revisits})")
        return "senior"

    g = StateGraph(CaseState)
    g.add_node("read_evidence", node_read_evidence)
    g.add_node("senior", node_senior)
    g.add_node("skeptic", node_skeptic)
    g.add_node("partner", node_partner)
    g.add_node("independence", node_independence)
    g.set_entry_point("read_evidence")
    g.add_edge("read_evidence", "senior")
    g.add_edge("senior", "skeptic")
    g.add_conditional_edges("skeptic", route_after_skeptic, {"senior": "senior", "partner": "partner"})
    g.add_edge("partner", "independence")
    g.add_conditional_edges("independence", route_after_independence, {"senior": "senior", "end": END})

    compiled = g.compile()

    import time
    t0 = time.time()
    try:
        final_state = compiled.invoke({
            "evidence": "", "senior_red_flags": [], "skeptic_objections": [],
            "skeptic_revisits": 0, "gate_revisits": 0, "transcript": []
        })
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] graph done in {dt:.1f}s skeptic_revisits={final_state.get('skeptic_revisits',0)} gate_revisits={final_state.get('gate_revisits',0)}")
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] graph EXCEPTION ({dt:.1f}s): {type(e).__name__}: {e}")
        return {
            "framework": FRAMEWORK_NAME, "model": model, "case": case_dir.name,
            "rating": "Unable", "reasoning": f"graph failed: {e}",
            "red_flags": [], "unable_to_determine": True, "transcript": [{"agent": "graph", "message": str(e)}]
        }

    opinion = final_state.get("final_opinion") or {}
    if not opinion:
        opinion = final_state.get("partner_json") or {}
    opinion = opinion or {"rating": "Unable", "reasoning": "", "red_flags": [], "unable_to_determine": True}

    result = {
        "framework": FRAMEWORK_NAME,
        "model": model,
        "case": case_dir.name,
        "rating": opinion.get("rating", "Unable"),
        "reasoning": opinion.get("reasoning", final_state.get("partner_opinion", "")[:2000]),
        "red_flags": opinion.get("red_flags", final_state.get("senior_red_flags", [])),
        "unable_to_determine": opinion.get("unable_to_determine", False),
        "transcript": final_state.get("transcript", []),
        "skeptic_revisits": final_state.get("skeptic_revisits", 0),
        "gate_revisits": final_state.get("gate_revisits", 0)
    }
    logger.log(f"[{FRAMEWORK_NAME}] done rating={result['rating']} flags={len(result['red_flags'])} gate_revisits={result['gate_revisits']}")
    return result
