"""
Internal Audit Agent System v4 — with REAL Quality Gate Director.
The Director reads actual document files, checks formatting, and rejects with specifics.
"""

import sys
from pathlib import Path
import json
import re

sys.path.insert(0, str(Path(__file__).parent))

from pdf_latex import (
    gen_planning_memo, gen_engagement_letter, gen_risk_matrix,
    gen_working_paper, gen_findings_register, gen_audit_report, gen_follow_up_tracker,
    cleanup_tex
)

import openai

# ---------------------------------------------------------------------------
# Config
# ---------------------------------------------------------------------------
API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
with open(API_KEY_PATH, "r", encoding="utf-8") as f:
    API_KEY = f.readline().strip()

BASE_DIR = Path("internal_audit_engagement")
MODELS_TO_TRY = ["deepseek-v4-pro", "kimi-k2.6:cloud", "glm-5.2:cloud"]


# ---------------------------------------------------------------------------
# LLM Client
# ---------------------------------------------------------------------------

def try_api_call(prompt: str, system: str = "", max_tokens: int = 4096, timeout: int = 90) -> str:
    client = openai.OpenAI(api_key=API_KEY, base_url="https://ollama.com/v1")
    for model in MODELS_TO_TRY:
        try:
            import time
            start = time.time()
            print(f"  [API] Trying {model}...")
            resp = client.chat.completions.create(
                model=model,
                messages=[
                    {"role": "system", "content": system},
                    {"role": "user", "content": prompt}
                ],
                max_tokens=max_tokens,
                timeout=timeout,
            )
            elapsed = time.time() - start
            content = resp.choices[0].message.content
            if content and len(content.strip()) > 100:
                print(f"  [API] SUCCESS: {model} in {elapsed:.1f}s ({len(content)} chars)")
                return content
            print(f"  [API] Empty response from {model}")
        except Exception as e:
            print(f"  [API] FAIL {model}: {type(e).__name__}")
            continue
    print("  [API] All models failed. Using built-in content.")
    return ""


# ---------------------------------------------------------------------------
# Quality Gate — The REAL Audit Director
# ---------------------------------------------------------------------------

