"""
Internal Audit Agent System for F&B Warehouse Operations.
IIA-compliant audit engagement managed by an Audit Director with specialist agent cooks.

Generates a complete folder of PDF documents from Planning through Follow-Up.
"""

import sys
import os
from pathlib import Path
from datetime import datetime

# Ensure we can find pdf_utils in the same directory
sys.path.insert(0, str(Path(__file__).parent))

from pdf_utils import (
    AuditPDF, save_pdf_to,
    create_planning_memo_pdf, create_risk_matrix_pdf,
    create_engagement_letter_pdf, create_findings_register_pdf,
    create_audit_report_pdf, create_follow_up_tracker_pdf,
    create_working_paper_pdf
)

from typing import Dict, List, Callable, Optional, Any
from dataclasses import dataclass, field
import time
import hashlib
import json


# ---------------------------------------------------------------------------
# 1. Blackboard (reused from previous experiments, extended for file paths)
# ---------------------------------------------------------------------------

@dataclass
class Blackboard:
    entries: Dict[str, Any] = field(default_factory=dict)
    log: List[Dict] = field(default_factory=list)
    files: Dict[str, Path] = field(default_factory=dict)  # key -> generated PDF path
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
            "preview": str(value)[:120]
        })

    def read(self, key: str, default=None):
        return self.entries.get(key, default)

    def snapshot(self) -> str:
        lines = ["=== BLACKBOARD STATE ==="]
        for k, v in self.entries.items():
            if isinstance(v, (dict, list)):
                preview = json.dumps(v)[:200]
            else:
                preview = str(v)[:200]
            lines.append(f"[{k}]: {preview}")
        return "\n".join(lines)

    def digest_of(self, keys: List[str]) -> str:
        parts = []
        for k in sorted(keys):
            ver = self._key_versions.get(k, 0)
            val = str(self.entries.get(k, ""))
            parts.append(f"{k}:{ver}:{hashlib.md5(val.encode()).hexdigest()[:8]}")
        return hashlib.md5("|".join(parts).encode()).hexdigest()


# ---------------------------------------------------------------------------
# 2. LLM Provider
# ---------------------------------------------------------------------------

class LLMProvider:
    def call(self, system_prompt: str, user_prompt: str) -> str:
        raise NotImplementedError


class OllamaLLM(LLMProvider):
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
            temperature=0.6,
            max_tokens=4096,
            timeout=120,
        )
        content = response.choices[0].message.content
        print(f"  [OllamaLLM] Received {len(content)} chars.")
        return content


class MockLLM(LLMProvider):
    """Fast fallback for testing PDF generation without API calls."""
    def call(self, system_prompt: str, user_prompt: str) -> str:
        return f"[MockLLM: {system_prompt[:30]}... | Prompt: {user_prompt[:50]}...]"


# ---------------------------------------------------------------------------
# 3. Cook (Agent) Base Class
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
            f"Return your result as a well-structured text. Be specific and detailed."
        )

        print(f"[{self.name}] RUNNING...")
        result = self.llm.call(self.system_prompt, user_prompt)

        for out_key in self.outputs:
            bb.write(out_key, result, self.name)

        print(f"[{self.name}] DONE -> wrote to {self.outputs}")
        return True

    def generate_pdf(self, bb: Blackboard):
        """Override in subclasses to generate PDF artifacts."""
        pass


# ---------------------------------------------------------------------------
# 4. Specialist Cooks for Internal Audit
# ---------------------------------------------------------------------------

