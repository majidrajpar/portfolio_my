#!/usr/bin/env python3
"""
Screenshot real Excel files from actual projects for portfolio.
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom

# Output directory for screenshots
output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_real_screenshots"
os.makedirs(output_dir, exist_ok=True)

# Real Excel files from actual projects
files = [
    # Bateel Internal Audit Tracker
    {
        "path": r"C:\Users\sorat\Desktop\Coding\internal_audit_tracker_bateel\Bateel_Internal_Audit_Tracker.xlsx",
        "output_name": "bateel_audit_tracker",
        "worksheet": None  # Use active sheet
    },
    # Food Safety Risk Framework
    {
        "path": r"C:\Users\sorat\Desktop\Coding\bateel_food_safety_risk_framework\Bateel_Advanced_Risk_Framework_v2.0.xlsx",
        "output_name": "food_safety_risk",
        "worksheet": None
    },
    # Employee Fraud Cases
    {
        "path": r"C:\Users\sorat\Desktop\Coding\cv_fraud_report_generator\Major_Employee_Fraud_Control_Failures.xlsx",
        "output_name": "fraud_cases",
        "worksheet": None
    },
    # Restaurant Audit Checklist
    {
        "path": r"C:\Users\sorat\Desktop\Coding\audit_committee_services_toolkit\restaurant_audit_checklist_polished.xlsx",
        "output_name": "restaurant_audit",
        "worksheet": None
    },
    # ICAEW Audit Report
    {
        "path": r"C:\Users\sorat\Desktop\Coding\kitopi_ml_fraud_icaew_audit\ICAEW_Comprehensive_Audit_Report_20251112_011924.xlsx",
        "output_name": "icaew_audit",
        "worksheet": None
    }
]

def screenshot_excel_file(file_info):
    """Use COM to open Excel and take screenshot."""
    filepath = file_info["path"]
    output_name = file_info["output_name"]
    worksheet_name = file_info.get("worksheet")

    print(f"\n📸 {os.path.basename(filepath)}...")

    if not os.path.exists(filepath):
        print(f"   ❌ File not found: {filepath}")
        return None

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
        time.sleep(3)

        # Activate specific worksheet if specified
        if worksheet_name:
            try:
                excel.ActiveWorkbook.Worksheets(worksheet_name).Activate()
            except:
                print(f"   ⚠️  Worksheet '{worksheet_name}' not found, using active sheet")

        # Maximize window
        excel.WindowState = -4137  # xlMaximized

        # Zoom to 85% for better fit
        excel.ActiveWindow.Zoom = 85

        # Go to cell A1
        excel.ActiveSheet.Range("A1").Select()

        # Wait a moment
        time.sleep(2)

        # Take screenshot
        screenshot = ImageGrab.grab()
        screenshot_path = os.path.join(output_dir, f"{output_name}.png")
        screenshot.save(screenshot_path)

        print(f"   ✓ Saved: {output_name}.png")
        print(f"   📊 Active Sheet: {excel.ActiveSheet.Name}")

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
    print("🚀 Real Project Screenshot Tool")
    print("=" * 70)
    print(f"📂 Source: Real projects from C:\\Users\\sorat\\Desktop\\Coding")
    print(f"💾 Output: {output_dir}")
    print("=" * 70)

    successful = 0
    failed = 0

    for file_info in files:
        result = screenshot_excel_file(file_info)
        if result:
            successful += 1
        else:
            failed += 1
        time.sleep(3)  # Brief pause between files

    print("\n" + "=" * 70)
    print(f"✅ COMPLETE! Success: {successful} | Failed: {failed}")
    print(f"📂 Screenshots: {output_dir}")
    print("=" * 70)
    print("\nNext steps:")
    print("1. Review screenshots in temp_real_screenshots/")
    print("2. Run optimize script to convert to WebP")
    print("3. Deploy to portfolio public/images/projects/")
