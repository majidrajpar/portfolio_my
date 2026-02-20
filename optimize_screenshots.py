"""
Screenshot Optimization Script for Portfolio
Converts PNG screenshots to optimized WebP format
Resizes to max 1920px width and compresses to <200KB
"""

from PIL import Image
import os
from pathlib import Path

class ScreenshotOptimizer:
    def __init__(self, input_dir, output_dir=None, max_width=1920, target_size_kb=200):
        self.input_dir = Path(input_dir)
        self.output_dir = Path(output_dir) if output_dir else self.input_dir
        self.max_width = max_width
        self.target_size_kb = target_size_kb

    def optimize_image(self, image_path):
        """Optimize a single image to WebP format"""
        try:
            # Open image
            img = Image.open(image_path)

            # Convert to RGB if necessary (WebP doesn't support RGBA in all cases)
            if img.mode in ('RGBA', 'LA'):
                background = Image.new('RGB', img.size, (255, 255, 255))
                background.paste(img, mask=img.split()[-1] if 'A' in img.mode else None)
                img = background
            elif img.mode != 'RGB':
                img = img.convert('RGB')

            # Resize if width exceeds max_width
            if img.width > self.max_width:
                ratio = self.max_width / img.width
                new_height = int(img.height * ratio)
                img = img.resize((self.max_width, new_height), Image.Resampling.LANCZOS)
                print(f"  Resized to {self.max_width}x{new_height}")

            # Determine output filename
            output_path = self.output_dir / (image_path.stem + '.webp')

            # Try different quality levels to get under target size
            quality = 85
            while quality > 50:
                img.save(output_path, 'WebP', quality=quality, method=6)

                # Check file size
                file_size_kb = output_path.stat().st_size / 1024

                if file_size_kb <= self.target_size_kb or quality <= 55:
                    print(f"  Saved as {output_path.name} ({file_size_kb:.1f} KB, quality={quality})")
                    return output_path

                quality -= 5

            return output_path

        except Exception as e:
            print(f"  Error optimizing {image_path.name}: {e}")
            return None

    def optimize_directory(self):
        """Optimize all PNG images in the input directory"""
        print(f"Optimizing screenshots in: {self.input_dir}")
        print(f"Output directory: {self.output_dir}")
        print(f"Max width: {self.max_width}px")
        print(f"Target size: {self.target_size_kb} KB\n")

        # Find all PNG files
        png_files = list(self.input_dir.glob('*.png'))

        if not png_files:
            print("No PNG files found in the directory.")
            return

        print(f"Found {len(png_files)} PNG file(s) to optimize:\n")

        optimized_count = 0
        for png_file in png_files:
            print(f"Processing: {png_file.name}")
            result = self.optimize_image(png_file)
            if result:
                optimized_count += 1
            print()

        print(f"\n✅ Optimization complete!")
        print(f"Successfully optimized {optimized_count}/{len(png_files)} images")

def main():
    """Main function - optimize Finance Dashboard screenshots"""

    # Define project directories
    projects = {
        'finance-dashboard': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\finance-dashboard',
        'audit-tools': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\audit-tools',
        'fraud-detection': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\fraud-detection',
        'forensic-toolbox': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\forensic-toolbox',
        'internal-tracker': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\internal-tracker',
        'carousel-content': r'C:\Users\sorat\Desktop\Coding\portfolio_my\public\images\projects\carousel-content'
    }

    print("=" * 60)
    print("PORTFOLIO SCREENSHOT OPTIMIZER")
    print("=" * 60)
    print("\nAvailable projects:")
    for i, (name, path) in enumerate(projects.items(), 1):
        print(f"{i}. {name}")

    print("\n" + "=" * 60)

    # For now, optimize finance-dashboard if screenshots exist
    finance_dir = Path(projects['finance-dashboard'])

    if finance_dir.exists():
        optimizer = ScreenshotOptimizer(
            input_dir=finance_dir,
            max_width=1920,
            target_size_kb=200
        )
        optimizer.optimize_directory()
    else:
        print(f"Directory not found: {finance_dir}")
        print("\nPlease capture screenshots first using the instructions in SCREENSHOT_INSTRUCTIONS.md")

if __name__ == '__main__':
    main()
