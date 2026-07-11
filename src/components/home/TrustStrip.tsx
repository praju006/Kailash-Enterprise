const STATS = [
  { num: '100%', desc: 'Real stock photos — zero stock imagery' },
  { num: '02', desc: 'Days to dispatch, hand-checked' },
  { num: '07', desc: 'Day exchange, no questions asked' },
  { num: 'UPI', desc: 'Scan & pay straight to the store' },
];

export default function TrustStrip() {
  return (
    <div className="bg-maroon-dark text-gold-pale relative overflow-hidden">
      <div className="container relative grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10 py-16 text-center">
        {STATS.map((s, i) => (
          <div key={s.num} className="reveal-scale" style={{ transitionDelay: `${i * 0.08}s` }}>
            <div className="font-anton text-[44px] md:text-[56px] leading-none text-gold-light">{s.num}</div>
            <div className="font-mono text-[11px] tracking-[0.05em] uppercase opacity-80 mt-3 max-w-[190px] mx-auto">{s.desc}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
