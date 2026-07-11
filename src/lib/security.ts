import { NextRequest, NextResponse } from 'next/server';

/* ---------- Rate limiting (fixed window, in-memory per server instance) ---------- */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function pruneExpired(now: number) {
  buckets.forEach((b, key) => {
    if (b.resetAt <= now) buckets.delete(key);
  });
}

/**
 * Returns null when the request is within limits, or a ready-made 429 response
 * when the caller has exceeded `limit` hits per `windowMs` for this scope.
 */
export function rateLimit(req: NextRequest, scope: string, limit: number, windowMs: number): NextResponse | null {
  const now = Date.now();
  if (buckets.size > MAX_BUCKETS) pruneExpired(now);

  const key = `${scope}:${clientIp(req)}`;
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  bucket.count += 1;
  if (bucket.count <= limit) return null;

  const retryAfter = Math.max(1, Math.ceil((bucket.resetAt - now) / 1000));
  return NextResponse.json(
    { error: 'Too many requests. Please try again shortly.' },
    { status: 429, headers: { 'Retry-After': String(retryAfter) } }
  );
}

export function clientIp(req: NextRequest): string {
  const fwd = req.headers.get('x-forwarded-for');
  if (fwd) return fwd.split(',')[0].trim();
  // NextRequest.ip was removed in Next 15+; rely on forwarding headers.
  return req.headers.get('x-real-ip') || 'unknown';
}

/* ---------- Request body guards ---------- */

/** Rejects oversized payloads before they are parsed. */
export function bodyTooLarge(req: NextRequest, maxBytes = 100_000): NextResponse | null {
  const len = Number(req.headers.get('content-length') || 0);
  if (len > maxBytes) {
    return NextResponse.json({ error: 'Request body too large.' }, { status: 413 });
  }
  return null;
}

/* ---------- Input sanitisation / validation ---------- */

/** Coerces to a trimmed string, strips control characters, caps length. */
export function cleanString(value: unknown, maxLen: number): string {
  if (typeof value !== 'string') return '';
  // eslint-disable-next-line no-control-regex
  return value.replace(/[\u0000-\u001F\u007F]/g, ' ').trim().slice(0, maxLen);
}

export const isEmail = (v: string) => v.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
export const isPhone = (v: string) => /^[0-9]{10}$/.test(v);
export const isPincode = (v: string) => /^[0-9]{6}$/.test(v);

/** Finite number within [min, max], else null. */
export function cleanNumber(value: unknown, min: number, max: number): number | null {
  const n = Number(value);
  if (!Number.isFinite(n) || n < min || n > max) return null;
  return n;
}
