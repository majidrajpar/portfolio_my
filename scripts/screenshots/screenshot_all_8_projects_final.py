#!/usr/bin/env python3
"""
Screenshot all 8 project Excel files with clean, professional captures.
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom
import win32gui
import win32con

output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_all_screenshots_final"
os.makedirs(output_dir, exist_ok=True)

# All 8 projects with their Excel files
projects = [
    # Project 1: Neural-Net Fraud Detection
    {
        "name": "1_Fraud_Detection_ML",
        "path": r"C:\Users\sorat\Desktop\Coding\awani_fraud_detection_audit\AwaniSalesDiscountVoid_Oct2024_Feb2025.xlsx",
        "worksheet": None  # Use active sheet
    },
    # Project 2: Audit Automation Ecosystem
    {
        "name": "2_Audit_Findings_Tracker",
        "path": r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs\Audit_Findings_Tracker.xlsx",
        "worksheet": None
    },
    # Project 3: Executive Analytics Hub (the one we just fixed)
    {
        "name": "3_Executive_Analytics",
        "path": r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs\Executive_Summary_Dashboard.xlsx",
        "worksheet": None
    },
    # Project 4: Bateel Internal Audit Tracker
    {
        "name": "4_Bateel_Audit_Tracker",
        "path": r"C:\Users\sorat\Desktop\Coding\internal_audit_tracker_bateel\Bateel_Internal_Audit_Tracker.xlsx",
        "worksheet": "Director Dashboard"
    },
    # Project 5: Food Safety Risk Framework
    {
        "name": "5_Food_Safety_Risk",
        "path": r"C:\Users\sorat\Desktop\Coding\bateel_food_safety_risk_framework\Bateel_Advanced_Risk_Framework_v2.0.xlsx",
        "worksheet": None
    },
    # Project 6: Employee Fraud Investigation
    {
        "name": "6_Employee_Fraud",
        "path": r"C:\Users\sorat\Desktop\Coding\cv_fraud_report_generator\Major_Employee_Fraud_Control_Failures.xlsx",
        "worksheet": None
    },
    # Project 7: Restaurant Audit Checklist
    {
        "name": "7_Restaurant_Audit",
        "path": r"C:\Users\sorat\Desktop\Coding\audit_committee_services_toolkit\restaurant_audit_checklist_complete.xlsx",
        "worksheet": None
    },
    # Project 8: ICAEW Audit Report
    {
        "name": "8_ICAEW_Audit",
        "path": r"C:\Users\sorat\Desktop\Coding\kitopi_ml_fraud_icaew_audit\ICAEW_Comprehensive_Audit_Report_20251112_011924.xlsx",
        "worksheet": None
    }
]

def screenshot_project(project_info):
    """Take clean screenshot of project Excel file."""
    name = project_info["name"]
    filepath = project_info["path"]
    worksheet = project_info.get("worksheet")

    print(f"\n📸 {name}")
    print(f"   File: {os.path.basename(filepath)}")

    if not os.path.exists(filepath):
        print(f"   ❌ File not found!")
        return False

    try:
        pythoncom.CoInitialize()

        # Create Excel instance
        excel = win32com.client.Dispatch("Excel.Application")
        excel.Visible = True
        excel.DisplayAlerts = False

        # Open in read-only to prevent save dialogs
        wb = excel.Workbooks.Open(filepath, ReadOnly=True, UpdateLinks=False)

        # Wait for load
        time.sleep(3)

        # Activate specific worksheet if specified
        if worksheet:
            try:
                wb.Worksheets(worksheet).Activate()
                print(f"   Activated: {worksheet}")
            except Exception as e:
                print(f"   ⚠️  Could not activate '{worksheet}', using active sheet")

        # Maximize window
        excel.WindowState = -4137  # xlMaximized

        # Set zoom for better visibility
        try:
            excel.ActiveWindow.Zoom = 85
        except:
            pass

        # Select cell A1
        try:
            excel.ActiveSheet.Range("A1").Select()
        except:
            pass

        # Bring Excel to foreground
        excel_hwnd = win32gui.FindWindow("XLMAIN", None)
        if excel_hwnd:
            win32gui.SetForegroundWindow(excel_hwnd)
            win32gui.ShowWindow(excel_hwnd, win32con.SW_MAXIMIZE)

        # Wait for rendering
        time.sleep(2)

        # Take screenshot
        screenshot = ImageGrab.grab()
        screenshot_path = os.path.join(output_dir, f"{name}.png")
        screenshot.save(screenshot_path)

        print(f"   ✓ Screenshot saved")
        try:
            print(f"   📊 Sheet: {excel.ActiveSheet.Name}")
        except:
            pass

        # Close without saving
        wb.Close(SaveChanges=False)
        excel.Quit()
        pythoncom.CoUninitialize()

        return True

    except Exception as e:
        print(f"   ❌ Error: {str(e)[:100]}")
        try:
            excel.Quit()
            pythoncom.CoUninitialize()
        except:
            pass
        return False

if __name__ == "__main__":
    print("🚀 Screenshot All 8 Projects - Final Version")
    print("=" * 70)

    success_count = 0
    fail_count = 0

    for project in projects:
        result = screenshot_project(project)
        if result:
            success_count += 1
        else:
            fail_count += 1

        # Pause between projects
        time.sleep(3)

    print("\n" + "=" * 70)
    print(f"✅ COMPLETE! Success: {success_count}/8 | Failed: {fail_count}/8")
    print(f"📂 Output: {output_dir}")
    print("\nNext: Optimize to WebP and deploy to portfolio")
