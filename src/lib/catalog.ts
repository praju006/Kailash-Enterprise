import { prisma } from '@/lib/prisma';

export const PRODUCT_DETAILS_EXTRA = {
  details: [
    '100% authentic fabric, hand-checked before dispatch',
    'Comes with an unstitched matching blouse piece',
    'Saree length: ~6.3 metres | Blouse: ~0.8 metres',
    'Dry clean recommended for first wash',
  ],
  care: [
    'Dry clean only for best longevity',
    'Store folded in a muslin cloth away from direct sunlight',
    'Iron on low heat from the reverse side',
    'Avoid contact with perfumes and sprays directly on fabric',
  ],
};

export interface ColorOption {
  name: string;
  hex: string;
}

export interface CatalogProduct {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  rating: number;
  reviews: number;
  badge: string | null;
  colors: ColorOption[];
  images: string[];
  desc: string;
}

export interface CatalogCategory {
  slug: string;
  name: string;
  desc: string;
  accent: string;
  images: string[];
}

function mapProduct(p: {
  id: number; name: string; category: string; price: number; oldPrice: number | null;
  rating: number; reviews: number; badge: string | null; colors: string; images: string; desc: string;
}): CatalogProduct {
  let colors: ColorOption[] = [];
  let images: string[] = [];
  try { colors = JSON.parse(p.colors); } catch { colors = []; }
  try { images = JSON.parse(p.images); } catch { images = []; }
  return { ...p, colors, images };
}

function mapCategory(c: { slug: string; name: string; desc: string; accent: string; images: string }): CatalogCategory {
  let images: string[] = [];
  try { images = JSON.parse(c.images); } catch { images = []; }
  return { ...c, images };
}

// Supabase's pooler drops idle connections; the first query after idle can fail
// with a transient "closed connection" / "can't reach server" error. One retry
// after a short pause reliably recovers.
async function withRetry<T>(query: () => Promise<T>): Promise<T> {
  try {
    return await query();
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    const transient = /closed the connection|Can't reach database server|Connection reset|ECONNRESET|Timed out/i.test(msg);
    if (!transient) throw err;
    await new Promise((r) => setTimeout(r, 400));
    return query();
  }
}

export async function getActiveProducts(): Promise<CatalogProduct[]> {
  const products = await withRetry(() => prisma.product.findMany({ where: { active: true }, orderBy: { id: 'asc' } }));
  return products.map(mapProduct);
}

export async function getActiveCategories(): Promise<CatalogCategory[]> {
  const [categories, products] = await withRetry(() =>
    Promise.all([
      prisma.category.findMany({ orderBy: { id: 'asc' } }),
      prisma.product.findMany({ where: { active: true }, select: { category: true } }),
    ])
  );
  const usedSlugs = new Set(products.map((p) => p.category));
  return categories.filter((c) => usedSlugs.has(c.slug)).map(mapCategory);
}

export async function getProductById(id: number): Promise<CatalogProduct | null> {
  const p = await withRetry(() => prisma.product.findFirst({ where: { id, active: true } }));
  return p ? mapProduct(p) : null;
}

export async function getCategoryBySlug(slug: string): Promise<CatalogCategory | null> {
  const c = await withRetry(() => prisma.category.findUnique({ where: { slug } }));
  return c ? mapCategory(c) : null;
}

export async function getRelatedProducts(product: CatalogProduct, limit = 4): Promise<CatalogProduct[]> {
  const products = await withRetry(() =>
    prisma.product.findMany({
      where: { active: true, category: product.category, id: { not: product.id } },
      take: limit,
      orderBy: { id: 'asc' },
    })
  );
  return products.map(mapProduct);
}
