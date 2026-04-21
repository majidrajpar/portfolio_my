import { useEffect, useRef } from 'react';

// Relationship network visualization : hero background
// Renders entity/intermediary network topology using Rust WASM for physics.
// Tier 0 = principal (large node), Tier 1 = intermediary (medium), Tier 2 = endpoint (small)

const NAVY = '#001F5B';
const GOLD = '#C9A84C';
const WHITE = '#FFFFFF';

const TIER_COLORS = [
  `${GOLD}CC`,    // tier 0 : principal, gold, prominent
  `${WHITE}55`,   // tier 1: intermediary, white dim
  `${WHITE}28`,   // tier 2: endpoint, white very dim
];

const EDGE_COLORS = [
  `${GOLD}18`,    // principal edges : faint gold trace
  `${WHITE}0D`,   // intermediary→endpoint : barely visible
];

export default function NetworkCanvas({ nodeCount = 42, className = '' }) {
  const canvasRef = useRef(null);
  const stateRef = useRef(null);
  const wasmRef = useRef(null);
  const rafRef = useRef(null);
  const frameRef = useRef(0);
  const base = (import.meta.env.BASE_URL || '/').replace(/\/$/, '');

  useEffect(() => {
    let cancelled = false;

    async function init() {
      try {
        // Dynamic import of WASM module
        // Use new Function to escape rolldown static import analysis . WASM is served from /public
        const dynamicImport = new Function('p', 'return import(p)');
        const wasm = await dynamicImport(`${base}/wasm/audit_engine.js`);
        await wasm.default();
        if (cancelled) return;
        wasmRef.current = wasm;

        const raw = wasm.generate_network(nodeCount, 7);
        stateRef.current = raw;
        startLoop();
      } catch (e) {
        // WASM unavailable : fall back to pure-JS static render
        stateRef.current = generateFallback(nodeCount);
        startLoop();
      }
    }

    function generateFallback(n) {
      // Pure-JS fallback matching the Rust output shape
      const nodes = Array.from({ length: n }, (_, i) => ({
        id: i,
        x: Math.random() * 1200,
        y: Math.random() * 600,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: i === 0 ? 3.5 : i < n / 4 ? 2.2 : 1.4,
        tier: i === 0 ? 0 : i < n / 4 ? 1 : 2,
      }));
      const edges = [];
      nodes.forEach((n1, i) => {
        if (n1.tier === 1) edges.push({ source: 0, target: i, weight: 0.8 });
        if (n1.tier === 1) {
          for (let j = 0; j < 3; j++) {
            const t2 = nodes.filter(x => x.tier === 2);
            if (t2.length) edges.push({ source: i, target: t2[Math.floor(Math.random() * t2.length)].id, weight: 0.4 });
          }
        }
      });
      return { nodes, edges };
    }

    function tickFallback(state) {
      state.nodes.forEach(node => {
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < 20 || node.x > 1180) node.vx *= -1;
        if (node.y < 20 || node.y > 580) node.vy *= -1;
        node.x = Math.max(10, Math.min(1190, node.x));
        node.y = Math.max(10, Math.min(590, node.y));
        node.vx *= 0.998;
        node.vy *= 0.998;
      });
      return state;
    }

    function draw() {
      const canvas = canvasRef.current;
      if (!canvas || !stateRef.current) return;

      const ctx = canvas.getContext('2d');
      const W = canvas.width;
      const H = canvas.height;
      const scaleX = W / 1200;
      const scaleY = H / 600;

      ctx.clearRect(0, 0, W, H);

      const { nodes, edges } = stateRef.current;

      // Draw edges first
      edges.forEach(({ source, target, weight }) => {
        const s = nodes[source];
        const t = nodes[target];
        if (!s || !t) return;
        const colorIdx = weight > 0.6 ? 0 : 1;
        ctx.beginPath();
        ctx.strokeStyle = EDGE_COLORS[colorIdx];
        ctx.lineWidth = weight > 0.6 ? 0.6 : 0.3;
        ctx.moveTo(s.x * scaleX, s.y * scaleY);
        ctx.lineTo(t.x * scaleX, t.y * scaleY);
        ctx.stroke();
      });

      // Draw nodes
      nodes.forEach(node => {
        const x = node.x * scaleX;
        const y = node.y * scaleY;
        const r = node.radius * Math.max(scaleX, scaleY);
        ctx.beginPath();
        ctx.arc(x, y, r, 0, Math.PI * 2);
        ctx.fillStyle = TIER_COLORS[node.tier] || TIER_COLORS[2];
        ctx.fill();
      });
    }

    function startLoop() {
      function loop() {
        if (cancelled) return;
        frameRef.current++;

        // Tick physics every 2 frames (~30fps physics, 60fps draw)
        if (frameRef.current % 2 === 0 && stateRef.current) {
          if (wasmRef.current) {
            try {
              stateRef.current = wasmRef.current.tick_network(stateRef.current);
            } catch {
              stateRef.current = tickFallback(stateRef.current);
            }
          } else {
            stateRef.current = tickFallback(stateRef.current);
          }
        }

        draw();
        rafRef.current = requestAnimationFrame(loop);
      }
      rafRef.current = requestAnimationFrame(loop);
    }

    function resize() {
      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = canvas.offsetWidth * window.devicePixelRatio;
      canvas.height = canvas.offsetHeight * window.devicePixelRatio;
      const ctx = canvas.getContext('2d');
      ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
    }

    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = canvas.offsetWidth;
      canvas.height = canvas.offsetHeight;
      window.addEventListener('resize', resize);
    }

    init();

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      window.removeEventListener('resize', resize);
    };
  }, [base, nodeCount]);

  return (
    <canvas
      ref={canvasRef}
      className={`absolute inset-0 w-full h-full pointer-events-none ${className}`}
      style={{ opacity: 0.55 }}
      aria-hidden="true"
    />
  );
}
