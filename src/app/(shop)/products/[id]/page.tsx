import { notFound } from 'next/navigation';
import { connectDB } from '@/lib/db';
import { getProductById } from '@/services/product.service';
import Product from '@/models/Product';
import AddToCartButton from '@/components/cart/AddToCartButton';
import ProductGallery from '@/components/products/ProductGallery';
import Link from 'next/link';

// ─── Types ──────────────────────────────────────────────────────────────────

type ProductDoc = {
  _id: unknown;
  name: string;
  price: number;
  shape: string | string[];
  size: number;
  color: string | string[];
  clarity: string | string[];
  certification?: string | string[];
  images: string[];
  stock: number;
  description?: string;
  category?: { name: string; slug?: string };
  subcategory?: { name: string; slug?: string };
};

type RelatedItem = {
  id: string;
  name: string;
  shape: string;
  size: number;
  price: number;
  img: string;
  color: string;
  clarity: string;
};

// ─── Helpers ─────────────────────────────────────────────────────────────────

function first(val: string | string[]): string {
  return Array.isArray(val) ? (val[0] ?? '') : (val ?? '');
}
function display(val: string | string[]): string {
  return Array.isArray(val) ? val.join(', ') : (val ?? '');
}
function capitalize(val: string | string[]): string {
  const s = first(val);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
function certDisplay(val?: string | string[]): string {
  if (!val) return '—';
  const arr = Array.isArray(val) ? val : [val];
  const filtered = arr.filter((c) => c && c.toLowerCase() !== 'none');
  return filtered.length > 0 ? filtered.join(', ') : '—';
}

// ─── DB: fetch related products ───────────────────────────────────────────────

async function getRelatedProducts(
  shape: string,
  excludeId: string,
  limit = 4
): Promise<RelatedItem[]> {
  // First try: same shape, exclude current, in stock
  let docs = await Product.find({
    shape: { $regex: new RegExp(shape, 'i') },
    _id: { $ne: excludeId },
    isActive: true,
    stock: { $gt: 0 },
  })
    .limit(limit)
    .lean();

  // Fallback: any other active in-stock products if not enough
  if (docs.length < limit) {
    const existingIds = docs.map((d) => String(d._id));
    const fallback = await Product.find({
      _id: { $nin: [excludeId, ...existingIds] },
      isActive: true,
      stock: { $gt: 0 },
    })
      .limit(limit - docs.length)
      .lean();
    docs = [...docs, ...fallback];
  }
console.log('Related images:', docs.map(d => ({ name: d.name, images: d.images })));
  return docs.map((r) => ({
    id: String(r._id),
    name: r.name as string,
    shape: first(r.shape as string | string[]),
    size: r.size as number,
    price: r.price as number,
    img: (r.images as string[])?.[0] ?? '',
    color: first(r.color as string | string[]),
    clarity: first(r.clarity as string | string[]),
  }));
}

// ─── Static content ───────────────────────────────────────────────────────────

const TRUST_ITEMS = [
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
        <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'SSL Secured',
    sub: 'Bank-grade encryption',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.3"/>
      </svg>
    ),
    label: 'Free Insured Shipping',
    sub: 'On all orders worldwide',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
      </svg>
    ),
    label: '30-Day Returns',
    sub: 'Hassle-free policy',
  },
  {
    icon: (
      <svg width="20" height="20" fill="none" viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round"/>
      </svg>
    ),
    label: 'Complimentary Gift',
    sub: 'Luxury packaging included',
  },
];

const INFO_SECTIONS = [
  {
    title: 'Learning Center',
    links: ['Diamond Guide', '4Cs Explained', 'Ring Size Chart', 'Metal Guide', 'Setting Styles'],
  },
  {
    title: 'Customer Care',
    links: ['Contact Us', 'FAQ', 'Shipping & Returns', 'Privacy Policy', 'Customer Support'],
  },
  {
    title: 'Our Promise',
    links: ['Testimonials', 'Sustainability', 'Certifications', 'About Us', 'Press'],
  },
];

