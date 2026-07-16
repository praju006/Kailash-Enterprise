import Link from 'next/link';
import { CatalogCategory } from '@/lib/catalog';

// Kalyan-style "shop by category" shortcut row: square image tiles with a label.
export default function CategoryTiles({ categories }: { categories: CatalogCategory[] }) {
  const tiles = categories.filter((c) => c.images?.[0]).slice(0, 6);
  if (tiles.length === 0) return null;

  return (
    <section className="section-tight">
      <div className="container">
        <div className="text-center mb-8 reveal">
          <span className="eyebrow justify-center">Browse</span>
          <h2 className="display-big text-ink mt-2 mb-0">Shop By Category</h2>
        </div>
        <div className="grid grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
          {tiles.map((c, i) => (
            <Link
              key={c.slug}
              href={`/shop?category=${c.slug}`}
              className="group reveal-scale text-center"
              style={{ transitionDelay: `${(i % 6) * 0.05}s` }}
            >
              <div className="img-zoom aspect-square overflow-hidden rounded-full border border-line mb-3 bg-cream-dark">
                <img src={c.images[0]} alt={c.name} className="w-full h-full object-cover object-top" />
              </div>
              <div className="font-body font-medium text-[13px] text-ink group-hover:text-maroon transition-colors leading-tight">{c.name}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
