"""
PDF Generation Utilities for Internal Audit Engagement Documents.
Creates professional, structured PDFs with headers, footers, and proper formatting.
"""

from fpdf import FPDF
from datetime import datetime
from pathlib import Path
from typing import Optional


class AuditPDF(FPDF):
    """Custom PDF class with professional audit document styling."""

    def __init__(self, title: str = "Document", document_type: str = "Internal Audit Document"):
        super().__init__()
        self.document_title = title
        self.document_type = document_type
        self.set_auto_page_break(auto=True, margin=25)
        self.add_page()
        self._setup_fonts()

    def _setup_fonts(self):
        """Configure Unicode fonts (DejaVu) to support full character sets."""
        import os
        self.set_margins(20, 20, 20)
        font_dir = Path(__file__).parent / "dejavu"
        # Use DejaVu fonts for Unicode support
        self.add_font("DejaVu", "", str(font_dir / "DejaVuSans.ttf"), uni=True)
        self.add_font("DejaVu", "B", str(font_dir / "DejaVuSans-Bold.ttf"), uni=True)
        self.add_font("DejaVu", "I", str(font_dir / "DejaVuSans-Oblique.ttf"), uni=True)
        self.add_font("DejaVu", "BI", str(font_dir / "DejaVuSans-BoldOblique.ttf"), uni=True)

    def _set_font(self, family="DejaVu", style="", size=10):
        """Helper to set DejaVu font."""
        self.set_font(family, style, size)

    def header(self):
        """Add header with document type and confidential marking."""
        if self.page_no() == 1:
            return
        self._set_font("", 8)
        self.set_text_color(100, 100, 100)
        self.cell(0, 8, f"{self.document_type} | CONFIDENTIAL | INTERNAL USE ONLY", align="L")
        self.cell(0, 8, f"Page {self.page_no()}", align="R")
        self.ln(10)
        # Draw line
        self.set_draw_color(150, 150, 150)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(5)

    def footer(self):
        """Add footer."""
        if self.page_no() == 1:
            return
        self.set_y(-20)
        self._set_font("", "I", 7)
        self.set_text_color(120, 120, 120)
        self.cell(0, 5, f"Generated: {datetime.now().strftime('%Y-%m-%d %H:%M')} | {self.document_title}", align="C")

    def add_title_page(self, title: str, subtitle: Optional[str] = None, metadata: Optional[dict] = None):
        """Add a professional title page."""
        self.set_y(60)
        self._set_font("", "B", 24)
        self.set_text_color(30, 60, 90)
        self.cell(0, 15, title, align="C", ln=True)

        if subtitle:
            self.ln(5)
            self._set_font("", "", 14)
            self.set_text_color(80, 80, 80)
            self.cell(0, 10, subtitle, align="C", ln=True)

        self.ln(20)
        # Draw accent line
        self.set_draw_color(30, 60, 90)
        self.set_line_width(1.5)
        self.line(60, self.get_y(), 150, self.get_y())
        self.set_line_width(0.2)
        self.ln(15)

        if metadata:
            self._set_font("", "", 11)
            self.set_text_color(60, 60, 60)
            for key, value in metadata.items():
                self.cell(0, 8, f"{key}: {value}", align="C", ln=True)

        self.ln(30)
        self._set_font("", "I", 9)
        self.set_text_color(150, 0, 0)
        self.cell(0, 8, "CONFIDENTIAL - INTERNAL USE ONLY", align="C", ln=True)

    def add_section_heading(self, text: str, level: int = 1):
        """Add a formatted section heading."""
        sizes = {1: 16, 2: 13, 3: 11}
        self.ln(8)
        self._set_font("", "B", sizes.get(level, 11))
        self.set_text_color(30, 60, 90)
        self.cell(0, 10, text, ln=True)
        self.set_text_color(0, 0, 0)
        self.ln(2)

    def add_paragraph(self, text: str, indent: bool = False):
        """Add a paragraph with proper formatting."""
        self._set_font("", "", 10)
        if indent:
            self.set_x(30)
            self.multi_cell(160, 6, text)
        else:
            self.multi_cell(0, 6, text)
        self.ln(3)

    def add_bullet_list(self, items: list, indent_level: int = 0):
        """Add a bullet list."""
        self._set_font("", "", 10)
        for item in items:
            prefix = "    " * indent_level + "\u2022  "
            self.set_x(20 + indent_level * 5)
            self.multi_cell(165 - indent_level * 5, 6, prefix + str(item))
        self.ln(2)

    def add_numbered_list(self, items: list):
        """Add a numbered list."""
        self._set_font("", "", 10)
        for i, item in enumerate(items, 1):
            self.set_x(25)
            self.multi_cell(160, 6, f"{i}.  {item}")
        self.ln(2)

    def add_table(self, headers: list, rows: list, col_widths: Optional[list] = None):
        """Add a formatted table."""
        if not col_widths:
            col_widths = [170 / len(headers)] * len(headers)

        # Header
        self._set_font("", "B", 9)
        self.set_fill_color(230, 235, 240)
        self.set_draw_color(100, 100, 100)
        for i, header in enumerate(headers):
            self.cell(col_widths[i], 8, str(header), border=1, fill=True, align="C")
        self.ln()

        # Rows
        self._set_font("", "", 9)
        for row in rows:
            # Check if we need a new page
            if self.get_y() + 8 > 270:
                self.add_page()
                self._set_font("", "B", 9)
                self.set_fill_color(230, 235, 240)
                for i, header in enumerate(headers):
                    self.cell(col_widths[i], 8, str(header), border=1, fill=True, align="C")
                self.ln()
                self._set_font("", "", 9)

            for i, cell in enumerate(row):
                self.cell(col_widths[i], 8, str(cell), border=1, align="L")
            self.ln()
        self.ln(5)

    def add_horizontal_line(self):
        """Add a horizontal line."""
        self.set_draw_color(180, 180, 180)
        self.line(20, self.get_y(), 190, self.get_y())
        self.ln(5)


