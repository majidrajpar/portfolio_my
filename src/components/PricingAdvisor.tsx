import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Question {
  id: string;
  text: string;
  options: { label: string; value: string; next: string | null }[];
}

interface Recommendation {
  product: string;
  price: number;
  reason: string;
  roles: string[];
}

const questions: Record<string, Question> = {
  start: {
    id: 'start',
    text: 'What are you building with AI agents?',
    options: [
      { label: 'Internal audit or risk assessment system', value: 'audit', next: 'audit-scope' },
      { label: 'Creative writing or content generation', value: 'creative', next: 'creative-scope' },
      { label: 'Data analysis or business intelligence', value: 'data', next: 'data-scope' },
      { label: 'Governance or compliance framework', value: 'governance', next: 'governance-scope' },
      { label: 'Multiple use cases across domains', value: 'multiple', next: 'multiple-check' },
      { label: 'Just exploring / learning', value: 'explore', next: null },
    ],
  },
  'audit-scope': {
    id: 'audit-scope',
    text: 'How many audit roles do you need?',
    options: [
      { label: 'Just one specific role', value: 'one', next: 'budget-individual' },
      { label: 'A complete audit team (6 roles)', value: 'team', next: 'budget-audit' },
    ],
  },
  'creative-scope': {
    id: 'creative-scope',
    text: 'What type of creative work?',
    options: [
      { label: 'Book writing and editing', value: 'book', next: 'budget-book' },
      { label: 'Storytelling and world-building', value: 'story', next: 'budget-creative' },
      { label: 'Philosophy and ethics analysis', value: 'philosophy', next: 'budget-philosophy' },
    ],
  },
  'data-scope': {
    id: 'data-scope',
    text: 'What is your data analysis focus?',
    options: [
      { label: 'General data science and BI', value: 'general', next: 'budget-data' },
      { label: 'Risk modeling and quantification', value: 'risk', next: 'budget-risk' },
    ],
  },
  'governance-scope': {
    id: 'governance-scope',
    text: 'What governance area?',
    options: [
      { label: 'Board and audit committee support', value: 'board', next: 'budget-governance' },
      { label: 'Data governance and ethics', value: 'data-gov', next: 'budget-governance' },
      { label: 'Enterprise-wide governance', value: 'enterprise', next: 'budget-multiple' },
    ],
  },
  'multiple-check': {
    id: 'multiple-check',
    text: 'Are these for a team or organization?',
    options: [
      { label: 'Personal / freelance use', value: 'personal', next: 'budget-complete' },
      { label: 'Team or enterprise deployment', value: 'team', next: 'budget-enterprise' },
    ],
  },
  'budget-individual': {
    id: 'budget-individual',
    text: 'Budget preference?',
    options: [
      { label: 'Minimize cost — just what I need', value: 'min', next: null },
      { label: 'Future-proofing — might need more later', value: 'future', next: null },
    ],
  },
  'budget-audit': {
    id: 'budget-audit',
    text: 'Budget preference?',
    options: [
      { label: 'Domain pack only ($34/mo)', value: 'pack', next: null },
      { label: 'Complete library for cross-domain work ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-book': {
    id: 'budget-book',
    text: 'Budget preference?',
    options: [
      { label: 'Book Writing Pack ($19/mo)', value: 'pack', next: null },
      { label: 'Complete library for variety ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-creative': {
    id: 'budget-creative',
    text: 'Budget preference?',
    options: [
      { label: 'Creative Writing Pack ($34/mo)', value: 'pack', next: null },
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-philosophy': {
    id: 'budget-philosophy',
    text: 'Budget preference?',
    options: [
      { label: 'Philosophy Pack ($24/mo)', value: 'pack', next: null },
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-data': {
    id: 'budget-data',
    text: 'Budget preference?',
    options: [
      { label: 'Data Analysis Pack ($29/mo)', value: 'pack', next: null },
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-risk': {
    id: 'budget-risk',
    text: 'Budget preference?',
    options: [
      { label: 'Risk Pack ($29/mo)', value: 'pack', next: null },
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-governance': {
    id: 'budget-governance',
    text: 'Budget preference?',
    options: [
      { label: 'Governance Pack ($19/mo)', value: 'pack', next: null },
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
    ],
  },
  'budget-multiple': {
    id: 'budget-multiple',
    text: 'Budget preference?',
    options: [
      { label: 'Complete library ($79/mo)', value: 'complete', next: null },
      { label: 'Enterprise license for team ($149/mo)', value: 'enterprise', next: null },
    ],
  },
  'budget-complete': {
    id: 'budget-complete',
    text: 'How do you prefer to buy?',
    options: [
      { label: 'Start small, upgrade later', value: 'small', next: null },
      { label: 'Everything at once (best value)', value: 'complete', next: null },
    ],
  },
  'budget-enterprise': {
    id: 'budget-enterprise',
    text: 'Team size?',
    options: [
      { label: 'Small team (2-10 people)', value: 'small-team', next: null },
      { label: 'Organization (10+ people)', value: 'org', next: null },
    ],
  },
};

const recommendations: Record<string, Recommendation> = {
  'audit-one-min': {
    product: 'Individual Role',
    price: 9,
    reason: 'You only need one specific audit role. Start with the individual tier — you can always upgrade to the Audit Pack later.',
    roles: ['Lead Internal Auditor', 'IT Auditor', 'Forensic Auditor', 'Compliance Auditor', 'Audit Report Writer', 'Board Liaison'],
  },
  'audit-one-future': {
    product: 'Audit Pack',
    price: 34,
    reason: 'Since you might expand, the Audit Pack gives you all 6 audit roles at a 37% discount vs subscribing individually.',
    roles: ['Lead Internal Auditor', 'IT Auditor', 'Forensic Auditor', 'Compliance Auditor', 'Audit Report Writer', 'Board Liaison'],
  },
  'audit-team-pack': {
    product: 'Audit Pack',
    price: 34,
    reason: 'Perfect — the Audit Pack includes all 6 audit roles with framework overlays for CrewAI, LangChain, and LangGraph.',
    roles: ['Lead Internal Auditor', 'IT Auditor', 'Forensic Auditor', 'Compliance Auditor', 'Audit Report Writer', 'Board Liaison'],
  },
  'audit-team-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For cross-domain audit work, the Complete Library gives you all 31 roles across 7 domains — including risk, governance, and data analysis roles that complement audit workflows.',
    roles: ['All 31 roles across Audit, Risk, Governance, and Data Analysis'],
  },
  'creative-book-pack': {
    product: 'Book Writing Pack',
    price: 19,
    reason: 'The Book Writing Pack covers project management, editing, and policy drafting — everything you need for book production.',
    roles: ['Book Project Manager', 'Copy Editor/Proofreader', 'Policy Drafter'],
  },
  'creative-book-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For variety across genres and formats, the Complete Library includes creative writing, book production, and philosophy roles.',
    roles: ['Book Project Manager', 'Copy Editor/Proofreader', 'Policy Drafter', 'Ghostwriter', 'Character Developer', 'World Builder', 'Dialogue Specialist', 'Narrative Architect', 'Developmental Editor'],
  },
  'creative-story-pack': {
    product: 'Creative Writing Pack',
    price: 34,
    reason: 'The Creative Writing Pack includes all 6 storytelling roles — from character development to world-building.',
    roles: ['Ghostwriter', 'Character Developer', 'World Builder', 'Dialogue Specialist', 'Narrative Architect', 'Developmental Editor'],
  },
  'creative-story-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For diverse creative projects, the Complete Library adds book production and philosophy roles to your storytelling toolkit.',
    roles: ['Ghostwriter', 'Character Developer', 'World Builder', 'Dialogue Specialist', 'Narrative Architect', 'Developmental Editor', 'Book Project Manager', 'Copy Editor/Proofreader', 'Policy Drafter'],
  },
  'creative-philosophy-pack': {
    product: 'Philosophy Pack',
    price: 24,
    reason: 'The Philosophy Pack includes ethics, epistemology, logic, and history of philosophy roles.',
    roles: ['Ethics Advisor', 'Epistemology Reviewer', 'Logic & Argumentation Analyst', 'History of Philosophy Scholar'],
  },
  'creative-philosophy-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For deep philosophical analysis in creative work, the Complete Library adds storytelling and book production roles.',
    roles: ['Ethics Advisor', 'Epistemology Reviewer', 'Logic & Argumentation Analyst', 'History of Philosophy Scholar', 'Ghostwriter', 'Character Developer', 'World Builder', 'Dialogue Specialist', 'Narrative Architect', 'Developmental Editor'],
  },
  'data-general-pack': {
    product: 'Data Analysis Pack',
    price: 29,
    reason: 'The Data Analysis Pack includes data science, BI, storytelling, and statistical review roles.',
    roles: ['Data Scientist', 'BI Analyst', 'Data Storyteller', 'Statistical Reviewer'],
  },
  'data-general-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For comprehensive data operations, add risk modeling and governance roles from the Complete Library.',
    roles: ['Data Scientist', 'BI Analyst', 'Data Storyteller', 'Statistical Reviewer', 'Enterprise Risk Strategist', 'Credit Risk Analyst', 'Market Risk Quant', 'Operational Risk Manager', 'Scenario Modeler'],
  },
  'data-risk-pack': {
    product: 'Risk Pack',
    price: 29,
    reason: 'The Risk Pack includes enterprise risk, credit risk, market risk, operational risk, and scenario modeling roles.',
    roles: ['Enterprise Risk Strategist', 'Credit Risk Analyst', 'Market Risk Quant', 'Operational Risk Manager', 'Scenario Modeler'],
  },
  'data-risk-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For integrated risk and data operations, the Complete Library combines risk modeling with data analysis and governance roles.',
    roles: ['Enterprise Risk Strategist', 'Credit Risk Analyst', 'Market Risk Quant', 'Operational Risk Manager', 'Scenario Modeler', 'Data Scientist', 'BI Analyst', 'Data Storyteller', 'Statistical Reviewer'],
  },
  'governance-board-pack': {
    product: 'Governance Pack',
    price: 19,
    reason: 'The Governance Pack includes governance analysis, data governance, and ethics/culture advisory roles.',
    roles: ['Governance Analyst', 'Data Governance Specialist', 'Ethics & Culture Advisor'],
  },
  'governance-board-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For board-level governance, add audit and risk roles from the Complete Library for a complete governance toolkit.',
    roles: ['Governance Analyst', 'Data Governance Specialist', 'Ethics & Culture Advisor', 'Lead Internal Auditor', 'IT Auditor', 'Forensic Auditor', 'Enterprise Risk Strategist', 'Credit Risk Analyst'],
  },
  'governance-data-gov-pack': {
    product: 'Governance Pack',
    price: 19,
    reason: 'The Governance Pack includes data governance, governance analysis, and ethics advisory roles.',
    roles: ['Governance Analyst', 'Data Governance Specialist', 'Ethics & Culture Advisor'],
  },
  'governance-data-gov-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For enterprise data governance, add risk and audit roles for a comprehensive governance framework.',
    roles: ['Governance Analyst', 'Data Governance Specialist', 'Ethics & Culture Advisor', 'Lead Internal Auditor', 'IT Auditor', 'Enterprise Risk Strategist', 'Credit Risk Analyst'],
  },
  'governance-enterprise-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'For enterprise-wide governance, you need roles across audit, risk, and governance domains.',
    roles: ['All 31 roles across Audit, Risk, Governance, and Data Analysis'],
  },
  'governance-enterprise-enterprise': {
    product: 'Enterprise License',
    price: 149,
    reason: 'For enterprise-wide deployment with multiple teams, the Enterprise License includes redistribution rights and continuous updates.',
    roles: ['All 31 roles + custom development + priority support'],
  },
  'multiple-personal-small': {
    product: 'Individual Role',
    price: 9,
    reason: 'Start with one role that matches your immediate need. Upgrade to a bundle subscription anytime you need more roles.',
    roles: ['Any single role of your choice'],
  },
  'multiple-personal-complete': {
    product: 'Complete Library',
    price: 79,
    reason: 'Best value for personal multi-domain projects. All 31 roles for the price of 9 individual subscriptions.',
    roles: ['All 31 roles across 7 domains'],
  },
  'multiple-team-small-team': {
    product: 'Complete Library',
    price: 79,
    reason: 'For small teams working across domains, the Complete Library gives everyone access to all 31 roles.',
    roles: ['All 31 roles across 7 domains'],
  },
  'multiple-team-org': {
    product: 'Enterprise License',
    price: 149,
    reason: 'For organizations with 10+ people, the Enterprise License includes internal redistribution rights, continuous updates, and priority support.',
    roles: ['All 31 roles + redistribution rights + custom role development'],
  },
  explore: {
    product: 'Free Starter Roles',
    price: 0,
    reason: 'Perfect for exploring. Download the free core + 3 starter roles. Upgrade to paid packs when you find a use case.',
    roles: ['Research Assistant', 'Code Reviewer', 'Data Analyst Starter'],
  },
};

function getRecommendationKey(answers: Record<string, string>): string {
  const useCase = answers.start;
  const scope = Object.entries(answers).find(([k]) => k.includes('scope'))?.[1] || '';
  const budget = Object.entries(answers).find(([k]) => k.includes('budget'))?.[1] || '';
  
  if (useCase === 'explore') return 'explore';
  if (useCase === 'multiple') return `multiple-${scope || 'personal'}-${budget || 'complete'}`;
  
  const domain = useCase;
  const specific = scope;
  
  if (domain === 'audit') {
    if (specific === 'one') return `audit-one-${budget}`;
    return `audit-team-${budget}`;
  }
  if (domain === 'creative') {
    return `creative-${specific}-${budget}`;
  }
  if (domain === 'data') {
    return `data-${specific}-${budget}`;
  }
  if (domain === 'governance') {
    return `governance-${specific}-${budget}`;
  }
  
  return 'explore';
}

export default function PricingAdvisor() {
  const [currentQuestion, setCurrentQuestion] = useState('start');
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [history, setHistory] = useState<string[]>([]);
  const [recommendation, setRecommendation] = useState<Recommendation | null>(null);

  const question = questions[currentQuestion];

  const handleAnswer = (value: string, next: string | null) => {
    const newAnswers = { ...answers, [currentQuestion]: value };
    setAnswers(newAnswers);
    
    if (next) {
      setHistory([...history, currentQuestion]);
      setCurrentQuestion(next);
    } else {
      const key = getRecommendationKey(newAnswers);
      setRecommendation(recommendations[key] || recommendations.explore);
    }
  };

  const handleBack = () => {
    if (history.length > 0) {
      const newHistory = [...history];
      const prev = newHistory.pop()!;
      setHistory(newHistory);
      setCurrentQuestion(prev);
      const newAnswers = { ...answers };
      delete newAnswers[prev];
      setAnswers(newAnswers);
      setRecommendation(null);
    }
  };

  const handleRestart = () => {
    setCurrentQuestion('start');
    setAnswers({});
    setHistory([]);
    setRecommendation(null);
  };

  return (
    <div className="w-full max-w-xl">
      <AnimatePresence mode="wait">
        {!recommendation ? (
          <motion.div
            key={currentQuestion}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="rounded-[24px] border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl md:p-8"
          >
            <div className="mb-6 flex items-center justify-between">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f4c98b]">
                Question {history.length + 1} of ~3
              </span>
              {history.length > 0 && (
                <button
                  onClick={handleBack}
                  className="text-xs text-white/50 transition-colors hover:text-white"
                >
                  ← Back
                </button>
              )}
            </div>

            <h3 className="text-xl font-black text-white md:text-2xl">{question.text}</h3>

            <div className="mt-6 space-y-3">
              {question.options.map((option) => (
                <button
                  key={option.value}
                  onClick={() => handleAnswer(option.value, option.next)}
                  className="w-full rounded-xl border border-white/10 bg-white/[0.04] p-4 text-left transition-all duration-200 hover:border-[#f4c98b]/40 hover:bg-white/[0.08]"
                >
                  <span className="text-sm font-semibold text-white">{option.label}</span>
                </button>
              ))}
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="recommendation"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4 }}
            className="rounded-[24px] border border-[#f4c98b]/30 bg-[#f4c98b]/10 p-6 backdrop-blur-xl md:p-8"
          >
            <div className="mb-4 inline-flex rounded-full bg-[#f4c98b] px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.2em] text-[#181511]">
              Recommended
            </div>

            <h3 className="text-2xl font-black text-white md:text-3xl">{recommendation.product}</h3>
            
            <div className="mt-3 flex items-baseline gap-2">
              <span className="text-3xl font-black text-[#f4c98b]">
                {recommendation.price === 0 ? 'Free' : `$${recommendation.price}`}
              </span>
              {recommendation.price > 0 && (
                <span className="text-sm text-white/50">/mo</span>
              )}
            </div>

            <p className="mt-4 text-sm leading-7 text-white/80">{recommendation.reason}</p>

            <div className="mt-6 rounded-xl border border-white/10 bg-white/[0.04] p-4">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#f4c98b]">What's included:</span>
              <ul className="mt-3 space-y-2">
                {recommendation.roles.map((role) => (
                  <li key={role} className="flex items-start gap-2 text-sm text-white/70">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#f4c98b]"></span>
                    {role}
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a
                href="#pricing"
                className="inline-flex items-center justify-center rounded-full bg-[#f4c98b] px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-[#181511] transition-colors hover:bg-white md:text-[11px]"
              >
                View Pricing
                <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </a>
              <button
                onClick={handleRestart}
                className="inline-flex items-center justify-center rounded-full border border-white/20 px-6 py-3 text-[10px] font-black uppercase tracking-[0.2em] text-white transition-colors hover:border-white/40 md:text-[11px]"
              >
                Start Over
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
