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
    slug TEXT
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
    [2025, 87, null, 'VERITUX', 'Registered Independent Consultant', '2025-Present', 'middle', 0, -25, 0, 1],
  ].forEach((row) => insertMilestone.run(...row));

  const insertCaseStudy = db.prepare(`
    INSERT INTO case_studies (title, subtitle, industry, situation, task, action, result, reflection, impact, tech_stack, categories, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `);

  [
    [
      'M&A Capital Protection & High-Stakes Due Diligence',
      'Protecting $127M in committed capital for a Diversified GCC Conglomerate',
      'Hospitality & F&B',
      'A diversified GCC conglomerate was in the final stages of a major acquisition within the hospitality and F&B sector. The deal involved a committed capital of $127M, but the existing due diligence relied on standard seller disclosures and limited sampling.',
      "As Group Director of Internal Audit, my mandate was to perform a final layer of independent operational and financial due diligence to validate the target's internal control environment and uncover any contingent liabilities.",
      `I deployed a data-driven forensic review of the target's legal and procurement workstreams. Utilizing an "Audit 4.0" approach, we scanned 100% of historical contract data and litigation filings rather than relying on the seller's sampled disclosures.`,
      'The audit uncovered SAR 15M in previously undisclosed litigation exposure and significant regulatory non-compliance issues. This discovery provided the executive team with critical leverage to renegotiate deal terms, protecting the entire $127M in capital from post-acquisition shocks.',
      'Standard due diligence often misses systemic legal risks hidden in large data volumes. By integrating automated forensic scanning into the M&A lifecycle, Internal Audit serves as a direct protector of shareholder value.',
      'SAR 15M exposure identified - $127M capital protected - Deal terms renegotiated',
      JSON.stringify(['Forensic Data Analytics', 'Contract Risk Modelling', 'Board Advisory']),
      JSON.stringify(['Corporate Governance']),
      'ma-capital-protection',
    ],
    [
      'Audit 4.0: Shifting to 100% Population Testing',
      'Scaling real-time assurance for a Multi-Jurisdiction Tech Unicorn',
      'Technology / Cloud Kitchens',
      'A hyper-growth tech unicorn operating 100+ locations across 8 countries was experiencing a 340% surge in transaction volumes. The existing audit methodology relied on 5-15% manual sampling, leaving significant gaps in fraud detection.',
      'Build a modern, scalable Internal Audit function capable of providing real-time assurance across multi-billion dollar transaction cycles without slowing down business growth.',
      `I developed and deployed a proprietary Python/Pandas-based "Forensic Risk Engine." This shifted the audit methodology from sampling to 100% population testing. I integrated automated exception reporting for high-risk areas like third-party aggregator billing and payroll.`,
      'Identified and captured AED 7.7M in total financial impact (AED 3.2M recovered; AED 4.5M protected). Delivered a clean first-time external audit opinion with zero material weaknesses and secured board-approved investment for enterprise automation.',
      `Technology-enabled auditing turns Internal Audit from a historical "checker" into a real-time risk intelligence partner for the Board.`,
      'AED 7.7M financial impact - 100% population coverage - Clean SOX 404 opinion',
      JSON.stringify(['Python', 'Pandas', 'Machine Learning', 'SOX 404']),
      JSON.stringify(['Audit Transformation']),
      'audit-4-transformation',
    ],
    [
      'IPO Readiness & Governance Architecture',
      'Delivering a clean roadmap for a High-Growth F&B Technology Platform',
      'F&B / Financial Markets',
      'A high-growth technology platform operating across 7 jurisdictions was targeting a major stock market listing. The organization had no formal internal audit function, no documented ICOFR framework, and significant governance gaps.',
      'As Strategic Advisor, I was mandated to oversee the end-to-end IPO readiness programme, ensuring full compliance with regional corporate governance codes and establishing a board-grade control environment within 18 months.',
      'I led seven integrated workstreams, including the build-out of a 175+ control ICOFR framework and the design of a group-wide whistleblowing and ethics programme. I established the Audit Committee charters and reporting protocols aligned to listing requirements.',
      'Delivered a clean, first-time external audit opinion on ICOFR. Successfully aligned board and committee structures with regional market regulations across all jurisdictions, providing the governance foundation required for the listing prospectus.',
      'Success in IPO readiness requires balancing rigid regulatory compliance with the agile needs of a technology-driven firm.',
      'Clean ICOFR Certification - Board-level reporting established - Listed-ready status achieved',
      JSON.stringify(['ICOFR', 'Corporate Governance', 'SCA/DFM Regulations']),
      JSON.stringify(['Corporate Governance']),
      'ipo-governance-readiness',
    ],
    [
      'Data Analytics & Continuous Monitoring Training',
      'Transforming traditional audit teams into data-driven advisory units',
      'F&B / QSR',
      'A leading Quick Service Restaurant (QSR) player in KSA relied on manual sampling for audits, limiting coverage and leading to high false positives. The traditional, compliance-centric audit team lacked the technical capability to automate testing.',
      'Design and facilitate a comprehensive upskilling program to teach auditors how to leverage Python, Pandas, and machine learning for automated testing and continuous anomaly detection.',
      'I developed and delivered a masterclass covering the full data lifecycle—from extracting data from complex ERPs (SAP/Oracle) to writing continuous monitoring scripts and translating findings into executive risk dashboards.',
      'The training fostered a culture of innovation, leading to the development of in-house vendor-testing tools. We significantly increased productivity per planned audit hour and recovered millions of dollars in revenue leakage.',
      'Empowering audit functions with data analytics skills transforms them from traditional compliance checkers into confident, proactive assurance providers over complex operational data.',
      'Millions recovered in revenue leakage - Productivity increased - In-house automated tools developed',
      JSON.stringify(['Python', 'Pandas', 'Machine Learning', 'Data Analytics']),
      JSON.stringify(['Audit Transformation']),
      'data-analytics-audit-training',
    ],
  ].forEach((row) => insertCaseStudy.run(...row));

  const insertEngagement = db.prepare(`
    INSERT INTO professional_engagements (title, category, desc, outcome, display_order, categories, slug)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  `);

  [
    ['KSA Real Estate Forensic Audit', 'Fraud Forensics', 'Monitoring SAR 500M+ Capex/OpEx across residential and commercial portfolios.', 'Recovered SAR 3.2M annually via automated risk engine.', 1, JSON.stringify(['Fraud Forensics']), 'ksa-real-estate-forensic-audit'],
    ['Executive Financial Dashboards', 'Strategic Dashboards', 'Real-time board-level visibility into capital leaks and variance analysis.', '85% automated reporting efficiency achieved.', 2, JSON.stringify(['Strategic Dashboards']), 'executive-financial-dashboards'],
    ['Tadawul Nomu Listing Readiness', 'Corporate Governance', 'Coordinated ICOFR and regulatory submissions for KSA healthcare subsidiary.', 'Successful governance structuring for parallel market listing.', 3, JSON.stringify(['Corporate Governance']), 'tadawul-nomu-listing-readiness'],
    ['Enterprise Risk Management (8 Countries)', 'Enterprise Risk', 'Designed and implemented COSO ERM 2017 / ISO 31000 framework.', '50+ risks mapped; 28 KRIs live across 8 jurisdictions.', 4, JSON.stringify(['Enterprise Risk']), 'enterprise-risk-management-8-countries'],
    ['Whistleblowing Framework (QSR Leader)', 'Corporate Governance', 'Designed email-based reporting and investigation protocols from scratch.', 'Discovered SAR 12M fraud within months of launch.', 5, JSON.stringify(['Corporate Governance']), 'whistleblowing-framework-qsr-leader'],
    ['Ethics & Compliance Programme (Multi-Country)', 'Corporate Governance', 'Led sourcing, vendor evaluation, and organisation-wide rollout.', 'Full programme live across 7 countries with EthicsPoint integration.', 6, JSON.stringify(['Corporate Governance']), 'ethics-compliance-programme-multi-country'],
  ].forEach((row) => insertEngagement.run(...row));

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
      'Modernising legacy Internal Audit functions using Python and Machine Learning. I augment your existing team by building the automated tools they need to achieve real-time risk intelligence.',
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
