# Repository Guidelines

## Project Structure & Module Organization
This repository is an Astro-based portfolio site with embedded React tools. Main app code lives in `src/`: page routes in `src/pages`, shared UI in `src/components`, layouts in `src/layouts`, data files in `src/data`, and utility/database code in `src/lib`. Static assets and downloadable files live in `public/`. Rust/WebAssembly sources for the audit engine are under `src/rust/audit_engine`. Maintenance scripts and content update helpers are in `scripts/`, while targeted regression tests currently live in `tests/`.

## Build, Test, and Development Commands
Use `npm install` once to install dependencies. Run `npm run dev` for local development, `npm run build` to create the production build, `npm run preview` to serve the built site locally, and `npm run lint` to run ESLint across the repo. The current regression test is manual: `node tests/document-comparator.test.js`.

## Coding Style & Naming Conventions
Follow the existing code style: 2-space indentation in front-end files, ESM modules, and semicolon-light JavaScript/TypeScript where the file already uses it. Use `PascalCase` for Astro/React components such as `DocumentComparator.jsx`, `camelCase` for helpers and scripts, and lowercase or kebab-style names for content assets when practical. Keep route files aligned to Astro conventions, for example `src/pages/projects/[id].astro`.

## Testing Guidelines
There is no full test runner wired into `package.json` yet, so add focused tests in `tests/` as standalone Node scripts when changing logic-heavy features. Name tests after the feature being verified, for example `feature-name.test.js`. For UI-heavy changes, run `npm run build`, `npm run lint`, and exercise the affected route or tool locally before opening a PR.

## Commit & Pull Request Guidelines
Recent history mixes concise imperative messages and small `fix:` commits, for example `fix: remove Astro default favicon.ico` and `Tighten homepage proof and contact hierarchy`. Keep commit subjects short, specific, and scoped to one change. PRs should include a clear summary, affected routes or scripts, linked issues if applicable, and screenshots for visible UI changes.

## Security & Content Notes
Do not commit secrets, personal tokens, or generated SQLite data dumps. Treat `public/downloads`, `public/images`, and generated screenshots as user-facing assets: preserve filenames unless you also update the references that consume them.
