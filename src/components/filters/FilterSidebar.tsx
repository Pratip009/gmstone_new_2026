'use client';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import {
  SHAPES, CLARITIES,
  WATCH_GENDERS, WATCH_BRANDS, WATCH_MOVEMENTS,
  WATCH_STRAP_TYPES, WATCH_CASE_MATERIALS, WATCH_DIAL_COLORS,
  WATCH_FEATURES, WATCH_STYLES, WATCH_CASE_SIZES,
} from '@/models/Product';

const DISPLAY_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'fancy-yellow', 'fancy-pink', 'fancy-blue'];

interface FacetCount { _id: string; count: number }

interface FilterSidebarProps {
  productType?: 'diamond' | 'watch';
  facets?: {
    shapes?: FacetCount[];
    colors?: FacetCount[];
    clarities?: FacetCount[];
    priceRange?: Array<{ min: number; max: number }>;
    sizeRange?: Array<{ min: number; max: number }>;
    watchGenders?: FacetCount[];
    watchBrands?: FacetCount[];
    watchMovements?: FacetCount[];
    watchStrapTypes?: FacetCount[];
    watchCaseMaterials?: FacetCount[];
    watchDialColors?: FacetCount[];
    watchFeatures?: FacetCount[];
    watchStyles?: FacetCount[];
    watchCaseSizes?: FacetCount[];
  };
}

