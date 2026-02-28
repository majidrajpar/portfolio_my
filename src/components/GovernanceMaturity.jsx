import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  ResponsiveContainer, Tooltip, Legend,
} from 'recharts';
import {
  ClipboardCopy, CheckCheck, Lock, AlertTriangle,
  ChevronRight, ChevronLeft, RotateCcw, Shield,
  TrendingUp, CheckCircle2,
} from 'lucide-react';
import modelData from '../data/governance-maturity-model.json';

// ─── DOMAINS ─────────────────────────────────────────────────────────
const DOMAINS = [
  {
    id: 'board',
    label: 'Board & Leadership',
    short: 'Board',
    questions: [
      'The board has clearly defined governance responsibilities and an approved charter.',
      'Independent non-executive directors form a majority of the board.',
      'Board committees (Audit, Risk, Remuneration) are established with formal terms of reference.',
      'Board effectiveness is formally evaluated at least annually.',
      'Leadership sets a clear tone from the top on ethics and accountability.',
    ],
  },
  {
    id: 'risk',
    label: 'Risk Management',
    short: 'Risk',
    questions: [
      'A formal enterprise risk management framework is in place and board-approved.',
      'A risk appetite statement has been defined and communicated across the organisation.',
      'Risk registers are maintained and reviewed on a regular cadence.',
      'Key Risk Indicators (KRIs) are monitored with defined escalation thresholds.',
      'Risk management is integrated into strategic planning and decision-making.',
    ],
  },
  {
    id: 'controls',
    label: 'Internal Controls',
    short: 'Controls',
    questions: [
      'Internal controls are documented across all material business processes.',
      'Segregation of duties is enforced in financial and operational processes.',
      'Control design and operating effectiveness are tested at least annually.',
      'Control deficiencies are tracked and remediated through a formal process.',
      'An internal audit function exists with a risk-based annual plan.',
    ],
  },
  {
    id: 'ethics',
    label: 'Ethics & Integrity',
    short: 'Ethics',
    questions: [
      'A code of conduct is documented, communicated, and signed off by all staff.',
      'An anonymous whistleblowing mechanism is in place and actively promoted.',
      'Conflicts of interest are formally disclosed and managed.',
      'Ethics and compliance training is delivered at least annually.',
      'Violations of the code of conduct are investigated and addressed consistently.',
    ],
  },
  {
    id: 'compliance',
    label: 'Compliance & Regulation',
    short: 'Compliance',
    questions: [
      'All applicable regulatory requirements have been identified and documented.',
      'Compliance monitoring is performed on a defined schedule with evidence retained.',
      'Regulatory changes are tracked and assessed for organisational impact.',
      'Non-compliance issues are reported to leadership and remediated promptly.',
      'The organisation has never received a material regulatory sanction or finding.',
    ],
  },
  {
    id: 'reporting',
    label: 'Reporting & Transparency',
    short: 'Reporting',
    questions: [
      'Financial statements are prepared in accordance with applicable accounting standards.',
      'Board and management receive regular, accurate governance and risk reports.',
      'Disclosures to external stakeholders meet regulatory and best-practice standards.',
      'A formal investor relations or stakeholder communication process exists.',
      'The organisation publishes an annual governance or sustainability report.',
    ],
  },
];

const SCALE_OPTIONS = [
  { value: 1, label: 'Strongly Disagree' },
  { value: 2, label: 'Disagree' },
  { value: 3, label: 'Neutral' },
  { value: 4, label: 'Agree' },
  { value: 5, label: 'Strongly Agree' },
];

// ─── MATURITY CONFIG ──────────────────────────────────────────────────
const MATURITY_CONFIG = {
  Initial: {
    level: 1,
    color: '#ef4444',
    textClass: 'text-red-500',
    bgClass: 'bg-red-500/10',
    borderClass: 'border-red-500/40',
    barClass: 'bg-red-500',
    description: 'Ad hoc and reactive. No formal governance processes.',
  },
  Developing: {
    level: 2,
    color: '#f97316',
    textClass: 'text-orange-500',
    bgClass: 'bg-orange-500/10',
    borderClass: 'border-orange-500/40',
    barClass: 'bg-orange-500',
    description: 'Processes emerging but inconsistently applied.',
  },
  Defined: {
    level: 3,
    color: '#eab308',
    textClass: 'text-yellow-500',
    bgClass: 'bg-yellow-500/10',
    borderClass: 'border-yellow-500/40',
    barClass: 'bg-yellow-500',
    description: 'Standardised processes documented and communicated.',
  },
  Managed: {
    level: 4,
    color: '#22c55e',
    textClass: 'text-green-500',
    bgClass: 'bg-green-500/10',
    borderClass: 'border-green-500/40',
    barClass: 'bg-green-500',
    description: 'Processes measured and controlled with metrics.',
  },
  Optimising: {
    level: 5,
    color: '#3b82f6',
    textClass: 'text-blue-500',
    bgClass: 'bg-blue-500/10',
    borderClass: 'border-blue-500/40',
    barClass: 'bg-blue-500',
    description: 'Continuous improvement and best-practice alignment.',
  },
};

