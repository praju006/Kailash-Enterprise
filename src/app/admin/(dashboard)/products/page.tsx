import { prisma } from '@/lib/prisma';
import { getSession } from '@/lib/auth';
import AdminProductsTable from '@/components/admin/AdminProductsTable';

export const dynamic = 'force-dynamic';

export default async function AdminProductsPage() {
  const [session, products, categories] = await Promise.all([
    getSession(),
    prisma.product.findMany({ orderBy: { id: 'asc' } }),
    prisma.category.findMany({ orderBy: { id: 'asc' } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-head font-semibold mb-6">Products</h1>
      <AdminProductsTable
        initialProducts={JSON.parse(JSON.stringify(products))}
        categories={categories.map((c) => ({ slug: c.slug, name: c.name }))}
        canDelete={session?.role === 'admin'}
      />
    </div>
  );
}
