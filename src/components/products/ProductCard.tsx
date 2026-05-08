'use client'
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  productType?: 'watch' | 'diamond';
  product: {
    _id: string;
    name: string;
    price: number;
    // Diamond fields
    shape?: string | string[];
    size?: number;
    color?: string | string[];
    clarity?: string | string[];
    certification?: string | string[];
    // Watch fields
    watchBrand?: string;
    watchMovement?: string;
    watchGender?: string;
    watchStyle?: string;
    watchCaseMaterial?: string;
    watchDialColor?: string;
    watchStrapType?: string;
    watchCaseSize?: string;
    images: string[];
    stock: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
function first(val?: string | string[]): string {
  if (!val) return '';
  return Array.isArray(val) ? (val[0] ?? '') : val;
}
function display(val?: string | string[]): string {
  if (!val) return '';
  return Array.isArray(val) ? val.join(', ') : val;
}
function capitalize(val?: string | string[]): string {
  const s = first(val);
  return s ? s.charAt(0).toUpperCase() + s.slice(1) : '';
}
function certDisplay(val?: string | string[]): string {
  if (!val) return '';
  const arr = Array.isArray(val) ? val : [val];
  return arr.filter((c) => c !== 'none').join(' · ');
}

/**
 * FIX: Check ALL watch-specific fields, not just brand/movement/gender.
 * A watch product may only have e.g. watchStyle or watchCaseMaterial set.
 */
function isWatch(p: ProductCardProps['product']): boolean {
  return !!(
    p.watchBrand ||
    p.watchMovement ||
    p.watchGender ||
    p.watchStyle ||
    p.watchCaseMaterial ||
    p.watchDialColor ||
    p.watchStrapType ||
    p.watchCaseSize
  );
}

// ─── Unsplash placeholders ────────────────────────────────────────────────────
const SHAPE_UNSPLASH: Record<string, string> = {
  round:    'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80&fit=crop',
  oval:     'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80&fit=crop',
  pear:     'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80&fit=crop',
  cushion:  'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80&fit=crop',
  princess: 'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80&fit=crop',
  emerald:  'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80&fit=crop',
  radiant:  'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80&fit=crop',
  marquise: 'https://images.unsplash.com/photo-1616750819459-8abd8e2d5626?w=400&q=80&fit=crop',
  heart:    'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400&q=80&fit=crop',
  asscher:  'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80&fit=crop',
};
const WATCH_UNSPLASH = 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&q=80&fit=crop';
const FALLBACK_UNSPLASH = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80&fit=crop';

function getPlaceholder(product: ProductCardProps['product']): string {
  if (isWatch(product)) return WATCH_UNSPLASH;
  const shape = first(product.shape).toLowerCase();
  return SHAPE_UNSPLASH[shape] ?? FALLBACK_UNSPLASH;
}

// ─── Image components ─────────────────────────────────────────────────────────
function ProductImage({ src, alt, fallback }: { src: string; alt: string; fallback: string }) {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [stage, setStage] = useState<'product' | 'placeholder' | 'fallback'>('product');
  const handleError = () => {
    if (stage === 'product') { setCurrentSrc(fallback); setStage('placeholder'); }
    else if (stage === 'placeholder') { setCurrentSrc(FALLBACK_UNSPLASH); setStage('fallback'); }
  };
  return <img src={currentSrc} alt={alt} onError={handleError} />;
}

function PlaceholderImage({ src, alt }: { src: string; alt: string }) {
  const [imgSrc, setImgSrc] = useState(src);
  return <img src={imgSrc} alt={alt} onError={() => setImgSrc(FALLBACK_UNSPLASH)} />;
}

// ─── Type pill icons (inline SVG — no emoji, no external deps) ────────────────
function WatchIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <circle cx="9" cy="9" r="6.5" stroke="currentColor" strokeWidth="1.25" />
      <path d="M9 5.5V9l2 2" stroke="currentColor" strokeWidth="1.25" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="1" width="4" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="7" y="14.5" width="4" height="2.5" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

function DiamondIcon() {
  return (
    <svg width="10" height="10" viewBox="0 0 18 18" fill="none" aria-hidden="true">
      <path d="M9 16L2 7l2.5-5h9L16 7z" stroke="currentColor" strokeWidth="1.25" strokeLinejoin="round" />
      <path d="M2 7h14M9 16L5 7l4-5 4 5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductCard({ product, productType }: ProductCardProps) {
  const watch = productType ? productType === 'watch' : isWatch(product);
  const isAvailable = product.stock > 0;
  const certLabel = certDisplay(product.certification);
  const placeholder = getPlaceholder(product);

  // Tags differ by type
  const tags = watch
    ? [
        product.watchGender,
        product.watchMovement,
        product.watchStyle,
        product.watchCaseMaterial,
      ].filter(Boolean) as string[]
    : [
        capitalize(product.shape),
        product.size ? `${product.size}ct` : '',
        display(product.color),
        display(product.clarity),
      ].filter(Boolean);

  // Subtitle differs by type
  const subtitle = watch
    ? [product.watchBrand, product.watchMovement].filter(Boolean).join(' · ')
    : [capitalize(product.shape), product.size ? `${product.size}ct` : ''].filter(Boolean).join(' · ');

  // Top-left badge: cert for diamonds, brand for watches
  const badgeLabel = watch ? (product.watchBrand ?? '') : certLabel;

  return (
    <>
      <style>{`
        .pc-root {
          font-family: 'Montserrat', sans-serif;
          width: 260px;
          height: 390px;
          display: block;
          text-decoration: none;
          color: inherit;
        }
        .pc-card {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          border-radius: 3px;
          border: 0.5px solid rgba(180, 160, 120, 0.35);
          background: linear-gradient(158deg, #fdfcfa 0%, #f8f6f1 55%, #f3f0e9 100%);
          transition: transform 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease;
          cursor: pointer;
        }
        .pc-root:hover .pc-card {
          transform: translateY(-4px);
          border-color: rgba(180, 150, 80, 0.65);
          box-shadow: 0 18px 40px rgba(60, 50, 30, 0.12), 0 0 0 0.5px rgba(180,150,80,0.15) inset;
        }
        .pc-card::before {
          content: '';
          position: absolute;
          top: 0; left: 0; right: 0;
          height: 1px;
          background: linear-gradient(90deg, transparent 0%, rgba(180,150,80,0.5) 30%, rgba(200,170,90,0.85) 50%, rgba(180,150,80,0.5) 70%, transparent 100%);
          z-index: 5;
        }
        .pc-card::after {
          content: '';
          position: absolute;
          top: 0; bottom: 0;
          width: 60px;
          left: -60px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.4), transparent);
          opacity: 0;
          transition: opacity 0.2s;
          pointer-events: none;
          z-index: 6;
        }
        .pc-root:hover .pc-card::after {
          opacity: 1;
          animation: pcSweep 2.4s ease-in-out infinite;
        }
        @keyframes pcSweep {
          0%   { left: -60px; }
          100% { left: 110%; }
        }
        .pc-image-zone {
          flex: none;
          height: 196px;
          position: relative;
          display: flex;
          align-items: center;
          justify-content: center;
          overflow: hidden;
          background: radial-gradient(ellipse at 50% 38%, #f5f3ee 0%, #ece9e2 72%);
        }
        .pc-image-zone img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          opacity: 0.92;
          transition: transform 0.55s ease;
        }
        .pc-root:hover .pc-image-zone img { transform: scale(1.06); }
        .pc-image-zone.watch-bg {
          background: radial-gradient(ellipse at 50% 38%, #1a1a2e 0%, #16213e 72%);
        }
        .pc-image-zone.watch-bg img { opacity: 0.88; }

        /* ── Type pill — bottom-left ──────────────────────────────── */
        .pc-type-pip {
          position: absolute;
          bottom: 10px; left: 10px;
          z-index: 4;
          font-size: 7px;
          font-weight: 700;
          letter-spacing: 0.16em;
          text-transform: uppercase;
          padding: 3px 7px 3px 6px;
          border-radius: 2px;
          display: flex;
          align-items: center;
          gap: 4px;
        }
        .pc-type-pip.diamond {
          background: rgba(253, 244, 255, 0.92);
          border: 0.5px solid rgba(160, 80, 200, 0.35);
          color: #7e22ce;
        }
        .pc-type-pip.watch {
          background: rgba(239, 246, 255, 0.92);
          border: 0.5px solid rgba(29, 78, 216, 0.35);
          color: #1d4ed8;
        }

        .pc-cert {
          position: absolute;
          top: 11px; left: 11px;
          z-index: 4;
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.18em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 2px;
          background: rgba(255, 253, 248, 0.92);
          border: 0.5px solid rgba(180, 150, 80, 0.55);
          color: #8a6d3b;
        }
        .pc-stock-badge {
          position: absolute;
          top: 11px; right: 11px;
          z-index: 4;
          font-size: 7.5px;
          font-weight: 600;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          padding: 3px 8px;
          border-radius: 2px;
          background: rgba(255, 253, 248, 0.92);
          border: 0.5px solid rgba(100, 160, 110, 0.45);
          color: #4a8a5a;
        }
        .pc-sold-overlay {
          position: absolute;
          inset: 0;
          z-index: 3;
          background: rgba(245, 243, 238, 0.72);
          display: flex;
          align-items: center;
          justify-content: center;
        }
        .pc-sold-label {
          font-size: 8px;
          font-weight: 600;
          letter-spacing: 0.22em;
          text-transform: uppercase;
          padding: 5px 14px;
          border: 0.5px solid rgba(180, 150, 80, 0.45);
          color: rgba(130, 110, 70, 0.75);
          background: rgba(255, 253, 248, 0.9);
        }
        .pc-body {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          padding: 14px 16px 15px;
        }
        .pc-name {
          font-family: 'Cormorant Garamond', serif;
          font-size: 15px;
          font-weight: 400;
          line-height: 1.3;
          letter-spacing: 0.015em;
          color: #2c2416;
          margin: 0 0 3px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 12px;
          font-style: italic;
          color: rgba(140, 120, 80, 0.65);
          display: block;
          margin-top: 2px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .pc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 4px;
          margin-top: 8px;
        }
        .pc-tag {
          font-size: 7px;
          font-weight: 500;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          padding: 2px 6px;
          border-radius: 2px;
          color: rgba(140, 120, 80, 0.85);
          border: 0.5px solid rgba(180, 150, 80, 0.22);
          background: rgba(180, 150, 80, 0.05);
        }
        .pc-tag.watch-tag {
          color: rgba(29, 78, 216, 0.75);
          border-color: rgba(29, 78, 216, 0.18);
          background: rgba(29, 78, 216, 0.04);
        }
        .pc-divider {
          height: 0.5px;
          margin: 10px 0 9px;
          background: linear-gradient(90deg, rgba(180,150,80,0.08), rgba(180,150,80,0.35), rgba(180,150,80,0.08));
        }
        .pc-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }
        .pc-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 22px;
          font-weight: 300;
          color: #2c2416;
          line-height: 1;
          display: flex;
          align-items: flex-start;
          gap: 1px;
        }
        .pc-currency {
          font-size: 10px;
          font-weight: 400;
          color: rgba(140, 120, 80, 0.7);
          margin-top: 3px;
          font-family: 'Montserrat', sans-serif;
        }
        .pc-avail-in  { font-size: 7px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: #4a8a5a; }
        .pc-avail-out { font-size: 7px; font-weight: 600; letter-spacing: 0.1em; text-transform: uppercase; color: rgba(180, 80, 70, 0.85); }
        .pc-ornament {
          position: absolute;
          bottom: 10px; right: 12px;
          width: 14px; height: 14px;
          opacity: 0.18;
          pointer-events: none;
        }
      `}</style>

      <Link href={`/products/${product._id}`} className="pc-root">
        <div className="pc-card">

          {/* Image zone */}
          <div className={`pc-image-zone${watch ? ' watch-bg' : ''}`}>
            {product.images[0] ? (
              <ProductImage src={product.images[0]} alt={product.name} fallback={placeholder} />
            ) : (
              <PlaceholderImage src={placeholder} alt={product.name} />
            )}

            {/* Top-left: brand (watch) or cert (diamond) */}
            {badgeLabel && <div className="pc-cert">{badgeLabel}</div>}

            {/* Top-right: low stock indicator */}
            {isAvailable && product.stock <= 3 && (
              <div className="pc-stock-badge">{product.stock} left</div>
            )}

            {/* Sold-out overlay */}
            {!isAvailable && (
              <div className="pc-sold-overlay">
                <span className="pc-sold-label">Unavailable</span>
              </div>
            )}

            {/*
              FIX: Type pill now uses inline SVG icons instead of emoji.
              Emoji rendering is inconsistent across OSes (Apple vs Android vs Windows)
              and can look completely different or break layout.
              The `watch` boolean is derived from isWatch() which now checks ALL
              watch-specific fields, so this will be correct even if only e.g.
              watchStyle is set on the product.
            */}
            <div className={`pc-type-pip ${watch ? 'watch' : 'diamond'}`}>
              {watch ? <WatchIcon /> : <DiamondIcon />}
              {watch ? 'Watch' : 'Diamond'}
            </div>
          </div>

          {/* Body */}
          <div className="pc-body">
            <div>
              <h3 className="pc-name">{product.name}</h3>
              {subtitle && <span className="pc-sub">{subtitle}</span>}
              <div className="pc-tags">
                {tags.map((tag) => (
                  <span key={tag} className={`pc-tag${watch ? ' watch-tag' : ''}`}>{tag}</span>
                ))}
              </div>
            </div>

            <div>
              <div className="pc-divider" />
              <div className="pc-price-row">
                <span className="pc-price">
                  <span className="pc-currency">$</span>
                  {product.price.toLocaleString()}
                </span>
                <span className={isAvailable ? 'pc-avail-in' : 'pc-avail-out'}>
                  {isAvailable ? `${product.stock} available` : 'Sold out'}
                </span>
              </div>
            </div>
          </div>

          {/* Decorative corner ornament */}
          {watch ? (
            <svg className="pc-ornament" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <circle cx="9" cy="9" r="7.5" stroke="#b8985a" strokeWidth="0.75"/>
              <path d="M9 5v4l2.5 2.5" stroke="#b8985a" strokeWidth="0.75" strokeLinecap="round"/>
            </svg>
          ) : (
            <svg className="pc-ornament" viewBox="0 0 18 18" fill="none" aria-hidden="true">
              <path d="M9 1L17 5V13L9 17L1 13V5Z" stroke="#b8985a" strokeWidth="0.75"/>
              <path d="M9 1L13 5L9 9L5 5Z" stroke="#b8985a" strokeWidth="0.5"/>
            </svg>
          )}
        </div>
      </Link>
    </>
  );
}