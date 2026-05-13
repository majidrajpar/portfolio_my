# Project Instruction: Executive Portfolio - Majid Mumtaz

This repository contains the source code for the professional portfolio of Majid Mumtaz, Director of Internal Audit. It is a high-performance, data-driven site built with Astro 5, React 19, and Tailwind CSS 4, showcasing expertise in internal audit automation, fraud detection, and corporate governance.

## 🏗️ Project Architecture & Tech Stack

- **Framework:** [Astro 5](https://astro.build/) (Static Site Generation with Selective Hydration).
- **UI Library:** [React 19](https://react.dev/) for interactive components.
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) using the modern Vite-based engine.
- **Data Management:**
  - **Database:** [SQLite](https://www.sqlite.org/) (via `better-sqlite3`) for structured content like case studies, career milestones, and professional engagements.
  - **Static Data:** JSON and CSV files in `src/data/` for ML models and metadata.
- **Visualizations:**
  - [Recharts](https://recharts.org/) & [Observable Plot](https://observablehq.com/plot/) for data-heavy charts.
  - [Framer Motion](https://www.framer.com/motion/) for sophisticated UI animations.
- **Automation & Scripting:**
  - **Node.js:** Database initialization and maintenance (`scripts/*.mjs`).
  - **Python:** Screenshot capture, dashboard generation, and ML model training (`scripts/*.py`, root directory scripts).
  - **R:** Statistical charts and career timelines (`scripts/*.R`).
  - **Rust/WASM:** Potential audit engine logic in `src/rust/audit_engine`.

## 📁 Directory Structure

- `src/pages/`: Astro routes (including dynamic routes for projects).
- `src/components/`: Reusable React and Astro UI components.
- `src/layouts/`: Base layouts for page structures.
- `src/lib/`: Core logic, database connectors, and utility functions.
- `src/data/`: ML models (JSON) and source datasets.
- `scripts/`: Maintenance scripts for DB updates, newsletter syncing, and chart generation.
- `public/`: Static assets (CV, downloads, images, project screenshots).
- `tests/`: Standalone regression tests (Node.js).

## 🚀 Key Commands

### Development
- `npm run dev`: Start the Astro development server.
- `npm run db:init`: Initialize/reset the SQLite database (`portfolio.db`) from `seed.mjs`.
- `npm run db:check`: Verify the integrity and content of the local database.

### Build & Deploy
- `npm run build`: Generate the production-ready static site in the `dist/` directory.
- `npm run preview`: Locally preview the production build.
- `npm run lint`: Run ESLint to ensure code quality.

### Maintenance (Scripts)
- `python optimize_screenshots.py`: Compress and optimize project screenshots.
- `node scripts/update-case-study.mjs`: Update specific project data in the database.

## 🛠️ Development Conventions

- **Database-First Content:** Most site content (projects, milestones) is managed via the SQLite database. Do not hardcode content in `.astro` files; update `seed.mjs` or the database directly and ensure it's reflected in the UI.
- **Component Naming:** Use `PascalCase` for React and Astro components (e.g., `AuditDashboard.jsx`).
- **Styling:** Adhere to Tailwind 4 conventions. Use the `editorial-panel`, `glass-card`, and `frame-panel` classes defined in `src/index.css` for consistent luxury/executive aesthetics.
- **TypeScript:** Use strict typing where possible, especially for data fetching from the database.
- **Deployment:** The site is deployed to GitHub Pages via GitHub Actions (`.github/workflows/deploy.yml`). Ensure `astro.config.mjs` matches the target environment (currently configured for `https://majidrajpar.github.io/portfolio_my/`).

## 🧪 Testing
- Current tests are standalone scripts in `tests/`. Always run `node tests/document-comparator.test.js` after making changes to the document comparison logic.
- Perform visual regression checks after running `npm run build` by checking the `dist/` output.

## 📝 Security & Privacy
- **Never commit `portfolio.db`** (it is gitignored).
- **Never commit secrets** or API keys (e.g., Formspree IDs) directly to the repository. Use environment variables if needed.
- Respect the filenames in `public/downloads/` and `public/images/` as they are referenced in the database content.
