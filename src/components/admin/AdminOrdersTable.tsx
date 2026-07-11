'use client';

import { Fragment, useState } from 'react';
import { formatPrice } from '@/lib/utils';

const STATUSES = ['Processing', 'Confirmed', 'Shipped', 'Out for Delivery', 'Delivered', 'Cancelled'];

interface OrderItem {
  id: number;
  name: string;
  price: number;
  qty: number;
  color: string | null;
}
interface Order {
  id: number;
  orderNumber: string;
  customerName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  paymentMethod: string;
  paymentStatus: string;
  status: string;
  total: number;
  createdAt: string;
  items: OrderItem[];
}

function statusColor(status: string) {
  switch (status) {
    case 'Delivered': return 'bg-success text-white';
    case 'Cancelled': return 'bg-maroon text-white';
    case 'Shipped':
    case 'Out for Delivery': return 'bg-gold text-maroon-dark';
    default: return 'bg-cream-dark text-ink';
  }
}

export default function AdminOrdersTable({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [expanded, setExpanded] = useState<number | null>(null);
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState<number | null>(null);

  async function updateStatus(order: Order, status: string) {
    setUpdating(order.id);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, status } : o)));
      }
    } finally {
      setUpdating(null);
    }
  }

  async function markPaid(order: Order) {
    setUpdating(order.id);
    try {
      const res = await fetch(`/api/orders/${order.orderNumber}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentStatus: 'paid' }),
      });
      if (res.ok) {
        setOrders((prev) => prev.map((o) => (o.id === order.id ? { ...o, paymentStatus: 'paid' } : o)));
      }
    } finally {
      setUpdating(null);
    }
  }

  const filtered = filter === 'all' ? orders : orders.filter((o) => o.status === filter);

  return (
    <div>
      <div className="flex gap-2 mb-4 overflow-x-auto pb-1">
        {['all', ...STATUSES].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-semibold border ${
              filter === s ? 'bg-maroon text-white border-maroon' : 'bg-white border-line text-ink-soft'
            }`}
          >
            {s === 'all' ? 'All' : s}
          </button>
        ))}
      </div>

      <div className="bg-white border border-line shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft border-b border-line">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Payment</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
                <th className="p-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => (
                <Fragment key={o.id}>
                  <tr key={o.id} className="border-b border-line last:border-0 hover:bg-cream/40">
                    <td className="p-4 font-semibold text-maroon-dark">{o.orderNumber}</td>
                    <td className="p-4">{o.customerName}</td>
                    <td className="p-4">{formatPrice(o.total)}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="text-xs">{o.paymentMethod.toUpperCase()}</span>
                        {o.paymentStatus === 'paid' ? (
                          <span className="text-[10px] bg-success/15 text-success font-bold px-2 py-0.5 rounded-full">PAID</span>
                        ) : (
                          <button
                            onClick={() => markPaid(o)}
                            disabled={updating === o.id}
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full hover:bg-line ${
                              o.paymentStatus === 'awaiting_verification' ? 'bg-gold/25 text-maroon-dark' : 'bg-cream-dark text-ink-soft'
                            }`}
                          >
                            {o.paymentStatus === 'awaiting_verification' ? 'VERIFY & MARK PAID' : 'MARK PAID'}
                          </button>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <select
                        value={o.status}
                        disabled={updating === o.id}
                        onChange={(e) => updateStatus(o, e.target.value)}
                        className={`text-xs font-semibold px-2.5 py-1.5 rounded-full border-0 ${statusColor(o.status)}`}
                      >
                        {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </td>
                    <td className="p-4 text-ink-soft whitespace-nowrap">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                    <td className="p-4">
                      <button onClick={() => setExpanded(expanded === o.id ? null : o.id)} className="text-xs text-maroon underline">
                        {expanded === o.id ? 'Hide' : 'Details'}
                      </button>
                    </td>
                  </tr>
                  {expanded === o.id && (
                    <tr className="bg-cream/40 border-b border-line">
                      <td colSpan={7} className="p-5">
                        <div className="grid md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Shipping To</h4>
                            <p className="text-sm text-ink-soft m-0">
                              {o.address}, {o.city}, {o.state} {o.pincode}<br />
                              {o.phone} · {o.email}
                            </p>
                          </div>
                          <div>
                            <h4 className="text-sm font-semibold mb-2">Items</h4>
                            {o.items.map((item) => (
                              <div key={item.id} className="flex justify-between text-sm text-ink-soft mb-1">
                                <span>{item.name} {item.color ? `(${item.color})` : ''} × {item.qty}</span>
                                <span>{formatPrice(item.price * item.qty)}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="p-8 text-center text-ink-soft">No orders in this status.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
