import React, { useState, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  Sliders,
  RotateCcw,
  Download,
  AlertTriangle,
  TrendingDown,
  Truck,
} from 'lucide-react';

interface SimulationReport {
  summary: {
    totalBranches: number;
    numKsa: number;
    numUae: number;
    annualRevenue: number;
    deliveryRevenue: number;
    importedCogs: number;
    baselineEbitda: number;
  };
  ebitdaRisk: {
    var95Loss: number;
    var95MarginPct: number;
    cvar95Loss: number;
    cvar95MarginPct: number;
    var99Loss: number;
    meanLoss: number;
    probNegativeEbitda: number;
    drivers: {
      aggregator: number;
      municipal: number;
      customs: number;
      chiller: number;
      supervisory: number;
    };
  };
  aggregator: {
    grossDelivery: number;
    leakage: number;
    recoverable: number;
    diversionSavings: number;
    posture: string;
  };
  liquidity: {
    cashBuffer: number;
    cashOutProb: number;
    riskTier: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL';
    maxDrawdown: number;
    recBuffer: number;
    bufferDelta: number;
    diagnostic: string;
  };
  actionPlan: Array<{
    priority: number;
    timeframe: string;
    scope: string;
    action: string;
    protection: string;
    lead: string;
  }>;
}

// Cholesky lower triangular matrix for 5x5 GCC correlation matrix
const CHOLESKY_L = [
  [1.0, 0.0, 0.0, 0.0, 0.0],
  [0.72, 0.6939740629158989, 0.0, 0.0, 0.0],
  [0.75, 0.1585073648686646, 0.6421646325377879, 0.0, 0.0],
  [0.15, -0.01152780835408469, 0.01452469048015983, 0.9885120854096864, 0.0],
  [0.20, 0.15274346069162228, 0.009014879131497193, 0.27478658381856336, 0.9279442335202666],
];

// Standard normal quantile approximation (Acklam's algorithm)
function normalCdf(x: number): number {
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const sign = x < 0 ? -1 : 1;
  const absX = Math.abs(x) / Math.SQRT2;
  const t = 1.0 / (1.0 + p * absX);
  const erf = 1.0 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return 0.5 * (1.0 + sign * erf);
}

