import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify, createRemoteJWKSet } from 'jose';
import { prisma } from '@/lib/prisma';
import { createSession } from '@/lib/auth';
import { rateLimit, bodyTooLarge } from '@/lib/security';

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || '';
const GOOGLE_JWKS = createRemoteJWKSet(new URL('https://www.googleapis.com/oauth2/v3/certs'));

export async function POST(req: NextRequest) {
  const limited = rateLimit(req, 'auth-google', 20, 15 * 60 * 1000);
  if (limited) return limited;

  const oversized = bodyTooLarge(req, 20_000);
  if (oversized) return oversized;

  if (!GOOGLE_CLIENT_ID) {
    return NextResponse.json({ error: 'Google sign-in is not configured.' }, { status: 503 });
  }

  const body = await req.json().catch(() => null);
  const credential = body && typeof body.credential === 'string' ? body.credential : '';
  if (!credential) return NextResponse.json({ error: 'Missing Google credential.' }, { status: 400 });

  let email = '';
  let name: string | null = null;
  try {
    const { payload } = await jwtVerify(credential, GOOGLE_JWKS, {
      issuer: ['https://accounts.google.com', 'accounts.google.com'],
      audience: GOOGLE_CLIENT_ID,
    });
    if (payload.email_verified !== true) throw new Error('Email not verified');
    email = String(payload.email || '').toLowerCase();
    name = typeof payload.name === 'string' ? payload.name : null;
  } catch {
    return NextResponse.json({ error: 'Could not verify Google sign-in.' }, { status: 401 });
  }

  if (!email) return NextResponse.json({ error: 'Google account has no email.' }, { status: 400 });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing && !existing.active) {
    return NextResponse.json({ error: 'This account has been disabled.' }, { status: 403 });
  }

  // Upsert: an invited email (role pre-assigned) keeps its role; new emails become customers (role null).
  const user = existing
    ? await prisma.user.update({ where: { email }, data: { name: existing.name || name, provider: existing.provider === 'password' ? 'password' : 'google' } })
    : await prisma.user.create({ data: { email, name, provider: 'google' } });

  await createSession(user.email);
  return NextResponse.json({ ok: true, role: user.role ?? null });
}
