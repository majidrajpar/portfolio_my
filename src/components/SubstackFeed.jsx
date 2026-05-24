import React, { useState, useEffect } from 'react';

const FALLBACK_ARTICLES = [
  {
    title: "The CFO Is the Audit Independence Risk You're Not Managing",
    pubDate: "March 2026",
    link: "https://majidmumtaz.substack.com/p/the-cfo-is-the-audit-independence",
    description: "Why the CFO relationship remains a structural independence risk even when governance charts imply otherwise.",
    outlet: "Substack"
  },
  {
    title: "AI Authorization Is Not AI Accountability",
    pubDate: "April 2026",
    link: "https://majidmumtaz.substack.com/p/ai-authorization-is-not-ai-accountability",
    description: "Board approval of AI does not solve accountability for what models decide in production.",
    outlet: "Substack"
  },
  {
    title: "Keeping Risk Registers Relevant",
    pubDate: "May 2026",
    link: "https://majidmumtaz.substack.com/p/keeping-risk-registers-relevant",
    description: "Why risk registers drift from operational reality and how to rebuild them as live intelligence rather than compliance artefacts.",
    outlet: "Substack"
  }
];

export default function SubstackFeed() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let active = true;

    async function fetchFeed() {
      try {
        // Fetch the Substack RSS feed
        // Using a public RSS-to-JSON converter to bypass CORS cleanly on client side
        const feedUrl = encodeURIComponent('https://majidmumtaz.substack.com/feed');
        const response = await fetch(`https://api.rss2json.com/v1/api.json?rss_url=${feedUrl}`);
        
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }

        const data = await response.json();
        
        if (data.status === 'ok' && data.items && data.items.length > 0) {
          const formatted = data.items.slice(0, 3).map(item => {
            // Clean up description HTML tags for preview
            let cleanDesc = item.description || '';
            cleanDesc = cleanDesc.replace(/<[^>]*>/g, ''); // strip HTML tags
            cleanDesc = cleanDesc.replace(/&nbsp;/g, ' ');
            if (cleanDesc.length > 160) {
              cleanDesc = cleanDesc.substring(0, 157) + '...';
            }

            // Format date nicely
            let formattedDate = '';
            try {
              const d = new Date(item.pubDate);
              const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
              formattedDate = `${months[d.getMonth()]} ${d.getFullYear()}`;
            } catch (e) {
              formattedDate = item.pubDate;
            }

            return {
              title: item.title,
              pubDate: formattedDate,
              link: item.link,
              description: cleanDesc,
              outlet: 'Substack: The Corporate Mercenary'
            };
          });

          if (active) {
            setArticles(formatted);
            setLoading(false);
          }
        } else {
          throw new Error('Invalid feed data structure');
        }
      } catch (err) {
        console.warn('Substack RSS fetch failed or blocked by CORS. Using structured fallback.', err);
        if (active) {
          setArticles(FALLBACK_ARTICLES);
          setError(true);
          setLoading(false);
        }
      }
    }

    fetchFeed();
    return () => {
      active = false;
    };
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
