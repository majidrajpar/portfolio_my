import React, { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ReferenceLine, ResponsiveContainer, Cell,
} from 'recharts';
import {
  ChevronDown, ChevronUp, Lock, ClipboardCopy, CheckCheck,
  AlertTriangle, ShieldCheck, ShieldAlert, Shield, ShieldX,
} from 'lucide-react';
import modelData from '../data/icfr-control-model.json';

// ─── COSO COMPONENT DEFINITIONS ──────────────────────────────────────
const COSO_COMPONENTS = [
  {
    id: 'control_env',
    label: 'Control Environment',
    shortLabel: 'Ctrl Env',
    principles: [
      'Commitment to Integrity and Ethical Values — The organisation demonstrates a commitment to integrity and ethical values through its culture, tone from the top, and behavioural standards.',
      'Board Oversight Responsibility — The board of directors or governing body demonstrates independence and exercises oversight of internal controls.',
      'Organisational Structure — Management establishes structures, reporting lines, and appropriate authorities to pursue objectives.',
      'Commitment to Competence — The organisation demonstrates a commitment to attract, develop, and retain competent individuals.',
    ],
  },
  {
    id: 'risk_assess',
    label: 'Risk Assessment',
    shortLabel: 'Risk Assess',
    principles: [
      'Risk Identification — The organisation identifies risks to the achievement of its objectives across the entity and analyses risks to determine how they should be managed.',
      'Fraud Risk Assessment — The organisation considers the potential for fraud in assessing risks to the achievement of objectives.',
      'Change Management — The organisation identifies and assesses changes that could significantly impact the system of internal control.',
    ],
  },
  {
    id: 'control_activities',
    label: 'Control Activities',
    shortLabel: 'Ctrl Activities',
    principles: [
      'Control Selection and Development — The organisation selects and develops control activities that contribute to the mitigation of risks.',
      'IT Controls — The organisation selects and develops general control activities over technology to support the achievement of objectives.',
      'Policies and Procedures — The organisation deploys control activities through policies that establish what is expected and procedures that put policies into action.',
      'Segregation of Duties — Responsibilities are assigned to different individuals to reduce the risk of error or inappropriate actions.',
    ],
  },
  {
    id: 'info_comm',
    label: 'Information & Communication',
    shortLabel: 'Info & Comm',
    principles: [
      'Internal Communication — The organisation internally communicates information, including objectives and responsibilities for internal control.',
      'External Communication — The organisation communicates with external parties regarding matters affecting the functioning of internal control.',
      'Quality of Information — The organisation obtains or generates and uses relevant, quality information to support the functioning of internal control.',
    ],
  },
  {
    id: 'monitoring',
    label: 'Monitoring',
    shortLabel: 'Monitoring',
    principles: [
      'Ongoing Monitoring — The organisation selects, develops, and performs ongoing and/or separate evaluations to ascertain whether the components of internal control are present and functioning.',
      'Deficiency Reporting — The organisation evaluates and communicates internal control deficiencies in a timely manner to those parties responsible for taking corrective action.',
      'Management Review — Management uses the results of evaluations to confirm controls are present and functioning, and to identify deficiencies requiring remediation.',
    ],
  },
];

const TOTAL_PRINCIPLES = COSO_COMPONENTS.reduce((acc, c) => acc + c.principles.length, 0);

// ─── RATING SCALE ────────────────────────────────────────────────────
const RATING_LABELS = {
  1: 'Not Present',
  2: 'Partially Present',
  3: 'Generally Present',
  4: 'Substantially Present',
  5: 'Fully Effective',
};

const RATING_COLORS = {
  1: { selected: 'bg-red-600 border-red-600 text-white', unselected: 'border-red-300 text-red-500 hover:bg-red-50' },
  2: { selected: 'bg-orange-500 border-orange-500 text-white', unselected: 'border-orange-300 text-orange-500 hover:bg-orange-50' },
  3: { selected: 'bg-amber-500 border-amber-500 text-white', unselected: 'border-amber-300 text-amber-500 hover:bg-amber-50' },
  4: { selected: 'bg-lime-600 border-lime-600 text-white', unselected: 'border-lime-400 text-lime-600 hover:bg-lime-50' },
  5: { selected: 'bg-green-600 border-green-600 text-white', unselected: 'border-green-400 text-green-600 hover:bg-green-50' },
};

