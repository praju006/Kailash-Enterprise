import { NextRequest, NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { prisma } from '@/lib/prisma';
import { requireRole, ADMIN_ROLES } from '@/lib/auth';
import { bodyTooLarge, cleanString, cleanNumber } from '@/lib/security';

// Photos are stored inline as base64 data URIs, so allow a generous payload.
const MAX_BODY_BYTES = 15_000_000;
const MAX_IMAGES_CHARS = 12_000_000;

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Bust the cached storefront routes so admin edits appear on the live site immediately.
function revalidateStorefront(id?: number) {
  revalidatePath('/');
  revalidatePath('/shop');
  if (id) revalidatePath(`/product/${id}`);
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(ADMIN_ROLES);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });

  const oversized = bodyTooLarge(req, MAX_BODY_BYTES);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  const { name, category, price, oldPrice, badge, colors, images, desc, rating, reviews, active } = body;

  const cleanPrice = price !== undefined ? cleanNumber(price, 1, 10_000_000) : undefined;
  const cleanRating = rating !== undefined ? cleanNumber(rating, 0, 5) : undefined;
  const cleanReviews = reviews !== undefined ? cleanNumber(reviews, 0, 1_000_000) : undefined;
  if (cleanPrice === null || cleanRating === null || cleanReviews === null) {
    return NextResponse.json({ error: 'Invalid numeric value.' }, { status: 400 });
  }

  const product = await prisma.product.update({
    where: { id },
    data: {
      ...(name !== undefined ? { name: cleanString(name, 150) } : {}),
      ...(category !== undefined ? { category: cleanString(category, 60) } : {}),
      ...(cleanPrice !== undefined ? { price: cleanPrice } : {}),
      ...(oldPrice !== undefined ? { oldPrice: oldPrice === null || oldPrice === '' ? null : cleanNumber(oldPrice, 1, 10_000_000) } : {}),
      ...(badge !== undefined ? { badge: cleanString(badge, 30) || null } : {}),
      ...(colors !== undefined ? { colors: typeof colors === 'string' ? colors.slice(0, 5000) : JSON.stringify(colors) } : {}),
      ...(images !== undefined ? { images: typeof images === 'string' ? images.slice(0, MAX_IMAGES_CHARS) : JSON.stringify(images) } : {}),
      ...(desc !== undefined ? { desc: cleanString(desc, 2000) } : {}),
      ...(cleanRating !== undefined ? { rating: cleanRating } : {}),
      ...(cleanReviews !== undefined ? { reviews: cleanReviews } : {}),
      ...(active !== undefined ? { active: active === true } : {}),
    },
  });

  revalidateStorefront(id);
  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  // Deleting products is restricted to admins/owners.
  const session = await requireRole(['admin']);
  if (!session) return NextResponse.json({ error: 'Only an admin can delete products.' }, { status: 403 });

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  revalidateStorefront(id);
  return NextResponse.json({ ok: true });
}
