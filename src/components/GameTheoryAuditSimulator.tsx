import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ShieldAlert, Scale, Sliders, RotateCcw, Download } from 'lucide-react';
import { analyzeGame } from '../utils/gameTheoryEngine';
import type { GameAnalysisResult } from '../utils/gameTheoryEngine';
import { auditGameScenarios } from '../data/gameTheoryScenarios';
import type { GameScenario } from '../data/gameTheoryScenarios';

export default function GameTheoryAuditSimulator() {
  const [selectedScenario, setSelectedScenario] = useState<GameScenario>(auditGameScenarios[0]);
  const [params, setParams] = useState<Record<string, number>>(() => {
    const init: Record<string, number> = {};
    auditGameScenarios[0].questions.forEach(q => { init[q.id] = q.default; });
    return init;
  });
  const [results, setResults] = useState<GameAnalysisResult | null>(() => {
    const { matrixA, matrixB } = auditGameScenarios[0].generateMatrix({
      gain: 50, penalty: 100, ccm_cost: 15
    });
    return analyzeGame(matrixA, matrixB);
  });
  const [generatedMatrix, setGeneratedMatrix] = useState<{ matrixA: number[][]; matrixB: number[][] }>(() => {
    return auditGameScenarios[0].generateMatrix({ gain: 50, penalty: 100, ccm_cost: 15 });
  });

  const handleScenarioChange = (scenario: GameScenario) => {
    setSelectedScenario(scenario);
    const defaults: Record<string, number> = {};
    scenario.questions.forEach(q => { defaults[q.id] = q.default; });
    setParams(defaults);
    const matrices = scenario.generateMatrix(defaults);
    setGeneratedMatrix(matrices);
    setResults(analyzeGame(matrices.matrixA, matrices.matrixB));
  };

  const handleParamChange = (id: string, value: number) => {
    const updated = { ...params, [id]: value };
    setParams(updated);
    const matrices = selectedScenario.generateMatrix(updated);
    setGeneratedMatrix(matrices);
    setResults(analyzeGame(matrices.matrixA, matrices.matrixB));
  };

  const resetParams = () => {
    const defaults: Record<string, number> = {};
    selectedScenario.questions.forEach(q => { defaults[q.id] = q.default; });
    setParams(defaults);
    const matrices = selectedScenario.generateMatrix(defaults);
    setGeneratedMatrix(matrices);
    setResults(analyzeGame(matrices.matrixA, matrices.matrixB));
  };

  const exportCSV = () => {
    if (!results) return;
    const headers = ['Category', 'Parameter / Output', 'Value'];
    const rows: string[][] = [
      ['Scenario', 'Selected Model', selectedScenario.label],
      ['Player 1 (Row)', 'Identity', selectedScenario.defaultPlayers[0]],
      ['Player 2 (Column)', 'Identity', selectedScenario.defaultPlayers[1]],
    ];

    selectedScenario.questions.forEach(q => {
      rows.push(['Stakes Parameter', q.label, String(params[q.id])]);
    });

    if (results.pure_equilibria.length > 0) {
      results.pure_equilibria.forEach((eq, idx) => {
        rows.push([
          'Pure Nash Equilibrium',
          `Equilibrium #${idx + 1}`,
          `${selectedScenario.defaultStrategies.row[eq.row_idx]} vs ${selectedScenario.defaultStrategies.col[eq.col_idx]} (Payoffs: ${eq.payoffs[0]}, ${eq.payoffs[1]})`
        ]);
      });
    } else {
      rows.push(['Pure Nash Equilibrium', 'Status', 'None (Mixed strategy optimal)']);
    }

    if (results.mixed_strategies.length > 0) {
      const ms = results.mixed_strategies[0];
      rows.push(['Mixed Strategy Probabilities', `${selectedScenario.defaultPlayers[0]} - ${selectedScenario.defaultStrategies.row[1]}`, `${(ms.row_probs[1] * 100).toFixed(1)}%`]);
      rows.push(['Mixed Strategy Probabilities', `${selectedScenario.defaultPlayers[1]} - ${selectedScenario.defaultStrategies.col[1]}`, `${(ms.col_probs[1] * 100).toFixed(1)}%`]);
    }

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.map(c => `"${c}"`).join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Game_Theory_Audit_Equilibrium_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="glass-card rounded-[32px] border border-white/10 bg-black/40 p-6 md:p-10 w-full max-w-5xl mx-auto shadow-2xl">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 pb-6 border-b border-white/10 gap-4">
        <div>
          <h2 className="text-2xl font-black tracking-tight text-white flex items-center gap-3">
            <Scale className="h-6 w-6 text-[#f4c98b]" />
            Game Theory Audit & Deterrence Simulator
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Solve for Pure and Mixed Nash Equilibria in corporate control evasion vs assurance telemetry.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetParams}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border border-white/10 text-white/70 hover:text-white hover:border-white/30 transition-all bg-white/5"
            title="Reset parameters"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold bg-[#f4c98b] text-black hover:bg-[#ffe3be] transition-all shadow-lg shadow-[#f4c98b]/10"
          >
            <Download className="h-3.5 w-3.5" />
            Export Brief
          </button>
        </div>
      </div>

      {/* Scenario Selector Chips */}
      <div className="mb-8">
        <label className="block text-[11px] font-black uppercase tracking-[0.2em] text-white/40 mb-3">
          Select Institutional Dilemma
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {auditGameScenarios.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleScenarioChange(sc)}
              className={`text-left p-4 rounded-2xl border transition-all ${
                selectedScenario.id === sc.id
                  ? 'border-[#f4c98b] bg-[#f4c98b]/10 text-white shadow-lg'
                  : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:text-white'
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl">{sc.icon}</span>
                <span className="text-xs font-black text-white">{sc.label}</span>
              </div>
              <p className="text-[11px] text-white/50 line-clamp-2 leading-relaxed">{sc.description}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Controls vs Output */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left: Stakes Sliders (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-6 space-y-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#f4c98b] flex items-center gap-2">
              <Sliders className="h-4 w-4" />
              Payoff & Friction Calibration
            </h3>

            {selectedScenario.questions.map(q => (
              <div key={q.id} className="space-y-2">
                <div className="flex justify-between items-baseline">
                  <label className="text-xs font-bold text-white/80">{q.label}</label>
                  <span className="text-sm font-black text-[#f4c98b] tabular-nums">{params[q.id]}</span>
                </div>
                <p className="text-[10px] text-white/40">{q.hint}</p>
                <input
                  type="range"
                  min={q.min}
                  max={q.max}
                  step={q.step ?? 1}
                  value={params[q.id]}
                  onChange={e => handleParamChange(q.id, Number(e.target.value))}
                  className="w-full accent-[#f4c98b] bg-white/10 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[9px] text-white/30 font-bold">
                  <span>{q.min}</span>
                  <span>{q.max}</span>
                </div>
              </div>
            ))}
          </div>

          {/* Player Cards */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-5 space-y-3">
            <h4 className="text-[10px] font-black uppercase tracking-widest text-white/40">Competing Agents</h4>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-purple-400">Player 1 (Row):</span>
              <span className="font-black text-white/90">{selectedScenario.defaultPlayers[0]}</span>
            </div>
            <div className="flex justify-between items-center text-xs">
              <span className="font-bold text-blue-400">Player 2 (Col):</span>
              <span className="font-black text-white/90">{selectedScenario.defaultPlayers[1]}</span>
            </div>
          </div>
        </div>

        {/* Right: Bimatrix & Nash Output (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          {/* Bimatrix Table */}
          <div className="rounded-2xl border border-white/10 bg-black/60 p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-white/40 mb-4">
              Strategic Payoff Bimatrix (Player 1, Player 2)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr>
                    <th className="p-2" />
                    {selectedScenario.defaultStrategies.col.map((s, idx) => (
                      <th key={idx} className="p-2 text-center text-blue-400 font-bold border-b border-white/10">
                        {s}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {generatedMatrix.matrixA.map((row, rIdx) => (
                    <tr key={rIdx} className="border-b border-white/5 last:border-none">
                      <td className="p-2 font-bold text-purple-400 whitespace-nowrap border-r border-white/10">
                        {selectedScenario.defaultStrategies.row[rIdx]}
                      </td>
                      {row.map((valA, cIdx) => {
                        const valB = generatedMatrix.matrixB[rIdx][cIdx];
                        const isPureEq = results?.pure_equilibria.some(
                          eq => eq.row_idx === rIdx && eq.col_idx === cIdx
                        );
                        return (
                          <td
                            key={cIdx}
                            className={`p-3 text-center transition-all ${
                              isPureEq ? 'bg-[#f4c98b]/20 border border-[#f4c98b]/40 rounded-xl' : ''
                            }`}
                          >
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 font-mono text-xs">
                              <span className="text-purple-300 font-black">{valA.toFixed(0)}</span>
                              <span className="text-white/30">,</span>
                              <span className="text-blue-300 font-black">{valB.toFixed(0)}</span>
                            </span>
                            {isPureEq && (
                              <span className="block text-[9px] uppercase font-black tracking-widest text-[#f4c98b] mt-1">
                                ★ Nash Equilibrium
                              </span>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Equilibrium Analysis */}
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 space-y-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-[#f4c98b]">
              Equilibrium Diagnosis
            </h3>

            {results?.pure_equilibria && results.pure_equilibria.length > 0 ? (
              <div className="space-y-2">
                {results.pure_equilibria.map((eq, i) => (
                  <div key={i} className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                    <div>
                      <span className="font-black text-emerald-300">Pure Nash Equilibrium:</span>
                      <p className="text-white/80 mt-0.5">
                        {selectedScenario.defaultStrategies.row[eq.row_idx]} &times; {selectedScenario.defaultStrategies.col[eq.col_idx]}
                      </p>
                    </div>
                    <div className="text-right font-mono font-bold text-emerald-400">
                      Payoffs: ({eq.payoffs[0]}, {eq.payoffs[1]})
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200">
                <span className="font-bold">No Pure Strategy Nash Equilibrium exists.</span>
                <p className="text-amber-300/70 mt-1">
                  Neither player can choose a single predictable course of action without being exploited by the counterparty. A mixed strategy (randomized inspection/behavior) is mathematically required.
                </p>
              </div>
            )}

            {/* Mixed Strategy Probs */}
            {results?.mixed_strategies && results.mixed_strategies.length > 0 && (
              <div className="p-4 rounded-xl bg-white/5 border border-white/10 space-y-3">
                <span className="text-[10px] font-black uppercase tracking-widest text-white/50">
                  Required Mixed Enforcement Probabilities
                </span>
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-purple-400 font-bold block mb-1">
                      {selectedScenario.defaultPlayers[0]}:
                    </span>
                    <span className="text-white/70 font-mono text-[11px]">
                      {selectedScenario.defaultStrategies.row[1]}:{' '}
                      <strong className="text-white">
                        {(results.mixed_strategies[0].row_probs[1] * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                  <div>
                    <span className="text-blue-400 font-bold block mb-1">
                      {selectedScenario.defaultPlayers[1]}:
                    </span>
                    <span className="text-white/70 font-mono text-[11px]">
                      {selectedScenario.defaultStrategies.col[1]}:{' '}
                      <strong className="text-white">
                        {(results.mixed_strategies[0].col_probs[1] * 100).toFixed(1)}%
                      </strong>
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Strategic Interpretation */}
            <div className="pt-2 border-t border-white/10">
              <span className="text-[10px] font-black uppercase tracking-widest text-white/40 block mb-1.5">
                Executive Behavioral Takeaway
              </span>
              <p className="text-xs text-white/80 leading-relaxed">
                {results ? selectedScenario.interpret(
                  results,
                  selectedScenario.defaultPlayers,
                  selectedScenario.defaultStrategies,
                  params
                ) : 'Analyzing matrix...'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
