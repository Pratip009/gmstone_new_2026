"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ICategory {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
}

interface ISubcategory {
  _id: string;
  name: string;
  slug: string;
  category: { _id: string; name: string; slug: string };
  description?: string;
  imageUrl?: string;
  isActive: boolean;
}

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  price: number;
  images: string[];
  category: string;
  subcategory: string;
  origin?: string;
  tag?: string;
}
interface IPickProduct {
  _id: string;
  name: string;
  image?: string;
  price: number;
}

// ─── Skeleton ─────────────────────────────────────────────────────────────────
function Skeleton({
  w, h, className = "", style,
}: {
  w?: string | number; h?: string | number; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div
      className={`skeleton-pulse ${className}`}
      style={{ width: w ?? "100%", height: h ?? 16, borderRadius: 2, background: "#f3f3f3", display: "block", ...style }}
    />
  );
}

// ─── Subcategory circle card (landing) ────────────────────────────────────────
function SubcategoryCard({ sub, onSelect }: { sub: ISubcategory; onSelect: (sub: ISubcategory) => void }) {
  const [hovered, setHovered] = useState(false);
  const fallback = "https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=300";

  return (
    <div
      onClick={() => onSelect(sub)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer", gap: 12 }}
    >
      <div style={{
        width: "100%", aspectRatio: "1", maxWidth: 180, margin: "0 auto", overflow: "hidden",
        borderRadius: "50%",
        
      }}>
        <img
          src={sub.imageUrl ?? fallback}
          alt={sub.name}
          style={{
            width: "100%", height: "100%", objectFit: "cover",
            transform: hovered ? "scale(1.1)" : "scale(1)",
            transition: "transform 0.45s ease",
          }}
        />
      </div>
      <p style={{
        fontFamily: '"Playfair Display", Georgia, serif',
        fontSize: 14, color: hovered ? "#1a3a6b" : "#333",
        textAlign: "center", lineHeight: 1.3, transition: "color 0.2s",
        letterSpacing: "0.01em",
      }}>
        {sub.name}
      </p>
    </div>
  );
}

// ─── Product Card ─────────────────────────────────────────────────────────────
function ProductCard({ product }: { product: IProduct }) {
  const [hovered, setHovered] = useState(false);
  const img = product.images?.[0] ?? "https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=400";

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ display: "flex", flexDirection: "column", alignItems: "center", cursor: "pointer" }}
    >
      <div style={{
        width: "100%", aspectRatio: "1", position: "relative", overflow: "hidden",
        border: hovered ? "1px solid #c0c0c0" : "1px solid #ebebeb",
        transition: "border-color 0.2s, box-shadow 0.2s",
        boxShadow: hovered ? "0 6px 20px -4px rgba(0,0,0,0.10)" : "0 1px 4px -1px rgba(0,0,0,0.06)",
        background: "#fafafa", marginBottom: 10,
      }}>
        <img src={img} alt={product.name} style={{ width: "100%", height: "100%", objectFit: "cover", transform: hovered ? "scale(1.05)" : "scale(1)", transition: "transform 0.5s ease" }} />
        <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.28)", display: "flex", alignItems: "center", justifyContent: "center", opacity: hovered ? 1 : 0, transition: "opacity 0.25s" }}>
          <span style={{ fontSize: 9, letterSpacing: "0.28em", textTransform: "uppercase", color: "#fff", fontFamily: "sans-serif", border: "1px solid rgba(255,255,255,0.7)", padding: "4px 12px" }}>View Details</span>
        </div>
        {product.tag && (
          <div style={{ position: "absolute", top: 8, left: 8, fontSize: 7, letterSpacing: "0.2em", textTransform: "uppercase", fontFamily: "sans-serif", fontWeight: 600, background: "#111", color: "#fff", padding: "2px 7px" }}>{product.tag}</div>
        )}
      </div>
      <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, color: "#111", textAlign: "center", lineHeight: 1.4, marginBottom: 3 }}>{product.name}</p>
      {product.origin && <p style={{ fontSize: 9, letterSpacing: "0.18em", textTransform: "uppercase", color: "#aaa", fontFamily: "sans-serif", marginBottom: 4 }}>{product.origin}</p>}
      <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, color: "#333", fontWeight: 500 }}>₹{product.price.toLocaleString("en-IN")}</p>
    </div>
  );
}

