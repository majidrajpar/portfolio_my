import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCopy, CheckCheck, ShieldAlert, Lock, AlertTriangle, ChevronRight, ChevronLeft } from 'lucide-react';
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
import modelData from '../data/fraud-risk-model.json';

// ─── DOMAIN DEFINITIONS ──────────────────────────────────────────────
const DOMAINS = [
  {
    id: 'opportunity',
    label: 'Opportunity',
    description: 'Assesses whether conditions exist that would allow fraud to occur — weak controls, limited oversight, or poor segregation of duties.',
    questions: [
      'Are there assets, cash, or systems with limited access controls?',
      'Could an employee override controls without supervisory detection?',
      'Are there significant gaps in segregation of duties?',
      'Is management oversight of transactions inconsistent or absent?',
      'Are physical or IT security controls weak or outdated?',
    ],
  },
  {
    id: 'pressure',
    label: 'Pressure / Incentive',
    description: 'Evaluates the financial and organisational pressures that may motivate individuals to commit fraud.',
    questions: [
      'Are employees under pressure to meet aggressive financial targets?',
      'Is compensation heavily tied to performance metrics or bonuses?',
      'Are there individuals facing significant personal financial difficulties?',
      'Does the organisation face significant external financial pressure?',
      'Are employees aware of potential layoffs or restructuring?',
    ],
  },
  {
    id: 'rationalization',
    label: 'Rationalization',
    description: 'Measures the degree to which employees may justify dishonest behaviour based on culture, fairness perceptions, or leadership example.',
    questions: [
      'Do employees believe policies are unfair or inconsistently enforced?',
      'Is there a culture of \'bending rules\' to get things done?',
      'Are ethics violations treated leniently without consistent consequences?',
      'Do employees feel undervalued or unfairly compensated?',
      'Is there a perception that \'everyone does it\' regarding policy breaches?',
    ],
  },
  {
    id: 'controls',
    label: 'Control Environment',
    description: 'Examines the strength of anti-fraud governance — tone from the top, whistleblowing, training, and fraud detection programmes.',
    questions: [
      'Is the tone from the top weak on ethics and integrity?',
      'Are whistleblowing mechanisms absent or not trusted by staff?',
      'Is fraud awareness training infrequent or ineffective?',
      'Are fraud risk assessments rarely conducted or documented?',
      'Is there no dedicated fraud detection monitoring programme?',
    ],
  },
];

// ─── RATING LABELS ───────────────────────────────────────────────────
const RATING_LABELS = ['Never', 'Rarely', 'Sometimes', 'Often', 'Always'];

// Color by rating value (1=green … 5=red)
const RATING_COLORS = {
  selected: ['bg-green-500', 'bg-lime-500', 'bg-amber-500', 'bg-orange-500', 'bg-red-600'],
  unselected: ['hover:border-green-400', 'hover:border-lime-400', 'hover:border-amber-400', 'hover:border-orange-400', 'hover:border-red-500'],
  text: ['text-green-700', 'text-lime-700', 'text-amber-700', 'text-orange-700', 'text-red-700'],
  border: ['border-green-500', 'border-lime-500', 'border-amber-500', 'border-orange-500', 'border-red-600'],
};

// ─── RISK CONFIG ─────────────────────────────────────────────────────
const RISK_CONFIG = {
  Low: {
    label: 'LOW',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    text: 'text-green-600',
    bar: 'bg-green-500',
    topBorder: 'border-t-green-500',
  },
  Medium: {
    label: 'MEDIUM',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    topBorder: 'border-t-amber-500',
  },
  High: {
    label: 'HIGH',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    text: 'text-orange-600',
    bar: 'bg-orange-500',
    topBorder: 'border-t-orange-500',
  },
  Critical: {
    label: 'CRITICAL',
    bg: 'bg-red-700/10',
    border: 'border-red-700/40',
    text: 'text-red-700',
    bar: 'bg-red-700',
    topBorder: 'border-t-red-700',
  },
};

