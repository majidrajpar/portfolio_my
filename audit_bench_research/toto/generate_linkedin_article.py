"""
Generate LinkedIn article notes from the investigation report.
Uses glm-5.2 (the same model that wrote the investigation) to produce publication-ready content.
"""

import openai

API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
with open(API_KEY_PATH, "r", encoding="utf-8") as f:
    API_KEY = f.readline().strip()

client = openai.OpenAI(api_key=API_KEY, base_url="https://ollama.com/v1")

# Read the investigation report as source material
INVESTIGATION = open("internal_audit_engagement/4_Reports/deep_investigation_report.txt", "r", encoding="utf-8").read()

system = """You are an independent technology auditor and systems analyst who has just completed a formal investigation into an LLM agent development session. You are now writing LinkedIn article notes based on your findings. Your tone is professional but accessible to a technical leadership audience. You speak with authority but avoid jargon where possible. You make specific, actionable recommendations."""

prompt = f"""You are the investigator who wrote the following report. Now prepare notes for a LinkedIn article based on your findings.

YOUR INVESTIGATION REPORT:
{INVESTIGATION}

ARTICLE REQUIREMENTS:
1. Headline: Something provocative but professional about why LLM agents fail to self-correct
2. Opening hook: A relatable story from the session (the 7 iterations on one line of code)
3. The Problem: Explain the "Verification Gap" in plain terms
4. The Evidence: Specific numbers (15 iterations, 3 layers of patches, 40-minute timeouts)
5. The Limitations of the Operating Environment:
   - Why the agent couldn't read its own files
   - Why error messages weren't enough
   - Why the LLM was confident but wrong, repeatedly
6. What to Avoid:
   - Don't let agents write files they can't inspect
   - Don't equate "error resolved" with "root cause fixed"
   - Don't let LLMs patch symptoms — force root cause redesign
7. How to Address It for Future:
   - Architectural requirements for agentic systems
   - The "readback protocol" every agent should have
   - Why ground truth access is non-negotiable
   - How to structure human-in-the-loop checkpoints
8. Closing thought: A one-sentence takeaway for engineering leaders and founders

FORMAT: Clean Markdown. No emojis. Use **bold** for emphasis, bullet lists for readability. Keep paragraphs short (2-3 sentences max) for LinkedIn scanning. Include a suggested hashtag block at the end.

The article should feel like it was written by someone who was IN the room during the failure, not someone theorizing from afar.
"""

print("="*70)
print("LINKEDIN ARTICLE NOTES — asking glm-5.2 to draft...")
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

content = resp.choices[0].message.content
print(f"Received {len(content)} chars")

# Save
output_path = "internal_audit_engagement/4_Reports/linkedin_article_notes.md"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nSaved to: {output_path}")
print("\n" + "="*70)
print("ARTICLE PREVIEW:")
print("="*70)
print(content[:4000])
print("\n... [continues in file] ...")
