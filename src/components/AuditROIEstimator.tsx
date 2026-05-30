import { useState } from 'react';

const INDUSTRIES = [
  { id: 'fnb', label: "F&B, QSR & Retail", leakageRate: 0.022, desc: "Inventory leakage, POS vendor matching errors, supplier double-billing, and logistics overcharges." },
  { id: 'realestate', label: "Real Estate & Capex", leakageRate: 0.028, desc: "Contractor pricing padding, CAPEX project milestones variance, duplicate materials billings, and compliance slippage." },
  { id: 'conglomerate', label: "Diversified Conglomerates", leakageRate: 0.018, desc: "Process fragmentation, treasury reconciliation gaps, related-party supplier overlaps, and legacy payroll slippage." },
  { id: 'tech', label: "Technology & SaaS Platforms", leakageRate: 0.015, desc: "Subscription billing anomalies, third-party payment gateways reconciliation drift, and redundant cloud asset allocations." }
];

export default function AuditROIEstimator() {
  const [revenue, setRevenue] = useState(100); // In Millions USD/AED
  const [transactions, setTransactions] = useState(150); // In Thousands
  const [selectedIndustry, setSelectedIndustry] = useState('fnb');

  const industry = INDUSTRIES.find(i => i.id === selectedIndustry) || INDUSTRIES[0];
  
  // Calculate Leakage and Recovery
  const rawLeakageRate = industry.leakageRate;
  
  // Adjusted by transaction density (higher transactions = higher matching error rate)
  const transactionFactor = Math.min(1.2, 0.8 + (transactions / 500) * 0.4);
  const finalLeakageRate = rawLeakageRate * transactionFactor;
  
  const estimatedLeakage = revenue * finalLeakageRate; // In Millions
  const legacySamplingDetection = estimatedLeakage * 0.05; // Legacy only detects 5% due to sampling limits
  
  const populationTestingDetection = estimatedLeakage * 0.85; // Majid's 100% population scan catches 85%
  const cashRecoverable = populationTestingDetection * 0.55; // Reclaiming 55% of leaks
  const controlSavings = populationTestingDetection * 0.45; // Preventing 45% future leakage via continuous checks
  const totalAuditImpact = cashRecoverable + controlSavings;
  
  const formatCurrency = (val: number) => {
    // Returns beautifully formatted Millions or Thousands
    if (val >= 1.0) {
      return `${(val).toFixed(2)}M`;
    } else {
      return `${(val * 1000).toFixed(0)}K`;
    }
  };

  return (
    <div className="mx-auto max-w-5xl">
      <div className="grid gap-6 lg:grid-cols-[1fr_1.1fr]">
        
        {/* INPUTS COLUMN */}
        <div className="soft-shell p-6 md:p-8 flex flex-col justify-between">
          <div>
            <span className="eyebrow-label">Operational Parameters</span>
            <h3 className="mt-4 text-2xl text-[#181511]">Map your risk exposure.</h3>
            <p className="mt-3 text-xs leading-6 text-[color:var(--text-secondary)]">
              Input the annual scale of your business. The calculator applies global forensic baselines modified by transaction velocity to estimate revenue protection margins.
            </p>
            <div className="luxury-divider mt-6 mb-6"></div>

            {/* Industry Selector */}
            <div className="mb-6">
              <label className="meta-label text-[#a33a21] block mb-3">Industry & Operating Domain</label>
              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                {INDUSTRIES.map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => setSelectedIndustry(ind.id)}
                    className={`text-left rounded-xl p-3 border text-[11px] leading-5 transition-all duration-150 ${
                      selectedIndustry === ind.id
                        ? 'border-[#a33a21] bg-[#a33a21]/5 text-[#181511] font-bold'
                        : 'border-slate-200 bg-white/40 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-2.5 leading-relaxed italic">
                {industry.desc}
              </p>
            </div>

            {/* Revenue Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="meta-label text-[#a33a21]">Annual Revenue Scale</label>
                <span className="text-sm font-black text-[#181511]">{revenue} Million USD/AED</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={revenue}
                onChange={(e) => setRevenue(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#a33a21]"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                <span>10M</span>
                <span>500M</span>
                <span>1B+</span>
              </div>
            </div>

            {/* Transaction Slider */}
            <div className="mb-6">
              <div className="flex justify-between items-center mb-2">
                <label className="meta-label text-[#a33a21]">Annual Transaction Volume</label>
                <span className="text-sm font-black text-[#181511]">{transactions}K Invoices / Billing cycles</span>
              </div>
              <input
                type="range"
                min="10"
                max="1000"
                step="10"
                value={transactions}
                onChange={(e) => setTransactions(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-[#a33a21]"
              />
              <div className="flex justify-between text-[9px] font-bold text-slate-400 mt-1">
                <span>10K</span>
                <span>500K</span>
                <span>1M+</span>
              </div>
            </div>
          </div>

          <div className="quote-panel p-5 mt-6 border border-slate-200 bg-white/30">
            <div className="text-[10px] font-bold text-[#1d3557] uppercase tracking-widest">Statistical Sample Limit</div>
            <p className="text-[11px] leading-5 text-slate-600 mt-2">
              Legacy audit testing relies on manual sampling (checking 100 to 500 invoices). For high-volume companies, this is the equivalent of checking less than <strong>0.5%</strong> of transactions, leaving <strong>99.5%</strong> of potential fraud unexamined.
            </p>
          </div>
        </div>

        {/* RESULTS COLUMN */}
        <div className="editorial-panel p-6 md:p-8 text-white flex flex-col justify-between">
          <div>
            <span className="hero-chip mb-6 bg-white/10 border-white/15">Board-Grade Summary Report</span>
            
            <div className="mb-6">
              <div className="text-[9px] font-black uppercase tracking-[0.24em] text-white/50">Estimated Annual Revenue Leakage</div>
              <div className="text-4xl md:text-5xl font-black text-[#f4c98b] tracking-tighter mt-1">
                {formatCurrency(estimatedLeakage)}
              </div>
              <p className="text-[11px] leading-5 text-white/70 mt-3">
                Industry-adjusted leak factor of <strong>{(finalLeakageRate * 100).toFixed(2)}%</strong> applied. This represents capital lost to duplicates, POS variances, manual routing inefficiencies, and vendor billing drift.
              </p>
            </div>

            <div className="h-px bg-white/12 my-6"></div>

            {/* Audit Transformation Impacts */}
            <div className="grid grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45 block">1. Direct Cash Recovery</span>
                <strong className="text-xl md:text-2xl font-black text-white block mt-1">{formatCurrency(cashRecoverable)}</strong>
                <p className="text-[9px] text-white/60 leading-relaxed mt-2">Recovered duplicate payments & vendor overbillings.</p>
              </div>
              <div className="rounded-2xl bg-white/5 border border-white/8 p-4">
                <span className="text-[8px] font-black uppercase tracking-[0.2em] text-white/45 block">2. Future Risk Prevention</span>
                <strong className="text-xl md:text-2xl font-black text-white block mt-1">{formatCurrency(controlSavings)}</strong>
                <p className="text-[9px] text-white/60 leading-relaxed mt-2">Systemic leakage blocked via automated daily checks.</p>
              </div>
            </div>

            <div className="h-px bg-white/12 my-6"></div>

            {/* Total audit impact */}
            <div className="rounded-2xl bg-[#c7964c]/10 border border-[#c7964c]/30 px-5 py-4 flex items-center justify-between">
              <div>
                <span className="text-[8px] font-black uppercase tracking-[0.22em] text-[#f4c98b] block">Total Financial Impact (Savings + Recovery)</span>
                <strong className="text-2xl font-black text-white block mt-1">{formatCurrency(totalAuditImpact)}</strong>
              </div>
              <div className="text-right shrink-0">
                <span className="rounded-full bg-[#f4c98b] text-black font-black text-[9px] uppercase tracking-widest px-3 py-1">
                  majids model
                </span>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-white/10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="text-left">
              <div className="text-[8px] font-black uppercase tracking-[0.24em] text-white/40">Secure Board Mandate</div>
              <div className="text-xs font-semibold text-white/80 mt-1">AED 7.7M secured in single Kitopi role</div>
            </div>
            <a href="/portfolio_my/contact/" className="btn-primary bg-gradient-to-r from-[#c7964c] to-[#a66c1c] text-black !font-black !shadow-[0_12px_24px_rgba(199,150,76,0.18)] self-start sm:self-auto">
              Discuss Audit Setup
            </a>
          </div>
        </div>
        
      </div>

      {/* METRIC COMPARISON TABLE */}
      <div className="soft-shell mt-6 p-6 md:p-8">
        <span className="meta-label text-[#a33a21]">Assurance Model Comparison</span>
        <h4 className="text-xl text-[#181511] mt-3">Statistical Sampling vs. 100% Population Scan</h4>
        
        <div className="overflow-x-auto mt-6">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="pb-3 meta-label text-[#181511]">Assurance Metric</th>
                <th className="pb-3 meta-label text-slate-400">Legacy Sampling (5% Check)</th>
                <th className="pb-3 meta-label text-[#a33a21]">Majid's 100% Population Scan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              <tr>
                <td className="py-4 text-[#181511] font-semibold">Testing Method</td>
                <td className="py-4 text-slate-500">Checking a tiny slice of data (100–500 manual lines)</td>
                <td className="py-4 text-[#a33a21] font-bold">Continuous script-based check of the entire journal volume</td>
              </tr>
              <tr>
                <td className="py-4 text-[#181511] font-semibold">Audit Visibility</td>
                <td className="py-4 text-slate-500">0.5% — 5% (Blind to the remaining 95%+)</td>
                <td className="py-4 text-[#a33a21] font-bold">100.00% absolute exposure scan</td>
              </tr>
              <tr>
                <td className="py-4 text-[#181511] font-semibold">Detected Exposure</td>
                <td className="py-4 text-slate-500">{formatCurrency(legacySamplingDetection)} *(detected by chance)*</td>
                <td className="py-4 text-[#a33a21] font-bold">{formatCurrency(populationTestingDetection)} *(systematically flagged)*</td>
              </tr>
              <tr>
                <td className="py-4 text-[#181511] font-semibold">Board Level Value</td>
                <td className="py-4 text-slate-500">Subjective comfort / checklist compliance reporting</td>
                <td className="py-4 text-[#a33a21] font-bold">Quantifiable cash recovery and profit-protection outcomes</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
