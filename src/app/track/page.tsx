'use client';

import { Suspense, useEffect, useState, FormEvent } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { formatPrice } from '@/lib/utils';
import { CheckIcon, TruckIcon, BagIcon } from '@/components/ui/Icons';

const STEPS = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered'];

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  color: string | null;
}
interface StatusEvent {
  id: number;
  status: string;
  note: string | null;
  createdAt: string;
}
interface OrderData {
  orderNumber: string;
  customerName: string;
  status: string;
  paymentMethod: string;
  paymentStatus: string;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  createdAt: string;
  items: OrderItem[];
  statusHistory: StatusEvent[];
}

function TrackForm() {
  const searchParams = useSearchParams();
  const [orderNumber, setOrderNumber] = useState(searchParams.get('order') || '');
  const [contact, setContact] = useState('');
  const [order, setOrder] = useState<OrderData | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function lookup(e?: FormEvent) {
    e?.preventDefault();
    if (!orderNumber.trim() || !contact.trim()) {
      setError('Enter both your order number and the email or phone used at checkout.');
      return;
    }
    setLoading(true);
    setError('');
    setOrder(null);
    try {
      const res = await fetch(`/api/orders/${encodeURIComponent(orderNumber.trim())}?contact=${encodeURIComponent(contact.trim().toLowerCase())}`);
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || 'Order not found.');
        return;
      }
      const data = await res.json();
      setOrder(data.order);
    } catch {
      setError('Network error — please try again.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (searchParams.get('order')) {
      // Order number pre-filled from checkout redirect; wait for the user to add contact info.
    }
  }, [searchParams]);

  const activeStepIndex = order ? STEPS.indexOf(order.status) : -1;
  const cancelled = order?.status === 'Cancelled';

  return (
    <section className="section-tight">
      <div className="container max-w-2xl mx-auto">
        <div className="text-center mb-8 reveal">
          <span className="eyebrow justify-center">Order Status</span>
          <h1 className="mt-3.5">Track Your Order</h1>
          <p className="text-ink-soft">Enter your order number and the email or phone you used at checkout.</p>
        </div>

        <form onSubmit={lookup} className="bg-white border border-gold/40 p-6 shadow-custom-sm mb-8 reveal">
          <div className="grid sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Order Number</label>
              <input
                value={orderNumber}
                onChange={(e) => setOrderNumber(e.target.value)}
                placeholder="ANY123456"
                className="w-full px-3.5 py-2.5 border border-line focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            <div>
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Email or Phone</label>
              <input
                value={contact}
                onChange={(e) => setContact(e.target.value)}
                placeholder="you@example.com"
                className="w-full px-3.5 py-2.5 border border-line focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
          </div>
          {error && <div className="text-maroon text-sm mb-3">{error}</div>}
          <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
            {loading ? 'Looking up…' : 'Track Order'}
          </button>
        </form>

        {order && (
          <div className="bg-white border border-gold/40 p-6 shadow-custom-sm reveal">
            <div className="flex justify-between items-start mb-6 flex-wrap gap-2">
              <div>
                <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold-deep">Order</div>
                <div className="font-bold text-lg text-maroon-dark font-head">{order.orderNumber}</div>
              </div>
              <div className="text-right">
                <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold-deep">Placed On</div>
                <div className="text-sm">{new Date(order.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'long', year: 'numeric' })}</div>
              </div>
            </div>

            {cancelled ? (
              <div className="bg-[#fdeee0] text-maroon p-4 text-center font-semibold mb-6">This order was cancelled.</div>
            ) : (
              <div className="flex items-center mb-8 overflow-x-auto pb-2">
                {STEPS.map((step, i) => (
                  <div key={step} className="flex items-center shrink-0">
                    <div className="flex flex-col items-center gap-1.5">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                          i <= activeStepIndex ? 'bg-maroon text-white' : 'bg-cream-dark text-ink-soft'
                        }`}
                      >
                        {i < activeStepIndex ? <CheckIcon className="w-4 h-4" /> : i === activeStepIndex ? <TruckIcon className="w-4 h-4" /> : i + 1}
                      </div>
                      <span className={`font-mono text-[10px] uppercase tracking-[0.03em] text-center w-20 ${i <= activeStepIndex ? 'text-maroon-dark font-semibold' : 'text-ink-soft'}`}>{step}</span>
                    </div>
                    {i < STEPS.length - 1 && <div className={`h-0.5 w-8 sm:w-12 ${i < activeStepIndex ? 'bg-maroon' : 'bg-cream-dark'}`} />}
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-line pt-5">
              <h3 className="text-base mb-3 font-head">Items</h3>
              {order.items.map((item) => (
                <div key={item.id} className="flex justify-between text-sm text-ink-soft mb-2">
                  <span>{item.name} {item.color ? `(${item.color})` : ''} × {item.qty}</span>
                  <span>{formatPrice(item.price * item.qty)}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold text-maroon-dark border-t border-line pt-3 mt-3">
                <span>Total</span><span>{formatPrice(order.total)}</span>
              </div>
              <div className="font-mono text-[10.5px] uppercase tracking-[0.03em] text-ink-soft mt-2">
                Payment: {order.paymentMethod === 'cod' ? 'Cash on Delivery' : order.paymentMethod.toUpperCase()} · {order.paymentStatus === 'paid' ? 'Paid' : 'Pending'}
              </div>
            </div>
          </div>
        )}

        <div className="text-center mt-8">
          <Link href="/shop" className="font-mono text-[11px] uppercase tracking-[0.04em] text-maroon underline inline-flex items-center gap-1.5">
            <BagIcon className="w-4 h-4" /> Continue Shopping
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function TrackPage() {
  return (
    <Suspense fallback={null}>
      <TrackForm />
    </Suspense>
  );
}
