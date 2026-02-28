import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { CheckCheck, ClipboardCopy, Lock, ShieldCheck, AlertTriangle } from 'lucide-react';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

// ─── FRAMEWORK DEFINITIONS ───────────────────────────────────────────
const FRAMEWORKS = [
  {
    id: 'sox',
    name: 'SOX / ICFR',
    tagline: 'Sarbanes-Oxley internal financial control compliance',
    color: '#001F5B',
    controls: [
      'Financial Reporting Controls',
      'ICFR Documentation & Testing',
      'Disclosure Controls',
      'Audit Committee Oversight',
      'Management Assessment (302/404)',
    ],
  },
  {
    id: 'pdpl',
    name: 'UAE / KSA PDPL',
    tagline: 'Gulf region personal data protection legislation',
    color: '#7c3aed',
    controls: [
      'Data Inventory & Classification',
      'Consent Management',
      'Data Subject Rights',
      'Security & Technical Controls',
      'Breach Response Procedures',
    ],
  },
  {
    id: 'iso27001',
    name: 'ISO 27001',
    tagline: 'International information security management standard',
    color: '#0369a1',
    controls: [
      'Information Security Policy',
      'Risk Assessment & Treatment',
      'Access Control',
      'Incident Management',
      'Business Continuity',
    ],
  },
  {
    id: 'uae_sca',
    name: 'UAE SCA Governance',
    tagline: 'UAE Securities & Commodities Authority governance rules',
    color: '#b45309',
    controls: [
      'Board Structure & Independence',
      'Audit Committee',
      'Disclosure & Transparency',
      'Related Party Transactions',
      'Corporate Governance Report',
    ],
  },
  {
    id: 'coso_erm',
    name: 'COSO ERM 2017',
    tagline: 'Enterprise risk management integrated framework',
    color: '#065f46',
    controls: [
      'Governance & Culture',
      'Strategy & Objective-Setting',
      'Risk Identification & Assessment',
      'Risk Response & Control',
      'Review, Revision & Reporting',
    ],
  },
];

// ─── HELPERS ─────────────────────────────────────────────────────────
function scoreColor(score) {
  if (score >= 85) return '#001F5B';
  if (score >= 70) return '#16a34a';
  if (score >= 50) return '#d97706';
  return '#991b1b';
}

function scoreBarClass(score) {
  if (score >= 85) return 'bg-[#001F5B]';
  if (score >= 70) return 'bg-green-600';
  if (score >= 50) return 'bg-amber-600';
  return 'bg-red-800';
}

function ratingLabel(score) {
  if (score >= 85) return 'Strong';
  if (score >= 70) return 'Adequate';
  if (score >= 50) return 'Developing';
  return 'Non-Compliant';
}

function avgScore(frameworkId, scores) {
  const fw = FRAMEWORKS.find(f => f.id === frameworkId);
  if (!fw || !scores[frameworkId]) return 0;
  const vals = fw.controls.map(c => scores[frameworkId][c] ?? 50);
  return Math.round(vals.reduce((a, b) => a + b, 0) / vals.length);
}

function initScores(frameworkId) {
  const fw = FRAMEWORKS.find(f => f.id === frameworkId);
  if (!fw) return {};
  return Object.fromEntries(fw.controls.map(c => [c, 50]));
}

function buildReport(selected, scores) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric',
  });

  const selectedFws = FRAMEWORKS.filter(f => selected.has(f.id));
  const overallAvg = Math.round(
    selectedFws.reduce((sum, fw) => sum + avgScore(fw.id, scores), 0) / selectedFws.length
  );

  const lines = [
    'COMPLIANCE DASHBOARD REPORT',
    `Generated: ${date}`,
    '',
    `OVERALL COMPLIANCE SCORE: ${overallAvg}% \u2014 ${ratingLabel(overallAvg)}`,
    '',
    'FRAMEWORK BREAKDOWN',
    '\u2500'.repeat(33),
    ...selectedFws.flatMap(fw => {
      const avg = avgScore(fw.id, scores);
      const controlLines = fw.controls.map(c => {
        const val = scores[fw.id]?.[c] ?? 50;
        return `  ${c}: ${val}%`;
      });
      return [`${fw.name}: ${avg}%`, ...controlLines, ''];
    }),
    'Prepared using Majid Mumtaz Audit Intelligence Tools',
  ];

  return lines.join('\n');
}

