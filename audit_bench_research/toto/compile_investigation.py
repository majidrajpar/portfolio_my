"""
Compile the deep investigation report into a professional PDF.
"""

import sys
from pathlib import Path
import subprocess

sys.path.insert(0, str(Path(__file__).parent))
from pdf_latex import make_header, make_title_page, DOC_FOOTER, process_multiline, _process_inline

BASE_DIR = Path("internal_audit_engagement")
XELATEX = r"C:\Users\sorat\AppData\Local\Programs\MiKTeX\miktex\bin\x64\xelatex.exe"

# Read the investigation report
report_text = (BASE_DIR / "4_Reports" / "deep_investigation_report.txt").read_text(encoding="utf-8")

# Split into sections
sections = {}
current_section = None
current_content = []

for line in report_text.split('\n'):
    stripped = line.strip()
    if stripped in ['EXECUTIVE SUMMARY', 'BACKGROUND', 'PRIMARY FINDING: STRUCTURAL FAILURE OF THE GROUND TRUTH LOOP', 'SECONDARY FINDINGS: COMPOUNDING FACTORS', 'ROOT CAUSE ANALYSIS: WHY THE LLM FAILED TO SELF-CORRECT', 'EVIDENCE', 'RECOMMENDATIONS', 'CONCLUSION']:
        if current_section:
            sections[current_section] = '\n'.join(current_content)
        current_section = stripped
        current_content = []
    elif current_section:
        current_content.append(line)

if current_section:
    sections[current_section] = '\n'.join(current_content)

# Build PDF
header = make_header("Investigation Report", "2026-07-06")
body = make_title_page(
    "INDEPENDENT INVESTIGATION REPORT",
    "Structural Failure of LLM Self-Correction in Agentic Document Generation Systems",
    {"Date": "2026-07-06", "Report Number": "INV-2026-02", "Prepared By": "glm-5.2 (Independent Reviewer)", "Classification": "CONFIDENTIAL"}
) + r"\newpage" + "\n\n"

body += r"\section{Executive Summary}" + "\n\n"
body += process_multiline(sections.get('EXECUTIVE SUMMARY', 'Not available')) + "\n\n"

body += r"\section{Background}" + "\n\n"
body += process_multiline(sections.get('BACKGROUND', 'Not available')) + "\n\n"

body += r"\section{Primary Finding}" + "\n\n"
body += r"\textbf{Severity Rating: CRITICAL}" + r"\\" + "\n\n"
body += process_multiline(sections.get('PRIMARY FINDING: STRUCTURAL FAILURE OF THE GROUND TRUTH LOOP', 'Not available')) + "\n\n"

body += r"\section{Secondary Findings}" + "\n\n"
body += process_multiline(sections.get('SECONDARY FINDINGS: COMPOUNDING FACTORS', 'Not available')) + "\n\n"

body += r"\section{Root Cause Analysis}" + "\n\n"
body += process_multiline(sections.get('ROOT CAUSE ANALYSIS: WHY THE LLM FAILED TO SELF-CORRECT', 'Not available')) + "\n\n"

body += r"\section{Evidence}" + "\n\n"
body += process_multiline(sections.get('EVIDENCE', 'Not available')) + "\n\n"

body += r"\section{Recommendations}" + "\n\n"
body += process_multiline(sections.get('RECOMMENDATIONS', 'Not available')) + "\n\n"

body += r"\section{Conclusion}" + "\n\n"
body += process_multiline(sections.get('CONCLUSION', 'Not available')) + "\n"

tex_path = BASE_DIR / "4_Reports" / "deep_investigation_report.tex"
with open(tex_path, "w", encoding="utf-8") as f:
    f.write(header + body + "\n\n" + DOC_FOOTER)

# Compile
pdf_path = tex_path.with_suffix(".pdf")
for _ in range(2):
    subprocess.run(
        [XELATEX, "-interaction=nonstopmode", "-output-directory", str(tex_path.parent), str(tex_path)],
        capture_output=True, text=True, timeout=60,
    )

if pdf_path.exists():
    print(f"PDF generated: {pdf_path}")
    for ext in [".aux", ".log", ".out"]:
        aux = tex_path.with_suffix(ext)
        if aux.exists():
            aux.unlink()
    # Keep .tex for inspection
else:
    print("PDF generation failed")

print("\nDeep Investigation Report ready.")
