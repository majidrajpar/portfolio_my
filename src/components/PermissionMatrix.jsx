import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, UserCheck, AlertTriangle, Users, Search, RefreshCw } from 'lucide-react';
import init, { analyze_sod_conflicts } from '../lib/audit_engine_pkg/audit_engine';

const PermissionMatrix = () => {
  const [wasmReady, setWasmReady] = useState(false);
  const [results, setResults] = useState([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  useEffect(() => {
    const base = import.meta.env.BASE_URL.replace(/\/$/, '');
    init(`${base}/wasm/audit_engine_bg.wasm`).then(() => setWasmReady(true));
  }, []);

  const runAnalysis = () => {
    if (!wasmReady) return;
    setIsAnalyzing(true);

    const userRoles = {
      "user_01": ["Accounts Payable", "General Ledger", "Vendor Setup"],
      "user_02": ["Purchase Order Creation", "Goods Receipt"],
      "user_03": ["IT Administration", "Payroll Processing"],
      "user_04": ["HR Management", "Recruitment"],
    };

    const conflictRules = [
      ["Accounts Payable", "Vendor Setup"],
      ["Purchase Order Creation", "Goods Receipt"],
      ["IT Administration", "Payroll Processing"],
    ];

    setTimeout(() => {
      const res = analyze_sod_conflicts(JSON.stringify(userRoles), JSON.stringify(conflictRules));
      setResults(res);
      setIsAnalyzing(false);
    }, 400);
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-white border border-slate-200 p-8 shadow-sm font-sans">
      <div className="flex items-start justify-between mb-8 border-b border-slate-100 pb-6">
        <div>
          <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">Access Governance • Matrix Engine</div>
          <h2 className="text-3xl font-black text-slate-900 tracking-tight">SoD Conflict Explorer</h2>
          <p className="text-slate-500 text-sm mt-2 max-w-xl">
            Identifies Segregation of Duties (SoD) violations across your user permissions matrix.
            Powered by <span className="font-bold text-slate-800">Rust</span> for high-performance permutation checks.
          </p>
        </div>
        <div className="bg-[#001F5B] p-3 text-white">
          <ShieldCheck size={24} />
        </div>
      </div>

      <div className="mb-8">
        <button 
          onClick={runAnalysis}
          disabled={!wasmReady || isAnalyzing}
          className="w-full flex items-center justify-center gap-2 bg-[#001F5B] text-white py-4 text-[10px] font-black uppercase tracking-widest hover:bg-[#002d87] transition-all disabled:opacity-50"
        >
          {isAnalyzing ? <RefreshCw className="animate-spin" size={14} /> : <Search size={14} />}
          {isAnalyzing ? 'Analyzing Permutations...' : 'Run Segregation of Duties Analysis'}
        </button>
      </div>

      {results.length > 0 && !isAnalyzing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-4">Conflict Findings</div>
          <div className="grid grid-cols-1 gap-4">
            {results.map((item, idx) => (
              <div key={idx} className={`p-5 border ${item.conflicts.length > 0 ? 'border-red-200 bg-red-50' : 'border-emerald-200 bg-emerald-50'}`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Users size={16} className={item.conflicts.length > 0 ? 'text-red-700' : 'text-emerald-700'} />
                    <span className="font-black text-slate-800 text-xs uppercase tracking-widest">{item.user}</span>
                  </div>
                  <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${item.conflicts.length > 0 ? 'bg-red-700 text-white' : 'bg-emerald-600 text-white'}`}>
                    {item.conflicts.length > 0 ? `${item.conflicts.length} Violation(s)` : 'Compliant'}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2 mb-3">
                  {item.roles.map((role, rIdx) => (
                    <span key={rIdx} className="text-[9px] font-bold bg-white/50 border border-slate-200 px-2 py-1 text-slate-600">{role}</span>
                  ))}
                </div>
                {item.conflicts.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-red-200">
                    <div className="flex items-start gap-2">
                      <AlertTriangle size={14} className="text-red-700 mt-0.5" />
                      <div className="text-[10px] font-bold text-red-800 uppercase tracking-widest">Conflicts:</div>
                    </div>
                    <ul className="mt-2 space-y-1 ml-6">
                      {item.conflicts.map((c, cIdx) => (
                        <li key={cIdx} className="text-[10px] text-red-700 font-bold">• {c}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default PermissionMatrix;
