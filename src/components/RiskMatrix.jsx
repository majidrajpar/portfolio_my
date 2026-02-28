import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ClipboardCopy, CheckCheck, Lock, X } from 'lucide-react';

// ─── SCORING ─────────────────────────────────────────────────────────
function getScoreData(likelihood, impact) {
  const score = likelihood * impact;
  if (score >= 17) return { score, rating: 'Critical', color: '#dc2626' };
  if (score >= 10) return { score, rating: 'High',     color: '#ea580c' };
  if (score >= 5)  return { score, rating: 'Medium',   color: '#d97706' };
  return              { score, rating: 'Low',      color: '#16a34a' };
}

function getRatingForScore(score) {
  if (score >= 17) return 'Critical';
  if (score >= 10) return 'High';
  if (score >= 5)  return 'Medium';
  return 'Low';
}

function getColorForScore(score) {
  if (score >= 17) return '#dc2626';
  if (score >= 10) return '#ea580c';
  if (score >= 5)  return '#d97706';
  return '#16a34a';
}

// ─── SVG GRID CONSTANTS ───────────────────────────────────────────────
const MARGIN_LEFT  = 64;
const MARGIN_BOTTOM = 60;
const CELL = 60;
const COLS = 5;
const ROWS = 5;
const SVG_W = MARGIN_LEFT + COLS * CELL + 24;
const SVG_H = ROWS * CELL + MARGIN_BOTTOM + 20;

// Convert likelihood/impact to SVG coordinates (centre of cell)
// X: likelihood 1-5 → left to right
// Y: impact 1-5 → bottom to top (SVG y is inverted)
function toSVGCoords(likelihood, impact) {
  const x = MARGIN_LEFT + (likelihood - 1) * CELL + CELL / 2;
  const y = (ROWS - impact) * CELL + CELL / 2;
  return { x, y };
}

