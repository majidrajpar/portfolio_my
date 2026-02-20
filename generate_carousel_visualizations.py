"""
Generate Carousel Content Library Visualizations
Creates professional mockups for portfolio demonstration
"""

import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from pathlib import Path
import numpy as np

plt.style.use('seaborn-v0_8-whitegrid')

def generate_carousel_library_catalog():
    """Generate Content Library Catalog"""

    fig, ax = plt.subplots(figsize=(14, 10))
    ax.axis('off')

    # Title
    fig.suptitle('Audit Carousel Content Library - Portfolio',
                 fontsize=18, fontweight='bold', y=0.96)

    # Carousel topics organized by category
    categories = {
        'Forensic & Fraud Detection': [
            ('Forensic Tools Arsenal 2026', '8 slides', 'Dec 2024'),
            ('Forensic Accounting Essentials', '10 slides', 'Dec 2024'),
            ('Cyber Security Real Issues', '12 slides', 'Dec 2024'),
        ],
        'Audit Transformation': [
            ('Audit Business Transformation', '10 slides', 'Dec 2024'),
            ('Auditor Evolution Journey', '8 slides', 'Dec 2024'),
            ('AI in Internal Audit', '9 slides', 'Dec 2024'),
        ],
        'Professional Development': [
            ('Auditor Career Growth Path', '10 slides', 'Dec 2024'),
            ('Executive Communication', '9 slides', 'Dec 2024'),
            ('Auditor Psychology Masterclass', '10 slides', 'Dec 2024'),
        ],
        'Risk & Governance': [
            ('Risk-Based Audit Planning', '8 slides', 'Dec 2024'),
            ('Risk Management Process', '12 slides', 'Dec 2024'),
            ('Audit Committee Brief', '10 slides', 'Dec 2024'),
        ],
        'Technical Excellence': [
            ('QAIP 2025 Masterclass', '11 slides', 'Dec 2024'),
            ('Six Sigma for Auditors', '12 slides', 'Dec 2024'),
            ('Audit Memo Writing Guide', '9 slides', 'Dec 2024'),
        ]
    }

    y_pos = 0.88
    colors = ['#2563eb', '#10b981', '#f59e0b', '#8b5cf6', '#dc2626']

    for i, (category, carousels) in enumerate(categories.items()):
        # Category header
        ax.text(0.05, y_pos, category, transform=ax.transAxes,
               fontsize=14, fontweight='bold', color=colors[i % len(colors)])
        y_pos -= 0.04

        # Carousel items
        for title, slides, date in carousels:
            # Bullet point
            ax.plot([0.06], [y_pos+0.005], 'o', color=colors[i % len(colors)],
                   markersize=6, transform=ax.transAxes)

            # Title
            ax.text(0.08, y_pos, title, transform=ax.transAxes,
                   fontsize=11, color='#1f2937')

            # Metadata
            ax.text(0.65, y_pos, f'{slides} | {date}', transform=ax.transAxes,
                   fontsize=9, color='#6b7280', style='italic')

            y_pos -= 0.035

        y_pos -= 0.02  # Space between categories

    # Footer stats
    total_carousels = sum(len(c) for c in categories.values())
    total_slides = total_carousels * 10  # Approximate

    stats_y = 0.05
    ax.text(0.05, stats_y, f'📊 Total Content Library:', transform=ax.transAxes,
           fontsize=12, fontweight='bold')
    ax.text(0.05, stats_y-0.03, f'{total_carousels} Carousel Topics | {total_slides}+ Slides | 5 Categories',
           transform=ax.transAxes, fontsize=10, color='#6b7280')

    # Border
    rect = mpatches.Rectangle((0.03, 0.02), 0.94, 0.92, transform=ax.transAxes,
                              fill=False, edgecolor='#e5e7eb', linewidth=2)
    ax.add_patch(rect)

    return fig

