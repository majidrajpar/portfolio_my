import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  const [scrolled, setScrolled] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const sectionIds = ['contact', 'services', 'projects', 'about'];
    const observers = [];

    sectionIds.forEach((id) => {
      const el = document.getElementById(id);
      if (!el) return;
      const observer = new IntersectionObserver(
        ([entry]) => {
          if (entry.isIntersecting) setActiveSection(id);
        },
        { threshold: 0.3 }
      );
      observer.observe(el);
      observers.push(observer);
    });

    return () => observers.forEach((o) => o.disconnect());
  }, []);

  const navItems = [
    { label: 'Home', href: '#', id: '' },
    { label: 'About', href: '#about', id: 'about' },
    { label: 'Case Studies', href: '#projects', id: 'projects' },
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
