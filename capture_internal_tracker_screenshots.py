"""
Automated Screenshot Capture for Internal Audit Tracker
Captures screenshots from Excel dashboards and PowerPoint presentation
"""

import os
import time
from pathlib import Path

try:
    import win32com.client
    from PIL import ImageGrab, Image
    DEPENDENCIES_AVAILABLE = True
except ImportError:
    DEPENDENCIES_AVAILABLE = False

def capture_excel_sheet(excel_app, workbook_path, sheet_name, output_path, description):
    """Capture screenshot from Excel sheet"""
    try:
        workbook = excel_app.Workbooks.Open(str(workbook_path.absolute()))
        time.sleep(1)

        sheet = workbook.Sheets(sheet_name)
        sheet.Activate()
        time.sleep(1)

        used_range = sheet.UsedRange
        used_range.Select()
        time.sleep(0.5)

        excel_app.ActiveWindow.WindowState = -4137  # xlMaximized
        time.sleep(0.5)

        screenshot = ImageGrab.grab()
        screenshot.save(output_path, 'PNG', quality=95)

        workbook.Close(SaveChanges=False)

        print(f"  ✓ Captured: {description} → {output_path.name}")
        return True

    except Exception as e:
        print(f"  ✗ Error capturing {description}: {e}")
        if 'workbook' in locals():
            try:
                workbook.Close(SaveChanges=False)
            except:
                pass
        return False

def capture_powerpoint_slide(ppt_app, pptx_path, slide_number, output_path, description):
    """Capture screenshot from PowerPoint slide"""
    try:
        presentation = ppt_app.Presentations.Open(str(pptx_path.absolute()))
        time.sleep(1)

        slide = presentation.Slides(slide_number)
        slide.Export(str(output_path), "PNG")

        presentation.Close()

        print(f"  ✓ Captured: {description} → {output_path.name}")
        return True

    except Exception as e:
        print(f"  ✗ Error capturing {description}: {e}")
        if 'presentation' in locals():
            try:
                presentation.Close()
            except:
                pass
        return False

def capture_internal_tracker():
    """Capture screenshots from Internal Audit Tracker"""

    print("=" * 70)
    print("INTERNAL AUDIT TRACKER SCREENSHOT CAPTURE")
    print("=" * 70)

    tracker_dir = Path(r'C:\Users\sorat\Desktop\Coding\internal_audit_tracker_bateel')
    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\internal-tracker')
    output_dir.mkdir(parents=True, exist_ok=True)

    excel_file = tracker_dir / 'Bateel_Internal_Audit_Tracker.xlsx'
    pptx_file = tracker_dir / 'Audit_Committee_Presentation.pptx'

    captures = [
        {
            'type': 'excel',
            'file': excel_file,
            'sheet': 'CEO Dashboard',
            'output': 'ceo-dashboard.png',
            'description': 'CEO Executive Dashboard'
        },
        {
            'type': 'excel',
            'file': excel_file,
            'sheet': 'Audit Committee Dashboard',
            'output': 'audit-committee-dashboard.png',
            'description': 'Audit Committee Dashboard'
        },
        {
            'type': 'excel',
            'file': excel_file,
            'sheet': 'Risk Assessment',
            'output': 'risk-assessment.png',
            'description': 'Risk Assessment Matrix'
        },
        {
            'type': 'powerpoint',
            'file': pptx_file,
            'slide': 3,  # Executive Summary slide
            'output': 'presentation-executive-summary.png',
            'description': 'PowerPoint - Executive Summary'
        },
    ]

    print(f"\n📂 Tracker directory: {tracker_dir}")
    print(f"📂 Output directory: {output_dir}")
    print(f"📸 Screenshots to capture: {len(captures)}\n")

    excel_app = None
    ppt_app = None
    captured_count = 0

    try:
        print("Opening Microsoft Office applications...\n")
        excel_app = win32com.client.Dispatch('Excel.Application')
        excel_app.Visible = True
        excel_app.DisplayAlerts = False

        ppt_app = win32com.client.Dispatch('PowerPoint.Application')
        ppt_app.Visible = 1

        for capture in captures:
            output_path = output_dir / capture['output']

            if capture['type'] == 'excel':
                if capture['file'].exists():
                    if capture_excel_sheet(
                        excel_app,
                        capture['file'],
                        capture['sheet'],
                        output_path,
                        capture['description']
                    ):
                        captured_count += 1
                else:
                    print(f"  ✗ File not found: {capture['file']}")

            elif capture['type'] == 'powerpoint':
                if capture['file'].exists():
                    if capture_powerpoint_slide(
                        ppt_app,
                        capture['file'],
                        capture['slide'],
                        output_path,
                        capture['description']
                    ):
                        captured_count += 1
                else:
                    print(f"  ✗ File not found: {capture['file']}")

        print(f"\n✅ Successfully captured {captured_count}/{len(captures)} screenshots")

        excel_app.Quit()
        ppt_app.Quit()

        return captured_count > 0

    except Exception as e:
        print(f"\n❌ Error: {e}")
        if excel_app:
            try:
                excel_app.Quit()
            except:
                pass
        if ppt_app:
            try:
                ppt_app.Quit()
            except:
                pass
        return False

def optimize_screenshots():
    """Optimize PNG screenshots to WebP format"""
    print("\n" + "=" * 70)
    print("OPTIMIZING SCREENSHOTS")
    print("=" * 70 + "\n")

    from PIL import Image

    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\internal-tracker')
    png_files = list(output_dir.glob('*.png'))

    if not png_files:
        print("No PNG files found to optimize.")
        return

    print(f"Found {len(png_files)} PNG file(s) to optimize\n")

    optimized_count = 0
    for png_file in png_files:
        try:
            img = Image.open(png_file)

            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            if img.width > 1920:
                ratio = 1920 / img.width
                new_height = int(img.height * ratio)
                img = img.resize((1920, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized {png_file.name} to 1920x{new_height}")

            webp_path = png_file.with_suffix('.webp')

            quality = 85
            while quality > 50:
                img.save(webp_path, 'WebP', quality=quality, method=6)
                file_size_kb = webp_path.stat().st_size / 1024

                if file_size_kb <= 200 or quality <= 55:
                    print(f"  ✓ {png_file.name} → {webp_path.name} ({file_size_kb:.1f} KB, quality={quality})")
                    optimized_count += 1
                    break

                quality -= 5

        except Exception as e:
            print(f"  ✗ Error optimizing {png_file.name}: {e}")

    print(f"\n✅ Optimized {optimized_count}/{len(png_files)} images")

def main():
    """Main function"""

    if not DEPENDENCIES_AVAILABLE:
        print("Installing dependencies...")
        import subprocess
        subprocess.check_call(['pip', 'install', 'pywin32', 'Pillow'])
        print("\nDependencies installed! Please run the script again.")
        return

    success = capture_internal_tracker()

    if success:
        optimize_screenshots()

        print("\n" + "=" * 70)
        print("✅ INTERNAL TRACKER SCREENSHOT CAPTURE COMPLETE!")
        print("=" * 70)
        print("\nNext: Update portfolio and deploy")
    else:
        print("\n❌ Screenshot capture failed.")

if __name__ == '__main__':
    main()
