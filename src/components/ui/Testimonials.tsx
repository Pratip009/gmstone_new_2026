"use client";
import React, { useState, useEffect, useRef, useCallback } from "react";

const testimonials = [
  {
    id: 1,
    name: "Catherine Whitmore",
    title: "Private Collector, New York",
    gem: "Burmese Ruby",
    rating: 5,
    text: "The 4.2ct Burmese ruby I acquired through Alpha Imports is nothing short of extraordinary. Their gemologists provided certification that matched every facet of the stone's provenance. A truly rare find from a house that understands rarity.",
    initials: "CW",
    accent: "#b83232",
    gemIcon: "◆",
  },
  {
    id: 2,
    name: "James Harrington III",
    title: "Estate Jeweler, London",
    gem: "Kashmir Sapphire",
    rating: 5,
    text: "I have sourced stones from dealers across four continents. Alpha Imports consistently delivers what others only promise — transparency, impeccable grading, and stones that stop you mid-breath. Their Kashmir sapphires are beyond compare.",
    initials: "JH",
    accent: "#2c5282",
    gemIcon: "◈",
  },
  {
    id: 3,
    name: "Mei-Lin Zhao",
    title: "Luxury Brand Designer, Hong Kong",
    gem: "Colombian Emerald",
    rating: 5,
    text: "When designing our haute joaillerie collection, only the finest emeralds would suffice. Alpha Imports sourced seven matched Colombian emeralds with identical saturation — something I thought impossible. They made our entire season.",
    initials: "ML",
    accent: "#276749",
    gemIcon: "⬡",
  },
  {
    id: 4,
    name: "Dominique Arsenault",
    title: "Auction Specialist, Sotheby's",
    gem: "Fancy Vivid Diamond",
    rating: 5,
    text: "For our Geneva auction we required a 3ct+ Fancy Vivid Yellow — flawless provenance, GIA certified. Alpha Imports delivered within a week. The stone achieved 340% of its reserve. Their network is unparalleled in the trade.",
    initials: "DA",
    accent: "#92760a",
    gemIcon: "✦",
  },
  {
    id: 5,
    name: "Priya Kapoor-Singh",
    title: "Bride & Client, Mumbai",
    gem: "Pink Diamond",
    rating: 5,
    text: "My engagement ring features a 1.8ct Argyle pink diamond from Alpha Imports. The team walked me through every aspect — origin, grading, setting possibilities. It is the most beautiful object I have ever owned. Worth every moment.",
    initials: "PK",
    accent: "#943d70",
    gemIcon: "❋",
  },
];

const AUTOPLAY_INTERVAL = 5500;

