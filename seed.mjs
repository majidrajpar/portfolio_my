import Database from 'better-sqlite3';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const db = new Database(join(__dirname, 'portfolio.db'));

db.exec(`
DROP TABLE IF EXISTS career_milestones;
DROP TABLE IF EXISTS advisory_tiers;
DROP TABLE IF EXISTS case_studies;
DROP TABLE IF EXISTS professional_engagements;

CREATE TABLE career_milestones (
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

CREATE TABLE advisory_tiers (
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

CREATE TABLE case_studies (
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
  tech_stack TEXT
);

CREATE TABLE professional_engagements (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  category TEXT,
  desc TEXT,
  outcome TEXT,
  display_order INTEGER DEFAULT 0
);
`);

// Career milestones
const insertMilestone = db.prepare(`
  INSERT INTO career_milestones (x, y, curve_y, company, role, dates, align, dx, dy, is_special, is_current)
  VALUES (@x, @y, @curve_y, @company, @role, @dates, @align, @dx, @dy, @is_special, @is_current)
`);

const milestones = [
  { x: 2005, y: 14,  curve_y: null,  company: "EY",                   role: "Audit Manager",               dates: "2004–2009", align: "middle", dx: 0,   dy: -25, is_special: 0, is_current: 0 },
  { x: 2010, y: 27,  curve_y: null,  company: "BMA ASSET\nMANAGEMENT",role: "AVP, Internal Audit",          dates: "2010–2011", align: "end",    dx: -10, dy: -45, is_special: 0, is_current: 0 },
  { x: 2011, y: 38,  curve_y: null,  company: "KPMG\n(QATAR)",         role: "Internal Audit Manager",      dates: "2011–2013", align: "start",  dx: 10,  dy: -25, is_special: 0, is_current: 0 },
  { x: 2014, y: 50,  curve_y: null,  company: "McDONALD'S\nKSA",       role: "Manager, Internal Audit",     dates: "2014–2016", align: "middle", dx: 0,   dy: -25, is_special: 0, is_current: 0 },
  { x: 2017, y: 61,  curve_y: null,  company: "AL-FAISALIAH\nGROUP",   role: "Group Director, IA & Risk",   dates: "2016–2022", align: "middle", dx: 0,   dy: -25, is_special: 0, is_current: 0 },
  { x: 2021, y: 95,  curve_y: 72.2,  company: "AFG Restaurants Sector", role: "Audit Committee Member",     dates: "2021–2022", align: "middle", dx: 0,   dy: -25, is_special: 1, is_current: 0 },
  { x: 2022, y: 75,  curve_y: null,  company: "KITOPI",                 role: "Director of Internal Audit", dates: "2022–2025", align: "middle", dx: 0,   dy: -25, is_special: 0, is_current: 0 },
  { x: 2025, y: 87,  curve_y: null,  company: "VERITUX",                role: "Internal Audit Director",    dates: "2025–Present", align: "middle", dx: 0, dy: -25, is_special: 0, is_current: 1 },
];

const insertAll = db.transaction((rows) => {
  for (const row of rows) insertMilestone.run(row);
});
insertAll(milestones);

// Advisory tiers
const insertTier = db.prepare(`
  INSERT INTO advisory_tiers (tier_id, name, tagline, description, deliverables, ideal_for, icon, display_order)
  VALUES (@tier_id, @name, @tagline, @description, @deliverables, @ideal_for, @icon, @display_order)
`);

