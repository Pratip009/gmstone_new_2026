/* eslint-disable react-hooks/set-state-in-effect */
"use client";
import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";

// ─── Direct .mp4 stream URLs (not /download/ links) ───────────────────────────
const SLIDES = [
  {
    id: 0,
    video: "https://www.pexels.com/download/video/5106444/",
    poster: "https://images.pexels.com/videos/4763824/pictures/preview-0.jpg",
    eyebrow: "The Crown Collection",
    headline: ["Diamonds", "Born from", "Eternity"],
    sub: "GIA-certified round brilliants, hand-selected for exceptional fire and clarity.",
    cta: { label: "Explore Diamonds", href: "/diamonds" },
    accent: "Diamonds",
  },
  {
    id: 1,
    video: "https://www.pexels.com/download/video/10737829/",
    poster: "https://images.pexels.com/videos/6207378/pictures/preview-0.jpg",
    eyebrow: "Signature Necklaces",
    headline: ["Worn by", "Those Who", "Dare"],
    sub: "Bespoke necklaces crafted in 18k gold, set with the world's rarest stones.",
    cta: { label: "View Collection", href: "/collections" },
    accent: "Necklaces",
  },
  {
    id: 2,
    video: "https://www.pexels.com/download/video/35361259/",
    poster: "https://images.pexels.com/videos/5874374/pictures/preview-0.jpg",
    eyebrow: "Rare Gemstones",
    headline: ["Colour", "Beyond", "Imagination"],
    sub: "Alexandrites, Padparadscha Sapphires, and unheated Burmese Rubies—sourced at origin.",
    cta: { label: "Discover Gems", href: "/gemstones" },
    accent: "Gemstones",
  },
] as const;

const AUTOPLAY_MS = 7000;
const TRANSITION_MS = 900;

