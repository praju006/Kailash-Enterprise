'use client';

import { useState } from 'react';
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

export default function ShopByPattern() {
  const [active, setActive] = useState(1);
  const n = PATTERNS.length;
  const at = (offset: number) => PATTERNS[(active + offset + n) % n];

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

            <div className="flex items-stretch justify-center gap-3 h-[360px]">
              {[-1, 0, 1].map((offset) => {
                const p = at(offset);
                const isActive = offset === 0;
                return (
                  <div
                    key={offset}
                    className={`relative overflow-hidden transition-all duration-500 ${isActive ? 'w-[46%] opacity-100' : 'w-[27%] opacity-60'}`}
                  >
                    <img src={p.image} alt={p.label} className="w-full h-full object-cover object-top" />
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
              <button onClick={() => setActive((a) => (a - 1 + n) % n)} aria-label="Previous pattern" className="w-10 h-10 rounded-full border border-ink/25 text-ink hover:bg-ink hover:text-white transition-colors flex items-center justify-center">‹</button>
              <button onClick={() => setActive((a) => (a + 1) % n)} aria-label="Next pattern" className="w-10 h-10 rounded-full border border-ink/25 text-ink hover:bg-ink hover:text-white transition-colors flex items-center justify-center">›</button>
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
