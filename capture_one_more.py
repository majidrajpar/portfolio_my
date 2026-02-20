"""Quick capture of Revenue Assurance screenshot"""
import win32com.client
from PIL import ImageGrab
from pathlib import Path
import time

def capture():
    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\audit-tools')
    excel_file = Path(r'C:\Users\sorat\Desktop\Coding\Audit_Tools\02_Execution\Revenue_Assurance_Reconciliation.xlsx')

    excel_app = win32com.client.Dispatch('Excel.Application')
    excel_app.Visible = True
    excel_app.DisplayAlerts = False

    workbook = excel_app.Workbooks.Open(str(excel_file.absolute()))
    time.sleep(1)

    sheet = workbook.Sheets(1)
    sheet.Activate()
    time.sleep(1)

    sheet.UsedRange.Select()
    time.sleep(0.5)

    excel_app.ActiveWindow.WindowState = -4137
    time.sleep(0.5)

    screenshot = ImageGrab.grab()
    screenshot.save(output_dir / 'revenue-assurance.png', 'PNG', quality=95)

    workbook.Close(SaveChanges=False)
    excel_app.Quit()

    print("✓ Captured Revenue Assurance")

    # Optimize to WebP
    from PIL import Image
    img = Image.open(output_dir / 'revenue-assurance.png')
    if img.mode != 'RGB':
        img = img.convert('RGB')
    img.save(output_dir / 'revenue-assurance.webp', 'WebP', quality=85)
    print(f"✓ Optimized to WebP ({(output_dir / 'revenue-assurance.webp').stat().st_size / 1024:.1f} KB)")

if __name__ == '__main__':
    capture()
