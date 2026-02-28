import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ClipboardList,
  ClipboardCheck,
  Plus,
  RotateCcw,
  CheckSquare,
  Square,
  Tag,
  Copy,
  Check,
  ShieldCheck,
  TrendingUp,
  Settings,
  Monitor,
  Search,
} from 'lucide-react';

// ─── CONSTANTS ────────────────────────────────────────────────────────────────

const PRIMARY = '#001F5B';

const AUDIT_TEMPLATES = {
  financial: {
    label: 'Financial Audit',
    icon: TrendingUp,
    items: [
      'Verify opening balances agree to prior year audited financials',
      'Confirm all bank accounts are included and reconciled',
      'Test accounts receivable aging — identify overdue balances > 90 days',
      'Confirm revenue recognition policies comply with IFRS 15',
      'Test cut-off for revenue and expenses at period end',
      'Verify accounts payable completeness — unrecorded liabilities test',
      'Review journal entries for unusual or manual postings',
      'Test fixed asset additions and disposals against supporting documentation',
      'Confirm depreciation rates applied are consistent with policy',
      'Review related-party transactions for disclosure and arm\'s length pricing',
      'Test payroll — agree headcount to HR records, verify rates',
      'Confirm provisions and accruals are adequately supported',
      'Test prepayments — verify period allocation and recoverability',
      'Review intercompany balances and confirm elimination at group level',
      'Verify inventory count procedures and agree to financial records',
      'Confirm tax liabilities are accurately computed and disclosed',
      'Review foreign currency translation and revaluation entries',
      'Verify management representations are obtained and signed',
    ],
  },
  compliance: {
    label: 'Compliance Audit',
    icon: ShieldCheck,
    items: [
      'Confirm all required operating licences are current and displayed',
      'Verify regulatory filings are submitted within required deadlines',
      'Test policy acknowledgement records — all employees signed current versions',
      'Review data protection compliance — PDPL / GDPR / UAE Privacy Law',
      'Confirm anti-money laundering (AML) controls are documented and tested',
      'Verify health and safety inspections are conducted per schedule',
      'Test whistleblowing mechanism — accessible, anonymous, and actioned',
      'Review contracts for regulatory compliance clauses',
      'Confirm VAT / tax filings are accurate and timely submitted',
      'Verify employee background checks are completed for sensitive roles',
      'Review third-party / vendor due diligence records',
      'Confirm conflicts of interest declarations are current',
      'Test Delegation of Authority — approvals match matrix limits',
      'Verify mandatory training completion rates (compliance, ethics, cybersecurity)',
      'Review advertising and marketing materials for regulatory compliance',
      'Confirm board minutes are maintained and resolutions properly recorded',
    ],
  },
  operational: {
    label: 'Operational Audit',
    icon: Settings,
    items: [
      'Map end-to-end process flows and identify control gaps',
      'Test authorisation controls — verify approvals match DoA policy',
      'Review procurement cycle — requisition to payment controls',
      'Test vendor selection and approval procedures',
      'Verify three-way matching (PO / GRN / Invoice) is consistently applied',
      'Review inventory management — ordering, receiving, and count procedures',
      'Test asset custody and physical security arrangements',
      'Confirm service level agreements are monitored and reported',
      'Review capacity utilisation and efficiency metrics',
      'Test wastage controls and reconciliation to standards',
      'Verify cash handling procedures — counts, reconciliations, segregation',
      'Review customer complaint and escalation handling procedures',
      'Test IT system access aligned to job roles (least privilege)',
      'Confirm business continuity plans are current and tested',
      'Review key man dependency risks and succession plans',
      'Verify KPIs are tracked, reported, and actioned',
      'Test management reporting accuracy against source systems',
    ],
  },
  it: {
    label: 'IT / ITGC Audit',
    icon: Monitor,
    items: [
      'Review user access provisioning and de-provisioning procedures',
      'Test privileged access — confirm admin accounts are minimised and logged',
      'Verify terminated employee access is revoked within 24 hours of departure',
      'Test password policies — complexity, length, rotation enforcement',
      'Review change management process — all changes approved, tested, documented',
      'Confirm production changes cannot be made without CAB approval',
      'Test backup procedures — frequency, offsite storage, restoration testing',
      'Verify disaster recovery plan is documented and tested annually',
      'Review incident management — logging, escalation, and resolution tracking',
      'Confirm patch management — critical patches applied within SLA',
      'Test network segmentation and firewall rule review process',
      'Review data encryption — at rest and in transit',
      'Verify audit logs are enabled, retained, and protected from tampering',
      'Test physical data centre access controls and visitor logs',
      'Review third-party / cloud vendor security assessments',
      'Confirm IT security awareness training completion rates',
    ],
  },
  fraud: {
    label: 'Fraud Audit',
    icon: Search,
    items: [
      'Run Benford\'s Law analysis on transactions — flag first-digit anomalies',
      'Test vendor master file — identify duplicate names, addresses, bank accounts',
      'Review ghost employee test — agree payroll to HR active headcount',
      'Analyse management override of controls — journal entries without approval',
      'Test expense claims — verify receipts, approvals, and policy compliance',
      'Review cash advances and petty cash — reconciliation and supporting docs',
      'Test procurement for split purchase orders below approval thresholds',
      'Identify related-party vendors — screen against employee / director lists',
      'Review concession and void transactions for unusual patterns',
      'Test inventory shrinkage rates against benchmarks — investigate outliers',
      'Verify conflicts of interest declarations for procurement staff',
      'Test access controls for financial systems — segregation of duties matrix',
      'Review contracts awarded without competitive tender — document justification',
      'Analyse refund transactions — timing, authorisation, and amounts',
      'Confirm all fraud incidents are reported, investigated, and logged',
    ],
  },
};

