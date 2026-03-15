import { useEffect, useRef } from 'react';
// Plot is lazy-imported inside useEffect to avoid SSR bundling failures

// Grammar-of-graphics section backgrounds. ggplot2 register.
// Low-opacity SVG geometry behind content. Three variants tied to page sections.
// All data is synthetic but domain-calibrated (audit risk, control maturity, findings).

// --- Synthetic data generators (seeded, deterministic) ---

function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
}

// 80 quarterly audit-finding counts over 20 years. Bimodal shape:
// high early (pre-transformation), dip mid (structural rebuild), rising post.
function makeTimelineData() {
  const r = lcg(7);
  return Array.from({ length: 80 }, (_, q) => {
    const t = q / 79;
    const trend = t < 0.35 ? 7.5 - t * 8 : t < 0.55 ? 3.5 : 3.5 + (t - 0.55) * 9;
    const wave = Math.sin(q * 0.55) * 1.2 + Math.sin(q * 0.2) * 0.8;
    return { q, findings: Math.max(0.5, trend + wave + (r() - 0.5) * 1.5) };
  });
}

// 55 control-maturity vs residual-risk data points.
// Classic inverse relationship with outliers. Real audit pattern.
function makeScatterData() {
  const r = lcg(31);
  return Array.from({ length: 55 }, (_, i) => {
    const maturity = r() * 4.8 + 0.1;
    const baseRisk = 8.5 - maturity * 1.4;
    const noise = (r() - 0.5) * 3.5;
    const outlier = r() < 0.12 ? (r() - 0.5) * 4 : 0;
    return {
      maturity,
      risk: Math.max(0.2, Math.min(9.8, baseRisk + noise + outlier)),
      impact: r() * 2.5 + 0.5,
    };
  });
}

// 5×5 risk matrix (likelihood × impact).
function makeRiskMatrix() {
  const pts = [];
  for (let l = 1; l <= 5; l++) {
    for (let i = 1; i <= 5; i++) {
      pts.push({ l, i, score: l * i });
    }
  }
  return pts;
}

// --- Renderers ---

function renderStats(Plot, el, w, h) {
  const data = makeTimelineData();
  return Plot.plot({
    width: w,
    height: h,
    marginLeft: 0, marginRight: 0, marginTop: 8, marginBottom: 0,
    style: { background: 'transparent', overflow: 'visible' },
    x: { axis: null },
    y: { axis: null, domain: [-1, 13] },
    marks: [
      Plot.areaY(data, {
        x: 'q', y: 'findings',
        fill: '#001F5B', fillOpacity: 0.07,
        curve: 'catmull-rom',
      }),
      Plot.lineY(data, {
        x: 'q', y: 'findings',
        stroke: '#001F5B', strokeOpacity: 0.18, strokeWidth: 1.2,
        curve: 'catmull-rom',
      }),
      Plot.dot(data.filter((_, i) => i % 10 === 4), {
        x: 'q', y: 'findings',
        fill: '#001F5B', fillOpacity: 0.25, r: 2,
        stroke: 'none',
      }),
    ],
  });
}

function renderCapabilities(Plot, el, w, h) {
  const data = makeScatterData();
  return Plot.plot({
    width: w,
    height: h,
    marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0,
    style: { background: 'transparent', overflow: 'visible' },
    x: { axis: null, domain: [0, 5] },
    y: { axis: null, domain: [0, 10] },
    marks: [
      // Sparse reference grid
      Plot.ruleX([1, 2, 3, 4], {
        stroke: '#001F5B', strokeOpacity: 0.04, strokeWidth: 0.6,
      }),
      Plot.ruleY([2, 4, 6, 8], {
        stroke: '#001F5B', strokeOpacity: 0.04, strokeWidth: 0.6,
      }),
      // Main scatter: bubble size = financial impact
      Plot.dot(data, {
        x: 'maturity',
        y: 'risk',
        r: (d) => 4 + d.impact * 3.5,
        fill: '#001F5B',
        fillOpacity: 0.05,
        stroke: '#001F5B',
        strokeOpacity: 0.09,
        strokeWidth: 0.8,
      }),
      // Trend line overlay (low-opacity loess proxy: single regression line)
      Plot.linearRegressionY(data, {
        x: 'maturity', y: 'risk',
        stroke: '#001F5B', strokeOpacity: 0.1, strokeWidth: 1,
        strokeDasharray: '4 3',
      }),
    ],
  });
}

function renderDarkGrid(Plot, el, w, h) {
  const data = makeRiskMatrix();
  return Plot.plot({
    width: w,
    height: h,
    marginLeft: 0, marginRight: 0, marginTop: 0, marginBottom: 0,
    style: { background: 'transparent', overflow: 'visible' },
    x: { axis: null, domain: [0.5, 5.5] },
    y: { axis: null, domain: [0.5, 5.5] },
    marks: [
      // Matrix grid lines
      Plot.ruleX([1, 2, 3, 4, 5], {
        stroke: '#ffffff', strokeOpacity: 0.06, strokeWidth: 0.5,
      }),
      Plot.ruleY([1, 2, 3, 4, 5], {
        stroke: '#ffffff', strokeOpacity: 0.06, strokeWidth: 0.5,
      }),
      // Risk zone dots: gold = high (score≥16), white-mid = medium, white-dim = low
      Plot.dot(data.filter((d) => d.score >= 16), {
        x: 'l', y: 'i',
        r: (d) => 5 + d.score * 0.5,
        fill: '#C9A84C', fillOpacity: 0.3,
        stroke: '#C9A84C', strokeOpacity: 0.15, strokeWidth: 0.5,
      }),
      Plot.dot(data.filter((d) => d.score >= 9 && d.score < 16), {
        x: 'l', y: 'i',
        r: (d) => 4 + d.score * 0.4,
        fill: '#ffffff', fillOpacity: 0.1,
        stroke: '#ffffff', strokeOpacity: 0.08, strokeWidth: 0.5,
      }),
      Plot.dot(data.filter((d) => d.score < 9), {
        x: 'l', y: 'i',
        r: (d) => 3 + d.score * 0.3,
        fill: '#ffffff', fillOpacity: 0.04,
        stroke: 'none',
      }),
    ],
  });
}

const RENDERERS = {
  stats: renderStats,
  capabilities: renderCapabilities,
  'dark-grid': renderDarkGrid,
};

export default function GrammarBackground({ variant = 'stats', className = '' }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    let chart = null;
    let cancelled = false;

    import('@observablehq/plot').then((Plot) => {
      if (cancelled) return;

      const render = () => {
        if (chart) { chart.remove(); chart = null; }
        el.innerHTML = '';
        const w = el.offsetWidth;
        const h = el.offsetHeight;
        if (!w || !h) return;
        const fn = RENDERERS[variant];
        if (!fn) return;
        chart = fn(Plot, el, w, h);
        if (chart) el.append(chart);
      };

      render();

      const ro = new ResizeObserver(render);
      ro.observe(el);

      el._roCleanup = () => { ro.disconnect(); if (chart) chart.remove(); };
    });

    return () => {
      cancelled = true;
      if (el._roCleanup) { el._roCleanup(); delete el._roCleanup; }
      if (chart) chart.remove();
    };
  }, [variant]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 w-full h-full pointer-events-none overflow-hidden ${className}`}
      aria-hidden="true"
    />
  );
}
