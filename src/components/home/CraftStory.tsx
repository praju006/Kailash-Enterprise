const STEPS = [
  {
    n: '01',
    title: 'Sourced at the source',
    text: 'We buy directly from weaver partners — no distributors, no middle layers. That keeps prices honest and lets us know exactly where each piece comes from.',
  },
  {
    n: '02',
    title: 'Photographed as-is',
    text: 'Every saree is shot from our own shelf, unretouched. The photo on the listing is the exact piece that gets folded, packed and shipped to you.',
  },
  {
    n: '03',
    title: 'Checked & shipped in 2 days',
    text: "Each piece is hand-checked before dispatch, ships within two days, and comes with a 7-day no-questions exchange if it isn't right.",
  },
];

export default function CraftStory({ image }: { image?: string }) {
  return (
    <section className="section bg-cream" id="craft">
      <div className="container grid md:grid-cols-2 gap-14">
        {/* Sticky image column */}
        <div className="relative">
          <div className="md:sticky md:top-28">
            <div className="img-zoom relative aspect-[3/4] max-h-[600px] border-2 border-gold/60">
              {image && <img src={image} alt="Real saree from current stock" className="w-full h-full object-cover" style={{ objectPosition: 'center 10%' }} />}
              <div className="absolute bottom-0 inset-x-0 px-5 py-3.5 font-mono text-[10.5px] tracking-[0.06em] uppercase text-gold-pale" style={{ background: 'rgba(103,20,32,0.92)' }}>
                Actual stock — nothing borrowed, nothing staged
              </div>
            </div>
          </div>
        </div>

        {/* Scrolling steps */}
        <div>
          <span className="eyebrow">How We Work</span>
          <h2 className="display-big text-charcoal mt-3">
            What you see
            <br />
            is what ships<span className="text-gold-deep">.</span>
          </h2>

          <div className="mt-12 space-y-14">
            {STEPS.map((s, i) => (
              <div key={s.n} className="reveal flex gap-7" style={{ transitionDelay: `${i * 0.08}s` }}>
                <div className="font-anton text-[52px] leading-none text-outline shrink-0 select-none">{s.n}</div>
                <div className="pt-1.5">
                  <h3 className="font-head text-[22px] tracking-[0.06em] uppercase text-maroon-dark m-0">{s.title}</h3>
                  <p className="text-[15px] text-charcoal/70 leading-relaxed mt-2.5 mb-0 max-w-[420px]">{s.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
