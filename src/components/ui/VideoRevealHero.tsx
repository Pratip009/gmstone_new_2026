"use client";

import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect } from "react";

export default function VideoTextReveal() {
  const progress = useMotionValue(0);

  const scale = useTransform(progress, [0, 1], [1, 8]);
  const textOpacity = useTransform(progress, [0, 0.65, 1], [1, 0.5, 0]);
  const subtitleOpacity = useTransform(progress, [0, 0.35], [1, 0]);
  const subtitleY = useTransform(progress, [0, 0.35], [0, -20]);
  const subtitleY2 = useTransform(progress, [0, 0.35], [0, 16]);
  const overlayOpacity = useTransform(progress, [0, 1], [0.3, 0.88]);
  const cornerOpacity = useTransform(progress, [0, 0.28], [1, 0]);
  const scrollHintOpacity = useTransform(progress, [0, 0.1], [1, 0]);

  useEffect(() => {
    let ticking = false;
    const onScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const p = Math.min(window.scrollY / 600, 1);
          progress.set(p);
          ticking = false;
        });
        ticking = true;
      }
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, [progress]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel+Decorative:wght@400;700;900&family=Cormorant+Garamond:ital,wght@0,300;1,300&display=swap');

        .diamond-text {
          font-family: 'Cinzel Decorative', serif;
          letter-spacing: 0.15em;
          background: linear-gradient(
            135deg,
            #c8922a 0%, #f5e6c0 25%, #d4af6a 45%,
            #fdf3dc 55%, #b8841e 75%, #f0d98e 100%
          );
          background-size: 250% 250%;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: gold-shimmer 5s ease-in-out infinite;
          filter: drop-shadow(0 0 32px rgba(212,175,106,0.5));
        }

        @keyframes gold-shimmer {
          0%, 100% { background-position: 0% 50%; }
          50%       { background-position: 100% 50%; }
        }

        .ornament {
          background: linear-gradient(90deg, transparent, rgba(212,175,106,0.85), transparent);
        }

        .subtitle-text {
          font-family: 'Cormorant Garamond', serif;
          color: rgba(245,230,192,0.82);
          letter-spacing: 0.5em;
        }

        .pip {
          width: 7px; height: 7px;
          background: linear-gradient(135deg, #f5e6c0, #c8922a);
          transform: rotate(45deg);
          animation: pip-glow 2.5s ease-in-out infinite;
        }

        @keyframes pip-glow {
          0%, 100% { box-shadow: 0 0 10px rgba(212,175,106,0.9); }
          50%       { box-shadow: 0 0 22px rgba(245,230,192,1), 0 0 40px rgba(212,175,106,0.5); }
        }

        .vignette {
          background: radial-gradient(ellipse at center, transparent 35%, rgba(0,0,0,0.78) 100%);
        }

        .grain {
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 512 512' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.72' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
        }
      `}</style>

      {/* Normal-flow hero: 100vh, user scrolls past freely */}
      <section className="relative w-full h-screen overflow-hidden flex items-center justify-center">

        {/* Video */}
        <video
          src="https://www.pexels.com/download/video/6144414/"
          autoPlay muted loop playsInline
          className="absolute inset-0 w-full h-full object-cover scale-105"
          style={{ filter: "saturate(0.65) brightness(0.85)" }}
        />

        <div className="vignette absolute inset-0 pointer-events-none" />
        <div className="grain absolute inset-0 opacity-[0.07] mix-blend-soft-light pointer-events-none" />
        <motion.div className="absolute inset-0 bg-black pointer-events-none" style={{ opacity: overlayOpacity }} />

        {/* Corner brackets */}
        {(["top-5 left-5", "top-5 right-5", "bottom-5 left-5", "bottom-5 right-5"] as const).map((pos, i) => (
          <motion.div key={i} style={{ opacity: cornerOpacity }}
            className={`absolute ${pos} w-9 h-9 pointer-events-none`}>
            <div className="w-full h-full" style={{
              borderTop:    i < 2  ? "1px solid rgba(212,175,106,0.55)" : "none",
              borderBottom: i >= 2 ? "1px solid rgba(212,175,106,0.55)" : "none",
              borderLeft:   i % 2 === 0 ? "1px solid rgba(212,175,106,0.55)" : "none",
              borderRight:  i % 2 === 1 ? "1px solid rgba(212,175,106,0.55)" : "none",
            }} />
          </motion.div>
        ))}

        {/* Main content */}
        <div className="relative z-10 flex flex-col items-center justify-center text-center px-4">

          {/* Top ornament */}
          <motion.div style={{ opacity: subtitleOpacity, y: subtitleY }}
            className="flex items-center gap-4 mb-7">
            <div className="ornament h-px w-20" />
            <div className="pip" />
            <span className="subtitle-text text-[9px] uppercase tracking-[0.55em]">Est. 1987</span>
            <div className="pip" />
            <div className="ornament h-px w-20" />
          </motion.div>

          {/* Title — zooms on page scroll */}
          <motion.h1
            style={{ scale, opacity: textOpacity }}
            className="diamond-text text-[11vw] leading-[1.1] select-none origin-center"
          >
            Alpha
            <br />
            <span style={{ fontSize: "0.5em", letterSpacing: "0.32em" }}>Imports</span>
          </motion.h1>

          {/* Bottom tagline */}
          <motion.div style={{ opacity: subtitleOpacity, y: subtitleY2 }}
            className="mt-7 flex flex-col items-center gap-3">
            <div className="ornament h-px w-56" />
            <p className="subtitle-text text-[8px] uppercase font-light tracking-[0.6em]">
              Diamonds &nbsp;·&nbsp; Gemstones &nbsp;·&nbsp; Fine Jewellery
            </p>
          </motion.div>
        </div>

        {/* Scroll hint */}
        <motion.div style={{ opacity: scrollHintOpacity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <span className="subtitle-text text-[7px] uppercase tracking-[0.6em] opacity-50">Scroll</span>
          <div className="w-px h-10 bg-gradient-to-b from-amber-300/70 to-transparent animate-pulse" />
        </motion.div>
      </section>
    </>
  );
}