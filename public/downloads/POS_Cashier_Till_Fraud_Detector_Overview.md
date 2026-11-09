# POS Cashier & Till Fraud Detection Architecture

**Automated Electronic Journal Analytics & Deterministic Forensic Engine for Retail and F&B Operations**  
**Author & Framework Architect:** Majid Mumtaz | CIA (IIA), ACA (ICAEW UK), FCCA (ACCA UK), GRCP & GRCA (OCEG), COSO ERM Certified  
**Thought Leadership:** [The Audit Signal (LinkedIn)](https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/)  
**Fiduciary Suite & Portfolio:** [majidrajpar.github.io/portfolio_my](https://majidrajpar.github.io/portfolio_my)  
**Commercial Licensing & Deployment:** [Gumroad Product Page](https://majidmumtaz.gumroad.com/l/pos-cashier-till-fraud-detector)

---

## 1. Executive Summary & Fiduciary Context

Retail, hospitality, and quick-service restaurant (QSR) operations operate under intense transaction volumes where till-level margin leakage accounts for 1.5% to 3.5% of gross sales. 

Traditional audit routines pull 25 random transaction receipts once a year. This retrospective sampling confirms that a receipt printer works, but leaves 99.99% of Electronic Journal (EJ) lines completely unassessed—allowing systematic cashier skimming schemes (sweethearting, off-hours drawer kicks, phantom managerial voids, and pre-tender item deletions) to persist across entire fiscal cycles.

The **POS Cashier & Till Fraud Detection Model** replaces retrospective sample testing with **100% population deterministic forensic testing**. It ingests raw POS Electronic Journal exports and scores cashier behavior across four quantitative anomaly engines.

---

## 2. Workbook Architecture & Technical Inventory

The model is a production-grade, macro-free 8-sheet institutional Excel workbook engineered with 2,009 active formula cells running strictly on native Excel functions with zero VBA/macro dependencies:

| Sheet Name | Domain Scope | Primary Metrics & Forensic Tests | Output Type |
| :--- | :--- | :--- | :---: |
| **`Executive_Summary`** | High-level risk dashboard & EBITDA leakage quantification | Aggregate loss exposure, branch risk ranking, high-risk cashier count | Strategic Rollup |
| **`Cashier_Scorecard`** | Multi-engine risk matrix ranking all cashiers | Weighted fraud composite index, Z-score standard deviations | Prioritized Ranking |
| **`CCTV_Review_Queue`** | Prioritized surveillance review log | Exact transaction IDs, camera timestamps, register terminal IDs | Action Queue |
| **`Engine_1_Voids`** | Post-settlement managerial void latency | Void-to-settlement timing gap, supervisor authorization override volume | Forensic Engine |
| **`Engine_2_Deletions`** | Pre-tender line-item cancellations | Item deletion frequency before subtotal, zero-dollar tender receipts | Forensic Engine |
| **`Engine_3_Drawer_Kicks`** | No-sale drawer opening telemetry | Off-peak drawer opens, no-sale-to-transaction ratio | Forensic Engine |
| **`Engine_4_PIN_Sharing`** | Supervisor PIN concurrency anomalies | Concurrent supervisor overrides across multiple registers | Forensic Engine |
| **`Data_Ingestion_Schema`** | POS import mapping & data normalization | Standardized schema for Oracle Micros, NCR Aloha, Toast, Revel, Square | Ingestion Hub |

---

## 3. Four Deterministic Forensic Engines

1. **Post-Settlement Void Latency:** Detects cash orders marked as canceled or voided after the customer has tendered payment and departed the counter.
2. **Pre-Tender Item Cancellation:** Analyzes frequency and monetary value of individual items removed from orders prior to totalization, identifying pocketed cash differences.
3. **No-Sale Drawer Kicks:** Flags registers opened using the "No Sale" key during slow periods or after hours, isolating cashiers exceeding +2.5 standard deviations above the branch mean.
4. **Supervisor PIN Concurrency:** Identifies instances where a single manager's authorization credential is used simultaneously at multiple physical terminals within seconds.

---

## 4. Commercial Licensing Options

* **Single Branch / Internal Deployment ($69):** Unlocked, formula-visible production workbook for perpetual internal deployment within a single operating company.
* **Commercial Advisory Rights ($189):** Unlocked workbook with full commercial redistribution rights for advisory firms, external consultants, and multi-client audits.
* **Direct Licensing:** [https://majidmumtaz.gumroad.com/l/pos-cashier-till-fraud-detector](https://majidmumtaz.gumroad.com/l/pos-cashier-till-fraud-detector)
