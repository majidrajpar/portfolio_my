#!/usr/bin/env python3
"""
Retake executive dashboard - ensure Excel window is focused.
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom
import win32gui
import win32con

output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_clean_screenshots"
os.makedirs(output_dir, exist_ok=True)

filepath = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs\Executive_Summary_Dashboard.xlsx"

print(f"📸 Retaking: {os.path.basename(filepath)}")

try:
    pythoncom.CoInitialize()

    # Create Excel instance
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = True
    excel.DisplayAlerts = False

    # Open in read-only to prevent save dialog
    wb = excel.Workbooks.Open(filepath, ReadOnly=True, UpdateLinks=False)

    # Wait for load
    time.sleep(3)

    # Maximize window
    excel.WindowState = -4137  # xlMaximized
    excel.ActiveWindow.Zoom = 85

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

    # Wait a bit longer
    time.sleep(2)

    # Take screenshot
    screenshot = ImageGrab.grab()
    screenshot.save(os.path.join(output_dir, "executive_dashboard_v2.png"))

    print(f"   ✓ SUCCESS! Screenshot saved")

    # Close
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