// ─── 5×5 GRID ────────────────────────────────────────────────────────
function RiskGrid({ risks }) {
  const [tooltip, setTooltip] = useState(null);

  // Group risks by coordinate key
  const coordMap = {};
  risks.forEach((r) => {
    const key = `${r.likelihood}-${r.impact}`;
    if (!coordMap[key]) coordMap[key] = [];
    coordMap[key].push(r);
  });

  return (
    <svg
      viewBox={`0 0 ${SVG_W} ${SVG_H}`}
      width="100%"
      style={{ display: 'block', maxWidth: SVG_W }}
      aria-label="5x5 Risk Assessment Matrix"
    >
      {/* ── Grid cells ────────────────────────────────────────────── */}
      {Array.from({ length: ROWS }, (_, rowIdx) =>
        Array.from({ length: COLS }, (_, colIdx) => {
          const likelihood = colIdx + 1;
          const impact     = ROWS - rowIdx;
          const cellScore  = likelihood * impact;
          const fill       = getColorForScore(cellScore);
          const cx = MARGIN_LEFT + colIdx * CELL;
          const cy = rowIdx * CELL;
          return (
            <rect
              key={`cell-${colIdx}-${rowIdx}`}
              x={cx}
              y={cy}
              width={CELL}
              height={CELL}
              fill={fill}
              fillOpacity={0.15}
              stroke="#cbd5e1"
              strokeWidth={1}
            />
          );
        })
      )}

      {/* ── Y-axis label (Impact) ─────────────────────────────────── */}
      <text
        x={12}
        y={ROWS * CELL / 2}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={10}
        fontWeight={700}
        fill="#64748b"
        transform={`rotate(-90, 12, ${ROWS * CELL / 2})`}
        style={{ userSelect: 'none' }}
      >
        Impact
      </text>

      {/* ── Y-axis numbers (1 bottom → 5 top) ────────────────────── */}
      {Array.from({ length: ROWS }, (_, i) => {
        const impact = i + 1;
        const rowIdx = ROWS - impact;
        const cy = rowIdx * CELL + CELL / 2;
        return (
          <text
            key={`y-${impact}`}
            x={MARGIN_LEFT - 10}
            y={cy}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#475569"
            style={{ userSelect: 'none' }}
          >
            {impact}
          </text>
        );
      })}

      {/* ── X-axis numbers (1 left → 5 right) ────────────────────── */}
      {Array.from({ length: COLS }, (_, colIdx) => {
        const likelihood = colIdx + 1;
        const cx = MARGIN_LEFT + colIdx * CELL + CELL / 2;
        return (
          <text
            key={`x-${likelihood}`}
            x={cx}
            y={ROWS * CELL + 18}
            textAnchor="middle"
            dominantBaseline="central"
            fontSize={10}
            fontWeight={700}
            fill="#475569"
            style={{ userSelect: 'none' }}
          >
            {likelihood}
          </text>
        );
      })}

      {/* ── X-axis label (Likelihood) ─────────────────────────────── */}
      <text
        x={MARGIN_LEFT + (COLS * CELL) / 2}
        y={ROWS * CELL + 42}
        textAnchor="middle"
        fontSize={10}
        fontWeight={700}
        fill="#64748b"
        style={{ userSelect: 'none' }}
      >
        Likelihood
      </text>

      {/* ── Risk dots ─────────────────────────────────────────────── */}
      {Object.entries(coordMap).map(([key, group]) =>
        group.map((risk, idx) => {
          const { x, y } = toSVGCoords(risk.likelihood, risk.impact);
          const { score, rating, color } = getScoreData(risk.likelihood, risk.impact);
          const offsetX = (idx % 3) * 4 - 4;
          const offsetY = Math.floor(idx / 3) * 4 - 4;
          const dotX = x + offsetX;
          const dotY = y + offsetY;
          const isHovered = tooltip && tooltip.id === risk.id;
          return (
            <g key={risk.id}>
              <circle
                cx={dotX}
                cy={dotY}
                r={isHovered ? 9 : 7}
                fill={color}
                stroke="white"
                strokeWidth={1.5}
                style={{ cursor: 'pointer', transition: 'r 0.15s' }}
                onMouseEnter={() => setTooltip({ id: risk.id, name: risk.name, score, rating, color, dotX, dotY })}
                onMouseLeave={() => setTooltip(null)}
              />
            </g>
          );
        })
      )}

      {/* ── Tooltip ───────────────────────────────────────────────── */}
      {tooltip && (() => {
        const ttW = 150;
        const ttH = 44;
        const pad = 8;
        // Clamp so tooltip stays inside SVG
        let ttX = tooltip.dotX - ttW / 2;
        let ttY = tooltip.dotY - ttH - 14;
        if (ttX < pad) ttX = pad;
        if (ttX + ttW > SVG_W - pad) ttX = SVG_W - pad - ttW;
        if (ttY < pad) ttY = tooltip.dotY + 14;
        return (
          <g pointerEvents="none">
            <rect
              x={ttX}
              y={ttY}
              width={ttW}
              height={ttH}
              fill="white"
              stroke="#e2e8f0"
              strokeWidth={1}
              rx={0}
            />
            {/* coloured left border */}
            <rect x={ttX} y={ttY} width={3} height={ttH} fill={tooltip.color} />
            <text x={ttX + 11} y={ttY + 14} fontSize={10} fontWeight={700} fill="#0f172a"
              style={{ userSelect: 'none' }}>
              {tooltip.name.length > 20 ? tooltip.name.slice(0, 19) + '…' : tooltip.name}
            </text>
            <text x={ttX + 11} y={ttY + 30} fontSize={9} fontWeight={700} fill={tooltip.color}
              style={{ userSelect: 'none' }}>
              Score: {tooltip.score} — {tooltip.rating}
            </text>
          </g>
        );
      })()}
    </svg>
  );
}

