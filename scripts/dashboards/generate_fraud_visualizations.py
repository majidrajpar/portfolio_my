"""
Generate Fraud Detection Visualizations with Dummy Data
Creates professional charts for portfolio demonstration
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import seaborn as sns
from pathlib import Path
from sklearn.ensemble import IsolationForest
from sklearn.cluster import DBSCAN, KMeans
from sklearn.preprocessing import StandardScaler

# Set style
plt.style.use('seaborn-v0_8-darkgrid')
sns.set_palette("husl")

def generate_benford_analysis():
    """Generate Benford's Law analysis chart"""

    # Benford's Law expected distribution
    benford_expected = [np.log10(1 + 1/d) for d in range(1, 10)]

    # Simulated observed distribution (close to Benford's with slight deviation)
    np.random.seed(42)
    benford_observed = [b + np.random.normal(0, 0.02) for b in benford_expected]
    benford_observed = [max(0, min(1, x)) for x in benford_observed]

    # Normalize
    total_observed = sum(benford_observed)
    benford_observed = [x/total_observed for x in benford_observed]

    digits = list(range(1, 10))

    fig, ax = plt.subplots(figsize=(12, 6))

    x = np.arange(len(digits))
    width = 0.35

    ax.bar(x - width/2, benford_expected, width, label='Benford Expected',
           alpha=0.8, color='#2563eb')
    ax.bar(x + width/2, benford_observed, width, label='Observed Data',
           alpha=0.8, color='#dc2626')

    ax.set_xlabel('First Digit', fontsize=12, fontweight='bold')
    ax.set_ylabel('Frequency', fontsize=12, fontweight='bold')
    ax.set_title("Benford's Law Analysis - First Digit Distribution",
                 fontsize=14, fontweight='bold', pad=20)
    ax.set_xticks(x)
    ax.set_xticklabels(digits)
    ax.legend(fontsize=11)
    ax.grid(True, alpha=0.3)

    # Add chi-square test result
    chi_square = 12.4  # Dummy value
    p_value = 0.136  # Dummy value (> 0.05 means no significant fraud)

    ax.text(0.98, 0.95, f'χ² = {chi_square:.2f}\np-value = {p_value:.3f}\nResult: No significant deviation',
            transform=ax.transAxes, fontsize=10,
            verticalalignment='top', horizontalalignment='right',
            bbox=dict(boxstyle='round', facecolor='wheat', alpha=0.5))

    plt.tight_layout()
    return fig

