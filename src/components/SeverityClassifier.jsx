import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCopy, CheckCheck, ShieldAlert, Lock, AlertTriangle } from 'lucide-react';
import modelData from '../data/severity-model.json';

// ─── FIELD DEFINITIONS ───────────────────────────────────────────────
const FIELDS = [
  {
    id: 'exposure',
    label: 'Financial Exposure',
    hint: 'How significant is the financial impact relative to the size of your organisation?',
    options: [
      {
        label: 'Immaterial',
        desc: 'The amount is too small to influence decisions. Well below the level your organisation considers significant.',
        value: 1,
        text: 'immaterial',
      },
      {
        label: 'Potentially material',
        desc: 'The amount is noticeable and approaching the level your organisation considers significant, but hasn\'t clearly crossed it.',
        value: 2,
        text: 'potentially material',
      },
      {
        label: 'Material',
        desc: 'The amount is large enough to influence decisions or misstate financial statements. Clearly significant for your organisation.',
        value: 3,
        text: 'material',
      },
    ],
  },
  {
    id: 'likelihood',
    label: 'Likelihood / Frequency',
    hint: 'How often has this control failure occurred, or how likely is it to recur?',
    options: [
      {
        label: 'Rare',
        desc: 'This appears to be a one-off event. There is no pattern and it is unlikely to happen again without unusual circumstances.',
        value: 1,
        text: 'rarely',
      },
      {
        label: 'Possible',
        desc: 'This has happened more than once, or the conditions that caused it still exist and could reasonably lead to recurrence.',
        value: 2,
        text: 'occasionally',
      },
      {
        label: 'Likely',
        desc: 'This is recurring and the underlying cause has not been fixed. Without intervention, it will continue to happen.',
        value: 3,
        text: 'recurrently',
      },
    ],
  },
  {
    id: 'detection',
    label: 'Detection Difficulty',
    hint: 'Would management or existing controls catch this failure without a formal audit?',
    options: [
      {
        label: 'Easy to detect',
        desc: 'Existing controls, reconciliations, or supervisory review would catch this promptly. Management is likely already aware.',
        value: 1,
        text: 'easy',
      },
      {
        label: 'Moderate',
        desc: 'Could be caught eventually, but not immediately. Requires targeted review or investigation to surface.',
        value: 2,
        text: 'moderately difficult',
      },
      {
        label: 'Hard to detect',
        desc: 'Unlikely to be caught by existing controls. Could persist undetected for extended periods without a formal audit.',
        value: 3,
        text: 'difficult',
      },
    ],
  },
  {
    id: 'scope',
    label: 'Affected Scope',
    hint: 'How widely does this issue affect the organisation?',
    options: [
      {
        label: 'Single transaction',
        desc: 'Isolated to one specific transaction, event, or instance. Not part of a broader pattern.',
        value: 1,
        text: 'a single transaction',
      },
      {
        label: 'Single department',
        desc: 'Limited to one team, business unit, or process area. Other parts of the organisation are not affected.',
        value: 2,
        text: 'a single department',
      },
      {
        label: 'Entity-wide',
        desc: 'The control failure spans multiple departments or the whole organisation. It is systemic rather than isolated.',
        value: 3,
        text: 'the entire entity',
      },
    ],
  },
];

// ─── SEVERITY UI CONFIG ──────────────────────────────────────────────
// Keyed by model class name
const SEVERITY_CONFIG = {
  Low: {
    label: 'LOW',
    bg: 'bg-green-500/10',
    border: 'border-green-500/40',
    text: 'text-green-600',
    bar: 'bg-green-500',
    action: 'recommended',
    description: 'Monitor and track. No immediate escalation required. Schedule follow-up in the next audit cycle.',
  },
  Medium: {
    label: 'MEDIUM',
    bg: 'bg-amber-500/10',
    border: 'border-amber-500/40',
    text: 'text-amber-600',
    bar: 'bg-amber-500',
    action: 'recommended',
    description: 'Management attention warranted. A formal remediation plan with agreed timelines is required.',
  },
  High: {
    label: 'HIGH',
    bg: 'bg-orange-500/10',
    border: 'border-orange-500/40',
    text: 'text-orange-600',
    bar: 'bg-orange-500',
    action: 'required',
    description: 'Prompt escalation to senior management. Root cause analysis and corrective action plan are mandatory.',
  },
  Critical: {
    label: 'CRITICAL',
    bg: 'bg-red-700/10',
    border: 'border-red-700/40',
    text: 'text-red-700',
    bar: 'bg-red-700',
    action: 'required',
    description: 'Immediate Board / Audit Committee notification required. Zero-tolerance remediation with executive accountability.',
  },
};

