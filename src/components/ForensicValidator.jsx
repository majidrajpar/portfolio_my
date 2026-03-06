import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, BarChart3, Database, AlertCircle, Info, RefreshCw } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import init, { analyze_benfords_law } from '../lib/audit_engine_pkg/audit_engine';

const ForensicValidator = () => {
  const [wasmReady, setWasmReady] = useState(false);
  const [data, setData] = useState([]);
  const [results, setResults] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    init(`${base}/wasm/audit_engine_bg.wasm`).then(() => setWasmReady(true));
  }, []);

  const generateDataset = (type = 'natural') => {
    const newDataset = [];
    const count = 5000;
    
    if (type === 'natural') {
      // Natural distributions follow Benford's Law
      for (let i = 0; i < count; i++) {
        // Log-normal distribution often follows Benford's Law
        newDataset.push(Math.exp(Math.random() * 10));
      }
    } else {
      // Manipulated data often has artificial padding of certain digits (e.g., just under $5,000)
      for (let i = 0; i < count; i++) {
        const rand = Math.random();
        if (rand > 0.7) {
            newDataset.push(4000 + Math.random() * 900); // Heavy concentration of '4's
        } else {
            newDataset.push(Math.random() * 10000);
        }
      }
    }
    setData(newDataset);
    runAnalysis(newDataset);
  };

  const runAnalysis = (inputData) => {
    if (!wasmReady) return;
    setIsAnalyzing(true);
    
    // Call the Rust function
    // Small delay to show "Processing" state for executive feel
    setTimeout(() => {
      const result = analyze_benfords_law(new Float64Array(inputData));
      setResults(result);
      setIsAnalyzing(false);
    }, 400);
  };

  const chartData = results ? results.actual_distribution.map((val, i) => ({
    digit: (i + 1).toString(),
    Actual: parseFloat(val.toFixed(2)),
    Expected: parseFloat(results.expected_distribution[i].toFixed(2))
  })) : [];

  const getAnomalyStatus = (score) => {
    if (score < 1.0) return { 
      label: 'Low Risk', 
      color: 'text-emerald-600', 
      bg: 'bg-emerald-50', 
      border: 'border-emerald-200',
      insight: 'Data distribution follows a natural pattern. No further forensic procedures required for this population.'
    };
    if (score < 2.5) return { 
      label: 'Moderate Deviation', 
      color: 'text-amber-600', 
      bg: 'bg-amber-50', 
      border: 'border-amber-200',
      insight: 'Potential manual intervention or rounding detected. Recommended: Review transactions near approval thresholds.'
    };
    return { 
      label: 'High Anomaly Detected', 
      color: 'text-red-700', 
      bg: 'bg-red-50', 
      border: 'border-red-200',
      insight: 'Significant statistical deviation. High probability of data manipulation or systematic error. Recommended: Full forensic sample testing.'
    };
  };

  const status = results ? getAnomalyStatus(results.anomaly_score) : null;

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-8 shadow-sm font-sans">
      {/* Header */}
      <div className="flex items-start justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
            Audit Analytics • High Performance Engine
          </div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Forensic Pattern Validator</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Detects potential financial manipulation by comparing transaction digit frequencies against 
            <span className="font-bold text-slate-700"> Benford's Law</span>. Powered by a client-side Rust engine for secure, 
            instant analysis of large datasets.
          </p>
        </div>
        <div className="bg-[#001F5B] p-3 text-white">
          <ShieldAlert size={24} />
        </div>
      </div>

      {/* Control Panel */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <button 
          onClick={() => generateDataset('natural')}
          className="flex items-center justify-between p-4 border border-slate-200 hover:border-[#001F5B] transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-[#001F5B]">Test Scenario A</div>
            <div className="font-black text-slate-800 uppercase text-xs">Simulate Natural Transactions</div>
          </div>
          <Database className="text-slate-300 group-hover:text-[#001F5B]" size={20} />
        </button>
        <button 
          onClick={() => generateDataset('manipulated')}
          className="flex items-center justify-between p-4 border border-slate-200 hover:border-red-500 transition-all group"
        >
          <div className="text-left">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-red-500">Test Scenario B</div>
            <div className="font-black text-slate-800 uppercase text-xs">Simulate Fraudulent Pattern</div>
          </div>
          <AlertCircle className="text-slate-300 group-hover:text-red-500" size={20} />
        </button>
      </div>

      {/* Results View */}
      {isAnalyzing ? (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-dashed border-slate-200">
          <RefreshCw className="animate-spin text-[#001F5B] mb-4" size={32} />
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">Analyzing Pattern via Rust Wasm...</div>
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
            <div className="p-5 border border-slate-200 bg-white">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Deviation Score (MAD)</div>
              <div className="text-xl font-black text-slate-800">{results.anomaly_score.toFixed(4)}</div>
            </div>
          </div>

          {/* Chart */}
          <div className="bg-white border border-slate-200 p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="text-[10px] font-black uppercase tracking-widest text-slate-500">First-Digit Frequency Analysis</div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-[#001F5B]"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Actual</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                        <div className="w-3 h-3 bg-emerald-500"></div>
                        <span className="text-[10px] font-black uppercase text-slate-400">Benford Target</span>
                    </div>
                </div>
              </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis 
                    dataKey="digit" 
                    tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    cursor={{ fill: '#f8fafc' }}
                    contentStyle={{ borderRadius: 0, border: '1px solid #e2e8f0', fontSize: '12px', fontWeight: 'bold' }}
                  />
                  <Bar dataKey="Actual" fill="#001F5B" barSize={35} />
                  <Bar dataKey="Expected" fill="#10b981" fillOpacity={0.3} barSize={35} stroke="#10b981" strokeWidth={1} strokeDasharray="4 4" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Forensic Notes */}
          <div className="p-5 bg-slate-50 border-l-4 border-[#001F5B]">
            <div className="flex gap-3">
              <Info className="text-[#001F5B] flex-shrink-0" size={18} />
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[#001F5B] mb-1">Professional Auditor Note</div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  In natural financial data, the digit '1' should appear as the leading digit ~30.1% of the time, while '9' appears only ~4.6% of the time. 
                  Significant deviations (high MAD score) often indicate artificial thresholds, rounding, or manual data insertion.
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      ) : (
        <div className="h-[400px] flex flex-col items-center justify-center bg-slate-50 border border-slate-200">
          <BarChart3 className="text-slate-300 mb-4" size={48} />
          <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">Generate a simulation dataset to begin forensic validation</p>
        </div>
      )}

      {/* Footer Meta */}
      <div className="mt-8 pt-6 border-t border-slate-100 flex items-center justify-between">
        <div className="flex items-center gap-2 text-slate-400">
          <Database size={12} />
          <span className="text-[9px] font-black uppercase tracking-widest">Client-Side Rust/Wasm Execution</span>
        </div>
        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 italic">
          Decision Support Tool • Private & Secure
        </div>
      </div>
    </div>
  );
};

export default ForensicValidator;
