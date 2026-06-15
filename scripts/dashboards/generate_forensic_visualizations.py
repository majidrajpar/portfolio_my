"""
Generate Forensic Toolbox Visualizations
Creates professional screenshots for portfolio demonstration
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.table import Table
import numpy as np
from pathlib import Path
from datetime import datetime, timedelta

plt.style.use('seaborn-v0_8-whitegrid')

def generate_evidence_tracker():
    """Generate Evidence Tracking Interface"""

    fig, ax = plt.subplots(figsize=(14, 10))
    ax.axis('tight')
    ax.axis('off')

    # Evidence tracking data
    evidence_data = [
        ['Evidence ID', 'Item Type', 'Collection Date', 'Collector', 'Hash (SHA-256)', 'Status', 'Custody'],
        ['EVD-0001', 'Transaction File', '2024-12-05 14:32', 'J. Smith', 'a3f9b8c...7d2e', '✓ Verified', 'J. Smith'],
        ['EVD-0002', 'Email Archive', '2024-12-05 15:18', 'M. Johnson', '2c8f1a6...4b9c', '✓ Verified', 'Lab Storage'],
        ['EVD-0003', 'Financial Records', '2024-12-06 09:45', 'J. Smith', '7e2d9f3...1a8b', '✓ Verified', 'J. Smith'],
        ['EVD-0004', 'Vendor Database', '2024-12-06 11:22', 'A. Brown', 'f8c3b1d...6e4a', '✓ Verified', 'M. Johnson'],
        ['EVD-0005', 'Access Logs', '2024-12-07 10:15', 'J. Smith', '4d7a2c9...3f5e', '⚠ Pending', 'J. Smith'],
        ['EVD-0006', 'Approval Forms', '2024-12-07 13:40', 'M. Johnson', 'b6e1f8a...2d3c', '✓ Verified', 'Lab Storage'],
        ['EVD-0007', 'Audit Trail', '2024-12-08 08:30', 'J. Smith', '9a4c7f2...8e1d', '✓ Verified', 'J. Smith'],
        ['EVD-0008', 'Screenshots', '2024-12-08 14:55', 'A. Brown', '1f3e8b6...7a9c', '✓ Verified', 'A. Brown'],
    ]

    table = ax.table(cellText=evidence_data, loc='center', cellLoc='left')
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2.5)

    # Color coding
    for i in range(len(evidence_data)):
        for j in range(len(evidence_data[0])):
            cell = table[(i, j)]

            # Header row
            if i == 0:
                cell.set_facecolor('#1e40af')
                cell.set_text_props(weight='bold', color='white')
            # Status column
            elif j == 5:
                if '✓' in evidence_data[i][j]:
                    cell.set_facecolor('#d1fae5')
                elif '⚠' in evidence_data[i][j]:
                    cell.set_facecolor('#fee2e2')
            # Alternating rows
            elif i % 2 == 0:
                cell.set_facecolor('#f9fafb')

            cell.set_edgecolor('#e5e7eb')

    plt.title('Evidence Tracking System - Digital Forensic Audit',
              fontsize=16, fontweight='bold', pad=20)

    # Add footer info
    fig.text(0.5, 0.02, 'All evidence secured with SHA-256 cryptographic hashing | Chain of custody maintained',
             ha='center', fontsize=9, style='italic', color='#6b7280')

    return fig

def generate_chain_of_custody():
    """Generate Chain of Custody View"""

    fig = plt.figure(figsize=(14, 10))
    gs = fig.add_gridspec(2, 2, hspace=0.4, wspace=0.3)

    # Evidence details (Top left)
    ax1 = fig.add_subplot(gs[0, 0])
    ax1.axis('off')

    evidence_info = """
    EVIDENCE DETAILS
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Evidence ID: EVD-0003
    Item Type: Financial Transaction Records
    File Name: suspicious_transactions.xlsx
    File Size: 2.4 MB

    HASH VERIFICATION
    SHA-256: 7e2d9f31a8b4c5f6e9d2a3c7f8e1b4d5
    Status: ✓ VERIFIED
    Last Verified: 2024-12-20 10:42:15

    COLLECTION INFO
    Collected By: Jane Smith, CFE
    Collection Date: 2024-12-06 09:45:32
    Collection Method: Digital Copy
    Original Location: /finance/transactions/
    """

    ax1.text(0.05, 0.95, evidence_info, transform=ax1.transAxes,
            fontsize=10, verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#f3f4f6', alpha=0.9, pad=1))

    # Custody timeline (Top right)
    ax2 = fig.add_subplot(gs[0, 1])
    ax2.axis('off')
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)

    # Timeline events
    events = [
        (9, 'Collected', 'J. Smith', '2024-12-06 09:45'),
        (7, 'Transferred', 'J. Smith → Lab', '2024-12-06 14:20'),
        (5, 'Analyzed', 'M. Johnson', '2024-12-07 11:30'),
        (3, 'Transferred', 'Lab → J. Smith', '2024-12-08 09:15'),
        (1, 'Filed', 'Evidence Locker', '2024-12-08 16:00'),
    ]

    for y, event, person, timestamp in events:
        # Event marker
        circle = plt.Circle((2, y), 0.3, color='#2563eb', zorder=10)
        ax2.add_patch(circle)

        # Event text
        ax2.text(3, y+0.2, event, fontweight='bold', fontsize=11, va='center')
        ax2.text(3, y-0.3, f'{person} | {timestamp}', fontsize=9, va='center', color='#6b7280')

        # Connect line
        if y > 1:
            ax2.plot([2, 2], [y-0.5, y-2.5], 'k--', alpha=0.3, linewidth=2)

    ax2.set_title('Chain of Custody Timeline', fontsize=12, fontweight='bold', pad=10)

    # Custody log table (Bottom span)
    ax3 = fig.add_subplot(gs[1, :])
    ax3.axis('tight')
    ax3.axis('off')

    custody_log = [
        ['Timestamp', 'Event', 'From', 'To', 'Purpose', 'Signature'],
        ['2024-12-06 09:45', 'Collection', '-', 'J. Smith', 'Evidence collection', 'J. Smith'],
        ['2024-12-06 14:20', 'Transfer', 'J. Smith', 'Lab Storage', 'Forensic analysis', 'M. Johnson'],
        ['2024-12-07 11:30', 'Access', '-', 'M. Johnson', 'Data extraction', 'M. Johnson'],
        ['2024-12-08 09:15', 'Transfer', 'Lab Storage', 'J. Smith', 'Report preparation', 'J. Smith'],
        ['2024-12-08 16:00', 'Storage', 'J. Smith', 'Evidence Locker', 'Secure storage', 'Security'],
    ]

    table = ax3.table(cellText=custody_log, loc='center', cellLoc='left')
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2)

    for i in range(len(custody_log)):
        for j in range(len(custody_log[0])):
            cell = table[(i, j)]
            if i == 0:
                cell.set_facecolor('#1e40af')
                cell.set_text_props(weight='bold', color='white')
            elif i % 2 == 0:
                cell.set_facecolor('#f9fafb')
            cell.set_edgecolor('#e5e7eb')

    ax3.set_title('Complete Custody Log - Admissible in Legal Proceedings',
                 fontsize=12, fontweight='bold', pad=15)

    fig.suptitle('Chain of Custody Report - Evidence EVD-0003',
                fontsize=16, fontweight='bold', y=0.98)

    return fig

def generate_fraud_pattern_results():
    """Generate Fraud Pattern Detection Results"""

    fig = plt.figure(figsize=(16, 10))
    gs = fig.add_gridspec(2, 3, hspace=0.35, wspace=0.3)

    # Risk score gauge (Top left)
    ax1 = fig.add_subplot(gs[0, 0])
    risk_score = 73
    colors = ['#10b981', '#f59e0b', '#dc2626']
    risk_level = 'HIGH RISK' if risk_score >= 70 else 'MEDIUM' if risk_score >= 40 else 'LOW'

    theta = np.linspace(0, np.pi, 100)
    r = np.ones(100)

    # Risk zones
    ax1.fill_between(theta[:33], 0, r[:33], color=colors[0], alpha=0.3)
    ax1.fill_between(theta[33:66], 0, r[33:66], color=colors[1], alpha=0.3)
    ax1.fill_between(theta[66:], 0, r[66:], color=colors[2], alpha=0.3)

    # Needle
    needle_angle = np.pi * (1 - risk_score/100)
    ax1.plot([0, np.cos(needle_angle)*0.9], [0, np.sin(needle_angle)*0.9],
            'k-', linewidth=4, zorder=10)
    ax1.plot(0, 0, 'ko', markersize=10, zorder=11)

    ax1.set_xlim(-1.2, 1.2)
    ax1.set_ylim(-0.2, 1.2)
    ax1.axis('off')
    ax1.set_title(f'Overall Fraud Risk\n{risk_score}/100 - {risk_level}',
                 fontsize=12, fontweight='bold')

    # Fraud indicators (Top middle and right)
    ax2 = fig.add_subplot(gs[0, 1:])

    indicators = ['Shell Company\nIndicators', 'Split\nTransactions', 'Duplicate\nPayments',
                 'Ghost\nEmployees', 'Conflict of\nInterest', 'After-Hours\nModifications']
    values = [3, 59, 5, 2, 8, 12]
    colors_bars = ['#dc2626' if v > 10 else '#f59e0b' if v > 5 else '#10b981' for v in values]

    bars = ax2.barh(indicators, values, color=colors_bars, alpha=0.7, edgecolor='black')
    ax2.set_xlabel('Number of Detections', fontweight='bold')
    ax2.set_title('Fraud Pattern Detection Summary', fontsize=12, fontweight='bold')
    ax2.grid(axis='x', alpha=0.3)

    for bar, val in zip(bars, values):
        width = bar.get_width()
        ax2.text(width + 1, bar.get_y() + bar.get_height()/2,
                f'{int(val)}', ha='left', va='center', fontweight='bold')

    # Detailed findings table (Bottom span)
    ax3 = fig.add_subplot(gs[1, :])
    ax3.axis('tight')
    ax3.axis('off')

    findings_data = [
        ['Finding ID', 'Severity', 'Pattern Type', 'Description', 'Amount', 'Status'],
        ['FRD-001', '🔴 Critical', 'Split Transactions', 'Vendor A: 59 transactions just below $10K threshold', '$572,340', 'Open'],
        ['FRD-002', '🟠 High', 'Conflict of Interest', '8 vendor addresses match employee addresses', '$124,500', 'Open'],
        ['FRD-003', '🟠 High', 'After-Hours Mods', '12 high-value transactions modified 10 PM-5 AM', '$89,200', 'Investigating'],
        ['FRD-004', '🟡 Medium', 'Duplicate Payments', '5 potential duplicate payments to Vendor B', '$45,000', 'Open'],
        ['FRD-005', '🟡 Medium', 'Shell Companies', '3 vendors with no web presence, PO Box addresses', '$78,900', 'Review'],
        ['FRD-006', '🟢 Low', 'Ghost Employees', '2 employees with no email/phone activity', '$32,000', 'Closed'],
    ]

    table = ax3.table(cellText=findings_data, loc='center', cellLoc='left')
    table.auto_set_font_size(False)
    table.set_fontsize(9)
    table.scale(1, 2.2)

    for i in range(len(findings_data)):
        for j in range(len(findings_data[0])):
            cell = table[(i, j)]
            if i == 0:
                cell.set_facecolor('#1e40af')
                cell.set_text_props(weight='bold', color='white')
            elif '🔴' in str(findings_data[i][1]):
                cell.set_facecolor('#fee2e2')
            elif '🟠' in str(findings_data[i][1]):
                cell.set_facecolor('#fef3c7')
            elif i % 2 == 0:
                cell.set_facecolor('#f9fafb')
            cell.set_edgecolor('#e5e7eb')

    ax3.set_title('Detailed Fraud Detection Findings - Prioritized by Severity',
                 fontsize=12, fontweight='bold', pad=15)

    fig.suptitle('Fraud Pattern Detection Report - Forensic Analysis',
                fontsize=16, fontweight='bold', y=0.98)

    return fig

def generate_forensic_report():
    """Generate Forensic Analysis Report Summary"""

    fig = plt.figure(figsize=(14, 10))
    gs = fig.add_gridspec(3, 2, hspace=0.4, wspace=0.3)

    # Executive summary (Top span)
    ax1 = fig.add_subplot(gs[0, :])
    ax1.axis('off')

    summary_text = """
    FORENSIC AUDIT REPORT - EXECUTIVE SUMMARY
    ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
    Case Number: FA-2024-001                    Period: October 2024 - February 2025
    Auditor: Jane Smith, CFE, CIA              Completion Date: December 20, 2024

    FINDINGS SUMMARY:
    Our forensic investigation identified significant fraud risk indicators across vendor payment
    and employee expense systems. Analysis of 221,878 transactions revealed systematic patterns
    consistent with threshold avoidance, conflict of interest, and potential collusion.

    CRITICAL FINDINGS:
    • 59 split transactions totaling $572,340 (just below approval threshold)
    • 8 vendor-employee address matches suggesting conflict of interest ($124,500)
    • 12 after-hours transaction modifications on high-value items ($89,200)

    TOTAL EXPOSURE: $831,040 in potentially fraudulent or high-risk transactions

    RECOMMENDATIONS:
    1. Immediate investigation of Vendor A payment patterns
    2. Enhanced approval controls for near-threshold transactions
    3. Mandatory vendor conflict of interest declarations
    4. Automated after-hours transaction monitoring
    """

    ax1.text(0.05, 0.95, summary_text, transform=ax1.transAxes,
            fontsize=10, verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#fef3c7', alpha=0.9, pad=1.5))

    # Statistics (Middle left)
    ax2 = fig.add_subplot(gs[1, 0])
    stats = ['Transactions\nAnalyzed', 'Evidence Items\nCollected', 'Findings\nIdentified', 'Days to\nComplete']
    stat_values = [221878, 8, 6, 45]

    bars = ax2.bar(stats, stat_values, color=['#2563eb', '#10b981', '#dc2626', '#6b7280'], alpha=0.7)
    ax2.set_ylabel('Count', fontweight='bold')
    ax2.set_title('Investigation Statistics', fontsize=12, fontweight='bold')
    ax2.grid(axis='y', alpha=0.3)

    for bar, val in zip(bars, stat_values):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{val:,}', ha='center', va='bottom', fontweight='bold', fontsize=10)

    # Severity breakdown (Middle right)
    ax3 = fig.add_subplot(gs[1, 1])
    severities = ['Critical', 'High', 'Medium', 'Low']
    severity_counts = [1, 3, 1, 1]
    colors_sev = ['#dc2626', '#f59e0b', '#fbbf24', '#10b981']

    wedges, texts, autotexts = ax3.pie(severity_counts, labels=severities, autopct='%1.0f%%',
                                         colors=colors_sev, startangle=90)
    ax3.set_title('Findings by Severity', fontsize=12, fontweight='bold')

    # Evidence verification (Bottom left)
    ax4 = fig.add_subplot(gs[2, 0])
    ax4.axis('off')

    evidence_summary = """
    EVIDENCE INTEGRITY
    ━━━━━━━━━━━━━━━━━━━━
    Total Items: 8
    ✓ Verified: 7
    ⚠ Pending: 1

    All evidence collected with
    SHA-256 cryptographic hashing.
    Complete chain of custody
    maintained for legal admissibility.
    """

    ax4.text(0.1, 0.9, evidence_summary, transform=ax4.transAxes,
            fontsize=10, verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#d1fae5', alpha=0.9, pad=1))

    # Recommendations (Bottom right)
    ax5 = fig.add_subplot(gs[2, 1])
    ax5.axis('off')

    recommendations = """
    PRIORITY ACTIONS
    ━━━━━━━━━━━━━━━━━━━━
    🔴 IMMEDIATE (Week 1):
    • Investigate Vendor A
    • Review split transactions
    • Interview procurement staff

    🟠 SHORT-TERM (30 Days):
    • Implement threshold controls
    • Vendor COI declarations
    • After-hours monitoring

    🟡 LONG-TERM (90 Days):
    • Automated fraud detection
    • Continuous monitoring system
    """

    ax5.text(0.1, 0.9, recommendations, transform=ax5.transAxes,
            fontsize=10, verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#f3f4f6', alpha=0.9, pad=1))

    fig.suptitle('Forensic Audit Report - Case FA-2024-001',
                fontsize=16, fontweight='bold', y=0.98)

    return fig

def main():
    """Generate all forensic visualizations"""

    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\forensic-toolbox')
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("FORENSIC TOOLBOX VISUALIZATION GENERATOR")
    print("=" * 70)
    print()

    visualizations = [
        ("evidence-tracker.png", "Evidence Tracking System", generate_evidence_tracker),
        ("chain-of-custody.png", "Chain of Custody Report", generate_chain_of_custody),
        ("fraud-patterns.png", "Fraud Pattern Detection", generate_fraud_pattern_results),
        ("forensic-report.png", "Forensic Analysis Report", generate_forensic_report)
    ]

    for filename, title, gen_func in visualizations:
        print(f"Generating: {title}...")
        fig = gen_func()
        output_path = output_dir / filename
        fig.savefig(output_path, dpi=150, bbox_inches='tight', facecolor='white')
        plt.close(fig)

        file_size_kb = output_path.stat().st_size / 1024
        print(f"  ✓ Saved: {filename} ({file_size_kb:.1f} KB)")
        print()

    print("=" * 70)
    print("✅ ALL VISUALIZATIONS GENERATED SUCCESSFULLY!")
    print("=" * 70)
    print(f"\nOutput directory: {output_dir}")

if __name__ == '__main__':
    main()