// ─── DEFICIENCY CONFIG ────────────────────────────────────────────────
const DEFICIENCY_CONFIG = {
  'No Deficiency': {
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    text: 'text-green-600',
    bar: 'bg-green-500',
    label: 'NO DEFICIENCY',
    message: 'Control environment is sound. Continue ongoing monitoring.',
    Icon: ShieldCheck,
  },
  'Control Deficiency': {
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    label: 'CONTROL DEFICIENCY',
    message: 'Minor gaps identified. Management remediation plan recommended.',
    Icon: Shield,
  },
  'Significant Deficiency': {
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    text: 'text-orange-600',
    bar: 'bg-orange-500',
    label: 'SIGNIFICANT DEFICIENCY',
    message: 'Material gaps require prompt senior management attention.',
    Icon: ShieldAlert,
  },
  'Material Weakness': {
    bg: 'bg-red-700/10',
    border: 'border-red-700/40',
    text: 'text-red-700',
    bar: 'bg-red-700',
    label: 'MATERIAL WEAKNESS',
    message: 'Serious deficiency requiring immediate board-level escalation.',
    Icon: ShieldX,
  },
};

// ─── REMEDIATION ACTIONS ──────────────────────────────────────────────
const REMEDIATION = {
  control_env: [
    'Formalise and communicate the code of conduct and ethical standards',
    'Establish board independence and oversight mechanisms for internal control',
    'Define organisational accountability and delegation of authority framework',
  ],
  risk_assess: [
    'Implement an annual fraud risk assessment programme',
    'Establish a formal risk identification and assessment process',
    'Develop a change management protocol for significant organisational changes',
  ],
  control_activities: [
    'Document Risk Control Matrices across all material business processes',
    'Strengthen IT General Controls (ITGCs) including access management and change control',
    'Enforce mandatory segregation of duties in financial and procurement processes',
  ],
  info_comm: [
    'Implement structured internal reporting on control performance and exceptions',
    'Establish an external communication protocol for regulators and auditors',
    'Define information quality standards and data governance requirements',
  ],
  monitoring: [
    'Establish a continuous monitoring programme with automated exception alerts',
    'Implement a formal deficiency tracking register with remediation timelines',
    'Schedule quarterly management reviews of internal control effectiveness',
  ],
};

// ─── SCORE TO ASSESSMENT BAND ─────────────────────────────────────────
function scoreToBand(score) {
  if (score <= 2.0) return 'Material Weakness';
  if (score <= 3.0) return 'Significant Deficiency';
  if (score <= 3.8) return 'Control Deficiency';
  return 'No Deficiency';
}

function bandToTextColor(band) {
  if (band === 'Material Weakness') return 'text-red-700';
  if (band === 'Significant Deficiency') return 'text-orange-600';
  if (band === 'Control Deficiency') return 'text-amber-600';
  return 'text-green-600';
}

function scoreToBarColor(score) {
  if (score <= 2) return '#dc2626';   // red-600
  if (score <= 3) return '#ea580c';   // orange-600
  if (score <= 4) return '#d97706';   // amber-600
  return '#16a34a';                   // green-600
}

// ─── ML INFERENCE ────────────────────────────────────────────────────
function polyFeatures(x, powers) {
  return powers.map(pw => x.reduce((acc, xi, i) => acc * Math.pow(xi, pw[i]), 1));
}

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function mlPredict(inputs, model) {
  const features = polyFeatures(inputs, model.poly_powers);
  const scaled = features.map((f, i) => (f - model.scaler_mean[i]) / model.scaler_scale[i]);
  const logits = model.coef.map(
    (weights, i) => weights.reduce((sum, w, j) => sum + w * scaled[j], 0) + model.intercept[i]
  );
  const probs = softmax(logits);
  const maxIdx = probs.indexOf(Math.max(...probs));
  return {
    className: model.classes[maxIdx],
    confidence: Math.round(probs[maxIdx] * 100),
    probabilities: Object.fromEntries(model.classes.map((c, i) => [c, Math.round(probs[i] * 100)])),
  };
}

// ─── COMPUTE COMPONENT AVERAGES ───────────────────────────────────────
function computeAverages(ratings) {
  return COSO_COMPONENTS.map((comp) => {
    const vals = comp.principles.map((_, pIdx) => ratings[comp.id]?.[pIdx] ?? null);
    const filled = vals.filter(v => v !== null);
    return filled.length === comp.principles.length
      ? filled.reduce((a, b) => a + b, 0) / filled.length
      : null;
  });
}

