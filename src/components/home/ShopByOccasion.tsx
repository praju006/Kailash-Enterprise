import Link from 'next/link';

// Swap these image paths for your own occasion photos (drop files in
// /public/images/ or use Cloudinary URLs) — one line each.
const OCCASIONS = [
  { label: 'Weddings & Events', image: '/images/sarees/02323bfb5bfc206ffa485f7488df85a4.jpg', href: '/shop' },
  { label: 'Evenings & Celebrations', image: '/images/sarees/21c014c0ff4ec0735f8a8f97dd4ece9a.jpg', href: '/shop' },
  { label: 'Festive', image: '/images/sarees/25265aad0d1334209efb98e980b17cf7.jpg', href: '/shop' },
  { label: 'Work & Everyday', image: '/images/sarees/53f623da994e18fe8973e6300d9b4777.jpg', href: '/shop' },
  { label: 'Gifting', image: '/images/sarees/58dad2beb971cc7ac7e04d5a7c85050c.jpg', href: '/shop' },
];

export default function ShopByOccasion() {
  return (
    <section className="section-tight">
      <div className="container">
        <div className="text-center mb-9 reveal">
          <span className="eyebrow justify-center">Shop by Occasion</span>
          <h2 className="text-2xl md:text-4xl font-head font-bold text-ink mt-2 mb-0">Draped For Every Occasion</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {OCCASIONS.map((o, i) => (
            <Link
              key={o.label}
              href={o.href}
              className="group reveal-scale relative block overflow-hidden aspect-[3/4]"
              style={{ transitionDelay: `${(i % 5) * 0.06}s` }}
            >
              <img
                src={o.image}
                alt={o.label}
                className="w-full h-full object-cover object-top transition-transform duration-[800ms] ease-out group-hover:scale-[1.08]"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(0,0,0,0) 45%, rgba(0,0,0,0.72) 100%)' }} />
              <div className="absolute inset-x-0 bottom-0 p-4 text-center text-white">
                <h3 className="font-head font-bold text-[16px] md:text-[18px] leading-tight text-white m-0">{o.label}</h3>
                <span className="inline-block mt-3 border border-white/80 text-white text-[10.5px] font-medium uppercase tracking-[0.1em] px-4 py-2 transition-colors group-hover:bg-white group-hover:text-ink">
                  Shop Now
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
