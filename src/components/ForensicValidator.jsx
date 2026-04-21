import React, { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BarChart3, Database, AlertCircle, Info, RefreshCw, Upload } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

// ─── BENFORD'S LAW — PURE JS ─────────────────────────────────────────
// P(d) = log10(1 + 1/d) for d = 1..9
const BENFORD_EXPECTED = [1,2,3,4,5,6,7,8,9].map(d =>
  parseFloat((Math.log10(1 + 1 / d) * 100).toFixed(4))
);

function analyzeBenford(numbers) {
  const counts = new Array(9).fill(0);
  let valid = 0;

  for (const n of numbers) {
    const abs = Math.abs(n);
    if (!isFinite(abs) || abs < 1) continue;
    const firstDigit = parseInt(String(Math.floor(abs))[0], 10);
    if (firstDigit >= 1 && firstDigit <= 9) {
      counts[firstDigit - 1]++;
      valid++;
    }
  }

  if (valid < 10) return null;

  const actual_distribution = counts.map(c =>
    parseFloat(((c / valid) * 100).toFixed(4))
  );

  // MAD = mean absolute deviation across all 9 digits
  const mad = actual_distribution.reduce(
    (sum, actual, i) => sum + Math.abs(actual - BENFORD_EXPECTED[i]), 0
  ) / 9;

  return {
    actual_distribution,
    expected_distribution: BENFORD_EXPECTED,
    anomaly_score: mad,
    sample_size: valid,
  };
}

// ─── DATASET GENERATORS ──────────────────────────────────────────────
function generateNatural(count = 5000) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(Math.exp(Math.random() * 10)); // log-normal follows Benford's
  }
  return out;
}

function generateManipulated(count = 5000) {
  const out = [];
  for (let i = 0; i < count; i++) {
    if (Math.random() > 0.7) {
      out.push(4000 + Math.random() * 900); // heavy '4' concentration
    } else {
      out.push(Math.random() * 10000);
    }
  }
  return out;
}

// ─── ANOMALY STATUS ───────────────────────────────────────────────────
function getAnomalyStatus(score) {
  if (score < 1.0) return {
    label: 'Low Risk',
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    insight: 'Data distribution follows a natural pattern. No further forensic procedures required for this population.',
  };
  if (score < 2.5) return {
    label: 'Moderate Deviation',
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    insight: 'Potential manual intervention or rounding detected. Recommended: Review transactions near approval thresholds.',
  };
  return {
    label: 'High Anomaly Detected',
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    insight: 'Significant statistical deviation. High probability of data manipulation or systematic error. Recommended: Full forensic sample testing.',
  };
}

