'use client';
import { useState, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { SHAPES, COLORS, CLARITIES, CERTIFICATIONS } from '@/models/Product';

// Subset of colors for usability
const DISPLAY_COLORS = ['D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'fancy-yellow', 'fancy-pink', 'fancy-blue'];

interface FilterSidebarProps {
  facets?: {
    shapes?: Array<{ _id: string; count: number }>;
    colors?: Array<{ _id: string; count: number }>;
    clarities?: Array<{ _id: string; count: number }>;
    priceRange?: Array<{ min: number; max: number }>;
    sizeRange?: Array<{ min: number; max: number }>;
  };
}

export default function FilterSidebar({ facets }: FilterSidebarProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse current active filters from URL
  const activeShapes = searchParams.get('shape')?.split(',').filter(Boolean) || [];
  const activeColors = searchParams.get('color')?.split(',').filter(Boolean) || [];
  const activeClarities = searchParams.get('clarity')?.split(',').filter(Boolean) || [];
  const priceMin = searchParams.get('priceMin') || '';
  const priceMax = searchParams.get('priceMax') || '';
  const sizeMin = searchParams.get('sizeMin') || '';
  const sizeMax = searchParams.get('sizeMax') || '';

  const [localPriceMin, setLocalPriceMin] = useState(priceMin);
  const [localPriceMax, setLocalPriceMax] = useState(priceMax);
  const [localSizeMin, setLocalSizeMin] = useState(sizeMin);
  const [localSizeMax, setLocalSizeMax] = useState(sizeMax);

  const updateFilter = useCallback(
    (key: string, value: string | null) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      params.set('page', '1'); // Reset to page 1 on filter change
      router.push(`/products?${params.toString()}`);
    },
    [router, searchParams]
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
    localSizeMin ? params.set('sizeMin', localSizeMin) : params.delete('sizeMin');
    localSizeMax ? params.set('sizeMax', localSizeMax) : params.delete('sizeMax');
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
  };

  const clearAll = () => router.push('/products');

  const hasActiveFilters =
    activeShapes.length || activeColors.length || activeClarities.length ||
    priceMin || priceMax || sizeMin || sizeMax;

  return (
    <aside className="w-56 shrink-0 space-y-6 text-sm">
      <div className="flex items-center justify-between">
        <h2 className="font-semibold text-neutral-200">Filters</h2>
        {hasActiveFilters ? (
          <button onClick={clearAll} className="text-xs text-amber-400 hover:text-amber-300">
            Clear all
          </button>
        ) : null}
      </div>

      {/* Shape */}
      <FilterGroup label="Shape">
        {SHAPES.map((shape) => {
          const count = facets?.shapes?.find((f) => f._id === shape)?.count;
          return (
            <CheckItem
              key={shape}
              label={shape.charAt(0).toUpperCase() + shape.slice(1)}
              count={count}
              checked={activeShapes.includes(shape)}
              onChange={() => toggleMultiSelect('shape', activeShapes, shape)}
            />
          );
        })}
      </FilterGroup>

      {/* Color */}
      <FilterGroup label="Color">
        {DISPLAY_COLORS.map((color) => {
          const count = facets?.colors?.find((f) => f._id === color)?.count;
          return (
            <CheckItem
              key={color}
              label={color}
              count={count}
              checked={activeColors.includes(color)}
              onChange={() => toggleMultiSelect('color', activeColors, color)}
            />
          );
        })}
      </FilterGroup>

      {/* Clarity */}
      <FilterGroup label="Clarity">
        {CLARITIES.map((clarity) => {
          const count = facets?.clarities?.find((f) => f._id === clarity)?.count;
          return (
            <CheckItem
              key={clarity}
              label={clarity}
              count={count}
              checked={activeClarities.includes(clarity)}
              onChange={() => toggleMultiSelect('clarity', activeClarities, clarity)}
            />
          );
        })}
      </FilterGroup>

      {/* Price Range */}
      <FilterGroup label="Price (USD)">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            className="input text-xs py-1 px-2"
            value={localPriceMin}
            onChange={(e) => setLocalPriceMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            className="input text-xs py-1 px-2"
            value={localPriceMax}
            onChange={(e) => setLocalPriceMax(e.target.value)}
          />
        </div>
      </FilterGroup>

      {/* Size Range */}
      <FilterGroup label="Size (Carat)">
        <div className="flex gap-2">
          <input
            type="number"
            placeholder="Min"
            step="0.01"
            className="input text-xs py-1 px-2"
            value={localSizeMin}
            onChange={(e) => setLocalSizeMin(e.target.value)}
          />
          <input
            type="number"
            placeholder="Max"
            step="0.01"
            className="input text-xs py-1 px-2"
            value={localSizeMax}
            onChange={(e) => setLocalSizeMax(e.target.value)}
          />
        </div>
        <button onClick={applyRanges} className="btn-secondary w-full mt-2 text-xs py-1.5">
          Apply
        </button>
      </FilterGroup>

      {/* In Stock */}
      <FilterGroup label="Availability">
        <CheckItem
          label="In Stock Only"
          checked={searchParams.get('inStock') === 'true'}
          onChange={() =>
            updateFilter(
              'inStock',
              searchParams.get('inStock') === 'true' ? null : 'true'
            )
          }
        />
      </FilterGroup>
    </aside>
  );
}

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
  label,
  count,
  checked,
  onChange,
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
