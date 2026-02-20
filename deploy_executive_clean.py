#!/usr/bin/env python3
"""
Deploy clean executive dashboard screenshot.
"""
import os
from PIL import Image

source = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_clean_screenshots\executive_dashboard_v2.png"
dest_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\finance-dashboard"

print("🖼️  Deploying Clean Executive Dashboard Screenshot")

# Load image
img = Image.open(source)

# Save PNG
png_path = os.path.join(dest_dir, "executive-dashboard.png")
img.save(png_path, "PNG", optimize=True)
print(f"✓ PNG: {os.path.getsize(png_path) / 1024:.0f}KB")

# Save WebP
webp_path = os.path.join(dest_dir, "executive-dashboard.webp")
img.save(webp_path, "WEBP", quality=85, method=6)
print(f"✓ WebP: {os.path.getsize(webp_path) / 1024:.0f}KB")

print("\n✅ Executive dashboard updated!")
