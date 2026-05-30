import { useState } from 'react';

interface Question {
  id: string;
  text: string;
  weight: number;
}

interface Domain {
  id: string;
  name: string;
  questions: Question[];
}

const DOMAINS: Domain[] = [
  {
    id: 'ethics',
    name: "Domain I: Purpose & Ethics",
    questions: [
      { id: 'q1', text: "Does the Internal Audit Charter explicitly define absolute independence, unrestricted access to records, and alignment with the new 2024 Global IIA Standards?", weight: 10 },
      { id: 'q2', text: "Is there an active, board-approved Code of Ethics and conflict-of-interest reporting framework that is regularly audited?", weight: 10 }
    ]
  },
  {
    id: 'governance',
    name: "Domain II: Board Governance",
    questions: [
      { id: 'q3', text: "Does the CAE report functionally 100% directly to the Audit Committee, with the AC responsible for hiring, firing, and budget approvals?", weight: 10 },
      { id: 'q4', text: "Does the Audit Committee hold regular, structured private sessions with the CAE without management present to discuss sensitive concerns?", weight: 10 }
    ]
  },
  {
    id: 'management',
    name: "Domain III: Management Alignment",
    questions: [
      { id: 'q5', text: "Is the annual audit plan strictly risk-based, mapped against strategic enterprise objectives, and dynamically updated quarterly rather than static?", weight: 10 },
      { id: 'q6', text: "Is there a structured, automated system for tracking and reporting management's remediation velocity on open audit findings to the Board?", weight: 10 }
    ]
  },
  {
    id: 'practice',
    name: "Domain IV: Professional Practice",
    questions: [
      { id: 'q7', text: "Does the audit team utilize advanced data analytics, forensic scripting, or full-population transaction testing rather than legacy manual sampling?", weight: 10 },
      { id: 'q8', text: "Does the audit scope comprehensively cover critical IT General Controls (ITGCs), cybersecurity, third-party vendor risks, and ESG readiness?", weight: 10 }
    ]
  },
  {
    id: 'quality',
    name: "Domain V: Quality Assurance",
    questions: [
      { id: 'q9', text: "Is there a formal Quality Assurance and Improvement Program (QAIP) including ongoing internal reviews of audit files and deliverables?", weight: 10 },
      { id: 'q10', text: "Has the Internal Audit function undergone a formal, independent External Quality Assessment (EQA) within the last 5 years with a 'Conforms' rating?", weight: 10 }
    ]
  }
];

const RECOMMENDATIONS: Record<string, string> = {
  q1: "Revise the Internal Audit Charter to align with the new 2024 IIA Global Standards, clearly declaring direct reporting to the Audit Committee.",
  q2: "Establish robust, documented annual conflict-of-interest certifications for all internal audit practitioners and key financial leaders.",
  q3: "Formalize a Board resolution confirming the Audit Committee's sole authority over the CAE's appraisal, compensation, and dismissal.",
  q4: "Amend the Audit Committee charter to mandate a private session with the CAE at every quarterly meeting to secure safe-disclosure lines.",
  q5: "Modernize your risk assessment methodology; replace annual risk registers with dynamic, quarterly rolling audit plans.",
  q6: "Deploy a centralized findings tracker dashboard with automated escalation alerts for overdue management action items.",
  q7: "Transition from manual sampling to full-population testing by integrating Python-based analytics and continuous transaction monitoring.",
  q8: "Incorporate specialized cybersecurity audits and vendor bank-detail drift checks into the active annual audit plan.",
  q9: "Implement a formal QAIP checklist to be signed off by an independent supervisor/manager on every completed audit file.",
  q10: "Schedule a formal External Quality Assessment (EQA) to achieve certified compliance and validate audit quality."
};

interface DomainScore {
  name: string;
  percentage: number;
  score: number;
  max: number;
}

