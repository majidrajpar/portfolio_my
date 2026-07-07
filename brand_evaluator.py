"""
Brand Evaluator Agent
Evaluates and rates the personal brand of Majid Mumtaz based on his live portfolio website.
Uses crawl4ai to extract website content, then sends to glm-5.2:cloud via OpenAI-compatible API.
"""

import os
import json
import asyncio
import sys
from pathlib import Path

# Load API key
API_KEY = Path(r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt").read_text().splitlines()[0].strip()
BASE_URL = "https://ollama.com/v1"
MODEL = "glm-5.2:cloud"
WEBSITE_URL = "https://majidrajpar.github.io/portfolio_my/"


async def crawl_website(url: str) -> str:
    """Extract clean markdown text from the website using crawl4ai."""
    from crawl4ai import AsyncWebCrawler
    async with AsyncWebCrawler(verbose=False) as crawler:
        result = await crawler.arun(url=url)
        return result.markdown


def evaluate_brand(website_content: str) -> dict:
    """Send website content to LLM for structured brand evaluation."""
    from openai import OpenAI

    client = OpenAI(api_key=API_KEY, base_url=BASE_URL)

    system_prompt = """You are an elite brand strategist and executive positioning expert who has evaluated personal brands for C-suite executives, partners at McKinsey/BCG, and Big 4 partners. You specialize in evaluating personal brands for senior governance, risk, and audit professionals.

You will be given the full text content of a personal portfolio website. Your job is to evaluate and rate the individual's personal brand across multiple dimensions, then provide an overall score and actionable recommendations.

Rate each dimension on a scale of 1-10, where:
- 9-10: World-class, top decile
- 7-8: Strong, above average
- 5-6: Adequate, middle of pack
- 3-4: Weak, needs work
- 1-2: Poor, damaging

Return your evaluation as a JSON object with this exact structure:
{
  "executive_summary": "2-3 sentence overall assessment",
  "dimensions": [
    {
      "name": "dimension name",
      "score": numeric,
      "evidence": "specific quote or reference from the website",
      "strengths": ["strength 1", "strength 2"],
      "weaknesses": ["weakness 1", "weakness 2"],
      "recommendation": "one actionable recommendation"
    }
  ],
  "overall_score": numeric,
  "positioning_statement": "the implicit positioning you read from the site",
  "target_audience_fit": "who this brand attracts vs who it repels",
  "top_3_recommendations": ["rec 1", "rec 2", "rec 3"]
}

Evaluate these 6 dimensions:
1. Value Proposition Clarity - Is it immediately clear what he does, for whom, and why it matters?
2. Credibility & Proof - Does the site substantiate claims with evidence, metrics, and third-party validation?
3. Differentiation - Does the brand stand out from other audit directors, or blend in?
4. Tone & Voice - Is the language calibrated for the target audience? Too salesy? Too timid? Just right?
5. Visual & Structural Presentation - How well does the site structure guide the reader through the narrative?
6. Thought Leadership - Is there evidence of original thinking, publications, and intellectual depth?

Be rigorous and honest. Do not inflate scores. A 7 is a good score. Only give 9+ to genuinely world-class work."""

    user_prompt = f"""Evaluate the personal brand of Majid Mumtaz based on the following website content.

Context: Majid is an Audit Director with 21 years of experience in the GCC (UAE/Saudi Arabia), targeting conglomerate/f&b/retail/real-estate audit leadership roles and consulting engagements. He holds CIA, ACA, FCCA credentials.

WEBSITE CONTENT:
{website_content[:15000]}

Return ONLY the JSON evaluation. No preamble, no postamble."""

    response = client.chat.completions.create(
        model=MODEL,
        messages=[
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt},
        ],
        temperature=0.4,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code fences if present
    if raw.startswith("```"):
        raw = raw.split("```")[1]
        if raw.startswith("json"):
            raw = raw[4:]
        raw = raw.strip()
    if raw.endswith("```"):
        raw = raw.rsplit("```", 1)[0].strip()

    return json.loads(raw)


def render_report(eval_data: dict) -> str:
    """Render the evaluation as a readable report."""
    lines = []
    lines.append("=" * 80)
    lines.append("  BRAND EVALUATION REPORT — Majid Mumtaz")
    lines.append("  Website: https://majidrajpar.github.io/portfolio_my/")
    lines.append("=" * 80)
    lines.append("")
    lines.append(f"OVERALL SCORE: {eval_data.get('overall_score', 'N/A')}/10")
    lines.append("")
    lines.append("EXECUTIVE SUMMARY:")
    lines.append(f"  {eval_data.get('executive_summary', 'N/A')}")
    lines.append("")
    lines.append(f"POSITIONING READ: {eval_data.get('positioning_statement', 'N/A')}")
    lines.append("")
    lines.append(f"TARGET AUDIENCE FIT: {eval_data.get('target_audience_fit', 'N/A')}")
    lines.append("")
    lines.append("-" * 80)
    lines.append("DIMENSION BREAKDOWN")
    lines.append("-" * 80)

    for dim in eval_data.get("dimensions", []):
        lines.append("")
        lines.append(f"  {dim['name']}: {dim['score']}/10")
        lines.append(f"  Evidence: {dim.get('evidence', 'N/A')}")
        lines.append(f"  Strengths:")
        for s in dim.get("strengths", []):
            lines.append(f"    + {s}")
        lines.append(f"  Weaknesses:")
        for w in dim.get("weaknesses", []):
            lines.append(f"    - {w}")
        lines.append(f"  Recommendation: {dim.get('recommendation', 'N/A')}")

    lines.append("")
    lines.append("-" * 80)
    lines.append("TOP 3 RECOMMENDATIONS")
    lines.append("-" * 80)
    for i, rec in enumerate(eval_data.get("top_3_recommendations", []), 1):
        lines.append(f"  {i}. {rec}")

    lines.append("")
    lines.append("=" * 80)
    lines.append("  End of Report")
    lines.append("=" * 80)

    return "\n".join(lines)


async def main():
    print(f"Fetching website content from: {WEBSITE_URL}")
    content = await crawl_website(WEBSITE_URL)
    print(f"Extracted {len(content)} characters of website content.\n")

    print("Sending to brand evaluator agent (glm-5.2:cloud)...")
    print("Evaluating across 6 dimensions: Value Prop, Credibility, Differentiation, Tone, Presentation, Thought Leadership...\n")

    eval_data = evaluate_brand(content)

    report = render_report(eval_data)
    print(report)

    # Save report
    out_path = Path(__file__).parent / "brand_evaluation_report.txt"
    out_path.write_text(report, encoding="utf-8")
    print(f"\nReport saved to: {out_path}")

    # Save raw JSON
    json_path = Path(__file__).parent / "brand_evaluation.json"
    json_path.write_text(json.dumps(eval_data, indent=2), encoding="utf-8")
    print(f"Raw JSON saved to: {json_path}")


if __name__ == "__main__":
    asyncio.run(main())