// ─── RECOMMENDATIONS ─────────────────────────────────────────────────
const RECOMMENDATIONS = {
  opportunity: [
    'Strengthen access controls and implement role-based access reviews.',
    'Establish mandatory segregation of duties across financial processes.',
    'Deploy continuous transaction monitoring for high-risk areas.',
  ],
  pressure: [
    'Review incentive structures to reduce target-driven pressure.',
    'Implement employee assistance programmes to support financial wellbeing.',
    'Communicate openly about organisational changes to reduce uncertainty.',
  ],
  rationalization: [
    'Reinforce a zero-tolerance ethics culture through leadership communication.',
    'Implement consistent, visible consequences for policy violations.',
    'Launch regular ethics training with real-world case studies.',
  ],
  controls: [
    'Establish a trusted, anonymous whistleblowing mechanism.',
    'Conduct annual fraud risk assessments across all business units.',
    'Deploy transaction-level fraud monitoring with alert thresholds.',
  ],
};

// ─── DOMAIN RISK LEVEL FROM SCORE ────────────────────────────────────
function domainRiskLevel(score) {
  if (score <= 2) return 'Low';
  if (score <= 3) return 'Medium';
  if (score <= 4) return 'High';
  return 'Critical';
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
  const logits = model.coef.map((weights, i) => weights.reduce((sum, w, j) => sum + w * scaled[j], 0) + model.intercept[i]);
  const probs = softmax(logits);
  const maxIdx = probs.indexOf(Math.max(...probs));
  return {
    className: model.classes[maxIdx],
    confidence: Math.round(probs[maxIdx] * 100),
    probabilities: Object.fromEntries(model.classes.map((c, i) => [c, Math.round(probs[i] * 100)])),
  };
}

// ─── REPORT BUILDER ──────────────────────────────────────────────────
function buildReportText(domainScores, prediction, recommendations) {
  const lines = [
    `FRAUD RISK ASSESSMENT REPORT`,
    `Overall Risk Level: ${prediction.className.toUpperCase()} (${prediction.confidence}% confidence)`,
    ``,
    `DOMAIN SCORES:`,
    ...DOMAINS.map(d => {
      const score = domainScores[d.id];
      const level = domainRiskLevel(score);
      return `  ${d.label}: ${score.toFixed(1)} / 5  [${level}]`;
    }),
    ``,
    `TOP RECOMMENDATIONS:`,
    ...recommendations.map((r, i) => `  ${i + 1}. ${r}`),
    ``,
    `Note: This assessment is a decision-support tool. All results should be reviewed by a qualified fraud risk professional.`,
  ];
  return lines.join('\n');
}

