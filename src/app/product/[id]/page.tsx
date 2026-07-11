import { notFound } from 'next/navigation';
import { getCategoryBySlug, getProductById, getRelatedProducts } from '@/lib/catalog';
import ProductClient from './ProductClient';

export const dynamic = 'force-dynamic';

export default async function ProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const product = await getProductById(Number(id));
  if (!product) notFound();
  const [related, category] = await Promise.all([
    getRelatedProducts(product),
    getCategoryBySlug(product.category),
  ]);
  return <ProductClient product={product} related={related} categoryName={category?.name || product.category} />;
}
