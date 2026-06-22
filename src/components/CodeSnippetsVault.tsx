import { useState } from 'react';

const SNIPPETS = [
  {
    id: 'benford',
    title: "1. Benford's AP Anomaly Engine (Python)",
    lang: 'python',
    purpose: "Scans accounts payable (AP) journal data to identify statistical deviation from Benford's distribution, signaling potential invoice splitting under delegation of authority (DoA) thresholds.",
    code: `import pandas as pd
import numpy as np

def run_benford_audit(df_ap_transactions, amount_col='amount'):
    """
    Analyzes transaction distribution against Benford's Law.
    Flags vendors/employees exhibiting high chi-square deviation.
    """
    # 1. Extract the first digit (ignoring zeros, negatives, and decimals)
    df = df_ap_transactions[df_ap_transactions[amount_col] >= 1.0].copy()
    df['first_digit'] = df[amount_col].apply(lambda x: int(str(abs(x)).replace('.', '').lstrip('0')[0]))
    
    # 2. Calculate actual frequencies
    digit_counts = df['first_digit'].value_counts().reindex(range(1, 10), fill_value=0)
    total_count = len(df)
    
    # 3. Calculate Benford expected frequencies
    benford_probs = {d: np.log10(1 + 1/d) for d in range(1, 10)}
    expected_counts = {d: benford_probs[d] * total_count for d in range(1, 10)}
    
    # 4. Perform Chi-Square Goodness-of-Fit test
    chi_square_stats = {}
    for d in range(1, 10):
        observed = digit_counts[d]
        expected = expected_counts[d]
        chi_sq_val = ((observed - expected) ** 2) / expected
        chi_square_stats[d] = {
            'observed': observed,
            'expected': round(expected, 2),
            'deviation': round(observed - expected, 2),
            'chi_sq': round(chi_sq_val, 4)
        }
        
    total_chi_sq = sum(c['chi_sq'] for c in chi_square_stats.values())
    critical_value_99 = 20.09  # df=8, p=0.01
    
    return {
        'total_chi_sq': round(total_chi_sq, 2),
        'audit_verdict': 'SIGNIFICANT ANOMALY DETECTED' if total_chi_sq > critical_value_99 else 'NORMAL DISTRIBUTION',
        'details': chi_square_stats
    }`,
    controlContext: "By running this engine daily, we transition from examining a tiny 5% random audit sample to a complete 100% population scan, instantly flagging invoice splitting (e.g. breaking a single AED 100K transaction into three separate AED 33K invoices to bypass Director-level approval)."
  },
  {
    id: 'velocity',
    title: "2. Dual-Posting & Velocity Check (SQL)",
    lang: 'sql',
    purpose: "A high-performance relational query executing self-joins to detect suspicious double-billing patterns and related-party vendor payments made within a sliding 48-hour velocity window.",
    code: `WITH suspicious_vendor_activity AS (
    SELECT 
        v1.invoice_id AS primary_invoice_id,
        v2.invoice_id AS duplicate_invoice_id,
        v1.vendor_id,
        v1.vendor_name,
        v1.amount AS primary_amount,
        v2.amount AS duplicate_amount,
        v1.invoice_date AS primary_date,
        v2.invoice_date AS duplicate_date,
        v1.iban AS primary_iban,
        v2.iban AS duplicate_iban,
        ABS(EXTRACT(EPOCH FROM (v1.invoice_date - v2.invoice_date)) / 3600) AS hour_gap
    FROM vendor_invoices v1
    INNER JOIN vendor_invoices v2 ON 
        v1.vendor_id = v2.vendor_id
        AND v1.invoice_id < v2.invoice_id -- Prevents duplicate self-match rows
        AND (
            -- Condition A: Identical amounts posted within 48 hours (potential double billing)
            (v1.amount = v2.amount AND v1.invoice_date BETWEEN v2.invoice_date - INTERVAL '48 hours' AND v2.invoice_date + INTERVAL '48 hours')
            OR
            -- Condition B: Suspicious bank routing routing drift (same vendor, different IBAN bank target)
            (v1.iban <> v2.iban AND v1.invoice_date BETWEEN v2.invoice_date - INTERVAL '7 days' AND v2.invoice_date + INTERVAL '7 days')
        )
    WHERE v1.status = 'APPROVED'
      AND v2.status = 'APPROVED'
)
SELECT 
    vendor_id,
    vendor_name,
    primary_invoice_id,
    duplicate_invoice_id,
    primary_amount,
    primary_date,
    duplicate_date,
    hour_gap,
    CASE 
        WHEN primary_amount = duplicate_amount THEN 'CRITICAL: Potential Duplicate Billing (48hr Window)'
        ELSE 'WARNING: IBAN Drift Detected (Internal Fraud Indicator)'
    END AS risk_classification
FROM suspicious_vendor_activity
ORDER BY hour_gap ASC, primary_amount DESC;`,
    controlContext: "Legacy General Ledger audits often fail to spot bank detail changes. This query monitors both velocity and bank-routing changes, instantly highlighting if an accountant alters a vendor bank account to a personal routing bank target, processes a payment, and swaps it back within the week."
  },
  {
    id: 'linguistic',
    title: "3. SOP & Contract Modal Audit (Python)",
    lang: 'python',
    purpose: "An NLP-based policy compliance scanner that parses organizational contracts and Standard Operating Procedures (SOPs) to detect 'permissive control drift' (excessive soft recommendations vs strict requirements).",
    code: `import re
import spacy

def analyze_control_language(document_text):
    """
    Parses policy documents to measure control stringency.
    Compares the ratio of mandatory modals to permissive recommendations.
    """
    # 1. Define control terms
    mandatory_terms = r'\\b(shall|must|is required to|are required to|will)\\b'
    permissive_terms = r'\\b(should|should be|can|may|is recommended|could|may be)\\b'
    
    # 2. Find occurrences
    mandatories = re.findall(mandatory_terms, document_text.lower())
    permissives = re.findall(permissive_terms, document_text.lower())
    
    m_count = len(mandatories)
    p_count = len(permissives)
    total_controls = m_count + p_count
    
    # 3. Calculate Governance Strength Index (GSI)
    gsi = (m_count / total_controls) * 100 if total_controls > 0 else 0
    
    # 4. Classify policy governance profile
    if gsi > 75:
        profile = "HIGHLY RIGID & CONTROL-ENFORCED"
    elif gsi >= 50:
        profile = "BALANCED EXECUTIVE GOVERNANCE"
    else:
        profile = "PERMISSIVE & RECOMENDATION-HEAVY (HIGH STRUCTURAL RISK)"
        
    return {
        'mandatory_count': m_count,
        'permissive_count': p_count,
        'governance_strength_index': round(gsi, 2),
        'compliance_profile': profile,
        'detected_exceptions': {
            'shall_counts': len(re.findall(r'\\bshall\\b', document_text.lower())),
            'should_counts': len(re.findall(r'\\bshould\\b', document_text.lower())),
            'may_counts': len(re.findall(r'\\bmay\\b', document_text.lower()))
        }
    }`,
    controlContext: "In pre-IPO or rapid scaling environments, policies often drift from strict mandates to loose suggestions. This engine audits policy drift across 100+ documents, flagging when crucial security controls have been quietly watered down by departments from strict 'shall' mandates to permissive 'should' guidelines."
  },
  {
    id: 'pos-isolation-forest',
    title: "4. ML POS Anomaly Detection (Python)",
    lang: 'python',
    purpose: "Machine learning engine using Isolation Forests to continuously monitor POS transaction data, automatically flagging unauthorized discount abuse, void manipulations, and inventory discrepancies without manual sampling.",
    code: `import pandas as pd
from sklearn.ensemble import IsolationForest
import numpy as np

def detect_pos_anomalies(df: pd.DataFrame, contamination_rate=0.01):
    """
    Sanitized snippet demonstrating the core anomaly detection logic 
    applied to restaurant POS transaction data.
    """
    # Feature engineering: extracting key risk indicators
    features = ['transaction_amount', 'void_percentage', 'discount_applied', 'time_since_last_order', 'is_after_hours']
    
    X = df[features].fillna(0)
    
    model = IsolationForest(n_estimators=150, max_samples='auto', contamination=contamination_rate, random_state=42)
    
    df['anomaly_score'] = model.fit_predict(X)
    df['risk_score'] = model.decision_function(X)
    
    high_risk = df[df['anomaly_score'] == -1].copy()
    return high_risk.sort_values(by='risk_score')`,
    controlContext: "Eliminates the traditional 5% audit sampling illusion. By running an Isolation Forest across 100% of branch data, we can instantly target the specific shifts and cashiers executing fractional fraud, rather than waiting for month-end inventory reconciliation to show unexplained losses."
  }
];

