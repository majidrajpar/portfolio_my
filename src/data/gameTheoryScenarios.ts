export interface ScenarioQuestion {
  id: string;
  label: string;
  hint: string;
  min: number;
  max: number;
  step?: number;
  default: number;
}

export interface GameScenario {
  id: string;
  label: string;
  icon: string;
  tag: string;
  description: string;
  bestFor: string;
  defaultPlayers: [string, string];
  defaultStrategies: {
    row: string[];
    col: string[];
  };
  questions: ScenarioQuestion[];
  generateMatrix: (params: Record<string, number>) => { matrixA: number[][]; matrixB: number[][] };
  interpret: (
    results: { pure_equilibria: any[]; mixed_strategies: any[] },
    players: [string, string],
    strategies: { row: string[]; col: string[] },
    params: Record<string, number>
  ) => string;
}

export const auditGameScenarios: GameScenario[] = [
  {
    id: 'ccm-deterrence',
    label: 'Continuous Telemetry vs. Evasion',
    icon: '🛡️',
    tag: 'Fraud Deterrence Dynamics',
    description: 'Simulate rational frontline behavior when choosing whether to bypass controls against manual sampling vs automated 100% monitoring.',
    bestFor: 'Internal Audit Strategy, Till Receipts, Expense Fraud, Recipe Yields',
    defaultPlayers: ['Operations / Rogue Actor', 'Internal Audit / GRC'],
    defaultStrategies: {
      row: ['Strict Compliance', 'Exploit Control Gap'],
      col: ['Sample Audits (Periodic)', '100% Continuous Monitoring (CCM)'],
    },
    questions: [
      {
        id: 'gain',
        label: 'Payoff from undetected leakage / fraud',
        hint: 'Expected financial or operational gain from exploiting the gap',
        min: 10, max: 100, step: 5, default: 50,
      },
      {
        id: 'penalty',
        label: 'Penalty / clawback if caught',
        hint: 'Severity of disciplinary, legal, or reputational sanction',
        min: 20, max: 200, step: 10, default: 100,
      },
      {
        id: 'ccm_cost',
        label: 'Cost of automated CCM infrastructure',
        hint: 'Resource cost to maintain 100% continuous data pipelines',
        min: 5, max: 40, step: 5, default: 15,
      },
    ],
    generateMatrix: ({ gain, penalty, ccm_cost }) => {
      // Row: Rogue actor (Compliance, Exploit)
      // Col: Internal Audit (Sample, CCM)
      // Compliance: Actor gets 0. Audit gets +10 (clean control) minus monitoring cost.
      // Exploit vs Sample: Actor has high prob of escape (net gain), Audit suffers undetected leak (-gain).
      // Exploit vs CCM: Actor detected with certainty (-penalty), Audit catches leak (+penalty - ccm_cost).
      return {
        matrixA: [
          [0, 0],
          [gain * 0.7, -penalty],
        ],
        matrixB: [
          [10, 10 - ccm_cost],
          [-gain, penalty * 0.5 - ccm_cost],
        ],
      };
    },
    interpret: (results, players, strategies, params) => {
      const pure = results.pure_equilibria;
      if (pure.length === 1 && pure[0].row_idx === 0 && pure[0].col_idx === 1) {
        return `Automated Continuous Monitoring achieves complete deterrence. Because detection is mathematically certain and the penalty outweighs the potential gain, the rational frontline strategy collapses to Strict Compliance.`;
      }
      if (pure.length === 1 && pure[0].row_idx === 1 && pure[0].col_idx === 0) {
        return `Catastrophic Audit Illusion: Under periodic sample testing, the mathematical probability of evading a 25-invoice sample is overwhelmingly high. Exploiting the gap is the strictly dominant strategy for the operator.`;
      }
      if (results.mixed_strategies.length > 0) {
        const ms = results.mixed_strategies[0];
        const auditCCMProb = (ms.col_probs[1] * 100).toFixed(1);
        const exploitProb = (ms.row_probs[1] * 100).toFixed(1);
        return `No stable pure equilibrium exists. The system enters an enforcement cycle: If audit tests intermittently, operators exploit (${exploitProb}% rate); to deter exploitation, audit must maintain at least a ${auditCCMProb}% coverage intensity.`;
      }
      return `Equilibrium reached at (${strategies.row[pure[0].row_idx]}, ${strategies.col[pure[0].col_idx]}).`;
    },
  },
  {
    id: 'quarter-end-revenue',
    label: 'Quarter-End Aggressive Cut-Off',
    icon: '📊',
    tag: 'EBITDA Defense',
    description: 'Model the tension between commercial pressure to pull forward revenue vs. substantive audit inspection.',
    bestFor: 'Revenue Recognition, Channel Stuffing, Aggregator Remittance',
    defaultPlayers: ['Commercial / Sales Finance', 'Finance Assurance / Audit'],
    defaultStrategies: {
      row: ['Conservative Cut-Off', 'Pull Forward Deals (Early Accrual)'],
      col: ['Analytical High-Level Review', 'Full Substantive Contract Audit'],
    },
    questions: [
      {
        id: 'bonus',
        label: 'Target attainment bonus / pressure payoff',
        hint: 'Incentive to bridge EBITDA shortfall before quarter close',
        min: 10, max: 100, step: 5, default: 40,
      },
      {
        id: 'restatement_cost',
        label: 'Restatement & adjustment penalty',
        hint: 'Executive exposure if audit forces audit adjustment',
        min: 20, max: 150, step: 10, default: 80,
      },
      {
        id: 'audit_effort',
        label: 'Audit substantive workload',
        hint: 'Resource drain to inspect 100% contracts & delivery notes',
        min: 5, max: 30, step: 5, default: 15,
      },
    ],
    generateMatrix: ({ bonus, restatement_cost, audit_effort }) => {
      return {
        matrixA: [
          [10, 10],
          [bonus, -restatement_cost],
        ],
        matrixB: [
          [20, 20 - audit_effort],
          [-bonus, 30 - audit_effort],
        ],
      };
    },
    interpret: (results, players, strategies, params) => {
      const pure = results.pure_equilibria;
      if (results.mixed_strategies.length > 0) {
        const ms = results.mixed_strategies[0];
        const auditEffortProb = (ms.col_probs[1] * 100).toFixed(1);
        return `Classic Cat-and-Mouse Game: When the audit team relies on analytical procedures, sales finance rationally pulls forward revenue. To suppress aggressive accruals, the assurance team must maintain a credible threat of deep substantive verification of at least ${auditEffortProb}%.`;
      }
      if (pure.length > 0) {
        return `The dynamic stabilizes at (${strategies.row[pure[0].row_idx]}, ${strategies.col[pure[0].col_idx]}).`;
      }
      return 'Complex interaction with multiple contingent outcomes.';
    },
  },
  {
    id: 'procurement-collusion',
    label: 'Vendor Selection & Related-Party Risk',
    icon: '🤝',
    tag: 'Third-Party Risk',
    description: 'Evaluate kickback vulnerability when selecting between competitive open tender vs favored intermediary vendors.',
    bestFor: 'Vendor Onboarding, ThirdEye Risk, Tender Governance',
    defaultPlayers: ['Procurement Lead', 'Third-Party Risk Scanner'],
    defaultStrategies: {
      row: ['Arm-Length RFP Tender', 'Award to Related Shell Vendor'],
      col: ['Spot Check Vendor Docs', 'Automated Ownership & Anomaly Scan'],
    },
    questions: [
      {
        id: 'bribe',
        label: 'Kickback / side-margin captured',
        hint: 'Private illicit benefit from selecting shell intermediary',
        min: 15, max: 120, step: 5, default: 60,
      },
      {
        id: 'blacklisting',
        label: 'Blacklisting & prosecution cost',
        hint: 'Loss of employment, legal prosecution, and clawback',
        min: 40, max: 250, step: 10, default: 120,
      },
      {
        id: 'scanner_cost',
        label: 'Continuous telemetry tooling cost',
        hint: 'Cost of automated vendor graph analysis',
        min: 5, max: 30, step: 5, default: 10,
      },
    ],
    generateMatrix: ({ bribe, blacklisting, scanner_cost }) => {
      return {
        matrixA: [
          [5, 5],
          [bribe * 0.8, -blacklisting],
        ],
        matrixB: [
          [10, 10 - scanner_cost],
          [-bribe, 40 - scanner_cost],
        ],
      };
    },
    interpret: (results, players, strategies, params) => {
      const pure = results.pure_equilibria;
      if (results.mixed_strategies.length > 0) {
        const ms = results.mixed_strategies[0];
        return `Without automated cross-entity registry scanning, human spot checks fail to deter shell company collusion. The scanner must be visibly active on at least ${(ms.col_probs[1] * 100).toFixed(1)}% of new onboarding cases to deter collusive routing.`;
      }
      if (pure.length > 0) {
        return `Outcome stabilizes at (${strategies.row[pure[0].row_idx]}, ${strategies.col[pure[0].col_idx]}).`;
      }
      return 'Bimatrix analysis complete.';
    },
  },
];
