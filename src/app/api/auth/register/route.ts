import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit, bodyTooLarge, cleanString, isEmail } from '@/lib/security';

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth-register', 10, 15 * 60 * 1000);
  if (limited) return limited;

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const email = cleanString(body.email, 254).toLowerCase();
  const name = cleanString(body.name, 100) || null;
  const password = typeof body.password === 'string' ? body.password : '';

  if (!isEmail(email)) return NextResponse.json({ error: 'Please enter a valid email.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  const passwordHash = await bcrypt.hash(password, 10);

  if (existing?.passwordHash) {
    return NextResponse.json({ error: 'An account with this email already exists. Please log in.' }, { status: 409 });
  }

  // If the email was pre-provisioned a role (an invite) without a password, claim it now.
  const user = existing
    ? await prisma.user.update({ where: { email }, data: { passwordHash, name: existing.name || name } })
    : await prisma.user.create({ data: { email, name, passwordHash, provider: 'password' } });

  if (!user.active) return NextResponse.json({ error: 'This account has been disabled.' }, { status: 403 });

  await createSession(user.email);
  return NextResponse.json({ ok: true, role: user.role ?? null });
}
