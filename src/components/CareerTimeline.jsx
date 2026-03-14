import React, { useState } from 'react';
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

const careerData = [
  { x: 2005, y: 14, company: "EY", role: "Audit Manager", dates: "2004–2009", align: "middle" },
  { x: 2010, y: 27, company: "BMA ASSET\nMANAGEMENT", role: "AVP, Internal Audit", dates: "2010–2011", align: "end", dx: -10, dy: -45 },
  { x: 2011, y: 38, company: "KPMG\n(QATAR)", role: "Internal Audit Manager", dates: "2011–2013", align: "start", dx: 10, dy: -25 },
  { x: 2014, y: 50, company: "McDONALD'S\nKSA", role: "Manager, Internal Audit", dates: "2014–2016", align: "middle" },
  { x: 2017, y: 61, company: "AL-FAISALIAH\nGROUP", role: "Group Director, IA & Risk", dates: "2016–2022", align: "middle" },
  { x: 2022, y: 75, company: "KITOPI", role: "Director of Internal Audit", dates: "2022–2025", align: "middle" },
  { x: 2025, y: 87, company: "VERITUX", role: "Internal Audit Director", dates: "2025–Present", align: "middle" }
];

const acPoint = { x: 2021, y: 72.2, role: "Audit Committee Member", company: "AFG Restaurants Sector" };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#001F5B] border border-[#C9A84C] p-4 shadow-[0_0_20px_rgba(201,168,76,0.2)] backdrop-blur-xl">
        <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em] mb-2 border-b border-[#C9A84C]/20 pb-1">{data.dates}</p>
        <p className="text-white font-bold text-sm mb-0.5 leading-tight">{data.role}</p>
        <p className="text-[#8895AA] text-[10px] font-bold uppercase tracking-tighter mt-1">{data.company.replace('\n', ' ')}</p>
      </div>
    );
  }
  return null;
};

const CustomizedLabel = (props) => {
  const { x, y, value, index } = props;
  const data = careerData[index];
  
  const textAnchor = data.align || "middle";
  const dx = data.dx || 0;
  const dy = data.dy || -25;

  return (
    <g>
      <text 
        x={x + dx} 
        y={y + dy} 
        fill="white" 
        textAnchor={textAnchor} 
        fontSize={9} 
        fontWeight={800}
        className="pointer-events-none select-none uppercase tracking-tighter"
      >
        {value.split('\n')[0]}
      </text>
    </g>
  );
};

export default function CareerTimeline() {
  const [activeIndex, setActiveIndex] = useState(null);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      className="w-full h-[600px] bg-[#000F2E] border border-slate-800 shadow-2xl overflow-hidden relative"
    >
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        <div className="absolute inset-0" 
             style={{ backgroundImage: 'radial-gradient(#C9A84C 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}>
        </div>
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#000F2E]"></div>
      </div>

      {/* Header Info */}
      <div className="absolute top-12 left-12 z-20 pointer-events-none">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <h3 className="text-white font-black text-4xl tracking-tighter leading-none mb-4">
            STRATEGIC CAREER <span className="text-[#C9A84C]">ARCHITECTURE.</span>
          </h3>
          <div className="flex items-center gap-4">
            <div className="h-[1px] w-12 bg-[#C9A84C]"></div>
            <p className="text-[#8895AA] text-[11px] font-bold uppercase tracking-[0.4em] opacity-80">
              Two Decades of Leadership & Value Protection
            </p>
          </div>
        </motion.div>
      </div>

      {/* Strategic Badge */}
      <div className="absolute top-12 right-12 z-20 pointer-events-none">
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          whileInView={{ x: 0, opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.4 }}
          className="bg-[#C9A84C] p-[1px]"
        >
          <div className="bg-[#000F2E] px-4 py-2 text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.25em]">
            Audit 4.0 & Strategic Advisory
          </div>
        </motion.div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
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
              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.5}/>
              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
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
            cursor={{ stroke: '#C9A84C', strokeWidth: 1, strokeDasharray: '6 6' }}
          />
          
          <Area
            type="monotone"
            dataKey="y"
            stroke="#C9A84C"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorY)"
            filter="url(#glow)"
            animationDuration={3000}
            animationBegin={500}
          >
            <LabelList dataKey="role" content={<CustomizedLabel />} />
          </Area>

          {/* Audit Committee Point */}
          <ReferenceLine
            x={acPoint.x}
            y1={acPoint.y}
            y2={acPoint.y + 35}
            stroke="#C9A84C"
            strokeWidth={2}
            strokeDasharray="4 4"
          />
          <ReferenceDot
            x={acPoint.x}
            y={acPoint.y}
            r={7}
            fill="#C9A84C"
            stroke="#FFFFFF"
            strokeWidth={2}
            isFront={true}
          />
          
          <ReferenceDot
            x={acPoint.x}
            y={acPoint.y + 40}
            r={0}
            label={{
              position: 'top',
              value: "Audit Committee Member",
              fill: "#C9A84C",
              fontSize: 10,
              fontWeight: 900,
              textTransform: 'uppercase',
              letterSpacing: '0.1em'
            }}
          />

          {/* Milestone Dots */}
          {careerData.map((point, index) => (
            <ReferenceDot
              key={index}
              x={point.x}
              y={point.y}
              r={activeIndex === index ? 8 : 6}
              fill={activeIndex === index ? "#FFFFFF" : "#C9A84C"}
              stroke={activeIndex === index ? "#C9A84C" : "#FFFFFF"}
              strokeWidth={activeIndex === index ? 3 : 2}
              isFront={true}
              className="transition-all duration-300 cursor-pointer"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Elegant Company labels at the bottom */}
      <div className="absolute bottom-20 left-0 right-0 flex justify-between px-[100px] pointer-events-none">
        {careerData.map((point, index) => (
          <div key={index} className="flex flex-col items-center w-0 overflow-visible transition-all duration-500"
               style={{ opacity: activeIndex === null || activeIndex === index ? 1 : 0.3 }}>
            <motion.div 
              initial={{ y: 10, opacity: 0 }}
              whileInView={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 * index }}
              className="flex flex-col items-center"
            >
              <span className="text-white text-[10px] font-black uppercase tracking-[0.1em] text-center whitespace-pre-wrap leading-tight mb-2 min-h-[24px]">
                {point.company}
              </span>
              <div className={`w-1 h-1 rounded-full mb-2 ${activeIndex === index ? 'bg-white scale-150' : 'bg-[#C9A84C]'}`}></div>
              <span className="text-[#5A6A80] text-[9px] font-bold tracking-widest">
                {point.dates.split('–')[0]}
              </span>
            </motion.div>
          </div>
        ))}
      </div>

      {/* Footer Accents */}
      <div className="absolute bottom-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-30"></div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-3 opacity-30">
        <div className="w-12 h-[1px] bg-white/20"></div>
        <span className="text-[8px] font-black text-white uppercase tracking-[0.5em]">Trajectory Path</span>
        <div className="w-12 h-[1px] bg-white/20"></div>
      </div>
    </motion.div>
  );
}
