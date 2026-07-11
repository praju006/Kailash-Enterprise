import Link from 'next/link';
import { CatalogProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import Marquee from './Marquee';

export default function Hero({ products }: { products: CatalogProduct[] }) {
  const main = products[0];
  const side = products[6] || products[1];

  return (
    <section className="relative overflow-hidden bg-cream">
      <div className="container relative pt-14 md:pt-20 pb-0">
        <div className="relative grid md:grid-cols-12 gap-8 items-end">
          {/* Left: headline block */}
          <div className="md:col-span-7 reveal-left relative z-[2] pb-12 md:pb-20">
            <span className="eyebrow">Est. Sourcing Direct &middot; Real Stock Only</span>
            <h1 className="display-huge text-charcoal mt-5">
              Draped
              <br />
              in <span className="text-maroon">real</span>
              <br />
              stories<span className="text-gold-deep">.</span>
            </h1>
            <p className="max-w-[400px] mt-7 text-[16px] leading-relaxed text-charcoal/70">
              Kalamkari, Warli and Bandhani sarees — photographed exactly as they are,
              shipped exactly as you see them. No stock imagery, ever.
            </p>
            <div className="flex items-center gap-6 mt-9 flex-wrap">
              <Link href="/shop" className="btn-primary px-9 py-4">Shop the Stock</Link>
              <Link href="/about" className="link-slide font-mono text-[12px] uppercase tracking-[0.08em] text-maroon">
                Why real photos matter →
              </Link>
            </div>
          </div>

          {/* Right: dominant editorial image */}
          <div className="md:col-span-5 reveal-right relative z-[2]">
            <div className="img-zoom relative aspect-[3/4] max-h-[560px] w-full border-2 border-gold/60 shadow-[0_40px_80px_-32px_rgba(103,20,32,0.45)]">
              {main && (
                <img
                  src={main.images[0]}
                  alt={main.name}
                  className="w-full h-full object-cover"
                  style={{ objectPosition: 'center 8%' }}
                />
              )}
              <div className="absolute top-4 left-4 bg-maroon text-gold-pale font-mono text-[10px] tracking-[0.08em] px-3 py-2 uppercase">
                Real Stock Photo
              </div>
              {main && (
                <Link
                  href={`/product/${main.id}`}
                  className="absolute bottom-4 left-4 right-4 flex items-center justify-between bg-cream/95 backdrop-blur px-4 py-3 border border-gold/40 hover:bg-cream transition-colors"
                >
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-[0.06em] text-gold-deep">{main.badge || 'In stock'}</div>
                    <div className="font-head text-[16px] tracking-[0.04em] text-charcoal mt-0.5">{main.name}</div>
                  </div>
                  <div className="font-anton text-[19px] text-maroon">{formatPrice(main.price)}</div>
                </Link>
              )}
            </div>

            {/* Small offset accent photo */}
            {side && (
              <div className="hidden lg:block img-zoom absolute -left-32 top-14 w-[140px] aspect-[3/4] border-2 border-gold bg-white shadow-custom rotate-[-4deg]">
                <img src={side.images[0]} alt={side.name} className="w-full h-full object-cover" style={{ objectPosition: 'center 10%' }} />
              </div>
            )}
          </div>
        </div>
      </div>

      <Marquee
        items={['100% Real Stock Photos', 'Direct From Weaver Partners', 'Pay by UPI QR', 'Free Shipping Above ₹2,999', '7-Day Easy Exchange']}
      />
    </section>
  );
}
