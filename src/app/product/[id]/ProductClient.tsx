'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CatalogProduct, PRODUCT_DETAILS_EXTRA } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { HeartIcon, HeartFilledIcon, TruckIcon, RefreshIcon, ShieldIcon, CheckIcon } from '@/components/ui/Icons';
import ProductCard from '@/components/product/ProductCard';

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-gold">
      {'★'.repeat(full)}
      {half ? '☆' : ''}
      {'✩'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

const FEATURES = [
  { icon: '📷', label: 'Real Stock Photo', sub: 'Not a stock image' },
  { icon: '🧵', label: 'Handwoven Weave', sub: 'Cotton silk blend' },
  { icon: '🪶', label: 'Lightweight', sub: 'Easy to drape all day' },
  { icon: '🚚', label: 'Ships in 2 Days', sub: 'From our own stock' },
];

export default function ProductClient({ product, related, categoryName }: { product: CatalogProduct; related: CatalogProduct[]; categoryName: string }) {
  const { isWished, toggleWishlist, addToCart, showToast } = useStore();
  const [selectedColor, setSelectedColor] = useState(product.colors[0]?.name || '');
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(isWished(product.id));
  const [pop, setPop] = useState(false);

  const discountPct = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const mainImage = product.images[0];

  function handleWishlist() {
    const active = toggleWishlist(product.id);
    setWished(active);
    setPop(true);
    setTimeout(() => setPop(false), 450);
    showToast(active ? 'Added to wishlist' : 'Removed from wishlist');
  }

  function handleAddToCart() {
    addToCart(product.id, qty, selectedColor);
    showToast(`${qty} × ${product.name} (${selectedColor}) added to cart`);
  }

  return (
    <>
      <div className="container pt-7 pb-2">
        <Link href="/shop" className="inline-flex items-center gap-1.5 font-mono text-[11px] uppercase tracking-[0.06em] text-ink-soft hover:text-maroon transition-colors">← Back</Link>
      </div>

      <section className="section-tight pb-24 md:pb-12">
        <div className="container grid md:grid-cols-2 gap-10">
          <div className="reveal-left">
            <div className="relative aspect-[3/4] arch-frame-subtle border-[3px] border-gold/50 overflow-hidden shadow-custom-sm bg-cream-dark">
              {product.badge && (
                <span className="absolute top-4 left-4 z-[3] bg-maroon text-gold-pale font-mono text-[10px] tracking-[0.06em] px-2.5 py-1.5 uppercase">
                  {product.badge}
                </span>
              )}
              {mainImage && (
                <img src={mainImage} alt={product.name} className="w-full h-full object-cover object-top" />
              )}
            </div>
            <p className="font-mono text-[10.5px] text-ink-soft mt-3 text-center">This is the exact piece — photographed as-is, no retouching.</p>
          </div>

          <div className="reveal-right">
            <span className="eyebrow">{categoryName}</span>
            <h1 className="text-3xl mt-3.5 mb-2.5">{product.name}</h1>
            <div className="flex items-center gap-2 mb-3 text-sm">
              <Stars rating={product.rating} /> <span className="font-mono text-[11.5px] text-ink-soft">{product.rating} ({product.reviews} reviews)</span>
            </div>
            <div className="flex items-baseline gap-3 mb-5">
              <span className="font-bold text-maroon-dark text-2xl">{formatPrice(product.price)}</span>
              {product.oldPrice && (
                <>
                  <span className="line-through text-[#b3a294]">{formatPrice(product.oldPrice)}</span>
                  <span className="bg-[#fdeee0] text-maroon font-mono text-[11px] font-bold px-2.5 py-1">{discountPct}% OFF</span>
                </>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6">
              {FEATURES.map((f) => (
                <div key={f.label} className="flex items-center gap-2.5 border border-line bg-white px-3 py-2.5">
                  <span className="text-lg leading-none">{f.icon}</span>
                  <div>
                    <div className="text-[12px] font-semibold text-charcoal leading-tight">{f.label}</div>
                    <div className="font-mono text-[9.5px] text-ink-soft leading-tight mt-0.5">{f.sub}</div>
                  </div>
                </div>
              ))}
            </div>

            <p className="text-ink-soft mb-5">{product.desc}</p>

            {product.colors.length > 0 && (
              <div className="mb-5">
                <label className="block font-mono text-[11px] uppercase tracking-[0.08em] text-gold-deep mb-2.5">Colour: {selectedColor}</label>
                <div className="flex gap-2.5">
                  {product.colors.map((c) => (
                    <button
                      key={c.name}
                      onClick={() => setSelectedColor(c.name)}
                      style={{ background: c.hex }}
                      className={`w-[36px] h-[36px] border-2 ${selectedColor === c.name ? 'border-maroon' : 'border-white shadow-[0_0_0_1px_#e4d5bd]'}`}
                      aria-label={c.name}
                    />
                  ))}
                </div>
              </div>
            )}

            <div className="mb-6">
              <label className="block font-mono text-[11px] uppercase tracking-[0.08em] text-gold-deep mb-2.5">Quantity</label>
              <div className="inline-flex items-center border border-line overflow-hidden">
                <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark">−</button>
                <span className="w-10 text-center font-semibold">{qty}</span>
                <button onClick={() => setQty((q) => Math.min(10, q + 1))} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark">+</button>
              </div>
            </div>

            <div className="hidden md:flex gap-3 mb-6">
              <button
                onClick={handleWishlist}
                aria-label="Toggle wishlist"
                className={`w-[52px] shrink-0 border flex items-center justify-center transition-colors ${
                  wished ? 'bg-maroon border-maroon text-white' : 'border-line text-maroon hover:border-maroon'
                } ${pop ? 'animate-heart-pop' : ''}`}
              >
                {wished ? <HeartFilledIcon className="w-[18px] h-[18px]" /> : <HeartIcon className="w-[18px] h-[18px]" />}
              </button>
              <button onClick={handleAddToCart} className="btn-primary flex-1 py-3.5">
                Add to Cart — {formatPrice(product.price)}
              </button>
              <Link href="/cart" onClick={handleAddToCart} className="btn-outline px-6 py-3.5 whitespace-nowrap">
                Buy Now
              </Link>
            </div>

            <div className="border-t border-line pt-4 text-sm text-ink-soft space-y-2.5">
              <div className="flex gap-2 items-center"><TruckIcon className="w-4 h-4 shrink-0" /> Free shipping on orders above ₹2,999</div>
              <div className="flex gap-2 items-center"><RefreshIcon className="w-4 h-4 shrink-0" /> Easy 7-day returns &amp; exchange</div>
              <div className="flex gap-2 items-center"><ShieldIcon className="w-4 h-4 shrink-0" /> 100% authentic, hand-checked before dispatch</div>
            </div>
          </div>
        </div>

        <div className="container mt-14">
          <div className="grid md:grid-cols-[1fr_1fr] gap-8">
            <div className="border border-line bg-white p-6">
              <h3 className="font-head text-lg mt-0 mb-4">Product Details</h3>
              <ul className="space-y-3">
                {PRODUCT_DETAILS_EXTRA.details.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm text-ink-soft">
                    <CheckIcon className="w-4 h-4 shrink-0 text-gold-deep mt-0.5" /> {d}
                  </li>
                ))}
              </ul>
            </div>
            <div className="border border-line bg-white p-6">
              <h3 className="font-head text-lg mt-0 mb-4">Care Instructions</h3>
              <ul className="space-y-3">
                {PRODUCT_DETAILS_EXTRA.care.map((d) => (
                  <li key={d} className="flex gap-2.5 text-sm text-ink-soft">
                    <CheckIcon className="w-4 h-4 shrink-0 text-gold-deep mt-0.5" /> {d}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="section bg-white border-t border-line">
          <div className="container">
            <div className="section-head reveal max-w-[640px] mx-auto text-center mb-14">
              <span className="eyebrow justify-center">Complete The Look</span>
              <h2 className="mt-3.5">You May Also Like</h2>
              <div className="grow-line" />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {related.map((p, i) => <ProductCard key={p.id} product={p} index={i} categoryName={categoryName} />)}
            </div>
          </div>
        </section>
      )}

      {/* Sticky mobile buy bar */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gold/40 shadow-[0_-6px_20px_rgba(0,0,0,0.08)] px-4 py-3 flex items-center gap-3">
        <div className="shrink-0">
          <div className="font-bold text-maroon-dark text-[17px] leading-none">{formatPrice(product.price)}</div>
          {product.oldPrice && <div className="line-through text-[11px] text-ink-soft mt-0.5">{formatPrice(product.oldPrice)}</div>}
        </div>
        <button onClick={handleAddToCart} className="btn-primary flex-1 py-3">Add to Cart</button>
      </div>
    </>
  );
}
