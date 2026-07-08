"""
DEEP INVESTIGATION: Why Did the LLM Agent Fail to Self-Correct?
Not a surface-level bug report. An analysis of the structural failure mode.
"""

import sys
from pathlib import Path
import openai

API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
with open(API_KEY_PATH, "r", encoding="utf-8") as f:
    API_KEY = f.readline().strip()

client = openai.OpenAI(api_key=API_KEY, base_url="https://ollama.com/v1")

EVIDENCE = """
INVESTIGATION BRIEFING: Structural Failure of LLM Self-Correction
Session Date: 2026-07-06
System Under Review: Agentic Internal Audit Document Generator

THE SURFACE-LEVEL EVENTS:
1. User requested professional PDFs for an internal audit engagement
2. The agent (powered by deepseek-v4-pro / kimi-k2.6) built a pipeline:
   - Generate markdown content
   - Convert to LaTeX
   - Compile with XeLaTeX
3. The agent encountered failures and attempted fixes
4. Despite ~15 iterations, the agent struggled with basic formatting

THE REAL QUESTION:
Why did the LLM — a system capable of writing correct LaTeX and Python —
fail to fix its own output in real-time?

THE STRUCTURAL FAILURE MODES DISCOVERED:

FAILURE MODE A: The Verification Gap
The LLM wrote code that generated .tex files, but the LLM never READ the
actual .tex files back. It could not inspect the generated LaTeX source.
Every "fix" was speculative. The LLM wrote code, ran it, saw the error,
but the error message was abstract ("ValueError: unsupported format character")
while the actual cause was in the generated file the LLM couldn't see.

Example: The LLM wrote:
    DOC_HEADER = r"...{doc_type}..."
    header = DOC_HEADER % {"doc_type": "Planning"}

The LLM saw the ValueError and "fixed" it by changing to .format().
Then .format() also failed because {article} is in the LaTeX string.
Then .replace() was attempted but missed instances.
The LLM spent 7 iterations on this single line because it couldn't SEE
the generated .tex to understand the actual collision.

FAILURE MODE B: The Compounding Fix
The LLM's fixes often broke other things. When the LLM switched from
fpdf2 to LaTeX, it didn't redesign the text processing pipeline — it
patched it. Each patch created a new edge case.

Example: Adding markdown-to-LaTeX bold conversion (** → \textbf{}).
The LLM added this AFTER escaping. So \textbf became \textbackslash{}textbf.
The LLM then added a "placeholder" system to protect commands during escaping.
The placeholder (__PH0__) contained underscores, which ALSO got escaped.
Three layers of patches to fix one root cause.

FAILURE MODE C: Tool Blindness
The agent had access to file tools, but they were used reactively (write, run)
rather than diagnostically (read generated content, inspect actual output).
The agent never opened a generated .tex file to see what was wrong.
It relied on error messages from xelatex, which are cryptic and indirect.

FAILURE MODE D: The Confidence Trap
The LLM generated fixes with high confidence. Each fix SOUNDED correct:
"I'll use .replace() with markers instead of .format()"
But the LLM couldn't verify the markers were unique, that all instances
were replaced, or that the resulting LaTeX was valid.

FAILURE MODE E: No Ground Truth Loop
A human developer would:
1. Write code
2. Run it
3. Open the generated .tex
4. See the literal output
5. Understand the mismatch
6. Fix root cause

The LLM loop was:
1. Write code
2. Run it
3. See error summary
4. Guess at cause
5. Apply patch
6. Repeat

The LLM never closed the ground truth loop. It was debugging in the dark.

THE META-QUESTION FOR THE INVESTIGATION:
Is this a fundamental limitation of LLM agents? Or was it a failure
of the agent architecture (not giving the LLM read access to generated
artifacts)?

EVIDENCE OF CORRECT FIX:
When the human user intervened and explicitly described the problem
("escape_tex destroys \textbf because it runs after conversion"),
the fix was implemented correctly in ONE step.
This suggests the LLM CAN reason correctly when given the right information,
but CANNOT discover that information from error messages alone.

CONCLUSION FOR INVESTIGATOR:
The primary finding is not "LaTeX is hard" or "the code had bugs".
The primary finding is: **An agent that writes files but cannot read
its own generated files is structurally incapable of self-correction
for formatting and encoding issues.**

RECOMMENDED FRAMEWORK:
1. Every code generation agent MUST have a "readback" step
2. After generating files, the agent MUST open and inspect them
3. The agent MUST compare intended output vs actual output
4. Fixes should target root causes, not symptoms
5. The LLM should be explicitly prompted: "Before proposing a fix,
   read the generated file and identify the exact line causing the error"

This is the investigation. Produce a formal report.
"""

system = """You are an independent Internal Audit Investigator with deep expertise in software engineering failure analysis.
You specialize in root cause analysis of system-level failures, not surface bugs.
Your tone is clinical, objective, and unsparing.
You identify structural and architectural failures, not just implementation errors.
"""

prompt = f"""Review the following investigation evidence and prepare a formal Investigation Report.

EVIDENCE:
{EVIDENCE}

REQUIREMENTS:
1. Write as a formal INTERNAL AUDIT INVESTIGATION REPORT
2. Title: "Independent Investigation: Structural Failure of LLM Self-Correction in Agentic Document Generation Systems"
3. Include:
   - Executive Summary (the one-sentence conclusion)
   - Background (what the system was supposed to do)
   - Primary Finding (the structural failure mode)
   - Secondary Findings (the compounding factors)
   - Root Cause Analysis (WHY the LLM couldn't fix it)
   - Evidence (specific examples from the session)
   - Recommendations (architecture-level, not just "test more")
   - Conclusion
4. Rate the PRIMARY finding as Critical
5. Be specific: name the exact files, errors, and iteration counts
6. The report must answer: "Why did the LLM fail to self-correct?"
7. Output clean text. Use clear section labels. No markdown # headers.
"""

print("="*70)
print("DEEP INVESTIGATION REPORT")
print("Asking glm-5.2 to analyze structural failure of self-correction...")
print("="*70)
print()

resp = client.chat.completions.create(
    model="glm-5.2:cloud",
    messages=[
        {"role": "system", "content": system},
        {"role": "user", "content": prompt}
    ],
    max_tokens=8192,
    timeout=180,
)

report = resp.choices[0].message.content
print(f"Received {len(report)} chars")

# Save report
report_path = Path("internal_audit_engagement/4_Reports/deep_investigation_report.txt")
report_path.parent.mkdir(parents=True, exist_ok=True)
report_path.write_text(report, encoding="utf-8")

print(f"\nReport saved to: {report_path}")
print("\n" + "="*70)
print("REPORT PREVIEW (first 3000 chars):")
print("="*70)
print(report[:3000])
print("\n... [truncated for display] ...")