def generate_anomaly_detection():
    """Generate ML anomaly detection visualization"""

    # Generate dummy manager data
    np.random.seed(42)
    n_managers = 50

    # Normal managers
    normal_discount_rates = np.random.normal(15, 5, n_managers - 5)
    normal_transaction_counts = np.random.normal(500, 100, n_managers - 5)

    # Anomalous managers (5 outliers)
    anomaly_discount_rates = np.random.uniform(50, 95, 5)
    anomaly_transaction_counts = np.random.normal(450, 50, 5)

    discount_rates = np.concatenate([normal_discount_rates, anomaly_discount_rates])
    transaction_counts = np.concatenate([normal_transaction_counts, anomaly_transaction_counts])

    # Isolation Forest
    X = np.column_stack([discount_rates, transaction_counts])
    iso_forest = IsolationForest(contamination=0.1, random_state=42)
    predictions = iso_forest.fit_predict(X)

    fig, ax = plt.subplots(figsize=(12, 8))

    # Plot normal points
    normal_mask = predictions == 1
    ax.scatter(transaction_counts[normal_mask], discount_rates[normal_mask],
              c='#10b981', s=100, alpha=0.6, label='Normal Behavior', edgecolors='black')

    # Plot anomalies
    anomaly_mask = predictions == -1
    ax.scatter(transaction_counts[anomaly_mask], discount_rates[anomaly_mask],
              c='#dc2626', s=200, alpha=0.8, label='Anomalies Detected',
              marker='X', edgecolors='black', linewidths=2)

    ax.set_xlabel('Transaction Count', fontsize=12, fontweight='bold')
    ax.set_ylabel('Average Discount Rate (%)', fontsize=12, fontweight='bold')
    ax.set_title('ML Anomaly Detection - Isolation Forest Algorithm',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(fontsize=11, loc='upper left')
    ax.grid(True, alpha=0.3)

    # Add statistics box
    n_anomalies = np.sum(anomaly_mask)
    stats_text = f'Total Managers: {n_managers}\nAnomalies Detected: {n_anomalies}\nAnomaly Rate: {n_anomalies/n_managers*100:.1f}%'
    ax.text(0.98, 0.05, stats_text,
            transform=ax.transAxes, fontsize=10,
            verticalalignment='bottom', horizontalalignment='right',
            bbox=dict(boxstyle='round', facecolor='#fee2e2', alpha=0.8))

    plt.tight_layout()
    return fig

def generate_clustering_analysis():
    """Generate K-Means clustering for store risk segmentation"""

    np.random.seed(42)
    n_stores = 60

    # Generate store data (3 clusters: low, medium, high risk)
    # Low risk cluster
    low_discount_ratio = np.random.normal(0.05, 0.01, 20)
    low_void_ratio = np.random.normal(0.02, 0.005, 20)

    # Medium risk cluster
    med_discount_ratio = np.random.normal(0.15, 0.03, 20)
    med_void_ratio = np.random.normal(0.08, 0.02, 20)

    # High risk cluster
    high_discount_ratio = np.random.normal(0.35, 0.05, 20)
    high_void_ratio = np.random.normal(0.18, 0.03, 20)

    discount_ratio = np.concatenate([low_discount_ratio, med_discount_ratio, high_discount_ratio])
    void_ratio = np.concatenate([low_void_ratio, med_void_ratio, high_void_ratio])

    # K-Means clustering
    X = np.column_stack([discount_ratio, void_ratio])
    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=3, random_state=42, n_init=10)
    clusters = kmeans.fit_predict(X_scaled)

    fig, ax = plt.subplots(figsize=(12, 8))

    colors = ['#10b981', '#f59e0b', '#dc2626']
    labels = ['Low Risk', 'Medium Risk', 'High Risk']

    for i in range(3):
        mask = clusters == i
        ax.scatter(discount_ratio[mask] * 100, void_ratio[mask] * 100,
                  c=colors[i], s=150, alpha=0.7, label=labels[i],
                  edgecolors='black', linewidths=1.5)

    # Plot cluster centers
    centers = scaler.inverse_transform(kmeans.cluster_centers_)
    ax.scatter(centers[:, 0] * 100, centers[:, 1] * 100,
              c='black', s=300, marker='*', edgecolors='white',
              linewidths=2, label='Cluster Centers', zorder=10)

    ax.set_xlabel('Discount-to-Sales Ratio (%)', fontsize=12, fontweight='bold')
    ax.set_ylabel('Void-to-Sales Ratio (%)', fontsize=12, fontweight='bold')
    ax.set_title('Store Risk Segmentation - K-Means Clustering',
                 fontsize=14, fontweight='bold', pad=20)
    ax.legend(fontsize=11, loc='upper left')
    ax.grid(True, alpha=0.3)

    # Add risk zones
    ax.axvline(x=20, color='gray', linestyle='--', alpha=0.5)
    ax.axhline(y=10, color='gray', linestyle='--', alpha=0.5)

    plt.tight_layout()
    return fig

