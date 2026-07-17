'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

// Swap image paths for your own pattern/fabric close-ups.
const PATTERNS = [
  { label: 'Zari Woven', image: '/images/sarees/69a03228ca2069fd56c7efcb20084f52.jpg' },
  { label: 'Brocade', image: '/images/sarees/85357fcf5421a973f8387fd5f9018321.jpg' },
  { label: 'Tissue', image: '/images/sarees/86c721b5f4ad359645b538c23a1a462c.jpg' },
  { label: 'Kanjivaram', image: '/images/sarees/a99b6f4712d1942b3a66136a489a8961.jpg' },
  { label: 'Organza', image: '/images/sarees/b3ad3d0683c39d02b40c5c9886353566.jpg' },
];
const LIFESTYLE = '/images/sarees/c4824022c1080bc8440cd250dd0d7130.jpg';

const AUTOPLAY_MS = 3500;
const SWIPE_THRESHOLD_PX = 40;
const WHEEL_COOLDOWN_MS = 500;

export default function ShopByPattern() {
  const [active, setActive] = useState(1);
  const [paused, setPaused] = useState(false);
  const n = PATTERNS.length;
  const at = (offset: number) => PATTERNS[(active + offset + n) % n];

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const trackRef = useRef<HTMLDivElement | null>(null);
  const touchStartX = useRef<number | null>(null);
  const wheelLockedRef = useRef(false);

  const goNext = () => setActive((a) => (a + 1) % n);
  const goPrev = () => setActive((a) => (a - 1 + n) % n);

  // Auto-advance every AUTOPLAY_MS, unless paused (hover/touch/wheel interaction) or hidden.
  useEffect(() => {
    if (paused) return;
    intervalRef.current = setInterval(goNext, AUTOPLAY_MS);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [paused, active]);

  function restartTimer() {
    if (intervalRef.current) clearInterval(intervalRef.current);
  }

  function handleManualNav(fn: () => void) {
    restartTimer();
    fn();
  }

  // --- Touch swipe support (mobile) ---
  function handleTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
    setPaused(true);
  }

  function handleTouchEnd(e: React.TouchEvent) {
    if (touchStartX.current === null) return;
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(deltaX) > SWIPE_THRESHOLD_PX) {
      restartTimer();
      if (deltaX < 0) goNext();
      else goPrev();
    }
    touchStartX.current = null;
    setPaused(false);
  }

  // --- Mouse wheel support (desktop trackpads / mice with horizontal scroll) ---
  function handleWheel(e: React.WheelEvent) {
    // Prefer horizontal scroll delta; fall back to vertical if that's all the device reports.
    const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
    if (Math.abs(delta) < 15) return; // ignore tiny/noisy wheel ticks
    if (wheelLockedRef.current) return;

    e.preventDefault();
    restartTimer();
    if (delta > 0) goNext();
    else goPrev();

    wheelLockedRef.current = true;
    setTimeout(() => {
      wheelLockedRef.current = false;
    }, WHEEL_COOLDOWN_MS);
  }

  return (
    <section className="section-tight bg-cream-dark">
      <div className="container">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          {/* Left: heading + pattern carousel */}
          <div>
            <div className="text-center mb-7 reveal">
              <span className="eyebrow justify-center">Shop by Pattern</span>
              <h2 className="text-2xl md:text-4xl font-head font-bold text-ink mt-2 mb-0">A Weave For Every Occasion</h2>
            </div>

            <div
              ref={trackRef}
              className="flex items-stretch justify-center gap-3 h-[360px] touch-pan-y"
              onMouseEnter={() => setPaused(true)}
              onMouseLeave={() => setPaused(false)}
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onWheel={handleWheel}
            >
              {[-1, 0, 1].map((offset) => {
                const p = at(offset);
                const isActive = offset === 0;
                return (
                  <div
                    key={offset}
                    className={`relative overflow-hidden transition-all duration-500 select-none ${isActive ? 'w-[46%] opacity-100' : 'w-[27%] opacity-60'}`}
                  >
                    <img src={p.image} alt={p.label} draggable={false} className="w-full h-full object-cover object-top pointer-events-none" />
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-2" style={{ background: 'rgba(0,0,0,0.28)' }}>
                      <h3 className="font-head font-bold text-white uppercase tracking-[0.06em] text-[15px] md:text-[19px] m-0" style={{ textShadow: '0 2px 12px rgba(0,0,0,0.5)' }}>{p.label}</h3>
                      {isActive && (
                        <Link href="/shop" className="mt-4 bg-white text-ink text-[10.5px] font-medium uppercase tracking-[0.08em] px-5 py-2 hover:bg-maroon hover:text-white transition-colors">
                          Shop Now
                        </Link>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="flex items-center justify-center gap-4 mt-5">
              <button onClick={() => handleManualNav(goPrev)} aria-label="Previous pattern" className="w-10 h-10 rounded-full border border-ink/25 text-ink hover:bg-ink hover:text-white transition-colors flex items-center justify-center">‹</button>
              <button onClick={() => handleManualNav(goNext)} aria-label="Next pattern" className="w-10 h-10 rounded-full border border-ink/25 text-ink hover:bg-ink hover:text-white transition-colors flex items-center justify-center">›</button>
            </div>
          </div>

          {/* Right: lifestyle image */}
          <div className="img-zoom reveal-right overflow-hidden h-[300px] lg:h-[520px]">
            <img src={LIFESTYLE} alt="Kailash sarees" className="w-full h-full object-cover object-top" />
          </div>
        </div>
      </div>
    </section>
  );
}