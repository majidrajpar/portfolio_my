import React from 'react';
import { motion, useScroll, useSpring } from 'framer-motion';
import Navbar from './components/Navbar';
import MetricCard from './components/MetricCard';
import ProjectCard from './components/ProjectCard';

const App = () => {
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  const featuredProjects = [
    {
      title: 'Neural-Net Fraud Detection',
      description: 'Advanced machine learning architecture using Isolation Forest and K-Means clustering to analyze 2.3M+ monthly transactions.',
      category: 'Fraud Forensics',
      impact: '82% Reduction in Fraud Loss (SAR 5.1M to <900K)',
      techStack: ['Python', 'scikit-learn', 'Neural Networks']
    },
    {
      title: 'Audit Automation Ecosystem',
      description: 'Enterprise-grade automation framework delivering 100% population testing across multi-entity GCC operations.',
      category: 'Audit Transformation',
      impact: '70% reduction in audit preparation cycle time',
      techStack: ['Python', 'YAML', 'IIA Compliance']
    },
    {
      title: 'Executive Analytics Hub',
      description: 'Proprietary financial reporting engine providing real-time board-level visibility into capital leaks and recovery.',
      category: 'Strategic Dashboards',
      impact: '85% automated reporting efficiency achieved',
      techStack: ['xlsxwriter', 'Pandas', 'Power BI']
    }
  ];

  return (
    <div className="relative min-h-screen">
      <motion.div className="fixed top-0 left-0 right-0 h-1 bg-blue-500 origin-left z-[100]" style={{ scaleX }} />
      <Navbar />
      
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
              <a href="#" className="btn-secondary">Download Executive CV</a>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Metrics Section */}
      <section className="py-40 bg-slate-900/50 relative overflow-hidden">
        <div className="container px-8 mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            className="text-center mb-32"
          >
            <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-6">Proven Capital Safeguard.</h2>
            <p className="text-slate-400 text-lg">Delivering 100% population testing across GCC multi-entity operations.</p>
          </motion.div>

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
             <a href="#" className="group flex items-center gap-4 text-white font-black tracking-[0.4em] uppercase text-xs hover:text-blue-400 transition-all border-b border-white/20 pb-4">
               Browse Strategic Vault
               <motion.span animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 2 }}>→</motion.span>
             </a>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-60 relative overflow-hidden">
        <div className="mesh-bg opacity-30" />
        <div className="container px-8 mx-auto max-w-5xl">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="glass-card p-24 relative overflow-hidden text-center group"
          >
            <div className="absolute inset-0 bg-blue-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
            <div className="relative z-10">
              <h2 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-12">Ready to Transform?</h2>
              <p className="mb-20 text-slate-300 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
                Strategic board-level leadership for organizations seeking to build high-performance audit functions.
              </p>
              <div className="flex flex-col sm:flex-row gap-8 justify-center items-center">
                <a href="#" className="btn-primary">Schedule Advisory</a>
                <a href="#" className="btn-secondary">Inquire</a>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <footer className="py-20 bg-slate-950/50 border-t border-white/5">
        <div className="container px-8 mx-auto text-center">
          <span className="text-4xl font-black tracking-tighter text-white mb-6 block">MAJID MUMTAZ</span>
          <p className="text-slate-500 font-bold uppercase tracking-[0.4em] text-[10px] mb-16">Chief Audit Executive | Head of Audit & Risk</p>
          
          <div className="flex flex-wrap justify-center gap-16 mb-20">
            <a href="mailto:majidrajpar@gmail.com" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">Email</a>
            <a href="https://www.linkedin.com/in/majid-m-4b097118/" target="_blank" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">LinkedIn</a>
            <a href="https://veritux.com/consultants/majid-mumtaz/" target="_blank" className="text-slate-400 hover:text-white transition-colors text-sm uppercase tracking-widest font-black">Veritux</a>
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
