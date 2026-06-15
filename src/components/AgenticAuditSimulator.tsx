import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bot, User, ShieldAlert, Cpu, CheckCircle2, ChevronRight, Activity } from 'lucide-react';

const scenarios = [
  { id: 'procurement', label: 'Procurement Fraud Detection', severity: 'High' },
  { id: 'tne', label: 'T&E Expense Anomalies', severity: 'Medium' },
  { id: 'access', label: 'Privileged Access Abuse', severity: 'Critical' }
];

const agentLogs = {
  procurement: [
    { agent: 'Risk Assessor', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10', msg: 'Analyzing vendor master file vs employee bank records...' },
    { agent: 'Forensic Analyst', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', msg: 'Found 3 exact match anomalies. Cross-referencing invoice approval timestamps.' },
    { agent: 'Forensic Analyst', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', msg: 'Pattern detected: Approvals occurring outside business hours from IP block 192.168.x.x.' },
    { agent: 'Chief Audit Exec', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-400/10', msg: 'Drafting emergency audit memorandum. Requesting immediate hold on payments to Vendor ID #88492.' }
  ],
  tne: [
    { agent: 'Risk Assessor', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10', msg: 'Scanning 14,000 T&E receipts from Q3...' },
    { agent: 'Forensic Analyst', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', msg: 'Optical character recognition (OCR) flagged 42 manipulated PDF metadata tags.' },
    { agent: 'Chief Audit Exec', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-400/10', msg: 'Generating behavioral profile of repeat offenders. Scheduling management review.' }
  ],
  access: [
    { agent: 'Risk Assessor', icon: ShieldAlert, color: 'text-amber-400', bg: 'bg-amber-400/10', msg: 'Monitoring Active Directory privilege escalations...' },
    { agent: 'Forensic Analyst', icon: Cpu, color: 'text-blue-400', bg: 'bg-blue-400/10', msg: 'Service account "svc_erp_backup" bypassed MFA and accessed financial ledgers.' },
    { agent: 'Chief Audit Exec', icon: Bot, color: 'text-emerald-400', bg: 'bg-emerald-400/10', msg: 'CRITICAL. Executing automated SOX compliance breach notification to CISO and Board.' }
  ]
};

export default function AgenticAuditSimulator() {
  const [activeScenario, setActiveScenario] = useState<string | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isSimulating, setIsSimulating] = useState(false);

  useEffect(() => {
    if (!activeScenario) return;
    
    setIsSimulating(true);
    setLogs([]);
    const sequence = agentLogs[activeScenario as keyof typeof agentLogs];
    
    sequence.forEach((log, index) => {
      setTimeout(() => {
        setLogs(prev => [...prev, log]);
        if (index === sequence.length - 1) setIsSimulating(false);
      }, (index + 1) * 1500);
    });

  }, [activeScenario]);

  return (
    <div className="glass-card rounded-[32px] border border-white/10 bg-black/40 p-8 w-full max-w-5xl mx-auto shadow-2xl">
      <div className="flex items-center gap-3 mb-8 border-b border-white/10 pb-6">
        <div className="p-3 bg-indigo-500/20 rounded-xl border border-indigo-500/30">
          <Activity className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white">Agentic Audit Swarm</h2>
          <p className="text-slate-400 text-sm mt-1">Autonomous multi-agent risk detection simulation</p>
        </div>
      </div>

      <div className="grid lg:grid-cols-[300px_1fr] gap-8">
        <div className="space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-slate-500 mb-4">Trigger Scenario</h3>
          {scenarios.map((s) => (
            <button
              key={s.id}
              onClick={() => !isSimulating && setActiveScenario(s.id)}
              disabled={isSimulating}
              className={`w-full text-left p-4 rounded-2xl border transition-all duration-300 flex items-center justify-between group ${
                activeScenario === s.id 
                  ? 'bg-indigo-500/10 border-indigo-500/50' 
                  : 'bg-white/5 border-white/10 hover:bg-white/10 disabled:opacity-50'
              }`}
            >
              <div>
                <div className="text-sm font-bold text-slate-200">{s.label}</div>
                <div className={`text-[10px] uppercase tracking-wider mt-1 ${
                  s.severity === 'Critical' ? 'text-red-400' : s.severity === 'High' ? 'text-amber-400' : 'text-blue-400'
                }`}>{s.severity} Risk</div>
              </div>
              <ChevronRight className={`w-4 h-4 text-slate-500 group-hover:text-slate-300 transition-colors ${activeScenario === s.id ? 'text-indigo-400' : ''}`} />
            </button>
          ))}
        </div>

        <div className="bg-slate-950/50 border border-white/5 rounded-2xl p-6 min-h-[400px] flex flex-col font-mono text-sm relative overflow-hidden">
          {!activeScenario ? (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <Bot className="w-12 h-12 opacity-20" />
              <p>Awaiting scenario injection to deploy AI audit swarm...</p>
            </div>
          ) : (
            <div className="space-y-6 flex-1 overflow-y-auto pr-2">
              <AnimatePresence>
                {logs.map((log, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: 20, scale: 0.95 }}
                    animate={{ opacity: 1, x: 0, scale: 1 }}
                    className="flex gap-4"
                  >
                    <div className={`shrink-0 w-10 h-10 rounded-xl ${log.bg} border border-white/5 flex items-center justify-center`}>
                      <log.icon className={`w-5 h-5 ${log.color}`} />
                    </div>
                    <div className="flex-1 bg-white/5 rounded-2xl rounded-tl-none p-4 border border-white/5 shadow-lg">
                      <div className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2">
                        {log.agent}
                      </div>
                      <div className="text-slate-300 leading-relaxed">
                        {log.msg}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
              {isSimulating && (
                <motion.div 
                  initial={{ opacity: 0 }} 
                  animate={{ opacity: 1 }} 
                  className="flex gap-2 items-center text-slate-500 ml-14 mt-4"
                >
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse delay-150" />
                  <span className="text-xs ml-2 uppercase tracking-widest">Processing</span>
                </motion.div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
