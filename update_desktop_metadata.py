from pypdf import PdfReader, PdfWriter
import docx

# Files to update
pdf_path = r"C:\Users\sorat\Desktop\Updated CV\Majid-Mumtaz-Internal-Audit-Director-UAE-KSA-CV.pdf"
docx_path = r"C:\Users\sorat\Desktop\Updated CV\Majid-Mumtaz-Internal-Audit-Director-UAE-KSA-CV.docx"

# Common SEO values
TITLE = "Majid Mumtaz | Chief Audit Executive | Internal Audit Director | UAE & KSA"
AUTHOR = "Majid Mumtaz"
SUBJECT = "Executive CV - Internal Audit, Fraud Detection, and IPO Readiness"
KEYWORDS = "Internal Audit, UAE, KSA, Fraud Detection, SOX 404, GRC, Risk Management, Chief Audit Executive"

# 1. Update PDF Metadata
try:
    reader = PdfReader(pdf_path)
    writer = PdfWriter()
    for page in reader.pages:
        writer.add_page(page)
    
    metadata = {
        "/Title": TITLE,
        "/Author": AUTHOR,
        "/Subject": SUBJECT,
        "/Keywords": KEYWORDS,
        "/Producer": "Majid Mumtaz SEO Engine",
        "/Creator": AUTHOR
    }
    writer.add_metadata(metadata)
    with open(pdf_path, "wb") as f:
        writer.write(f)
    print(f"✅ PDF Updated: {pdf_path}")
except Exception as e:
    print(f"❌ Error updating PDF: {e}")

# 2. Update DOCX Metadata
try:
    doc = docx.Document(docx_path)
    prop = doc.core_properties
    prop.title = TITLE
    prop.author = AUTHOR
    prop.subject = SUBJECT
    prop.keywords = KEYWORDS
    prop.comments = "Optimized for GCC Executive Search"
    doc.save(docx_path)
    print(f"✅ DOCX Updated: {docx_path}")
except Exception as e:
    print(f"❌ Error updating DOCX: {e}")
