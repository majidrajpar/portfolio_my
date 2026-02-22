import React from 'react';
import { motion, useInView } from 'framer-motion';
import { useRef } from 'react';

const MetricCard = ({ value, label, index }) => {
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
      className="bg-white border border-slate-200 border-t-2 border-t-[#001F5B] rounded-xl p-12 flex flex-col items-center text-center shadow-sm"
    >
      <div className="text-5xl font-black mb-4 leading-none tracking-tighter text-[#001F5B]">
        {value}
      </div>

      <div className="text-slate-500 font-bold uppercase tracking-[0.25em] text-[10px]">
        {label}
      </div>
    </motion.div>
  );
};

export default MetricCard;
