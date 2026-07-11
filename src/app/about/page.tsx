import Link from 'next/link';
import { getActiveCategories, getActiveProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'About Us — Kailash Enterprises',
  description: 'Real stock, honestly photographed — the story behind Kailash Enterprises.',
};

const VALUES = [
  { n: '01', title: 'Real Photos, Always', text: 'Every saree on this site is shot as-is from our own stock. No stock photography, no misleading catalog images.' },
  { n: '02', title: 'Small & Direct', text: "We're a small outfit sourcing directly, which means fewer middlemen and honest pricing on every piece." },
  { n: '03', title: 'Grows With Our Stock', text: 'Our catalog reflects what we actually have on hand — as new stock arrives, the site updates with it.' },
];

export default async function AboutPage() {
  const [categories, products] = await Promise.all([getActiveCategories(), getActiveProducts()]);
  const heroImage = products[6]?.images[0] || products[0]?.images[0];

  return (
    <>
      <div className="container pt-7 pb-2">
        <Link href="/" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft hover:text-maroon transition-colors">← Back</Link>
      </div>

      <section className="section-tight">
        <div className="container max-w-[700px] mx-auto text-center reveal">
          <span className="eyebrow justify-center">Our Story</span>
          <h1 className="mt-3.5">Real Sarees, Photographed Honestly</h1>
          <p className="text-ink-soft">
            Kailash Enterprises is a small, direct-sourced saree business. We currently carry {categories.length} weaves —
            {' '}{categories.map((c) => c.name).join(', ')} — and every photo you see on this site is the actual piece
            you&apos;ll receive, shot without retouching or stock imagery.
          </p>
        </div>
      </section>

      <section className="section bg-white border-y border-line">
        <div className="container grid md:grid-cols-3 gap-6">
          {VALUES.map((v, i) => (
            <div key={v.n} className="reveal-scale text-center px-6" style={{ transitionDelay: `${i * 0.1}s` }}>
              <div className="w-14 h-14 rounded-full bg-white border-[1.5px] border-gold flex items-center justify-center mx-auto mb-4 font-head font-semibold text-maroon">
                {v.n}
              </div>
              <h3 className="font-head">{v.title}</h3>
              <p className="text-ink-soft">{v.text}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="section">
        <div className="container grid md:grid-cols-2 gap-12 items-center">
          <div className="relative reveal-left">
            <div className="border-[3px] border-gold/50 shadow-custom overflow-hidden aspect-[4/3]">
              {heroImage && <img src={heroImage} alt="Real saree from our current stock" className="w-full h-full object-cover object-top" />}
            </div>
            <div className="absolute -bottom-4 left-6 bg-maroon-dark text-gold-pale px-5 py-2.5 font-mono text-[11px] uppercase tracking-[0.08em] whitespace-nowrap">
              Actual Stock Photo
            </div>
          </div>
          <div className="reveal-right">
            <span className="eyebrow">Our Approach</span>
            <h2 className="mt-3.5">Growing The Catalog As We Grow</h2>
            <p className="text-ink-soft">
              We&apos;d rather show you {products.length} real sarees than a hundred stock photos of things we don&apos;t
              have. As new stock comes in from our weaver partners, it gets photographed and listed here directly —
              what you see is what&apos;s actually on the shelf.
            </p>
            <p className="text-ink-soft">
              Our promise is simple: authentic fabric, honest photos, and a saree that makes you feel like the best
              version of yourself.
            </p>
            <Link href="/shop" className="btn-primary inline-flex px-8 py-3.5 mt-2">Explore Our Collection</Link>
          </div>
        </div>
      </section>

      <section className="bg-maroon-dark text-[#f4e3c1] py-14 text-center reveal">
        <div className="container">
          <span className="eyebrow justify-center text-gold-pale/80">Our Promise</span>
          <h3 className="text-white text-2xl mt-3.5">Real Stock. Real Photos. No Surprises At Your Door.</h3>
          <p className="text-[#e6cfa3] mb-5">Have a question about a piece before you buy? We&apos;re happy to help.</p>
          <Link href="/contact" className="btn-gold inline-flex px-8 py-3.5">
            Get In Touch
          </Link>
        </div>
      </section>
    </>
  );
}
