'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState, ReactNode } from 'react';
import { CatalogProduct } from '@/lib/catalog';

export interface CartItem {
  id: number;
  qty: number;
  color: string | null;
}

export interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  preferences: {
    categories: string[];
    colors: string[];
    offers: boolean;
  };
}

export interface SavedOrder {
  orderNumber: string;
  total: number;
  placedAt: string;
  email: string;
}

export const EMPTY_PROFILE: UserProfile = {
  name: '', email: '', phone: '', address: '', city: '', state: '', pincode: '',
  preferences: { categories: [], colors: [], offers: true },
};

interface Toast {
  id: number;
  message: string;
}

interface StoreContextValue {
  cart: CartItem[];
  wishlist: number[];
  addToCart: (id: number, qty?: number, color?: string | null) => void;
  updateQty: (id: number, color: string | null, qty: number) => void;
  removeFromCart: (id: number, color: string | null) => void;
  clearCart: () => void;
  toggleWishlist: (id: number) => boolean;
  isWished: (id: number) => boolean;
  cartCount: number;
  cartSubtotal: number;
  wishlistCount: number;
  promo: string | null;
  applyPromo: (code: string) => boolean;
  clearPromo: () => void;
  showToast: (message: string) => void;
  toasts: Toast[];
  catalog: CatalogProduct[];
  catalogLoaded: boolean;
  getProduct: (id: number) => CatalogProduct | undefined;
  profile: UserProfile;
  saveProfile: (patch: Partial<UserProfile>) => void;
  orders: SavedOrder[];
  addOrder: (order: SavedOrder) => void;
}

const CART_KEY = 'anaya_cart_v1';
const WISHLIST_KEY = 'anaya_wishlist_v1';
const PROMO_KEY = 'anaya_promo_v1';
const PROFILE_KEY = 'anaya_profile_v1';
const ORDERS_KEY = 'anaya_orders_v1';

export const PROMO_CODES: Record<string, number> = { SAREE10: 0.1, WELCOME15: 0.15 };

const StoreContext = createContext<StoreContextValue | null>(null);

function readJSON<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<number[]>([]);
  const [promo, setPromo] = useState<string | null>(null);
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [catalog, setCatalog] = useState<CatalogProduct[]>([]);
  const [catalogLoaded, setCatalogLoaded] = useState(false);
  const [profile, setProfile] = useState<UserProfile>(EMPTY_PROFILE);
  const [orders, setOrders] = useState<SavedOrder[]>([]);

  useEffect(() => {
    setCart(readJSON(CART_KEY, []));
    setWishlist(readJSON(WISHLIST_KEY, []));
    setPromo(readJSON(PROMO_KEY, null));
    const stored = readJSON<Partial<UserProfile>>(PROFILE_KEY, {});
    setProfile({
      ...EMPTY_PROFILE,
      ...stored,
      preferences: { ...EMPTY_PROFILE.preferences, ...(stored.preferences || {}) },
    });
    setOrders(readJSON(ORDERS_KEY, []));
    setHydrated(true);
  }, []);

  useEffect(() => {
    fetch('/api/products')
      .then((res) => res.json())
      .then((data) => setCatalog(data.products || []))
      .catch(() => setCatalog([]))
      .finally(() => setCatalogLoaded(true));
  }, []);

  const getProduct = useCallback((id: number) => catalog.find((p) => p.id === id), [catalog]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(CART_KEY, JSON.stringify(cart));
  }, [cart, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(WISHLIST_KEY, JSON.stringify(wishlist));
  }, [wishlist, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PROMO_KEY, JSON.stringify(promo));
  }, [promo, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
  }, [profile, hydrated]);

  useEffect(() => {
    if (hydrated) window.localStorage.setItem(ORDERS_KEY, JSON.stringify(orders));
  }, [orders, hydrated]);

  const showToast = useCallback((message: string) => {
    const id = Date.now() + Math.random();
    setToasts((t) => [...t, { id, message }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 2400);
  }, []);

  const addToCart = useCallback((id: number, qty = 1, color: string | null = null) => {
    setCart((items) => {
      const existing = items.find((i) => i.id === id && i.color === color);
      if (existing) {
        return items.map((i) => (i === existing ? { ...i, qty: i.qty + qty } : i));
      }
      return [...items, { id, qty, color }];
    });
  }, []);

  const updateQty = useCallback((id: number, color: string | null, qty: number) => {
    setCart((items) => {
      if (qty <= 0) return items.filter((i) => !(i.id === id && i.color === color));
      return items.map((i) => (i.id === id && i.color === color ? { ...i, qty } : i));
    });
  }, []);

  const removeFromCart = useCallback((id: number, color: string | null) => {
    setCart((items) => items.filter((i) => !(i.id === id && i.color === color)));
  }, []);

  const clearCart = useCallback(() => setCart([]), []);

  const toggleWishlist = useCallback((id: number) => {
    let active = false;
    setWishlist((ids) => {
      if (ids.includes(id)) {
        active = false;
        return ids.filter((x) => x !== id);
      }
      active = true;
      return [...ids, id];
    });
    return active;
  }, []);

  const isWished = useCallback((id: number) => wishlist.includes(id), [wishlist]);

  const applyPromo = useCallback((code: string) => {
    const upper = code.trim().toUpperCase();
    if (PROMO_CODES[upper]) {
      setPromo(upper);
      return true;
    }
    return false;
  }, []);

  const clearPromo = useCallback(() => setPromo(null), []);

  const saveProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((p) => ({
      ...p,
      ...patch,
      preferences: { ...p.preferences, ...(patch.preferences || {}) },
    }));
  }, []);

  const addOrder = useCallback((order: SavedOrder) => {
    setOrders((list) => [order, ...list.filter((o) => o.orderNumber !== order.orderNumber)].slice(0, 30));
  }, []);

  const cartCount = useMemo(() => cart.reduce((sum, i) => sum + i.qty, 0), [cart]);
  const cartSubtotal = useMemo(
    () => cart.reduce((sum, i) => {
      const p = getProduct(i.id);
      return p ? sum + p.price * i.qty : sum;
    }, 0),
    [cart, catalog]
  );
  const wishlistCount = wishlist.length;

  const value: StoreContextValue = {
    cart, wishlist, addToCart, updateQty, removeFromCart, clearCart,
    toggleWishlist, isWished, cartCount, cartSubtotal, wishlistCount,
    promo, applyPromo, clearPromo, showToast, toasts,
    catalog, catalogLoaded, getProduct,
    profile, saveProfile, orders, addOrder,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used within StoreProvider');
  return ctx;
}