// ─── CUSTOM RADAR TOOLTIP ─────────────────────────────────────────────
const CustomRadarTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white border border-slate-200 px-3 py-2 text-xs shadow-md">
        {payload.map((entry, i) => (
          <div key={i} style={{ color: entry.color }} className="font-bold">
            {entry.name}: {typeof entry.value === 'number' ? entry.value.toFixed(2) : entry.value}
          </div>
        ))}
      </div>
    );
  }
  return null;
};

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const FraudRiskCalculator = () => {
  // answers[domainIdx][questionIdx] = 1-5 or null
  const [answers, setAnswers] = useState(
    DOMAINS.map(() => Array(5).fill(null))
  );
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

  // ── Derived state ──────────────────────────────────────────────────
  const totalAnswered = answers.flat().filter(v => v !== null).length;
  const allAnswered = totalAnswered === 20;

  const domainAnsweredCount = answers.map(a => a.filter(v => v !== null).length);
  const currentTabComplete = domainAnsweredCount[activeTab] === 5;

  const domainScores = answers.map(
    (domainAnswers) => {
      const filled = domainAnswers.filter(v => v !== null);
      return filled.length === 5 ? filled.reduce((s, v) => s + v, 0) / 5 : null;
    }
  );

  const mlInputs = domainScores.every(s => s !== null)
    ? [domainScores[0], domainScores[1], domainScores[2], domainScores[3]]
    : null;

  const prediction = mlInputs ? mlPredict(mlInputs, modelData) : null;

  // ── Top recommendations ────────────────────────────────────────────
  let topRecommendations = [];
  if (prediction) {
    const domainIds = DOMAINS.map(d => d.id);
    const scored = domainIds.map((id, i) => ({ id, score: domainScores[i] }));
    scored.sort((a, b) => b.score - a.score);
    // Take top 2 domains by score and pick first rec from each, then a third from the highest
    const [first, second] = scored;
    topRecommendations = [
      RECOMMENDATIONS[first.id][0],
      RECOMMENDATIONS[first.id][1],
      RECOMMENDATIONS[second.id][0],
    ];
  }

  // ── Radar data ─────────────────────────────────────────────────────
  const radarData = DOMAINS.map((d, i) => ({
    domain: d.label,
    'Your Score': domainScores[i] ?? 0,
    'Best Practice': 1.5,
  }));

  // ── Handlers ──────────────────────────────────────────────────────
  const handleSelect = (domainIdx, questionIdx, value) => {
    setAnswers(prev => {
      const next = prev.map(a => [...a]);
      next[domainIdx][questionIdx] = value;
      return next;
    });
  };

  const handleReset = () => {
    setAnswers(DOMAINS.map(() => Array(5).fill(null)));
    setActiveTab(0);
    setCopied(false);
  };

  const handleCopy = async () => {
    if (!prediction) return;
    const report = buildReportText(
      Object.fromEntries(DOMAINS.map((d, i) => [d.id, domainScores[i]])),
      prediction,
      topRecommendations
    );
    try {
      await navigator.clipboard.writeText(report);
    } catch {
      const el = document.getElementById('fraud-report-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const domain = DOMAINS[activeTab];
  const domainAnswers = answers[activeTab];

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* ── Overall progress bar ─────────────────────────────────── */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500">
            Overall Progress
          </span>
          <span className="text-[10px] font-black text-[#001F5B]">
            {totalAnswered} / 20 questions answered
          </span>
        </div>
        <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-[#001F5B] rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${(totalAnswered / 20) * 100}%` }}
            transition={{ duration: 0.4, ease: 'easeOut' }}
          />
        </div>
      </div>

      {/* ── Domain tabs ──────────────────────────────────────────── */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {DOMAINS.map((d, idx) => {
          const count = domainAnsweredCount[idx];
          const complete = count === 5;
          const isActive = activeTab === idx;
          return (
            <button
              key={d.id}
              onClick={() => setActiveTab(idx)}
              className={`
                flex items-center gap-2 px-4 py-2.5 border text-[10px] font-black uppercase tracking-widest
                transition-all duration-200 flex-1 min-w-[140px] justify-center
                ${isActive
                  ? 'bg-[#001F5B] border-[#001F5B] text-white'
                  : 'bg-white border-slate-200 text-slate-600 hover:border-[#001F5B]/40 hover:text-slate-900'
                }
              `}
            >
              <span className={`
                w-4 h-4 rounded-full flex-shrink-0 flex items-center justify-center text-[8px] font-black
                ${complete
                  ? isActive ? 'bg-white text-[#001F5B]' : 'bg-green-500 text-white'
                  : isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'
                }
              `}>
                {complete ? '✓' : idx + 1}
              </span>
              {d.label}
              {!complete && count > 0 && (
                <span className={`text-[8px] font-black ${isActive ? 'text-white/60' : 'text-slate-400'}`}>
                  {count}/5
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* ── Active domain card ───────────────────────────────────── */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, x: 16 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -16 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="bg-white border border-slate-200 p-7 mb-6"
        >
          {/* Domain header */}
          <div className="mb-6">
            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-[#001F5B] mb-1">
              Domain {activeTab + 1} of 4
            </div>
            <h3 className="text-2xl font-black text-slate-900 mb-2">{domain.label}</h3>
            <p className="text-sm text-slate-500 leading-relaxed">{domain.description}</p>
          </div>

          {/* Questions */}
          <div className="space-y-6">
            {domain.questions.map((question, qIdx) => {
              const selected = domainAnswers[qIdx];
              return (
                <div key={qIdx}>
                  <div className="text-xs font-bold text-slate-700 mb-3 leading-relaxed">
                    <span className="text-[#001F5B] font-black mr-1">{qIdx + 1}.</span>
                    {question}
                  </div>
                  {/* Radio pill buttons */}
                  <div className="flex gap-2 flex-wrap">
                    {RATING_LABELS.map((label, rIdx) => {
                      const value = rIdx + 1;
                      const isSelected = selected === value;
                      return (
                        <button
                          key={value}
                          onClick={() => handleSelect(activeTab, qIdx, value)}
                          className={`
                            flex-1 min-w-[60px] px-2 py-2 border text-[10px] font-black uppercase tracking-wider
                            transition-all duration-150 text-center
                            ${isSelected
                              ? `${RATING_COLORS.selected[rIdx]} border-transparent text-white`
                              : `bg-white border-slate-200 text-slate-500 ${RATING_COLORS.unselected[rIdx]}`
                            }
                          `}
                        >
                          {label}
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

      {/* ── Tab navigation ───────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-10">
        <button
          onClick={() => setActiveTab(t => Math.max(0, t - 1))}
          disabled={activeTab === 0}
          className="flex items-center gap-2 px-5 py-2.5 border border-slate-200 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          Back
        </button>

        <div className="flex gap-1.5">
          {DOMAINS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`w-2 h-2 rounded-full transition-all ${
                idx === activeTab ? 'bg-[#001F5B] w-6' : domainAnsweredCount[idx] === 5 ? 'bg-green-400' : 'bg-slate-300'
              }`}
            />
          ))}
        </div>

        {activeTab < 3 ? (
          <button
            onClick={() => setActiveTab(t => Math.min(3, t + 1))}
            disabled={!currentTabComplete}
            className="flex items-center gap-2 px-5 py-2.5 border text-[10px] font-black uppercase tracking-widest transition-all
              bg-[#001F5B] border-[#001F5B] text-white hover:bg-[#002d87]
              disabled:bg-slate-100 disabled:border-slate-200 disabled:text-slate-300 disabled:cursor-not-allowed disabled:hover:bg-slate-100"
          >
            Next
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        ) : (
          <div className="w-24" />
        )}
      </div>

      {/* ── Privacy notice + reset ──────────────────────────────── */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            This tool runs entirely in your browser. No data is transmitted or stored.
          </span>
        </div>
        {totalAnswered > 0 && (
          <button
            onClick={handleReset}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 px-3 py-1.5 hover:border-slate-400"
          >
            Reset
          </button>
        )}
      </div>

      {/* ── Result panel ─────────────────────────────────────────── */}
      <AnimatePresence mode="wait">
        {allAnswered && prediction ? (
          <motion.div
            key="result"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`border-2 p-8 ${RISK_CONFIG[prediction.className].border} ${RISK_CONFIG[prediction.className].bg}`}
          >
            {/* ── 1. Risk level badge ─────────────────────────────── */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-7 h-7 ${RISK_CONFIG[prediction.className].text}`} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">
                    Fraud Risk Rating
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${RISK_CONFIG[prediction.className].text}`}>
                    {RISK_CONFIG[prediction.className].label}
                  </div>
                </div>
              </div>
              <div className={`
                px-4 py-1.5 border text-[10px] font-black uppercase tracking-[0.25em]
                ${RISK_CONFIG[prediction.className].border} ${RISK_CONFIG[prediction.className].text} ${RISK_CONFIG[prediction.className].bg}
              `}>
                {prediction.confidence}% confidence
              </div>
            </div>

            {/* ── 2. Probability bars ─────────────────────────────── */}
            <div className="mb-7">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                Model Confidence by Risk Level
              </div>
              <div className="space-y-2">
                {modelData.classes.map((cls) => {
                  const cfg = RISK_CONFIG[cls];
                  const pct = prediction.probabilities[cls];
                  const isWinner = cls === prediction.className;
                  return (
                    <div key={cls} className="flex items-center gap-3">
                      <span className={`text-[10px] font-black uppercase tracking-widest w-16 flex-shrink-0 ${isWinner ? cfg.text : 'text-slate-400'}`}>
                        {cfg.label}
                      </span>
                      <div className="flex-1 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                        <motion.div
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.6, ease: 'easeOut' }}
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

            {/* ── 3. Radar chart ──────────────────────────────────── */}
            <div className="mb-7 bg-white border border-slate-200 p-6">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-1">
                Fraud Triangle Radar
              </div>
              <p className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                Lower scores indicate lower fraud risk exposure. The dashed line shows a best-practice target of 1.5 — aim to stay at or below this level on all domains.
              </p>
              <ResponsiveContainer width="100%" height={300}>
                <RadarChart data={radarData} margin={{ top: 10, right: 30, bottom: 10, left: 30 }}>
                  <PolarGrid stroke="#e2e8f0" />
                  <PolarAngleAxis
                    dataKey="domain"
                    tick={{ fontSize: 11, fontWeight: 700, fill: '#475569' }}
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
                    fill="#001F5B"
                    fillOpacity={0.18}
                    strokeWidth={2}
                    dot={{ r: 3, fill: '#001F5B' }}
                  />
                  <Radar
                    name="Best Practice"
                    dataKey="Best Practice"
                    stroke="#22c55e"
                    fill="transparent"
                    strokeWidth={1.5}
                    strokeDasharray="5 3"
                    dot={false}
                  />
                  <Tooltip content={<CustomRadarTooltip />} />
                  <Legend
                    wrapperStyle={{ fontSize: '10px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em' }}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>

            {/* ── 4. Domain breakdown table ───────────────────────── */}
            <div className="mb-7">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                Domain Breakdown
              </div>
              <div className="border border-slate-200 overflow-hidden">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="bg-[#001F5B] text-white">
                      <th className="text-left px-5 py-3 font-black uppercase tracking-widest text-[10px]">Domain</th>
                      <th className="text-center px-5 py-3 font-black uppercase tracking-widest text-[10px]">Score</th>
                      <th className="text-center px-5 py-3 font-black uppercase tracking-widest text-[10px]">Risk Level</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {DOMAINS.map((d, i) => {
                      const score = domainScores[i];
                      const level = domainRiskLevel(score);
                      const cfg = RISK_CONFIG[level];
                      return (
                        <tr key={d.id} className="bg-white hover:bg-slate-50 transition-colors">
                          <td className="px-5 py-3.5 font-black text-slate-900">{d.label}</td>
                          <td className="px-5 py-3.5 text-center font-bold text-slate-700">
                            {score.toFixed(1)} / 5
                          </td>
                          <td className="px-5 py-3.5 text-center">
                            <span className={`text-[10px] font-black uppercase tracking-widest ${cfg.text}`}>
                              {cfg.label}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            {/* ── 5. Top recommendations ──────────────────────────── */}
            <div className="mb-7">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                Top Recommendations
              </div>
              <div className="space-y-3">
                {topRecommendations.map((rec, i) => (
                  <div key={i} className="flex items-start gap-3 bg-white border border-slate-200 px-5 py-4">
                    <span className="flex-shrink-0 w-5 h-5 rounded-full bg-[#001F5B] text-white text-[10px] font-black flex items-center justify-center mt-0.5">
                      {i + 1}
                    </span>
                    <p className="text-sm text-slate-700 leading-relaxed">{rec}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── 6. Privacy notice ───────────────────────────────── */}
            <div className="flex items-center gap-2 text-slate-400 mb-6 pb-6 border-b border-slate-200">
              <Lock className="w-3 h-3 flex-shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-widest">
                This tool runs entirely in your browser. No data is transmitted or stored.
              </span>
            </div>

            {/* ── 7. Copy report button ────────────────────────────── */}
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
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-5 py-3 border border-slate-200 text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 hover:border-slate-400 hover:text-slate-700 transition-all"
              >
                Start Over
              </button>
            </div>

            {/* Hidden textarea for clipboard fallback */}
            <textarea
              id="fraud-report-raw"
              readOnly
              className="sr-only"
              aria-hidden="true"
              value={
                prediction
                  ? buildReportText(
                      Object.fromEntries(DOMAINS.map((d, i) => [d.id, domainScores[i]])),
                      prediction,
                      topRecommendations
                    )
                  : ''
              }
            />

            {/* Disclaimer */}
            <div className="flex items-start gap-2 mt-5">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 leading-relaxed">
                This assessment is a decision-support tool, not a substitute for a professional fraud risk assessment. Always apply qualified judgement and consider entity-specific context before drawing conclusions.
              </p>
            </div>

          </motion.div>
        ) : (
          <motion.div
            key="placeholder"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="border border-slate-200 p-10 text-center bg-slate-50"
          >
            <ShieldAlert className="w-9 h-9 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
              {totalAnswered === 0
                ? 'Answer all 20 questions across the four domains to generate your fraud risk rating'
                : `${20 - totalAnswered} question${20 - totalAnswered > 1 ? 's' : ''} remaining — complete all domains to see your result`
              }
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default FraudRiskCalculator;
