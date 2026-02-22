import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, X } from 'lucide-react';
import ProjectCard from './ProjectCard';

const AllProjectsGallery = ({ projects, onClose }) => {
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-slate-950/95 z-50 overflow-y-auto"
    >
      {/* Close Button */}
      <div className="fixed top-8 right-8 z-60">
        <button
          onClick={onClose}
          className="p-4 bg-slate-800/50 hover:bg-slate-800 rounded-full transition-all border border-white/10"
        >
          <X className="w-6 h-6 text-white" />
        </button>
      </div>

      <div className="container mx-auto px-8 py-20 max-w-7xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onClose}
          className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-16"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to Portfolio</span>
        </motion.button>

        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-20"
        >
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-blue-500 mb-6 block">
            Complete Portfolio
          </span>
          <h1 className="text-[clamp(2.5rem,6vw,4.5rem)] text-white mb-6">
            All Projects & Solutions
          </h1>
          <p className="text-slate-400 text-xl max-w-3xl leading-relaxed">
            Enterprise-grade audit, risk, and compliance solutions built for GCC operations.
            From fraud detection to governance frameworks.
          </p>
        </motion.div>

        {/* Projects Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 mb-20">
          {projects.map((project, i) => (
            <ProjectCard key={project.id} index={i} {...project} />
          ))}
        </div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center pt-8 border-t border-white/10"
        >
          <p className="text-slate-400 text-lg mb-8">
            Interested in building similar solutions for your organisation?
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a href="#services" onClick={onClose} className="btn-primary">Explore Services</a>
            <a href="#resources" onClick={onClose} className="btn-secondary">Download Resources</a>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default AllProjectsGallery;
