"""
Framework A: plain_python — Blackboard/Cook/Kitchen baseline.

Reuses the reactive-execution pattern proven in this repo (blackboard_kitchen.py) but
retargeted for audit judgement. 4 cooks in fixed order, 3 rounds max:
  1. AuditSenior     -> enumerates red flags from evidence
  2. SkepticReviewer -> argues against, hunts fraud indicators
  3. EngagementPartner -> weighs both, emits final opinion JSON
  4. IndependenceChecker -> verifies cited evidence; may reject (loop back to Senior)
"""
import sys
import time
import hashlib
import json
from pathlib import Path
from typing import Dict, List, Optional, Any
from dataclasses import dataclass, field

sys.path.insert(0, str(Path(__file__).parent.parent))
from common import (
    PERSONAS, PERSONA_ORDER, OUTPUT_SCHEMA_INSTRUCTION, read_evidence,
    parse_opinion, make_openai_client, call_llm, ResearchLog
)

FRAMEWORK_NAME = "plain_python"

MAX_ROUNDS = 3


@dataclass
class Blackboard:
    entries: Dict[str, Any] = field(default_factory=dict)
    log: List[Dict] = field(default_factory=list)
    _versions: Dict[str, int] = field(default_factory=dict)
    _counter: int = 0

    def write(self, key: str, value: Any, who: str):
        self.entries[key] = value
        self._counter += 1
        self._versions[key] = self._counter
        self.log.append({"who": who, "key": key, "t": time.time()})

    def read(self, key, default=None):
        return self.entries.get(key, default)

    def snapshot(self) -> str:
        lines = ["=== BLACKBOARD ==="]
        for k, v in self.entries.items():
            preview = str(v)[:1500].replace("\n", " ")
            lines.append(f"[{k}]: {preview}")
        return "\n".join(lines)


def _build_prompt(persona_name: str, bb: Blackboard, evidence: str) -> str:
    persona = PERSONAS[persona_name]
    base = (
        f"You are {persona['role']}. {persona['goal']}\n"
        f"Constraints: {persona['constraints']}\n\n"
        f"== EVIDENCE ==\n{evidence}\n\n"
        f"== CURRENT BLACKBOARD ==\n{bb.snapshot()}\n\n"
    )
    if persona_name == "EngagementPartner":
        base += (
            "Based on the AuditSenior's red flags, the SkepticReviewer's counter-arguments, "
            "and the evidence, give your FINAL audit opinion.\n"
            f"{OUTPUT_SCHEMA_INSTRUCTION}"
        )
    elif persona_name == "IndependenceChecker":
        base += (
            "Inspect the EngagementPartner's draft opinion above. List any claim lacking a cited evidence item. "
            "If all claims are properly supported, output 'SIGNOFF: APPROVED'. "
            "If any claim is unsupported, output 'REJECT: <list of unsupported claims>'."
        )
    elif persona_name == "AuditSenior":
        base += "Enumerate red flags from the evidence. Each red flag must cite a specific document/figure."
    elif persona_name == "SkepticReviewer":
        base += "Argue against the AuditSenior's view (or hunt fraud indicators if Senior is silent). Be specific."
    return base


def run_case(case_dir: Path, model: str, logger: ResearchLog) -> dict:
    logger.log(f"[{FRAMEWORK_NAME}] start case={case_dir.name} model={model}")
    evidence = read_evidence(case_dir)
    bb = Blackboard()
    bb.write("evidence_loaded", True, "system")
    client = make_openai_client(model)
    transcript = []

    partner_output_raw = None
    final_opinion = None

    for round_num in range(1, MAX_ROUNDS + 1):
        logger.log(f"[{FRAMEWORK_NAME}] round {round_num}")
        for persona_name in PERSONA_ORDER:
            system = f"You are {PERSONAS[persona_name]['role']}."
            user = _build_prompt(persona_name, bb, evidence)
            content = call_llm(client, model, system, user, logger, tag=f"{FRAMEWORK_NAME}.{persona_name}")
            bb.write(persona_name, content, persona_name)
            transcript.append({"agent": persona_name, "round": round_num, "message": content})

            if persona_name == "EngagementPartner":
                partner_output_raw = content
            if persona_name == "IndependenceChecker":
                if "SIGNOFF: APPROVED" in content.upper():
                    logger.log(f"[{FRAMEWORK_NAME}] independence signoff received in round {round_num}")
                    final_opinion = parse_opinion(partner_output_raw or content)
                    break
                else:
                    logger.log(f"[{FRAMEWORK_NAME}] independence rejected; looping back")
        if final_opinion is not None:
            break

    if final_opinion is None:
        logger.log(f"[{FRAMEWORK_NAME}] no signoff after {MAX_ROUNDS} rounds; using last partner draft")
        final_opinion = parse_opinion(partner_output_raw or "") if partner_output_raw else {
            "rating": "Unable", "reasoning": "no partner output", "red_flags": [], "unable_to_determine": True
        }

    result = {
        "framework": FRAMEWORK_NAME,
        "model": model,
        "case": case_dir.name,
        "rating": final_opinion.get("rating", "Unable"),
        "reasoning": final_opinion.get("reasoning", ""),
        "red_flags": final_opinion.get("red_flags", []),
        "unable_to_determine": final_opinion.get("unable_to_determine", False),
        "transcript": transcript
    }
    logger.log(f"[{FRAMEWORK_NAME}] done rating={result['rating']} flags={len(result['red_flags'])}")
    return result