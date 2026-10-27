# Field Operating Guide: Automated Excel Anomaly Testing
## A Practical Field Toolkit for Internal Audit Teams

---

### Introduction: Why This Replaces Sample Testing
Traditional internal audit methodology relies on pulling 25 random invoices from an ERP export, checking whether authorized signatures exist on paper forms, and writing a clean bill of health. 

In reality:
* Fraudsters know how to forge or obtain authorized signatures.
* 25 samples out of 50,000 transactions represents a 0.05% confidence window, statistically blind to intentional overrides.
* Operational breakdowns and manual workarounds occur in specific patterns: under approval thresholds, outside working hours, or across dormant master data.

This toolkit replaces sample checklists with **100% population deterministic scanning** in Microsoft Excel.

---

### Package Contents

```
Auditor_Toolkit_Pack/
├── Auditor_Anomaly_Testing_Template.xlsx   # Live Excel model with working formulas & test data
├── FIELD_GUIDE.md                         # This complete manual
├── FIELD_CHEAT_SHEET.md                   # 1-page quick triage rubric for field use
└── DATA_REQUEST_SPEC_FOR_IT.md            # Exact ERP extraction requirements for IT
```

---

### Quick Start: How to Run the Workbook

1. Open `Auditor_Anomaly_Testing_Template.xlsx`.
2. Review the tabs:
   * **`Instructions`**: Workflow map and operational methodology.
   * **`Test1_Split_POs`**: Pre-built table with sample procurement data and working split PO detection formulas.
   * **`Test2_Dormant_Vendors`**: Vendor master activity and bank modification timeline audit.
   * **`Test3_Duplicate_Invoices`**: AP invoice duplicate detection with automatic punctuation stripping.
   * **`Test4_Off_Hours_GL`**: Journal entry time-anomaly analysis isolating manual weekend and night entries.
   * **`Test5_Round_Sum_Services`**: High-risk discretionary spend analysis (Consulting, Marketing, Legal).
   * **`Audit_Exceptions`**: Aggregated audit workpaper summary with financial exposure calculations.

3. **To run with your client's live data:**
   * Open the relevant tab (e.g., `Test1_Split_POs`).
   * Clear the sample rows (leave Row 1 headers intact).
   * Paste your raw ERP extract.
   * Ensure formula columns (highlighted in light blue) extend down to your last data row.
   * Filter the Flag column for `"FLAG: ..."`.

---

### The 5 Tests in Detail

#### Test 1: Split POs / Split Invoices
* **Operational Risk:** Bypassing Delegation of Authority (DOA) limits.
* **Mechanism:** A manager with a $10,000 limit splits a $17,500 commitment into two orders ($8,750 each) issued to the same vendor within days.
* **The Excel Formula:**
  ```excel
  =IF(AND(D2<10000, COUNTIFS(A:A, A2, B:B, B2, C:C, ">="&C2, C:C, "<="&(C2+5), D:D, "<10000")>1, SUMIFS(D:D, A:A, A2, B:B, B2, C:C, ">="&C2, C:C, "<="&(C2+5))>=10000), "FLAG: SPLIT PO", "OK")
  ```
* **Audit Next Step:** Pull the contract or purchase requisition. Check whether single deliverables were partitioned.

#### Test 2: Inactive / Dormant Vendor Resuscitation
* **Operational Risk:** Redirection of corporate cash to fraudulent bank accounts.
* **Mechanism:** A vendor account unused for >180 days is updated with a new bank account and immediately paid.
* **The Excel Formula:**
  ```excel
  =IF(AND(ISNUMBER(C2), ISNUMBER(D2), (B2-C2)>180, (B2-D2)<=30, (B2-D2)>=0), "FLAG: DORMANT RESUSCITATION", "OK")
  ```
* **Audit Next Step:** Demand independent proof of call-back verification performed prior to the bank account update.

#### Test 3: Near-Duplicate Invoices (Punctuation Stripping)
* **Operational Risk:** Double-payment cash leakage.
* **Mechanism:** Vendors resubmit unpaid invoices with minor character alterations (e.g., `INV-8890` vs `INV8890`), which bypasses standard ERP duplicate matching rules.
* **The Excel Formula (Cleaner):**
  ```excel
  =SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(SUBSTITUTE(LOWER(TRIM(B2)), "-", ""), "/", ""), " ", ""), ".", "")
  ```
* **The Excel Formula (Detector):**
  ```excel
  =IF(COUNTIFS(A:A, A2, C:C, C2, D:D, D2)>1, "FLAG: DUPLICATE INVOICE", "OK")
  ```
* **Audit Next Step:** Verify bank settlement reference numbers. If two settlements cleared, initiate recovery immediately.

#### Test 4: Off-Hours & Weekend Postings
* **Operational Risk:** Evasion of supervisory review during cutoff periods.
* **Mechanism:** Manual journals posted at night or on weekends to alter accruals, scrap inventory, or adjust revenue before month-end lock.
* **The Excel Formula:**
  ```excel
  =IF(OR(WEEKDAY(C2, 2)>5, MOD(C2, 1)<TIME(7,0,0), MOD(C2, 1)>TIME(19,0,0)), "FLAG: OFF-HOURS ENTRY", "OK")
  ```
* **Audit Next Step:** Exclude automated system IDs. For manual user IDs, inspect credit lines to revenue or asset clearing accounts.

#### Test 5: Suspicious Round-Sum Invoices
* **Operational Risk:** Unsubstantiated professional services spend or kickback arrangements.
* **Mechanism:** Flat-fee payments (e.g., $10,000, $25,000) processed without milestone tracking or detailed time cards.
* **The Excel Formula:**
  ```excel
  =IF(AND(C2>=5000, OR(MOD(C2, 1000)=0, MOD(C2, 2500)=0), ISNUMBER(MATCH(B2, {"Consulting", "Professional Fees", "Legal Fees", "Marketing Expenses", "Advisory"}, 0))), "FLAG: SUSPICIOUS ROUND SUM", "OK")
  ```
* **Audit Next Step:** Inspect the physical deliverables (reports, decks, legal filings) supporting the disbursement.

---

### Writing Findings: The EBITDA Exposure Standard
Never write: *"3 invoices did not follow policy."*  
Always write:
> *"During our 100% population review of FY25 procurement transactions ($42.8M total spend), we identified 14 instances of split purchase orders totaling $218,000 bypassing Senior Management Delegation of Authority limits. This allowed department heads to commit corporate cash without competitive bidding, resulting in an estimated 5–8% pricing premium over contracted supplier rates."*