def generate_fraud_dashboard():
    """Generate comprehensive fraud detection dashboard"""

    fig = plt.figure(figsize=(16, 10))
    gs = fig.add_gridspec(3, 3, hspace=0.3, wspace=0.3)

    # 1. Fraud Risk Score (Top left)
    ax1 = fig.add_subplot(gs[0, 0])
    risk_score = 22.3
    colors_risk = ['#10b981' if risk_score < 40 else '#f59e0b' if risk_score < 70 else '#dc2626']
    ax1.barh([0], [risk_score], color=colors_risk, height=0.5)
    ax1.set_xlim(0, 100)
    ax1.set_ylim(-0.5, 0.5)
    ax1.set_yticks([])
    ax1.set_xlabel('Risk Score', fontweight='bold')
    ax1.set_title('Overall Fraud Risk Score', fontweight='bold', fontsize=12)
    ax1.text(risk_score + 2, 0, f'{risk_score:.1f}', va='center', fontweight='bold', fontsize=14)
    ax1.axvline(x=40, color='orange', linestyle='--', alpha=0.5)
    ax1.axvline(x=70, color='red', linestyle='--', alpha=0.5)

    # 2. Fraud indicators (Top middle)
    ax2 = fig.add_subplot(gs[0, 1])
    indicators = ['Extreme\nDiscounts', 'Anomalous\nManagers', 'High-Risk\nStores', 'Suspicious\nVoids']
    values = [9646, 3, 10, 42]
    bars = ax2.bar(indicators, values, color=['#dc2626', '#f59e0b', '#f59e0b', '#10b981'], alpha=0.7)
    ax2.set_ylabel('Count', fontweight='bold')
    ax2.set_title('Fraud Indicators Summary', fontweight='bold', fontsize=12)
    ax2.grid(axis='y', alpha=0.3)
    for bar, val in zip(bars, values):
        height = bar.get_height()
        ax2.text(bar.get_x() + bar.get_width()/2., height,
                f'{int(val):,}', ha='center', va='bottom', fontweight='bold')

    # 3. Revenue leakage (Top right)
    ax3 = fig.add_subplot(gs[0, 2])
    categories = ['Discounts', 'Voids', 'Other']
    leakage = [1.2, 0.65, 0.2]
    colors_leak = ['#dc2626', '#f59e0b', '#94a3b8']
    wedges, texts, autotexts = ax3.pie(leakage, labels=categories, autopct='%1.1f%%',
                                        colors=colors_leak, startangle=90)
    ax3.set_title('Revenue Leakage Breakdown\n$2.05M Total (4.58%)', fontweight='bold', fontsize=12)

    # 4. Manager discount rates (Middle left - larger)
    ax4 = fig.add_subplot(gs[1, :2])
    np.random.seed(42)
    managers = [f'Manager {i:02d}' for i in range(1, 16)]
    discount_rates = np.random.normal(15, 8, 12).tolist() + [42.3, 67.8, 92.3]
    colors_mgr = ['#10b981' if x < 30 else '#f59e0b' if x < 50 else '#dc2626' for x in discount_rates]

    bars = ax4.barh(managers, discount_rates, color=colors_mgr, alpha=0.7, edgecolor='black')
    ax4.set_xlabel('Average Discount Rate (%)', fontweight='bold')
    ax4.set_title('Manager Discount Rate Analysis (Top 15)', fontweight='bold', fontsize=12)
    ax4.axvline(x=30, color='orange', linestyle='--', alpha=0.5, label='Warning Threshold')
    ax4.axvline(x=50, color='red', linestyle='--', alpha=0.5, label='Critical Threshold')
    ax4.legend(fontsize=9)
    ax4.grid(axis='x', alpha=0.3)

    # 5. Time-series pattern (Middle right)
    ax5 = fig.add_subplot(gs[1, 2])
    hours = list(range(24))
    transactions = [20, 15, 10, 8, 5, 10, 25, 45, 60, 70, 75, 80,
                   85, 90, 95, 100, 105, 110, 100, 90, 70, 50, 35, 25]
    ax5.plot(hours, transactions, marker='o', color='#2563eb', linewidth=2, markersize=4)
    ax5.fill_between(hours, transactions, alpha=0.3, color='#2563eb')
    ax5.axvspan(22, 24, alpha=0.2, color='red', label='High-Risk Hours')
    ax5.axvspan(0, 5, alpha=0.2, color='red')
    ax5.set_xlabel('Hour of Day', fontweight='bold')
    ax5.set_ylabel('Transaction Count', fontweight='bold')
    ax5.set_title('Hourly Transaction Pattern', fontweight='bold', fontsize=12)
    ax5.grid(True, alpha=0.3)
    ax5.legend(fontsize=9)

    # 6. ML model performance (Bottom left)
    ax6 = fig.add_subplot(gs[2, 0])
    models = ['Isolation\nForest', 'DBSCAN', 'K-Means']
    accuracy = [87.3, 82.1, 91.5]
    bars = ax6.bar(models, accuracy, color=['#2563eb', '#8b5cf6', '#10b981'], alpha=0.7)
    ax6.set_ylabel('Detection Accuracy (%)', fontweight='bold')
    ax6.set_title('ML Model Performance', fontweight='bold', fontsize=12)
    ax6.set_ylim(0, 100)
    ax6.grid(axis='y', alpha=0.3)
    for bar, val in zip(bars, accuracy):
        height = bar.get_height()
        ax6.text(bar.get_x() + bar.get_width()/2., height,
                f'{val:.1f}%', ha='center', va='bottom', fontweight='bold')

    # 7. Store risk matrix (Bottom middle)
    ax7 = fig.add_subplot(gs[2, 1])
    store_data = np.random.rand(8, 8) * 100
    store_data[:3, :3] = np.random.rand(3, 3) * 30  # Low risk
    store_data[5:, 5:] = 70 + np.random.rand(3, 3) * 30  # High risk

    im = ax7.imshow(store_data, cmap='RdYlGn_r', aspect='auto', vmin=0, vmax=100)
    ax7.set_title('Store Risk Heatmap', fontweight='bold', fontsize=12)
    ax7.set_xlabel('Location ID', fontweight='bold')
    ax7.set_ylabel('Time Period', fontweight='bold')
    plt.colorbar(im, ax=ax7, label='Risk Score')

    # 8. Key metrics summary (Bottom right)
    ax8 = fig.add_subplot(gs[2, 2])
    ax8.axis('off')

    summary_text = """
    KEY FINDINGS

    Fraud Probability: LOW
    Confidence: 42.3%

    Critical Alerts: 1
    • Manager 015 (92.3% avg discount)

    Investigation Targets:
    • 3 Anomalous Managers
    • 10 High-Risk Store Combos
    • 9,646 Extreme Discounts

    Revenue Impact:
    • $2.05M Total Leakage
    • 4.58% of Sales

    Recommendation:
    Immediate investigation of
    top 3 managers required
    """

    ax8.text(0.1, 0.9, summary_text, transform=ax8.transAxes, fontsize=10,
            verticalalignment='top', fontfamily='monospace',
            bbox=dict(boxstyle='round', facecolor='#f3f4f6', alpha=0.8, pad=1))

    fig.suptitle('Fraud Detection Analytics Dashboard - ML-Powered Analysis',
                fontsize=16, fontweight='bold', y=0.98)

    return fig

def main():
    """Generate all fraud detection visualizations"""

    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\fraud-detection')
    output_dir.mkdir(parents=True, exist_ok=True)

    print("=" * 70)
    print("FRAUD DETECTION VISUALIZATION GENERATOR")
    print("=" * 70)
    print()

    visualizations = [
        ("benford-analysis.png", "Benford's Law Analysis", generate_benford_analysis),
        ("anomaly-detection.png", "ML Anomaly Detection", generate_anomaly_detection),
        ("clustering-analysis.png", "Store Risk Clustering", generate_clustering_analysis),
        ("fraud-dashboard.png", "Comprehensive Dashboard", generate_fraud_dashboard)
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
    print("\nNext: Optimize to WebP format")

if __name__ == '__main__':
    main()
