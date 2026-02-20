#!/usr/bin/env python3
"""
Optimize real project screenshots and deploy to portfolio.
"""
import os
import shutil
from PIL import Image

# Source directory
source_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_real_screenshots"

# Destination mapping: screenshot_name -> (project_folder, new_name)
screenshot_mapping = {
    # Bateel Audit Tracker
    "bateel_audit_tracker.png": ("bateel-audit-tracker", "audit-dashboard"),

    # Food Safety Risk Framework
    "food_safety_risk.png": ("food-safety-risk", "risk-heatmap"),

    # Employee Fraud Cases
    "fraud_cases.png": ("fraud-cases", "fraud-analysis"),

    # Restaurant Audit Checklist
    "restaurant_audit.png": ("restaurant-audit", "audit-checklist"),

    # ICAEW Audit Report
    "icaew_audit.png": ("icaew-audit", "audit-report"),
}

def optimize_and_copy(source_file, project_folder, new_name):
    """Optimize image and copy to project folder."""
    source_path = os.path.join(source_dir, source_file)
    dest_dir = rf"C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\{project_folder}"

    # Ensure destination directory exists
    os.makedirs(dest_dir, exist_ok=True)

    # Load image
    img = Image.open(source_path)

    # Save as PNG (high quality)
    png_path = os.path.join(dest_dir, f"{new_name}.png")
    img.save(png_path, "PNG", optimize=True)
    print(f"  ✓ PNG: {png_path}")

    # Save as WebP (web optimized)
    webp_path = os.path.join(dest_dir, f"{new_name}.webp")
    img.save(webp_path, "WEBP", quality=85, method=6)
    print(f"  ✓ WebP: {webp_path}")

    # Get file sizes
    png_size = os.path.getsize(png_path) / 1024
    webp_size = os.path.getsize(webp_path) / 1024
    savings = ((png_size - webp_size) / png_size) * 100 if png_size > 0 else 0

    print(f"    PNG: {png_size:.0f}KB | WebP: {webp_size:.0f}KB | Saved: {savings:.0f}%")

if __name__ == "__main__":
    print("🖼️  Optimizing Real Project Screenshots")
    print("=" * 70)

    for source_file, (project_folder, new_name) in screenshot_mapping.items():
        print(f"\n📸 {source_file} → {project_folder}/{new_name}")
        try:
            optimize_and_copy(source_file, project_folder, new_name)
        except Exception as e:
            print(f"  ❌ Error: {e}")

    print("\n" + "=" * 70)
    print("✅ REAL PROJECT SCREENSHOTS DEPLOYED!")
    print("=" * 70)
    print(f"\n📂 Location: public/images/projects/")
    print("📊 Total: 5 real project screenshots (PNG + WebP)")
    print("\n✨ These are from your actual projects:")
    print("   - Bateel Internal Audit Tracker")
    print("   - Food Safety Risk Framework")
    print("   - Employee Fraud Cases")
    print("   - Restaurant Audit Checklist")
    print("   - ICAEW Audit Report")
