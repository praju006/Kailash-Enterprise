import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { requireRole } from '@/lib/auth';
import { bodyTooLarge, cleanString, isEmail } from '@/lib/security';

const VALID_ROLES = ['admin', 'manager'];

// GET: list all team members + customers (admin only).
export async function GET() {
  const session = await requireRole(['admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const users = await prisma.user.findMany({
    orderBy: [{ role: 'asc' }, { createdAt: 'asc' }],
    select: { id: true, email: true, name: true, role: true, provider: true, active: true, createdAt: true },
  });
  return NextResponse.json({ users, me: session.email });
}

// POST: invite/assign a role to an email (admin only). Creates a stub account if needed.
export async function POST(req: NextRequest) {
  const session = await requireRole(['admin']);
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const email = cleanString(body.email, 254).toLowerCase();
  const role = cleanString(body.role, 20);
  const name = cleanString(body.name, 100) || null;

  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (!VALID_ROLES.includes(role)) return NextResponse.json({ error: 'Invalid role.' }, { status: 400 });

  const user = await prisma.user.upsert({
    where: { email },
    update: { role, active: true },
    create: { email, name, role, active: true, provider: 'password' },
    select: { id: true, email: true, name: true, role: true, provider: true, active: true, createdAt: true },
  });

  return NextResponse.json({ user });
}
