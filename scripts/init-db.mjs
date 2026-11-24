#!/usr/bin/env node

import Database from 'better-sqlite3';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const dbPath = join(ROOT, 'portfolio.db');
const db = new Database(dbPath);

console.log(`Initializing database at: ${dbPath}`);

db.exec(`
  CREATE TABLE IF NOT EXISTS career_milestones (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    x INTEGER NOT NULL,
    y REAL NOT NULL,
    curve_y REAL,
    company TEXT NOT NULL,
    role TEXT NOT NULL,
    dates TEXT NOT NULL,
    align TEXT DEFAULT 'middle',
    dx INTEGER DEFAULT 0,
    dy INTEGER DEFAULT -25,
    is_special INTEGER DEFAULT 0,
    is_current INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS case_studies (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    subtitle TEXT,
    industry TEXT,
    situation TEXT,
    task TEXT,
    action TEXT,
    result TEXT,
    reflection TEXT,
    impact TEXT,
    tech_stack TEXT,
    categories TEXT DEFAULT '[]',
    slug TEXT,
    display_order INTEGER,
    tier TEXT,
    related_tool TEXT,
    related_build TEXT,
    related_case TEXT,
    snippet_ids TEXT
  );

  CREATE TABLE IF NOT EXISTS professional_engagements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    category TEXT,
    desc TEXT,
    outcome TEXT,
    display_order INTEGER DEFAULT 0,
    categories TEXT DEFAULT '[]',
    slug TEXT
  );

  CREATE TABLE IF NOT EXISTS advisory_tiers (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    tier_id TEXT NOT NULL,
    name TEXT NOT NULL,
    tagline TEXT NOT NULL,
    description TEXT NOT NULL,
    deliverables TEXT NOT NULL,
    ideal_for TEXT NOT NULL,
    icon TEXT NOT NULL,
    display_order INTEGER DEFAULT 0
  );

  CREATE TABLE IF NOT EXISTS category_meta (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    description TEXT NOT NULL
  );
`);

// CREATE TABLE IF NOT EXISTS does not add columns on a database file that already exists.
const caseColumnNames = db.prepare('PRAGMA table_info(case_studies)').all().map((column) => column.name);
for (const [name, type] of [
  ['display_order', 'INTEGER'],
  ['tier', 'TEXT'],
  ['related_tool', 'TEXT'],
  ['related_build', 'TEXT'],
  ['related_case', 'TEXT'],
  ['snippet_ids', 'TEXT'],
]) {
  if (!caseColumnNames.includes(name)) {
    db.exec(`ALTER TABLE case_studies ADD COLUMN ${name} ${type}`);
  }
}