export default function HeroCarousel() {
  const [current, setCurrent]   = useState(0);
  const [prev,    setPrev]      = useState<number | null>(null);
  const [busy,    setBusy]      = useState(false);
  const [progress, setProgress] = useState(0);
  const [paused,  setPaused]    = useState(false);

  // Refs — never trigger re-renders
  const videoRefs    = useRef<(HTMLVideoElement | null)[]>([]);
  const rafRef       = useRef<number | null>(null);
  const startRef     = useRef<number>(0);
  const pausedRef    = useRef(false);   // shadow of `paused` for rAF closure
  const busyRef      = useRef(false);   // shadow of `busy`
  const currentRef   = useRef(0);       // shadow of `current`
  const touchStartX  = useRef<number | null>(null);

  // Keep shadow refs in sync
  useEffect(() => { pausedRef.current  = paused;  }, [paused]);
  useEffect(() => { busyRef.current    = busy;    }, [busy]);
  useEffect(() => { currentRef.current = current; }, [current]);

  // ─── goTo ──────────────────────────────────────────────────────────────────
  const goTo = useCallback((idx: number) => {
    if (busyRef.current || idx === currentRef.current) return;
    const from = currentRef.current;

    busyRef.current = true;
    setBusy(true);
    setPrev(from);
    setCurrent(idx);
    setProgress(0);
    startRef.current = performance.now();

    // Swap video: pause old, play new
    const oldVid = videoRefs.current[from];
    const newVid = videoRefs.current[idx];
    if (oldVid) oldVid.pause();
    if (newVid) {
      newVid.currentTime = 0;
      newVid.play().catch(() => {});
    }

    setTimeout(() => {
      setPrev(null);
      setBusy(false);
      busyRef.current = false;
    }, TRANSITION_MS);
  }, []);

  const next = useCallback(() => goTo((currentRef.current + 1) % SLIDES.length), [goTo]);
  const prev_ = useCallback(() => goTo((currentRef.current - 1 + SLIDES.length) % SLIDES.length), [goTo]);

  // ─── rAF progress loop — single loop, no setInterval drift ────────────────
  useEffect(() => {
    startRef.current = performance.now();

    const tick = (now: number) => {
      if (!pausedRef.current) {
        const elapsed = now - startRef.current;
        const pct = Math.min((elapsed / AUTOPLAY_MS) * 100, 100);
        setProgress(pct);
        if (pct >= 100) {
          next();
          startRef.current = performance.now(); // reset immediately in loop
        }
      }
      rafRef.current = requestAnimationFrame(tick);
    };

    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // mount-once — next() is stable via useCallback with no deps that change

  // Reset progress timer when slide changes
  useEffect(() => {
    startRef.current = performance.now();
    setProgress(0);
  }, [current]);

  // ─── Autoplay first video on mount ────────────────────────────────────────
  useEffect(() => {
    const v = videoRefs.current[0];
    if (v) v.play().catch(() => {});
  }, []);

  // ─── Touch / swipe support ────────────────────────────────────────────────
  const onTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 50) dx < 0 ? next() : prev_();
    touchStartX.current = null;
  };

  return (
    <section
      className="relative w-full overflow-hidden bg-[#080706]"
      style={{ height: "100svh", minHeight: 560 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >

      {/* ── VIDEO LAYERS ──────────────────────────────────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          aria-hidden={i !== current}
          className="absolute inset-0"
          style={{
            zIndex: i === current ? 2 : i === prev ? 1 : 0,
            opacity: i === current ? 1 : (i === prev ? 1 : 0),
            transition: i === current
              ? `opacity ${TRANSITION_MS}ms cubic-bezier(0.4,0,0.2,1)`
              : "none",
          }}
        >
          <video
            ref={(el) => { videoRefs.current[i] = el; }}
            src={slide.video}
            poster={slide.poster}
            muted
            loop
            playsInline
            // Only decode/load the first video eagerly; others are lazy
            preload={i === 0 ? "auto" : "none"}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ filter: "brightness(0.42) saturate(0.8)" }}
          />
        </div>
      ))}

      {/* ── CINEMATIC VIGNETTES ───────────────────────────────────────────── */}
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "linear-gradient(180deg,rgba(8,7,6,.65) 0%,transparent 22%)" }} />
      <div className="pointer-events-none absolute inset-0 z-10"
        style={{ background: "linear-gradient(0deg,rgba(8,7,6,.97) 0%,rgba(8,7,6,.45) 38%,transparent 65%)" }} />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-24 md:w-40 z-10"
        style={{ background: "linear-gradient(90deg,rgba(8,7,6,.55) 0%,transparent)" }} />
      <div className="pointer-events-none absolute inset-y-0 right-0 w-24 md:w-40 z-10"
        style={{ background: "linear-gradient(-90deg,rgba(8,7,6,.55) 0%,transparent)" }} />

      {/* ── GRAIN ─────────────────────────────────────────────────────────── */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-10 opacity-[0.028]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundSize: "180px 180px",
        }}
      />

      {/* ── CORNER BRACKETS (desktop only) ───────────────────────────────── */}
      {[
        { pos: "top-6 left-6",    d: "M40 2H2V40" },
        { pos: "top-6 right-6",   d: "M0 2H38V40" },
        { pos: "bottom-6 left-6", d: "M40 38H2V0"  },
        { pos: "bottom-6 right-6",d: "M0 38H38V0"  },
      ].map(({ pos, d }) => (
        <div key={d} className={`absolute ${pos} z-20 pointer-events-none hidden lg:block`}>
          <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
            <path d={d} stroke="#b8912a" strokeWidth="1.5" strokeOpacity="0.55" />
          </svg>
        </div>
      ))}

      {/* ── SLIDE COUNTER (desktop) ───────────────────────────────────────── */}
      <div className="absolute top-6 right-14 lg:right-16 z-30 hidden md:flex items-center gap-2">
        <span className="font-['Jost',sans-serif] text-[0.52rem] tracking-[0.3em] uppercase text-white/35">
          {String(current + 1).padStart(2, "0")}&nbsp;/&nbsp;{String(SLIDES.length).padStart(2, "0")}
        </span>
      </div>

      {/* ── SLIDE CONTENT ────────────────────────────────────────────────── */}
      {SLIDES.map((slide, i) => (
        <div
          key={slide.id}
          className="absolute inset-x-0 bottom-0 z-20 px-5 sm:px-10 md:px-14 lg:px-20
                     pb-28 sm:pb-32 md:pb-36"
          style={{
            opacity: i === current ? 1 : 0,
            transform: i === current ? "translateY(0)" : "translateY(20px)",
            transition: `opacity 0.75s ease ${i === current ? "0.15s" : "0s"},
                         transform 0.75s ease ${i === current ? "0.15s" : "0s"}`,
            pointerEvents: i === current ? "auto" : "none",
          }}
        >
          <div className="max-w-[1400px] mx-auto">

            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-4">
              <div className="w-6 md:w-8 h-px bg-[#b8912a]" />
              <span className="font-['Jost',sans-serif] text-[0.56rem] md:text-[0.6rem]
                               tracking-[0.32em] uppercase font-medium text-[#b8912a]">
                {slide.eyebrow}
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-['Playfair_Display',Georgia,serif] font-black
                         leading-[0.9] mb-5 md:mb-7"
              style={{
                fontSize: "clamp(2.6rem, 8.5vw, 7.5rem)",
                letterSpacing: "-0.015em",
              }}
            >
              {slide.headline.map((line, li) => (
                <span
                  key={li}
                  className="block"
                  style={{
                    color: li === 1 ? "transparent" : "#f5f0e8",
                    WebkitTextStroke: li === 1 ? "1.5px rgba(245,240,232,0.85)" : "0",
                  }}
                >
                  {line}
                </span>
              ))}
            </h1>

            {/* Sub + CTAs */}
            <div className="flex flex-col sm:flex-row sm:items-end
                            gap-5 sm:gap-10 md:gap-16 max-w-2xl">
              <p
                className="font-['Jost',sans-serif] font-light leading-relaxed
                           text-white/55 max-w-xs"
                style={{ fontSize: "clamp(0.8rem, 1.4vw, 0.96rem)", letterSpacing: "0.02em" }}
              >
                {slide.sub}
              </p>

              <div className="flex items-center gap-4 shrink-0">
                <Link
                  href={slide.cta.href}
                  className="group relative flex items-center gap-2.5 px-6 py-3
                             font-['Jost',sans-serif] text-[0.62rem] tracking-[0.24em]
                             uppercase font-semibold text-[#0e0d0b] overflow-hidden"
                  style={{ background: "linear-gradient(135deg,#d4a843,#b8912a)" }}
                >
                  <span className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors duration-300" />
                  {slide.cta.label}
                  <svg className="w-3 h-3 group-hover:translate-x-0.5 transition-transform duration-200 shrink-0"
                    fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                  </svg>
                </Link>
                <Link
                  href="/collections"
                  className="hidden sm:block font-['Jost',sans-serif] text-[0.59rem]
                             tracking-[0.2em] uppercase font-medium text-white/45
                             hover:text-white/85 border-b border-white/20
                             hover:border-white/55 pb-px transition-all duration-200"
                >
                  All Collections
                </Link>
              </div>
            </div>

          </div>
        </div>
      ))}

      {/* ── RIGHT CONTROLS ───────────────────────────────────────────────── */}
      <div className="absolute right-3 md:right-7 top-1/2 -translate-y-1/2 z-30
                      flex flex-col items-center gap-4">
        <button onClick={prev_} aria-label="Previous"
          className="w-8 h-8 flex items-center justify-center border border-white/15
                     text-white/35 hover:text-white hover:border-white/45
                     transition-all duration-200">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
          </svg>
        </button>

        {SLIDES.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            aria-label={`Slide ${i + 1}`}
            className="flex items-center justify-center py-1"
          >
            <span
              className="block rounded-full transition-all duration-500"
              style={{
                width: i === current ? 5 : 3,
                height: i === current ? 18 : 3,
                background: i === current ? "#b8912a" : "rgba(255,255,255,0.22)",
              }}
            />
          </button>
        ))}

        <button onClick={next} aria-label="Next"
          className="w-8 h-8 flex items-center justify-center border border-white/15
                     text-white/35 hover:text-white hover:border-white/45
                     transition-all duration-200">
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>

      {/* ── BOTTOM PROGRESS + LABELS ─────────────────────────────────────── */}
      <div className="absolute bottom-0 inset-x-0 z-30
                      px-5 sm:px-10 md:px-14 lg:px-20 pb-5 md:pb-7">
        <div className="max-w-[1400px] mx-auto">

          {/* Progress bars */}
          <div className="flex gap-1.5 mb-2.5">
            {SLIDES.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="relative flex-1 cursor-pointer overflow-hidden"
                style={{ height: 1, background: "rgba(255,255,255,0.14)" }}
              >
                <span
                  className="absolute inset-y-0 left-0"
                  style={{
                    background: "linear-gradient(90deg,#b8912a,#e0be6a)",
                    width: i === current
                      ? `${progress}%`
                      : i < current ? "100%" : "0%",
                    transition: i === current ? "none" : "width 0.25s ease",
                  }}
                />
              </button>
            ))}
          </div>

          {/* Slide labels */}
          <div className="flex items-center gap-5 md:gap-10">
            {SLIDES.map((slide, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className="font-['Jost',sans-serif] text-[0.52rem] tracking-[0.22em]
                           uppercase transition-all duration-300"
                style={{
                  color: i === current ? "rgba(184,145,42,0.9)" : "rgba(255,255,255,0.22)",
                  fontWeight: i === current ? 600 : 400,
                }}
              >
                {slide.accent}
              </button>
            ))}

            {/* Spacer + pause hint */}
            <span className="ml-auto hidden md:block font-['Jost',sans-serif]
                             text-[0.48rem] tracking-[0.25em] uppercase text-white/18">
              {paused ? "Paused" : "Auto"}
            </span>
          </div>
        </div>
      </div>

      {/* ── SCROLL HINT ──────────────────────────────────────────────────── */}
      <div className="absolute bottom-7 left-1/2 -translate-x-1/2 z-30
                      md:flex flex-col items-center gap-1.5 hidden">
        <span className="font-['Jost',sans-serif] text-[0.45rem] tracking-[0.35em]
                         uppercase text-white/22">Scroll</span>
        <div className="w-px h-7 bg-gradient-to-b from-white/22 to-transparent" />
      </div>

    </section>
  );
}