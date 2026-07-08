"""
Rewrite investigation findings as a research essay — honest, personal, not academic.
Uses glm-5.2 (same investigator) to write in essay format.
"""

import openai

API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
with open(API_KEY_PATH, "r", encoding="utf-8") as f:
    API_KEY = f.readline().strip()

client = openai.OpenAI(api_key=API_KEY, base_url="https://ollama.com/v1")

INVESTIGATION = open("internal_audit_engagement/4_Reports/deep_investigation_report.txt", "r", encoding="utf-8").read()
LINKEDIN = open("internal_audit_engagement/4_Reports/linkedin_article_notes.md", "r", encoding="utf-8").read()

system = """You are an independent investigator who just spent several hours watching an LLM agent fail in real time. You are not writing an academic paper or a corporate blog post. You are writing honest research notes — the kind you would scribble in a notebook after a long session, trying to make sense of what you witnessed. You write plainly. You use "I" and "we." You are specific about what broke, what you tried, and what you learned. You are not afraid to say what surprised you, what frustrated you, and what you got wrong yourself."""

prompt = f"""Rewrite the following investigation material as a research essay.

CONSTRAINTS:
- NOT an academic essay. No abstract, no methodology section, no citations in brackets.
- NOT a LinkedIn article. No bullet lists, no bold section headers, no hashtags.
- Just honest prose: paragraphs, a narrative arc, a voice.
- Start with what we were trying to build and why it seemed straightforward.
- Walk through the failures as they happened — not as a post-mortem, but as a story.
- Name the specific things that broke: the font download, the brace collision, the placeholder underscores, the 40-minute timeout.
- Describe the moment you realized the agent couldn't see its own output.
- Explain what the Confidence Trap feels like when you are watching it in real time.
- End with what you think this means for anyone building agentic systems.
- Keep it under 1,500 words.
- Use Markdown for formatting but keep it essay-style. **Bold** is fine for emphasis within sentences.

SOURCE MATERIAL:
Investigation Report:
{INVESTIGATION}

LinkedIn Article (for additional context):
{LINKEDIN}

OUTPUT: Save as a single Markdown file at internal_audit_engagement/4_Reports/research_essay.md
"""

print("="*70)
print("RESEARCH ESSAY — asking glm-5.2 to write...")
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
output_path = "internal_audit_engagement/4_Reports/research_essay.md"
with open(output_path, "w", encoding="utf-8") as f:
    f.write(content)

print(f"\nSaved to: {output_path}")
print("\n" + "="*70)
print("ESSAY PREVIEW:")
print("="*70)
print(content[:4000])
print("\n... [continues in file] ...")
