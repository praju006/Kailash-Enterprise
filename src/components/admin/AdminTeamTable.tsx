'use client';

import { FormEvent, useState } from 'react';

interface TeamUser {
  id: number;
  email: string;
  name: string | null;
  role: string | null;
  provider: string;
  active: boolean;
  createdAt: string;
}

const ROLE_OPTIONS = [
  { value: 'admin', label: 'Owner / Admin' },
  { value: 'manager', label: 'Store Manager' },
  { value: 'none', label: 'No admin access' },
];

export default function AdminTeamTable({ initialUsers, me }: { initialUsers: TeamUser[]; me: string }) {
  const [users, setUsers] = useState(initialUsers);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('manager');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  function upsertLocal(user: TeamUser) {
    setUsers((prev) => {
      const exists = prev.some((u) => u.id === user.id);
      return exists ? prev.map((u) => (u.id === user.id ? user : u)) : [...prev, user];
    });
  }

  async function handleInvite(e: FormEvent) {
    e.preventDefault();
    setError('');
    setBusy(true);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok) {
        upsertLocal(data.user);
        setEmail('');
      } else {
        setError(data.error || 'Could not add member.');
      }
    } finally {
      setBusy(false);
    }
  }

  async function patchUser(id: number, patch: { role?: string; active?: boolean }) {
    const res = await fetch(`/api/admin/users/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(patch),
    });
    const data = await res.json().catch(() => ({}));
    if (res.ok) upsertLocal(data.user);
    else alert(data.error || 'Update failed.');
  }

  const staff = users.filter((u) => u.role);
  const customers = users.filter((u) => !u.role);

  return (
    <div className="space-y-8">
      {/* Invite / assign a role */}
      <form onSubmit={handleInvite} className="bg-white border border-line p-5">
        <h3 className="font-head text-lg mt-0 mb-1">Give someone access</h3>
        <p className="text-sm text-ink-soft mb-4">
          Enter their email and pick a role. They get access as soon as they sign in with that email (Google or password).
        </p>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="person@gmail.com"
            className="flex-1 px-3.5 py-2.5 border border-line text-base focus:outline-none focus:ring-2 focus:ring-gold"
          />
          <select value={role} onChange={(e) => setRole(e.target.value)} className="px-3.5 py-2.5 border border-line bg-white">
            <option value="manager">Store Manager</option>
            <option value="admin">Owner / Admin</option>
          </select>
          <button type="submit" disabled={busy} className="btn-primary px-6 py-2.5 disabled:opacity-60">
            {busy ? 'Adding…' : 'Add'}
          </button>
        </div>
        {error && <div className="text-maroon text-sm mt-3">{error}</div>}
      </form>

      {/* Team members */}
      <div>
        <h3 className="font-head text-lg mb-3">Team ({staff.length})</h3>
        <div className="bg-white border border-line overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft border-b border-line">
                <th className="p-4">Email</th>
                <th className="p-4">Sign-in</th>
                <th className="p-4">Role</th>
                <th className="p-4">Status</th>
              </tr>
            </thead>
            <tbody>
              {staff.map((u) => {
                const isMe = u.email === me;
                return (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="p-4">
                      <div className="font-semibold">{u.name || u.email}</div>
                      {u.name && <div className="text-ink-soft text-xs">{u.email}</div>}
                      {isMe && <span className="ml-0 mt-1 inline-block font-mono text-[9px] uppercase tracking-[0.06em] bg-cream-dark px-1.5 py-0.5">You</span>}
                    </td>
                    <td className="p-4 text-ink-soft capitalize">{u.provider === 'google' ? 'Google' : 'Password'}</td>
                    <td className="p-4">
                      <select
                        value={u.role || 'none'}
                        disabled={isMe}
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        className="px-2.5 py-1.5 border border-line bg-white text-sm disabled:opacity-50"
                      >
                        {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                      </select>
                    </td>
                    <td className="p-4">
                      {isMe ? (
                        <span className="text-success text-xs font-semibold">Active</span>
                      ) : (
                        <button
                          onClick={() => patchUser(u.id, { active: !u.active })}
                          className={`text-xs underline ${u.active ? 'text-ink-soft' : 'text-maroon font-semibold'}`}
                        >
                          {u.active ? 'Deactivate' : 'Reactivate'}
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
              {staff.length === 0 && (
                <tr><td colSpan={4} className="p-6 text-center text-ink-soft">No team members yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Registered customers (no admin access) */}
      {customers.length > 0 && (
        <div>
          <h3 className="font-head text-lg mb-3">Registered customers ({customers.length})</h3>
          <div className="bg-white border border-line overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft border-b border-line">
                  <th className="p-4">Email</th>
                  <th className="p-4">Sign-in</th>
                  <th className="p-4">Grant access</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((u) => (
                  <tr key={u.id} className="border-b border-line last:border-0">
                    <td className="p-4">{u.name ? `${u.name} · ${u.email}` : u.email}</td>
                    <td className="p-4 text-ink-soft capitalize">{u.provider === 'google' ? 'Google' : 'Password'}</td>
                    <td className="p-4">
                      <select
                        value="none"
                        onChange={(e) => patchUser(u.id, { role: e.target.value })}
                        className="px-2.5 py-1.5 border border-line bg-white text-sm"
                      >
                        {ROLE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.value === 'none' ? 'Choose role…' : o.label}</option>)}
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
