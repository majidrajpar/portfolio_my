import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const MetricCard = ({ value, label, icon, isSuccess, index }) => {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <motion.div 
      ref={ref}
      initial={{ opacity: 0, scale: 0.9, y: 30 }}
      animate={isInView ? { opacity: 1, scale: 1, y: 0 } : {}}
      transition={{ 
        delay: index * 0.1, 
        duration: 0.8, 
        ease: [0.16, 1, 0.3, 1] 
      }}
      className="glass-card flex flex-col items-center p-12 text-center group overflow-hidden relative"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-1000" />
      
      {icon && (
        <div className="text-4xl mb-6 group-hover:scale-110 group-hover:-translate-y-2 transition-transform duration-700 ease-[0.16, 1, 0.3, 1]">
          {icon}
        </div>
      )}
      
      <div className={`
        text-5xl font-black mb-4 leading-none tracking-tighter
        ${isSuccess ? 'bg-gradient-to-b from-white to-emerald-400' : 'bg-gradient-to-b from-white to-blue-500'}
        bg-clip-text text-transparent
      `}>
        {value}
      </div>
      
      <div className="text-slate-400 font-bold uppercase tracking-[0.25em] text-[10px]">
        {label}
      </div>
    </motion.div>
  );
};

export default MetricCard;
