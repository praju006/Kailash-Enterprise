'use client';

import Link from 'next/link';
import Image from 'next/image';
import { FormEvent, useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { useStore, PROMO_CODES } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { BagIcon, CheckIcon } from '@/components/ui/Icons';

const FREE_SHIP_THRESHOLD = 2999;
const SHIP_COST = 99;
const UPI_VPA = process.env.NEXT_PUBLIC_UPI_VPA || '';
const UPI_PAYEE_NAME = process.env.NEXT_PUBLIC_UPI_PAYEE_NAME || 'Kailash Enterprises';

interface FormState {
  fullname: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
}

const EMPTY_FORM: FormState = { fullname: '', email: '', phone: '', address: '', city: '', state: '', pincode: '' };

const VALIDATORS: Record<keyof FormState, (v: string) => boolean> = {
  fullname: (v) => v.trim().length >= 3,
  email: (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v),
  phone: (v) => /^[0-9]{10}$/.test(v),
  address: (v) => v.trim().length >= 5,
  city: (v) => v.trim().length >= 2,
  state: (v) => v.trim().length >= 2,
  pincode: (v) => /^[0-9]{6}$/.test(v),
};

export default function CheckoutPage() {
  const { cart, promo, clearCart, clearPromo, showToast, getProduct, profile, saveProfile, addOrder } = useStore();
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [prefilled, setPrefilled] = useState(false);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, boolean>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [qrDataUrl, setQrDataUrl] = useState('');
  const [pendingOrder, setPendingOrder] = useState<{ number: string; total: number; name: string } | null>(null);
  const [order, setOrder] = useState<{ number: string; total: number; eta: string; name: string } | null>(null);

  // Prefill shipping details from the saved profile (once, without clobbering typed input).
  useEffect(() => {
    if (prefilled) return;
    if (!profile.name && !profile.email && !profile.address) return;
    setForm((f) => ({
      fullname: f.fullname || profile.name,
      email: f.email || profile.email,
      phone: f.phone || profile.phone,
      address: f.address || profile.address,
      city: f.city || profile.city,
      state: f.state || profile.state,
      pincode: f.pincode || profile.pincode,
    }));
    setPrefilled(true);
  }, [profile, prefilled]);

  const subtotal = cart.reduce((sum, i) => {
    const p = getProduct(i.id);
    return p ? sum + p.price * i.qty : sum;
  }, 0);
  const discount = promo && PROMO_CODES[promo] ? Math.round(subtotal * PROMO_CODES[promo]) : 0;
  const shipping = subtotal === 0 ? 0 : subtotal - discount >= FREE_SHIP_THRESHOLD ? 0 : SHIP_COST;
  const total = subtotal - discount + shipping;

  function updateField(field: keyof FormState, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  function validateField(field: keyof FormState, value: string) {
    const valid = VALIDATORS[field](value);
    setErrors((e) => ({ ...e, [field]: !valid }));
    return valid;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    let allValid = true;
    (Object.keys(VALIDATORS) as (keyof FormState)[]).forEach((field) => {
      if (!validateField(field, form[field])) allValid = false;
    });
    if (!allValid) {
      showToast('Please fix the highlighted fields.');
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: form.fullname,
          email: form.email,
          phone: form.phone,
          address: form.address,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          paymentMethod: 'upi',
          promoCode: promo,
          items: cart.map((i) => ({ id: i.id, qty: i.qty, color: i.color })),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        showToast(data.error || 'Could not place order. Please try again.');
        setSubmitting(false);
        return;
      }

      const data = await res.json();

      // Remember this order and the shipping details in the user's profile.
      addOrder({ orderNumber: data.orderNumber, total: data.total, placedAt: new Date().toISOString(), email: form.email });
      saveProfile({
        name: form.fullname,
        email: form.email,
        phone: form.phone,
        address: form.address,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
      });

      if (!UPI_VPA) {
        // No UPI ID configured — fall back to a saved order the store will follow up on.
        const eta = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
        setOrder({ number: data.orderNumber, total: data.total, eta, name: form.fullname });
        clearCart();
        clearPromo();
        setSubmitting(false);
        return;
      }

      const upiUri = `upi://pay?pa=${encodeURIComponent(UPI_VPA)}&pn=${encodeURIComponent(UPI_PAYEE_NAME)}&am=${data.total}&cu=INR&tn=${encodeURIComponent('Order ' + data.orderNumber)}`;
      const dataUrl = await QRCode.toDataURL(upiUri, { width: 320, margin: 1, color: { dark: '#3a2a1a', light: '#ffffff' } });
      setQrDataUrl(dataUrl);
      setPendingOrder({ number: data.orderNumber, total: data.total, name: form.fullname });
      clearCart();
      clearPromo();
    } catch {
      showToast('Network error — please check your connection and try again.');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleConfirmPayment() {
    if (!pendingOrder) return;
    setConfirming(true);
    try {
      await fetch(`/api/orders/${pendingOrder.number}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'awaiting_verification' }),
      });
    } catch {
      // Non-fatal — the order already exists; the store can still verify manually.
    }
    const eta = new Date(Date.now() + 6 * 24 * 60 * 60 * 1000).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' });
    setOrder({ number: pendingOrder.number, total: pendingOrder.total, eta, name: pendingOrder.name });
    setConfirming(false);
  }

  if (order) {
    return (
      <div className="container max-w-xl mx-auto text-center py-10 sm:py-16">
        <div className="w-[84px] h-[84px] rounded-full bg-success text-white flex items-center justify-center mx-auto mb-5">
          <CheckIcon className="w-9 h-9" />
        </div>
        <span className="eyebrow justify-center flex">Order Confirmed</span>
        <h1 className="mt-3.5">Thank you, {order.name.split(' ')[0]}!</h1>
        <p className="text-ink-soft">Your order has been placed. We&apos;ll confirm your payment and get it ready to ship.</p>
        <div className="bg-white border border-gold/40 p-5 sm:p-6 shadow-custom-sm text-left my-6">
          <div className="flex justify-between mb-3 text-sm"><span>Order Number</span><span className="font-bold font-mono">{order.number}</span></div>
          <div className="flex justify-between mb-3 text-sm"><span>Payment Method</span><span>UPI</span></div>
          <div className="flex justify-between mb-3 text-sm"><span>Estimated Delivery</span><span>{order.eta}</span></div>
          <div className="flex justify-between font-bold text-lg text-maroon-dark border-t border-line pt-3.5"><span>Amount</span><span>{formatPrice(order.total)}</span></div>
        </div>
        <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
          <Link href={`/track?order=${order.number}`} className="btn-primary inline-flex px-8 py-3.5">Track Order</Link>
          <Link href="/profile" className="btn-outline inline-flex px-8 py-3.5">View My Orders</Link>
          <Link href="/shop" className="btn-outline inline-flex px-8 py-3.5">Continue Shopping</Link>
        </div>
      </div>
    );
  }

  if (pendingOrder && qrDataUrl) {
    return (
      <div className="container max-w-lg mx-auto text-center py-10 sm:py-16">
        <span className="eyebrow justify-center flex">Order {pendingOrder.number}</span>
        <h1 className="mt-3.5">Scan to Pay</h1>
        <p className="text-ink-soft">Scan this code with any UPI app (GPay, PhonePe, Paytm) to pay <strong>{formatPrice(pendingOrder.total)}</strong>.</p>

        <div className="bg-white border-2 border-gold/50 p-4 sm:p-6 shadow-custom my-6 inline-block max-w-full">
          <Image src={qrDataUrl} alt="UPI payment QR code" width={280} height={280} className="mx-auto w-full max-w-[280px] h-auto" unoptimized />
          <div className="mt-4 text-sm text-ink-soft">Paying <span className="font-semibold text-ink">{UPI_PAYEE_NAME}</span></div>
          <div className="font-mono text-xs text-ink-soft mt-1">{UPI_VPA}</div>
          <div className="font-head text-2xl font-bold text-maroon-dark mt-2">{formatPrice(pendingOrder.total)}</div>
        </div>

        <p className="text-xs text-ink-soft mb-5">Trouble scanning? Open your UPI app and pay {UPI_VPA} directly, using order number {pendingOrder.number} as the note.</p>

        <button onClick={handleConfirmPayment} disabled={confirming} className="btn-primary w-full py-3.5 disabled:opacity-60">
          {confirming ? 'Confirming…' : "I've Completed the Payment"}
        </button>
        <p className="text-xs text-ink-soft mt-3">We&apos;ll verify your payment and confirm your order shortly after.</p>
      </div>
    );
  }

  if (cart.length === 0) {
    return (
      <div className="container text-center py-16 sm:py-20">
        <BagIcon className="w-14 h-14 mx-auto mb-3 text-gold" />
        <h2>Your cart is empty</h2>
        <p className="text-ink-soft">Add a few sarees to your cart before checking out.</p>
        <Link href="/shop" className="btn-primary inline-flex px-8 py-3.5">Continue Shopping</Link>
      </div>
    );
  }

  const fields: {
    key: keyof FormState;
    label: string;
    type: string;
    full?: boolean;
    error: string;
    autoComplete?: string;
    inputMode?: 'numeric' | 'tel' | 'email';
    maxLength?: number;
  }[] = [
    { key: 'fullname', label: 'Full Name *', type: 'text', full: true, error: 'Please enter your full name.', autoComplete: 'name' },
    { key: 'email', label: 'Email Address *', type: 'email', error: 'Please enter a valid email address.', autoComplete: 'email', inputMode: 'email' },
    { key: 'phone', label: 'Phone Number *', type: 'tel', error: 'Please enter a valid 10-digit phone number.', autoComplete: 'tel', inputMode: 'tel', maxLength: 10 },
    { key: 'address', label: 'Address *', type: 'text', full: true, error: 'Please enter your address.', autoComplete: 'street-address' },
    { key: 'city', label: 'City *', type: 'text', error: 'Please enter your city.', autoComplete: 'address-level2' },
    { key: 'state', label: 'State *', type: 'text', error: 'Please enter your state.', autoComplete: 'address-level1' },
    { key: 'pincode', label: 'Pincode *', type: 'text', error: 'Please enter a valid 6-digit pincode.', autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 },
  ];

  return (
    <section className="section-tight">
      <div className="container">
        <div className="mb-6 sm:mb-8 reveal">
          <span className="eyebrow">Almost There</span>
          <h1 className="text-2xl sm:text-3xl mt-3.5 mb-0">Checkout</h1>
        </div>
        <div className="grid lg:grid-cols-[1.5fr_1fr] gap-6 lg:gap-10 items-start reveal">
          <form onSubmit={handleSubmit} noValidate className="order-2 lg:order-1">
            <h3 className="font-head">Shipping Details</h3>
            <div className="grid sm:grid-cols-2 gap-4">
              {fields.map((f) => (
                <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                  <label htmlFor={f.key} className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">{f.label}</label>
                  <input
                    id={f.key}
                    name={f.key}
                    type={f.type}
                    autoComplete={f.autoComplete}
                    inputMode={f.inputMode}
                    maxLength={f.maxLength}
                    value={form[f.key]}
                    onChange={(e) => updateField(f.key, e.target.value)}
                    onBlur={(e) => validateField(f.key, e.target.value)}
                    className={`w-full px-3.5 py-3 border bg-white text-base focus:outline-none focus:ring-2 focus:ring-gold ${errors[f.key] ? 'border-maroon' : 'border-line'}`}
                  />
                  {errors[f.key] && <div className="text-maroon text-xs mt-1">{f.error}</div>}
                </div>
              ))}
            </div>

            <div className="mt-7 flex items-center gap-3 border border-gold/40 p-4" style={{ background: '#FBF3DF' }}>
              <div className="w-10 h-10 rounded-full bg-white border border-gold flex items-center justify-center shrink-0 font-bold text-maroon">₹</div>
              <div className="text-sm">
                <div className="font-semibold">Pay via UPI QR Code</div>
                <div className="text-ink-soft text-xs">Scan with GPay, PhonePe, Paytm or any UPI app after placing your order.</div>
              </div>
            </div>

            <button type="submit" disabled={submitting} className="btn-primary w-full py-3.5 mt-6 disabled:opacity-60">
              {submitting ? 'Placing Order…' : 'Continue to Payment'}
            </button>
          </form>

          <div className="bg-white border border-gold/40 p-5 sm:p-6 shadow-custom-sm order-1 lg:order-2 lg:sticky lg:top-24">
            <h3 className="mt-0 font-head">Order Summary</h3>
            {cart.map((item) => {
              const p = getProduct(item.id);
              if (!p) return null;
              return (
                <div key={`${item.id}-${item.color}`} className="flex justify-between gap-3 text-sm text-ink-soft mb-2.5">
                  <span>{p.name} ({item.color || 'Default'}) × {item.qty}</span>
                  <span className="shrink-0">{formatPrice(p.price * item.qty)}</span>
                </div>
              );
            })}
            <div className="border-t border-line my-4" />
            <div className="flex justify-between mb-3 text-sm"><span>Subtotal</span><span>{formatPrice(subtotal)}</span></div>
            {discount > 0 && (
              <div className="flex justify-between mb-3 text-sm text-success"><span>Discount ({promo})</span><span>−{formatPrice(discount)}</span></div>
            )}
            <div className="flex justify-between mb-3 text-sm"><span>Shipping</span><span>{shipping === 0 ? 'FREE' : formatPrice(shipping)}</span></div>
            <div className="flex justify-between font-bold text-lg text-maroon-dark border-t border-line pt-3.5">
              <span>Total</span><span>{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