class AuditDirector:
    """
    The Audit Director reads actual generated documents and enforces quality.
    It does NOT just call an LLM with 'APPROVE or REJECT'. It:
    1. Scans .tex source for formatting artifacts (###, broken commands)
    2. Verifies PDF exists and has content
    3. Checks document structure
    4. Rejects with specific, actionable revision notes
    """

    def __init__(self):
        self.issues = []

    def scan_tex_source(self, tex_path: Path) -> list:
        """Read .tex file and find formatting issues."""
        issues = []
        if not tex_path.exists():
            issues.append(f"TEX_MISSING: {tex_path.name} does not exist")
            return issues

        content = tex_path.read_text(encoding='utf-8')

        # Check for raw markdown headers
        if re.search(r'#{2,6}\s+\w', content):
            issues.append("RAW_MARKDOWN_HEADER: Found '### Text' in LaTeX source")

        # Check for broken LaTeX commands (escaped backslashes in commands)
        if r'\textbackslash{}textbf' in content or r'\textbackslash{}textit' in content:
            issues.append("BROKEN_COMMAND: \\textbf or \\textit was escaped by mistake")

        # Check for double-escaped braces
        if r'\\{\\{' in content or r'\\}\\}' in content:
            issues.append("DOUBLE_ESCAPE: Braces are double-escaped")

        # Check for empty sections
        empty_sections = re.findall(r'\\section\{([^}]+)\}\s*\\section', content, re.DOTALL)
        if empty_sections:
            issues.append(f"EMPTY_SECTIONS: Found empty sections after: {empty_sections}")

        # Check for unclosed environments
        open_envs = len(re.findall(r'\\begin\{(\w+)\}', content))
        close_envs = len(re.findall(r'\\end\{(\w+)\}', content))
        if open_envs != close_envs:
            issues.append(f"UNBALANCED_ENV: {open_envs} opens, {close_envs} closes")

        # Check for literal markdown bullets
        if re.search(r'\n\s*-\s+\w', content):
            issues.append("RAW_MARKDOWN_BULLET: Found '- item' instead of \\item")

        # Check for literal ** without conversion
        if re.search(r'(?<![\\])\*\*[^*]+\*\*', content):
            issues.append("UNCONVERTED_BOLD: Found **text** not converted to \\textbf")

        return issues

    def scan_pdf(self, pdf_path: Path) -> list:
        """Check PDF file validity."""
        issues = []
        if not pdf_path.exists():
            issues.append(f"PDF_MISSING: {pdf_path.name} was not generated")
            return issues
        if pdf_path.stat().st_size < 1000:
            issues.append(f"PDF_TOO_SMALL: {pdf_path.name} is only {pdf_path.stat().st_size} bytes")
        return issues

    def review_document(self, doc_type: str, tex_path: Path, pdf_path: Path) -> tuple:
        """
        Returns: (approved: bool, notes: str)
        If not approved, notes contain specific revision instructions.
        """
        print(f"\n[DIRECTOR] Reviewing {doc_type}...")
        print(f"  [DIRECTOR] Checking {tex_path.name}...")
        print(f"  [DIRECTOR] Checking {pdf_path.name}...")

        issues = []
        issues.extend(self.scan_tex_source(tex_path))
        issues.extend(self.scan_pdf(pdf_path))

        if not issues:
            print(f"  [DIRECTOR] {doc_type}: APPROVED (no issues found)")
            return True, "Approved. Document meets quality standards."

        print(f"  [DIRECTOR] {doc_type}: REJECTED ({len(issues)} issues)")
        for issue in issues:
            print(f"    - {issue}")

        # Build specific revision notes
        notes = f"REVISION REQUIRED for {doc_type}:\n"
        for issue in issues:
            if "RAW_MARKDOWN_HEADER" in issue:
                notes += "- Remove all '###' markdown headers from source text before LaTeX generation\n"
            elif "BROKEN_COMMAND" in issue:
                notes += "- Fix LaTeX command escaping: \\textbf{} and \\textit{} must not be escaped\n"
            elif "DOUBLE_ESCAPE" in issue:
                notes += "- Fix double-escaped braces: use single \\{ and \\} in LaTeX\n"
            elif "UNBALANCED_ENV" in issue:
                notes += "- Fix unbalanced LaTeX environments: missing \\begin{} or \\end{}\n"
            elif "RAW_MARKDOWN_BULLET" in issue:
                notes += "- Convert markdown bullets '- ' to \\item in itemize environment\n"
            elif "UNCONVERTED_BOLD" in issue:
                notes += "- Convert **text** to \\textbf{text} before LaTeX generation\n"
            elif "PDF_MISSING" in issue:
                notes += "- PDF was not generated. Check XeLaTeX compilation.\n"
            elif "PDF_TOO_SMALL" in issue:
                notes += "- PDF is suspiciously small. Check for compilation errors.\n"
            else:
                notes += f"- {issue}\n"

        return False, notes

    def review_stage(self, stage_name: str, documents: dict) -> bool:
        """
        Review all documents in a stage. Returns True if ALL approved.
        documents: {doc_type: (tex_path, pdf_path)}
        """
        print(f"\n{'='*50}")
        print(f"DIRECTOR REVIEW: {stage_name}")
        print(f"{'='*50}")

        all_approved = True
        for doc_type, (tex_path, pdf_path) in documents.items():
            approved, notes = self.review_document(doc_type, tex_path, pdf_path)
            if not approved:
                all_approved = False
                # Write revision notes to blackboard
                notes_file = BASE_DIR / f"{stage_name.lower().replace(' ', '_')}_revision_notes.txt"
                notes_file.write_text(notes, encoding='utf-8')
                print(f"  [DIRECTOR] Revision notes written to: {notes_file}")

        if all_approved:
            print(f"\n[DIRECTOR] {stage_name}: ALL DOCUMENTS APPROVED")
        else:
            print(f"\n[DIRECTOR] {stage_name}: REVISIONS REQUIRED")

        return all_approved


