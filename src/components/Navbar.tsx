import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface ShelfItem {
  label: string;
  desc: string;
  href: string;
  external?: boolean;
}

const Navbar = ({ initialPath = '' }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [shelfOpen, setShelfOpen] = useState(false);
  const [mobileShelfOpen, setMobileShelfOpen] = useState(false);
  const shelfRef = useRef<HTMLDivElement>(null);
  const shelfTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const baseUrl = import.meta.env.BASE_URL;
  const isCurrent = (href: string) => currentPath === href || currentPath === href.replace(/\/$/, '');

  const shelfItems: ShelfItem[] = [
    { label: 'Builds', desc: 'Custom software & prototypes', href: `${baseUrl}software/` },
    { label: 'ERM & CCM Suite', desc: '18-file continuous monitoring programme', href: `${baseUrl}erm-ccm-suite/` },
    { label: 'RoleForge', desc: 'Agentic audit triage benchmark trace', href: `${baseUrl}roleforge/` },
    { label: 'Books', desc: 'Governance publications & monographs', href: `${baseUrl}about/#books` },
    {
      label: 'The Audit Signal',
      desc: 'LinkedIn assurance newsletter',
      href: 'https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/',
      external: true,
    },
    {
      label: 'Author Storefronts',
      desc: 'Commercial models on Gumroad, Eloquens, Flevy & eFinancialModels',
      href: 'https://majidmumtaz.gumroad.com',
      external: true,
    },
  ];

  const isShelfActive = shelfItems.some((item) => !item.external && isCurrent(item.href));

  useEffect(() => {
    const syncPath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('popstate', syncPath);
    document.addEventListener('astro:page-load', syncPath);

    syncPath();
    return () => {
      window.removeEventListener('popstate', syncPath);
      document.removeEventListener('astro:page-load', syncPath);
    };
  }, []);

  // Close menus on click-outside and Escape key
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (shelfRef.current && !shelfRef.current.contains(e.target as Node)) {
        setShelfOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShelfOpen(false);
        setMobileOpen(false);
      }
    };
    const handlePopState = () => {
      setMobileOpen(false);
      setShelfOpen(false);
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('popstate', handlePopState);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('popstate', handlePopState);
    };
  }, []);

  const isHoveredRef = useRef(false);

  const handleShelfMouseEnter = () => {
    isHoveredRef.current = true;
    if (shelfTimeoutRef.current) clearTimeout(shelfTimeoutRef.current);
    setShelfOpen(true);
  };

  const handleShelfMouseLeave = () => {
    isHoveredRef.current = false;
    shelfTimeoutRef.current = setTimeout(() => {
      setShelfOpen(false);
    }, 200);
  };

  const handleShelfButtonClick = () => {
    if (!shelfOpen) {
      setShelfOpen(true);
    } else if (!isHoveredRef.current) {
      setShelfOpen(false);
    }
  };

  const navItems = [
    { label: 'Case Studies', href: `${baseUrl}projects/` },
    { label: 'Tools', href: `${baseUrl}tools/` },
    { label: 'Resources', href: `${baseUrl}resources/` },
  ];

  const afterShelfItems = [
    { label: 'About', href: `${baseUrl}about/` },
    { label: 'Advisory', href: `${baseUrl}advisory/` },
  ];

  const contactHref = `${baseUrl}contact/`;

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className={`
        mx-4 mt-4 px-5 lg:px-8 py-3.5 flex justify-between items-center transition-all duration-300 rounded-full border backdrop-blur-xl
        bg-[rgba(255,250,244,0.85)] border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.08)]
      `}>
        {/* Left: Brand */}
        <a
          href={baseUrl}
          className="text-xs font-black uppercase tracking-[0.32em] text-[#181511]"
        >
          Majid Mumtaz
        </a>

        {/* Center: Nav items (desktop) */}
        <div className="hidden md:flex items-center gap-5 lg:gap-7">
          {navItems.map((item) => {
            const isActive = isCurrent(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`text-[10px] font-black uppercase tracking-[0.24em] transition-colors relative
                  ${isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-[#181511]'}`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#a33a21]" />
                )}
              </a>
            );
          })}

          {/* Shelf Popover Dropdown */}
          <div
            ref={shelfRef}
            className="relative"
            onMouseEnter={handleShelfMouseEnter}
            onMouseLeave={handleShelfMouseLeave}
          >
            <button
              type="button"
              onClick={handleShelfButtonClick}
              aria-haspopup="true"
              aria-expanded={shelfOpen}
              className={`text-[10px] font-black uppercase tracking-[0.24em] transition-colors inline-flex items-center gap-1 cursor-pointer relative
                ${isShelfActive || shelfOpen ? 'text-[#1d3557]' : 'text-slate-500 hover:text-[#181511]'}`}
            >
              Shelf
              <svg
                className={`h-3 w-3 transition-transform duration-200 ${shelfOpen ? 'rotate-180 text-[#a33a21]' : 'text-slate-400'}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
              </svg>
              {isShelfActive && (
                <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#a33a21]" />
              )}
            </button>

            {/* Desktop Popover Menu */}
            <AnimatePresence>
              {shelfOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 6, scale: 0.98 }}
                  transition={{ duration: 0.15 }}
                  className="absolute top-full left-1/2 -translate-x-1/2 mt-3 w-72 rounded-[24px] bg-[rgba(255,250,244,0.98)] border border-[rgba(29,53,87,0.12)] shadow-[0_22px_60px_rgba(71,38,24,0.14)] p-2 backdrop-blur-2xl z-50 overflow-hidden"
                >
                  <div className="px-3 pt-2 pb-1 border-b border-[color:var(--line-soft)] mb-1">
                    <span className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
                      Shelf &amp; Special Projects
                    </span>
                  </div>
                  <div className="flex flex-col gap-0.5">
                    {shelfItems.map((item) => {
                      const isActive = !item.external && isCurrent(item.href);
                      return (
                        <a
                          key={item.label}
                          href={item.href}
                          target={item.external ? '_blank' : undefined}
                          rel={item.external ? 'noopener noreferrer' : undefined}
                          onClick={() => setShelfOpen(false)}
                          className={`group flex items-start justify-between rounded-xl px-3 py-2.5 transition-colors ${
                            isActive
                              ? 'bg-[#1d3557]/8 text-[#1d3557]'
                              : 'hover:bg-black/[0.04] text-[#181511]'
                          }`}
                        >
                          <div>
                            <div className="flex items-center gap-1.5">
                              <span className="text-xs font-bold text-[#181511] group-hover:text-[#a33a21] transition-colors">
                                {item.label}
                              </span>
                              {item.external && (
                                <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                              )}
                            </div>
                            <p className="text-[11px] leading-4 text-[color:var(--text-secondary)] mt-0.5">
                              {item.desc}
                            </p>
                          </div>
                          {isActive && (
                            <span className="h-1.5 w-1.5 rounded-full bg-[#a33a21] mt-1.5" />
                          )}
                        </a>
                      );
                    })}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {afterShelfItems.map((item) => {
            const isActive = isCurrent(item.href);
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`text-[10px] font-black uppercase tracking-[0.24em] transition-colors relative
                  ${isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-[#181511]'}`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute -bottom-1 left-0 right-0 h-px bg-[#a33a21]" />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: CTAs (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <a
            href={contactHref}
            aria-current={isCurrent(contactHref) ? 'page' : undefined}
            className="hidden md:inline-flex text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2 rounded-full bg-[#a33a21] text-white hover:bg-[#7c2712] transition-colors"
          >
            Contact
          </a>

          {/* Hamburger button (mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className="md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 text-slate-900"
          >
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'rotate-45 translate-y-2' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? 'opacity-0' : ''}`} />
            <span className={`block w-5 h-0.5 bg-current transition-all duration-300 ${mobileOpen ? '-rotate-45 -translate-y-2' : ''}`} />
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            id="mobile-menu"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden mx-4 mt-2 rounded-[28px] bg-[rgba(255,250,244,0.98)] border border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.10)] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = isCurrent(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.24em] transition-colors
                      ${isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {item.label}
                  </a>
                );
              })}

              {/* Mobile Shelf Accordion */}
              <div className="border-b border-slate-100 py-3">
                <button
                  type="button"
                  onClick={() => setMobileShelfOpen(!mobileShelfOpen)}
                  className="w-full flex items-center justify-between text-[10px] font-black uppercase tracking-[0.24em] text-slate-500 hover:text-slate-900"
                >
                  <span className={isShelfActive ? 'text-[#1d3557]' : ''}>Shelf</span>
                  <svg
                    className={`h-3 w-3 transition-transform duration-200 ${mobileShelfOpen ? 'rotate-180 text-[#a33a21]' : 'text-slate-400'}`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>

                {mobileShelfOpen && (
                  <div className="mt-2.5 pl-3 border-l-2 border-[#c7964c]/40 space-y-2 py-1">
                    {shelfItems.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        target={item.external ? '_blank' : undefined}
                        rel={item.external ? 'noopener noreferrer' : undefined}
                        onClick={() => setMobileOpen(false)}
                        className="block py-1"
                      >
                        <div className="text-xs font-bold text-[#181511] flex items-center gap-1.5">
                          {item.label}
                          {item.external && (
                            <svg className="h-3 w-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-500">{item.desc}</div>
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {afterShelfItems.map((item) => {
                const isActive = isCurrent(item.href);
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    onClick={() => setMobileOpen(false)}
                    className={`block py-3 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.24em] transition-colors
                      ${isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {item.label}
                  </a>
                );
              })}

              <a
                href={contactHref}
                aria-current={isCurrent(contactHref) ? 'page' : undefined}
                onClick={() => setMobileOpen(false)}
                className="mt-4 block text-center text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2.5 rounded-full bg-[#a33a21] text-white"
              >
                Contact
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
