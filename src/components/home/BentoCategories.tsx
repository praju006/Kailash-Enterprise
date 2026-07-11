import Link from 'next/link';
import { CatalogCategory, CatalogProduct } from '@/lib/catalog';

const TAGLINES: Record<string, string> = {
  kalamkari: 'Hand-painted deer, elephants & temple stories',
  bandhani: 'Tie-dye pallus on tribal woven grounds',
  printed: 'Everyday handloom stripes in earth tones',
};

export default function BentoCategories({ categories, products }: { categories: CatalogCategory[]; products: CatalogProduct[] }) {
  // Largest category gets the hero tile
  const sorted = [...categories].sort(
    (a, b) => products.filter((p) => p.category === b.slug).length - products.filter((p) => p.category === a.slug).length
  );
  const [big, ...rest] = sorted;
  if (!big) return null;

  const count = (slug: string) => products.filter((p) => p.category === slug).length;
  const countLabel = (slug: string) => {
    const n = count(slug);
    return `${n} piece${n === 1 ? '' : 's'} in stock`;
  };

  return (
    <section className="section pt-20" id="categories">
      <div className="container">
        <div className="flex flex-wrap items-end justify-between gap-6 mb-10 reveal">
          <div>
            <span className="eyebrow">Shop by Weave</span>
            <h2 className="display-big text-charcoal mt-3 mb-0">The Collection</h2>
          </div>
          <Link href="/shop" className="link-slide font-mono text-[12px] uppercase tracking-[0.08em] text-maroon mb-2">
            View all {products.length} sarees →
          </Link>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          {/* Hero tile */}
          <Link href={`/shop?category=${big.slug}`} className="group img-zoom relative block h-[340px] md:h-[560px] reveal-left">
            {big.images[0] && (
              <img src={big.images[0]} alt={big.name} className="w-full h-full object-cover" style={{ objectPosition: 'center 10%' }} />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-7">
              <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-light mb-2">{countLabel(big.slug)}</div>
              <h3 className="font-anton text-[34px] md:text-[44px] leading-none text-white uppercase m-0">{big.name}</h3>
              <p className="text-white/80 text-[13.5px] mt-2 mb-0 max-w-[380px]">{TAGLINES[big.slug]}</p>
            </div>
            <span className="absolute top-5 right-5 w-11 h-11 rounded-full border border-white/50 text-white flex items-center justify-center transition-all group-hover:bg-gold group-hover:border-gold group-hover:text-maroon-dark">→</span>
          </Link>

          {/* Two stacked tiles */}
          <div className="grid gap-4">
            {rest.slice(0, 2).map((cat, i) => (
              <Link
                key={cat.slug}
                href={`/shop?category=${cat.slug}`}
                className="group img-zoom relative block h-[240px] md:h-[272px] reveal-right"
                style={{ transitionDelay: `${i * 0.12}s` }}
              >
                {cat.images[0] && (
                  <img src={cat.images[0]} alt={cat.name} className="w-full h-full object-cover" style={{ objectPosition: 'center 12%' }} />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6">
                  <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-gold-light mb-1.5">{countLabel(cat.slug)}</div>
                  <h3 className="font-anton text-[24px] md:text-[28px] leading-none text-white uppercase m-0">{cat.name}</h3>
                </div>
                <span className="absolute top-5 right-5 w-10 h-10 rounded-full border border-white/50 text-white flex items-center justify-center transition-all group-hover:bg-gold group-hover:border-gold group-hover:text-maroon-dark">→</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
