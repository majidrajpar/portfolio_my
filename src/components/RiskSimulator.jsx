import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, TrendingUp, Info, RefreshCw, Calculator } from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import init, { run_risk_simulation } from '../lib/audit_engine_pkg/audit_engine';

const RiskSimulator = () => {
  const [wasmReady, setWasmReady] = useState(false);
  const [params, setParams] = useState({ impact: 50000, probability: 0.15, iterations: 10000 });
  const [results, setResults] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    init(`${base}/wasm/audit_engine_bg.wasm`).then(() => setWasmReady(true));
  }, []);

  const runSimulation = () => {
    if (!wasmReady) return;
    setIsSimulating(true);
    
    setTimeout(() => {
      const res = run_risk_simulation(params.impact, params.probability, params.iterations);
      setResults(res);
      setIsSimulating(false);
    }, 400);
  };

  const chartData = results ? results.distribution.map((val, i) => ({
    bucket: i,
    Frequency: val
  })) : [];

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-8 shadow-sm font-sans">
      <div className="flex items-start justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">Risk Analytics • Monte Carlo Engine</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">Quantitative Risk Simulator</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Simulates organizational risk exposure by running thousands of loss-event iterations.
            Powered by <span className="font-bold text-slate-800">Rust</span> for millisecond precision.
          </p>
        </div>
        <div className="bg-[#001F5B] p-3 text-white">
          <Calculator size={24} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Average Impact ($)</label>
          <input 
            type="number" 
            value={params.impact} 
            onChange={(e) => setParams({...params, impact: parseFloat(e.target.value)})}
            className="w-full p-3 border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#001F5B]"
          />
        </div>
        <div>
          <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Probability (0-1)</label>
          <input 
            type="number" 
            step="0.01"
            value={params.probability} 
            onChange={(e) => setParams({...params, probability: parseFloat(e.target.value)})}
            className="w-full p-3 border border-slate-200 text-sm font-bold focus:outline-none focus:border-[#001F5B]"
          />
        </div>
        <div className="flex items-end">
          <button 
            onClick={runSimulation}
            disabled={!wasmReady || isSimulating}
            className="w-full bg-[#001F5B] text-white py-3 text-[10px] font-black uppercase tracking-widest hover:bg-[#002d87] transition-all disabled:opacity-50"
          >
            {isSimulating ? 'Simulating...' : 'Run 10k Iterations'}
          </button>
        </div>
      </div>

      {results && !isSimulating && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-5 border border-slate-200 bg-slate-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Mean Expected Loss</div>
              <div className="text-xl font-black text-[#001F5B]">${results.mean_loss.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            </div>
            <div className="p-5 border border-red-200 bg-red-50">
              <div className="text-[10px] font-black uppercase tracking-widest text-red-600 mb-1">95th Percentile (P95)</div>
              <div className="text-xl font-black text-red-700">${results.p95_loss.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            </div>
            <div className="p-5 border border-slate-200 bg-white">
              <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-1">Max Simulated Loss</div>
              <div className="text-xl font-black text-slate-800">${results.max_loss.toLocaleString(undefined, {maximumFractionDigits: 0})}</div>
            </div>
          </div>

          <div className="bg-white border border-slate-200 p-6">
            <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-6">Loss Probability Distribution (Histogram)</div>
            <div className="h-[250px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis hide />
                  <YAxis hide />
                  <Tooltip />
                  <Bar dataKey="Frequency" fill="#001F5B" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="p-5 bg-blue-50 border-l-4 border-[#001F5B]">
            <div className="flex gap-3 text-xs text-slate-600 leading-relaxed">
              <Info className="text-[#001F5B] mt-0.5" size={16} />
              <p>
                The <strong>P95 Risk</strong> indicates that in 95% of simulated scenarios, the loss will be below this amount. 
                This provides a more robust measure for audit planning than a simple "Average" or "Heatmap" rating.
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default RiskSimulator;