// Seeded pseudo-random generator to ensure zero SSR hydration mismatch
function mulberry32(seed: number) {
  let a = seed;
  return function() {
    let t = (a += 0x6D2B79F5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// Pseudo-random standard normal variates via Box-Muller using PRNG
function standardNormal(rand: () => number): number {
  let u1 = 0;
  let u2 = 0;
  while (u1 === 0) u1 = rand();
  while (u2 === 0) u2 = rand();
  return Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
}

// Quantile helpers
function percentile(sortedArr: number[], p: number): number {
  if (sortedArr.length === 0) return 0;
  const index = (p / 100) * (sortedArr.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sortedArr[lower] * (1 - weight) + sortedArr[upper] * weight;
}

export default function GCCRestaurantExposureCalculator() {
  const [numKsa, setNumKsa] = useState<number>(3);
  const [numUae, setNumUae] = useState<number>(2);
  const [annualRevenue, setAnnualRevenue] = useState<number>(12000000);
  const [deliveryShare, setDeliveryShare] = useState<number>(55); // percentage
  const [importShare, setImportShare] = useState<number>(35); // percentage
  const [cashBuffer, setCashBuffer] = useState<number>(250000);
  const [trials, setTrials] = useState<number>(3000);

  // Compute Full Gaussian Copula and 52-Week Liquidity Engine
  const report: SimulationReport = useMemo(() => {
    const totalUnits = Math.max(1, numKsa + numUae);
    const ksaRatio = numKsa / totalUnits;
    const delRatio = deliveryShare / 100.0;
    const impRatio = importShare / 100.0;

    const baseRevenue = annualRevenue;
    const deliveryRev = baseRevenue * delRatio;
    const cogsTotal = baseRevenue * 0.31;
    const importedCogs = cogsTotal * impRatio;
    const baselineEbitda = baseRevenue * 0.165;

    // Run Monte Carlo simulation trials with deterministic seed
    const rand = mulberry32(42);
    const totalLosses: number[] = new Array(trials);
    let sumAggLoss = 0;
    let sumMuniLoss = 0;
    let sumCustomsLoss = 0;
    let sumChillerLoss = 0;
    let sumSupervisoryLoss = 0;
    let negativeEbitdaCount = 0;

    for (let i = 0; i < trials; i++) {
      // 5 independent standard normals
      const z = [
        standardNormal(rand),
        standardNormal(rand),
        standardNormal(rand),
        standardNormal(rand),
        standardNormal(rand),
      ];

      // Correlate using Cholesky
      const c = [0, 0, 0, 0, 0];
      for (let r = 0; r < 5; r++) {
        let sum = 0;
        for (let col = 0; col <= r; col++) {
          sum += CHOLESKY_L[r][col] * z[col];
        }
        c[r] = sum;
      }

      // Convert to uniform marginals [0, 1]
      const u0 = normalCdf(c[0]); // Heatwave
      const u1 = normalCdf(c[1]); // Municipal Inspections
      const u2 = normalCdf(c[2]); // Chiller breakdown
      const u3 = normalCdf(c[3]); // Red sea port customs
      const u4 = normalCdf(c[4]); // Aggregator squeeze

      // Shock 1: Aggregator Squeeze & Promo Creep (2.0% - 4.8% of delivery sales)
      const aggSqueezeRate = 0.015 + u4 * 0.035;
      const aggLoss = deliveryRev * aggSqueezeRate;

      // Shock 2: Balady / ADAFSA Municipal Inspections
      const ksaMuniSweep = u1 > 0.40 ? (numKsa * (25000 + u1 * 35000)) : 0;
      const uaeMuniSweep = u1 > 0.50 ? (numUae * (15000 + u1 * 22000)) : 0;
      const muniLoss = ksaMuniSweep + uaeMuniSweep;

      // Shock 3: Customs Rejection & Emergency Spot Procurement
      const customsRejection = u3 > 0.65;
      const customsLoss = customsRejection ? (importedCogs * (0.28 + u3 * 0.15)) : 0;

      // Shock 4: Summer Chiller Compressor Lockout
      const chillerLockout = (u0 > 0.60) && (u2 > 0.55);
      const chillerLoss = chillerLockout ? (totalUnits * (18000 + u2 * 25000)) : 0;

      // Shock 5: Supervisory Saudization Wage Squeeze (Qiwa)
      const supervisorySurge = u4 > 0.55 ? ((baseRevenue * 0.24 * ksaRatio * 0.25) * 0.18) : 0;

      const trialLoss = aggLoss + muniLoss + customsLoss + chillerLoss + supervisorySurge;
      totalLosses[i] = trialLoss;

      sumAggLoss += aggLoss;
      sumMuniLoss += muniLoss;
      sumCustomsLoss += customsLoss;
      sumChillerLoss += chillerLoss;
      sumSupervisoryLoss += supervisorySurge;

      if ((baselineEbitda - trialLoss) < 0) {
        negativeEbitdaCount++;
      }
    }

    // Sort losses ascending for VaR / CVaR
    totalLosses.sort((a, b) => a - b);
    const var95 = percentile(totalLosses, 95);
    const var99 = percentile(totalLosses, 99);

    const tailLosses = totalLosses.filter(l => l >= var95);
    const cvar95 = tailLosses.length > 0 ? (tailLosses.reduce((a, b) => a + b, 0) / tailLosses.length) : var95;
    const meanLoss = totalLosses.reduce((a, b) => a + b, 0) / trials;

    // 52-Week Liquidity Stress Test
    const weeklyGross = baseRevenue / 52.0;
    const weeklyDelivery = weeklyGross * delRatio;
    const weeklyInstore = weeklyGross * (1.0 - delRatio);
    const weeklyCogs = cogsTotal / 52.0;
    const weeklyOpex = (baseRevenue * 0.105) / 52.0;
    const monthlyWpsPayroll = (baseRevenue * 0.24) / 12.0;
    const quarterlyRentPdc = (baseRevenue * 0.18 * 0.70) / 4.0;

    let bouncedChequeRuns = 0;
    const sampleTrajectories = Math.min(1000, trials);
    let maxDrawdownsSum = 0;
    const randLiq = mulberry32(101);

    for (let s = 0; s < sampleTrajectories; s++) {
      let cash = cashBuffer;
      let minCash = cash;
      let holdbackWeeksRemaining = 0;

      for (let w = 1; w <= 52; w++) {
        // 1.5% chance per week of a 3-week dispute remittance holdback
        if (holdbackWeeksRemaining === 0 && randLiq() < 0.015) {
          holdbackWeeksRemaining = 3;
        }

        // Inflow
        let inflow = weeklyInstore;
        if (holdbackWeeksRemaining > 0) {
          holdbackWeeksRemaining--;
          inflow += weeklyDelivery * 0.20; // 80% remittance frozen
        } else {
          inflow += weeklyDelivery * 0.78; // Standard 22% commission net payout
        }

        // Outflow
        let outflow = weeklyCogs + weeklyOpex;
        if (w % 4 === 2) outflow += monthlyWpsPayroll;
        if (w === 1 || w === 14 || w === 27 || w === 40) outflow += quarterlyRentPdc;

        cash += (inflow - outflow);
        if (cash < minCash) minCash = cash;
      }

      maxDrawdownsSum += (cashBuffer - minCash);
      if (minCash < 0) bouncedChequeRuns++;
    }

    const probCashOut = (bouncedChequeRuns / sampleTrajectories) * 100.0;
    const avgMaxDrawdown = maxDrawdownsSum / sampleTrajectories;
    const monthlyFixedObligations = monthlyWpsPayroll + (quarterlyRentPdc / 3.0);
    const recCashBuffer = Math.round(monthlyFixedObligations * 1.5);
    const bufferDelta = cashBuffer - recCashBuffer;

    let riskTier: 'LOW' | 'MODERATE' | 'ELEVATED' | 'CRITICAL' = 'LOW';
    if (probCashOut > 35) riskTier = 'CRITICAL';
    else if (probCashOut > 15) riskTier = 'ELEVATED';
    else if (probCashOut > 5) riskTier = 'MODERATE';

    // Aggregator Leakage & Game Theory
    const annualDeductionLeakage = deliveryRev * 0.042;
    const recoverableDisputeValue = annualDeductionLeakage * 0.72;
    const nativeDiversionSavings = (deliveryRev * 0.30) * 0.18; // 18% net commission savings

    // Prioritized Action Plan
    const actionPlan = [
      {
        priority: 1,
        timeframe: 'Days 1-7',
        scope: 'GCC_WIDE',
        action: 'Deploy automated daily POS-to-aggregator remittance audit matching order IDs against rider dispatch times.',
        protection: `Recovers an estimated AED ${Math.round(recoverableDisputeValue).toLocaleString()} in contested deduction clawbacks.`,
        lead: 'Finance Controller & Revenue Operations'
      },
      {
        priority: 2,
        timeframe: 'Days 8-15',
        scope: numKsa > 0 ? 'KSA' : 'UAE',
        action: numKsa > 0
          ? 'Execute Balady cold-chain compliance check across walk-in chillers (<4°C) and audit Qiwa cashier 100% Saudization rosters.'
          : 'Audit wireless IoT temperature sensors across chiller units and verify automated telemetry sync with Dubai Foodwatch.',
        protection: 'Prevents municipal health fines (SAR 25,000-50,000 per branch) and temporary 48-hour operational closures.',
        lead: 'Operations Director'
      },
      {
        priority: 3,
        timeframe: 'Days 16-23',
        scope: 'GCC_WIDE',
        action: 'Restructure quarterly physical lease PDCs into monthly automated direct debits with commercial landlords.',
        protection: `Eliminates the ${probCashOut.toFixed(1)}% commercial cheque bounce hazard during aggregator payout freezes.`,
        lead: 'Chief Financial Officer'
      },
      {
        priority: 4,
        timeframe: 'Days 24-30',
        scope: 'GCC_WIDE',
        action: 'Deploy white-label direct ordering (native mobile web/WhatsApp) incentivized with a 10% customer loyalty reward.',
        protection: `Diverts 30% of peak repeat order volume, generating AED ${Math.round(nativeDiversionSavings).toLocaleString()} in annual commission savings.`,
        lead: 'Head of Digital Channels'
      }
    ];

    return {
      summary: {
        totalBranches: totalUnits,
        numKsa,
        numUae,
        annualRevenue: baseRevenue,
        deliveryRevenue: deliveryRev,
        importedCogs,
        baselineEbitda
      },
      ebitdaRisk: {
        var95Loss: Math.round(var95),
        var95MarginPct: Number(((var95 / baseRevenue) * 100).toFixed(2)),
        cvar95Loss: Math.round(cvar95),
        cvar95MarginPct: Number(((cvar95 / baseRevenue) * 100).toFixed(2)),
        var99Loss: Math.round(var99),
        meanLoss: Math.round(meanLoss),
        probNegativeEbitda: Number(((negativeEbitdaCount / trials) * 100).toFixed(1)),
        drivers: {
          aggregator: Math.round(sumAggLoss / trials),
          municipal: Math.round(sumMuniLoss / trials),
          customs: Math.round(sumCustomsLoss / trials),
          chiller: Math.round(sumChillerLoss / trials),
          supervisory: Math.round(sumSupervisoryLoss / trials)
        }
      },
      aggregator: {
        grossDelivery: Math.round(deliveryRev),
        leakage: Math.round(annualDeductionLeakage),
        recoverable: Math.round(recoverableDisputeValue),
        diversionSavings: Math.round(nativeDiversionSavings),
        posture: 'Responsive Litigation (Tit-for-Tat): Maintain aggregator presence for lead acquisition while systematically diverting 25-35% of peak repeat order volume to white-label direct channels. Audit 100% of weekly aggregator remittance deduction line items within the 14-day contractual dispute window without crossing the 35% dispute intensity threshold that triggers algorithmic de-listing.'
      },
      liquidity: {
        cashBuffer,
        cashOutProb: Number(probCashOut.toFixed(1)),
        riskTier,
        maxDrawdown: Math.round(avgMaxDrawdown),
        recBuffer: recCashBuffer,
        bufferDelta,
        diagnostic: bufferDelta < 0
          ? `Acute liquidity deficit of AED ${Math.abs(bufferDelta).toLocaleString()}. Post-dated cheques risk default during routine aggregator dispute holdbacks.`
          : `Adequate liquidity buffer. Working capital surplus of AED ${bufferDelta.toLocaleString()} insulates against remittance timing friction.`
      },
      actionPlan
    };
  }, [numKsa, numUae, annualRevenue, deliveryShare, importShare, cashBuffer, trials]);

  const exportCSV = useCallback(() => {
    const rows = [
      ['Category', 'Metric', 'Value'],
      ['Store Footprint', 'KSA Branches', String(report.summary.numKsa)],
      ['Store Footprint', 'UAE Branches', String(report.summary.numUae)],
      ['Financial Baseline', 'Annual Turnover (AED)', String(report.summary.annualRevenue)],
      ['Financial Baseline', 'Annual Delivery Sales (AED)', String(report.summary.deliveryRevenue)],
      ['Financial Baseline', 'Baseline EBITDA (AED)', String(report.summary.baselineEbitda)],
      ['Tail Risk (Copula)', 'VaR-95 Cash Loss (AED)', String(report.ebitdaRisk.var95Loss)],
      ['Tail Risk (Copula)', 'VaR-95 Margin Loss (%)', `${report.ebitdaRisk.var95MarginPct}%`],
      ['Tail Risk (Copula)', 'CVaR-95 Expected Shortfall (AED)', String(report.ebitdaRisk.cvar95Loss)],
      ['Tail Risk (Copula)', 'VaR-99 Severe Tail Shock (AED)', String(report.ebitdaRisk.var99Loss)],
      ['Loss Attribution', 'Aggregator Promo Squeeze (AED)', String(report.ebitdaRisk.drivers.aggregator)],
      ['Loss Attribution', 'Municipal Inspection Sweeps (AED)', String(report.ebitdaRisk.drivers.municipal)],
      ['Loss Attribution', 'Customs Shelf-Life Rejections (AED)', String(report.ebitdaRisk.drivers.customs)],
      ['Loss Attribution', 'Summer Chiller Lockouts (AED)', String(report.ebitdaRisk.drivers.chiller)],
      ['Loss Attribution', 'Supervisory Saudization Wage Surge (AED)', String(report.ebitdaRisk.drivers.supervisory)],
      ['Aggregator Channel', 'Annual Deduction Leakage (AED)', String(report.aggregator.leakage)],
      ['Aggregator Channel', 'Recoverable Audit Volume (AED)', String(report.aggregator.recoverable)],
      ['Aggregator Channel', '30% Direct Ordering Savings (AED)', String(report.aggregator.diversionSavings)],
      ['52-Week Liquidity', 'PDC Default Risk Tier', report.liquidity.riskTier],
      ['52-Week Liquidity', 'Cash-Out Probability (%)', `${report.liquidity.cashOutProb}%`],
      ['52-Week Liquidity', 'Maximum Projected Drawdown (AED)', String(report.liquidity.maxDrawdown)],
      ['52-Week Liquidity', 'Recommended Minimum Cash Buffer (AED)', String(report.liquidity.recBuffer)],
      ['52-Week Liquidity', 'Buffer Surplus / Deficit (AED)', String(report.liquidity.bufferDelta)],
    ];

    const csvContent = 'data:text/csv;charset=utf-8,' + rows.map(r => r.join(',')).join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `gcc_restaurant_exposure_assessment_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, [report]);

  const resetDefaults = () => {
    setNumKsa(3);
    setNumUae(2);
    setAnnualRevenue(12000000);
    setDeliveryShare(55);
    setImportShare(35);
    setCashBuffer(250000);
    setTrials(3000);
  };

  const totalMeanLoss = Object.values(report.ebitdaRisk.drivers).reduce((a, b) => a + b, 0) || 1;

  return (
    <div className="space-y-8">
      {/* Top Header Actions */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#2d2822] pb-6">
        <div>
          <span className="text-xs font-mono uppercase tracking-widest text-[#f4c98b]">
            Multivariate Gaussian Copula & 52-Week Liquidity Stress Test
          </span>
          <h2 className="mt-1 text-2xl font-black text-white md:text-3xl">
            GCC Multi-Unit Restaurant Exposure Calculator
          </h2>
          <p className="mt-1 text-sm text-white/70">
            Model correlated municipal sweeps, aggregator margin creep, customs shelf-life rejections, and commercial PDC default risk.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={resetDefaults}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-xs font-bold text-white transition hover:bg-white/10"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Defaults
          </button>
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 rounded-lg bg-[#c7964c] px-4 py-2 text-xs font-black uppercase tracking-wider text-black transition hover:bg-[#f4c98b]"
          >
            <Download className="h-3.5 w-3.5" />
            Export Audit Ledger
          </button>
        </div>
      </div>

      {/* Main Grid: Controls on Left, Metrics on Right */}
      <div className="grid gap-8 lg:grid-cols-12">
        {/* Controls Column (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <span className="flex items-center gap-2 text-xs font-mono uppercase tracking-widest text-white/60">
                <Sliders className="h-4 w-4 text-[#f4c98b]" />
                Store Footprint & Financial Parameters
              </span>
              <span className="rounded bg-[#c7964c]/20 px-2 py-0.5 text-[10px] font-mono text-[#f4c98b]">
                {trials.toLocaleString()} Monte Carlo Trials
              </span>
            </div>

            <div className="mt-6 space-y-5">
              {/* KSA Branches */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Saudi Arabia (KSA) Units</span>
                  <span className="font-mono text-[#f4c98b]">{numKsa} branches</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={numKsa}
                  onChange={(e) => setNumKsa(parseInt(e.target.value) || 0)}
                  className="mt-2 w-full accent-[#c7964c]"
                />
                <div className="mt-1 flex gap-2">
                  {[1, 3, 8, 20].map((v) => (
                    <button
                      key={v}
                      onClick={() => setNumKsa(v)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                        numKsa === v
                          ? 'border-[#c7964c] bg-[#c7964c]/20 text-[#f4c98b]'
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* UAE Branches */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>UAE Units</span>
                  <span className="font-mono text-[#f4c98b]">{numUae} branches</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="50"
                  value={numUae}
                  onChange={(e) => setNumUae(parseInt(e.target.value) || 0)}
                  className="mt-2 w-full accent-[#c7964c]"
                />
                <div className="mt-1 flex gap-2">
                  {[0, 2, 5, 15].map((v) => (
                    <button
                      key={v}
                      onClick={() => setNumUae(v)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                        numUae === v
                          ? 'border-[#c7964c] bg-[#c7964c]/20 text-[#f4c98b]'
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {v}
                    </button>
                  ))}
                </div>
              </div>

              {/* Annual Revenue */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Annual System Turnover (AED / SAR)</span>
                  <span className="font-mono text-[#f4c98b]">AED {(annualRevenue / 1e6).toFixed(1)}M</span>
                </div>
                <input
                  type="number"
                  step="500000"
                  min="1000000"
                  value={annualRevenue}
                  onChange={(e) => setAnnualRevenue(parseFloat(e.target.value) || 1000000)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-[#c7964c] focus:outline-none"
                />
                <div className="mt-2 flex gap-2">
                  {[5e6, 12e6, 25e6, 60e6].map((v) => (
                    <button
                      key={v}
                      onClick={() => setAnnualRevenue(v)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                        annualRevenue === v
                          ? 'border-[#c7964c] bg-[#c7964c]/20 text-[#f4c98b]'
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {v / 1e6}M
                    </button>
                  ))}
                </div>
              </div>

              {/* Delivery Share */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Delivery Aggregator Share</span>
                  <span className="font-mono text-[#f4c98b]">{deliveryShare}%</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="90"
                  value={deliveryShare}
                  onChange={(e) => setDeliveryShare(parseInt(e.target.value) || 10)}
                  className="mt-2 w-full accent-[#c7964c]"
                />
                <span className="text-[10px] text-white/50">
                  Annual delivery sales volume: AED {(report.summary.deliveryRevenue / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Import Dependency */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Imported Food COGS Share</span>
                  <span className="font-mono text-[#f4c98b]">{importShare}%</span>
                </div>
                <input
                  type="range"
                  min="5"
                  max="80"
                  value={importShare}
                  onChange={(e) => setImportShare(parseInt(e.target.value) || 5)}
                  className="mt-2 w-full accent-[#c7964c]"
                />
                <span className="text-[10px] text-white/50">
                  Imported COGS subject to Red Sea customs risk: AED {(report.summary.importedCogs / 1e6).toFixed(2)}M
                </span>
              </div>

              {/* Cash Buffer */}
              <div>
                <div className="flex justify-between text-xs font-bold text-white">
                  <span>Current Liquid Cash Reserves</span>
                  <span className="font-mono text-[#f4c98b]">AED {cashBuffer.toLocaleString()}</span>
                </div>
                <input
                  type="number"
                  step="50000"
                  min="0"
                  value={cashBuffer}
                  onChange={(e) => setCashBuffer(parseFloat(e.target.value) || 0)}
                  className="mt-2 w-full rounded-lg border border-white/10 bg-black/40 px-3 py-2 font-mono text-sm text-white focus:border-[#c7964c] focus:outline-none"
                />
                <div className="mt-2 flex gap-2">
                  {[100000, 250000, 500000, 1000000].map((v) => (
                    <button
                      key={v}
                      onClick={() => setCashBuffer(v)}
                      className={`rounded border px-2 py-0.5 text-[10px] font-mono transition ${
                        cashBuffer === v
                          ? 'border-[#c7964c] bg-[#c7964c]/20 text-[#f4c98b]'
                          : 'border-white/10 text-white/50 hover:bg-white/5'
                      }`}
                    >
                      {v / 1e3}k
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results Column (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Top 4 KPI Cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Card 1: VaR-95 */}
            <div className="rounded-2xl border border-red-500/30 bg-red-950/15 p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-red-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <ShieldAlert className="h-4 w-4" />
                  VaR-95 Cash Loss
                </span>
                <span className="font-bold">95% Conf.</span>
              </div>
              <div className="mt-3 font-mono text-2xl font-black text-white sm:text-3xl">
                AED {report.ebitdaRisk.var95Loss.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-red-300/80">
                {report.ebitdaRisk.var95MarginPct}% EBITDA margin compression under correlated shock.
              </p>
            </div>

            {/* Card 2: CVaR-95 */}
            <div className="rounded-2xl border border-amber-500/30 bg-amber-950/15 p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-amber-400">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <TrendingDown className="h-4 w-4" />
                  CVaR-95 Expected Shortfall
                </span>
                <span className="font-bold">Tail Mean</span>
              </div>
              <div className="mt-3 font-mono text-2xl font-black text-white sm:text-3xl">
                AED {report.ebitdaRisk.cvar95Loss.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-amber-300/80">
                {report.ebitdaRisk.cvar95MarginPct}% tail average loss when breaches exceed VaR-95.
              </p>
            </div>

            {/* Card 3: Aggregator Deduction Leakage */}
            <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-5 shadow-lg">
              <div className="flex items-center justify-between text-xs font-mono text-[#f4c98b]">
                <span className="flex items-center gap-1.5 uppercase tracking-wider">
                  <Truck className="h-4 w-4" />
                  Aggregator Leakage
                </span>
                <span className="font-bold">4.2% Rate</span>
              </div>
              <div className="mt-3 font-mono text-2xl font-black text-white sm:text-3xl">
                AED {report.aggregator.leakage.toLocaleString()}
              </div>
              <p className="mt-1 text-xs text-emerald-400">
                AED {report.aggregator.recoverable.toLocaleString()} recoverable via automated 14-day dispute audit.
              </p>
            </div>

            {/* Card 4: 52-Week PDC Default Risk */}
            <div className={`rounded-2xl border p-5 shadow-lg ${
              report.liquidity.riskTier === 'CRITICAL'
                ? 'border-red-500/40 bg-red-950/20'
                : report.liquidity.riskTier === 'ELEVATED'
                ? 'border-amber-500/40 bg-amber-950/20'
                : 'border-emerald-500/30 bg-emerald-950/20'
            }`}>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 uppercase tracking-wider text-white/70">
                  <AlertTriangle className="h-4 w-4" />
                  PDC Default Hazard
                </span>
                <span className={`rounded px-2 py-0.5 text-[10px] font-black uppercase ${
                  report.liquidity.riskTier === 'CRITICAL'
                    ? 'bg-red-500 text-white'
                    : report.liquidity.riskTier === 'ELEVATED'
                    ? 'bg-amber-500 text-black'
                    : 'bg-emerald-500 text-black'
                }`}>
                  {report.liquidity.riskTier}
                </span>
              </div>
              <div className="mt-3 font-mono text-2xl font-black text-white sm:text-3xl">
                {report.liquidity.cashOutProb}%
              </div>
              <p className="mt-1 text-xs text-white/70">
                52-week probability of cheque bounce when aggregator holdback hits rent/WPS payroll.
              </p>
            </div>
          </div>

          {/* Correlated Driver Loss Attribution */}
          <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-6 shadow-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f4c98b]">
              Joint Risk Attribution
            </span>
            <h3 className="mt-1 text-lg font-bold text-white">
              Mean Correlated EBITDA Loss Breakdown
            </h3>

            <div className="mt-5 space-y-4">
              {[
                { label: 'Aggregator Commission & Promo Squeeze', val: report.ebitdaRisk.drivers.aggregator, color: 'bg-blue-500' },
                { label: 'Municipal Inspections (Balady / ADAFSA)', val: report.ebitdaRisk.drivers.municipal, color: 'bg-amber-500' },
                { label: 'Customs Shelf-Life Rejections & Spot Procurement', val: report.ebitdaRisk.drivers.customs, color: 'bg-red-500' },
                { label: 'Summer Chiller Mechanical Compressor Lockout', val: report.ebitdaRisk.drivers.chiller, color: 'bg-cyan-500' },
                { label: 'Qiwa Supervisory Saudization Wage Premium', val: report.ebitdaRisk.drivers.supervisory, color: 'bg-purple-500' },
              ].map((item, idx) => {
                const pct = Math.min(100, Math.round((item.val / totalMeanLoss) * 100));
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex justify-between text-xs text-white">
                      <span className="text-white/80">{item.label}</span>
                      <span className="font-mono text-[#f4c98b]">
                        AED {item.val.toLocaleString()} ({pct}%)
                      </span>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-white/5">
                      <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Working Capital Liquidity & Solvency Runway */}
          <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-6 shadow-xl">
            <span className="text-xs font-mono uppercase tracking-widest text-[#f4c98b]">
              52-Week Cash Flow Stress Test
            </span>
            <h3 className="mt-1 text-lg font-bold text-white">
              PDC Presentation & Remittance Timing Runway
            </h3>

            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-[10px] font-mono uppercase text-white/50">Max Projected Drawdown</span>
                <div className="mt-1 font-mono text-base font-bold text-white">
                  AED {report.liquidity.maxDrawdown.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-[10px] font-mono uppercase text-white/50">Recommended Buffer</span>
                <div className="mt-1 font-mono text-base font-bold text-[#f4c98b]">
                  AED {report.liquidity.recBuffer.toLocaleString()}
                </div>
              </div>
              <div className="rounded-xl border border-white/5 bg-black/30 p-3">
                <span className="text-[10px] font-mono uppercase text-white/50">Buffer Runway Delta</span>
                <div className={`mt-1 font-mono text-base font-bold ${
                  report.liquidity.bufferDelta < 0 ? 'text-red-400' : 'text-emerald-400'
                }`}>
                  {report.liquidity.bufferDelta < 0
                    ? `-AED ${Math.abs(report.liquidity.bufferDelta).toLocaleString()} (Deficit)`
                    : `+AED ${report.liquidity.bufferDelta.toLocaleString()} (Surplus)`}
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-xl border border-white/5 bg-white/[0.02] p-4 text-xs leading-relaxed text-white/70">
              {report.liquidity.diagnostic}
            </div>
          </div>
        </div>
      </div>

      {/* Strategic Game Theory Section */}
      <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-6 shadow-xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#f4c98b]">
          Algorithmic Platform Game Theory
        </span>
        <h3 className="mt-1 text-xl font-bold text-white">
          Responsive Litigation & Direct Channel Diversion Posture
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-white/80">
          {report.aggregator.posture}
        </p>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <span className="text-xs font-mono text-white/50">30% Native Direct Channel Diversion Target</span>
            <div className="mt-1 font-mono text-xl font-black text-emerald-400">
              AED {report.aggregator.diversionSavings.toLocaleString()} / year
            </div>
            <p className="mt-1 text-xs text-white/60">
              Net commission savings recovered by migrating repeat order volume to white-label digital ordering.
            </p>
          </div>
          <div className="rounded-xl border border-white/10 bg-black/30 p-4">
            <span className="text-xs font-mono text-white/50">Automated 14-Day Remittance Audit Potential</span>
            <div className="mt-1 font-mono text-xl font-black text-[#f4c98b]">
              AED {report.aggregator.recoverable.toLocaleString()} / year
            </div>
            <p className="mt-1 text-xs text-white/60">
              Recoverable non-delivery deductions and co-funded campaign slippage contested within contractual SLA.
            </p>
          </div>
        </div>
      </div>

      {/* Prioritized 30-Day Operational Action Plan */}
      <div className="rounded-2xl border border-[#2d2822] bg-[#14120e] p-6 shadow-xl">
        <span className="text-xs font-mono uppercase tracking-widest text-[#f4c98b]">
          Executive Action Framework
        </span>
        <h3 className="mt-1 text-xl font-bold text-white">
          Prioritized 30-Day Working Capital & Operational Directives
        </h3>

        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-[10px] font-mono uppercase tracking-wider text-white/50">
                <th className="pb-3 pr-4">Timeframe</th>
                <th className="pb-3 pr-4">Jurisdiction</th>
                <th className="pb-3 pr-4">Operational Directive</th>
                <th className="pb-3">Financial Protection</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {report.actionPlan.map((item) => (
                <tr key={item.priority} className="hover:bg-white/[0.02]">
                  <td className="py-3 pr-4 font-mono font-bold text-[#f4c98b] whitespace-nowrap">
                    {item.timeframe}
                  </td>
                  <td className="py-3 pr-4 whitespace-nowrap">
                    <span className="rounded bg-white/10 px-2 py-0.5 font-mono text-[10px] text-white">
                      {item.scope}
                    </span>
                  </td>
                  <td className="py-3 pr-4">
                    <div className="font-bold text-white">{item.lead}</div>
                    <div className="mt-0.5 text-white/70">{item.action}</div>
                  </td>
                  <td className="py-3 text-emerald-400">
                    {item.protection}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
