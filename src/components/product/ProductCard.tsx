'use client';

import Link from 'next/link';
import { useState } from 'react';
import { CatalogProduct } from '@/lib/catalog';
import { formatPrice } from '@/lib/utils';
import { useStore } from '@/context/StoreContext';
import { HeartIcon, HeartFilledIcon } from '@/components/ui/Icons';

export default function ProductCard({ product, index = 0, categoryName }: { product: CatalogProduct; index?: number; categoryName?: string }) {
  const { isWished, toggleWishlist, addToCart, showToast } = useStore();
  const [wished, setWished] = useState(false);
  const [pop, setPop] = useState(false);
  const [pulse, setPulse] = useState(false);

  const wishedNow = wished || isWished(product.id);
  const discountPct = product.oldPrice ? Math.round((1 - product.price / product.oldPrice) * 100) : null;
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
      className="reveal-scale group bg-white"
      style={{ transitionDelay: `${(index % 8) * 0.06}s` }}
    >
      <Link href={`/product/${product.id}`} className="relative block h-[360px] overflow-hidden bg-cream-dark img-zoom">
        {product.badge && (
          <span className="absolute top-3 left-3 z-[3] bg-white text-ink text-[10.5px] font-medium tracking-[0.02em] px-2.5 py-1 shadow-sm">
            {product.badge}
          </span>
        )}
        <button
          onClick={handleWishlist}
          aria-label="Toggle wishlist"
          className={`absolute top-2.5 right-2.5 z-[3] w-8 h-8 rounded-full flex items-center justify-center shadow-sm transition-colors ${
            wishedNow ? 'bg-maroon text-white' : 'bg-white/90 text-ink hover:text-maroon'
          } ${pop ? 'animate-heart-pop' : ''}`}
        >
          {wishedNow ? <HeartFilledIcon className="w-[15px] h-[15px]" /> : <HeartIcon className="w-[15px] h-[15px]" />}
        </button>
        {image && (
          <img
            src={image}
            alt={product.name}
            loading="lazy"
            className="w-full h-full object-cover object-top"
          />
        )}
        {discountPct && (
          <div className="absolute top-3 left-3 z-[2] mt-8 bg-success text-white text-[11px] font-semibold px-2.5 py-1">
            {discountPct}% OFF
          </div>
        )}
        {/* Hover-reveal Add to Cart bar sliding up over the image bottom */}
        <div className="absolute inset-x-0 bottom-0 z-[3] translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <button
            onClick={handleAdd}
            className={`btn-primary w-full py-3.5 ${pulse ? 'animate-btn-pulse' : ''}`}
          >
            Add to Cart
          </button>
        </div>
      </Link>

      <div className="pt-3 pb-4">
        <Link href={`/product/${product.id}`}>
          <h4 className="font-body font-normal text-[14px] leading-snug text-ink group-hover:text-maroon transition-colors m-0 line-clamp-2 min-h-[38px]">{product.name}</h4>
        </Link>
        <div className="flex items-baseline gap-2 mt-1.5">
          <span className="font-head font-bold text-[16px] text-ink">{formatPrice(product.price)}</span>
          {product.oldPrice && <span className="line-through text-ink-soft/70 text-[12.5px]">{formatPrice(product.oldPrice)}</span>}
        </div>
        {/* Hover links, Kalyan-style */}
        <div className="mt-2 h-4 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-2 text-[11px] uppercase tracking-[0.04em] text-maroon">
          <Link href={`/product/${product.id}`} className="link-slide font-medium">Shop Now</Link>
          <span className="text-line">|</span>
          <Link href={`/product/${product.id}`} className="link-slide font-medium">Quick View</Link>
        </div>
      </div>
    </div>
  );
}
