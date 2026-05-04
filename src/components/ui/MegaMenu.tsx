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

// Icons assigned by position
const CATEGORY_ICONS = ['◆', '❋', '✦', '⬡', '◈', '✧', '⬟', '◇'];

// ─── Data hook ────────────────────────────────────────────────────────────────
// Calls your existing route: GET /api/categories?withSubcategories=true
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

        // Your route returns: { data: [ { name, slug, description, subcategories: [...] } ] }
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

        if (!cancelled) {
          setCategories(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('[MegaMenu] Failed to load categories:', err);
          setError(true);
          setLoading(false);
        }
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
  const [activeCategory, setActiveCategory] = useState<Category | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  // Set first category as active once data arrives
  useEffect(() => {
    if (categories.length && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  const handleMouseEnter = useCallback(() => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpen(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    closeTimer.current = setTimeout(() => setOpen(false), 120);
  }, []);

  // Close on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Josefin+Sans:wght@400;500;600&display=swap');

        .mm-trigger {
          position: relative;
          display: flex;
          align-items: center;
          gap: 5px;
          cursor: pointer;
          padding: 4px 0;
          color: var(--text-secondary);
          font-size: 0.7rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          text-decoration: none;
          transition: opacity 0.2s;
          font-family: 'Josefin Sans', sans-serif;
          font-weight: 500;
          background: none;
          border: none;
        }

        .mm-trigger:hover { opacity: 0.6; }

        .mm-trigger:disabled {
          opacity: 0.4;
          cursor: default;
        }

        .mm-chevron {
          width: 8px; height: 8px;
          border-right: 1px solid currentColor;
          border-bottom: 1px solid currentColor;
          transform: rotate(45deg) translateY(-2px);
          transition: transform 0.25s ease;
          opacity: 0.6;
          margin-top: 1px;
        }

        .mm-chevron.open {
          transform: rotate(-135deg) translateY(-2px);
        }

        /* ── Loading shimmer ── */
        @keyframes mmShimmer {
          0%   { background-position: -400px 0; }
          100% { background-position:  400px 0; }
        }

        .mm-loading-bar {
          display: inline-block;
          width: 72px;
          height: 8px;
          border-radius: 4px;
          background: linear-gradient(90deg,
            var(--border, #e8e0d0) 25%,
            var(--bg, #faf9f7) 50%,
            var(--border, #e8e0d0) 75%
          );
          background-size: 400px 100%;
          animation: mmShimmer 1.4s infinite linear;
        }

        /* ── Dropdown panel ── */
        .mm-panel {
          position: fixed;
          left: 0; right: 0;
          z-index: 49;
          background: var(--surface, #fff);
          border-bottom: 1px solid var(--border, #e8e0d0);
          box-shadow: 0 24px 60px rgba(0,0,0,0.10), 0 4px 12px rgba(0,0,0,0.04);
          display: grid;
          grid-template-columns: 260px 1fr;
          overflow: hidden;
          transform-origin: top center;
          transition: opacity 0.22s ease, transform 0.22s cubic-bezier(0.22,1,0.36,1);
        }

        .mm-panel.closed {
          opacity: 0;
          transform: translateY(-8px) scaleY(0.97);
          pointer-events: none;
        }

        .mm-panel.opened {
          opacity: 1;
          transform: translateY(0) scaleY(1);
          pointer-events: auto;
        }

        /* ── Left: category list ── */
        .mm-left {
          padding: 28px 0;
          border-right: 1px solid var(--border, #e8e0d0);
          background: var(--bg, #faf9f7);
        }

        .mm-left-header {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.58rem;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--muted, #9a8e7e);
          padding: 0 28px 16px;
          border-bottom: 1px solid var(--border, #e8e0d0);
          margin-bottom: 8px;
        }

        .mm-cat-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 11px 28px;
          cursor: pointer;
          transition: background 0.15s;
          position: relative;
        }

        .mm-cat-item:hover,
        .mm-cat-item.active {
          background: var(--surface, #fff);
        }

        .mm-cat-item.active::before {
          content: '';
          position: absolute;
          left: 0; top: 8px; bottom: 8px;
          width: 2px;
          background: var(--gold, #b8922a);
          border-radius: 0 2px 2px 0;
        }

        .mm-cat-icon {
          font-size: 13px;
          color: var(--gold, #b8922a);
          width: 18px;
          text-align: center;
          flex-shrink: 0;
          transition: transform 0.2s;
        }

        .mm-cat-item.active .mm-cat-icon,
        .mm-cat-item:hover .mm-cat-icon {
          transform: scale(1.2);
        }

        .mm-cat-label {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.72rem;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          color: var(--text, #1a1612);
          transition: color 0.15s;
        }

        .mm-cat-item.active .mm-cat-label { color: var(--gold, #b8922a); }

        .mm-cat-arrow {
          margin-left: auto;
          font-size: 10px;
          color: var(--muted, #9a8e7e);
          opacity: 0;
          transition: opacity 0.15s, transform 0.15s;
        }

        .mm-cat-item.active .mm-cat-arrow,
        .mm-cat-item:hover .mm-cat-arrow {
          opacity: 1;
          transform: translateX(3px);
        }

        /* ── Right: subcategory panel ── */
        .mm-right {
          padding: 32px 40px 36px;
          display: flex;
          flex-direction: column;
        }

        .mm-right-header {
          display: flex;
          align-items: baseline;
          gap: 16px;
          margin-bottom: 24px;
          padding-bottom: 18px;
          border-bottom: 1px solid var(--border, #e8e0d0);
        }

        .mm-right-title {
          font-family: 'Cormorant Garamond', serif;
          font-size: 26px;
          font-weight: 300;
          color: var(--text, #1a1612);
          line-height: 1;
        }

        .mm-right-desc {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.12em;
          color: var(--muted, #9a8e7e);
          text-transform: uppercase;
        }

        .mm-right-viewall {
          margin-left: auto;
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.62rem;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: var(--gold, #b8922a);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 5px;
          transition: opacity 0.2s;
          white-space: nowrap;
          flex-shrink: 0;
        }

        .mm-right-viewall:hover { opacity: 0.65; }

        /* ── Subcategory grid ── */
        .mm-subgrid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(170px, 1fr));
          gap: 4px;
        }

        .mm-sub-item {
          display: flex;
          flex-direction: column;
          gap: 3px;
          padding: 12px 14px;
          border-radius: 3px;
          text-decoration: none;
          transition: background 0.15s, transform 0.15s;
          border: 1px solid transparent;
          animation: mmSubIn 0.22s ease both;
        }

        .mm-sub-item:hover {
          background: var(--bg, #faf9f7);
          border-color: var(--border, #e8e0d0);
          transform: translateY(-1px);
        }

        .mm-sub-label {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.7rem;
          font-weight: 500;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--text, #1a1612);
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.15s;
        }

        .mm-sub-item:hover .mm-sub-label { color: var(--gold, #b8922a); }

        .mm-sub-dot {
          width: 4px; height: 4px;
          border-radius: 50%;
          background: var(--gold, #b8922a);
          opacity: 0.4;
          flex-shrink: 0;
          transition: opacity 0.15s;
        }

        .mm-sub-item:hover .mm-sub-dot { opacity: 1; }

        .mm-sub-desc {
          font-size: 0.68rem;
          color: var(--muted, #9a8e7e);
          line-height: 1.4;
          padding-left: 10px;
        }

        /* ── Empty state ── */
        .mm-empty {
          font-family: 'Cormorant Garamond', serif;
          font-size: 18px;
          font-weight: 300;
          color: var(--muted, #9a8e7e);
          font-style: italic;
          padding: 8px 0;
        }

        @keyframes mmSubIn {
          from { opacity: 0; transform: translateY(6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .mm-sub-item:nth-child(1) { animation-delay: 0.02s; }
        .mm-sub-item:nth-child(2) { animation-delay: 0.05s; }
        .mm-sub-item:nth-child(3) { animation-delay: 0.08s; }
        .mm-sub-item:nth-child(4) { animation-delay: 0.11s; }
        .mm-sub-item:nth-child(5) { animation-delay: 0.14s; }
        .mm-sub-item:nth-child(6) { animation-delay: 0.17s; }
        .mm-sub-item:nth-child(7) { animation-delay: 0.20s; }
        .mm-sub-item:nth-child(8) { animation-delay: 0.23s; }

        /* ── Bottom bar ── */
        .mm-bottom {
          margin-top: auto;
          padding-top: 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          border-top: 1px solid var(--border, #e8e0d0);
        }

        .mm-bottom-tag {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.58rem;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          color: var(--muted, #9a8e7e);
        }

        .mm-bottom-links {
          display: flex;
          gap: 20px;
        }

        .mm-bottom-link {
          font-family: 'Josefin Sans', sans-serif;
          font-size: 0.6rem;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted, #9a8e7e);
          text-decoration: none;
          transition: color 0.15s;
        }

        .mm-bottom-link:hover { color: var(--gold, #b8922a); }

        /* ── Backdrop ── */
        .mm-backdrop {
          position: fixed;
          inset: 0;
          z-index: 48;
          background: rgba(0,0,0,0.18);
          transition: opacity 0.22s ease;
        }

        .mm-backdrop.closed { opacity: 0; pointer-events: none; }
        .mm-backdrop.opened { opacity: 1; pointer-events: auto; }
      `}</style>

      <div ref={menuRef} onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
        {/* Trigger button — disabled while loading or errored */}
        <button
          className="mm-trigger"
          aria-expanded={open}
          disabled={loading || error}
        >
          {loading ? (
            <span className="mm-loading-bar" />
          ) : (
            <>
              Collection
              <span className={`mm-chevron ${open ? 'open' : ''}`} />
            </>
          )}
        </button>

        {/* Backdrop */}
        <div
          className={`mm-backdrop ${open && !loading && !error ? 'opened' : 'closed'}`}
          onClick={() => setOpen(false)}
        />

        {/* Panel — only rendered once data is ready */}
        {!loading && !error && activeCategory && (
          <MegaPanel
            open={open}
            categories={categories}
            activeCategory={activeCategory}
            onCategoryHover={setActiveCategory}
            onClose={() => setOpen(false)}
          />
        )}
      </div>
    </>
  );
}

// ─── Panel sub-component ──────────────────────────────────────────────────────
function MegaPanel({
  open,
  categories,
  activeCategory,
  onCategoryHover,
  onClose,
}: {
  open: boolean;
  categories: Category[];
  activeCategory: Category;
  onCategoryHover: (c: Category) => void;
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

  return (
    <div
      className={`mm-panel ${open ? 'opened' : 'closed'}`}
      style={{ top: panelTop }}
    >
      {/* Left: category list from MongoDB */}
      <div className="mm-left">
        <div className="mm-left-header">Browse by</div>
        {categories.map((cat, i) => (
          <div
            key={cat.slug}
            className={`mm-cat-item ${activeCategory.slug === cat.slug ? 'active' : ''}`}
            onMouseEnter={() => onCategoryHover(cat)}
          >
            <span className="mm-cat-icon">
              {CATEGORY_ICONS[i % CATEGORY_ICONS.length]}
            </span>
            <span className="mm-cat-label">{cat.label}</span>
            <span className="mm-cat-arrow">›</span>
          </div>
        ))}
      </div>

      {/* Right: subcategories for the hovered category */}
      <div className="mm-right">
        <div className="mm-right-header">
          <span className="mm-right-title">{activeCategory.label}</span>
          {activeCategory.description && (
            <span className="mm-right-desc">{activeCategory.description}</span>
          )}
          <Link href={activeCategory.href} className="mm-right-viewall" onClick={onClose}>
            View all →
          </Link>
        </div>

        {activeCategory.subcategories.length === 0 ? (
          <p className="mm-empty">No subcategories yet.</p>
        ) : (
          // key forces re-animation when active category changes
          <div className="mm-subgrid" key={activeCategory.slug}>
            {activeCategory.subcategories.map((sub) => (
              <Link
                key={sub.slug}
                href={sub.href}
                className="mm-sub-item"
                onClick={onClose}
              >
                <span className="mm-sub-label">
                  <span className="mm-sub-dot" />
                  {sub.label}
                </span>
                {sub.description && (
                  <span className="mm-sub-desc">{sub.description}</span>
                )}
              </Link>
            ))}
          </div>
        )}

        <div className="mm-bottom">
          <span className="mm-bottom-tag">◆ Alpha Imports — Fine Diamonds & Gemstones</span>
          <div className="mm-bottom-links">
            <Link href="/products?new=true" className="mm-bottom-link" onClick={onClose}>New arrivals</Link>
            <Link href="/products?certified=true" className="mm-bottom-link" onClick={onClose}>Certified only</Link>
            <Link href="/products?sort=price_asc" className="mm-bottom-link" onClick={onClose}>Price: low–high</Link>
          </div>
        </div>
      </div>
    </div>
  );
}