def generate_carousel_sample_page():
    """Generate Sample Carousel Page Mockup"""

    fig, axes = plt.subplots(2, 2, figsize=(14, 10))
    fig.suptitle('Sample Carousel Pages - LinkedIn Format',
                 fontsize=16, fontweight='bold')

    # Page 1: Forensic Tools
    ax1 = axes[0, 0]
    ax1.set_xlim(0, 10)
    ax1.set_ylim(0, 10)
    ax1.axis('off')

    # Background
    rect1 = mpatches.Rectangle((0.5, 0.5), 9, 9, facecolor='#1e3a8a', alpha=0.9)
    ax1.add_patch(rect1)

    ax1.text(5, 8, 'FORENSIC AUDIT', ha='center', va='center',
            fontsize=18, fontweight='bold', color='white')
    ax1.text(5, 7, 'TOOLS ARSENAL', ha='center', va='center',
            fontsize=18, fontweight='bold', color='white')

    ax1.text(5, 5, '8 Essential Tools', ha='center', va='center',
            fontsize=14, color='#fbbf24')
    ax1.text(5, 4, 'for Modern Investigators', ha='center', va='center',
            fontsize=12, color='#fbbf24')

    ax1.text(5, 2, 'Slide 1 of 8', ha='center', va='center',
            fontsize=10, color='white', alpha=0.7)

    # Page 2: Risk Management
    ax2 = axes[0, 1]
    ax2.set_xlim(0, 10)
    ax2.set_ylim(0, 10)
    ax2.axis('off')

    rect2 = mpatches.Rectangle((0.5, 0.5), 9, 9, facecolor='#10b981', alpha=0.9)
    ax2.add_patch(rect2)

    ax2.text(5, 8, 'Risk Management', ha='center', va='center',
            fontsize=16, fontweight='bold', color='white')
    ax2.text(5, 7, 'Process Framework', ha='center', va='center',
            fontsize=14, color='white')

    # Process steps
    steps = ['Identify', 'Assess', 'Mitigate', 'Monitor']
    y_start = 5.5
    for i, step in enumerate(steps):
        ax2.text(5, y_start - i*0.8, f'{i+1}. {step}', ha='center', va='center',
                fontsize=12, color='white', fontweight='bold')

    ax2.text(5, 1.5, 'Slide 3 of 12', ha='center', va='center',
            fontsize=10, color='white', alpha=0.7)

    # Page 3: Career Growth
    ax3 = axes[1, 0]
    ax3.set_xlim(0, 10)
    ax3.set_ylim(0, 10)
    ax3.axis('off')

    rect3 = mpatches.Rectangle((0.5, 0.5), 9, 9, facecolor='#8b5cf6', alpha=0.9)
    ax3.add_patch(rect3)

    ax3.text(5, 8.5, 'AUDITOR CAREER', ha='center', va='center',
            fontsize=16, fontweight='bold', color='white')
    ax3.text(5, 7.5, 'Growth Roadmap', ha='center', va='center',
            fontsize=14, color='white')

    # Career levels
    levels = ['Junior Auditor', 'Senior Auditor', 'Audit Manager', 'Director', 'CAE']
    for i, level in enumerate(levels):
        y = 6 - i
        circle = plt.Circle((3, y), 0.2, color='#fbbf24', zorder=10)
        ax3.add_patch(circle)
        ax3.text(4, y, level, va='center', fontsize=10, color='white')

    ax3.text(5, 1, 'Slide 5 of 10', ha='center', va='center',
            fontsize=10, color='white', alpha=0.7)

    # Page 4: Cyber Security
    ax4 = axes[1, 1]
    ax4.set_xlim(0, 10)
    ax4.set_ylim(0, 10)
    ax4.axis('off')

    rect4 = mpatches.Rectangle((0.5, 0.5), 9, 9, facecolor='#dc2626', alpha=0.9)
    ax4.add_patch(rect4)

    ax4.text(5, 8.5, '⚠️', ha='center', va='center', fontsize=32)
    ax4.text(5, 7, 'Cyber Security', ha='center', va='center',
            fontsize=16, fontweight='bold', color='white')
    ax4.text(5, 6.2, 'Real Issues in 2025', ha='center', va='center',
            fontsize=13, color='white')

    # Top threats
    threats = ['Ransomware', 'Phishing', 'Insider Threats', 'Zero-Day Exploits']
    y_start = 4.8
    for i, threat in enumerate(threats):
        ax4.text(5, y_start - i*0.7, f'• {threat}', ha='center', va='center',
                fontsize=11, color='white')

    ax4.text(5, 1.2, 'Slide 7 of 12', ha='center', va='center',
            fontsize=10, color='white', alpha=0.7)

    plt.tight_layout()
    return fig

