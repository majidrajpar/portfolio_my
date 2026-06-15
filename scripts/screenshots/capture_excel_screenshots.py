"""
Automated Excel Screenshot Capture
Opens Excel workbook and captures screenshots of specified sheets
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
    print("Installing required dependencies...")

def install_dependencies():
    """Install required packages"""
    import subprocess
    packages = ['pywin32', 'Pillow']
    for package in packages:
        print(f"Installing {package}...")
        subprocess.check_call(['pip', 'install', package])
    print("\nDependencies installed! Please run the script again.")

def capture_excel_sheet(excel_app, sheet, output_path, sheet_name):
    """Capture a screenshot of an Excel sheet"""
    try:
        # Activate the sheet
        sheet.Activate()
        time.sleep(1)  # Wait for sheet to render

        # Get the used range to determine what to capture
        used_range = sheet.UsedRange

        # Select the used range
        used_range.Select()
        time.sleep(0.5)

        # Maximize the Excel window
        excel_app.ActiveWindow.WindowState = -4137  # xlMaximized
        time.sleep(0.5)

        # Capture screenshot
        screenshot = ImageGrab.grab()

        # Save screenshot
        screenshot.save(output_path, 'PNG', quality=95)
        print(f"  ✓ Captured: {sheet_name} → {output_path.name}")

        return True

    except Exception as e:
        print(f"  ✗ Error capturing {sheet_name}: {e}")
        return False

def capture_finance_dashboard():
    """Capture screenshots from Finance Dashboard Excel file"""

    print("=" * 70)
    print("AUTOMATED EXCEL SCREENSHOT CAPTURE")
    print("=" * 70)

    # Define paths
    excel_file = Path(r'C:\Users\sorat\Desktop\Coding\Finance_Dashboard\GCC_Group_Finance_Master_Pack.xlsx')
    output_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\finance-dashboard')

    # Sheets to capture
    sheets_to_capture = {
        '1_Executive_Summary': 'executive-summary.png',
        '2_Regional_Matrix': 'regional-matrix.png',
        '3_CFO_Variance': 'cfo-variance.png',
        '4_Concept_Strategy': 'concept-strategy.png',
        '5_Cash_Flow': 'cash-flow.png',
        '6_YoY_Analysis': 'yoy-analysis.png'
    }

    # Validate paths
    if not excel_file.exists():
        print(f"\n❌ Error: Excel file not found at {excel_file}")
        return False

    output_dir.mkdir(parents=True, exist_ok=True)

    print(f"\n📂 Excel file: {excel_file.name}")
    print(f"📂 Output directory: {output_dir}")
    print(f"📸 Sheets to capture: {len(sheets_to_capture)}\n")

    # Initialize Excel
    print("Opening Excel...")
    excel_app = None
    workbook = None

    try:
        excel_app = win32com.client.Dispatch('Excel.Application')
        excel_app.Visible = True  # Make Excel visible
        excel_app.DisplayAlerts = False

        # Open workbook
        workbook = excel_app.Workbooks.Open(str(excel_file.absolute()))
        time.sleep(2)  # Wait for workbook to load

        print(f"✓ Opened workbook with {workbook.Sheets.Count} sheets\n")

        # Capture screenshots
        captured_count = 0
        for sheet_name, output_filename in sheets_to_capture.items():
            try:
                sheet = workbook.Sheets(sheet_name)
                output_path = output_dir / output_filename

                if capture_excel_sheet(excel_app, sheet, output_path, sheet_name):
                    captured_count += 1

            except Exception as e:
                print(f"  ✗ Sheet '{sheet_name}' not found: {e}")

        print(f"\n✅ Successfully captured {captured_count}/{len(sheets_to_capture)} screenshots")

        # Close workbook
        workbook.Close(SaveChanges=False)
        excel_app.Quit()

        return captured_count > 0

    except Exception as e:
        print(f"\n❌ Error: {e}")
        if workbook:
            workbook.Close(SaveChanges=False)
        if excel_app:
            excel_app.Quit()
        return False

def optimize_screenshots():
    """Optimize PNG screenshots to WebP format"""
    print("\n" + "=" * 70)
    print("OPTIMIZING SCREENSHOTS")
    print("=" * 70 + "\n")

    from PIL import Image

    finance_dir = Path(r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\finance-dashboard')
    png_files = list(finance_dir.glob('*.png'))

    if not png_files:
        print("No PNG files found to optimize.")
        return

    print(f"Found {len(png_files)} PNG file(s) to optimize\n")

    optimized_count = 0
    for png_file in png_files:
        try:
            # Open image
            img = Image.open(png_file)

            # Convert to RGB if necessary
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if too large (max width 1920px)
            if img.width > 1920:
                ratio = 1920 / img.width
                new_height = int(img.height * ratio)
                img = img.resize((1920, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized {png_file.name} to 1920x{new_height}")

            # Save as WebP
            webp_path = png_file.with_suffix('.webp')

            # Try different quality levels to get under 200KB
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

    # Check dependencies
    if not DEPENDENCIES_AVAILABLE:
        install_dependencies()
        return

    # Capture screenshots
    success = capture_finance_dashboard()

    if success:
        # Optimize to WebP
        optimize_screenshots()

        print("\n" + "=" * 70)
        print("✅ SCREENSHOT CAPTURE COMPLETE!")
        print("=" * 70)
        print("\nNext steps:")
        print("1. Review screenshots in: public/images/projects/finance-dashboard/")
        print("2. Build and deploy the site:")
        print("   cd C:\\Users\\sorat\\Desktop\\Coding\\portfolio_my")
        print("   npm run build")
        print("   git add .")
        print("   git commit -m 'Add Finance Dashboard screenshots'")
        print("   git push origin main")
    else:
        print("\n❌ Screenshot capture failed. Please check the errors above.")

if __name__ == '__main__':
    main()
