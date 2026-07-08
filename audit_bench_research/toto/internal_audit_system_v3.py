"""
Internal Audit Agent System v3 for F&B Warehouse Operations.
Uses XeLaTeX (MiKTeX) for professional PDF generation.
Generates complete IIA-compliant audit engagement package.
"""

import sys
from pathlib import Path
import json
import re

sys.path.insert(0, str(Path(__file__).parent))

from pdf_latex import (
    gen_planning_memo, gen_engagement_letter, gen_risk_matrix,
    gen_working_paper, gen_findings_register, gen_audit_report, gen_follow_up_tracker,
    XELATEX
)

import openai

# ---------------------------------------------------------------------------
# Configuration
# ---------------------------------------------------------------------------

API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
with open(API_KEY_PATH, "r", encoding="utf-8") as f:
    API_KEY = f.readline().strip()

BASE_DIR = Path("internal_audit_engagement")

# ---------------------------------------------------------------------------
# LLM Client
# ---------------------------------------------------------------------------

class OllamaClient:
    def __init__(self, api_key: str, model: str = "glm-5.2:cloud"):
        self.client = openai.OpenAI(api_key=api_key, base_url="https://ollama.com/v1")
        self.model = model

    def call(self, system: str, user: str, max_tokens: int = 4096) -> str:
        print(f"  [LLM] Calling {self.model}...")
        resp = self.client.chat.completions.create(
            model=self.model,
            messages=[
                {"role": "system", "content": system},
                {"role": "user", "content": user}
            ],
            temperature=0.5,
            max_tokens=max_tokens,
            timeout=120,
        )
        content = resp.choices[0].message.content
        print(f"  [LLM] Received {len(content)} chars")
        return content

llm = OllamaClient(API_KEY, model="kimi-k2.6:cloud")

# ---------------------------------------------------------------------------
# State Store
# ---------------------------------------------------------------------------

class State:
    def __init__(self):
        self.data = {}
        self.files = {}

    def set(self, key: str, value):
        self.data[key] = value
        print(f"  [STATE] Set: {key}")

    def get(self, key: str, default=None):
        return self.data.get(key, default)

state = State()

# ---------------------------------------------------------------------------
# Helper Functions
# ---------------------------------------------------------------------------

def extract_section(text: str, marker: str) -> str:
    """Extract content between section markers."""
    pattern = rf"(?:^|\n)\s*{re.escape(marker)}\s*[:\-]?\s*\n(.*?)(?:\n\s*(?:[A-Z][A-Z_\s]{{3,}}|#{1,3}\s)\s*[:\-]?\s*\n|$)"
    m = re.search(pattern, text, re.DOTALL | re.IGNORECASE)
    return m.group(1).strip() if m else ""


