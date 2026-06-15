# 🕸️ Repository & Website Knowledge Graph
> **Interactive Architecture, Data Relationships, and Component Topology of the Executive Portfolio.**

This document provides a comprehensive **Knowledge Graph** mapping the software architecture, database relations, data pipelines, and component relationships of the Majid Mumtaz Executive Portfolio.

---

## 1. High-Level System Architecture

This website leverages **Astro 5** for static site generation (SSG) with **React 19** selective client-side hydration. The backend content layer is powered by **SQLite**, which compiles into static data stores during build time.

```mermaid
graph TD
    %% Base layers
    subgraph Data Layer [1. Data Layer SQLite & Assets]
        DB[(portfolio.db)]
        Seed[seed.mjs]
        MLModels[ML JSON Models]
        StaticDocs[SOPs, CV & Downloads]
    end

    subgraph Service Layer [2. Controller & Service Layer]
        DBConn[db.ts]
        AuditLib[auditMetrics.ts]
        CSVParser[xlsx / csv helpers]
    end

    subgraph Component Layer [3. UI & Interactive Component Layer]
        AstroPages[Astro Layouts & Pages]
        ReactDash[Audit Dashboard React]
        ReactComp[Document Comparator React]
        ReactFraud[Fraud Predictor React]
        ReactTracker[Audit Finding Tracker React]
    end

    subgraph Output Layer [4. Deployment & Hosting]
        ViteTailwind[Vite + Tailwind CSS 4]
        DistFolder[Static dist/ Output]
        GHAction[GitHub Actions]
        GHPages[GitHub Pages Hosting]
    end

    %% Relationships
    Seed -->|Initializes & Seeds| DB
    DB -->|Read Queries| DBConn
    MLModels -->|Parsed by| ReactFraud
    StaticDocs -->|Processed by| ReactComp
    DBConn -->|Provides typed data| AstroPages
    DBConn -->|Provides findings data| ReactTracker
    AuditLib -->|Computes metrics| ReactDash
    AstroPages -->|Hydrates React components| ReactDash
    AstroPages -->|Hydrates React components| ReactComp
    AstroPages -->|Hydrates React components| ReactFraud
    AstroPages -->|Hydrates React components| ReactTracker
    ReactDash -->|Styled via| ViteTailwind
    ReactComp -->|Styled via| ViteTailwind
    AstroPages -->|Bundled via| ViteTailwind
    ViteTailwind -->|Compiles to| DistFolder
    DistFolder -->|Pushed by| GHAction
    GHAction -->|Serves site| GHPages

    %% Styling
    style DB fill:#1e293b,stroke:#ffd700,stroke-width:2px,color:#fff
    style DistFolder fill:#1e293b,stroke:#00f0ff,stroke-width:2px,color:#fff
    style GHPages fill:#0f172a,stroke:#10b981,stroke-width:2px,color:#fff
```

---

## 2. Entity-Relationship (ER) Schema

Most of the content rendered on the site is managed dynamically via an **SQLite database (`portfolio.db`)**. The database is fully relational and mapped in TypeScript.

```mermaid
erDiagram
    CATEGORY_META ||--o{ CASE_STUDIES : "classifies"
    CASE_STUDIES ||--o{ PROFESSIONAL_ENGAGEMENTS : "links to"
    ADVISORY_TIERS ||--o{ CAREER_MILESTONES : "categorizes"

    CATEGORY_META {
        string slug PK "Primary Key (e.g. audit-automation)"
        string name "Readable category name"
        string description "Section overview details"
        string icon "Lucide-React icon identifier"
        integer order_index "Sort precedence"
    }

    CASE_STUDIES {
        integer id PK "Primary Key"
        string category_slug FK "Reference to Category"
        string title "Headline of the engagement"
        string client_type "Industry / Sector"
        string duration "Time frame of audit"
        string summary "High-level overview"
        string challenge "Identified risks and operational failure"
        string approach "Audit testing methodology applied"
        string solution "Automated tools and controls built"
        string impact "Remediation results & cost savings"
        string tools_used "Comma-separated key utilities"
        string screenshot_url "Path to optimized visualization card"
    }

    PROFESSIONAL_ENGAGEMENTS {
        integer id PK "Primary Key"
        string role "Corporate Designation"
        string organization "Company Name"
        string location "Geographic Site"
        string duration "Years of service"
        string bullet_points "JSON string array of key achievements"
        integer order_index "Chronological hierarchy ordering"
    }

    ADVISORY_TIERS {
        string slug PK "Primary Key (e.g. board-level, executive)"
        string title "Tier Name"
        string description "Focus area summary"
        integer order_index "Display priority"
    }

    CAREER_MILESTONES {
        integer id PK "Primary Key"
        string tier_slug FK "Reference to Advisory Tier"
        string year "Fiscal Year"
        string title "Milestone Highlight"
        string description "Detailed corporate governance impact"
        string metrics "Key performance indicator reached"
    }
```