// ─── IMPROVEMENT SUGGESTIONS ──────────────────────────────────────────
const IMPROVEMENTS = {
  board: [
    'Conduct an independent board effectiveness evaluation.',
    'Establish board committee terms of reference and annual work plans.',
    'Appoint independent non-executive directors to meet best-practice composition.',
  ],
  risk: [
    'Design and board-approve an ERM framework with risk appetite statement.',
    'Implement quarterly risk register reviews with KRI monitoring dashboard.',
    'Integrate risk assessment into annual strategic planning cycle.',
  ],
  controls: [
    'Document all material processes with risk and control matrices.',
    'Establish an IIA-aligned internal audit function with a risk-based plan.',
    'Implement deficiency tracking with formal remediation timelines.',
  ],
  ethics: [
    'Launch an anonymous whistleblowing channel with investigation protocol.',
    'Introduce annual mandatory ethics training for all staff.',
    'Implement conflict-of-interest disclosure process with senior management sign-off.',
  ],
  compliance: [
    'Map all applicable regulatory requirements with owners and monitoring schedules.',
    'Establish a compliance calendar with evidence retention process.',
    'Implement regulatory change management to assess impact on the organisation.',
  ],
  reporting: [
    'Produce an annual governance report covering board activities and risk oversight.',
    'Implement a structured board reporting pack with standardised KPIs.',
    'Review external disclosures against applicable regulatory reporting standards.',
  ],
};

// ─── ML INFERENCE ─────────────────────────────────────────────────────
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
    probabilities: Object.fromEntries(
      model.classes.map((c, i) => [c, Math.round(probs[i] * 100)])
    ),
  };
}

// ─── DOMAIN BAND HELPER ───────────────────────────────────────────────
function domainBand(score) {
  if (score <= 1.8) return 'Initial';
  if (score <= 2.6) return 'Developing';
  if (score <= 3.5) return 'Defined';
  if (score <= 4.4) return 'Managed';
  return 'Optimising';
}

