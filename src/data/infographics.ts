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
    subtitle: 'The 25-Sample Walkthrough Myth vs. Ledger Reality',
    tag: 'Editorial Satire · The Trench Series',
    filename: 'audit_override_01_25_samples_tested.jpg',
    aspectRatio: 'portrait',
    paradox: 'Testing twenty-five invoices out of 3.8 million posted transactions is compliance theater. Monitoring 100% of the ledger stream is audit.',
    notes: [
      'A Big 4 firm issued its inspection defense pointing to standardized 25-sample populations for automated three-way matching controls.',
      'Twenty-five invoices tested out of 3.8 million posted transactions: the audit team verified 0.0006% of the population, stamped the control "operating effectively," and billed six figures.',
      'Meanwhile, procurement split 14,000 purchase orders below the $50,000 approval threshold over a single weekend to beat month-end cutoff. The control didn\'t fail. It was never pointed at the pipeline.'
    ],
    keyTakeaway: 'Sample-based compliance verifies the existence of a rule; 100% population telemetry verifies the behavior of the ledger.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'make-it-amber',
    title: 'Make It Amber. We Can Reassess Next Year.',
    subtitle: 'Negotiating the Color Palette on Enterprise Risk Heat Maps',
    tag: 'Corporate Governance · Risk Satire',
    filename: 'audit_override_02_make_it_amber.jpg',
    aspectRatio: 'portrait',
    paradox: 'Enterprise risk management rarely eliminates risk. It negotiates the color palette.',
    notes: [
      'A Fortune 500 risk committee spent four hours debating whether third-party cloud concentration was a "4x4" or a "3x4" on the enterprise heat map.',
      'Red requires a remediation budget and an executive owner with a hard deadline. Green invites awkward questions about why the risk advisory function has headcount.',
      'Amber is where enterprise risks go to retire. It signals vigilance without triggering capital expenditure, fits neatly into the board pack, commits nobody to an operational deliverable, and buys management another four quarters of "ongoing monitoring."'
    ],
    keyTakeaway: 'When heat map colors carry commercial consequences, governance becomes aesthetic negotiation rather than capital protection.',
    relatedCaseStudy: {
      slug: 'enterprise-risk-management-8-countries',
      label: 'Enterprise Risk Management (8 Countries)'
    }
  },
  {
    id: 'retail-shrink-waterfall',
    title: 'The Retail Shrink Waterfall',
    subtitle: 'Book Inventory Minus the Count & Where Retailers Assign the Loss',
    tag: 'Operational Forensics · Retail & F&B',
    filename: 'retail_shrink_waterfall_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Guards, pedestal alarms, and sales-floor cameras are bought for the 36% theft bar. The other 34% is process failure, unreason-coded variance, and book plugs.',
    notes: [
      'In fiscal 2022, the NRF National Retail Security Survey placed average shrink at 1.6% of sales, totaling $112.1 billion across U.S. retail. The reported split: external theft 36%, employee theft 29%, process failures 27%, unknown plug 6%, other 1%.',
      'Loss-prevention budgets default to the floor, yet an exit camera cannot detect a short-shipped case, an un-updated price file, an un-relieved inter-store transfer, or unrecorded spoilage.',
      'On an illustrated 30% gross margin store, $1.60 of retail shrink erodes 5.3% of total gross profit ($1.60 / $30.00). Until book-to-physical variances are reason-coded at receiving, the count remains a journal plug.'
    ],
    keyTakeaway: 'Shrink is not an unavoidable retail tax; it is an unmapped variance between POS depletions, receiving docks, and vendor credits.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'restaurant-revenue-model',
    title: 'Restaurant Revenue & 4-Wall Unit Economics',
    subtitle: 'From Gross POS Sales to True 4-Wall Store EBITDA',
    tag: 'Unit Economics · FoodTech & Hospitality',
    filename: 'restaurant_revenue_model_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Gross POS revenue is a vanity metric that masks store-level cash destruction when aggregator commissions, co-op ad-tax, and prime costs erode contribution margin.',
    notes: [
      'Multi-channel sales funnel through Dine-In, Drive-Thru, 3P Delivery Apps (25% to 30% platform take-rate), Direct Web, and Franchise Royalties.',
      'Gross receipts face immediate cascade deductions: voids, comps, store promo discounts, aggregator co-op ad fees, and delivery chargebacks to reach Net Sales.',
      'Four-wall prime costs consume 52% to 56% (Food/Beverage COGS at 28-32% plus store hourly labor at 20-24%), eco-packaging takes 3-5%, and occupancy absorbs 8-10%, leaving store EBITDA at 18-22% before corporate G&A.'
    ],
    keyTakeaway: 'Optimizing top-line delivery volume without monitoring channel-specific contribution margins turns physical kitchens into subsidized fulfillment nodes for aggregators.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'twcf-cash-flow-model',
    title: 'Enterprise 13-Week Rolling Cash Flow (TWCF)',
    subtitle: 'Operating Behind the Accrual Veil & Managing the 5-Tier Disbursement Ladder',
    tag: 'Treasury & Liquidity · Capital Defense',
    filename: 'cash_flow_forecast_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Corporate insolvencies rarely originate from negative EBITDA on the P&L; they occur when an accrual-profitable business encounters a 72-hour liquidity blind spot.',
    notes: [
      'Opening liquidity baseline strictly deducts restricted escrow, debt covenant minimums, and letter-of-credit collateral from total book cash to isolate true unrestricted operating funds.',
      'Cash inflows reflect stark float velocity asymmetry: card acquirers settle in T+2/3, whereas delivery aggregators and B2B receivables lag 30 to 45 days.',
      'Disbursement triage enforces a non-negotiable hierarchy: Tier 1 statutory payroll/WPS (legal shutdown risk) and Tier 2 COD suppliers (stock stops sales) take absolute precedence over trade payables stretch, capex freezes, and debt service.'
    ],
    keyTakeaway: 'The Thirteen-Week Cash Forecast strips away accounting accruals, mapping exact bank settlement timing directly against critical operating covenants.',
    relatedCaseStudy: {
      slug: 'ma-capital-protection',
      label: 'M&A Capital Protection & Due Diligence'
    }
  },
  {
    id: 'enterprise-ai-telemetry',
    title: 'Real-World Enterprise AI: Data Telemetry Pipeline',
    subtitle: 'From Unstructured Document Chaos to Deterministic ERP Writes',
    tag: 'Audit Telemetry · Continuous Monitoring',
    filename: 'ai_value_in_business_process_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Conversational LLMs are novelties in accounting; operational value occurs when vision models and rules engines normalize unstructured documents into schema-strict ledgers with 100% anomaly screening.',
    notes: [
      'Stage 1 & 2: Ingests unstructured supplier invoices, customs declarations, PDFs, and emails via multimodal OCR and transformer extraction into standardized JSON schemas.',
      'Stage 3: Eliminates 25-sample audit walkthroughs in favor of real-time 100% population screening, flagging split PO threshold evasions, duplicate hashes, and supplier bank account mutations.',
      'Stage 4 & 5: Human-in-the-loop triage routes 95% routine high-confidence transactions straight to execution, while quarantining ambiguous anomalies into an investigator queue before deterministic ERP commits.'
    ],
    keyTakeaway: 'AI models should never write unreviewed transactions to core ledgers. Their purpose is unstructured extraction and exception quarantine, preserving human review for true anomalies.',
    relatedCaseStudy: {
      slug: 'audit-4-transformation',
      label: 'Audit 4.0: Shifting to 100% Population Testing'
    }
  },
  {
    id: 'kitopi-structural-pivot',
    title: 'The Kitopi Structural Pivot: KaaS to Brick-and-Mortar',
    subtitle: 'When Software Multiples Collide with Central Kitchen Physics',
    tag: 'Strategy & Valuations · Cloud Kitchens',
    filename: 'kitopi_structural_pivot_infographic.png',
    aspectRatio: 'landscape',
    paradox: 'Kitchen-as-a-Service promised asset-light technology margins, but operational friction and aggregator take-rates forced a strategic pivot to capital-intensive brick-and-mortar restaurant ownership.',
    notes: [
      'Stream 1 & 2: The original KaaS model faced severe margin erosion from aggregator take-rates (24%), royalties (9%), food cost (30%), and labor (20%), alongside physical friction batching 50+ brand menus through central commissaries.',
      'Stream 3: Management pivoted by committing over $300M to acquire legacy restaurant groups (AWJ Group: Operation Falafel, Catch 22, Zaroob), transitioning from asset-light software to asset-heavy store operations.',
      'Stream 4: The valuation parallax: high growth capital raised at 10x-15x tech platform ARR collided with traditional food and beverage multiples (1.5x-2x revenue), requiring debt financing to avoid down-round equity re-pricing.'
    ],
    keyTakeaway: 'Software abstractions cannot overcome the physical constraints of recipe preparation, rider dwell times, and third-party delivery marketplace commissions.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'qa-vs-qc-closed-loop',
    title: 'Quality Assurance vs. Quality Control',
    subtitle: 'The Upstream Process Shield vs. The Downstream Inspection Gate',
    tag: 'Manufacturing & Commissary · Continuous Controls',
    filename: 'quality_assurance_vs_quality_control_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Quality Assurance degenerates into unread binders; Quality Control catches defects only after 100% of material and labor have already been destroyed.',
    notes: [
      'QA focuses on upstream standard operating procedures, supplier qualifications, and HACCP workflows, but is routinely bypassed under peak line throughput pressure.',
      'QC measures finished product tolerances at the dock, but every rejected lot triggers scrapped margin and delivery delays, creating commercial pressure to grant deviation waivers.',
      'The modern resolution is closed-loop telemetry: in-line optical, thermal, and weight sensors continuously feeding process variables back to automated machine recalibration before scrap occurs.'
    ],
    keyTakeaway: 'Retrospective batch sampling provides statistical comfort while localized machine drift ruins unsampled units; closed-loop monitoring prevents defect creation.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  },
  {
    id: 'hamburgini-forensic-autopsy',
    title: 'Anatomy of a QSR Collapse: The Hamburgini Forensic Autopsy',
    subtitle: 'Outsourced Supplier Contamination & The Consumer Trust Trap',
    tag: 'Forensics & Food Safety · Brand Capital',
    filename: 'hamburgini_ksa_failure_infographic.png',
    aspectRatio: 'portrait',
    paradox: 'Legal and regulatory exoneration does not preserve enterprise value. In consumer retail, reputational equity can vaporize in 48 hours while fixed debt liabilities remain legally binding.',
    notes: [
      'Rapid scale across 65+ branches in Riyadh relied on heavy fixed costs (landlord PDCs, WPS payroll for 1,000+ crew, central commissary) with sauce production outsourced to BON TUM to conserve capex.',
      'A biological contamination event (Clostridium botulinum) triggered an immediate regulatory shutdown and viral social media collapse, erasing 85%+ of footfall within two days.',
      'Even though forensic health inspections formally proved the pathogen originated entirely at the external supplier, consumer trust never recovered, leading to liquidity asphyxiation and commercial court bankruptcy.'
    ],
    keyTakeaway: 'Outsourcing mission-critical recipe components transfers production risk but leaves 100% of brand equity and fixed balance-sheet liabilities unhedged.',
    relatedCaseStudy: {
      slug: 'post-merger-integration-fnb-group',
      label: 'Post-Merger Integration: Multi-Brand F&B Group'
    }
  }
];
