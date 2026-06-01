"use client";
import Link from "next/link";
import { useAuth } from "@/hooks/useAuth";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { useCart } from "@/hooks/useCart";
import SearchBar from "./SearchBar";
import CartSidebar from "./CartSidebar"; // ← NEW

// ── Types ────────────────────────────────────────────────────────────────────

interface NavSubcategory {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
}

interface NavCategory {
  _id: string;
  name: string;
  slug: string;
  isActive?: boolean;
  subcategories: NavSubcategory[];
}

// ── Data fetching hook ───────────────────────────────────────────────────────

function useNavCategories(initialCategories: NavCategory[]) {
  const [categories, setCategories] = useState<NavCategory[]>(initialCategories);
  const [loading, setLoading] = useState(initialCategories.length === 0);

  useEffect(() => {
    if (initialCategories.length > 0) return;
    let cancelled = false;
    fetch("/api/categories?withSubcategories=true")
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return;
        const list: NavCategory[] = Array.isArray(data) ? data : (data?.data ?? []);
        setCategories(
          list
            .filter((c) => c.isActive !== false)
            .map((c) => ({
              ...c,
              subcategories: (c.subcategories ?? []).filter((s) => s.isActive !== false),
            }))
        );
      })
      .catch(() => {})
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { categories, loading };
}

const MAX_VISIBLE_SUBS = 7;

// ── Main Navbar ──────────────────────────────────────────────────────────────

