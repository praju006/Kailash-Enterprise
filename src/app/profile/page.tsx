'use client';

import Link from 'next/link';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useStore, UserProfile } from '@/context/StoreContext';
import { formatPrice } from '@/lib/utils';
import { UserIcon, HeartIcon, BagIcon, CheckIcon } from '@/components/ui/Icons';

const DETAIL_FIELDS: {
  key: keyof Omit<UserProfile, 'preferences'>;
  label: string;
  type: string;
  full?: boolean;
  autoComplete?: string;
  inputMode?: 'numeric' | 'tel' | 'email';
  maxLength?: number;
}[] = [
  { key: 'name', label: 'Full Name', type: 'text', full: true, autoComplete: 'name' },
  { key: 'email', label: 'Email Address', type: 'email', autoComplete: 'email', inputMode: 'email' },
  { key: 'phone', label: 'Phone Number', type: 'tel', autoComplete: 'tel', inputMode: 'tel', maxLength: 10 },
  { key: 'address', label: 'Address', type: 'text', full: true, autoComplete: 'street-address' },
  { key: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
  { key: 'state', label: 'State', type: 'text', autoComplete: 'address-level1' },
  { key: 'pincode', label: 'Pincode', type: 'text', autoComplete: 'postal-code', inputMode: 'numeric', maxLength: 6 },
];

interface LiveStatus {
  status: string;
  paymentStatus: string;
}

export default function ProfilePage() {
  const { profile, saveProfile, orders, wishlistCount, cartCount, catalog, showToast } = useStore();
  const [form, setForm] = useState(profile);
  const [statuses, setStatuses] = useState<Record<string, LiveStatus>>({});
  const [ordersOpen, setOrdersOpen] = useState(false);
  // Collapsed by default once details already exist; auto-open for a brand-new/empty profile
  // so first-time users aren't stuck behind an extra click just to fill things in.
  const [editingDetails, setEditingDetails] = useState(!profile.name);
  const [detailsOpen, setDetailsOpen] = useState(false);

  // Keep the local form in sync once the profile hydrates from localStorage.
  useEffect(() => {
    setForm(profile);
    setEditingDetails((open) => open || !profile.name);
    setDetailsOpen((open) => open || !profile.name);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile]);

  const categoryOptions = useMemo(
    () => Array.from(new Set(catalog.map((p) => p.category))).sort(),
    [catalog]
  );
  const colorOptions = useMemo(
    () => Array.from(new Set(catalog.flatMap((p) => p.colors.map((c) => c.name)))).sort().slice(0, 14),
    [catalog]
  );

  // Pull live status for saved orders using the email that placed them.
  useEffect(() => {
    let cancelled = false;
    orders.forEach((o) => {
      if (!o.email || statuses[o.orderNumber]) return;
      fetch(`/api/orders/${encodeURIComponent(o.orderNumber)}?contact=${encodeURIComponent(o.email.toLowerCase())}`)
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (!cancelled && data?.order) {
            setStatuses((s) => ({ ...s, [o.orderNumber]: { status: data.order.status, paymentStatus: data.order.paymentStatus } }));
          }
        })
        .catch(() => {});
    });
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orders]);

  function togglePref(kind: 'categories' | 'colors', value: string) {
    setForm((f) => {
      const list = f.preferences[kind];
      const next = list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
      return { ...f, preferences: { ...f.preferences, [kind]: next } };
    });
  }

  function handleSave(e: FormEvent) {
    e.preventDefault();
    saveProfile(form);
    showToast('Profile saved!');
    setEditingDetails(false);
  }

  function handleCancelEdit() {
    setForm(profile);
    setEditingDetails(false);
  }

  const stats = [
    { label: 'Orders', value: orders.length, href: null, icon: <CheckIcon className="w-4 h-4" /> },
    { label: 'Wishlist', value: wishlistCount, href: '/wishlist', icon: <HeartIcon className="w-4 h-4" /> },
    { label: 'In Bag', value: cartCount, href: '/cart', icon: <BagIcon className="w-4 h-4" /> },
  ];

  return (
    <section className="section-tight">
      <div className="container">
        <div className="mb-6 sm:mb-8 reveal">
          <span className="eyebrow">Your Account</span>
          <h1 className="text-2xl sm:text-3xl mt-3.5 mb-1">
            {profile.name ? `Namaste, ${profile.name.split(' ')[0]}` : 'Your Profile'}
          </h1>
          <p className="text-ink-soft text-sm mb-0">Your details, preferences and orders are saved on this device.</p>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-4 mb-6 sm:mb-8 reveal">
          {stats.map((s) => {
            const inner = (
              <div className="bg-white border border-gold/40 px-2.5 py-3 sm:px-5 sm:py-4 text-center h-full">
                <div className="flex items-center justify-center gap-1.5 text-maroon">{s.icon}<span className="font-head text-lg sm:text-2xl text-maroon-dark">{s.value}</span></div>
                <div className="font-mono text-[9px] sm:text-[10.5px] uppercase tracking-[0.06em] sm:tracking-[0.08em] text-gold-deep mt-1">{s.label}</div>
              </div>
            );
            return s.href ? <Link key={s.label} href={s.href}>{inner}</Link> : <div key={s.label}>{inner}</div>;
          })}
        </div>

        <div className="grid lg:grid-cols-[1.2fr_1fr] gap-5 sm:gap-6 lg:gap-10 items-start">
          {/* Details + preferences */}
          <div className="bg-white border border-gold/40 p-4 sm:p-6 shadow-custom-sm reveal">
            <button
              type="button"
              onClick={() => setDetailsOpen((v) => !v)}
              aria-expanded={detailsOpen}
              className="w-full flex items-center justify-between gap-2 mb-0"
            >
              <h3 className="mt-0 mb-0 font-head flex items-center gap-2"><UserIcon className="w-[18px] h-[18px] text-maroon shrink-0" /> My Details</h3>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 text-ink-soft transition-transform duration-200 shrink-0 ${detailsOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>

            {detailsOpen && (
            <div className="mt-4">
            {!editingDetails ? (
              <div>
                <div className="space-y-2.5 text-sm mb-4">
                  <div><span className="text-ink-soft">Name: </span>{profile.name || '—'}</div>
                  <div><span className="text-ink-soft">Email: </span>{profile.email || '—'}</div>
                  <div><span className="text-ink-soft">Phone: </span>{profile.phone || '—'}</div>
                  <div><span className="text-ink-soft">Address: </span>{[profile.address, profile.city, profile.state, profile.pincode].filter(Boolean).join(', ') || '—'}</div>
                </div>
                <button
                  type="button"
                  onClick={() => setEditingDetails(true)}
                  className="font-mono text-[10.5px] uppercase tracking-[0.06em] text-maroon underline shrink-0"
                >
                  Edit
                </button>
              </div>
            ) : (
              <form onSubmit={handleSave}>
                <div className="grid sm:grid-cols-2 gap-4">
                  {DETAIL_FIELDS.map((f) => (
                    <div key={f.key} className={f.full ? 'sm:col-span-2' : ''}>
                      <label htmlFor={`profile-${f.key}`} className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">{f.label}</label>
                      <input
                        id={`profile-${f.key}`}
                        type={f.type}
                        autoComplete={f.autoComplete}
                        inputMode={f.inputMode}
                        maxLength={f.maxLength}
                        value={form[f.key]}
                        onChange={(e) => setForm((prev) => ({ ...prev, [f.key]: e.target.value }))}
                        className="w-full px-3.5 py-3 border border-line bg-white text-base focus:outline-none focus:ring-2 focus:ring-gold"
                      />
                    </div>
                  ))}
                </div>

                <h3 className="font-head mt-7">My Preferences</h3>

                {categoryOptions.length > 0 && (
                  <>
                    <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-2">Favourite Collections</div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {categoryOptions.map((c) => {
                        const active = form.preferences.categories.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => togglePref('categories', c)}
                            className={`px-3.5 py-2 border font-mono text-[11px] uppercase tracking-[0.05em] transition-colors ${active ? 'bg-maroon text-white border-maroon' : 'bg-white text-ink border-line hover:border-gold'}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                {colorOptions.length > 0 && (
                  <>
                    <div className="font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-2">Preferred Colours</div>
                    <div className="flex flex-wrap gap-2 mb-5">
                      {colorOptions.map((c) => {
                        const active = form.preferences.colors.includes(c);
                        return (
                          <button
                            key={c}
                            type="button"
                            onClick={() => togglePref('colors', c)}
                            className={`px-3.5 py-2 border font-mono text-[11px] uppercase tracking-[0.05em] transition-colors ${active ? 'bg-maroon text-white border-maroon' : 'bg-white text-ink border-line hover:border-gold'}`}
                          >
                            {c}
                          </button>
                        );
                      })}
                    </div>
                  </>
                )}

                <label className="flex items-center gap-2.5 text-sm cursor-pointer mb-6">
                  <input
                    type="checkbox"
                    checked={form.preferences.offers}
                    onChange={(e) => setForm((f) => ({ ...f, preferences: { ...f.preferences, offers: e.target.checked } }))}
                    className="w-4 h-4 accent-[#8B1D2C]"
                  />
                  Keep me posted about new arrivals and offers
                </label>

                <div className="flex gap-3">
                  <button type="submit" className="btn-primary flex-1 sm:flex-none px-10 py-3.5">Save Profile</button>
                  {!!profile.name && (
                    <button type="button" onClick={handleCancelEdit} className="btn-outline flex-1 sm:flex-none px-8 py-3.5">Cancel</button>
                  )}
                </div>
              </form>
            )}
            </div>
            )}
          </div>

          {/* Order history */}
          <div className="bg-white border border-gold/40 p-4 sm:p-6 shadow-custom-sm reveal">
            <button
              type="button"
              onClick={() => setOrdersOpen((v) => !v)}
              aria-expanded={ordersOpen}
              className="w-full flex items-center justify-between gap-2 mb-0"
            >
              <h3 className="mt-0 mb-0 font-head flex items-center gap-2"><BagIcon className="w-[18px] h-[18px] text-maroon shrink-0" /> My Orders</h3>
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className={`w-5 h-5 text-ink-soft transition-transform duration-200 shrink-0 ${ordersOpen ? 'rotate-180' : ''}`}
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </button>
            {ordersOpen && (
            <div className="mt-4">
            {orders.length === 0 ? (
              <div className="text-center py-8">
                <BagIcon className="w-10 h-10 mx-auto mb-2.5 text-gold" />
                <p className="text-ink-soft text-sm mb-4">No orders yet. Orders you place will show up here automatically.</p>
                <Link href="/shop" className="btn-outline inline-flex px-7 py-3">Start Shopping</Link>
              </div>
            ) : (
              <div className="space-y-3">
                {orders.map((o) => {
                  const live = statuses[o.orderNumber];
                  const delivered = live?.status === 'Delivered';
                  const cancelled = live?.status === 'Cancelled';
                  return (
                    <div key={o.orderNumber} className="border border-line p-3 sm:p-4">
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <div className="font-mono font-bold text-[13px] sm:text-sm text-maroon-dark truncate">{o.orderNumber}</div>
                          <div className="text-xs text-ink-soft mt-0.5">
                            {new Date(o.placedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                          </div>
                        </div>
                        <div className="font-bold text-maroon-dark text-sm sm:text-base shrink-0">{formatPrice(o.total)}</div>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-2.5">
                        <span className={`font-mono text-[9.5px] sm:text-[10px] uppercase tracking-[0.06em] px-2 py-1 ${cancelled ? 'bg-[#fdeee0] text-maroon' : delivered ? 'bg-success/10 text-success' : 'bg-gold-pale text-gold-deep'}`}>
                          {live ? live.status : 'Placed'}
                        </span>
                        <Link href={`/track?order=${o.orderNumber}`} className="font-mono text-[10px] sm:text-[10.5px] uppercase tracking-[0.06em] text-maroon underline shrink-0">
                          Track
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
            </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}