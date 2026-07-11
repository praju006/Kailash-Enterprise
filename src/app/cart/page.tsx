'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useStore, PROMO_CODES } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { MinusIcon, PlusIcon, BagIcon } from '@/components/ui/Icons';

const FREE_SHIP_THRESHOLD = 2999;
const SHIP_COST = 99;

export default function CartPage() {
  const { cart, updateQty, removeFromCart, promo, applyPromo, clearPromo, showToast, getProduct } = useStore();
  const [promoInput, setPromoInput] = useState(promo || '');

  const subtotal = cart.reduce((sum, i) => {
    const p = getProduct(i.id);
    return p ? sum + p.price * i.qty : sum;
  }, 0);
  const discount = promo && PROMO_CODES[promo] ? Math.round(subtotal * PROMO_CODES[promo]) : 0;
  const shipping = subtotal === 0 ? 0 : subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
  const total = subtotal - discount + shipping;

  function handleApplyPromo() {
    const code = promoInput.trim();
    if (!code) {
      clearPromo();
      return;
    }
    if (applyPromo(code)) {
      showToast(`Promo code ${code.toUpperCase()} applied!`);
    } else {
      showToast('Invalid promo code');
    }
  }

  return (
    <section className="section-tight">
      <div className="container">
        <div className="mb-6 sm:mb-8 reveal">
          <span className="eyebrow">Your Selection</span>
          <h1 className="text-2xl sm:text-3xl mt-3.5 mb-0">Your Shopping Cart</h1>
        </div>

        {cart.length === 0 ? (
          <div className="text-center py-16 sm:py-20 reveal">
            <BagIcon className="w-14 h-14 mx-auto mb-3 text-gold" />
            <h2>Your cart is empty</h2>
            <p className="text-ink-soft">Looks like you haven&apos;t added any sarees yet. Explore our collection and find your perfect drape.</p>
            <Link href="/shop" className="btn-primary inline-flex px-8 py-3.5">Continue Shopping</Link>
          </div>
        ) : (
          <div className="grid lg:grid-cols-[1fr_340px] gap-6 lg:gap-8 items-start reveal">
            <div>
              {/* Mobile: stacked item cards */}
              <div className="md:hidden space-y-3">
                {cart.map((item) => {
                  const p = getProduct(item.id);
                  if (!p) return null;
                  return (
                    <div key={`${item.id}-${item.color}`} className="flex gap-3.5 bg-white border border-line p-3">
                      <Link href={`/product/${p.id}`} className="w-[84px] h-[104px] overflow-hidden shrink-0 border border-line">
                        <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-top" />
                      </Link>
                      <div className="flex-1 min-w-0 flex flex-col">
                        <Link href={`/product/${p.id}`} className="font-head text-maroon-dark leading-snug">{p.name}</Link>
                        <div className="font-mono text-[10.5px] text-ink-soft mt-0.5">Colour: {item.color || 'Default'}</div>
                        <div className="font-bold text-maroon-dark text-sm mt-1">{formatPrice(p.price * item.qty)}</div>
                        <div className="mt-auto pt-2 flex items-center justify-between gap-2">
                          <div className="inline-flex items-center border border-line overflow-hidden">
                            <button aria-label="Decrease quantity" onClick={() => updateQty(item.id, item.color, item.qty - 1)} className="w-10 h-10 flex items-center justify-center hover:bg-cream-dark">
                              <MinusIcon className="w-3.5 h-3.5" />
                            </button>
                            <span className="w-9 text-center font-semibold">{item.qty}</span>
                            <button aria-label="Increase quantity" onClick={() => updateQty(item.id, item.color, item.qty + 1)} className="w-10 h-10 flex items-center justify-center hover:bg-cream-dark">
                              <PlusIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <button onClick={() => removeFromCart(item.id, item.color)} className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-maroon underline">Remove</button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop: table */}
              <div className="hidden md:block overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold-deep border-b border-line">
                      <th className="pb-3.5">Product</th>
                      <th className="pb-3.5">Price</th>
                      <th className="pb-3.5">Quantity</th>
                      <th className="pb-3.5">Subtotal</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cart.map((item) => {
                      const p = getProduct(item.id);
                      if (!p) return null;
                      return (
                        <tr key={`${item.id}-${item.color}`} className="border-b border-line">
                          <td className="py-4.5 pr-2">
                            <div className="flex gap-4 items-center">
                              <Link href={`/product/${p.id}`} className="w-[78px] h-[96px] overflow-hidden shrink-0 border border-line">
                                <img src={p.images[0]} alt={p.name} className="w-full h-full object-cover object-top" />
                              </Link>
                              <div>
                                <Link href={`/product/${p.id}`} className="font-head text-maroon-dark block mb-1">{p.name}</Link>
                                <div className="font-mono text-[10.5px] text-ink-soft">Colour: {item.color || 'Default'}</div>
                                <button onClick={() => removeFromCart(item.id, item.color)} className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-maroon underline mt-1.5">Remove</button>
                              </div>
                            </div>
                          </td>
                          <td className="py-4.5">{formatPrice(p.price)}</td>
                          <td className="py-4.5">
                            <div className="inline-flex items-center border border-line overflow-hidden">
                              <button aria-label="Decrease quantity" onClick={() => updateQty(item.id, item.color, item.qty - 1)} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark">
                                <MinusIcon className="w-3.5 h-3.5" />
                              </button>
                              <span className="w-9 text-center font-semibold">{item.qty}</span>
                              <button aria-label="Increase quantity" onClick={() => updateQty(item.id, item.color, item.qty + 1)} className="w-9 h-9 flex items-center justify-center hover:bg-cream-dark">
                                <PlusIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                          <td className="py-4.5 font-bold text-maroon-dark">{formatPrice(p.price * item.qty)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="bg-white border border-gold/40 p-5 sm:p-6 shadow-custom-sm lg:sticky lg:top-24">
              <h3 className="mt-0 font-head">Order Summary</h3>
              <div className="flex justify-between mb-3 text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
              {discount > 0 && (
                <div className="flex justify-between mb-3 text-sm text-success"><span>Discount ({promo})</span><span>−{formatPrice(discount)}</span></div>
              )}
              <div className="flex justify-between mb-3 text-sm"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
              <div className="flex justify-between font-bold text-lg text-maroon-dark border-t border-line pt-3.5 mt-3.5">
                <span>Total</span><span>{formatPrice(total)}</span>
              </div>

              <div className="flex gap-2 my-4">
                <input
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Promo code"
                  className="flex-1 min-w-0 px-3 py-2.5 border border-line text-sm"
                />
                <button onClick={handleApplyPromo} className="btn-outline px-4 text-[10.5px]">Apply</button>
              </div>
              <p className="text-xs text-ink-soft -mt-2 mb-4">Try <strong>SAREE10</strong> or <strong>WELCOME15</strong></p>

              <Link href="/checkout" className="btn-primary w-full py-3.5 mb-2.5">Proceed to Checkout</Link>
              <Link href="/shop" className="btn-outline w-full py-3.5">Continue Shopping</Link>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
