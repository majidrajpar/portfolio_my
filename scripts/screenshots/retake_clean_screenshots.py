#!/usr/bin/env python3
"""
Retake screenshots cleanly - avoid dialog boxes.
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

def close_dialogs():
    """Close any Excel dialog boxes."""
    def callback(hwnd, _):
        if win32gui.IsWindowVisible(hwnd):
            text = win32gui.GetWindowText(hwnd)
            if "Excel" in text or "Microsoft" in text:
                # Try to close dialogs
                win32gui.PostMessage(hwnd, win32con.WM_CLOSE, 0, 0)
        return True

    win32gui.EnumWindows(callback, None)

def screenshot_excel_clean(filepath, output_name, worksheet_name=None):
    """Take clean screenshot of Excel file."""
    print(f"\n📸 {os.path.basename(filepath)}")

    if not os.path.exists(filepath):
        print(f"   ❌ File not found")
        return False

    try:
        pythoncom.CoInitialize()
        excel = win32com.client.Dispatch("Excel.Application")
        excel.Visible = True
        excel.DisplayAlerts = False
        excel.ScreenUpdating = False

        # Open in read-only mode to prevent save dialogs
        wb = excel.Workbooks.Open(filepath, ReadOnly=True)
        time.sleep(2)

        # Select worksheet if specified
        if worksheet_name:
            try:
                wb.Worksheets(worksheet_name).Activate()
            except:
                pass

        # Maximize and setup view
        excel.WindowState = -4137
        excel.ActiveWindow.Zoom = 85
        excel.ActiveSheet.Range("A1").Select()
        excel.ScreenUpdating = True

        time.sleep(1.5)

        # Close any dialogs
        close_dialogs()
        time.sleep(0.5)

        # Take screenshot
        screenshot = ImageGrab.grab()
        screenshot_path = os.path.join(output_dir, f"{output_name}.png")
        screenshot.save(screenshot_path)

        print(f"   ✓ Saved: {output_name}.png")
        print(f"   📊 Sheet: {excel.ActiveSheet.Name}")

        # Close without saving
        wb.Close(SaveChanges=False)
        excel.Quit()
        pythoncom.CoUninitialize()

        return True

    except Exception as e:
        print(f"   ❌ Error: {e}")
        try:
            excel.Quit()
            pythoncom.CoUninitialize()
        except:
            pass
        return False

# Files to retake
files_to_retake = [
    {
        "path": r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs\Executive_Summary_Dashboard.xlsx",
        "output": "executive_dashboard_clean",
        "worksheet": None
    }
]

if __name__ == "__main__":
    print("🚀 Clean Screenshot Retake Tool")
    print("=" * 60)

    for file_info in files_to_retake:
        screenshot_excel_clean(
            file_info["path"],
            file_info["output"],
            file_info.get("worksheet")
        )
        time.sleep(3)

    print("\n" + "=" * 60)
    print(f"✅ COMPLETE!")
    print(f"📂 Output: {output_dir}")
