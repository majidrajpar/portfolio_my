#!/usr/bin/env python3
"""Fix malformed template literals in Astro files"""

import os
import re
from pathlib import Path

def fix_template_literals(content):
    """Fix href={`${base}something/" to href={`${base}something/`}"""
    # Pattern: href={`${base}PATH/" class=
    # Replace with: href={`${base}PATH/`} class=
    pattern = r'href=\{`\$\{base\}([^`]*)"(\s+class=)'
    replacement = r'href={`${base}\1`}\2'
    content = re.sub(pattern, replacement, content)

    # Also fix any other quote patterns
    pattern2 = r'href=\{`\$\{base\}([^`]*)"\}'
    replacement2 = r'href={`${base}\1`}'
    content = re.sub(pattern2, replacement2, content)

    return content

def main():
    src_pages = Path('src/pages')
    astro_files = list(src_pages.rglob('*.astro'))

    fixed_count = 0
    for file_path in astro_files:
        content = file_path.read_text(encoding='utf-8')
        new_content = fix_template_literals(content)

        if content != new_content:
            file_path.write_text(new_content, encoding='utf-8')
            print(f"Fixed: {file_path}")
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
