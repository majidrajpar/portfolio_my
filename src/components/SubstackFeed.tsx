/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import type { SubstackArticle } from '../types';

const FEATURED_ARTICLES: SubstackArticle[] = [
  {
    title: "AI Authorization Is Not AI Accountability",
    pubDate: "May 2026",
    link: "https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/",
    description: "Board approval of AI models does not solve organizational accountability for what automated algorithms decide in live production.",
    outlet: "The Audit Signal"
  },
  {
    title: "The CFO Is the Audit Independence Risk You're Not Managing",
    pubDate: "April 2026",
    link: "https://www.linkedin.com/in/majid-m-4b097118/details/publications/",
    description: "Why administrative CFO reporting relationships remain a structural independence risk even when governance charters imply otherwise.",
    outlet: "Executive Publication"
  },
  {
    title: "Keeping Risk Registers Relevant in High-Velocity Environments",
    pubDate: "March 2026",
    link: "https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/",
    description: "Why static annual risk registers drift from operational reality and how to rebuild them as continuous live intelligence instruments.",
    outlet: "The Audit Signal"
  }
];

export default function SubstackFeed() {
  const [articles, setArticles] = useState<SubstackArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setArticles(FEATURED_ARTICLES);
    setLoading(false);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3].map((n) => (
          <div key={n} className="glass-card animate-pulse rounded-[30px] p-7 flex flex-col h-[280px]">
            <div className="flex gap-3 mb-5">
              <div className="h-5 w-24 bg-slate-300 rounded-full"></div>
              <div className="h-5 w-16 bg-slate-200 rounded-full"></div>
            </div>
            <div className="h-6 bg-slate-300 rounded w-5/6 mb-4"></div>
            <div className="h-6 bg-slate-300 rounded w-2/3 mb-6"></div>
            <div className="h-4 bg-slate-200 rounded w-full mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-5/6 mb-3"></div>
            <div className="h-4 bg-slate-200 rounded w-4/5 mt-auto"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
      {articles.map((article, i) => (
        <a
          key={i}
          href={article.link}
          target="_blank"
          rel="noopener noreferrer"
          className="glass-card group flex h-full flex-col rounded-[28px] p-7 transition-all duration-300 hover:border-[#a33a21]/40"
        >
          <div className="flex flex-wrap items-center gap-3">
            <span className="rounded-full bg-[#a33a21]/8 px-3 py-1 text-[9px] font-black uppercase tracking-[0.24em] text-[#a33a21] transition-colors group-hover:bg-[#a33a21]/15">
              {article.outlet}
            </span>
            <span className="meta-label text-slate-400 text-[9px]">{article.pubDate}</span>
          </div>
          
          <h3 className="mt-5 text-lg font-black leading-tight text-[#181511] transition-colors group-hover:text-[#a33a21] md:text-xl">
            {article.title}
          </h3>
          
          <p className="mt-4 text-sm leading-7 text-[color:var(--text-secondary)] flex-1">
            {article.description}
          </p>
          
          <div className="mt-6 border-t border-[color:var(--line-soft)] pt-4 flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-[0.26em] text-[#1d3557] group-hover:text-[#a33a21] transition-colors">
              Read Article ↗
            </span>
            {error && (
              <span className="text-[8px] text-slate-400 font-bold uppercase tracking-widest">
                Static Archive
              </span>
            )}
          </div>
        </a>
      ))}
    </div>
  );
}
