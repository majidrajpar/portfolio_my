import React from 'react';
import { motion } from 'framer-motion';
import { ArrowUpRight, ShieldCheck, Database, BrainCircuit, BarChart3, Binary, Landmark, Scale } from 'lucide-react';

const icons = {
  'Fraud Forensics': <BrainCircuit className="w-8 h-8 text-blue-500" />,
  'Audit Transformation': <ShieldCheck className="w-8 h-8 text-emerald-500" />,
  'Strategic Dashboards': <BarChart3 className="w-8 h-8 text-purple-500" />,
  'Data Intelligence': <Binary className="w-8 h-8 text-blue-400" />,
  'Corporate Governance': <Landmark className="w-8 h-8 text-amber-400" />,
  'Enterprise Risk': <Scale className="w-8 h-8 text-rose-400" />,
};

const ProjectCard = ({ id, title, description, category, impact, techStack, image, index }) => {
  return (
    <motion.article
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.1, duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
      className="glass-card p-0 flex flex-col h-full group cursor-default relative overflow-hidden"
    >
      {/* Project Screenshot */}
      {image && (
        <div className="relative h-48 overflow-hidden">
          <img
            src={image}
            alt={title}
            className="w-full h-full object-cover object-top group-hover:scale-105 transition-transform duration-700"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/90" />
        </div>
      )}

      <div className="p-10 flex flex-col flex-1">
        <div className="mb-8 flex justify-between items-start">
          <div className="p-4 bg-white/5 rounded-2xl group-hover:scale-110 group-hover:bg-white/10 transition-all duration-700">
            {icons[category] || <Database className="w-8 h-8 text-slate-400" />}
          </div>
          <span className="text-[10px] font-black uppercase tracking-[0.3em] bg-blue-500/10 text-blue-400 px-4 py-1.5 rounded-full border border-blue-500/20">
            {category}
          </span>
        </div>

      <h3 className="text-2xl font-black text-white mb-4 leading-tight group-hover:text-blue-400 transition-colors">
        {title}
      </h3>

      <p className="text-slate-400 text-base mb-10 flex-1 leading-relaxed line-clamp-3">
        {description}
      </p>

      {impact && (
        <div className="mb-8 p-6 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl group-hover:bg-emerald-500/10 transition-colors">
          <div className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-2">Impact Delivered</div>
          <div className="text-white font-bold leading-snug">{impact}</div>
        </div>
      )}

      <div className="flex flex-wrap gap-2 mb-10">
        {techStack.map(tech => (
          <span key={tech} className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider bg-white/5 border border-white/10 text-slate-400 rounded">
            {tech}
          </span>
        ))}
      </div>

        <a
          href={`#project/${id}`}
          className="inline-flex items-center text-white font-black text-[10px] uppercase tracking-[0.2em] hover:text-blue-400 transition-colors"
        >
          View Project Details
          <ArrowUpRight className="w-4 h-4 ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
        </a>
      </div>
    </motion.article>
  );
};

export default ProjectCard;
