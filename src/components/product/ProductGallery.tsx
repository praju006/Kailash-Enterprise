'use client';

import { useRef, useState } from 'react';

/**
 * Product image gallery: one large "hero" image with a thumbnail strip.
 * Click a thumbnail, use the ‹ › arrows, or swipe on touch to move between shots.
 */
export default function ProductGallery({
  images,
  alt,
  badge,
}: {
  images: string[];
  alt: string;
  badge?: string | null;
}) {
  const [active, setActive] = useState(0);
  const touchStartX = useRef<number | null>(null);

  const list = images.filter(Boolean);
  const count = list.length;
  const hasMany = count > 1;

  function go(index: number) {
    if (count === 0) return;
    setActive(((index % count) + count) % count);
  }

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }

  function onTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 40) go(active + (dx < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  if (count === 0) {
    return (
      <div className="aspect-[3/4] arch-frame-subtle border-[3px] border-gold/50 bg-cream-dark flex items-center justify-center">
        <span className="font-mono text-[11px] text-ink-soft">No photo available</span>
      </div>
    );
  }

  return (
    <div>
      <div
        className="relative aspect-[3/4] arch-frame-subtle border-[3px] border-gold/50 overflow-hidden shadow-custom-sm bg-cream-dark group select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {badge && (
          <span className="absolute top-4 left-4 z-[3] bg-maroon text-gold-pale font-mono text-[10px] tracking-[0.06em] px-2.5 py-1.5 uppercase">
            {badge}
          </span>
        )}

        <img src={list[active]} alt={alt} className="w-full h-full object-cover object-top" draggable={false} />

        {hasMany && (
          <>
            <button
              type="button"
              onClick={() => go(active - 1)}
              aria-label="Previous photo"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/90 text-maroon flex items-center justify-center shadow-custom-sm opacity-0 group-hover:opacity-100 transition-opacity md:flex"
            >
              ‹
            </button>
            <button
              type="button"
              onClick={() => go(active + 1)}
              aria-label="Next photo"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-cream/90 text-maroon flex items-center justify-center shadow-custom-sm opacity-0 group-hover:opacity-100 transition-opacity md:flex"
            >
              ›
            </button>

            <div className="absolute bottom-3 inset-x-0 flex justify-center gap-1.5 z-[3]">
              {list.map((_, i) => (
                <span
                  key={i}
                  className={`h-1.5 rounded-full transition-all ${i === active ? 'w-5 bg-maroon' : 'w-1.5 bg-white/70'}`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      {hasMany && (
        <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar">
          {list.map((src, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setActive(i)}
              aria-label={`View photo ${i + 1}`}
              className={`shrink-0 w-16 h-20 border-2 overflow-hidden bg-cream-dark transition-colors ${
                i === active ? 'border-maroon' : 'border-line hover:border-gold'
              }`}
            >
              <img src={src} alt="" className="w-full h-full object-cover object-top" draggable={false} />
            </button>
          ))}
        </div>
      )}

      <p className="font-mono text-[10.5px] text-ink-soft mt-3 text-center">
        {hasMany ? 'Swipe or tap a thumbnail for close-up shots — photographed as-is, no retouching.' : 'This is the exact piece — photographed as-is, no retouching.'}
      </p>
    </div>
  );
}
