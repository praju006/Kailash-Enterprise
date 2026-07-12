'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import GoogleSignInButton from './GoogleSignInButton';

export default function AuthPanel({ mode }: { mode: 'login' | 'register' }) {
  const isRegister = mode === 'register';
  const searchParams = useSearchParams();
  // Only honour same-origin relative paths — never an absolute/protocol-relative
  // URL — so ?next= can't be used as an open redirect to another site.
  const rawNext = searchParams.get('next') || '';
  const next = /^\/(?![/\\])/.test(rawNext) ? rawNext : '';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Send role-holders to the dashboard; everyone else to the storefront (or wherever they came from).
  function finish(role: string | null) {
    const dest = next || (role ? '/admin' : '/');
    window.location.href = dest;
  }

  async function submitCredentials(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`/api/auth/${isRegister ? 'register' : 'login'}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(isRegister ? { name, email, password } : { email, password }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) finish(data.role ?? null);
      else {
        setError(data.error || 'Something went wrong.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  async function handleGoogle(credential: string) {
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth/google', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ credential }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) finish(data.role ?? null);
      else {
        setError(data.error || 'Google sign-in failed.');
        setLoading(false);
      }
    } catch {
      setError('Network error. Please try again.');
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark px-4 py-10">
      <div className="bg-white shadow-2xl w-full max-w-sm">
        <div className="foil-rule" />
        <div className="p-8">
          <div className="text-center mb-6">
            <Link href="/" className="font-head text-2xl font-bold text-maroon">
              KAILASH <span className="text-gold">ENTERPRISES</span>
            </Link>
            <span className="eyebrow justify-center mt-2">{isRegister ? 'Create Account' : 'Sign In'}</span>
          </div>

          <div className="mb-5">
            <GoogleSignInButton onCredential={handleGoogle} />
          </div>

          <div className="flex items-center gap-3 my-5">
            <div className="h-px flex-1 bg-line" />
            <span className="font-mono text-[10px] uppercase tracking-[0.1em] text-ink-soft">or</span>
            <div className="h-px flex-1 bg-line" />
          </div>

          <form onSubmit={submitCredentials}>
            {isRegister && (
              <div className="mb-4">
                <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Name</label>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 border border-line text-base focus:outline-none focus:ring-2 focus:ring-gold"
                />
              </div>
            )}
            <div className="mb-4">
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-line text-base focus:outline-none focus:ring-2 focus:ring-gold"
                autoComplete="email"
              />
            </div>
            <div className="mb-5">
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-line text-base focus:outline-none focus:ring-2 focus:ring-gold"
                autoComplete={isRegister ? 'new-password' : 'current-password'}
                placeholder={isRegister ? 'At least 8 characters' : ''}
              />
            </div>
            {error && <div className="text-maroon text-sm mb-4">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? 'Please wait…' : isRegister ? 'Create Account' : 'Sign In'}
            </button>
          </form>

          <p className="text-center text-sm text-ink-soft mt-5">
            {isRegister ? (
              <>Already have an account? <Link href="/login" className="text-maroon link-slide">Sign in</Link></>
            ) : (
              <>New here? <Link href="/register" className="text-maroon link-slide">Create an account</Link></>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
