import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BarChart2, TrendingUp, PieChart, Activity, Plus, X, Copy, Check, Lock } from 'lucide-react';
import {
  BarChart, Bar,
  LineChart, Line,
  PieChart as RechartsPieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer,
} from 'recharts';

const THEMES = {
  navy:  ['#001F5B', '#1e3a8a', '#3b82f6', '#93c5fd', '#dbeafe'],
  gold:  ['#C9A84C', '#b45309', '#d97706', '#fbbf24', '#fef3c7'],
  teal:  ['#0f766e', '#0d9488', '#14b8a6', '#5eead4', '#ccfbf1'],
  mixed: ['#001F5B', '#C9A84C', '#0f766e', '#dc2626', '#7c3aed'],
};

const CHART_TYPES = [
  { key: 'bar',   label: 'Bar Chart',   Icon: BarChart2   },
  { key: 'line',  label: 'Line Chart',  Icon: TrendingUp  },
  { key: 'pie',   label: 'Pie / Donut', Icon: PieChart    },
  { key: 'radar', label: 'Radar Chart', Icon: Activity    },
];

const THEME_META = [
  { key: 'navy',  label: 'Navy'  },
  { key: 'gold',  label: 'Gold'  },
  { key: 'teal',  label: 'Teal'  },
  { key: 'mixed', label: 'Mixed' },
];

let nextId = 5;

