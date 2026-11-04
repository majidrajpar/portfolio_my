# [Entity Name L.L.C.]
# UAE Regulatory Compliance and Governance Architecture
# Trade Name: [Trading Name] | SCA Category 1 & Category 5 License: [SCA License No.]

## 1. Executive Summary and Statutory Authorisations

[Entity Name L.L.C.] (trading as [Trading Name], the Firm) is an authorized financial institution incorporated under the commercial laws of the United Arab Emirates and licensed by the Securities and Commodities Authority (SCA) under License No. [SCA License No.]. The Firm operates under two statutory licensing authorizations pursuant to Chairman of the Authority's Board of Directors Decision No. (13/Chairman) of 2021 on the Rulebook of Financial Activities and Reconciliation of Status:

Category 1: Trading Broker in Over-the-Counter (OTC) Derivatives and Spot Foreign Exchange. Under this authorization, the Firm operates execution platforms, provides liquidity, acts as principal and risk-mitigating agent in contracts for differences (CFDs) and foreign currency contracts, and maintains custody of segregated client funds in CBUAE-regulated depository institutions.

Category 5: Financial Consultation and Financial Analysis. Under this authorization, the Firm provides macro-economic commentary, technical chart research, independent investment analysis, and market consultation to retail and professional counterparties.

This operational compliance architecture establishes an end-to-end governance, risk management, and surveillance program designed to satisfy the SCA Rulebook, UAE Federal AML/CFT legislation, CBUAE client asset standards, and international financial market best practice.

---

## 2. Policy and Operational Specification Architecture

The operational compliance framework is organized into five specialized regulatory policies and technical specifications:

