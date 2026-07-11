import Link from 'next/link';
import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import BentoCategories from '@/components/home/BentoCategories';
import CraftStory from '@/components/home/CraftStory';
import SaleCountdown from '@/components/home/SaleCountdown';
import TrustStrip from '@/components/home/TrustStrip';
import Testimonials from '@/components/home/Testimonials';
import Newsletter from '@/components/home/Newsletter';
import ProductCard from '@/components/product/ProductCard';
import { getActiveCategories, getActiveProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [categories, products] = await Promise.all([getActiveCategories(), getActiveProducts()]);
  const featured = products.slice(0, 8);
  const categoryName = (slug: string) => categories.find((c) => c.slug === slug)?.name;

  return (
    <>
      <Hero products={products} />

      <BentoCategories categories={categories} products={products} />

      <SaleCountdown />

      {/* The Stock — editorial product grid */}
      <section className="section relative" style={{ background: '#FFFCF4' }}>
        <div className="container relative">
          <div className="flex flex-wrap items-end justify-between gap-6 mb-12 reveal">
            <div>
              <span className="eyebrow">Fresh Off The Loom</span>
              <h2 className="display-big text-charcoal mt-3 mb-0">This Week&apos;s Stock</h2>
              <p className="section-sub !mx-0 !text-left mt-4 mb-0">Shot as-is, no retouching. What you see is what ships.</p>
            </div>
            <Link href="/shop" className="link-slide font-mono text-[12px] uppercase tracking-[0.08em] text-maroon mb-2">
              Browse everything →
            </Link>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} categoryName={categoryName(p.category)} />
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />

      <CraftStory image={products[6]?.images[0] || products[0]?.images[0]} />

      <Marquee
        dark={false}
        items={['Kalamkari & Warli Print', 'Bandhani Border', 'Woven Stripe Cotton', 'Real Photos Only', 'Direct From The Source']}
      />

      <Testimonials />
      <Newsletter />
    </>
  );
}
