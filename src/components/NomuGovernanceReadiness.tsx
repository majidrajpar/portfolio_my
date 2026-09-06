import { useState } from 'react';

interface Question {
  id: string;
  pillarId: string;
  text: string;
  regulatoryRef: string;
  weight: number;
}

interface Pillar {
  id: string;
  name: string;
  shortName: string;
  questions: Question[];
}

const PILLARS: Pillar[] = [
  {
    id: 'board',
    name: 'Pillar I: Board Structure & Governance Mandate',
    shortName: 'Board & Mandate',
    questions: [
      {
        id: 'q1',
        pillarId: 'board',
        text: 'Is there a strict separation between Board Chairman and CEO/Managing Director, with at least two independent directors (or one-third of the board) and a formal Board of Directors Charter?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 12 & 20) & New Saudi Companies Law (Art. 68)',
        weight: 10
      },
      {
        id: 'q2',
        pillarId: 'board',
        text: 'Does the Board convene at least four documented meetings annually with formal minutes, structured agenda tracking, and an approved Delegation of Authority (DOA) matrix?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 30 & 32)',
        weight: 10
      }
    ]
  },
  {
    id: 'audit_committee',
    name: 'Pillar II: Audit Committee Independence & Oversight',
    shortName: 'Audit Committee',
    questions: [
      {
        id: 'q3',
        pillarId: 'audit_committee',
        text: 'Is the Audit Committee formed by the General Assembly/Board with at least 3 non-executive members, chaired by an Independent Director, with at least one designated specialist in finance and accounting?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 54) & Nomu Listing Guidelines',
        weight: 10
      },
      {
        id: 'q4',
        pillarId: 'audit_committee',
        text: 'Is there a formally adopted Audit Committee Charter granting direct oversight of the external auditor appointment, internal audit plan approval, and pre-Board sign-off on interim and annual financial statements?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 55 & 56)',
        weight: 10
      }
    ]
  },
  {
    id: 'internal_controls',
    name: 'Pillar III: Internal Audit & ICOFR Framework',
    shortName: 'Internal Audit & ICOFR',
    questions: [
      {
        id: 'q5',
        pillarId: 'internal_controls',
        text: 'Does an active, dedicated Internal Audit function exist (in-house or outsourced to a licensed KSA audit firm) reporting functionally directly to the Audit Committee with unrestricted access?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 76 & 77)',
        weight: 10
      },
      {
        id: 'q6',
        pillarId: 'internal_controls',
        text: 'Has the company documented its Internal Control Over Financial Reporting (ICOFR) with formalized standard operating procedures and segregation of duties across revenue, procurement, and treasury cycles?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 73 & 74)',
        weight: 10
      }
    ]
  },
  {
    id: 'related_parties',
    name: 'Pillar IV: Related Party Transactions & Conflict of Interest',
    shortName: 'Related Parties & Conflict',
    questions: [
      {
        id: 'q7',
        pillarId: 'related_parties',
        text: 'Is there a formal Board-approved Policy on Conflict of Interest and Related Party Transactions, supported by an up-to-date registry of declared interests for all board members and senior executives?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 42 & 43) & Saudi Companies Law (Art. 71)',
        weight: 10
      },
      {
        id: 'q8',
        pillarId: 'related_parties',
        text: 'Is there a verified pre-approval protocol requiring all contracts or transactions with related parties to receive prior Audit Committee review and annual Ordinary General Assembly (OGA) authorization?',
        regulatoryRef: 'Saudi Companies Law (Art. 71 & 72) & CMA Listing Rules',
        weight: 10
      }
    ]
  },
  {
    id: 'transparency',
    name: 'Pillar V: Disclosure, Whistleblowing & Investor Protection',
    shortName: 'Disclosure & Compliance',
    questions: [
      {
        id: 'q9',
        pillarId: 'transparency',
        text: 'Has a confidential Whistleblower and reporting mechanism been instituted allowing employees and third parties to report irregularities directly to the Audit Committee with strict non-retaliation protections?',
        regulatoryRef: 'CMA Corporate Governance Regulations (Art. 84)',
        weight: 10
      },
      {
        id: 'q10',
        pillarId: 'transparency',
        text: 'Are there documented insider trading restrictions (blackout period tracking registry), a clear dividend distribution policy, and an Investor Relations (IR) regulatory disclosure protocol for Tadawul announcements?',
        regulatoryRef: 'CMA Rules on the Offer of Securities & Continuing Obligations (OSCO)',
        weight: 10
      }
    ]
  }
];

