import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FileText, BrainCircuit, Landmark, Scale } from 'lucide-react';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import newsletterArticles from './data/newsletter.json';
import MetricCard from './components/MetricCard';
import ProjectCard from './components/ProjectCard';
import DownloadCard from './components/DownloadCard';
import ProjectDetail from './components/ProjectDetail';
import AllProjectsGallery from './components/AllProjectsGallery';
import AllResourcesGallery from './components/AllResourcesGallery';

const ContactForm = () => {
  const formRef = useRef(null);
  const [status, setStatus] = useState('idle'); // idle | submitting | success | error

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus('submitting');
    try {
      const res = await fetch('https://formspree.io/f/xdallyjv', {
        method: 'POST',
        body: new FormData(formRef.current),
        headers: { Accept: 'application/json' },
      });
      if (res.ok) {
        setStatus('success');
        formRef.current.reset();
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  };

  const inputClass = "w-full bg-slate-800/50 border border-white/10 rounded-xl px-5 py-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-500/50 transition-colors text-sm";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: 0.1 }}
    >
      <div className="glass-card p-10">
        {status === 'success' ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-6">✓</div>
            <h3 className="text-white font-black text-2xl mb-3">Message Sent</h3>
            <p className="text-slate-400">Thank you — I'll be in touch within 24 hours.</p>
            <button onClick={() => setStatus('idle')} className="mt-8 btn-secondary text-xs">Send Another</button>
          </div>
        ) : (
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Name</label>
                <input name="name" type="text" required placeholder="Your full name" className={inputClass} />
              </div>
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Organisation</label>
                <input name="organisation" type="text" placeholder="Company / Entity" className={inputClass} />
              </div>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Email</label>
              <input name="email" type="email" required placeholder="your@email.com" className={inputClass} />
            </div>
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block">Message</label>
              <textarea name="message" required rows={5} placeholder="Describe the challenge you're facing" className={`${inputClass} resize-none`} />
            </div>
            {status === 'error' && (
              <p className="text-red-400 text-sm">Something went wrong. Please try emailing directly.</p>
            )}
            <button
              type="submit"
              disabled={status === 'submitting'}
              className="btn-primary w-full justify-center disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'submitting' ? 'Sending…' : 'Send Message'}
            </button>
          </form>
        )}
      </div>
    </motion.div>
  );
};