// ─── COPY REPORT BUILDER ──────────────────────────────────────────────
function buildReport(averages, prediction) {
  const date = new Date().toLocaleDateString('en-GB', { year: 'numeric', month: 'long', day: 'numeric' });
  const lines = [
    'INTERNAL CONTROL EVALUATION REPORT',
    `Generated: ${date}`,
    '',
    `OVERALL ASSESSMENT: ${prediction.className.toUpperCase()}`,
    `Model Confidence: ${prediction.confidence}%`,
    '',
    'COMPONENT SCORES',
    '─────────────────────────────────────',
  ];
  COSO_COMPONENTS.forEach((comp, i) => {
    const avg = averages[i];
    const score = avg !== null ? avg.toFixed(2) : 'N/A';
    const band = avg !== null ? scoreToBand(avg) : 'N/A';
    lines.push(`${comp.label}: ${score}/5.00  [${band}]`);
  });
  lines.push('');
  lines.push('PROBABILITY DISTRIBUTION');
  lines.push('─────────────────────────────────────');
  modelData.classes.forEach(cls => {
    lines.push(`${cls}: ${prediction.probabilities[cls]}%`);
  });
  const weakComponents = COSO_COMPONENTS.filter((_, i) => averages[i] !== null && scoreToBand(averages[i]) !== 'No Deficiency');
  if (weakComponents.length > 0) {
    lines.push('');
    lines.push('PRIORITY ACTION PLAN');
    lines.push('─────────────────────────────────────');
    weakComponents.forEach(comp => {
      lines.push(`\n${comp.label}:`);
      REMEDIATION[comp.id].forEach(action => lines.push(`  • ${action}`));
    });
  }
  lines.push('');
  lines.push('This report was generated using the Internal Control Evaluator — a browser-based ML tool.');
  lines.push('All processing was performed locally. No data was transmitted or stored.');
  return lines.join('\n');
}

