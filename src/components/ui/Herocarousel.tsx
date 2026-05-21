"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef } from "react";

const BUTTONS = [
  {
    label: "Shop Diamonds",
    href: "/products?category=diamonds",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <polygon points="10,2 18,8 15,18 5,18 2,8" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <line x1="2" y1="8" x2="18" y2="8" stroke="currentColor" strokeWidth="0.9"/>
        <line x1="6" y1="8" x2="10" y2="2" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="14" y1="8" x2="10" y2="2" stroke="currentColor" strokeWidth="0.8"/>
      </svg>
    ),
  },
  {
    label: "Shop Gemstones",
    href: "/products?category=semi-precious",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <ellipse cx="10" cy="10" rx="7.5" ry="5.5" stroke="currentColor" strokeWidth="1.3"/>
        <ellipse cx="10" cy="10" rx="4" ry="2.5" stroke="currentColor" strokeWidth="0.8"/>
        <line x1="2.5" y1="10" x2="17.5" y2="10" stroke="currentColor" strokeWidth="0.7"/>
        <line x1="10" y1="4.5" x2="10" y2="15.5" stroke="currentColor" strokeWidth="0.7"/>
      </svg>
    ),
  },
  {
    label: "Shop Jewelry",
    href: "/products?category=jewelry",
    icon: (
      <svg width="14" height="14" viewBox="0 0 20 20" fill="none">
        <circle cx="10" cy="10" r="7" stroke="currentColor" strokeWidth="1.3"/>
        <circle cx="10" cy="10" r="3" stroke="currentColor" strokeWidth="0.8"/>
        <circle cx="10" cy="3" r="1.2" fill="currentColor"/>
        <circle cx="10" cy="17" r="1.2" fill="currentColor"/>
        <circle cx="3" cy="10" r="1.2" fill="currentColor"/>
        <circle cx="17" cy="10" r="1.2" fill="currentColor"/>
      </svg>
    ),
  },
] as const;

