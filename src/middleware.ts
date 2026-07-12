import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const SESSION_COOKIE = 'kailash_session';

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

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // CSRF defense-in-depth: reject cross-site state-changing API calls. Browsers
  // always attach an Origin header on POST/PATCH/DELETE; if it's present and does
  // not match our own host, the request came from another site — block it.
  if (pathname.startsWith('/api/') && !SAFE_METHODS.has(req.method)) {
    const origin = req.headers.get('origin');
    if (origin) {
      let sameOrigin = false;
      try {
        sameOrigin = new URL(origin).host === req.headers.get('host');
      } catch {
        sameOrigin = false;
      }
      if (!sameOrigin) {
        return NextResponse.json({ error: 'Cross-origin request blocked.' }, { status: 403 });
      }
    }
  }

  // First-line gate: /admin requires an authenticated session. Role is enforced
  // server-side (fresh from the DB) in the dashboard layout and every admin API.
  if (pathname.startsWith('/admin')) {
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
      url.pathname = '/login';
      url.search = `?next=${encodeURIComponent(pathname)}`;
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/api/:path*'],
};
