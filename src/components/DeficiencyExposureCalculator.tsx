import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { DollarSign, ShieldX } from 'lucide-react';

export default function DeficiencyExposureCalculator() {
  const [revenue, setRevenue] = useState(500000000);
  const [controlType, setControlType] = useState<'financial' | 'operational' | 'compliance'>('financial');
  const [failureRate, setFailureRate] = useState(5);
  const [detectionDelay, setDetectionDelay] = useState(30);

  // Simple exposure models
  const multipliers = {
    financial: 0.002, // 0.2% of revenue per 1% failure per 30 days
    operational: 0.001,
    compliance: 0.005, // Heavy regulatory fines
  };

  const calculateExposure = () => {
    const baseExposure = revenue * multipliers[controlType];
    const failureMultiplier = failureRate / 1;
    const timeMultiplier = detectionDelay / 30;
    
    let total = baseExposure * failureMultiplier * timeMultiplier;
    
    // Add reputational damage for compliance
    if (controlType === 'compliance' && detectionDelay > 90) {
      total += revenue * 0.01;
    }
    
    return total;
  };

  const exposure = calculateExposure();

  return (
    <div className="glass-card rounded-[32px] border border-white/10 bg-black/40 p-8 w-full max-w-4xl mx-auto shadow-2xl">
      <div className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <DollarSign className="text-emerald-400" /> Control Deficiency Exposure
          </h2>
          <p className="text-slate-400 text-sm mt-2">Translating audit findings into Board-level financial risk.</p>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-12">
        <div className="space-y-8">
          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Annual Revenue (USD)
            </label>
            <input 
              type="range" 
              min="10000000" 
              max="2000000000" 
              step="10000000"
              value={revenue}
              onChange={(e) => setRevenue(Number(e.target.value))}
              className="w-full accent-emerald-500"
            />
            <div className="text-xl font-bold text-slate-200 mt-2">
              ${(revenue / 1000000).toFixed(1)}M
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Control Domain
            </label>
            <div className="flex gap-2">
              {(['financial', 'operational', 'compliance'] as const).map((type) => (
                <button
                  key={type}
                  onClick={() => setControlType(type)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold uppercase tracking-wider border transition-colors ${
                    controlType === type
                      ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-300'
                      : 'bg-white/5 border-white/10 text-slate-400 hover:bg-white/10'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Control Failure Rate (%)
            </label>
            <input 
              type="range" 
              min="1" 
              max="25" 
              value={failureRate}
              onChange={(e) => setFailureRate(Number(e.target.value))}
              className="w-full accent-amber-500"
            />
            <div className="text-xl font-bold text-slate-200 mt-2">{failureRate}% Anomaly Rate</div>
          </div>

          <div>
            <label className="block text-xs font-black uppercase tracking-widest text-slate-500 mb-4">
              Detection Delay (Days)
            </label>
            <input 
              type="range" 
              min="1" 
              max="180" 
              value={detectionDelay}
              onChange={(e) => setDetectionDelay(Number(e.target.value))}
              className="w-full accent-red-500"
            />
            <div className="text-xl font-bold text-slate-200 mt-2">{detectionDelay} Days Unmitigated</div>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-8 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent opacity-50" />
          
          <ShieldX className={`w-16 h-16 mb-6 ${exposure > 5000000 ? 'text-red-500' : exposure > 1000000 ? 'text-amber-500' : 'text-emerald-500'}`} />
          
          <h3 className="text-sm font-black uppercase tracking-widest text-slate-500 mb-2">
            Projected Value at Risk
          </h3>
          
          <motion.div 
            key={exposure}
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`text-5xl font-black tracking-tighter ${exposure > 5000000 ? 'text-red-400' : exposure > 1000000 ? 'text-amber-400' : 'text-emerald-400'}`}
          >
            ${(exposure).toLocaleString(undefined, { maximumFractionDigits: 0 })}
          </motion.div>
          
          <p className="text-slate-400 text-sm mt-6 leading-relaxed max-w-xs">
            {exposure > 5000000 
              ? "Critical exposure. Immediate board escalation and remediation required." 
              : exposure > 1000000 
              ? "Significant risk. Prioritize in the next quarterly audit cycle." 
              : "Monitor. Exposure is within typical risk appetite limits."}
          </p>
        </div>
      </div>
    </div>
  );
}