def parse_risk_matrix(text: str) -> list:
    """Parse risk matrix or return realistic defaults."""
    risks = []
    # Try pattern matching
    blocks = re.findall(
        r'(?:Risk\s*Area|Area)[\s#:]*([^\n]+).*?'
        r'(?:Inherent)[\s:]*([^\n]+).*?'
        r'(?:Control)[\s:]*([^\n]+).*?'
        r'(?:Residual)[\s:]*([^\n]+).*?'
        r'(?:Priority)[\s:]*([^\n]+)',
        text, re.DOTALL | re.IGNORECASE
    )

    if blocks:
        for block in blocks[:8]:
            risks.append({
                "area": block[0].strip()[:40],
                "inherent": block[1].strip()[:15],
                "control": block[2].strip()[:15],
                "residual": block[3].strip()[:15],
                "priority": block[4].strip()[:15],
                "description": f"Risk in {block[0].strip()} area.",
                "mitigation": "Review and strengthen controls."
            })
        return risks

    # Default realistic risks for F&B warehouse
    return [
        {"area": "Inventory Management", "inherent": "High", "control": "Medium", "residual": "Medium-High", "priority": "High",
         "description": "Risk of inventory shrinkage, spoilage, and inaccurate stock records due to manual processes.",
         "mitigation": "Implement cycle counting, automated inventory tracking, and segregation of duties."},
        {"area": "Food Safety / HACCP", "inherent": "High", "control": "Medium", "residual": "Medium-High", "priority": "High",
         "description": "Risk of food safety incidents, regulatory non-compliance, and product recalls due to inadequate temperature controls.",
         "mitigation": "Enhance temperature monitoring, staff training, and HACCP plan adherence verification."},
        {"area": "Receiving / Shipping Accuracy", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Medium",
         "description": "Risk of inaccurate GRN recording, dispatch errors, and customer complaints.",
         "mitigation": "Implement barcode scanning, GRN verification, and dispatch accuracy checks."},
        {"area": "Waste Tracking", "inherent": "Medium", "control": "Low", "residual": "Medium-High", "priority": "Medium",
         "description": "Risk of excessive waste, inaccurate spoilage reporting, and financial loss.",
         "mitigation": "Introduce waste categorization, root cause analysis, and KPI monitoring."},
        {"area": "Warehouse Security", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Medium",
         "description": "Risk of unauthorized access, theft, and product tampering.",
         "mitigation": "Strengthen access controls, CCTV coverage, and visitor management."},
        {"area": "Supplier Compliance", "inherent": "Medium", "control": "Medium", "residual": "Medium", "priority": "Low",
         "description": "Risk of receiving non-compliant goods from uncertified suppliers.",
         "mitigation": "Enforce supplier certification verification and incoming goods inspection."}
    ]


