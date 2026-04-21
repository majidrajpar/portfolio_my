import React, { useEffect, useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
  ReferenceLine,
  LabelList
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

export default function CareerTimeline({ careerData }) {
  const [activeIndex, setActiveIndex] = useState(null);
  const [isChartReady, setIsChartReady] = useState(false);

  useEffect(() => {
    const timer = window.requestAnimationFrame(() => setIsChartReady(true));
    return () => {
      window.cancelAnimationFrame(timer);
      setIsChartReady(false);
    };
  }, []);

  if (!careerData || careerData.length === 0) return null;

  const acPoints = careerData.filter(d => d.isSpecial);
  const milestonePoints = careerData.filter(d => !d.isSpecial);

  const CustomTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const isAC = data.isSpecial;
      
      return (
        <motion.div 
          initial={{ opacity: 0, y: 10, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          className="bg-[#001F5B]/95 border border-[#C9A84C] p-5 shadow-[0_0_30px_rgba(201,168,76,0.25)] backdrop-blur-xl min-w-[220px]"
        >
          <div className="flex justify-between items-start mb-3 border-b border-[#C9A84C]/20 pb-2">
            <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em]">{data.dates}</p>
            {data.isCurrent && (
              <span className="bg-[#C9A84C] text-[#001F5B] text-[8px] font-black px-1.5 py-0.5 rounded-sm animate-pulse">CURRENT</span>
            )}
            {isAC && (
              <span className="bg-white/10 text-white text-[8px] font-black px-1.5 py-0.5 rounded-sm border border-[#C9A84C]/50">BOARD ADVISORY</span>
            )}
          </div>
          <p className={`text-white font-black text-sm leading-tight mb-1 ${isAC ? 'text-[#C9A84C]' : ''}`}>{data.role}</p>
          <p className="text-[#8895AA] text-[10px] font-bold uppercase tracking-tight">{data.company.replace('\n', ' ')}</p>
        </motion.div>
      );
    }
    return null;
  };

  const CustomizedLabel = (props) => {
    const { x, y, value, index } = props;
    const data = careerData[index];
    
    if (!data || data.isSpecial) return null;

    const textAnchor = data.align || "middle";
    const dx = data.dx || 0;
    const dy = data.dy || -25;

    return (
      <g>
        <text 
          x={x + dx} 
          y={y + dy} 
          fill={data.isCurrent ? "#C9A84C" : "white"} 
          textAnchor={textAnchor} 
          fontSize={9} 
          fontWeight={data.isCurrent ? 900 : 800}
          className="pointer-events-none select-none uppercase tracking-tighter"
        >
          {value.split('\n')[0]}
        </text>
      </g>
    );
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="w-full h-[600px] bg-[#00081D] border border-slate-800 shadow-2xl overflow-hidden relative group"
    >
      {/* Dynamic Grid Background */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" 
             style={{ backgroundImage: 'radial-gradient(#C9A84C 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-tr from-[#00081D] via-transparent to-[#C9A84C]/5"></div>
      </div>

      {/* Strategic Content */}
      <div className="absolute top-12 left-12 z-20 pointer-events-none">
        <motion.div
          initial={{ x: -30, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        >
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-[2px] bg-[#C9A84C]"></div>
            <span className="text-[#C9A84C] text-[10px] font-black uppercase tracking-[0.5em]">Executive Experience</span>
          </div>
          <h3 className="text-white font-black text-4xl tracking-tighter leading-none mb-4">
            STRATEGIC CAREER <span className="text-[#C9A84C]">ARCHITECTURE.</span>
          </h3>
          <p className="text-[#8895AA] text-[11px] font-bold uppercase tracking-[0.3em] max-w-md leading-relaxed opacity-60">
            A 20-Year Upward Trajectory from Big 4 Roots to Board Advisory
          </p>
        </motion.div>
      </div>

      {/* Current Focus Badge */}
      <div className="absolute top-12 right-12 z-20 pointer-events-none">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          whileInView={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.5 }}
          className="flex flex-col items-end"
        >
          <div className="bg-[#C9A84C]/10 border border-[#C9A84C]/30 px-4 py-2 backdrop-blur-md">
            <span className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em]">Audit 4.0 & AI Governance</span>
          </div>
          <div className="mt-2 text-[#5A6A80] text-[8px] font-black uppercase tracking-widest">Digital Transformation Lead</div>
        </motion.div>
      </div>

      {isChartReady && (
      <ResponsiveContainer width="100%" height={600} debounce={120}>
        <AreaChart
          data={careerData}
          margin={{ top: 180, right: 100, left: 100, bottom: 120 }}
          onMouseMove={(e) => {
            if (e.activeTooltipIndex !== undefined) setActiveIndex(e.activeTooltipIndex);
          }}
          onMouseLeave={() => setActiveIndex(null)}
        >
          <defs>
            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.6}/>
              <stop offset="50%" stopColor="#C9A84C" stopOpacity={0.2}/>
              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="4" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[2004, 2026]} 
            ticks={[2005, 2008, 2011, 2014, 2017, 2020, 2023, 2026]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#5A6A80', fontSize: 12, fontWeight: 900, letterSpacing: '0.15em' }}
            dy={60}
          />
          
          <YAxis hide domain={[0, 110]} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#C9A84C', strokeWidth: 1, strokeDasharray: '8 4' }}
          />
          
          <Area
            type="monotone"
            dataKey="y"
            stroke="#C9A84C"
            strokeWidth={5}
            fillOpacity={1}
            fill="url(#colorY)"
            filter="url(#glow)"
            animationDuration={3500}
            animationBegin={300}
          >
            <LabelList dataKey="role" content={<CustomizedLabel />} />
          </Area>

          {/* Special Audit Committee Elements */}
          {acPoints.map((point, idx) => (
            <React.Fragment key={`ac-${idx}`}>
              <ReferenceLine
                segment={[
                  { x: point.x, y: point.curveY ?? point.y - 23 },
                  { x: point.x, y: point.y - 2 }
                ]}
                stroke="#C9A84C"
                strokeWidth={1.5}
                strokeDasharray="4 4"
                strokeOpacity={0.7}
              />
              <ReferenceDot
                x={point.x}
                y={point.y + 12}
                r={0}
                label={{
                  position: 'top',
                  value: "AUDIT COMMITTEE",
                  fill: "#C9A84C",
                  fontSize: 9,
                  fontWeight: 900,
                }}
              />
              {/* Diamond Shape for AC */}
              <ReferenceDot
                x={point.x}
                y={point.y}
                r={8}
                fill="#C9A84C"
                stroke="#FFFFFF"
                strokeWidth={2}
                shape={(props) => {
                  const { cx, cy } = props;
                  return (
                    <path 
                      d={`M ${cx} ${cy-8} L ${cx+8} ${cy} L ${cx} ${cy+8} L ${cx-8} ${cy} Z`} 
                      fill="#C9A84C" 
                      stroke="#FFFFFF" 
                      strokeWidth="2"
                    />
                  );
                }}
              />
            </React.Fragment>
          ))}

          {/* Career Milestone Dots */}
          {milestonePoints.map((point, index) => (
            <ReferenceDot
              key={index}
              x={point.x}
              y={point.y}
              r={activeIndex === index || (point.isCurrent && activeIndex === null) ? 8 : 6}
              fill={(activeIndex === index || point.isCurrent) ? "#FFFFFF" : "#C9A84C"}
              stroke={(activeIndex === index || point.isCurrent) ? "#C9A84C" : "#FFFFFF"}
              strokeWidth={(activeIndex === index || point.isCurrent) ? 3 : 2}
              isFront={true}
              className="transition-all duration-300 cursor-pointer"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      )}
      
      {/* Horizontal Label Strip */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-between px-[100px] pointer-events-none">
        {milestonePoints.map((point, index) => {
          const isFocussed = activeIndex !== null ? (careerData[activeIndex]?.x === point.x) : point.isCurrent;
          return (
            <div key={index} className="flex flex-col items-center w-0 overflow-visible transition-all duration-700"
                 style={{ opacity: activeIndex === null || isFocussed ? 1 : 0.25 }}>
              <motion.div 
                initial={{ y: 20, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.05 * index }}
                className="flex flex-col items-center"
              >
                <span className={`text-white text-[10px] font-black uppercase tracking-widest text-center whitespace-pre-wrap leading-tight mb-3 min-h-[30px] transition-colors ${isFocussed ? 'text-[#C9A84C]' : ''}`}>
                  {point.company}
                </span>
                <div className={`w-1.5 h-1.5 rounded-full mb-3 transition-all duration-500 ${isFocussed ? 'bg-[#C9A84C] scale-[2] shadow-[0_0_10px_#C9A84C]' : 'bg-white/20'}`}></div>
                <span className="text-[#5A6A80] text-[9px] font-black tracking-[0.2em]">
                  {point.dates.split('–')[0]}
                </span>
              </motion.div>
            </div>
          );
        })}
      </div>

      {/* Status Bar */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-[#C9A84C]/20">
        <motion.div 
          className="h-full bg-[#C9A84C]"
          initial={{ width: "0%" }}
          whileInView={{ width: "100%" }}
          transition={{ duration: 4, ease: "easeInOut" }}
        />
      </div>
    </motion.div>
  );
}