// ─── PROGRESS DOTS ────────────────────────────────────────────────────
function ProgressDots({ domainIdx, answers }) {
  const domain = DOMAINS[domainIdx];
  const answered = domain.questions.filter((_, qi) => answers[`${domain.id}_${qi}`] !== null).length;
  return (
    <div className="flex items-center gap-1">
      {domain.questions.map((_, qi) => (
        <div
          key={qi}
          className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
            answers[`${domain.id}_${qi}`] !== null ? 'bg-[#001F5B]' : 'bg-slate-200'
          }`}
        />
      ))}
    </div>
  );
}

// ─── CUSTOM RADAR TOOLTIP ─────────────────────────────────────────────
function CustomRadarTooltip({ active, payload, label }) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="bg-white border border-slate-200 shadow-lg px-4 py-3 text-xs">
      <div className="font-black text-slate-800 mb-1">{label}</div>
      {payload.map((p, i) => (
        <div key={i} className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: p.color }} />
          <span className="text-slate-600">{p.name}:</span>
          <span className="font-bold text-slate-800">{Number(p.value).toFixed(2)}</span>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────
const GovernanceMaturity = () => {
  const totalQuestions = DOMAINS.length * 5; // 30

  // Build initial answers map: { board_0: null, board_1: null, ... }
  const initialAnswers = useMemo(() => {
    const obj = {};
    DOMAINS.forEach(d => {
      d.questions.forEach((_, qi) => { obj[`${d.id}_${qi}`] = null; });
    });
    return obj;
  }, []);

  const [answers, setAnswers] = useState(initialAnswers);
  const [currentTab, setCurrentTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // Answered count
  const answeredCount = Object.values(answers).filter(v => v !== null).length;
  const allAnswered = answeredCount === totalQuestions;

  // Domain averages
  const domainAvgs = useMemo(() =>
    DOMAINS.map(d => {
      const vals = d.questions.map((_, qi) => answers[`${d.id}_${qi}`]).filter(v => v !== null);
      if (vals.length === 0) return 0;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    }),
    [answers]
  );

  // ML prediction (only when all answered)
  const prediction = useMemo(() => {
    if (!allAnswered) return null;
    const inputs = domainAvgs; // [board, risk, controls, ethics, compliance, reporting]
    return mlPredict(inputs, modelData);
  }, [allAnswered, domainAvgs]);

  const maturityCfg = prediction ? MATURITY_CONFIG[prediction.className] : null;

  // Radar chart data
  const radarData = useMemo(() =>
    DOMAINS.map((d, i) => ({
      domain: d.short,
      'Your Score': parseFloat(domainAvgs[i].toFixed(2)),
      'Best Practice': 4.5,
    })),
    [domainAvgs]
  );

  // Gap analysis: 2 lowest-scoring domains (when all answered)
  const gapDomains = useMemo(() => {
    if (!allAnswered) return [];
    return DOMAINS
      .map((d, i) => ({ ...d, avg: domainAvgs[i] }))
      .sort((a, b) => a.avg - b.avg)
      .slice(0, 2);
  }, [allAnswered, domainAvgs]);

  // Roadmap: top 3 bullets from lowest domain, then second lowest
  const roadmapActions = useMemo(() => {
    if (gapDomains.length === 0) return [];
    const actions = [];
    gapDomains.forEach(d => {
      IMPROVEMENTS[d.id].forEach(a => actions.push({ domain: d.label, action: a }));
    });
    return actions.slice(0, 3);
  }, [gapDomains]);

  const handleAnswer = (domainId, qIdx, value) => {
    setAnswers(prev => ({ ...prev, [`${domainId}_${qIdx}`]: value }));
  };

  const handleReset = () => {
    setAnswers(initialAnswers);
    setCurrentTab(0);
    setCopied(false);
  };

  // Build copy report text
  const buildReport = () => {
    if (!prediction || !maturityCfg) return '';
    const lines = [
      'GOVERNANCE MATURITY ASSESSMENT REPORT',
      '======================================',
      `Overall Maturity Level: ${maturityCfg.level} — ${prediction.className}`,
      `Confidence: ${prediction.confidence}%`,
      `${maturityCfg.description}`,
      '',
      'DOMAIN SCORES',
      '-------------',
      ...DOMAINS.map((d, i) => {
        const avg = domainAvgs[i];
        const band = domainBand(avg);
        return `${d.label}: ${avg.toFixed(2)} / 5.00  [${band}]`;
      }),
      '',
      'PROBABILITY DISTRIBUTION',
      '------------------------',
      ...modelData.classes.map(c => `${c}: ${prediction.probabilities[c]}%`),
      '',
      'GAP ANALYSIS — LOWEST-SCORING DOMAINS',
      '--------------------------------------',
      ...gapDomains.map(d => `${d.label}: ${d.avg.toFixed(2)} / 5.00\n  Suggestions:\n${IMPROVEMENTS[d.id].map(s => `  - ${s}`).join('\n')}`),
      '',
      'IMPROVEMENT ROADMAP (TOP PRIORITIES)',
      '-------------------------------------',
      ...roadmapActions.map((a, i) => `${i + 1}. [${a.domain}] ${a.action}`),
      '',
      'Privacy: This assessment was completed entirely in your browser. No data was transmitted or stored.',
    ];
    return lines.join('\n');
  };

  const handleCopy = async () => {
    const text = buildReport();
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.getElementById('gov-report-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const currentDomain = DOMAINS[currentTab];
  const currentDomainAnsweredCount = currentDomain.questions.filter(
    (_, qi) => answers[`${currentDomain.id}_${qi}`] !== null
  ).length;

  return (
    <div className="w-full max-w-5xl mx-auto">

      {/* ── Scope indicator ── */}
      <div className="flex items-center gap-3 mb-5 flex-wrap">
        {['6 domains', '5 questions each', '~5 min', 'Instant ML result'].map((item, i, arr) => (
          <React.Fragment key={item}>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{item}</span>
            {i < arr.length - 1 && <span className="text-slate-200 font-bold">·</span>}
          </React.Fragment>
        ))}
      </div>

      {/* ── Overall progress bar ── */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">
            Overall Progress
          </span>
          <span className="text-[10px] font-black text-[#001F5B]">
            {answeredCount} / {totalQuestions} questions
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 overflow-hidden">
          <motion.div
            className="h-full bg-[#001F5B]"
            animate={{ width: `${(answeredCount / totalQuestions) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Domain tabs ── */}
      <div className="flex flex-wrap gap-2 mb-8">
        {DOMAINS.map((d, idx) => {
          const domainAnswered = d.questions.filter(
            (_, qi) => answers[`${d.id}_${qi}`] !== null
          ).length;
          const isComplete = domainAnswered === 5;
          const isActive = currentTab === idx;
          return (
            <button
              key={d.id}
              onClick={() => setCurrentTab(idx)}
              className={`flex items-center gap-2 px-4 py-2.5 border text-[10px] font-black uppercase tracking-widest transition-all duration-200 ${
                isActive
                  ? 'bg-[#001F5B] border-[#001F5B] text-white'
                  : isComplete
                  ? 'bg-slate-50 border-slate-300 text-slate-600 hover:border-[#001F5B]/40'
                  : 'bg-white border-slate-200 text-slate-400 hover:border-slate-400 hover:text-slate-600'
              }`}
            >
              {isComplete && !isActive && (
                <CheckCircle2 className="w-3 h-3 text-green-500 flex-shrink-0" />
              )}
              <span>{d.short}</span>
              {!isComplete && (
                <ProgressDots domainIdx={idx} answers={answers} />
              )}
              {isComplete && (
                <span className={`text-[9px] ${isActive ? 'text-white/70' : 'text-green-500'}`}>
                  5/5
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Question panel ── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentTab}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="bg-white border border-slate-200 p-8 mb-6"
        >
          <div className="mb-6">
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1 block">
              Domain {currentTab + 1} of {DOMAINS.length}
            </span>
            <h2 className="text-2xl font-black text-slate-900 leading-tight">
              {currentDomain.label}
            </h2>
            <p className="text-[10px] text-slate-400 mt-1">
              {currentDomainAnsweredCount} of 5 questions answered
            </p>
          </div>

          <div className="space-y-7">
            {currentDomain.questions.map((question, qi) => {
              const key = `${currentDomain.id}_${qi}`;
              const selected = answers[key];
              return (
                <div key={qi}>
                  <p className="text-sm font-bold text-slate-800 mb-3 leading-snug">
                    <span className="text-[#001F5B] mr-2 font-black">{qi + 1}.</span>
                    {question}
                  </p>
                  {/* 5-button horizontal radio group */}
                  <div className="grid grid-cols-5 gap-1.5">
                    {SCALE_OPTIONS.map(opt => {
                      const isSelected = selected === opt.value;
                      return (
                        <button
                          key={opt.value}
                          onClick={() => handleAnswer(currentDomain.id, qi, opt.value)}
                          title={opt.label}
                          className={`
                            flex flex-col items-center justify-center px-2 py-3 border text-center
                            transition-all duration-200 cursor-pointer
                            ${isSelected
                              ? 'bg-[#001F5B] border-[#001F5B] text-white'
                              : 'bg-white border-slate-200 text-slate-500 hover:border-[#001F5B]/40 hover:text-slate-800 hover:bg-slate-50'
                            }
                          `}
                        >
                          <span className={`text-base font-black leading-none mb-1 ${isSelected ? 'text-white' : 'text-slate-400'}`}>
                            {opt.value}
                          </span>
                          <span className={`text-[9px] font-bold leading-tight ${isSelected ? 'text-white/80' : 'text-slate-400'}`}>
                            {opt.label}
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
      </AnimatePresence>

      {/* ── Navigation ── */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => setCurrentTab(t => Math.max(0, t - 1))}
          disabled={currentTab === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-400 hover:text-slate-700 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-400 hover:border-slate-400 hover:text-slate-700 transition-all"
        >
          <RotateCcw className="w-3 h-3" />
          Reset
        </button>

        <button
          onClick={() => setCurrentTab(t => Math.min(DOMAINS.length - 1, t + 1))}
          disabled={currentTab === DOMAINS.length - 1}
          className="flex items-center gap-2 px-5 py-2.5 bg-[#001F5B] border border-[#001F5B] text-[10px] font-black uppercase tracking-widest text-white hover:bg-[#002d87] disabled:opacity-30 disabled:cursor-not-allowed transition-all"
        >
          Next
          <ChevronRight className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* ── Privacy notice ── */}
      <div className="flex items-center gap-2 text-slate-400 mb-10">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          This tool runs entirely in your browser. No data is transmitted or stored.
        </span>
      </div>

      {/* ── Result panel ── */}
      <AnimatePresence>
        {allAnswered && prediction && maturityCfg && (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          >
            {/* ── 1. Maturity badge ── */}
            <div className={`border-2 p-8 mb-6 ${maturityCfg.borderClass} ${maturityCfg.bgClass}`}>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-4">
                  <div
                    className="w-14 h-14 flex items-center justify-center border-2 flex-shrink-0"
                    style={{ borderColor: maturityCfg.color, backgroundColor: `${maturityCfg.color}15` }}
                  >
                    <span className="font-black text-2xl" style={{ color: maturityCfg.color }}>
                      {maturityCfg.level}
                    </span>
                  </div>
                  <div>
                    <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">
                      Governance Maturity Level
                    </div>
                    <div className={`text-3xl font-black tracking-tight ${maturityCfg.textClass}`}>
                      {prediction.className}
                    </div>
                    <div className="text-xs text-slate-500 mt-0.5">{maturityCfg.description}</div>
                  </div>
                </div>
                <div
                  className={`px-4 py-2 border text-[10px] font-black uppercase tracking-[0.25em] self-start sm:self-auto ${maturityCfg.borderClass} ${maturityCfg.textClass} ${maturityCfg.bgClass}`}
                >
                  {prediction.confidence}% confidence
                </div>
              </div>

              {/* ── 4. Probability distribution ── */}
              <div className="mb-2">
                <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                  Probability Distribution
                </div>
                <div className="space-y-2">
                  {modelData.classes.map(cls => {
                    const cfg = MATURITY_CONFIG[cls];
                    const pct = prediction.probabilities[cls];
                    const isWinner = cls === prediction.className;
                    return (
                      <div key={cls} className="flex items-center gap-3">
                        <span className={`text-[10px] font-black uppercase tracking-widest w-20 flex-shrink-0 ${isWinner ? cfg.textClass : 'text-slate-400'}`}>
                          {cls}
                        </span>
                        <div className="flex-1 h-1.5 bg-slate-200 overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${pct}%` }}
                            transition={{ duration: 0.6, ease: 'easeOut', delay: 0.1 }}
                            className={`h-full ${isWinner ? cfg.barClass : 'bg-slate-300'}`}
                          />
                        </div>
                        <span className={`text-[10px] font-black w-8 text-right flex-shrink-0 ${isWinner ? cfg.textClass : 'text-slate-400'}`}>
                          {pct}%
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* ── 2. Radar chart ── */}
            <div className="bg-white border border-slate-200 p-8 mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
                Domain Radar
              </div>
              <h3 className="text-xl font-black text-slate-900 mb-6">
                Your Profile vs. Best Practice
              </h3>
              <ResponsiveContainer width="100%" height={340}>
                <RadarChart data={radarData} margin={{ top: 20, right: 30, bottom: 20, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#475569', fontFamily: 'Inter, sans-serif' }}
                  />
                  <PolarRadiusAxis
                    angle={90}
                    domain={[0, 5]}
                    tick={{ fontSize: 9, fill: '#94a3b8' }}
                    tickCount={6}
                  />
                  <Radar
                    name="Your Score"
                    dataKey="Your Score"
                    stroke="#001F5B"
                    strokeWidth={2}
                    fill="#001F5B"
                    fillOpacity={0.2}
                    dot={{ r: 3, fill: '#001F5B' }}
                  />
                  <Radar
                    name="Best Practice"
                    dataKey="Best Practice"
                    stroke="#10b981"
                    strokeWidth={2}
                    strokeDasharray="5 4"
                    fill="none"
                    fillOpacity={0}
                    dot={false}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', paddingTop: '12px' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* ── 3. Domain score table ── */}
            <div className="bg-white border border-slate-200 mb-6 overflow-hidden">
              <div className="px-8 py-5 border-b border-slate-100">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-0.5">
                  Domain Breakdown
                </div>
                <h3 className="text-xl font-black text-slate-900">Scores by Domain</h3>
              </div>
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-[#001F5B] text-white">
                    <th className="text-left px-6 py-3 font-black uppercase tracking-widest text-[10px]">Domain</th>
                    <th className="text-center px-4 py-3 font-black uppercase tracking-widest text-[10px]">Score (1–5)</th>
                    <th className="text-center px-4 py-3 font-black uppercase tracking-widest text-[10px]">Maturity Band</th>
                    <th className="text-right px-6 py-3 font-black uppercase tracking-widest text-[10px] hidden sm:table-cell">Bar</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {DOMAINS.map((d, i) => {
                    const avg = domainAvgs[i];
                    const band = domainBand(avg);
                    const cfg = MATURITY_CONFIG[band];
                    return (
                      <tr key={d.id} className="bg-white hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4 font-black text-slate-900">{d.label}</td>
                        <td className="px-4 py-4 text-center font-black text-slate-800">{avg.toFixed(2)}</td>
                        <td className="px-4 py-4 text-center">
                          <span className={`inline-block px-2.5 py-0.5 text-[9px] font-black uppercase tracking-widest ${cfg.bgClass} ${cfg.textClass}`}>
                            {band}
                          </span>
                        </td>
                        <td className="px-6 py-4 hidden sm:table-cell">
                          <div className="flex items-center justify-end">
                            <div className="w-24 h-1.5 bg-slate-100 overflow-hidden">
                              <div
                                className={`h-full ${cfg.barClass}`}
                                style={{ width: `${(avg / 5) * 100}%` }}
                              />
                            </div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* ── 5 & 6. Gap Analysis + Roadmap ── */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">

              {/* Gap Analysis */}
              <div className="bg-white border border-slate-200 p-8">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
                  Gap Analysis
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-5">
                  Priority Focus Areas
                </h3>
                {gapDomains.map(d => {
                  const band = domainBand(d.avg);
                  const cfg = MATURITY_CONFIG[band];
                  return (
                    <div key={d.id} className="mb-6 last:mb-0">
                      <div className="flex items-center justify-between mb-3">
                        <div className="font-black text-sm text-slate-800">{d.label}</div>
                        <span className={`text-[9px] font-black uppercase tracking-widest px-2 py-0.5 ${cfg.bgClass} ${cfg.textClass}`}>
                          {d.avg.toFixed(2)} — {band}
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {IMPROVEMENTS[d.id].map((s, si) => (
                          <li key={si} className="flex items-start gap-2.5">
                            <TrendingUp className="w-3 h-3 text-[#001F5B] flex-shrink-0 mt-0.5" />
                            <span className="text-[11px] text-slate-600 leading-snug">{s}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })}
              </div>

              {/* Improvement Roadmap */}
              <div className="bg-white border border-slate-200 p-8">
                <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
                  Improvement Roadmap
                </div>
                <h3 className="text-xl font-black text-slate-900 mb-5">
                  3 Prioritised Actions
                </h3>
                <ol className="space-y-5">
                  {roadmapActions.map((a, i) => (
                    <li key={i} className="flex items-start gap-4">
                      <div className="flex-shrink-0 w-7 h-7 bg-[#001F5B] text-white flex items-center justify-center font-black text-xs">
                        {i + 1}
                      </div>
                      <div>
                        <div className="text-[9px] font-black uppercase tracking-widest text-slate-400 mb-0.5">
                          {a.domain}
                        </div>
                        <div className="text-sm text-slate-700 leading-snug font-medium">{a.action}</div>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </div>

            {/* ── 7. Privacy + Copy ── */}
            <div className="bg-slate-50 border border-slate-200 p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <Lock className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-relaxed">
                      <span className="font-black text-slate-600 uppercase tracking-widest">Privacy — </span>
                      All responses are processed locally in your browser. No data is sent to any server or stored in any database.
                    </p>
                  </div>
                  <div className="flex items-start gap-2">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-600 leading-relaxed">
                      This tool is a decision-support aid. Results should be validated against a formal governance review conducted by a qualified professional.
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
              <textarea
                id="gov-report-raw"
                readOnly
                value={buildReport()}
                className="sr-only"
                aria-hidden="true"
              />
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Placeholder when not all answered */}
      <AnimatePresence>
        {!allAnswered && (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 p-10 text-center bg-slate-50"
          >
            <Shield className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
              Complete all {totalQuestions} questions across the {DOMAINS.length} domains to generate your maturity assessment
            </p>
            <p className="text-slate-300 text-[10px] mt-1">
              {totalQuestions - answeredCount} question{totalQuestions - answeredCount !== 1 ? 's' : ''} remaining
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default GovernanceMaturity;
