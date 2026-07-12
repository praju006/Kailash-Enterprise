import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { bodyTooLarge, cleanString, cleanNumber } from '@/lib/security';

// Photos are stored inline as base64 data URIs, so allow a generous payload.
const MAX_BODY_BYTES = 15_000_000;
const MAX_IMAGES_CHARS = 12_000_000;

// Bust the cached storefront routes so admin edits appear on the live site immediately.
function revalidateStorefront() {
  revalidatePath('/');
  revalidatePath('/shop');
}

export async function GET() {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const products = await prisma.product.findMany({ orderBy: { id: 'asc' } });
  return NextResponse.json({ products });
}

export async function POST(req: NextRequest) {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const oversized = bodyTooLarge(req, MAX_BODY_BYTES);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const name = cleanString(body.name, 150);
  const category = cleanString(body.category, 60);
  const desc = cleanString(body.desc, 2000);
  const badge = cleanString(body.badge, 30);
  const price = cleanNumber(body.price, 1, 10_000_000);
  const oldPrice = body.oldPrice ? cleanNumber(body.oldPrice, 1, 10_000_000) : null;
  const rating = body.rating ? cleanNumber(body.rating, 0, 5) : 4.5;
  const reviews = body.reviews ? cleanNumber(body.reviews, 0, 1_000_000) : 0;
  const { colors, images, active } = body;

  if (!name || !category || !price || !desc) {
    return NextResponse.json({ error: 'Name, category, price and description are required.' }, { status: 400 });
  }

  const product = await prisma.product.create({
    data: {
      name,
      category,
      price,
      oldPrice,
      badge: badge || null,
      colors: typeof colors === 'string' ? colors.slice(0, 5000) : JSON.stringify(colors || []),
      images: typeof images === 'string' ? images.slice(0, MAX_IMAGES_CHARS) : JSON.stringify(images || []),
      desc,
      rating: rating ?? 4.5,
      reviews: reviews ?? 0,
      active: active !== false,
    },
  });

  revalidateStorefront();
  return NextResponse.json({ product });
}
