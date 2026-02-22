import React, { useEffect } from 'react';
import { motion } from 'framer-motion';
import { X, ArrowLeft, FileCode } from 'lucide-react';

const ProjectDetail = ({ project, onClose }) => {
  // Handle ESC key to close
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  if (!project) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-white z-50 overflow-y-auto"
    >
      {/* Close Button */}
      <div className="fixed top-8 right-8 z-60">
        <button
          onClick={onClose}
          className="p-4 bg-slate-100 hover:bg-slate-200 rounded-full transition-all border border-slate-200"
        >
          <X className="w-6 h-6 text-slate-700" />
        </button>
      </div>

      <div className="container mx-auto px-8 py-20 max-w-6xl">
        {/* Back Button */}
        <motion.button
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          onClick={onClose}
          className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors mb-12"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm font-bold uppercase tracking-wider">Back to All Projects</span>
        </motion.button>

        {/* Project Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="mb-16"
        >
          <span className="inline-block px-4 py-2 bg-[#001F5B]/10 border border-[#001F5B]/20 text-[#001F5B] rounded text-xs font-black uppercase tracking-wider mb-6">
            {project.category}
          </span>

          <h1 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 leading-tight">
            {project.title}
          </h1>

          <p className="text-xl text-slate-600 leading-relaxed mb-8 max-w-4xl">
            {project.description}
          </p>

          {/* Impact Badge */}
          {project.impact && (
            <div className="inline-flex items-center gap-3 pl-5 border-l-4 border-[#001F5B] py-2">
              <span className="text-xs font-black text-[#001F5B] uppercase tracking-wider">Impact Delivered —</span>
              <span className="text-slate-900 font-bold">{project.impact}</span>
            </div>
          )}
        </motion.div>

        {/* Main Screenshot */}
        {project.image && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mb-16 rounded-xl overflow-hidden border border-slate-200"
          >
            <img
              src={project.image}
              alt={project.title}
              className="w-full h-auto"
            />
          </motion.div>
        )}

        {/* Tech Stack */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mb-16"
        >
          <h2 className="text-2xl font-black text-slate-900 mb-6">Technology Stack</h2>
          <div className="flex flex-wrap gap-3">
            {project.techStack?.map(tech => (
              <span
                key={tech}
                className="px-4 py-2 text-sm font-bold uppercase tracking-wider bg-slate-100 border border-slate-200 text-slate-600 rounded"
              >
                {tech}
              </span>
            ))}
          </div>
        </motion.div>

        {/* Key Features */}
        {project.features && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">Key Features</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {project.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-start gap-3 p-4 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  <span className="text-[#001F5B] mt-1 font-black">▸</span>
                  <span className="text-slate-700">{feature}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Additional Screenshots */}
        {project.additionalScreenshots && project.additionalScreenshots.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="mb-16"
          >
            <h2 className="text-2xl font-black text-slate-900 mb-6">Additional Screenshots</h2>
            <div className="grid md:grid-cols-2 gap-6">
              {project.additionalScreenshots.map((screenshot, idx) => (
                <div key={idx} className="rounded-xl overflow-hidden border border-slate-200">
                  <img
                    src={screenshot.image}
                    alt={screenshot.caption || `Screenshot ${idx + 1}`}
                    className="w-full h-auto"
                  />
                  {screenshot.caption && (
                    <div className="p-4 bg-slate-50 border-t border-slate-200">
                      <p className="text-sm text-slate-500">{screenshot.caption}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Disclaimer */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-slate-50 border border-slate-200 rounded-xl p-8 mb-16 border-l-4 border-l-[#001F5B]"
        >
          <h3 className="text-lg font-black text-slate-900 mb-3 flex items-center gap-2">
            <FileCode className="w-5 h-5 text-[#001F5B]" />
            Data Confidentiality Notice
          </h3>
          <p className="text-slate-600 leading-relaxed mb-4">
            All screenshots and diagrams in this project use <strong className="text-slate-900">fictitious dummy data</strong> created solely for portfolio demonstration. No real client data, company names, financial figures, or personal information is displayed anywhere on this site.
          </p>
          <p className="text-slate-600 leading-relaxed">
            The methodologies, frameworks, and technical implementations shown are genuine and representative of production-grade work delivered across real engagements.
          </p>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center"
        >
          <a
            href="/portfolio_my/#contact"
            className="btn-primary inline-flex items-center gap-2"
          >
            Contact Me
          </a>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default ProjectDetail;
