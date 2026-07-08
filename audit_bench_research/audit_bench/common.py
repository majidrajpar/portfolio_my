"""
Shared config, personas, and the common run_case interface for all frameworks.

Every framework must implement:
    def run_case(case_dir: Path, model: str, logger) -> dict
Returns:
    {
        "rating": "Clean" | "Qualified" | "Adverse" | "Disclaimer" | "Unable",
        "reasoning": str,
        "red_flags": [str, ...],
        "unable_to_determine": bool,
        "framework": str,
        "model": str,
        "case": str,
        "transcript": [ {agent, message}, ... ]
    }
"""

from pathlib import Path
import json
import time

API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
OLLAMA_BASE_URL = "https://ollama.com/v1"

def load_api_key() -> str:
    with open(API_KEY_PATH, "r", encoding="utf-8") as f:
        return f.readline().strip()

API_KEY = load_api_key()

JUDGE_MODEL = "glm-5.2:cloud"
REASONING_TIMEOUT = 180
REASONING_MAX_TOKENS = 8192

VALID_RATINGS = ["Clean", "Qualified", "Adverse", "Disclaimer", "Unable"]


PERSONAS = {
    "EngagementPartner": {
        "role": "Audit Engagement Partner",
        "goal": (
            "You set audit scope, apply materiality thresholds, and give the final audit opinion. "
            "You weigh the evidence and red flags presented by your team and decide the opinion: "
            "Clean (unqualified), Qualified, Adverse, Disclaimer, or Unable (if evidence is genuinely insufficient). "
            "You do not bend to management's preferred narrative."
        ),
        "constraints": "You must cite specific evidence for every judgement. If the team has not surfaced enough evidence, you must issue a Disclaimer or 'Unable'. Never speculate beyond evidence shown."
    },
    "AuditSenior": {
        "role": "Audit Senior (substantive testing lead)",
        "goal": (
            "You perform substantive analytical procedures on the evidence presented. "
            "You enumerate red flags — each one citing the specific document/figure you observed. "
            "You do not form the final opinion; you surface findings for the partner."
        ),
        "constraints": "Every red flag must reference an observed item. No hand-waving. If evidence is silent on a risk area, say so explicitly — silence is itself a red flag for evidence sufficiency."
    },
    "SkepticReviewer": {
        "role": "Adversarial Skeptic Reviewer (professional skepticism)",
        "goal": (
            "You argue AGAINST the prevailing view. If the team leans Clean, you argue for concern. "
            "If the team leans Adverse, you stress-test whether evidence truly supports that. "
            "You hunt for fraud indicators: revenue inflation, expense deferral, related parties, off-balance-sheet items, going-concern signals, and auditor independence threats."
        ),
        "constraints": "You must raise at least one counter-argument per draft. You may concede only if your counter-argument is demonstrably refuted by cited evidence. You never rubber-stamp."
    },
    "IndependenceChecker": {
        "role": "Audit Independence & Quality Checker",
        "goal": (
            "You verify that the team's opinion rests on cited evidence, not reputation, brand, or prior-year comfort. "
            "You flag any claim that lacks a citation. You check that the team has not assumed management representations are true without verification."
        ),
        "constraints": "If any claim in the draft opinion lacks a cited evidence item, you must reject it and request rework. You are the final quality gate before the opinion is finalised."
    }
}


PERSONA_ORDER = ["AuditSenior", "SkepticReviewer", "EngagementPartner", "IndependenceChecker"]


OUTPUT_SCHEMA_INSTRUCTION = """You MUST finish your response with a JSON block on its own line, exactly in this format, enclosed in <OPINION></OPINION> tags:
<OPINION>
{
  "rating": "Clean|Qualified|Adverse|Disclaimer|Unable",
  "reasoning": "<one-paragraph justification citing evidence>",
  "red_flags": ["<flag 1 with citation>", "<flag 2>", "..."],
  "unable_to_determine": true|false
}
</OPINION>
The tags and JSON must appear verbatim. Do not add fields. rating must be one of: Clean, Qualified, Adverse, Disclaimer, Unable."""


def read_evidence(case_dir: Path) -> str:
    evidence_dir = case_dir / "evidence"
    if not evidence_dir.exists():
        return ""
    chunks = []
    for f in sorted(evidence_dir.iterdir()):
        if f.is_file() and f.suffix in (".txt", ".md"):
            chunks.append(f"=== EVIDENCE FILE: {f.name} ===\n{f.read_text(encoding='utf-8')}")
    return "\n\n".join(chunks)


def load_ground_truth(case_dir: Path) -> dict:
    return json.loads((case_dir / "ground_truth.json").read_text(encoding="utf-8"))


def parse_opinion(text: str) -> dict:
    import re
    m = re.search(r"<OPINION>\s*(\{.*?\})\s*</OPINION>", text, re.DOTALL)
    if not m:
        return {
            "rating": "Unable",
            "reasoning": text[:2000],
            "red_flags": [],
            "unable_to_determine": True,
            "_parse_error": True
        }
    try:
        obj = json.loads(m.group(1))
        if obj.get("rating") not in VALID_RATINGS:
            obj["rating"] = "Unable"
        obj.setdefault("reasoning", "")
        obj.setdefault("red_flags", [])
        obj.setdefault("unable_to_determine", False)
        return obj
    except Exception as e:
        return {
            "rating": "Unable",
            "reasoning": f"JSON parse failed: {e}",
            "red_flags": [],
            "unable_to_determine": True,
            "_parse_error": True
        }


def make_openai_client(model: str):
    import openai
    return openai.OpenAI(api_key=API_KEY, base_url=OLLAMA_BASE_URL)


def call_llm(client, model: str, system: str, user: str, logger, tag: str = "llm") -> str:
    logger.log(f"[{tag}] calling {model} ...")
    t0 = time.time()
    resp = client.chat.completions.create(
        model=model,
        messages=[
            {"role": "system", "content": system},
            {"role": "user", "content": user}
        ],
        temperature=0.5,
        max_tokens=REASONING_MAX_TOKENS,
        timeout=REASONING_TIMEOUT,
    )
    content = resp.choices[0].message.content or ""
    dt = time.time() - t0
    logger.log(f"[{tag}] done in {dt:.1f}s, {len(content)} chars")
    return content


class ResearchLog:
    def __init__(self, run_dir: Path):
        run_dir.mkdir(parents=True, exist_ok=True)
        self.path = run_dir / "research_log.md"
        self.entries = []
        self.t0 = time.time()
        self.log(f"Research log started at run_dir={run_dir}")

    def log(self, msg: str):
        ts = time.time() - self.t0
        line = f"[t+{ts:7.1f}s] {msg}"
        self.entries.append(line)
        with open(self.path, "a", encoding="utf-8") as f:
            f.write(line + "\n")

    def section(self, title: str):
        self.log(f"\n## {title}")