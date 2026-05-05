'use client';
import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';

// ─── Types ────────────────────────────────────────────────────────────────────
export interface Subcategory {
  label: string;
  slug: string;
  href: string;
  description?: string | null;
}

export interface Category {
  label: string;
  slug: string;
  href: string;
  description?: string | null;
  subcategories: Subcategory[];
}

// Per-category light palette: [bg tint, accent colour, dim accent]
const CATEGORY_PALETTE: { bg: string; accent: string; dim: string; tint: string }[] = [
  { bg: 'linear-gradient(135deg, #fffdf5 0%, #fdf6e3 100%)', accent: '#b8860b', dim: '#d4a84b', tint: '#fdf6e3' },
  { bg: 'linear-gradient(135deg, #f5f9fd 0%, #e8f2f9 100%)', accent: '#2c5a74', dim: '#5b9ab8', tint: '#e8f2f9' },
  { bg: 'linear-gradient(135deg, #fdf5ff 0%, #f5eafc 100%)', accent: '#6b3d82', dim: '#a67dc0', tint: '#f5eafc' },
  { bg: 'linear-gradient(135deg, #f5fdf8 0%, #e8f8ee 100%)', accent: '#2a6644', dim: '#5aab7a', tint: '#e8f8ee' },
  { bg: 'linear-gradient(135deg, #fdf5f5 0%, #fce8e8 100%)', accent: '#7a2e2e', dim: '#b86666', tint: '#fce8e8' },
  { bg: 'linear-gradient(135deg, #f5f6fd 0%, #e8ecf9 100%)', accent: '#2e4472', dim: '#6278b8', tint: '#e8ecf9' },
  { bg: 'linear-gradient(135deg, #fdfaf0 0%, #f8f2d8 100%)', accent: '#6e5a1a', dim: '#b09040', tint: '#f8f2d8' },
  { bg: 'linear-gradient(135deg, #f5fdfb 0%, #e2f7f5 100%)', accent: '#226660', dim: '#4aada6', tint: '#e2f7f5' },
];

// ─── Data hook ────────────────────────────────────────────────────────────────
function useMegaMenuData() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      try {
        const res = await fetch('/api/categories?withSubcategories=true');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const data: Category[] = (json.data ?? []).map((cat: any) => ({
          label: cat.name,
          slug: cat.slug,
          description: cat.description ?? null,
          href: `/products?category=${cat.slug}`,
          subcategories: (cat.subcategories ?? []).map((sub: any) => ({
            label: sub.name,
            slug: sub.slug,
            description: sub.description ?? null,
            href: `/products?category=${cat.slug}&subcategory=${sub.slug}`,
          })),
        }));
        if (!cancelled) { setCategories(data); setLoading(false); }
      } catch {
        if (!cancelled) { setError(true); setLoading(false); }
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  return { categories, loading, error };
}

