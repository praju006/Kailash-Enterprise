'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { CatalogProduct } from '@/lib/catalog';
import Marquee from './Marquee';

interface Slide {
  image: string;
  eyebrow: string;
  title: string;
  sub: string;
  href: string;
  cta: string;
}

export default function Hero({ products }: { products: CatalogProduct[] }) {
  const pics = products.filter((p) => p.images[0]).map((p) => p.images[0]);
  const slides: Slide[] = [
    { image: pics[0], eyebrow: 'New Arrivals', title: 'The Festive\nSaree Collection', sub: 'Handwoven Kalamkari, Warli & Bandhani — photographed exactly as they ship.', href: '/shop', cta: 'Shop Now' },
    { image: pics[6] || pics[1], eyebrow: 'Direct From The Loom', title: 'Real Stock,\nReal Sarees', sub: 'No stock imagery. What you see on the page is the exact piece delivered to you.', href: '/shop', cta: 'Explore Collection' },
    { image: pics[2] || pics[0], eyebrow: 'Weaver Partners', title: 'A Century\nof Craft', sub: 'Sourced directly from our weaver partners across India.', href: '/about', cta: 'Our Story' },
  ].filter((s) => s.image);

  const [active, setActive] = useState(0);
  const count = slides.length;
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (count <= 1) return;
    timer.current = setInterval(() => setActive((a) => (a + 1) % count), 5500);
    return () => { if (timer.current) clearInterval(timer.current); };
  }, [count]);

  function go(i: number) {
    setActive((i + count) % count);
    if (timer.current) clearInterval(timer.current);
    timer.current = setInterval(() => setActive((a) => (a + 1) % count), 5500);
  }

  if (count === 0) return <Marquee items={['100% Real Stock Photos', 'Direct From Weaver Partners', 'Pay by UPI QR', 'Free Shipping Above ₹2,999']} />;

  return (
    <section className="relative">
      <div className="relative h-[460px] sm:h-[560px] md:h-[640px] overflow-hidden bg-ink">
        {slides.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-700"
            style={{ opacity: i === active ? 1 : 0, zIndex: i === active ? 1 : 0 }}
          >
            <img src={s.image} alt={s.title} className="w-full h-full object-cover object-top" />
            <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, rgba(0,0,0,0.72) 0%, rgba(0,0,0,0.45) 40%, rgba(0,0,0,0.05) 75%)' }} />
            <div className="absolute inset-0 flex items-center">
              <div className="container">
                <div className="max-w-[560px] text-white">
                  <span className="inline-block bg-maroon text-white font-mono text-[11px] font-semibold uppercase tracking-[0.14em] px-3 py-1.5">{s.eyebrow}</span>
                  <h1 className="display-big text-white mt-5 whitespace-pre-line" style={{ textShadow: '0 2px 24px rgba(0,0,0,0.4)' }}>{s.title}</h1>
                  <p className="mt-4 text-[15px] md:text-[17px] text-white/90 max-w-[440px]">{s.sub}</p>
                  <Link href={s.href} className="btn-primary px-9 py-4 mt-7">{s.cta}</Link>
                </div>
              </div>
            </div>
          </div>
        ))}

        {count > 1 && (
          <>
            <button onClick={() => go(active - 1)} aria-label="Previous" className="absolute left-4 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-white/85 hover:bg-white text-ink flex items-center justify-center text-xl">‹</button>
            <button onClick={() => go(active + 1)} aria-label="Next" className="absolute right-4 top-1/2 -translate-y-1/2 z-[3] w-10 h-10 rounded-full bg-white/85 hover:bg-white text-ink flex items-center justify-center text-xl">›</button>
            <div className="absolute bottom-5 left-0 right-0 z-[3] flex justify-center gap-2">
              {slides.map((_, i) => (
                <button key={i} onClick={() => go(i)} aria-label={`Slide ${i + 1}`} className={`h-2 rounded-full transition-all ${i === active ? 'w-7 bg-maroon' : 'w-2 bg-white/70'}`} />
              ))}
            </div>
          </>
        )}
      </div>

      <Marquee items={['100% Real Stock Photos', 'Direct From Weaver Partners', 'Pay by UPI QR', 'Free Shipping Above ₹2,999', '7-Day Easy Exchange']} />
    </section>
  );
}
