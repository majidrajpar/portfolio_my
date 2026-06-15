#!/usr/bin/env python3
"""
Optimize screenshots and copy to portfolio project directories.
"""
import os
import shutil
from PIL import Image

# Source directory
source_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_screenshots_v3"

# Destination mapping: screenshot_name -> (project_folder, new_name)
screenshot_mapping = {
    # Audit Tools (3 screenshots)
    "audit_findings_tracker.png": ("audit-tools", "findings-tracker"),
    "audit_revenue_assurance.png": ("audit-tools", "revenue-assurance-dashboard"),
    "audit_branch_checklist.png": ("audit-tools", "branch-audit-checklist"),

    # Finance Dashboard (2 screenshots)
    "finance_cash_flow.png": ("finance-dashboard", "cash-flow-analysis"),
    "finance_executive_summary.png": ("finance-dashboard", "executive-dashboard"),
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
    savings = ((png_size - webp_size) / png_size) * 100

    print(f"    PNG: {png_size:.0f}KB | WebP: {webp_size:.0f}KB | Saved: {savings:.0f}%")

if __name__ == "__main__":
    print("🖼️  Optimizing and Deploying Screenshots")
    print("=" * 60)

    for source_file, (project_folder, new_name) in screenshot_mapping.items():
        print(f"\n📸 {source_file} → {project_folder}/{new_name}")
        try:
            optimize_and_copy(source_file, project_folder, new_name)
        except Exception as e:
            print(f"  ❌ Error: {e}")

    print("\n" + "=" * 60)
    print("✅ SCREENSHOTS DEPLOYED!")
    print("=" * 60)
    print(f"\n📂 Location: public/images/projects/")
    print("📊 Total: 5 screenshots (PNG + WebP)")
    print("\nNext: Update React components to display images")
