# Documents Archive (Master Resource Repository)

This directory serves as the local source repository for downloadable frameworks, guides, evaluation matrices, and policy templates presented in `/resources/` and referenced across the portfolio site.

## Purpose & Architecture
- **Web Serving Target:** Static downloadable files served by Astro live in `public/downloads/`.
- **Master Archive Target:** This folder (`documents_archive/`) maintains master working copies to prevent unintended deletion or pruning during automated front-end build refactoring, TypeScript migrations, or git clean operations.

## Inventory Summary (37 Files)
- **1 Excel Matrix:** `Internal_Audit_Report_Evaluation_Matrix_GIAS_2024.xlsx` (Global Internal Audit Standards 2024 single-report scoring tool).
- **3 Word Templates:**
  - `Risk_Appetite_Policy_Template.docx`
  - `Forensic_Investigation_Report_Template.docx`
  - `SOC_2_Internal_Audit_Readiness_and_Review_Guide.docx`
- **30 Catalog PDFs:** Checklists, comprehensive manuals, and visual strategy slide decks mapped to `src/data/documents.json`.
- **3 Site Asset PDFs:**
  - `Majid_Mumtaz_Capabilities_Deck.pdf` (Header dropdown / advisory overview)
  - `Continuous_Audit_Monitoring_Dashboard.pdf` (M&A case study asset)
  - `Data_Analytics_Training_Slide.pdf` (Training case study asset)
