export const projects = [
  {
    id: 'ksa-real-estate-fraud',
    title: 'KSA Real Estate Fraud Detection (Audit 4.0)',
    description: 'Monitoring SAR 500M+ Capex and OpEx across a mid-sized KSA real estate firm\'s residential and commercial portfolio (client identity withheld under engagement confidentiality). Traditional audits were missing multivariate fraud patterns, ghost tenancies, and VAT leakage in the 15% VAT regime. Deployed an automated Forensic Risk Engine in R to surface the top 1% high-risk transactions and recover SAR 3.2M annually.',
    categories: ['Fraud Forensics'],
    impact: 'SAR 3.2M direct revenue recovery — 85% reduction in manual audit review time — 82% decrease in Variation Order threshold evasion',
    techStack: ['R', 'ggplot2', 'StringDist', 'Z-Score Modelling', 'Fuzzy Matching', 'VAT Analytics'],
    image: '/portfolio_my/images/projects/ksa-real-estate-fraud/methodology.png',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/ksa-real-estate-fraud/investigation.png',
        caption: 'Temporal Risk Heatmap — fraud intensity clusters identified during the KSA Weekend (Fri/Sat) and after-hours (11 PM – 4 AM)'
      },
      {
        image: '/portfolio_my/images/projects/ksa-real-estate-fraud/ghost_tenancy.png',
        caption: 'Ghost Tenancy Detection — units with active lease revenue but zero SEC/NWC utility usage, proving fictitious occupancy to inflate building valuation'
      },
      {
        image: '/portfolio_my/images/projects/ksa-real-estate-fraud/benchmarking.png',
        caption: 'FM Benchmarking — 2.2x cost overrun identified in specific FM contracts using SAR per SqFt benchmarking'
      }
    ],
    features: [
      'Composite Risk Scoring (CRS) — filtered 3,500+ transactions to the top 1% high-risk leads (SAR 3.4M in potential recovery)',
      'Ghost Vendor Detection — Fuzzy-Matching (StringDist) on 15% VAT-registered procurement to surface duplicate and fictitious suppliers',
      'Variation Order (VO) Abuse — Z-Score statistical modelling to detect contractor collusion and threshold evasion on Capex projects',
      'Ghost Tenancy Engine — correlated lease revenue with SEC/NWC utility consumption; zero-usage units flagged as fictitious occupancy',
      'FM Contract Benchmarking — SAR per SqFt analysis across buildings identified 2.2x cost overrun in specific FM agreements',
      'Temporal Fraud Mapping — heat map of transaction timing surfaced fraud clusters on weekends and after-hours windows'
    ]
  },
  {
    id: 'fraud-detection-ml',
    title: 'ML-Powered Fraud Detection',
    description: 'A GCC food & beverage platform losing revenue to manager-level fraud across 70+ locations needed a systematic solution that went beyond spot-checking. Built an ML detection engine on 2.3M+ monthly transactions, recovering AED 3.2M annually and reducing incidents by 78%.',
    categories: ['Fraud Forensics'],
    impact: '78% Reduction in Fraud Incidents (2.3M monthly transactions)',
    techStack: ['Python', 'scikit-learn', 'Pandas', 'Excel Automation'],
    image: '/portfolio_my/images/projects/fraud-detection/fraud-dashboard.webp',
    features: [
      'ML anomaly detection with 87.3% accuracy using Isolation Forest',
      'Managerial Concession Analysis with automated risk scoring',
      'Hourly transaction pattern heat mapping',
      'Location-based risk assessment across multiple regions',
      'Automated recovery identification (AED 3.2M recurring annual recovery)',
      'Real-time fraud probability scoring for each transaction'
    ]
  },
  {
    id: 'dfm-ipo-readiness',
    title: 'DFM IPO Readiness — UAE Multi-Brand F&B Technology Platform',
    description: 'A UAE multi-brand F&B technology platform targeting DFM listing had no governance infrastructure, no ICOFR framework, and no audit function. Led end-to-end IPO readiness across governance restructuring, ICOFR build-out, and UAE SCA compliance — from zero to listing-ready across 7 jurisdictions.',
    categories: ['Corporate Governance', 'Audit Transformation'],
    impact: 'End-to-end IPO readiness across governance, ICOFR, and UAE SCA compliance for a multi-jurisdiction, multi-brand platform',
    techStack: ['UAE SCA Regulations', 'DFM Listing Rules', 'COSO ICOFR', 'IFRS', 'UAE Companies Law'],
    image: '/portfolio_my/images/projects/dfm-ipo-readiness/icofr-governance.webp',
    features: [
      'ICOFR scoping and Risk Control Matrix documentation across 12+ business processes',
      'UAE SCA Corporate Governance Code compliance — board composition, committee design, disclosure framework',
      'IFRS-compliant financial statement preparation and audit readiness across all entities',
      'Three Lines of Defence model embedded ahead of listing with internal audit function build-out',
      'Dual-workstream delivery: IPO governance alongside group-wide COSO ERM 2017 rollout across 7 jurisdictions',
      'Board, Audit Committee, and investor reporting frameworks designed for post-listing governance obligations'
    ]
  },
  {
    id: 'audit-findings-system',
    title: 'Audit Findings Management System',
    description: 'A GCC multi-entity operation was running audit findings on manual spreadsheets — no aging visibility, no escalation triggers, no audit committee reporting. Built a Python-based tracking system that replaced the spreadsheets entirely, cut preparation time by 70%, and gave the board real-time remediation status for the first time.',
    categories: ['Audit Transformation'],
    impact: '70% reduction in audit preparation cycle time — board-ready status reporting automated',
    techStack: ['Python', 'YAML', 'IIA Compliance', 'openpyxl'],
    image: '/portfolio_my/images/projects/audit-tools/findings-tracker.webp',
    features: [
      'Replaced manual spreadsheets — eliminated 3 days of monthly consolidation work',
      'Automated aging analysis: overdue findings escalated automatically by severity tier',
      '100% population testing coverage replacing sample-based approach across all audit areas',
      'Real-time audit committee dashboard — status, overdue count, and trend visible at a glance',
      'IIA-aligned finding severity framework (Critical/High/Medium/Low) with unique reference IDs',
      'Automated management report generation — zero manual formatting required'
    ]
  },
  {
    id: 'executive-financial-dashboard',
    title: 'Executive Financial Dashboard',
    description: 'Proprietary financial reporting engine providing real-time board-level visibility into capital leaks, variance analysis, and recovery tracking.',
    categories: ['Strategic Dashboards'],
    impact: '85% automated reporting efficiency achieved',
    techStack: ['xlsxwriter', 'Pandas', 'Power BI', 'Python'],
    image: '/portfolio_my/images/projects/finance-dashboard/executive-dashboard.webp',
    features: [
      'Real-time KPI monitoring (AED 127M, AED 68.2M, 37.5%)',
      'Monthly P&L with quarterly trend analysis',
      'Budget vs. Actual variance tracking with colour coding',
      'Automated financial reporting for board meetings',
      'Capital leak identification and recovery tracking',
      'Multi-period comparative analysis (12-month view)'
    ]
  },
  {
    id: 'tadawul-ipo-readiness',
    title: 'Tadawul IPO Readiness — GCC Premium Brand',
    description: 'Led end-to-end IPO readiness transformation for a GCC premium brand targeting Tadawul listing. Delivered a 24-month programme covering ICOFR implementation, CMA regulatory compliance, governance restructuring, and investor-grade financial documentation.',
    categories: ['Corporate Governance', 'Audit Transformation'],
    impact: 'SAR 500M+ capital raise target — full ICOFR certification across 14 business processes',
    techStack: ['COSO ICOFR', 'CMA Regulations', 'Tadawul Listing Rules', 'IFRS', 'Big 4 Co-sourcing'],
    image: '/portfolio_my/images/projects/tadawul-ipo-readiness/icofr-dashboard.svg',
    features: [
      'ICOFR implementation across 14 processes with full Risk Control Matrix documentation',
      'CMA Corporate Governance Regulations compliance — board independence, committee formation',
      '3-year IFRS-compliant audited financial statements and prospectus preparation',
      'Readiness scorecard framework targeting 70%+ compliance across all workstreams',
      'Big 4 external auditor coordination and reliance-based control testing programme',
      'Board, audit committee, and investor roadshow reporting packs (30+ slide deck)'
    ]
  },
  {
    id: 'enterprise-audit-platform',
    title: 'Enterprise Audit Management Platform',
    description: 'A diversified GCC group ran its audit function across multiple entities with no unified view — audit plans lived in email threads, board reports were built manually each quarter, and no one could answer "what is the current audit status across the group?" Built an integrated platform that gave the audit director, management, and board a single, real-time picture.',
    categories: ['Audit Transformation'],
    impact: 'Full audit lifecycle automated across multi-entity operations — from annual plan to board pack, zero manual assembly',
    techStack: ['Python', 'openpyxl', 'python-pptx'],
    image: '/portfolio_my/images/projects/enterprise-audit-tracker/audit-dashboard.webp',
    features: [
      'Director dashboard: live audit universe status, findings count, and overdue actions across all entities',
      'Annual audit plan builder with risk-based priority scoring — high-risk areas scheduled first automatically',
      'Board-ready PowerPoint pack generated in one click — no manual slide building',
      '3-tier governance reporting: Operational (weekly), Management (monthly), Board (quarterly)',
      'Multi-entity audit scheduling with resource allocation and workload visibility',
      'Integrated findings tracker linked directly to the audit plan — end-to-end traceability'
    ]
  },
  {
    id: 'food-safety-risk',
    title: 'Food Safety Risk Assessment Framework',
    description: 'Advanced risk management framework for F&B operations with heat mapping, control validation, and compliance tracking across 70+ locations.',
    categories: ['Audit Transformation', 'Enterprise Risk'],
    impact: 'End-to-end food safety risk framework deployed across 70+ locations with executive risk reporting',
    techStack: ['Python', 'Risk Analytics', 'Compliance Frameworks'],
    image: '/portfolio_my/images/projects/food-safety-risk/risk-heatmap.webp',
    features: [
      'Risk heat mapping across 70+ restaurant locations',
      'Control validation and effectiveness testing',
      'Compliance tracking with regulatory requirements',
      'Mitigation roadmap generation with timelines',
      'Executive risk reporting for board visibility',
      'Location-specific risk scoring and prioritisation'
    ]
  },
  {
    id: 'forensic-fraud-toolkit',
    title: 'Forensic Fraud Investigation Toolkit',
    description: 'Professional forensic analysis toolkit for major fraud cases with control failure mapping, evidence tracking, and litigation support documentation.',
    categories: ['Fraud Forensics'],
    impact: 'Multi-case fraud investigation support — control failure mapping and litigation-ready documentation',
    techStack: ['Python', 'Excel Automation', 'Forensic Accounting'],
    image: '/portfolio_my/images/projects/fraud-cases/fraud-analysis.webp',
    features: [
      'Control failure mapping with root cause analysis',
      'Evidence tracking with chain of custody',
      'Litigation support report generation',
      'Major fraud case documentation and analysis',
      'Recovery action planning with financial impact',
      'Professional forensic accounting methodologies'
    ]
  },
  {
    id: 'multi-location-compliance',
    title: 'Multi-Location Audit Compliance System',
    description: 'With 70+ restaurant locations each running their own interpretation of compliance, the group had no way to compare, rank, or hold locations accountable. Built a standardised audit system that replaced inconsistent spot-checks with scored, automated assessments — giving operations management a real compliance league table for the first time.',
    categories: ['Audit Transformation'],
    impact: 'Compliance scores comparable across 70+ locations — underperforming sites identified and actioned within audit cycle',
    techStack: ['Python', 'openpyxl', 'Audit Standards'],
    image: '/portfolio_my/images/projects/restaurant-audit/audit-checklist.webp',
    features: [
      'Standardised F&B audit checklists — eliminated inconsistency across 70+ locations',
      'Automated compliance scoring: each location receives a comparable, weighted score',
      'Location performance league table — management identifies outliers at a glance',
      'Remediation tracking with escalating deadlines — overdue actions flagged to area managers',
      'Action plan module: each finding auto-generates an owner-assigned corrective action',
      'Management summary report built automatically after each audit cycle'
    ]
  },
  {
    id: 'nomu-listing-readiness',
    title: 'Nomu Parallel Market Listing — KSA Healthcare Subsidiary',
    description: 'As Group Internal Audit Director, led listing readiness for a KSA healthcare subsidiary of a diversified GCC holding group targeting the Tadawul Nomu Parallel Market. Coordinated governance, ICOFR, and regulatory submissions across the holding and subsidiary structures.',
    categories: ['Corporate Governance', 'Audit Transformation'],
    impact: 'Subsidiary successfully structured for parallel market listing within group governance framework',
    techStack: ['Tadawul Nomu Rules', 'COSO', 'ICOFR', 'CMA Regulations', 'Holding Group Governance'],
    image: '/portfolio_my/images/projects/nomu-listing-readiness/governance-structure.svg',
    features: [
      'Subsidiary-level governance framework designed within holding group structure',
      'ICOFR scoping and control documentation aligned to Nomu listing requirements',
      'Intercompany transaction review and related-party disclosure framework',
      'Holding group audit committee oversight model for listed subsidiary',
      'CMA regulatory gap analysis and remediation roadmap',
      'Coordination with investment bank, legal advisors, and CMA on listing timetable'
    ]
  },
  {
    id: 'coso-erm-9country',
    title: 'Enterprise Risk Management Programme — Multi-Brand F&B Platform (8 Countries)',
    description: 'Designed and implemented a complete COSO ERM 2017 / ISO 31000 framework for a UAE-based, technology-enabled cloud kitchen platform operating 100+ kitchens across 8 countries. Delivered 12 production-ready tools — risk register, KRI dashboard, BCP tracker, and board reporting suite — alongside a board-adopted risk appetite statement and embedded Three Lines of Defence model.',
    categories: ['Enterprise Risk', 'Corporate Governance'],
    impact: '12 tools delivered — 50+ risks mapped, 28 KRIs live, board risk appetite formally adopted across 8 jurisdictions',
    techStack: ['COSO ERM 2017', 'ISO 31000:2018', 'ISO 22301', 'Excel', 'Word', 'Three Lines of Defence'],
    image: '/portfolio_my/images/projects/coso-erm/risk-heatmap.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/erm-programme/kri-dashboard.svg',
        caption: 'Monthly KRI Dashboard — 28 KRIs tracked across 6 domains with RAG thresholds and automated escalation logic'
      },
      {
        image: '/portfolio_my/images/projects/erm-programme/risk-treatment-tracker.svg',
        caption: 'Risk Treatment Plan Tracker — quarterly progress tracking with owner accountability and Risk Committee escalation summary'
      },
      {
        image: '/portfolio_my/images/projects/erm-programme/bcp-tracker.svg',
        caption: 'BCP / DRP Readiness Dashboard — RTO/RPO targets, test results and annual testing schedule for 12 critical business functions'
      }
    ],
    features: [
      'Enterprise Risk Register — 50+ risks scored across 9 categories with inherent/residual ratings, treatment status and KRI linkage',
      'KRI Dashboard — 28 Key Risk Indicators with Green/Amber/Red thresholds; Amber triggers 10-day management review, Red triggers CRO escalation within 48 hours',
      'Controls Inventory & Self-Assessment — CSA workbook for first-line control owners aligned to COSO control categories',
      'Risk Treatment Plan Tracker — progress bars, authority tiers, due dates and quarterly Risk Committee escalation summary',
      'Incident & Near-Miss Log — root cause classification, risk register linkage and lessons-learned capture',
      'Implementation Programme Tracker — ERM rollout Gantt across all 8 jurisdictions covering policy, training and reporting cadence',
      'BCP Recovery Tracker — RTO/RPO targets for 12 critical functions; 75% programme readiness achieved at go-live',
      'Monthly Management Risk Report template (C-Suite), Quarterly Risk Committee Pack, and Semi-Annual Board Risk Report — all Word-native with zero specialist software dependency',
      'Risk Culture Survey — baseline and annual measurement of risk awareness and tone from the top',
      'Board-approved risk appetite statement — zero tolerance for food safety and regulatory compliance; moderate appetite for strategic and financial risk',
      'Three Lines of Defence model embedded across 8 jurisdictions with defined accountability from kitchen operations through to internal audit',
      '4-tier reporting cadence: Operational (weekly dashboard) → Management (monthly report) → Committee (quarterly pack) → Board (semi-annual)'
    ]
  },
  {
    id: 'holding-group-governance',
    title: 'Corporate Governance Framework & Manual — KSA Holding Group',
    description: 'As Group Internal Audit Director, led a comprehensive corporate governance upgrade for a KSA multi-sector private holding group. Delivered a full governance manual, board and committee structures, delegation of authority matrix, and Three Lines of Defence model aligned to Saudi Companies Law and international best practice.',
    categories: ['Corporate Governance'],
    impact: 'Group-wide governance manual adopted by board — covering holding company and all operating subsidiaries',
    techStack: ['Saudi Companies Law', 'IIA Three Lines Model', 'SOCPA Standards', 'King IV', 'Board Governance'],
    image: '/portfolio_my/images/projects/holding-group-governance/governance-framework.svg',
    features: [
      'Corporate governance manual covering board charter, committee terms of reference, and delegation of authority matrix',
      'Board and committee structure design — Audit, Risk, and Nomination & Remuneration committees',
      'Three Lines of Defence model implemented across holding and all operating subsidiaries',
      'Whistleblower policy, code of conduct, and ethics framework with reporting mechanisms',
      'Governance gap analysis against Saudi Companies Law and international best practice frameworks',
      'Annual board effectiveness evaluation framework and governance reporting to ownership'
    ]
  },
  {
    id: 'icaew-audit-system',
    title: 'ICAEW Audit Report System',
    description: 'An ICAEW-regulated audit team was spending 60–70% of engagement time on workpaper preparation and report formatting rather than actual audit work. Built an automated reporting system aligned to ICAEW standards that cut document preparation time by two-thirds — freeing the team to focus on judgement, not formatting.',
    categories: ['Audit Transformation'],
    impact: 'Audit documentation time cut by ~65% — ICAEW standards embedded automatically, zero manual formatting',
    techStack: ['Python', 'ICAEW Standards', 'Report Automation'],
    image: '/portfolio_my/images/projects/icaew-audit/audit-report.webp',
    features: [
      'ICAEW-compliant audit report generated from structured inputs — no blank-page formatting',
      'Testing methodology auto-populated based on audit area and risk level selected',
      'Evidence index built automatically as workpapers are completed — audit trail maintained throughout',
      'Quality review checklist embedded in workflow — sign-off gates enforced before report finalisation',
      'Consistent professional output across all engagements — no variation between team members',
      'Reusable templates for recurring audit programmes — prior-period workpapers accessible in one click'
    ]
  },
  {
    id: 'whistleblowing-system-uae',
    title: 'Whistleblowing System Design — UAE Mid-Market Company',
    description: 'A UAE mid-sized company had a whistleblowing channel in name only — no formal policy, no investigation protocol, no controls over who could access submitted reports, and no assurance that reporters were genuinely protected. Engaged to design the system end-to-end: from policy architecture and access governance through to anonymity assurance and organisation-wide rollout.',
    categories: ['Corporate Governance'],
    impact: 'End-to-end whistleblowing system designed and rolled out — anonymity assured, access controls restructured, investigation framework embedded',
    techStack: ['Whistleblowing Policy Design', 'Investigation Policy', 'Access Control Review', 'UAE Labour Law', 'ISO 37002:2021', 'Three Lines of Defence'],
    image: '/portfolio_my/images/projects/whistleblowing-system-uae/system-architecture.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/whistleblowing-system-uae/access-control-review.svg',
        caption: 'Access Control Review — Before & After: who could read submitted reports. Five of eight roles were over-privileged prior to remediation; IT admin access was segregated to prevent technical de-anonymisation of reporters.'
      },
      {
        image: '/portfolio_my/images/projects/whistleblowing-system-uae/investigation-workflow.svg',
        caption: 'Investigation Policy Workflow — six-stage lifecycle from report receipt to Audit Committee closure, with defined SLAs, authority tiers, and embedded non-retaliation protections.'
      }
    ],
    features: [
      'Whistleblowing Policy — drafted from scratch covering scope, reporting channels, non-retaliation protections, and escalation hierarchy aligned to UAE Labour Law',
      'Investigation Policy — defined intake triage, investigation steps, evidence handling standards, timelines, and authority levels for closing or escalating cases',
      'Access Control Review — mapped who could read submitted reports at each stage; identified over-privileged access and redesigned the permission structure to need-to-know only',
      'Anonymity Assurance Assessment — reviewed whether the platform technically prevented identity exposure; identified gaps in metadata stripping and submission routing that could de-anonymise reporters',
      'Rollout Plan — phased communication and training programme covering board, management, and all staff; included FAQ document and poster campaign for operational areas',
      'Governance Integration — whistleblowing reporting line connected to Audit Committee with quarterly summary reporting template; escalation path defined for cases implicating senior management'
    ]
  },
  {
    id: 'ethics-compliance-programme',
    title: 'Ethics & Compliance Programme — UAE Multi-Country Cloud Kitchen Platform',
    description: 'In-house at a UAE-headquartered, technology-enabled cloud kitchen platform operating across 7 countries, led the end-to-end design and deployment of the group\'s ethics and compliance programme. Scope covered sourcing and onboarding a third-party ethics platform through a structured vendor evaluation, launching three distinct programmes — whistleblowing, executive voluntary disclosures, and annual conflict-of-interest acknowledgements — and embedding awareness across all offices and kitchen operations globally.',
    categories: ['Corporate Governance'],
    impact: 'Full ethics programme live across 7 countries — platform sourced and onboarded, three programmes launched, organisation-wide training and awareness embedded',
    techStack: ['EthicsPoint', 'Third-Party Risk Assessment', 'ISO 37002:2021', 'COI Framework Design', 'Multi-Jurisdiction Rollout', 'Training Programme Design'],
    image: '/portfolio_my/images/projects/ethics-compliance-programme/programme-overview.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/ethics-compliance-programme/vendor-selection.svg',
        caption: 'Ethics Platform Vendor Selection — structured criteria-based evaluation leading to EthicsPoint shortlisting, background check, third-party risk assessment, and SLA negotiation.'
      },
      {
        image: '/portfolio_my/images/projects/ethics-compliance-programme/rollout-countries.svg',
        caption: '7-Country Rollout — phased deployment across UAE, KSA, Kuwait, Qatar, Bahrain, Poland and Denmark, with post-implementation training, induction module, and site poster campaign.'
      }
    ],
    features: [
      'Ethics Platform Sourcing — defined evaluation criteria, conducted market scan across multiple vendors; EthicsPoint selected following structured background check and third-party risk assessment (TPRA)',
      'SLA Framework — service level agreements negotiated with provider covering report intake, triage timelines, escalation paths, data privacy, and jurisdiction-specific requirements',
      'Whistleblowing Programme — anonymous reporting channel configured and launched across all 7 jurisdictions with defined SLAs for intake, triage, and investigation',
      'Executive Voluntary Disclosures — programme requiring senior leadership to proactively disclose relationships with relatives and receipt of gifts above threshold value',
      'Annual COI Acknowledgements — structured annual disclosure process for individuals in roles with conflict-of-interest exposure (real estate, procurement, capital projects)',
      'Multi-Jurisdiction Rollout — phased deployment across UAE, KSA, Kuwait, Qatar, Bahrain, Poland, and Denmark with country-specific adaptations where required by local law',
      'Training & Awareness — post-implementation training delivered to all staff; standalone induction training module created for new joiners across all countries',
      'Site Accessibility — awareness posters designed and deployed at all office and kitchen operational sites; materials verified as current during internal audit visits'
    ]
  },
  {
    id: 'qs-whistleblowing-programme',
    title: 'Whistleblowing Programme — GCC Multi-Location Food Service Group',
    description: 'A GCC-based multi-location food service group had no formal mechanism for staff to raise concerns — no policy, no channel, no investigation process. Designed and implemented a pragmatic whistleblowing programme from scratch: an email-based reporting channel backed by a written policy, an investigation framework, and organisation-wide training. The programme demonstrated immediate impact — a report submitted through the channel directly led to the discovery of a SAR 12 million fraud within months of launch.',
    categories: ['Corporate Governance', 'Fraud Forensics'],
    impact: 'SAR 12M fraud discovered directly through the whistleblowing channel — programme designed and embedded from scratch with no prior infrastructure',
    techStack: ['Whistleblowing Policy Design', 'Investigation Framework', 'Training Programme Design', 'KSA Labour Law', 'Anonymous Reporting Channel'],
    image: '/portfolio_my/images/projects/qs-whistleblowing-programme/programme-design.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/qs-whistleblowing-programme/fraud-outcome.svg',
        caption: 'Programme outcome — a report submitted through the new email channel led directly to the identification and investigation of a SAR 12M fraud, validating the programme\'s effectiveness within months of launch.'
      }
    ],
    features: [
      'Whistleblowing Policy — drafted from scratch covering reporting channels, scope, non-retaliation protections, confidentiality assurances, and escalation hierarchy aligned to KSA Labour Law',
      'Email-Based Reporting Channel — accessible mechanism for anonymous and named submissions across all staff levels and locations, with dedicated governance inbox and defined intake SLAs',
      'Investigation Framework — structured case-handling process covering intake triage, investigation steps, evidence management, authority levels, and case closure documentation',
      'Organisation-Wide Training — sessions delivered across the group covering how to raise concerns, what protections applied, how reports would be handled, and the zero-tolerance stance on retaliation',
      'Management Briefing — separate sessions for line managers on obligations when receiving concerns directly, escalation procedure, and non-retaliation policy',
      'Programme Impact — a report submitted through the channel directly led to the identification and investigation of a SAR 12M fraud, demonstrating immediate real-world effectiveness of the programme design'
    ]
  },
  {
    id: 'ethics-awareness-revival',
    title: 'Whistleblowing Awareness Revival — KSA Diversified Conglomerate',
    description: 'A KSA-headquartered diversified conglomerate had a whistleblowing programme on paper but it had become largely unknown to staff — low usage, no active promotion, and no embedding across its portfolio companies. Engaged to diagnose the effectiveness gap and design a comprehensive awareness programme that re-established the channel as a functional, trusted mechanism across the group portfolio.',
    categories: ['Corporate Governance'],
    impact: 'Dormant whistleblowing programme revived and re-embedded — awareness campaign designed and deployed across group portfolio companies',
    techStack: ['Programme Effectiveness Review', 'Awareness Campaign Design', 'ISO 37002:2021', 'Stakeholder Communication', 'Multi-Entity Rollout'],
    image: '/portfolio_my/images/projects/ethics-awareness-revival/awareness-framework.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/ethics-awareness-revival/programme-assessment.svg',
        caption: 'Programme Effectiveness Assessment — root cause analysis of awareness gap with remediation actions mapped across communication, leadership, training, and measurement dimensions.'
      }
    ],
    features: [
      'Effectiveness Assessment — reviewed the existing programme against ISO 37002:2021; identified root causes of low awareness including absent communication cadence, no visible leadership commitment, and no refresh since initial launch',
      'Awareness Campaign Design — multi-channel campaign covering email, posters, screensavers, and town halls; materials tailored to the operating context of each portfolio company',
      'Tone from the Top — facilitated communications from senior leadership reinforcing zero-tolerance stance and actively encouraging staff to use the reporting channel',
      'Portfolio Company Rollout — awareness programme implemented across each portfolio company with customised materials reflecting each entity\'s sector, headcount, and operating environment',
      'Training Refresh — refresher training delivered to managers and HR; updated induction materials to include whistleblowing as a standing module for all new joiners',
      'Programme Metrics — baseline usage and reporting metrics established; quarterly summary reporting template designed for Audit Committee to track programme health going forward'
    ]
  },
];

export const featuredProjects = projects.slice(0, 2);

export const categoryMeta = [
  {
    name: 'Corporate Governance',
    slug: 'corporate-governance',
    description: 'Board structuring, ethics programme design, whistleblowing systems, IPO readiness, and governance framework implementation across GCC and international operations.',
  },
  {
    name: 'Fraud Forensics',
    slug: 'fraud-forensics',
    description: 'Forensic investigations, ML-powered fraud detection engines, and evidence-based financial recovery across GCC operations.',
  },
  {
    name: 'Audit Transformation',
    slug: 'audit-transformation',
    description: 'Internal audit function build-out, automated findings management, compliance systems, and audit methodology modernisation.',
  },
  {
    name: 'Enterprise Risk',
    slug: 'enterprise-risk',
    description: 'COSO ERM programme design, risk registers, KRI dashboards, and enterprise-wide risk governance across multi-country operations.',
  },
  {
    name: 'Strategic Dashboards',
    slug: 'strategic-dashboards',
    description: 'Executive financial reporting, automated board-level dashboards, and management information tools.',
  },
];

export function categorySlug(name) {
  const match = categoryMeta.find(c => c.name === name);
  return match ? match.slug : name.toLowerCase().replace(/\s+/g, '-');
}
