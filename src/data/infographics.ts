export interface InfographicItem {
  id: string;
  title: string;
  subtitle: string;
  tag: string;
  filename: string;
  aspectRatio: 'portrait' | 'landscape';
  paradox: string;
  notes: string[];
  keyTakeaway: string;
  relatedCaseStudy?: {
    slug: string;
    label: string;
  };
}

export const infographics: InfographicItem[] = [
  {
    id: 'samples-tested-myth',
    title: '25 Samples Tested. Control Effective.',
    subtitle: 'Standard Sample Testing vs. High-Volume Ledger Realities',
    tag: 'Editorial Satire · The Trench Series',
    filename: 'audit_override_01_25_samples_tested.jpg',
    aspectRatio: 'portrait',
    paradox: 'Selecting twenty-five invoices out of 3.8 million posted transactions verifies documentation for those specific lines, but leaves the remaining 99.9994% of transaction volume completely unmonitored.',
    notes: [
      'Standard internal and external audit walkthroughs rely on 25-sample populations to evaluate automated three-way matching controls, regardless of total annual ledger volume.',
      'In a 3.8-million-transaction environment, testing 25 lines inspects 0.0006% of activity while certifying that the control operates effectively across the entire fiscal year.',
      'Procurement teams bypass invoice approval matrices by splitting purchase orders below threshold limits over month-end cutoff weekends, passing sample tests because the rule itself remains properly configured.'
    ],
    keyTakeaway: 'Auditing system configuration confirms how software was designed to run; screening the full transaction stream confirms how purchasing teams actually behave under deadline pressure.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'make-it-amber',
    title: 'Make It Amber. We Can Reassess Next Year.',
    subtitle: 'Risk Heat Map Scoring and Capital Allocation Avoidance',
    tag: 'Corporate Governance · Risk Satire',
    filename: 'audit_override_02_make_it_amber.jpg',
    aspectRatio: 'portrait',
    paradox: 'When enterprise risk scoring carries direct commercial consequences, committee discussions shift from evaluating control gaps to negotiating cell colors.',
    notes: [
      'Risk committees spend meeting cycles debating whether operational exposures qualify as high or medium on a five-by-five heat matrix.',
      'A red rating triggers mandatory capital requests, executive ownership, and formal audit committee remediation deadlines.',
      'Amber functions as a parking ground: it records awareness without requiring immediate capital expenditure, preserves current budgets, and defers operational fixes into subsequent fiscal years.'
    ],
    keyTakeaway: 'Scoring an unresolved vulnerability as moderate provides corporate comfort without fixing the underlying exposure.',
    relatedCaseStudy: {
      slug: 'enterprise-risk-management-8-countries',
      label: 'Enterprise Risk Management (8 Countries)'
    }
  },
  {
    id: 'retail-shrink-waterfall',
    title: 'The Retail Shrink Waterfall',
    subtitle: 'Book-to-Physical Inventory Variance and Receiving Dock Leakage',
    tag: 'Operational Forensics · Retail & F&B',
    filename: 'retail_shrink_waterfall_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Loss prevention investments routinely target customer theft on the sales floor, while receiving dock discrepancies, uncredited vendor short-shipments, and unrecorded transfers generate permanent book loss.',
    notes: [
      'National retail data attributes inventory shrink across shoplifting (36%), internal staff theft (29%), process breakdowns (27%), and unclassified adjustments (8%).',
      'Security hardware and sales-floor cameras cannot catch short-shipped pallets, master-case scanning errors, outdated price files, or unreturned vendor damages.',
      'In a 30% gross margin business, a 1.6% overall shrink rate absorbs over 5% of total gross profit, remaining an unallocated journal plug until receiving dock variances are systematically reason-coded.'
    ],
    keyTakeaway: 'Shrink is rarely just store theft; it is an unmapped variance between purchase orders, physical receiving counts, and credit notes.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'restaurant-revenue-model',
    title: 'Restaurant Revenue & 4-Wall Unit Economics',
    subtitle: 'POS Top-Line Deductions, Aggregator Take-Rates, and Store-Level Cash Flow',
    tag: 'Unit Economics · FoodTech & Hospitality',
    filename: 'restaurant_revenue_model_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'High gross volume on third-party delivery aggregators masks cash depletion when platform commissions, mandatory promotional discounts, and packaging costs eliminate store contribution margins.',
    notes: [
      'Multi-channel sales funnel through dine-in, drive-thru, delivery aggregator platforms, direct digital ordering, and franchise accounts.',
      'Gross receipts are quickly eroded by POS voids, comp meals, co-op ad fees, customer refund deductions, and 25% to 30% delivery platform commissions before reaching net revenue.',
      'Direct store prime costs consume 52% to 56% of sales (raw ingredients at 28% to 32% and hourly kitchen labor at 20% to 24%), leaving insufficient margin for occupancy, packaging, and utilities.'
    ],
    keyTakeaway: 'Chasing delivery volume without evaluating net contribution margins turns store kitchens into subsidized prep centers for delivery marketplaces.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'twcf-cash-flow-model',
    title: 'Enterprise 13-Week Rolling Cash Flow (TWCF)',
    subtitle: 'Weekly Cash Liquidity Management, Settlement Latency, and Disbursement Triage',
    tag: 'Treasury & Liquidity · Capital Defense',
    filename: 'cash_flow_forecast_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Businesses showing steady accounting profits can face insolvency when settlement delays on receivables collide with mandatory supplier and payroll cutoff dates.',
    notes: [
      'Available cash baselines must exclude restricted bank balances, debt reserve accounts, and letter-of-credit deposits to identify true unrestricted operating capital.',
      'Collections face settlement mismatch: credit card acquirers clear in two to three business days, while delivery aggregators and wholesale accounts regularly hold funds for 30 to 45 days.',
      'Weekly disbursement triage requires strict prioritization: wage protection systems and statutory payroll take immediate priority, followed by cash-on-delivery suppliers whose stockouts stop operations.'
    ],
    keyTakeaway: 'Thirteen-week rolling forecasts remove accrual accounting assumptions, tracking hard bank settlement dates against critical liquidity covenants.',
    relatedCaseStudy: {
      slug: 'ma-capital-protection',
      label: 'M&A Capital Protection & Due Diligence'
    }
  },
  {
    id: 'enterprise-ai-telemetry',
    title: 'Real-World Enterprise AI: Data Telemetry Pipeline',
    subtitle: 'Multimodal Ingestion, Continuous Anomaly Screening, and Controlled ERP Posting',
    tag: 'Audit Telemetry · Continuous Monitoring',
    filename: 'ai_value_in_business_process_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Large language models produce errors when applied to financial accounting; production value comes from extraction models that convert unstructured records into verified schema fields for rules-based screening.',
    notes: [
      'Multimodal ingestion pipelines extract line-item data from scanned invoices, shipping manifests, and customs entries, normalizing values into structured schema records.',
      'Continuous screening screens the entire population for split purchase orders, bank account mutations, sequential invoice numbers, and duplicate payment hashes.',
      'Automated routing commits routine high-confidence transactions directly to the ERP, while uncertain lines and anomalies are isolated for investigator sign-off.'
    ],
    keyTakeaway: 'AI models should extract and structure transaction data rather than write unchecked records to the general ledger.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'qa-vs-qc-closed-loop',
    title: 'Quality Assurance vs. Quality Control',
    subtitle: 'Process Control Verification vs. Dock Inspection Gates',
    tag: 'Manufacturing & Commissary · Continuous Controls',
    filename: 'quality_assurance_vs_quality_control_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Sampling finished goods at the receiving dock catches defective batches only after raw materials and labor are already spent, while standard procedures are routinely bypassed to meet daily production quotas.',
    notes: [
      'Quality assurance relies on standard operating procedures, supplier audits, and sanitation schedules that break down during peak production runs.',
      'End-of-line inspection detects out-of-spec batches too late to recover prep costs, creating internal commercial pressure to approve waiver exceptions.',
      'Closed-loop monitoring utilizes inline weight, temperature, and visual inspection sensors to flag equipment drift before out-of-tolerance units are completed.'
    ],
    keyTakeaway: 'Periodic batch sampling provides historical documentation; inline telemetry catches machine drift before batches are ruined.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'hamburgini-forensic-autopsy',
    title: 'Anatomy of a QSR Collapse: The Hamburgini Forensic Autopsy',
    subtitle: 'Supply Chain Contamination, Regulatory Action, and Working Capital Asphyxiation',
    tag: 'Forensics & Food Safety · Brand Capital',
    filename: 'hamburgini_ksa_failure_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Official laboratory testing proved the contamination occurred at an external supplier, but customer traffic collapsed immediately while lease post-dated checks and payroll obligations remained legally enforceable.',
    notes: [
      'Rapid regional expansion across 65 branches was supported by heavy fixed lease commitments and large centralized payroll, while key proprietary recipe components were outsourced to third-party manufacturers.',
      'A contamination event led to immediate government closures and social media backlash, eliminating store sales within 48 hours.',
      'Fixed overhead and banking obligations quickly consumed working capital reserves, pushing the operating company into formal liquidation proceedings despite lack of direct fault at the store level.'
    ],
    keyTakeaway: 'Outsourcing core recipe manufacturing transfers prep responsibilities while leaving the operating brand fully exposed to catastrophic supply chain failure.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  }
];