const reset = db.transaction(() => {
  db.prepare('DELETE FROM career_milestones').run();
  db.prepare('DELETE FROM case_studies').run();
  db.prepare('DELETE FROM professional_engagements').run();
  db.prepare('DELETE FROM advisory_tiers').run();
  db.prepare('DELETE FROM category_meta').run();

  db.prepare("DELETE FROM sqlite_sequence WHERE name IN ('career_milestones','case_studies','professional_engagements','advisory_tiers','category_meta')").run();

  const insertMilestone = db.prepare(`
    INSERT INTO career_milestones (x, y, curve_y, company, role, dates, align, dx, dy, is_special, is_current)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    [2005, 14, null, 'EY', 'Audit Manager', '2004-2009', 'middle', 0, -25, 0, 0],
    [2010, 27, null, 'BMA ASSET\nMANAGEMENT', 'AVP, Internal Audit', '2010-2011', 'end', -10, -45, 0, 0],
    [2011, 38, null, 'KPMG\n(QATAR)', 'Internal Audit Manager', '2011-2013', 'start', 10, -25, 0, 0],
    [2014, 50, null, "McDONALD'S\nKSA", 'Manager, Internal Audit', '2014-2016', 'middle', 0, -25, 0, 0],
    [2017, 61, null, 'AL-FAISALIAH\nGROUP', 'Group Director, IA & Risk', '2016-2022', 'middle', 0, -25, 0, 0],
    [2021, 72.2, null, 'AFG Restaurants Sector', 'Audit Committee Member', '2021-2022', 'middle', 0, -35, 1, 0],
    [2022, 75, null, 'KITOPI', 'Director of Internal Audit', '2022-2025', 'middle', 0, -25, 0, 0],
    [2025, 87, null, 'VERITUX', 'Fractional CAE / Director of Internal Audit', '2025-Present', 'middle', 0, -25, 0, 1],
  ].forEach((row) => insertMilestone.run(...row));

  const insertCaseStudy = db.prepare(`
    INSERT INTO case_studies (
      title, subtitle, industry, situation, task, action, result, reflection, impact,
      tech_stack, categories, slug, display_order, tier, related_tool, related_build, related_case, snippet_ids
    ) VALUES (
      @title, @subtitle, @industry, @situation, @task, @action, @result, @reflection, @impact,
      @tech_stack, @categories, @slug, @display_order, @tier, @related_tool, @related_build, @related_case, @snippet_ids
    )
  `);

  const caseRows = [
    {
      title: 'M&A Capital Protection & High-Stakes Due Diligence',
      subtitle: 'Protecting $127M in committed capital for a Diversified GCC Conglomerate',
      industry: 'Hospitality & F&B',
      situation: 'A diversified GCC conglomerate was in the final stages of a major acquisition within the hospitality and F&B sector. The deal involved a committed capital of $127M, but the existing due diligence relied on standard seller disclosures and limited sampling.',
      task: `As Group Director of Internal Audit, my mandate was to perform a final layer of independent operational and financial due diligence to validate the target's internal control environment and uncover any contingent liabilities.`,
      action: `I deployed a full-population forensic review across the target's supplier agreements, lease commitments, and litigation filings. Instead of relying on the seller's curated disclosure schedule, we indexed and cross-matched every active contract clause against historical claims and regulatory filings.`,
      result: 'The audit uncovered SAR 15M in previously undisclosed litigation exposure and significant regulatory non-compliance issues. This discovery provided the executive team with critical leverage to renegotiate deal terms, protecting the entire $127M in capital from post-acquisition shocks.',
      reflection: 'Standard M&A due diligence relies on sampled vendor files and seller warranties, which routinely miss off-balance-sheet exposures. Running full-population contract forensics defends acquisition EBITDA before capital is committed.',
      impact: 'SAR 15M unrecorded exposure identified — $127M capital defended — Acquisition terms restructured prior to close',
      tech_stack: '["Forensic Data Analytics","Contract Risk Modelling","Board Advisory"]',
      categories: '["Corporate Governance"]',
      slug: 'ma-capital-protection',
      display_order: 1,
      tier: 'primary',
      related_tool: null,
      related_build: null,
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Post-Acquisition Integration: Multi-Brand F&B Group',
      subtitle: 'Reconciling POS ledgers, delivery remittances, and central commissary margins across 100+ outlets',
      industry: 'FoodTech & Hospitality',
      situation: 'A venture-backed food technology group operating cloud kitchens acquired a legacy regional hospitality group with over 100 dine-in and QSR outlets across the UAE and Saudi Arabia. The acquisition thesis relied on converting acquired brands to central commissary production and integrating online delivery into proprietary kitchen operating software. However, the acquired business operated on four legacy point-of-sale systems, manual end-of-day till counts, and decentralized supplier accounts. Financial reporting at month-end relied on aggregated summary journals rather than itemized order matching, leaving the Audit Committee with no reliable visibility into post-close operating margins or true gross margin leakage.',
      task: 'Lead the post-merger internal audit review across finance, store operations, and supply chain. The objective was to audit the opening balance sheet adjustments, verify gross margin realization against deal models, and identify revenue and cost leakage across point-of-sale data, aggregator settlements, central production, and store-level cash handling.',
      action: 'We built data extraction routines to pull raw transaction records directly from legacy POS databases, ERP ledgers, and delivery aggregator remittance files (Talabat, Deliveroo, Jahez, Careem).\n\nFirst, we reconciled 100% of delivery orders against aggregator disbursements. This exposed uncollected balances from customer refunds accepted without restaurant verification, commission rates calculated on gross rather than net sales, and promo discounts funded entirely by the brand without agreed co-investment.\n\nSecond, we audited store food cost and recipe yields following the transition to the Central Production Facility. By cross-referencing raw material dispatches from the commissary against POS depletion logs for core proteins, we surfaced widespread unauthorized local purchasing: store managers were buying poultry and dairy from local traders with petty cash to compensate for commissary delivery delays, masking yield variances and paying unvetted markups.\n\nThird, we reviewed cash-to-bank controls across dine-in outlets by matching till drawer closing totals against cash-in-transit deposit slips and bank statements, uncovering multi-day banking lags and store float manipulation. In addition, we reconciled store payroll rosters against biometric attendance and labor ministry filings to identify unrecorded overtime liabilities and severance accrual gaps.',
      result: 'The audit surfaced AED 22M in direct financial leakage, including AED 9.4M in unrecovered aggregator deductions and commission errors, AED 7.8M in food cost variance and off-contract procurement, and AED 4.8M in cash float discrepancies and unaccrued labor liabilities.\n\nManagement used the findings to claw back overcharges from aggregators, enforce vendor master-file controls that blocked petty cash supplier purchases, and mandate daily automated cash-to-bank clearing. The audit provided the Audit Committee and CFO with verified baseline unit economics across all acquired store formats, replacing estimated integration synergies with auditable operational data.',
      reflection: 'M&A financial models assume operational synergies take effect on day one, but frontline incentives work in the opposite direction. When central commissary deliveries arrive late or ERP ordering screens lag during lunch rush, store managers buy ingredients from local grocers out of petty cash because an empty prep line costs them their daily sales bonus. Labeling that behavior as deliberate fraud solves nothing if the underlying logistics failure remains unaddressed. Internal audit must trace the operational root cause through the data so management can fix the supply chain bottleneck rather than simply ordering more compliance policing.',
      impact: 'AED 22M in unrecorded leakages identified — 100% order-level reconciliation across delivery aggregators — Centralized commissary recipe yields enforced across 100+ stores',
      tech_stack: '["POS-to-ERP Reconciliation","Aggregator Remittance Analytics","Food Cost & Recipe Yield Analytics","Supply Chain Forensics","Continuous Controls Monitoring"]',
      categories: '["Corporate Governance","Audit Transformation"]',
      slug: 'post-merger-integration-fnb-group',
      display_order: 2,
      tier: 'primary',
      related_tool: 'cafe-inventory-costing',
      related_build: null,
      related_case: 'ma-capital-protection',
      snippet_ids: null,
    },
    {
      title: 'Audit 4.0: Shifting to 100% Population Testing',
      subtitle: 'Scaling real-time assurance for a Multi-Jurisdiction Tech Unicorn',
      industry: 'Technology / Cloud Kitchens',
      situation: 'A hyper-growth tech unicorn operating 100+ locations across 8 countries was experiencing a 340% surge in transaction volumes. The existing audit methodology relied on 5-15% manual sampling, leaving significant gaps in fraud detection.',
      task: 'Replace retrospective 20-sample audits with automated continuous controls monitoring across multi-market food-tech transactions without disrupting kitchen fulfillment velocity.',
      action: 'Built continuous monitoring scripts reconciling store point-of-sale receipts directly against delivery aggregator remittance statements. Tested 100% of order lines to detect uncollected cancellations, commission overcharges, recipe yield variances, and unauthorized payroll adjustments.',
      result: 'Identified and captured AED 7.7M in total financial impact (AED 3.2M recovered from aggregator over-deductions and billing leakages; AED 4.5M protected). Delivered a clean first-time external audit opinion with zero material weaknesses and secured board-approved funding for continuous audit monitoring.',
      reflection: 'A 20-invoice sample cannot detect systemic commission leakages hidden across millions of aggregator order lines. Continuous controls monitoring automates full-population testing across electronic transactions, freeing the audit team to focus on on-site store operations, inventory waste, and physical stock controls where data tests alone are insufficient.',
      impact: 'AED 7.7M financial recovery & defense — 100% aggregator remittance reconciliation — Clean SOX 404 / ICFR opinion',
      tech_stack: '["Python","Pandas","Machine Learning","SOX 404"]',
      categories: '["Audit Transformation"]',
      slug: 'audit-4-transformation',
      display_order: 3,
      tier: 'primary',
      related_tool: null,
      related_build: null,
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Whistleblowing Framework (QSR Leader)',
      subtitle: 'Email-based reporting and investigation protocols, built from scratch, with a non-retaliation policy.',
      industry: 'QSR',
      situation: 'Internal audit at a QSR operator was limited to operational site visits. On joining as internal audit manager, the task was to take the department beyond that work.',
      task: 'Put in a whistleblowing channel with two aims: a visible signal that anyone can report, and an anonymous route people can use safely. A non-retaliation policy backed the channel.',
      action: 'Built email-based reporting and investigation protocols from scratch. Internal audit ran the investigations and reported them to the country president and the operations and admin lead.',
      result: 'Within months of launch, a supervisor in the projects department reported that the projects manager was colluding with a contractor to fit lower-quality tiles. The case was SAR 12M of procurement tender collusion. Legal action was started against the employee and the contractor.',
      reflection: 'The report came through the new channel from inside the projects department. Internal audit investigated it, and legal action followed against the employee and the contractor.',
      impact: 'Uncovered SAR 12M procurement tender collusion within months of launch.',
      tech_stack: '[]',
      categories: '["Corporate Governance"]',
      slug: 'whistleblowing-framework-qsr-leader',
      display_order: 6,
      tier: 'primary',
      related_tool: null,
      related_build: 'zk-whistleblower',
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'KSA Real Estate Forensic Audit',
      subtitle: 'Contractor payments tested across SAR 500M+ of capex and opex on residential and commercial portfolios.',
      industry: 'KSA real estate',
      situation: 'A KSA development company was paying contractors across residential and commercial portfolios. The payments were suspected. The work covered SAR 500M+ of capex and opex.',
      task: 'Test the contractor payments with an automated risk engine.',
      action: 'The engine tested each payment against the work done, the frequency of payment, the timing, and the person who processed it.',
      result: 'SAR 3.2M was received once from the contractors.',
      reflection: 'The test was not only whether a payment matched the work. Frequency, timing, and the person who processed the payment were part of the same engine.',
      impact: 'SAR 3.2M received once from the contractors.',
      tech_stack: '[]',
      categories: '["Fraud Forensics"]',
      slug: 'ksa-real-estate-forensic-audit',
      display_order: 7,
      tier: 'primary',
      related_tool: null,
      related_build: null,
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'IPO Readiness & Governance Architecture',
      subtitle: 'Delivering a clean roadmap for a High-Growth F&B Technology Platform',
      industry: 'F&B / Financial Markets',
      situation: 'A high-growth technology platform operating across 8 countries was targeting a major stock market listing. The organization had no formal internal audit function, no documented ICOFR framework, and significant governance gaps.',
      task: 'As Strategic Advisor, I was mandated to oversee the end-to-end IPO readiness programme, ensuring full compliance with regional corporate governance codes and establishing a board-grade control environment within 18 months.',
      action: 'I led seven integrated workstreams, including the build-out of a 175+ control ICOFR framework and the design of a group-wide whistleblowing and ethics programme. I established the Audit Committee charters and reporting protocols aligned to listing requirements.',
      result: 'Delivered a clean, first-time external audit opinion on ICOFR. Successfully aligned board and committee structures with regional market regulations across all jurisdictions, providing the governance foundation required for the listing prospectus.',
      reflection: 'Pre-IPO governance collapses when treated as retrospective compliance theater. Designing deterministic control gates across order-to-cash, inventory accounting, and month-end financial close produces clean audit opinions while preserving operating momentum.',
      impact: 'Zero material weaknesses on initial ICFR audit — 175+ controls codified — Board and Audit Committee governance operationalized for prospectus',
      tech_stack: '["ICOFR","Corporate Governance","SCA/DFM Regulations"]',
      categories: '["Corporate Governance"]',
      slug: 'ipo-governance-readiness',
      display_order: 4,
      tier: 'secondary',
      related_tool: 'nomu-governance-readiness',
      related_build: null,
      related_case: 'ethics-compliance-programme-multi-country',
      snippet_ids: null,
    },
    {
      title: 'Data Analytics & Continuous Monitoring Training',
      subtitle: 'Transitioning QSR audit fieldwork from 20-invoice samples to automated population analytics',
      industry: 'F&B / QSR',
      situation: 'A leading Quick Service Restaurant (QSR) player in KSA relied on manual sampling for audits, limiting coverage and leading to high false positives. The traditional, compliance-centric audit team lacked the technical capability to automate testing.',
      task: 'Equip frontline internal auditors to write and execute automated data tests against raw ERP ledgers and point-of-sale datasets, eliminating reliance on manual spreadsheet sampling.',
      action: 'Trained the audit team on direct ERP query extraction (Oracle/SAP), scripting continuous controls monitoring in Python, and building deterministic anomaly models to reconcile point-of-sale till receipts against store inventory consumption and vendor disbursements.',
      result: 'The team built internal automated tests across vendor disbursements and store recipe yields, eliminating manual 25-sample vouchers, cutting fieldwork testing cycles by 60%, and surfacing recurrent inventory and billing variances directly to the Audit Committee.',
      reflection: 'Auditors who rely on manual samples are blind to systemic operational leakage. Training teams to interrogate raw transaction populations bridges the gap between store-level till receipts and board-level financial integrity.',
      impact: '60% reduction in sample fieldwork testing cycle — Automated POS-to-inventory reconciliation deployed — 100% population coverage across QSR store network',
      tech_stack: '["Python","Pandas","Machine Learning","Data Analytics"]',
      categories: '["Audit Transformation"]',
      slug: 'data-analytics-audit-training',
      display_order: 5,
      tier: 'capability',
      related_tool: 'audit-sample-size-calculator',
      related_build: 'pos-cashier-till-fraud-detector',
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Tadawul Nomu Listing Readiness',
      subtitle: 'COSO 2013 gap assessment for a KSA healthcare subsidiary, plus the investor risks in the prospectus.',
      industry: 'KSA healthcare',
      situation: 'A KSA healthcare subsidiary was being put forward for a listing on Tadawul Nomu.',
      task: 'Support ICOFR so the financial reporting controls were present and effective, and contribute the investor risks to the prospectus.',
      action: 'Ran a gap assessment against the COSO 2013 framework across IT general controls, entity-level controls, and process-level controls. Drafted the risks for investors to consider in the prospectus.',
      result: 'EY audited the company and noted no findings on the financial reporting controls. The subsidiary listed on Nomu.',
      reflection: 'The control gaps had to be identified before the external audit. The prospectus also needed the investor risks written into it.',
      impact: 'Listed on Nomu. EY noted no findings on the financial reporting controls.',
      tech_stack: '[]',
      categories: '["Corporate Governance"]',
      slug: 'tadawul-nomu-listing-readiness',
      display_order: 8,
      tier: 'secondary',
      related_tool: 'nomu-governance-readiness',
      related_build: null,
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Enterprise Risk Management (8 Countries)',
      subtitle: 'COSO ERM 2017 risk framework, appetite, register, and KRIs. ISO 31000 was a reference.',
      industry: '8 countries',
      situation: 'A food-technology group operating in eight countries needed a second-line risk system as part of its IPO readiness.',
      task: 'Develop the risk framework, the risk appetite, the risk register, and the KRIs, and give management a way to monitor the indicators.',
      action: 'Used COSO ERM 2017 as the framework and ISO 31000 as a reference. Worked with the data team on a Power BI dashboard for the KRIs.',
      result: '50+ risks were mapped and 28 KRIs were live across the UAE, KSA, Kuwait, Qatar, Bahrain, Poland, Denmark, and Jordan. Poland was the engineering location, Denmark the robotics location, and Jordan the call center.',
      reflection: 'COSO ERM 2017 was the framework that was built. ISO 31000 was used as a reference, not as a second framework.',
      impact: '50+ risks mapped and 28 KRIs live across 8 countries.',
      tech_stack: '[]',
      categories: '["Enterprise Risk"]',
      slug: 'enterprise-risk-management-8-countries',
      display_order: 9,
      tier: 'secondary',
      related_tool: 'internal-control-evaluator',
      related_build: null,
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Executive Financial Dashboards',
      subtitle: 'Real-time and monthly board reporting of variation orders and payment discrepancies.',
      industry: '8 countries',
      situation: 'The same IPO readiness work needed an entity-level control that showed financial variance to the board.',
      task: 'Build the dashboards, with the data team, over the profit-and-loss and the balance sheet of the entities in the countries where the company operated.',
      action: 'Linked variation orders and payment discrepancies to the financial data. The dashboards ran in real time, and a monthly summary was also produced.',
      result: 'The board could see those variances on the profit-and-loss and the balance sheet for the entities in the UAE, KSA, Kuwait, Qatar, Bahrain, Poland, Denmark, and Jordan.',
      reflection: 'The dashboards were an entity-level control inside the ICOFR work. They covered both the profit-and-loss and the balance sheet.',
      impact: 'Board reporting of variation orders and payment discrepancies across multi-entity profit-and-loss and balance-sheet ledgers.',
      tech_stack: '[]',
      categories: '["Strategic Dashboards"]',
      slug: 'executive-financial-dashboards',
      display_order: 10,
      tier: 'secondary',
      related_tool: null,
      related_build: 'boardlite',
      related_case: null,
      snippet_ids: null,
    },
    {
      title: 'Ethics & Compliance Programme (Multi-Country)',
      subtitle: 'EthicsPoint intake, investigative playbooks, and case tracking, configured with the provider.',
      industry: '8 countries',
      situation: 'IPO readiness required an ethics programme across the eight countries where the company operated.',
      task: 'Put confidential intake, investigative playbooks, case tracking, and reporting to the Audit Committee in place.',
      action: 'Identified, negotiated, and contracted EthicsPoint. Configuration was done with the EthicsPoint team. Reports came to internal audit.',
      result: 'Internal audit investigated the reports and took them to the Audit Committee and the CEO. The programme covered the UAE, KSA, Kuwait, Qatar, Bahrain, Poland, Denmark, and Jordan.',
      reflection: 'The intake channel was a contracted service, configured with the provider. The investigations stayed with internal audit.',
      impact: 'Ethics governance across 8 countries. Reports investigated by internal audit and taken to the Audit Committee and the CEO.',
      tech_stack: '[]',
      categories: '["Corporate Governance"]',
      slug: 'ethics-compliance-programme-multi-country',
      display_order: 11,
      tier: 'secondary',
      related_tool: null,
      related_build: null,
      related_case: 'ipo-governance-readiness',
      snippet_ids: null,
    },
    {
      title: 'Kitchen Equipment Supplier & Maintenance Fraud Investigation',
      subtitle: 'Forensic review of circa $7M in two-year equipment supply and maintenance spend across completed kitchen projects.',
      industry: 'FoodTech / Cloud Kitchens',
      situation: 'A small supplier held both kitchen equipment supply and ongoing maintenance across a cloud kitchen network, with roughly $7M in spend over two years. A review of the contract found an exclusivity clause granted to the vendor. Subsequent checks showed the company was the supplier\'s only client, which triggered a broader investigation.',
      task: 'Review completed kitchen projects to test procurement compliance, invoice-to-PO dates, and internal approval controls.',
      action: 'Ran data analytics to match purchase orders, invoices, and delivery notes across completed projects, cleaning dirty and incomplete records, tracing missing documents, and reviewing email communications. The matching found multiple equipment supplies delivered without purchase orders, as well as purchase orders issued 6 to 8 months after the invoice dates, with invoices submitted late. The projects and equipment team cleared those retroactive purchase orders internally.',
      result: 'The vendor relationship was severed and the Project Director was terminated.',
      reflection: 'Standard accounts payable matching checks whether an approved PO exists before releasing payment. When the projects team can clear retroactive POs months after invoicing, routine invoice testing misses the bypass. Catching it required reading the contract terms, cleaning incomplete project records, and reviewing email trails.',
      impact: 'Circa $7M in two-year spend with a single-client exclusive supplier investigated. Vendor severed and Project Director terminated.',
      tech_stack: '["Forensic Investigation","Procurement Controls","Contract Review","Retroactive PO Analysis"]',
      categories: '["Fraud Forensics"]',
      slug: 'kitchen-equipment-supplier-fraud',
      display_order: 12,
      tier: 'primary',
      related_tool: null,
      related_build: 'thirdeye-vendor-risk',
      related_case: null,
      snippet_ids: null,
    },
    // __CASE_ROWS_END__
  ];

  for (const row of caseRows) insertCaseStudy.run(row);

  const insertTier = db.prepare(`
    INSERT INTO advisory_tiers (tier_id, name, tagline, description, deliverables, ideal_for, icon, display_order)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    [
      'ipo-mna',
      'IPO & M&A Guardrail',
      'High-Stakes Transactional Assurance',
      'Specialised advisory for organisations at critical liquidity events. I provide the independent governance framework required to secure first-time clean opinions and protect M&A capital.',
      JSON.stringify(['ICOFR / SOX 404 Implementation', 'M&A Forensic Due Diligence', 'CMA / SCA Regulatory Compliance', 'Listing Prospectus Governance Prep']),
      'Pre-IPO Tech Firms, PE Portfolio Companies, Acquiring Groups',
      'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
      1,
    ],
    [
      'audit-4',
      'Audit 4.0 Transformation',
      'Moving from Sampling to 100% Population Testing',
      'Replacing manual 20-invoice sample auditing with 100% continuous controls monitoring. Building automated Python and SQL audit scripts that test 100% of transaction populations and protect operating margins.',
      JSON.stringify(['Python/ML Forensic Risk Engine', 'Continuous Monitoring Automation', 'Data-Driven Fraud Detection', 'Methodology Modernisation (IIA 2024)']),
      'Established Audit Teams, High-Volume Transactional Businesses',
      'M13 10V3L4 14h7v7l9-11h-7z',
      2,
    ],
    [
      'fractional-cae',
      'Fractional CAE & Board Advisory',
      'Strategic Governance Oversight on Retainer',
      'Providing senior-level leadership for organizations that require a Chief Audit Executive or Board Advisor but are not ready for a full-time hire. Credible, independent, and board-facing.',
      JSON.stringify(['Audit Committee Advisory', 'ERM / COSO Framework Design', 'IA Function Build-Out (Scale 3 to 20+)', 'Whistleblowing & Ethics Oversight']),
      'Family Offices, Mid-Market GCC Groups, Scaling Unicorns',
      'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
      3,
    ],
  ].forEach((row) => insertTier.run(...row));

  const insertCategory = db.prepare(`
    INSERT INTO category_meta (name, slug, description)
    VALUES (?, ?, ?)
  `);

  [
    ['Corporate Governance', 'corporate-governance', 'Governance design, IPO readiness, whistleblowing, ethics, and board oversight work.'],
    ['Fraud Forensics', 'fraud-forensics', 'Fraud detection, investigation, forensic analytics, and loss-recovery work.'],
    ['Audit Transformation', 'audit-transformation', 'Internal audit operating model redesign, automation, and continuous monitoring.'],
    ['Enterprise Risk', 'enterprise-risk', 'ERM design, KRIs, and cross-jurisdiction risk architecture.'],
    ['Strategic Dashboards', 'strategic-dashboards', 'Board reporting, executive dashboards, and decision-support analytics.'],
  ].forEach((row) => insertCategory.run(...row));
});

reset();

const summary = db.prepare(`
  SELECT 'career_milestones' AS table_name, COUNT(*) AS row_count FROM career_milestones
  UNION ALL
  SELECT 'case_studies', COUNT(*) FROM case_studies
  UNION ALL
  SELECT 'professional_engagements', COUNT(*) FROM professional_engagements
  UNION ALL
  SELECT 'advisory_tiers', COUNT(*) FROM advisory_tiers
  UNION ALL
  SELECT 'category_meta', COUNT(*) FROM category_meta
`).all();

summary.forEach(({ table_name, row_count }) => {
  console.log(`  ${table_name}: ${row_count}`);
});

db.close();
console.log('Database initialized successfully.');