---

## 3. Web Directory Map & Module Connectivity

The following graph maps directories, core scripts, and files to illustrate how they integrate together:

```mermaid
graph TD
    %% Nodes
    A[package.json] -->|Configures scripts| B(npm run dev / npm run build)
    C[astro.config.mjs] -->|Orchestrates builds & routes| D[src/pages/]
    E[src/index.css] -->|Declares Tailwind 4 custom styles| D
    
    subgraph Core Scripts [scripts/]
        F[init-db.mjs] -->|Creates tables & seeds| G[portfolio.db]
        H[check-db.mjs] -->|Validates integrity of| G
        I[optimize_screenshots.py] -->|Compresses dashboard captures in| J[public/images/]
    end

    subgraph Data Connectors [src/lib/]
        K[db.ts] -->|Reads from| G
        L[auditMetrics.ts] -->|Calculates summary metrics for| M[src/components/AuditDashboard.jsx]
    end

    subgraph Client Tools [src/components/]
        N[DocumentComparator.jsx] -->|Uses client-side PDF OCR| O[pdfjs-dist / Tesseract.js]
        P[FraudPredictor.jsx] -->|Runs custom predictions with| Q[src/data/ml_fraud_model.json]
        R[AuditTracker.jsx] -->|Enables dynamic findings searches| G
    end

    D -->|Renders Pages & hydrates| M
    D -->|Renders Pages & hydrates| N
    D -->|Renders Pages & hydrates| P
    D -->|Renders Pages & hydrates| R
```

---

## 4. Technology Hierarchy & Interdependencies

The portfolio features nested dependencies which are critical to performance and bundle optimizations.

| Tier | Component Type | File / Path | Core Dependencies | Primary Role |
| :--- | :--- | :--- | :--- | :--- |
| **System** | Base Layout | `src/layouts/Layout.astro` | Astro Core, `src/index.css` | Site container, global SEO metadata, typography injection. |
| **Data** | Database Client | `src/lib/db.ts` | `better-sqlite3` | Instantiates SQLite connection and exports typed data queries. |
| **Data** | Metrics Engine | `src/lib/auditMetrics.ts` | Custom algorithms | Extracts metrics and computes standard deviation anomalies. |
| **Widget** | Audit Dashboard | `src/components/AuditDashboard.jsx` | `recharts`, `framer-motion` | Renders dynamic financial and operational audit visuals. |
| **Widget** | Doc Comparator | `src/components/DocumentComparator.jsx` | `pdfjs-dist`, `mammoth`, `xlsx` | Extracts text from formats and renders clean side-by-side diff. |
| **Widget** | Fraud Predictor | `src/components/FraudPredictor.jsx` | Dynamic form controls | Evaluates corporate threat indexes from user input. |
| **Page** | Dynamic Case Studies | `src/pages/projects/[id].astro` | DB client, `Layout.astro` | Dynamically generates detailed HTML case studies from SQLite. |

---

## 5. Deployment Lifecycle & Git Hooks

Understanding the automation flow from local development to production release:

1. **Local Working Copy:** Content edits are performed in `seed.mjs` and tested locally via `npm run dev`.
2. **Diagnostic Step:** Running `npm run db:check` and `npm run lint` guarantees database and TypeScript compiler safety.
3. **Commit Stage:** Commit messages follow semantic conventions as outlined in the guidelines.
4. **Push / CI Trigger:** On push, GitHub Actions spins up the build node, compiles TS/CSS, and bundles static assets into `dist/`.
5. **Deployment:** The production bundle is deployed automatically to GitHub Pages.