[docs/01_compliance_manual.md](file:///C:/Users/sorat/Desktop/Coding/marketplace_products/11_UAE_SCA_Financial_Brokerage_Compliance_CCM_Suite/docs/01_compliance_manual.md): Corporate Governance, Statutory Licensing Framework, Paid-Up Capital Baselines (AED 30,000,000 Category 1, AED 1,000,000 - AED 2,000,000 Category 5, and SCA Bank Guarantees), Approved Person Mandates (SEO, Compliance Officer, MLRO, Risk Officer, Head of Internal Audit), CISI Qualifications, Physical and System Chinese Walls, Personal Account Dealing (PAD) Blackouts, Regulatory Early Warning Triggers, Off-Channel Communication Archiving, and the 10-Year Immutable Record Retention Mandate reconciling UAE PDPL (Federal Decree-Law No. 45/2021).

[docs/02_aml_cft_sanctions_program.md](file:///C:/Users/sorat/Desktop/Coding/marketplace_products/11_UAE_SCA_Financial_Brokerage_Compliance_CCM_Suite/docs/02_aml_cft_sanctions_program.md): AML/CFT and Sanctions Compliance Program, Federal Decree-Law No. (20) of 2018, Cabinet Decision No. (10) of 2019, Standard CDD as Non-Negotiable Retail Baseline (SDD Eliminated for Leveraged Products), Ultimate Beneficial Ownership (UBO) at the 25% Statutory Threshold under Cabinet Decision No. (109) of 2023, Senior Management PEP Approval and 12-Month Post-Tenure Monitoring, Immediate EOCN / UNSC Sanctions Freezes (within 24 Hours), Leveraged Derivative Liquidation Protocol to Blocked Escrow, Introducing Broker (IB) Governance under Article 19, Red Flag Typologies, and Dual Reporting via goAML and the EOCN TFS Portal.

[docs/03_client_money_segregation_policy.md](file:///C:/Users/sorat/Desktop/Coding/marketplace_products/11_UAE_SCA_Financial_Brokerage_Compliance_CCM_Suite/docs/03_client_money_segregation_policy.md): Client Money and Asset Segregation Policy, SCA Client Asset Protection Standards, Approved Depository Criteria in CBUAE-Regulated Commercial Banks (Minimum 60% Domestic Bank Holding, Maximum 40% Clearing Broker Escrow Cap, 50% Single-Bank Concentration Limit), Prudent Buffer Allocation Model (Firm Buffer Pre-Funding Uncleared Card/PSP Float), Dual-Tier Daily Reconciliation Architecture (Internal Platform-to-Ledger and External Segregated Resource Reconciliation), Annual Trust Letter Re-Certification, Firm Buffer Reserve Floor (AED 5,000,000 / 10% TCER), and Mandatory SCA Deficit Notification at 09:00 UAE Time on T+1.

[docs/04_conduct_of_business_and_retail_protection.md](file:///C:/Users/sorat/Desktop/Coding/marketplace_products/11_UAE_SCA_Financial_Brokerage_Compliance_CCM_Suite/docs/04_conduct_of_business_and_retail_protection.md): Conduct of Business and Retail Investor Protection Policy, Client Categorisation Architecture (Retail, Elective Professional, Market Counterparty), Non-Compensatory 3-Part Appropriateness Framework (Part A Risk Mechanics Hard Hurdle >= 35/40 Points; Dynamic 40-Question Pool; 12-Month Re-Test Cycle), Statutory Leverage Caps (30:1 Major FX, 20:1 Minor FX / Gold / Tier 1 Major Indices, 10:1 Commodities / Tier 2 Minor Indices, 5:1 Equities, 2:1 Crypto), 50% Gross Margin Requirement on Fully Hedged Positions, Mandatory 50% Margin Close-Out Rule, Unconditional Negative Balance Protection, Marketing Restrictions, Best Execution, Symmetric Slippage Enforcement, and 15-Business-Day Complaint Handling SLA.

[docs/05_continuous_controls_monitoring_spec.md](file:///C:/Users/sorat/Desktop/Coding/marketplace_products/11_UAE_SCA_Financial_Brokerage_Compliance_CCM_Suite/docs/05_continuous_controls_monitoring_spec.md): Continuous Controls Monitoring (CCM) and Technical Telemetry Specification, Event Streaming Architecture (Kafka, Flink, TimescaleDB), Normalized Relational Schemas with Multi-Currency Central Bank FX Normalization, Client-to-Account Hierarchies, and Payment Metadata (Card BIN, Token Hash, IP, Device Fingerprint), Production SQL and Streaming Rules: CCM-01 (Segregation Deficit with AED 5M Floor, Pending Disbursement Deductions, and 4-Eyes Dual Approval), CCM-02 (Card Token Collision & Velocity Surveillance), CCM-03 (Holding Duration & Capital Washing Analysis), CCM-04A/B (Statutory Leverage Enforcement & Stateful Flink 500ms Stop-Out Verification), CCM-05 (Dormancy Reactivation against Historical Baselines), CCM-06 (Negative Balance Absorption Latency), CCM-07 (Abusive Latency Arbitrage & Asymmetric Slippage), CCM-08 (Permitted Crypto-Asset Leverage Surveillance), Incident Runbooks, and Cryptographic Merkle Tree Ledger Immutability.

---

## 3. Statutory Regulatory Obligations Matrix

```
+-----------------------------------+-----------------------------------+-----------------------------------+
| Regulatory Domain                 | Governing Legislation / Authority | Core Statutory Compliance Mandate |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Corporate Licensing & Governance  | SCA Rulebook Decisions No. 13/2021| Maintain Category 1 paid-up       |
|                                   | and No. 01/R.M of 2023; UAE CCL   | capital (>= AED 30M) and guarantee|
|                                   | Decree-Law No. (32) of 2021       | (AED 1M-5M); approved officers    |
|                                   |                                   | (SEO, CO, MLRO, RO, Internal Audit|
|                                   |                                   | Head); physical/system walls.     |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Anti-Money Laundering & Sanctions | Federal Decree-Law No. (20) of    | Standard CDD baseline for retail; |
|                                   | 2018; Cabinet Decision 10/2019;   | 25% UBO resolution; Senior Exec   |
|                                   | Cabinet Decision 74/2020; Cabinet | PEP approval; 24h EOCN/UN freeze; |
|                                   | Decision 109/2023; UAE FIU / EOCN | derivative liquidation to blocked |
|                                   |                                   | escrow; goAML & TFS reporting.    |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Client Asset Segregation          | SCA Category 1 Financial Rulebook;| Trust bank accounts in CBUAE      |
|                                   | CBUAE Commercial Banking Standards| banks (>=60%); clearing broker cap|
|                                   |                                   | (<=40%); 50% single-bank cap;     |
|                                   |                                   | buffer pre-funding; T+1 dual recon|
|                                   |                                   | with 09:00 notification mandate.  |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Conduct of Business & Protection  | SCA Category 1 & 5 Conduct Rules; | Retail leverage caps (30:1 to 2:1)|
|                                   | Investor Protection Directives    | 50% gross hedged margin; 50% stop |
|                                   |                                   | out; negative balance protection; |
|                                   |                                   | non-compensatory appropriateness; |
|                                   |                                   | symmetric slippage; 15-day SLA.   |
+-----------------------------------+-----------------------------------+-----------------------------------+
| Data Governance & Records         | SCA Books & Records Regulations;  | Minimum 10-year retention from    |
|                                   | UAE PDPL Decree-Law No. 45/2021   | relationship end in AWS S3 WORM   |
|                                   |                                   | Compliance Mode; PDPL statutory   |
|                                   |                                   | override; off-channel archiving.  |
+-----------------------------------+-----------------------------------+-----------------------------------+
```

---

## 4. Annual Compliance and Audit Roadmap

The Firm executes a structured, recurring statutory compliance roadmap across every calendar year to satisfy its licensing covenants with the SCA and the UAE Financial Intelligence Unit:

```
+---------------------------------------------------------------------------------------------------+
|                                ANNUAL COMPLIANCE AUDIT ROADMAP                                    |
+---------------------------------------------------------------------------------------------------+
| Quarter 1 (January - March)                                                                       |
| - Finalization of Statutory Annual Financial Statements by External Auditors (Deadline: March 31).|
| - Execution of Annual External Client Asset Assurance Audit submitted to SCA (Deadline: March 31).|
| - Compilation and Board Presentation of Annual Compliance Officer Review Report.                  |
| - Annual Re-Certification of Depository Trust Letters across all CBUAE Banks and Clearing Brokers.|
| - Submission of Q4 Conduct of Business Complaints Return and Exposure Report to SCA.             |
| - Recertification of goAML User Credentials and EOCN Sanctions Screening Rails.                   |
+---------------------------------------------------------------------------------------------------+
| Quarter 2 (April - June)                                                                          |
| - Execution of Independent Annual External AML/CFT Assurance Audit (Deadline: June 30).           |
| - Comprehensive Enterprise-Wide Risk Assessment (EWRA) update.                                     |
| - Review and recalibration of Continuous Controls Monitoring (CCM) SQL and streaming rules.       |
| - Annual review and update of Customer Due Diligence, Introducing Broker, and UBO registries.     |
| - Submission of Q1 Complaints and Regulatory Capital Returns to SCA.                             |
+---------------------------------------------------------------------------------------------------+
| Quarter 3 (July - September)                                                                      |
| - Execution of Mandatory Annual Employee AML/CFT and Conduct Training and Examination.            |
| - Mid-year Stress Testing of Client Asset Segregation Buffer under Extreme Liquidity Scenarios.   |
| - Independent Cybersecurity Penetration Testing and NESA Compliance Audit.                         |
| - Periodic Appropriateness Question Pool Reshuffle and Algorithmic Weighting Recalibration.       |
| - Submission of Q2 Exposure and Complaints Returns to SCA.                                        |
+---------------------------------------------------------------------------------------------------+
| Quarter 4 (October - December)                                                                    |
| - Annual Review of Liquidity Provider Execution Quality and Venue Best Execution (RTS Equivalent).|
| - Annual Review and Board Re-Approval of Compliance Manual, AML Policy, and CCM Specifications.   |
| - Verification of 10-Year Record Retention AWS S3 Object Lock Archives and DR Failover Testing.  |
| - Preparation of Pre-Audit Files for Statutory Financial and Client Asset Auditors.               |
| - Submission of Q3 Regulatory Reports to SCA.                                                     |
+---------------------------------------------------------------------------------------------------+
```

---

## 5. Document Governance and Revision Control

This compliance documentation architecture is maintained under strict version control overseen by the Compliance Officer. Any modification to operational thresholds, leverage caps, reconciliation formulas, or surveillance parameters requires prior formal approval from the Board Compliance and Ethics Committee and notification to the Securities and Commodities Authority where required by law.

```
+--------------------+---------------------+---------------------+----------------------------------+
| Version            | Effective Date      | Primary Author      | Approving Authority              |
+--------------------+---------------------+---------------------+----------------------------------+
| 1.0.0              | November 2026       | Compliance Director | Board of Directors / SCA File    |
| 2.0.0              | November 2026       | Compliance Director | Board of Directors / SCA File    |
+--------------------+---------------------+---------------------+----------------------------------+
```
