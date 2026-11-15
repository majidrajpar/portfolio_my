import React, { useMemo, useState } from 'react';
import { LIBRARY_TABS, libraryItems } from '../data/library.js';

export default function LibraryWorkbench() {
  const [activeTab, setActiveTab] = useState('all');
  const [query, setQuery] = useState('');

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: libraryItems.length };
    for (const item of libraryItems) {
      map[item.tab] = (map[item.tab] || 0) + 1;
    }
    return map;
  }, []);

  const filteredItems = useMemo(() => {
    const q = query.trim().toLowerCase();
    return libraryItems.filter((item) => {
      const matchesTab = activeTab === 'all' || item.tab === activeTab;
      if (!matchesTab) return false;
      if (!q) return true;
      return (
        item.title.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q) ||
        item.domain.toLowerCase().includes(q) ||
        item.format.toLowerCase().includes(q)
      );
    });
  }, [activeTab, query]);

  return (
    <div className="space-y-6">
      {/* Controls Bar: Tabs + Search */}
      <div className="flex flex-col gap-4 border-b border-slate-200 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist" aria-label="Library categories">
          {LIBRARY_TABS.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveTab(tab.id)}
                className={`inline-flex items-center gap-2 rounded-md px-3.5 py-2 text-xs font-medium transition-colors ${
                  isActive
                    ? 'bg-slate-900 text-white border border-slate-900'
                    : 'bg-white text-slate-600 border border-slate-200 hover:text-slate-900 hover:border-slate-300'
                }`}
              >
                <span>{tab.label}</span>
                <span className={`rounded px-1.5 py-0.5 text-[10px] ${isActive ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-600'}`}>
                  {counts[tab.id] || 0}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-72">
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter by title, domain, or format..."
            className="w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-900 placeholder-slate-400 focus:border-slate-400 focus:outline-none focus:ring-1 focus:ring-slate-400"
          />
        </div>
      </div>

      {/* Results Grid */}
      {filteredItems.length === 0 ? (
        <div className="rounded-lg border border-slate-200 bg-white p-10 text-center">
          <p className="text-sm text-slate-600">No items match "{query}".</p>
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setActiveTab('all');
            }}
            className="mt-3 text-xs font-medium text-slate-900 underline hover:text-slate-600"
          >
            Reset filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredItems.map((item) => {
            const cardContent = (
              <>
                <div>
                  <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-medium uppercase tracking-wider text-slate-500">
                      {item.domain}
                    </span>
                    <span className="rounded border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                      {item.format}
                    </span>
                  </div>
                  <h2 className="text-base font-semibold text-slate-900 group-hover:text-slate-700 transition-colors">
                    {item.title}
                  </h2>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 flex items-center justify-end border-t border-slate-100 pt-3 text-xs">
                  {item.noLink ? (
                    <span className="text-slate-400">Architecture Showcase</span>
                  ) : (
                    <span className="font-medium text-slate-700 group-hover:text-slate-900 transition-colors">
                      {item.external ? 'Open ↗' : 'Open →'}
                    </span>
                  )}
                </div>
              </>
            );

            if (item.noLink) {
              return (
                <div
                  key={item.id}
                  className="flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5"
                >
                  {cardContent}
                </div>
              );
            }

            return (
              <a
                key={item.id}
                href={item.href}
                target={item.external ? '_blank' : undefined}
                rel={item.external ? 'noopener noreferrer' : undefined}
                className="group flex flex-col justify-between rounded-lg border border-slate-200 bg-white p-5 transition-all hover:border-slate-400 hover:shadow-sm"
              >
                {cardContent}
              </a>
            );
          })}
        </div>
      )}
    </div>
  );
}
