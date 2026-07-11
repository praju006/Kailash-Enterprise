const TESTIMONIALS = [
  {
    text: 'The saree that arrived was exactly what I saw in the photo — same colours, same border. No surprises.',
    name: 'Priya Nair',
    role: 'Bengaluru',
  },
  {
    text: 'The Kalamkari print looked even richer in person than on the site. Really happy with the fabric quality.',
    name: 'Meera Iyer',
    role: 'Chennai',
  },
  {
    text: 'Exchanged a size without a single question asked. That alone makes me trust buying online here.',
    name: 'Anjali Sharma',
    role: 'Jaipur',
  },
];

export default function Testimonials() {
  return (
    <section className="section bg-cream relative overflow-hidden">
      <div className="container">
        <div className="reveal mb-14">
          <span className="eyebrow">In Their Words</span>
          <h2 className="display-big text-charcoal mt-3 mb-0">
            What you see<br />is what arrives<span className="text-gold-deep">.</span>
          </h2>
        </div>

        <div className="grid md:grid-cols-3 gap-px bg-line border border-line">
          {TESTIMONIALS.map((t, i) => (
            <div key={t.name} className="reveal bg-cream p-9 flex flex-col justify-between min-h-[260px]" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div>
                <div aria-hidden className="font-anton text-[64px] leading-[0.6] text-gold/60 select-none">&ldquo;</div>
                <p className="text-[16.5px] leading-relaxed text-charcoal mt-4">{t.text}</p>
              </div>
              <div className="font-mono text-[10.5px] tracking-[0.1em] text-maroon uppercase mt-6">
                {t.name} &mdash; {t.role}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
