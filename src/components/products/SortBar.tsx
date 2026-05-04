'use client';
import { useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest' },
  { value: 'price_asc', label: 'Price: Low to High' },
  { value: 'price_desc', label: 'Price: High to Low' },
  { value: 'size_asc', label: 'Carat: Small to Large' },
  { value: 'size_desc', label: 'Carat: Large to Small' },
];

export default function SortBar({
  total,
  currentSort,
  query,
}: {
  total: number;
  currentSort?: string;
  query?: string;
}) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [open, setOpen] = useState(false);
  const active = SORT_OPTIONS.find((o) => o.value === (currentSort || 'newest')) ?? SORT_OPTIONS[0];

  const handleSort = (value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set('sortBy', value);
    params.set('page', '1');
    router.push(`/products?${params.toString()}`);
    setOpen(false);
  };

  return (
    <div className="flex items-center justify-between gap-3 py-3 border-b-[1.5px] border-[#0f0f0f] mb-4">

      {/* Left: result count */}
      <div className="flex items-center gap-1.5 flex-wrap min-w-0">
        {query && (
          <>
            {/* Hide "Results for" label on very small screens */}
            <span className="hidden sm:inline text-[11px] font-medium tracking-[0.12em] uppercase text-[#888]">
              Results for
            </span>
            <span className="font-serif text-sm font-medium text-[#0f0f0f] italic truncate max-w-[120px] sm:max-w-none">
              "{query}"
            </span>
            <span className="inline-block w-px h-3.5 bg-[#ccc] mx-1 self-center shrink-0" />
          </>
        )}
        <span className="font-serif text-lg sm:text-[22px] font-semibold text-[#0f0f0f] tracking-[-0.02em] leading-none shrink-0">
          {total.toLocaleString()}
        </span>
        <span className="text-[11px] font-medium tracking-[0.14em] uppercase text-[#888] shrink-0">
          {/* Shorten label on mobile */}
          <span className="hidden xs:inline">pieces</span>
          <span className="xs:hidden">pcs</span>
        </span>
      </div>

      {/* Right: sort dropdown */}
      <div className="relative shrink-0">
        <button
          onClick={() => setOpen((v) => !v)}
          className="flex items-center gap-2 bg-[#0f0f0f] text-white text-[10px] font-semibold tracking-[0.1em] uppercase px-3 py-2 sm:px-4 rounded-[2px] transition-opacity hover:opacity-80 whitespace-nowrap"
        >
          <svg width="11" height="8" viewBox="0 0 11 8" fill="none" className="shrink-0">
            <path d="M1 1h9M2.5 4h6M4 7h3" stroke="white" strokeWidth="1.3" strokeLinecap="round" />
          </svg>
          {/* Show full label on sm+, icon-only on xs */}
          <span className="hidden sm:inline">{active.label}</span>
          <span className="sm:hidden">Sort</span>
          <svg
            width="8" height="5" viewBox="0 0 8 5" fill="none"
            className={`shrink-0 transition-transform duration-200 opacity-60 ${open ? 'rotate-180' : ''}`}
          >
            <path d="M1 1l3 3 3-3" stroke="white" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {open && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
            <div className="absolute right-0 top-full mt-1.5 z-20 bg-white border border-[#0f0f0f] rounded-[2px] overflow-hidden min-w-[180px] shadow-[4px_4px_0_#0f0f0f]">
              {SORT_OPTIONS.map((opt, i) => (
                <button
                  key={opt.value}
                  onClick={() => handleSort(opt.value)}
                  className={`w-full text-left px-4 py-2.5 text-[9.5px] tracking-[0.1em] uppercase font-semibold flex items-center justify-between transition-colors
                    ${opt.value === active.value
                      ? 'bg-[#0f0f0f] text-white'
                      : 'text-[#555] hover:bg-[#f7f6f3] hover:text-[#0f0f0f]'
                    }
                    ${i > 0 ? 'border-t border-[#e8e6e1]' : ''}
                  `}
                >
                  {opt.label}
                  {opt.value === active.value && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4l2.5 3L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}