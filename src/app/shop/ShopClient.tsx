'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { CatalogCategory, CatalogProduct } from '@/lib/catalog';
import ProductCard from '@/components/product/ProductCard';
import { CloseIcon, SlidersIcon } from '@/components/ui/Icons';
import FilterPanel, { PRICE_RANGES } from '@/components/shop/FilterPanel';
import FilterDrawer from '@/components/shop/FilterDrawer';

type SortKey = 'featured' | 'price-asc' | 'price-desc' | 'rating' | 'name';

export default function ShopClient({ categories: CATEGORIES, products: PRODUCTS }: { categories: CatalogCategory[]; products: CatalogProduct[] }) {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get('category');
  const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);
  const bannerImage = PRODUCTS[0]?.images[0];

  const [categories, setCategories] = useState<string[]>(initialCategory ? [initialCategory] : []);
  const [price, setPrice] = useState('all');
  const [search, setSearch] = useState('');
  const [onSale, setOnSale] = useState(false);
  const [onlyNew, setOnlyNew] = useState(false);
  const [sort, setSort] = useState<SortKey>('featured');
  const [drawerOpen, setDrawerOpen] = useState(false);

  function toggleCategory(slug: string) {
    setCategories((prev) => (prev.includes(slug) ? prev.filter((c) => c !== slug) : [...prev, slug]));
  }

  function clearFilters() {
    setCategories([]);
    setPrice('all');
    setSearch('');
    setOnSale(false);
    setOnlyNew(false);
    setSort('featured');
  }

  const filtered = useMemo(() => {
    let items = PRODUCTS.slice();

    if (categories.length) items = items.filter((p) => categories.includes(p.category));
    if (price !== 'all') {
      const [min, max] = price.split('-').map(Number);
      items = items.filter((p) => p.price >= min && p.price <= max);
    }
    if (onSale) items = items.filter((p) => p.badge === 'Sale' || p.oldPrice);
    if (onlyNew) items = items.filter((p) => p.badge === 'New');
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      items = items.filter((p) => p.name.toLowerCase().includes(q) || p.category.includes(q));
    }

    switch (sort) {
      case 'price-asc': items.sort((a, b) => a.price - b.price); break;
      case 'price-desc': items.sort((a, b) => b.price - a.price); break;
      case 'rating': items.sort((a, b) => b.rating - a.rating); break;
      case 'name': items.sort((a, b) => a.name.localeCompare(b.name)); break;
      default: break;
    }

    return items;
  }, [categories, price, onSale, onlyNew, search, sort]);

  const activePriceLabel = PRICE_RANGES.find((r) => r.value === price)?.label;
  const activeFilterCount = categories.length + (price !== 'all' ? 1 : 0) + (onSale ? 1 : 0) + (onlyNew ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || search.trim() !== '';

  const filterPanelProps = { allCategories: CATEGORIES, categories, toggleCategory, price, setPrice, onSale, setOnSale, onlyNew, setOnlyNew, clearFilters };

  return (
    <>
      {/* Editorial banner */}
      <section className="relative py-14 md:py-16 overflow-hidden" style={{ background: 'linear-gradient(155deg, #671420 0%, #8B1D2C 55%, #671420 100%)' }}>
        <div className="relative container flex flex-col items-center justify-center text-center text-white">
          <div className="eyebrow-light">The Full Collection</div>
          <h1 className="font-head text-4xl md:text-5xl text-white mb-2">Shop All Sarees</h1>
          <p className="text-white/85 max-w-md">Real stock, real photos — every saree here is what we actually have on hand.</p>
        </div>
      </section>

      {/* Category quick-select pills */}
      <div className="container pt-5 pb-3">
        <div className="flex gap-2.5 overflow-x-auto pb-1 no-scrollbar">
          <button
            onClick={() => setCategories([])}
            className={`shrink-0 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.06em] border transition-colors ${
              categories.length === 0 ? 'bg-maroon text-white border-maroon' : 'bg-white border-line text-ink hover:border-maroon'
            }`}
          >
            All
          </button>
          {CATEGORIES.map((c) => (
            <button
              key={c.slug}
              onClick={() => toggleCategory(c.slug)}
              className={`shrink-0 px-4 py-2 font-mono text-[11px] uppercase tracking-[0.06em] border transition-colors ${
                categories.includes(c.slug) ? 'bg-maroon text-white border-maroon' : 'bg-white border-line text-ink hover:border-maroon'
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>
      </div>

      <section className="section-tight !pt-2">
        <div className="container grid md:grid-cols-[260px_1fr] gap-9 items-start">
          <aside className="hidden md:block sticky top-24">
            <FilterPanel {...filterPanelProps} />
          </aside>

          <div>
            <div className="flex gap-2.5 mb-5">
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search sarees by name..."
                className="flex-1 px-3.5 py-2.5 border border-line"
              />
              <button
                onClick={() => setDrawerOpen(true)}
                className="md:hidden relative shrink-0 w-11 h-11 border border-line bg-white flex items-center justify-center"
                aria-label="Open filters"
              >
                <SlidersIcon className="w-5 h-5 text-maroon" />
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 bg-maroon text-white text-[11px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-cream">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>

            {hasActiveFilters && (
              <div className="flex flex-wrap items-center gap-2 mb-5">
                {categories.map((slug) => (
                  <button
                    key={slug}
                    onClick={() => toggleCategory(slug)}
                    className="flex items-center gap-1.5 bg-cream-dark text-ink-soft font-mono text-[10.5px] uppercase tracking-[0.04em] pl-3 pr-2 py-1.5 hover:bg-line"
                  >
                    {categoryBySlug(slug)?.name} <CloseIcon className="w-3 h-3" />
                  </button>
                ))}
                {price !== 'all' && (
                  <button onClick={() => setPrice('all')} className="flex items-center gap-1.5 bg-cream-dark text-ink-soft font-mono text-[10.5px] uppercase tracking-[0.04em] pl-3 pr-2 py-1.5 hover:bg-line">
                    {activePriceLabel} <CloseIcon className="w-3 h-3" />
                  </button>
                )}
                {onSale && (
                  <button onClick={() => setOnSale(false)} className="flex items-center gap-1.5 bg-cream-dark text-ink-soft font-mono text-[10.5px] uppercase tracking-[0.04em] pl-3 pr-2 py-1.5 hover:bg-line">
                    On Sale <CloseIcon className="w-3 h-3" />
                  </button>
                )}
                {onlyNew && (
                  <button onClick={() => setOnlyNew(false)} className="flex items-center gap-1.5 bg-cream-dark text-ink-soft font-mono text-[10.5px] uppercase tracking-[0.04em] pl-3 pr-2 py-1.5 hover:bg-line">
                    New Arrivals <CloseIcon className="w-3 h-3" />
                  </button>
                )}
                {search.trim() && (
                  <button onClick={() => setSearch('')} className="flex items-center gap-1.5 bg-cream-dark text-ink-soft font-mono text-[10.5px] uppercase tracking-[0.04em] pl-3 pr-2 py-1.5 hover:bg-line">
                    &ldquo;{search}&rdquo; <CloseIcon className="w-3 h-3" />
                  </button>
                )}
                <button onClick={clearFilters} className="font-mono text-[10.5px] uppercase tracking-[0.04em] text-maroon underline ml-1">Clear all</button>
              </div>
            )}

            <div className="flex justify-between items-center flex-wrap gap-3 mb-6">
              <div className="font-mono text-[11px] uppercase tracking-[0.04em] text-ink-soft">{filtered.length} saree{filtered.length !== 1 ? 's' : ''} found</div>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as SortKey)}
                className="px-3.5 py-2 border border-line bg-white font-mono text-[11px] uppercase tracking-[0.04em]"
              >
                <option value="featured">Sort by: Featured</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="name">Name: A–Z</option>
              </select>
            </div>

            {filtered.length === 0 ? (
              <div className="text-center py-16 text-ink-soft">
                <h3>No sarees found</h3>
                <p>Try adjusting your filters or search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                {filtered.map((p, i) => (
                  <ProductCard key={p.id} product={p} index={i} categoryName={categoryBySlug(p.category)?.name} />
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      <FilterDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} resultCount={filtered.length} {...filterPanelProps} />

      <style jsx>{`
        .eyebrow-light {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          font-size: 0.78rem;
          letter-spacing: 2.5px;
          text-transform: uppercase;
          color: #e6c866;
          font-weight: 600;
          margin-bottom: 10px;
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          scrollbar-width: none;
        }
      `}</style>
    </>
  );
}