"""
Regenerate all broken/empty portfolio screenshots with professional dummy-data visualizations.
Run from the portfolio_my root directory.
"""

import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
import matplotlib.gridspec as gridspec
from matplotlib.patches import FancyBboxPatch
from PIL import Image
import os

np.random.seed(42)
OUT = "public/images/projects"

def save(fig, path_png):
    """Save as PNG then convert to WebP."""
    fig.savefig(path_png, dpi=130, bbox_inches="tight",
                facecolor=fig.get_facecolor())
    img = Image.open(path_png)
    img.save(path_png.replace(".png", ".webp"), "WEBP", quality=88)
    plt.close(fig)
    print(f"  saved {path_png}")


# ─────────────────────────────────────────────────────────────────────────────
# AUDIT-TOOLS
# ─────────────────────────────────────────────────────────────────────────────

def make_risk_assessment_audit_tools():
    """Automated risk scoring matrix – audit-tools project."""
    risks = [
        ("Cash Handling & POS",         4, 5, "Critical"),
        ("Supplier Invoice Fraud",       3, 5, "High"),
        ("Aggregator Billing Variance",  4, 4, "High"),
        ("Inventory Shrinkage",          4, 3, "High"),
        ("Staff Overtime Abuse",         3, 3, "Medium"),
        ("Food Safety Compliance",       2, 4, "Medium"),
        ("Payroll Ghost Employees",      2, 5, "High"),
        ("IT Access Controls",           3, 4, "High"),
        ("Petty Cash Misuse",            4, 2, "Medium"),
        ("Vendor Master Data Integrity", 2, 3, "Medium"),
        ("Late Banking Deposits",        3, 2, "Low"),
        ("License & Permit Compliance",  2, 2, "Low"),
    ]
    risk_colors = {"Critical": "#c0392b", "High": "#e67e22",
                   "Medium": "#f1c40f", "Low": "#27ae60"}

    fig, ax = plt.subplots(figsize=(18, 8), facecolor="#f8fafc")
    ax.set_facecolor("#f8fafc")
    ax.axis("off")

    fig.suptitle("Risk Assessment Matrix — Automated Scoring Engine",
                 fontsize=16, fontweight="bold", y=0.97, color="#1e3a5f")
    fig.text(0.5, 0.92, "Audit Tools Toolkit v2.0  |  UAE Restaurant Sector  |  Q1 2025",
             ha="center", fontsize=9, color="#666")

    cols = ["#", "Risk Area", "Likelihood\n(1–5)", "Impact\n(1–5)",
            "Risk Score", "Priority", "Recommended Action"]
    col_widths = [0.04, 0.26, 0.09, 0.09, 0.09, 0.10, 0.33]
    header_bg = "#1e3a5f"
    row_bgs = ["#ffffff", "#f0f4f8"]

    y_start = 0.85
    row_h = 0.072
    x = 0.02

    # Header
    cx = x
    for col, w in zip(cols, col_widths):
        ax.add_patch(FancyBboxPatch((cx, y_start), w - 0.005, row_h,
            boxstyle="round,pad=0.003", facecolor=header_bg, edgecolor="white", lw=0.5,
            transform=ax.transAxes, clip_on=False))
        ax.text(cx + w/2, y_start + row_h/2, col, ha="center", va="center",
                fontsize=8, color="white", fontweight="bold",
                transform=ax.transAxes)
        cx += w

    for i, (area, likelihood, impact, priority) in enumerate(risks):
        score = likelihood * impact
        y = y_start - (i + 1) * row_h
        bg = row_bgs[i % 2]
        cx = x
        row_vals = [str(i + 1), area, str(likelihood), str(impact),
                    str(score), priority, _action(priority)]
        for j, (val, w) in enumerate(zip(row_vals, col_widths)):
            cell_bg = risk_colors[priority] if j == 5 else bg
            txt_color = "white" if j == 5 else "#2d3436"
            ax.add_patch(FancyBboxPatch((cx, y), w - 0.005, row_h,
                boxstyle="round,pad=0.003", facecolor=cell_bg,
                edgecolor="#ddd", lw=0.4,
                transform=ax.transAxes, clip_on=False))
            ax.text(cx + w/2, y + row_h/2, val, ha="center", va="center",
                    fontsize=7.5, color=txt_color, transform=ax.transAxes,
                    wrap=True)
            cx += w

    # Legend
    legend_elements = [mpatches.Patch(facecolor=color, label=label)
                       for label, color in risk_colors.items()]
    ax.legend(handles=legend_elements, loc="lower right", fontsize=8,
              title="Risk Level", framealpha=0.9, bbox_to_anchor=(0.98, 0.02))

    fig.text(0.5, 0.01,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#888", style="italic")
    save(fig, f"{OUT}/audit-tools/risk-assessment.png")


def _action(priority):
    return {"Critical": "Immediate investigation + control redesign",
            "High":     "Quarterly deep-dive audit engagement",
            "Medium":   "Semi-annual monitoring + management letter",
            "Low":      "Annual review via standard checklist"}[priority]


def make_branch_checklist():
    """Branch audit checklist with scores – audit-tools."""
    sections = {
        "Cash Handling": [
            ("Daily cash float reconciled", 10, 8, "Minor variance — recount required"),
            ("POS Z-reading matches cash bag", 10, 10, ""),
            ("Void/refund authorization documented", 10, 7, "3 voids missing manager sign-off"),
            ("Safe log updated twice daily", 5,  5,  ""),
        ],
        "Food Safety & Hygiene": [
            ("Fridge/freezer temp logs complete", 10, 10, ""),
            ("Expiry dates checked — all items", 10, 9,  "1 item past best-before (discarded)"),
            ("Staff food-handler certificates valid", 10, 10, ""),
            ("Cleaning schedule signed off", 5,  4,  "Thursday deep-clean missed"),
        ],
        "Inventory Control": [
            ("Weekly stock count vs system", 10, 7,  "4.2% variance — recount scheduled"),
            ("High-value items spot-checked", 10, 10, ""),
            ("Waste log updated daily", 5,  5,  ""),
            ("Transfer documents authorised", 5,  4,  "1 transfer note unsigned"),
        ],
        "Staff Compliance": [
            ("Rosters match clock-in records", 10, 10, ""),
            ("Overtime pre-approved by GM", 10, 8,  "2 shifts OT not pre-approved"),
            ("Uniform & hygiene standards met", 5,  5,  ""),
        ],
    }
    total_possible = sum(s for items in sections.values() for _, s, _, _ in items)
    total_scored = sum(sc for items in sections.values() for _, _, sc, _ in items)
    pct = total_scored / total_possible * 100

    fig, ax = plt.subplots(figsize=(18, 11), facecolor="#f8fafc")
    ax.set_facecolor("#f8fafc")
    ax.axis("off")

    fig.suptitle("Branch Audit Checklist — On-Site Assessment Report",
                 fontsize=15, fontweight="bold", y=0.98, color="#1e3a5f")
    fig.text(0.5, 0.955,
             f"Branch: Metro District — Outlet 07  |  Auditor: J. Martinez  |  Date: 2025-01-14  |  "
             f"Overall Score: {total_scored}/{total_possible} ({pct:.0f}%)",
             ha="center", fontsize=9, color="#555")

    score_color = "#27ae60" if pct >= 85 else "#e67e22" if pct >= 70 else "#c0392b"
    rating = "SATISFACTORY" if pct >= 85 else "NEEDS IMPROVEMENT" if pct >= 70 else "UNSATISFACTORY"

    # Score badge
    ax.add_patch(FancyBboxPatch((0.75, 0.88), 0.22, 0.07,
        boxstyle="round,pad=0.01", facecolor=score_color,
        transform=ax.transAxes, clip_on=False))
    ax.text(0.86, 0.915, f"{pct:.0f}%  —  {rating}",
            ha="center", va="center", fontsize=10,
            color="white", fontweight="bold", transform=ax.transAxes)

    y_cur = 0.875
    col_xs   = [0.02, 0.38, 0.55, 0.63, 0.73, 0.88]
    col_hdrs = ["Checklist Item", "Max", "Score", "%", "Finding / Note"]
    hdr_bg = "#2c3e50"

    for j, (hdr, x0) in enumerate(zip(col_hdrs, col_xs[:-1])):
        w = col_xs[j + 1] - x0 - 0.005
        ax.add_patch(FancyBboxPatch((x0, y_cur - 0.028), w, 0.028,
            boxstyle="round,pad=0.002", facecolor=hdr_bg, edgecolor="white", lw=0.4,
            transform=ax.transAxes, clip_on=False))
        ax.text(x0 + w/2, y_cur - 0.014, hdr, ha="center", va="center",
                fontsize=8, color="white", fontweight="bold",
                transform=ax.transAxes)

    y_cur -= 0.034
    row_h = 0.046
    section_colors = {"Cash Handling": "#dbeafe", "Food Safety & Hygiene": "#dcfce7",
                      "Inventory Control": "#fef9c3", "Staff Compliance": "#fce7f3"}

    for section, items in sections.items():
        # Section header row
        ax.add_patch(FancyBboxPatch((0.02, y_cur - row_h), 0.96, row_h,
            boxstyle="round,pad=0.002", facecolor="#1e3a5f",
            transform=ax.transAxes, clip_on=False))
        sec_max = sum(m for _, m, _, _ in items)
        sec_sc  = sum(s for _, _, s, _ in items)
        ax.text(0.04, y_cur - row_h/2, f"  {section}  ({sec_sc}/{sec_max})",
                va="center", fontsize=9, color="white", fontweight="bold",
                transform=ax.transAxes)
        y_cur -= row_h + 0.004

        for k, (item, max_s, score_s, note) in enumerate(items):
            pct_i = score_s / max_s * 100
            bg = section_colors[section] if k % 2 == 0 else "#ffffff"
            ax.add_patch(FancyBboxPatch((0.02, y_cur - row_h + 0.003), 0.96, row_h - 0.004,
                boxstyle="round,pad=0.002", facecolor=bg, edgecolor="#ddd", lw=0.3,
                transform=ax.transAxes, clip_on=False))
            score_color_i = "#27ae60" if pct_i == 100 else "#e67e22" if pct_i >= 70 else "#c0392b"
            vals = [item, str(max_s), str(score_s), f"{pct_i:.0f}%", note or "—"]
            for j, (v, x0) in enumerate(zip(vals, col_xs[:-1])):
                w = col_xs[j + 1] - x0 - 0.005
                c = score_color_i if j == 3 else "#2d3436"
                fw = "bold" if j == 3 else "normal"
                ax.text(x0 + w/2, y_cur - row_h/2, v, ha="center", va="center",
                        fontsize=7.5, color=c, fontweight=fw,
                        transform=ax.transAxes)
            y_cur -= row_h

        y_cur -= 0.006

    fig.text(0.5, 0.01,
             "All branch names, personnel, and scores are synthetically generated for portfolio demonstration.",
             ha="center", fontsize=7, color="#888", style="italic")
    save(fig, f"{OUT}/audit-tools/branch-checklist.png")


def make_revenue_assurance():
    """POS vs Aggregator reconciliation dashboard – audit-tools."""
    months = ["Aug", "Sep", "Oct", "Nov", "Dec", "Jan"]
    pos_sales    = [217553, 205406, 199038, 233910, 293358, 264250]
    agg_received = [211020, 198300, 191900, 226540, 284200, 255900]
    variance     = [p - a for p, a in zip(pos_sales, agg_received)]
    flags        = [52, 38, 45, 63, 89, 74]

    fig = plt.figure(figsize=(18, 9), facecolor="#0f172a")
    gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.45, wspace=0.35,
                            top=0.88, bottom=0.08, left=0.06, right=0.97)

    fig.suptitle("Revenue Assurance — POS vs Aggregator Reconciliation",
                 fontsize=15, fontweight="bold", color="white", y=0.95)
    fig.text(0.5, 0.905,
             "Audit Tools Toolkit v2.0  |  F&B Sector  |  Aug 2024 – Jan 2025  |  DUMMY DATA",
             ha="center", fontsize=9, color="#94a3b8")

    # KPI cards (top row)
    kpis = [
        ("Total POS Sales", f"AED {sum(pos_sales)/1e6:.2f}M", "#3b82f6"),
        ("Aggregator Received", f"AED {sum(agg_received)/1e6:.2f}M", "#10b981"),
        ("Total Variance", f"AED {sum(variance):,}", "#f59e0b"),
    ]
    for i, (label, val, color) in enumerate(kpis):
        ax = fig.add_subplot(gs[0, i])
        ax.set_facecolor("#1e293b")
        ax.axis("off")
        ax.add_patch(FancyBboxPatch((0.05, 0.1), 0.9, 0.8,
            boxstyle="round,pad=0.02", facecolor="#1e293b",
            edgecolor=color, lw=2, transform=ax.transAxes, clip_on=False))
        ax.text(0.5, 0.62, val, ha="center", va="center", fontsize=22,
                fontweight="bold", color=color, transform=ax.transAxes)
        ax.text(0.5, 0.28, label, ha="center", va="center", fontsize=9,
                color="#94a3b8", transform=ax.transAxes)

    # POS vs Received bar chart
    ax1 = fig.add_subplot(gs[1, :2])
    ax1.set_facecolor("#1e293b")
    x = np.arange(len(months))
    w = 0.35
    ax1.bar(x - w/2, [v/1000 for v in pos_sales],    w, label="POS Sales",          color="#3b82f6", alpha=0.9)
    ax1.bar(x + w/2, [v/1000 for v in agg_received], w, label="Aggregator Received", color="#10b981", alpha=0.9)
    ax1.set_xticks(x); ax1.set_xticklabels(months, color="white")
    ax1.set_ylabel("AED (000s)", color="#94a3b8"); ax1.tick_params(colors="white")
    ax1.set_title("Monthly POS vs Aggregator Revenue", color="white", fontweight="bold")
    ax1.spines[:].set_color("#334155"); ax1.yaxis.label.set_color("#94a3b8")
    ax1.legend(facecolor="#1e293b", labelcolor="white", fontsize=8)
    ax1.set_facecolor("#1e293b")
    for spine in ax1.spines.values(): spine.set_color("#334155")

    # Variance + flags
    ax2 = fig.add_subplot(gs[1, 2])
    ax2.set_facecolor("#1e293b")
    color_bars = ["#ef4444" if v > 5000 else "#f59e0b" for v in variance]
    ax2.bar(months, [v/1000 for v in variance], color=color_bars, alpha=0.9)
    ax2_r = ax2.twinx()
    ax2_r.plot(months, flags, "o--", color="#a78bfa", linewidth=2, label="Fraud Flags")
    ax2_r.set_ylabel("Fraud Flags", color="#a78bfa")
    ax2_r.tick_params(colors="#a78bfa")
    ax2.set_title("Variance (AED 000s) & Fraud Flags", color="white", fontweight="bold")
    ax2.set_ylabel("Variance AED (000s)", color="#94a3b8")
    ax2.tick_params(colors="white")
    for spine in ax2.spines.values(): spine.set_color("#334155")
    ax2.set_facecolor("#1e293b")
    ax2_r.legend(facecolor="#1e293b", labelcolor="white", fontsize=8)

    fig.text(0.5, 0.02,
             "All figures are synthetically generated for portfolio demonstration. No real client data.",
             ha="center", fontsize=7, color="#475569", style="italic")
    save(fig, f"{OUT}/audit-tools/revenue-assurance.png")


