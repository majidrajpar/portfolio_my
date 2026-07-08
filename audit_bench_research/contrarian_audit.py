"""
Contrarian Audit Independence - Real case study for the blackboard kitchen.

Pipeline:
1. HistorianCook -> historical_context
2. EconomistCook -> economic_analysis
3. ContrarianCook -> contrarian_thesis
4. EditorCook -> final_article

Test: Does role-separation produce deeper analysis than a single prompt?
"""

from typing import Dict, List, Callable, Optional, Any
from dataclasses import dataclass, field
import time
import hashlib


# ---------------------------------------------------------------------------
# 1. The Blackboard (shared kitchen counter)
# ---------------------------------------------------------------------------

@dataclass
class Blackboard:
    """
    The shared state. Every cook can read everything and write anything.
    In production, you'd add locking, versioning, or persistence.
    """
    entries: Dict[str, Any] = field(default_factory=dict)
    log: List[Dict] = field(default_factory=list)
    _version_counter: int = field(default=0, repr=False)
    _key_versions: Dict[str, int] = field(default_factory=dict, repr=False)

    def write(self, key: str, value: Any, cook_name: str):
        self.entries[key] = value
        self._version_counter += 1
        self._key_versions[key] = self._version_counter
        self.log.append({
            "timestamp": time.time(),
            "cook": cook_name,
            "action": "WRITE",
            "key": key,
            "preview": str(value)[:100]
        })

    def read(self, key: str, default=None):
        return self.entries.get(key, default)

    def snapshot(self) -> str:
        """A formatted view of the current blackboard for cooks to read."""
        lines = ["=== BLACKBOARD STATE ==="]
        for k, v in self.entries.items():
            preview = str(v)[:200].replace("\n", " ")
            if len(str(v)) > 200:
                preview += "..."
            lines.append(f"[{k}]: {preview}")
        return "\n".join(lines)

    def history(self) -> str:
        lines = ["=== ACTIVITY LOG ==="]
        for entry in self.log:
            lines.append(f"{entry['cook']:12s} | {entry['action']:6s} | {entry['key']}")
        return "\n".join(lines)

    def digest_of(self, keys: List[str]) -> str:
        """
        Return a hash representing the current versions of the given keys.
        If any key's value or version changes, this digest changes.
        """
        parts = []
        for k in sorted(keys):
            ver = self._key_versions.get(k, 0)
            val = str(self.entries.get(k, ""))
            parts.append(f"{k}:{ver}:{hashlib.md5(val.encode()).hexdigest()[:8]}")
        return hashlib.md5("|".join(parts).encode()).hexdigest()


# ---------------------------------------------------------------------------
# 2. The LLM Interface (pluggable)
# ---------------------------------------------------------------------------

class LLMProvider:
    def call(self, system_prompt: str, user_prompt: str) -> str:
        raise NotImplementedError


class MockLLM(LLMProvider):
    """Fast local fallback for testing mechanics."""
    def call(self, system_prompt: str, user_prompt: str) -> str:
        return f"[MockLLM: {system_prompt[:30]}... | User: {user_prompt[:40]}...]"


class OllamaLLM(LLMProvider):
    """
    Ollama Cloud adapter using the OpenAI-compatible endpoint.
    NOTE: glm-5.2:cloud is a reasoning model. It requires a large max_tokens
    because it consumes tokens on internal reasoning before producing output.
    """
    def __init__(self, api_key: str, model: str = "glm-5.2:cloud", base_url: str = "https://ollama.com/v1"):
        import openai
        self.client = openai.OpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    def call(self, system_prompt: str, user_prompt: str) -> str:
        print(f"  [OllamaLLM] Calling {self.model} (please wait)...")
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
            max_tokens=4096,
            timeout=120,
        )
        content = response.choices[0].message.content
        print(f"  [OllamaLLM] Received {len(content)} chars.")
        return content


# ---------------------------------------------------------------------------
# 3. The Cook (agent)
# ---------------------------------------------------------------------------

class Cook:
    def __init__(
        self,
        name: str,
        system_prompt: str,
        llm: LLMProvider,
        inputs: List[str],
        outputs: List[str],
        condition: Optional[Callable[[Blackboard], bool]] = None
    ):
        self.name = name
        self.system_prompt = system_prompt
        self.llm = llm
        self.inputs = inputs
        self.outputs = outputs
        self.condition = condition or (lambda bb: True)
        self._last_input_digest: Optional[str] = None

    def _current_digest(self, bb: Blackboard) -> str:
        return bb.digest_of(self.inputs)

    def can_run(self, bb: Blackboard) -> bool:
        has_inputs = all(bb.read(k) is not None for k in self.inputs)
        if not has_inputs:
            return False
        if not self.condition(bb):
            return False
        current = self._current_digest(bb)
        if current == self._last_input_digest:
            return False
        return True

    def run(self, bb: Blackboard) -> bool:
        if not self.can_run(bb):
            print(f"[{self.name}] SKIPPED (already up to date)")
            return False

        self._last_input_digest = self._current_digest(bb)

        user_prompt = (
            f"You are {self.name}.\n"
            f"Your task is to produce the following outputs: {self.outputs}.\n"
            f"Here is the current shared state:\n\n{bb.snapshot()}\n\n"
            f"Now do your job and return your result clearly."
        )

        print(f"[{self.name}] RUNNING...")
        result = self.llm.call(self.system_prompt, user_prompt)

        for out_key in self.outputs:
            bb.write(out_key, result, self.name)

        print(f"[{self.name}] DONE -> wrote to {self.outputs}")
        return True


