# Direction: Practitioner Workbench & Knowledge Hub (`portfolio_my`)

## Background & Positioning
- **Commercial Practice (`https://theauditsignal.com`):** Client-facing advisory, assurance, risk, and consultancy site for boards, audit committees, and CFOs in the UAE under Practice Principal Majid Mumtaz.
- **GitHub Pages (`https://majidrajpar.github.io/portfolio_my`):** Repositioned as a standalone **Knowledge Leader & Practitioner Dashboard**—combining interactive audit/telemetry tools with a structured knowledge library.

## Current State & Routing
- The immediate canonical forwarder on `/` to `https://theauditsignal.com` remains **active for now**.
- New dashboard and knowledge-hub work can be built under a dedicated subpath (e.g., `/dashboard/` or `/hub/`) and tested independently before deciding whether to lift the root redirect.

## Core Pillars
1. **Interactive Tools & Telemetry Dashboard**
   - Browser-based audit calculators, ML classifiers, and continuous controls monitoring (CCM) utilities.
   - Clean, data-dense practitioner interface for running quick diagnostics, sample/variance checks, and risk scoring.
2. **Knowledge & Research Library**
   - Field notes, governance frameworks (COSO ERM, IIA Standards, ICFR/ITGC), operational playbooks, and downloadable templates.
   - Trench-tested practitioner writing and reference material, distinct from commercial service pages.

## Next Steps (in `portfolio_my`)
- Audit existing tools, datasets, and assets already in `C:\Users\sorat\Desktop\Coding\portfolio_my` to see what can be surfaced immediately.
- Scaffold the `/dashboard/` route and knowledge index structure while keeping the root `/` redirect intact.
