#!/usr/bin/env python3
"""
Screenshot restaurant audit checklist (try alternative file).
"""
import os
import time
import win32com.client
from PIL import ImageGrab
import pythoncom

output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_real_screenshots"
os.makedirs(output_dir, exist_ok=True)

# Try different restaurant audit file
filepath = r"C:\Users\sorat\Desktop\Coding\audit_committee_services_toolkit\restaurant_audit_checklist_complete.xlsx"

print(f"📸 Attempting: {os.path.basename(filepath)}")

try:
    pythoncom.CoInitialize()
    excel = win32com.client.Dispatch("Excel.Application")
    excel.Visible = True
    excel.DisplayAlerts = False

    wb = excel.Workbooks.Open(filepath)
    time.sleep(3)

    excel.WindowState = -4137
    excel.ActiveWindow.Zoom = 85
    excel.ActiveSheet.Range("A1").Select()
    time.sleep(2)

    screenshot = ImageGrab.grab()
    screenshot.save(os.path.join(output_dir, "restaurant_audit.png"))

    print(f"✓ SUCCESS! Sheet: {excel.ActiveSheet.Name}")

    wb.Close(SaveChanges=False)
    excel.Quit()
    pythoncom.CoUninitialize()

except Exception as e:
    print(f"❌ Error: {e}")
    try:
        excel.Quit()
        pythoncom.CoUninitialize()
    except:
        pass
