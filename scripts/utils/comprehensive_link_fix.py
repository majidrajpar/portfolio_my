#!/usr/bin/env python3
"""Comprehensively fix all internal links to use base path correctly"""

import re
from pathlib import Path

def fix_astro_file(content):
    """Fix all internal links in an Astro file"""

    # Ensure base is defined (add after imports if not present)
    if 'const base = import.meta.env.BASE_URL;' not in content:
        # Find the last import line
        lines = content.split('\n')
        new_lines = []
        added_base = False
        for i, line in enumerate(lines):
            new_lines.append(line)
            if line.startswith('import ') and not added_base:
                # Look ahead to see if next line is also an import
                if i + 1 < len(lines) and not lines[i + 1].startswith('import '):
                    new_lines.append('const base = import.meta.env.BASE_URL;')
                    added_base = True

        if not added_base:
            # Just add it after the frontmatter start
            for i, line in enumerate(new_lines):
                if line.strip() == '---' and i > 0:
                    new_lines.insert(i, 'const base = import.meta.env.BASE_URL;')
                    break

        content = '\n'.join(new_lines)

    # Fix various href patterns to use base
    replacements = [
        # Home link
        (r'href="/"([^>])', r'href={base}\1'),
        # Projects links
        (r'href="/projects/"', r'href={`${base}projects/`}'),
        (r'href="/projects/([^"]+)"', r'href={`${base}projects/\1`}'),
        # Other pages
        (r'href="/about/"', r'href={`${base}about/`}'),
        (r'href="/skills/"', r'href={`${base}skills/`}'),
        (r'href="/consulting/"', r'href={`${base}consulting/`}'),
        (r'href="/contact/"', r'href={`${base}contact/`}'),
        # CV link
        (r'href="/cv/([^"]+)"', r'href={`${base}cv/\1`}'),
        # Fix double /portfolio_my/ paths
        (r'/portfolio_my/portfolio_my/', r'/portfolio_my/'),
    ]

    for pattern, replacement in replacements:
        content = re.sub(pattern, replacement, content)

    return content

def main():
    # Fix all .astro files in src/pages
    src_pages = Path('src/pages')
    astro_files = list(src_pages.rglob('*.astro'))

    fixed_count = 0
    for file_path in astro_files:
        try:
            content = file_path.read_text(encoding='utf-8')
            new_content = fix_astro_file(content)

            if content != new_content:
                file_path.write_text(new_content, encoding='utf-8')
                print(f"Fixed: {file_path}")
                fixed_count += 1
        except Exception as e:
            print(f"Error fixing {file_path}: {e}")

    print(f"\nFixed {fixed_count} files")

if __name__ == '__main__':
    main()
