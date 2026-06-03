"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ─────────────────────────────────────────────────────────────
   Slides — Unsplash jewelry images + premium content
────────────────────────────────────────────────────────────── */
const BANNERS = [
  {
    id: 1,
    img: "https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Exclusive Offer",
    line1: "Alpha Color",
    line2: "Diamonds",
    tag: "½ Off",
    cta: "Shop Now",
    href: "/collections/color-diamonds",
    accent: "#c9a84c",
  },
  {
    id: 2,
    img: "https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Curated Luxury",
    line1: "Alpha Collection",
    line2: "Jewels",
    tag: "½ Off",
    cta: "Explore",
    href: "/collections/jewels",
    accent: "#c9a84c",
  },
  {
    id: 3,
    img: "https://images.unsplash.com/photo-1551717743-49959800b1f6?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Find Your Stone",
    line1: "Shop",
    line2: "Birthstones",
    tag: "½ Off",
    cta: "Find Yours",
    href: "/collections/birthstones",
    accent: "#a87cc9",
  },
  {
    id: 4,
    img: "https://images.unsplash.com/photo-1589674781759-c21c37956a44?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Price Promise",
    line1: "Alpha White",
    line2: "Diamonds",
    tag: "Best Price",
    cta: "View Diamonds",
    href: "/collections/white-diamonds",
    accent: "#e0e0e0",
  },
  {
    id: 5,
    img: "https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "At Alpha",
    line1: "Finest Precious",
    line2: "Jewels",
    tag: "½ Off",
    cta: "Shop Jewels",
    href: "/collections/precious-jewels",
    accent: "#c9a84c",
  },
  {
    id: 6,
    img: "https://images.unsplash.com/photo-1567225477277-c8162eb9e02b?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Ethically Sourced",
    line1: "Natural Jewels",
    line2: "From the World",
    tag: "New In",
    cta: "Discover",
    href: "/collections/natural-jewels",
    accent: "#84c9a8",
  },
  {
    id: 7,
    img: "https://images.unsplash.com/photo-1573408301185-9519f94ae53e?w=1800&h=900&fit=crop&crop=center&q=85",
    eyebrow: "Trade Preferred",
    line1: "Jewelers'",
    line2: "Top Choice",
    tag: "#1 Pick",
    cta: "Shop Trade",
    href: "/collections/trade",
    accent: "#c9a84c",
  },
] as const;

const AUTO_ROTATE_MS = 6000;

function Sparkle({ accent, size = 14 }: { accent: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 20 20" fill="none" aria-hidden="true">
      <path
        d="M10 2L11.5 8.5L18 10L11.5 11.5L10 18L8.5 11.5L2 10L8.5 8.5L10 2Z"
        fill={accent}
        fillOpacity="0.9"
      />
    </svg>
  );
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stagger = (i: number) => ({
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { delay: 0.1 + i * 0.1, duration: 0.6, ease: EASE },
  },
});

