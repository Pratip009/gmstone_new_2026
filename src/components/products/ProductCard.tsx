'use client'
import Link from 'next/link';
import { useState } from 'react';

interface ProductCardProps {
  product: {
    _id: string;
    name: string;
    price: number;
    shape: string | string[];
    size: number;
    color: string | string[];
    clarity: string | string[];
    certification?: string | string[];
    images: string[];
    stock: number;
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────
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
  if (!val) return '';
  const arr = Array.isArray(val) ? val : [val];
  return arr.filter((c) => c !== 'none').join(' · ');
}

// ─── Unsplash placeholder map by shape ───────────────────────────────────────
// Using fixed Unsplash photo IDs — these are permanent stable URLs
const SHAPE_UNSPLASH: Record<string, string> = {
  round:     'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80&fit=crop',
  brilliant: 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80&fit=crop',
  oval:      'https://images.unsplash.com/photo-1603561591411-07134e71a2a9?w=400&q=80&fit=crop',
  pear:      'https://images.unsplash.com/photo-1573408301185-9519f94816b5?w=400&q=80&fit=crop',
  cushion:   'https://images.unsplash.com/photo-1599643477877-530eb83abc8e?w=400&q=80&fit=crop',
  princess:  'https://images.unsplash.com/photo-1617038260897-41a1f14a8ca0?w=400&q=80&fit=crop',
  emerald:   'https://images.unsplash.com/photo-1611085583191-a3b181a88401?w=400&q=80&fit=crop',
  radiant:   'https://images.unsplash.com/photo-1605100804763-247f67b3557e?w=400&q=80&fit=crop',
  marquise:  'https://images.unsplash.com/photo-1616750819459-8abd8e2d5626?w=400&q=80&fit=crop',
  heart:     'https://images.unsplash.com/photo-1589128777073-263566ae5e4d?w=400&q=80&fit=crop',
  asscher:   'https://images.unsplash.com/photo-1635767798638-3e25273a8236?w=400&q=80&fit=crop',
};

// Single reliable fallback if shape not found
const FALLBACK_UNSPLASH = 'https://images.unsplash.com/photo-1515562141207-7a88fb7ce338?w=400&q=80&fit=crop';

function getPlaceholderSrc(shape: string): string {
  return SHAPE_UNSPLASH[shape.toLowerCase()] ?? FALLBACK_UNSPLASH;
}

// ─── Image with fallback chain ────────────────────────────────────────────────
// 1. Try product image
// 2. If that fails → try shape-specific Unsplash
// 3. If that fails → try generic fallback Unsplash
function ProductImage({ src, alt, shape }: { src: string; alt: string; shape: string }) {
  const placeholderSrc = getPlaceholderSrc(shape);
  const [currentSrc, setCurrentSrc] = useState(src);
  const [stage, setStage] = useState<'product' | 'placeholder' | 'fallback'>('product');

  const handleError = () => {
    if (stage === 'product') {
      setCurrentSrc(placeholderSrc);
      setStage('placeholder');
    } else if (stage === 'placeholder') {
      setCurrentSrc(FALLBACK_UNSPLASH);
      setStage('fallback');
    }
    // stage === 'fallback': give up, img stays broken but won't loop
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      onError={handleError}
    />
  );
}

// ─── No-product-image: show Unsplash directly ─────────────────────────────────
function ShapePlaceholderImage({ shape, alt }: { shape: string; alt: string }) {
  const [src, setSrc] = useState(getPlaceholderSrc(shape));
  const [triedFallback, setTriedFallback] = useState(false);

  const handleError = () => {
    if (!triedFallback) {
      setSrc(FALLBACK_UNSPLASH);
      setTriedFallback(true);
    }
  };

  return <img src={src} alt={alt} onError={handleError} />;
}

// ─── Component ────────────────────────────────────────────────────────────────
export default function ProductCard({ product }: ProductCardProps) {
  const shapeLabel  = capitalize(product.shape);
  const certLabel   = certDisplay(product.certification);
  const isAvailable = product.stock > 0;
  const shapeKey    = first(product.shape);

  const tags = [
    shapeLabel,
    `${product.size}ct`,
    display(product.color),
    display(product.clarity),
  ].filter(Boolean);

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
          animation: none;
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

        .pc-root:hover .pc-image-zone img {
          transform: scale(1.06);
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
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
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
          box-shadow: 0 1px 4px rgba(0,0,0,0.04);
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
          font-size: 16px;
          font-weight: 400;
          line-height: 1.35;
          letter-spacing: 0.015em;
          color: #2c2416;
          margin: 0 0 4px;
        }

        .pc-sub {
          font-family: 'Cormorant Garamond', serif;
          font-size: 12.5px;
          font-style: italic;
          color: rgba(140, 120, 80, 0.65);
          display: block;
          margin-top: 3px;
        }

        .pc-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 5px;
          margin-top: 10px;
        }

        .pc-tag {
          font-size: 7px;
          font-weight: 500;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 2px;
          color: rgba(140, 120, 80, 0.85);
          border: 0.5px solid rgba(180, 150, 80, 0.22);
          background: rgba(180, 150, 80, 0.05);
        }

        .pc-divider {
          height: 0.5px;
          margin: 12px 0 10px;
          background: linear-gradient(90deg, rgba(180,150,80,0.08), rgba(180,150,80,0.35), rgba(180,150,80,0.08));
        }

        .pc-price-row {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
        }

        .pc-price {
          font-family: 'Cormorant Garamond', serif;
          font-size: 23px;
          font-weight: 300;
          color: #2c2416;
          line-height: 1;
          display: flex;
          align-items: flex-start;
          gap: 1px;
        }

        .pc-currency {
          font-size: 11px;
          font-weight: 400;
          color: rgba(140, 120, 80, 0.7);
          margin-top: 3px;
          font-family: 'Montserrat', sans-serif;
        }

        .pc-avail-in  { font-size: 7.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #4a8a5a; }
        .pc-avail-out { font-size: 7.5px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: rgba(180, 80, 70, 0.85); }

        .pc-ornament {
          position: absolute;
          bottom: 10px; right: 12px;
          width: 16px; height: 16px;
          opacity: 0.2;
          pointer-events: none;
        }
      `}</style>

      <Link href={`/products/${product._id}`} className="pc-root">
        <div className="pc-card">

          <div className="pc-image-zone">
            {product.images[0] ? (
              <ProductImage
                src={product.images[0]}
                alt={product.name}
                shape={shapeKey}
              />
            ) : (
              <ShapePlaceholderImage
                shape={shapeKey}
                alt={`${shapeLabel} diamond`}
              />
            )}

            {certLabel && <div className="pc-cert">{certLabel}</div>}

            {isAvailable && product.stock <= 3 && (
              <div className="pc-stock-badge">{product.stock} left</div>
            )}

            {!isAvailable && (
              <div className="pc-sold-overlay">
                <span className="pc-sold-label">Unavailable</span>
              </div>
            )}
          </div>

          <div className="pc-body">
            <div>
              <h3 className="pc-name">
                {product.name}
                <span className="pc-sub">{shapeLabel} · {product.size}ct</span>
              </h3>

              <div className="pc-tags">
                {tags.map((tag) => (
                  <span key={tag} className="pc-tag">{tag}</span>
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

          <svg className="pc-ornament" viewBox="0 0 18 18" fill="none">
            <path d="M9 1L17 5V13L9 17L1 13V5Z" stroke="#b8985a" strokeWidth="0.75" />
            <path d="M9 1L13 5L9 9L5 5Z" stroke="#b8985a" strokeWidth="0.5" />
          </svg>
        </div>
      </Link>
    </>
  );
}