// ─── CUSTOM RECHARTS TOOLTIP ──────────────────────────────────────────
const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || !payload.length) return null;
  const { name, value } = payload[0].payload;
  const band = scoreToBand(value);
  const cfg = DEFICIENCY_CONFIG[band];
  return (
    <div className="bg-white border border-slate-200 shadow-lg px-4 py-3 text-xs">
      <div className="font-black text-slate-800 mb-1">{name}</div>
      <div className="text-slate-500">Score: <span className="font-bold text-slate-900">{value.toFixed(2)} / 5.00</span></div>
      <div className={`font-bold mt-0.5 ${cfg.text}`}>{band}</div>
    </div>
  );
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const InternalControlEvaluator = () => {
  // ratings: { [componentId]: { [principleIndex]: rating (1-5) } }
  const [ratings, setRatings] = useState({});
  const [openSection, setOpenSection] = useState(0);
  const [copied, setCopied] = useState(false);

  // Count total rated principles
  const ratedCount = COSO_COMPONENTS.reduce((total, comp) => {
    const compRatings = ratings[comp.id] || {};
    return total + Object.keys(compRatings).length;
  }, 0);

  const allRated = ratedCount === TOTAL_PRINCIPLES;

  // Compute component averages
  const averages = computeAverages(ratings);

  // Run ML prediction when all rated
  const prediction = allRated
    ? mlPredict(averages, modelData)
    : null;

  const defConfig = prediction ? DEFICIENCY_CONFIG[prediction.className] : null;

  const handleRate = useCallback((compId, pIdx, value) => {
    setRatings(prev => {
      const updated = {
        ...prev,
        [compId]: { ...(prev[compId] || {}), [pIdx]: value },
      };
      // Auto-expand next section if this component is now fully rated
      const compIndex = COSO_COMPONENTS.findIndex(c => c.id === compId);
      const comp = COSO_COMPONENTS[compIndex];
      const compRatings = updated[compId] || {};
      const compComplete = comp.principles.every((_, i) => compRatings[i] !== undefined);
      if (compComplete && compIndex < COSO_COMPONENTS.length - 1) {
        setOpenSection(compIndex + 1);
      }
      return updated;
    });
  }, []);

  const handleReset = () => {
    setRatings({});
    setOpenSection(0);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!prediction) return;
    const report = buildReport(averages, prediction);
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      const el = document.getElementById('icfr-report-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  // Chart data
  const chartData = COSO_COMPONENTS.map((comp, i) => ({
    name: comp.shortLabel,
    value: averages[i] !== null ? parseFloat(averages[i].toFixed(2)) : 0,
    rated: averages[i] !== null,
  }));

  // Action plan
  const weakComponents = COSO_COMPONENTS.filter((_, i) => averages[i] !== null && scoreToBand(averages[i]) !== 'No Deficiency');

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            Assessment Progress
          </span>
          <span className="text-[10px] font-black text-[#001F5B]">
            {ratedCount} / {TOTAL_PRINCIPLES} principles rated
          </span>
        </div>
        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#001F5B] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(ratedCount / TOTAL_PRINCIPLES) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* Accordion sections */}
      <div className="space-y-3 mb-8">
        {COSO_COMPONENTS.map((comp, compIdx) => {
          const compRatings = ratings[comp.id] || {};
          const compRatedCount = Object.keys(compRatings).length;
          const compComplete = compRatedCount === comp.principles.length;
          const isOpen = openSection === compIdx;
          const avg = averages[compIdx];

          return (
            <div
              key={comp.id}
              className={`border transition-all duration-200 ${
                isOpen
                  ? 'border-[#001F5B] shadow-sm'
                  : compComplete
                    ? 'border-green-300 bg-green-50/30'
                    : 'border-slate-200 bg-white'
              }`}
            >
              {/* Accordion header */}
              <button
                onClick={() => setOpenSection(isOpen ? -1 : compIdx)}
                className={`w-full flex items-center justify-between px-6 py-5 text-left transition-colors ${
                  isOpen ? 'bg-[#001F5B]' : 'bg-white hover:bg-slate-50'
                }`}
              >
                <div className="flex items-center gap-4 min-w-0">
                  <span className={`
                    flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center
                    text-[10px] font-black border
                    ${isOpen
                      ? 'bg-white text-[#001F5B] border-white'
                      : compComplete
                        ? 'bg-green-500 text-white border-green-500'
                        : 'bg-slate-100 text-slate-500 border-slate-200'
                    }
                  `}>
                    {compComplete && !isOpen ? '✓' : compIdx + 1}
                  </span>
                  <div className="min-w-0">
                    <div className={`text-xs font-black uppercase tracking-[0.2em] ${isOpen ? 'text-white' : 'text-[#001F5B]'}`}>
                      {comp.label}
                    </div>
                    <div className={`text-[10px] mt-0.5 ${isOpen ? 'text-white/60' : 'text-slate-400'}`}>
                      {compRatedCount} / {comp.principles.length} principles rated
                      {avg !== null && ` · Avg ${avg.toFixed(2)}/5`}
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 flex-shrink-0">
                  {avg !== null && !isOpen && (
                    <span className={`text-[10px] font-black px-2.5 py-1 border ${DEFICIENCY_CONFIG[scoreToBand(avg)].text} ${DEFICIENCY_CONFIG[scoreToBand(avg)].border} ${DEFICIENCY_CONFIG[scoreToBand(avg)].bg}`}>
                      {scoreToBand(avg)}
                    </span>
                  )}
                  {isOpen
                    ? <ChevronUp className="w-4 h-4 text-white/60" />
                    : <ChevronDown className="w-4 h-4 text-slate-400" />
                  }
                </div>
              </button>

              {/* Accordion body */}
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    key="body"
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                    style={{ overflow: 'hidden' }}
                  >
                    <div className="px-6 pt-5 pb-6 space-y-6 bg-white">
                      {comp.principles.map((principle, pIdx) => {
                        const selected = compRatings[pIdx];
                        return (
                          <div key={pIdx}>
                            <div className="flex items-start gap-3 mb-3">
                              <span className="flex-shrink-0 w-5 h-5 rounded-full bg-slate-100 text-[10px] font-black text-slate-500 flex items-center justify-center mt-0.5">
                                {pIdx + 1}
                              </span>
                              <p className="text-xs text-slate-600 leading-relaxed">{principle}</p>
                            </div>
                            <div className="flex gap-2 ml-8 flex-wrap">
                              {[1, 2, 3, 4, 5].map(rating => {
                                const isSelected = selected === rating;
                                const colors = RATING_COLORS[rating];
                                return (
                                  <button
                                    key={rating}
                                    onClick={() => handleRate(comp.id, pIdx, rating)}
                                    title={RATING_LABELS[rating]}
                                    className={`
                                      flex-1 min-w-[3.5rem] px-2 py-2.5 border text-[10px] font-black
                                      uppercase tracking-wide transition-all duration-150 cursor-pointer
                                      flex flex-col items-center gap-0.5
                                      ${isSelected ? colors.selected : `bg-white ${colors.unselected}`}
                                    `}
                                  >
                                    <span className="text-sm font-black leading-none">{rating}</span>
                                    <span className={`leading-tight text-center ${isSelected ? 'opacity-90' : 'opacity-70'}`} style={{ fontSize: '8px' }}>
                                      {RATING_LABELS[rating]}
                                    </span>
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </div>

      {/* Privacy + Reset row */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            This tool runs entirely in your browser. No data is transmitted or stored.
          </span>
        </div>
        {ratedCount > 0 && (
          <button
            onClick={handleReset}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 px-3 py-1.5 hover:border-slate-400"
          >
            Reset
          </button>
        )}
      </div>

      {/* Placeholder when not all rated */}
      <AnimatePresence mode="wait">
        {!allRated && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 p-10 text-center bg-slate-50"
          >
            <ShieldCheck className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
              Rate all {TOTAL_PRINCIPLES} principles across the five COSO components to generate your assessment
            </p>
            {ratedCount > 0 && (
              <p className="text-slate-300 text-[10px] mt-2">
                {TOTAL_PRINCIPLES - ratedCount} remaining
              </p>
            )}
          </motion.div>
        )}

        {/* Results panel */}
        {allRated && prediction && defConfig && (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── 1. Overall Assessment Badge ── */}
            <div className={`border-2 p-8 mb-6 ${defConfig.border} ${defConfig.bg}`}>
              <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-3">
                  <defConfig.Icon className={`w-8 h-8 ${defConfig.text}`} />
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">
                      Overall Assessment
                    </div>
                    <div className={`text-2xl font-black tracking-tight ${defConfig.text}`}>
                      {defConfig.label}
                    </div>
                  </div>
                </div>
                <div className={`px-4 py-1.5 border text-[10px] font-black uppercase tracking-[0.25em] ${defConfig.border} ${defConfig.text} ${defConfig.bg}`}>
                  {prediction.confidence}% confidence
                </div>
              </div>
              <p className={`text-sm font-semibold mb-2 ${defConfig.text}`}>{defConfig.message}</p>
              <p className="text-[10px] text-slate-500 leading-relaxed">
                Confidence reflects model certainty over this combination of component scores. Apply professional judgement when interpreting results.
              </p>
            </div>

            {/* ── 2. Component Score Bar Chart ── */}
            <div className="bg-white border border-slate-200 p-6 mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-5">
                Component Score Overview (1–5 Scale)
              </div>
              <ResponsiveContainer width="100%" height={220}>
                <BarChart
                  data={chartData}
                  layout="horizontal"
                  margin={{ top: 4, right: 20, left: 0, bottom: 4 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis
                    dataKey="name"
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 5]}
                    ticks={[1, 2, 3, 4, 5]}
                    tick={{ fontSize: 10, fill: '#94a3b8' }}
                    axisLine={false}
                    tickLine={false}
                    width={24}
                  />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: '#f8fafc' }} />
                  <ReferenceLine
                    y={3.5}
                    stroke="#001F5B"
                    strokeDasharray="4 3"
                    strokeWidth={1.5}
                    label={{ value: '3.5 threshold', position: 'right', fontSize: 9, fill: '#001F5B', fontWeight: 700 }}
                  />
                  <Bar dataKey="value" radius={[2, 2, 0, 0]} maxBarSize={52}>
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.rated ? scoreToBarColor(entry.value) : '#e2e8f0'}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* ── 3. Probability Distribution ── */}
            <div className="bg-white border border-slate-200 p-6 mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
                Deficiency Probability Distribution
              </div>
              <div className="space-y-3">
                {modelData.classes.map((cls) => {
                  const cfg = DEFICIENCY_CONFIG[cls];
                  const pct = prediction.probabilities[cls];
                  const isWinner = cls === prediction.className;
                  return (
                    <div key={cls} className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-wider w-40 flex-shrink-0 ${isWinner ? cfg.text : 'text-slate-400'}`}>
                        {cls}
                      </span>
                      <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.7, ease: 'easeOut', delay: 0.1 }}
                          className={`h-full rounded-full ${isWinner ? cfg.bar : 'bg-slate-300'}`}
                        />
                      </div>
                      <span className={`text-[10px] font-black w-8 text-right flex-shrink-0 ${isWinner ? cfg.text : 'text-slate-400'}`}>
                        {pct}%
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 4. Deficiency Analysis Table ── */}
            <div className="bg-white border border-slate-200 mb-6 overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                  Deficiency Analysis by Component
                </div>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#001F5B] text-white">
                      <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-[10px]">Component</th>
                      <th className="text-center px-5 py-3 font-black uppercase tracking-widest text-[10px]">Score</th>
                      <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-[10px]">Assessment Band</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {COSO_COMPONENTS.map((comp, i) => {
                      const avg = averages[i];
                      const band = avg !== null ? scoreToBand(avg) : '—';
                      const textColor = avg !== null ? bandToTextColor(band) : 'text-slate-400';
                      return (
                        <tr key={comp.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-bold text-slate-800">{comp.label}</td>
                          <td className="px-5 py-3.5 text-center font-black text-slate-900">
                            {avg !== null ? avg.toFixed(2) : '—'}
                          </td>
                          <td className={`px-5 py-3.5 font-bold ${textColor}`}>{band}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="px-5 py-3 bg-slate-50 border-t border-slate-100">
                <div className="flex flex-wrap gap-x-6 gap-y-1">
                  {[
                    { range: '≤ 2.0', band: 'Material Weakness', color: 'text-red-700' },
                    { range: '≤ 3.0', band: 'Significant Deficiency', color: 'text-orange-600' },
                    { range: '≤ 3.8', band: 'Control Deficiency', color: 'text-amber-600' },
                    { range: '> 3.8', band: 'No Deficiency', color: 'text-green-600' },
                  ].map(({ range, band, color }) => (
                    <span key={band} className="text-[10px] text-slate-500">
                      <span className="font-bold text-slate-600">{range}</span>{' '}
                      <span className={`font-black ${color}`}>{band}</span>
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* ── 5. Priority Action Plan ── */}
            {weakComponents.length > 0 && (
              <div className="bg-white border border-slate-200 mb-6">
                <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-3">
                  <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                  <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
                    Priority Action Plan — Components Scoring Below 3.5
                  </div>
                </div>
                <div className="divide-y divide-slate-100">
                  {weakComponents.map((comp, idx) => {
                    const compAvg = averages[COSO_COMPONENTS.findIndex(c => c.id === comp.id)];
                    const band = compAvg !== null ? scoreToBand(compAvg) : '';
                    const cfg = DEFICIENCY_CONFIG[band] || {};
                    return (
                      <div key={comp.id} className="px-6 py-5">
                        <div className="flex items-center gap-3 mb-3">
                          <span className="text-[10px] font-black text-white bg-[#001F5B] px-2.5 py-1">
                            {idx + 1}
                          </span>
                          <div>
                            <span className="text-xs font-black text-slate-900">{comp.label}</span>
                            {compAvg !== null && (
                              <span className={`ml-2 text-[10px] font-black ${cfg.text}`}>
                                {compAvg.toFixed(2)}/5 · {band}
                              </span>
                            )}
                          </div>
                        </div>
                        <ul className="space-y-2 ml-10">
                          {REMEDIATION[comp.id].map((action, aIdx) => (
                            <li key={aIdx} className="flex items-start gap-2">
                              <span className="flex-shrink-0 w-1 h-1 rounded-full bg-[#001F5B] mt-1.5" />
                              <span className="text-xs text-slate-600 leading-relaxed">{action}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {weakComponents.length === 0 && (
              <div className="bg-green-50 border border-green-200 px-6 py-5 mb-6 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                <div>
                  <div className="text-xs font-black text-green-700 mb-1">All Components Above Threshold</div>
                  <p className="text-xs text-green-600 leading-relaxed">
                    All five COSO components score at or above 3.5. Continue ongoing monitoring and periodic reassessment to maintain control effectiveness.
                  </p>
                </div>
              </div>
            )}

            {/* ── 6. Privacy Notice + Copy Report ── */}
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="space-y-2">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-amber-600 leading-relaxed">
                    Exercise discretion before copying reports that may contain sensitive or confidential information.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                  <p className="text-[10px] text-slate-500 leading-relaxed">
                    This assessment is a decision-support tool. Always apply professional judgement and consider entity-specific context before finalising any control classification.
                  </p>
                </div>
              </div>
              <button
                onClick={handleCopy}
                className={`
                  flex items-center gap-2.5 px-5 py-3 text-[10px] font-black uppercase tracking-[0.2em]
                  border transition-all duration-200 flex-shrink-0
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

            {/* Hidden textarea for fallback copy */}
            {prediction && (
              <textarea
                id="icfr-report-raw"
                readOnly
                value={buildReport(averages, prediction)}
                className="sr-only"
                aria-hidden="true"
              />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default InternalControlEvaluator;