const REMEDIATION_MAP: Record<string, { priority: 'Urgent' | 'High' | 'Medium'; action: string; reference: string }> = {
  q1: {
    priority: 'Urgent',
    action: 'Amend Articles of Association (AoA) and Board Charter to explicitly separate Chairman and CEO offices. Recruit independent directors to meet the one-third/minimum 2 independent member quota prior to CMA prospectus filing.',
    reference: 'CMA Regs Art. 12, 20 & Companies Law Art. 68'
  },
  q2: {
    priority: 'High',
    action: 'Establish an annual Board calendar with at least 4 mandatory meetings. Formalize a comprehensive Delegation of Authority (DOA) matrix separating Board, Executive Committee, and CEO financial authorization ceilings.',
    reference: 'CMA Regs Art. 30, 32'
  },
  q3: {
    priority: 'Urgent',
    action: 'Reconstitute the Audit Committee via General Assembly resolution: remove any executive directors, appoint an independent chair, and verify at least one member possesses certified financial/accounting qualifications (CPA/SOCPA/ACCA).',
    reference: 'CMA Regs Art. 54'
  },
  q4: {
    priority: 'High',
    action: 'Draft and adopt an Audit Committee Charter defining mandatory quarterly financial statement reviews, independent auditor recommendation rights, and internal audit plan sign-off authority.',
    reference: 'CMA Regs Art. 55, 56'
  },
  q5: {
    priority: 'Urgent',
    action: 'Establish an independent Internal Audit Department or retain an authorized licensed audit advisory firm. Issue an Internal Audit Charter confirming direct reporting to the Audit Committee.',
    reference: 'CMA Regs Art. 76, 77'
  },
  q6: {
    priority: 'High',
    action: 'Execute an ICOFR design-and-effectiveness review. Document SOPs and segregation of duties matrices across key transaction cycles (revenue recognition, procurement approval, and bank mandate controls).',
    reference: 'CMA Regs Art. 73, 74'
  },
  q7: {
    priority: 'Urgent',
    action: 'Implement a comprehensive Conflict of Interest Policy. Mandate annual written disclosures from all directors and executive officers, maintaining a central register of related parties and business affiliations.',
    reference: 'CMA Regs Art. 42 & Companies Law Art. 71'
  },
  q8: {
    priority: 'Urgent',
    action: 'Institute a pre-transaction review workflow routing all related-party commercial arrangements through the Audit Committee, with formal annual ordinary general assembly approvals tabled before prospectus publication.',
    reference: 'Companies Law Art. 71, 72'
  },
  q9: {
    priority: 'Medium',
    action: 'Adopt a formal Whistleblower Policy with a secure, confidential intake channel (dedicated email/independent hotline) routed directly to the Audit Committee Chairman.',
    reference: 'CMA Regs Art. 84'
  },
  q10: {
    priority: 'Medium',
    action: 'Establish an Insider Trading register defining blackout windows before financial results, adopt a Board-approved Dividend Policy, and designate a certified Investor Relations spokesperson.',
    reference: 'CMA OSCO Rules & Tadawul Disclosure Requirements'
  }
};

interface PillarScore {
  name: string;
  shortName: string;
  percentage: number;
  score: number;
  max: number;
}

