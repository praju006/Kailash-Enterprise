import { redirect } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AdminTeamTable from '@/components/admin/AdminTeamTable';

export const dynamic = 'force-dynamic';

export default async function AdminTeamPage() {
  const session = await getSession();
  // Team management is admin-only (managers reaching this URL are bounced).
  if (!session || session.role !== 'admin') redirect('/admin');

  const users = await prisma.user.findMany({
    orderBy: [{ createdAt: 'asc' }],
    select: { id: true, email: true, name: true, role: true, provider: true, active: true, createdAt: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-head font-semibold mb-1">Team &amp; Access</h1>
      <p className="text-sm text-ink-soft mb-6">Control who can sign in to this dashboard and what they can do.</p>
      <AdminTeamTable initialUsers={JSON.parse(JSON.stringify(users))} me={session.email} />
    </div>
  );
}
