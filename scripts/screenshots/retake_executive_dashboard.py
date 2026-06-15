#!/usr/bin/env python3
"""
Retake executive dashboard screenshot - fix dialog box issue.
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom

output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_retake"
os.makedirs(output_dir, exist_ok=True)

# Use the Excel file we created earlier
filepath = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs\Executive_Summary_Dashboard.xlsx"

print(f"📸 Retaking Executive Dashboard Screenshot")
print(f"   File: {os.path.basename(filepath)}")

try:
    pythoncom.CoInitialize()
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = True
    excel.DisplayAlerts = False

    # Open workbook
    wb = excel.Workbooks.Open(filepath)
    time.sleep(3)

    # Maximize window
    excel.WindowState = -4137
    excel.ActiveWindow.Zoom = 85
    excel.ActiveSheet.Range("A1").Select()

    # Wait for everything to load
    time.sleep(2)

    # Press Escape to close any dialogs
    import win32api
    import win32con
    win32api.keybd_event(win32con.VK_ESCAPE, 0, 0, 0)
    time.sleep(0.5)
    win32api.keybd_event(win32con.VK_ESCAPE, 0, win32con.KEYEVENTF_KEYUP, 0)
    time.sleep(1)

    # Take screenshot
    screenshot = ImageGrab.grab()
    screenshot.save(os.path.join(output_dir, "executive_dashboard_clean.png"))

    print(f"   ✓ SUCCESS! Clean screenshot saved")
    print(f"   📊 Sheet: {excel.ActiveSheet.Name}")

    # Close without saving
    wb.Close(SaveChanges=False)
    excel.Quit()
    pythoncom.CoUninitialize()

except Exception as e:
    print(f"   ❌ Error: {e}")
    try:
        excel.Quit()
        pythoncom.CoUninitialize()
    except:
        pass