class PlanningCook(Cook):
    """Creates planning documents: Planning Memo, Risk Matrix, Engagement Letter."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating PDF artifacts...")
        base = Path("internal_audit_engagement")

        # Planning Memo
        memo_meta = {
            "Date": "2026-07-01",
            "To": "Audit Committee",
            "From": "Internal Audit Director",
            "Subject": "Q3 2026 F&B Warehouse Operations Audit - Planning Memo"
        }
        content = bb.read("planning_memo_content", "Planning memo content not generated.")
        create_planning_memo_pdf(content, base / "0_Planning" / "audit_planning_memo.pdf", memo_meta)
        bb.files["planning_memo"] = base / "0_Planning" / "audit_planning_memo.pdf"

        # Engagement Letter
        letter_content = bb.read("engagement_letter_content", "Engagement letter content not generated.")
        create_engagement_letter_pdf(letter_content, base / "0_Planning" / "engagement_letter.pdf")
        bb.files["engagement_letter"] = base / "0_Planning" / "engagement_letter.pdf"

        # Risk Matrix
        risks = bb.read("risk_assessment_data", [])
        create_risk_matrix_pdf(risks, base / "0_Planning" / "risk_assessment_matrix.pdf")
        bb.files["risk_matrix"] = base / "0_Planning" / "risk_assessment_matrix.pdf"

        print(f"[{self.name}] PDF artifacts generated.")


class InventoryAuditorCook(Cook):
    """Tests inventory controls and generates working papers."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating working paper PDFs...")
        base = Path("internal_audit_engagement")

        # WP 01: Inventory Management
        content = {
            "objective": "To evaluate the effectiveness of inventory management controls including counting procedures, FIFO compliance, and shrinkage detection.",
            "procedures": [
                "Review inventory count procedures and observe a physical count.",
                "Test FIFO compliance by tracing items from receiving to storage locations.",
                "Analyze shrinkage reports for the past 12 months and investigate variances >5%.",
                "Verify system accuracy by comparing perpetual inventory records to physical counts.",
                "Review access controls to warehouse and inventory storage areas."
            ],
            "results": bb.read("inventory_results", "Test results documented in fieldwork notes."),
            "conclusion": bb.read("inventory_conclusion", "Controls are partially effective with noted deficiencies.")
        }
        evidence = [
            "Physical count observation sheet (2026-07-10)",
            "Perpetual inventory vs. physical count variance report",
            "Shrinkage trend analysis (Jul 2025 - Jun 2026)",
            "Warehouse access log review",
            "Temperature monitoring logs for cold storage"
        ]
        create_working_paper_pdf(
            "WP-01 Inventory Management Controls",
            content, evidence,
            base / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.pdf"
        )
        bb.files["wp_01_inventory"] = base / "2_Fieldwork" / "WP_01_Inventory_Management" / "test_procedure.pdf"

        print(f"[{self.name}] Working paper PDFs generated.")


class SafetyAuditorCook(Cook):
    """Tests food safety/HACCP controls and generates working papers."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating working paper PDFs...")
        base = Path("internal_audit_engagement")

        content = {
            "objective": "To evaluate HACCP compliance, temperature control effectiveness, and expiry date management for food safety assurance.",
            "procedures": [
                "Review HACCP plan documentation and critical control point (CCP) monitoring records.",
                "Test temperature monitoring accuracy by reviewing logs and spot-checking with calibrated thermometer.",
                "Verify expiry date management by sampling products and checking rotation compliance.",
                "Review supplier certification and incoming goods inspection records.",
                "Test traceability by following a product lot from receipt to dispatch."
            ],
            "results": bb.read("safety_results", "Test results documented in fieldwork notes."),
            "conclusion": bb.read("safety_conclusion", "HACCP controls are generally effective with minor gaps.")
        }
        evidence = [
            "HACCP plan revision dated 2026-01-15",
            "CCP monitoring logs for cold storage (30-day sample)",
            "Temperature calibration certificate for monitoring devices",
            "Expiry date compliance sampling results (n=50)",
            "Supplier BRC certificate verification",
            "Traceability test result - Lot #2026-FW-0012"
        ]
        create_working_paper_pdf(
            "WP-02 Food Safety & HACCP Compliance",
            content, evidence,
            base / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.pdf"
        )
        bb.files["wp_02_safety"] = base / "2_Fieldwork" / "WP_02_Food_Safety_HACCP" / "test_procedure.pdf"

        print(f"[{self.name}] Working paper PDFs generated.")


class OpsAuditorCook(Cook):
    """Tests receiving/shipping and waste/security controls."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating working paper PDFs...")
        base = Path("internal_audit_engagement")

        # WP 03: Receiving/Shipping
        content1 = {
            "objective": "To evaluate the accuracy and completeness of receiving and shipping processes, including GRN verification and dispatch accuracy.",
            "procedures": [
                "Review receiving procedures and verify GRN accuracy against supplier delivery notes.",
                "Test quantity verification by re-counting samples of received goods.",
                "Review shipping accuracy by comparing dispatch records to customer orders.",
                "Test segregation of duties between receiving and inventory recording functions.",
                "Review damaged goods handling and return authorization procedures."
            ],
            "results": bb.read("receiving_results", "Test results documented in fieldwork notes."),
            "conclusion": bb.read("receiving_conclusion", "Controls are effective with noted documentation gaps.")
        }
        evidence1 = [
            "GRN vs. delivery note matching test (n=30)",
            "Physical re-count verification results",
            "Dispatch accuracy report (error rate: 2.3%)",
            "Segregation of duties matrix review",
            "Damaged goods register analysis"
        ]
        create_working_paper_pdf(
            "WP-03 Receiving & Shipping Accuracy",
            content1, evidence1,
            base / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.pdf"
        )
        bb.files["wp_03_receiving"] = base / "2_Fieldwork" / "WP_03_Receiving_Shipping" / "test_procedure.pdf"

        # WP 04: Waste/Security
        content2 = {
            "objective": "To evaluate waste tracking accuracy, spoilage controls, and warehouse security measures.",
            "procedures": [
                "Review waste tracking procedures and verify spoilage recording accuracy.",
                "Analyze waste trends by product category for the past 6 months.",
                "Test security controls by reviewing CCTV coverage and access control logs.",
                "Verify waste disposal authorization and third-party collection records.",
                "Review pest control measures and inspection records."
            ],
            "results": bb.read("waste_results", "Test results documented in fieldwork notes."),
            "conclusion": bb.read("waste_conclusion", "Security controls are adequate; waste tracking requires improvement.")
        }
        evidence2 = [
            "Waste register vs. disposal record reconciliation",
            "Spoilage trend analysis by product category",
            "CCTV coverage audit and blind spot assessment",
            "Access control log review (unauthorized attempts: 3 in Q2)",
            "Pest control inspection certificate (2026-06-30)"
        ]
        create_working_paper_pdf(
            "WP-04 Waste Management & Security Controls",
            content2, evidence2,
            base / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.pdf"
        )
        bb.files["wp_04_waste"] = base / "2_Fieldwork" / "WP_04_Waste_Security" / "test_procedure.pdf"

        print(f"[{self.name}] Working paper PDFs generated.")


