'use client';

import { FormEvent, useState } from 'react';

export default function AdminLoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    const res = await fetch('/api/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password }),
    });
    if (res.ok) {
      // Hard navigation so middleware re-evaluates the freshly-set session cookie.
      window.location.href = '/admin';
    } else {
      setLoading(false);
      const data = await res.json().catch(() => ({}));
      setError(data.error || 'Login failed.');
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-maroon-dark px-4">
      <div className="bg-white shadow-2xl w-full max-w-sm">
        <div className="foil-rule" />
        <div className="p-8">
          <div className="text-center mb-7">
            <div className="font-head text-2xl font-bold text-maroon">
              KAILASH <span className="text-gold">ENTERPRISES</span>
            </div>
            <span className="eyebrow justify-center mt-2">Store Admin Dashboard</span>
          </div>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Username</label>
              <input
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-line focus:outline-none focus:ring-2 focus:ring-gold"
                autoFocus
              />
            </div>
            <div className="mb-5">
              <label className="block font-mono text-[11px] uppercase tracking-[0.06em] text-gold-deep mb-1.5">Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 border border-line focus:outline-none focus:ring-2 focus:ring-gold"
              />
            </div>
            {error && <div className="text-maroon text-sm mb-4">{error}</div>}
            <button type="submit" disabled={loading} className="btn-primary w-full py-3.5 disabled:opacity-60">
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
