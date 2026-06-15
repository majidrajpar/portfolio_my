# Automation Scripts & AI Agents

This directory houses the background utilities, AI agent workflows, and maintenance scripts for the Majid Mumtaz Executive Portfolio. 

## Structure

* **`agents/`**: Contains orchestration workflows utilizing frameworks like AutoGen and LangGraph. These are designed to automate content review and implementation tasks.
* **`dashboards/`**: R and Python scripts dedicated to generating the mock forensic, financial, and audit risk dashboards displayed throughout the site. 
* **`screenshots/`**: Automated tools for capturing and optimizing high-fidelity UI states for case studies and documentation.
* **`utils/`**: General project utilities including Database seeding (`seed.mjs`, `init-db.mjs`), hyperlink checkers, and metadata extractors.

## Usage

These scripts are largely executed standalone from the root directory context, and many rely on the Python environments or local Node runtime.
* Ensure you have the necessary environments active for Python tools.
* Use standard Node commands (e.g., `npm run db:init`) for `.mjs` files tied to the `portfolio.db` lifecycle.
