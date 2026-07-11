'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CatalogProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { HeartIcon, HeartFilledIcon } from '@/components/ui/Icons';

function Stars({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.5;
  return (
    <span className="text-gold-deep text-[12.5px] tracking-tight">
      {'★'.repeat(full)}
      {half ? '☆' : ''}
      {'✩'.repeat(5 - full - (half ? 1 : 0))}
    </span>
  );
}

function socialProof(product: CatalogProduct): string | null {
  if (product.badge === 'Sale') return `Only ${2 + (product.id % 8)} left in stock`;
  if (product.badge === 'Bestseller') return `Bought by ${30 + (product.id % 40)} customers this week`;
  if (product.badge === 'New') return `${8 + (product.id % 20)} customers viewing now`;
  return null;
}

export default function ProductCard({ product, index = 0, categoryName }: { product: CatalogProduct; index?: number; categoryName?: string }) {
  const { isWished, toggleWishlist, addToCart, showToast } = useStore();
  const [wished, setWished] = useState(false);
  const [pop, setPop] = useState(false);
  const [pulse, setPulse] = useState(false);

  const wishedNow = wished || isWished(product.id);
  const discountPct = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
  const proof = socialProof(product);
  const image = product.images[0];

  function handleWishlist(e: React.MouseEvent) {
    e.preventDefault();
    const active = toggleWishlist(product.id);
    setWished(active);
    setPop(true);
    setTimeout(() => setPop(false), 450);
    showToast(active ? 'Added to wishlist' : 'Removed from wishlist');
  }

  function handleAdd(e?: React.MouseEvent) {
    e?.preventDefault();
    addToCart(product.id, 1, null);
    setPulse(true);
    setTimeout(() => setPulse(false), 400);
    showToast(`${product.name} added to cart`);
  }

  return (
    <div
      className="reveal-scale group bg-white border border-line hover:border-gold/70 transition-colors"
      style={{ transitionDelay: `${(index % 8) * 0.06}s` }}
    >
      <Link href={`/product/${product.id}`} className="relative block h-[280px] overflow-hidden bg-cream-dark img-zoom">
        {product.badge && (
          <span className="absolute top-3 left-3 z-[3] bg-maroon text-gold-pale font-mono text-[10px] tracking-[0.06em] px-2.5 py-1.5 uppercase">
            {product.badge}
          </span>
        )}
        {image && (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        )}
        {discountPct && (
          <div className="absolute bottom-3 left-3 z-[3] bg-white/95 text-maroon text-[11px] font-bold px-2.5 py-1">
            {discountPct}% OFF
          </div>
        )}
      </Link>

      <div className="px-4 pt-4 pb-5">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-mono text-[9.5px] uppercase tracking-[0.12em] text-gold-deep mb-1">
              {categoryName || product.category}
            </div>
            <Link href={`/product/${product.id}`}>
              <h4 className="font-head text-[19px] tracking-[0.04em] leading-tight text-charcoal group-hover:text-maroon transition-colors m-0">{product.name}</h4>
            </Link>
          </div>
          <button
            onClick={handleWishlist}
            aria-label="Toggle wishlist"
            className={`w-8 h-8 shrink-0 border flex items-center justify-center transition-colors ${
              wishedNow ? 'bg-maroon border-maroon text-white' : 'border-line text-maroon hover:border-maroon'
            } ${pop ? 'animate-heart-pop' : ''}`}
          >
            {wishedNow ? <HeartFilledIcon className="w-[14px] h-[14px]" /> : <HeartIcon className="w-[14px] h-[14px]" />}
          </button>
        </div>

        <div className="flex items-center gap-1.5 mt-2">
          <Stars rating={product.rating} />
          <span className="text-[10.5px] font-mono text-charcoal/55">{product.rating} ({product.reviews})</span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-line">
          <div className="flex items-baseline gap-2">
            <span className="font-anton text-[18px] text-maroon">{formatPrice(product.price)}</span>
            {product.oldPrice && <span className="line-through text-charcoal/40 text-[12px]">{formatPrice(product.oldPrice)}</span>}
          </div>
          <div className="flex items-center gap-2">
            {product.colors.slice(0, 4).map((c) => (
              <span key={c.name} className="w-3 h-3 rounded-full ring-1 ring-black/10" style={{ background: c.hex }} title={c.name} />
            ))}
          </div>
        </div>

        {proof && <div className="mt-2.5 font-mono text-[10px] text-charcoal/55">{proof}</div>}

        <button
          onClick={() => handleAdd()}
          className={`btn-primary w-full py-3 mt-4 ${pulse ? 'animate-btn-pulse' : ''}`}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