const TESTIMONIALS = [
  {
    quote: 'Absolutely breathtaking quality. My fiancée was speechless.',
    author: 'James R.',
    location: 'New York',
    stars: 5,
  },
  {
    quote: 'The craftsmanship is extraordinary. Worth every penny.',
    author: 'Priya M.',
    location: 'London',
    stars: 5,
  },
  {
    quote: 'Flawless from order to delivery. Truly world-class.',
    author: 'Lucas T.',
    location: 'Sydney',
    stars: 5,
  },
];

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function ProductDetailPage({
  params,
}: {
  params: { id: string };
}) {
  await connectDB();

  const raw = await getProductById(params.id);
  if (!raw) notFound();

  const rawObj = raw as unknown as ProductDoc;
  const p: ProductDoc = { ...rawObj, _id: String(rawObj._id) };

  // Fetch real related products from DB
  const related = await getRelatedProducts(
    first(p.shape),
    String(p._id),
    4
  );

  const certBadge = certDisplay(p.certification);
  const showCertBadge = certBadge !== '—';
  const colorDisplay = display(p.color);
  const clarityDisplay = display(p.clarity);

  const specs = [
    { label: 'Shape',         value: capitalize(p.shape) },
    { label: 'Carat Weight',  value: `${p.size} ct` },
    { label: 'Color Grade',   value: display(p.color) },
    { label: 'Clarity',       value: display(p.clarity) },
    { label: 'Certification', value: certDisplay(p.certification) },
    {
      label: 'Availability',
      value: p.stock > 0 ? `${p.stock} in stock` : 'Out of stock',
      highlight: p.stock > 0,
    },
  ];

  return (
    <>
      <link
        href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Jost:wght@300;400;500;600&display=swap"
        rel="stylesheet"
      />

      <style>{`
        :root {
          --gold: #b8955a;
          --gold-light: #d4b483;
          --gold-pale: #f5efe6;
          --ink: #111010;
          --muted: #8a8178;
          --border: #e8e2da;
          --bg: #ffffff;
          --bg-off: #faf8f5;
        }

        * { box-sizing: border-box; }

        .pd-page {
          font-family: 'Jost', sans-serif;
          background: var(--bg);
          color: var(--ink);
          min-height: 100vh;
        }

        /* ── Breadcrumb ── */
        .pd-breadcrumb {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          padding: 20px 0 32px;
          flex-wrap: wrap;
        }
        .pd-breadcrumb a {
          color: var(--muted);
          text-decoration: none;
          transition: color 0.2s;
        }
        .pd-breadcrumb a:hover { color: var(--gold); }
        .pd-breadcrumb span.sep { color: var(--border); font-size: 12px; }
        .pd-breadcrumb span.current { color: var(--ink); }

        /* ── Hero grid ── */
        .pd-hero {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 64px;
          align-items: start;
          padding-bottom: 80px;
          border-bottom: 1px solid var(--border);
        }
        @media (max-width: 768px) {
          .pd-hero { grid-template-columns: 1fr; gap: 32px; }
        }

        /* ── Info panel ── */
        .pd-category-label {
          font-size: 9px;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          color: var(--gold);
          margin-bottom: 12px;
          display: flex;
          align-items: center;
          gap: 10px;
        }
        .pd-category-label::before {
          content: '';
          display: inline-block;
          width: 28px;
          height: 0.5px;
          background: var(--gold);
        }

        .pd-title {
          font-family: 'Playfair Display', serif;
          font-size: clamp(28px, 4vw, 42px);
          font-weight: 500;
          line-height: 1.15;
          color: var(--ink);
          margin: 0 0 10px;
          letter-spacing: -0.01em;
        }

        .pd-subtitle {
          font-family: 'Playfair Display', serif;
          font-size: 14px;
          font-style: italic;
          color: var(--muted);
          margin-bottom: 32px;
        }

        /* ── Price block ── */
        .pd-price-block {
          display: flex;
          align-items: flex-start;
          gap: 0;
          padding: 28px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 32px;
          position: relative;
        }
        .pd-price-block::after {
          content: '';
          position: absolute;
          bottom: -1px; left: 0;
          width: 60px;
          height: 1px;
          background: var(--gold);
        }
        .pd-currency {
          font-family: 'Playfair Display', serif;
          font-size: 18px;
          color: var(--gold);
          margin-top: 6px;
          margin-right: 2px;
        }
        .pd-price-num {
          font-family: 'Playfair Display', serif;
          font-size: 48px;
          font-weight: 400;
          line-height: 1;
          color: var(--ink);
          letter-spacing: -0.02em;
        }
        .pd-price-meta {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.06em;
          margin-top: auto;
          margin-bottom: 6px;
          margin-left: 12px;
          line-height: 1.6;
        }

        /* ── Specs table ── */
        .pd-specs {
          width: 100%;
          border-collapse: collapse;
          margin-bottom: 28px;
        }
        .pd-specs tr { border-bottom: 1px solid var(--border); }
        .pd-specs tr:last-child { border-bottom: none; }
        .pd-specs td { padding: 11px 0; font-size: 12px; }
        .pd-specs td:first-child {
          font-size: 9px;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: var(--muted);
          width: 45%;
          font-weight: 500;
        }
        .pd-specs td:last-child {
          text-align: right;
          font-size: 13px;
          font-weight: 500;
          color: var(--ink);
        }
        .pd-specs td.highlight { color: #4a8a5a; }

        /* ── Description ── */
        .pd-description {
          font-size: 13px;
          line-height: 1.85;
          color: var(--muted);
          padding: 20px 0 24px;
          border-top: 1px solid var(--border);
          margin-bottom: 8px;
        }

        /* ── Stock indicator ── */
        .pd-stock {
          display: flex;
          align-items: center;
          gap: 8px;
          margin-bottom: 20px;
        }
        .pd-stock-dot {
          width: 5px; height: 5px;
          border-radius: 50%;
          flex-shrink: 0;
        }
        .pd-stock-label {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          font-weight: 600;
        }

        /* ── CTAs ── */
        .pd-btn-primary {
          width: 100%;
          background: var(--ink);
          color: #fff;
          border: none;
          padding: 16px 24px;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 600;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          cursor: pointer;
          transition: background 0.25s;
          margin-bottom: 10px;
        }
        .pd-btn-primary:hover { background: #2a2a2a; }

        .pd-btn-secondary {
          width: 100%;
          background: transparent;
          color: var(--muted);
          border: 1px solid var(--border);
          padding: 14px 24px;
          font-family: 'Jost', sans-serif;
          font-size: 10px;
          font-weight: 500;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          cursor: pointer;
          transition: border-color 0.25s, color 0.25s;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }
        .pd-btn-secondary:hover { border-color: var(--gold); color: var(--gold); }

        /* ── Mini trust badges ── */
        .pd-mini-trust {
          display: flex;
          gap: 20px;
          padding-top: 20px;
          border-top: 1px solid var(--border);
          margin-top: 16px;
          flex-wrap: wrap;
        }
        .pd-mini-trust-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 9px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          font-weight: 500;
        }
        .pd-mini-trust-item svg { color: var(--gold); flex-shrink: 0; }

        /* ── Trust strip ── */
        .pd-trust-strip {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 0;
          border: 1px solid var(--border);
          margin: 64px 0;
          background: var(--bg-off);
        }
        @media (max-width: 768px) {
          .pd-trust-strip { grid-template-columns: repeat(2, 1fr); }
        }
        .pd-trust-item {
          padding: 32px 24px;
          border-right: 1px solid var(--border);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          gap: 10px;
          transition: background 0.2s;
        }
        .pd-trust-item:last-child { border-right: none; }
        .pd-trust-item:hover { background: #fff; }
        .pd-trust-icon {
          width: 44px; height: 44px;
          border-radius: 50%;
          background: #fff;
          border: 1px solid var(--border);
          display: flex; align-items: center; justify-content: center;
          color: var(--gold);
          flex-shrink: 0;
        }
        .pd-trust-label {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .pd-trust-sub {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.04em;
        }

        /* ── Section header ── */
        .pd-section-head {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 32px;
        }
        .pd-section-title {
          font-family: 'Playfair Display', serif;
          font-size: 26px;
          font-weight: 500;
          color: var(--ink);
          letter-spacing: -0.01em;
        }
        .pd-section-link {
          font-size: 9px;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          color: var(--muted);
          text-decoration: none;
          display: flex;
          align-items: center;
          gap: 6px;
          transition: color 0.2s;
          font-weight: 500;
        }
        .pd-section-link:hover { color: var(--gold); }

        /* ── Related grid ── */
        .pd-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 16px;
          margin-bottom: 80px;
        }
        @media (max-width: 900px) {
          .pd-related-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 480px) {
          .pd-related-grid { grid-template-columns: 1fr; }
        }

        .pd-related-card {
          text-decoration: none;
          color: inherit;
          display: block;
          cursor: pointer;
        }
        .pd-related-img {
          aspect-ratio: 1/1;
          overflow: hidden;
          background: var(--bg-off);
          margin-bottom: 14px;
          position: relative;
        }
        .pd-related-img img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.6s ease;
          display: block;
        }
        .pd-related-card:hover .pd-related-img img { transform: scale(1.06); }
        .pd-related-img-overlay {
          position: absolute;
          inset: 0;
          background: rgba(0,0,0,0);
          transition: background 0.3s;
        }
        .pd-related-card:hover .pd-related-img-overlay { background: rgba(0,0,0,0.06); }
        .pd-related-name {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-weight: 400;
          color: var(--ink);
          margin-bottom: 4px;
          transition: color 0.2s;
        }
        .pd-related-card:hover .pd-related-name { color: var(--gold); }
        .pd-related-meta {
          font-size: 10px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--muted);
          margin-bottom: 6px;
        }
        .pd-related-price {
          font-family: 'Playfair Display', serif;
          font-size: 16px;
          color: var(--ink);
        }

        /* ── Empty related state ── */
        .pd-related-empty {
          grid-column: 1 / -1;
          text-align: center;
          padding: 48px;
          color: var(--muted);
          font-size: 13px;
          letter-spacing: 0.06em;
          border: 1px dashed var(--border);
        }

        /* ── Testimonials ── */
        .pd-testimonials {
          background: var(--bg-off);
          padding: 64px 40px;
          margin: 0 -40px 64px;
        }
        @media (max-width: 600px) {
          .pd-testimonials { margin: 0 -16px 64px; padding: 48px 16px; }
        }
        .pd-testimonial-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 32px;
          margin-top: 40px;
        }
        @media (max-width: 768px) {
          .pd-testimonial-grid { grid-template-columns: 1fr; }
        }
        .pd-testimonial-card {
          background: #fff;
          padding: 32px 28px;
          border: 1px solid var(--border);
        }
        .pd-testimonial-quote {
          font-family: 'Playfair Display', serif;
          font-size: 15px;
          font-style: italic;
          line-height: 1.65;
          color: var(--ink);
          margin-bottom: 20px;
        }
        .pd-testimonial-quote::before {
          content: '"';
          font-size: 48px;
          color: var(--gold-light);
          line-height: 1;
          display: block;
          margin-bottom: 4px;
          font-family: 'Playfair Display', serif;
        }
        .pd-testimonial-author {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: var(--ink);
        }
        .pd-testimonial-loc {
          font-size: 10px;
          color: var(--muted);
          margin-top: 2px;
        }
        .pd-stars {
          display: flex;
          gap: 2px;
          margin-bottom: 12px;
          color: var(--gold);
          font-size: 12px;
        }

        /* ── Info footer ── */
        .pd-info-footer {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 48px;
          padding: 56px 0;
          border-top: 1px solid var(--border);
          border-bottom: 1px solid var(--border);
          margin-bottom: 40px;
        }
        @media (max-width: 700px) {
          .pd-info-footer { grid-template-columns: 1fr; gap: 32px; }
        }
        .pd-info-col-title {
          font-size: 9px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          font-weight: 700;
          color: var(--ink);
          margin-bottom: 20px;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pd-info-col-title::after {
          content: '';
          flex: 1;
          height: 0.5px;
          background: var(--border);
        }
        .pd-info-col ul {
          list-style: none;
          padding: 0; margin: 0;
          display: flex;
          flex-direction: column;
          gap: 10px;
        }
        .pd-info-col ul li a {
          font-size: 12px;
          color: var(--muted);
          text-decoration: none;
          letter-spacing: 0.02em;
          transition: color 0.2s;
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .pd-info-col ul li a::before {
          content: '';
          display: inline-block;
          width: 12px;
          height: 0.5px;
          background: var(--border);
          transition: background 0.2s, width 0.2s;
          flex-shrink: 0;
        }
        .pd-info-col ul li a:hover { color: var(--ink); }
        .pd-info-col ul li a:hover::before { background: var(--gold); width: 18px; }

        /* ── Bottom strip ── */
        .pd-bottom-strip {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding-bottom: 40px;
          gap: 16px;
          flex-wrap: wrap;
        }
        .pd-bottom-cert {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 10px;
          letter-spacing: 0.08em;
          color: var(--muted);
        }
        .pd-bottom-cert svg { color: var(--gold); }
        .pd-copyright {
          font-size: 10px;
          color: var(--muted);
          letter-spacing: 0.06em;
        }
      `}</style>

      <div className="pd-page">
        <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 40px' }}>

          {/* ── Breadcrumb ── */}
          <nav className="pd-breadcrumb">
            <Link href="/">Home</Link>
            <span className="sep">›</span>
            <Link href="/products">{p.category?.name ?? 'Diamonds'}</Link>
            {p.subcategory?.name && (
              <>
                <span className="sep">›</span>
                <Link href={`/products?subcategory=${p.subcategory.slug ?? ''}`}>
                  {p.subcategory.name}
                </Link>
              </>
            )}
            <span className="sep">›</span>
            <span className="current">{p.name}</span>
          </nav>

          {/* ── Hero ── */}
          <div className="pd-hero">

            {/* Gallery */}
            <ProductGallery
              images={p.images}
              name={p.name}
              certBadge={showCertBadge ? certBadge : null}
              inStock={p.stock > 0}
              shape={first(p.shape)}
            />

            {/* Info */}
            <div>
              <p className="pd-category-label">
                {p.category?.name ?? 'Fine Diamond'}
                {p.subcategory?.name ? ` · ${p.subcategory.name}` : ''}
              </p>

              <h1 className="pd-title">{p.name}</h1>

              <p className="pd-subtitle">
                {colorDisplay} Color &nbsp;·&nbsp; {clarityDisplay} Clarity &nbsp;·&nbsp; {p.size} ct
              </p>

              {/* Price */}
              <div className="pd-price-block">
                <span className="pd-currency">$</span>
                <span className="pd-price-num">{p.price.toLocaleString()}</span>
                <span className="pd-price-meta">
                  USD<br />Free insured<br />shipping
                </span>
              </div>

              {/* Specs */}
              <table className="pd-specs">
                <tbody>
                  {specs.map(({ label, value, highlight }) => (
                    <tr key={label}>
                      <td>{label}</td>
                      <td className={highlight ? 'highlight' : ''}>{value}</td>
                    </tr>
                  ))}
                </tbody>
              </table>

              {/* Description */}
              {p.description && (
                <p className="pd-description">{p.description}</p>
              )}

              {/* Stock */}
              <div className="pd-stock">
                <div
                  className="pd-stock-dot"
                  style={{ background: p.stock > 0 ? '#4a8a5a' : '#c0392b' }}
                />
                <span
                  className="pd-stock-label"
                  style={{ color: p.stock > 0 ? '#4a8a5a' : '#c0392b' }}
                >
                  {p.stock > 0 ? 'In stock — ready to ship' : 'Currently unavailable'}
                </span>
              </div>

              {/* CTAs */}
              <AddToCartButton productId={String(p._id)} inStock={p.stock > 0} />

              <button className="pd-btn-secondary" style={{ marginTop: 10 }}>
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"
                    stroke="currentColor"
                    strokeWidth="1.4"
                    strokeLinejoin="round"
                  />
                </svg>
                Save to Wishlist
              </button>

              {/* Mini trust */}
              <div className="pd-mini-trust">
                {[
                  { icon: (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                        <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                      </svg>
                    ), label: 'SSL Secured' },
                  { icon: (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                        <polyline points="1 4 1 10 7 10" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M3.51 15a9 9 0 1 0 .49-4.95" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
                      </svg>
                    ), label: '30-Day Returns' },
                  { icon: (
                      <svg width="13" height="13" fill="none" viewBox="0 0 24 24">
                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" stroke="currentColor" strokeWidth="1.4"/>
                      </svg>
                    ), label: 'Free Insured Shipping' },
                ].map((item) => (
                  <div key={item.label} className="pd-mini-trust-item">
                    {item.icon}
                    {item.label}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Trust Strip ── */}
          <div className="pd-trust-strip">
            {TRUST_ITEMS.map((item) => (
              <div key={item.label} className="pd-trust-item">
                <div className="pd-trust-icon">{item.icon}</div>
                <div>
                  <div className="pd-trust-label">{item.label}</div>
                  <div className="pd-trust-sub">{item.sub}</div>
                </div>
              </div>
            ))}
          </div>

          {/* ── Related Items — navigable to real product detail pages ── */}
          <div className="pd-section-head">
            <h2 className="pd-section-title">You May Also Love</h2>
            <Link href="/products" className="pd-section-link">
              View all
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </Link>
          </div>

          <div className="pd-related-grid">
            {related.length === 0 ? (
              <div className="pd-related-empty">No related products found</div>
            ) : (
              related.map((item) => (
                /* href uses the real MongoDB _id → resolves to the correct product detail page */
                <Link
                  key={item.id}
                  href={`/products/${item.id}`}
                  className="pd-related-card"
                >
                  <div className="pd-related-img">
                    {item.img ? (
                      <img src={item.img} alt={item.name} />
                    ) : (
                      <div
                        style={{
                          width: '100%',
                          height: '100%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: 'var(--border)',
                          fontSize: 32,
                        }}
                      >
                        ◇
                      </div>
                    )}
                    <div className="pd-related-img-overlay" />
                  </div>
                  <div className="pd-related-meta">
                    {item.shape} &nbsp;·&nbsp; {item.size} ct
                    {item.color ? ` · ${item.color}` : ''}
                    {item.clarity ? ` · ${item.clarity}` : ''}
                  </div>
                  <div className="pd-related-name">{item.name}</div>
                  <div className="pd-related-price">${item.price.toLocaleString()}</div>
                </Link>
              ))
            )}
          </div>

          {/* ── Testimonials ── */}
          <div className="pd-testimonials">
            <div className="pd-section-head">
              <h2 className="pd-section-title">What Our Clients Say</h2>
              <Link href="#" className="pd-section-link">
                All reviews
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                  <path d="M5 12h14M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </Link>
            </div>
            <div className="pd-testimonial-grid">
              {TESTIMONIALS.map((t) => (
                <div key={t.author} className="pd-testimonial-card">
                  <div className="pd-stars">{'★'.repeat(t.stars)}</div>
                  <div className="pd-testimonial-quote">{t.quote}</div>
                  <div className="pd-testimonial-author">{t.author}</div>
                  <div className="pd-testimonial-loc">{t.location}</div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Info Footer Sections ── */}
          <div className="pd-info-footer">
            {INFO_SECTIONS.map((sec) => (
              <div key={sec.title} className="pd-info-col">
                <div className="pd-info-col-title">{sec.title}</div>
                <ul>
                  {sec.links.map((link) => (
                    <li key={link}>
                      <a href="#">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          {/* ── Bottom strip ── */}
          <div className="pd-bottom-strip">
            <div className="pd-bottom-cert">
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24">
                <path d="M12 2L3 7v5c0 5.25 3.75 10.15 9 11.35C17.25 22.15 21 17.25 21 12V7l-9-5z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round"/>
                <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
              SSL Certificate &nbsp;·&nbsp; Payments Secured &nbsp;·&nbsp; Privacy Protected
            </div>
            <div className="pd-copyright">
              © {new Date().getFullYear()} &nbsp;·&nbsp; All rights reserved
            </div>
          </div>

        </div>
      </div>
    </>
  );
}