# ---------------------------------------------------------------------------
# Content Data
# ---------------------------------------------------------------------------

BUILTIN_RISKS = [
    {"area": "Inventory Management", "inherent": "High", "control": "Medium", "residual": "Medium-High", "priority": "High",
     "description": "Risk of inventory shrinkage, spoilage, and inaccurate stock records due to manual processes and lack of cycle counting.",
     "mitigation": "Implement automated inventory tracking with barcode scanning. Establish weekly cycle counting program. Segregate inventory recording from physical handling."},
    {"area": "Food Safety / HACCP", "inherent": "High", "control": "Medium", "residual": "Medium-High", "priority": "High",
     "description": "Risk of food safety incidents, regulatory non-compliance, and product recalls due to inadequate temperature controls and lack of automated alerts.",
     "mitigation": "Install continuous automated temperature monitoring with SMS/email alerts. Update HACCP plan with alert protocols. Quarterly calibration."},
    {"area": "Receiving / Shipping Accuracy", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Medium",
     "description": "Risk of inaccurate GRN recording, dispatch errors, and customer complaints due to reliance on supplier packing slips rather than physical counts.",
     "mitigation": "Mandate physical count verification for all incoming goods. Implement three-way match (PO/GRN/Invoice) before payment approval."},
    {"area": "Waste Tracking", "inherent": "Medium", "control": "Low", "residual": "Medium-High", "priority": "Medium",
     "description": "Risk of excessive waste, inaccurate spoilage reporting, and financial loss due to lack of standardized categorization and trend analysis.",
     "mitigation": "Implement waste categorization by reason code. Conduct monthly spoilage review meetings. Set waste reduction KPIs by category."},
    {"area": "Warehouse Security", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Medium",
     "description": "Risk of unauthorized access, theft, and product tampering due to CCTV blind spots and inadequate access controls.",
     "mitigation": "Conduct full CCTV coverage audit. Install additional cameras to eliminate blind spots. Strengthen access controls."},
    {"area": "Supplier Compliance", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Low",
     "description": "Risk of receiving non-compliant goods from uncertified suppliers due to inadequate incoming inspection processes.",
     "mitigation": "Enforce supplier certification verification. Implement mandatory incoming goods inspection checklist."}
]

