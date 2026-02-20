#!/usr/bin/env python3
"""
Extract metadata from PDFs and create documents.json for the portfolio Resources section.
"""
import os
import json
import re
from pathlib import Path

try:
    from PyPDF2 import PdfReader
except ImportError:
    print("Installing PyPDF2...")
    os.system("pip install PyPDF2")
    from PyPDF2 import PdfReader

def sanitize_filename(title):
    """Convert title to safe filename."""
    # Remove special characters, keep alphanumeric and spaces
    safe = re.sub(r'[^\w\s-]', '', title)
    # Replace spaces with underscores
    safe = re.sub(r'\s+', '_', safe)
    # Limit length
    return safe[:100]

def extract_pdf_info(pdf_path):
    """Extract metadata from a PDF file."""
    try:
        reader = PdfReader(pdf_path)

        # Get page count
        page_count = len(reader.pages)

        # Get file size
        file_size_bytes = os.path.getsize(pdf_path)
        if file_size_bytes < 1024:
            file_size = f"{file_size_bytes} B"
        elif file_size_bytes < 1024 * 1024:
            file_size = f"{file_size_bytes / 1024:.0f} KB"
        else:
            file_size = f"{file_size_bytes / (1024 * 1024):.1f} MB"

        # Try to get title from metadata
        title = None
        if reader.metadata:
            title = reader.metadata.get('/Title', '')
            if title and len(title.strip()) > 0:
                title = title.strip()

        # If no title in metadata, try to extract from first page
        if not title or len(title) < 3:
            try:
                first_page = reader.pages[0]
                text = first_page.extract_text()
                # Get first non-empty line as title
                lines = [line.strip() for line in text.split('\n') if line.strip()]
                if lines:
                    title = lines[0][:100]  # Limit to 100 chars
            except:
                pass

        # If still no title, use filename
        if not title or len(title) < 3:
            title = Path(pdf_path).stem

        # Try to extract description from first page text
        description = ""
        try:
            first_page = reader.pages[0]
            text = first_page.extract_text()
            # Get first few lines as description
            lines = [line.strip() for line in text.split('\n') if line.strip()]
            if len(lines) > 1:
                # Skip title line, take next 2-3 lines
                desc_lines = lines[1:4]
                description = ' '.join(desc_lines)[:200]  # Limit to 200 chars
        except:
            pass

        if not description:
            description = f"Professional resource document on {title.lower()}"

        # Categorize based on keywords in title/content
        category = "Resources"
        title_lower = title.lower()
        if any(word in title_lower for word in ['audit', 'internal audit', 'auditing']):
            category = "Audit Guides"
        elif any(word in title_lower for word in ['sox', 'framework', 'compliance', 'coso']):
            category = "Frameworks"
        elif any(word in title_lower for word in ['checklist', 'control', 'testing']):
            category = "Checklists"
        elif any(word in title_lower for word in ['fraud', 'forensic', 'investigation']):
            category = "Fraud Resources"

        return {
            'title': title,
            'description': description,
            'page_count': page_count,
            'file_size': file_size,
            'category': category
        }

    except Exception as e:
        print(f"Error processing {pdf_path}: {e}")
        return None

def main():
    """Process all PDFs and create documents.json"""
    source_dir = Path(r"C:\Users\sorat\Downloads\website_uploads")
    target_dir = Path(r"C:\Users\sorat\Desktop\Coding\portfolio_my\public\downloads")

    # Ensure target directory exists
    target_dir.mkdir(parents=True, exist_ok=True)

    # Get all PDF files
    pdf_files = sorted(source_dir.glob("*.pdf"))

    print(f"Found {len(pdf_files)} PDF files")

    documents = []
    used_filenames = set()

    for idx, pdf_path in enumerate(pdf_files, 1):
        print(f"\nProcessing {idx}/{len(pdf_files)}: {pdf_path.name}")

        # Extract metadata
        info = extract_pdf_info(pdf_path)
        if not info:
            continue

        # Create safe filename
        base_filename = sanitize_filename(info['title'])
        filename = f"{base_filename}.pdf"

        # Handle duplicate filenames
        counter = 1
        while filename in used_filenames:
            filename = f"{base_filename}_{counter}.pdf"
            counter += 1
        used_filenames.add(filename)

        # Copy file to target directory
        target_path = target_dir / filename
        print(f"  Title: {info['title']}")
        print(f"  Pages: {info['page_count']}")
        print(f"  Size: {info['file_size']}")
        print(f"  Category: {info['category']}")
        print(f"  Copying to: {filename}")

        # Copy the file
        import shutil
        shutil.copy2(pdf_path, target_path)

        # Create document entry
        doc_entry = {
            'id': f"doc-{idx:03d}",
            'filename': filename,
            'title': info['title'],
            'description': info['description'],
            'category': info['category'],
            'size': info['file_size'],
            'pages': info['page_count'],
            'date': '2025-01-20'  # You can adjust this
        }

        documents.append(doc_entry)

    # Save documents.json
    json_path = target_dir / "documents.json"
    with open(json_path, 'w', encoding='utf-8') as f:
        json.dump(documents, f, indent=2, ensure_ascii=False)

    print(f"\n✅ Successfully processed {len(documents)} documents")
    print(f"📄 Created {json_path}")
    print(f"\nDocuments ready for deployment!")

if __name__ == "__main__":
    main()