export default function Navbar({ initialCategories = [] }: { initialCategories?: NavCategory[] }) {
  const { user, logout, isAdmin } = useAuth();
  const { cartCount } = useCart();
  const router = useRouter();
  const { categories, loading } = useNavCategories(initialCategories);

  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [activeMobileCategory, setActiveMobileCategory] = useState<string | null>(null);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [expandedDropdowns, setExpandedDropdowns] = useState<Set<string>>(new Set());

  // ── NEW: cart sidebar state ────────────────────────────────────────────────
  const [cartOpen, setCartOpen] = useState(false);

  const profileRef = useRef<HTMLDivElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const update = () => {
      if (navRef.current) {
        const h = navRef.current.getBoundingClientRect().height;
        document.documentElement.style.setProperty("--navbar-height", `${h}px`);
      }
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => { setMenuOpen(false); }, []);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) {
        setProfileOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const openCat = (slug: string) => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setOpenDropdown(slug);
  };

  const schedulClose = () => {
    closeTimer.current = setTimeout(() => setOpenDropdown(null), 150);
  };

  const cancelClose = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  };

  const toggleExpand = (slug: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setExpandedDropdowns((prev) => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const handleLogout = () => {
    logout();
    setMenuOpen(false);
    setProfileOpen(false);
    router.push("/");
  };

  // ── Cart icon button (shared style) ───────────────────────────────────────
  const CartIconButton = ({ mobile = false }: { mobile?: boolean }) => (
    <button
      onClick={() => { setMenuOpen(false); setCartOpen(true); }}
      aria-label="Open cart"
      style={{
        position: "relative",
        display: "inline-flex",
        alignItems: "center",
        gap: mobile ? 0 : 5,
        padding: mobile ? "6px" : "6px 14px",
        fontFamily: "'Poppins', sans-serif",
        fontSize: "13px",
        fontWeight: 500,
        color: "#1a1a2e",
        background: "transparent",
        border: "none",
        cursor: "pointer",
        borderRadius: "6px",
        transition: "color 0.15s, background 0.15s",
        textDecoration: "none",
      }}
      onMouseEnter={(e) => { e.currentTarget.style.color = "#0f3460"; e.currentTarget.style.background = "#f5f3ff"; }}
      onMouseLeave={(e) => { e.currentTarget.style.color = "#1a1a2e"; e.currentTarget.style.background = "transparent"; }}
    >
      <svg width={mobile ? 22 : 18} height={mobile ? 22 : 18} viewBox="0 0 24 24" fill="none">
        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"
          stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
        <line x1="3" y1="6" x2="21" y2="6" stroke="currentColor" strokeWidth="1.6"/>
        <path d="M16 10a4 4 0 01-8 0" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/>
      </svg>
      {!mobile && "Cart"}
      {cartCount > 0 && (
        <span style={{
          position: mobile ? "absolute" : "static",
          top: mobile ? "-5px" : undefined,
          right: mobile ? "-7px" : undefined,
          background: "linear-gradient(135deg, #0f3460, #7c3aed)",
          color: "#fff",
          fontSize: mobile ? "8px" : "9px",
          fontWeight: 700,
          borderRadius: "50%",
          width: mobile ? "15px" : "17px",
          height: mobile ? "15px" : "17px",
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          boxShadow: "0 2px 6px rgba(79,70,229,0.4)",
          flexShrink: 0,
        }}>
          {cartCount > 99 ? "99+" : cartCount}
        </span>
      )}
    </button>
  );

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@300;400;500;600;700&display=swap');

        @keyframes navShimmer {
          0%   { background-position: 200% 0; }
          100% { background-position: -200% 0; }
        }
        @keyframes dropIn {
          from { opacity: 0; transform: translateY(-6px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .nav-cat-tab {
          position: relative; display: inline-flex; align-items: center; gap: 5px;
          font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
          letter-spacing: 0.01em; color: #1a1a2e; text-decoration: none;
          padding: 13px 16px; border-bottom: 3px solid transparent;
          transition: color 0.15s, border-color 0.15s; white-space: nowrap;
        }
        .nav-cat-tab:hover, .nav-cat-tab.active { color: #0f3460; border-bottom-color: #0f3460; }
        .nav-cat-tab .chevron { transition: transform 0.22s ease; opacity: 0.5; }
        .nav-cat-tab.active .chevron { transform: rotate(180deg); opacity: 1; }

        .sub-link {
          display: flex; align-items: center; gap: 8px; padding: 9px 20px;
          font-size: 13.5px; font-family: 'Poppins', sans-serif; font-weight: 400;
          color: #2d2d3a; text-decoration: none;
          transition: background 0.1s, color 0.1s, padding-left 0.15s; white-space: nowrap;
        }
        .sub-link:hover { background: #f5f3ff; color: #0f3460; padding-left: 26px; }
        .sub-link::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: #c4b5fd; flex-shrink: 0; transition: background 0.15s;
        }
        .sub-link:hover::before { background: #0f3460; }

        .sub-link-grid {
          display: flex; align-items: center; gap: 8px; padding: 9px 16px;
          font-size: 13px; font-family: 'Poppins', sans-serif; font-weight: 400;
          color: #2d2d3a; text-decoration: none; transition: background 0.1s, color 0.1s;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis; border-radius: 6px;
        }
        .sub-link-grid:hover { background: #f5f3ff; color: #0f3460; }
        .sub-link-grid::before {
          content: ''; width: 4px; height: 4px; border-radius: 50%;
          background: #c4b5fd; flex-shrink: 0; transition: background 0.15s;
        }
        .sub-link-grid:hover::before { background: #0f3460; }

        .see-more-btn {
          display: flex; align-items: center; gap: 6px; width: 100%;
          padding: 9px 20px; font-size: 12px; font-family: 'Poppins', sans-serif;
          font-weight: 600; color: #0f3460; letter-spacing: 0.04em; text-transform: uppercase;
          background: transparent; border: none; cursor: pointer; transition: background 0.1s;
          border-top: 1px solid #ede9fe; margin-top: 4px;
        }
        .see-more-btn:hover { background: #f5f3ff; }

        .nav-toplink {
          font-family: 'Poppins', sans-serif; font-size: 13px; font-weight: 500;
          color: #1a1a2e; text-decoration: none; padding: 6px 14px; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .nav-toplink:hover { color: #0f3460; background: #f5f3ff; }

        .profile-btn {
          display: flex; align-items: center; gap: 6px; border: none; background: transparent;
          cursor: pointer; padding: 6px 14px; font-family: 'Poppins', sans-serif;
          font-size: 13px; font-weight: 500; color: #1a1a2e; border-radius: 6px;
          transition: color 0.15s, background 0.15s;
        }
        .profile-btn:hover { color: #0f3460; background: #f5f3ff; }

        .dropdown-item-link {
          display: block; padding: 10px 18px; font-size: 13.5px;
          font-family: 'Poppins', sans-serif; font-weight: 400; color: #1a1a2e;
          text-decoration: none; transition: background 0.12s, color 0.12s;
        }
        .dropdown-item-link:hover { background: #f5f3ff; color: #0f3460; }
      `}</style>

      {/* Announcement Bar */}
      <div style={{
        background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%)",
        color: "#e2e8f0", textAlign: "center", padding: "9px 16px",
        fontSize: "12.5px", fontFamily: "'Poppins', sans-serif",
        fontWeight: 400, letterSpacing: "0.02em", lineHeight: 1.5,
      }}>
        <span style={{ marginRight: 6 }}>✦</span>
        Free Shipping on 100+ Gemstones &amp; Diamonds.{" "}
        <span className="hidden sm:inline">Questions? Email </span>
        <a href="mailto:info@alphagemimports.com" style={{
          color: "#a5b4fc", textDecoration: "none", fontWeight: 500, borderBottom: "1px solid #a5b4fc",
        }}>
          info@alphagemimports.com
        </a>
        <span style={{ marginLeft: 6 }}>✦</span>
      </div>

      <nav
        ref={navRef}
        className="sticky top-0 z-50 transition-all duration-300"
        style={{
          background: scrolled ? "rgba(255,255,255,0.98)" : "#ffffff",
          backdropFilter: scrolled ? "blur(12px)" : "none",
          borderBottom: "1px solid #e8e8f0",
          boxShadow: scrolled ? "0 4px 24px rgba(79,70,229,0.08)" : "0 1px 0 #e8e8f0",
          fontFamily: "'Poppins', sans-serif",
        }}
      >
        {/* ── Top Row ── */}
        <div style={{ maxWidth: "1280px", margin: "0 auto" }}
          className="flex items-center justify-between gap-4 h-[68px] md:h-[76px] px-4 md:px-8">

          {/* Logo */}
          <Link href="/" onClick={() => setMenuOpen(false)} style={{
            display: "flex", alignItems: "center", gap: "10px",
            textDecoration: "none", flexShrink: 0,
          }}>
            <div style={{
              width: 36, height: 36,
              background: "linear-gradient(135deg, #1a1a2e 0%, #0f3460 100%)",
              borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center",
              boxShadow: "0 4px 12px rgba(79,70,229,0.3)",
            }}>
              <svg width="18" height="18" viewBox="0 0 32 32" fill="none">
                <polygon points="16,3 29,12 16,29 3,12" stroke="#ffffff" strokeWidth="1.8" fill="none"/>
                <polygon points="16,3 29,12 16,15 3,12" stroke="#a5b4fc" strokeWidth="1.2" fill="none" opacity="0.7"/>
              </svg>
            </div>
            <div>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 700, color: "#1a1a2e",
                fontSize: "clamp(15px, 3.5vw, 20px)", letterSpacing: "-0.02em", lineHeight: 1, display: "block",
              }}>Alpha Imports</span>
              <span style={{
                fontFamily: "'Poppins', sans-serif", fontWeight: 400, color: "#7c7c9a",
                fontSize: "10px", letterSpacing: "0.12em", textTransform: "uppercase",
                display: "block", marginTop: 2,
              }}>Fine Gemstones</span>
            </div>
          </Link>

          {/* Desktop Search */}
          <div className="hidden md:flex" style={{ flex: "1 1 auto", maxWidth: "340px" }}>
            <SearchBar initialCategories={initialCategories} variant="desktop" />
          </div>

          {/* Desktop Right */}
          <div className="hidden md:flex flex-col items-end gap-1.5" style={{ flexShrink: 0 }}>
            <div style={{ display: "flex", alignItems: "center", gap: "2px" }}>
              <Link href="/" className="nav-toplink">Home</Link>
              <Link href="/about" className="nav-toplink">About</Link>
              <Link href="/blogs" className="nav-toplink">Blog</Link>
              <Link href="/contact" className="nav-toplink">Contact Us</Link>

              {user ? (
                <>
                  <div ref={profileRef} style={{ position: "relative" }}>
                    <button className="profile-btn" onClick={() => setProfileOpen(!profileOpen)}>
                      <div style={{
                        width: 26, height: 26,
                        background: "linear-gradient(135deg, #0f3460, #7c3aed)",
                        borderRadius: "50%", display: "flex", alignItems: "center",
                        justifyContent: "center", fontSize: "11px", fontWeight: 700, color: "#fff",
                      }}>
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      Account
                      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{
                        transition: "transform 0.2s",
                        transform: profileOpen ? "rotate(180deg)" : "rotate(0)", opacity: 0.5,
                      }}>
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div style={{
                      position: "absolute", right: 0, top: "calc(100% + 8px)", width: "230px",
                      background: "#ffffff", border: "1px solid #e8e8f0",
                      borderTop: "3px solid #0f3460", borderRadius: "0 0 12px 12px",
                      boxShadow: "0 16px 48px rgba(79,70,229,0.14)",
                      opacity: profileOpen ? 1 : 0,
                      pointerEvents: profileOpen ? "auto" : "none",
                      transform: profileOpen ? "translateY(0)" : "translateY(-8px)",
                      transition: "opacity 0.18s ease, transform 0.18s ease", zIndex: 300,
                    }}>
                      <div style={{ padding: "14px 18px", borderBottom: "1px solid #f0eeff" }}>
                        <p style={{ fontSize: "10px", fontWeight: 600, letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "#9f9fc0", marginBottom: "4px",
                          fontFamily: "'Poppins', sans-serif" }}>Signed in as</p>
                        <p style={{ fontSize: "14px", fontWeight: 600, color: "#1a1a2e",
                          fontFamily: "'Poppins', sans-serif" }}>{user.name}</p>
                        <p style={{ fontSize: "12px", color: "#9f9fc0", marginTop: "2px",
                          fontFamily: "'Poppins', sans-serif" }}>{user.email}</p>
                      </div>
                      <div style={{ padding: "6px 0" }}>
                        <a href="/orders" className="dropdown-item-link" onClick={() => setProfileOpen(false)}>My Orders</a>
                        <a href="/account" className="dropdown-item-link" onClick={() => setProfileOpen(false)}>Account Settings</a>
                        {isAdmin && (
                          <a href="/admin" className="dropdown-item-link" onClick={() => setProfileOpen(false)}>Admin Panel</a>
                        )}
                      </div>
                      <div style={{ borderTop: "1px solid #f0eeff", padding: "6px 0" }}>
                        <button onClick={handleLogout} style={{
                          width: "100%", textAlign: "left", padding: "10px 18px",
                          fontSize: "13px", color: "#dc2626", fontFamily: "'Poppins', sans-serif",
                          fontWeight: 500, border: "none", background: "transparent",
                          cursor: "pointer", transition: "background 0.12s", borderRadius: "0 0 10px 10px",
                        }}
                          onMouseEnter={(e) => (e.currentTarget.style.background = "#fff5f5")}
                          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
                          Sign out
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* ── Desktop Cart Button (opens sidebar) ── */}
                  <CartIconButton />

                  <a href="/orders" className="nav-toplink">Orders</a>
                </>
              ) : (
                <>
                  <a href="/login" className="nav-toplink">Login</a>
                  <Link href="/signup" style={{
                    fontFamily: "'Poppins', sans-serif", fontSize: "13px", fontWeight: 600,
                    color: "#ffffff", background: "linear-gradient(135deg, #0f3460, #7c3aed)",
                    textDecoration: "none", padding: "7px 18px", borderRadius: "8px",
                    boxShadow: "0 3px 10px rgba(79,70,229,0.3)", transition: "opacity 0.15s, transform 0.15s",
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.opacity = "0.9"; e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.opacity = "1"; e.currentTarget.style.transform = "translateY(0)"; }}>
                    Sign Up
                  </Link>
                </>
              )}

              {isAdmin && (
                <a href="/admin" style={{
                  fontFamily: "'Poppins', sans-serif", fontSize: "12px", fontWeight: 600,
                  color: "#b45309", background: "#fffbeb", border: "1px solid #fde68a",
                  textDecoration: "none", padding: "5px 12px", borderRadius: "6px",
                  marginLeft: 4, transition: "background 0.15s",
                }}>Admin</a>
              )}
            </div>

            {/* Contact row */}
            <div style={{ display: "flex", alignItems: "center", gap: "20px" }}>
              <a href="tel:+12128403660" style={{
                display: "flex", alignItems: "center", gap: "5px", fontSize: "12px",
                color: "#7c7c9a", fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                textDecoration: "none", transition: "color 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f3460")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#7c7c9a")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                1-914-310-1480
              </a>
              <a href="mailto:info@alphagemimports.com" style={{
                display: "flex", alignItems: "center", gap: "5px", fontSize: "12px",
                color: "#7c7c9a", fontFamily: "'Poppins', sans-serif", fontWeight: 400,
                textDecoration: "none", transition: "color 0.15s",
              }}
                onMouseEnter={(e) => (e.currentTarget.style.color = "#0f3460")}
                onMouseLeave={(e) => (e.currentTarget.style.color = "#7c7c9a")}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                info@alphagemimports.com
              </a>
            </div>
          </div>

          {/* Mobile: Cart icon + Hamburger */}
          <div className="flex md:hidden items-center gap-3">
            {user && (
              // ── Mobile Cart Button (opens sidebar) ──
              <CartIconButton mobile />
            )}
            <button onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu" style={{
              background: "transparent", border: "none", cursor: "pointer",
              padding: "6px", display: "flex", flexDirection: "column",
              gap: "5px", justifyContent: "center", alignItems: "center",
            }}>
              <span style={{
                display: "block", width: "22px", height: "2px", background: "#1a1a2e",
                borderRadius: "2px", transition: "transform 0.25s, opacity 0.25s",
                transform: menuOpen ? "translateY(7px) rotate(45deg)" : "none",
              }}/>
              <span style={{
                display: "block", width: "22px", height: "2px", background: "#1a1a2e",
                borderRadius: "2px", transition: "opacity 0.25s", opacity: menuOpen ? 0 : 1,
              }}/>
              <span style={{
                display: "block", width: "22px", height: "2px", background: "#1a1a2e",
                borderRadius: "2px", transition: "transform 0.25s, opacity 0.25s",
                transform: menuOpen ? "translateY(-7px) rotate(-45deg)" : "none",
              }}/>
            </button>
          </div>
        </div>

        {/* ── Bottom Category Row — Desktop ── */}
        <div className="hidden md:block" style={{ borderTop: "1px solid #eeeef8", background: "#faf9ff" }}>
          <div style={{ maxWidth: "1280px", margin: "0 auto", display: "flex", alignItems: "stretch" }}
            className="px-4 md:px-8">
            {loading && [110, 105, 145, 75, 88, 120, 88, 55].map((w, i) => (
              <div key={i} style={{
                height: "10px", width: `${w}px`, borderRadius: "4px", flexShrink: 0,
                background: "linear-gradient(90deg, #f0eefc 25%, #e4e0f8 50%, #f0eefc 75%)",
                backgroundSize: "200% 100%", animation: "navShimmer 1.4s ease infinite",
                margin: "16px 18px",
              }}/>
            ))}

            {!loading && categories.map((cat) => {
              const hasSubs = (cat.subcategories?.length ?? 0) > 0;
              const isOpen = openDropdown === cat.slug;
              const isExpanded = expandedDropdowns.has(cat.slug);
              const visibleSubs = isExpanded ? cat.subcategories : cat.subcategories.slice(0, MAX_VISIBLE_SUBS);
              const hasMore = cat.subcategories.length > MAX_VISIBLE_SUBS;

              return (
                <div key={cat._id} style={{ position: "relative" }}
                  onMouseEnter={() => { cancelClose(); openCat(cat.slug); }}
                  onMouseLeave={schedulClose}>
                  <Link href={`/products?category=${cat.slug}`}
                    className={`nav-cat-tab ${isOpen ? "active" : ""}`}>
                    {cat.name}
                    {hasSubs && (
                      <svg className="chevron" width="9" height="9" viewBox="0 0 10 10" fill="none">
                        <path d="M2 3.5L5 6.5L8 3.5" stroke="currentColor" strokeWidth="1.8"
                          strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    )}
                  </Link>

                  {hasSubs && (
                    <div onMouseEnter={cancelClose} onMouseLeave={schedulClose} style={{
                      position: "absolute", top: "100%", left: 0,
                      width: isExpanded ? "660px" : "240px",
                      background: "#ffffff", border: "1px solid #e8e4f8",
                      borderTop: "3px solid #0f3460", borderRadius: "0 0 14px 14px",
                      boxShadow: "0 20px 60px rgba(79,70,229,0.12), 0 4px 16px rgba(0,0,0,0.06)",
                      zIndex: 9999, paddingBottom: "8px",
                      opacity: isOpen ? 1 : 0, visibility: isOpen ? "visible" : "hidden",
                      transform: isOpen ? "translateY(0px)" : "translateY(-10px)",
                      transition: "opacity 0.2s ease, transform 0.2s ease, visibility 0.2s, width 0.25s ease",
                      maxWidth: "calc(100vw - 32px)",
                    }}>
                      <Link href={`/products?category=${cat.slug}`}
                        onClick={() => setOpenDropdown(null)}
                        style={{
                          display: "flex", alignItems: "center", justifyContent: "space-between",
                          padding: "12px 20px", fontSize: "11.5px", letterSpacing: "0.1em",
                          textTransform: "uppercase", color: "#0f3460", textDecoration: "none",
                          fontFamily: "'Poppins', sans-serif", fontWeight: 700,
                          borderBottom: "1px solid #f0eeff", marginBottom: "4px", background: "#faf9ff",
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.background = "#f0eeff")}
                        onMouseLeave={(e) => (e.currentTarget.style.background = "#faf9ff")}>
                        All {cat.name}
                        <svg width="12" height="12" viewBox="0 0 16 16" fill="none">
                          <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.8"
                            strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </Link>

                      {isExpanded ? (
                        <div style={{
                          display: "grid", gridTemplateColumns: "repeat(3, 1fr)",
                          gap: "2px 0", padding: "4px 8px",
                        }}>
                          {cat.subcategories.map((sub) => (
                            <Link key={sub._id}
                              href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                              onClick={() => setOpenDropdown(null)} className="sub-link-grid">
                              {sub.name}
                            </Link>
                          ))}
                        </div>
                      ) : (
                        visibleSubs.map((sub) => (
                          <Link key={sub._id}
                            href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                            onClick={() => setOpenDropdown(null)} className="sub-link">
                            {sub.name}
                          </Link>
                        ))
                      )}

                      {hasMore && (
                        <button className="see-more-btn" onClick={(e) => toggleExpand(cat.slug, e)}>
                          {isExpanded ? (
                            <><svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                              <path d="M4 10L8 6l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>Show less</>
                          ) : (
                            <><svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                              <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>{cat.subcategories.length - MAX_VISIBLE_SUBS} more...</>
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </nav>

      {/* ── Mobile Menu Overlay ── */}
      <div className="fixed z-40 md:hidden" style={{
        top: "var(--navbar-height, 64px)", left: 0, right: 0, bottom: 0, background: "#ffffff",
        transform: menuOpen ? "translateX(0)" : "translateX(100%)",
        transition: "transform 0.3s cubic-bezier(0.22, 1, 0.36, 1)",
        fontFamily: "'Poppins', sans-serif", overflowY: "auto", WebkitOverflowScrolling: "touch",
      }}>
        <div style={{ padding: "20px 20px 48px", display: "flex", flexDirection: "column" }}>

          {/* Mobile Search */}
          <div style={{
            border: "1.5px solid #e2e0f0", display: "flex", alignItems: "center",
            padding: "0 14px", height: "44px", marginBottom: "24px",
            borderRadius: "10px", background: "#faf9ff",
          }}>
            <svg width="14" height="14" viewBox="0 0 16 16" fill="none"
              style={{ color: "#9f9fc0", marginRight: 8 }}>
              <circle cx="6.5" cy="6.5" r="4.5" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <input type="text" placeholder="Search gemstones..." style={{
              flex: 1, border: "none", background: "transparent",
              fontFamily: "'Poppins', sans-serif", fontSize: "13px", outline: "none", color: "#1a1a2e",
            }}/>
          </div>

          {loading && [1, 2, 3, 4, 5].map((i) => (
            <div key={i} style={{
              height: "52px",
              background: "linear-gradient(90deg, #f5f3ff 25%, #ede9fe 50%, #f5f3ff 75%)",
              backgroundSize: "200% 100%", animation: "navShimmer 1.4s ease infinite",
              borderBottom: "1px solid #f0eeff", borderRadius: 4, marginBottom: 2,
            }}/>
          ))}

          {!loading && categories.map((cat) => {
            const hasSubs = (cat.subcategories?.length ?? 0) > 0;
            const isExpanded = activeMobileCategory === cat.slug;
            return (
              <div key={cat._id} style={{ borderBottom: "1px solid #f0eeff" }}>
                <button onClick={() => {
                  if (!hasSubs) { router.push(`/products?category=${cat.slug}`); setMenuOpen(false); }
                  else setActiveMobileCategory(isExpanded ? null : cat.slug);
                }} style={{
                  width: "100%", display: "flex", alignItems: "center", justifyContent: "space-between",
                  padding: "15px 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e",
                  fontFamily: "'Poppins', sans-serif", border: "none", background: "transparent",
                  cursor: "pointer", textAlign: "left",
                }}>
                  {cat.name}
                  {hasSubs && (
                    <div style={{
                      width: 28, height: 28, background: isExpanded ? "#0f3460" : "#f5f3ff",
                      borderRadius: "50%", display: "flex", alignItems: "center",
                      justifyContent: "center", transition: "background 0.2s",
                    }}>
                      <svg width="11" height="11" viewBox="0 0 10 10" fill="none" style={{
                        transition: "transform 0.22s", transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                      }}>
                        <path d="M2 3.5L5 6.5L8 3.5" stroke={isExpanded ? "#fff" : "#0f3460"}
                          strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </div>
                  )}
                </button>

                {hasSubs && (
                  <div style={{
                    overflow: "hidden",
                    maxHeight: isExpanded ? `${(cat.subcategories.length + 1) * 48}px` : "0",
                    transition: "max-height 0.3s ease",
                  }}>
                    <Link href={`/products?category=${cat.slug}`} onClick={() => setMenuOpen(false)} style={{
                      display: "block", padding: "11px 16px", fontSize: "11.5px",
                      letterSpacing: "0.09em", textTransform: "uppercase", color: "#0f3460",
                      fontWeight: 700, textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                      background: "#f5f3ff", borderRadius: 6, marginBottom: 4,
                    }}>All {cat.name} →</Link>
                    {cat.subcategories.map((sub) => (
                      <Link key={sub._id}
                        href={`/products?category=${cat.slug}&subcategory=${sub.slug}`}
                        onClick={() => setMenuOpen(false)} style={{
                          display: "flex", alignItems: "center", gap: 8, padding: "10px 16px",
                          fontSize: "14px", fontWeight: 400, color: "#2d2d3a",
                          textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                          borderTop: "1px solid #f5f3ff",
                        }}>
                        <span style={{ width: 4, height: 4, borderRadius: "50%", background: "#c4b5fd", flexShrink: 0 }}/>
                        {sub.name}
                      </Link>
                    ))}
                    <div style={{ height: "10px" }}/>
                  </div>
                )}
              </div>
            );
          })}

          {/* Auth links */}
          {user ? (
            <>
              {/* ── Mobile Cart: opens sidebar (not a link) ── */}
              <button onClick={() => { setMenuOpen(false); setCartOpen(true); }} style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "15px 0", fontSize: "15px", fontWeight: 500, color: "#1a1a2e",
                fontFamily: "'Poppins', sans-serif", borderBottom: "1px solid #f0eeff",
                background: "transparent", border: "none",
                cursor: "pointer", width: "100%", textAlign: "left",
              } as React.CSSProperties}>
                Cart
                {cartCount > 0 && (
                  <span style={{
                    background: "linear-gradient(135deg, #0f3460, #7c3aed)", color: "#fff",
                    fontSize: "10px", fontWeight: 700, borderRadius: "50%",
                    width: "20px", height: "20px", display: "inline-flex",
                    alignItems: "center", justifyContent: "center",
                  }}>{cartCount > 99 ? "99+" : cartCount}</span>
                )}
              </button>
              <Link href="/orders" onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", padding: "15px 0",
                fontSize: "15px", fontWeight: 500, color: "#1a1a2e",
                textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                borderBottom: "1px solid #f0eeff",
              }}>Orders</Link>
              <Link href="/blogs" onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", padding: "15px 0",
                fontSize: "15px", fontWeight: 500, color: "#1a1a2e",
                textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                borderBottom: "1px solid #f0eeff",
              }}>Blog</Link>
              {isAdmin && (
                <Link href="/admin" onClick={() => setMenuOpen(false)} style={{
                  display: "flex", alignItems: "center", padding: "15px 0",
                  fontSize: "15px", fontWeight: 600, color: "#b45309",
                  textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                  borderBottom: "1px solid #f0eeff",
                }}>Admin</Link>
              )}
              <div style={{ borderTop: "1px solid #ede9fe", margin: "24px 0 16px" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "16px 0" }}>
                  <div style={{
                    width: 40, height: 40, background: "linear-gradient(135deg, #0f3460, #7c3aed)",
                    borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                    fontSize: "16px", fontWeight: 700, color: "#fff", flexShrink: 0,
                  }}>{user.name?.charAt(0).toUpperCase()}</div>
                  <div>
                    <p style={{ fontSize: "15px", fontWeight: 600, color: "#1a1a2e", fontFamily: "'Poppins', sans-serif" }}>{user.name}</p>
                    <p style={{ fontSize: "12px", color: "#9f9fc0", marginTop: "2px", fontFamily: "'Poppins', sans-serif" }}>{user.email}</p>
                  </div>
                </div>
              </div>
              <button onClick={handleLogout} style={{
                textAlign: "left", fontSize: "14px", fontWeight: 500, color: "#dc2626",
                fontFamily: "'Poppins', sans-serif", border: "none", background: "transparent",
                cursor: "pointer", padding: "4px 0",
              }}>Sign out</button>
            </>
          ) : (
            <>
              <div style={{ borderTop: "1px solid #f0eeff", margin: "24px 0" }}/>
              <Link href="/login" onClick={() => setMenuOpen(false)} style={{
                display: "flex", alignItems: "center", padding: "15px 0",
                fontSize: "15px", fontWeight: 500, color: "#1a1a2e",
                textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                borderBottom: "1px solid #f0eeff",
              }}>Login</Link>
              <div style={{ marginTop: "20px" }}>
                <Link href="/signup" onClick={() => setMenuOpen(false)} style={{
                  display: "block", textAlign: "center", fontSize: "14px", fontWeight: 600,
                  letterSpacing: "0.02em", color: "#ffffff",
                  background: "linear-gradient(135deg, #0f3460, #7c3aed)",
                  padding: "14px 24px", textDecoration: "none", fontFamily: "'Poppins', sans-serif",
                  borderRadius: "10px", boxShadow: "0 4px 14px rgba(79,70,229,0.3)",
                }}>Create Account</Link>
              </div>
            </>
          )}

          <div style={{ marginTop: "40px", paddingBottom: "32px" }}>
            <div style={{ borderTop: "1px solid #f0eeff", paddingTop: "20px" }}>
              <a href="tel:+12128403660" style={{
                display: "flex", alignItems: "center", gap: 8, fontSize: "13px",
                color: "#7c7c9a", textDecoration: "none", marginBottom: "10px",
                fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 10.8 19.79 19.79 0 01.12 2.18 2 2 0 012.11 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.09 7.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 14.92z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                212-840-3660
              </a>
              <a href="mailto:info@alphagemimports.com" style={{
                display: "flex", alignItems: "center", gap: 8, fontSize: "13px",
                color: "#7c7c9a", textDecoration: "none", fontFamily: "'Poppins', sans-serif", fontWeight: 400,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"
                    stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <polyline points="22,6 12,13 2,6" stroke="currentColor" strokeWidth="2"
                    strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                info@alphagemimports.com
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* ── Cart Sidebar ── NEW */}
      <CartSidebar open={cartOpen} onClose={() => setCartOpen(false)} />
    </>
  );
}