export default function Testimonials() {
  const [active, setActive]   = useState(0);
  const [prev, setPrev]       = useState<number | null>(null);
  const [direction, setDirection] = useState<"next" | "prev">("next");
  const [animating, setAnimating] = useState(false);
  const [paused, setPaused]   = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const total = testimonials.length;

  const go = useCallback((idx: number, dir: "next" | "prev") => {
    if (animating) return;
    setDirection(dir);
    setPrev(active);
    setAnimating(true);
    setTimeout(() => {
      setActive(idx);
      setPrev(null);
      setAnimating(false);
    }, 480);
  }, [active, animating]);

  const next  = useCallback(() => go((active + 1) % total, "next"), [active, go, total]);
  const goTo  = useCallback((idx: number) => go(idx, idx > active ? "next" : "prev"), [active, go]);

  useEffect(() => {
    if (paused) return;
    timerRef.current = setInterval(next, AUTOPLAY_INTERVAL);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [next, paused]);

  const t = testimonials[active];
  const p = prev !== null ? testimonials[prev] : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Cormorant+Garamond:ital,wght@0,400;0,500;1,400;1,500&display=swap');

        .tr-root {
          background: #ffffff;
          position: relative;
          overflow: hidden;
          padding: 96px 0 112px;
        }

        /* Very subtle warm texture lines */
        .tr-root::before {
          content: '';
          position: absolute;
          inset: 0;
          background:
            radial-gradient(ellipse 70% 50% at 50% 0%, rgba(184,146,50,0.06) 0%, transparent 65%),
            radial-gradient(ellipse 50% 40% at 0% 100%, rgba(184,146,50,0.04) 0%, transparent 60%),
            radial-gradient(ellipse 50% 40% at 100% 0%, rgba(184,146,50,0.04) 0%, transparent 60%);
          pointer-events: none;
        }

        .tr-label {
          font-family: 'Poppins', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.28em;
          text-transform: uppercase;
          color: #b89432;
          display: flex;
          align-items: center;
          gap: 12px;
          justify-content: center;
          margin-bottom: 14px;
        }
        .tr-label::before, .tr-label::after {
          content: '';
          width: 36px;
          height: 1px;
          background: #c9a84c;
          opacity: 0.5;
        }

        .tr-heading {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(34px, 4.5vw, 56px);
          font-weight: 400;
          color: #1a1612;
          text-align: center;
          line-height: 1.1;
          letter-spacing: -0.01em;
          margin-bottom: 64px;
        }
        .tr-heading em {
          font-style: italic;
          color: #b89432;
        }

        /* Stage */
        .tr-stage {
          position: relative;
          max-width: 820px;
          margin: 0 auto;
          padding: 0 24px;
          min-height: 360px;
        }
        @media(max-width:640px){ .tr-stage{ min-height:440px; } }

        /* Card */
        .tr-card {
          position: absolute;
          inset: 0;
          background: #ffffff;
          border: 1px solid rgba(184,148,50,0.16);
          border-radius: 3px;
          padding: 48px 52px;
          display: flex;
          flex-direction: column;
          gap: 28px;
          box-shadow: 0 2px 12px rgba(0,0,0,0.05), 0 16px 48px rgba(0,0,0,0.06);
        }
        @media(max-width:640px){ .tr-card{ padding:32px 24px; } }

        /* Gold corner ornaments */
        .tr-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0;
          width: 52px; height: 52px;
          border-top: 1px solid rgba(184,148,50,0.45);
          border-left: 1px solid rgba(184,148,50,0.45);
        }
        .tr-card::after {
          content: '';
          position: absolute;
          bottom: 0; right: 0;
          width: 52px; height: 52px;
          border-bottom: 1px solid rgba(184,148,50,0.45);
          border-right: 1px solid rgba(184,148,50,0.45);
        }

        .tr-card-enter-next { animation: trInNext 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tr-card-exit-next  { animation: trOutNext 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tr-card-enter-prev { animation: trInPrev 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }
        .tr-card-exit-prev  { animation: trOutPrev 0.48s cubic-bezier(0.22,1,0.36,1) forwards; }

        @keyframes trInNext  { from{opacity:0;transform:translateX(48px) scale(0.98)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes trOutNext { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(-48px) scale(0.98)} }
        @keyframes trInPrev  { from{opacity:0;transform:translateX(-48px) scale(0.98)} to{opacity:1;transform:translateX(0) scale(1)} }
        @keyframes trOutPrev { from{opacity:1;transform:translateX(0) scale(1)} to{opacity:0;transform:translateX(48px) scale(0.98)} }

        .tr-quote-mark {
          font-family: 'Cormorant Garamond', serif;
          font-size: 88px;
          line-height: 0.6;
          color: rgba(184,148,50,0.12);
          position: absolute;
          top: 38px;
          right: 48px;
          font-style: italic;
          user-select: none;
          pointer-events: none;
        }

        .tr-gem-badge {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 4px 12px 4px 9px;
          font-family: 'Poppins', sans-serif;
          font-size: 9.5px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          width: fit-content;
          border: 1px solid;
          border-radius: 2px;
        }

        .tr-stars { display:flex; gap:3px; align-items:center; }
        .tr-star {
          color: #c9a030;
          font-size: 13px;
          animation: starPop 0.35s ease backwards;
        }
        @keyframes starPop {
          from { transform:scale(0.4); opacity:0; }
          to   { transform:scale(1);   opacity:1; }
        }

        .tr-text {
          font-family: 'Cormorant Garamond', serif;
          font-size: clamp(17px, 2vw, 21px);
          font-weight: 400;
          font-style: italic;
          color: #4a4038;
          line-height: 1.78;
          flex: 1;
        }

        .tr-author {
          display: flex;
          align-items: center;
          gap: 16px;
          border-top: 1px solid rgba(184,148,50,0.12);
          padding-top: 22px;
          margin-top: auto;
        }

        .tr-avatar {
          width: 48px; height: 48px;
          border-radius: 50%;
          display: flex; align-items: center; justify-content: center;
          font-family: 'Cormorant Garamond', serif;
          font-size: 17px; font-weight: 500;
          color: #fff;
          flex-shrink: 0;
        }

        .tr-name {
          font-family: 'Poppins', sans-serif;
          font-size: 13px; font-weight: 600;
          color: #1a1612;
          letter-spacing: 0.02em;
        }
        .tr-role {
          font-family: 'Poppins', sans-serif;
          font-size: 10px; font-weight: 400;
          color: #9a8f84;
          letter-spacing: 0.08em;
          margin-top: 3px;
          text-transform: uppercase;
        }

        /* Progress bar */
        .tr-progress {
          position: absolute;
          bottom: 0; left: 0;
          height: 2px;
          background: linear-gradient(90deg, #c9a030, #e8c45a);
          animation: trProgress 5.5s linear forwards;
          border-radius: 0 1px 1px 0;
          z-index: 10;
        }
        @keyframes trProgress { from{width:0%} to{width:100%} }

        /* Controls */
        .tr-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 20px;
          margin-top: 48px;
        }

        .tr-arrow {
          width: 44px; height: 44px;
          border: 1px solid rgba(184,148,50,0.30);
          border-radius: 50%;
          background: #fff;
          color: #b89432;
          cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: all 0.22s ease;
          box-shadow: 0 1px 4px rgba(0,0,0,0.06);
        }
        .tr-arrow:hover {
          border-color: rgba(184,148,50,0.70);
          background: #fdf8ee;
          box-shadow: 0 2px 12px rgba(184,148,50,0.15);
        }

        .tr-dots { display:flex; align-items:center; gap:8px; }
        .tr-dot {
          width: 6px; height: 6px;
          border-radius: 50%;
          border: 1px solid rgba(184,148,50,0.40);
          background: transparent;
          cursor: pointer;
          transition: all 0.28s ease;
          padding: 0;
        }
        .tr-dot.active {
          background: #c9a030;
          border-color: #c9a030;
          width: 22px;
          border-radius: 3px;
        }
        .tr-dot:hover:not(.active) { background: rgba(184,148,50,0.25); }
      `}</style>

      <section
        className="tr-root"
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
      >
        {/* Subtle background facet lines */}
        <svg style={{ position:"absolute", inset:0, width:"100%", height:"100%", pointerEvents:"none", opacity:0.12 }} viewBox="0 0 1440 640" preserveAspectRatio="xMidYMid slice">
          <polygon points="0,0 380,200 0,400"           fill="none" stroke="#c9a030" strokeWidth="0.6"/>
          <polygon points="1440,0 1060,200 1440,400"    fill="none" stroke="#c9a030" strokeWidth="0.6"/>
          <polygon points="720,0 980,300 720,640 460,300" fill="none" stroke="#c9a030" strokeWidth="0.5"/>
          <line x1="0"    y1="0"   x2="720" y2="320" stroke="#c9a030" strokeWidth="0.4"/>
          <line x1="1440" y1="0"   x2="720" y2="320" stroke="#c9a030" strokeWidth="0.4"/>
          <line x1="0"    y1="640" x2="720" y2="320" stroke="#c9a030" strokeWidth="0.4"/>
          <line x1="1440" y1="640" x2="720" y2="320" stroke="#c9a030" strokeWidth="0.4"/>
        </svg>

        <div style={{ maxWidth:1200, margin:"0 auto", padding:"0 24px", position:"relative", zIndex:1 }}>

          {/* Header */}
          <div className="tr-label"><span>✦</span> Client Testimonials <span>✦</span></div>
          <h2 className="tr-heading">Words of <em>Distinction</em></h2>

          {/* Stage */}
          <div className="tr-stage">
            {!paused && <div key={`${active}-p`} className="tr-progress" />}

            {p && animating && (
              <div className={`tr-card tr-card-exit-${direction}`} style={{ zIndex:1 }}>
                <CardContent t={p} />
              </div>
            )}
            <div className={`tr-card ${animating ? `tr-card-enter-${direction}` : ""}`} style={{ zIndex:2 }}>
              <CardContent t={t} />
            </div>
          </div>

          {/* Controls */}
          <div className="tr-controls">
            <button className="tr-arrow" aria-label="Previous"
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); go((active - 1 + total) % total, "prev"); }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M10 3L5 8l5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>

            <div className="tr-dots">
              {testimonials.map((_, i) => (
                <button key={i}
                  className={`tr-dot ${i === active ? "active" : ""}`}
                  onClick={() => { if (timerRef.current) clearInterval(timerRef.current); goTo(i); }}
                  aria-label={`Testimonial ${i + 1}`}
                />
              ))}
            </div>

            <button className="tr-arrow" aria-label="Next"
              onClick={() => { if (timerRef.current) clearInterval(timerRef.current); next(); }}>
              <svg width="15" height="15" viewBox="0 0 16 16" fill="none">
                <path d="M6 3l5 5-5 5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </button>
          </div>

          {/* Counter */}
          <div style={{
            textAlign:"center", marginTop:20,
            fontFamily:"'Poppins', sans-serif",
            fontSize:11, letterSpacing:"0.18em",
            color:"#c8b890", fontWeight:300,
          }}>
            <span style={{ color:"#b89432", fontWeight:500 }}>{String(active+1).padStart(2,"0")}</span>
            {" / "}
            {String(total).padStart(2,"0")}
          </div>

        </div>
      </section>
    </>
  );
}

function CardContent({ t }: { t: typeof testimonials[0] }) {
  return (
    <>
      <div className="tr-quote-mark" aria-hidden="true">"</div>

      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:10 }}>
        <div className="tr-gem-badge" style={{
          color: t.accent,
          borderColor: `${t.accent}38`,
          background: `${t.accent}0c`,
        }}>
          <span style={{ fontSize:13 }}>{t.gemIcon}</span>
          {t.gem}
        </div>
        <div className="tr-stars">
          {Array.from({ length: t.rating }).map((_, i) => (
            <span key={i} className="tr-star" style={{ animationDelay:`${i*0.06}s` }}>★</span>
          ))}
        </div>
      </div>

      <p className="tr-text">"{t.text}"</p>

      <div className="tr-author">
        <div className="tr-avatar" style={{ background:`linear-gradient(135deg, ${t.accent}dd, ${t.accent}88)` }}>
          {t.initials}
        </div>
        <div>
          <div className="tr-name">{t.name}</div>
          <div className="tr-role">{t.title}</div>
        </div>
        <div style={{
          marginLeft:"auto",
          fontFamily:"'Cormorant Garamond', serif",
          fontSize:26, color:`${t.accent}40`,
          fontStyle:"italic", lineHeight:1,
        }}>
          {t.gemIcon}
        </div>
      </div>
    </>
  );
}