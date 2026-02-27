"""
DFM IPO Readiness - Infographic Generator
Generates 4 professional infographics for the portfolio project page.
"""

import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.patches import FancyBboxPatch, FancyArrowPatch
import matplotlib.patheffects as pe
import numpy as np
import os

# ── Output directory ──────────────────────────────────────────────────────────
OUT = r"C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\dfm-ipo-readiness"
os.makedirs(OUT, exist_ok=True)

# ── Palette ───────────────────────────────────────────────────────────────────
NAVY      = "#001F5B"
WHITE     = "#FFFFFF"
LIGHT     = "#F1F5F9"
SLATE     = "#475569"
BORDER    = "#CBD5E1"
AMBER     = "#F59E0B"
GREEN     = "#10B981"
INDIGO    = "#4F46E5"
SKY       = "#0EA5E9"
ROSE      = "#F43F5E"
ORANGE    = "#F97316"
TEAL      = "#14B8A6"
PURPLE    = "#8B5CF6"

plt.rcParams.update({
    'font.family': 'DejaVu Sans',
    'axes.facecolor': WHITE,
    'figure.facecolor': WHITE,
})

# =============================================================================
# 1. PROGRAMME ARCHITECTURE
# =============================================================================
def chart_programme_architecture():
    fig = plt.figure(figsize=(16, 10), facecolor=WHITE)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 16)
    ax.set_ylim(0, 10)
    ax.axis('off')

    # Header bar
    header = FancyBboxPatch((0, 8.7), 16, 1.3, boxstyle="square,pad=0",
                             facecolor=NAVY, edgecolor='none')
    ax.add_patch(header)
    ax.text(8, 9.42, "DFM IPO Readiness — Programme Architecture",
            ha='center', va='center', color=WHITE,
            fontsize=18, fontweight='bold', family='DejaVu Sans')
    ax.text(8, 8.95, "KPMG External Advisory  |  UAE Multi-Brand F&B Technology Platform  |  7 Jurisdictions",
            ha='center', va='center', color='#94A3B8',
            fontsize=9.5, family='DejaVu Sans')

    # Sub-header
    ax.text(8, 8.5, "Seven Integrated Workstreams — From Zero Infrastructure to Listing-Ready",
            ha='center', va='center', color=SLATE,
            fontsize=9, style='italic', family='DejaVu Sans')

    # Workstream definitions: (label, color, x, y, deliverables)
    workstreams = [
        {
            "title": "ICOFR Programme",
            "sub": "Internal Control over Financial Reporting",
            "color": NAVY,
            "x": 0.4, "y": 5.7, "w": 4.6, "h": 2.55,
            "items": [
                "12+ business processes scoped",
                "Risk Control Matrix (RCM) built from zero",
                "COSO control framework mapping",
                "Design & operating effectiveness testing",
                "External auditor coordination",
            ]
        },
        {
            "title": "Corporate Governance",
            "sub": "UAE SCA Code Alignment",
            "color": INDIGO,
            "x": 5.5, "y": 5.7, "w": 4.6, "h": 2.55,
            "items": [
                "Board composition & independence",
                "Audit & Risk committee formation",
                "Disclosure & transparency framework",
                "Board charter & ToR documentation",
                "UAE Companies Law compliance",
            ]
        },
        {
            "title": "GRC & ERM",
            "sub": "COSO ERM 2017 Rollout",
            "color": TEAL,
            "x": 10.6, "y": 5.7, "w": 4.9, "h": 2.55,
            "items": [
                "Group-wide risk register (7 jurisdictions)",
                "KRI framework & escalation thresholds",
                "Risk appetite statement (board-adopted)",
                "Three Lines of Defence embedded",
                "Quarterly risk reporting cadence",
            ]
        },
        {
            "title": "Policies & Procedures",
            "sub": "Governance Documentation Suite",
            "color": ORANGE,
            "x": 0.4, "y": 2.85, "w": 4.6, "h": 2.55,
            "items": [
                "Group policy framework & hierarchy",
                "Financial control policies (15+)",
                "Procurement & delegation of authority",
                "HR, payroll & expense policies",
                "Policy compliance attestation process",
            ]
        },
        {
            "title": "Whistleblowing Programme",
            "sub": "Ethics & Integrity Infrastructure",
            "color": ROSE,
            "x": 5.5, "y": 2.85, "w": 4.6, "h": 2.55,
            "items": [
                "Whistleblowing policy drafted",
                "Anonymous reporting channel configured",
                "Investigation protocol & SLAs defined",
                "Non-retaliation framework embedded",
                "Audit Committee reporting template",
            ]
        },
        {
            "title": "Internal Audit Function",
            "sub": "Function Build-Out & Methodology",
            "color": GREEN,
            "x": 10.6, "y": 2.85, "w": 4.9, "h": 2.55,
            "items": [
                "IA charter & mandate established",
                "Risk-based annual audit plan",
                "IIA-aligned audit methodology",
                "Findings management framework",
                "Board / Audit Committee reporting",
            ]
        },
        {
            "title": "IFRS & Financial Readiness",
            "sub": "Audit-Ready Financial Statements",
            "color": PURPLE,
            "x": 4.5, "y": 0.15, "w": 7.0, "h": 2.45,
            "items": [
                "IFRS gap analysis across all entities",
                "Multi-entity consolidation framework",
                "3-year audited financial statement preparation",
                "DFM prospectus financial disclosures",
                "External auditor readiness support",
            ]
        },
    ]

    for ws in workstreams:
        # Card background
        card = FancyBboxPatch((ws['x'], ws['y']), ws['w'], ws['h'],
                               boxstyle="square,pad=0",
                               facecolor=LIGHT, edgecolor=ws['color'],
                               linewidth=2)
        ax.add_patch(card)

        # Color header strip
        header_strip = FancyBboxPatch((ws['x'], ws['y'] + ws['h'] - 0.65),
                                       ws['w'], 0.65,
                                       boxstyle="square,pad=0",
                                       facecolor=ws['color'], edgecolor='none')
        ax.add_patch(header_strip)

        cx = ws['x'] + ws['w'] / 2
        ax.text(cx, ws['y'] + ws['h'] - 0.22,
                ws['title'], ha='center', va='center',
                color=WHITE, fontsize=9.5, fontweight='bold')
        ax.text(cx, ws['y'] + ws['h'] - 0.51,
                ws['sub'], ha='center', va='center',
                color='#CBD5E1', fontsize=7.2)

        # Bullet items: start 0.95 below top of card (just below header strip at 0.65),
        # step 0.27 → 5 items end at h - 2.30, leaving 0.25 margin from bottom
        item_y = ws['y'] + ws['h'] - 0.68
        for item in ws['items']:
            item_y -= 0.27
            ax.plot(ws['x'] + 0.22, item_y + 0.06, 's',
                    color=ws['color'], markersize=3.2)
            ax.text(ws['x'] + 0.38, item_y,
                    item, va='center', color='#1E293B',
                    fontsize=6.8, family='DejaVu Sans')

    # Footer
    footer = FancyBboxPatch((0, 0), 16, 0.13, boxstyle="square,pad=0",
                             facecolor=NAVY, edgecolor='none')
    ax.add_patch(footer)

    plt.savefig(os.path.join(OUT, 'programme-architecture.png'),
                dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print("✓ programme-architecture.png")


# =============================================================================
# 2. ICOFR PROCESS COVERAGE
# =============================================================================
def chart_icofr_coverage():
    fig, ax = plt.subplots(figsize=(14, 9), facecolor=WHITE)
    ax.set_facecolor(WHITE)

    processes = [
        ("Entity Level Controls",        18, "High",   "Financial Close"),
        ("Revenue & Accounts Receivable", 22, "High",   "Commercial"),
        ("Procure-to-Pay",                20, "High",   "Commercial"),
        ("Financial Statement Close",     16, "High",   "Financial Close"),
        ("Treasury & Cash Management",    14, "High",   "Financial Close"),
        ("Payroll & Human Resources",     17, "High",   "Operations"),
        ("Fixed Assets & Capex",          12, "Medium", "Operations"),
        ("Inventory & Cost of Sales",     15, "Medium", "Operations"),
        ("Tax Compliance & Reporting",    10, "Medium", "Financial Close"),
        ("IT General Controls (ITGCs)",   13, "High",   "Technology"),
        ("Related-Party Transactions",     8, "High",   "Governance"),
        ("Financial Consolidation",       11, "Medium", "Financial Close"),
        ("Forecasting & Budgeting",        9, "Medium", "Financial Close"),
    ]

    labels   = [p[0] for p in processes]
    controls = [p[1] for p in processes]
    risks    = [p[2] for p in processes]
    domains  = [p[3] for p in processes]

    risk_colors = {"High": ROSE, "Medium": AMBER, "Low": GREEN}
    domain_colors = {
        "Financial Close": NAVY,
        "Commercial":      INDIGO,
        "Operations":      TEAL,
        "Technology":      SKY,
        "Governance":      PURPLE,
    }

    y_pos = np.arange(len(labels))

    # Background alternating rows
    for i in range(len(labels)):
        row_bg = '#F8FAFC' if i % 2 == 0 else WHITE
        ax.barh(i, 30, left=0, height=0.9, color=row_bg, zorder=0)

    # Bars
    bars = ax.barh(y_pos, controls, height=0.62,
                   color=[domain_colors[d] for d in domains],
                   alpha=0.88, zorder=2, edgecolor='none')

    # Control count labels
    for i, (bar, ctrl) in enumerate(zip(bars, controls)):
        ax.text(ctrl + 0.3, i, str(ctrl), va='center', color='#1E293B',
                fontsize=9, fontweight='bold')

    # Risk level dots
    for i, risk in enumerate(risks):
        ax.plot(27, i, 'o', color=risk_colors[risk], markersize=10, zorder=3)
        ax.text(27, i, risk[0], ha='center', va='center',
                color=WHITE, fontsize=6.5, fontweight='bold', zorder=4)

    ax.set_yticks(y_pos)
    ax.set_yticklabels(labels, fontsize=9.5, color='#1E293B')
    ax.set_xlabel("Number of Controls Documented", fontsize=10, color=SLATE)
    ax.set_xlim(0, 30)
    ax.set_xticks([0, 5, 10, 15, 20, 25])
    ax.tick_params(axis='x', colors=SLATE, labelsize=9)
    ax.spines[['top', 'right', 'left']].set_visible(False)
    ax.spines['bottom'].set_color(BORDER)
    ax.tick_params(axis='y', length=0)

    # Title
    ax.set_title("ICOFR — Business Process Coverage\n13 Processes  |  175+ Controls Documented  |  COSO Framework Aligned",
                 fontsize=14, fontweight='bold', color=NAVY,
                 pad=18, loc='left')

    # Domain legend
    domain_patches = [mpatches.Patch(color=c, label=d)
                      for d, c in domain_colors.items()]
    risk_patches = [mpatches.Patch(color=risk_colors['High'],  label='High Risk'),
                    mpatches.Patch(color=risk_colors['Medium'], label='Medium Risk')]
    leg1 = ax.legend(handles=domain_patches, title='Process Domain',
                     loc='lower right', fontsize=8, title_fontsize=8,
                     frameon=True, framealpha=0.9,
                     bbox_to_anchor=(1.0, 0.0))
    ax.add_artist(leg1)
    ax.legend(handles=risk_patches, title='Inherent Risk',
              loc='lower right', fontsize=8, title_fontsize=8,
              frameon=True, framealpha=0.9,
              bbox_to_anchor=(1.0, 0.28))

    ax.text(26.5, len(labels) - 0.3, 'Risk', ha='center',
            va='center', fontsize=8, color=SLATE, fontweight='bold')

    fig.tight_layout(rect=[0, 0, 1, 1])
    plt.savefig(os.path.join(OUT, 'icofr-process-coverage.png'),
                dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print("✓ icofr-process-coverage.png")


# =============================================================================
# 3. THREE LINES OF DEFENCE
# =============================================================================
def chart_three_lines():
    fig = plt.figure(figsize=(15, 8.5), facecolor=WHITE)
    ax = fig.add_axes([0, 0, 1, 1])
    ax.set_xlim(0, 15)
    ax.set_ylim(0, 8.5)
    ax.axis('off')

    # ── Title block ────────────────────────────────────────────────────────────
    title_bar = FancyBboxPatch((0, 7.6), 15, 0.9, boxstyle="square,pad=0",
                                facecolor=NAVY, edgecolor='none')
    ax.add_patch(title_bar)
    ax.text(7.5, 8.05, "Three Lines of Defence — IPO Governance Accountability Model",
            ha='center', va='center', color=WHITE,
            fontsize=15, fontweight='bold')

    # ── Governing bodies (top) ─────────────────────────────────────────────────
    gov_box = FancyBboxPatch((0.5, 6.55), 14, 0.85, boxstyle="round,pad=0.08",
                              facecolor='#EEF2FF', edgecolor=INDIGO, linewidth=2)
    ax.add_patch(gov_box)
    ax.text(7.5, 6.975, "Board of Directors  |  Audit Committee  |  Risk Committee",
            ha='center', va='center', color=NAVY,
            fontsize=11.5, fontweight='bold')
    ax.text(7.5, 6.68, "Ultimate accountability for governance, risk appetite, and internal control effectiveness",
            ha='center', va='center', color=SLATE, fontsize=8.5)

    # Downward arrow from board to lines
    ax.annotate("", xy=(7.5, 6.35), xytext=(7.5, 6.52),
                arrowprops=dict(arrowstyle="-|>", color=INDIGO, lw=1.8))

    # ── Three columns ──────────────────────────────────────────────────────────
    col_defs = [
        {
            "title": "1st Line",
            "sub": "Business Ownership",
            "color": TEAL,
            "x": 0.5, "w": 4.2,
            "entities": ["Management", "Business Operations", "Finance Team", "Commercial Units"],
            "controls": [
                "Financial controls (P2P, R2R, O2C)",
                "Month-end close procedures",
                "Transaction-level authorisations",
                "Policies compliance & sign-off",
                "Self-assessment of control design",
            ],
            "badge": "OWNS RISK"
        },
        {
            "title": "2nd Line",
            "sub": "Oversight & Challenge",
            "color": ORANGE,
            "x": 5.2, "w": 4.6,
            "entities": ["Risk & Compliance Function", "GRC Framework", "CFO / Legal", "Policy Owners"],
            "controls": [
                "COSO ERM 2017 risk register",
                "KRI monitoring & threshold alerts",
                "Policy framework governance",
                "Regulatory compliance (SCA/DFM)",
                "Whistleblowing programme oversight",
            ],
            "badge": "MONITORS RISK"
        },
        {
            "title": "3rd Line",
            "sub": "Independent Assurance",
            "color": NAVY,
            "x": 10.3, "w": 4.2,
            "entities": ["Internal Audit Function", "KPMG (External Advisor)", "External Auditors"],
            "controls": [
                "ICOFR testing & design evaluation",
                "Risk-based audit plan (IIA-aligned)",
                "Findings & remediation tracking",
                "IFRS financial statement review",
                "Board & Audit Committee reporting",
            ],
            "badge": "ASSURES BOARD"
        },
    ]

    for col in col_defs:
        col_h = 5.85
        col_y = 0.35
        # Card
        card = FancyBboxPatch((col['x'], col_y), col['w'], col_h,
                               boxstyle="square,pad=0",
                               facecolor=LIGHT, edgecolor=col['color'],
                               linewidth=2.5)
        ax.add_patch(card)

        # Header strip
        hdr = FancyBboxPatch((col['x'], col_y + col_h - 1.05), col['w'], 1.05,
                              boxstyle="square,pad=0",
                              facecolor=col['color'], edgecolor='none')
        ax.add_patch(hdr)

        cx = col['x'] + col['w'] / 2
        ax.text(cx, col_y + col_h - 0.3,
                col['title'], ha='center', va='center',
                color=WHITE, fontsize=16, fontweight='black')
        ax.text(cx, col_y + col_h - 0.72,
                col['sub'], ha='center', va='center',
                color='#CBD5E1', fontsize=8.8)

        # Badge
        badge = FancyBboxPatch((col['x'] + col['w'] / 2 - 0.85, col_y + col_h - 1.18),
                                1.7, 0.28,
                                boxstyle="round,pad=0.04",
                                facecolor=WHITE, edgecolor=col['color'],
                                linewidth=1.5)
        ax.add_patch(badge)
        ax.text(col['x'] + col['w'] / 2, col_y + col_h - 1.04,
                col['badge'], ha='center', va='center',
                color=col['color'], fontsize=7, fontweight='black',
                family='DejaVu Sans')

        # Entities section
        ax.text(col['x'] + 0.2, col_y + 4.35,
                "KEY ENTITIES", va='center',
                color=col['color'], fontsize=7, fontweight='black',
                family='DejaVu Sans', alpha=0.8)
        ey = col_y + 4.05
        for ent in col['entities']:
            ent_box = FancyBboxPatch((col['x'] + 0.18, ey - 0.15),
                                      col['w'] - 0.36, 0.27,
                                      boxstyle="round,pad=0.03",
                                      facecolor=col['color'],
                                      alpha=0.12, edgecolor='none')
            ax.add_patch(ent_box)
            ax.text(col['x'] + col['w'] / 2, ey,
                    ent, ha='center', va='center',
                    color=NAVY, fontsize=7.8, fontweight='bold')
            ey -= 0.33

        # Controls section
        ax.plot([col['x'] + 0.18, col['x'] + col['w'] - 0.18],
                [ey + 0.1, ey + 0.1], '-', color=BORDER, lw=0.8)

        ax.text(col['x'] + 0.2, ey - 0.1,
                "KEY RESPONSIBILITIES", va='center',
                color=col['color'], fontsize=7, fontweight='black',
                family='DejaVu Sans', alpha=0.8)
        cy = ey - 0.38
        for ctrl in col['controls']:
            ax.plot(col['x'] + 0.3, cy + 0.06, 's',
                    color=col['color'], markersize=3.2)
            ax.text(col['x'] + 0.45, cy,
                    ctrl, va='center', color='#1E293B',
                    fontsize=7.0)
            cy -= 0.3

    # Horizontal arrows between lines
    for x_pos in [4.72, 9.92]:
        ax.annotate("", xy=(x_pos + 0.46, 3.6), xytext=(x_pos, 3.6),
                    arrowprops=dict(arrowstyle="<->", color=SLATE, lw=1.4,
                                   mutation_scale=14))

    # Footer
    footer = FancyBboxPatch((0, 0), 15, 0.33, boxstyle="square,pad=0",
                             facecolor='#F8FAFC', edgecolor=BORDER, linewidth=0.5)
    ax.add_patch(footer)
    ax.text(7.5, 0.165,
            "Model embedded across UAE holding company and 7 operating subsidiaries ahead of DFM listing  |  KPMG External Advisory",
            ha='center', va='center', color=SLATE, fontsize=8, style='italic')

    plt.savefig(os.path.join(OUT, 'three-lines-defence.png'),
                dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print("✓ three-lines-defence.png")


# =============================================================================
# 4. READINESS SCORECARD (RADAR CHART)
# =============================================================================
def chart_readiness_scorecard():
    fig = plt.figure(figsize=(14, 9), facecolor=WHITE)

    # Radar left, narrative right
    ax_radar = fig.add_axes([0.04, 0.1, 0.5, 0.78], polar=True)
    ax_info  = fig.add_axes([0.56, 0.08, 0.42, 0.84])
    ax_info.axis('off')

    categories = [
        "ICOFR\nImplementation",
        "Corporate\nGovernance",
        "GRC &\nERM",
        "Policies &\nProcedures",
        "Internal Audit\nFunction",
        "IFRS &\nFinancial Reporting",
        "Whistleblowing\n& Ethics",
    ]
    N = len(categories)
    angles = np.linspace(0, 2 * np.pi, N, endpoint=False).tolist()
    angles += angles[:1]

    # Pre-engagement baseline (approximate start state)
    baseline = [0.10, 0.05, 0.08, 0.12, 0.00, 0.30, 0.00]
    baseline += baseline[:1]

    # At listing-ready state
    achieved = [0.92, 0.90, 0.88, 0.85, 0.87, 0.90, 0.82]
    achieved += achieved[:1]

    # Grid
    for r in [0.2, 0.4, 0.6, 0.8, 1.0]:
        ax_radar.plot(angles, [r] * (N + 1), '-', color=BORDER, lw=0.7, zorder=1)
    ax_radar.set_yticks([])
    ax_radar.set_xticks(angles[:-1])
    ax_radar.set_xticklabels(categories, fontsize=8.5, color=NAVY, fontweight='bold')
    ax_radar.spines['polar'].set_color(BORDER)
    ax_radar.set_facecolor('#F8FAFC')

    # Baseline fill
    ax_radar.fill(angles, baseline, color=ROSE, alpha=0.15, zorder=2)
    ax_radar.plot(angles, baseline, '-o', color=ROSE, lw=2, markersize=5,
                  label='Pre-Engagement', zorder=3)

    # Achieved fill
    ax_radar.fill(angles, achieved, color=GREEN, alpha=0.20, zorder=4)
    ax_radar.plot(angles, achieved, '-o', color=GREEN, lw=2.5, markersize=7,
                  label='Listing-Ready State', zorder=5)

    # Percentage labels on achieved (text in polar data coords: theta, r)
    for angle, val in zip(angles[:-1], achieved[:-1]):
        ax_radar.text(angle, val + 0.13, f"{int(val*100)}%",
                      ha='center', va='center',
                      color=GREEN, fontsize=8, fontweight='bold')

    ax_radar.legend(loc='upper right', bbox_to_anchor=(1.35, 1.12),
                    fontsize=8.5, frameon=True)
    ax_radar.set_title("IPO Readiness Scorecard\nPre-Engagement vs. Listing-Ready",
                       fontsize=12, fontweight='bold', color=NAVY, pad=22)

    # ── Right panel: KPIs ──────────────────────────────────────────────────────
    ax_info.set_xlim(0, 1)
    ax_info.set_ylim(0, 1)

    ax_info.text(0.5, 0.97, "Key Programme Outcomes", ha='center',
                 color=NAVY, fontsize=13, fontweight='bold')
    ax_info.plot([0, 1], [0.93, 0.93], '-', color=BORDER, lw=1)

    kpis = [
        ("13",        "Business Processes\nICOFR-Documented",   NAVY),
        ("175+",      "Controls Designed\n& Tested",            INDIGO),
        ("7",         "Jurisdictions\nCovered",                  TEAL),
        ("3 Lines",   "of Defence\nEmbedded",                   GREEN),
        ("UAE SCA",   "Corporate Gov Code\nFully Aligned",       ORANGE),
        ("IFRS",      "Financial Statements\nAudit-Ready",       PURPLE),
        ("Zero",      "IA Function at\nStart of Engagement",    ROSE),
    ]

    row_h = 0.115
    y = 0.87
    for val, label, color in kpis:
        # KPI card
        kpi_card = FancyBboxPatch((0.02, y - 0.075), 0.96, 0.095,
                                   boxstyle="round,pad=0.01",
                                   facecolor=LIGHT, edgecolor=color,
                                   linewidth=1.5)
        ax_info.add_patch(kpi_card)

        # Left accent
        accent = FancyBboxPatch((0.02, y - 0.075), 0.025, 0.095,
                                 boxstyle="square,pad=0",
                                 facecolor=color, edgecolor='none')
        ax_info.add_patch(accent)

        ax_info.text(0.1, y - 0.025, val, va='center',
                     color=color, fontsize=15, fontweight='black')
        ax_info.text(0.42, y - 0.025,
                     label.replace('\n', ' — '), va='center',
                     color='#1E293B', fontsize=8.5)
        y -= row_h

    # Footer note
    ax_info.text(0.5, 0.01,
                 "Engagement delivered as KPMG external advisor\noverseeing company's internal IPO readiness programme",
                 ha='center', va='bottom', color=SLATE, fontsize=7.5, style='italic')

    plt.savefig(os.path.join(OUT, 'readiness-scorecard.png'),
                dpi=150, bbox_inches='tight', facecolor=WHITE)
    plt.close()
    print("✓ readiness-scorecard.png")


# =============================================================================
# RUN ALL
# =============================================================================
if __name__ == '__main__':
    print(f"Generating infographics → {OUT}\n")
    chart_programme_architecture()
    chart_icofr_coverage()
    chart_three_lines()
    chart_readiness_scorecard()
    print("\nAll done.")