class FindingsCook(Cook):
    """Compiles findings from all fieldwork and generates findings register."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating findings register PDF...")
        base = Path("internal_audit_engagement")

        findings = bb.read("findings_data", [])
        create_findings_register_pdf(findings, base / "3_Findings" / "findings_register.pdf")
        bb.files["findings_register"] = base / "3_Findings" / "findings_register.pdf"

        print(f"[{self.name}] Findings register PDF generated.")


class ReportCook(Cook):
    """Drafts and finalizes the audit report."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating audit report PDFs...")
        base = Path("internal_audit_engagement")

        report = bb.read("audit_report_data", {})
        create_audit_report_pdf(report, base / "4_Reports" / "final_audit_report.pdf")
        bb.files["final_report"] = base / "4_Reports" / "final_audit_report.pdf"

        print(f"[{self.name}] Audit report PDFs generated.")


class FollowUpCook(Cook):
    """Creates follow-up tracking sheet."""

    def generate_pdf(self, bb: Blackboard):
        print(f"[{self.name}] Generating follow-up tracker PDF...")
        base = Path("internal_audit_engagement")

        actions = bb.read("follow_up_actions", [])
        create_follow_up_tracker_pdf(actions, base / "5_FollowUp" / "management_action_plan_tracking.pdf")
        bb.files["follow_up_tracker"] = base / "5_FollowUp" / "management_action_plan_tracking.pdf"

        print(f"[{self.name}] Follow-up tracker PDF generated.")


class AuditDirectorCook(Cook):
    """
    The Audit Director reviews all work and approves final outputs.
    Has hard veto: pipeline pauses until director approves.
    """

    def review(self, bb: Blackboard, stage: str) -> bool:
        """Review stage outputs and return approval status."""
        print(f"[{self.name}] REVIEWING {stage}...")

        user_prompt = (
            f"You are the Internal Audit Director. Review the {stage} outputs on the blackboard.\n\n"
            f"Current state:\n{bb.snapshot()}\n\n"
            f"Provide your review in this format:\n"
            f"STATUS: [APPROVED or REVISIONS_REQUIRED]\n"
            f"COMMENTS: [Your specific review comments]\n"
            f"DECISION: [Brief justification for your decision]"
        )

        result = self.llm.call(self.system_prompt, user_prompt)
        bb.write(f"director_review_{stage}", result, self.name)

        approved = "APPROVED" in result.upper()
        if approved:
            print(f"[{self.name}] {stage} APPROVED.")
        else:
            print(f"[{self.name}] {stage} REQUIRES REVISIONS.")
        return approved


