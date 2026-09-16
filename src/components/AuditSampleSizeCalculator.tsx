import React, { useState } from 'react';
import { Calculator, Download, RotateCcw, AlertTriangle, ShieldCheck } from 'lucide-react';

export default function AuditSampleSizeCalculator() {
  const [population, setPopulation] = useState<number>(5000);
  const [confidence, setConfidence] = useState<number>(95);
  const [tolerableRate, setTolerableRate] = useState<number>(5);
  const [expectedRate, setExpectedRate] = useState<number>(1);

  // Z-scores for standard audit confidence levels
  const zScores: Record<number, number> = {
    90: 1.645,
    95: 1.960,
    99: 2.576,
  };

  const calculateSample = () => {
    const z = zScores[confidence] || 1.96;
    const p = expectedRate > 0 ? expectedRate / 100 : 0.02; // Conservative standard if zero
    const e = tolerableRate / 100;

    // Standard formula: n = (Z^2 * p * (1-p)) / e^2
    let n = (Math.pow(z, 2) * p * (1 - p)) / Math.pow(e, 2);

    // Finite Population Correction (FPC)
    if (population > 0 && n > 0) {
      n = n / (1 + (n - 1) / population);
    }

    return Math.min(population, Math.max(1, Math.ceil(n)));
  };

  const sampleSize = calculateSample();
  const coveragePercent = population > 0 ? ((sampleSize / population) * 100).toFixed(2) : '0';
  const samplingRisk = 100 - confidence;

  const exportCSV = () => {
    const headers = ['Audit Sampling Parameter', 'Value', 'Methodological Reference'];
    const rows = [
      ['Population Size (N)', population.toLocaleString(), 'Full Transaction Ledger Population'],
      ['Confidence Level (%)', `${confidence}%`, 'AICPA / IIA Attribute Testing Standards'],
      ['Sampling Risk (Beta Risk)', `${samplingRisk}%`, 'Risk of Incorrect Acceptance'],
      ['Tolerable Deviation Rate (%)', `${tolerableRate}%`, 'Maximum acceptable defect threshold'],
      ['Expected Deviation Rate (%)', `${expectedRate}%`, 'Prior audit history baseline'],
      ['Statistically Required Sample (n)', sampleSize.toLocaleString(), 'Calculated Sample with Finite Population Correction'],
      ['Population Coverage (%)', `${coveragePercent}%`, 'Sample fraction vs total ledger'],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Audit_Sample_Sizing_Memo_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-[32px] border border-white/10 bg-black/40 p-6 md:p-10 w-full max-w-4xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Calculator className="h-6 w-6 text-[#f4c98b]" />
            Audit Sample Size & Precision Sizer
          </h2>
          <p className="text-sm text-white/60 mt-1">
            AICPA attribute sampling engine with Finite Population Correction (FPC) for internal controls testing.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              setPopulation(5000);
              setConfidence(95);
              setTolerableRate(5);
              setExpectedRate(1);
            }}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all bg-white/5"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#f4c98b] text-black hover:bg-[#ffe3be] transition-all shadow-lg shadow-[#f4c98b]/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export Sampling Memo
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Left Inputs (7 cols) */}
        <div className="md:col-span-7 space-y-6">
          {/* Population Size */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/40">
              Transaction Population Size (N)
            </label>
            <input
              type="number"
              min={1}
              value={population}
              onChange={e => setPopulation(Math.max(1, parseInt(e.target.value) || 0))}
              className="w-full px-4 py-3 rounded-xl border border-white/10 bg-white/5 text-lg font-mono font-black text-white focus:outline-none focus:border-[#f4c98b] transition-all"
            />
            <p className="text-[10px] text-white/40">Total invoices, journal entries, or till events in the audit period.</p>
          </div>

          {/* Confidence Level */}
          <div className="space-y-2">
            <label className="block text-[11px] font-black uppercase tracking-widest text-white/40">
              Confidence Level (1 - Sampling Risk)
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[90, 95, 99].map(lvl => (
                <button
                  key={lvl}
                  onClick={() => setConfidence(lvl)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all ${
                    confidence === lvl
                      ? 'bg-[#f4c98b] text-black border-[#f4c98b] shadow-md shadow-[#f4c98b]/20'
                      : 'bg-white/5 text-white/60 border-white/10 hover:border-white/30 hover:text-white'
                  }`}
                >
                  {lvl}% Confidence
                </button>
              ))}
            </div>
            <p className="text-[10px] text-white/40">
              95% is standard for key SOX/ICFR internal controls; 90% for non-key controls; 99% for fraud-investigative procedures.
            </p>
          </div>

          {/* Rates */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-white/40">
                Tolerable Deviation (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="1"
                max="25"
                value={tolerableRate}
                onChange={e => setTolerableRate(parseFloat(e.target.value) || 1)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#f4c98b]"
              />
              <p className="text-[10px] text-white/40">Maximum defect rate tolerated before declaring control failure.</p>
            </div>
            <div className="space-y-2">
              <label className="block text-[11px] font-black uppercase tracking-widest text-white/40">
                Expected Deviation (%)
              </label>
              <input
                type="number"
                step="0.5"
                min="0"
                max="20"
                value={expectedRate}
                onChange={e => setExpectedRate(parseFloat(e.target.value) || 0)}
                className="w-full px-3 py-2 rounded-xl border border-white/10 bg-white/5 text-sm font-mono font-bold text-white focus:outline-none focus:border-[#f4c98b]"
              />
              <p className="text-[10px] text-white/40">Historical or anticipated defect rate based on prior testing.</p>
            </div>
          </div>
        </div>

        {/* Right Output Card (5 cols) */}
        <div className="md:col-span-5 flex flex-col justify-between rounded-2xl border border-white/10 bg-white/[0.02] p-6 text-center">
          <div>
            <span className="text-[10px] font-black uppercase tracking-[0.25em] text-white/40 block mb-2">
              Statistically Required Sample Size
            </span>
            <div className="text-6xl font-black text-[#f4c98b] font-mono tracking-tight my-4">
              {sampleSize}
            </div>
            <p className="text-xs text-white/60 leading-relaxed max-w-xs mx-auto">
              Testing <span className="text-white font-bold">{sampleSize} items</span> provides {confidence}% mathematical confidence that true defects do not exceed {tolerableRate}%.
            </p>
          </div>

          <div className="mt-8 space-y-3 pt-6 border-t border-white/10 text-left text-xs">
            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-bold uppercase text-[10px]">Sampling Risk (Beta):</span>
              <span className="font-mono font-bold text-amber-400">{samplingRisk}%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-bold uppercase text-[10px]">Population Coverage:</span>
              <span className="font-mono font-bold text-white">{coveragePercent}%</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="text-white/40 font-bold uppercase text-[10px]">Correction Applied:</span>
              <span className="font-mono font-bold text-emerald-400">Finite (FPC)</span>
            </div>
          </div>

          {Number(coveragePercent) < 2 && (
            <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 text-left flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0 mt-0.5 text-amber-400" />
              <span>
                <strong>Blind Spot Advisory:</strong> Testing only {coveragePercent}% of the ledger leaves &gt;98% unexamined. For fraud &amp; leakage, consider pairing sampling with 100% automated continuous telemetry.
              </span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