// ─── ML INFERENCE ────────────────────────────────────────────────────
// Replicates sklearn PolynomialFeatures(degree=2, include_bias=False)
function polyFeatures(x, powers) {
  return powers.map(pw => x.reduce((acc, xi, i) => acc * Math.pow(xi, pw[i]), 1));
}

function softmax(logits) {
  const max = Math.max(...logits);
  const exps = logits.map(l => Math.exp(l - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map(e => e / sum);
}

function mlPredict(exposure, likelihood, detection, scope) {
  const inputs = [exposure, likelihood, detection, scope];

  // Expand to polynomial features
  const features = polyFeatures(inputs, modelData.poly_powers);

  // Standardise using training scaler parameters
  const scaled = features.map(
    (f, i) => (f - modelData.scaler_mean[i]) / modelData.scaler_scale[i]
  );

  // Compute logits: W @ x + b
  const logits = modelData.coef.map(
    (weights, i) => weights.reduce((sum, w, j) => sum + w * scaled[j], 0) + modelData.intercept[i]
  );

  const probs = softmax(logits);
  const maxIdx = probs.indexOf(Math.max(...probs));
  const predClass = modelData.classes[maxIdx];

  return {
    className: predClass,                         // 'Low' | 'Medium' | 'High' | 'Critical'
    confidence: Math.round(probs[maxIdx] * 100),  // 0-100
    probabilities: Object.fromEntries(            // { Low: 2, Medium: 5, High: 87, Critical: 6 }
      modelData.classes.map((c, i) => [c, Math.round(probs[i] * 100)])
    ),
  };
}

// ─── REPORT TEXT BUILDER ─────────────────────────────────────────────
function buildFindingText(selections, severityConfig) {
  const get = (fieldId) => {
    const field = FIELDS.find(f => f.id === fieldId);
    const opt = field.options.find(o => o.value === selections[fieldId]);
    return opt ? opt.text : '[not selected]';
  };

  return (
    `This finding is rated ${severityConfig.label}. ` +
    `The control deficiency presents ${get('exposure')} financial exposure, ` +
    `occurs ${get('likelihood')}, ` +
    `is ${get('detection')} to detect, ` +
    `and affects ${get('scope')}. ` +
    `Immediate management attention and remediation are ${severityConfig.action}.`
  );
}

// ─── MAIN COMPONENT ──────────────────────────────────────────────────
const SeverityClassifier = () => {
  const [selections, setSelections] = useState({
    exposure: null, likelihood: null, detection: null, scope: null,
  });
  const [copied, setCopied] = useState(false);

  const allSelected = Object.values(selections).every(v => v !== null);

  // Run ML inference only when all four factors are selected
  const prediction = allSelected
    ? mlPredict(selections.exposure, selections.likelihood, selections.detection, selections.scope)
    : null;

  const severityConfig = prediction ? SEVERITY_CONFIG[prediction.className] : null;
  const findingText = prediction ? buildFindingText(selections, severityConfig) : '';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(findingText);
    } catch {
      const el = document.getElementById('finding-output-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleSelect = (fieldId, value) => {
    setSelections(prev => ({ ...prev, [fieldId]: value }));
  };

  const handleReset = () => {
    setSelections({ exposure: null, likelihood: null, detection: null, scope: null });
    setCopied(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* Input grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {FIELDS.map((field) => (
          <div key={field.id} className="bg-white border border-slate-200 p-7">
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-[#001F5B] mb-1">
              {field.label}
            </div>
            {field.hint && (
              <div className="text-[10px] text-slate-400 mb-4 leading-relaxed">
                {field.hint}
              </div>
            )}
            <div className="space-y-2.5">
              {field.options.map((opt) => {
                const isSelected = selections[field.id] === opt.value;
                return (
                  <button
                    key={opt.value}
                    onClick={() => handleSelect(field.id, opt.value)}
                    className={`
                      w-full text-left px-4 py-3.5 border
                      transition-all duration-200 cursor-pointer flex items-start gap-3
                      ${isSelected
                        ? 'bg-[#001F5B] border-[#001F5B] text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-[#001F5B]/40 hover:text-slate-900'
                      }
                    `}
                  >
                    <span className={`
                      flex-shrink-0 w-2 h-2 rounded-full mt-1 transition-colors
                      ${isSelected ? 'bg-white' : 'bg-slate-300'}
                    `} />
                    <span className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold">{opt.label}</span>
                      <span className={`text-[10px] leading-relaxed font-normal ${isSelected ? 'text-white/70' : 'text-slate-400'}`}>
                        {opt.desc}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Privacy notice + reset */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-2 text-slate-400">
          <Lock className="w-3 h-3 flex-shrink-0" />
          <span className="text-[10px] font-bold uppercase tracking-widest">
            This tool runs entirely in your browser. No data is transmitted or stored.
          </span>
        </div>
        {allSelected && (
          <button
            onClick={handleReset}
            className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-700 transition-colors border border-slate-200 px-3 py-1.5 hover:border-slate-400"
          >
            Reset
          </button>
        )}
      </div>

      {/* Result card */}
      <AnimatePresence mode="wait">
        {allSelected && prediction && severityConfig ? (
          <motion.div
            key={prediction.className}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
            className={`border-2 p-8 ${severityConfig.border} ${severityConfig.bg}`}
          >
            {/* Badge row */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <ShieldAlert className={`w-7 h-7 ${severityConfig.text}`} />
                <div>
                  <div className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500 mb-0.5">
                    Severity Rating
                  </div>
                  <div className={`text-2xl font-black tracking-tight ${severityConfig.text}`}>
                    {severityConfig.label}
                  </div>
                </div>
              </div>
              <div className={`
                px-4 py-1.5 border text-[10px] font-black uppercase tracking-[0.25em]
                ${severityConfig.border} ${severityConfig.text} ${severityConfig.bg}
              `}>
                {prediction.confidence}% confidence
              </div>
            </div>

            {/* Confidence bar across all classes */}
            <div className="mb-6">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-400 mb-3">
                How certain is this rating?
              </div>
              <div className="space-y-2">
                {modelData.classes.map((cls) => {
                  const cfg = SEVERITY_CONFIG[cls];
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

            {/* Description */}
            <p className="text-slate-600 text-sm mb-2 leading-relaxed">
              {severityConfig.description}
            </p>
            <p className="text-[10px] text-slate-400 mb-6 pb-6 border-b border-slate-200">
              Confidence reflects how consistently the model classifies this combination of factors — not a guarantee of real-world outcome. Always apply professional judgement.
            </p>

            {/* Report text */}
            <div className="mb-5">
              <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
                Report-Ready Finding Summary
              </div>
              <div className="bg-slate-50 border border-slate-200 p-5">
                <p className="text-slate-800 text-sm leading-relaxed font-medium">
                  {findingText}
                </p>
                <textarea
                  id="finding-output-raw"
                  readOnly
                  value={findingText}
                  className="sr-only"
                  aria-hidden="true"
                />
              </div>
            </div>

            {/* Copy button */}
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
                ? <><CheckCheck className="w-3.5 h-3.5" /> Copied to Clipboard</>
                : <><ClipboardCopy className="w-3.5 h-3.5" /> Copy Finding to Clipboard</>
              }
            </button>

            {/* Warnings */}
            <div className="flex items-start gap-2 mt-4">
              <AlertTriangle className="w-3.5 h-3.5 text-amber-500 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-amber-600 leading-relaxed">
                Exercise discretion before copying findings that contain sensitive or confidential information.
              </p>
            </div>
            <div className="flex items-start gap-2 mt-2.5">
              <AlertTriangle className="w-3.5 h-3.5 text-slate-400 flex-shrink-0 mt-0.5" />
              <p className="text-[10px] text-slate-500 leading-relaxed">
                This rating is a decision-support tool, not a substitute for professional judgement. Auditors should consider entity-specific context, materiality thresholds, and management's response before finalising any severity classification.
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
              Select all four factors above to generate your severity rating
            </p>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
};

export default SeverityClassifier;
