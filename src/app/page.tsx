import Hero from '@/components/home/Hero';
import Marquee from '@/components/home/Marquee';
import CategoryTiles from '@/components/home/CategoryTiles';
import ShopByOccasion from '@/components/home/ShopByOccasion';
import ShopByPattern from '@/components/home/ShopByPattern';
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

      <CategoryTiles categories={categories} />

      <ShopByOccasion />

      <BentoCategories categories={categories} products={products} />

      <SaleCountdown />

      {/* The Stock — product grid */}
      <section className="section relative bg-white">
        <div className="container relative">
          <div className="text-center mb-10 reveal">
            <span className="eyebrow justify-center">Fresh Off The Loom</span>
            <h2 className="display-big text-ink mt-2 mb-0">This Week&apos;s Stock</h2>
            <p className="section-sub mt-3 mb-0">Shot as-is, no retouching. What you see is what ships.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5">
            {featured.map((p, i) => (
              <ProductCard key={p.id} product={p} index={i} categoryName={categoryName(p.category)} />
            ))}
          </div>
        </div>
      </section>

      <TrustStrip />

      <ShopByPattern />

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
