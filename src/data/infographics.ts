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
    subtitle: 'Substantive Sample Testing vs. High-Volume Ledger Exposure',
    tag: 'Audit Satire · The Trench Series',
    filename: 'audit_override_01_25_samples_tested.jpg',
    aspectRatio: 'portrait',
    paradox: 'Selecting twenty-five invoices out of 3.8 million posted transactions verifies documentation for those specific lines, but leaves 99.9994% of transaction volume completely unassessed.',
    notes: [
      'Standard internal and external audit walkthroughs rely on 25-sample populations to evaluate automated three-way matching controls, regardless of total annual ledger volume.',
      'In a 3.8-million-transaction environment, testing 25 lines inspects 0.0006% of activity while certifying that key financial controls operate effectively across the entire fiscal year.',
      'Procurement and operational teams bypass invoice approval matrices by splitting purchase orders below delegated financial authority (DOA) limits over month-end cutoff weekends, passing sample tests because baseline rule configuration remains intact.'
    ],
    keyTakeaway: 'Evaluating system configuration confirms how ERP control gates were intended to run; full-population data analytics reveals how operational teams actually execute transactions under closing pressure.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'make-it-amber',
    title: 'Make It Amber. We Can Reassess Next Year.',
    subtitle: 'Enterprise Risk Scoring & Deferred Control Remediation',
    tag: 'Governance Satire · Enterprise Risk',
    filename: 'audit_override_02_make_it_amber.jpg',
    aspectRatio: 'portrait',
    paradox: 'When enterprise risk scoring carries direct commercial consequences, committee discussions shift from remediating control deficiencies to negotiating heat map cell colors.',
    notes: [
      'Executive risk committees spend meeting cycles debating whether operational exposures qualify as High or Medium on a five-by-five likelihood and impact matrix.',
      'A Red residual risk rating triggers mandatory remediation budgets, executive accountability, and formal audit committee quarterly tracking.',
      'Amber functions as a bureaucratic parking ground: it formally records management awareness without requiring immediate capital expenditure, preserving divisional budgets while deferring corrective action into subsequent fiscal periods.'
    ],
    keyTakeaway: 'Downgrading an unresolved control deficiency to moderate provides institutional comfort without mitigating the underlying exposure to the balance sheet.',
    relatedCaseStudy: {
      slug: 'enterprise-risk-management-8-countries',
      label: 'Enterprise Risk Management (8 Countries)'
    }
  },
  {
    id: 'prompt-governance-shell-game',
    title: 'The Prompt Governance Shell Game',
    subtitle: 'Algorithmic Scapegoating vs. Physical Inventory Verification',
    tag: 'Audit Satire · Corporate Theater',
    filename: 'audit_override_03_prompt_governance.jpg',
    aspectRatio: 'portrait',
    paradox: 'Attributing balance-sheet inventory write-downs to algorithmic hallucination allows executive leadership to treat tangible inventory shrinkage as an intellectual IT vulnerability rather than a failure of basic custody controls.',
    notes: [
      'A $300,000 prompt governance framework produces complex workflow diagrams and committee presentations, but neither counts physical pallets nor reconciles warehouse management receipts against the general ledger.',
      'Framing a $45M inventory loss as an artificial intelligence failure sanitizes operational breakdown, shielding management from having to explain missing stock, uncredited supplier short-shipments, or dock collusion.',
      'Executive committees comfortably fund abstract software frameworks that keep leadership out of the warehouse, avoiding confrontations with frontline operational reality.'
    ],
    keyTakeaway: 'Abstract policy frameworks often function as corporate shields to keep internal audit and executive oversight out of physical operations, replacing substantive ledger-to-floor verification with compliance theater.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'retail-shrink-waterfall',
    title: 'The Retail Shrink Waterfall',
    subtitle: 'Book-to-Physical Inventory Discrepancies and Supply Chain Reconciliation',
    tag: 'Forensic Audit · Inventory & Retail Controls',
    filename: 'retail_shrink_waterfall_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Loss prevention investments routinely target sales-floor shoplifting, while unrecorded receiving dock variances, uncredited vendor short-shipments, and unapproved inter-store transfers account for structural gross margin erosion.',
    notes: [
      'Retail industry data attributes shrink across external theft (36%), internal employee dishonesty (29%), operational and documentation breakdowns (27%), and unclassified ledger write-offs (8%).',
      'Physical security guards and CCTV installations cannot detect short-shipped pallet counts, master-pack barcode discrepancies, obsolete price-master files, or unreturned supplier claims.',
      'In a 30% gross margin business, a 1.6% unmitigated shrink rate absorbs over 5% of gross profit—remaining hidden as an unallocated inventory adjustment until receiving dock variance reason-codes are mandated.'
    ],
    keyTakeaway: 'Shrink is rarely just store-level theft; it is an unmapped reconciliation breakdown between purchase orders, physical dock goods-receipt notes (GRNs), and supplier credit memos.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'restaurant-revenue-model',
    title: 'Restaurant Revenue & 4-Wall Unit Economics',
    subtitle: 'POS Reconciliation, Delivery Aggregator Take-Rates, and Operating Margin Defense',
    tag: 'Commercial Risk · 4-Wall Unit Economics',
    filename: 'restaurant_revenue_model_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'High top-line sales reported across third-party delivery aggregators mask working capital drain when platform commissions, mandatory promotional deductions, and packaging surcharges eliminate restaurant contribution margins.',
    notes: [
      'Omnichannel revenue flows through POS dine-in, drive-thru, delivery aggregator portals, direct mobile ordering, and franchise accounts with conflicting settlement schedules.',
      'Gross till collections are eroded by unapproved POS managerial voids, complimentary meal write-offs, co-op marketing withholdings, customer chargeback clawbacks, and 25% to 30% delivery commission take-rates prior to bank realization.',
      'Direct prime costs absorb 52% to 56% of revenue (raw material cost of sales at 28% to 32% and store kitchen payroll at 20% to 24%), leaving insufficient operating margin to cover contractual lease occupancy and utility overheads.'
    ],
    keyTakeaway: 'Evaluating sales growth without reconciling net remittance statements and contribution margins turns kitchen operations into subsidized preparation centers for third-party aggregator marketplaces.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'twcf-cash-flow-model',
    title: 'Enterprise 13-Week Rolling Cash Flow (TWCF)',
    subtitle: 'Liquidity Risk Governance, Remittance Lag, and Disbursement Controls',
    tag: 'Treasury Governance · Liquidity Risk Controls',
    filename: 'cash_flow_forecast_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Entities reporting accounting profitability face technical insolvency when receivables settlement delays collide with non-negotiable statutory payroll and trade payables deadlines.',
    notes: [
      'Prudent liquidity oversight requires separating unrestricted operating cash from encumbered bank balances, debt service reserve accounts (DSRAs), and letter of credit cash collateral.',
      'Cash collections suffer from acute settlement timing mismatch: merchant card acquirers settle in T+2 to T+3 days, whereas food delivery aggregators and corporate B2B debtors hold remittances for 30 to 45 days.',
      'Weekly disbursement triage enforces strict internal controls: Wage Protection System (WPS) and statutory employee obligations take absolute legal priority, followed by mission-critical cash-on-delivery (COD) vendors whose suspension triggers operational shutdown.'
    ],
    keyTakeaway: 'A dynamic 13-week cash flow forecast eliminates accrual-based accounting distortions, stress-testing real bank clearing dates against debt covenants and working capital limits.',
    relatedCaseStudy: {
      slug: 'ma-capital-protection',
      label: 'M&A Capital Protection & Due Diligence'
    }
  },
  {
    id: 'enterprise-ai-telemetry',
    title: 'AI-Enabled Continuous Controls Monitoring (CCM)',
    subtitle: 'Automated Ingestion, Full-Population Exception Screening, and ERP Posting Controls',
    tag: 'Continuous Controls Monitoring · Audit Automation',
    filename: 'ai_value_in_business_process_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Generative AI models introduce hallucinations when applied directly to ledger accounting; true audit value lies in structured extraction pipelines that convert unstructured documentation into verifiable schema fields for 100% automated exception testing.',
    notes: [
      'Automated document intake extracts line-item details from non-standard vendor invoices, bill-of-lading manifests, and customs clearances, normalizing records for audit testing.',
      'Continuous controls monitoring screens 100% of the ledger population for split purchase orders, unapproved vendor master-file bank changes, off-cutoff posting dates, and duplicate disbursement hashes.',
      'Automated control logic posts compliant three-way matched transactions directly to the ERP, while routing compliance exceptions, threshold breaches, and segregation-of-duties (SoD) conflicts to independent audit review.'
    ],
    keyTakeaway: 'Machine learning in financial operations must function as an automated audit inspection gate with deterministic control rules, never as an unsupervised author with unsegregated ledger posting access.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'qa-vs-qc-closed-loop',
    title: 'Quality Assurance vs. Quality Control in Operations',
    subtitle: 'Preventive Governance & Process Controls vs. End-of-Line Inspection Gates',
    tag: 'Operational Governance · In-Line Process Controls',
    filename: 'quality_assurance_vs_quality_control_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Relying on end-of-line batch inspection catches non-compliant goods only after direct labor and ingredients are irrevocably sunk, creating internal operational pressure to issue management override waivers.',
    notes: [
      'Quality assurance frameworks rely on documented standard operating procedures (SOPs), vendor pre-qualifications, and hygiene audits that frequently lapse during high-volume production peaks.',
      'End-of-line quality control catches non-conforming batches too late to salvage costs, creating commercial conflict between production quotas and quality release sign-offs.',
      'Continuous in-line process monitoring utilizes automated temperature, calibration, and critical control point (HACCP) sensors to detect variance before non-conforming batches enter finished goods inventory.'
    ],
    keyTakeaway: 'Retrospective batch sampling provides defensive audit paperwork; preventive in-line process controls prevent non-conforming product losses and management override pressure at the dock.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'hamburgini-forensic-autopsy',
    title: 'Anatomy of a QSR Collapse: Forensic Autopsy',
    subtitle: 'Third-Party Vendor Risk, Regulatory Sanctions, and Liquidity Asphyxiation',
    tag: 'Forensic Autopsy · Third-Party Risk & Solvency',
    filename: 'hamburgini_ksa_failure_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Independent laboratory verification confirmed the foodborne contamination originated at an outsourced supplier, but customer footfall collapsed overnight while fixed commercial lease covenants and post-dated checks remained legally enforceable.',
    notes: [
      'Rapid retail footprint expansion across 65 branches was financed through heavy fixed long-term commercial lease commitments, while critical sauce and recipe production was outsourced to external contract manufacturers without continuous oversight.',
      'A single contamination event triggered immediate municipal store closures and reputation contagion, erasing store cash inflows within 48 hours.',
      'Contractual lease liabilities and corporate debt service quickly exhausted working capital buffers, driving the enterprise into court-supervised restructuring despite zero direct culinary fault at the store level.'
    ],
    keyTakeaway: 'Outsourcing core product manufacturing transfers operational tasks but concentrates enterprise risk: without rigorous vendor audit oversight and contingency liquidity, third-party failure becomes existential.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  }
];
