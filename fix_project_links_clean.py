#!/usr/bin/env python3
"""
Clean fix for project page links - only fixes href attributes, leaves everything else alone
"""

from pathlib import Path
import re

def fix_project_file(file_path):
    """Fix links in a project detail page"""
    content = file_path.read_text(encoding='utf-8')
    original = content

    # Add base import if not present
    if 'const base = import.meta.env.BASE_URL;' not in content:
        # Find position after imports to add base
        content = re.sub(
            r'(import [^\n]+\n)(const title)',
            r'\1const base = import.meta.env.BASE_URL;\n\n\2',
            content,
            count=1
        )

    # Fix breadcrumb home link: href="/portfolio_my/" -> href={base}
    content = re.sub(
        r'<a href="/portfolio_my/" class="text-blue-600',
        r'<a href={base} class="text-blue-600',
        content
    )

    # Fix breadcrumb projects link: href="/portfolio_my/projects/" -> href={`${base}projects/`}
    content = re.sub(
        r'href="/portfolio_my/projects/" class="text-blue-600',
        r'href={`${base}projects/`} class="text-blue-600',
        content
    )

    # Fix navigation "Back to Projects" link
    content = re.sub(
        r'href="/portfolio_my/projects/" class="btn btn-primary',
        r'href={`${base}projects/`} class="btn btn-primary',
        content
    )

    # Fix previous/next project navigation links
    # Pattern: href="/portfolio_my/projects/PROJECTNAME/"
    content = re.sub(
        r'href="/portfolio_my/projects/([a-z-]+)/" class="btn',
        r'href={`${base}projects/\1/`} class="btn',
        content
    )

    if content != original:
        file_path.write_text(content, encoding='utf-8')
        return True
    return False

def main():
    projects_dir = Path('src/pages/projects')
    fixed_count = 0

    # Fix all project detail pages (not index.astro)
    for astro_file in projects_dir.glob('*.astro'):
        if astro_file.name != 'index.astro':
            if fix_project_file(astro_file):
                print(f"Fixed: {astro_file.name}")
                fixed_count += 1

    print(f"\nTotal files fixed: {fixed_count}")

if __name__ == '__main__':
    main()
