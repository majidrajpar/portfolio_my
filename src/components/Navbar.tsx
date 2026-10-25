import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const Navbar = ({ initialPath = '' }) => {
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [mobileOpen, setMobileOpen] = useState(false);
  const baseUrl = import.meta.env.BASE_URL;
  const isCurrent = (href: string) => currentPath === href || currentPath === href.replace(/\/$/, '');

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

  // Close mobile menu on route change
  useEffect(() => {
    // The mobile menu automatically closes anyway if we navigate to a new page in Astro, 
    // but if we need it for anchor links:
    const handlePopState = () => setMobileOpen(false);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navItems = [
    { label: 'Case Studies', href: `${baseUrl}projects/` },
    { label: 'Tools', href: `${baseUrl}tools/` },
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
        mx-4 mt-4 px-5 lg:px-8 py-4 flex justify-between items-center transition-all duration-300 rounded-full border backdrop-blur-xl
        bg-[rgba(255,250,244,0.78)] border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.08)]
      `}>
        {/* Left: Brand */}
        <a
          href={baseUrl}
          className="text-xs font-black uppercase tracking-[0.32em] text-[#181511]"
        >
          Majid Mumtaz
        </a>

        {/* Center: Nav items (desktop) */}
        <div className="hidden md:flex items-center gap-7">
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
            className="md:hidden mx-4 mt-2 rounded-[28px] bg-[rgba(255,250,244,0.96)] border border-[rgba(29,53,87,0.10)] shadow-[0_18px_50px_rgba(71,38,24,0.08)] overflow-hidden"
          >
            <div className="px-6 py-4 space-y-1">
              {navItems.map((item) => {
                const isActive = isCurrent(item.href);
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
              <a
                href={contactHref}
                aria-current={isCurrent(contactHref) ? 'page' : undefined}
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
