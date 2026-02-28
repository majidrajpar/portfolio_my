export const projects = [
  {
    id: 'ksa-real-estate-fraud',
    title: 'KSA Real Estate Fraud Detection (Audit 4.0)',
    description: 'Monitoring SAR 500M+ Capex and OpEx across a mid-sized KSA real estate firm\'s residential and commercial portfolio (client identity withheld under engagement confidentiality). Traditional audits were missing multivariate fraud patterns, ghost tenancies, and VAT leakage in the 15% VAT regime. Deployed an automated Forensic Risk Engine in R to surface the top 1% high-risk transactions and recover SAR 3.2M annually.',
    categories: ['Fraud Forensics'],
    duration: '3 months',
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
    duration: '5 months',
    impact: '78% Reduction in Fraud Incidents (2.3M monthly transactions)',
    techStack: ['Python', 'scikit-learn', 'Pandas', 'Excel Automation'],
    image: '/portfolio_my/images/projects/fraud-detection/fraud-dashboard.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/fraud-detection/model-performance.png',
        caption: 'ML Model Performance — Precision, Recall and F1 Score by risk classification band across 2.3M monthly transactions. Isolation Forest model achieving 87.3% overall accuracy.'
      },
      {
        image: '/portfolio_my/images/projects/fraud-detection/detection-by-category.png',
        caption: 'Fraud Flags and Confirmed Cases by Transaction Type — Ghost vendor payments and refund manipulation account for the highest confirmed fraud volumes. AED 3.2M recurring annual recovery identified.'
      }
    ],
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
    description: 'A UAE multi-brand F&B technology platform targeting a Dubai Financial Market listing had no governance infrastructure, no ICOFR framework, no documented policies, and no internal audit function. Engaged as KPMG external advisor to oversee and drive the company\'s end-to-end IPO readiness programme — covering ICOFR build-out, UAE SCA corporate governance alignment, GRC and ERM implementation, policies and procedures development, whistleblowing programme design, and the establishment of an internal audit function from scratch. Programme spanned 7 jurisdictions and ran in parallel with day-to-day commercial operations.',
    categories: ['Corporate Governance', 'Audit Transformation'],
    duration: '18 months',
    impact: 'Seven integrated workstreams delivered — ICOFR, governance, GRC, policies, whistleblowing, internal audit function, and IFRS readiness — across a 7-jurisdiction, multi-brand platform targeting DFM listing',
    techStack: ['UAE SCA Regulations', 'DFM Listing Rules', 'COSO ICOFR', 'IFRS', 'UAE Companies Law', 'COSO ERM 2017', 'IIA Standards', 'ISO 37002:2021', 'Three Lines of Defence'],
    image: '/portfolio_my/images/projects/dfm-ipo-readiness/programme-architecture.png',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/dfm-ipo-readiness/icofr-process-coverage.png',
        caption: 'ICOFR Process Coverage — 13 business processes scoped and documented with 175+ controls mapped to COSO control categories; inherent risk rated per process across financial close, commercial, operations, technology, and governance domains.'
      },
      {
        image: '/portfolio_my/images/projects/dfm-ipo-readiness/three-lines-defence.png',
        caption: 'Three Lines of Defence Model — governance accountability embedded across UAE holding company and 7 subsidiaries: Line 1 (business ownership), Line 2 (GRC/compliance oversight), Line 3 (internal audit and KPMG advisory) — all reporting to the Board and Audit Committee.'
      },
      {
        image: '/portfolio_my/images/projects/dfm-ipo-readiness/readiness-scorecard.png',
        caption: 'IPO Readiness Scorecard — pre-engagement baseline versus listing-ready state across 7 dimensions: ICOFR, corporate governance, GRC/ERM, policies and procedures, internal audit function, IFRS financial reporting, and whistleblowing & ethics.'
      },
      {
        image: '/portfolio_my/images/projects/dfm-ipo-readiness/icofr-governance.webp',
        caption: 'ICOFR Governance Architecture — COSO-aligned internal control framework mapping financial statement assertions to process-level controls, with design and operating effectiveness testing documentation.'
      }
    ],
    features: [
      'ICOFR Programme — 13 business processes scoped; 175+ controls designed, documented in Risk Control Matrices, and tested for design and operating effectiveness ahead of external auditor reliance',
      'UAE SCA Corporate Governance Code — board composition, independence requirements, Audit and Risk committee formation, disclosure framework, and board charter documentation aligned to DFM Listing Rules',
      'GRC & COSO ERM 2017 Rollout — enterprise risk register, KRI dashboard, risk appetite statement (board-adopted), and Three Lines of Defence model embedded across all 7 jurisdictions',
      'Policies & Procedures Development — group policy framework and hierarchy established; 15+ financial and operational control policies drafted covering procurement, payroll, treasury, delegation of authority, and expense management',
      'Whistleblowing Programme — policy, anonymous reporting channel, investigation protocol, non-retaliation framework, and Audit Committee reporting template designed and deployed across the group',
      'Internal Audit Function Build-Out — IA charter, risk-based audit plan, IIA-aligned methodology, findings management framework, and Board/Audit Committee reporting cadence established from zero',
      'IFRS Financial Readiness — IFRS gap analysis across all entities, multi-entity consolidation framework, and 3-year audited financial statement preparation for DFM prospectus requirements',
      'Board & Investor Reporting — post-listing governance reporting packs designed for Board, Audit Committee, and investor-facing disclosure obligations'
    ]
  },
  {
    id: 'audit-findings-system',
    title: 'Audit Findings Management System',
    description: 'A GCC multi-entity operation was running audit findings on manual spreadsheets — no aging visibility, no escalation triggers, no audit committee reporting. Built a Python-based tracking system that replaced the spreadsheets entirely, cut preparation time by 70%, and gave the board real-time remediation status for the first time.',
    categories: ['Audit Transformation'],
    duration: '6 weeks',
    impact: '70% reduction in audit preparation cycle time — board-ready status reporting automated',
    techStack: ['Python', 'YAML', 'IIA Compliance', 'openpyxl'],
    image: '/portfolio_my/images/projects/audit-tools/findings-tracker.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/audit-tools/findings-by-severity.png',
        caption: 'Audit Findings by Severity — Quarterly Distribution. Composition shift from Critical/High toward Medium/Low confirms the improving control environment across the engagement year.'
      },
      {
        image: '/portfolio_my/images/projects/audit-tools/resolution-timeline.png',
        caption: 'Average Days to Resolution by Finding Category. IT/ITGC and Fraud Risk findings consistently exceed the 45-day target, triggering automated escalation to senior management.'
      }
    ],
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
    duration: '8 weeks',
    impact: '85% automated reporting efficiency achieved',
    techStack: ['xlsxwriter', 'Pandas', 'Power BI', 'Python'],
    image: '/portfolio_my/images/projects/finance-dashboard/executive-dashboard.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/finance-dashboard/variance-analysis.png',
        caption: 'Revenue — Actual vs Budget by Quarter. Q3 exceeded budget by AED 1.2M (+3.6%), with full-year group revenue tracked at AED 127M against a planned AED 124M.'
      },
      {
        image: '/portfolio_my/images/projects/finance-dashboard/kpi-performance.png',
        caption: 'KPI Performance vs Target — Full Year. Revenue and Recovery Rate exceeded targets; EBITDA Margin and Budget Adherence identified as focus areas for the following year.'
      }
    ],
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
    duration: '24 months',
    impact: 'SAR 500M+ capital raise target — full ICOFR certification across 14 business processes',
    techStack: ['COSO ICOFR', 'CMA Regulations', 'Tadawul Listing Rules', 'IFRS', 'Big 4 Co-sourcing'],
    image: '/portfolio_my/images/projects/tadawul-ipo-readiness/icofr-dashboard.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/tadawul-ipo-readiness/readiness-scorecard.png',
        caption: 'IPO Readiness Scorecard — Pre-Engagement vs Listing-Ready state across 7 workstreams. 24-month transformation targeting Tadawul listing for a GCC premium brand (SAR 500M+ capital raise).'
      },
      {
        image: '/portfolio_my/images/projects/tadawul-ipo-readiness/control-population.png',
        caption: 'ICOFR Control Population by Business Process — 190 controls documented across 14 processes, with Risk Control Matrices aligned to COSO financial statement assertions and CMA requirements.'
      }
    ],
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
    categories: ['Audit Transformation', 'Strategic Dashboards'],
    duration: '3 months',
    impact: 'Full audit lifecycle automated across multi-entity operations — from annual plan to board pack, zero manual assembly',
    techStack: ['Python', 'openpyxl', 'python-pptx'],
    image: '/portfolio_my/images/projects/enterprise-audit-tracker/audit-dashboard.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/enterprise-audit-tracker/audit-plan-status.png',
        caption: 'Annual Audit Plan Status by Business Entity — risk-based scheduling ensures highest-risk entities are prioritised. Completed, in-progress, and planned audits visible in a single view across the group.'
      },
      {
        image: '/portfolio_my/images/projects/enterprise-audit-tracker/finding-age-profile.png',
        caption: 'Open Audit Findings — Age Profile. Findings exceeding the 45-day remediation target are automatically escalated to senior management, with board-level visibility on overdue actions.'
      }
    ],
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
    duration: '4 months',
    impact: 'End-to-end food safety risk framework deployed across 70+ locations with executive risk reporting',
    techStack: ['Python', 'Risk Analytics', 'Compliance Frameworks'],
    image: '/portfolio_my/images/projects/food-safety-risk/risk-heatmap.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/food-safety-risk/risk-by-cluster.png',
        caption: 'Composite Food Safety Risk Score by Location Cluster — clusters scoring 75+ require immediate remediation. Risk banding (High/Medium/Low) drives prioritisation of on-site inspection resources.'
      },
      {
        image: '/portfolio_my/images/projects/food-safety-risk/control-compliance.png',
        caption: 'Control Compliance Rate by Food Safety Category — Supplier Verification and Allergen Management fall below the 80% minimum standard and are prioritised for corrective action and re-audit.'
      }
    ],
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
    duration: '3 months',
    impact: 'Multi-case fraud investigation support — control failure mapping and litigation-ready documentation',
    techStack: ['Python', 'Excel Automation', 'Forensic Accounting'],
    image: '/portfolio_my/images/projects/fraud-cases/fraud-analysis.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/fraud-cases/scheme-analysis.png',
        caption: 'Financial Exposure and Recovery by Fraud Scheme — Ghost vendor payments represent the highest exposure. Recovery rate across all schemes exceeds 65%, supported by litigation documentation and chain of custody records.'
      },
      {
        image: '/portfolio_my/images/projects/fraud-cases/investigation-stages.png',
        caption: 'Forensic Investigation Methodology — Stage Duration. Structured 75-day engagement lifecycle from preliminary assessment through evidence collection, data analysis, findings documentation, and recovery action planning.'
      }
    ],
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
    categories: ['Audit Transformation', 'Strategic Dashboards'],
    duration: '3 months',
    impact: 'Compliance scores comparable across 70+ locations — underperforming sites identified and actioned within audit cycle',
    techStack: ['Python', 'openpyxl', 'Audit Standards'],
    image: '/portfolio_my/images/projects/restaurant-audit/audit-checklist.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/restaurant-audit/compliance-league.png',
        caption: 'Compliance League Table — Top 10 and Bottom 10 Locations. Standardised scoring across 70+ locations gives operations management an objective view of outliers for the first time. 70% minimum threshold enforced.'
      },
      {
        image: '/portfolio_my/images/projects/restaurant-audit/compliance-trend.png',
        caption: 'Compliance Score Trend by Location Quartile — Four Audit Cycles. The bottom quartile improved from 42% to 61% across the programme, driven by targeted remediation tracking and escalating management accountability.'
      }
    ],
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
    duration: '9 months',
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
    categories: ['Enterprise Risk', 'Corporate Governance', 'Strategic Dashboards'],
    duration: '8 months',
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
    duration: '5 months',
    impact: 'Group-wide governance manual adopted by board — covering holding company and all operating subsidiaries',
    techStack: ['Saudi Companies Law', 'IIA Three Lines Model', 'SOCPA Standards', 'King IV', 'Board Governance'],
    image: '/portfolio_my/images/projects/holding-group-governance/governance-framework.svg',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/holding-group-governance/governance-maturity.png',
        caption: 'Corporate Governance Maturity — Pre-Engagement vs Framework Delivered. All eight governance domains lifted from sub-55% baseline to 82–92% post-engagement, aligned to Saudi Companies Law and King IV principles.'
      },
      {
        image: '/portfolio_my/images/projects/holding-group-governance/three-lines-coverage.png',
        caption: 'Three Lines of Defence — Control Activity Coverage. Accountability clearly distributed: Line 1 owns operations and control execution, Line 2 provides GRC oversight, Line 3 delivers independent assurance to the board.'
      }
    ],
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
    duration: '6 weeks',
    impact: 'Audit documentation time cut by ~65% — ICAEW standards embedded automatically, zero manual formatting',
    techStack: ['Python', 'ICAEW Standards', 'Report Automation'],
    image: '/portfolio_my/images/projects/icaew-audit/audit-report.webp',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/icaew-audit/time-savings.png',
        caption: 'Audit Engagement Time — Manual vs Automated Workflow. Workpaper preparation reduced from 18 to 4 hours; report formatting from 12 to 2 hours. Overall 65% reduction in documentation time per engagement.'
      },
      {
        image: '/portfolio_my/images/projects/icaew-audit/testing-coverage.png',
        caption: 'Audit Testing Coverage by Financial Statement Assertion — ICAEW-compliant methodology auto-populated based on audit area and risk level. Coverage improved from 61–75% (manual) to 88–98% (automated system).'
      }
    ],
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
    duration: '10 weeks',
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
    duration: '6 months',
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
    title: 'Whistleblowing Programme — International QSR Leader',
    description: 'An internationally recognised quick service restaurant operator had no formal mechanism for staff to raise concerns — no policy, no channel, no investigation process. Designed and implemented a pragmatic whistleblowing programme from scratch: an email-based reporting channel backed by a written policy, an investigation framework, and organisation-wide training. The programme demonstrated immediate impact — a report submitted through the channel directly led to the discovery of a SAR 12 million fraud within months of launch.',
    categories: ['Corporate Governance', 'Fraud Forensics'],
    duration: '8 weeks',
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
    duration: '6 weeks',
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
  {
    id: 'cae-establishment-tech-unicorn',
    title: 'Internal Audit Function Build-Out — UAE Cloud Kitchen Tech Unicorn',
    description: 'A UAE-based cloud kitchen technology company in hyper-growth pre-IPO mode had no internal audit function, no SOX 404 ICFR framework, and no governance documentation aligned to UAE Corporate Governance Code requirements for listed entities. Joined as Director of Internal Audit and built the function from zero: drafted the audit charter, sourced and onboarded a five-member audit team (plus two information security staff with indirect reporting lines), established the Audit Committee terms of reference aligned to the UAE Code of Corporate Governance, and implemented a full SOX 404 ICFR programme — delivering a clean first-time external audit opinion with zero material weaknesses or significant deficiencies. Ran in parallel with a 340% surge in transaction volumes during the company\'s hyper-growth phase.',
    categories: ['Corporate Governance', 'Audit Transformation'],
    duration: '3 years',
    impact: 'Clean first-time SOX 404 opinion — zero material weaknesses — 7-member audit function built from zero — AED 7.7M total financial impact captured',
    techStack: ['SOX 404 ICFR', 'COSO 2013', 'UAE Corporate Governance Code', 'IIA Standards 2024', 'Python/Pandas', 'Three Lines of Defence', 'Audit Committee ToR'],
    image: '/portfolio_my/images/projects/cae-establishment/function-timeline.png',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/cae-establishment/sox-coverage.png',
        caption: 'SOX 404 ICOFR Process Coverage — 7 key business processes scoped and tested for design and operating effectiveness, delivering a clean first-time external audit opinion with zero material weaknesses.'
      }
    ],
    features: [
      'Audit Charter & Mandate — Internal Audit charter, mission, authority, independence framework, and reporting lines drafted and Audit Committee-approved from day one',
      'Team Build-Out — five audit professionals sourced, onboarded, and developed; two information security staff with indirect reporting lines integrated into the audit programme',
      'Audit Committee Governance — Terms of Reference, meeting cadence, reporting templates, and escalation protocols established aligned to UAE Code of Corporate Governance for listed entities',
      'SOX 404 ICOFR Programme — 7 key business processes scoped; controls designed, documented in Risk Control Matrices, and tested for design and operating effectiveness; clean first-time external audit opinion with zero material weaknesses or significant deficiencies',
      'Tech-Enabled Methodology — proprietary Python/Pandas analytics engine achieving 100% population testing across 7 critical domains, replacing sample-based approach across all audit areas',
      'Continuous Monitoring Suite — automated exception-reporting and predictive transaction monitoring capturing AED 7.7M in total financial impact (AED 3.2M recovered; AED 4.5M protected)',
      'Board-Approved Automation Investment — data-driven business case secured Board approval for enterprise audit automation investment during a hyper-growth pre-IPO phase'
    ]
  },
  {
    id: 'qsr-risk-based-audit-transformation',
    title: 'Risk-Based Audit Transformation — Global QSR Franchise, KSA',
    description: 'The internal audit function of a leading global quick-service restaurant franchise operating across Saudi Arabia was limited to restaurant-level operational and hygiene audits — a compliance-tick approach with no enterprise risk perspective, no formal risk assessment, and a two-person team with limited scope and strategic impact. Brought in as Internal Audit Manager to transform the function: conducted the organisation\'s first enterprise risk assessment, built a risk-based annual audit plan, secured Board and Audit Committee approval for the expanded mandate, and grew the team from two to five professionals. The transformation repositioned internal audit from a restaurant operations checker to a strategic risk assurance function — lifting team utilisation and productivity by 70%.',
    categories: ['Audit Transformation'],
    duration: '2.5 years',
    impact: '70% increase in audit team productivity — team scaled from 2 to 5 — risk-based audit plan board-approved — first enterprise risk assessment completed',
    techStack: ['IIA Standards', 'Risk-Based Audit Planning', 'COSO ERM', 'Audit Committee Reporting', 'Enterprise Risk Assessment'],
    image: '/portfolio_my/images/projects/qsr-transformation/methodology-shift.png',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/qsr-transformation/productivity-gains.png',
        caption: 'Audit Function Growth — team scaled from 2 to 5 professionals and productivity utilisation increased 70% following the shift to risk-based audit planning and a board-approved expanded mandate.'
      }
    ],
    features: [
      'Enterprise Risk Assessment — first-ever risk assessment for the KSA franchise operations; identified and prioritised risks across financial, operational, compliance, and franchise integrity domains',
      'Risk-Based Audit Plan — annual audit plan built on risk assessment outcomes, moving beyond restaurant checklists to strategic audit coverage; plan presented to and approved by Board and Audit Committee',
      'Audit Charter & Mandate Expansion — formal charter drafted defining independence, authority, scope, and reporting lines; mandate elevated from restaurant operations to enterprise-wide risk assurance',
      'Team Growth — recruited and onboarded three additional audit professionals, growing the team from two to five and enabling coverage of strategic audit domains for the first time',
      'Audit Methodology Design — IIA-aligned audit methodology implemented: risk-based planning, fieldwork standards, finding classification, management reporting, and follow-up cadence',
      '70% Productivity Uplift — structured workload allocation, risk-prioritised scheduling, and standardised audit programmes increased team utilisation and output quality across all audit engagements'
    ]
  },
  {
    id: 'group-audit-leadership-ksa-conglomerate',
    title: 'Group Audit Leadership — Saudi Diversified Conglomerate (JSC)',
    description: 'Appointed Group Director of Internal Audit & Risk at a publicly listed Saudi diversified conglomerate spanning F&B, real estate, retail, and hospitality across KSA. The mandate was three-layered: establish a new internal audit function from scratch for the group\'s F&B operations subsidiary; elevate and standardise audit practices across portfolio companies — each with its own Internal Audit Director reporting functionally to the Group; and strengthen audit capability at the holding company level. Held a concurrent seat on the Audit Committee of the restaurant sector subsidiary. Over 5.5 years, scaled the total group-wide audit capability from 3 professionals to 28 across the enterprise, achieved the IIA\'s highest external quality assessment rating ("Generally Conforms"), delivered SAR 4.2M in annual fraud savings, and protected $127M in M&A capital by uncovering SAR 15M in undisclosed litigation during due diligence.',
    categories: ['Corporate Governance', 'Audit Transformation', 'Enterprise Risk'],
    duration: '5.5 years',
    impact: 'IIA "Generally Conforms" rating — 3 to 28 audit professionals — SAR 4.2M annual fraud savings — $127M M&A capital protected — 82% fraud loss reduction',
    techStack: ['COSO ERM 2017', 'Saudi Corporate Governance Regulations', 'IIA Quality Assessment', 'Three Lines of Defence', 'Audit Committee Governance', 'Predictive Analytics', 'SAP GRC'],
    image: '/portfolio_my/images/projects/group-audit-leadership/team-scaling.png',
    additionalScreenshots: [
      {
        image: '/portfolio_my/images/projects/group-audit-leadership/outcomes-dashboard.png',
        caption: 'Group Audit Programme — Key Outcomes across 5.5 years: SAR 4.2M annual fraud savings, $127M M&A capital protected, 82% fraud loss reduction, and 28-person group-wide audit capability. IIA "Generally Conforms" external quality assessment achieved.'
      }
    ],
    features: [
      'F&B Subsidiary Audit Establishment — built internal audit function from zero for the group\'s F&B operations subsidiary: charter, risk assessment, methodology, team, and Board/Audit Committee reporting cadence',
      'Portfolio Company Audit Elevation — led and standardised audit programmes across all portfolio companies through Internal Audit Directors who reported functionally to the Group; coordinated a total portfolio audit team of 25 professionals',
      'Holding Company Audit Strengthening — enhanced scope, methodology, and reporting quality of the holding company audit team; integrated with group-level risk and ERM reporting to the Board',
      'COSO ERM Framework — implemented comprehensive enterprise risk management across the diversified portfolio meeting Saudi Corporate Governance Regulations; risk appetite statement adopted by Board Audit Committee',
      'IIA External Quality Assessment — achieved "Generally Conforms" — the highest rating awarded by the IIA — validating the quality and independence of the group-wide audit function',
      'Fraud Loss Reduction — deployed predictive analytics for high-risk transaction monitoring across the group; 82% reduction in fraud losses generating SAR 4.2M in quantified annual savings',
      'M&A Capital Protection — identified SAR 15M in previously undisclosed litigation exposure during financial and operational due diligence, protecting $127M in committed capital and enabling executive renegotiation of deal terms',
      'Audit Committee Membership — served concurrently as Audit Committee Member for the restaurant sector subsidiary (Feb 2021 – May 2022), bridging board-level oversight and operational audit execution'
    ]
  },
];

const FEATURED_IDS = [
  'fraud-detection-ml',
  'dfm-ipo-readiness',
  'coso-erm-9country',
];
export const featuredProjects = FEATURED_IDS.map(id => projects.find(p => p.id === id)).filter(Boolean);

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
    description: 'Integrated platforms, compliance systems, and board-level reporting tools that give leadership a real-time picture — from audit lifecycle management and multi-location compliance tracking to enterprise risk dashboards and financial reporting.',
  },
];

export function categorySlug(name) {
  const match = categoryMeta.find(c => c.name === name);
  return match ? match.slug : name.toLowerCase().replace(/\s+/g, '-');
}
