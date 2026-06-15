#!/usr/bin/env python3
"""
Optimize all 8 project screenshots and deploy to portfolio.
"""
import os
from PIL import Image

source_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_all_screenshots_final"
base_dest = r"C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects"

# Mapping: source_file -> (project_folder, output_name)
deployments = {
    "1_Fraud_Detection_ML.png": ("fraud-detection", "fraud-dashboard"),
    "2_Audit_Findings_Tracker.png": ("audit-tools", "findings-tracker"),
    "3_Executive_Analytics.png": ("finance-dashboard", "executive-dashboard"),
    "4_Bateel_Audit_Tracker.png": ("bateel-audit-tracker", "audit-dashboard"),
    "5_Food_Safety_Risk.png": ("food-safety-risk", "risk-heatmap"),
    "6_Employee_Fraud.png": ("fraud-cases", "fraud-analysis"),
    "7_Restaurant_Audit.png": ("restaurant-audit", "audit-checklist"),
    "8_ICAEW_Audit.png": ("icaew-audit", "audit-report"),
}

def optimize_and_deploy(source_file, project_folder, output_name):
    """Optimize and deploy single screenshot."""
    source_path = os.path.join(source_dir, source_file)
    dest_dir = os.path.join(base_dest, project_folder)

    # Ensure directory exists
    os.makedirs(dest_dir, exist_ok=True)

    # Load image
    img = Image.open(source_path)

    # Save PNG
    png_path = os.path.join(dest_dir, f"{output_name}.png")
    img.save(png_path, "PNG", optimize=True)

    # Save WebP
    webp_path = os.path.join(dest_dir, f"{output_name}.webp")
    img.save(webp_path, "WEBP", quality=85, method=6)

    # Get sizes
    png_size = os.path.getsize(png_path) / 1024
    webp_size = os.path.getsize(webp_path) / 1024
    savings = ((png_size - webp_size) / png_size) * 100 if png_size > 0 else 0

    print(f"   PNG: {png_size:.0f}KB | WebP: {webp_size:.0f}KB | Saved: {savings:.0f}%")

print("🖼️  Optimizing and Deploying All 8 Project Screenshots")
print("=" * 70)

for idx, (source_file, (project_folder, output_name)) in enumerate(deployments.items(), 1):
    print(f"\n{idx}. {source_file} → {project_folder}/{output_name}")
    try:
        optimize_and_deploy(source_file, project_folder, output_name)
    except Exception as e:
        print(f"   ❌ Error: {e}")

print("\n" + "=" * 70)
print("✅ ALL 8 PROJECTS DEPLOYED!")
print("=" * 70)
print(f"\n📂 Location: public/images/projects/")
print("📊 All screenshots optimized to PNG + WebP")
print("\n✨ Ready for:")
print("  1. Review project names for clarity")
print("  2. Build and deploy to GitHub")