const tiers = [
  {
    tier_id: 'ipo-mna', display_order: 1,
    name: 'IPO & M&A Guardrail',
    tagline: 'High-Stakes Transactional Assurance',
    description: 'Specialised advisory for organisations at critical liquidity events. I provide the independent governance framework required to secure first-time clean opinions and protect M&A capital.',
    deliverables: JSON.stringify(['ICOFR / SOX 404 Implementation','M&A Forensic Due Diligence','CMA / SCA Regulatory Compliance','Listing Prospectus Governance Prep']),
    ideal_for: 'Pre-IPO Tech Firms, PE Portfolio Companies, Acquiring Groups',
    icon: 'M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z',
  },
  {
    tier_id: 'audit-4', display_order: 2,
    name: 'Audit 4.0 Transformation',
    tagline: 'Moving from Sampling to 100% Population Testing',
    description: 'Modernising legacy Internal Audit functions using Python and Machine Learning. I augment your existing team by building the automated tools they need to achieve real-time risk intelligence.',
    deliverables: JSON.stringify(['Python/ML Forensic Risk Engine','Continuous Monitoring Automation','Data-Driven Fraud Detection','Methodology Modernisation (IIA 2024)']),
    ideal_for: 'Established Audit Teams, High-Volume Transactional Businesses',
    icon: 'M13 10V3L4 14h7v7l9-11h-7z',
  },
  {
    tier_id: 'retained-cae', display_order: 3,
    name: 'Retained CAE & Board Advisory',
    tagline: 'Strategic Governance Oversight on Retainer',
    description: 'Providing senior-level leadership for organisations that require a Chief Audit Executive or Board Advisor. Credible, board-facing, and built on 20 years of GCC institutional knowledge.',
    deliverables: JSON.stringify(['Audit Committee Advisory','ERM / COSO Framework Design','IA Function Build-Out (Scale 3 to 20+)','Whistleblowing & Ethics Oversight']),
    ideal_for: 'Family Offices, Mid-Market GCC Groups, Scaling Unicorns',
    icon: 'M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z',
  },
];

const insertTiers = db.transaction((rows) => { for (const r of rows) insertTier.run(r); });
insertTiers(tiers);

// Case studies
const insertCase = db.prepare(`
  INSERT INTO case_studies (title, subtitle, industry, situation, task, action, result, reflection, impact, tech_stack)
  VALUES (@title, @subtitle, @industry, @situation, @task, @action, @result, @reflection, @impact, @tech_stack)
`);

const cases = [
  {
    title: 'M&A Capital Protection & High-Stakes Due Diligence',
    subtitle: 'Protecting $127M in committed capital for a Diversified GCC Conglomerate',
    industry: 'Hospitality & F&B',
    situation: "A diversified GCC conglomerate was in the final stages of a major acquisition within the hospitality and F&B sector. The deal involved a committed capital of $127M, but the existing due diligence relied on standard seller disclosures and limited sampling.",
    task: "As Group Director of Internal Audit, my mandate was to perform a final layer of independent operational and financial due diligence to validate the target's internal control environment and uncover any contingent liabilities.",
    action: "I deployed a data-driven forensic review of the target's legal and procurement workstreams. Utilizing an \"Audit 4.0\" approach, we scanned 100% of historical contract data and litigation filings rather than relying on the seller's sampled disclosures.",
    result: "The audit uncovered SAR 15M in previously undisclosed litigation exposure and significant regulatory non-compliance issues. This discovery provided the executive team with critical leverage to renegotiate deal terms, protecting the entire $127M in capital from post-acquisition shocks.",
    reflection: "Standard due diligence often misses systemic legal risks hidden in large data volumes. By integrating automated forensic scanning into the M&A lifecycle, Internal Audit serves as a direct protector of shareholder value.",
    impact: 'SAR 15M exposure identified — $127M capital protected — Deal terms renegotiated',
    tech_stack: JSON.stringify(['Forensic Data Analytics','Contract Risk Modelling','Board Advisory']),
  },
  {
    title: 'Audit 4.0: Shifting to 100% Population Testing',
    subtitle: 'Scaling real-time assurance for a Multi-Jurisdiction Tech Unicorn',
    industry: 'Technology / Cloud Kitchens',
    situation: "A hyper-growth tech unicorn operating 100+ locations across 8 countries was experiencing a 340% surge in transaction volumes. The existing audit methodology relied on 5–15% manual sampling, leaving significant gaps in fraud detection.",
    task: "Build a modern, scalable Internal Audit function capable of providing real-time assurance across multi-billion dollar transaction cycles without slowing down business growth.",
    action: "I developed and deployed a proprietary Python/Pandas-based \"Forensic Risk Engine.\" This shifted the audit methodology from sampling to 100% population testing. I integrated automated exception reporting for high-risk areas like third-party aggregator billing and payroll.",
    result: "Identified and captured AED 7.7M in total financial impact (AED 3.2M recovered; AED 4.5M protected). Delivered a clean first-time external audit opinion with zero material weaknesses and secured board-approved investment for enterprise automation.",
    reflection: "Technology-enabled auditing turns Internal Audit from a historical \"checker\" into a real-time risk intelligence partner for the Board.",
    impact: 'AED 7.7M financial impact — 100% population coverage — Clean SOX 404 opinion',
    tech_stack: JSON.stringify(['Python','Pandas','Machine Learning','SOX 404']),
  },
  {
    title: 'IPO Readiness & Governance Architecture',
    subtitle: 'Delivering a clean roadmap for a High-Growth F&B Technology Platform',
    industry: 'F&B / Financial Markets',
    situation: "A high-growth technology platform operating across 7 jurisdictions was targeting a major stock market listing. The organization had no formal internal audit function, no documented ICOFR framework, and significant governance gaps.",
    task: "As Strategic Advisor, I was mandated to oversee the end-to-end IPO readiness programme, ensuring full compliance with regional corporate governance codes and establishing a board-grade control environment within 18 months.",
    action: "I led seven integrated workstreams, including the build-out of a 175+ control ICOFR framework and the design of a group-wide whistleblowing and ethics programme. I established the Audit Committee charters and reporting protocols aligned to listing requirements.",
    result: "Delivered a clean, first-time external audit opinion on ICOFR. Successfully aligned board and committee structures with regional market regulations across all jurisdictions, providing the governance foundation required for the listing prospectus.",
    reflection: "Success in IPO readiness requires balancing rigid regulatory compliance with the agile needs of a technology-driven firm.",
    impact: 'Clean ICOFR Certification — Board-level reporting established — Listed-ready status achieved',
    tech_stack: JSON.stringify(['ICOFR','Corporate Governance','SCA/DFM Regulations']),
  },
];

