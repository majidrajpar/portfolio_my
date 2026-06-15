#!/usr/bin/env python3
"""Remove duplicate 'const base = import.meta.env.BASE_URL;' declarations"""

import os
import re
from pathlib import Path

def remove_duplicate_base(content):
    """Keep only the first occurrence of const base declaration"""
    lines = content.split('\n')
    new_lines = []
    base_found = False
    in_frontmatter = False

    for line in lines:
        if line.strip() == '---':
            in_frontmatter = not in_frontmatter
            new_lines.append(line)
            continue

        if in_frontmatter and line.strip() == 'const base = import.meta.env.BASE_URL;':
            if not base_found:
                new_lines.append(line)
                base_found = True
            # Skip duplicate declarations
            continue

        new_lines.append(line)

    return '\n'.join(new_lines)

def main():
    src_pages = Path('src/pages')
    astro_files = list(src_pages.rglob('*.astro'))

    fixed_count = 0
    for file_path in astro_files:
        content = file_path.read_text(encoding='utf-8')
        new_content = remove_duplicate_base(content)

        if content != new_content:
            file_path.write_text(new_content, encoding='utf-8')
            print(f"Fixed: {file_path}")
            fixed_count += 1

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