# ---------------------------------------------------------------------------
# 4. The Kitchen (orchestrator)
# ---------------------------------------------------------------------------

class Kitchen:
    def __init__(self, blackboard: Blackboard, cooks: List[Cook]):
        self.bb = blackboard
        self.cooks = cooks

    def run(self, max_rounds: int = 10):
        for round_num in range(1, max_rounds + 1):
            print(f"\n{'='*50}")
            print(f"ROUND {round_num}")
            print(f"{'='*50}")

            any_ran = False
            for cook in self.cooks:
                ran = cook.run(self.bb)
                if ran:
                    any_ran = True

            if not any_ran:
                print("\n[No cook needs to run. System converged. Stopping.]")
                break

        print(f"\n{'='*50}")
        print("FINAL BLACKBOARD STATE")
        print(f"{'='*50}")
        print(self.bb.snapshot())
        print(f"\n{'='*50}")
        print("ACTIVITY LOG")
        print(f"{'='*50}")
        print(self.bb.history())


# ---------------------------------------------------------------------------
# 5. Audit Independence Contrarian Pipeline
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    bb = Blackboard()

    # Read Ollama Cloud API key from file
    API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
    with open(API_KEY_PATH, "r", encoding="utf-8") as f:
        api_key = f.readline().strip()

    llm = OllamaLLM(api_key=api_key, model="glm-5.2:cloud")
    # llm = MockLLM()  # Uncomment for fast local testing

    # Seed the blackboard with the user request
    bb.write(
        "user_request",
        "Write a contrarian, evidence-based opinion piece arguing that true audit independence is structurally impossible under the current client-pays model. Reference Enron, Wirecard, SVB, and the PCAOB. Challenge the conventional wisdom that more regulation fixes the problem.",
        "User"
    )

    cooks = [
        Cook(
            name="HistorianCook",
            system_prompt=(
                "You are a financial regulation historian with deep knowledge of audit failures and regulatory responses. "
                "Your job is to provide a concise, factual summary of the key historical milestones and failures in audit independence. "
                "Focus on: (1) Enron/Arthur Anderson, (2) the creation of PCAOB and SOX, (3) Wirecard, (4) Silicon Valley Bank, "
                "(5) any pattern showing that regulatory responses failed to prevent subsequent failures. "
                "Be specific. Cite mechanisms, not just dates."
            ),
            llm=llm,
            inputs=["user_request"],
            outputs=["historical_context"],
        ),
        Cook(
            name="EconomistCook",
            system_prompt=(
                "You are an economist specializing in industrial organization and principal-agent problems. "
                "Your job is to analyze why the client-pays model for audit services creates inherent, inescapable conflicts of interest. "
                "Explain the economic incentives: why auditors are selected by management, not shareholders; why audit firms compete on price and non-audit services; "
                "why rotating auditors or mandatory retendering doesn't solve the fundamental incentive misalignment. "
                "Use the historical context provided on the blackboard. Be rigorous but accessible."
            ),
            llm=llm,
            inputs=["user_request", "historical_context"],
            outputs=["economic_analysis"],
        ),
        Cook(
            name="ContrarianCook",
            system_prompt=(
                "You are a contrarian financial journalist. You challenge mainstream narratives with evidence-based provocation. "
                "Your job is to craft the core thesis: audit independence is a convenient myth that regulators, auditors, and boards pretend to believe. "
                "Use the historical context and economic analysis on the blackboard to build a sharp, coherent argument. "
                "Do not hedge. Make bold claims, but ground them in the evidence already gathered. "
                "Address the counter-argument (that regulation helps) and dismantle it."
            ),
            llm=llm,
            inputs=["historical_context", "economic_analysis"],
            outputs=["contrarian_thesis"],
        ),
        Cook(
            name="EditorCook",
            system_prompt=(
                "You are a ruthless, top-tier opinion editor at a major financial publication. "
                "Your job is to take the contrarian thesis and turn it into a polished, gripping 800-word opinion piece. "
                "Maintain the provocative edge, but ensure every paragraph flows logically. "
                "Use the historical evidence and economic reasoning from the blackboard to support the argument. "
                "End with a memorable, thought-provoking conclusion. Do not soften the contrarian stance."
            ),
            llm=llm,
            inputs=["contrarian_thesis", "historical_context", "economic_analysis"],
            outputs=["final_article"],
        ),
    ]

    kitchen = Kitchen(bb, cooks)
    kitchen.run()

    print(f"\n{'='*50}")
    print("FINAL ARTICLE")
    print(f"{'='*50}")
    print(bb.read("final_article", "[No final article produced]"))
