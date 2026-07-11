'use client';

export default function AdminLogoutButton({ compact = false }: { compact?: boolean }) {
  async function handleLogout() {
    await fetch('/api/admin/logout', { method: 'POST' });
    // Hard navigation so middleware re-evaluates the now-cleared session cookie.
    window.location.href = '/admin/login';
  }

  return (
    <button
      onClick={handleLogout}
      className={compact ? 'text-sm text-white/80 hover:text-white underline' : 'w-full text-sm py-2 rounded-lg border border-white/25 hover:bg-white/10 transition-colors'}
    >
      Log Out
    </button>
  );
}