// ─── CUSTOM RADAR TOOLTIP ────────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 px-3 py-2 text-xs shadow-md">
        {payload.map((entry, i) => (
          <div key={i} style={{ color: entry.color }} className="font-bold">
            {entry.payload.subject}: {entry.value}%
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const ComplianceDashboard = () => {
  const [selected, setSelected] = useState(new Set());
  const [scores, setScores] = useState({});
  const [activeFramework, setActiveFramework] = useState(null);
  const [copied, setCopied] = useState(false);

  // ── Handlers ──────────────────────────────────────────────────────
  const toggleFramework = useCallback((id) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        // If we removed the active framework, clear it
        setActiveFramework(af => af === id ? null : af);
      } else {
        next.add(id);
        setScores(s => ({ ...s, [id]: s[id] ?? initScores(id) }));
        setActiveFramework(id);
      }
      return next;
    });
  }, []);

  const handleSlider = useCallback((frameworkId, control, value) => {
    setScores(prev => ({
      ...prev,
      [frameworkId]: { ...prev[frameworkId], [control]: Number(value) },
    }));
  }, []);

  const handleCopy = async () => {
    const report = buildReport(selected, scores);
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      const el = document.getElementById('compliance-report-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // ── Derived ───────────────────────────────────────────────────────
  const selectedFws = FRAMEWORKS.filter(f => selected.has(f.id));

  const radarData = selectedFws.map(fw => ({
    subject: fw.name,
    score: avgScore(fw.id, scores),
    color: fw.color,
  }));

  const overallScore = selectedFws.length > 0
    ? Math.round(selectedFws.reduce((sum, fw) => sum + avgScore(fw.id, scores), 0) / selectedFws.length)
    : 0;

  const activeFw = FRAMEWORKS.find(f => f.id === activeFramework);

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* ── Step 1: Framework Selector ───────────────────────────── */}
      <div className="mb-8">
        <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
          Step 1
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-1">Select Regulatory Frameworks</h2>
        <p className="text-sm text-slate-500 mb-5">
          Choose one or more frameworks to assess your compliance posture.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {FRAMEWORKS.map(fw => {
            const isSelected = selected.has(fw.id);
            return (
              <motion.button
                key={fw.id}
                onClick={() => toggleFramework(fw.id)}
                whileTap={{ scale: 0.98 }}
                className={`
                  relative text-left p-5 border-2 transition-all duration-200
                  ${isSelected
                    ? 'border-[#001F5B] bg-[#001F5B]/5'
                    : 'border-slate-200 bg-white hover:border-slate-400'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 w-5 h-5 bg-[#001F5B] flex items-center justify-center flex-shrink-0">
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
                <div
                  className="w-2.5 h-2.5 mb-3 flex-shrink-0"
                  style={{ backgroundColor: fw.color }}
                />
                <div className="text-sm font-black text-slate-900 mb-1 pr-6">{fw.name}</div>
                <div className="text-[11px] text-slate-500 leading-relaxed">{fw.tagline}</div>
              </motion.button>
            );
          })}
        </div>

        <AnimatePresence>
          {selected.size > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 4 }}
              className="mt-5"
            >
              <button
                onClick={() => {
                  const firstSelected = FRAMEWORKS.find(f => selected.has(f.id));
                  if (firstSelected && !activeFramework) setActiveFramework(firstSelected.id);
                  document.getElementById('compliance-scoring-panel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }}
                className="flex items-center gap-2.5 px-6 py-3 bg-[#001F5B] border-2 border-[#001F5B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#002d87] transition-colors"
              >
                Score Your Frameworks
                <svg width="14" height="10" viewBox="0 0 14 10" fill="none">
                  <path d="M1 5H13M9 1L13 5L9 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Step 2: Scoring Panel ────────────────────────────────── */}
      <AnimatePresence>
        {selected.size > 0 && (
          <motion.div
            id="compliance-scoring-panel"
            key="scoring"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="mb-8"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
              Step 2
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-1">Score Control Areas</h2>
            <p className="text-sm text-slate-500 mb-5">
              Rate your compliance level (0–100%) for each key control area.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-4">

              {/* Left: Framework tabs */}
              <div className="flex flex-col gap-1.5">
                {selectedFws.map(fw => {
                  const isActive = activeFramework === fw.id;
                  const avg = avgScore(fw.id, scores);
                  return (
                    <button
                      key={fw.id}
                      onClick={() => setActiveFramework(fw.id)}
                      className={`
                        flex items-center justify-between px-4 py-3 border text-left transition-all duration-150
                        ${isActive
                          ? 'bg-[#001F5B] border-[#001F5B] text-white'
                          : 'bg-white border-slate-200 text-slate-700 hover:border-slate-400'
                        }
                      `}
                    >
                      <span className="text-[11px] font-black leading-tight pr-2">{fw.name}</span>
                      <span
                        className={`
                          text-[10px] font-black px-1.5 py-0.5 flex-shrink-0
                          ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}
                        `}
                      >
                        {avg}%
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* Right: Sliders */}
              <div className="bg-white border border-slate-200 p-6 min-h-[300px]">
                <AnimatePresence mode="wait">
                  {activeFw ? (
                    <motion.div
                      key={activeFw.id}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -12 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                    >
                      <div className="flex items-center gap-2 mb-5">
                        <div
                          className="w-2.5 h-2.5 flex-shrink-0"
                          style={{ backgroundColor: activeFw.color }}
                        />
                        <span className="text-sm font-black text-slate-900">{activeFw.name}</span>
                      </div>

                      <div className="space-y-6">
                        {activeFw.controls.map(control => {
                          const val = scores[activeFw.id]?.[control] ?? 50;
                          return (
                            <div key={control}>
                              <div className="flex items-center justify-between mb-2">
                                <span className="text-[11px] font-bold text-slate-700 leading-tight pr-4">
                                  {control}
                                </span>
                                <span
                                  className="text-[11px] font-black flex-shrink-0"
                                  style={{ color: scoreColor(val) }}
                                >
                                  {val}%
                                </span>
                              </div>
                              <input
                                type="range"
                                min={0}
                                max={100}
                                step={1}
                                value={val}
                                onChange={e => handleSlider(activeFw.id, control, e.target.value)}
                                className="w-full h-1.5 appearance-none cursor-pointer accent-[#001F5B]"
                                style={{ accentColor: '#001F5B' }}
                              />
                              <div className="h-1 mt-1.5 bg-slate-100 overflow-hidden">
                                <motion.div
                                  className={`h-full ${scoreBarClass(val)}`}
                                  animate={{ width: `${val}%` }}
                                  transition={{ duration: 0.2, ease: 'easeOut' }}
                                />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div
                      key="placeholder"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center justify-center h-48 text-center"
                    >
                      <div>
                        <ShieldCheck className="w-8 h-8 text-slate-300 mx-auto mb-3" />
                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                          Select a framework from the left to begin scoring
                        </p>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Radar Chart ─────────────────────────────────────────── */}
      <AnimatePresence>
        {selectedFws.length > 0 && (
          <motion.div
            key="radar"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border border-slate-200 p-6 mb-8"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">
              Compliance Posture Radar
            </div>
            <p className="text-[10px] text-slate-400 mb-5 leading-relaxed">
              Each axis represents a selected framework. The polygon surface reflects your average compliance score per framework.
            </p>
            <ResponsiveContainer width="100%" height={320}>
              <RadarChart
                data={radarData}
                margin={{ top: 16, right: 40, bottom: 16, left: 40 }}
              >
                <PolarGrid stroke="#e2e8f0" />
                <PolarAngleAxis
                  dataKey="subject"
                  tick={{ fontSize: 10, fontWeight: 700, fill: '#475569' }}
                />
                <PolarRadiusAxis
                  angle={90}
                  domain={[0, 100]}
                  tick={{ fontSize: 9, fill: '#94a3b8' }}
                  tickCount={6}
                />
                <Radar
                  name="Compliance Score"
                  dataKey="score"
                  stroke="#001F5B"
                  fill="#001F5B"
                  fillOpacity={0.15}
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, index } = props;
                    const fw = radarData[index];
                    return (
                      <circle
                        key={index}
                        cx={cx}
                        cy={cy}
                        r={4}
                        fill={fw?.color ?? '#001F5B'}
                        stroke="white"
                        strokeWidth={1.5}
                      />
                    );
                  }}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend
                  wrapperStyle={{
                    fontSize: '10px',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.1em',
                  }}
                />
              </RadarChart>
            </ResponsiveContainer>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Results Summary ─────────────────────────────────────── */}
      <AnimatePresence>
        {selectedFws.length > 0 && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className="bg-white border-2 border-slate-200 p-7 mb-6"
          >
            {/* Overall score */}
            <div className="flex items-start justify-between mb-7 flex-wrap gap-4">
              <div>
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-1">
                  Overall Compliance Score
                </div>
                <div
                  className="text-5xl font-black leading-none mb-2"
                  style={{ color: scoreColor(overallScore) }}
                >
                  {overallScore}%
                </div>
                <div
                  className="text-sm font-black uppercase tracking-widest"
                  style={{ color: scoreColor(overallScore) }}
                >
                  {ratingLabel(overallScore)}
                </div>
              </div>
              <div className="text-right">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">
                  Rating Scale
                </div>
                {[
                  { range: '85 – 100', label: 'Strong', color: '#001F5B' },
                  { range: '70 – 84', label: 'Adequate', color: '#16a34a' },
                  { range: '50 – 69', label: 'Developing', color: '#d97706' },
                  { range: '0 – 49', label: 'Non-Compliant', color: '#991b1b' },
                ].map(item => (
                  <div key={item.label} className="flex items-center gap-2 justify-end mb-1">
                    <span className="text-[10px] text-slate-500">{item.range}</span>
                    <span
                      className="text-[10px] font-black uppercase tracking-wider w-28 text-right"
                      style={{ color: item.color }}
                    >
                      {item.label}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Per-framework table */}
            <div className="mb-7">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                Framework Breakdown
              </div>
              <div className="border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#001F5B] text-white">
                      <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-[10px]">Framework</th>
                      <th className="text-center px-5 py-3 font-black uppercase tracking-widest text-[10px]">Score</th>
                      <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-[10px]">Rating</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {selectedFws.map(fw => {
                      const avg = avgScore(fw.id, scores);
                      return (
                        <tr key={fw.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 flex-shrink-0" style={{ backgroundColor: fw.color }} />
                              <span className="font-black text-slate-900">{fw.name}</span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <div className="flex items-center gap-2 justify-center">
                              <div className="w-20 h-1.5 bg-slate-100 overflow-hidden">
                                <div
                                  className={`h-full ${scoreBarClass(avg)}`}
                                  style={{ width: `${avg}%` }}
                                />
                              </div>
                              <span className="font-bold text-slate-700 w-8 text-right flex-shrink-0">
                                {avg}%
                              </span>
                            </div>
                          </td>
                          <td className="px-5 py-3.5">
                            <span
                              className="text-[10px] font-black uppercase tracking-wider"
                              style={{ color: scoreColor(avg) }}
                            >
                              {ratingLabel(avg)}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Copy report */}
            <div className="flex items-center gap-4 flex-wrap">
              <button
                onClick={handleCopy}
                className={`
                  flex items-center gap-2.5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em]
                  border transition-all duration-200
                  ${copied
                    ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                    : 'bg-[#001F5B] border-[#001F5B] text-white hover:bg-[#002d87]'
                  }
                `}
              >
                {copied
                  ? <><CheckCheck className="w-3.5 h-3.5" /> Report Copied</>
                  : <><ClipboardCopy className="w-3.5 h-3.5" /> Copy Report</>
                }
              </button>
            </div>

            {/* Hidden textarea for clipboard fallback */}
            <textarea
              id="compliance-report-raw"
              readOnly
              className="sr-only"
              aria-hidden="true"
              value={buildReport(selected, scores)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy Notice ──────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-slate-400 mt-2">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          This tool runs entirely in your browser. No data is transmitted or stored.
        </span>
      </div>

      {/* Disclaimer */}
      <div className="flex items-start gap-2 mt-4">
        <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
        <p className="text-[10px] text-amber-600 leading-relaxed">
          This dashboard is a decision-support tool. Scores are self-assessed and should be validated by a qualified compliance professional before use in formal reporting.
        </p>
      </div>

    </div>
  );
};

export default ComplianceDashboard;
