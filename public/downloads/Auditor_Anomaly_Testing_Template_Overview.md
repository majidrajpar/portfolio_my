# Continuous Controls Monitoring (CCM) Field Audit Architecture

**Enterprise-Grade Continuous Audit Testing Model Across 5 ERP Exception Engines**  
**Author & Framework Architect:** Majid Mumtaz | CIA (IIA), ACA (ICAEW UK), FCCA (ACCA UK), GRCP & GRCA (OCEG), COSO ERM Certified  
**Thought Leadership:** [The Audit Signal (LinkedIn)](https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/)  
**Fiduciary Suite & Portfolio:** [majidrajpar.github.io/portfolio_my](https://majidrajpar.github.io/portfolio_my)  
**Commercial Licensing & Deployment:** [Gumroad Product Page](https://majidmumtaz.gumroad.com/l/ccm-anomaly-field-toolkit)

---

## 1. Executive Summary & Fiduciary Context

Standard internal and external audit walkthroughs rely on 25-sample populations to evaluate automated procurement and general ledger controls, regardless of annual transaction volume. In high-volume corporate environments, testing 25 lines inspects 0.0006% of activity while certifying that controls operate effectively across the entire fiscal year.

The **Continuous Controls Monitoring (CCM) Field Audit Toolkit** replaces retrospective sample testing with **100% full-population exception testing**. It ingests purchase-to-pay (P2P), accounts payable, and general ledger journal tables, running deterministic algorithms to surface split purchase orders, dormant vendor resuscitation, duplicate invoice payments, off-hours journals, and round-sum advisory retainers.

---

## 2. Workbook Architecture & Technical Inventory

The model is a self-contained, macro-free 9-sheet institutional Excel workbook engineered with strict formula syntax standards, dynamic aggregation, and an integrated synthetic stress pack:

| Sheet Name | Domain Scope | Primary Anomaly Engine | Output Type |
| :--- | :--- | :--- | :---: |
| **`Audit_Dashboard`** | High-level findings summary & EBITDA leakage quantification | Aggregate exposure, finding severity ranking, remediation tracker | Executive Rollup |
| **`Engine_1_Split_POs`** | Delegated authority threshold avoidance | Identifies POs split below approval limits within rolling cutoff windows | Exception Engine |
| **`Engine_2_Dormant_Vendors`** | Vendor master-file resuscitation fraud | Flags inactive supplier accounts reactivated for immediate disbursements | Exception Engine |
| **`Engine_3_Duplicate_Payments`**| Multi-vector duplicate invoice detection | 7-layer string normalization, transposed numbers, phonetic fuzzy matching | Exception Engine |
| **`Engine_4_Off_Hours_JEs`** | High-risk manual general ledger adjustments | Flags manual entries posted on weekends, statutory holidays, and off-hours | Exception Engine |
| **`Engine_5_Round_Sum_Fees`** | Advisory and professional fee triage | Screens un-itemized round-sum invoices against contract schedules | Exception Engine |
| **`Data_Request_Spec`** | Technical ERP extract requirements | Standardized SQL queries for SAP S/4HANA, Oracle ERP Cloud, NetSuite | IT Data Spec |
| **`Methodology_Rubric`** | Fieldwork cheat sheet and escalation thresholds | Formal criteria for red-flag escalation to Audit Committee | Governance Paper |

---

## 3. Five Core Exception Engines

1. **Split Purchase Orders:** Identifies clustered orders issued to the same vendor within 72 hours where individual amounts fall immediately below approval thresholds.
2. **Dormant Vendor Resuscitation:** Flags payments disbursed to supplier accounts that showed zero transaction activity for 180+ days prior to sudden disbursement.
3. **Multi-Vector Duplicate Invoicing:** Normalizes alphanumeric invoice numbers, detects character transposition, and matches identical disbursements across conflicting payment methods.
4. **Off-Hours Journal Adjustments:** Evaluates manual journal entry timestamps to isolate non-system adjustments posted outside standard operating hours without dual authorization.
5. **Round-Sum Advisory Retainers:** Scans disbursement lines for round-figure amounts (e.g., $25,000, $50,000) lacking three-way purchase order matching or deliverable sign-offs.

---

## 4. Commercial Licensing Options

* **Single Audit Team / Internal Deployment ($39):** Unlocked, formula-visible production workbook for internal audit departments and finance teams.
* **Commercial Advisory Rights ($99):** Unlocked workbook with full commercial redistribution rights for advisory firms, external consultants, and multi-client audits.
* **Direct Licensing:** [https://majidmumtaz.gumroad.com/l/ccm-anomaly-field-toolkit](https://majidmumtaz.gumroad.com/l/ccm-anomaly-field-toolkit)