export default function FilterSidebar({ productType = 'diamond', facets }: FilterSidebarProps) {
  const router   = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // ── Derive base route from current pathname ────────────────────────────────
  // /products/watches → watches route
  // /products/diamonds → diamonds route
  // /products → generic route
  const baseRoute = pathname.includes('/watches')
    ? '/products/watches'
    : pathname.includes('/diamonds')
      ? '/products/diamonds'
      : '/products';

  // ── Active mode: prop wins, but switcher can override locally ─────────────
  const [mode, setMode] = useState<'watch' | 'diamond'>(productType);

  // ── Diamond active filters ─────────────────────────────────────────────────
  const activeShapes    = searchParams.get('shape')?.split(',').filter(Boolean)   || [];
  const activeColors    = searchParams.get('color')?.split(',').filter(Boolean)   || [];
  const activeClarities = searchParams.get('clarity')?.split(',').filter(Boolean) || [];
  const priceMin        = searchParams.get('priceMin') || '';
  const priceMax        = searchParams.get('priceMax') || '';
  const sizeMin         = searchParams.get('sizeMin')  || '';
  const sizeMax         = searchParams.get('sizeMax')  || '';

  // ── Watch active filters ───────────────────────────────────────────────────
  const activeWatchGender        = searchParams.get('watchGender')              || '';
  const activeWatchBrands        = searchParams.get('watchBrand')?.split(',').filter(Boolean)        || [];
  const activeWatchMovements     = searchParams.get('watchMovement')?.split(',').filter(Boolean)     || [];
  const activeWatchStrapTypes    = searchParams.get('watchStrapType')?.split(',').filter(Boolean)    || [];
  const activeWatchCaseMaterials = searchParams.get('watchCaseMaterial')?.split(',').filter(Boolean) || [];
  const activeWatchDialColors    = searchParams.get('watchDialColor')?.split(',').filter(Boolean)    || [];
  const activeWatchFeatures      = searchParams.get('watchFeatures')?.split(',').filter(Boolean)     || [];
  const activeWatchStyles        = searchParams.get('watchStyle')?.split(',').filter(Boolean)        || [];
  const activeWatchCaseSize      = searchParams.get('watchCaseSize') || '';

  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);
  const [localSizeMin,  setLocalSizeMin]  = useState(sizeMin);
  const [localSizeMax,  setLocalSizeMax]  = useState(sizeMax);

  // ── Helpers ────────────────────────────────────────────────────────────────
  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      value ? params.set(key, value) : params.delete(key);
      params.set('page', '1');
      router.push(`${baseRoute}?${params.toString()}`);
    },
    [router, searchParams, baseRoute]
  );

  const toggleMultiSelect = useCallback(
    (key: string, current: string[], value: string) => {
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value];
      updateFilter(key, next.length ? next.join(',') : null);
    },
    [updateFilter]
  );

  const applyRanges = () => {
    const params = new URLSearchParams(searchParams.toString());
    localPriceMin ? params.set('priceMin', localPriceMin) : params.delete('priceMin');
    localPriceMax ? params.set('priceMax', localPriceMax) : params.delete('priceMax');
    localSizeMin  ? params.set('sizeMin',  localSizeMin)  : params.delete('sizeMin');
    localSizeMax  ? params.set('sizeMax',  localSizeMax)  : params.delete('sizeMax');
    params.set('page', '1');
    router.push(`${baseRoute}?${params.toString()}`);
  };

  // ── Clear all: go to the correct base route, not always /products ──────────
  const clearAll = () => router.push(baseRoute);

  // ── Switch mode: navigate to the other route and clear filters ────────────
  const switchMode = (next: 'watch' | 'diamond') => {
    setMode(next);
    router.push(next === 'watch' ? '/products/watches' : '/products/diamonds');
  };

  const hasActiveFilters =
    activeShapes.length || activeColors.length || activeClarities.length ||
    priceMin || priceMax || sizeMin || sizeMax ||
    activeWatchGender || activeWatchBrands.length || activeWatchMovements.length ||
    activeWatchStrapTypes.length || activeWatchCaseMaterials.length ||
    activeWatchDialColors.length || activeWatchFeatures.length ||
    activeWatchStyles.length || activeWatchCaseSize;

  const countFor = (list: FacetCount[] | undefined, id: string) =>
    list?.find((f) => f._id === id)?.count;

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <aside className="w-56 shrink-0 space-y-6 text-sm">

      {/* ── TYPE SWITCHER ────────────────────────────────────────────────────── */}
      <div className="flex rounded-sm overflow-hidden border border-neutral-700">
        <button
          onClick={() => switchMode('diamond')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold tracking-widest uppercase transition-colors ${
            mode === 'diamond'
              ? 'bg-neutral-100 text-neutral-900'
              : 'bg-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <DiamondIcon active={mode === 'diamond'} />
          Diamonds
        </button>
        <div className="w-px bg-neutral-700" />
        <button
          onClick={() => switchMode('watch')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-semibold tracking-widest uppercase transition-colors ${
            mode === 'watch'
              ? 'bg-neutral-100 text-neutral-900'
              : 'bg-transparent text-neutral-500 hover:text-neutral-300'
          }`}
        >
          <WatchIcon active={mode === 'watch'} />
          Watches
        </button>
      </div>

      {/* ── HEADER ───────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-neutral-200">Filters</h2>
        {hasActiveFilters ? (
          <button onClick={clearAll} className="text-xs text-amber-400 hover:text-amber-300">
            Clear all
          </button>
        ) : null}
      </div>

      {/* ── PRICE RANGE (shared) ─────────────────────────────────────────────── */}
      <FilterGroup label="Price (USD)">
        {[
          { label: 'Under $1,000',      min: '',     max: '1000'  },
          { label: '$1,000 – $5,000',   min: '1000', max: '5000'  },
          { label: '$5,000 – $15,000',  min: '5000', max: '15000' },
          { label: '$15,000 – $50,000', min: '15000',max: '50000' },
          { label: 'Over $50,000',      min: '50000',max: ''      },
        ].map(({ label, min, max }) => {
          const isActive = localPriceMin === min && localPriceMax === max;
          return (
            <button
              key={label}
              onClick={() => {
                setLocalPriceMin(min);
                setLocalPriceMax(max);
                const params = new URLSearchParams(searchParams.toString());
                min ? params.set('priceMin', min) : params.delete('priceMin');
                max ? params.set('priceMax', max) : params.delete('priceMax');
                params.set('page', '1');
                router.push(`${baseRoute}?${params.toString()}`);
              }}
              className={`block w-full text-left px-2 py-1 rounded text-xs transition-colors ${
                isActive
                  ? 'bg-amber-500/20 text-amber-400 font-semibold'
                  : 'text-neutral-400 hover:text-white'
              }`}
            >
              {label}
            </button>
          );
        })}
        <div className="flex gap-2 mt-2">
          <input
            type="number" placeholder="Min"
            className="input text-xs py-1 px-2"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
          />
          <input
            type="number" placeholder="Max"
            className="input text-xs py-1 px-2"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
          />
        </div>
        <button onClick={applyRanges} className="btn-secondary w-full mt-2 text-xs py-1.5">
          Apply
        </button>
      </FilterGroup>

      {/* ── IN STOCK (shared) ────────────────────────────────────────────────── */}
      <FilterGroup label="Availability">
        <CheckItem
          label="In Stock Only"
          checked={searchParams.get('inStock') === 'true'}
          onChange={() =>
            updateFilter('inStock', searchParams.get('inStock') === 'true' ? null : 'true')
          }
        />
      </FilterGroup>

      {/* ════════════════════════════════════════════════════════════════════════
          WATCH FILTERS
         ════════════════════════════════════════════════════════════════════════ */}
      {mode === 'watch' && (
        <>
          <FilterGroup label="Gender">
            {WATCH_GENDERS.map((g) => (
              <CheckItem
                key={g} label={g}
                count={countFor(facets?.watchGenders, g)}
                checked={activeWatchGender === g}
                onChange={() => updateFilter('watchGender', activeWatchGender === g ? null : g)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Brand">
            {WATCH_BRANDS.map((b) => (
              <CheckItem
                key={b} label={b}
                count={countFor(facets?.watchBrands, b)}
                checked={activeWatchBrands.includes(b)}
                onChange={() => toggleMultiSelect('watchBrand', activeWatchBrands, b)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Movement">
            {WATCH_MOVEMENTS.map((m) => (
              <CheckItem
                key={m} label={m}
                count={countFor(facets?.watchMovements, m)}
                checked={activeWatchMovements.includes(m)}
                onChange={() => toggleMultiSelect('watchMovement', activeWatchMovements, m)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Strap Type">
            {WATCH_STRAP_TYPES.map((s) => (
              <CheckItem
                key={s} label={s}
                count={countFor(facets?.watchStrapTypes, s)}
                checked={activeWatchStrapTypes.includes(s)}
                onChange={() => toggleMultiSelect('watchStrapType', activeWatchStrapTypes, s)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Case Material">
            {WATCH_CASE_MATERIALS.map((m) => (
              <CheckItem
                key={m} label={m}
                count={countFor(facets?.watchCaseMaterials, m)}
                checked={activeWatchCaseMaterials.includes(m)}
                onChange={() => toggleMultiSelect('watchCaseMaterial', activeWatchCaseMaterials, m)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Dial Color">
            {WATCH_DIAL_COLORS.map((c) => (
              <CheckItem
                key={c} label={c}
                count={countFor(facets?.watchDialColors, c)}
                checked={activeWatchDialColors.includes(c)}
                onChange={() => toggleMultiSelect('watchDialColor', activeWatchDialColors, c)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Features">
            {WATCH_FEATURES.map((f) => (
              <CheckItem
                key={f} label={f}
                count={countFor(facets?.watchFeatures, f)}
                checked={activeWatchFeatures.includes(f)}
                onChange={() => toggleMultiSelect('watchFeatures', activeWatchFeatures, f)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Style">
            {WATCH_STYLES.map((s) => (
              <CheckItem
                key={s} label={s}
                count={countFor(facets?.watchStyles, s)}
                checked={activeWatchStyles.includes(s)}
                onChange={() => toggleMultiSelect('watchStyle', activeWatchStyles, s)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Case Size">
            {WATCH_CASE_SIZES.map((sz) => (
              <CheckItem
                key={sz} label={sz}
                count={countFor(facets?.watchCaseSizes, sz)}
                checked={activeWatchCaseSize === sz}
                onChange={() => updateFilter('watchCaseSize', activeWatchCaseSize === sz ? null : sz)}
              />
            ))}
          </FilterGroup>
        </>
      )}

      {/* ════════════════════════════════════════════════════════════════════════
          DIAMOND FILTERS
         ════════════════════════════════════════════════════════════════════════ */}
      {mode === 'diamond' && (
        <>
          <FilterGroup label="Shape">
            {SHAPES.map((shape) => (
              <CheckItem
                key={shape}
                label={shape.charAt(0).toUpperCase() + shape.slice(1)}
                count={facets?.shapes?.find((f) => f._id === shape)?.count}
                checked={activeShapes.includes(shape)}
                onChange={() => toggleMultiSelect('shape', activeShapes, shape)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Color">
            {DISPLAY_COLORS.map((color) => (
              <CheckItem
                key={color} label={color}
                count={facets?.colors?.find((f) => f._id === color)?.count}
                checked={activeColors.includes(color)}
                onChange={() => toggleMultiSelect('color', activeColors, color)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Clarity">
            {CLARITIES.map((clarity) => (
              <CheckItem
                key={clarity} label={clarity}
                count={facets?.clarities?.find((f) => f._id === clarity)?.count}
                checked={activeClarities.includes(clarity)}
                onChange={() => toggleMultiSelect('clarity', activeClarities, clarity)}
              />
            ))}
          </FilterGroup>

          <FilterGroup label="Size (Carat)">
            <div className="flex gap-2">
              <input
                type="number" placeholder="Min" step="0.01"
                className="input text-xs py-1 px-2"
                value={localSizeMin}
                onChange={(e) => setLocalSizeMin(e.target.value)}
              />
              <input
                type="number" placeholder="Max" step="0.01"
                className="input text-xs py-1 px-2"
                value={localSizeMax}
                onChange={(e) => setLocalSizeMax(e.target.value)}
              />
            </div>
            <button onClick={applyRanges} className="btn-secondary w-full mt-2 text-xs py-1.5">
              Apply
            </button>
          </FilterGroup>
        </>
      )}
    </aside>
  );
}

// ─── Icons ────────────────────────────────────────────────────────────────────
function DiamondIcon({ active }: { active: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true"
      style={{ color: active ? '#171717' : 'currentColor' }}>
      <path d="M9 16L2 7l2.5-5h9L16 7z" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
      <path d="M2 7h14M9 16L5 7l4-5 4 5z" stroke="currentColor" strokeWidth="1" strokeLinejoin="round" />
    </svg>
  );
}

function WatchIcon({ active }: { active: boolean }) {
  return (
    <svg width="11" height="11" viewBox="0 0 18 18" fill="none" aria-hidden="true"
      style={{ color: active ? '#171717' : 'currentColor' }}>
      <circle cx="9" cy="9" r="6" stroke="currentColor" strokeWidth="1.4" />
      <path d="M9 6v3l2 1.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="7" y="1.5" width="4" height="2" rx="0.5" stroke="currentColor" strokeWidth="1" />
      <rect x="7" y="14.5" width="4" height="2" rx="0.5" stroke="currentColor" strokeWidth="1" />
    </svg>
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────
function FilterGroup({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="border-t border-neutral-800 pt-4">
      <button
        className="flex items-center justify-between w-full text-xs font-semibold uppercase tracking-widest text-neutral-400 mb-3"
        onClick={() => setOpen(!open)}
      >
        {label}
        <span className="text-neutral-600">{open ? '−' : '+'}</span>
      </button>
      {open && <div className="space-y-1.5">{children}</div>}
    </div>
  );
}

function CheckItem({
  label, count, checked, onChange,
}: {
  label: string;
  count?: number;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <label className="flex items-center gap-2 cursor-pointer group">
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="accent-amber-500 w-3.5 h-3.5"
      />
      <span className={`text-xs group-hover:text-white transition-colors ${checked ? 'text-white' : 'text-neutral-400'}`}>
        {label}
      </span>
      {count !== undefined && (
        <span className="text-neutral-600 text-xs ml-auto">({count})</span>
      )}
    </label>
  );
}