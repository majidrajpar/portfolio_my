import React, { useState, useEffect, useCallback, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Maximize2,
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Download,
  ExternalLink,
  Layers,
} from 'lucide-react';
import { infographics, type InfographicItem } from '../data/infographics';

interface EditorialGalleryProps {
  base?: string;
  initialFilter?: string;
}

export default function EditorialGallery({ base = '/portfolio_my/' }: EditorialGalleryProps) {
  const normalizedBase = base.endsWith('/') ? base : `${base}/`;
  const [activeFilter, setActiveFilter] = useState<string>('All');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [zoomLevel, setZoomLevel] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const isDraggingRef = useRef(false);
  const dragStartRef = useRef<{ x: number; y: number }>({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);
    const syncFromHash = () => {
      if (typeof window !== 'undefined' && window.location.hash) {
        const initialId = window.location.hash.replace(/^#/, '');
        const matched = infographics.find((item) => item.id === initialId);
        if (matched) {
          setSelectedId(matched.id);
          document.body.style.overflow = 'hidden';
        }
      }
    };

    syncFromHash();
    window.addEventListener('hashchange', syncFromHash);
    return () => window.removeEventListener('hashchange', syncFromHash);
  }, []);

  const categories = [
    'All',
    'Audit & Governance Satire',
    'Continuous Controls & Audit',
    'Commercial & Retail Risk',
    'Forensic Autopsies & Investigations',
  ];

  const matchesFilter = (item: InfographicItem, filter: string): boolean => {
    if (filter === 'All') return true;
    if (filter === 'Audit & Governance Satire' || filter === 'Editorial Satire') {
      return item.tag.includes('Satire') || item.tag.includes('Trench') || item.tag.includes('Governance');
    }
    if (filter === 'Continuous Controls & Audit' || filter === 'Operational Blueprints') {
      return item.tag.includes('Continuous') || item.tag.includes('Treasury') || item.tag.includes('Monitoring') || item.tag.includes('Controls') || item.tag.includes('Automation');
    }
    if (filter === 'Commercial & Retail Risk' || filter === 'F&B & Retail Unit Economics') {
      return item.tag.includes('Retail') || item.tag.includes('Commercial') || item.tag.includes('FoodTech') || item.tag.includes('Economics');
    }
    if (filter === 'Forensic Autopsies & Investigations' || filter === 'Forensic Autopsies') {
      return item.tag.includes('Forensic') || item.tag.includes('Autopsy') || item.tag.includes('Disbursement');
    }
    return true;
  };

  const filteredItems = infographics.filter((item) => matchesFilter(item, activeFilter));
  const selectedIndex = filteredItems.findIndex((item) => item.id === selectedId);
  const currentItem = selectedIndex !== -1 ? filteredItems[selectedIndex] : null;

  const openLightbox = (id: string) => {
    setSelectedId(id);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    document.body.style.overflow = 'hidden';
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', `#${id}`);
    }
  };

  const closeLightbox = useCallback(() => {
    setSelectedId(null);
    setZoomLevel(1);
    setPanOffset({ x: 0, y: 0 });
    document.body.style.overflow = '';
    if (typeof window !== 'undefined') {
      history.replaceState(null, '', window.location.pathname + window.location.search);
    }
  }, []);

  const showNext = useCallback(() => {
    const nextItem =
      selectedIndex < filteredItems.length - 1 ? filteredItems[selectedIndex + 1] : filteredItems[0];
    if (nextItem) {
      setSelectedId(nextItem.id);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', `#${nextItem.id}`);
      }
    }
  }, [selectedIndex, filteredItems]);

  const showPrev = useCallback(() => {
    const prevItem =
      selectedIndex > 0 ? filteredItems[selectedIndex - 1] : filteredItems[filteredItems.length - 1];
    if (prevItem) {
      setSelectedId(prevItem.id);
      setZoomLevel(1);
      setPanOffset({ x: 0, y: 0 });
      if (typeof window !== 'undefined') {
        history.replaceState(null, '', `#${prevItem.id}`);
      }
    }
  }, [selectedIndex, filteredItems]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoomLevel <= 1) return;
    isDraggingRef.current = true;
    dragStartRef.current = { x: e.clientX - panOffset.x, y: e.clientY - panOffset.y };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current || zoomLevel <= 1) return;
    setPanOffset({
      x: e.clientX - dragStartRef.current.x,
      y: e.clientY - dragStartRef.current.y,
    });
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedId) return;
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowRight') showNext();
      if (e.key === 'ArrowLeft') showPrev();
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, closeLightbox, showNext, showPrev]);

  return (
    <div className="w-full">
      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 pb-4 border-b border-[color:var(--line-soft)]">
        <div className="flex flex-wrap items-center gap-2">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all ${
                activeFilter === cat
                  ? 'bg-[#181511] text-white shadow-sm'
                  : 'bg-white/80 text-[color:var(--text-secondary)] hover:bg-[#181511]/5 border border-[color:var(--line-soft)]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
        <div className="text-xs text-[color:var(--text-secondary)] flex items-center gap-1.5 font-medium">
          <Layers size={14} className="text-[#c7964c]" />
          <span>{filteredItems.length} audit analyses</span>
        </div>
      </div>

      {/* Grid of Shrunk Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredItems.map((item) => {
          const imageSrc = `${normalizedBase}images/infographics/${item.filename}`;
          return (
            <div
              key={item.id}
              onClick={() => openLightbox(item.id)}
              className="group cursor-pointer flex flex-col rounded-2xl border border-[color:var(--line-soft)] bg-white/70 backdrop-blur-sm p-4 hover:shadow-xl hover:border-[#c7964c]/40 transition-all duration-300"
            >
              {/* Shrunk Image Viewport */}
              <div className="relative w-full h-64 bg-[#fbf9f4] rounded-xl overflow-hidden border border-black/5 flex items-center justify-center p-2">
                <img
                  src={imageSrc}
                  alt={item.title}
                  loading="lazy"
                  className="max-h-full max-w-full object-contain transition-transform duration-300 group-hover:scale-[1.03]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3.5">
                  <span className="text-[11px] font-bold tracking-wider text-white uppercase flex items-center gap-1.5">
                    <Maximize2 size={13} className="text-[#f4c98b]" /> Expand
                  </span>
                  <span className="text-[10px] text-white/80 font-mono">Click to zoom</span>
                </div>
                <div className="absolute top-2.5 right-2.5 bg-black/50 backdrop-blur-sm text-white/90 p-1.5 rounded-lg opacity-80 group-hover:opacity-100 group-hover:bg-[#181511]">
                  <Maximize2 size={13} />
                </div>
              </div>

              {/* Card Meta & Copy */}
              <div className="flex flex-col flex-1 pt-4">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#a66c1c] mb-1.5 block">
                  {item.tag}
                </span>
                <h3 className="text-base font-bold text-[#181511] leading-snug group-hover:text-[#8d6035] transition-colors">
                  {item.title}
                </h3>
                <p className="mt-2 text-xs leading-relaxed text-[color:var(--text-secondary)] line-clamp-3">
                  {item.paradox}
                </p>
                <div
                  onClick={(e) => {
                    e.stopPropagation();
                    openLightbox(item.id);
                  }}
                  className="mt-auto pt-3 border-t border-[color:var(--line-soft)] flex items-center justify-between text-[11px] text-[#181511] font-semibold hover:text-[#a66c1c] transition-colors"
                >
                  <span className="underline decoration-[#c7964c] underline-offset-4">View audit analysis</span>
                  <span className="text-xs text-[#a66c1c]">→</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full-Screen Lightbox Modal (Portal to body to escape parent stacking context & backdrop-filter) */}
      {isMounted &&
        createPortal(
          <AnimatePresence>
            {currentItem && (
              <motion.div
                key={currentItem.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/92 backdrop-blur-md p-2 sm:p-4 md:p-6"
                onClick={closeLightbox}
              >
            <div
              className="relative w-full max-w-7xl h-[92vh] max-h-[950px] bg-[#0f1218] border border-white/10 rounded-2xl overflow-hidden shadow-2xl flex flex-col lg:flex-row"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Top Controls Bar */}
              <div className="absolute top-3 right-3 z-30 flex items-center gap-2">
                {/* Zoom Controls */}
                <div className="hidden sm:flex items-center gap-1 bg-black/60 backdrop-blur-md rounded-lg p-1 border border-white/10 text-white/80">
                  <button
                    onClick={() => setZoomLevel((z) => Math.max(0.75, z - 0.25))}
                    title="Zoom Out"
                    className="p-1.5 hover:bg-white/10 rounded"
                  >
                    <ZoomOut size={16} />
                  </button>
                  <span className="text-[11px] font-mono px-2">{Math.round(zoomLevel * 100)}%</span>
                  <button
                    onClick={() => setZoomLevel((z) => Math.min(2.5, z + 0.25))}
                    title="Zoom In"
                    className="p-1.5 hover:bg-white/10 rounded"
                  >
                    <ZoomIn size={16} />
                  </button>
                  <button
                    onClick={() => {
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }}
                    title="Reset Zoom"
                    className="p-1.5 hover:bg-white/10 rounded"
                  >
                    <RotateCcw size={14} />
                  </button>
                </div>

                {/* External Download */}
                <a
                  href={`${normalizedBase}images/infographics/${currentItem.filename}`}
                  download={currentItem.filename}
                  title="Download Raw File"
                  className="bg-black/60 backdrop-blur-md hover:bg-white/20 text-white p-2 rounded-lg border border-white/10 transition-colors"
                >
                  <Download size={16} />
                </a>

                {/* Close Button */}
                <button
                  onClick={closeLightbox}
                  title="Close (Esc)"
                  className="bg-white/10 hover:bg-white/20 text-white p-2 rounded-lg border border-white/15 transition-colors"
                >
                  <X size={18} />
                </button>
              </div>

              {/* Main Image Stage (Left / Center) */}
              <div
                className="relative flex-1 h-[55%] lg:h-full bg-[#090b0e] flex items-center justify-center overflow-hidden p-4 select-none"
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              >
                <div
                  className="transition-transform duration-100 ease-out flex items-center justify-center max-h-full max-w-full"
                  style={{
                    transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoomLevel})`,
                    cursor: zoomLevel > 1 ? 'grab' : 'zoom-in',
                  }}
                  onMouseDown={handleMouseDown}
                  onClick={() => {
                    if (zoomLevel === 1) {
                      setZoomLevel(1.5);
                    } else if (zoomLevel === 1.5) {
                      setZoomLevel(2);
                    } else {
                      setZoomLevel(1);
                      setPanOffset({ x: 0, y: 0 });
                    }
                  }}
                >
                  <img
                    src={`${normalizedBase}images/infographics/${currentItem.filename}`}
                    alt={currentItem.title}
                    className="max-h-[82vh] max-w-full object-contain shadow-2xl rounded-sm"
                  />
                </div>

                {/* Nav Arrows */}
                <button
                  onClick={showPrev}
                  title="Previous (Left Arrow)"
                  className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white/90 p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  <ChevronLeft size={20} />
                </button>
                <button
                  onClick={showNext}
                  title="Next (Right Arrow)"
                  className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-black/85 text-white/90 p-2.5 rounded-full border border-white/10 transition-colors"
                >
                  <ChevronRight size={20} />
                </button>
              </div>

              {/* Commentary / Notes Drawer (Right / Bottom) */}
              <div className="w-full lg:w-[420px] xl:w-[460px] h-[45%] lg:h-full bg-[#13161f] border-t lg:border-t-0 lg:border-l border-white/10 flex flex-col overflow-y-auto p-6 md:p-8 text-white">
                <div className="mb-4">
                  <span className="text-[10px] font-black uppercase tracking-[0.25em] text-[#f4c98b] block mb-2">
                    {currentItem.tag}
                  </span>
                  <h2 className="text-xl md:text-2xl font-black text-white leading-tight">
                    {currentItem.title}
                  </h2>
                  <p className="text-xs text-white/60 mt-1.5 font-medium">
                    {currentItem.subtitle}
                  </p>
                </div>

                {/* Core Paradox Highlight */}
                <div className="my-4 p-4 rounded-xl bg-white/[0.04] border-l-2 border-[#f4c98b]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block mb-1">
                    Risk &amp; Governance Premise
                  </span>
                  <p className="text-sm italic text-white/90 leading-relaxed font-serif">
                    {currentItem.paradox}
                  </p>
                </div>

                {/* Bulleted Trench Notes */}
                <div className="space-y-3 my-4 text-xs leading-relaxed text-white/75">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-white/40 block">
                    Fieldwork Observations
                  </span>
                  {currentItem.notes.map((note, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <span className="text-[#f4c98b] font-mono text-[11px] mt-0.5">•</span>
                      <p>{note}</p>
                    </div>
                  ))}
                </div>

                {/* Key Takeaway & Links */}
                <div className="mt-auto pt-6 border-t border-white/10 space-y-4">
                  <div className="text-xs text-white/80">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#f4c98b] block mb-1">
                      Internal Control Implication
                    </span>
                    <p className="leading-relaxed">{currentItem.keyTakeaway}</p>
                  </div>

                  {currentItem.relatedCaseStudy && (
                    <a
                      href={`${normalizedBase}projects/${currentItem.relatedCaseStudy.slug}/`}
                      className="inline-flex items-center justify-between w-full p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-semibold text-white transition-colors"
                    >
                      <span>Related Case: {currentItem.relatedCaseStudy.label}</span>
                      <ExternalLink size={14} className="text-[#f4c98b]" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>,
      document.body
    )}
    </div>
  );
}