function ProductCardSkeleton() {
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
      <Skeleton h={0} style={{ width: "100%", aspectRatio: "1", marginBottom: 10 }} />
      <Skeleton w="70%" h={14} style={{ marginBottom: 6 }} />
      <Skeleton w="40%" h={12} />
    </div>
  );
}

// ─── Sidebar group ────────────────────────────────────────────────────────────
function SidebarGroup({
  category, subcategories, activeSubSlug, onSelectSub, onSelectCat,
}: {
  category: ICategory;
  subcategories: ISubcategory[];
  activeSubSlug: string;
  onSelectSub: (sub: ISubcategory) => void;
  onSelectCat: (cat: ICategory) => void;
}) {
  const [open, setOpen] = useState(true);
  const [showAll, setShowAll] = useState(false);
  const LIMIT = 4;
  const visible = showAll ? subcategories : subcategories.slice(0, LIMIT);

  return (
    <div style={{ borderBottom: "1px solid #ddd" }}>
      <div style={{ display: "flex", alignItems: "center", background: "#e8eaf0" }}>
        <button
          onClick={() => onSelectCat(category)}
          style={{ flex: 1, textAlign: "left", padding: "7px 14px", background: "transparent", border: "none", cursor: "pointer" }}
        >
          <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>
            {category.name}
          </span>
        </button>
        {subcategories.length > 0 && (
          <button
            onClick={() => setOpen((o) => !o)}
            style={{ padding: "7px 10px", background: "transparent", border: "none", cursor: "pointer", color: "#666" }}
          >
            <svg width="8" height="5" viewBox="0 0 10 6" fill="none"
              style={{ transform: open ? "rotate(0deg)" : "rotate(-90deg)", transition: "transform 0.2s" }}>
              <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </button>
        )}
      </div>

      {open && subcategories.length > 0 && (
        <div style={{ paddingBottom: 4, background: "#fff" }}>
          {visible.map((sub) => {
            const isActive = activeSubSlug === sub.slug;
            return (
              <button
                key={sub._id}
                onClick={() => onSelectSub(sub)}
                style={{
                  width: "100%", textAlign: "left",
                  padding: "4px 14px 4px 22px",
                  background: isActive ? "#eef0f8" : "transparent",
                  border: "none", cursor: "pointer", display: "block",
                }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = "transparent"; }}
              >
                <span style={{
                  fontSize: 12, fontFamily: "sans-serif",
                  color: isActive ? "#1a3a6b" : "#4a5568",
                  fontWeight: isActive ? 600 : 400,
                  textDecoration: isActive ? "underline" : "none",
                }}>
                  {sub.name}
                </span>
              </button>
            );
          })}
          {subcategories.length > LIMIT && (
            <button
              onClick={() => setShowAll((s) => !s)}
              style={{ padding: "3px 14px 3px 22px", background: "transparent", border: "none", cursor: "pointer", fontSize: 11, color: "#7a6a4f", fontFamily: "sans-serif", fontStyle: "italic" }}
            >
              {showAll ? "Less..." : "More..."}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function SidebarSkeleton() {
  return (
    <div>
      {[1, 2, 3, 4].map((i) => (
        <div key={i} style={{ borderBottom: "1px solid #ddd" }}>
          <div style={{ padding: "8px 14px", background: "#e8eaf0" }}>
            <Skeleton w="65%" h={13} />
          </div>
          <div style={{ padding: "6px 14px 6px 22px" }}>
            {[1, 2, 3].map((j) => <Skeleton key={j} w="55%" h={10} style={{ marginBottom: 5 }} />)}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Fisher-Yates shuffle ─────────────────────────────────────────────────────
function shuffleArray<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

// ─── Landing view ─────────────────────────────────────────────────────────────
function LandingView({
  categories, subcategories, onSelectSub, onSelectCat,
}: {
  categories: ICategory[];
  subcategories: ISubcategory[];
  onSelectSub: (sub: ISubcategory) => void;
  onSelectCat: (cat: ICategory) => void;
}) {
  const RANDOM_PICK = 4;

  const randomSubsMap = useMemo(() => {
    const map: Record<string, ISubcategory[]> = {};
    categories.forEach((cat) => {
      const all = subcategories.filter(
        (s) => s.category._id.toString() === cat._id.toString()
      );
      map[cat._id] = shuffleArray(all).slice(0, RANDOM_PICK);
    });
    return map;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [categories, subcategories]);

  return (
    <div>
      {categories.map((cat) => {
        const pickedSubs = randomSubsMap[cat._id] ?? [];
        if (pickedSubs.length === 0) return null;

        const totalCount = subcategories.filter(
          (s) => s.category._id.toString() === cat._id.toString()
        ).length;

        return (
          <section key={cat._id} style={{ marginBottom: 48 }}>
            <div style={{
              marginBottom: 22, paddingBottom: 8, borderBottom: "1px solid #e0d8cc",
              display: "flex", alignItems: "baseline", gap: 14,
            }}>
              <button onClick={() => onSelectCat(cat)}
                style={{ background: "none", border: "none", cursor: "pointer", padding: 0 }}>
                <span style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 20, fontWeight: 700, color: "#1a3a6b",
                  textDecoration: "underline", textUnderlineOffset: 3,
                  textDecorationColor: "#c8a96e",
                }}>
                  {cat.name}
                </span>
              </button>
              {totalCount > RANDOM_PICK && (
                <button onClick={() => onSelectCat(cat)} style={{
                  background: "none", border: "none", cursor: "pointer", padding: 0,
                  fontSize: 11, color: "#7a6a4f", fontFamily: "sans-serif",
                  fontStyle: "italic", letterSpacing: "0.04em",
                }}>
                  See all {totalCount} →
                </button>
              )}
            </div>

            <div style={{
              display: "grid", gap: "28px 24px",
              gridTemplateColumns: "repeat(4, 1fr)",
            }}>
              {pickedSubs.map((sub) => (
                <SubcategoryCard key={sub._id} sub={sub} onSelect={onSelectSub} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function LandingSkeleton() {
  return (
    <div>
      {[1, 2, 3].map((i) => (
        <div key={i} style={{ marginBottom: 36 }}>
          <Skeleton w={160} h={16} style={{ marginBottom: 14 }} />
          <div style={{ display: "grid", gap: "14px 12px", gridTemplateColumns: "repeat(4, 1fr)" }}>
            {Array.from({ length: 4 }).map((_, j) => (
              <div key={j} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 8 }}>
                <Skeleton style={{ width: "100%", aspectRatio: "1", borderRadius: "50%" }} />
                <Skeleton w="70%" h={10} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Buyers Picks ─────────────────────────────────────────────────────────────
function BuyersPicks({ products }: { products: IPickProduct[] }) {
  const [hovered, setHovered] = useState<string | null>(null);
  const fallback = "https://images.pexels.com/photos/1458867/pexels-photo-1458867.jpeg?auto=compress&cs=tinysrgb&w=200";

  return (
    <aside style={{
      width: 240, flexShrink: 0,
      borderLeft: "1px solid #dddddd",
      background: "linear-gradient(180deg, #ffffff 0%, #ffffff 100%)",
      position: "sticky", top: 0, maxHeight: "100vh", overflowY: "auto",
    }}>
      <div style={{
        background: "linear-gradient(135deg, #1a2a5e 0%, #2c3e7a 60%, #1a3060 100%)",
        padding: "14px 16px 12px", position: "relative", overflow: "hidden",
      }}>
        <div style={{
          position: "absolute", top: -10, right: -10, width: 50, height: 50,
          background: "rgba(200,169,110,0.15)", transform: "rotate(45deg)",
        }} />
        <div style={{ position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 7, marginBottom: 2 }}>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0L10 5L5 10L0 5Z" fill="#c8a96e" /></svg>
            <span style={{ fontSize: 9, letterSpacing: "0.22em", textTransform: "uppercase", color: "#c8a96e", fontFamily: "sans-serif", fontWeight: 700 }}>
              Best Sellers
            </span>
            <svg width="10" height="10" viewBox="0 0 10 10" fill="none"><path d="M5 0L10 5L5 10L0 5Z" fill="#c8a96e" /></svg>
          </div>
          <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 15, fontWeight: 700, color: "#fff", letterSpacing: "0.01em" }}>
            Curated Picks
          </p>
        </div>
      </div>

      <div style={{ height: 2, background: "linear-gradient(90deg, transparent, #c8a96e 30%, #e8c97e 50%, #c8a96e 70%, transparent)" }} />

      <div style={{ padding: "8px 0" }}>
        {products.map((p, i) => {
          const isHovered = hovered === p._id;
          return (
            <div
              key={p._id}
              onMouseEnter={() => setHovered(p._id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                padding: "12px 14px", borderBottom: "1px solid #ede6d8",
                cursor: "pointer",
                background: isHovered ? "rgba(200,169,110,0.07)" : "transparent",
                transition: "background 0.2s", display: "flex", gap: 12, alignItems: "center",
              }}
            >
              <div style={{ flexShrink: 0 }}>
                <div style={{
                  width: 24, height: 24,
                  background: i === 0 ? "linear-gradient(135deg, #c8a96e, #e8c97e)"
                    : i === 1 ? "linear-gradient(135deg, #b0b0b0, #d8d8d8)"
                    : i === 2 ? "linear-gradient(135deg, #cd7f32, #e8a060)"
                    : "linear-gradient(135deg, #2c3e7a, #3d52a0)",
                  color: "#fff", fontSize: 10, fontWeight: 800,
                  display: "flex", alignItems: "center", justifyContent: "center",
                  fontFamily: "sans-serif",
                  clipPath: "polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)",
                }}>
                  {i + 1}
                </div>
              </div>
              <div style={{
                width: 62, height: 62, flexShrink: 0, borderRadius: "50%", overflow: "hidden",
                
                transition: "border-color 0.25s",
                boxShadow: isHovered ? "0 4px 14px -3px rgba(200,169,110,0.4)" : "0 2px 6px -2px rgba(0,0,0,0.10)",
              }}>
                <img
                  src={p.image ?? fallback} alt={p.name}
                  style={{ width: "100%", height: "100%", objectFit: "cover", transform: isHovered ? "scale(1.1)" : "scale(1)", transition: "transform 0.4s ease" }}
                />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{
                  fontFamily: '"Playfair Display", Georgia, serif',
                  fontSize: 12, color: "#1a1a2e", lineHeight: 1.35, marginBottom: 5,
                  overflow: "hidden", textOverflow: "ellipsis",
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical",
                }}>
                  {p.name}
                </p>
                <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, fontWeight: 700, color: "#1a2a5e" }}>
                  ₹{p.price.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {products.length > 0 && (
        <div style={{ padding: "12px 14px 16px" }}>
          <button
            onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #c8a96e 0%, #e8c97e 100%)"; (e.currentTarget as HTMLElement).style.color = "#1a2a5e"; }}
            onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.background = "linear-gradient(135deg, #1a2a5e 0%, #2c3e7a 100%)"; (e.currentTarget as HTMLElement).style.color = "#c8a96e"; }}
            style={{
              width: "100%", padding: "9px 0",
              background: "linear-gradient(135deg, #1a2a5e 0%, #2c3e7a 100%)",
              border: "none", cursor: "pointer", fontFamily: "sans-serif", fontSize: 9,
              letterSpacing: "0.22em", textTransform: "uppercase",
              color: "#c8a96e", fontWeight: 700, transition: "background 0.25s, color 0.25s",
            }}
          >
            View All Trending →
          </button>
        </div>
      )}
    </aside>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ShopLayout() {
  const router = useRouter();

  const [categories, setCategories]       = useState<ICategory[]>([]);
  const [subcategories, setSubcategories] = useState<ISubcategory[]>([]);
  const [products, setProducts]           = useState<IProduct[]>([]);
  const [loadingCats, setLoadingCats]     = useState(true);
  const [loadingProds, setLoadingProds]   = useState(false);
  const [buyersPicks, setBuyersPicks]     = useState<IPickProduct[]>([]);

  const [activeSub, setActiveSub]   = useState<ISubcategory | null>(null);
  const [activeCat, setActiveCat]   = useState<ICategory | null>(null);

  const [sortBy, setSortBy]         = useState("featured");
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catError, setCatError]     = useState("");
  const [prodError, setProdError]   = useState("");

  useEffect(() => {
    fetch("/api/categories?withSubcategories=true")
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((json) => {
        const enriched: Array<ICategory & { subcategories: ISubcategory[] }> = json.data ?? [];
        const cats: ICategory[] = enriched.filter((c) => c.isActive).map(({ subcategories: _, ...cat }) => cat as ICategory);
        const subs: ISubcategory[] = enriched.filter((c) => c.isActive).flatMap((c) => (c.subcategories ?? []).filter((s) => s.isActive));
        setCategories(cats);
        setSubcategories(subs);
      })
      .catch(() => setCatError("Failed to load categories."))
      .finally(() => setLoadingCats(false));
  }, []);

  useEffect(() => {
    if (!activeSub) return;
    setLoadingProds(true);
    setProdError("");
    setProducts([]);
    const params = new URLSearchParams();
    params.set("subcategory", activeSub.slug);
    if (sortBy !== "featured") params.set("sort", sortBy);
    fetch(`/api/products?${params.toString()}`)
      .then((r) => { if (!r.ok) throw new Error(`HTTP ${r.status}`); return r.json(); })
      .then((res) => { const raw = res?.data ?? res?.products ?? res?.items ?? res; setProducts(Array.isArray(raw) ? raw : []); })
      .catch(() => setProdError("Failed to load products."))
      .finally(() => setLoadingProds(false));
  }, [activeSub, sortBy]);

  useEffect(() => {
    fetch("/api/products/popular").then(r => r.json()).then(res => {
      const raw = res?.data ?? [];
      setBuyersPicks(Array.isArray(raw) ? raw : []);
    });
  }, []);

  function subsByCat(catId: string): ISubcategory[] {
    return subcategories.filter((s) => s.category._id.toString() === catId.toString());
  }

  // ── Navigation handlers — push URL with query params ──────────────────────

  // Subcategory click → /products?category=<cat-slug>&subcategory=<sub-slug>
  function handleSelectSub(sub: ISubcategory) {
    setMobileOpen(false);
    router.push(`/products?category=${sub.category.slug}&subcategory=${sub.slug}`);
  }

  // Category click → /products?category=<cat-slug>
  function handleSelectCat(cat: ICategory) {
    setMobileOpen(false);
    router.push(`/products?category=${cat.slug}`);
  }

  // ── Local-only handlers used by breadcrumb (stay on page) ────────────────
  function handleSelectCatLocal(cat: ICategory) {
    setActiveSub(null);
    setActiveCat(cat);
  }

  function goHome() {
    setActiveSub(null);
    setActiveCat(null);
  }

  const landingCategories = activeCat ? categories.filter((c) => c._id === activeCat._id) : categories;
  const parentCat = activeSub ? activeSub.category : null;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=DM+Sans:wght@300;400;500&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        .shop-root { font-family: 'DM Sans', sans-serif; background: #fff; min-height: 100vh; color: #111; }
        @keyframes shimmer { 0% { background-position: -600px 0; } 100% { background-position: 600px 0; } }
        .skeleton-pulse { background: linear-gradient(90deg, #f0f0f0 25%, #fafafa 50%, #f0f0f0 75%); background-size: 600px 100%; animation: shimmer 1.4s infinite linear; }
        @keyframes fadeUp { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .fade-up { animation: fadeUp 0.3s ease both; }
        .product-grid { display: grid; gap: 20px; grid-template-columns: repeat(2, 1fr); }
        @media (min-width: 520px)  { .product-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (min-width: 860px)  { .product-grid { grid-template-columns: repeat(4, 1fr); } }
        .sort-select { font-family: 'DM Sans', sans-serif; font-size: 12px; color: #333; background: #fff; border: 1px solid #ccc; padding: 4px 8px; cursor: pointer; outline: none; }
        .sort-select:focus { border-color: #aaa; }
        .sidebar-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.35); z-index: 40; }
        @media (max-width: 767px) {
          .sidebar-overlay.open  { display: block; }
          .sidebar-drawer        { position: fixed !important; top: 0; left: 0; bottom: 0; z-index: 50; transform: translateX(-100%); box-shadow: 4px 0 24px rgba(0,0,0,0.15); }
          .sidebar-drawer.open   { transform: translateX(0); }
          .mob-menu-btn          { display: flex !important; }
          .mob-close-btn         { display: block !important; }
        }
        ::-webkit-scrollbar { width: 4px; }
        ::-webkit-scrollbar-track { background: #f5f5f5; }
        ::-webkit-scrollbar-thumb { background: #ccc; border-radius: 2px; }
      `}</style>

      <div className="shop-root">
        <div style={{ display: "flex", alignItems: "flex-start" }}>

          <div className={`sidebar-overlay ${mobileOpen ? "open" : ""}`} onClick={() => setMobileOpen(false)} />

          {/* ── Sidebar ── */}
          <aside
            className={`sidebar-drawer ${mobileOpen ? "open" : ""}`}
            style={{ width: 210, flexShrink: 0, background: "#fff", borderRight: "1px solid #ccc", minHeight: "calc(100vh - 44px)", position: "sticky", top: 44, overflowY: "auto", transition: "transform 0.25s ease" }}
          >
            <div style={{ background: "#2c3e7a", padding: "8px 14px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.15em", color: "#fff", fontFamily: "sans-serif", fontWeight: 700 }}>Categories</span>
              <button onClick={() => setMobileOpen(false)} className="mob-close-btn"
                style={{ display: "none", background: "none", border: "none", cursor: "pointer", color: "#fff", fontSize: 15 }}>✕</button>
            </div>

            <div style={{ borderBottom: "1px solid #ddd", padding: "4px 0" }}>
              {["Advanced Diamond Search", "Advanced Precious gem Search"].map((l) => (
                <a key={l} href="#"
                  style={{ display: "block", fontSize: 12, color: "#2c3e7a", fontFamily: "sans-serif", textDecoration: "none", padding: "4px 14px", lineHeight: 1.6 }}
                  onMouseEnter={(e) => ((e.target as HTMLElement).style.textDecoration = "underline")}
                  onMouseLeave={(e) => ((e.target as HTMLElement).style.textDecoration = "none")}
                >{l}</a>
              ))}
            </div>

            {catError && <p style={{ fontSize: 11, color: "#b91c1c", padding: "8px 14px", fontFamily: "sans-serif" }}>{catError}</p>}

            {loadingCats ? <SidebarSkeleton /> : categories.map((cat) => (
              <SidebarGroup
                key={cat._id}
                category={cat}
                subcategories={subsByCat(cat._id)}
                activeSubSlug={activeSub?.slug ?? ""}
                onSelectSub={handleSelectSub}
                onSelectCat={handleSelectCat}
              />
            ))}

            {["Alpha Collector's Gallery", "Vouchers", "Occasions and gifts"].map((l) => (
              <div key={l} style={{ borderBottom: "1px solid #ddd" }}>
                <button style={{ width: "100%", textAlign: "left", padding: "7px 14px", background: "transparent", border: "none", cursor: "pointer" }}>
                  <span style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 13, fontWeight: 700, color: "#1a1a2e" }}>{l}</span>
                </button>
              </div>
            ))}
          </aside>

          {/* ── Main ── */}
          <div style={{ display: "flex", alignItems: "flex-start", flex: 1 }}>
            <main style={{ flex: 1, padding: "16px 20px 48px", minWidth: 0 }}>

              {activeSub && (
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16, paddingBottom: 12, borderBottom: "1px solid #e0e0e0", flexWrap: "wrap", gap: 8 }}>
                  <nav style={{ fontSize: 12, fontFamily: "sans-serif", display: "flex", alignItems: "center", gap: 5 }}>
                    <button onClick={goHome} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2c3e7a", fontFamily: "sans-serif", padding: 0, textDecoration: "underline" }}>
                      All Collections
                    </button>
                    {parentCat && (
                      <>
                        <span style={{ color: "#ccc" }}>›</span>
                        <button
                          onClick={() => { const cat = categories.find((c) => c._id === parentCat._id); if (cat) handleSelectCatLocal(cat); }}
                          style={{ background: "none", border: "none", cursor: "pointer", fontSize: 12, color: "#2c3e7a", fontFamily: "sans-serif", padding: 0, textDecoration: "underline" }}
                        >
                          {parentCat.name}
                        </button>
                      </>
                    )}
                    <span style={{ color: "#ccc" }}>›</span>
                    <span style={{ color: "#333", fontSize: 12 }}>{activeSub.name}</span>
                  </nav>
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    {!loadingProds && <span style={{ fontSize: 11, color: "#999", fontFamily: "sans-serif" }}>{products.length} item{products.length !== 1 ? "s" : ""}</span>}
                    <select value={sortBy} onChange={(e) => setSortBy(e.target.value)} className="sort-select">
                      <option value="featured">Featured</option>
                      <option value="price-asc">Price: Low → High</option>
                      <option value="price-desc">Price: High → Low</option>
                      <option value="name">Name A–Z</option>
                    </select>
                  </div>
                </div>
              )}

              {prodError && (
                <div style={{ padding: "10px 14px", border: "1px solid #fecaca", background: "#fff5f5", color: "#b91c1c", fontSize: 13, fontFamily: "sans-serif", marginBottom: 16 }}>
                  {prodError}
                </div>
              )}

              {!activeSub && (
                loadingCats ? <LandingSkeleton /> : (
                  <div className="fade-up">
                    <LandingView
                      categories={landingCategories}
                      subcategories={subcategories}
                      onSelectSub={handleSelectSub}
                      onSelectCat={handleSelectCat}
                    />
                  </div>
                )
              )}

              {activeSub && loadingProds && (
                <div>
                  <Skeleton w={220} h={18} style={{ marginBottom: 20 }} />
                  <div className="product-grid">
                    {Array.from({ length: 10 }).map((_, i) => <ProductCardSkeleton key={i} />)}
                  </div>
                </div>
              )}

              {activeSub && !loadingProds && !prodError && products.length === 0 && (
                <div style={{ padding: "60px 0", textAlign: "center" }}>
                  <div style={{ fontSize: 32, marginBottom: 12, opacity: 0.12 }}>◆</div>
                  <p style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 18, color: "#888", marginBottom: 8 }}>No products in {activeSub.name}</p>
                  <p style={{ fontSize: 12, color: "#bbb", fontFamily: "sans-serif", marginBottom: 20 }}>Check back soon or browse another collection.</p>
                  <button onClick={goHome} style={{ fontSize: 10, letterSpacing: "0.2em", textTransform: "uppercase", color: "#111", fontFamily: "sans-serif", background: "transparent", border: "1px solid #ccc", padding: "6px 16px", cursor: "pointer" }}>
                    Browse All Collections
                  </button>
                </div>
              )}

              {activeSub && !loadingProds && products.length > 0 && (
                <section className="fade-up">
                  <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
                    <h2 style={{ fontFamily: '"Playfair Display", Georgia, serif', fontSize: 16, fontWeight: 700, color: "#1a3a6b", textDecoration: "underline", whiteSpace: "nowrap" }}>
                      {activeSub.name}
                    </h2>
                    <div style={{ flex: 1, height: 1, background: "#e0e0e0" }} />
                  </div>
                  <div className="product-grid">
                    {products.map((p) => <ProductCard key={p._id} product={p} />)}
                  </div>
                </section>
              )}
            </main>

            {/* <BuyersPicks products={buyersPicks} /> */}
          </div>

        </div>
      </div>
    </>
  );
}