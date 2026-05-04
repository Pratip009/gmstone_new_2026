"use client";
import { View, BadgeCheck, ShieldCheck, BadgeDollarSign, Award } from "lucide-react";

const badges = [
  { icon: View, label: "View Gems in 360°" },
  { icon: BadgeCheck, label: "All Gems Certified" },
  { icon: ShieldCheck, label: "100% Conflict Free" },
  { icon: BadgeDollarSign, label: "Best Price Guarantee" },
  { icon: Award, label: "Lifetime Warranty" },
];

export default function TrustBadges() {
  return (
    <section className="w-full bg-[#0a0a0a] py-12 overflow-hidden border-t border-b border-white/5">
      {/* ── Desktop Version ── */}
      <div className="hidden md:flex max-w-6xl mx-auto px-8 justify-between items-center">
        {badges.map(({ icon: Icon, label }, idx) => (
          <div
            key={idx}
            className="relative flex flex-col items-center gap-4 group cursor-default flex-1"
          >
            {/* Subtle connecting line */}
            {idx !== 0 && (
              <span className="absolute left-0 top-1/2 -translate-y-1/2 h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent" />
            )}

            {/* Icon Container */}
            <div className="relative flex items-center justify-center">
              {/* Glow effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-500/10 via-transparent to-rose-500/10 rounded-full blur-xl scale-75 group-hover:scale-110 transition-all duration-700" />
              
              {/* Outer ring */}
              <div className="absolute w-20 h-20 rounded-full border border-white/10 group-hover:border-white/20 transition-all duration-500" />
              
              {/* Icon */}
              <div className="relative z-10 flex items-center justify-center w-16 h-16">
                <Icon 
                  className="w-9 h-9 text-stone-400 group-hover:text-amber-300 transition-all duration-500 group-hover:scale-110" 
                  strokeWidth={1.4} 
                />
              </div>
            </div>

            {/* Label */}
            <p className="text-center text-xs uppercase tracking-[3px] text-stone-400 group-hover:text-stone-200 font-light transition-colors duration-300 leading-relaxed">
              {label}
            </p>
          </div>
        ))}
      </div>

      {/* ── Mobile: Premium Marquee ── */}
      <div className="md:hidden relative">
        {/* Fade edges */}
        <div className="absolute left-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-r from-[#0a0a0a] to-transparent pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-12 z-10 bg-gradient-to-l from-[#0a0a0a] to-transparent pointer-events-none" />

        <div className="flex animate-marquee gap-8 whitespace-nowrap py-2">
          {[...badges, ...badges].map(({ icon: Icon, label }, idx) => (
            <div
              key={idx}
              className="inline-flex flex-col items-center gap-3 min-w-[140px] px-2"
            >
              {/* Premium icon pill */}
              <div className="relative">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-zinc-900 to-black border border-white/10 flex items-center justify-center group-hover:border-amber-500/30 transition-all duration-300">
                  <Icon className="w-7 h-7 text-stone-400 group-hover:text-amber-300 transition-colors" strokeWidth={1.5} />
                </div>
                
                {/* Subtle inner glow */}
                <div className="absolute inset-0 rounded-2xl bg-amber-500/5 blur-sm scale-90 -z-10" />
              </div>

              <p className="text-center text-[10px] uppercase tracking-[2px] text-stone-500 leading-tight font-light max-w-[110px]">
                {label}
              </p>
            </div>
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% { transform: translateX(0); }
          100% { transform: translateX(-50%); }
        }
        .animate-marquee {
          animation: marquee 22s linear infinite;
          will-change: transform;
        }
        .animate-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>
    </section>
  );
}