def save_pdf_to(pdf: AuditPDF, filepath: Path):
    """Save PDF to the specified path, creating directories if needed."""
    filepath.parent.mkdir(parents=True, exist_ok=True)
    pdf.output(str(filepath))
    print(f"  [PDF] Saved: {filepath}")


# ---------------------------------------------------------------------------
# Predefined document templates
# ---------------------------------------------------------------------------

def create_planning_memo_pdf(content: str, filepath: Path, metadata: dict):
    """Create an Audit Planning Memo PDF."""
    pdf = AuditPDF(title="Audit Planning Memo", document_type="Planning Document")
    pdf.add_title_page(
        title="INTERNAL AUDIT PLANNING MEMO",
        subtitle="Q3 2026 F&B Warehouse Operations Audit",
        metadata=metadata
    )
    pdf.add_page()
    pdf.add_section_heading("1. ENGAGEMENT OVERVIEW", level=1)
    pdf.add_paragraph(content)
    save_pdf_to(pdf, filepath)
    return filepath


def create_risk_matrix_pdf(risks: list, filepath: Path):
    """Create a Risk Assessment Matrix PDF."""
    pdf = AuditPDF(title="Risk Assessment Matrix", document_type="Planning Document")
    pdf.add_title_page(
        title="RISK ASSESSMENT MATRIX",
        subtitle="Q3 2026 F&B Warehouse Operations",
        metadata={
            "Assessment Date": "2026-07-01",
            "Assessed By": "Internal Audit Team",
            "Classification": "CONFIDENTIAL"
        }
    )
    pdf.add_page()
    pdf.add_section_heading("INHERENT RISK vs. CONTROL EFFECTIVENESS", level=1)
    pdf.add_paragraph("The following matrix identifies key risk areas for the F&B warehouse operation, rated by inherent risk level and current control effectiveness.")

    headers = ["Risk Area", "Inherent Risk", "Control Effectiveness", "Residual Risk", "Priority"]
    rows = [[r["area"], r["inherent"], r["control"], r["residual"], r["priority"]] for r in risks]
    pdf.add_table(headers, rows, [45, 35, 45, 35, 40])

    pdf.add_page()
    pdf.add_section_heading("RISK DESCRIPTIONS", level=1)
    for risk in risks:
        pdf.add_section_heading(f"{risk['area']} ({risk['priority']})", level=2)
        pdf.add_paragraph(f"Description: {risk['description']}")
        pdf.add_paragraph(f"Mitigation: {risk['mitigation']}")
        pdf.add_horizontal_line()

    save_pdf_to(pdf, filepath)
    return filepath


