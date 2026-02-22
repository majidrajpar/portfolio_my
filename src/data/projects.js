export const projects = [
  {
    id: 'fraud-detection-ml',
    title: 'ML-Powered Fraud Detection',
    description: 'A GCC food & beverage platform losing revenue to manager-level fraud across 70+ locations needed a systematic solution that went beyond spot-checking. Built an ML detection engine on 2.3M+ monthly transactions, recovering AED 3.2M annually and reducing incidents by 78%.',
    category: 'Fraud Forensics',
    impact: '78% Reduction in Fraud Incidents (2.3M monthly transactions)',
    techStack: ['Python', 'scikit-learn', 'Pandas', 'Excel Automation'],
    image: '/portfolio_my/images/projects/fraud-detection/fraud-dashboard.webp',
    features: [
      'ML anomaly detection with 87.3% accuracy using Isolation Forest',
      'Manager discount rate analysis with automated risk scoring',
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
    category: 'Corporate Governance',
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
    category: 'Audit Transformation',
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
    category: 'Strategic Dashboards',
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
    category: 'Corporate Governance',
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
    category: 'Audit Transformation',
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
    category: 'Audit Transformation',
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
    category: 'Fraud Forensics',
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
    category: 'Audit Transformation',
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
    category: 'Corporate Governance',
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
    category: 'Enterprise Risk',
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
    category: 'Corporate Governance',
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
    category: 'Audit Transformation',
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
  }
];

export const featuredProjects = projects.slice(0, 2);
