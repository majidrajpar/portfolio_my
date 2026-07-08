"""
Shared Blackboard Pattern - A minimal multi-agent orchestrator.
No heavy frameworks. Just clean Python showing how agents share state.

KEY MECHANIC: Reactive execution via input digests.
A cook only re-runs if its INPUTS have changed since it last ran.
This prevents infinite re-execution and turns the system into a dataflow graph.
"""

from typing import Dict, List, Callable, Optional, Any
from dataclasses import dataclass, field
import json
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
    """
    Abstracts the LLM call. Swap this out for OpenAI, Claude, local Ollama, etc.
    """
    def call(self, system_prompt: str, user_prompt: str) -> str:
        raise NotImplementedError


class MockLLM(LLMProvider):
    """
    A fake LLM for testing the blackboard mechanics without API keys or latency.
    It returns deterministic, somewhat useful responses based on keywords.
    """
    def call(self, system_prompt: str, user_prompt: str) -> str:
        user_lower = user_prompt.lower()

        # Research cook mock
        if "research" in system_prompt.lower() or "fact" in user_lower:
            return (
                "Key facts:\n"
                "- The topic originated in the early 2000s.\n"
                "- It has grown 300% in the last 5 years.\n"
                "- Major players include AlphaCorp and BetaSys.\n"
                "- Common criticism: lacks standardization."
            )

        # Outline cook mock
        if "outline" in system_prompt.lower() or "structure" in user_lower:
            return (
                "1. Introduction and history\n"
                "2. Current market landscape\n"
                "3. Key players and their strategies\n"
                "4. Criticisms and challenges\n"
                "5. Future outlook"
            )

        # Writer cook mock
        if "writer" in system_prompt.lower() or "draft" in user_lower:
            return (
                "## Introduction and History\n\n"
                "Since the early 2000s, this domain has transformed from a niche concept...\n\n"
                "## Current Market Landscape\n\n"
                "The field has seen explosive growth, expanding by over 300% in recent years...\n\n"
                "## Key Players\n\n"
                "AlphaCorp leads with innovation, while BetaSys dominates enterprise adoption..."
            )

        # Editor cook mock
        if "editor" in system_prompt.lower() or "critique" in user_lower:
            return (
                "Critique:\n"
                "- The draft is solid but lacks specific data citations.\n"
                "- The tone is slightly too promotional in section 3.\n"
                "- Suggestion: add a 'Conclusion' section for closure.\n\n"
                "Revised Draft:\n"
                "[Same structure but with tighter prose and added transition sentences.]"
            )

        # Fallback
        return f"[MockLLM processed prompt about: {user_prompt[:50]}...]"


class OllamaLLM(LLMProvider):
    """
    Ollama Cloud adapter using the OpenAI-compatible endpoint.
    Uses the remote Ollama Cloud infrastructure (e.g. glm-5.2:cloud).
    NOTE: glm-5.2:cloud is a reasoning model. It requires a large max_tokens
    because it consumes tokens on internal reasoning before producing output.
    """
    def __init__(self, api_key: str, model: str = "glm-5.2:cloud", base_url: str = "https://ollama.com/v1"):
        import openai
        self.client = openai.OpenAI(api_key=api_key, base_url=base_url)
        self.model = model

    def call(self, system_prompt: str, user_prompt: str) -> str:
        print(f"  [OllamaLLM] Calling {self.model} (reasoning model, please wait)...")
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


class OpenAILLM(LLMProvider):
    """
    Standard OpenAI adapter. Set your API key in the environment.
    """
    def __init__(self, model: str = "gpt-4o-mini"):
        import os
        import openai
        self.client = openai.OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
        self.model = model

    def call(self, system_prompt: str, user_prompt: str) -> str:
        response = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt}
            ],
            temperature=0.7,
        )
        return response.choices[0].message.content


# ---------------------------------------------------------------------------
# 3. The Cook (agent)
# ---------------------------------------------------------------------------

class Cook:
    def __init__(
        self,
        name: str,
        system_prompt: str,
        llm: LLMProvider,
        inputs: List[str],      # keys to read from blackboard
        outputs: List[str],     # keys to write to blackboard
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
        """
        A cook can run only if:
        1. All required inputs exist
        2. The custom condition passes
        3. Its inputs have changed since it last ran (reactive execution)
        """
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
        """
        Execute the cook. Reads inputs, calls LLM, writes outputs.
        Returns True if it ran, False if skipped.
        """
        if not self.can_run(bb):
            print(f"[{self.name}] SKIPPED (already up to date)")
            return False

        # Mark inputs as consumed BEFORE the LLM call
        # (So that even if the LLM fails, we don't retry infinitely on the same inputs)
        self._last_input_digest = self._current_digest(bb)

        # Build the prompt from blackboard state
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
        """
        Run cooks in rounds. Each cook gets a chance if its inputs are ready.
        Stops when no cook can run or max rounds reached.
        """
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
# 5. Example Usage
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # --- Setup ---
    bb = Blackboard()

    # Read Ollama Cloud API key from file
    API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
    with open(API_KEY_PATH, "r", encoding="utf-8") as f:
        api_key = f.readline().strip()

    llm = OllamaLLM(api_key=api_key, model="glm-5.2:cloud")
    # llm = MockLLM()  # Use this for fast local testing without API calls

    # --- Seed the blackboard with the initial user request ---
    bb.write("user_request", "Write a short article about swarm intelligence in AI.", "User")

    # --- Define the cooks ---
    cooks = [
        Cook(
            name="ResearchCook",
            system_prompt="You are a research assistant. Gather key facts and data points.",
            llm=llm,
            inputs=["user_request"],
            outputs=["research_notes"],
        ),
        Cook(
            name="OutlineCook",
            system_prompt="You are an outline specialist. Create a clear article structure.",
            llm=llm,
            inputs=["research_notes"],
            outputs=["outline"],
        ),
        Cook(
            name="WriterCook",
            system_prompt="You are a writer. Draft article content based on the outline and research.",
            llm=llm,
            inputs=["outline", "research_notes"],
            outputs=["draft"],
        ),
        Cook(
            name="EditorCook",
            system_prompt="You are an editor. Critique the draft and produce a polished revision.",
            llm=llm,
            inputs=["draft"],
            outputs=["critique", "final_article"],
        ),
    ]

    # --- Run the kitchen ---
    kitchen = Kitchen(bb, cooks)
    kitchen.run()

    # --- Access results programmatically ---
    print(f"\n{'='*50}")
    print("FINAL ARTICLE")
    print(f"{'='*50}")
    print(bb.read("final_article", "[No final article produced]"))
