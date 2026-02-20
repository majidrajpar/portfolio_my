import React, { useState, useEffect } from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import { FileText } from 'lucide-react';
import Navbar from './components/Navbar';
import MetricCard from './components/MetricCard';
import ProjectCard from './components/ProjectCard';
import DownloadCard from './components/DownloadCard';
import ProjectDetail from './components/ProjectDetail';

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

  // Load documents from JSON
  useEffect(() => {
    fetch('/portfolio_my/downloads/documents.json')
      .then(res => res.json())
      .then(data => setDocuments(data))
      .catch(err => console.error('Failed to load documents:', err));
  }, []);

  // Handle hash-based routing for project details
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#project/')) {
        const projectId = hash.replace('#project/', '');
        const project = allProjects.find(p => p.id === projectId);
        if (project) {
          setSelectedProject(project);
        }
      } else {
        setSelectedProject(null);
      }
    };

    handleHashChange();
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

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

  const allProjects = [
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
  ];

  return (
    <div className="relative min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[100]" style={{ scaleX }} />
      <Navbar />

      {/* Project Detail View */}
      {selectedProject && (
        <ProjectDetail
          project={selectedProject}
          onClose={() => {
            window.location.hash = '';
            setSelectedProject(null);
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-32">
            {featuredProjects.map((project, i) => (
              <ProjectCard key={project.title} index={i} {...project} />
            ))}
          </div>
          
          <div className="flex justify-center">
             <a href="#projects-gallery" className="group flex items-center gap-4 text-white font-black tracking-[0.4em] uppercase text-xs hover:text-blue-400 transition-all border-b border-white/20 pb-4">
               View All Projects
               <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>→</motion.span>
             </a>
          </div>
        </div>
      </section>

      {/* Full Projects Gallery */}
      <section id="projects-gallery" className="py-40 bg-slate-900/30 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-7xl">
          {/* Section Header */}
          <div className="text-center mb-24">
            <motion.span
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block"
            >
              Complete Portfolio
            </motion.span>
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-8"
            >
              All Projects & Solutions
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              className="text-slate-400 text-xl max-w-3xl mx-auto leading-relaxed"
            >
              Enterprise-grade audit, risk, and compliance solutions built for GCC operations.
              From fraud detection to governance frameworks.
            </motion.p>
          </div>

          {/* All Projects Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
            {allProjects.map((project, i) => (
              <ProjectCard key={project.title} index={i} {...project} />
            ))}
          </div>

          {/* CTA */}
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <p className="text-slate-400 text-lg mb-8">Interested in building similar solutions for your organization?</p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a href="#services" className="btn-primary">Explore Services</a>
                <a href="#resources" className="btn-secondary">Download Resources</a>
              </div>
            </motion.div>
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

          {/* Downloads Grid */}
          {documents.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
              {documents.map((doc, index) => (
                <DownloadCard key={doc.id} {...doc} />
              ))}
            </div>
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

      <footer id="contact" className="py-20 bg-slate-950/50 border-t border-white/5">
        <div className="container px-8 mx-auto text-center">
          <span className="text-4xl font-black tracking-tighter text-white mb-6 block">MAJID MUMTAZ</span>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-16">Chief Audit Executive | Head of Audit & Risk</p>
          
          <div className="flex flex-wrap justify-center gap-16 mb-20">
            <a href="mailto:majidrajpar@gmail.com" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">Email</a>
            <a href="https://www.linkedin.com/in/majid-m-4b097118/" target="_blank" rel="noopener noreferrer" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">LinkedIn</a>
            <a href="tel:+971507471708" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">+971 507 471 708</a>
          </div>

          <div className="text-slate-700 text-[9px] uppercase tracking-[0.5em] font-black">
            &copy; {new Date().getFullYear()} Profit Protection Strategy. All Rights Reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default App;