export default function IIAStandardsDiagnostic() {
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [step, setStep] = useState(0); // 0: Start, 1: Questions, 2: Report
  const [activeDomainIndex, setActiveDomainIndex] = useState(0);

  const allQuestions = DOMAINS.flatMap(d => d.questions.map(q => ({ ...q, domainId: d.id, domainName: d.name })));
  
  const handleAnswer = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const currentDomain = DOMAINS[activeDomainIndex];
  
  const isDomainComplete = (domain: Domain) => {
    return domain.questions.every(q => answers[q.id] !== undefined);
  };

  const canMoveForward = isDomainComplete(currentDomain);

  const calculateResults = () => {
    let totalScore = 0;
    let maxScore = 0;
    const domainScores: Record<string, DomainScore> = {};

    DOMAINS.forEach(d => {
      let dScore = 0;
      let dMax = 0;
      d.questions.forEach(q => {
        const val = answers[q.id] || 0;
        dScore += val;
        dMax += 10;
      });
      domainScores[d.id] = {
        name: d.name,
        percentage: (dScore / dMax) * 100,
        score: dScore,
        max: dMax
      };
      totalScore += dScore;
      maxScore += dMax;
    });

    const overallPercentage = (totalScore / maxScore) * 100;
    
    let classification = "";
    let colorClass = "";
    let desc = "";

    if (overallPercentage >= 85) {
      classification = "Board-Grade Optimized (Fully Compliant)";
      colorClass = "text-[#10b981] bg-[#10b981]/10 border-[#10b981]/30";
      desc = "Your Internal Audit function exhibits exemplary governance structures, strong functional Board reporting, and progressive technological adoption. Ready for the 2025 standard enforcement.";
    } else if (overallPercentage >= 60) {
      classification = "Structured Operational (Partial Gaps)";
      colorClass = "text-[#c7964c] bg-[#c7964c]/10 border-[#c7964c]/30";
      desc = "The baseline structure is solid, but critical gaps exist in technology integration, reporting independence, or formal quality checks. Targeted remediation is required before 2025.";
    } else {
      classification = "Legacy Compliance (High Governance Risk)";
      colorClass = "text-[#a33a21] bg-[#a33a21]/10 border-[#a33a21]/30";
      desc = "Significant gaps in Board-level independence, legacy manual sampling, or lack of EQA compliance. Your audit function risks acting as a legacy cost center rather than a board-facing assurance asset.";
    }

    const gaps = allQuestions.filter(q => answers[q.id] < 10).map(q => ({
      ...q,
      answerValue: answers[q.id],
      recommendation: RECOMMENDATIONS[q.id]
    }));

    return {
      overallPercentage: roundToTwo(overallPercentage),
      classification,
      colorClass,
      desc,
      domainScores,
      gaps
    };
  };

  const roundToTwo = (num: number) => Math.round((num + Number.EPSILON) * 100) / 100;

  return (
    <div className="mx-auto max-w-4xl">
      
      {/* 0. START VIEW */}
      {step === 0 && (
        <div className="soft-shell p-8 text-center max-w-2xl mx-auto">
          <span className="eyebrow-label">Governance Assessment</span>
          <h3 className="mt-4 text-2xl text-[#181511]">Evaluate against the 2024 Global IIA Standards.</h3>
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)]">
            The new IIA Global Internal Audit Standards go live in <strong>January 2025</strong>. This interactive diagnostic measures your audit department's readiness across five core domains, delivering an immediate board-grade maturity rating and gap analysis.
          </p>
          <div className="luxury-divider mt-6 mb-8"></div>
          <button onClick={() => setStep(1)} className="btn-primary">
            Start Readiness Diagnostic
          </button>
        </div>
      )}

      {/* 1. QUESTIONS VIEW */}
      {step === 1 && (
        <div className="grid gap-6 md:grid-cols-[260px_1fr]">
          {/* Sidebar Navigation */}
          <div className="soft-shell p-5 h-fit space-y-2">
            <span className="meta-label text-slate-400 block mb-4">Diagnostic Domains</span>
            {DOMAINS.map((domain, index) => {
              const active = index === activeDomainIndex;
              const complete = isDomainComplete(domain);
              return (
                <button
                  key={domain.id}
                  disabled={index > activeDomainIndex && !isDomainComplete(DOMAINS[index - 1])}
                  onClick={() => setActiveDomainIndex(index)}
                  className={`w-full text-left rounded-xl px-4 py-3 text-[10px] font-black uppercase tracking-wider border transition-all ${
                    active
                      ? 'border-[#a33a21] bg-[#a33a21]/5 text-[#181511]'
                      : complete
                      ? 'border-[#10b981]/20 bg-[#10b981]/5 text-[#10b981]'
                      : 'border-slate-100 text-slate-400 hover:text-slate-600 bg-white/40'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{domain.id.toUpperCase()}</span>
                    {complete && <span className="text-[8px] font-black">✓</span>}
                  </div>
                </button>
              );
            })}
          </div>

          {/* Active Questions Panel */}
          <div className="soft-shell p-6 md:p-8 flex flex-col justify-between min-h-[360px]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className="eyebrow-label text-[#a33a21]">{currentDomain.name}</span>
                <span className="text-[10px] font-bold text-slate-400">Step {activeDomainIndex + 1} of 5</span>
              </div>
              <div className="luxury-divider mb-6"></div>

              <div className="space-y-6">
                {currentDomain.questions.map((q) => (
                  <div key={q.id} className="bg-white/60 border border-slate-100 rounded-2xl p-5">
                    <p className="text-sm font-semibold text-[#181511] leading-relaxed mb-4">{q.text}</p>
                    <div className="flex flex-col gap-2 sm:flex-row">
                      {[
                        { label: "Yes, fully implemented", val: 10 },
                        { label: "Partially implemented", val: 5 },
                        { label: "No, not implemented", val: 0 }
                      ].map((opt) => {
                        const selected = answers[q.id] === opt.val;
                        return (
                          <button
                            key={opt.val}
                            onClick={() => handleAnswer(q.id, opt.val)}
                            className={`flex-1 rounded-xl py-2 px-3 text-[10px] font-bold uppercase tracking-wider border text-center transition-all ${
                              selected
                                ? 'bg-[#181512] border-[#181512] text-[#f4c98b] font-extrabold'
                                : 'border-slate-200 hover:border-slate-300 text-slate-600 bg-white'
                            }`}
                          >
                            {opt.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-8 pt-6 border-t border-slate-200 flex justify-between gap-4">
              <button
                disabled={activeDomainIndex === 0}
                onClick={() => setActiveDomainIndex(prev => prev - 1)}
                className="btn-secondary !py-2.5 disabled:opacity-40"
              >
                Previous
              </button>
              
              {activeDomainIndex < 4 ? (
                <button
                  disabled={!canMoveForward}
                  onClick={() => setActiveDomainIndex(prev => prev + 1)}
                  className="btn-primary !py-2.5 disabled:opacity-50"
                >
                  Next Domain
                </button>
              ) : (
                <button
                  disabled={!canMoveForward}
                  onClick={() => setStep(2)}
                  className="btn-primary !py-2.5 bg-gradient-to-r from-[#10b981] to-[#047857] text-white disabled:opacity-50"
                >
                  Generate Report
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. REPORT VIEW */}
      {(() => {
        if (step !== 2) return null;
        const res = calculateResults();
        return (
          <div className="space-y-6">
            
            {/* Overall Score Banner */}
            <div className="editorial-panel p-6 md:p-8 text-white">
              <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
                <div>
                  <span className="hero-chip bg-white/10 border-white/15">Maturity Rating Report</span>
                  <div className={`mt-4 inline-block border rounded-full px-4 py-1 text-[10px] font-black uppercase tracking-[0.2em] ${res.colorClass}`}>
                    {res.classification}
                  </div>
                  <p className="mt-4 text-sm leading-7 text-white/76 max-w-xl">
                    {res.desc}
                  </p>
                </div>
                <div className="text-center shrink-0 md:border-l md:border-white/10 md:pl-10">
                  <div className="text-[10px] font-black uppercase tracking-[0.24em] text-white/40">Overall Compliance</div>
                  <strong className="text-5xl font-black text-[#f4c98b] tracking-tighter mt-1 block">
                    {res.overallPercentage}%
                  </strong>
                  <span className="text-[9px] uppercase tracking-widest text-slate-400 font-bold block mt-1">
                    scored against 2024 standard
                  </span>
                </div>
              </div>
            </div>

            {/* Domain Breakdown Table */}
            <div className="soft-shell p-6 md:p-8">
              <span className="meta-label text-[#a33a21]">Domain-by-Domain Metrics</span>
              <div className="mt-6 space-y-4">
                {DOMAINS.map(d => {
                  const scoreObj = res.domainScores[d.id];
                  return (
                    <div key={d.id} className="bg-white/60 border border-slate-100 rounded-2xl p-4 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                      <div className="max-w-md">
                        <strong className="text-sm text-[#181511] font-bold block">{scoreObj.name}</strong>
                        <span className="text-[9px] font-bold text-slate-400 block mt-1">Score: {scoreObj.score} / {scoreObj.max}</span>
                      </div>
                      <div className="flex items-center gap-4 shrink-0">
                        <div className="w-32 bg-slate-200 h-2 rounded-full overflow-hidden">
                          <div 
                            className={`h-full rounded-full ${scoreObj.percentage >= 85 ? 'bg-[#10b981]' : scoreObj.percentage >= 50 ? 'bg-[#c7964c]' : 'bg-[#a33a21]'}`}
                            style={{ width: `${scoreObj.percentage}%` }}
                          ></div>
                        </div>
                        <span className="text-xs font-black text-[#181511] w-12 text-right">{scoreObj.percentage}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Gap Analysis / Actions */}
            <div className="soft-shell p-6 md:p-8">
              <span className="meta-label text-[#a33a21]">Identified Gaps & Remediation Roadmap</span>
              <h4 className="text-xl text-[#181511] mt-3">Targeted action items for board alignment.</h4>
              
              {res.gaps.length > 0 ? (
                <div className="mt-6 space-y-4">
                  {res.gaps.map((gap, idx) => (
                    <div key={gap.id} className="relative border-l border-[color:var(--line-soft)] pl-6 md:pl-8">
                      <div className="absolute left-[-5px] top-1.5 h-2.5 w-2.5 rounded-full bg-[#a33a21] shadow-[0_0_0_4px_rgba(255,250,244,0.9)]"></div>
                      <div className="text-[9px] font-black uppercase tracking-widest text-[#a33a21]">Gap {idx + 1}: {gap.domainName}</div>
                      <p className="text-xs font-semibold text-slate-700 leading-relaxed mt-2 italic">"{gap.text}"</p>
                      <div className="bg-white/80 border border-slate-100 rounded-xl px-4 py-3 text-[11px] leading-5 text-slate-600 mt-3">
                        <strong className="text-[#1d3557] font-bold">Remediation Action:</strong> {gap.recommendation}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white/60 border border-[#10b981]/20 rounded-2xl p-6 mt-6 text-center">
                  <div className="text-2xl text-[#10b981] font-black">✓ 100% READINESS CONFIRMED</div>
                  <p className="text-xs text-slate-600 leading-relaxed mt-3">Your internal audit department displays total compliance across all 5 domains of the 2024 standards. Excellent governance posture.</p>
                </div>
              )}
            </div>

            {/* Contact CTA */}
            <div className="soft-shell p-6 md:p-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between border border-[#c7964c]/20 bg-gradient-to-r from-white/50 to-transparent">
              <div>
                <div className="meta-label text-[#a33a21]">Need an EQA or Charter Alignment?</div>
                <h4 className="text-lg text-[#181511] font-bold mt-2">Bring your audit function up to 2025 standard.</h4>
                <p className="text-xs text-slate-600 leading-5 mt-2">I advise boards, family offices, and CAEs on EQA audits, team restructuring, and 100% population continuous monitoring setups.</p>
              </div>
              <a href="/portfolio_my/contact/" className="btn-primary shrink-0 self-start sm:self-auto">
                Schedule Advisory
              </a>
            </div>

            <div className="flex justify-center gap-4 mt-6">
              <button onClick={() => setStep(1)} className="btn-secondary">
                Restart Diagnostic
              </button>
            </div>
            
          </div>
        );
      })()}

    </div>
  );
}