const insertCases = db.transaction((rows) => { for (const r of rows) insertCase.run(r); });
insertCases(cases);

// Professional engagements
const insertEng = db.prepare(`
  INSERT INTO professional_engagements (title, category, desc, outcome, display_order)
  VALUES (@title, @category, @desc, @outcome, @display_order)
`);

const engagements = [
  { title: 'KSA Real Estate Forensic Audit',           category: 'Fraud Forensics',       outcome: 'Recovered SAR 3.2M annually via automated risk engine.',    desc: 'Monitoring SAR 500M+ Capex/OpEx across residential and commercial portfolios.', display_order: 1 },
  { title: 'Executive Financial Dashboards',            category: 'Strategic Dashboards',  outcome: '85% automated reporting efficiency achieved.',               desc: 'Real-time board-level visibility into capital leaks and variance analysis.', display_order: 2 },
  { title: 'Tadawul Nomu Listing Readiness',            category: 'Corporate Governance',  outcome: 'Successful governance structuring for parallel market listing.', desc: 'Coordinated ICOFR and regulatory submissions for KSA healthcare subsidiary.', display_order: 3 },
  { title: 'Enterprise Risk Management (8 Countries)',  category: 'Enterprise Risk',       outcome: '50+ risks mapped; 28 KRIs live across 8 jurisdictions.',     desc: 'Designed and implemented COSO ERM 2017 / ISO 31000 framework.', display_order: 4 },
  { title: 'Whistleblowing Framework (QSR Leader)',     category: 'Corporate Governance',  outcome: 'Discovered SAR 12M fraud within months of launch.',          desc: 'Designed email-based reporting and investigation protocols from scratch.', display_order: 5 },
  { title: 'Ethics & Compliance Programme (Multi-Country)', category: 'Corporate Governance', outcome: 'Full programme live across 7 countries with EthicsPoint integration.', desc: 'Led sourcing, vendor evaluation, and organisation-wide rollout.', display_order: 6 },
];

const insertEngs = db.transaction((rows) => { for (const r of rows) insertEng.run(r); });
insertEngs(engagements);

console.log('Seeded portfolio.db:');
console.log('  career_milestones:', db.prepare('SELECT COUNT(*) as c FROM career_milestones').get().c);
console.log('  advisory_tiers:   ', db.prepare('SELECT COUNT(*) as c FROM advisory_tiers').get().c);
console.log('  case_studies:     ', db.prepare('SELECT COUNT(*) as c FROM case_studies').get().c);
console.log('  professional_engagements:', db.prepare('SELECT COUNT(*) as c FROM professional_engagements').get().c);
db.close();
