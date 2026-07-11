'use client';

import Link from 'next/link';
import { useStore } from '@/context/StoreContext';
import ProductCard from '@/components/product/ProductCard';
import { HeartIcon } from '@/components/ui/Icons';

export default function WishlistPage() {
  const { wishlist, getProduct } = useStore();
  const items = wishlist.map((id) => getProduct(id)).filter((p): p is NonNullable<typeof p> => Boolean(p));

  return (
    <>
      <div className="container pt-7 pb-2">
        <Link href="/shop" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft hover:text-maroon transition-colors">← Back</Link>
      </div>

      <section className="section-tight">
        <div className="container">
          <div className="mb-8 reveal">
            <span className="eyebrow">Saved For Later</span>
            <h1 className="text-3xl mt-3.5 mb-0">Your Wishlist</h1>
          </div>
          {items.length === 0 ? (
            <div className="text-center py-20 reveal">
              <HeartIcon className="w-14 h-14 mx-auto mb-3 text-gold" />
              <h2>Your wishlist is empty</h2>
              <p className="text-ink-soft">Save your favourite sarees here so you never lose track of them.</p>
              <Link href="/shop" className="btn-primary inline-flex px-8 py-3.5">Explore Sarees</Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {items.map((p, i) => <ProductCard key={p.id} product={p} index={i} />)}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
