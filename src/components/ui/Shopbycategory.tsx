'use client';

import { useEffect, useRef, useState, useCallback } from 'react';

// ─── Types ────────────────────────────────────────────────────────────────────
interface RawCategory {
  _id: string | { toString(): string };
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface Category {
  _id: string;
  name: string;
  slug: string;
  description: string;
  image: string;
  accentColor: string;
  tagline: string;
  icon: string;
  itemCount: number;
  startingPrice: string;
}

// ─── UI constants ─────────────────────────────────────────────────────────────
const ACCENT_COLORS = ['#4f7cac','#9b2335','#2d6a4f','#1a3a6b','#7c5c2e','#4b3f8c','#7a6a5a'];
const ICONS         = ['◆','❖','✦','◈','⬡','⬟','○'];
const TAGLINES      = ['GIA Certified','Pigeon Blood Grade','Natural & Untreated','Kashmir Origin','Bespoke Settings','Single Source','Sea-Harvested'];
const IMAGES        = [
  'https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/3738918/pexels-photo-3738918.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/2849742/pexels-photo-2849742.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/691046/pexels-photo-691046.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/248077/pexels-photo-248077.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/2697521/pexels-photo-2697521.jpeg?auto=compress&cs=tinysrgb&w=900',
  'https://images.pexels.com/photos/1191531/pexels-photo-1191531.jpeg?auto=compress&cs=tinysrgb&w=900',
];

// ─── Responsive hook ──────────────────────────────────────────────────────────
function useBreakpoint() {
  const [bp, setBp] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');
  useEffect(() => {
    const update = () => {
      const w = window.innerWidth;
      setBp(w < 640 ? 'mobile' : w < 1024 ? 'tablet' : 'desktop');
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  return bp;
}

// ─── API fetch ────────────────────────────────────────────────────────────────
async function fetchCategories(): Promise<Category[]> {
  const res = await fetch('/api/categories', { cache: 'no-store' });
  if (!res.ok) throw new Error('Failed to fetch categories');
  const json = await res.json();
  const data: RawCategory[] = json.data ?? json;
  return data.map((cat, i) => ({
    _id:           cat._id.toString(),
    name:          cat.name,
    slug:          cat.slug,
    description:   cat.description ?? '',
    image:         IMAGES[i % IMAGES.length],
    accentColor:   ACCENT_COLORS[i % ACCENT_COLORS.length],
    tagline:       TAGLINES[i % TAGLINES.length],
    icon:          ICONS[i % ICONS.length],
    itemCount:     0,
    startingPrice: '₹0',
  }));
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function SkeletonCard({ w, h }: { w: number; h: number }) {
  return (
    <div
      className="flex-shrink-0 relative overflow-hidden"
      style={{ width: w, height: h, borderRadius: 3, background: '#f0ede8' }}
    >
      <div className="absolute inset-0 shimmer-skeleton" />
    </div>
  );
}

// ─── Category Card ────────────────────────────────────────────────────────────
function CategoryCard({
  cat,
  w,
  h,
  isCenter,
  onClick,
}: {
  cat:      Category;
  w:        number;
  h:        number;
  isCenter: boolean;
  onClick?: () => void;
}) {
  const [hovered, setHovered] = useState(false);
  const lit = hovered || isCenter;

  return (
    <div
      className="flex-shrink-0 relative overflow-hidden"
      style={{
        width:        w,
        height:       h,
        borderRadius: 3,
        cursor:       onClick ? 'pointer' : 'default',
        // Center card lifts up; side cards recede
        opacity:      isCenter ? 1 : 0.6,
        transform:    isCenter
          ? 'translateY(-14px) scale(1.04)'
          : 'translateY(0) scale(0.97)',
        boxShadow: lit
          ? `0 28px 64px -12px ${cat.accentColor}50, 0 0 0 1px ${cat.accentColor}28`
          : '0 4px 20px -4px rgba(60,40,20,0.10)',
        transition: 'opacity 0.45s ease, transform 0.45s ease, box-shadow 0.45s ease',
        zIndex:     isCenter ? 10 : 1,
      }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onClick={onClick}
    >
      {/* Image */}
      <img
        src={cat.image}
        alt={cat.name}
        className="absolute inset-0 w-full h-full object-cover"
        style={{ transform: lit ? 'scale(1.06)' : 'scale(1)', transition: 'transform 0.7s ease' }}
      />

      {/* Milky overlay */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(to top,
            rgba(255,252,245,0.97) 0%,
            rgba(255,252,245,0.82) 28%,
            rgba(255,252,245,0.22) 56%,
            rgba(255,252,245,0.02) 100%)`,
        }}
      />

      {/* Accent wash */}
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(170deg, ${cat.accentColor}1a 0%, transparent 50%)`,
          opacity:    lit ? 1 : 0,
          transition: 'opacity 0.5s ease',
        }}
      />

      {/* Top badges */}
      <div className="absolute top-3 left-3 right-3 flex items-start justify-between z-10">
        <span
          style={{
            fontSize:       9,
            textTransform:  'uppercase',
            letterSpacing:  '0.3em',
            padding:        '3px 8px',
            fontFamily:     'sans-serif',
            fontWeight:     500,
            background:     'rgba(255,252,248,0.92)',
            color:          cat.accentColor,
            border:         `1px solid ${cat.accentColor}38`,
            backdropFilter: 'blur(8px)',
          }}
        >
          {cat.tagline}
        </span>
        <span
          style={{
            width:          30,
            height:         30,
            display:        'flex',
            alignItems:     'center',
            justifyContent: 'center',
            fontSize:       13,
            background:     'rgba(255,255,255,0.88)',
            color:          cat.accentColor,
            border:         `1px solid ${cat.accentColor}28`,
            backdropFilter: 'blur(6px)',
          }}
        >
          {cat.icon}
        </span>
      </div>

      {/* Bottom content */}
      <div className="absolute bottom-0 left-0 right-0 z-10" style={{ padding: '12px 16px 20px' }}>
        <p
          style={{
            fontSize:      8,
            textTransform: 'uppercase',
            letterSpacing: '0.45em',
            color:         cat.accentColor,
            fontFamily:    '"Libre Baskerville", Georgia, serif',
            opacity:       0.7,
            marginBottom:  4,
          }}
        >
          Collection
        </p>

        <h3
          style={{
            fontFamily:    '"Playfair Display", Georgia, serif',
            color:         '#1c1410',
            fontSize:      'clamp(1rem, 1.5vw, 1.35rem)',
            fontWeight:    400,
            letterSpacing: '0.01em',
            lineHeight:    1.2,
            marginBottom:  6,
          }}
        >
          {cat.name}
        </h3>

        {/* Description — reveal when active/hovered */}
        <div
          style={{
            maxHeight:    lit ? '48px' : 0,
            opacity:      lit ? 1 : 0,
            overflow:     'hidden',
            transition:   'max-height 0.45s ease, opacity 0.45s ease',
            marginBottom: lit ? 10 : 0,
          }}
        >
          <p style={{ fontSize: 10, lineHeight: 1.6, color: '#6b5c4e', fontFamily: '"Libre Baskerville", Georgia, serif' }}>
            {cat.description}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
          <div>
            <p style={{ fontSize: 8, textTransform: 'uppercase', color: '#a08070', fontFamily: 'sans-serif', letterSpacing: '0.28em' }}>From</p>
            <p style={{ fontSize: 12, fontWeight: 500, color: cat.accentColor, fontFamily: '"Playfair Display", Georgia, serif' }}>
              {cat.startingPrice}
            </p>
          </div>
          <span style={{ fontSize: 8, textTransform: 'uppercase', color: '#b09080', fontFamily: 'sans-serif', letterSpacing: '0.2em' }}>
            {cat.itemCount.toLocaleString()} pcs
          </span>
        </div>

        {/* CTA */}
        <div
          style={{
            marginTop:  10,
            display:    'flex',
            alignItems: 'center',
            gap:        10,
            opacity:    lit ? 1 : 0,
            transform:  lit ? 'translateY(0)' : 'translateY(6px)',
            transition: 'opacity 0.4s ease, transform 0.4s ease',
          }}
        >
          <div style={{ flex: 1, height: 1, background: `linear-gradient(90deg, ${cat.accentColor}55, transparent)` }} />
          <span
            style={{
              fontSize:      9,
              textTransform: 'uppercase',
              letterSpacing: '0.32em',
              color:         cat.accentColor,
              fontFamily:    'sans-serif',
              display:       'flex',
              alignItems:    'center',
              gap:           6,
            }}
          >
            Explore
            <svg width="16" height="6" viewBox="0 0 16 6" fill="none">
              <path d="M0 3H14M11 1L14 3L11 5" stroke={cat.accentColor} strokeWidth="0.8" />
            </svg>
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShopByCategory() {
  const [categories, setCategories]       = useState<Category[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [activeIndex, setActiveIndex]     = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const autoRef      = useRef<ReturnType<typeof setInterval> | null>(null);
  const touchStartX  = useRef<number | null>(null);
  const trackWrapRef = useRef<HTMLDivElement>(null);
  const [trackWidth, setTrackWidth] = useState(0);

  const bp = useBreakpoint();

  // ── Measure container ──────────────────────────────────────────────────────
  useEffect(() => {
    if (!trackWrapRef.current) return;
    const ro = new ResizeObserver(([e]) => setTrackWidth(e.contentRect.width));
    ro.observe(trackWrapRef.current);
    return () => ro.disconnect();
  }, []);

  // ── Fetch ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    fetchCategories()
      .then(data => { setCategories(data); setLoading(false); })
      .catch(() => { setError('Failed to load.'); setLoading(false); });
  }, []);

  // ── Layout math ───────────────────────────────────────────────────────────
  // Number of cards fully visible (excluding partial peeks)
  const visibleCount = bp === 'mobile' ? 1 : bp === 'tablet' ? 3 : 5;
  const GAP          = 14;

  // Card width so exactly `visibleCount` cards fill the track
  const cardW = trackWidth > 0
    ? (trackWidth - (visibleCount - 1) * GAP) / visibleCount
    : 200;
  const cardH = bp === 'mobile' ? 420 : bp === 'tablet' ? 450 : 480;

  // step = one card + gap
  const step = cardW + GAP;

  // ── Navigation ─────────────────────────────────────────────────────────────
  const n = categories.length;

  const goTo = useCallback(
    (idx: number) => {
      if (!n) return;
      setActiveIndex(((idx % n) + n) % n);
    },
    [n]
  );

  // ── Auto-play ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!isAutoPlaying || !n) return;
    autoRef.current = setInterval(() => setActiveIndex(p => (p + 1) % n), 3200);
    return () => { if (autoRef.current) clearInterval(autoRef.current); };
  }, [isAutoPlaying, n]);

  const pauseAuto = useCallback(() => {
    setIsAutoPlaying(false);
    if (autoRef.current) clearInterval(autoRef.current);
    setTimeout(() => setIsAutoPlaying(true), 6000);
  }, []);

  const handlePrev = () => { pauseAuto(); goTo(activeIndex - 1); };
  const handleNext = () => { pauseAuto(); goTo(activeIndex + 1); };

  // ── Touch swipe ────────────────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const d = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(d) > 40) { pauseAuto(); d > 0 ? goTo(activeIndex + 1) : goTo(activeIndex - 1); }
    touchStartX.current = null;
  };

  // ── Build the infinite looped track ───────────────────────────────────────
  //
  // We render a large pool of cards (all categories repeated) so that the active
  // card is always at position (POOL_COPIES / 2) * n + activeIndex, and we
  // translate the track so that card sits centred in the viewport.
  //
  // Using 3 full copies of the array means we never run out of cards on either side.
  const COPIES    = 3;
  const totalCards = n * COPIES;
  // The "canonical" active card sits in copy #1 (0-indexed), i.e. at position n + activeIndex
  const anchorIdx = n + activeIndex; // index within the pool

  // translateX so that anchorIdx card is horizontally centred
  // centre of card at anchorIdx = anchorIdx * step + cardW / 2
  // we want that to equal trackWidth / 2
  // => tx = trackWidth / 2 - anchorIdx * step - cardW / 2
  const tx = trackWidth > 0
    ? trackWidth / 2 - anchorIdx * step - cardW / 2
    : 0;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400&family=Libre+Baskerville:ital,wght@0,400;0,700;1,400&display=swap');

        @keyframes shimmerBG {
          0%   { background-position: -600px 0; }
          100% { background-position:  600px 0; }
        }
        .shimmer-skeleton {
          background: linear-gradient(90deg, #e8e2da 25%, #f5f0e8 50%, #e8e2da 75%);
          background-size: 600px 100%;
          animation: shimmerBG 1.4s infinite linear;
        }
        @keyframes diamondSpin {
          0%   { transform: rotate(0deg)   scale(1);    }
          50%  { transform: rotate(180deg) scale(1.05); }
          100% { transform: rotate(360deg) scale(1);    }
        }
        .diamond-deco         { animation: diamondSpin 12s linear infinite; }
        .diamond-deco-reverse { animation: diamondSpin 18s linear infinite reverse; }
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fade-in { animation: fadeIn 0.8s ease both; }
        .dot-pill { transition: width 0.35s ease, background 0.35s ease; }
        .nav-btn {
          -webkit-tap-highlight-color: transparent;
          touch-action: manipulation;
        }
        .slider-outer {
          user-select: none;
          -webkit-user-select: none;
        }
        /* Soft edge fade masks */
        .track-mask::before,
        .track-mask::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: clamp(24px, 5vw, 80px);
          pointer-events: none;
          z-index: 30;
        }
        .track-mask::before {
          left: 0;
          background: linear-gradient(90deg, #f2ede6ee 0%, transparent 100%);
        }
        .track-mask::after {
          right: 0;
          background: linear-gradient(270deg, #f2ede6ee 0%, transparent 100%);
        }
      `}</style>

      <section
        className="relative overflow-hidden min-h-screen flex flex-col"
        style={{
          background: 'linear-gradient(160deg, #faf8f4 0%, #f5f0e8 40%, #ede8de 100%)',
          fontFamily: '"Libre Baskerville", Georgia, serif',
        }}
      >
        {/* ── Decorative BG ── */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <svg className="absolute -top-24 -right-24 opacity-[0.04] diamond-deco" width="500" height="500" viewBox="0 0 100 100">
            <polygon points="50,2 98,50 50,98 2,50"  fill="none" stroke="#4f7cac" strokeWidth="0.5" />
            <polygon points="50,15 85,50 50,85 15,50" fill="none" stroke="#4f7cac" strokeWidth="0.3" />
            <polygon points="50,28 72,50 50,72 28,50" fill="none" stroke="#4f7cac" strokeWidth="0.2" />
          </svg>
          <svg className="absolute -bottom-16 -left-20 opacity-[0.05] diamond-deco-reverse" width="400" height="400" viewBox="0 0 100 100">
            <polygon points="50,2 98,50 50,98 2,50"  fill="none" stroke="#9b2335" strokeWidth="0.5" />
            <polygon points="50,18 82,50 50,82 18,50" fill="none" stroke="#9b2335" strokeWidth="0.3" />
          </svg>
          <svg className="absolute inset-0 w-full h-full opacity-[0.07]" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots3" x="0" y="0" width="32" height="32" patternUnits="userSpaceOnUse">
                <circle cx="1.5" cy="1.5" r="1" fill="#8a7060" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots3)" />
          </svg>
        </div>

        {/* ── Header ── */}
        <div
          className="relative z-10 text-center fade-in"
          style={{
            paddingTop:    bp === 'mobile' ? '48px' : '72px',
            paddingBottom: bp === 'mobile' ? '28px' : '44px',
            paddingLeft:   '24px',
            paddingRight:  '24px',
          }}
        >
          <div className="flex items-center justify-center gap-4 mb-4">
            <div className="h-px" style={{ width: bp === 'mobile' ? '28px' : '56px', background: 'linear-gradient(90deg, transparent, #b09070)' }} />
            <span style={{ fontSize: 9, textTransform: 'uppercase', color: '#9a7c60', fontFamily: 'sans-serif', letterSpacing: '0.55em' }}>
              Precious Stone Collections
            </span>
            <div className="h-px" style={{ width: bp === 'mobile' ? '28px' : '56px', background: 'linear-gradient(90deg, #b09070, transparent)' }} />
          </div>

          <h1
            style={{
              fontFamily:    '"Playfair Display", Georgia, serif',
              color:         '#1c1410',
              fontSize:      'clamp(1.9rem, 7vw, 3.75rem)',
              fontWeight:    400,
              letterSpacing: '-0.015em',
              lineHeight:    1,
              marginBottom:  12,
            }}
          >
            Shop by{' '}
            <em
              className="not-italic"
              style={{
                background:           'linear-gradient(135deg, #4f7cac 0%, #9b2335 50%, #2d6a4f 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor:  'transparent',
                backgroundClip:       'text',
              }}
            >
              Collection
            </em>
          </h1>

          <p style={{ fontSize: 14, lineHeight: 1.7, color: '#8a7060', maxWidth: 300, margin: '0 auto' }}>
            Each stone hand-selected by our gemologists for brilliance, provenance &amp; rarity.
          </p>
        </div>

        {/* ── Slider ── */}
        <div
          className="relative z-10 flex-1 flex flex-col items-center justify-center slider-outer"
          style={{ paddingBottom: bp === 'mobile' ? '40px' : '56px' }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {error && <p style={{ color: '#b91c1c', fontSize: 14, padding: '80px 0' }}>{error}</p>}

          {!error && (
            /* The outer div clips the overflowing track and shows the fade masks */
            <div
              ref={trackWrapRef}
              className="track-mask relative w-full overflow-hidden"
              style={{ height: cardH + 32 /* headroom for the lift */ }}
            >
              {loading ? (
                /* Skeleton row */
                <div
                  className="absolute inset-0 flex items-center"
                  style={{ gap: GAP, padding: `0 ${GAP}px` }}
                >
                  {Array.from({ length: visibleCount + 2 }).map((_, i) => (
                    <SkeletonCard
                      key={i}
                      w={(trackWidth - (visibleCount - 1) * GAP) / visibleCount || 200}
                      h={cardH}
                    />
                  ))}
                </div>
              ) : n > 0 && trackWidth > 0 ? (
                /*
                 * Live track — a single absolutely-positioned flex row.
                 * Sliding = changing `left`. CSS transition does the animation.
                 * We render COPIES * n cards so the active card is always
                 * surrounded by real cards on both sides.
                 */
                <div
                  className="absolute flex items-end"
                  style={{
                    top:        16,
                    left:       tx,
                    gap:        GAP,
                    height:     cardH,
                    transition: 'left 0.5s cubic-bezier(0.4, 0, 0.2, 1)',
                    willChange: 'left',
                  }}
                >
                  {Array.from({ length: totalCards }, (_, poolIdx) => {
                    const catIdx   = poolIdx % n;
                    const isCenter = poolIdx === anchorIdx;
                    return (
                      <CategoryCard
                        key={poolIdx}
                        cat={categories[catIdx]}
                        w={cardW}
                        h={cardH}
                        isCenter={isCenter}
                        onClick={
                          !isCenter
                            ? () => {
                                pauseAuto();
                                // Compute how many steps this card is from the anchor
                                const diff = poolIdx - anchorIdx;
                                goTo(activeIndex + diff);
                              }
                            : undefined
                        }
                      />
                    );
                  })}
                </div>
              ) : null}
            </div>
          )}

          {/* ── Controls ── */}
          {!loading && !error && n > 0 && (
            <div
              className="flex flex-col items-center"
              style={{ gap: 16, marginTop: bp === 'mobile' ? 20 : 28 }}
            >
              <div className="flex items-center" style={{ gap: 20 }}>
                {/* Prev */}
                <button
                  onClick={handlePrev}
                  aria-label="Previous"
                  className="nav-btn flex items-center justify-center"
                  style={{
                    width:          bp === 'mobile' ? 48 : 44,
                    height:         bp === 'mobile' ? 48 : 44,
                    border:         '1px solid rgba(140,100,70,0.3)',
                    background:     'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(8px)',
                    color:          '#6b4c30',
                    borderRadius:   2,
                    cursor:         'pointer',
                    transition:     'transform 0.2s ease',
                    flexShrink:     0,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M16 5H2M6 1L2 5L6 9" stroke="currentColor" strokeWidth="0.9" />
                  </svg>
                </button>

                {/* Dots */}
                <div className="flex items-center" style={{ gap: 6 }}>
                  {categories.map((c, i) => (
                    <button
                      key={c._id}
                      onClick={() => { pauseAuto(); goTo(i); }}
                      aria-label={`Go to ${c.name}`}
                      className="dot-pill nav-btn"
                      style={{
                        width:        i === activeIndex ? 22 : 6,
                        height:       bp === 'mobile' ? 5 : 4,
                        borderRadius: 3,
                        background:   i === activeIndex
                          ? (categories[activeIndex]?.accentColor ?? '#8a6040')
                          : 'rgba(140,100,70,0.22)',
                        border:  'none',
                        padding: 0,
                        cursor:  'pointer',
                      }}
                    />
                  ))}
                </div>

                {/* Next */}
                <button
                  onClick={handleNext}
                  aria-label="Next"
                  className="nav-btn flex items-center justify-center"
                  style={{
                    width:          bp === 'mobile' ? 48 : 44,
                    height:         bp === 'mobile' ? 48 : 44,
                    border:         '1px solid rgba(140,100,70,0.3)',
                    background:     'rgba(255,255,255,0.72)',
                    backdropFilter: 'blur(8px)',
                    color:          '#6b4c30',
                    borderRadius:   2,
                    cursor:         'pointer',
                    transition:     'transform 0.2s ease',
                    flexShrink:     0,
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.06)'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; }}
                >
                  <svg width="16" height="10" viewBox="0 0 16 10" fill="none">
                    <path d="M0 5H14M10 1L14 5L10 9" stroke="currentColor" strokeWidth="0.9" />
                  </svg>
                </button>
              </div>

              {/* Mobile active label */}
              {bp === 'mobile' && categories[activeIndex] && (
                <p
                  key={activeIndex}
                  className="fade-in"
                  style={{
                    fontSize:      10,
                    textTransform: 'uppercase',
                    color:         categories[activeIndex].accentColor,
                    fontFamily:    'sans-serif',
                    letterSpacing: '0.4em',
                  }}
                >
                  {categories[activeIndex].name}
                </p>
              )}
            </div>
          )}
        </div>
      </section>
    </>
  );
}