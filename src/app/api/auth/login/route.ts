import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit, bodyTooLarge, cleanString } from '@/lib/security';

// Compared against when the account doesn't exist so response time is constant
// whether or not the email is real (prevents account enumeration).
const DUMMY_HASH = bcrypt.hashSync('placeholder-timing-equalizer', 10);

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth-login', 8, 15 * 60 * 1000);
  if (limited) return limited;

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const email = cleanString(body.email, 254).toLowerCase();
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

  if (!email || !password) {
    return NextResponse.json({ error: 'Email and password are required.' }, { status: 400 });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  const valid = await bcrypt.compare(password, user?.passwordHash || DUMMY_HASH);

  if (!user || !user.passwordHash || !valid) {
    return NextResponse.json({ error: 'Invalid email or password.' }, { status: 401 });
  }
  if (!user.active) {
    return NextResponse.json({ error: 'This account has been disabled.' }, { status: 403 });
  }

  await createSession(user.email);
  return NextResponse.json({ ok: true, role: user.role ?? null });
}
