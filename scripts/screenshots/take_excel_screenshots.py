#!/usr/bin/env python3
"""
Automatically open Excel files and take screenshots for portfolio.
"""
import os
import time
import subprocess

try:
    import pyautogui
    from PIL import ImageGrab
except ImportError:
    print("Installing required packages...")
    os.system("pip install pyautogui pillow")
    import pyautogui
    from PIL import ImageGrab

# Paths
excel_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs"
output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_screenshots"
os.makedirs(output_dir, exist_ok=True)

# Excel files to screenshot
excel_files = [
    "Branch_Audit_Checklist.xlsx",
    "Risk_Assessment_Matrix.xlsx",
    "Revenue_Assurance_Dashboard.xlsx",
    "Audit_Findings_Tracker.xlsx",
    "Executive_Summary_Dashboard.xlsx",
    "Cash_Flow_Analysis.xlsx",
    "Regional_Performance_Matrix.xlsx",
    "YoY_Variance_Analysis.xlsx",
]

def take_screenshot(excel_file, output_name):
    """Open Excel file, maximize, and take screenshot."""
    file_path = os.path.join(excel_dir, excel_file)

    print(f"\n📸 Taking screenshot of {excel_file}...")

    # Open Excel file
    subprocess.Popen(['start', 'excel', file_path], shell=True)

    # Wait for Excel to open and load
    print("   Waiting for Excel to open...")
    time.sleep(5)

    # Press F11 to maximize the worksheet area (full screen)
    # Or Alt+W, M for maximize window
    pyautogui.press('f11')
    time.sleep(1)

    # Take screenshot
    screenshot = ImageGrab.grab()
    screenshot_path = os.path.join(output_dir, f"{output_name}.png")
    screenshot.save(screenshot_path)
    print(f"   ✓ Saved to {output_name}.png")

    # Close Excel (Alt+F4)
    pyautogui.hotkey('alt', 'f4')
    time.sleep(1)

    # Don't save changes (press 'n')
    pyautogui.press('n')
    time.sleep(1)

    return screenshot_path

if __name__ == "__main__":
    print("🚀 Starting Excel Screenshot Automation...")
    print("⚠️  Please don't use your mouse/keyboard during this process!")
    print("⚠️  This will take about 1 minute...")

    time.sleep(3)  # Give user time to read

    screenshots_taken = []

    # Audit Tools
    print("\n" + "="*60)
    print("AUDIT TOOLS SCREENSHOTS")
    print("="*60)

    screenshots_taken.append(take_screenshot("Branch_Audit_Checklist.xlsx", "audit_branch_checklist"))
    screenshots_taken.append(take_screenshot("Risk_Assessment_Matrix.xlsx", "audit_risk_matrix"))
    screenshots_taken.append(take_screenshot("Revenue_Assurance_Dashboard.xlsx", "audit_revenue_assurance"))
    screenshots_taken.append(take_screenshot("Audit_Findings_Tracker.xlsx", "audit_findings_tracker"))

    # Finance Dashboards
    print("\n" + "="*60)
    print("FINANCE DASHBOARD SCREENSHOTS")
    print("="*60)

    screenshots_taken.append(take_screenshot("Executive_Summary_Dashboard.xlsx", "finance_executive_summary"))
    screenshots_taken.append(take_screenshot("Cash_Flow_Analysis.xlsx", "finance_cash_flow"))
    screenshots_taken.append(take_screenshot("Regional_Performance_Matrix.xlsx", "finance_regional_matrix"))
    screenshots_taken.append(take_screenshot("YoY_Variance_Analysis.xlsx", "finance_yoy_variance"))

    print("\n" + "="*60)
    print("✅ COMPLETE!")
    print("="*60)
    print(f"\n📂 All screenshots saved to: {output_dir}")
    print(f"📊 Total screenshots: {len(screenshots_taken)}")
    print("\nReview the screenshots and let me know if they look good!")