def make_presentation_sample():
    """Audit Committee presentation mockup – audit-tools."""
    fig = plt.figure(figsize=(18, 11), facecolor="#1e3a5f")
    gs  = gridspec.GridSpec(3, 3, figure=fig, hspace=0.5, wspace=0.35,
                            top=0.82, bottom=0.06, left=0.04, right=0.97)

    # Slide header bar
    _p = FancyBboxPatch((0, 0.88), 1.0, 0.12,
        boxstyle="square,pad=0", facecolor="#1e3a5f",
        transform=fig.transFigure, clip_on=False)
    fig.add_artist(_p)
    fig.text(0.04, 0.93, "INTERNAL AUDIT — QUARTERLY UPDATE",
             fontsize=18, fontweight="bold", color="white", va="center")
    fig.text(0.04, 0.895, "Presented to the Audit Committee  |  Q1 FY2025  |  CONFIDENTIAL — DUMMY DATA",
             fontsize=9, color="#93c5fd", va="center")
    fig.text(0.85, 0.915, "SLIDE 3 of 12", fontsize=9, color="#93c5fd",
             ha="center", va="center")

    # KPI row
    kpis = [
        ("Audit Plan\nCompletion", "82%", "#22c55e"),
        ("Open Findings", "47", "#f59e0b"),
        ("Critical\nFindings", "6", "#ef4444"),
        ("Overdue\nRemediation", "12", "#f97316"),
        ("Avg. Days\nto Close", "34", "#3b82f6"),
        ("Assurance\nCoverage", "91%", "#8b5cf6"),
    ]
    for col, (label, val, color) in enumerate(kpis[:3]):
        ax = fig.add_subplot(gs[0, col])
        ax.set_facecolor("white"); ax.axis("off")
        ax.add_patch(FancyBboxPatch((0.05, 0.08), 0.9, 0.84,
            boxstyle="round,pad=0.02", facecolor="white",
            edgecolor=color, lw=3, transform=ax.transAxes, clip_on=False))
        ax.text(0.5, 0.62, val, ha="center", va="center",
                fontsize=28, fontweight="bold", color=color, transform=ax.transAxes)
        ax.text(0.5, 0.25, label, ha="center", va="center",
                fontsize=9, color="#374151", transform=ax.transAxes)

    # Findings by severity (pie)
    ax_pie = fig.add_subplot(gs[1, 0])
    ax_pie.set_facecolor("white")
    wedges, texts, autotexts = ax_pie.pie(
        [6, 18, 23], labels=["Critical", "High", "Medium"],
        autopct="%1.0f%%", startangle=90,
        colors=["#ef4444", "#f59e0b", "#3b82f6"],
        wedgeprops={"edgecolor": "white", "linewidth": 2})
    for t in texts: t.set_fontsize(8)
    for a in autotexts: a.set_fontsize(8); a.set_color("white"); a.set_fontweight("bold")
    ax_pie.set_title("Findings by Severity", fontweight="bold", fontsize=10)

    # Remediation status (horizontal bars)
    ax_rem = fig.add_subplot(gs[1, 1])
    ax_rem.set_facecolor("white")
    depts = ["Finance", "Operations", "IT", "HR", "Supply Chain"]
    done  = [8, 5, 3, 6, 4]
    inprog= [2, 4, 5, 1, 3]
    over  = [1, 2, 3, 0, 2]
    y = np.arange(len(depts))
    ax_rem.barh(y, done,  color="#22c55e", label="Closed")
    ax_rem.barh(y, inprog, left=done,      color="#f59e0b", label="In Progress")
    ax_rem.barh(y, over, left=[d+p for d,p in zip(done,inprog)], color="#ef4444", label="Overdue")
    ax_rem.set_yticks(y); ax_rem.set_yticklabels(depts, fontsize=8)
    ax_rem.set_title("Remediation by Department", fontweight="bold", fontsize=10)
    ax_rem.legend(fontsize=7, loc="lower right")
    for spine in ax_rem.spines.values(): spine.set_visible(False)

    # Trend line
    ax_trend = fig.add_subplot(gs[1, 2])
    ax_trend.set_facecolor("white")
    quarters = ["Q2\n'24", "Q3\n'24", "Q4\n'24", "Q1\n'25"]
    open_f   = [62, 55, 51, 47]
    closed_f = [31, 38, 42, 36]
    ax_trend.plot(quarters, open_f,   "o-", color="#ef4444", linewidth=2, label="Open")
    ax_trend.plot(quarters, closed_f, "s--", color="#22c55e", linewidth=2, label="Closed")
    ax_trend.set_title("Findings Trend", fontweight="bold", fontsize=10)
    ax_trend.legend(fontsize=8); ax_trend.grid(axis="y", alpha=0.3)
    for spine in ax_trend.spines.values(): spine.set_color("#e5e7eb")

    # Key findings table
    ax_tbl = fig.add_subplot(gs[2, :])
    ax_tbl.axis("off")
    ax_tbl.set_facecolor("white")
    ax_tbl.set_title("Key Findings Requiring Audit Committee Attention",
                     fontweight="bold", fontsize=11, pad=8, loc="left")
    tbl_data = [
        ["F-2025-01", "Critical", "Finance",      "Segregation of duties — AP & GL access combined",        "CFO", "2025-02-28"],
        ["F-2025-02", "Critical", "IT",           "Privileged admin accounts lack MFA enforcement",          "CTO", "2025-03-15"],
        ["F-2025-03", "High",     "Operations",   "Vendor payments processed without dual authorisation",    "COO", "2025-03-31"],
        ["F-2025-04", "High",     "Supply Chain", "3-way match bypass for 14 high-value POs > AED 500K",    "CPO", "2025-04-15"],
        ["F-2025-05", "High",     "HR",           "Terminated employee system access not revoked within SLA","CHRO","2025-03-20"],
    ]
    col_labels = ["Ref", "Severity", "Area", "Finding", "Owner", "Due Date"]
    tbl = ax_tbl.table(cellText=tbl_data, colLabels=col_labels,
                       cellLoc="center", loc="center", bbox=[0, 0, 1, 0.92])
    tbl.auto_set_font_size(False); tbl.set_fontsize(8)
    sev_colors = {"Critical": "#fee2e2", "High": "#fef3c7"}
    for (row, col), cell in tbl.get_celld().items():
        if row == 0:
            cell.set_facecolor("#1e3a5f"); cell.set_text_props(color="white", fontweight="bold")
        else:
            sev = tbl_data[row-1][1]
            cell.set_facecolor(sev_colors.get(sev, "#f9fafb"))
        cell.set_edgecolor("#e5e7eb")

    fig.text(0.5, 0.01,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#93c5fd", style="italic")
    save(fig, f"{OUT}/audit-tools/presentation-sample.png")


# ─────────────────────────────────────────────────────────────────────────────
# INTERNAL-TRACKER
# ─────────────────────────────────────────────────────────────────────────────

def make_ceo_dashboard():
    """CEO executive dashboard – internal-tracker."""
    fig = plt.figure(figsize=(18, 10), facecolor="#0f172a")
    gs  = gridspec.GridSpec(3, 4, figure=fig, hspace=0.55, wspace=0.35,
                            top=0.88, bottom=0.07, left=0.04, right=0.97)

    fig.suptitle("CEO Executive Dashboard — Internal Audit & Risk", fontsize=16,
                 fontweight="bold", color="white", y=0.95)
    fig.text(0.5, 0.905, "Internal Audit Tracker  |  Period: Q1 FY2025  |  DUMMY DATA",
             ha="center", fontsize=9, color="#94a3b8")

    kpis = [
        ("Audit Plan\nCompletion", "82%",     "#22c55e"),
        ("Revenue\nProtected",     "AED 7.7M", "#3b82f6"),
        ("Fraud Incidents\nReduced","78%",     "#a78bfa"),
        ("Critical Findings\nOpen", "6",       "#ef4444"),
    ]
    for i, (label, val, color) in enumerate(kpis):
        ax = fig.add_subplot(gs[0, i])
        ax.set_facecolor("#1e293b"); ax.axis("off")
        ax.add_patch(FancyBboxPatch((0.06, 0.1), 0.88, 0.8,
            boxstyle="round,pad=0.02", facecolor="#1e293b",
            edgecolor=color, lw=2.5, transform=ax.transAxes, clip_on=False))
        ax.text(0.5, 0.62, val, ha="center", va="center",
                fontsize=24, fontweight="bold", color=color, transform=ax.transAxes)
        ax.text(0.5, 0.25, label, ha="center", va="center",
                fontsize=9, color="#94a3b8", transform=ax.transAxes)

    # Audit completion by domain
    ax1 = fig.add_subplot(gs[1, :2])
    ax1.set_facecolor("#1e293b")
    domains = ["Finance & AP", "IT & ITGC", "Operations", "HR & Payroll",
               "Supply Chain", "Compliance", "Fraud Risk"]
    pcts    = [100, 75, 83, 100, 60, 90, 100]
    colors  = ["#22c55e" if p == 100 else "#3b82f6" if p >= 75 else "#f59e0b" for p in pcts]
    bars = ax1.barh(domains, pcts, color=colors, alpha=0.9)
    ax1.set_xlim(0, 115)
    for bar, pct in zip(bars, pcts):
        ax1.text(bar.get_width() + 1, bar.get_y() + bar.get_height()/2,
                 f"{pct}%", va="center", color="white", fontsize=8)
    ax1.set_title("Audit Plan Completion by Domain", color="white", fontweight="bold")
    ax1.tick_params(colors="white"); ax1.set_xlabel("% Complete", color="#94a3b8")
    for spine in ax1.spines.values(): spine.set_color("#334155")
    ax1.set_facecolor("#1e293b")

    # Risk exposure trend
    ax2 = fig.add_subplot(gs[1, 2:])
    ax2.set_facecolor("#1e293b")
    months = ["Sep", "Oct", "Nov", "Dec", "Jan", "Feb"]
    high   = [18, 16, 14, 11, 9, 6]
    med    = [24, 22, 25, 21, 19, 18]
    ax2.fill_between(months, high, alpha=0.4, color="#ef4444")
    ax2.plot(months, high, "o-", color="#ef4444", linewidth=2, label="Critical/High")
    ax2.fill_between(months, med, alpha=0.3, color="#f59e0b")
    ax2.plot(months, med, "s--", color="#f59e0b", linewidth=2, label="Medium")
    ax2.set_title("Open Risk Exposure Trend", color="white", fontweight="bold")
    ax2.tick_params(colors="white"); ax2.legend(facecolor="#1e293b", labelcolor="white", fontsize=8)
    ax2.set_facecolor("#1e293b")
    for spine in ax2.spines.values(): spine.set_color("#334155")

    # Top risks table
    ax3 = fig.add_subplot(gs[2, :])
    ax3.axis("off"); ax3.set_facecolor("#1e293b")
    ax3.set_title("Top Risks Requiring CEO Attention", color="white",
                  fontweight="bold", fontsize=11, pad=8, loc="left")
    rows = [
        ["R-001", "Critical", "IT", "Admin credentials shared across 3 systems — breach risk",          "AED 12M"],
        ["R-002", "Critical", "Finance", "AP dual-control bypass detected — SAR 480K exposure",         "AED 8.5M"],
        ["R-003", "High",     "Operations", "Vendor contract renewals without competitive tender (×8)", "AED 3.2M"],
        ["R-004", "High",     "HR", "Ghost contractor payments — 4 IDs unverified since Nov 2024",      "AED 1.8M"],
    ]
    tbl = ax3.table(cellText=rows,
                    colLabels=["Risk ID", "Rating", "Domain", "Description", "Est. Exposure"],
                    cellLoc="center", loc="center", bbox=[0, 0, 1, 0.85])
    tbl.auto_set_font_size(False); tbl.set_fontsize(8.5)
    for (r, c), cell in tbl.get_celld().items():
        if r == 0:
            cell.set_facecolor("#1e3a5f"); cell.set_text_props(color="white", fontweight="bold")
            cell.set_edgecolor("#334155")
        else:
            rating = rows[r-1][1]
            cell.set_facecolor("#2d1b1b" if rating == "Critical" else "#2d2210")
            cell.set_text_props(color="#e2e8f0")
            cell.set_edgecolor("#334155")

    fig.text(0.5, 0.02,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#475569", style="italic")
    save(fig, f"{OUT}/internal-tracker/ceo-dashboard.png")


def make_audit_committee_dashboard():
    """Audit Committee governance dashboard – internal-tracker."""
    fig = plt.figure(figsize=(18, 10), facecolor="#f8fafc")
    gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.5, wspace=0.35,
                            top=0.88, bottom=0.07, left=0.04, right=0.97)

    # Header banner
    _p = FancyBboxPatch((0, 0.89), 1, 0.11,
        boxstyle="square,pad=0", facecolor="#1e3a5f",
        transform=fig.transFigure, clip_on=False)
    fig.add_artist(_p)
    fig.text(0.5, 0.945, "AUDIT COMMITTEE DASHBOARD — GOVERNANCE & COMPLIANCE OVERSIGHT",
             ha="center", fontsize=14, fontweight="bold", color="white", va="center")
    fig.text(0.5, 0.905, "Internal Audit Tracker  |  Q1 FY2025  |  Prepared by: Chief Audit Executive  |  DUMMY DATA",
             ha="center", fontsize=9, color="#93c5fd", va="center")

    # Audit universe summary
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor("white")
    universe = ["Planned", "In Progress", "Complete", "Deferred"]
    vals     = [24, 5, 19, 2]
    colors   = ["#3b82f6", "#f59e0b", "#22c55e", "#94a3b8"]
    wedges, texts, autotexts = ax1.pie(vals, labels=universe, autopct="%d",
                                        colors=colors, startangle=90,
                                        wedgeprops={"edgecolor": "white", "lw": 2})
    for t in texts: t.set_fontsize(9)
    for a in autotexts: a.set_fontsize(9); a.set_fontweight("bold")
    ax1.set_title("Audit Universe (50 Audits)", fontweight="bold", fontsize=11)

    # Findings age analysis
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.set_facecolor("white")
    age_bands = ["0–30 days", "31–60 days", "61–90 days", "90+ days"]
    counts    = [14, 11, 9, 13]
    bar_colors= ["#22c55e", "#f59e0b", "#f97316", "#ef4444"]
    ax2.bar(age_bands, counts, color=bar_colors, edgecolor="white", linewidth=1.5)
    ax2.set_title("Open Findings by Age (47 total)", fontweight="bold", fontsize=11)
    ax2.set_ylabel("Count"); ax2.grid(axis="y", alpha=0.3)
    for spine in ax2.spines.values(): spine.set_color("#e5e7eb")
    for bar, cnt in zip(ax2.patches, counts):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 0.3,
                 str(cnt), ha="center", va="bottom", fontsize=10, fontweight="bold")

    # Compliance heat map by area
    ax3 = fig.add_subplot(gs[0, 2])
    ax3.set_facecolor("white")
    areas   = ["Finance", "IT", "Ops", "HR", "Supply\nChain"]
    metrics = ["Controls\nAdequacy", "Testing\nCoverage", "Mgmt\nResponse"]
    data    = np.array([[85, 90, 78], [70, 80, 65], [88, 92, 85], [95, 88, 90], [72, 78, 70]])
    im = ax3.imshow(data, cmap="RdYlGn", vmin=60, vmax=100, aspect="auto")
    ax3.set_xticks(range(3)); ax3.set_xticklabels(metrics, fontsize=8)
    ax3.set_yticks(range(5)); ax3.set_yticklabels(areas, fontsize=8)
    ax3.set_title("Compliance Score Heatmap (%)", fontweight="bold", fontsize=11)
    for i in range(5):
        for j in range(3):
            ax3.text(j, i, f"{data[i,j]}%", ha="center", va="center",
                     fontsize=9, fontweight="bold", color="black")
    plt.colorbar(im, ax=ax3, shrink=0.8)

    # Remediation tracker table
    ax4 = fig.add_subplot(gs[1, :])
    ax4.axis("off")
    ax4.set_title("Management Action Plan — Status Update",
                  fontweight="bold", fontsize=12, pad=8, loc="left")
    map_rows = [
        ["MAP-001", "Finance — AP Segregation of Duties", "Critical", "CFO",     "2025-02-28", "In Progress", "75%"],
        ["MAP-002", "IT — MFA on Privileged Accounts",    "Critical", "CTO",     "2025-03-15", "In Progress", "40%"],
        ["MAP-003", "Ops — Dual Auth for Vendor Payments","High",     "COO",     "2025-03-31", "Not Started", "0%"],
        ["MAP-004", "SC — 3-Way Match Policy Update",     "High",     "CPO",     "2025-04-15", "In Progress", "60%"],
        ["MAP-005", "HR — Leavers Access Revocation SLA", "High",     "CHRO",    "2025-03-20", "Complete",    "100%"],
        ["MAP-006", "IT — Patch Management Cycle",        "Medium",   "IT Mgr",  "2025-04-30", "In Progress", "55%"],
    ]
    tbl = ax4.table(
        cellText=map_rows,
        colLabels=["MAP Ref", "Finding Summary", "Priority", "Owner", "Due Date", "Status", "Completion"],
        cellLoc="center", loc="center", bbox=[0, 0, 1, 0.88])
    tbl.auto_set_font_size(False); tbl.set_fontsize(8.5)
    status_colors = {"Complete": "#dcfce7", "In Progress": "#fef3c7", "Not Started": "#fee2e2"}
    for (r, c), cell in tbl.get_celld().items():
        if r == 0:
            cell.set_facecolor("#1e3a5f"); cell.set_text_props(color="white", fontweight="bold")
        else:
            status = map_rows[r-1][5]
            cell.set_facecolor(status_colors.get(status, "white"))
        cell.set_edgecolor("#e5e7eb")

    fig.text(0.5, 0.02,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#888", style="italic")
    save(fig, f"{OUT}/internal-tracker/audit-committee-dashboard.png")


def make_risk_assessment_internal_tracker():
    """Risk likelihood-impact matrix – internal-tracker."""
    fig, ax = plt.subplots(figsize=(14, 11), facecolor="#f8fafc")
    ax.set_facecolor("#f8fafc")

    ax.set_xlim(0.5, 5.5); ax.set_ylim(0.5, 5.5)
    ax.set_xlabel("IMPACT →", fontsize=12, fontweight="bold", color="#374151")
    ax.set_ylabel("LIKELIHOOD →", fontsize=12, fontweight="bold", color="#374151")
    ax.set_title("Risk Assessment Matrix — Likelihood vs Impact\nInternal Audit Tracker | Q1 FY2025",
                 fontsize=14, fontweight="bold", pad=15, color="#1e3a5f")

    # Color zones
    for i in range(1, 6):
        for j in range(1, 6):
            score = i * j
            c = "#fee2e2" if score >= 15 else "#fef3c7" if score >= 8 else "#dcfce7"
            ax.add_patch(plt.Rectangle((j - 0.5, i - 0.5), 1, 1,
                                       facecolor=c, edgecolor="#e5e7eb", lw=0.8, zorder=0))
            ax.text(j, i, str(score), ha="center", va="center",
                    fontsize=9, color="#9ca3af", alpha=0.7)

    # Risk points
    risks = [
        (4.2, 4.8, "AP Segregation\nof Duties",     "Critical", "#dc2626"),
        (3.8, 4.5, "MFA Not\nEnforced",              "Critical", "#dc2626"),
        (4.0, 3.6, "Vendor Payment\nDual Auth",      "High",     "#d97706"),
        (3.2, 3.8, "3-Way Match\nBypass",            "High",     "#d97706"),
        (2.8, 3.5, "Ghost\nContractors",             "High",     "#d97706"),
        (3.5, 2.5, "Patch Mgmt\nDelay",              "Medium",   "#ca8a04"),
        (2.2, 3.0, "Training\nCompliance",           "Medium",   "#ca8a04"),
        (1.8, 2.2, "License\nRenewal",               "Low",      "#16a34a"),
        (1.5, 1.5, "Office Supply\nPetty Cash",      "Low",      "#16a34a"),
        (4.5, 2.0, "Data Privacy\nPDPL",             "Medium",   "#ca8a04"),
        (2.5, 4.2, "Cyber\nIncident",                "High",     "#d97706"),
    ]

    for x, y, label, level, color in risks:
        ax.scatter(x, y, s=220, color=color, zorder=5, edgecolors="white", linewidth=1.5)
        ax.annotate(label, (x, y), textcoords="offset points", xytext=(10, 6),
                    fontsize=7, color=color, fontweight="bold",
                    bbox=dict(boxstyle="round,pad=0.2", facecolor="white",
                              edgecolor=color, alpha=0.9))

    ax.set_xticks(range(1, 6))
    ax.set_xticklabels(["1\nNegligible", "2\nMinor", "3\nModerate", "4\nMajor", "5\nCatastrophic"])
    ax.set_yticks(range(1, 6))
    ax.set_yticklabels(["1\nRare", "2\nUnlikely", "3\nPossible", "4\nLikely", "5\nAlmost Certain"])

    legend_elements = [
        mpatches.Patch(facecolor="#fee2e2", edgecolor="#dc2626", label="Critical (15–25)"),
        mpatches.Patch(facecolor="#fef3c7", edgecolor="#d97706", label="High (8–14)"),
        mpatches.Patch(facecolor="#dcfce7", edgecolor="#16a34a", label="Low–Medium (1–7)"),
    ]
    ax.legend(handles=legend_elements, loc="lower right", fontsize=9, framealpha=0.95)
    ax.grid(False)

    fig.text(0.5, 0.01,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#888", style="italic")
    save(fig, f"{OUT}/internal-tracker/risk-assessment.png")


def make_presentation_executive_summary():
    """Executive summary PowerPoint slide mockup – internal-tracker."""
    fig = plt.figure(figsize=(18, 11), facecolor="#1e3a5f")
    gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.55, wspace=0.35,
                            top=0.80, bottom=0.07, left=0.04, right=0.97)

    # Header
    _p = FancyBboxPatch((0, 0.85), 1, 0.15, boxstyle="square,pad=0",
        facecolor="#1e3a5f", transform=fig.transFigure, clip_on=False)
    fig.add_artist(_p)
    fig.text(0.05, 0.93, "EXECUTIVE SUMMARY", fontsize=20, fontweight="bold",
             color="white", va="center")
    fig.text(0.05, 0.875, "Internal Audit Director Report  |  Q1 FY2025  |  Board Presentation  |  DUMMY DATA",
             fontsize=9, color="#93c5fd", va="center")
    fig.text(0.85, 0.905, "SLIDE 2 of 10", fontsize=9, color="#93c5fd",
             ha="center", va="center")

    # KPI tiles (top row, light bg for contrast)
    kpi_data = [
        ("Audit Plan\nComplete", "82%",    "#22c55e", "19 of 24 engagements done"),
        ("Financial Impact\nIdentified", "AED 7.7M", "#3b82f6", "3.2M recovered + 4.5M protected"),
        ("High-Risk\nFindings", "6",       "#ef4444", "Require immediate management action"),
    ]
    for i, (label, val, color, sub) in enumerate(kpi_data):
        ax = fig.add_subplot(gs[0, i])
        ax.set_facecolor("#f8fafc"); ax.axis("off")
        ax.add_patch(FancyBboxPatch((0.04, 0.06), 0.92, 0.88,
            boxstyle="round,pad=0.02", facecolor="#f8fafc",
            edgecolor=color, lw=3, transform=ax.transAxes, clip_on=False))
        ax.text(0.5, 0.68, val, ha="center", va="center",
                fontsize=30, fontweight="bold", color=color, transform=ax.transAxes)
        ax.text(0.5, 0.44, label, ha="center", va="center",
                fontsize=10, color="#374151", fontweight="bold", transform=ax.transAxes)
        ax.text(0.5, 0.18, sub, ha="center", va="center",
                fontsize=7.5, color="#6b7280", transform=ax.transAxes)

    # Bottom: findings + bullets
    ax_bar = fig.add_subplot(gs[1, :2])
    ax_bar.set_facecolor("#f8fafc")
    quarters = ["Q2'24", "Q3'24", "Q4'24", "Q1'25"]
    crit = [3, 4, 5, 6]; high = [10, 12, 11, 18]; med = [15, 18, 20, 23]
    x = np.arange(len(quarters)); w = 0.25
    ax_bar.bar(x - w, crit, w, label="Critical", color="#ef4444")
    ax_bar.bar(x,     high, w, label="High",     color="#f59e0b")
    ax_bar.bar(x + w, med,  w, label="Medium",   color="#3b82f6")
    ax_bar.set_xticks(x); ax_bar.set_xticklabels(quarters)
    ax_bar.set_title("Findings Volume by Severity — Quarterly Trend",
                     fontweight="bold", fontsize=11)
    ax_bar.legend(fontsize=9); ax_bar.grid(axis="y", alpha=0.3)
    for spine in ax_bar.spines.values(): spine.set_color("#e5e7eb")

    ax_txt = fig.add_subplot(gs[1, 2])
    ax_txt.set_facecolor("#f8fafc"); ax_txt.axis("off")
    ax_txt.set_title("Key Messages", fontweight="bold", fontsize=11, loc="left")
    messages = [
        ("Assurance Coverage", "91% of high-risk processes covered"),
        ("Fraud Reduction",    "78% decline in fraud incidents (6 months)"),
        ("Automation ROI",     "100% population testing — 2.3M txns/month"),
        ("Remediation Rate",   "63% of prior-year findings fully closed"),
        ("Next Quarter Focus", "SOX ICFR walkthroughs & PDPL compliance"),
    ]
    y_pos = 0.88
    for title_m, body in messages:
        ax_txt.text(0.03, y_pos, f"  {title_m}:", fontsize=9,
                    fontweight="bold", color="#1e3a5f", transform=ax_txt.transAxes)
        ax_txt.text(0.03, y_pos - 0.09, f"  {body}", fontsize=8.5,
                    color="#374151", transform=ax_txt.transAxes)
        y_pos -= 0.22

    fig.text(0.5, 0.02,
             "All data is synthetically generated for portfolio demonstration. No real client information.",
             ha="center", fontsize=7, color="#93c5fd", style="italic")
    save(fig, f"{OUT}/internal-tracker/presentation-executive-summary.png")


# ─────────────────────────────────────────────────────────────────────────────
# RESTAURANT-AUDIT
# ─────────────────────────────────────────────────────────────────────────────

def make_restaurant_audit_checklist():
    """Restaurant audit checklist with full dummy data."""
    checklist = {
        "Kitchen & Food Safety": [
            ("Fridge temp logs updated (2x daily)",    "Y", 10, ""),
            ("Freezer temp within -18°C to -22°C",     "Y", 10, ""),
            ("FIFO rotation applied to all stock",     "Y", 10, ""),
            ("Expiry date check — all food items",     "N",  0, "3 items past use-by — discarded"),
            ("Raw/cooked separation maintained",       "Y", 10, ""),
            ("Allergen labelling correct & visible",   "Y", 10, ""),
        ],
        "Cash & POS Controls": [
            ("Opening float verified vs system",       "Y", 10, ""),
            ("No voids without manager PIN",           "P",  5, "2 voids — PIN not captured in log"),
            ("Z-reading matches cash bag",             "Y", 10, ""),
            ("Discounts within authorisation limit",   "Y", 10, ""),
            ("Daily banking deposit completed",        "N",  0, "Deposit 2 days late — corrected"),
            ("Petty cash reconciled & receipted",      "Y", 10, ""),
        ],
        "Staff & HR Compliance": [
            ("All staff have valid health cert.",      "Y", 10, ""),
            ("Rota matches actual hours worked",       "P",  7, "15 min gap on Sat shift"),
            ("Uniform & personal hygiene standards",   "Y", 10, ""),
            ("OT pre-approved by GM",                  "Y", 10, ""),
            ("Training record up to date",             "N",  0, "2 staff fire-safety cert expired"),
        ],
        "Inventory & Waste": [
            ("Weekly stock count vs POS system",       "P",  6, "3.8% variance — recount Monday"),
            ("Waste log completed daily",              "Y", 10, ""),
            ("Transfer docs authorised & filed",       "Y", 10, ""),
            ("No unauthorised write-offs",             "Y", 10, ""),
        ],
    }

    total_max = sum(pts for items in checklist.values() for _, _, pts, _ in items)
    total_scored = sum(sc for items in checklist.values() for _, _, sc, _ in items)
    pct = total_scored / total_max * 100
    rating = "SATISFACTORY" if pct >= 85 else "NEEDS IMPROVEMENT" if pct >= 70 else "UNSATISFACTORY"
    r_color = "#16a34a" if pct >= 85 else "#d97706" if pct >= 70 else "#dc2626"

    fig, ax = plt.subplots(figsize=(18, 13), facecolor="#f8fafc")
    ax.set_facecolor("#f8fafc"); ax.axis("off")

    fig.suptitle("Restaurant Audit Checklist — On-Site Inspection Report",
                 fontsize=15, fontweight="bold", y=0.985, color="#1e3a5f")
    fig.text(0.5, 0.963,
             "Outlet: Harbour View — Unit 12  |  Auditor: K. Al Rashid  |  "
             f"Date: 2025-01-22  |  Score: {total_scored}/{total_max} ({pct:.0f}%)  |  Rating: {rating}",
             ha="center", fontsize=9, color="#555")

    # Rating badge
    ax.add_patch(FancyBboxPatch((0.72, 0.945), 0.26, 0.04,
        boxstyle="round,pad=0.01", facecolor=r_color,
        transform=ax.transAxes, clip_on=False))
    ax.text(0.85, 0.965, f"{rating}  |  {pct:.0f}%",
            ha="center", va="center", fontsize=9, color="white",
            fontweight="bold", transform=ax.transAxes)

    col_xs   = [0.01, 0.44, 0.52, 0.59, 0.67, 0.77, 0.99]
    col_hdrs = ["Checklist Item", "Result", "Max", "Score", "%", "Observation / Finding"]
    row_h = 0.038
    y_cur = 0.935

    for j, (hdr, x0) in enumerate(zip(col_hdrs, col_xs[:-1])):
        w = col_xs[j+1] - x0 - 0.005
        ax.add_patch(FancyBboxPatch((x0, y_cur - row_h), w, row_h,
            boxstyle="round,pad=0.002", facecolor="#1e3a5f", edgecolor="white", lw=0.3,
            transform=ax.transAxes, clip_on=False))
        ax.text(x0 + w/2, y_cur - row_h/2, hdr, ha="center", va="center",
                fontsize=8, color="white", fontweight="bold", transform=ax.transAxes)

    y_cur -= row_h + 0.004
    section_bgs = {"Kitchen & Food Safety": "#dbeafe",
                   "Cash & POS Controls":   "#fce7f3",
                   "Staff & HR Compliance": "#dcfce7",
                   "Inventory & Waste":     "#fef9c3"}

    result_colors = {"Y": "#16a34a", "N": "#dc2626", "P": "#d97706"}
    result_labels = {"Y": "PASS", "N": "FAIL", "P": "PARTIAL"}

    for section, items in checklist.items():
        sec_max = sum(m for _, _, m, _ in items)
        sec_sc  = sum(s for _, _, s, _ in items)
        ax.add_patch(FancyBboxPatch((0.01, y_cur - row_h), 0.98, row_h,
            boxstyle="round,pad=0.002", facecolor="#2c3e50",
            transform=ax.transAxes, clip_on=False))
        ax.text(0.03, y_cur - row_h/2,
                f"  {section}  ({sec_sc}/{sec_max}  —  {sec_sc/sec_max*100:.0f}%)",
                va="center", fontsize=9, color="white", fontweight="bold",
                transform=ax.transAxes)
        y_cur -= row_h + 0.003

        for k, (item, result, max_s, note) in enumerate(items):
            pct_i = (max_s and (max_s and 0) or 0) if max_s == 0 else (
                0 if result == "N" else (int(max_s * 0.6) if result == "P" else max_s)) / max_s * 100
            score_i = 0 if result == "N" else (int(max_s * 0.6) if result == "P" else max_s)
            pct_i = score_i / max_s * 100 if max_s else 0
            bg = section_bgs[section] if k % 2 == 0 else "white"
            ax.add_patch(FancyBboxPatch((0.01, y_cur - row_h + 0.002), 0.98, row_h - 0.003,
                boxstyle="round,pad=0.002", facecolor=bg, edgecolor="#ddd", lw=0.3,
                transform=ax.transAxes, clip_on=False))
            vals = [item, result_labels[result], str(max_s), str(score_i), f"{pct_i:.0f}%", note or "—"]
            txt_colors = [None, result_colors[result], None, None,
                          result_colors[result], "#6b7280"]
            for j, (v, x0) in enumerate(zip(vals, col_xs[:-1])):
                w = col_xs[j+1] - x0 - 0.005
                c = txt_colors[j] or "#2d3436"
                fw = "bold" if j in (1, 4) else "normal"
                ax.text(x0 + w/2, y_cur - row_h/2, v,
                        ha="center", va="center", fontsize=7.5,
                        color=c, fontweight=fw, transform=ax.transAxes)
            y_cur -= row_h

        y_cur -= 0.005

    fig.text(0.5, 0.01,
             "All outlet names, personnel, and data are synthetically generated for portfolio demonstration.",
             ha="center", fontsize=7, color="#888", style="italic")
    save(fig, f"{OUT}/restaurant-audit/audit-checklist.png")


# ─────────────────────────────────────────────────────────────────────────────
# FRAUD-CASES
# ─────────────────────────────────────────────────────────────────────────────

def make_fraud_cases_analysis():
    """Fraud cases analysis with fully dummy company names."""
    cases = [
        ("Pinnacle Advisory Group",    2022, "Critical", "Massive accounting fraud — fictitious revenue booked via channel stuffing; CFO and VP Finance indicted.",          "$892M"),
        ("Meridian & Partners LLP",    2023, "High",     "Corruption scandal: bribes paid to secure state-owned enterprise contracts; 12 senior executives implicated.",  "$124M"),
        ("Gulf Holdings Co.",          2023, "High",     "Minister of Finance leaked classified bid documents to Meridian advisors for tax strategy advantage.",            "$88M"),
        ("Orion Pacific Ltd",          2024, "Critical", "Global bribery scheme: payments to 4 jurisdictions to win multinational procurement contracts.",                 "$340M"),
        ("Apex Credit Bureau",         2022, "High",     "Conspiracy: helped 3,200 clients conceal offshore assets and evade domestic tax obligations.",                  "$210M"),
        ("Solaris Energy S.A.",        2023, "Medium",   "Bribery of government officials in 2 countries for environmental permit approvals.",                            "$67M"),
        ("Helios Fund Management",     2024, "Critical", "FCPA violations: accounting fraud and books manipulation over 6-year period across 8 entities.",                "$450M"),
    ]

    fig = plt.figure(figsize=(20, 10), facecolor="#0f172a")
    gs  = gridspec.GridSpec(2, 3, figure=fig, hspace=0.5, wspace=0.35,
                            top=0.87, bottom=0.14, left=0.03, right=0.97)

    fig.suptitle("Fraud Case Library — Major Corporate Fraud Analysis",
                 fontsize=15, fontweight="bold", color="white", y=0.94)
    fig.text(0.5, 0.905,
             "Forensic Audit Reference Database  |  2022–2024  |  SYNTHETIC DUMMY DATA — Educational Use Only",
             ha="center", fontsize=9, color="#94a3b8")

    # Case table (bottom full-width)
    ax_tbl = fig.add_subplot(gs[1, :])
    ax_tbl.axis("off")
    ax_tbl.set_title("Detailed Case Breakdown", color="white", fontweight="bold",
                     fontsize=11, pad=6, loc="left")
    tbl = ax_tbl.table(
        cellText=[[c[0], str(c[1]), c[2], c[3][:80] + ("…" if len(c[3]) > 80 else ""), c[4]]
                  for c in cases],
        colLabels=["Company (Fictional)", "Year", "Severity", "Fraud Description", "Est. Amount"],
        cellLoc="center", loc="center", bbox=[0, 0, 1, 0.9])
    tbl.auto_set_font_size(False); tbl.set_fontsize(8.5)
    sev_bg = {"Critical": "#3b1212", "High": "#2d2010", "Medium": "#1a2d1a"}
    for (r, c), cell in tbl.get_celld().items():
        if r == 0:
            cell.set_facecolor("#1e3a5f")
            cell.set_text_props(color="white", fontweight="bold")
        else:
            sev = cases[r-1][2]
            cell.set_facecolor(sev_bg.get(sev, "#1e293b"))
            cell.set_text_props(color="#e2e8f0")
        cell.set_edgecolor("#334155")

    # Severity breakdown
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.set_facecolor("#1e293b")
    crit = sum(1 for c in cases if c[2] == "Critical")
    high = sum(1 for c in cases if c[2] == "High")
    med  = sum(1 for c in cases if c[2] == "Medium")
    wedges, _, autotexts = ax1.pie(
        [crit, high, med], labels=["Critical", "High", "Medium"],
        autopct="%d", colors=["#dc2626", "#d97706", "#16a34a"],
        wedgeprops={"edgecolor": "#0f172a", "lw": 2}, startangle=90)
    for a in autotexts: a.set_fontsize(10); a.set_fontweight("bold")
    ax1.set_title("Cases by Severity", color="white", fontweight="bold", fontsize=10)

    # Amount by case
    ax2 = fig.add_subplot(gs[0, 1:])
    ax2.set_facecolor("#1e293b")
    amounts = [int(c[4].replace("$", "").replace("M", "")) for c in cases]
    bar_colors = ["#dc2626" if c[2]=="Critical" else "#d97706" if c[2]=="High" else "#16a34a"
                  for c in cases]
    short_names = [c[0].split()[0] for c in cases]
    bars = ax2.bar(short_names, amounts, color=bar_colors, edgecolor="#0f172a", linewidth=1)
    for bar, amt in zip(bars, amounts):
        ax2.text(bar.get_x() + bar.get_width()/2, bar.get_height() + 5,
                 f"${amt}M", ha="center", va="bottom", color="white", fontsize=8)
    ax2.set_title("Estimated Financial Impact by Company", color="white", fontweight="bold", fontsize=10)
    ax2.set_ylabel("USD Millions", color="#94a3b8")
    ax2.tick_params(colors="white", axis="x", rotation=15)
    ax2.tick_params(colors="white", axis="y")
    for spine in ax2.spines.values(): spine.set_color("#334155")
    ax2.set_facecolor("#1e293b")

    fig.text(0.5, 0.04,
             "All company names are entirely fictional and synthetically generated. "
             "Any resemblance to real entities is coincidental. For portfolio demonstration only.",
             ha="center", fontsize=8, color="#64748b", style="italic")
    save(fig, f"{OUT}/fraud-cases/fraud-analysis.png")


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == "__main__":
    print("Generating all replacement screenshots...\n")

    print("[1/10] audit-tools — risk-assessment")
    make_risk_assessment_audit_tools()

    print("[2/10] audit-tools — branch-checklist")
    make_branch_checklist()

    print("[3/10] audit-tools — revenue-assurance")
    make_revenue_assurance()

    print("[4/10] audit-tools — presentation-sample")
    make_presentation_sample()

    print("[5/10] internal-tracker — ceo-dashboard")
    make_ceo_dashboard()

    print("[6/10] internal-tracker — audit-committee-dashboard")
    make_audit_committee_dashboard()

    print("[7/10] internal-tracker — risk-assessment")
    make_risk_assessment_internal_tracker()

    print("[8/10] internal-tracker — presentation-executive-summary")
    make_presentation_executive_summary()

    print("[9/10] restaurant-audit — audit-checklist")
    make_restaurant_audit_checklist()

    print("[10/10] fraud-cases — fraud-analysis")
    make_fraud_cases_analysis()

    print("\nAll done! Check public/images/projects/ for updated files.")