BUILTIN_FINDINGS = [
    {"ref": "F-2026-001", "area": "Inventory Management", "rating": "High",
     "title": "Inaccurate Perpetual Inventory Records", "status": "Open",
     "description": "Physical inventory counts revealed significant variances between perpetual inventory records and actual stock on hand in cold storage and dry goods areas. Root cause traced to manual data entry errors and lack of cycle counting discipline.",
     "root_cause": "Inadequate controls over inventory recording and insufficient frequency of physical counts. Staff rely on manual updates without secondary verification.",
     "recommendation": "Implement automated inventory tracking with barcode scanning. Establish weekly cycle counting program for high-value items. Segregate inventory recording from physical handling duties.",
     "management_response": "Management agrees. Will procure barcode scanning system by Q4 2026 and assign dedicated cycle count team."},
    {"ref": "F-2026-002", "area": "Food Safety / HACCP", "rating": "High",
     "title": "Temperature Monitoring Gaps in Cold Chain", "status": "Open",
     "description": "Review of 30-day temperature logs revealed 12 instances where cold storage temperatures exceeded 5C for periods exceeding 2 hours. No alerts were triggered, and corrective actions were not documented.",
     "root_cause": "Temperature monitoring system lacks automated alerting. Manual log review is performed weekly, allowing deviations to go undetected for extended periods.",
     "recommendation": "Install continuous automated temperature monitoring with SMS and email alerts. Require same-day documented corrective action for any deviation. Calibrate all monitoring devices quarterly.",
     "management_response": "Agreed. Budget approved for automated system. Will update HACCP plan to include alert protocols."},
    {"ref": "F-2026-003", "area": "Receiving / Shipping", "rating": "Medium",
     "title": "GRN Accuracy Below Target", "status": "Open",
     "description": "Sampling of 30 GRN records against supplier delivery notes showed 7 discrepancies (23.3 percent error rate), primarily in quantity received versus quantity invoiced. No formal reconciliation process exists prior to payment authorization.",
     "root_cause": "Receiving staff do not perform independent quantity verification. GRN is created based on supplier packing slip rather than physical count.",
     "recommendation": "Mandate physical count verification for all incoming goods. Implement three-way match (PO/GRN/Invoice) before payment approval. Reconcile discrepancies within 48 hours.",
     "management_response": "Will update receiving SOP and assign reconciliation clerk. Target error rate below 5 percent by year-end."},
    {"ref": "F-2026-004", "area": "Waste Tracking", "rating": "Medium",
     "title": "Inadequate Spoilage Root Cause Analysis", "status": "Open",
     "description": "Waste register shows increasing spoilage trend in dairy and produce categories over past 6 months. No systematic root cause analysis is performed. Waste is recorded but not categorized by reason (expiry, damage, temperature, etc.).",
     "root_cause": "Lack of standardized waste categorization and absence of monthly review process to identify trends and assign corrective actions.",
     "recommendation": "Implement waste categorization by reason code. Conduct monthly spoilage review meetings with operations. Set waste reduction KPIs by category and track trend monthly.",
     "management_response": "Will develop categorization framework and assign waste champion. First trend review scheduled for August 2026."},
    {"ref": "F-2026-005", "area": "Warehouse Security", "rating": "Low",
     "title": "CCTV Blind Spots in Dispatch Area", "status": "Open",
     "description": "Physical security walkthrough identified two CCTV blind spots in the dispatch bay area. Current camera coverage does not capture the full loading dock, creating risk of undetected theft or unauthorized access.",
     "root_cause": "CCTV system was designed for original warehouse layout. Expansion of dispatch area was not accompanied by camera repositioning.",
     "recommendation": "Conduct full CCTV coverage audit. Install additional cameras to eliminate blind spots. Review camera maintenance schedule to ensure all devices are operational.",
     "management_response": "Facilities will assess camera repositioning cost. Maintenance schedule to be reviewed and updated."}
]

BUILTIN_REPORT = {
    "date": "2026-07-20",
    "number": "IAR-2026-03",
    "executive_summary": "The Q3 2026 internal audit of F\u0026B Warehouse Operations identified 5 findings (2 High, 2 Medium, 1 Low priority). Significant deficiencies were noted in inventory management accuracy and food safety temperature monitoring controls. Management has agreed to all recommendations with implementation timelines through Q4 2026.",
    "scope": "The audit covered inventory management, food safety and HACCP compliance, receiving and shipping accuracy, waste tracking, and warehouse security for the period April 1, 2026 through June 30, 2026. Testing was performed in accordance with the International Standards for the Professional Practice of Internal Auditing (IIA Standards).",
    "findings_summary": "5 findings identified: 2 High, 2 Medium, 1 Low. Key concerns include inventory record accuracy, cold chain temperature monitoring, and GRN verification processes.",
    "detailed_findings": BUILTIN_FINDINGS,
    "management_response": "Management has reviewed all findings and agreed to action plans with target completion dates. Budget has been approved for the temperature monitoring system and barcode scanning implementation.",
    "overall_conclusion": "Controls are partially effective. Significant improvements required in inventory accuracy, temperature monitoring, and waste tracking. Management commitment to remediation is positive. Follow-up audit recommended for Q1 2027."
}