def create_engagement_letter_pdf(content: str, filepath: Path):
    """Create an Engagement Letter PDF."""
    pdf = AuditPDF(title="Engagement Letter", document_type="Communication")
    pdf.add_title_page(
        title="INTERNAL AUDIT ENGAGEMENT LETTER",
        subtitle="F&B Warehouse Operations - Q3 2026",
        metadata={
            "Date": "2026-07-01",
            "To": "Warehouse Operations Director",
            "From": "Internal Audit Director"
        }
    )
    pdf.add_page()
    pdf.add_paragraph(content)
    save_pdf_to(pdf, filepath)
    return filepath


def create_working_paper_pdf(title: str, content: str, evidence: list, filepath: Path):
    """Create a Working Paper PDF."""
    pdf = AuditPDF(title=title, document_type="Working Paper")
    pdf.add_title_page(
        title=title.upper(),
        subtitle="F&B Warehouse Operations Audit - Q3 2026",
        metadata={
            "Prepared By": "Internal Audit Team",
            "Date": "2026-07-15",
            "Classification": "CONFIDENTIAL"
        }
    )
    pdf.add_page()
    pdf.add_section_heading("OBJECTIVE", level=1)
    pdf.add_paragraph(content.get("objective", "To evaluate controls in the assigned area."))

    pdf.add_section_heading("TEST PROCEDURES", level=1)
    pdf.add_numbered_list(content.get("procedures", ["Review relevant documentation", "Interview process owners", "Sample testing"]))

    pdf.add_section_heading("EVIDENCE SUMMARY", level=1)
    pdf.add_bullet_list(evidence)

    pdf.add_section_heading("RESULTS", level=1)
    pdf.add_paragraph(content.get("results", "Test results to be documented."))

    pdf.add_section_heading("CONCLUSION", level=1)
    pdf.add_paragraph(content.get("conclusion", "Conclusion pending completion of testing."))

    save_pdf_to(pdf, filepath)
    return filepath


def create_findings_register_pdf(findings: list, filepath: Path):
    """Create a Findings Register PDF."""
    pdf = AuditPDF(title="Findings Register", document_type="Finding Document")
    pdf.add_title_page(
        title="AUDIT FINDINGS REGISTER",
        subtitle="Q3 2026 F&B Warehouse Operations Audit",
        metadata={
            "Report Date": "2026-07-20",
            "Classification": "CONFIDENTIAL"
        }
    )
    pdf.add_page()

    # Summary table
    pdf.add_section_heading("FINDINGS SUMMARY", level=1)
    headers = ["Ref", "Area", "Rating", "Title", "Status"]
    rows = [[f["ref"], f["area"], f["rating"], f["title"], f["status"]] for f in findings]
    pdf.add_table(headers, rows, [20, 40, 25, 65, 20])

    # Detailed findings
    pdf.add_page()
    pdf.add_section_heading("DETAILED FINDINGS", level=1)
    for finding in findings:
        color_map = {
            "Critical": (200, 50, 50),
            "High": (230, 120, 50),
            "Medium": (230, 180, 50),
            "Low": (50, 150, 80)
        }
        rating_color = color_map.get(finding["rating"], (100, 100, 100))

        pdf.add_section_heading(f"{finding['ref']}: {finding['title']} [{finding['rating']}]", level=2)
        pdf.set_text_color(*rating_color)
        pdf._set_font("", "B", 10)
        pdf.cell(0, 6, f"Area: {finding['area']} | Rating: {finding['rating']} | Status: {finding['status']}", ln=True)
        pdf.set_text_color(0, 0, 0)
        pdf.ln(2)

        pdf.add_section_heading("Description", level=3)
        pdf.add_paragraph(finding["description"])

        pdf.add_section_heading("Root Cause", level=3)
        pdf.add_paragraph(finding["root_cause"])

        pdf.add_section_heading("Recommendation", level=3)
        pdf.add_paragraph(finding["recommendation"])

        pdf.add_section_heading("Management Response", level=3)
        pdf.add_paragraph(finding.get("management_response", "Pending"))
        pdf.add_horizontal_line()

    save_pdf_to(pdf, filepath)
    return filepath


