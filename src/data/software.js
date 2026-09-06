export const software = [
  {
    id: 'auditdesk',
    name: 'AuditDesk',
    tagline: 'Privacy-first, zero-dependency fieldwork & forensic workbench for internal auditors.',
    description: 'A modular, high-performance command-line and local workbench built to replace fragile audit spreadsheets. Conducts 100% population computer-assisted audit techniques (CAATs), statistical AICPA sampling, and generates standardized IIA-aligned working papers without external cloud dependencies.',
    category: 'Fieldwork Workbench',
    techStack: ['Python', 'Polars', 'CLI', 'Markdown Engine'],
    githubUrl: 'https://github.com/majidrajpar/auditdesk',
    isPublic: true,
    status: 'Production / Open Source',
    keyFeatures: [
      '100% population substantive testing replacing manual 25-sample substantive testing',
      'AICPA-compliant monetary-unit and classical variables sampling calculation',
      'Deterministic working paper generation structured for IIA Standard 2300',
      'Zero-telemetry local execution ensuring full compliance with GDPR and banking secrecy'
    ]
  },
  {
    id: 'thirdeye-vendor-risk',
    name: 'ThirdEye: Vendor Risk Scanner',
    tagline: 'AI-assisted vendor intelligence and accounts payable anomaly detection.',
    description: 'Automated forensic scanner designed for internal audit and risk management teams to uncover hidden procurement risks across high-volume ERP transaction data. Detects potential shell vendors, employee-vendor address conflicts, bank account alterations, and split-invoice purchase order circumventions.',
    category: 'Forensic Analytics',
    techStack: ['Python', 'Pandas', 'Scikit-Learn', 'Fuzzy Matching'],
    githubUrl: 'https://github.com/majidrajpar/thirdeye-vendor-risk',
    isPublic: true,
    status: 'Production / Open Source',
    keyFeatures: [
      'Automated cross-matching between vendor master records and payroll databases',
      'Segregation of duties (SOD) conflict discovery in requisition-to-check workflows',
      'Sequential invoice clustering to identify purchase order threshold splitting',
      'Exportable audit finding summaries mapped against COSO control deficiencies'
    ]
  },
  {
    id: 'corporate-whistleblower-lite',
    name: 'Corporate Whistleblower Lite',
    tagline: 'Lightweight, self-hosted corporate whistleblowing intake platform with end-to-end anonymity.',
    description: 'A sovereign, self-hosted ethics intake platform engineered for enterprises that require a secure reporting channel without routing sensitive disclosures through third-party multi-tenant SaaS providers. Features encrypted intake tokens, role-based investigator access, and Audit Committee briefing exports.',
    category: 'Compliance & Ethics',
    techStack: ['TypeScript', 'Node.js', 'Docker', 'SQLite / PostgreSQL'],
    githubUrl: 'https://github.com/majidrajpar/corporate-whistleblower-lite',
    isPublic: true,
    status: 'Production / Open Source',
    keyFeatures: [
      'Cryptographically secure two-way anonymous dialogue for whistleblower intake',
      'Self-contained Docker container deployment requiring zero ongoing cloud licenses',
      'Role-based triage interface routing disclosures directly to Audit Committee chairs',
      'Audit log immutability ensuring tamper-evident investigation record tracking'
    ]
  },
  {
    id: 'roleforge',
    name: 'RoleForge: Audit Agent Architecture',
    tagline: '31 production-grade agentic roles for CrewAI, LangChain, and LangGraph.',
    description: 'A comprehensive library of hardened agent specifications designed for complex governance, risk, and internal audit automation. Bridges the gap between generic LLM prompts and deterministic, audit-standard execution traces across forensic investigation and compliance review.',
    category: 'Agentic Frameworks',
    techStack: ['Python', 'LangGraph', 'CrewAI', 'LangChain'],
    githubUrl: 'https://github.com/majidrajpar/roleforge',
    internalUrl: '/roleforge/',
    isPublic: true,
    status: 'Production / Platform',
    keyFeatures: [
      'Hardened system prompts with few-shot reasoning for audit finding severity classification',
      'Pre-configured multi-agent roles: Risk Assessor, Forensic Analyst, and CAE Synthesizer',
      'Standardized schema definitions ensuring verifiable JSON / Markdown deliverable structures',
      'Benchmarked against international accounting scandal case studies'
    ]
  },
  {
    id: 'auditpatterns',
    name: 'AuditPatterns',
    tagline: 'Explainable population triage and anomaly clustering for internal auditors.',
    description: 'The algorithmic triage layer engineered to sit directly upstream of audit verification. Ingests full transaction populations, applies unsupervised anomaly clustering, and ranks high-risk sub-populations with deterministic explanations before substantive audit sampling begins.',
    category: 'Audit Intelligence',
    techStack: ['Python', 'Isolation Forest', 'Polars', 'Vector Triage'],
    githubUrl: 'https://github.com/majidrajpar/auditpatterns',
    isPublic: false,
    status: 'Private / Advisory Access',
    keyFeatures: [
      'Unsupervised population triage isolating multi-dimensional outlier clusters',
      'Rule-assisted isolation trees preventing black-box opacity in working papers',
      'Direct integration with AuditDesk fieldwork working paper pipelines',
      'Available under confidential retained advisory engagements and enterprise advisory'
    ]
  }
];