BUILTIN_ACTIONS = [
    {"id": "A-2026-001", "finding_ref": "F-2026-001", "description": "Implement automated inventory tracking with barcode scanning. Establish weekly cycle counting program.", "owner": "Warehouse Operations Manager", "due_date": "2026-10-20", "status": "Planned", "notes": "Budget approved. Procurement initiated."},
    {"id": "A-2026-002", "finding_ref": "F-2026-002", "description": "Install continuous automated temperature monitoring with SMS/email alerts. Update HACCP plan.", "owner": "Food Safety Manager", "due_date": "2026-09-30", "status": "Planned", "notes": "Vendor selected. Installation scheduled for August."},
    {"id": "A-2026-003", "finding_ref": "F-2026-003", "description": "Implement three-way match (PO/GRN/Invoice) and mandate physical count verification.", "owner": "Receiving Supervisor", "due_date": "2026-08-31", "status": "Planned", "notes": "SOP update in progress."},
    {"id": "A-2026-004", "finding_ref": "F-2026-004", "description": "Implement waste categorization by reason code. Conduct monthly spoilage review meetings.", "owner": "Operations Director", "due_date": "2026-09-15", "status": "Planned", "notes": "Waste champion assigned. Framework development started."},
    {"id": "A-2026-005", "finding_ref": "F-2026-005", "description": "Conduct CCTV coverage audit and install additional cameras in dispatch bay.", "owner": "Facilities Manager", "due_date": "2026-10-31", "status": "Planned", "notes": "Cost assessment scheduled."}
]

BUILTIN_PLANNING_MEMO = """INTERNAL AUDIT PLANNING MEMO

To: Audit Committee
From: Internal Audit Director
Date: July 1, 2026
Re: Q3 2026 F\u0026B Warehouse Operations Audit - Planning Memo

1. ENGAGEMENT OVERVIEW

This memorandum outlines the risk-based engagement plan for the Q3 2026 internal audit of Food and Beverage (F\u0026B) warehouse operations. The audit will assess the effectiveness of internal controls across five critical areas: inventory management, food safety and HACCP compliance, receiving and shipping accuracy, waste tracking, and warehouse security.

2. SCOPE AND OBJECTIVES

The audit scope encompasses all F\u0026B warehouse operations for the period April 1, 2026 through June 30, 2026. Primary objectives include:
- Evaluating the accuracy and completeness of inventory records
- Assessing HACCP plan implementation and food safety controls
- Testing receiving and shipping process accuracy
- Reviewing waste tracking and spoilage management
- Examining warehouse security and access controls

3. RISK ASSESSMENT

Key risk areas have been identified through preliminary analysis:
- Inventory Management (High inherent risk, medium controls)
- Food Safety / HACCP (High inherent risk, medium controls)
- Receiving / Shipping Accuracy (Medium inherent risk, medium controls)
- Waste Tracking (Medium inherent risk, low controls)
- Warehouse Security (Medium inherent risk, medium controls)

4. RESOURCE ALLOCATION

Engagement team: 3 internal auditors
Estimated fieldwork duration: 3 weeks
Planned report issuance: July 20, 2026

5. TIMELINE

Planning: July 1-5, 2026
Fieldwork: July 6-24, 2026
Reporting: July 25-31, 2026
Follow-up: October 2026

This engagement will be conducted in accordance with the International Standards for the Professional Practice of Internal Auditing."""

BUILTIN_ENGAGEMENT_LETTER = """INTERNAL AUDIT ENGAGEMENT LETTER

Date: July 1, 2026
To: Warehouse Operations Director
From: Internal Audit Director

Dear Warehouse Operations Director,

This letter confirms the internal audit engagement for F\u0026B Warehouse Operations scheduled for Q3 2026. The audit will evaluate controls over inventory management, food safety compliance, receiving and shipping, waste tracking, and security.

Scope: The audit covers all warehouse operations from April 1, 2026 through June 30, 2026.

Objectives: To assess the design and operating effectiveness of internal controls, identify control deficiencies, and provide recommendations for improvement.

Timeline: Fieldwork will commence on July 6, 2026 and is expected to conclude by July 24, 2026. The draft report will be issued by July 27, 2026.

Access: We request access to warehouse management systems, inventory records, HACCP documentation, receiving/shipping logs, waste registers, and security footage.

This engagement will be conducted in accordance with IIA Standards. We appreciate your cooperation and support throughout this process.

Sincerely,
Internal Audit Director"""


