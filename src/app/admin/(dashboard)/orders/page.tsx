import { prisma } from '@/lib/prisma';
import AdminOrdersTable from '@/components/admin/AdminOrdersTable';

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  });

  return (
    <div>
      <h1 className="text-2xl font-head font-semibold mb-6">Orders</h1>
      <AdminOrdersTable initialOrders={JSON.parse(JSON.stringify(orders))} />
    </div>
  );
}
