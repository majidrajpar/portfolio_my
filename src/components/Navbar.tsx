import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ initialPath = '' }) => {
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [mobileOpen, setMobileOpen] = useState(false);
  const base = import.meta.env.BASE_URL.replace(/\/$/, '');

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    const syncPath = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('popstate', syncPath);
    document.addEventListener('astro:page-load', syncPath);

    syncPath();
    handleScroll();
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('popstate', syncPath);
      document.removeEventListener('astro:page-load', syncPath);
    };
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    // The mobile menu automatically closes anyway if we navigate to a new page in Astro, 
    // but if we need it for anchor links:
    const handlePopState = () => setMobileOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const isHome = currentPath === `${base}/` || currentPath === `${base}`;
  const showTransparent = isHome && !scrolled && !mobileOpen;

  const navItems = [
    { label: 'Home', href: `${base}/` },
    { label: 'About', href: `${base}/about/` },
    { label: 'Projects', href: `${base}/projects/` },
    { label: 'Tools', href: `${base}/tools/` },
    { label: 'Advisory', href: `${base}/advisory/` },
    { label: 'Contact', href: `${base}/contact/` },
  ];

  const newsletterUrl = 'https://www.linkedin.com/newsletters/the-audit-signal-7339153291630510080/';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className={`
        mx-4 mt-4 px-5 lg:px-8 py-4 flex justify-between items-center transition-all duration-300 rounded-full border backdrop-blur-xl
        ${showTransparent ? 'bg-white/6 border-white/12 shadow-[0_18px_50px_rgba(16,24,39,0.12)]' : 'bg-[rgba(255,250,244,0.78)] border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.08)]'}
      `}>
        {/* Left: Brand */}
        <a
          href={`${base}/`}
          className={`text-xs font-black uppercase tracking-[0.32em] transition-colors duration-300 ${showTransparent ? 'text-white' : 'text-[#181511]'}`}
        >
          Majid Mumtaz
        </a>

        {/* Center: Nav items (desktop) */}
        <div className="hidden md:flex items-center gap-7">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || currentPath === item.href.replace(/\/$/, '');
            return (
              <a
                key={item.label}
                href={item.href}
                aria-current={isActive ? 'page' : undefined}
                className={`text-[10px] font-black uppercase tracking-[0.24em] transition-colors relative
                  ${showTransparent
                    ? (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                    : (isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-[#181511]')
                  }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-px ${showTransparent ? 'bg-white' : 'bg-[#a33a21]'}`}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: CTAs (desktop) + Hamburger (mobile) */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-3 group relative">
            <button
              className={`text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2 rounded-full border transition-all
                ${showTransparent
                  ? 'border-white/60 text-white hover:bg-white/10'
                  : 'border-[#1d3557]/18 text-[#1d3557] hover:bg-[#1d3557]/5'}`}
            >
              Resources ↓
            </button>
            <div className="absolute top-full right-0 mt-2 flex flex-col gap-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all bg-white rounded-2xl shadow-[0_18px_50px_rgba(71,38,24,0.08)] border border-[rgba(29,53,87,0.10)] p-3 w-48">
              <a
                href={newsletterUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2 text-[#1d3557] hover:bg-gray-50 rounded-lg transition-colors"
              >
                The Audit Signal ↗
              </a>
              <a
                href={`${base}/downloads/Majid_Mumtaz_Capabilities_Deck.pdf`}
                download
                className="text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2 text-[#1d3557] hover:bg-gray-50 rounded-lg transition-colors"
              >
                Pitch Deck ↓
              </a>
              <a
                href={`${base}/cv/Majid_Mumtaz_Internal_Audit_GRC.pdf`}
                download
                className="text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2 bg-[#a33a21] text-white hover:bg-[#7c2712] rounded-lg transition-colors"
              >
                Executive CV ↓
              </a>
            </div>
          </div>

          {/* Hamburger button (mobile only) */}
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            aria-controls="mobile-menu"
            className={`md:hidden flex flex-col justify-center items-center w-8 h-8 gap-1.5 transition-colors
              ${showTransparent ? 'text-white' : 'text-slate-900'}`}
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
            className="md:hidden mx-4 mt-2 rounded-[28px] bg-[rgba(255,250,244,0.96)] border border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.08)] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = currentPath === item.href || currentPath === item.href.replace(/\/$/, '');
                return (
                  <a
                    key={item.label}
                    href={item.href}
                    aria-current={isActive ? 'page' : undefined}
                    className={`block py-3 border-b border-slate-100 text-[10px] font-black uppercase tracking-[0.24em] transition-colors
                      ${isActive ? 'text-[#1d3557]' : 'text-slate-500 hover:text-slate-900'}`}
                  >
                    {item.label}
                  </a>
                );
              })}
              <div className="pt-4 flex flex-col gap-3">
                <a
                  href={`${base}/downloads/Majid_Mumtaz_Capabilities_Deck.pdf`}
                  download
                  className="text-center text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2.5 rounded-full border border-[#1d3557]/18 text-[#1d3557]"
                >
                  Download Pitch Deck ↓
                </a>
                <a
                  href={`${base}/cv/Majid_Mumtaz_Internal_Audit_GRC.pdf`}
                  download
                  className="text-center text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2.5 rounded-full bg-[#a33a21] text-white"
                >
                  Download Executive CV ↓
                </a>
                <a
                  href={newsletterUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center text-[10px] font-black uppercase tracking-[0.24em] px-4 py-2.5 rounded-full border border-[#1d3557]/18 text-[#1d3557]"
                >
                  The Audit Signal ↗
                </a>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.header>
  );
};

export default Navbar;