export default function ChartCreator() {
  const [chartType, setChartType] = useState('bar');
  const [title, setTitle] = useState('');
  const [theme, setTheme] = useState('navy');
  const [rows, setRows] = useState([
    { id: 1, label: 'Q1', value: '' },
    { id: 2, label: 'Q2', value: '' },
    { id: 3, label: 'Q3', value: '' },
    { id: 4, label: 'Q4', value: '' },
  ]);
  const [copied, setCopied] = useState(false);

  const colors = THEMES[theme];

  const chartData = rows
    .filter(r => r.label.trim() && !isNaN(parseFloat(r.value)) && r.value !== '')
    .map(r => ({ name: r.label.trim(), value: parseFloat(r.value) }));

  const hasEnoughData = chartData.length >= 2;

  // Row management
  function updateRow(id, field, val) {
    setRows(prev => prev.map(r => r.id === id ? { ...r, [field]: val } : r));
  }

  function addRow() {
    if (rows.length >= 12) return;
    setRows(prev => [...prev, { id: nextId++, label: '', value: '' }]);
  }

  function removeRow(id) {
    if (rows.length <= 2) return;
    setRows(prev => prev.filter(r => r.id !== id));
  }

  // Copy formatted table
  function handleCopy() {
    const displayTitle = title.trim() || 'Untitled Chart';
    const divider = '─'.repeat(29);
    const colDivider = `${'─'.repeat(13)}  ${'─'.repeat(5)}`;

    const dataLines = chartData.map(d => {
      const lbl = d.name.padEnd(13);
      return `${lbl}  ${d.value}`;
    });

    const text = [
      displayTitle,
      divider,
      `Label          Value`,
      colDivider,
      ...dataLines,
      '',
      'Prepared using Majid Mumtaz Audit Intelligence Tools',
    ].join('\n');

    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  // Chart renderer
  function renderChart() {
    if (!hasEnoughData) {
      return (
        <div className="flex items-center justify-center h-[300px] text-slate-400 text-sm text-center px-4">
          Add at least 2 rows with valid values to preview your chart.
        </div>
      );
    }

    if (chartType === 'bar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill={colors[0]} />
          </BarChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'line') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Line
              type="monotone"
              dataKey="value"
              stroke={colors[0]}
              strokeWidth={2}
              dot={{ r: 4 }}
            />
          </LineChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'pie') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RechartsPieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              outerRadius={110}
              innerRadius={50}
              label
            >
              {chartData.map((_, i) => (
                <Cell key={i} fill={colors[i % colors.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </RechartsPieChart>
        </ResponsiveContainer>
      );
    }

    if (chartType === 'radar') {
      return (
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={chartData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="name" />
            <PolarRadiusAxis />
            <Radar
              dataKey="value"
              stroke={colors[0]}
              fill={colors[0]}
              fillOpacity={0.3}
            />
            <Tooltip />
          </RadarChart>
        </ResponsiveContainer>
      );
    }

    return null;
  }

  return (
    <div className="w-full">
      {/* Grid layout */}
      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-6">

        {/* ── Controls panel ── */}
        <div className="bg-slate-50 border border-slate-200 p-6 flex flex-col gap-6">

          {/* Chart type selector */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
              Chart Type
            </p>
            <div className="grid grid-cols-2 gap-2">
              {CHART_TYPES.map(({ key, label, Icon }) => {
                const active = chartType === key;
                return (
                  <button
                    key={key}
                    onClick={() => setChartType(key)}
                    className={`flex flex-col items-center gap-1.5 py-3 px-2 border text-[10px] font-black uppercase tracking-wide transition-colors ${
                      active
                        ? 'bg-[#001F5B] border-[#001F5B] text-white'
                        : 'bg-white border-slate-200 text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <Icon size={18} />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Title input */}
          <div>
            <label className="block text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-2">
              Chart Title
            </label>
            <input
              type="text"
              value={title}
              onChange={e => setTitle(e.target.value)}
              placeholder="e.g. Q1–Q4 Revenue Variance"
              className="w-full border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:border-[#001F5B]"
            />
          </div>

          {/* Colour theme */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
              Colour Theme
            </p>
            <div className="flex flex-col gap-2">
              {THEME_META.map(({ key, label }) => {
                const active = theme === key;
                const swatches = THEMES[key].slice(0, 3);
                return (
                  <button
                    key={key}
                    onClick={() => setTheme(key)}
                    className={`flex items-center gap-3 px-3 py-2 border text-xs font-black transition-colors text-left ${
                      active
                        ? 'border-[#001F5B] bg-white text-[#001F5B]'
                        : 'border-slate-200 bg-white text-slate-600 hover:border-slate-400'
                    }`}
                  >
                    <span className="flex gap-1">
                      {swatches.map((c, i) => (
                        <span
                          key={i}
                          className="inline-block w-4 h-4 border border-white/30"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </span>
                    <span>{label}</span>
                    {active && (
                      <span className="ml-auto w-2 h-2 bg-[#001F5B]" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Data rows table */}
          <div>
            <p className="text-[10px] font-black text-slate-500 uppercase tracking-[0.3em] mb-3">
              Data Rows
            </p>
            <div className="w-full">
              {/* Table header */}
              <div className="grid grid-cols-[1fr_80px_28px] gap-1 mb-1 px-1">
                <span className="text-xs text-slate-500 font-medium">Label</span>
                <span className="text-xs text-slate-500 font-medium">Value</span>
                <span />
              </div>

              {/* Rows */}
              <div className="flex flex-col gap-1">
                <AnimatePresence initial={false}>
                  {rows.map(row => (
                    <motion.div
                      key={row.id}
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: 'auto' }}
                      exit={{ opacity: 0, height: 0 }}
                      transition={{ duration: 0.15 }}
                      className="grid grid-cols-[1fr_80px_28px] gap-1 items-center"
                    >
                      <input
                        type="text"
                        value={row.label}
                        onChange={e => updateRow(row.id, 'label', e.target.value)}
                        placeholder="Label"
                        className="border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#001F5B] min-w-0"
                      />
                      <input
                        type="number"
                        value={row.value}
                        onChange={e => updateRow(row.id, 'value', e.target.value)}
                        placeholder="0"
                        className="border border-slate-200 bg-white px-2 py-1.5 text-sm text-slate-800 placeholder-slate-300 focus:outline-none focus:border-[#001F5B] w-full"
                      />
                      <button
                        onClick={() => removeRow(row.id)}
                        disabled={rows.length <= 2}
                        className="flex items-center justify-center w-7 h-7 text-slate-400 hover:text-red-500 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors disabled:opacity-30 disabled:pointer-events-none"
                        aria-label="Remove row"
                      >
                        <X size={14} />
                      </button>
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>

              {/* Add row button */}
              <button
                onClick={addRow}
                disabled={rows.length >= 12}
                className="mt-2 flex items-center gap-1.5 text-xs font-medium text-[#001F5B] hover:text-blue-700 disabled:opacity-40 disabled:pointer-events-none"
              >
                <Plus size={14} />
                Add Row
              </button>
            </div>
          </div>

          {/* Copy data button */}
          <div>
            <button
              onClick={handleCopy}
              disabled={chartData.length === 0}
              className="w-full flex items-center justify-center gap-2.5 px-4 py-2.5 bg-[#001F5B] text-white text-[10px] font-black uppercase tracking-[0.2em] hover:bg-[#002d87] transition-colors disabled:opacity-40 disabled:pointer-events-none"
            >
              {copied ? <Check size={15} /> : <Copy size={15} />}
              {copied ? 'Copied' : 'Copy Data Table'}
            </button>
          </div>
        </div>

        {/* ── Preview panel ── */}
        <div className="bg-white border border-slate-200 p-6 flex flex-col">
          {/* Chart title */}
          {title.trim() && (
            <p className="font-black text-base text-slate-800 mb-4">
              {title.trim()}
            </p>
          )}

          {/* Chart */}
          <motion.div
            key={`${chartType}-${theme}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.2 }}
            className="flex-1"
          >
            {renderChart()}
          </motion.div>

          {/* Legend hint for non-pie charts */}
          {hasEnoughData && chartType !== 'pie' && (
            <p className="mt-4 text-xs text-slate-400">
              {chartData.length} data point{chartData.length !== 1 ? 's' : ''} rendered
            </p>
          )}
        </div>
      </div>

      {/* Privacy notice */}
      <div className="flex items-center gap-2 mt-4 text-slate-400">
        <Lock className="w-3 h-3 flex-shrink-0" />
        <span className="text-[10px] font-bold uppercase tracking-widest">
          This tool runs entirely in your browser. No data is transmitted or stored.
        </span>
      </div>
    </div>
  );
}