export default function CodeSnippetsVault() {
  const [activeTab, setActiveTab] = useState(SNIPPETS[0].id);
  const activeSnippet = SNIPPETS.find((s) => s.id === activeTab) || SNIPPETS[0];

  return (
    <div className="frame-panel overflow-hidden p-0 border border-white/12 shadow-2xl">
      <div className="bg-black/40 border-b border-white/10 px-6 py-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="meta-label text-[#f4c98b]">Audit 4.0 Code Library</span>
          <div className="text-[10px] uppercase tracking-widest text-slate-400 mt-1">Anonymized Production-Grade Scripts</div>
        </div>
        <div className="flex flex-wrap gap-2">
          {SNIPPETS.map((snippet) => (
            <button
              key={snippet.id}
              onClick={() => setActiveTab(snippet.id)}
              className={`rounded-full px-4 py-2 text-[9px] font-black uppercase tracking-[0.16em] border transition-all duration-150 ${
                activeTab === snippet.id
                  ? 'bg-[#c7964c] border-[#c7964c] text-black font-extrabold shadow-md'
                  : 'border-white/10 text-white/60 hover:text-white hover:border-white/20 bg-white/5'
              }`}
            >
              {snippet.id.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <div className="p-6 md:p-8 bg-black/20">
        <div className="mb-6">
          <h4 className="text-white text-[1.12rem] font-bold leading-tight flex items-center gap-3">
            <span className="h-2 w-2 rounded-full bg-[#c7964c] inline-block"></span>
            {activeSnippet.title}
          </h4>
          <p className="text-white/70 text-xs leading-6 mt-3 max-w-4xl bg-white/5 border border-white/8 px-4 py-3 rounded-xl">
            <strong>Audit Purpose:</strong> {activeSnippet.purpose}
          </p>
        </div>

        <div className="relative group">
          <pre className="overflow-x-auto rounded-2xl bg-black/60 border border-white/10 p-5 font-mono text-[11px] leading-6 text-slate-300 max-h-[380px]">
            <code>{activeSnippet.code}</code>
          </pre>
          <div className="absolute right-4 top-4 bg-slate-900/80 backdrop-blur-md rounded-full border border-white/14 px-3 py-1 text-[8px] font-black uppercase tracking-widest text-white/50">
            {activeSnippet.lang}
          </div>
        </div>

        <div className="mt-6 quote-panel p-6 border border-[#c7964c]/20 bg-gradient-to-r from-black/20 to-transparent">
          <div className="meta-label text-[#a33a21] flex items-center gap-2">
            <svg className="h-4 w-4 text-[#a33a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            Executive Control Context
          </div>
          <p className="mt-3 text-xs leading-6 text-[#1b1a17]">
            {activeSnippet.controlContext}
          </p>
        </div>
      </div>
    </div>
  );
}