def create_audit_report_pdf(report: dict, filepath: Path):
    """Create a Final Audit Report PDF."""
    pdf = AuditPDF(title="Final Audit Report", document_type="Final Report")
    pdf.add_title_page(
        title="INTERNAL AUDIT REPORT",
        subtitle="F&B Warehouse Operations - Q3 2026",
        metadata={
            "Report Date": report.get("date", "2026-07-20"),
            "Report Number": report.get("number", "IAR-2026-03"),
            "Classification": "CONFIDENTIAL"
        }
    )
    pdf.add_page()

    # Executive Summary
    pdf.add_section_heading("EXECUTIVE SUMMARY", level=1)
    pdf.add_paragraph(report.get("executive_summary", "No summary provided."))

    # Scope and Objectives
    pdf.add_section_heading("1. SCOPE AND OBJECTIVES", level=1)
    pdf.add_paragraph(report.get("scope", "Scope not defined."))

    # Key Findings Summary
    pdf.add_section_heading("2. KEY FINDINGS SUMMARY", level=1)
    pdf.add_paragraph(report.get("findings_summary", "No findings summary provided."))

    # Detailed Findings
    pdf.add_page()
    pdf.add_section_heading("3. DETAILED FINDINGS AND RECOMMENDATIONS", level=1)
    for finding in report.get("detailed_findings", []):
        pdf.add_section_heading(f"{finding['ref']}: {finding['title']}", level=2)
        pdf.add_paragraph(f"**Rating:** {finding['rating']}")
        pdf.add_paragraph(f"**Description:** {finding['description']}")
        pdf.add_paragraph(f"**Recommendation:** {finding['recommendation']}")
        pdf.add_horizontal_line()

    # Management Response
    pdf.add_page()
    pdf.add_section_heading("4. MANAGEMENT RESPONSE", level=1)
    pdf.add_paragraph(report.get("management_response", "Management response pending."))

    # Conclusion
    pdf.add_section_heading("5. OVERALL CONCLUSION", level=1)
    pdf.add_paragraph(report.get("overall_conclusion", "No conclusion provided."))

    save_pdf_to(pdf, filepath)
    return filepath


def create_follow_up_tracker_pdf(actions: list, filepath: Path):
    """Create a Follow-Up Tracking Sheet PDF."""
    pdf = AuditPDF(title="Management Action Plan Tracker", document_type="Follow-Up")
    pdf.add_title_page(
        title="MANAGEMENT ACTION PLAN TRACKER",
        subtitle="Q3 2026 F&B Warehouse Operations Audit",
        metadata={
            "Created": "2026-07-20",
            "Next Review": "2026-10-20",
            "Classification": "CONFIDENTIAL"
        }
    )
    pdf.add_page()

    pdf.add_section_heading("ACTION ITEMS SUMMARY", level=1)
    headers = ["Action ID", "Finding Ref", "Action Description", "Owner", "Due Date", "Status"]
    rows = [[a["id"], a["finding_ref"], a["description"], a["owner"], a["due_date"], a["status"]] for a in actions]
    pdf.add_table(headers, rows, [25, 25, 60, 30, 25, 25])

    pdf.add_page()
    pdf.add_section_heading("DETAILED ACTION ITEMS", level=1)
    for action in actions:
        pdf.add_section_heading(f"{action['id']}: {action['description']}", level=2)
        pdf.add_paragraph(f"**Linked Finding:** {action['finding_ref']}")
        pdf.add_paragraph(f"**Owner:** {action['owner']}")
        pdf.add_paragraph(f"**Due Date:** {action['due_date']}")
        pdf.add_paragraph(f"**Current Status:** {action['status']}")
        pdf.add_paragraph(f"**Notes:** {action.get('notes', 'None')}")
        pdf.add_horizontal_line()

    save_pdf_to(pdf, filepath)
    return filepath
