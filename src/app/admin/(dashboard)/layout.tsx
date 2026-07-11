import Link from 'next/link';
import { getSession } from '@/lib/auth';
import AdminLogoutButton from '@/components/admin/AdminLogoutButton';
import { BagIcon, CheckIcon, MenuIcon } from '@/components/ui/Icons';

export default async function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();

  return (
    <div className="min-h-screen flex bg-cream-dark">
      <aside className="w-64 bg-maroon-dark text-[#e9d7b8] shrink-0 hidden md:flex flex-col">
        <div className="p-6 border-b border-white/10">
          <div className="font-head text-xl font-bold text-white">
            KAILASH <span className="text-gold-light">ENTERPRISES</span>
          </div>
          <div className="text-xs text-[#d8c19a] mt-0.5">Admin Dashboard</div>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          <Link href="/admin" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
            <MenuIcon className="w-4 h-4" /> Overview
          </Link>
          <Link href="/admin/orders" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
            <CheckIcon className="w-4 h-4" /> Orders
          </Link>
          <Link href="/admin/products" className="flex items-center gap-3 px-3.5 py-2.5 rounded-lg hover:bg-white/10 transition-colors text-sm font-medium">
            <BagIcon className="w-4 h-4" /> Products
          </Link>
        </nav>
        <div className="p-4 border-t border-white/10">
          <div className="text-xs text-[#d8c19a] mb-2">Signed in as {session?.username}</div>
          <AdminLogoutButton />
        </div>
      </aside>

      <div className="flex-1 min-w-0">
        <div className="md:hidden bg-maroon-dark text-white p-4 flex items-center justify-between">
          <div className="font-head font-bold">KAILASH ENTERPRISES · Admin</div>
          <AdminLogoutButton compact />
        </div>
        <main className="p-5 md:p-8">{children}</main>
      </div>
    </div>
  );
}
