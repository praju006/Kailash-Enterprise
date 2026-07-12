import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'kailash_session';

export type Role = 'admin' | 'manager';
export const ADMIN_ROLES: Role[] = ['admin', 'manager'];

export interface SessionUser {
  id: number;
  email: string;
  name: string | null;
  role: Role | null;
}

const secretKey = () => {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Never allow a guessable signing key to reach production.
    if (process.env.NODE_ENV === 'production') {
      throw new Error('SESSION_SECRET must be set in production.');
    }
    return new TextEncoder().encode('dev-only-insecure-secret');
  }
  return new TextEncoder().encode(secret);
};

/** Issues the httpOnly session cookie. Identity is the email; role is read fresh from the DB on each request. */
export async function createSession(email: string) {
  const token = await new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(secretKey());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7,
  });
}

/** Returns the signed-in user with their CURRENT role/active status from the DB, or null. */
export async function getSession(): Promise<SessionUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let email = '';
  try {
    const { payload } = await jwtVerify(token, secretKey());
    email = typeof payload.email === 'string' ? payload.email : '';
  } catch {
    return null;
  }
  if (!email) return null;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.active) return null;

  const role = user.role === 'admin' || user.role === 'manager' ? (user.role as Role) : null;
  return { id: user.id, email: user.email, name: user.name, role };
}

/** Returns the session only if the user holds one of the allowed roles, else null. */
export async function requireRole(roles: Role[]): Promise<SessionUser | null> {
  const session = await getSession();
  if (!session || !session.role || !roles.includes(session.role)) return null;
  return session;
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, '', { path: '/', maxAge: 0 });
}

export { SESSION_COOKIE };
