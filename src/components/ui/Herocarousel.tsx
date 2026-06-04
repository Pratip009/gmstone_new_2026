"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";



/* ─────────────────────────────────────────────────────────────
   Slides — local images + original content
────────────────────────────────────────────────────────────── */
const BANNERS = [
  {
    id: 1,
    img: "/images/i1.png",
    eyebrow: "Exclusive Offer",
    line1: "Alpha Color",
    line2: "Diamonds",
    tag: "½ Off",
    cta: "Shop Now",
    href: "/collections/color-diamonds",
    accent: "#b8c9d4",
    accentGlow: "#5a8fa8",
  },
  {
    id: 2,
    img: "/images/i2.png",
    eyebrow: "Curated Luxury",
    line1: "Alpha Collection",
    line2: "Jewels",
    tag: "½ Off",
    cta: "Explore",
    href: "/collections/jewels",
    accent: "#b8c9d4",
    accentGlow: "#5a8fa8",
  },
  {
    id: 3,
    img: "/images/i3.png",
    eyebrow: "Find Your Stone",
    line1: "Shop",
    line2: "Birthstones",
    tag: "½ Off",
    cta: "Find Yours",
    href: "/collections/birthstones",
    accent: "#c9b8d4",
    accentGlow: "#8a5aa8",
  },
  {
    id: 4,
    img: "/images/i4.png",
    eyebrow: "Price Promise",
    line1: "Alpha White",
    line2: "Diamonds",
    tag: "Best Price",
    cta: "View Diamonds",
    href: "/collections/white-diamonds",
    accent: "#d4d4d4",
    accentGlow: "#9ab0bc",
  },
  {
    id: 5,
    img: "/images/i5.png",
    eyebrow: "At Alpha",
    line1: "Finest Precious",
    line2: "Jewels",
    tag: "½ Off",
    cta: "Shop Jewels",
    href: "/collections/precious-jewels",
    accent: "#b8c9d4",
    accentGlow: "#5a8fa8",
  },
  {
    id: 6,
    img: "/images/i6.png",
    eyebrow: "Ethically Sourced",
    line1: "Natural Jewels",
    line2: "From the World",
    tag: "New In",
    cta: "Discover",
    href: "/collections/natural-jewels",
    accent: "#b8d4c0",
    accentGlow: "#5aa87a",
  },
  {
    id: 7,
    img: "/images/i7.png",
    eyebrow: "Trade Preferred",
    line1: "Jewelers'",
    line2: "Top Choice",
    tag: "#1 Pick",
    cta: "Shop Trade",
    href: "/collections/trade",
    accent: "#b8c9d4",
    accentGlow: "#5a8fa8",
  },
] as const;

const AUTO_ROTATE_MS = 6000;

// ── Diamond-shaped sparkle (cinematic) ──────────────────────────────────────
function DiamondIcon({ accent, size = 10 }: { accent: string; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 12 12" fill="none" aria-hidden="true">
      <rect
        x="6" y="0.5"
        width="7.5" height="7.5"
        transform="rotate(45 6 6)"
        fill={accent}
        fillOpacity="0.85"
      />
    </svg>
  );
}

// ── Scanline texture overlay ─────────────────────────────────────────────────
function Scanlines() {
  return (
    <div
      className="absolute inset-0 pointer-events-none z-10"
      style={{
        backgroundImage:
          "repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0,0,0,0.06) 2px, rgba(0,0,0,0.06) 4px)",
        mixBlendMode: "multiply",
      }}
    />
  );
}

const EASE = [0.16, 1, 0.3, 1] as [number, number, number, number];

