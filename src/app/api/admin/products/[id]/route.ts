import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import { bodyTooLarge, cleanString, cleanNumber } from '@/lib/security';

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });

  const oversized = bodyTooLarge(req, 200_000);
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
      ...(images !== undefined ? { images: typeof images === 'string' ? images.slice(0, 10_000) : JSON.stringify(images) } : {}),
      ...(desc !== undefined ? { desc: cleanString(desc, 2000) } : {}),
      ...(cleanRating !== undefined ? { rating: cleanRating } : {}),
      ...(cleanReviews !== undefined ? { reviews: cleanReviews } : {}),
      ...(active !== undefined ? { active: active === true } : {}),
    },
  });

  return NextResponse.json({ product });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid product id.' }, { status: 400 });

  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
