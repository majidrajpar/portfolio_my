#!/usr/bin/env python3
"""
Use Excel COM automation for reliable screenshots.
Opens Excel, maximizes, and captures clean screenshots.
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom

excel_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs"
output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_screenshots_v3"
os.makedirs(output_dir, exist_ok=True)

files = [
    ("Branch_Audit_Checklist.xlsx", "audit_branch_checklist"),
    ("Risk_Assessment_Matrix.xlsx", "audit_risk_matrix"),
    ("Revenue_Assurance_Dashboard.xlsx", "audit_revenue_assurance"),
    ("Audit_Findings_Tracker.xlsx", "audit_findings_tracker"),
    ("Executive_Summary_Dashboard.xlsx", "finance_executive_summary"),
    ("Cash_Flow_Analysis.xlsx", "finance_cash_flow"),
    ("Regional_Performance_Matrix.xlsx", "finance_regional_matrix"),
    ("YoY_Variance_Analysis.xlsx", "finance_yoy_variance"),
]

def screenshot_excel_file(filename, output_name):
    """Use COM to open Excel and take screenshot."""
    filepath = os.path.join(excel_dir, filename)

    print(f"\n📸 {filename}...")

    try:
        # Initialize COM
        pythoncom.CoInitialize()

        # Create Excel instance
        excel = win32com.client.Dispatch("Excel.Application")
        excel.Visible = True
        excel.DisplayAlerts = False

        # Open workbook
        wb = excel.Workbooks.Open(filepath)

        # Wait for file to load
        time.sleep(2)

        # Maximize window
        excel.WindowState = -4137  # xlMaximized

        # Zoom to 85%
        excel.ActiveWindow.Zoom = 85

        # Go to cell A1
        excel.ActiveSheet.Range("A1").Select()

        # Wait a moment
        time.sleep(1)

        # Take screenshot
        screenshot = ImageGrab.grab()
        screenshot_path = os.path.join(output_dir, f"{output_name}.png")
        screenshot.save(screenshot_path)

        print(f"   ✓ Saved: {output_name}.png")

        # Close workbook without saving
        wb.Close(SaveChanges=False)

        # Quit Excel
        excel.Quit()

        # Clean up COM
        pythoncom.CoUninitialize()

        return screenshot_path

    except Exception as e:
        print(f"   ❌ Error: {e}")
        try:
            excel.Quit()
            pythoncom.CoUninitialize()
        except:
            pass
        return None

if __name__ == "__main__":
    print("🚀 Excel COM Screenshot Tool")
    print("=" * 60)

    for filename, output_name in files:
        screenshot_excel_file(filename, output_name)
        time.sleep(2)  # Brief pause between files

    print("\n" + "=" * 60)
    print("✅ COMPLETE!")
    print(f"📂 Screenshots: {output_dir}")
