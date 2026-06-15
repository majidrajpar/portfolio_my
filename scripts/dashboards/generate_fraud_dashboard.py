"""
Generate a fraud detection dashboard screenshot with dummy data.
Replaces the real client screenshot that contained sensitive information.
"""

import pandas as pd
import numpy as np
import matplotlib.pyplot as plt
import matplotlib.patches as mpatches
from matplotlib.gridspec import GridSpec
from PIL import Image
import random
from datetime import datetime, timedelta

np.random.seed(42)
random.seed(42)

# --- Dummy Data Configuration ---
COMPANY = "NovaBite F&B Group"
STORES = [
    "NovaBite KSA - Riyadh",
    "NovaBite KSA - Jeddah",
    "NovaBite UAE - Dubai",
    "NovaBite UAE - Abu Dhabi",
    "NovaBite QAT - Doha",
]
MANAGERS = [
    "JAMES CARTER",
    "SARA AL RASHID",
    "MICHAEL TORRES",
    "LAYLA HASSAN",
    "OMAR BENALI",
    "PRIYA SHARMA",
    "DAVID NGUYEN",
    "FATIMA AL ZAABI",
]
REPORT_TYPES = ["DINE IN", "TAKE AWAY", "DELIVERY", "ONLINE ORDER"]

# --- Generate Transactions ---
n = 200
start_date = datetime(2024, 10, 1)
end_date = datetime(2025, 2, 28)
date_range = (end_date - start_date).days

open_dates = [start_date + timedelta(days=random.randint(0, date_range)) for _ in range(n)]
close_dates = [d + timedelta(minutes=random.randint(15, 90)) for d in open_dates]

check_keys = [f"CK-{random.randint(1000000, 9999999)}" for _ in range(n)]
check_nos = [random.randint(100000, 999999) for _ in range(n)]
stores = [random.choice(STORES) for _ in range(n)]
managers = [random.choice(MANAGERS) for _ in range(n)]
report_names = [random.choice(REPORT_TYPES) for _ in range(n)]

void_counts = np.random.choice([0, 1, 2, 3, 4], n, p=[0.6, 0.2, 0.1, 0.07, 0.03])
void_amounts = np.where(void_counts > 0, np.random.uniform(10, 400, n), 0.0).round(2)

discount_rates = np.random.uniform(0, 0.85, n).round(4)
sales_amounts = np.random.uniform(25, 600, n).round(2)

df = pd.DataFrame({
    "CheckKey": check_keys,
    "CheckNo": check_nos,
    "OpenDate": [d.strftime("%Y-%m-%d %H:%M") for d in open_dates],
    "CloseDate": [d.strftime("%Y-%m-%d %H:%M") for d in close_dates],
    "Store Name": stores,
    "Report Name": report_names,
    "Manager": managers,
    "Sales (AED)": sales_amounts,
    "Discount %": (discount_rates * 100).round(1),
    "Void Count": void_counts,
    "Void Amt (AED)": void_amounts,
})

# Flag suspicious rows
df["Flag"] = (
    (df["Discount %"] > 60) | (df["Void Amt (AED)"] > 200)
).map({True: "[!] Suspicious", False: ""})

# --- Build Figure ---
fig = plt.figure(figsize=(22, 14), facecolor="#1a1f2e")
gs = GridSpec(3, 4, figure=fig, hspace=0.45, wspace=0.35,
              top=0.90, bottom=0.06, left=0.03, right=0.97)

# Title bar
fig.text(0.5, 0.955, f"Fraud Detection — Transaction Review Dashboard",
         ha="center", va="center", fontsize=20, fontweight="bold",
         color="white", fontfamily="monospace")
fig.text(0.5, 0.928, f"{COMPANY}  |  Oct 2024 – Feb 2025  |  CONFIDENTIAL — DUMMY DATA FOR DEMO",
         ha="center", va="center", fontsize=10, color="#8a9bbf", fontfamily="monospace")

# ── KPI Cards ──────────────────────────────────────────────────────────────
kpi_data = [
    ("Total Transactions", f"{n:,}", "#3b82f6"),
    ("Flagged Suspicious", f"{(df['Flag'] != '').sum()}", "#ef4444"),
    ("Avg Discount %", f"{df['Discount %'].mean():.1f}%", "#f59e0b"),
    ("Total Void Amt", f"AED {df['Void Amt (AED)'].sum():,.0f}", "#8b5cf6"),
]
for i, (label, value, color) in enumerate(kpi_data):
    ax = fig.add_subplot(gs[0, i])
    ax.set_facecolor("#252b3b")
    ax.set_xlim(0, 1); ax.set_ylim(0, 1)
    ax.axis("off")
    ax.add_patch(mpatches.FancyBboxPatch((0.05, 0.05), 0.9, 0.9,
        boxstyle="round,pad=0.02", facecolor="#252b3b",
        edgecolor=color, linewidth=2))
    ax.text(0.5, 0.68, value, ha="center", va="center",
            fontsize=26, fontweight="bold", color=color)
    ax.text(0.5, 0.28, label, ha="center", va="center",
            fontsize=9, color="#8a9bbf")

# ── Transaction Table (sample rows) ──────────────────────────────────────
ax_table = fig.add_subplot(gs[1:, :])
ax_table.set_facecolor("#1a1f2e")
ax_table.axis("off")

sample = df.sample(18, random_state=7).reset_index(drop=True)
display_cols = ["CheckNo", "OpenDate", "Store Name", "Manager",
                "Report Name", "Sales (AED)", "Discount %", "Void Count", "Void Amt (AED)", "Flag"]
cell_text = sample[display_cols].values.tolist()
col_labels = display_cols

table = ax_table.table(
    cellText=cell_text,
    colLabels=col_labels,
    cellLoc="center",
    loc="center",
    bbox=[0, 0, 1, 1]
)
table.auto_set_font_size(False)
table.set_fontsize(7.8)

for (row, col), cell in table.get_celld().items():
    if row == 0:
        cell.set_facecolor("#2d3550")
        cell.set_text_props(color="white", fontweight="bold")
        cell.set_edgecolor("#3b4a6b")
    else:
        row_data = sample.iloc[row - 1]
        is_flagged = row_data["Flag"] != ""
        cell.set_facecolor("#2e1a1a" if is_flagged else ("#252b3b" if row % 2 == 0 else "#1e2436"))
        cell.set_text_props(color="#ef9999" if (is_flagged and col == len(display_cols) - 1) else "#d1d9ef")
        cell.set_edgecolor("#2d3550")

# Footer
fig.text(0.5, 0.025,
    "All names, transaction IDs, and figures are synthetically generated for portfolio demonstration. "
    "No real client data is represented.",
    ha="center", fontsize=8, color="#555e78", style="italic")

plt.savefig(
    "public/images/projects/fraud-detection/fraud-dashboard.png",
    dpi=140, bbox_inches="tight", facecolor=fig.get_facecolor()
)
print("Saved: fraud-dashboard.png")

# Convert to WebP
img = Image.open("public/images/projects/fraud-detection/fraud-dashboard.png")
img.save("public/images/projects/fraud-detection/fraud-dashboard.webp", "WEBP", quality=88)
print("Saved: fraud-dashboard.webp")

plt.close()
print("Done.")
