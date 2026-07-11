'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

function getTargetDate() {
  const target = new Date();
  target.setDate(target.getDate() + 4);
  target.setHours(23, 59, 59, 0);
  return target;
}

export default function SaleCountdown() {
  const [target] = useState(getTargetDate);
  const [time, setTime] = useState({ d: 0, h: 0, m: 0, s: 0 });

  useEffect(() => {
    function tick() {
      const diff = Math.max(0, target.getTime() - Date.now());
      setTime({
        d: Math.floor(diff / 86400000),
        h: Math.floor((diff % 86400000) / 3600000),
        m: Math.floor((diff % 3600000) / 60000),
        s: Math.floor((diff % 60000) / 1000),
      });
    }
    tick();
    const interval = setInterval(tick, 1000);
    return () => clearInterval(interval);
  }, [target]);

  const units = [
    { label: 'Days', value: time.d },
    { label: 'Hrs', value: time.h },
    { label: 'Min', value: time.m },
    { label: 'Sec', value: time.s },
  ];

  return (
    <section className="border-y border-line" style={{ background: '#FBEFCE' }}>
      <div className="container py-9 flex flex-col md:flex-row items-center justify-between gap-7">
        <h4 className="text-[17px] text-maroon-dark m-0">Festive Sale ends in &mdash;</h4>

        <div className="flex items-center flex-wrap justify-center gap-8">
          <div className="flex gap-5">
            {units.map((u) => (
              <div key={u.label} className="text-center min-w-[42px]">
                <div className="font-anton text-[26px] text-maroon tabular-nums leading-none">{String(u.value).padStart(2, '0')}</div>
                <div className="font-mono text-[9px] tracking-[0.06em] text-charcoal/60 mt-1.5">{u.label.toUpperCase()}</div>
              </div>
            ))}
          </div>
          <Link href="/shop" className="btn-primary px-7 py-3 whitespace-nowrap shrink-0">Shop Sale</Link>
        </div>
      </div>
    </section>
  );
}