# ---------------------------------------------------------------------------
# Main Pipeline with REAL Quality Gates
# ---------------------------------------------------------------------------

def generate_all_documents():
    print("="*70)
    print("INTERNAL AUDIT ENGAGEMENT: F\u0026B WAREHOUSE OPERATIONS Q3 2026")
    print("="*70)
    print("Strategy: One-shot API + Built-in fallback + REAL Director Quality Gate")
    print("="*70)

    director = AuditDirector()
    files_generated = {}

    # --- STAGE 1: Planning Documents ---
    print("\n--- STAGE 1: PLANNING DOCUMENTS ---")

    planning_text = try_api_call(
        system="You are an Internal Audit Planning Specialist. Create an IIA-compliant planning memo and engagement letter.",
        prompt="Write a detailed audit planning memo and engagement letter for Q3 2026 F\u0026B warehouse operations audit covering inventory management, food safety/HACCP, receiving/shipping, waste tracking, and security. Include scope, objectives, risk assessment, timeline, and resource allocation. Return as structured text with clear sections.",
        max_tokens=4096,
        timeout=120
    )

    if planning_text:
        memo = planning_text[:4000]
        letter = planning_text[4000:8000] if len(planning_text) > 4000 else BUILTIN_ENGAGEMENT_LETTER
        risks = BUILTIN_RISKS
    else:
        memo = BUILTIN_PLANNING_MEMO
        letter = BUILTIN_ENGAGEMENT_LETTER
        risks = BUILTIN_RISKS

    # Generate PDFs
    files_generated["planning_memo"] = gen_planning_memo(
        memo,
        {"Date": "2026-07-01", "To": "Audit Committee", "From": "Internal Audit Director", "Subject": "Q3 2026 F\u0026B Warehouse Audit"},
        BASE_DIR / "0_Planning" / "audit_planning_memo.pdf"
    )
    files_generated["engagement_letter"] = gen_engagement_letter(
        letter,
        BASE_DIR / "0_Planning" / "engagement_letter.pdf"
    )
    files_generated["risk_matrix"] = gen_risk_matrix(
        risks,
        BASE_DIR / "0_Planning" / "risk_assessment_matrix.pdf"
    )

    # DIRECTOR REVIEW: Planning
    planning_tex_files = {
        "Planning Memo": (BASE_DIR / "0_Planning" / "audit_planning_memo.tex", BASE_DIR / "0_Planning" / "audit_planning_memo.pdf"),
        "Engagement Letter": (BASE_DIR / "0_Planning" / "engagement_letter.tex", BASE_DIR / "0_Planning" / "engagement_letter.pdf"),
        "Risk Matrix": (BASE_DIR / "0_Planning" / "risk_assessment_matrix.tex", BASE_DIR / "0_Planning" / "risk_assessment_matrix.pdf"),
    }
    if not director.review_stage("Planning Stage", planning_tex_files):
        print("\n[ENGAGEMENT HALTED] Planning rejected by Director. See revision notes.")
        return

    # Cleanup approved .tex files
    for tex_file, _ in planning_tex_files.values():
        cleanup_tex(tex_file)

    # --- STAGE 2: Working Papers ---
    print("\n--- STAGE 2: WORKING PAPERS ---")

    files_generated["wp_01"] = gen_working_paper(
        title="WP-01 Inventory Management Controls",
        objective="Evaluate inventory management controls including counting, FIFO, shrinkage, and system accuracy.",
        procedures=[
            "Observe physical inventory count and compare to perpetual records",
            "Test FIFO compliance by tracing items from receipt to storage",
            "Analyze shrinkage reports for variances greater than 5 percent",
            "Verify system accuracy via sample recounts",
            "Review access controls to storage areas"
        ],
        evidence=[
            "Physical count observation (2026-07-10)",
            "Perpetual vs physical variance report",
            "Shrinkage trend analysis (Jul 2025-Jun 2026)",
            "Warehouse access log review",
            "Cold storage temperature logs"
        ],
        results="Physical count observation revealed variances exceeding tolerance thresholds. Cold storage showed 8 percent shrinkage vs 3 percent target. FIFO compliance confirmed in 78 percent of traced items. System accuracy testing showed 23 percent discrepancy rate.",
        conclusion="Controls are partially effective. Significant deficiencies in inventory accuracy require immediate remediation.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.pdf"
    )

    files_generated["wp_02"] = gen_working_paper(
        title="WP-02 Food Safety and HACCP Compliance",
        objective="Evaluate HACCP compliance, temperature controls, expiry management, and supplier certification.",
        procedures=[
            "Review HACCP plan and CCP monitoring records",
            "Test temperature monitoring accuracy with calibrated thermometer",
            "Verify expiry date management via product sampling",
            "Review supplier certificates and incoming inspection records",
            "Test traceability by following a product lot through the chain"
        ],
        evidence=[
            "HACCP plan revision (2026-01-15)",
            "CCP monitoring logs (30-day sample)",
            "Temperature calibration certificates",
            "Expiry date compliance sampling (n=50)",
            "Supplier BRC certificate verification",
            "Traceability test Lot 2026-FW-0012"
        ],
        results="HACCP plan is current and documented. CCP monitoring shows 12 temperature deviations exceeding 2 hours without corrective action. Expiry compliance at 94 percent. Supplier certificates verified for 8 of 10 suppliers.",
        conclusion="HACCP controls are generally effective. Temperature monitoring requires automated alerting to prevent extended deviations.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.pdf"
    )

    files_generated["wp_03"] = gen_working_paper(
        title="WP-03 Receiving and Shipping Accuracy",
        objective="Evaluate receiving and shipping accuracy, GRN verification, and dispatch correctness.",
        procedures=[
            "Verify GRN accuracy against supplier delivery notes",
            "Re-count received goods samples",
            "Compare dispatch records to customer orders",
            "Test segregation of duties",
            "Review damaged goods handling"
        ],
        evidence=[
            "GRN vs delivery note matching (n=30)",
            "Physical re-count results",
            "Dispatch accuracy report (error rate: 2.3 percent)",
            "Segregation of duties matrix",
            "Damaged goods register"
        ],
        results="GRN accuracy testing showed 23.3 percent error rate (7 of 30 samples). Discrepancies primarily in quantity received vs quantity invoiced. Dispatch accuracy at 97.7 percent. Segregation of duties adequate.",
        conclusion="Receiving accuracy below acceptable threshold. Dispatch process well controlled. Three-way match implementation recommended.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.pdf"
    )

    files_generated["wp_04"] = gen_working_paper(
        title="WP-04 Waste Management and Security Controls",
        objective="Evaluate waste tracking accuracy, spoilage controls, and warehouse security measures.",
        procedures=[
            "Review waste tracking and spoilage recording",
            "Analyze waste trends by category",
            "Test security controls and CCTV coverage",
            "Verify waste disposal authorization",
            "Review pest control measures"
        ],
        evidence=[
            "Waste register vs disposal reconciliation",
            "Spoilage trend by category",
            "CCTV coverage audit",
            "Access control log (3 unauthorized attempts Q2)",
            "Pest control certificate (2026-06-30)"
        ],
        results="Waste register shows increasing spoilage trend in dairy (plus 12 percent) and produce (plus 8 percent). No root cause analysis performed. CCTV audit identified two blind spots in dispatch bay. Access control logs show 3 unauthorized attempts in Q2.",
        conclusion="Waste tracking requires immediate improvement with categorization and trend analysis. Security controls adequate but CCTV coverage gaps need addressing.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.pdf"
    )

    # DIRECTOR REVIEW: Fieldwork
    fieldwork_tex_files = {
        "WP-01 Inventory": (BASE_DIR / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.tex", BASE_DIR / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.pdf"),
        "WP-02 Safety": (BASE_DIR / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.tex", BASE_DIR / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.pdf"),
        "WP-03 Receiving": (BASE_DIR / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.tex", BASE_DIR / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.pdf"),
        "WP-04 Waste": (BASE_DIR / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.tex", BASE_DIR / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.pdf"),
    }
    if not director.review_stage("Fieldwork Stage", fieldwork_tex_files):
        print("\n[ENGAGEMENT HALTED] Fieldwork rejected by Director. See revision notes.")
        return

    # Cleanup approved .tex files
    for tex_file, _ in fieldwork_tex_files.values():
        cleanup_tex(tex_file)

    # --- STAGE 3: Findings Register ---
    print("\n--- STAGE 3: FINDINGS REGISTER ---")
    files_generated["findings_register"] = gen_findings_register(
        BUILTIN_FINDINGS,
        BASE_DIR / "3_Findings" / "findings_register.pdf"
    )

    findings_tex_files = {
        "Findings Register": (BASE_DIR / "3_Findings" / "findings_register.tex", BASE_DIR / "3_Findings" / "findings_register.pdf"),
    }
    if not director.review_stage("Findings Stage", findings_tex_files):
        print("\n[ENGAGEMENT HALTED] Findings rejected by Director. See revision notes.")
        return

    # Cleanup approved .tex files
    for tex_file, _ in findings_tex_files.values():
        cleanup_tex(tex_file)

    # --- STAGE 4: Final Report ---
    print("\n--- STAGE 4: FINAL AUDIT REPORT ---")
    files_generated["final_report"] = gen_audit_report(
        BUILTIN_REPORT,
        BASE_DIR / "4_Reports" / "final_audit_report.pdf"
    )

    report_tex_files = {
        "Final Audit Report": (BASE_DIR / "4_Reports" / "final_audit_report.tex", BASE_DIR / "4_Reports" / "final_audit_report.pdf"),
    }
    if not director.review_stage("Report Stage", report_tex_files):
        print("\n[ENGAGEMENT HALTED] Report rejected by Director. See revision notes.")
        return

    # Cleanup approved .tex files
    for tex_file, _ in report_tex_files.values():
        cleanup_tex(tex_file)

    # --- STAGE 5: Follow-Up ---
    print("\n--- STAGE 5: FOLLOW-UP TRACKING ---")
    files_generated["follow_up_tracker"] = gen_follow_up_tracker(
        BUILTIN_ACTIONS,
        BASE_DIR / "5_FollowUp" / "management_action_plan_tracking.pdf"
    )

    followup_tex_files = {
        "Follow-Up Tracker": (BASE_DIR / "5_FollowUp" / "management_action_plan_tracking.tex", BASE_DIR / "5_FollowUp" / "management_action_plan_tracking.pdf"),
    }
    if not director.review_stage("Follow-Up Stage", followup_tex_files):
        print("\n[ENGAGEMENT HALTED] Follow-Up rejected by Director. See revision notes.")
        return

    # Cleanup approved .tex files
    for tex_file, _ in followup_tex_files.values():
        cleanup_tex(tex_file)

    # --- Final Summary ---
    print("\n" + "="*70)
    print("ENGAGEMENT COMPLETE — ALL STAGES DIRECTOR-APPROVED")
    print("="*70)
    success_count = sum(1 for v in files_generated.values() if v is not None)
    print(f"Documents generated: {success_count}/{len(files_generated)}")
    for key, path in sorted(files_generated.items()):
        status = "OK" if path else "FAIL"
        print(f"  [{status}] {key}: {path}")
    print(f"\nOutput folder: {BASE_DIR.absolute()}")
    print(f"\nDirector reviewed {len(director.issues)} total issues across all stages.")


if __name__ == "__main__":
    generate_all_documents()