def parse_findings(text: str) -> list:
    """Parse findings or return realistic defaults."""
    # Try to extract structured findings
    blocks = re.findall(
        r'(?:Finding|Issue)\s*(?:Ref|#)?[\s:]*([^\n]*).*?'
        r'(?:Area|Category)[\s:]*([^\n]*).*?'
        r'(?:Rating|Severity)[\s:]*([^\n]*).*?'
        r'(?:Description|Finding)[\s:]*(.*?)(?=\n\s*(?:Finding|Recommendation|Root\s*Cause)|$)',
        text, re.DOTALL | re.IGNORECASE
    )

    if blocks and len(blocks) >= 3:
        findings = []
        for i, block in enumerate(blocks[:8], 1):
            findings.append({
                "ref": f"F-2026-{i:03d}",
                "area": block[1].strip()[:40] or "General",
                "rating": block[2].strip()[:10] or "Medium",
                "title": block[0].strip()[:60] or f"Finding {i}",
                "status": "Open",
                "description": block[3].strip()[:500] or "Description pending.",
                "root_cause": "Root cause analysis pending.",
                "recommendation": "Recommendation pending.",
                "management_response": "Pending management response."
            })
        return findings

    # Realistic default findings for F&B warehouse
    return [
        {"ref": "F-2026-001", "area": "Inventory Management", "rating": "High",
         "title": "Inaccurate Perpetual Inventory Records", "status": "Open",
         "description": "Physical inventory counts revealed significant variances (>5%) between perpetual inventory records and actual stock on hand in cold storage and dry goods areas. Root cause traced to manual data entry errors and lack of cycle counting discipline.",
         "root_cause": "Inadequate controls over inventory recording and insufficient frequency of physical counts. Staff rely on manual updates without secondary verification.",
         "recommendation": "Implement automated inventory tracking with barcode scanning. Establish weekly cycle counting program for high-value items. Segregate inventory recording from physical handling duties.",
         "management_response": "Management agrees. Will procure barcode scanning system by Q4 2026 and assign dedicated cycle count team."},
        {"ref": "F-2026-002", "area": "Food Safety / HACCP", "rating": "High",
         "title": "Temperature Monitoring Gaps in Cold Chain", "status": "Open",
         "description": "Review of 30-day temperature logs revealed 12 instances where cold storage temperatures exceeded 5C for periods exceeding 2 hours. No alerts were triggered, and corrective actions were not documented.",
         "root_cause": "Temperature monitoring system lacks automated alerting. Manual log review is performed weekly, allowing deviations to go undetected for extended periods.",
         "recommendation": "Install continuous automated temperature monitoring with SMS/email alerts. Require same-day documented corrective action for any deviation. Calibrate all monitoring devices quarterly.",
         "management_response": "Agreed. Budget approved for automated system. Will update HACCP plan to include alert protocols."},
        {"ref": "F-2026-003", "area": "Receiving / Shipping", "rating": "Medium",
         "title": "GRN Accuracy Below Target", "status": "Open",
         "description": "Sampling of 30 GRN records against supplier delivery notes showed 7 discrepancies (23.3% error rate), primarily in quantity received vs. quantity invoiced. No formal reconciliation process exists prior to payment authorization.",
         "root_cause": "Receiving staff do not perform independent quantity verification. GRN is created based on supplier packing slip rather than physical count.",
         "recommendation": "Mandate physical count verification for all incoming goods. Implement three-way match (PO/GRN/Invoice) before payment approval. Reconcile discrepancies within 48 hours.",
         "management_response": "Will update receiving SOP and assign reconciliation clerk. Target error rate below 5% by year-end."},
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


def parse_actions(findings: list) -> list:
    """Generate follow-up actions from findings."""
    actions = []
    for f in findings:
        actions.append({
            "id": f"A-{f['ref'].split('-')[1]}",
            "finding_ref": f["ref"],
            "description": f["recommendation"],
            "owner": "Warehouse Operations Manager",
            "due_date": "2026-10-20",
            "status": "Planned",
            "notes": f"Linked to {f['title']}. Priority: {f['rating']}."
        })
    return actions


# ---------------------------------------------------------------------------
# Agent Functions
# ---------------------------------------------------------------------------

def agent_planning(state: State):
    """Generate planning documents."""
    print("\n[AGENT] PlanningCook: Generating planning documents...")

    system = ("You are an Internal Audit Planning Specialist. Create an IIA-compliant audit planning memo, "
              "engagement letter, and risk assessment for an F\u0026B warehouse operations audit. "
              "Structure your response with clear sections: PLANNING MEMO, ENGAGEMENT LETTER, RISK ASSESSMENT.")
    user = "Plan an internal audit for Q3 2026 covering F\u0026B warehouse operations: inventory management, food safety/HACCP, receiving/shipping, waste tracking, and security."

    result = llm.call(system, user)
    state.set("planning_raw", result)

    memo = extract_section(result, "PLANNING MEMO") or result[:3000]
    letter = extract_section(result, "ENGAGEMENT LETTER") or result[3000:5000]
    risks = parse_risk_matrix(result)

    state.set("planning_memo", memo)
    state.set("engagement_letter", letter)
    state.set("risks", risks)

    # Generate PDFs
    state.files["planning_memo"] = gen_planning_memo(
        memo, {"Date": "2026-07-01", "To": "Audit Committee", "From": "Internal Audit Director", "Subject": "Q3 2026 F\u0026B Warehouse Audit"},
        BASE_DIR / "0_Planning" / "audit_planning_memo.pdf"
    )
    state.files["engagement_letter"] = gen_engagement_letter(
        letter, BASE_DIR / "0_Planning" / "engagement_letter.pdf"
    )
    state.files["risk_matrix"] = gen_risk_matrix(
        risks, BASE_DIR / "0_Planning" / "risk_assessment_matrix.pdf"
    )
    print("[AGENT] PlanningCook: Complete.")


def agent_inventory(state: State):
    """Generate inventory management working papers."""
    print("\n[AGENT] InventoryAuditorCook: Testing inventory controls...")

    system = "You are an Inventory Management Internal Auditor. Evaluate inventory counting, FIFO compliance, shrinkage, and system accuracy for an F\u0026B warehouse."
    user = "Document test results and conclusions for inventory management controls based on the audit scope."

    result = llm.call(system, user, max_tokens=2048)

    state.files["wp_01"] = gen_working_paper(
        title="WP-01 Inventory Management Controls",
        objective="Evaluate inventory management controls including counting, FIFO, shrinkage, and system accuracy.",
        procedures=[
            "Observe physical inventory count and compare to perpetual records",
            "Test FIFO compliance by tracing items from receipt to storage",
            "Analyze shrinkage reports for variances >5%",
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
        results=result[:2000],
        conclusion="Controls partially effective. Shrinkage exceeds tolerance in cold storage. Manual recording creates accuracy gaps.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.pdf"
    )
    print("[AGENT] InventoryAuditorCook: Complete.")


def agent_safety(state: State):
    """Generate food safety working papers."""
    print("\n[AGENT] SafetyAuditorCook: Testing HACCP controls...")

    system = "You are a Food Safety \u0026 HACCP Internal Auditor. Evaluate HACCP plan implementation, temperature monitoring, expiry management, and supplier certification."
    user = "Document test results and conclusions for food safety and HACCP compliance."

    result = llm.call(system, user, max_tokens=2048)

    state.files["wp_02"] = gen_working_paper(
        title="WP-02 Food Safety \u0026 HACCP Compliance",
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
            "Traceability test Lot #2026-FW-0012"
        ],
        results=result[:2000],
        conclusion="HACCP controls generally effective. Temperature monitoring has alert gaps. Expiry management is adequate.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.pdf"
    )
    print("[AGENT] SafetyAuditorCook: Complete.")


def agent_ops(state: State):
    """Generate operations working papers."""
    print("\n[AGENT] OpsAuditorCook: Testing receiving, shipping, waste, and security...")

    system = "You are an Operations Internal Auditor. Evaluate receiving/shipping accuracy, waste tracking, spoilage controls, and warehouse security for an F\u0026B warehouse."
    user = "Document test results and conclusions for receiving, shipping, waste, and security controls."

    result = llm.call(system, user, max_tokens=2048)

    # WP 03: Receiving/Shipping
    state.files["wp_03"] = gen_working_paper(
        title="WP-03 Receiving \u0026 Shipping Accuracy",
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
            "Dispatch accuracy report (error rate: 2.3%)",
            "Segregation of duties matrix",
            "Damaged goods register"
        ],
        results=result[:1500],
        conclusion="GRN accuracy below target (23% error rate). Dispatch generally accurate. Segregation adequate.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.pdf"
    )

    # WP 04: Waste/Security
    state.files["wp_04"] = gen_working_paper(
        title="WP-04 Waste Management \u0026 Security Controls",
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
        results=result[1500:3000] if len(result) > 1500 else result,
        conclusion="Waste tracking requires improvement. Security controls adequate. CCTV has blind spots.",
        filepath=BASE_DIR / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.pdf"
    )
    print("[AGENT] OpsAuditorCook: Complete.")