// ─── HELPERS ──────────────────────────────────────────────────────────────────

function buildItems(templateKey) {
  return AUDIT_TEMPLATES[templateKey].items.map((text, idx) => ({
    id: `${templateKey}-${idx}`,
    text,
    checked: false,
    custom: false,
  }));
}

function formatChecklist(auditType, items) {
  const template = AUDIT_TEMPLATES[auditType];
  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  const now = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const divider = '─────────────────────────────';
  const header = [
    `${template.label.toUpperCase()} CHECKLIST`,
    `Generated: ${now}`,
    `Completion: ${done}/${total} items (${pct}%)`,
    divider,
  ].join('\n');

  const standardItems = items.filter((i) => !i.custom);
  const customItems = items.filter((i) => i.custom);

  const renderItem = (item) => `${item.checked ? '✓' : '☐'} ${item.text}`;

  const lines = [
    header,
    ...standardItems.map(renderItem),
  ];

  if (customItems.length > 0) {
    lines.push('');
    lines.push('─── Custom Items ───');
    lines.push(...customItems.map(renderItem));
  }

  lines.push('');
  lines.push('Prepared using Majid Mumtaz Audit Intelligence Tools');

  return lines.join('\n');
}

// ─── SUB-COMPONENTS ───────────────────────────────────────────────────────────

function TypeButton({ typeKey, template, active, onClick }) {
  const Icon = template.icon;
  return (
    <button
      onClick={() => onClick(typeKey)}
      style={
        active
          ? { backgroundColor: PRIMARY, color: '#fff', borderColor: PRIMARY }
          : { backgroundColor: '#fff', color: '#334155', borderColor: '#e2e8f0' }
      }
      className="flex items-center gap-2 px-4 py-2.5 border text-sm font-medium transition-all duration-150 focus:outline-none"
    >
      <Icon size={15} />
      {template.label}
    </button>
  );
}

function ChecklistItem({ item, onToggle, index }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.2, delay: index * 0.03 }}
      className="flex items-start gap-3 py-2.5 border-b border-slate-100 last:border-0"
    >
      <button
        onClick={() => onToggle(item.id)}
        className="mt-0.5 shrink-0 focus:outline-none"
        aria-label={item.checked ? 'Uncheck item' : 'Check item'}
      >
        {item.checked ? (
          <CheckSquare size={18} style={{ color: PRIMARY }} />
        ) : (
          <Square size={18} className="text-slate-300" />
        )}
      </button>
      <span
        className={`flex-1 text-sm leading-snug transition-all duration-150 ${
          item.checked ? 'text-slate-400 line-through' : 'text-slate-700'
        }`}
      >
        {item.text}
      </span>
      {item.custom && (
        <span
          className="shrink-0 flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 border"
          style={{ color: PRIMARY, borderColor: PRIMARY, backgroundColor: '#f0f4ff' }}
        >
          <Tag size={10} />
          Custom
        </span>
      )}
    </motion.div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────────────

