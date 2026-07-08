"""
Framework C: OpenAI Swarm (openai-swarm).

4 agents with explicit handoffs: Senior -> Skeptic -> Partner -> Independence.
Tools: read_evidence_file (function) to demonstrate native tool-calling capability.
"""
import sys
import json
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from common import (
    PERSONAS, PERSONA_ORDER, OUTPUT_SCHEMA_INSTRUCTION, read_evidence,
    parse_opinion, API_KEY, OLLAMA_BASE_URL, ResearchLog
)

FRAMEWORK_NAME = "swarm"


def run_case(case_dir: Path, model: str, logger: ResearchLog) -> dict:
    from openai import OpenAI
    from swarm import Swarm, Agent

    logger.log(f"[{FRAMEWORK_NAME}] start case={case_dir.name} model={model}")
    evidence = read_evidence(case_dir)

    openai_client = OpenAI(api_key=API_KEY, base_url=OLLAMA_BASE_URL)
    client = Swarm(client=openai_client)

    case_context = {"evidence": evidence, "red_flags": [], "skeptic_points": [], "draft_opinion": None, "independence_signoff": None}

    def cite_red_flag(flag: str) -> str:
        """Add a red flag to the shared case context. Use when you identify a specific risk indicator with a cited evidence item."""
        case_context["red_flags"].append(flag)
        return f"Recorded red flag: {flag}"

    def record_skeptic_point(point: str) -> str:
        """Record a counter-argument or fraud indicator the senior may have missed."""
        case_context["skeptic_points"].append(point)
        return f"Recorded skeptic point: {point}"

    def set_draft_opinion(opinion_json: str) -> str:
        """Set the draft audit opinion. opinion_json must be the OPINION JSON block."""
        case_context["draft_opinion"] = opinion_json
        return "Draft opinion recorded."

    def signoff_independence(approved: bool, issues: str = "") -> str:
        """Approve or reject the draft opinion based on evidence citation check."""
        case_context["independence_signoff"] = {"approved": approved, "issues": issues}
        return "APPROVED" if approved else f"REJECTED: {issues}"

    def _persona_instructions(name: str) -> str:
        p = PERSONAS[name]
        base = f"{p['role']}. {p['goal']}\nConstraints: {p['constraints']}"
        return base

    senior_agent = Agent(
        name="AuditSenior",
        instructions=_persona_instructions("AuditSenior") + "\n\nCall cite_red_flag for each red flag you identify. After citing all red flags, hand off to SkepticReviewer by returning transfer_to_skeptic().",
        functions=[cite_red_flag],
        model=model
    )

    skeptic_agent = Agent(
        name="SkepticReviewer",
        instructions=_persona_instructions("SkepticReviewer") + "\n\nCall record_skeptic_point for each counter-argument or fraud indicator. Then hand off to EngagementPartner via transfer_to_partner().",
        functions=[record_skeptic_point],
        model=model
    )

    partner_agent = Agent(
        name="EngagementPartner",
        instructions=_persona_instructions("EngagementPartner") + f"\n\nReview the red flags and skeptic points in context. Set the final opinion by calling set_draft_opinion with the OPINION JSON block. Format:\n{OUTPUT_SCHEMA_INSTRUCTION}\nThen hand off to IndependenceChecker via transfer_to_independence().",
        functions=[set_draft_opinion],
        model=model
    )

    independence_agent = Agent(
        name="IndependenceChecker",
        instructions=_persona_instructions("IndependenceChecker") + "\n\nInspect the draft opinion in context. Call signoff_independence(True) if all claims are cited, or signoff_independence(False, issues) if any claim is unsupported.",
        functions=[signoff_independence],
        model=model
    )

    def transfer_to_skeptic():
        """Hand off to the SkepticReviewer."""
        return skeptic_agent

    def transfer_to_partner():
        """Hand off to the EngagementPartner."""
        return partner_agent

    def transfer_to_independence():
        """Hand off to the IndependenceChecker."""
        return independence_agent

    senior_agent.functions = senior_agent.functions + [transfer_to_skeptic]
    skeptic_agent.functions = skeptic_agent.functions + [transfer_to_partner]
    partner_agent.functions = partner_agent.functions + [transfer_to_independence]

    initial_messages = [
        {"role": "user", "content": f"Audit the following evidence. Cite red flags using your tools, then hand off through the team.\n\nEVIDENCE:\n{evidence}"}
    ]

    import time
    t0 = time.time()
    transcript = []
    try:
        response = client.run(
            agent=senior_agent,
            messages=initial_messages,
            context_variables=case_context,
            max_turns=20,
        )
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] swarm run done in {dt:.1f}s")
        for msg in response.messages:
            if msg.get("role") in ("user", "assistant"):
                transcript.append({"agent": msg.get("name", msg.get("role", "?")), "round": 1, "message": msg.get("content", "")})
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] swarm EXCEPTION ({dt:.1f}s): {type(e).__name__}: {e}")
        return {
            "framework": FRAMEWORK_NAME, "model": model, "case": case_dir.name,
            "rating": "Unable", "reasoning": f"swarm failed: {e}",
            "red_flags": case_context.get("red_flags", []), "unable_to_determine": True,
            "transcript": [{"agent": "swarm", "message": str(e)}]
        }

    draft = case_context.get("draft_opinion") or ""
    final_text = ""
    for t in reversed(transcript):
        if "<OPINION>" in t["message"]:
            final_text = t["message"]
            break
    if not final_text:
        final_text = draft or (transcript[-1]["message"] if transcript else "")

    opinion = parse_opinion(final_text)
    red_flags = list(case_context.get("red_flags", []))
    if not red_flags:
        red_flags = opinion.get("red_flags", [])

    signoff = case_context.get("independence_signoff")
    if signoff and not signoff.get("approved"):
        opinion["unable_to_determine"] = True
        logger.log(f"[{FRAMEWORK_NAME}] independence rejected: {signoff.get('issues','')[:100]}")

    result = {
        "framework": FRAMEWORK_NAME,
        "model": model,
        "case": case_dir.name,
        "rating": opinion.get("rating", "Unable"),
        "reasoning": opinion.get("reasoning", final_text[:2000]),
        "red_flags": red_flags,
        "unable_to_determine": opinion.get("unable_to_determine", False),
        "transcript": transcript
    }
    logger.log(f"[{FRAMEWORK_NAME}] done rating={result['rating']} flags={len(result['red_flags'])} signoff={signoff}")
    return result