import React, { useState, useEffect, useMemo, useRef } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FileText } from 'lucide-react';
import Navbar from './components/Navbar';
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
              <textarea name="message" required rows={5} placeholder="How can I help?" className={`${inputClass} resize-none`} />
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
      title: 'Neural-Net Fraud Detection',
      description: 'Advanced machine learning architecture using Isolation Forest and K-Means clustering to analyze 2.3M+ monthly transactions.',
      category: 'Fraud Forensics',
      impact: '82% Reduction in Fraud Loss (SAR 5.1M to <900K)',
      techStack: ['Python', 'scikit-learn', 'Pandas', 'Excel Automation'],
      image: '/portfolio_my/images/projects/fraud-detection/fraud-dashboard.webp',
      features: [
        'ML anomaly detection with 87.3% accuracy using Isolation Forest',
        'Manager discount rate analysis with automated risk scoring',
        'Hourly transaction pattern heat mapping',
        'Location-based risk assessment across multiple regions',
        'Automated recovery identification (SAR 4.2M potential recovery)',
        'Real-time fraud probability scoring for each transaction'
      ]
    },
    {
      id: 'audit-findings-system',
      title: 'Audit Findings Management System',
      description: 'Enterprise-grade automation framework delivering 100% population testing across multi-entity GCC operations with automated findings tracking.',
      category: 'Audit Transformation',
      impact: '70% reduction in audit preparation cycle time',
      techStack: ['Python', 'YAML', 'IIA Compliance', 'openpyxl'],
      image: '/portfolio_my/images/projects/audit-tools/findings-tracker.webp',
      features: [
        'Color-coded severity tracking (Critical/High/Medium/Low)',
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
        'Budget vs. Actual variance tracking with color coding',
        'Automated financial reporting for board meetings',
        'Capital leak identification and recovery tracking',
        'Multi-period comparative analysis (12-month view)'
      ]
    }
  ];

  const allProjects = useMemo(() => [
    ...featuredProjects,
    {
      id: 'enterprise-audit-platform',
      title: 'Enterprise Audit Management Platform',
      description: 'Comprehensive audit management platform with executive dashboards, PowerPoint automation, and 3-tier governance reporting for multi-entity operations.',
      category: 'Audit Transformation',
      impact: '9 integrated worksheets with full automation',
      techStack: ['Python', 'openpyxl', 'python-pptx'],
      image: '/portfolio_my/images/projects/bateel-audit-tracker/audit-dashboard.webp',
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
      impact: 'Comprehensive risk assessment across all operations',
      techStack: ['Python', 'Risk Analytics', 'Compliance Frameworks'],
      image: '/portfolio_my/images/projects/food-safety-risk/risk-heatmap.webp',
      features: [
        'Risk heat mapping across 70+ restaurant locations',
        'Control validation and effectiveness testing',
        'Compliance tracking with regulatory requirements',
        'Mitigation roadmap generation with timelines',
        'Executive risk reporting for board visibility',
        'Location-specific risk scoring and prioritization'
      ]
    },
    {
      id: 'forensic-fraud-toolkit',
      title: 'Forensic Fraud Investigation Toolkit',
      description: 'Professional forensic analysis toolkit for major fraud cases with control failure mapping, evidence tracking, and litigation support documentation.',
      category: 'Fraud Forensics',
      impact: 'Documented control failures and recovery actions',
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
      description: 'Comprehensive audit compliance system for multi-location restaurant operations with standardized procedures, tracking, and remediation monitoring.',
      category: 'Audit Transformation',
      impact: 'Standardized audit procedures across locations',
      techStack: ['Python', 'openpyxl', 'Audit Standards'],
      image: '/portfolio_my/images/projects/restaurant-audit/audit-checklist.webp',
      features: [
        'Comprehensive audit checklists for F&B operations',
        'Compliance tracking across multiple locations',
        'Remediation monitoring with deadline tracking',
        'Action plan reporting for management review',
        'Standardized procedures across all sites',
        'Automated compliance scoring and ratings'
      ]
    },
    {
      id: 'icaew-audit-system',
      title: 'ICAEW Audit Report System',
      description: 'Professional audit reporting platform compliant with ICAEW standards, featuring automated report generation and evidence documentation.',
      category: 'Audit Transformation',
      impact: 'Professional-grade audit documentation',
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
    <div className="relative min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[100]" style={{ scaleX }} />
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
              Chief Audit Executive specializing in Neural-Net Fraud Detection and 100% Population Testing to safeguard enterprise capital.
            </p>

            <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
              <a href="#projects" className="btn-primary">Analyze Case Studies</a>
              <a href="/portfolio_my/cv/Majid_Mumtaz_CV.pdf" download="Majid_Mumtaz_CV.pdf" className="btn-secondary">Download Executive CV</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* About Section */}
      <section id="about" className="py-40 bg-slate-900/50 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl">
          {/* Bio Section */}
          <div className="max-w-5xl mx-auto mb-40">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-20"
            >
              <div className="flex justify-center mb-10">
                <div className="relative w-36 h-36 rounded-full overflow-hidden border-2 border-white/10 shadow-2xl ring-4 ring-blue-500/20">
                  <img
                    src="/portfolio_my/images/majid-profile.jpg"
                    alt="Majid Mumtaz"
                    className="w-full h-full object-cover object-top"
                  />
                </div>
              </div>
              <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">About</span>
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-8">Board-Facing Internal Audit Director.</h2>
              <p className="text-slate-400 text-xl leading-relaxed max-w-4xl mx-auto">
                <strong className="text-white">20+ years</strong> of progressive leadership experience protecting enterprise value across the GCC.
                Recognized industry thought leader and <strong className="text-white">published author</strong> specializing in ITGC, SOX 404 compliance,
                and AI-driven fraud detection.
              </p>
            </motion.div>

            {/* Core Competencies */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="glass-card p-12 mb-16"
            >
              <h3 className="text-white text-2xl font-black mb-8 text-center">Core Competencies</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-slate-300">
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>Corporate Governance & SOX 404 / ICFR</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>Enterprise Risk Management (COSO ERM)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>M&A Due Diligence & Capital Protection</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>Fraud Prevention & Forensic Analytics</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>Data-Driven Audit Automation (Python/ML)</span>
                </div>
                <div className="flex items-start gap-3">
                  <span className="text-blue-400 mt-1">▸</span>
                  <span>Big 4 Co-sourcing & IPO Readiness</span>
                </div>
              </div>
            </motion.div>

            {/* Credentials */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16"
            >
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">🎓</div>
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-3">Professional</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>CIA (Certified Internal Auditor)</div>
                  <div>ACA, FCCA (Chartered Accountant)</div>
                  <div>COSO ERM Certificate</div>
                </div>
              </div>
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">🏛️</div>
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-3">Executive</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>Harvard Business School Online</div>
                  <div>Disruptive Strategy</div>
                  <div>Risk Management (NYIF)</div>
                </div>
              </div>
              <div className="glass-card p-8 text-center">
                <div className="text-4xl mb-4">🤖</div>
                <h4 className="text-white font-black text-sm uppercase tracking-wider mb-3">Technical</h4>
                <div className="text-slate-400 text-sm space-y-2">
                  <div>Machine Learning (IBM)</div>
                  <div>Python/Pandas Analytics</div>
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
            <MetricCard index={2} value="82%" label="Fraud Reduction" icon="📉" isSuccess />
            <MetricCard index={3} value="97%" label="SOX Compliance" icon="🚀" />
            <MetricCard index={4} value="100%" label="Population Check" icon="🤖" isSuccess />
            <MetricCard index={5} value="6" label="Amazon Books" icon="📚" />
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
              Board-level advisory and fractional executive services for organizations seeking to elevate internal audit,
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
                  <span>Fraud prevention & detection programs</span>
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
                SOX 404 compliance and governance frameworks for pre-IPO organizations and family offices.
              </p>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="flex items-start gap-3">
                  <span className="text-purple-400 mt-1">✓</span>
                  <span>SOX 404 / ICFR implementation</span>
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
                <span className="font-bold">UAE (Dubai, Golden Visa)</span>
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
            &copy; {new Date().getFullYear()} Profit Protection Strategy. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
