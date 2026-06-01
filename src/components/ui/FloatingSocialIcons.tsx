"use client";

import Link from "next/link";
import {
  FaFacebookF,
  FaInstagram,
  FaTiktok,
  FaYoutube,
  FaPinterestP,
} from "react-icons/fa";

export default function FloatingSocialIcons() {
  const socials = [
    {
      name: "Instagram",
      href: "https://instagram.com",
      icon: FaInstagram,
      bg: "from-pink-500 via-red-500 to-yellow-500",
      glow: "hover:shadow-pink-500/50",
    },
    {
      name: "Facebook",
      href: "https://facebook.com",
      icon: FaFacebookF,
      bg: "from-blue-600 to-blue-500",
      glow: "hover:shadow-blue-500/50",
    },
    
    
    {
      name: "YouTube",
      href: "https://youtube.com",
      icon: FaYoutube,
      bg: "from-red-600 to-red-500",
      glow: "hover:shadow-red-500/50",
    },
    {
      name: "TikTok",
      href: "https://tiktok.com",
      icon: FaTiktok,
      bg: "from-black to-zinc-700",
      glow: "hover:shadow-white/40",
    },
    {
      name: "Pinterest",
      href: "https://pinterest.com",
      icon: FaPinterestP,
      bg: "from-rose-600 to-red-500",
      glow: "hover:shadow-rose-500/50",
    },
  ];

  return (
    <div className="fixed bottom-16 right-6 z-[999] flex flex-col gap-4">
      {socials.map((social, index) => {
        const Icon = social.icon;

        return (
          <Link
            key={social.name}
            href={social.href}
            target="_blank"
            className="group relative flex items-center"
            style={{
              animation: `float 4s ease-in-out infinite`,
              animationDelay: `${index * 0.2}s`,
            }}
          >
            {/* Tooltip */}
            <span className="absolute right-5 scale-90 whitespace-nowrap rounded-full bg-black/90 px-4 py-2 text-sm font-medium text-white opacity-0 shadow-2xl backdrop-blur-md transition-all duration-300 group-hover:right-24 group-hover:scale-100 group-hover:opacity-100">
              {social.name}
            </span>

            {/* Icon Button */}
            <div
              className={`relative flex h-10 w-10 items-center justify-center overflow-hidden rounded-2xl bg-gradient-to-br ${social.bg} text-white shadow-2xl transition-all duration-500 hover:-translate-y-2 hover:scale-110 hover:rotate-6 ${social.glow} hover:shadow-[0_0_35px]`}
            >
              {/* Animated Glow */}
              <div className="absolute inset-0 bg-white/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

              {/* Icon */}
              <Icon className="relative z-10 text-[22px]" />
            </div>
          </Link>
        );
      })}

      <style jsx>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
      `}</style>
    </div>
  );
}