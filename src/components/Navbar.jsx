import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [currentPath, setCurrentPath] = useState('');
  const base = '/portfolio_my';

  useEffect(() => {
    // Set current path for active link detection
    setCurrentPath(window.location.pathname);

    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // On non-home pages, always show white background
  const isHome = currentPath === `${base}/` || currentPath === `${base}`;
  const showTransparent = isHome && !scrolled;

  const navItems = [
    { label: 'Home', href: `${base}/` },
    { label: 'About', href: `${base}/about/` },
    { label: 'Projects', href: `${base}/projects/` },
    { label: 'Advisory', href: `${base}/consulting/` },
    { label: 'Contact', href: `${base}/contact/` },
    { label: 'Resources', href: `${base}/resources/` },
  ];

  const newsletterUrl = 'https://www.linkedin.com/newsletters/7339153291630510080/';

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-0 left-0 right-0 z-50"
    >
      <nav className={`
        px-12 py-4 flex justify-between items-center transition-all duration-300
        ${showTransparent ? 'bg-transparent' : 'bg-white border-b border-slate-200 shadow-sm'}
      `}>
        {/* Left: Brand */}
        <a
          href={`${base}/`}
          className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-300 ${showTransparent ? 'text-white' : 'text-slate-900'}`}
        >
          Majid Mumtaz
        </a>

        {/* Center: Nav items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = currentPath === item.href || currentPath === item.href.replace(/\/$/, '');
            return (
              <a
                key={item.label}
                href={item.href}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative
                  ${showTransparent
                    ? (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                    : (isActive ? 'text-[#001F5B]' : 'text-slate-500 hover:text-slate-900')
                  }`}
              >
                {item.label}
                {isActive && (
                  <span
                    className={`absolute -bottom-1 left-0 right-0 h-px ${showTransparent ? 'bg-white' : 'bg-[#001F5B]'}`}
                  />
                )}
              </a>
            );
          })}
        </div>

        {/* Right: CTAs */}
        <div className="flex items-center gap-3">
          <a
            href={newsletterUrl}
            target="_blank"
            rel="noopener noreferrer"
            className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border transition-all
              ${showTransparent
                ? 'border-white/60 text-white hover:border-white'
                : 'border-[#001F5B] text-[#001F5B] hover:bg-[#001F5B] hover:text-white'}`}
          >
            Newsletter ↗
          </a>
          <a
            href={`${base}/about/#books`}
            className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border transition-all
              ${showTransparent
                ? 'border-amber-400/60 text-amber-300 hover:border-amber-300'
                : 'border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white'}`}
          >
            Books
          </a>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
