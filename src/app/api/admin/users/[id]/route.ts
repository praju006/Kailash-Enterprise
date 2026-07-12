import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { bodyTooLarge, cleanString } from '@/lib/security';

const VALID_ROLES = ['admin', 'manager'];

function parseId(raw: string): number | null {
  const id = Number(raw);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// PATCH: change a user's role (incl. "none" to revoke admin access) or active flag. Admin only.
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireRole(['admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const { id: rawId } = await params;
  const id = parseId(rawId);
  if (!id) return NextResponse.json({ error: 'Invalid user id.' }, { status: 400 });

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return NextResponse.json({ error: 'User not found.' }, { status: 404 });

  // An admin can't lock themselves out by removing their own role or deactivating themselves.
  if (target.id === session.id && (body.role === 'none' || body.role === null || body.active === false)) {
    return NextResponse.json({ error: "You can't change your own access." }, { status: 400 });
  }

  const data: { role?: string | null; active?: boolean } = {};
  if (body.role !== undefined) {
    const role = cleanString(body.role, 20);
    if (role === 'none' || role === '') data.role = null;
    else if (VALID_ROLES.includes(role)) data.role = role;
    else return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });
  }
  if (typeof body.active === 'boolean') data.active = body.active;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: { id: true, email: true, name: true, role: true, provider: true, active: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