export default function NomuGovernanceReadiness() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [companyName, setCompanyName] = useState<string>('');
  const [step, setStep] = useState<number>(0); // 0: Start, 1: Questions, 2: Results
  const [activePillarIndex, setActivePillarIndex] = useState<number>(0);
  const [copied, setCopied] = useState<boolean>(false);

  const allQuestions = PILLARS.flatMap(p => p.questions.map(q => ({ ...q, pillarName: p.name, pillarShortName: p.shortName })));

  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const currentPillar = PILLARS[activePillarIndex];

  const isPillarComplete = (pillar: Pillar) => {
    return pillar.questions.every(q => answers[q.id] !== undefined);
  };

  const canMoveForward = isPillarComplete(currentPillar);

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const pillarScores: Record<string, PillarScore> = {};

    PILLARS.forEach(p => {
      let pScore = 0;
      let pMax = 0;
      p.questions.forEach(q => {
        const val = answers[q.id] || 0;
        pScore += val;
        pMax += 10;
      });
      pillarScores[p.id] = {
        name: p.name,
        shortName: p.shortName,
        percentage: Math.round((pScore / pMax) * 100),
        score: pScore,
        max: pMax
      };
      totalScore += pScore;
      maxScore += pMax;
    });

    const overallPercentage = Math.round((totalScore / maxScore) * 100);

    let classification = '';
    let colorClass = '';
    let badgeBorder = '';
    let executiveSummary = '';

    if (overallPercentage >= 85) {
      classification = 'CMA Nomu Listing Ready (Listing Grade)';
      colorClass = 'text-[#059669] bg-[#059669]/10 border-[#059669]/30';
      badgeBorder = 'border-[#059669]';
      executiveSummary = 'Your governance architecture meets the fundamental regulatory requirements of the Saudi Capital Market Authority (CMA) Corporate Governance Regulations and the new Companies Law for Nomu listing. Prospectus review friction related to internal controls and board oversight will be minimal.';
    } else if (overallPercentage >= 60) {
      classification = 'Conditional Readiness (Targeted Remediation Required)';
      colorClass = 'text-[#c7964c] bg-[#c7964c]/10 border-[#c7964c]/30';
      badgeBorder = 'border-[#c7964c]';
      executiveSummary = 'Baseline corporate and board mechanisms exist, but material non-compliance in Audit Committee independence, internal control formalization (ICOFR), or related-party transaction pre-approvals will trigger severe requisitions from the CMA and Financial Advisors during prospectus due diligence.';
    } else {
      classification = 'Major Regulatory Friction (Pre-IPO Blocker)';
      colorClass = 'text-[#a33a21] bg-[#a33a21]/10 border-[#a33a21]/30';
      badgeBorder = 'border-[#a33a21]';
      executiveSummary = 'Critical structural gaps exist across core board independence, internal audit mandate, and conflict of interest protocols. Under current conditions, CMA registration and Nomu listing approval would face severe delays or rejection. Immediate pre-IPO remediation is essential before appointing lead advisors.';
    }

    const gaps = allQuestions
      .filter(q => (answers[q.id] || 0) < 10)
      .map(q => ({
        ...q,
        answerValue: answers[q.id] || 0,
        remediation: REMEDIATION_MAP[q.id]
      }))
      .sort((a, b) => {
        const order = { Urgent: 0, High: 1, Medium: 2 };
        return order[a.remediation.priority] - order[b.remediation.priority];
      });

    return {
      overallPercentage,
      totalScore,
      maxScore,
      classification,
      colorClass,
      badgeBorder,
      executiveSummary,
      pillarScores,
      gaps
    };
  };

  const results = step === 2 ? calculateResults() : null;

  const exportCSV = () => {
    if (!results) return;
    const date = new Date().toISOString().split('T')[0];
    const targetEntity = companyName.trim() || 'Candidate Enterprise';

    const headers = ['Pillar', 'Question ID', 'Assessment Item', 'Regulatory Reference', 'Score (Max 10)', 'Status', 'Priority', 'Actionable Gap Remediation'];
    const rows = allQuestions.map(q => {
      const val = answers[q.id] || 0;
      const status = val === 10 ? 'Fully Implemented' : val === 5 ? 'Partially Implemented' : 'Unimplemented';
      const rem = REMEDIATION_MAP[q.id];
      return [
        `"${q.pillarShortName}"`,
        `"${q.id.toUpperCase()}"`,
        `"${q.text.replace(/"/g, '""')}"`,
        `"${q.regulatoryRef.replace(/"/g, '""')}"`,
        val,
        `"${status}"`,
        `"${rem ? rem.priority : 'Compliant'}"`,
        `"${rem ? rem.action.replace(/"/g, '""') : 'Maintain ongoing compliance'}"`
      ].join(',');
    });

    const summaryHeader = [
      `"TADAWUL NOMU PRE-IPO GOVERNANCE READINESS EVALUATION"`,
      `"Entity: ${targetEntity.replace(/"/g, '""')}"`,
      `"Evaluation Date: ${date}"`,
      `"Overall Readiness Score: ${results.overallPercentage}% (${results.totalScore}/${results.maxScore})"`,
      `"Listing Classification: ${results.classification}"`,
      `"Executive Summary: ${results.executiveSummary.replace(/"/g, '""')}"`,
      ''
    ].join('\n');

    const csvContent = summaryHeader + '\n' + headers.join(',') + '\n' + rows.join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Nomu_Governance_Readiness_${targetEntity.replace(/\s+/g, '_')}_${date}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const copyMarkdownSummary = () => {
    if (!results) return;
    const targetEntity = companyName.trim() || 'Candidate Enterprise';
    const date = new Date().toISOString().split('T')[0];

    let md = `# TADAWUL NOMU PRE-IPO GOVERNANCE READINESS BRIEFING\n\n`;
    md += `**Evaluated Entity:** ${targetEntity}\n`;
    md += `**Assessment Date:** ${date}\n`;
    md += `**Overall Governance Readiness Index:** ${results.overallPercentage}% (${results.classification})\n\n`;
    md += `## Executive Summary\n${results.executiveSummary}\n\n`;
    md += `## Pillar Scores\n`;
    Object.values(results.pillarScores).forEach(p => {
      md += `- **${p.shortName}:** ${p.percentage}% (${p.score}/${p.max})\n`;
    });
    md += `\n## Priority Gap Remediation Actions\n`;
    if (results.gaps.length === 0) {
      md += `*No critical governance deficiencies identified. Maintain current board and control standards.*\n`;
    } else {
      results.gaps.forEach((g, i) => {
        md += `${i + 1}. **[${g.remediation.priority}]** ${g.text}\n`;
        md += `   - *Regulatory Reference:* ${g.regulatoryRef}\n`;
        md += `   - *Remediation Action:* ${g.remediation.action}\n\n`;
      });
    }

    navigator.clipboard.writeText(md).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  return (
    <div className="mx-auto max-w-5xl">

      {/* 0. START VIEW */}
      {step === 0 && (
        <div className="soft-shell max-w-2xl mx-auto p-8 md:p-10 text-center">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#c7964c]/30 bg-[#c7964c]/10 px-3.5 py-1 text-[10px] font-black uppercase tracking-[0.24em] text-[#a66c1c] mb-6">
            KSA CMA & Nomu Governance Standard
          </div>
          <h2 className="text-3xl font-black text-[#181511] tracking-tight md:text-4xl">
            Tadawul Nomu Pre-IPO Readiness Diagnostic
          </h2>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
            A structured, 10-point diagnostic assessing company readiness against the <strong>Saudi Capital Market Authority (CMA) Corporate Governance Regulations</strong>, the <strong>New Saudi Companies Law</strong>, and <strong>Tadawul Nomu Listing Rules</strong>.
          </p>

          <div className="mt-6 text-left">
            <label className="meta-label block text-slate-500 mb-2">Target Candidate Entity (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Al-Fursan Health Group / Tech Logistics Co."
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-[#181511] placeholder-slate-400 focus:border-[#a33a21] focus:outline-none transition-colors"
            />
          </div>

          <div className="mt-8 border-t border-[color:var(--line-soft)] pt-6">
            <div className="mb-6 grid grid-cols-2 sm:grid-cols-3 gap-3 text-left">
              <div className="rounded-xl border border-slate-100 bg-white/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Pillars</span>
                <p className="text-sm font-black text-[#181511]">5 Core Domains</p>
              </div>
              <div className="rounded-xl border border-slate-100 bg-white/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Benchmark</span>
                <p className="text-sm font-black text-[#181511]">CMA / Tadawul</p>
              </div>
              <div className="col-span-2 sm:col-span-1 rounded-xl border border-slate-100 bg-white/70 p-3">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Privacy</span>
                <p className="text-sm font-black text-[#181511]">100% On-Device</p>
              </div>
            </div>

            <button
              onClick={() => setStep(1)}
              className="btn-primary w-full sm:w-auto px-8 py-3 text-center inline-flex items-center justify-center gap-2"
            >
              Begin Nomu Readiness Diagnostic
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* 1. QUESTIONS VIEW */}
      {step === 1 && (
        <div className="grid gap-6 md:grid-cols-[280px_1fr]">
          {/* Pillar Progress Sidebar */}
          <div className="soft-shell h-fit p-5 space-y-2">
            <span className="meta-label block text-slate-400 mb-3">CMA Regulatory Pillars</span>
            {PILLARS.map((p, idx) => {
              const active = idx === activePillarIndex;
              const complete = isPillarComplete(p);
              return (
                <button
                  key={p.id}
                  disabled={idx > activePillarIndex && !isPillarComplete(PILLARS[idx - 1])}
                  onClick={() => setActivePillarIndex(idx)}
                  className={`w-full text-left rounded-xl px-4 py-3 text-[11px] font-black uppercase tracking-wider border transition-all ${
                    active
                      ? 'border-[#a33a21] bg-[#a33a21]/5 text-[#181511]'
                      : complete
                      ? 'border-[#059669]/25 bg-[#059669]/5 text-[#059669]'
                      : 'border-slate-100 text-slate-400 hover:text-slate-600 bg-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="truncate">{p.shortName}</span>
                    {complete ? (
                      <span className="text-[9px] font-black text-[#059669]">✓</span>
                    ) : (
                      <span className="text-[9px] font-mono text-slate-300">0/2</span>
                    )}
                  </div>
                </button>
              );
            })}

            <div className="pt-4 mt-4 border-t border-slate-100">
              <span className="text-[10px] text-slate-400 font-mono block mb-1">
                Completed: {Object.keys(answers).length} / 10 items
              </span>
              <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#c7964c] transition-all duration-300"
                  style={{ width: `${(Object.keys(answers).length / 10) * 100}%` }}
                />
              </div>
            </div>
          </div>

          {/* Active Questions Panel */}
          <div className="soft-shell p-6 md:p-8 flex flex-col justify-between min-h-[440px]">
            <div>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-4">
                <span className="eyebrow-label text-[#a33a21]">{currentPillar.name}</span>
                <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">
                  Pillar {activePillarIndex + 1} of 5
                </span>
              </div>
              <div className="border-t border-[color:var(--line-soft)] mb-6"></div>

              <div className="space-y-6">
                {currentPillar.questions.map((q, qIdx) => (
                  <div key={q.id} className="rounded-2xl border border-slate-200/80 bg-white/75 p-5 md:p-6 shadow-sm">
                    <div className="flex items-start justify-between gap-3 mb-2">
                      <span className="inline-flex rounded bg-slate-100 px-2 py-0.5 text-[10px] font-black uppercase tracking-widest text-slate-700">
                        Item {activePillarIndex * 2 + qIdx + 1}
                      </span>
                      <span className="text-[10px] font-mono text-slate-400 italic text-right max-w-[50%] truncate">
                        {q.regulatoryRef}
                      </span>
                    </div>

                    <p className="text-[14px] md:text-[15px] font-bold text-[#181511] leading-relaxed mb-4">
                      {q.text}
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { label: 'Fully Implemented', sub: 'Documented & Approved', val: 10 },
                        { label: 'Partially Implemented', sub: 'Informal or In-Progress', val: 5 },
                        { label: 'Unimplemented', sub: 'Deficiency / No Framework', val: 0 }
                      ].map(opt => {
                        const selected = answers[q.id] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            onClick={() => handleAnswer(q.id, opt.val)}
                            className={`rounded-xl py-2.5 px-3 text-left border transition-all ${
                              selected
                                ? 'bg-[#181512] border-[#181512] text-white shadow-sm'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white'
                            }`}
                          >
                            <span className={`block text-[11px] font-black uppercase tracking-wider ${selected ? 'text-[#f4c98b]' : 'text-[#181511]'}`}>
                              {opt.label}
                            </span>
                            <span className={`block text-[9px] mt-0.5 ${selected ? 'text-white/70' : 'text-slate-400'}`}>
                              {opt.sub}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Bar */}
            <div className="mt-8 pt-6 border-t border-[color:var(--line-soft)] flex items-center justify-between gap-4">
              <button
                disabled={activePillarIndex === 0}
                onClick={() => setActivePillarIndex(prev => prev - 1)}
                className="px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 disabled:opacity-30 disabled:hover:text-slate-500 transition-colors"
              >
                ← Previous Pillar
              </button>

              {activePillarIndex < PILLARS.length - 1 ? (
                <button
                  disabled={!canMoveForward}
                  onClick={() => setActivePillarIndex(prev => prev + 1)}
                  className="btn-primary px-6 py-2.5 text-[11px] font-black uppercase tracking-wider disabled:opacity-40"
                >
                  Next Pillar →
                </button>
              ) : (
                <button
                  disabled={!canMoveForward}
                  onClick={() => setStep(2)}
                  className="btn-primary px-7 py-2.5 text-[11px] font-black uppercase tracking-wider disabled:opacity-40 bg-[#059669] hover:bg-[#047857]"
                >
                  View Readiness Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. RESULTS VIEW */}
      {step === 2 && results && (
        <div className="space-y-8">
          {/* Executive Summary Card */}
          <div className="soft-shell p-8 md:p-10">
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
              <div className="flex-1">
                <span className="eyebrow-label text-[#a33a21]">CMA Nomu Readiness Rating</span>
                <h3 className="mt-2 text-2xl md:text-3xl font-black text-[#181511] tracking-tight">
                  {companyName.trim() ? companyName.trim() : 'Pre-IPO Candidate Enterprise'}
                </h3>
                <div className="mt-3 inline-flex items-center gap-2">
                  <span className={`inline-flex rounded-full border px-3 py-1 text-[11px] font-black uppercase tracking-widest ${results.colorClass}`}>
                    {results.classification}
                  </span>
                </div>
                <p className="mt-5 text-sm md:text-[15px] leading-7 text-[color:var(--text-secondary)]">
                  {results.executiveSummary}
                </p>
              </div>

              {/* Gauge Plinth */}
              <div className="stat-plinth flex flex-col items-center justify-center p-6 sm:min-w-[180px] text-center border-[#c7964c]/20">
                <span className="meta-label text-slate-400">Readiness Score</span>
                <span className="mt-2 text-5xl font-black text-[#181511] font-mono">
                  {results.overallPercentage}%
                </span>
                <span className="mt-1 text-[11px] font-bold text-slate-500 uppercase tracking-widest">
                  {results.totalScore} / {results.maxScore} Pts
                </span>
              </div>
            </div>

            {/* Pillar Breakdown Grid */}
            <div className="mt-8 pt-8 border-t border-[color:var(--line-soft)]">
              <span className="meta-label block text-slate-400 mb-4">Readiness by Governance Pillar</span>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
                {Object.values(results.pillarScores).map(p => {
                  const scoreColor = p.percentage >= 80 ? 'text-[#059669]' : p.percentage >= 50 ? 'text-[#c7964c]' : 'text-[#a33a21]';
                  const barColor = p.percentage >= 80 ? 'bg-[#059669]' : p.percentage >= 50 ? 'bg-[#c7964c]' : 'bg-[#a33a21]';
                  return (
                    <div key={p.name} className="rounded-xl border border-slate-100 bg-white/70 p-4 flex flex-col justify-between">
                      <div>
                        <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                          {p.shortName}
                        </span>
                        <div className="flex items-baseline justify-between mb-2">
                          <span className={`text-xl font-black font-mono ${scoreColor}`}>
                            {p.percentage}%
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">
                            {p.score}/{p.max}
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-1 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${barColor}`} style={{ width: `${p.percentage}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Action Bar */}
            <div className="mt-8 pt-6 border-t border-[color:var(--line-soft)] flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={exportCSV}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-800 hover:border-[#181511] transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 text-[#a33a21]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export Diagnostic Brief (CSV)
                </button>
                <button
                  onClick={copyMarkdownSummary}
                  className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-[11px] font-black uppercase tracking-wider text-slate-800 hover:border-[#181511] transition-colors inline-flex items-center gap-2"
                >
                  <svg className="w-3.5 h-3.5 text-[#c7964c]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                  </svg>
                  {copied ? 'Copied to Clipboard!' : 'Copy Executive Memo'}
                </button>
              </div>

              <button
                onClick={() => {
                  setStep(1);
                  setActivePillarIndex(0);
                }}
                className="text-[11px] font-black uppercase tracking-wider text-slate-500 hover:text-slate-900 transition-colors"
              >
                ← Adjust Diagnostic Inputs
              </button>
            </div>
          </div>

          {/* Priority CMA Remediation Roadmap */}
          <div className="soft-shell p-8 md:p-10">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <span className="eyebrow-label text-[#a33a21]">Remediation Action Plan</span>
                <h4 className="mt-1 text-2xl font-black text-[#181511] tracking-tight">
                  Required Pre-IPO Governance Upgrades
                </h4>
              </div>
              <span className="text-[11px] font-mono text-slate-400">
                {results.gaps.length} Action Items Identified
              </span>
            </div>

            {results.gaps.length === 0 ? (
              <div className="rounded-2xl border border-[#059669]/20 bg-[#059669]/5 p-6 text-center">
                <span className="text-[#059669] font-black text-sm uppercase tracking-wider block">
                  100% Full Compliance Verified
                </span>
                <p className="text-xs text-slate-600 mt-1">
                  All 10 CMA and Tadawul Nomu governance criteria are fully implemented and documented.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {results.gaps.map((g, idx) => {
                  const priorityBg =
                    g.remediation.priority === 'Urgent'
                      ? 'bg-[#a33a21]/10 text-[#a33a21] border-[#a33a21]/30'
                      : g.remediation.priority === 'High'
                      ? 'bg-[#c7964c]/10 text-[#a66c1c] border-[#c7964c]/30'
                      : 'bg-slate-100 text-slate-700 border-slate-200';

                  return (
                    <div
                      key={g.id}
                      className="rounded-2xl border border-slate-200/80 bg-white/70 p-5 transition-all hover:bg-white"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`inline-flex rounded-full border px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${priorityBg}`}>
                            {g.remediation.priority} Priority
                          </span>
                          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                            {g.pillarShortName}
                          </span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-400">
                          {g.remediation.reference}
                        </span>
                      </div>

                      <p className="text-sm font-bold text-[#181511] mb-2">
                        {g.text}
                      </p>

                      <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3.5 mt-3">
                        <span className="text-[10px] font-black uppercase tracking-widest text-[#a33a21] block mb-1">
                          Mandatory Remediation Action:
                        </span>
                        <p className="text-xs leading-relaxed text-slate-700 font-medium">
                          {g.remediation.action}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