def agent_findings(state: State):
    """Compile findings register."""
    print("\n[AGENT] FindingsCook: Compiling findings register...")

    system = ("You are an Internal Audit Findings Analyst. Compile fieldwork results into a rated findings register "
              "(Critical/High/Medium/Low). Include reference, area, title, description, root cause, recommendation, "
              "and management response.")
    user = "Compile findings from inventory management, food safety, receiving/shipping, and waste/security audits."

    result = llm.call(system, user, max_tokens=4096)
    state.set("findings_raw", result)

    findings = parse_findings(result)
    state.set("findings", findings)

    state.files["findings_register"] = gen_findings_register(
        findings, BASE_DIR / "3_Findings" / "findings_register.pdf"
    )
    print("[AGENT] FindingsCook: Complete.")


def agent_report(state: State):
    """Generate final audit report."""
    print("\n[AGENT] ReportCook: Drafting final audit report...")

    findings = state.get("findings", [])
    system = ("You are a Senior Internal Audit Report Writer. Draft an executive summary, scope, key findings, "
              "detailed findings with recommendations, management response, and overall conclusion. "
              "Follow IIA reporting standards.")
    user = f"Draft the final audit report for Q3 2026 F\u0026B Warehouse Operations Audit. Key findings: {json.dumps(findings[:3], indent=2)}"

    result = llm.call(system, user, max_tokens=4096)

    report = {
        "date": "2026-07-20",
        "number": "IAR-2026-03",
        "executive_summary": extract_section(result, "EXECUTIVE SUMMARY") or result[:1000],
        "scope": extract_section(result, "SCOPE") or "Audit covered inventory management, food safety/HACCP, receiving/shipping, waste tracking, and warehouse security for Q3 2026.",
        "findings_summary": f"{len(findings)} findings identified: {sum(1 for f in findings if f['rating'] == 'High')} High, {sum(1 for f in findings if f['rating'] == 'Medium')} Medium, {sum(1 for f in findings if f['rating'] == 'Low')} Low.",
        "detailed_findings": findings,
        "management_response": "Management has reviewed all findings and agreed to action plans with target completion dates.",
        "overall_conclusion": "Controls are partially effective. Significant improvements required in inventory accuracy, temperature monitoring, and waste tracking. Management commitment to remediation is positive."
    }
    state.set("report", report)

    state.files["final_report"] = gen_audit_report(
        report, BASE_DIR / "4_Reports" / "final_audit_report.pdf"
    )
    print("[AGENT] ReportCook: Complete.")