export default function HeroBanner() {
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = imgRef.current;
    if (!el) return;
    const onScroll = () => {
      el.style.transform = `translateY(${window.scrollY * 0.15}px)`;
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section style={{
      position: "relative",
      width: "100%",
      overflow: "hidden",
      background: "#060402",
      height: "70vh",
      minHeight: 440,
      maxHeight: 680,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300;1,400&family=Jost:wght@300;400;500;600&display=swap');

        .hb-serif { font-family: 'Cormorant Garamond', serif; }
        .hb-sans  { font-family: 'Jost', sans-serif; }

        @keyframes hbUp   { from{opacity:0;transform:translateY(24px)} to{opacity:1;transform:translateY(0)} }
        @keyframes hbLineH{ from{transform:scaleX(0)} to{transform:scaleX(1)} }
        @keyframes hbLineV{ from{transform:scaleY(0)} to{transform:scaleY(1)} }

        .hb-a1{opacity:0;animation:hbUp 1s 0.10s cubic-bezier(0.22,1,0.36,1) forwards}
        .hb-a2{opacity:0;animation:hbUp 1s 0.26s cubic-bezier(0.22,1,0.36,1) forwards}
        .hb-a3{opacity:0;animation:hbUp 1s 0.42s cubic-bezier(0.22,1,0.36,1) forwards}
        .hb-a4{opacity:0;animation:hbUp 1s 0.56s cubic-bezier(0.22,1,0.36,1) forwards}

        .hbc{position:absolute;width:40px;height:40px;pointer-events:none;z-index:40}
        .hbc::before,.hbc::after{content:'';position:absolute;background:rgba(255,255,255,0.30)}
        .hbc-tl{top:20px;left:20px}
        .hbc-tl::before{top:0;left:0;width:100%;height:1px;transform-origin:left;transform:scaleX(0);animation:hbLineH .8s 1s ease forwards}
        .hbc-tl::after {top:0;left:0;width:1px;height:100%;transform-origin:top;transform:scaleY(0);animation:hbLineV .8s 1s ease forwards}
        .hbc-tr{top:20px;right:20px}
        .hbc-tr::before{top:0;right:0;width:100%;height:1px;transform-origin:right;transform:scaleX(0);animation:hbLineH .8s 1.05s ease forwards}
        .hbc-tr::after {top:0;right:0;width:1px;height:100%;transform-origin:top;transform:scaleY(0);animation:hbLineV .8s 1.05s ease forwards}
        .hbc-bl{bottom:20px;left:20px}
        .hbc-bl::before{bottom:0;left:0;width:100%;height:1px;transform-origin:left;transform:scaleX(0);animation:hbLineH .8s 1.1s ease forwards}
        .hbc-bl::after {bottom:0;left:0;width:1px;height:100%;transform-origin:bottom;transform:scaleY(0);animation:hbLineV .8s 1.1s ease forwards}
        .hbc-br{bottom:20px;right:20px}
        .hbc-br::before{bottom:0;right:0;width:100%;height:1px;transform-origin:right;transform:scaleX(0);animation:hbLineH .8s 1.15s ease forwards}
        .hbc-br::after {bottom:0;right:0;width:1px;height:100%;transform-origin:bottom;transform:scaleY(0);animation:hbLineV .8s 1.15s ease forwards}

        .hb-btn{
          position:relative;
          display:inline-flex;
          align-items:center;
          gap:9px;
          font-family:'Jost',sans-serif;
          font-size:10px;
          font-weight:600;
          letter-spacing:0.22em;
          text-transform:uppercase;
          text-decoration:none;
          padding:13px 26px;
          border:1px solid rgba(255,255,255,0.45);
          color:#ffffff;
          background:rgba(0,0,0,0.18);
          overflow:hidden;
          transition:border-color 0.35s ease;
          white-space:nowrap;
          cursor:pointer;
        }
        .hb-btn::before{
          content:'';
          position:absolute;
          inset:0;
          background:#ffffff;
          transform:translateY(102%);
          transition:transform 0.40s cubic-bezier(0.22,1,0.36,1);
          z-index:0;
        }
        .hb-btn:hover::before{transform:translateY(0)}
        .hb-btn:hover{color:#111111;border-color:#ffffff}
        .hb-btn>*{position:relative;z-index:1}

        @media(max-width:580px){
          .hb-btn{padding:11px 18px;font-size:9px;letter-spacing:0.18em}
        }
      `}</style>

      {/* Parallax image */}
      <div ref={imgRef} style={{ position:"absolute", inset:"-12% 0", zIndex:10 }}>
        <Image
          src="/images/gg.webp"
          alt="Colored Diamonds, Fine Gemstones & Jewelry Since 1988"
          fill priority sizes="100vw"
          style={{ objectFit:"cover", objectPosition:"center 30%" }}
        />
      </div>

      {/* ── Single light overlay — image stays vivid ── */}
      {/* Gentle base tint — just enough to lift white text */}
      <div style={{ position:"absolute", inset:0, zIndex:15, background:"rgba(0,0,0,0.28)" }} />
      {/* Bottom gradient only — grounds the buttons without blackening the frame */}
      <div style={{ position:"absolute", inset:0, zIndex:16, background:"linear-gradient(to top, rgba(0,0,0,0.55) 0%, transparent 45%)" }} />
      {/* Soft top darkening for the Est. label */}
      <div style={{ position:"absolute", inset:0, zIndex:16, background:"linear-gradient(to bottom, rgba(0,0,0,0.22) 0%, transparent 30%)" }} />

      {/* Corner brackets */}
      <div className="hbc hbc-tl"/><div className="hbc hbc-tr"/>
      <div className="hbc hbc-bl"/><div className="hbc hbc-br"/>

      {/* Content */}
      <div style={{
        position:"absolute", inset:0, zIndex:30,
        display:"flex", flexDirection:"column",
        alignItems:"center", justifyContent:"center",
        textAlign:"center",
        padding:"0 clamp(24px, 8vw, 100px)",
      }}>

        {/* Est label */}
        <div className="hb-a1 hb-sans" style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24 }}>
          <span style={{ display:"block", height:"1px", width:28, background:"rgba(255,255,255,0.40)" }}/>
          <span style={{ fontSize:9, fontWeight:500, letterSpacing:"0.44em", textTransform:"uppercase", color:"rgba(255,255,255,0.65)" }}>
            Est. 1988
          </span>
          <span style={{ display:"block", height:"1px", width:28, background:"rgba(255,255,255,0.40)" }}/>
        </div>

        {/* Headline */}
        <h1 className="hb-a2 hb-serif" style={{
          fontSize: "clamp(38px, 6.8vw, 82px)",
          fontWeight: 300,
          lineHeight: 1.08,
          letterSpacing: "-0.01em",
          color: "#ffffff",
          textShadow: "0 2px 20px rgba(0,0,0,0.55), 0 0 60px rgba(0,0,0,0.30)",
          margin: "0 0 6px",
          maxWidth: 860,
        }}>
          Colored Diamonds,{" "}
          <em style={{ fontStyle:"italic", color:"#e8cc80" }}>Fine Gemstones</em>
          {" "}&amp; Jewelry
          <span className="hb-sans" style={{
            fontSize: "clamp(12px, 1.5vw, 16px)",
            fontWeight: 300,
            letterSpacing: "0.30em",
            textTransform: "uppercase",
            color: "rgba(255,255,255,0.70)",
            fontStyle: "normal",
            display: "block",
            marginTop: 16,
            textShadow: "0 1px 10px rgba(0,0,0,0.5)",
          }}>
            Since 1988
          </span>
        </h1>

        {/* Rule divider */}
        <div className="hb-a3" style={{ display:"flex", alignItems:"center", gap:16, margin:"22px 0 30px" }}>
          <span style={{ display:"block", height:"1px", width:44, background:"rgba(255,255,255,0.25)" }}/>
          <span style={{ display:"block", width:3, height:3, borderRadius:"50%", background:"rgba(255,255,255,0.30)", flexShrink:0 }}/>
          <span style={{ display:"block", height:"1px", width:44, background:"rgba(255,255,255,0.25)" }}/>
        </div>

        {/* Buttons */}
        <div className="hb-a4" style={{ display:"flex", flexWrap:"wrap", alignItems:"center", justifyContent:"center", gap:12 }}>
          {BUTTONS.map(({ label, href, icon }) => (
            <Link key={label} href={href} className="hb-btn">
              {icon}
              <span>{label}</span>
              <svg width="10" height="10" viewBox="0 0 14 14" fill="none" style={{ opacity:0.5 }}>
                <path d="M2 7h10M8 3l4 4-4 4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          ))}
        </div>

      </div>

      {/* Bottom fade */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0, height:70,
        zIndex:28, pointerEvents:"none",
        background:"linear-gradient(to bottom, transparent, rgba(3,2,1,0.35))",
      }}/>
    </section>
  );
}