"""
Automated Screenshot Capture for Audit Tools Toolkit
Captures screenshots from Excel workbooks and PowerPoint presentations
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
        # Open workbook
        workbook = excel_app.Workbooks.Open(str(workbook_path.absolute()))
        time.sleep(1)

        # Activate sheet
        sheet = workbook.Sheets(sheet_name)
        sheet.Activate()
        time.sleep(1)

        # Select used range
        used_range = sheet.UsedRange
        used_range.Select()
        time.sleep(0.5)

        # Maximize window
        excel_app.ActiveWindow.WindowState = -4137  # xlMaximized
        time.sleep(0.5)

        # Capture screenshot
        screenshot = ImageGrab.grab()
        screenshot.save(output_path, 'PNG', quality=95)

        # Close workbook
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
        # Open presentation
        presentation = ppt_app.Presentations.Open(str(pptx_path.absolute()))
        time.sleep(1)

        # Get slide
        slide = presentation.Slides(slide_number)

        # Export slide as image
        slide.Export(str(output_path), "PNG")

        # Close presentation
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

def capture_audit_tools():
    """Capture screenshots from Audit Tools"""

    print("=" * 70)
    print("AUDIT TOOLS SCREENSHOT CAPTURE")
    print("=" * 70)

    # Define paths
    audit_tools_dir = Path(r'C:\Users\sorat\Desktop\Coding\Audit_Tools')
    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\audit-tools')
    output_dir.mkdir(parents=True, exist_ok=True)

    # Screenshots to capture
    captures = [
        {
            'type': 'excel',
            'file': audit_tools_dir / '01_Planning' / 'Audit_Universe_Risk_Assessment.xlsx',
            'sheet': 'Risk Assessment',
            'output': 'risk-assessment.png',
            'description': 'Risk Assessment Matrix'
        },
        {
            'type': 'excel',
            'file': audit_tools_dir / '04_Database' / 'Findings_Tracker_Database.xlsx',
            'sheet': 'Findings Database',
            'output': 'findings-tracker.png',
            'description': 'Findings Tracker Database'
        },
        {
            'type': 'excel',
            'file': audit_tools_dir / '02_Execution' / 'Branch_Audit_Checklist.xlsx',
            'sheet': 'Branch Checklist',
            'output': 'branch-checklist.png',
            'description': 'Branch Audit Checklist'
        },
        {
            'type': 'excel',
            'file': audit_tools_dir / '03_Reporting' / 'Executive_Dashboard.xlsx',
            'sheet': 'Dashboard',
            'output': 'executive-dashboard.png',
            'description': 'Executive Dashboard'
        },
        {
            'type': 'powerpoint',
            'file': audit_tools_dir / '03_Reporting' / 'Audit_Committee_Presentation.pptx',
            'slide': 1,
            'output': 'presentation-sample.png',
            'description': 'PowerPoint Presentation Sample'
        }
    ]

    print(f"\n📂 Audit Tools directory: {audit_tools_dir}")
    print(f"📂 Output directory: {output_dir}")
    print(f"📸 Screenshots to capture: {len(captures)}\n")

    # Initialize applications
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

        # Capture each screenshot
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

        # Close applications
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

    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\audit-tools')
    png_files = list(output_dir.glob('*.png'))

    if not png_files:
        print("No PNG files found to optimize.")
        return

    print(f"Found {len(png_files)} PNG file(s) to optimize\n")

    optimized_count = 0
    for png_file in png_files:
        try:
            # Open image
            img = Image.open(png_file)

            # Convert to RGB
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if too large
            if img.width > 1920:
                ratio = 1920 / img.width
                new_height = int(img.height * ratio)
                img = img.resize((1920, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized {png_file.name} to 1920x{new_height}")

            # Save as WebP
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

    # Capture screenshots
    success = capture_audit_tools()

    if success:
        # Optimize to WebP
        optimize_screenshots()

        print("\n" + "=" * 70)
        print("✅ AUDIT TOOLS SCREENSHOT CAPTURE COMPLETE!")
        print("=" * 70)
        print("\nNext: Update portfolio and deploy")
    else:
        print("\n❌ Screenshot capture failed.")

if __name__ == '__main__':
    main()
