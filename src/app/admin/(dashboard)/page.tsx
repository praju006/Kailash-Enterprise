import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [totalOrders, pendingOrders, orders, products] = await Promise.all([
    prisma.order.count(),
    prisma.order.count({ where: { status: { in: ['Processing', 'Confirmed'] } } }),
    prisma.order.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
    prisma.product.count(),
  ]);

  const revenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentStatus: 'paid' },
  });
  const codRevenueAgg = await prisma.order.aggregate({
    _sum: { total: true },
    where: { paymentMethod: 'cod' },
  });
  const revenue = (revenueAgg._sum.total || 0) + (codRevenueAgg._sum.total || 0);

  const stats = [
    { label: 'Total Orders', value: totalOrders },
    { label: 'Pending Orders', value: pendingOrders },
    { label: 'Products Listed', value: products },
    { label: 'Total Order Value', value: formatPrice(revenue) },
  ];

  return (
    <div>
      <h1 className="text-2xl font-head font-semibold mb-6">Overview</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((s) => (
          <div key={s.label} className="bg-white border-t-2 border-t-gold border-x border-b border-line p-5 shadow-sm">
            <div className="font-mono text-[10.5px] uppercase tracking-[0.08em] text-gold-deep mb-1.5">{s.label}</div>
            <div className="text-2xl font-bold text-maroon-dark font-head">{s.value}</div>
          </div>
        ))}
      </div>

      <div className="bg-white border border-line shadow-sm">
        <div className="flex justify-between items-center p-5 border-b border-line">
          <h2 className="font-head text-lg m-0">Recent Orders</h2>
          <Link href="/admin/orders" className="font-mono text-[11px] uppercase tracking-[0.06em] text-maroon underline">View all</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft border-b border-line">
                <th className="p-4">Order</th>
                <th className="p-4">Customer</th>
                <th className="p-4">Total</th>
                <th className="p-4">Status</th>
                <th className="p-4">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-line last:border-0">
                  <td className="p-4 font-semibold text-maroon-dark">
                    <Link href={`/admin/orders?highlight=${o.orderNumber}`}>{o.orderNumber}</Link>
                  </td>
                  <td className="p-4">{o.customerName}</td>
                  <td className="p-4">{formatPrice(o.total)}</td>
                  <td className="p-4">
                    <span className="px-2.5 py-1 font-mono text-[10px] uppercase tracking-[0.05em] font-semibold bg-cream-dark">{o.status}</span>
                  </td>
                  <td className="p-4 text-ink-soft">{new Date(o.createdAt).toLocaleDateString('en-IN')}</td>
                </tr>
              ))}
              {orders.length === 0 && (
                <tr><td colSpan={5} className="p-8 text-center text-ink-soft">No orders yet.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
