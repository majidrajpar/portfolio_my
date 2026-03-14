import React from 'react';
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
import { motion } from 'framer-motion';

const careerData = [
  { x: 2005, y: 14, company: "EY", role: "Audit Manager", dates: "2004–2009" },
  { x: 2010, y: 27, company: "BMA ASSET\nMANAGEMENT", role: "AVP, Internal Audit", dates: "2010–2011" },
  { x: 2011, y: 38, company: "KPMG\n(QATAR)", role: "Internal Audit Manager", dates: "2011–2013" },
  { x: 2014, y: 50, company: "McDONALD'S\nKSA", role: "Manager, Internal Audit", dates: "2014–2016" },
  { x: 2017, y: 61, company: "AL-FAISALIAH\nGROUP", role: "Group Director, IA & Risk", dates: "2016–2022" },
  { x: 2022, y: 75, company: "KITOPI", role: "Director of Internal Audit", dates: "2022–2025" },
  { x: 2025, y: 87, company: "VERITUX", role: "Internal Audit Director", dates: "2025–Present" }
];

const acPoint = { x: 2021, y: 72.2, role: "Audit Committee Member", company: "AFG Restaurants Sector" };

const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#001F5B] border border-[#C9A84C]/30 p-4 shadow-2xl backdrop-blur-md">
        <p className="text-[10px] font-black text-[#C9A84C] uppercase tracking-widest mb-1">{data.dates}</p>
        <p className="text-white font-bold text-sm mb-0.5 whitespace-pre-wrap">{data.role}</p>
        <p className="text-slate-400 text-xs font-medium uppercase tracking-tighter whitespace-pre-wrap">{data.company}</p>
      </div>
    );
  }
  return null;
};

const CustomizedLabel = (props) => {
  const { x, y, value, index } = props;
  const data = careerData[index];
  
  // Nudge some labels to avoid overlap if needed, though Recharts usually handles it
  let dy = -25;
  if (data.x === 2010) dy = -40; // BMA
  if (data.x === 2011) dy = -20; // KPMG

  return (
    <g>
      <text 
        x={x} 
        y={y + dy} 
        fill="white" 
        textAnchor="middle" 
        fontSize={10} 
        fontWeight={700}
        className="pointer-events-none select-none"
      >
        {value.split('\n')[0]}
      </text>
    </g>
  );
};

export default function CareerTimeline() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="w-full h-[550px] bg-[#001F5B] border border-slate-800 shadow-2xl overflow-hidden relative"
    >
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(#C9A84C 0.5px, transparent 0.5px)', backgroundSize: '40px 40px' }}>
      </div>

      <div className="absolute top-10 left-10 z-10 pointer-events-none">
        <h3 className="text-white font-black text-3xl tracking-tighter leading-none mb-3">STRATEGIC CAREER ARCHITECTURE</h3>
        <p className="text-[#8895AA] text-[11px] font-bold uppercase tracking-[0.3em] max-w-md leading-relaxed opacity-80">
          Two Decades of Progressive Leadership & Enterprise Value Protection
        </p>
      </div>

      <div className="absolute top-10 right-10 z-10 text-right pointer-events-none">
        <div className="inline-block border border-[#C9A84C]/50 px-4 py-1.5 text-[10px] font-black text-[#C9A84C] uppercase tracking-[0.2em] backdrop-blur-sm">
          Audit 4.0 & Strategic Advisory
        </div>
      </div>

      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={careerData}
          margin={{ top: 160, right: 80, left: 80, bottom: 100 }}
        >
          <defs>
            <linearGradient id="colorY" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#C9A84C" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="#C9A84C" stopOpacity={0}/>
            </linearGradient>
          </defs>
          
          <XAxis 
            dataKey="x" 
            type="number" 
            domain={[2004, 2026]} 
            ticks={[2005, 2008, 2011, 2014, 2017, 2020, 2023, 2026]}
            axisLine={false}
            tickLine={false}
            tick={{ fill: '#8895AA', fontSize: 11, fontWeight: 800, letterSpacing: '0.1em' }}
            dy={40}
          />
          
          <YAxis hide domain={[0, 110]} />
          
          <Tooltip 
            content={<CustomTooltip />} 
            cursor={{ stroke: '#C9A84C', strokeWidth: 1, strokeDasharray: '4 4' }}
          />
          
          <Area
            type="monotone"
            dataKey="y"
            stroke="#C9A84C"
            strokeWidth={4}
            fillOpacity={1}
            fill="url(#colorY)"
            animationDuration={2500}
            animationBegin={500}
          >
            <LabelList dataKey="role" content={<CustomizedLabel />} />
          </Area>

          {/* Audit Committee Point */}
          <ReferenceLine
            x={acPoint.x}
            y1={acPoint.y}
            y2={acPoint.y + 20}
            stroke="#C9A84C"
            strokeWidth={1.5}
            strokeDasharray="5 5"
          />
          <ReferenceDot
            x={acPoint.x}
            y={acPoint.y}
            r={6}
            fill="#C9A84C"
            stroke="#FFFFFF"
            strokeWidth={2}
            isFront={true}
          />
          
          {/* Audit Committee Label */}
          <ReferenceDot
            x={acPoint.x}
            y={acPoint.y + 25}
            r={0}
            label={{
              position: 'top',
              value: "Audit Committee Member",
              fill: "#C9A84C",
              fontSize: 10,
              fontWeight: 900,
              textTransform: 'uppercase'
            }}
          />

          {/* Milestone Dots */}
          {careerData.map((point, index) => (
            <ReferenceDot
              key={index}
              x={point.x}
              y={point.y}
              r={5}
              fill="#C9A84C"
              stroke="#FFFFFF"
              strokeWidth={2}
              isFront={true}
              className="cursor-pointer"
            />
          ))}
        </AreaChart>
      </ResponsiveContainer>
      
      {/* Company labels at the bottom */}
      <div className="absolute bottom-14 left-0 right-0 flex justify-between px-[80px] pointer-events-none">
        {careerData.map((point, index) => (
          <div key={index} className="flex flex-col items-center w-0 overflow-visible">
            <span className="text-white text-[9px] font-black uppercase tracking-widest text-center whitespace-pre-wrap leading-tight mb-1">
              {point.company}
            </span>
            <span className="text-[#5A6A80] text-[8px] font-bold">
              {point.dates.split('–')[0]}
            </span>
          </div>
        ))}
      </div>

      {/* Trajectory Accent */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C9A84C]/30 to-transparent"></div>
    </motion.div>
  );
}
