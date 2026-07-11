import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'anaya_admin_session';

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

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
    const token = req.cookies.get(SESSION_COOKIE)?.value;
    let valid = false;
    if (token) {
      try {
        await jwtVerify(token, secretKey());
        valid = true;
      } catch {
        valid = false;
      }
    }
    if (!valid) {
      const url = req.nextUrl.clone();
      url.pathname = '/admin/login';
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'],
};