const App = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // State for downloadable documents
  const [documents, setDocuments] = useState([]);

  // State for project detail view
  const [selectedProject, setSelectedProject] = useState(null);
  const [showAllProjects, setShowAllProjects] = useState(false);
  const [showAllResources, setShowAllResources] = useState(false);

  const featuredDocIds = ['doc-017', 'doc-018', 'doc-006'];

  // Load documents from JSON
  useEffect(() => {
    fetch('/portfolio_my/downloads/documents.json')
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error('Failed to load documents:', err));
  }, []);

  // Project data
  const featuredProjects = [
    {
      id: 'fraud-detection-ml',
      title: 'ML-Powered Fraud Detection',
      description: 'Advanced machine learning architecture using Isolation Forest and K-Means clustering to analyse 2.3M+ monthly transactions.',
      category: 'Fraud Forensics',
      impact: '78% Reduction in Fraud Incidents (2.3M monthly transactions)',
      techStack: ['Python', 'scikit-learn', 'Pandas', 'Excel Automation'],
      image: '/portfolio_my/images/projects/fraud-detection/fraud-dashboard.webp',
      features: [
        'ML anomaly detection with 87.3% accuracy using Isolation Forest',
        'Manager discount rate analysis with automated risk scoring',
        'Hourly transaction pattern heat mapping',
        'Location-based risk assessment across multiple regions',
        'Automated recovery identification (AED 3.2M recurring annual recovery)',
        'Real-time fraud probability scoring for each transaction'
      ]
    },
    {
      id: 'dfm-ipo-readiness',
      title: 'DFM IPO Readiness — UAE Multi-Brand F&B Technology Platform',
      description: 'Led IPO readiness for a UAE-headquartered, high-growth F&B technology platform operating 100+ kitchens across 7 countries. Delivered governance restructuring, ICOFR build-out, and UAE SCA compliance targeting Dubai Financial Market listing — alongside a parallel group-wide COSO ERM programme.',
      category: 'Corporate Governance',
      impact: 'End-to-end IPO readiness across governance, ICOFR, and UAE SCA compliance for a multi-jurisdiction, multi-brand platform',
      techStack: ['UAE SCA Regulations', 'DFM Listing Rules', 'COSO ICOFR', 'IFRS', 'UAE Companies Law'],
      image: '/portfolio_my/images/projects/dfm-ipo-readiness/icofr-governance.webp',
      features: [
        'ICOFR scoping and Risk Control Matrix documentation across 12+ business processes',
        'UAE SCA Corporate Governance Code compliance — board composition, committee design, disclosure framework',
        'IFRS-compliant financial statement preparation and audit readiness across all entities',
        'Three Lines of Defence model embedded ahead of listing with internal audit function build-out',
        'Dual-workstream delivery: IPO governance alongside group-wide COSO ERM 2017 rollout across 7 jurisdictions',
        'Board, Audit Committee, and investor reporting frameworks designed for post-listing governance obligations'
      ]
    },
  ];

  const allProjects = useMemo(() => [
    ...featuredProjects,
    {
      id: 'audit-findings-system',
      title: 'Audit Findings Management System',
      description: 'Enterprise-grade automation framework delivering 100% population testing across multi-entity GCC operations with automated findings tracking.',
      category: 'Audit Transformation',
      impact: '70% reduction in audit preparation cycle time',
      techStack: ['Python', 'YAML', 'IIA Compliance', 'openpyxl'],
      image: '/portfolio_my/images/projects/audit-tools/findings-tracker.webp',
      features: [
        'Colour-coded severity tracking (Critical/High/Medium/Low)',
        'Automated aging analysis with remediation deadline tracking',
        '100% population testing across all audit areas',
        'Finding ID generation with unique reference numbers',
        'Real-time status dashboard for audit committees',
        'Automated report generation for management review'
      ]
    },
    {
      id: 'executive-financial-dashboard',
      title: 'Executive Financial Dashboard',
      description: 'Proprietary financial reporting engine providing real-time board-level visibility into capital leaks, variance analysis, and recovery tracking.',
      category: 'Strategic Dashboards',
      impact: '85% automated reporting efficiency achieved',
      techStack: ['xlsxwriter', 'Pandas', 'Power BI', 'Python'],
      image: '/portfolio_my/images/projects/finance-dashboard/executive-dashboard.webp',
      features: [
        'Real-time KPI monitoring (AED 127M, AED 68.2M, 37.5%)',
        'Monthly P&L with quarterly trend analysis',
        'Budget vs. Actual variance tracking with colour coding',
        'Automated financial reporting for board meetings',
        'Capital leak identification and recovery tracking',
        'Multi-period comparative analysis (12-month view)'
      ]
    },
    {
      id: 'tadawul-ipo-readiness',
      title: 'Tadawul IPO Readiness — GCC Premium Brand',
      description: 'Led end-to-end IPO readiness transformation for a GCC premium brand targeting Tadawul listing. Delivered a 24-month programme covering ICOFR implementation, CMA regulatory compliance, governance restructuring, and investor-grade financial documentation.',
      category: 'Corporate Governance',
      impact: 'SAR 500M+ capital raise target — full ICOFR certification across 14 business processes',
      techStack: ['COSO ICOFR', 'CMA Regulations', 'Tadawul Listing Rules', 'IFRS', 'Big 4 Co-sourcing'],
      image: '/portfolio_my/images/projects/tadawul-ipo-readiness/icofr-dashboard.svg',
      features: [
        'ICOFR implementation across 14 processes with full Risk Control Matrix documentation',
        'CMA Corporate Governance Regulations compliance — board independence, committee formation',
        '3-year IFRS-compliant audited financial statements and prospectus preparation',
        'Readiness scorecard framework targeting 70%+ compliance across all workstreams',
        'Big 4 external auditor coordination and reliance-based control testing programme',
        'Board, audit committee, and investor roadshow reporting packs (30+ slide deck)'
      ]
    },
    {
      id: 'enterprise-audit-platform',
      title: 'Enterprise Audit Management Platform',
      description: 'Comprehensive audit management platform with executive dashboards, PowerPoint automation, and 3-tier governance reporting for multi-entity operations.',
      category: 'Audit Transformation',
      impact: 'End-to-end audit lifecycle automated — from planning through board reporting across multi-entity operations',
      techStack: ['Python', 'openpyxl', 'python-pptx'],
      image: '/portfolio_my/images/projects/enterprise-audit-tracker/audit-dashboard.webp',
      features: [
        'Director dashboard with real-time operational KPIs',
        'Multi-entity audit planning and scheduling',
        'Automated PowerPoint presentation generation',
        '3-tier governance reporting (Operational/Management/Board)',
        'Risk-based audit scheduling with priority scoring',
        'Integrated findings tracking across all entities'
      ]
    },
    {
      id: 'food-safety-risk',
      title: 'Food Safety Risk Assessment Framework',
      description: 'Advanced risk management framework for F&B operations with heat mapping, control validation, and compliance tracking across 70+ locations.',
      category: 'Audit Transformation',
      impact: 'End-to-end food safety risk framework deployed across 70+ locations with executive risk reporting',
      techStack: ['Python', 'Risk Analytics', 'Compliance Frameworks'],
      image: '/portfolio_my/images/projects/food-safety-risk/risk-heatmap.webp',
      features: [
        'Risk heat mapping across 70+ restaurant locations',
        'Control validation and effectiveness testing',
        'Compliance tracking with regulatory requirements',
        'Mitigation roadmap generation with timelines',
        'Executive risk reporting for board visibility',
        'Location-specific risk scoring and prioritisation'
      ]
    },
    {
      id: 'forensic-fraud-toolkit',
      title: 'Forensic Fraud Investigation Toolkit',
      description: 'Professional forensic analysis toolkit for major fraud cases with control failure mapping, evidence tracking, and litigation support documentation.',
      category: 'Fraud Forensics',
      impact: 'Multi-case fraud investigation support — control failure mapping and litigation-ready documentation',
      techStack: ['Python', 'Excel Automation', 'Forensic Accounting'],
      image: '/portfolio_my/images/projects/fraud-cases/fraud-analysis.webp',
      features: [
        'Control failure mapping with root cause analysis',
        'Evidence tracking with chain of custody',
        'Litigation support report generation',
        'Major fraud case documentation and analysis',
        'Recovery action planning with financial impact',
        'Professional forensic accounting methodologies'
      ]
    },
    {
      id: 'multi-location-compliance',
      title: 'Multi-Location Audit Compliance System',
      description: 'Comprehensive audit compliance system for multi-location restaurant operations with standardised procedures, tracking, and remediation monitoring.',
      category: 'Audit Transformation',
      impact: 'Standardised audit procedures deployed across 70+ restaurant locations',
      techStack: ['Python', 'openpyxl', 'Audit Standards'],
      image: '/portfolio_my/images/projects/restaurant-audit/audit-checklist.webp',
      features: [
        'Comprehensive audit checklists for F&B operations',
        'Compliance tracking across multiple locations',
        'Remediation monitoring with deadline tracking',
        'Action plan reporting for management review',
        'Standardised procedures across all sites',
        'Automated compliance scoring and ratings'
      ]
    },
    {
      id: 'nomu-listing-readiness',
      title: 'Nomu Parallel Market Listing — KSA Healthcare Subsidiary',
      description: 'As Group Internal Audit Director, led listing readiness for a KSA healthcare subsidiary of a diversified GCC holding group targeting the Tadawul Nomu Parallel Market. Coordinated governance, ICOFR, and regulatory submissions across the holding and subsidiary structures.',
      category: 'Corporate Governance',
      impact: 'Subsidiary successfully structured for parallel market listing within group governance framework',
      techStack: ['Tadawul Nomu Rules', 'COSO', 'ICOFR', 'CMA Regulations', 'Holding Group Governance'],
      image: '/portfolio_my/images/projects/nomu-listing-readiness/governance-structure.svg',
      features: [
        'Subsidiary-level governance framework designed within holding group structure',
        'ICOFR scoping and control documentation aligned to Nomu listing requirements',
        'Intercompany transaction review and related-party disclosure framework',
        'Holding group audit committee oversight model for listed subsidiary',
        'CMA regulatory gap analysis and remediation roadmap',
        'Coordination with investment bank, legal advisors, and CMA on listing timetable'
      ]
    },
    {
      id: 'coso-erm-9country',
      title: 'COSO ERM Programme — Multi-Brand F&B Platform (7 Countries)',
      description: 'Designed and chaired the implementation of a full COSO ERM 2017 / ISO 31000 framework for a UAE-based multi-brand F&B technology platform operating 100+ kitchens across 7 countries. Built enterprise risk register, KRI dashboards, BCP plans, and embedded Three Lines of Defence across all jurisdictions.',
      category: 'Enterprise Risk',
      impact: '50+ risks mapped across 7 jurisdictions — 20+ live KRIs with board risk appetite formally adopted',
      techStack: ['COSO ERM 2017', 'ISO 31000', 'Three Lines of Defence', 'KRI Dashboards', 'Power BI'],
      image: '/portfolio_my/images/projects/coso-erm/risk-heatmap.svg',
      features: [
        'Enterprise risk universe across 9 risk categories: operational, financial, strategic, food safety, technology, supply chain, compliance, reputational, and people risk',
        '20+ Key Risk Indicators with Red/Amber/Green thresholds calibrated to operational data',
        'Board-approved risk appetite statement with zero-tolerance for food safety and compliance breaches',
        'Business Continuity Plans for all 7 markets with defined RTOs (critical systems: 2–8 hours)',
        'Three Lines of Defence model embedded across 7 jurisdictions with country risk coordinators',
        '12-month phased implementation: foundation, rollout, and embed — with Risk Committee reporting from Month 5'
      ]
    },
    {
      id: 'holding-group-governance',
      title: 'Corporate Governance Framework & Manual — KSA Holding Group',
      description: 'As Group Internal Audit Director, led a comprehensive corporate governance upgrade for a KSA multi-sector private holding group. Delivered a full governance manual, board and committee structures, delegation of authority matrix, and Three Lines of Defence model aligned to Saudi Companies Law and international best practice.',
      category: 'Corporate Governance',
      impact: 'Group-wide governance manual adopted by board — covering holding company and all operating subsidiaries',
      techStack: ['Saudi Companies Law', 'IIA Three Lines Model', 'SOCPA Standards', 'King IV', 'Board Governance'],
      image: '/portfolio_my/images/projects/holding-group-governance/governance-framework.svg',
      features: [
        'Corporate governance manual covering board charter, committee terms of reference, and delegation of authority matrix',
        'Board and committee structure design — Audit, Risk, and Nomination & Remuneration committees',
        'Three Lines of Defence model implemented across holding and all operating subsidiaries',
        'Whistleblower policy, code of conduct, and ethics framework with reporting mechanisms',
        'Governance gap analysis against Saudi Companies Law and international best practice frameworks',
        'Annual board effectiveness evaluation framework and governance reporting to ownership'
      ]
    },
    {
      id: 'icaew-audit-system',
      title: 'ICAEW Audit Report System',
      description: 'Professional audit reporting platform compliant with ICAEW standards, featuring automated report generation and evidence documentation.',
      category: 'Audit Transformation',
      impact: 'ICAEW-compliant audit reporting with full evidence management and automated workpaper generation',
      techStack: ['Python', 'ICAEW Standards', 'Report Automation'],
      image: '/portfolio_my/images/projects/icaew-audit/audit-report.webp',
      features: [
        'ICAEW-compliant audit report generation',
        'Testing methodology documentation',
        'Evidence management and documentation',
        'Automated audit workpaper preparation',
        'Professional report formatting and branding',
        'Quality review checklist integration'
      ]
    }
  ], []);

  // Handle hash-based routing for project details and all-projects gallery
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project/')) {
        const projectId = hash.replace('#project/', '');
        const project = allProjects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
          setShowAllProjects(false);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }
      } else if (hash === '#all-projects') {
        setShowAllProjects(true);
        setSelectedProject(null);
        setShowAllResources(false);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (hash === '#all-resources') {
        setShowAllResources(true);
        setShowAllProjects(false);
        setSelectedProject(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      } else {
        setSelectedProject(null);
        setShowAllProjects(false);
        setShowAllResources(false);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [allProjects]);

  return (
    <div className="relative min-h-screen flex">
      <Sidebar />
      <div className="flex-1 min-w-0 lg:mr-64">
      <motion.div className="fixed top-0 left-0 right-0 lg:right-64 h-1 bg-blue-500 origin-left z-[100]" style={{ scaleX }} />
      <Navbar />

      {/* All Resources Gallery */}
      {showAllResources && (
        <AllResourcesGallery
          documents={documents}
          onClose={() => {
            window.location.hash = '';
            setShowAllResources(false);
          }}
        />
      )}

      {/* All Projects Gallery */}
      {showAllProjects && !selectedProject && (
        <AllProjectsGallery
          projects={allProjects}
          onClose={() => {
            window.location.hash = '';
            setShowAllProjects(false);
          }}
        />
      )}

      {/* Project Detail View */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => {
            window.location.hash = '#all-projects';
            setSelectedProject(null);
            setShowAllProjects(true);
          }}
        />
      )}
      
      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center pt-20 overflow-hidden relative">
        <div className="mesh-bg" />
        <div className="grid-pattern" />
        
        <div className="container px-8 z-10 max-w-6xl mx-auto flex flex-col items-center">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <span className="inline-block px-6 py-2 mb-10 bg-blue-500/10 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-[0.4em]">
              Board Advisory | Principal Consultant
            </span>
            
            <h1 className="text-[clamp(3.5rem,10vw,7rem)] text-center leading-[0.95] mb-12 tracking-tight">
              <span className="text-white">Transitioning</span> <br />
              <span className="text-gradient">Audit to Profit.</span>
            </h1>
            
            <p className="text-lg md:text-xl mb-16 text-slate-400 font-medium text-center max-w-3xl leading-relaxed">
              Fractional CAE and board advisor specialising in ML-Powered Fraud Detection and 100% Population Testing to safeguard enterprise capital.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <a href="#projects" className="btn-primary">View Case Studies</a>
              <a href="/portfolio_my/cv/Majid_Mumtaz_CV.pdf" download="Majid_Mumtaz_CV.pdf" className="btn-secondary">Download Executive CV</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 bg-slate-900/50 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl">
          {/* Bio Section — Side-by-Side */}
          <div className="max-w-6xl mx-auto mb-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 lg:grid-cols-[200px_1fr] gap-16 items-start mb-20"
            >
              {/* Photo */}
              <div className="flex justify-center lg:justify-start lg:pt-2">
                <div className="relative w-48 h-48 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl ring-4 ring-blue-500/20 flex-shrink-0">
                  <img
                    src="/portfolio_my/images/majid-profile.jpg"
                    alt="Majid Mumtaz"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>

              {/* Bio Text */}
              <div>
                <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-4 block">About</span>
                <h2 className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-8 leading-tight">
                  Twenty Years. One Focus:<br />
                  <span className="text-gradient">Protecting Capital.</span>
                </h2>
                <p className="text-slate-400 text-lg leading-relaxed mb-6">
                  Twenty years inside the GCC's most complex audit environments — multi-brand F&B platforms spanning
                  7 countries, healthcare subsidiaries targeting Nomu listing, and KSA holding groups restructuring
                  for a new governance era. Where most audit teams were sampling, I was testing{' '}
                  <strong className="text-white">100% of the population</strong>. Where most fraud programmes were
                  reactive, I was building ML detection before the loss compounded.
                </p>
                <p className="text-slate-400 text-lg leading-relaxed mb-8">
                  The fraud programme that recovered <strong className="text-white">AED 3.2M</strong>. The COSO ERM
                  rollout across <strong className="text-white">7 jurisdictions</strong> with board-adopted risk appetite.
                  The DFM IPO governance programme that took a UAE platform from zero to UAE SCA-compliant. These aren't
                  case studies — they're the output of applying technology, rigour, and board-level thinking to audit
                  functions built to protect capital, not just report on it.
                </p>
                <p className="text-blue-400 text-base font-bold italic leading-relaxed mb-10">
                  Now available as a fractional CAE and board advisor for UAE and KSA organisations ready to make that same shift.
                </p>
                {/* Social Proof Strip */}
                <div className="flex flex-wrap gap-6">
                  <a
                    href="https://www.linkedin.com/in/majid-m-4b097118/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:border-blue-500/40 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-blue-400 font-black text-sm">15,000+</span>
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold group-hover:text-white transition-colors">LinkedIn Followers</span>
                  </a>
                  <a
                    href="https://www.linkedin.com/newsletters/7339153291630510080/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full hover:border-blue-500/40 hover:bg-white/10 transition-all group"
                  >
                    <span className="text-blue-400 font-black text-sm">3,500+</span>
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold group-hover:text-white transition-colors">Newsletter Subscribers</span>
                  </a>
                  <div className="flex items-center gap-3 px-5 py-2.5 bg-white/5 border border-white/10 rounded-full">
                    <span className="text-emerald-400 font-black text-sm">Weekly</span>
                    <span className="text-slate-400 text-xs uppercase tracking-wider font-bold">Risk, Compliance & Innovation</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Signature Capabilities */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              <div className="glass-card p-8 group hover:border-blue-500/30 transition-all">
                <div className="p-3 bg-blue-500/10 rounded-2xl w-fit mb-6 group-hover:bg-blue-500/20 transition-colors">
                  <BrainCircuit className="w-7 h-7 text-blue-400" />
                </div>
                <h4 className="text-white font-black text-base mb-3">Forensic & Fraud Analytics</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  ML anomaly detection, 100% population testing, and AED 3.2M+ fraud recovery across GCC multi-entity operations.
                </p>
              </div>
              <div className="glass-card p-8 group hover:border-amber-500/30 transition-all">
                <div className="p-3 bg-amber-500/10 rounded-2xl w-fit mb-6 group-hover:bg-amber-500/20 transition-colors">
                  <Landmark className="w-7 h-7 text-amber-400" />
                </div>
                <h4 className="text-white font-black text-base mb-3">IPO & Governance Readiness</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  UAE SCA/DFM and Tadawul CMA compliance, ICOFR build-out, board committee design, and investor reporting frameworks.
                </p>
              </div>
              <div className="glass-card p-8 group hover:border-rose-500/30 transition-all">
                <div className="p-3 bg-rose-500/10 rounded-2xl w-fit mb-6 group-hover:bg-rose-500/20 transition-colors">
                  <Scale className="w-7 h-7 text-rose-400" />
                </div>
                <h4 className="text-white font-black text-base mb-3">Enterprise Risk Management</h4>
                <p className="text-slate-400 text-sm leading-relaxed">
                  COSO ERM 2017 / ISO 31000 implementation, KRI dashboards, Three Lines of Defence, and board risk appetite design.
                </p>
              </div>
            </motion.div>

            {/* Credentials — No Emojis */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              <div className="glass-card p-8">
                <div className="w-8 h-1 bg-blue-500 rounded-full mb-5" />
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Certifications</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>CIA — Certified Internal Auditor</div>
                  <div>ACA, FCCA — Chartered Accountant</div>
                  <div>COSO ERM Certificate</div>
                </div>
              </div>
              <div className="glass-card p-8">
                <div className="w-8 h-1 bg-amber-500 rounded-full mb-5" />
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Executive Education</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>Harvard Business School Online</div>
                  <div>Disruptive Strategy</div>
                  <div>Risk Management (NYIF)</div>
                </div>
              </div>
              <div className="glass-card p-8">
                <div className="w-8 h-1 bg-emerald-500 rounded-full mb-5" />
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-4">Technical</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>Machine Learning (IBM)</div>
                  <div>Python / Pandas Analytics</div>
                  <div>Forensic Accounting (WVU)</div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Published Books */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mb-40"
          >
            <div className="text-center mb-16">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">Published Author</span>
              <h3 className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-4">6 Books on Amazon.</h3>
              <p className="text-slate-400 text-lg">Sharing knowledge across internal audit, risk management, and forensic accounting.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {[
                { emoji: '📘', title: 'Handbook of Risk Red Flags in Restaurants', desc: "A practitioner's guide to preventing failure through early detection of risk indicators in restaurant operations.", date: 'January 2026', url: 'https://www.amazon.com/dp/B0GDTBRZPM' },
                { emoji: '📗', title: 'The Un-Financial Risk Manager', desc: 'Protecting value in the real world — exploring emerging non-financial risks including ESG, cyber, and strategic risks.', date: 'January 2026', url: 'https://www.amazon.com/dp/B0GDMW53GG' },
                { emoji: '📙', title: '10 Forensic Accounting Skills', desc: 'Practical handbook on fraud detection techniques, forensic investigation methodologies, and evidence management for auditors.', date: 'December 2025', url: 'https://www.amazon.com/dp/B0G7T4X3RT' },
                { emoji: '📕', title: 'The Power Professional', desc: 'A tactical manual for dominance — strategic insights for career advancement and professional influence.', date: 'December 2025', url: 'https://www.amazon.com/dp/B0G51LS6D6' },
                { emoji: '📔', title: 'ITGC Program Guide', desc: 'A strategic approach to IT General Controls security, compliance, and enterprise value protection.', date: 'June 2025', url: 'https://www.amazon.com/dp/B0FCG96QS8' },
                { emoji: '📓', title: 'Internal Audit Guide for Dine-In Locations in the Middle East', desc: 'Comprehensive audit guide specifically designed for restaurant operations in the GCC region.', date: 'February 2025', url: 'https://www.amazon.com/dp/B0DY2NRPQ9' },
              ].map((book) => (
                <div key={book.title} className="glass-card p-8 flex flex-col group hover:border-blue-500/30 transition-all">
                  <div className="text-4xl mb-4">{book.emoji}</div>
                  <h4 className="text-white font-black text-base mb-3 leading-snug group-hover:text-blue-400 transition-colors">{book.title}</h4>
                  <p className="text-slate-400 text-sm leading-relaxed flex-1 mb-6">{book.desc}</p>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 text-xs">{book.date}</span>
                    <a href={book.url} target="_blank" rel="noopener noreferrer" className="text-[10px] font-black uppercase tracking-widest text-blue-400 hover:text-white transition-colors border border-blue-500/30 hover:border-white/30 px-3 py-1.5 rounded-full">Amazon →</a>
                  </div>
                </div>
              ))}
            </div>

            <div className="text-center">
              <a href="https://www.amazon.com/stores/Majid-Mumtaz/author/B0DY3F5QKR" target="_blank" rel="noopener noreferrer" className="btn-secondary inline-block">
                View All Books on Amazon Author Page →
              </a>
            </div>
          </motion.div>

          {/* Metrics Section */}
          <div className="text-center mb-32">
            <h3 className="text-[clamp(2rem,5vw,3.5rem)] text-white mb-6">Proven Capital Safeguard.</h3>
            <p className="text-slate-400 text-lg">Delivering 100% population testing across GCC multi-entity operations.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            <MetricCard index={0} value="AED 3.2M" label="Annual Recovery" icon="💰" isSuccess />
            <MetricCard index={1} value="$127M" label="M&A Deal Leadership" icon="🤝" />
            <MetricCard index={2} value="78%" label="Fraud Incidents Reduced" icon="📉" isSuccess />
            <MetricCard index={3} value="15K+" label="LinkedIn Followers" icon="💼" />
            <MetricCard index={4} value="100%" label="Population Testing" icon="🤖" isSuccess />
            <MetricCard index={5} value="3.5K+" label="Newsletter Subscribers" icon="📰" isSuccess />
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-40 bg-slate-900/50 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-20"
          >
            <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">LinkedIn Recommendations</span>
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white">What Colleagues Say.</h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
            {[
              {
                photo: '/portfolio_my/images/testimonials/sally.webp',
                quote: 'Majid was a trusted partner to Finance and the wider leadership team. His ability to assess risk, articulate issues clearly, and propose thoughtful, actionable solutions made him a highly respected voice. His recommendations were always grounded in a deep understanding of both risk and business impact.',
                name: 'Sally Swanepoel',
                title: 'Vice President of Finance',
                context: 'Senior to Majid · Head of Internal Audit, Kitopi',
              },
              {
                photo: '/portfolio_my/images/testimonials/lanie.webp',
                quote: 'He has the strongest skills of any internal auditor that I have had the privilege of working with. His methodology was based on fact integrity and risk alignment. He has made our organisation stronger and safer because of his diligence and powerful skill set.',
                name: 'Lanie Cardwell',
                title: 'President, Cardwell Hospitality Advisors',
                context: 'Managed Majid directly · ALFA-co',
              },
              {
                photo: '/portfolio_my/images/testimonials/alkadi.webp',
                quote: 'He demonstrates superior technical Internal Audit & Risk ability and produces work of exceptional quality. Majid always committed to producing work that meets high standards.',
                name: 'Abdulaziz AlKadi',
                title: 'CHRO · NRC Member · Board Member',
                context: 'Worked with Majid · Al Faisaliah Group',
              },
            ].map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                className="glass-card p-10 flex flex-col"
              >
                {/* Quote mark */}
                <div className="text-blue-500/30 text-7xl font-black leading-none mb-4 select-none">"</div>
                <p className="text-slate-300 text-base leading-relaxed flex-1 mb-10 italic">
                  {t.quote}
                </p>
                {/* Attribution */}
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <img
                    src={t.photo}
                    alt={t.name}
                    className="w-12 h-12 rounded-full object-cover flex-shrink-0 ring-2 ring-blue-500/20"
                  />
                  <div>
                    <div className="text-white font-black text-sm">{t.name}</div>
                    <div className="text-slate-400 text-xs leading-snug mt-0.5">{t.title}</div>
                    <div className="text-slate-600 text-[10px] uppercase tracking-wider mt-1">{t.context}</div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="flex justify-center mt-16">
            <a
              href="https://www.linkedin.com/in/majid-m-4b097118/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-secondary inline-flex items-center gap-3"
            >
              View All Recommendations on LinkedIn →
            </a>
          </div>
        </div>
      </section>

      {/* Case Studies */}
      <section id="projects" className="py-40">
        <div className="container px-8 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-32 gap-10">
            <div className="max-w-2xl">
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">Transformation Archive</span>
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-0">Production Solutions.</h2>
            </div>
            <p className="text-slate-400 text-lg max-w-md leading-relaxed text-right">
              Custom-built automated frameworks designed for GCC regulatory landscape.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-32">
            {featuredProjects.slice(0, 2).map((project, i) => (
              <ProjectCard key={project.title} index={i} {...project} />
            ))}
          </div>
          
          <div className="flex justify-center">
             <a href="#all-projects" className="group flex items-center gap-4 text-white font-black tracking-[0.4em] uppercase text-xs hover:text-blue-400 transition-all border-b border-white/20 pb-4">
               View All Projects
               <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>→</motion.span>
             </a>
          </div>
        </div>
      </section>

      {/* Resources Section */}
      <section id="resources" className="py-40 bg-slate-900/30 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block"
            >
              Free Resources
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-8"
            >
              Downloads & Publications
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed"
            >
              Audit frameworks, compliance guides, and thought leadership content shared on LinkedIn - available for free download.
            </motion.p>
          </div>

          {/* Featured Downloads */}
          {documents.length > 0 ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                {documents
                  .filter(doc => featuredDocIds.includes(doc.id))
                  .sort((a, b) => featuredDocIds.indexOf(a.id) - featuredDocIds.indexOf(b.id))
                  .map((doc) => (
                    <DownloadCard key={doc.id} {...doc} />
                  ))}
              </div>
              <div className="flex justify-center mb-20">
                <a href="#all-resources" className="group flex items-center gap-4 text-white font-black tracking-[0.4em] uppercase text-xs hover:text-blue-400 transition-all border-b border-white/20 pb-4">
                  View All Resources
                  <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>→</motion.span>
                </a>
              </div>
            </>
          ) : (
            <div className="text-center text-slate-500 mb-20">
              <p>Documents will be available soon. Check back later!</p>
            </div>
          )}

          {/* CV Featured Download */}
          <div className="text-center">
            <motion.a
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              href="/portfolio_my/cv/Majid_Mumtaz_CV.pdf"
              download="Majid_Mumtaz_CV.pdf"
              className="btn-primary inline-flex items-center gap-3"
            >
              <FileText size={20} />
              Download Full Executive CV
            </motion.a>
          </div>
        </div>
      </section>

      {/* Latest Thinking — Newsletter Section */}
      <section className="py-40 bg-slate-950/50 relative overflow-hidden border-t border-white/5">
        <div className="container px-8 mx-auto max-w-7xl">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-10">
            <div>
              <motion.span
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block"
              >
                Weekly Newsletter
              </motion.span>
              <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-[clamp(2.5rem,6vw,4.5rem)] text-white"
              >
                Risk, Compliance<br />&amp; Innovation.
              </motion.h2>
            </div>
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="flex flex-col items-end gap-3"
            >
              <p className="text-slate-400 text-lg max-w-sm text-right leading-relaxed">
                Expert insights on strategic risk, compliance, and digital innovation in audit — published every week.
              </p>
              <div className="flex gap-4 text-right">
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">15,000+ followers</span>
                <span className="text-slate-600">·</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">3,500+ subscribers</span>
              </div>
            </motion.div>
          </div>

          {/* Recent Articles */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            {newsletterArticles.map((article, i) => (
              <motion.a
                key={article.title}
                href="https://www.linkedin.com/newsletters/7339153291630510080/"
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="glass-card p-8 flex flex-col group hover:border-blue-500/30 transition-all cursor-pointer"
              >
                <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full border w-fit mb-6 ${article.tagColor}`}>
                  {article.tag}
                </span>
                <h4 className="text-white font-black text-base leading-snug mb-6 flex-1 group-hover:text-blue-400 transition-colors">
                  {article.title}
                </h4>
                <div className="flex justify-end items-center">
                  <span className="text-[10px] font-black uppercase tracking-widest text-blue-400 group-hover:text-white transition-colors">
                    Read →
                  </span>
                </div>
              </motion.a>
            ))}
          </div>

          <div className="flex justify-center">
            <a
              href="https://www.linkedin.com/newsletters/7339153291630510080/"
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary inline-flex items-center gap-3"
            >
              Subscribe on LinkedIn
            </a>
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section id="services" className="py-40 relative overflow-hidden bg-slate-900/30">
        <div className="mesh-bg opacity-20" />
        <div className="container px-8 mx-auto max-w-7xl">
          {/* Header */}
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block"
            >
              Advisory Services
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-8"
            >
              Fractional Leadership for UAE & KSA.
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed"
            >
              Board-level advisory and fractional executive services for organisations seeking to elevate internal audit,
              risk management, and corporate governance functions.
            </motion.p>
          </div>

          {/* Service Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 mb-20">
            {/* Fractional Internal Audit */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-10 hover:border-blue-500/30 transition-all group"
            >
              <div className="text-5xl mb-6">🔍</div>
              <h3 className="text-white text-2xl font-black mb-4">Fractional Internal Audit</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Part-time Chief Audit Executive (CAE) services delivering enterprise-grade audit functions without full-time overhead.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Risk-based audit planning & execution</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>100% population testing automation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Audit committee reporting & board advisory</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">✓</span>
                  <span>Team building & capability development</span>
                </li>
              </ul>
            </motion.div>

            {/* Risk Advisory */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="glass-card p-10 hover:border-emerald-500/30 transition-all group"
            >
              <div className="text-5xl mb-6">⚡</div>
              <h3 className="text-white text-2xl font-black mb-4">Risk Advisory</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                Enterprise risk management frameworks designed for GCC regulatory landscape and high-growth environments.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>COSO ERM framework implementation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Fraud prevention & detection programmes</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>M&A due diligence & capital protection</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-emerald-400 mt-1">✓</span>
                  <span>Cybersecurity & IT risk assessments</span>
                </li>
              </ul>
            </motion.div>

            {/* Corporate Governance */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="glass-card p-10 hover:border-purple-500/30 transition-all group"
            >
              <div className="text-5xl mb-6">🏛️</div>
              <h3 className="text-white text-2xl font-black mb-4">Corporate Governance</h3>
              <p className="text-slate-400 mb-6 leading-relaxed">
                ICOFR and governance frameworks for pre-IPO and pre-listing organisations targeting DFM, Tadawul, or Nomu.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>ICOFR / SOX 404 implementation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>IPO readiness assessments</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Board charter & committee design</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>Saudi CMA & UAE regulatory compliance</span>
                </li>
              </ul>
            </motion.div>
          </div>

          {/* Geographic Focus */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="glass-card p-12 text-center mb-16"
          >
            <h3 className="text-white text-2xl font-black mb-6">Geographic Focus</h3>
            <div className="flex flex-wrap justify-center gap-8 text-slate-300">
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇦🇪</span>
                <span className="font-bold">UAE (Dubai)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🇸🇦</span>
                <span className="font-bold">Saudi Arabia (KSA)</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-3xl">🌍</span>
                <span className="font-bold">GCC Multi-Entity Operations</span>
              </div>
            </div>
          </motion.div>

          {/* CTA */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 text-lg mb-8">Ready to elevate your audit and risk functions?</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="#contact" className="btn-primary">Schedule Advisory</a>
                <a href="mailto:majidrajpar@gmail.com" className="btn-secondary">Email Inquiry</a>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section id="contact" className="py-40 bg-slate-950/50 relative overflow-hidden border-t border-white/5">
        <div className="mesh-bg opacity-20" />
        <div className="container px-8 mx-auto max-w-7xl">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">

            {/* Left: Info */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">Get In Touch</span>
              <h2 className="text-[clamp(2.5rem,6vw,4rem)] text-white mb-8 leading-tight">Let's Work<br />Together.</h2>
              <p className="text-slate-400 text-lg leading-relaxed mb-12">
                Whether you need a fractional CAE, a fraud detection framework, or board-level risk advisory —
                get in touch and I'll respond within 24 hours.
              </p>
              <div className="space-y-5">
                <a href="mailto:majidrajpar@gmail.com" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
                    <span className="text-sm">✉</span>
                  </div>
                  <span className="font-bold">majidrajpar@gmail.com</span>
                </a>
                <a href="https://www.linkedin.com/in/majid-m-4b097118/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-blue-500/30 transition-colors">
                    <span className="text-sm">in</span>
                  </div>
                  <span className="font-bold">LinkedIn Profile</span>
                </a>
                <a href="https://wa.me/971507471708" target="_blank" rel="noopener noreferrer" className="flex items-center gap-4 text-slate-400 hover:text-white transition-colors group">
                  <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-emerald-500/30 transition-colors">
                    <span className="text-sm">WA</span>
                  </div>
                  <span className="font-bold">WhatsApp</span>
                </a>
              </div>
            </motion.div>

            {/* Right: Form */}
            <ContactForm />
          </div>
        </div>
      </section>

      <footer className="py-10 bg-slate-950 border-t border-white/5">
        <div className="container px-8 mx-auto text-center">
          <div className="text-slate-700 text-[9px] uppercase tracking-[0.5em] font-black">
            &copy; {new Date().getFullYear()} Majid Mumtaz CIA, ACA, FCCA. All Rights Reserved.
          </div>
        </div>
      </footer>
      </div>
    </div>
  );
};

export default App;