export default function AuditChecklist() {
  const [auditType, setAuditType] = useState(null);
  const [items, setItems] = useState([]);
  const [customText, setCustomText] = useState('');
  const [copied, setCopied] = useState(false);

  function handleSelectType(typeKey) {
    setAuditType(typeKey);
    setItems(buildItems(typeKey));
    setCustomText('');
    setCopied(false);
  }

  function handleReset() {
    setAuditType(null);
    setItems([]);
    setCustomText('');
    setCopied(false);
  }

  function handleToggle(id) {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item))
    );
  }

  function handleAddCustom() {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setItems((prev) => [
      ...prev,
      { id: Date.now(), text: trimmed, checked: false, custom: true },
    ]);
    setCustomText('');
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter') handleAddCustom();
  }

  function handleCopy() {
    const text = formatChecklist(auditType, items);
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  }

  const total = items.length;
  const done = items.filter((i) => i.checked).length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  return (
    <div className="w-full max-w-2xl mx-auto font-sans">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div
          className="flex items-center justify-center w-10 h-10"
          style={{ backgroundColor: PRIMARY }}
        >
          <ClipboardList size={20} color="#fff" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-slate-900 leading-tight">
            Audit Checklist Generator
          </h2>
          <p className="text-xs text-slate-500">
            Select an audit type to generate a professional checklist
          </p>
        </div>
      </div>

      {/* Step 1 — Type selector */}
      <div className="flex flex-wrap gap-2 mb-6">
        {Object.entries(AUDIT_TEMPLATES).map(([key, template]) => (
          <TypeButton
            key={key}
            typeKey={key}
            template={template}
            active={auditType === key}
            onClick={handleSelectType}
          />
        ))}
      </div>

      {/* Step 2 — Checklist */}
      <AnimatePresence mode="wait">
        {auditType && (
          <motion.div
            key={auditType}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
          >
            {/* Progress bar */}
            <div className="mb-5">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-xs font-semibold text-slate-600 uppercase tracking-wide">
                  Progress
                </span>
                <span className="text-xs font-medium text-slate-500">
                  {done} of {total} complete — {pct}%
                </span>
              </div>
              <div className="h-2 w-full bg-slate-100 border border-slate-200">
                <motion.div
                  className="h-full"
                  style={{ backgroundColor: PRIMARY }}
                  initial={{ width: 0 }}
                  animate={{ width: `${pct}%` }}
                  transition={{ duration: 0.35, ease: 'easeOut' }}
                />
              </div>
            </div>

            {/* Item list */}
            <div className="border border-slate-200 bg-white mb-4">
              <div
                className="px-4 py-2.5 text-xs font-semibold uppercase tracking-widest text-white"
                style={{ backgroundColor: PRIMARY }}
              >
                {AUDIT_TEMPLATES[auditType].label} — {total} Items
              </div>
              <div className="px-4 py-1">
                {items.map((item, idx) => (
                  <ChecklistItem
                    key={item.id}
                    item={item}
                    onToggle={handleToggle}
                    index={idx}
                  />
                ))}
              </div>
            </div>

            {/* Add custom item */}
            <div className="flex gap-2 mb-4">
              <input
                type="text"
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Add a custom checklist item..."
                className="flex-1 px-3 py-2 text-sm border border-slate-200 bg-white text-slate-800 placeholder-slate-400 focus:outline-none focus:border-slate-400"
              />
              <button
                onClick={handleAddCustom}
                disabled={!customText.trim()}
                style={
                  customText.trim()
                    ? { backgroundColor: PRIMARY, color: '#fff' }
                    : { backgroundColor: '#f1f5f9', color: '#94a3b8' }
                }
                className="flex items-center gap-1.5 px-4 py-2 text-sm font-medium transition-colors duration-150 focus:outline-none disabled:cursor-not-allowed"
              >
                <Plus size={14} />
                Add
              </button>
            </div>

            {/* Actions row */}
            <div className="flex items-center justify-between">
              <button
                onClick={handleReset}
                className="flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-800 transition-colors duration-150 focus:outline-none"
              >
                <RotateCcw size={13} />
                Change Audit Type
              </button>

              <button
                onClick={handleCopy}
                style={{ backgroundColor: copied ? '#16a34a' : PRIMARY, color: '#fff' }}
                className="flex items-center gap-2 px-4 py-2 text-sm font-medium transition-all duration-200 focus:outline-none"
              >
                {copied ? (
                  <>
                    <Check size={14} />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy size={14} />
                    Copy Checklist
                  </>
                )}
              </button>
            </div>

            {/* Completion badge */}
            {done === total && total > 0 && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4 flex items-center gap-2 px-4 py-3 border border-green-200 bg-green-50"
              >
                <ClipboardCheck size={16} className="text-green-700 shrink-0" />
                <p className="text-sm font-medium text-green-800">
                  All {total} items complete. Checklist is ready to copy and file.
                </p>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Privacy notice */}
      <p className="mt-6 text-xs text-slate-400 border-t border-slate-100 pt-4">
        This tool operates entirely in your browser. No data is transmitted or stored
        externally. Generated checklists are for professional guidance only and should be
        adapted to your specific engagement scope and applicable standards.
      </p>
    </div>
  );
}
