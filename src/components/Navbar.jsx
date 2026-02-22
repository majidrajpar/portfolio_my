import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const sectionIds = ['about', 'projects', 'resources', 'services', 'contact'];

    const handleScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 50);

      // At the very top — highlight Home
      if (y < 80) {
        setActiveSection('');
        return;
      }

      // Find which section the midpoint of the viewport is inside
      const mid = y + window.innerHeight / 2;
      let current = '';
      for (const id of sectionIds) {
        const el = document.getElementById(id);
        if (el && el.offsetTop <= mid) {
          current = id;
        }
      }
      setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { label: 'Home', href: '#', id: '' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Case Studies', href: '#projects', id: 'projects' },
    { label: 'Resources', href: '#resources', id: 'resources' },
    { label: 'Services', href: '#services', id: 'services' },
    { label: 'Contact', href: '#contact', id: 'contact' },
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
        ${scrolled ? 'bg-white border-b border-slate-200 shadow-sm' : 'bg-transparent'}
      `}>
        {/* Left: Brand */}
        <span className={`text-xs font-black uppercase tracking-[0.3em] transition-colors duration-300 ${scrolled ? 'text-slate-900' : 'text-white'}`}>
          Majid Mumtaz
        </span>

        {/* Center: Nav items */}
        <div className="hidden md:flex items-center gap-8">
          {navItems.map((item) => {
            const isActive = item.id === activeSection;
            return (
              <a
                key={item.label}
                href={item.href}
                className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative
                  ${scrolled
                    ? (isActive ? 'text-[#001F5B]' : 'text-slate-500 hover:text-slate-900')
                    : (isActive ? 'text-white' : 'text-white/70 hover:text-white')
                  }`}
              >
                {item.label}
                {isActive && (
                  <motion.span
                    layoutId="nav-indicator"
                    className={`absolute -bottom-1 left-0 right-0 h-px ${scrolled ? 'bg-[#001F5B]' : 'bg-white'}`}
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
              ${scrolled
                ? 'border-[#001F5B] text-[#001F5B] hover:bg-[#001F5B] hover:text-white'
                : 'border-white/60 text-white hover:border-white'}`}
          >
            Newsletter ↗
          </a>
          <a
            href="#books"
            className={`text-[10px] font-black uppercase tracking-[0.2em] px-4 py-1.5 border transition-all
              ${scrolled
                ? 'border-amber-600 text-amber-700 hover:bg-amber-600 hover:text-white'
                : 'border-amber-400/60 text-amber-300 hover:border-amber-300 hover:text-white'}`}
          >
            Books
          </a>
        </div>
      </nav>
    </motion.header>
  );
};

export default Navbar;
