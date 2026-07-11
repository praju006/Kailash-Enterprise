import { NextResponse } from 'next/server';
import { getActiveCategories, getActiveProducts } from '@/lib/catalog';

export const dynamic = 'force-dynamic';

export async function GET() {
  const [products, categories] = await Promise.all([getActiveProducts(), getActiveCategories()]);
  return NextResponse.json({ products, categories });
}