export default function HeroCarousel() {
  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef(0);
  const touchStartY = useRef(0);

  const go = useCallback((index: number) => {
    setCurrent((index + BANNERS.length) % BANNERS.length);
  }, []);

  const next = useCallback(() => {
    setCurrent((c) => (c + 1) % BANNERS.length);
  }, []);

  const prev = useCallback(() => {
    setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length);
  }, []);

  useEffect(() => {
    if (isPaused) return;
    const id = setInterval(next, AUTO_ROTATE_MS);
    return () => clearInterval(id);
  }, [isPaused, next]);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") prev();
      if (e.key === "ArrowRight") next();
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [next, prev]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.changedTouches[0].clientX;
    touchStartY.current = e.changedTouches[0].clientY;
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    const dy = e.changedTouches[0].clientY - touchStartY.current;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) {
      dx < 0 ? next() : prev();
    }
  };

  const b = BANNERS[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Tenor+Sans&display=swap');
        .hero-display { font-family: 'Cormorant Garamond', Georgia, serif; }
        .hero-label   { font-family: 'Tenor Sans', sans-serif; }
        :root { --carousel-h: 42svh; }
        @media (min-width: 640px) { :root { --carousel-h: 70vh; } }
      `}</style>

      <section
        className="relative w-full select-none"
        aria-label="Promotional banners"
        aria-roledescription="carousel"
      >
        {/* ── Stage ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: "var(--carousel-h)", minHeight: 280 }}
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <AnimatePresence mode="sync">
            <motion.div
              key={current}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 1.0, ease: "easeInOut" }}
              className="absolute inset-0 w-full h-full"
              aria-roledescription="slide"
              aria-label={`Slide ${current + 1} of ${BANNERS.length}`}
            >
              {/* Background photo */}
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={b.img}
                alt=""
                aria-hidden="true"
                style={{
                  position: "absolute",
                  inset: 0,
                  width: "100%",
                  height: "100%",
                  objectFit: "cover",
                  objectPosition: "center 40%",
                  display: "block",
                }}
                draggable={false}
              />

              {/* Gradient overlays — lighter so image shows through */}
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to top, rgba(0,0,0,0.70) 0%, rgba(0,0,0,0.30) 40%, rgba(0,0,0,0.05) 70%, transparent 100%)",
                }}
              />
              <div
                className="absolute inset-0 pointer-events-none"
                style={{
                  background:
                    "linear-gradient(to right, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0.15) 40%, transparent 70%)",
                }}
              />

              {/* ── Text block ── */}
              <div className="absolute inset-0 flex items-center">
                <div
                  className="flex flex-col"
                  style={{
                    paddingLeft: "clamp(20px, 6vw, 120px)",
                    paddingRight: "clamp(20px, 4vw, 60px)",
                    maxWidth: "clamp(240px, 65vw, 620px)",
                  }}
                >
                  {/* Eyebrow */}
                  <motion.div
                    key={`${current}-eyebrow`}
                    variants={stagger(0)}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-2 mb-3 sm:mb-5"
                  >
                    <Sparkle accent={b.accent} size={10} />
                    <span
                      className="hero-label uppercase"
                      style={{
                        fontSize: "clamp(8px, 1vw, 11px)",
                        letterSpacing: "0.3em",
                        color: b.accent,
                      }}
                    >
                      {b.eyebrow}
                    </span>
                    <Sparkle accent={b.accent} size={10} />
                  </motion.div>

                  {/* Headline line 1 */}
                  <motion.h2
                    key={`${current}-l1`}
                    variants={stagger(1)}
                    initial="hidden"
                    animate="visible"
                    className="hero-display font-light text-white"
                    style={{
                      fontSize: "clamp(26px, 5.5vw, 88px)",
                      lineHeight: 0.92,
                      textShadow: "0 4px 40px rgba(0,0,0,0.25)",
                      margin: 0,
                    }}
                  >
                    {b.line1}
                  </motion.h2>

                  {/* Headline line 2 — italic */}
                  <motion.h2
                    key={`${current}-l2`}
                    variants={stagger(2)}
                    initial="hidden"
                    animate="visible"
                    className="hero-display font-light text-white"
                    style={{
                      fontSize: "clamp(26px, 5.5vw, 88px)",
                      lineHeight: 0.92,
                      fontStyle: "italic",
                      textShadow: "0 4px 40px rgba(0,0,0,0.25)",
                      marginBottom: "clamp(10px, 2vh, 28px)",
                    }}
                  >
                    {b.line2}
                  </motion.h2>

                  {/* Gold rule */}
                  <motion.div
                    key={`${current}-rule`}
                    variants={stagger(3)}
                    initial="hidden"
                    animate="visible"
                    style={{
                      width: 40,
                      height: 1,
                      background: `linear-gradient(to right, ${b.accent}, transparent)`,
                      marginBottom: "clamp(10px, 2vh, 24px)",
                    }}
                  />

                  {/* Offer tag + CTA */}
                  <motion.div
                    key={`${current}-cta`}
                    variants={stagger(4)}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-4 flex-wrap"
                  >
                    {/* Badge */}
                    <span
                      className="hero-label"
                      style={{
                        fontSize: "clamp(8px, 1.1vw, 10px)",
                        letterSpacing: "0.22em",
                        textTransform: "uppercase",
                        color: "#0a0806",
                        background: `linear-gradient(135deg, ${b.accent} 0%, #f5dfa0 100%)`,
                        padding: "5px 12px",
                        display: "inline-block",
                      }}
                    >
                      {b.tag}
                    </span>

                    {/* CTA link */}
                    <a
                      href={b.href}
                      className="hero-label group inline-flex items-center gap-2"
                      style={{
                        fontSize: "clamp(8px, 1.1vw, 10px)",
                        letterSpacing: "0.26em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.88)",
                        textDecoration: "none",
                        borderBottom: `1px solid ${b.accent}55`,
                        paddingBottom: 4,
                        transition: "border-color 0.3s, color 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.borderColor = b.accent;
                        el.style.color = b.accent;
                      }}
                      onMouseLeave={(e) => {
                        const el = e.currentTarget as HTMLAnchorElement;
                        el.style.borderColor = `${b.accent}55`;
                        el.style.color = "rgba(255,255,255,0.88)";
                      }}
                    >
                      {b.cta}
                      <ChevronRight
                        size={10}
                        strokeWidth={2}
                        className="transition-transform duration-300 group-hover:translate-x-1"
                      />
                    </a>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          </AnimatePresence>

          {/* ── Slide counter top-right ── */}
          <div
            className="absolute top-5 right-5 z-20 hero-label"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: 10,
              letterSpacing: "0.22em",
              color: "rgba(255,255,255,0.4)",
              textShadow: "0 1px 8px rgba(0,0,0,0.7)",
            }}
          >
            {String(current + 1).padStart(2, "0")} · {String(BANNERS.length).padStart(2, "0")}
          </div>

          {/* ── Arrows — hidden on mobile (swipe), bottom-right on tablet, center on desktop ── */}
          <button
            onClick={prev}
            aria-label="Previous slide"
            className="hidden sm:flex absolute left-4 md:left-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
            style={{
              width: "clamp(36px, 3.5vw, 50px)",
              height: "clamp(36px, 3.5vw, 50px)",
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              borderRadius: 0,
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(201,168,76,0.18)";
              el.style.borderColor = "rgba(201,168,76,0.5)";
              el.style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(0,0,0,0.3)";
              el.style.borderColor = "rgba(255,255,255,0.1)";
              el.style.color = "rgba(255,255,255,0.8)";
            }}
          >
            <ChevronLeft size={16} strokeWidth={1.5} />
          </button>

          <button
            onClick={next}
            aria-label="Next slide"
            className="hidden sm:flex absolute right-4 md:right-6 top-1/2 -translate-y-1/2 z-20 items-center justify-center transition-all duration-200 hover:scale-105 active:scale-95 focus:outline-none"
            style={{
              width: "clamp(36px, 3.5vw, 50px)",
              height: "clamp(36px, 3.5vw, 50px)",
              background: "rgba(0,0,0,0.3)",
              backdropFilter: "blur(12px)",
              border: "1px solid rgba(255,255,255,0.1)",
              color: "rgba(255,255,255,0.8)",
              borderRadius: 0,
              transition: "all 0.25s",
            }}
            onMouseEnter={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(201,168,76,0.18)";
              el.style.borderColor = "rgba(201,168,76,0.5)";
              el.style.color = "#c9a84c";
            }}
            onMouseLeave={(e) => {
              const el = e.currentTarget as HTMLButtonElement;
              el.style.background = "rgba(0,0,0,0.3)";
              el.style.borderColor = "rgba(255,255,255,0.1)";
              el.style.color = "rgba(255,255,255,0.8)";
            }}
          >
            <ChevronRight size={16} strokeWidth={1.5} />
          </button>

          {/* ── Vertical tick nav — desktop right edge ── */}
          <div className="absolute right-5 bottom-20 z-20 hidden sm:flex flex-col items-center gap-3">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: i === current ? 2 : 1,
                  height: i === current ? 28 : 12,
                  background: i === current ? b.accent : "rgba(255,255,255,0.28)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  borderRadius: 0,
                  transition: "all 0.4s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 1.5, background: "rgba(255,255,255,0.05)" }}
        >
          {!isPaused && (
            <motion.div
              key={`progress-${current}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
              className="absolute inset-0 origin-left"
              style={{
                background: `linear-gradient(to right, ${b.accent}, #f5dfa0, ${b.accent})`,
              }}
            />
          )}
        </div>

        {/* ── Dot nav — mobile only ── */}
        <div
          className="flex sm:hidden items-center justify-center gap-2 py-3"
          style={{ background: "#070503" }}
          role="tablist"
          aria-label="Slide navigation"
        >
          {BANNERS.map((_, i) => (
            <button
              key={i}
              role="tab"
              aria-selected={i === current}
              aria-label={`Go to slide ${i + 1}`}
              onClick={() => go(i)}
              className="focus:outline-none"
              style={{
                height: 2,
                width: i === current ? 24 : 8,
                background: i === current ? b.accent : "rgba(255,255,255,0.2)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                borderRadius: 0,
                transition: "all 0.4s ease",
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}