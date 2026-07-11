import { Suspense } from 'react';
import ShopClient from './ShopClient';
import { getActiveCategories, getActiveProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'Shop All Sarees — Kailash Enterprises',
  description: 'Real stock photos of every saree we currently have — Kalamkari, Warli print, Bandhani border and woven stripe cotton.',
};

export default async function ShopPage() {
  const [categories, products] = await Promise.all([getActiveCategories(), getActiveProducts()]);
  return (
    <Suspense fallback={null}>
      <ShopClient categories={categories} products={products} />
    </Suspense>
  );
}
