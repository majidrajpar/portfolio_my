# Decision Log (`portfolio_my`)

All structural, design, content, and security decisions for `portfolio_my` are recorded here with timestamps (`Asia/Karachi`, `+05:00`).

## 2026-11-15 23:48 +05:00 — Initialize Decision Log
- **Decision:** Maintain `DECISION_LOG.md` at the repository root for all changes going forward.
- **Context:** Track architectural, design, and security changes across `portfolio_my` independently from `theauditsignal.com`.

## 2026-11-15 23:33 +05:00 — Browser Security Controls (`BaseLayout.astro`, commit `627b592`)
- **Decision:** Added `Content-Security-Policy`, `Referrer-Policy` (`strict-origin-when-cross-origin`), and `X-Content-Type-Options` (`nosniff`) meta tags to `src/layouts/BaseLayout.astro`.
- **Context:** GitHub Pages static hosting does not support custom `_headers`; meta-level CSP and `scripts/audit-security-gate.mjs` enforce client and build-time controls.

## 2026-11-15 22:01 +05:00 — Radically Minimalist Design & Infographics (`index.astro`, `global.css`, commits `1cf7f59`, `2db5a28`, `3169880`)
- **Decision:** Replaced the dark/warm-parchment hero and container styles with a white/slate minimalist layout (`#f8fafc` canvas, `#ffffff` cards, `slate-900` ink), switched typography to `Inter` and `JetBrains Mono`, and added a 4-item Selected Infographics strip on `index.astro`.
- **Context:** Aligns the site to a clean, modern, non-commercial practitioner portfolio.

## 2026-11-15 21:40 +05:00 — Decommission `/dashboard/` & Merge About into Homepage (commits `6baa41e`, `7fb0807`)
- **Decision:** Removed `theauditsignal.com` redirect from `BaseLayout.astro`, removed `Advisory` and `About` from `Navbar.tsx`, merged About/Experience (`career_milestones`) and Recommendations (`testimonials.js`) into `index.astro`, and deleted `/dashboard/`.
- **Context:** `portfolio_my` operates as an independent personal portfolio; commercial advisory lives exclusively on `theauditsignal.com`.

## 2026-11-15 23:52 +05:00 — Security Audit Remediations (`BaseLayout.astro`, `GrammarBackground.tsx`, `NetworkCanvas.tsx`)
- **Decision:** Removed `new Function(...)` dynamic-import wrappers in `GrammarBackground.tsx` and `NetworkCanvas.tsx` in favor of `import(/* @vite-ignore */ ...)`, dropped `'unsafe-eval'` from `BaseLayout.astro` CSP `script-src`, added `https://cdn.jsdelivr.net` for `@observablehq/plot`, and removed the ineffective `X-Content-Type-Options` meta tag.
- **Context:** Remediated findings from the application security audit without breaking runtime WASM or Plot loading.
