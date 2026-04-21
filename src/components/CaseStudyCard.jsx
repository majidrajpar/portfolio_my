import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const StarrSection = ({ label, content, icon, delay, isLast = false }) => (
  <motion.div 
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ duration: 0.5, delay }}
    className={`relative pl-10 pb-10 border-l ${isLast ? 'border-transparent' : 'border-[rgba(29,53,87,0.12)]'}`}
  >
    <div className="absolute left-[-11px] top-0 w-5 h-5 rounded-full bg-[#fffaf4] border-4 border-[#a33a21] shadow-md z-10"></div>
    <div className="flex flex-col">
      <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#a33a21] mb-3 flex items-center gap-2">
        {label}
      </span>
      <p className="text-[color:var(--text-secondary)] text-[15px] leading-8 font-medium">
        {content}
      </p>
    </div>
  </motion.div>
);

export default function CaseStudyCard({ study }) {
  const [showTech, setShowTech] = useState(false);

  return (
    <div className="glass-card overflow-hidden flex flex-col lg:flex-row mb-10 group rounded-[34px] transition-all duration-500">
      {/* Sidebar: Executive Summary */}
      <div className="w-full lg:w-[380px] editorial-panel p-10 lg:p-12 text-white flex flex-col relative overflow-hidden">
        {/* Background Accent */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#C9A84C]/10 rounded-full blur-3xl -mr-16 -mt-16"></div>
        
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-8">
            <div className="h-[1px] w-8 bg-[#C9A84C]"></div>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#C9A84C]">
              {study.industry}
            </span>
          </div>
          
          <h3 className="text-3xl font-black leading-tight mb-6 tracking-tight">{study.title}</h3>
          
          <div className="space-y-8 mt-10 pt-10 border-t border-white/10">
            <div>
              <span className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40 block mb-3">Key Impact</span>
              <div className="p-4 bg-white/5 border border-white/10 rounded-[18px]">
                <p className="text-[13px] font-bold leading-relaxed italic text-slate-200 line-clamp-3">
                  "{study.impact}"
                </p>
              </div>
            </div>

            <div>
              <button 
                onClick={() => setShowTech(!showTech)}
                className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.24em] text-[#C9A84C] hover:text-white transition-colors group/btn"
              >
                {showTech ? 'Hide Technical Stack' : 'View Technical Stack'}
                <svg className={`w-4 h-4 transition-transform duration-300 ${showTech ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7"/>
                </svg>
              </button>
              
              <AnimatePresence>
                {showTech && (
                  <motion.div 
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="flex flex-wrap gap-2 pt-4">
                      {study.techStack.map((tech, i) => (
                        <span key={i} className="text-[9px] font-bold px-2 py-1 rounded-full bg-[#C9A84C] text-[#001F5B]">
                          {tech}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content: STARR Narrative */}
      <div className="flex-1 p-10 lg:p-16 bg-[rgba(255,251,246,0.48)] relative">
        <div className="max-w-2xl">
          <StarrSection label="The Situation" content={study.starr.situation} delay={0.1} />
          <StarrSection label="The Mandate" content={study.starr.task} delay={0.2} />
          <StarrSection label="The Intervention" content={study.starr.action} delay={0.3} />
          <StarrSection label="The Outcome" content={study.starr.result} delay={0.4} isLast={true} />
          
          {/* Strategic Insight */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="mt-8 p-8 quote-panel relative group/insight"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 group-hover/insight:opacity-20 transition-opacity">
              <svg className="w-12 h-12 text-[#1d3557]" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-6h2v6zm0-8h-2V7h2v2z"/>
              </svg>
            </div>
            <span className="text-[10px] font-black uppercase tracking-[0.24em] text-[#1d3557]/60 mb-3 block">Reflection</span>
            <p className="text-[#1d3557] text-[15px] italic leading-8 font-semibold relative z-10">
              "{study.starr.reflection}"
            </p>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