def generate_linkedin_mockup():
    """Generate LinkedIn Post Mockup"""

    fig = plt.figure(figsize=(12, 14))
    ax = fig.add_subplot(111)
    ax.set_xlim(0, 10)
    ax.set_ylim(0, 14)
    ax.axis('off')

    # LinkedIn header
    rect_header = mpatches.Rectangle((0.5, 12.5), 9, 1.3, facecolor='#0a66c2', alpha=0.95)
    ax.add_patch(rect_header)
    ax.text(5, 13.2, 'LinkedIn Post Preview', ha='center', va='center',
           fontsize=16, fontweight='bold', color='white')

    # Profile section
    circle_profile = plt.Circle((1.5, 11), 0.4, color='#6b7280', zorder=10)
    ax.add_patch(circle_profile)
    ax.text(2.2, 11.2, 'Majid Mumtaz CIA, ACA, FCCA', va='center',
           fontsize=11, fontweight='bold')
    ax.text(2.2, 10.8, 'Internal Audit Director | Risk & Governance | Published Author',
           va='center', fontsize=9, color='#6b7280')
    ax.text(2.2, 10.5, '2h • 🌐', va='center', fontsize=8, color='#6b7280')

    # Post text
    post_text = """New carousel post: "Forensic Audit Tools Arsenal 2026" 🔍

8 essential tools every forensic investigator should master:

✓ Digital evidence collection with chain of custody
✓ Benford's Law for fraud detection
✓ Transaction pattern analysis
✓ Shell company identification
✓ And more...

Perfect for auditors, CFEs, and fraud investigators looking to level up their toolkit.

#InternalAudit #ForensicAccounting #FraudDetection #AuditTools"""

    y_text = 9.8
    for line in post_text.split('\n'):
        ax.text(1, y_text, line, va='top', fontsize=9, wrap=True)
        y_text -= 0.25

    # Carousel preview
    y_carousel = 5.5
    rect_carousel = mpatches.Rectangle((1, y_carousel-2.5), 8, 2.5,
                                       facecolor='#1e3a8a', alpha=0.9)
    ax.add_patch(rect_carousel)

    ax.text(5, y_carousel-0.5, 'FORENSIC AUDIT', ha='center', va='center',
           fontsize=14, fontweight='bold', color='white')
    ax.text(5, y_carousel-1, 'TOOLS ARSENAL', ha='center', va='center',
           fontsize=14, fontweight='bold', color='white')
    ax.text(5, y_carousel-1.7, '8 Essential Tools for Modern Investigators', ha='center',
           va='center', fontsize=9, color='#fbbf24')

    # Carousel indicator
    ax.text(5, y_carousel-2.2, '1 / 8', ha='center', va='center',
           fontsize=8, color='white', alpha=0.7)

    # Engagement section
    y_engage = 2.8
    ax.text(1, y_engage, '👍 125', fontsize=10)
    ax.text(2.5, y_engage, '💬 23 comments', fontsize=10)
    ax.text(4.5, y_engage, '🔄 18 reposts', fontsize=10)

    # Action buttons
    y_buttons = 2.2
    for i, (icon, label) in enumerate([('👍', 'Like'), ('💬', 'Comment'),
                                       ('🔄', 'Repost'), ('📤', 'Share')]):
        x = 1.5 + i*2
        ax.text(x, y_buttons, f'{icon} {label}', ha='center', fontsize=10,
               bbox=dict(boxstyle='round,pad=0.3', facecolor='#f3f4f6',
                        edgecolor='#d1d5db', linewidth=1))

    # Note
    ax.text(5, 0.8, '💡 Carousel posts get 2-3x more engagement on LinkedIn',
           ha='center', fontsize=9, color='#6b7280', style='italic',
           bbox=dict(boxstyle='round,pad=0.5', facecolor='#fef3c7', alpha=0.7))

    # Border
    rect_border = mpatches.Rectangle((0.3, 0.3), 9.4, 13.4,
                                     fill=False, edgecolor='#e5e7eb', linewidth=2)
    ax.add_patch(rect_border)

    return fig

def main():
    """Generate all carousel visualizations"""

    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\carousel-content')
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("CAROUSEL CONTENT LIBRARY VISUALIZATION GENERATOR")
    print("=" * 70)
    print()

    visualizations = [
        ("content-library-catalog.png", "Content Library Catalog", generate_carousel_library_catalog),
        ("carousel-sample-pages.png", "Sample Carousel Pages", generate_carousel_sample_page),
        ("linkedin-post-mockup.png", "LinkedIn Post Mockup", generate_linkedin_mockup)
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
