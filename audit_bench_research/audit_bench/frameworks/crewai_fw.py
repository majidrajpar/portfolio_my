"""
Framework B: CrewAI.

4 agents (one per persona) run sequentially as a Crew. Each Task's output becomes
context for the next. EngagementPartner's task expects the OPINION JSON block.
IndependenceChecker's task ends the crew; rejection would require a manual loop,
which CrewAI's sequential process does not natively provide, so we run the crew once
and rely on the personas' instructions to enforce rigour. We document this as a
framework limitation in the rating.
"""
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))
from common import (
    PERSONAS, PERSONA_ORDER, OUTPUT_SCHEMA_INSTRUCTION, read_evidence,
    parse_opinion, API_KEY, OLLAMA_BASE_URL, ResearchLog
)

FRAMEWORK_NAME = "crewai"


def run_case(case_dir: Path, model: str, logger: ResearchLog) -> dict:
    from crewai import Agent, Task, Crew, Process, LLM

    logger.log(f"[{FRAMEWORK_NAME}] start case={case_dir.name} model={model}")
    evidence = read_evidence(case_dir)

    llm = LLM(
        model=model,
        api_key=API_KEY,
        base_url=OLLAMA_BASE_URL,
        max_tokens=8192,
        timeout=180,
    )
    logger.log(f"[{FRAMEWORK_NAME}] LLM configured base_url={OLLAMA_BASE_URL}")

    agents = {}
    for name in PERSONA_ORDER:
        p = PERSONAS[name]
        agents[name] = Agent(
            role=p["role"],
            goal=p["goal"],
            backstory=p["constraints"],
            llm=llm,
            allow_delegation=False,
            verbose=False,
        )

    tasks = []
    task_descriptions = {
        "AuditSenior": (
            f"From the following evidence, enumerate every red flag you can identify. "
            f"Each red flag must cite a specific document or figure.\n\nEVIDENCE:\n{evidence}"
        ),
        "SkepticReviewer": (
            "Review the AuditSenior's red flags. Argue AGAINST the prevailing view. "
            "Hunt specifically for fraud indicators: revenue inflation, expense deferral, related parties, "
            "off-balance-sheet items, going-concern signals, auditor independence threats. "
            "Raise at least one counter-argument or new fraud risk that the Senior missed."
        ),
        "EngagementPartner": (
            "Weigh the AuditSenior's red flags and the SkepticReviewer's counter-arguments. "
            "Decide the final audit opinion.\n"
            f"{OUTPUT_SCHEMA_INSTRUCTION}"
        ),
        "IndependenceChecker": (
            "Inspect the EngagementPartner's draft opinion. List any claim lacking a cited evidence item. "
            "If all claims are properly supported, output 'SIGNOFF: APPROVED'. "
            "If any claim is unsupported, output 'REJECT: <list>'."
        ),
    }
    for name in PERSONA_ORDER:
        tasks.append(Task(
            description=task_descriptions[name],
            expected_output="A focused response per your role, citing evidence.",
            agent=agents[name],
        ))

    crew = Crew(
        agents=[agents[n] for n in PERSONA_ORDER],
        tasks=tasks,
        process=Process.sequential,
        verbose=False,
    )
    logger.log(f"[{FRAMEWORK_NAME}] kicking off crew")
    import time
    t0 = time.time()
    try:
        crew_output = crew.kickoff()
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] crew done in {dt:.1f}s")
    except Exception as e:
        dt = time.time() - t0
        logger.log(f"[{FRAMEWORK_NAME}] crew EXCEPTION ({dt:.1f}s): {type(e).__name__}: {e}")
        return {
            "framework": FRAMEWORK_NAME, "model": model, "case": case_dir.name,
            "rating": "Unable", "reasoning": f"crew failed: {e}",
            "red_flags": [], "unable_to_determine": True, "transcript": [{"agent": "crew", "message": str(e)}]
        }

    raw_output = str(crew_output)
    tasks_output = [str(t.output) if hasattr(t, 'output') else str(t) for t in crew.tasks_output] if hasattr(crew, 'tasks_output') and crew.tasks_output else []
    transcript = [{"agent": PERSONA_ORDER[i], "round": 1, "message": tasks_output[i] if i < len(tasks_output) else ""} for i in range(len(PERSONA_ORDER))]
    opinion = parse_opinion(raw_output)
    if opinion.get("_parse_error"):
        for msg in reversed([t["message"] for t in transcript]):
            opinion = parse_opinion(msg)
            if not opinion.get("_parse_error"):
                break

    result = {
        "framework": FRAMEWORK_NAME,
        "model": model,
        "case": case_dir.name,
        "rating": opinion.get("rating", "Unable"),
        "reasoning": opinion.get("reasoning", raw_output[:2000]),
        "red_flags": opinion.get("red_flags", []),
        "unable_to_determine": opinion.get("unable_to_determine", False),
        "transcript": transcript
    }
    logger.log(f"[{FRAMEWORK_NAME}] done rating={result['rating']} flags={len(result['red_flags'])}")
    return result