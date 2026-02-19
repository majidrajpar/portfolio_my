# Majid Mumtaz - Professional Portfolio Website

**Live Site**: https://majidrajpar.github.io/portfolio_my/ (once deployed)

A professional portfolio website showcasing 20+ years of internal audit leadership, technical expertise in audit automation, ML-powered fraud detection, and enterprise risk management.

## 🎯 Project Overview

This portfolio demonstrates a unique combination of:
- **Board-level audit leadership** (Director-level, 20+ years)
- **Technical depth** (Python/ML, data analytics, automation)
- **Thought leadership** (3 published works, industry recognition)
- **Commercial impact** (AED 7.7M value created, $127M M&A capital protected)

## 🚀 Technology Stack

- **Framework**: [Astro.js 4.x](https://astro.build) - Ultra-fast, SEO-optimized static site generator
- **Styling**: [Tailwind CSS 4.x](https://tailwindcss.com) - Professional, responsive design
- **Deployment**: GitHub Pages - Free, reliable hosting
- **Content**: MDX support for rich project pages
- **Performance**: Optimized for Lighthouse score 90+

## 📁 Project Structure

```
portfolio_my/
├── .github/
│   └── workflows/
│       └── deploy.yml              # GitHub Actions auto-deployment
├── public/
│   ├── images/                     # Project screenshots, diagrams, photos
│   │   ├── projects/               # Project-specific images
│   │   ├── diagrams/               # Architecture diagrams
│   │   ├── certifications/         # Certification badges
│   │   └── publications/           # Book cover images
│   └── cv/                         # Downloadable CV
├── src/
│   ├── components/                 # Reusable Astro components
│   │   ├── MetricCard.astro        # Impact metric displays
│   │   ├── ProjectCard.astro       # Project preview cards
│   │   ├── TechBadge.astro         # Technology badges
│   │   └── CollapsibleSection.astro # Expandable sections
│   ├── layouts/
│   │   └── BaseLayout.astro        # Main layout with header/footer
│   ├── pages/                      # Site pages (auto-routed)
│   │   ├── index.astro             # Home page
│   │   ├── about.astro             # About page
│   │   ├── contact.astro           # Contact page
│   │   ├── skills.astro            # Skills & technologies
│   │   ├── consulting.astro        # Consulting services
│   │   └── projects/
│   │       └── index.astro         # Projects hub
│   └── styles/
│       └── global.css              # Global styles + Tailwind
├── astro.config.mjs                # Astro configuration
├── tailwind.config.cjs             # Tailwind CSS configuration
└── package.json                    # Dependencies
```

## 🛠️ Local Development

### Prerequisites
- Node.js 20+
- npm 11+

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The site will be available at `http://localhost:4321`

### Build for Production

```bash
# Create production build
npm run build

# Preview production build locally
npm run preview
```

The built site will be in the `dist/` directory.

## 🚀 Deployment to GitHub Pages

### Initial Setup

1. **Create GitHub Repository**
   ```bash
   # Initialize git (if not already done)
   git add .
   git commit -m "Initial portfolio website"

   # Create repository on GitHub (majidrajpar.github.io or portfolio_my)
   git branch -M main
   git remote add origin https://github.com/majidrajpar/portfolio_my.git
   git push -u origin main
   ```

2. **Enable GitHub Pages**
   - Go to repository Settings → Pages
   - Source: GitHub Actions (recommended)
   - The workflow will automatically deploy on every push to `main`

### Automatic Deployment

The site is configured for automatic deployment via GitHub Actions (`.github/workflows/deploy.yml`). Every push to the `main` branch triggers:
1. Build process (npm install, npm run build)
2. Upload build artifacts
3. Deploy to GitHub Pages

## 📊 Portfolio Projects Showcased

1. **ML-Powered Fraud Detection System** - 78% fraud reduction, 2.3M transactions/month
2. **Audit Tools Toolkit v2.0** - 14+ tools, 70% time reduction
3. **Finance Dashboard v2.0** - 85% reporting time reduction, multi-currency
4. **Forensic Audit Toolbox** - 82% detection accuracy, SHA-256 evidence chain
5. **Internal Audit Tracker** - Enterprise-grade with PowerPoint automation
6. **Audit Carousel Content Library** - LinkedIn thought leadership

## 📧 Contact & Consulting

**Majid Mumtaz CIA, ACA, FCCA**
- Email: majidrajpar@gmail.com
- LinkedIn: [linkedin.com/in/majid-m-4b097118](https://www.linkedin.com/in/majid-m-4b097118/)
- Location: Dubai, UAE (Golden Visa Holder)
- Company: [Veritux Consulting Network](https://veritux.com/consultants/majid-mumtaz/)

## 📄 License

© 2026 Majid Mumtaz. All rights reserved.

---

**Built with** ❤️ **using Astro.js + Tailwind CSS**