# ---------------------------------------------------------------------------
# 5. Orchestrator (The Kitchen)
# ---------------------------------------------------------------------------

class AuditKitchen:
    def __init__(self, blackboard: Blackboard, llm: LLMProvider):
        self.bb = blackboard
        self.llm = llm
        self._setup_cooks()

    def _setup_cooks(self):
        """Initialize all specialist cooks."""
        # Planning Cook
        self.planning_cook = PlanningCook(
            name="PlanningCook",
            system_prompt=(
                "You are an Internal Audit Planning Specialist. "
                "You create detailed, IIA-compliant audit planning documents including planning memos, "
                "risk assessment matrices, and engagement letters. "
                "For F&B warehouse operations, consider: inventory management, food safety/HACCP, "
                "receiving/shipping accuracy, waste tracking, and security controls. "
                "Output must be structured and professional."
            ),
            llm=self.llm,
            inputs=["user_request"],
            outputs=["planning_memo_content", "engagement_letter_content", "risk_assessment_data"],
        )

        # Fieldwork Cooks (parallel-ready)
        self.inventory_cook = InventoryAuditorCook(
            name="InventoryAuditorCook",
            system_prompt=(
                "You are an Inventory Management Internal Auditor. "
                "You evaluate inventory counting procedures, FIFO compliance, shrinkage detection, "
                "and system accuracy for F&B warehouses. "
                "Output structured test results, evidence summaries, and clear conclusions."
            ),
            llm=self.llm,
            inputs=["planning_memo_content", "risk_assessment_data"],
            outputs=["inventory_results", "inventory_conclusion"],
        )

        self.safety_cook = SafetyAuditorCook(
            name="SafetyAuditorCook",
            system_prompt=(
                "You are a Food Safety & HACCP Internal Auditor. "
                "You evaluate HACCP plan implementation, temperature monitoring, expiry date management, "
                "and supplier certification for F&B warehouses. "
                "Output structured test results, evidence summaries, and clear conclusions."
            ),
            llm=self.llm,
            inputs=["planning_memo_content", "risk_assessment_data"],
            outputs=["safety_results", "safety_conclusion"],
        )

        self.ops_cook = OpsAuditorCook(
            name="OpsAuditorCook",
            system_prompt=(
                "You are an Operations Internal Auditor specializing in receiving/shipping and warehouse security. "
                "You evaluate GRN accuracy, dispatch accuracy, waste tracking, spoilage controls, "
                "and security measures for F&B warehouses. "
                "Output structured test results, evidence summaries, and clear conclusions."
            ),
            llm=self.llm,
            inputs=["planning_memo_content", "risk_assessment_data"],
            outputs=["receiving_results", "receiving_conclusion", "waste_results", "waste_conclusion"],
        )

        # Findings Cook
        self.findings_cook = FindingsCook(
            name="FindingsCook",
            system_prompt=(
                "You are an Internal Audit Findings Analyst. "
                "You compile fieldwork results into a rated findings register (Critical/High/Medium/Low). "
                "Each finding must include: reference, area, title, description, root cause, recommendation, "
                "and management response placeholder. Output as structured JSON-like text."
            ),
            llm=self.llm,
            inputs=["inventory_results", "inventory_conclusion", "safety_results", "safety_conclusion",
                    "receiving_results", "receiving_conclusion", "waste_results", "waste_conclusion"],
            outputs=["findings_data"],
        )

        # Report Cook
        self.report_cook = ReportCook(
            name="ReportCook",
            system_prompt=(
                "You are a Senior Internal Audit Report Writer. "
                "You draft executive summaries, detailed findings, and overall conclusions for audit reports. "
                "Follow IIA reporting standards. Structure: Executive Summary, Scope, Key Findings Summary, "
                "Detailed Findings & Recommendations, Management Response, Overall Conclusion."
            ),
            llm=self.llm,
            inputs=["findings_data"],
            outputs=["audit_report_data"],
        )

        # Follow-Up Cook
        self.followup_cook = FollowUpCook(
            name="FollowUpCook",
            system_prompt=(
                "You are an Internal Audit Follow-Up Coordinator. "
                "You create management action plans with specific owners, due dates, and status tracking. "
                "Each action must link to a finding reference and include implementation steps."
            ),
            llm=self.llm,
            inputs=["audit_report_data"],
            outputs=["follow_up_actions"],
        )

        # Audit Director (gatekeeper)
        self.director = AuditDirectorCook(
            name="AuditDirector",
            system_prompt=(
                "You are the Internal Audit Director. You have final approval authority over all audit outputs. "
                "You ensure quality, completeness, and IIA compliance. "
                "You approve or reject work with specific, actionable comments. "
                "You never compromise on audit standards."
            ),
            llm=self.llm,
            inputs=[],
            outputs=[],
        )

    def run(self):
        """Execute the full audit engagement."""
        print("="*60)
        print("INTERNAL AUDIT ENGAGEMENT: F&B WAREHOUSE OPERATIONS")
        print("="*60)

        # STAGE 1: Planning
        print("\n--- STAGE 1: PLANNING ---")
        self.planning_cook.run(self.bb)
        self.planning_cook.generate_pdf(self.bb)

        # Director review gate
        if not self.director.review(self.bb, "planning"):
            print("[ENGAGEMENT HALTED] Planning rejected by Director.")
            return

        # STAGE 2: Fieldwork (Parallel)
        print("\n--- STAGE 2: FIELDWORK (Parallel Execution) ---")
        self.inventory_cook.run(self.bb)
        self.safety_cook.run(self.bb)
        self.ops_cook.run(self.bb)

        self.inventory_cook.generate_pdf(self.bb)
        self.safety_cook.generate_pdf(self.bb)
        self.ops_cook.generate_pdf(self.bb)

        # Director review gate
        if not self.director.review(self.bb, "fieldwork"):
            print("[ENGAGEMENT HALTED] Fieldwork rejected by Director.")
            return

        # STAGE 3: Findings Compilation
        print("\n--- STAGE 3: FINDINGS COMPILATION ---")
        self.findings_cook.run(self.bb)
        self.findings_cook.generate_pdf(self.bb)

        if not self.director.review(self.bb, "findings"):
            print("[ENGAGEMENT HALTED] Findings rejected by Director.")
            return

        # STAGE 4: Reporting
        print("\n--- STAGE 4: REPORTING ---")
        self.report_cook.run(self.bb)
        self.report_cook.generate_pdf(self.bb)

        if not self.director.review(self.bb, "report"):
            print("[ENGAGEMENT HALTED] Report rejected by Director.")
            return

        # STAGE 5: Follow-Up
        print("\n--- STAGE 5: FOLLOW-UP ---")
        self.followup_cook.run(self.bb)
        self.followup_cook.generate_pdf(self.bb)

        # Final summary
        print("\n" + "="*60)
        print("ENGAGEMENT COMPLETE")
        print("="*60)
        print(f"Total documents generated: {len(self.bb.files)}")
        for key, path in self.bb.files.items():
            print(f"  - {key}: {path}")


# ---------------------------------------------------------------------------
# 6. Main Execution
# ---------------------------------------------------------------------------

if __name__ == "__main__":
    # Setup
    bb = Blackboard()

    # Read Ollama Cloud API key
    API_KEY_PATH = r"C:\Users\sorat\Desktop\Coding\Dev_api\ollama_api_key.txt"
    with open(API_KEY_PATH, "r", encoding="utf-8") as f:
        api_key = f.readline().strip()

    llm = OllamaLLM(api_key=api_key, model="glm-5.2:cloud")
    # llm = MockLLM()  # Use for fast testing without API calls

    # Seed the engagement
    bb.write("user_request", (
        "Plan and execute an internal audit engagement for Q3 2026 "
        "covering F&B warehouse operations including: inventory management, "
        "food safety/HACCP compliance, receiving/shipping accuracy, "
        "waste tracking, and security controls. Follow IIA standards. "
        "Generate all planning documents, working papers, findings register, "
        "final report, and follow-up tracking."
    ), "User")

    # Run the engagement
    kitchen = AuditKitchen(bb, llm)
    kitchen.run()
