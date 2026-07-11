import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit, bodyTooLarge, cleanString } from '@/lib/security';

// Compared against when the username doesn't exist, so lookups take the same
// time whether or not the account is real (prevents username enumeration).
const DUMMY_HASH = bcrypt.hashSync('placeholder-timing-equalizer', 10);

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'admin-login', 5, 15 * 60 * 1000);
  if (limited) return limited;

  const oversized = bodyTooLarge(req, 10_000);
  if (oversized) return oversized;

  const body = await req.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });

  const username = cleanString(body.username, 100);
  const password = typeof body.password === 'string' ? body.password.slice(0, 200) : '';

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password are required.' }, { status: 400 });
  }

  const user = await prisma.adminUser.findUnique({ where: { username } });
  const valid = await bcrypt.compare(password, user ? user.passwordHash : DUMMY_HASH);

  if (!user || !valid) {
    return NextResponse.json({ error: 'Invalid username or password.' }, { status: 401 });
  }

  await createSession(user.username);
  return NextResponse.json({ ok: true });
}