// ─── SCORE BUTTON ROW ─────────────────────────────────────────────────
function ScoreButtons({ label, value, onChange }) {
  return (
    <div className="flex flex-col gap-1.5">
      <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">{label}</span>
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((n) => {
          const active = value === n;
          return (
            <button
              key={n}
              type="button"
              onClick={() => onChange(n)}
              style={active ? { background: '#001F5B', borderColor: '#001F5B', color: '#fff' } : {}}
              className={`
                flex-1 py-2 border text-xs font-black transition-all duration-150
                ${active
                  ? ''
                  : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400 hover:text-slate-900'
                }
              `}
            >
              {n}
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── REPORT BUILDER ───────────────────────────────────────────────────
function buildReport(risks) {
  const date = new Date().toLocaleDateString('en-GB', {
    day: '2-digit', month: 'long', year: 'numeric'
  });

  const sorted = [...risks].sort((a, b) => {
    const sa = a.likelihood * a.impact;
    const sb = b.likelihood * b.impact;
    return sb - sa;
  });

  const countByRating = { Critical: 0, High: 0, Medium: 0, Low: 0 };
  sorted.forEach((r) => {
    const { rating } = getScoreData(r.likelihood, r.impact);
    countByRating[rating]++;
  });

  const lines = [
    `RISK ASSESSMENT MATRIX — ${date}`,
    ``,
    `RISK REGISTER`,
    `─────────────────────────────`,
    ...sorted.flatMap((r) => {
      const { score, rating } = getScoreData(r.likelihood, r.impact);
      return [
        r.name,
        `  Likelihood: ${r.likelihood} / Impact: ${r.impact} / Score: ${score} / Rating: ${rating}`,
        ``,
      ];
    }),
    `SUMMARY`,
    `  Total Risks: ${risks.length}`,
    `  Critical: ${countByRating.Critical} | High: ${countByRating.High} | Medium: ${countByRating.Medium} | Low: ${countByRating.Low}`,
  ];
  return lines.join('\n');
}

// ─── MAIN COMPONENT ───────────────────────────────────────────────────
let nextId = 1;

const RiskMatrix = () => {
  const [risks,      setRisks]      = useState([]);
  const [name,       setName]       = useState('');
  const [likelihood, setLikelihood] = useState(3);
  const [impact,     setImpact]     = useState(3);
  const [copied,     setCopied]     = useState(false);

  // ── Add risk ─────────────────────────────────────────────────────────
  const handleAdd = () => {
    const trimmed = name.trim();
    if (!trimmed) return;
    setRisks((prev) => [
      ...prev,
      { id: nextId++, name: trimmed, likelihood, impact },
    ]);
    setName('');
    setLikelihood(3);
    setImpact(3);
  };

  // ── Remove risk ──────────────────────────────────────────────────────
  const handleRemove = (id) => {
    setRisks((prev) => prev.filter((r) => r.id !== id));
  };

  // ── Copy report ──────────────────────────────────────────────────────
  const handleCopy = async () => {
    if (!risks.length) return;
    const text = buildReport(risks);
    try {
      await navigator.clipboard.writeText(text);
    } catch {
      const el = document.getElementById('risk-matrix-report-raw');
      if (el) { el.select(); document.execCommand('copy'); }
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const nameEmpty = !name.trim();
  const { score: previewScore, rating: previewRating, color: previewColor } =
    getScoreData(likelihood, impact);

  return (
    <div className="w-full max-w-4xl mx-auto">

      {/* ── Grid ────────────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-5 mb-6 overflow-x-auto">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-4">
          Risk Matrix — Likelihood × Impact
        </div>
        <RiskGrid risks={risks} />

        {/* Legend */}
        <div className="flex flex-wrap gap-4 mt-4 pt-4 border-t border-slate-100">
          {[
            { label: 'Low (1–4)',       color: '#16a34a' },
            { label: 'Medium (5–9)',    color: '#d97706' },
            { label: 'High (10–16)',    color: '#ea580c' },
            { label: 'Critical (17–25)', color: '#dc2626' },
          ].map(({ label, color }) => (
            <div key={label} className="flex items-center gap-1.5">
              <span
                className="inline-block w-3 h-3 flex-shrink-0"
                style={{ background: color, opacity: 0.9 }}
              />
              <span className="text-[10px] font-bold text-slate-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* ── Add Risk form ────────────────────────────────────────────── */}
      <div className="bg-white border border-slate-200 p-6 mb-6">
        <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-5">
          Add Risk
        </div>

        {/* Name input */}
        <div className="mb-5">
          <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 mb-1.5">
            Risk Name
          </label>
          <input
            type="text"
            value={name}
            maxLength={60}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleAdd(); }}
            placeholder="e.g. Vendor payment fraud"
            className="w-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-900 placeholder-slate-400 focus:outline-none focus:border-[#001F5B] transition-colors"
          />
          <div className="text-[10px] text-slate-400 mt-1 text-right">{name.length}/60</div>
        </div>

        {/* Likelihood & Impact buttons */}
        <div className="grid grid-cols-1 gap-4 mb-5 sm:grid-cols-2">
          <ScoreButtons
            label="Likelihood (1 = Rare, 5 = Almost Certain)"
            value={likelihood}
            onChange={setLikelihood}
          />
          <ScoreButtons
            label="Impact (1 = Negligible, 5 = Catastrophic)"
            value={impact}
            onChange={setImpact}
          />
        </div>

        {/* Score preview */}
        <div className="flex items-center gap-3 mb-5">
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500">
            Preview Score:
          </span>
          <span
            className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5"
            style={{ color: previewColor, border: `1px solid ${previewColor}`, background: previewColor + '18' }}
          >
            {previewScore} — {previewRating}
          </span>
        </div>

        {/* Add button */}
        <button
          type="button"
          onClick={handleAdd}
          disabled={nameEmpty}
          style={nameEmpty ? {} : { background: '#001F5B', borderColor: '#001F5B' }}
          className={`
            px-6 py-2.5 border text-[10px] font-black uppercase tracking-[0.2em] transition-all
            ${nameEmpty
              ? 'bg-slate-100 border-slate-200 text-slate-300 cursor-not-allowed'
              : 'text-white hover:opacity-90'
            }
          `}
        >
          Add Risk
        </button>
      </div>

      {/* ── Risk list ────────────────────────────────────────────────── */}
      <AnimatePresence initial={false}>
        {risks.length > 0 && (
          <motion.div
            key="risk-list"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="mb-6"
          >
            <div className="text-[10px] font-black uppercase tracking-[0.25em] text-slate-500 mb-3">
              Risk Register ({risks.length})
            </div>
            <div className="space-y-2">
              <AnimatePresence initial={false}>
                {risks.map((risk) => {
                  const { score, rating, color } = getScoreData(risk.likelihood, risk.impact);
                  return (
                    <motion.div
                      key={risk.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -16 }}
                      transition={{ duration: 0.2, ease: 'easeOut' }}
                      className="flex items-center gap-0 bg-white border border-slate-200 overflow-hidden"
                    >
                      {/* Coloured left border stripe */}
                      <span
                        className="w-1 self-stretch flex-shrink-0"
                        style={{ background: color }}
                      />
                      <div className="flex items-center gap-3 flex-1 px-4 py-3 min-w-0">
                        <span className="font-black text-sm text-slate-900 truncate flex-1">
                          {risk.name}
                        </span>
                        <span
                          className="text-[10px] font-black uppercase tracking-widest whitespace-nowrap flex-shrink-0"
                          style={{ color }}
                        >
                          Score: {score} — {rating}
                        </span>
                        <span className="text-[10px] text-slate-400 flex-shrink-0 whitespace-nowrap">
                          L:{risk.likelihood} / I:{risk.impact}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleRemove(risk.id)}
                        className="flex-shrink-0 px-3 py-3 text-slate-400 hover:text-red-500 transition-colors border-l border-slate-100"
                        aria-label={`Remove ${risk.name}`}
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Copy report button ───────────────────────────────────────── */}
      <AnimatePresence>
        {risks.length > 0 && (
          <motion.div
            key="copy-btn"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="mb-6"
          >
            <button
              type="button"
              onClick={handleCopy}
              className={`
                flex items-center gap-2.5 px-5 py-2.5 border text-[10px] font-black uppercase tracking-[0.2em] transition-all
                ${copied
                  ? 'bg-emerald-50 border-emerald-400 text-emerald-700'
                  : 'bg-white border-[#001F5B] text-[#001F5B] hover:bg-[#001F5B] hover:text-white'
                }
              `}
            >
              {copied
                ? <><CheckCheck className="w-3.5 h-3.5" /> Report Copied</>
                : <><ClipboardCopy className="w-3.5 h-3.5" /> Copy Report</>
              }
            </button>

            {/* Hidden textarea for clipboard fallback */}
            <textarea
              id="risk-matrix-report-raw"
              readOnly
              className="sr-only"
              aria-hidden="true"
              value={buildReport(risks)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Empty state ─────────────────────────────────────────────── */}
      <AnimatePresence>
        {risks.length === 0 && (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="border border-slate-200 p-10 text-center bg-slate-50 mb-6"
          >
            <p className="text-slate-400 text-[10px] uppercase tracking-widest font-black">
              No risks added yet — use the form above to add your first risk
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Privacy notice ──────────────────────────────────────────── */}
      <div className="flex items-center gap-2 text-slate-400">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          This tool runs entirely in your browser. No data is transmitted or stored.
        </span>
      </div>

    </div>
  );
};

export default RiskMatrix;