const stagger = (i: number) => ({
  hidden: { opacity: 0, x: -18, filter: "blur(4px)" },
  visible: {
    opacity: 1,
    x: 0,
    filter: "blur(0px)",
    transition: { delay: 0.08 + i * 0.12, duration: 0.7, ease: EASE },
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

  const next = useCallback(() => setCurrent((c) => (c + 1) % BANNERS.length), []);
  const prev = useCallback(() => setCurrent((c) => (c - 1 + BANNERS.length) % BANNERS.length), []);

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
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 44) dx < 0 ? next() : prev();
  };

  const b = BANNERS[current];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,300;0,400;1,300;1,400&family=Barlow+Condensed:wght@200;300;400&display=swap');
        .hero-display { font-family: 'Playfair Display', Georgia, serif; }
        .hero-label   { font-family: 'Barlow Condensed', sans-serif; font-weight: 300; }
        :root { --carousel-h: 42svh; }
        @media (min-width: 640px) { :root { --carousel-h: 70vh; } }
      `}</style>

      <section
        className="relative w-full select-none"
        style={{ background: "#04080c" }}
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
              initial={{ opacity: 0, scale: 1.04 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={{ duration: 1.2, ease: "easeInOut" }}
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



              {/* ── Text block ── */}
              <div className="absolute inset-0 flex items-center z-20">
                <div
                  className="flex flex-col"
                  style={{
                    paddingLeft: "clamp(24px, 7vw, 140px)",
                    paddingRight: "clamp(20px, 4vw, 60px)",
                    maxWidth: "clamp(260px, 60vw, 600px)",
                  }}
                >
                  {/* Eyebrow — wide-tracked label */}
                  <motion.div
                    key={`${current}-eyebrow`}
                    variants={stagger(0)}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-3 mb-3 sm:mb-5"
                  >
                    <DiamondIcon accent={b.accent} size={7} />
                    <span
                      className="hero-label"
                      style={{
                        fontSize: "clamp(8px, 0.9vw, 10px)",
                        letterSpacing: "0.38em",
                        textTransform: "uppercase",
                        color: b.accent,
                        opacity: 0.9,
                      }}
                    >
                      {b.eyebrow}
                    </span>
                    <div
                      style={{
                        flex: 1,
                        height: 1,
                        maxWidth: 48,
                        background: `linear-gradient(to right, ${b.accent}66, transparent)`,
                      }}
                    />
                  </motion.div>

                  {/* Headline line 1 */}
                  <motion.h2
                    key={`${current}-l1`}
                    variants={stagger(1)}
                    initial="hidden"
                    animate="visible"
                    className="hero-display text-white"
                    style={{
                      fontSize: "clamp(28px, 5.8vw, 92px)",
                      fontWeight: 300,
                      lineHeight: 0.9,
                      letterSpacing: "-0.01em",
                      textShadow: `0 0 80px ${b.accentGlow}40, 0 4px 40px rgba(0,0,0,0.6)`,
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
                    className="hero-display text-white"
                    style={{
                      fontSize: "clamp(28px, 5.8vw, 92px)",
                      fontWeight: 300,
                      fontStyle: "italic",
                      lineHeight: 0.9,
                      letterSpacing: "-0.01em",
                      textShadow: `0 0 80px ${b.accentGlow}40, 0 4px 40px rgba(0,0,0,0.6)`,
                      color: b.accent,
                      marginBottom: "clamp(12px, 2.5vh, 32px)",
                    }}
                  >
                    {b.line2}
                  </motion.h2>

                  {/* Divider — thin ruled line */}
                  <motion.div
                    key={`${current}-rule`}
                    variants={stagger(3)}
                    initial="hidden"
                    animate="visible"
                    style={{
                      width: 56,
                      height: 1,
                      background: `linear-gradient(to right, ${b.accent}cc, transparent)`,
                      marginBottom: "clamp(12px, 2.5vh, 28px)",
                    }}
                  />

                  {/* Offer tag + CTA */}
                  <motion.div
                    key={`${current}-cta`}
                    variants={stagger(4)}
                    initial="hidden"
                    animate="visible"
                    className="flex items-center gap-5 flex-wrap"
                  >
                    {/* Badge — outlined cinematic style */}
                    <span
                      className="hero-label"
                      style={{
                        fontSize: "clamp(8px, 0.95vw, 10px)",
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: b.accent,
                        border: `1px solid ${b.accent}66`,
                        padding: "5px 14px",
                        display: "inline-block",
                        background: `${b.accentGlow}10`,
                      }}
                    >
                      {b.tag}
                    </span>

                    {/* CTA */}
                    <a
                      href={b.href}
                      className="hero-label group inline-flex items-center gap-2"
                      style={{
                        fontSize: "clamp(8px, 0.95vw, 10px)",
                        letterSpacing: "0.32em",
                        textTransform: "uppercase",
                        color: "rgba(255,255,255,0.7)",
                        textDecoration: "none",
                        transition: "color 0.3s",
                      }}
                      onMouseEnter={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color = b.accent;
                      }}
                      onMouseLeave={(e) => {
                        (e.currentTarget as HTMLAnchorElement).style.color =
                          "rgba(255,255,255,0.7)";
                      }}
                    >
                      {b.cta}
                      <ChevronRight
                        size={10}
                        strokeWidth={1.5}
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
            className="absolute top-5 right-5 z-30 hero-label"
            aria-live="polite"
            aria-atomic="true"
            style={{
              fontSize: 9,
              letterSpacing: "0.28em",
              color: "rgba(255,255,255,0.28)",
            }}
          >
            {String(current + 1).padStart(2, "0")} / {String(BANNERS.length).padStart(2, "0")}
          </div>

          {/* ── Arrows ── */}
          {(["prev", "next"] as const).map((dir) => (
            <button
              key={dir}
              onClick={dir === "prev" ? prev : next}
              aria-label={dir === "prev" ? "Previous slide" : "Next slide"}
              className="hidden sm:flex absolute top-1/2 -translate-y-1/2 z-30 items-center justify-center focus:outline-none"
              style={{
                [dir === "prev" ? "left" : "right"]: "clamp(12px, 2.5vw, 32px)",
                width: "clamp(34px, 3vw, 46px)",
                height: "clamp(34px, 3vw, 46px)",
                background: "rgba(4,8,12,0.55)",
                backdropFilter: "blur(16px)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "rgba(255,255,255,0.5)",
                borderRadius: 0,
                transition: "all 0.25s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = `${b.accentGlow}22`;
                el.style.borderColor = `${b.accent}55`;
                el.style.color = b.accent;
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget as HTMLButtonElement;
                el.style.background = "rgba(4,8,12,0.55)";
                el.style.borderColor = "rgba(255,255,255,0.08)";
                el.style.color = "rgba(255,255,255,0.5)";
              }}
            >
              {dir === "prev" ? (
                <ChevronLeft size={14} strokeWidth={1.5} />
              ) : (
                <ChevronRight size={14} strokeWidth={1.5} />
              )}
            </button>
          ))}

          {/* ── Vertical tick nav — desktop right edge ── */}
          <div className="absolute right-5 bottom-16 z-30 hidden sm:flex flex-col items-center gap-[10px]">
            {BANNERS.map((_, i) => (
              <button
                key={i}
                onClick={() => go(i)}
                aria-label={`Go to slide ${i + 1}`}
                style={{
                  width: 1,
                  height: i === current ? 32 : 10,
                  background:
                    i === current ? b.accent : "rgba(255,255,255,0.2)",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                  transition: "all 0.45s ease",
                }}
              />
            ))}
          </div>
        </div>

        {/* ── Progress bar ── */}
        <div
          className="relative w-full overflow-hidden"
          style={{ height: 1, background: "rgba(255,255,255,0.04)" }}
        >
          {!isPaused && (
            <motion.div
              key={`progress-${current}`}
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: AUTO_ROTATE_MS / 1000, ease: "linear" }}
              className="absolute inset-0 origin-left"
              style={{ background: b.accent }}
            />
          )}
        </div>

        {/* ── Dot nav — mobile only ── */}
        <div
          className="flex sm:hidden items-center justify-center gap-[10px] py-3"
          style={{ background: "#04080c" }}
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
                height: 1,
                width: i === current ? 28 : 8,
                background:
                  i === current ? b.accent : "rgba(255,255,255,0.15)",
                border: "none",
                padding: 0,
                cursor: "pointer",
                transition: "all 0.45s ease",
              }}
            />
          ))}
        </div>
      </section>
    </>
  );
}