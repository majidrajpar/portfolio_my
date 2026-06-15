import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { AlertOctagon, Filter, Eye, Gavel, ArrowRight } from 'lucide-react';

const tips = [
  { id: 'TIP-892', dept: 'Procurement', severity: 9, credibility: 8, status: 'Escalated', desc: 'Vendor kickbacks involving Director of Sourcing.' },
  { id: 'TIP-884', dept: 'Finance', severity: 7, credibility: 4, status: 'Review', desc: 'Quarter-end revenue recognition anomalies.' },
  { id: 'TIP-891', dept: 'HR', severity: 3, credibility: 9, status: 'Archived', desc: 'Favoritism in team shift scheduling.' },
  { id: 'TIP-895', dept: 'IT', severity: 8, credibility: 7, status: 'Active', desc: 'Database admin exporting customer PII to external drive.' },
  { id: 'TIP-896', dept: 'Sales', severity: 5, credibility: 3, status: 'Review', desc: 'Exaggerated expense reports during conferences.' }
];

export default function WhistleblowerTriage() {
  const [filter, setFilter] = useState('All');

  const filteredTips = filter === 'All' ? tips : tips.filter(t => t.status === filter);

  return (
    <div className="glass-card rounded-[32px] border border-white/10 bg-[#0a0a0a] p-8 w-full max-w-6xl mx-auto shadow-2xl text-slate-300">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 border-b border-white/10 pb-6">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <AlertOctagon className="text-rose-500" /> Whistleblower Triage Engine
          </h2>
          <p className="text-slate-400 text-sm mt-2">Automated matrix scoring for anonymous corporate ethics reports.</p>
        </div>
        <div className="flex gap-2 mt-4 md:mt-0">
          {['All', 'Active', 'Review', 'Escalated'].map(f => (
            <button 
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest transition-colors ${
                filter === f ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' : 'bg-white/5 border border-white/10 hover:bg-white/10'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-[1fr_400px] gap-8">
        {/* Tips Feed */}
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Filter className="w-4 h-4" /> Intake Queue
          </h3>
          <div className="space-y-3">
            {filteredTips.map(tip => (
              <motion.div 
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                key={tip.id} 
                className="bg-white/5 border border-white/5 rounded-2xl p-5 hover:bg-white/10 transition-colors flex items-center justify-between group"
              >
                <div>
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-black text-rose-400">{tip.id}</span>
                    <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-white/10">{tip.dept}</span>
                    {tip.status === 'Escalated' && <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-sm bg-rose-500/20 text-rose-300 border border-rose-500/30">Board Level</span>}
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{tip.desc}</p>
                </div>
                <div className="flex items-center gap-4 text-center shrink-0 ml-4">
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">SEV</div>
                    <div className={`text-lg font-black ${tip.severity >= 8 ? 'text-rose-500' : 'text-slate-300'}`}>{tip.severity}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500 uppercase tracking-widest font-bold">CRED</div>
                    <div className="text-lg font-black text-slate-300">{tip.credibility}</div>
                  </div>
                  <button className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity ml-2">
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Action Matrix */}
        <div className="bg-rose-950/10 border border-white/5 rounded-3xl p-6 flex flex-col">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-6 flex items-center gap-2">
            <Eye className="w-4 h-4" /> Risk Matrix Plot
          </h3>
          
          {/* 3x3 Matrix Grid representation */}
          <div className="flex-1 grid grid-cols-3 grid-rows-3 gap-1 relative min-h-[300px]">
            {/* Background colors for matrix */}
            <div className="bg-amber-500/10 rounded-tl-xl border border-white/5"></div>
            <div className="bg-rose-500/10 border border-white/5"></div>
            <div className="bg-rose-500/20 rounded-tr-xl border border-rose-500/20 flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20 mix-blend-overlay"></div>
                <span className="text-[9px] uppercase font-black text-rose-400 tracking-widest z-10">Escalate</span>
            </div>
            
            <div className="bg-emerald-500/5 border border-white/5"></div>
            <div className="bg-amber-500/10 border border-white/5"></div>
            <div className="bg-rose-500/10 border border-white/5"></div>
            
            <div className="bg-emerald-500/10 rounded-bl-xl border border-white/5 flex items-center justify-center">
                <span className="text-[9px] uppercase font-black text-emerald-500/50 tracking-widest">Archive</span>
            </div>
            <div className="bg-emerald-500/5 border border-white/5"></div>
            <div className="bg-amber-500/10 rounded-br-xl border border-white/5"></div>

            {/* Plot Points */}
            {filteredTips.map(tip => {
              // Convert 1-10 to percentages for top/left positioning
              const left = `${((tip.credibility - 1) / 9) * 100}%`;
              const bottom = `${((tip.severity - 1) / 9) * 100}%`;
              
              return (
                <motion.div
                  key={`dot-${tip.id}`}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className={`absolute w-4 h-4 -ml-2 mb-2 rounded-full border-2 border-[#0a0a0a] z-20 ${
                    tip.severity >= 8 && tip.credibility >= 7 ? 'bg-rose-500 shadow-[0_0_15px_rgba(244,63,94,0.5)]' :
                    tip.severity <= 3 ? 'bg-emerald-500' : 'bg-amber-500'
                  }`}
                  style={{ left, bottom }}
                  title={tip.id}
                />
              )
            })}
          </div>
          
          <div className="flex justify-between mt-4 text-[10px] uppercase font-black tracking-widest text-slate-600">
            <span>Low Credibility</span>
            <span>High Credibility</span>
          </div>
          
          <div className="mt-8 pt-6 border-t border-white/10">
             <div className="flex items-center gap-3 text-slate-300 bg-rose-500/10 p-4 rounded-xl border border-rose-500/20">
                <Gavel className="w-5 h-5 text-rose-400 shrink-0" />
                <p className="text-xs leading-relaxed">
                  <span className="font-bold text-white">Action Required:</span> Tip TIP-892 crosses the Board Escalation threshold. Generative AI summary prepared for Audit Committee review.
                </p>
             </div>
          </div>
        </div>
      </div>
    </div>
  );
}