// ─── MegaMenu Component ───────────────────────────────────────────────────────
export default function MegaMenu() {
  const { categories, loading, error } = useMegaMenuData();
  const [open, setOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeIdx, setActiveIdx] = useState(0);
  const [mobileCatIdx, setMobileCatIdx] = useState<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const activeCategory = categories[activeIdx] ?? null;

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 150);
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Lock scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [mobileOpen]);

  const palette = CATEGORY_PALETTE[activeIdx % CATEGORY_PALETTE.length];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Outfit:wght@300;400;500&display=swap');

        /* ── Trigger ── */
        .mm-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 6px 2px;
          color: var(--text-secondary, #555);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          background: none;
          border: none;
          transition: opacity 0.2s;
        }
        .mm-trigger:hover { opacity: 0.55; }
        .mm-trigger:disabled { opacity: 0.35; cursor: default; }

        .mm-trigger-underline {
          position: absolute;
          bottom: 2px; left: 0;
          height: 1px; width: 100%;
          background: currentColor;
          transform: scaleX(0);
          transform-origin: left;
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          opacity: 0.3;
        }
        .mm-trigger:not(:disabled):hover .mm-trigger-underline { transform: scaleX(1); }

        .mm-chevron {
          width: 7px; height: 7px;
          border-right: 1.5px solid currentColor;
          border-bottom: 1.5px solid currentColor;
          transform: rotate(45deg) translateY(-1px);
          transition: transform 0.3s cubic-bezier(0.4,0,0.2,1);
          opacity: 0.5;
          margin-top: 2px;
          flex-shrink: 0;
        }
        .mm-chevron.open { transform: rotate(-135deg) translateY(1px); }

        /* ── Shimmer ── */
        @keyframes mmShimmer {
          0%   { background-position: -300px 0; }
          100% { background-position:  300px 0; }
        }
        .mm-loading-bar {
          display: inline-block; width: 60px; height: 7px; border-radius: 3px;
          background: linear-gradient(90deg, #e8e4de 25%, #f5f3ef 50%, #e8e4de 75%);
          background-size: 300px 100%;
          animation: mmShimmer 1.3s infinite linear;
        }

        /* ── Backdrop ── */
        .mm-backdrop {
          position: fixed; inset: 0; z-index: 48;
          background: rgba(30,20,10,0.18);
          backdrop-filter: blur(1px);
          transition: opacity 0.25s ease;
        }
        .mm-backdrop.closed { opacity: 0; pointer-events: none; }
        .mm-backdrop.opened { opacity: 1; pointer-events: auto; }

        /* ── Panel ── */
        .mm-panel {
          position: fixed; left: 0; right: 0; z-index: 49;
          display: grid;
          grid-template-columns: 200px 1fr 280px;
          min-height: 400px;
          overflow: hidden;
          box-shadow: 0 20px 60px rgba(0,0,0,0.10), 0 1px 0 rgba(0,0,0,0.06);
          border-bottom: 1px solid rgba(0,0,0,0.07);
          transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1);
          transform-origin: top center;
        }
        .mm-panel.closed { opacity: 0; transform: translateY(-10px) scaleY(0.97); pointer-events: none; }
        .mm-panel.opened { opacity: 1; transform: translateY(0) scaleY(1); pointer-events: auto; }

        /* ── Left rail: category tabs ── */
        .mm-rail {
          background: #faf9f7;
          border-right: 1px solid rgba(0,0,0,0.07);
          padding: 32px 0;
          display: flex;
          flex-direction: column;
        }
        .mm-rail-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.55rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.25);
          padding: 0 20px 18px;
        }
        .mm-rail-item {
          position: relative;
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 20px;
          cursor: pointer;
          transition: background 0.18s;
          overflow: hidden;
        }
        .mm-rail-item:hover { background: rgba(0,0,0,0.025); }
        .mm-rail-item.active { background: #ffffff; }

        .mm-rail-indicator {
          position: absolute;
          left: 0; top: 50%; transform: translateY(-50%);
          width: 2px; height: 0;
          border-radius: 0 2px 2px 0;
          transition: height 0.22s cubic-bezier(0.4,0,0.2,1), background 0.3s;
        }
        .mm-rail-item.active .mm-rail-indicator { height: 28px; }

        .mm-rail-num {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.62rem;
          color: rgba(0,0,0,0.18);
          width: 14px;
          flex-shrink: 0;
          font-style: italic;
          transition: color 0.18s;
        }
        .mm-rail-item.active .mm-rail-num { color: rgba(0,0,0,0.4); }

        .mm-rail-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.03em;
          color: rgba(0,0,0,0.4);
          transition: color 0.18s;
          line-height: 1.2;
        }
        .mm-rail-item.active .mm-rail-label { color: rgba(0,0,0,0.85); font-weight: 500; }
        .mm-rail-item:hover .mm-rail-label { color: rgba(0,0,0,0.65); }

        .mm-rail-count {
          margin-left: auto;
          font-family: 'Outfit', sans-serif;
          font-size: 0.56rem;
          color: rgba(0,0,0,0.18);
          transition: color 0.18s;
        }
        .mm-rail-item.active .mm-rail-count { color: rgba(0,0,0,0.35); }

        /* ── Centre ── */
        .mm-centre {
          display: flex;
          flex-direction: column;
          padding: 36px 40px 36px;
          position: relative;
          overflow: hidden;
          transition: background 0.45s ease;
        }

        /* Subtle paper grain */
        .mm-centre::after {
          content: '';
          position: absolute; inset: 0; z-index: 0;
          opacity: 0.018;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          background-size: 180px;
          pointer-events: none;
        }
        .mm-centre > * { position: relative; z-index: 1; }

        .mm-cat-hero {
          margin-bottom: 24px;
          padding-bottom: 22px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .mm-cat-hero-label {
          font-family: 'Outfit', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          margin-bottom: 8px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .mm-cat-hero-label::after {
          content: '';
          flex: 1;
          height: 1px;
          background: rgba(0,0,0,0.08);
        }

        .mm-cat-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(28px, 3.5vw, 44px);
          font-weight: 300;
          color: rgba(0,0,0,0.85);
          line-height: 1.05;
          letter-spacing: -0.01em;
          margin-bottom: 10px;
        }
        .mm-cat-title em {
          font-style: italic;
          color: rgba(0,0,0,0.45);
        }

        .mm-cat-desc {
          font-family: 'Outfit', sans-serif;
          font-size: 0.74rem;
          font-weight: 300;
          color: rgba(0,0,0,0.45);
          line-height: 1.65;
          max-width: 400px;
          margin-bottom: 16px;
        }

        .mm-viewall-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.66rem;
          letter-spacing: 0.1em;
          color: rgba(0,0,0,0.55);
          text-decoration: none;
          border: 1px solid rgba(0,0,0,0.15);
          padding: 7px 16px;
          border-radius: 2px;
          transition: all 0.2s;
          width: fit-content;
          background: #ffffff;
        }
        .mm-viewall-btn:hover {
          border-color: rgba(0,0,0,0.35);
          color: rgba(0,0,0,0.85);
          background: rgba(0,0,0,0.02);
        }
        .mm-viewall-arrow { display: inline-block; transition: transform 0.2s; }
        .mm-viewall-btn:hover .mm-viewall-arrow { transform: translateX(4px); }

        /* ── Sub-grid ── */
        .mm-subgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 2px;
          margin-top: 4px;
        }

        @keyframes mmSubIn {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mm-sub-link {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 12px 14px;
          text-decoration: none;
          border-radius: 2px;
          border: 1px solid transparent;
          transition: background 0.16s, border-color 0.16s, transform 0.16s;
          animation: mmSubIn 0.26s ease both;
          position: relative;
          overflow: hidden;
        }
        .mm-sub-link::before {
          content: '';
          position: absolute;
          left: 0; top: 0; bottom: 0;
          width: 0;
          border-radius: 0 2px 2px 0;
          transition: width 0.18s;
        }
        .mm-sub-link:hover {
          background: rgba(255,255,255,0.9);
          border-color: rgba(0,0,0,0.08);
          transform: translateY(-1px);
          box-shadow: 0 2px 12px rgba(0,0,0,0.05);
        }
        .mm-sub-link:hover::before { width: 2px; }

        .mm-sub-link:nth-child(1)  { animation-delay: 0.03s; }
        .mm-sub-link:nth-child(2)  { animation-delay: 0.06s; }
        .mm-sub-link:nth-child(3)  { animation-delay: 0.09s; }
        .mm-sub-link:nth-child(4)  { animation-delay: 0.12s; }
        .mm-sub-link:nth-child(5)  { animation-delay: 0.15s; }
        .mm-sub-link:nth-child(6)  { animation-delay: 0.18s; }
        .mm-sub-link:nth-child(7)  { animation-delay: 0.21s; }
        .mm-sub-link:nth-child(8)  { animation-delay: 0.24s; }
        .mm-sub-link:nth-child(9)  { animation-delay: 0.27s; }
        .mm-sub-link:nth-child(10) { animation-delay: 0.30s; }

        .mm-sub-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 400;
          letter-spacing: 0.02em;
          color: rgba(0,0,0,0.55);
          transition: color 0.16s;
          line-height: 1.3;
        }
        .mm-sub-link:hover .mm-sub-name { color: rgba(0,0,0,0.88); }

        .mm-sub-tagline {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.7rem;
          font-style: italic;
          color: rgba(0,0,0,0.28);
          line-height: 1.35;
          transition: color 0.16s;
        }
        .mm-sub-link:hover .mm-sub-tagline { color: rgba(0,0,0,0.5); }

        .mm-empty-state {
          font-family: 'Cormorant Garamond', serif;
          font-size: 1.05rem;
          font-weight: 300;
          font-style: italic;
          color: rgba(0,0,0,0.25);
          padding: 12px 0;
        }

        /* ── Ambient orb (light version) ── */
        .mm-orb {
          position: absolute;
          border-radius: 50%;
          filter: blur(70px);
          pointer-events: none;
          opacity: 0.18;
          transition: background 0.5s ease;
          z-index: 0;
        }

        /* ── Right aside ── */
        .mm-aside {
          display: flex;
          flex-direction: column;
          border-left: 1px solid rgba(0,0,0,0.07);
          padding: 36px 28px;
          background: #faf9f7;
          gap: 28px;
        }

        .mm-aside-section { display: flex; flex-direction: column; gap: 0; }

        .mm-aside-eyebrow {
          font-family: 'Outfit', sans-serif;
          font-size: 0.54rem;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.28);
          padding-bottom: 10px;
          border-bottom: 1px solid rgba(0,0,0,0.07);
          margin-bottom: 4px;
        }

        .mm-aside-quicklink {
          display: flex;
          align-items: center;
          justify-content: space-between;
          text-decoration: none;
          padding: 9px 0;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: border-color 0.16s;
          gap: 8px;
        }
        .mm-aside-quicklink:hover { border-color: rgba(0,0,0,0.15); }

        .mm-aside-ql-text {
          font-family: 'Outfit', sans-serif;
          font-size: 0.71rem;
          font-weight: 300;
          color: rgba(0,0,0,0.5);
          transition: color 0.16s;
          line-height: 1.35;
        }
        .mm-aside-quicklink:hover .mm-aside-ql-text { color: rgba(0,0,0,0.85); }

        .mm-aside-ql-arrow {
          font-size: 11px;
          color: rgba(0,0,0,0.2);
          transition: color 0.16s, transform 0.16s;
          flex-shrink: 0;
        }
        .mm-aside-quicklink:hover .mm-aside-ql-arrow {
          color: rgba(0,0,0,0.5);
          transform: translateX(3px);
        }

        .mm-aside-sig {
          margin-top: auto;
          border-top: 1px solid rgba(0,0,0,0.07);
          padding-top: 18px;
        }
        .mm-aside-sig-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.8rem;
          font-style: italic;
          color: rgba(0,0,0,0.28);
          line-height: 1.55;
        }
        .mm-aside-sig-mark {
          display: inline-block;
          font-style: normal;
          font-size: 0.95rem;
          margin-right: 5px;
          color: rgba(0,0,0,0.22);
        }

        /* ── Mobile trigger ── */
        .mm-mobile-trigger {
          display: none;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 6px 2px;
          color: var(--text-secondary, #555);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          background: none;
          border: none;
          transition: opacity 0.2s;
        }
        .mm-mobile-trigger:hover { opacity: 0.6; }

        /* ── Mobile drawer ── */
        .mm-mobile-drawer {
          position: fixed;
          inset: 0;
          z-index: 200;
          background: #ffffff;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
          transition: opacity 0.28s ease, transform 0.28s cubic-bezier(0.22,1,0.36,1);
          transform-origin: top;
        }
        .mm-mobile-drawer.closed { opacity: 0; transform: translateY(-8px); pointer-events: none; }
        .mm-mobile-drawer.opened { opacity: 1; transform: translateY(0); pointer-events: auto; }

        .mm-mobile-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid rgba(0,0,0,0.08);
          position: sticky;
          top: 0;
          background: #ffffff;
          z-index: 10;
        }
        .mm-mobile-header-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.4);
        }
        .mm-mobile-close {
          display: flex; align-items: center; justify-content: center;
          width: 32px; height: 32px;
          background: none; border: none; cursor: pointer;
          color: rgba(0,0,0,0.5);
          transition: opacity 0.2s;
        }
        .mm-mobile-close:hover { opacity: 0.5; }

        /* Category accordion */
        .mm-mob-cat {
          border-bottom: 1px solid rgba(0,0,0,0.07);
        }
        .mm-mob-cat-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          cursor: pointer;
          transition: background 0.16s;
        }
        .mm-mob-cat-header:hover { background: rgba(0,0,0,0.02); }
        .mm-mob-cat-header.open { background: rgba(0,0,0,0.025); }

        .mm-mob-cat-info { display: flex; align-items: center; gap: 10px; }
        .mm-mob-cat-dot {
          width: 6px; height: 6px; border-radius: 50%;
          flex-shrink: 0;
        }
        .mm-mob-cat-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.82rem;
          font-weight: 400;
          color: rgba(0,0,0,0.75);
          letter-spacing: 0.02em;
        }
        .mm-mob-cat-count {
          font-family: 'Outfit', sans-serif;
          font-size: 0.6rem;
          color: rgba(0,0,0,0.3);
        }
        .mm-mob-chevron {
          width: 8px; height: 8px;
          border-right: 1.5px solid rgba(0,0,0,0.3);
          border-bottom: 1.5px solid rgba(0,0,0,0.3);
          transform: rotate(45deg) translateY(-2px);
          transition: transform 0.22s;
        }
        .mm-mob-chevron.open { transform: rotate(-135deg) translateY(2px); }

        .mm-mob-subs {
          overflow: hidden;
          transition: max-height 0.32s cubic-bezier(0.4,0,0.2,1);
          max-height: 0;
        }
        .mm-mob-subs.open { max-height: 800px; }

        .mm-mob-browse-all {
          display: flex;
          align-items: center;
          gap: 6px;
          padding: 12px 20px 12px 36px;
          font-family: 'Outfit', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.04em;
          text-decoration: none;
          color: rgba(0,0,0,0.65);
          border-bottom: 1px solid rgba(0,0,0,0.05);
          transition: background 0.14s;
        }
        .mm-mob-browse-all:hover { background: rgba(0,0,0,0.03); }

        .mm-mob-sub-link {
          display: flex;
          flex-direction: column;
          padding: 11px 20px 11px 36px;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.04);
          transition: background 0.14s;
        }
        .mm-mob-sub-link:hover { background: rgba(0,0,0,0.025); }
        .mm-mob-sub-name {
          font-family: 'Outfit', sans-serif;
          font-size: 0.75rem;
          color: rgba(0,0,0,0.6);
          letter-spacing: 0.02em;
          line-height: 1.3;
        }
        .mm-mob-sub-desc {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.72rem;
          font-style: italic;
          color: rgba(0,0,0,0.3);
        }

        /* Mobile quick links */
        .mm-mob-quicklinks {
          padding: 24px 20px 0;
        }
        .mm-mob-quicklinks-title {
          font-family: 'Outfit', sans-serif;
          font-size: 0.54rem;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,0,0,0.3);
          margin-bottom: 12px;
        }
        .mm-mob-ql-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 0;
          text-decoration: none;
          border-bottom: 1px solid rgba(0,0,0,0.05);
          font-family: 'Outfit', sans-serif;
          font-size: 0.74rem;
          color: rgba(0,0,0,0.5);
          transition: color 0.14s;
        }
        .mm-mob-ql-link:hover { color: rgba(0,0,0,0.85); }

        .mm-mob-footer {
          padding: 28px 20px;
          margin-top: auto;
          border-top: 1px solid rgba(0,0,0,0.06);
        }
        .mm-mob-footer-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: 0.85rem;
          font-style: italic;
          color: rgba(0,0,0,0.28);
          line-height: 1.5;
        }

        /* Responsive breakpoints */
        @media (min-width: 768px) {
          .mm-trigger { display: inline-flex !important; }
          .mm-mobile-trigger { display: none !important; }
        }
        @media (max-width: 767px) {
          .mm-trigger { display: none !important; }
          .mm-mobile-trigger { display: inline-flex !important; }
          .mm-backdrop, .mm-panel { display: none !important; }
        }

        /* Tablet: collapse aside on smaller desktops */
        @media (min-width: 768px) and (max-width: 1024px) {
          .mm-panel { grid-template-columns: 180px 1fr; }
          .mm-aside { display: none; }
          .mm-centre { padding: 28px 32px; }
          .mm-rail { padding: 24px 0; }
          .mm-subgrid { grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); }
        }
      `}</style>

      {/* ── Desktop wrapper ── */}
      <div ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave} className="mm-desktop-wrapper">
        <button
          className="mm-trigger"
          aria-expanded={open}
          disabled={loading || error}
          style={{ color: 'var(--text-secondary, #666)' }}
        >
          {loading ? (
            <span className="mm-loading-bar" />
          ) : error ? (
            'Collections'
          ) : (
            <>
              Collections
              <span className={`mm-chevron ${open ? 'open' : ''}`} />
              <span className="mm-trigger-underline" />
            </>
          )}
        </button>

        <div
          className={`mm-backdrop ${open && !loading && !error ? 'opened' : 'closed'}`}
          onClick={() => setOpen(false)}
        />

        {!loading && !error && activeCategory && (
          <PanelInner
            open={open}
            categories={categories}
            activeIdx={activeIdx}
            palette={palette}
            onCategoryHover={setActiveIdx}
            onClose={() => setOpen(false)}
          />
        )}
      </div>

      {/* ── Mobile trigger ── */}
      <button
        className="mm-mobile-trigger"
        onClick={() => setMobileOpen(true)}
        style={{ color: 'var(--text-secondary, #666)' }}
      >
        Collections
        <span className="mm-chevron" style={{ marginTop: '2px' }} />
      </button>

      {/* ── Mobile drawer ── */}
      <div className={`mm-mobile-drawer ${mobileOpen ? 'opened' : 'closed'}`}>
        <div className="mm-mobile-header">
          <span className="mm-mobile-header-title">Collections</span>
          <button className="mm-mobile-close" onClick={() => { setMobileOpen(false); setMobileCatIdx(null); }}>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        </div>

        {loading && (
          <div style={{ padding: '24px 20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[1,2,3,4].map(i => <span key={i} className="mm-loading-bar" style={{ width: `${60 + i * 20}px`, height: 10 }} />)}
          </div>
        )}

        {!loading && !error && categories.map((cat, i) => {
          const p = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
          const isOpen = mobileCatIdx === i;
          return (
            <div key={cat.slug} className="mm-mob-cat">
              <div
                className={`mm-mob-cat-header ${isOpen ? 'open' : ''}`}
                onClick={() => setMobileCatIdx(isOpen ? null : i)}
              >
                <div className="mm-mob-cat-info">
                  <span className="mm-mob-cat-dot" style={{ background: p.accent }} />
                  <span className="mm-mob-cat-name">{cat.label}</span>
                  <span className="mm-mob-cat-count">{cat.subcategories.length}</span>
                </div>
                <span className={`mm-mob-chevron ${isOpen ? 'open' : ''}`} />
              </div>

              <div className={`mm-mob-subs ${isOpen ? 'open' : ''}`}>
                <Link
                  href={cat.href}
                  className="mm-mob-browse-all"
                  onClick={() => setMobileOpen(false)}
                  style={{ color: p.accent }}
                >
                  Browse all {cat.label} →
                </Link>
                {cat.subcategories.map(sub => (
                  <Link
                    key={sub.slug}
                    href={sub.href}
                    className="mm-mob-sub-link"
                    onClick={() => setMobileOpen(false)}
                  >
                    <span className="mm-mob-sub-name">{sub.label}</span>
                    {sub.description && <span className="mm-mob-sub-desc">{sub.description}</span>}
                  </Link>
                ))}
              </div>
            </div>
          );
        })}

        {/* Quick links */}
        {!loading && !error && (
          <div className="mm-mob-quicklinks">
            <div className="mm-mob-quicklinks-title">Quick access</div>
            {[
              { label: 'New arrivals', href: '/products?new=true' },
              { label: 'GIA certified stones', href: '/products?certified=true' },
              { label: 'Under ₹50,000', href: '/products?sort=price_asc&max=50000' },
              { label: 'Understanding the 4 Cs', href: '/guide/4cs' },
            ].map(l => (
              <Link key={l.href} href={l.href} className="mm-mob-ql-link" onClick={() => setMobileOpen(false)}>
                <span>{l.label}</span>
                <span style={{ fontSize: 12, opacity: 0.4 }}>›</span>
              </Link>
            ))}
          </div>
        )}

        <div className="mm-mob-footer">
          <p className="mm-mob-footer-text">◆ Fine diamonds & gemstones, curated for discerning eyes.</p>
        </div>
      </div>
    </>
  );
}

// ─── Desktop Panel ────────────────────────────────────────────────────────────
function PanelInner({
  open,
  categories,
  activeIdx,
  palette,
  onCategoryHover,
  onClose,
}: {
  open: boolean;
  categories: Category[];
  activeIdx: number;
  palette: { bg: string; accent: string; dim: string; tint: string };
  onCategoryHover: (i: number) => void;
  onClose: () => void;
}) {
  const [panelTop, setPanelTop] = useState(0);

  useEffect(() => {
    const update = () => {
      const nav = document.querySelector('nav');
      if (nav) setPanelTop(nav.getBoundingClientRect().bottom);
    };
    update();
    window.addEventListener('scroll', update, { passive: true });
    return () => window.removeEventListener('scroll', update);
  }, []);

  const cat = categories[activeIdx];
  const subCount = cat.subcategories.length;
  const countLabel = subCount === 0
    ? 'Explore the full collection'
    : subCount === 1 ? '1 style available' : `${subCount} styles to explore`;

  const words = cat.label.split(' ');
  const titleDisplay = words.length > 1
    ? <>{words.slice(0, -1).join(' ')} <em>{words[words.length - 1]}</em></>
    : cat.label;

  return (
    <div className={`mm-panel ${open ? 'opened' : 'closed'}`} style={{ top: panelTop }}>

      {/* Rail */}
      <div className="mm-rail">
        <div className="mm-rail-eyebrow">Collections</div>
        {categories.map((c, i) => {
          const p = CATEGORY_PALETTE[i % CATEGORY_PALETTE.length];
          return (
            <div
              key={c.slug}
              className={`mm-rail-item ${i === activeIdx ? 'active' : ''}`}
              onMouseEnter={() => onCategoryHover(i)}
            >
              <span
                className="mm-rail-indicator"
                style={{ background: i === activeIdx ? p.accent : 'transparent' }}
              />
              <span className="mm-rail-num">{String(i + 1).padStart(2, '0')}</span>
              <span className="mm-rail-label">{c.label}</span>
              <span className="mm-rail-count">{c.subcategories.length}</span>
            </div>
          );
        })}
      </div>

      {/* Centre */}
      <div className="mm-centre" style={{ background: palette.bg }}>
        {/* Ambient orb */}
        <span
          className="mm-orb"
          style={{ width: 300, height: 300, top: -80, right: -60, background: palette.accent }}
        />

        <div className="mm-cat-hero">
          <div className="mm-cat-hero-label">{countLabel}</div>
          <h2 className="mm-cat-title">{titleDisplay}</h2>
          {cat.description && <p className="mm-cat-desc">{cat.description}</p>}
          <Link
            href={cat.href}
            className="mm-viewall-btn"
            onClick={onClose}
            style={{ borderColor: `${palette.accent}55`, color: palette.accent }}
          >
            Browse all {cat.label.toLowerCase()}
            <span className="mm-viewall-arrow">→</span>
          </Link>
        </div>

        {cat.subcategories.length === 0 ? (
          <p className="mm-empty-state">The full collection awaits.</p>
        ) : (
          <div className="mm-subgrid" key={cat.slug}>
            {cat.subcategories.map((sub) => (
              <Link key={sub.slug} href={sub.href} className="mm-sub-link" onClick={onClose}>
                <style>{`.mm-sub-link:hover::before { background: ${palette.accent}; }`}</style>
                <span className="mm-sub-name">{sub.label}</span>
                {sub.description && <span className="mm-sub-tagline">{sub.description}</span>}
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Aside */}
      <div className="mm-aside">
        <div className="mm-aside-section">
          <div className="mm-aside-eyebrow">Quick access</div>
          {[
            { label: 'New arrivals', href: '/products?new=true' },
            { label: 'GIA certified stones', href: '/products?certified=true' },
            { label: 'Under ₹50,000', href: '/products?sort=price_asc&max=50000' },
            { label: 'Featured pieces', href: '/products?featured=true' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="mm-aside-quicklink" onClick={onClose}>
              <span className="mm-aside-ql-text">{l.label}</span>
              <span className="mm-aside-ql-arrow">›</span>
            </Link>
          ))}
        </div>

        <div className="mm-aside-section">
          <div className="mm-aside-eyebrow">Need guidance?</div>
          {[
            { label: 'How to read a gem report', href: '/guide/gem-reports' },
            { label: 'Understanding the 4 Cs', href: '/guide/4cs' },
            { label: 'Natural vs lab-grown', href: '/guide/natural-vs-lab' },
          ].map((l) => (
            <Link key={l.href} href={l.href} className="mm-aside-quicklink" onClick={onClose}>
              <span className="mm-aside-ql-text">{l.label}</span>
              <span className="mm-aside-ql-arrow">›</span>
            </Link>
          ))}
        </div>

        <div className="mm-aside-sig">
          <p className="mm-aside-sig-text">
            <span className="mm-aside-sig-mark">◆</span>
            Fine diamonds &amp; gemstones, curated for discerning eyes.
          </p>
        </div>
      </div>
    </div>
  );
}