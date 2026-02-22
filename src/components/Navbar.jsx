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

  return (
    <motion.header
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="fixed top-8 left-0 right-0 z-50 flex justify-center pointer-events-none"
    >
      <nav className={`
        pointer-events-auto px-8 py-3 rounded-full flex gap-8 items-center transition-all duration-500 border
        ${scrolled ? 'bg-slate-900/80 backdrop-blur-xl border-white/10 shadow-2xl scale-95' : 'bg-transparent border-transparent'}
      `}>
        {navItems.map((item) => {
          const isActive = item.id === activeSection;
          return (
            <a
              key={item.label}
              href={item.href}
              className={`text-[10px] font-black uppercase tracking-[0.2em] transition-colors relative ${
                isActive ? 'text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {item.label}
              {isActive && (
                <motion.span
                  layoutId="nav-indicator"
                  className="absolute -bottom-1 left-0 right-0 h-px bg-blue-500"
                />
              )}
            </a>
          );
        })}
      </nav>
    </motion.header>
  );
};

export default Navbar;