def agent_followup(state: State):
    """Generate follow-up tracking sheet."""
    print("\n[AGENT] FollowUpCook: Creating management action plan tracker...")

    findings = state.get("findings", [])
    actions = parse_actions(findings)
    state.set("actions", actions)

    state.files["follow_up_tracker"] = gen_follow_up_tracker(
        actions, BASE_DIR / "5_FollowUp" / "management_action_plan_tracking.pdf"
    )
    print("[AGENT] FollowUpCook: Complete.")


def agent_director_review(state: State, stage: str) -> bool:
    """Audit Director reviews and approves/rejects stage outputs."""
    print(f"\n[AGENT] AuditDirector: Reviewing {stage}...")

    system = ("You are the Internal Audit Director. Review audit outputs for quality, completeness, and IIA compliance. "
              "Respond with: STATUS: APPROVED or REVISIONS_REQUIRED. Provide specific comments.")

    data = state.get("risks", []) if stage == "planning" else state.get("findings", [])
    user = f"Review the {stage} outputs. Data: {json.dumps(data[:2], indent=2)}"

    result = llm.call(system, user, max_tokens=1024)
    approved = "APPROVED" in result.upper()

    print(f"[AGENT] AuditDirector: {stage} {'APPROVED' if approved else 'REQUIRES REVISIONS'}.")
    return approved


# ---------------------------------------------------------------------------
# Orchestrator
# ---------------------------------------------------------------------------

def run_engagement():
    print("="*70)
    print("INTERNAL AUDIT ENGAGEMENT: F\u0026B WAREHOUSE OPERATIONS Q3 2026")
    print("="*70)
    print(f"PDF Engine: XeLaTeX at {XELATEX}")
    print(f"Output Directory: {BASE_DIR.absolute()}")
    print("="*70)

    # Stage 1: Planning
    print("\n--- STAGE 1: PLANNING ---")
    agent_planning(state)
    if not agent_director_review(state, "planning"):
        print("[ENGAGEMENT HALTED]")
        return

    # Stage 2: Fieldwork
    print("\n--- STAGE 2: FIELDWORK ---")
    agent_inventory(state)
    agent_safety(state)
    agent_ops(state)
    if not agent_director_review(state, "fieldwork"):
        print("[ENGAGEMENT HALTED]")
        return

    # Stage 3: Findings
    print("\n--- STAGE 3: FINDINGS ---")
    agent_findings(state)
    if not agent_director_review(state, "findings"):
        print("[ENGAGEMENT HALTED]")
        return

    # Stage 4: Reporting
    print("\n--- STAGE 4: REPORTING ---")
    agent_report(state)
    if not agent_director_review(state, "report"):
        print("[ENGAGEMENT HALTED]")
        return

    # Stage 5: Follow-Up
    print("\n--- STAGE 5: FOLLOW-UP ---")
    agent_followup(state)

    # Final summary
    print("\n" + "="*70)
    print("ENGAGEMENT COMPLETE")
    print("="*70)
    print(f"Documents generated: {len([v for v in state.files.values() if v])}")
    for key, path in sorted(state.files.items()):
        if path:
            print(f"  [{key}] -> {path}")


if __name__ == "__main__":
    run_engagement()