// ─── CSV PARSER ───────────────────────────────────────────────────────
function parseCSV(text) {
  const numbers = [];
  const lines = text.split(/\r?\n/);
  for (const line of lines) {
    const cells = line.split(/,|\t/);
    for (const cell of cells) {
      const clean = cell.replace(/[^0-9.\-]/g, '').trim();
      const n = parseFloat(clean);
      if (!isNaN(n) && Math.abs(n) >= 1) numbers.push(n);
    }
  }
  return numbers;
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const ForensicValidator = () => {
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [sourceLabel, setSourceLabel] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);
  const fileRef = useRef(null);

  useEffect(() => {
    const timer = window.requestAnimationFrame(() => setIsChartReady(true));
    return () => {
      window.cancelAnimationFrame(timer);
      setIsChartReady(false);
    };
  }, []);

  const runAnalysis = (numbers, label) => {
    setIsAnalyzing(true);
    setFileError(null);
    setSourceLabel(label);
    // Small async delay for UI feedback
    setTimeout(() => {
      const result = analyzeBenford(numbers);
      if (!result) {
        setFileError('Not enough valid numeric values found (minimum 10 required).');
        setIsAnalyzing(false);
        return;
      }
      setResults(result);
      setIsAnalyzing(false);
    }, 350);
  };

  const handleSimulate = (type) => {
    const numbers = type === 'natural' ? generateNatural() : generateManipulated();
    const label = type === 'natural'
      ? 'Simulated — Natural (5,000 transactions)'
      : 'Simulated — Manipulated (5,000 transactions)';
    runAnalysis(numbers, label);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setFileError('File too large. Maximum 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = (ev) => {
      const numbers = parseCSV(ev.target.result);
      runAnalysis(numbers, `${file.name} (${numbers.length.toLocaleString()} values)`);
    };
    reader.readAsText(file);
    // Reset input so same file can be re-uploaded
    e.target.value = '';
  };

  const chartData = results
    ? results.actual_distribution.map((val, i) => ({
        digit: String(i + 1),
        Actual: parseFloat(val.toFixed(2)),
        Expected: parseFloat(results.expected_distribution[i].toFixed(2)),
      }))
    : [];

  const status = results ? getAnomalyStatus(results.anomaly_score) : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-8 shadow-sm font-sans">

      {/* Header */}
      <div className="flex items-start justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
            Audit Analytics • Forensic Engine
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forensic Pattern Validator</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Detects potential financial manipulation by comparing transaction digit frequencies against
            <span className="font-bold text-slate-700"> Benford's Law</span>. Upload a CSV or run a simulation — analysis runs entirely in your browser.
          </p>
        </div>
        <div className="bg-[#001F5B] p-3 text-white">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <button
          onClick={() => handleSimulate('natural')}
          className="flex items-center justify-between p-4 border border-slate-200 hover:border-[#001F5B] transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#001F5B]">Scenario A</div>
            <div className="font-black text-slate-800 uppercase text-xs">Natural Transactions</div>
          </div>
          <Database className="text-slate-300 group-hover:text-[#001F5B]" size={20} />
        </button>

        <button
          onClick={() => handleSimulate('manipulated')}
          className="flex items-center justify-between p-4 border border-slate-200 hover:border-red-500 transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500">Scenario B</div>
            <div className="font-black text-slate-800 uppercase text-xs">Fraudulent Pattern</div>
          </div>
          <AlertCircle className="text-slate-300 group-hover:text-red-500" size={20} />
        </button>

        <button
          onClick={() => fileRef.current?.click()}
          className="flex items-center justify-between p-4 border border-dashed border-slate-300 hover:border-[#C9A84C] hover:bg-[#C9A84C]/5 transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#C9A84C]">Upload CSV</div>
            <div className="font-black text-slate-800 uppercase text-xs">Your Own Data</div>
          </div>
          <Upload className="text-slate-300 group-hover:text-[#C9A84C]" size={20} />
        </button>
        <input
          ref={fileRef}
          type="file"
          accept=".csv,.txt,.tsv"
          onChange={handleFileUpload}
          className="sr-only"
          aria-label="Upload CSV file for Benford's Law analysis"
        />
      </div>

      {fileError && (
        <div className="mb-6 px-4 py-3 border border-red-200 bg-red-50 text-red-700 text-xs font-bold">
          {fileError}
        </div>
      )}

      {/* Results */}
      {isAnalyzing ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200">
          <RefreshCw className="animate-spin text-[#001F5B] mb-4" size={32} />
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analyzing Pattern…</div>
        </div>
      ) : results ? (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="space-y-8"
        >
          {/* Summary Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className={`p-5 border ${status.border} ${status.bg} md:col-span-2`}>
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Executive Interpretation</div>
              <div className={`text-lg font-black uppercase ${status.color} mb-1`}>{status.label}</div>
              <p className="text-[11px] font-bold text-slate-600 leading-tight">{status.insight}</p>
            </div>
            <div className="grid grid-rows-2 gap-4">
              <div className="p-4 border border-slate-200 bg-white">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">MAD Score</div>
                <div className="text-xl font-black text-slate-800">{results.anomaly_score.toFixed(4)}</div>
              </div>
              <div className="p-4 border border-slate-200 bg-white">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Sample Size</div>
                <div className="text-xl font-black text-slate-800">{results.sample_size.toLocaleString()}</div>
              </div>
            </div>
          </div>

          {/* Source label */}
          {sourceLabel && (
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400">
              Source: {sourceLabel}
            </div>
          )}

          {/* Chart */}
          <div className="bg-white border border-slate-200 p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">First-Digit Frequency Analysis</div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-[#001F5B]"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Actual %</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="w-3 h-3 bg-emerald-500 opacity-60"></div>
                  <span className="text-[10px] font-black uppercase text-slate-400">Benford Target %</span>
                </div>
              </div>
            </div>
            <div className="h-[300px]">
              {isChartReady && (
              <ResponsiveContainer width="100%" height={300} debounce={120}>
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="digit"
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                    label={{ value: 'Leading Digit', position: 'insideBottom', offset: -2, fontSize: 9, fill: '#94a3b8', fontWeight: 700 }}
                  />
                  <YAxis
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={v => `${v}%`}
                  />
                  <Tooltip
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 0, border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                    formatter={(v) => [`${v}%`]}
                  />
                  <Bar dataKey="Actual" fill="#001F5B" barSize={32} />
                  <Bar dataKey="Expected" fill="#10b981" fillOpacity={0.35} barSize={32} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" />
                </BarChart>
              </ResponsiveContainer>
              )}
            </div>
          </div>

          {/* MAD scale */}
          <div className="grid grid-cols-3 gap-4 text-center">
            {[
              { range: '< 1.0', label: 'Acceptable', color: 'text-emerald-600', bg: 'bg-emerald-50 border-emerald-200' },
              { range: '1.0 – 2.5', label: 'Marginal', color: 'text-amber-600', bg: 'bg-amber-50 border-amber-200' },
              { range: '> 2.5', label: 'Non-conforming', color: 'text-red-700', bg: 'bg-red-50 border-red-200' },
            ].map(({ range, label, color, bg }) => (
              <div key={range} className={`p-4 border ${bg}`}>
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">MAD {range}</div>
                <div className={`font-black text-sm uppercase ${color}`}>{label}</div>
              </div>
            ))}
          </div>

          {/* Forensic note */}
          <div className="p-5 bg-slate-50 border-l-4 border-[#001F5B]">
            <div className="flex gap-3">
              <Info className="text-[#001F5B] flex-shrink-0" size={18} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#001F5B] mb-1">Professional Auditor Note</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In natural financial data, the digit '1' should appear as the leading digit ~30.1% of the time, while '9' appears only ~4.6% of the time.
                  Significant deviations (high MAD score) often indicate artificial thresholds, rounding, or manual data insertion. MAD thresholds follow Nigrini (2012) — the standard reference for forensic Benford's analysis.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200">
          <BarChart3 className="text-slate-300 mb-4" size={48} />
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black mb-2">
            Run a simulation or upload a CSV to begin forensic validation
          </p>
          <p className="text-slate-300 text-[9px] uppercase tracking-widest">
            Accepts any CSV with numeric columns — invoices, transactions, journal entries
          </p>
        </div>
      )}

      {/* Footer */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Database size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">100% Client-Side • No Data Transmitted</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
          Decision Support Tool • Nigrini MAD Thresholds
        </div>
      </div>
    </div>
  );
};

export default ForensicValidator;
