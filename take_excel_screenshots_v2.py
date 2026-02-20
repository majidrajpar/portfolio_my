#!/usr/bin/env python3
"""
Improved Excel screenshot automation - handles Protected View and proper loading.
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

# Disable failsafe
pyautogui.FAILSAFE = False

# Paths
excel_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_excel_outputs"
output_dir = r"C:\Users\sorat\Desktop\Coding\portfolio_my\temp_screenshots"
os.makedirs(output_dir, exist_ok=True)

# Excel files to screenshot
files_to_process = [
    ("Branch_Audit_Checklist.xlsx", "audit_branch_checklist"),
    ("Risk_Assessment_Matrix.xlsx", "audit_risk_matrix"),
    ("Revenue_Assurance_Dashboard.xlsx", "audit_revenue_assurance"),
    ("Audit_Findings_Tracker.xlsx", "audit_findings_tracker"),
    ("Executive_Summary_Dashboard.xlsx", "finance_executive_summary"),
    ("Cash_Flow_Analysis.xlsx", "finance_cash_flow"),
    ("Regional_Performance_Matrix.xlsx", "finance_regional_matrix"),
    ("YoY_Variance_Analysis.xlsx", "finance_yoy_variance"),
]

def take_screenshot(excel_file, output_name):
    """Open Excel file and take screenshot."""
    file_path = os.path.join(excel_dir, excel_file)

    print(f"\n📸 {excel_file}...")

    # Open Excel file
    subprocess.Popen(['start', 'excel', file_path], shell=True)

    # Wait for Excel to open
    time.sleep(6)

    # If Protected View appears, click "Enable Editing"
    # Try to find and click yellow bar
    try:
        # Press Alt+E to enable editing (shortcut for Protected View button)
        pyautogui.hotkey('alt', 'e')
        time.sleep(1)
    except:
        pass

    # Maximize window
    pyautogui.hotkey('win', 'up')
    time.sleep(1)

    # Zoom to fit (Ctrl+Home to go to A1, then zoom to 85% for better view)
    pyautogui.hotkey('ctrl', 'home')
    time.sleep(0.5)

    # Set zoom to 85% for better full-sheet view
    pyautogui.hotkey('alt', 'w')  # View ribbon
    time.sleep(0.3)
    pyautogui.press('q')  # Zoom
    time.sleep(0.5)
    pyautogui.write('85')  # Type 85%
    time.sleep(0.3)
    pyautogui.press('enter')
    time.sleep(1)

    # Take screenshot
    screenshot = ImageGrab.grab()
    screenshot_path = os.path.join(output_dir, f"{output_name}.png")
    screenshot.save(screenshot_path)
    print(f"   ✓ Saved: {output_name}.png")

    # Close Excel without saving (Ctrl+W, then N for No)
    pyautogui.hotkey('ctrl', 'w')
    time.sleep(0.8)
    pyautogui.press('n')  # Don't save
    time.sleep(0.8)

    return screenshot_path

if __name__ == "__main__":
    print("🚀 Excel Screenshot Automation v2")
    print("=" * 60)
    print("⚠️  Please don't touch mouse/keyboard for ~2 minutes!")
    print("=" * 60)

    time.sleep(3)

    print("\n📊 TAKING SCREENSHOTS...\n")

    for excel_file, output_name in files_to_process:
        try:
            take_screenshot(excel_file, output_name)
        except Exception as e:
            print(f"   ❌ Error: {e}")
            # Close any open Excel windows
            try:
                pyautogui.hotkey('alt', 'f4')
                time.sleep(0.5)
                pyautogui.press('n')
                time.sleep(1)
            except:
                pass

    print("\n" + "=" * 60)
    print("✅ COMPLETE!")
    print("=" * 60)
    print(f"\n📂 Screenshots saved to: {output_dir}")
