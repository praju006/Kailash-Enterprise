'use client';

import { CatalogCategory } from '@/lib/catalog';
import CustomCheckbox from '@/components/ui/CustomCheckbox';

export const PRICE_RANGES = [
  { label: 'All Prices', value: 'all' },
  { label: 'Under ₹3,000', value: '0-3000' },
  { label: '₹3,000 – ₹6,000', value: '3000-6000' },
  { label: '₹6,000 – ₹12,000', value: '6000-12000' },
  { label: 'Above ₹12,000', value: '12000-999999' },
];

interface FilterPanelProps {
  allCategories: CatalogCategory[];
  categories: string[];
  toggleCategory: (slug: string) => void;
  price: string;
  setPrice: (v: string) => void;
  onSale: boolean;
  setOnSale: (v: boolean) => void;
  onlyNew: boolean;
  setOnlyNew: (v: boolean) => void;
  clearFilters: () => void;
}

export default function FilterPanel({
  allCategories, categories, toggleCategory, price, setPrice, onSale, setOnSale, onlyNew, setOnlyNew, clearFilters,
}: FilterPanelProps) {
  return (
    <>
      <div className="bg-white border border-line p-5 mb-5">
        <div className="flex justify-between items-center mb-4">
          <h4 className="text-[1rem] m-0 font-head">Category</h4>
          <button onClick={clearFilters} className="font-mono text-[10px] uppercase tracking-[0.04em] text-maroon underline underline-offset-2">Clear all</button>
        </div>
        {allCategories.map((c) => (
          <CustomCheckbox key={c.slug} checked={categories.includes(c.slug)} onChange={() => toggleCategory(c.slug)} label={c.name} />
        ))}
      </div>

      <div className="bg-white border border-line p-5 mb-5">
        <h4 className="text-[1rem] mb-4 font-head">Price Range</h4>
        {PRICE_RANGES.map((opt) => (
          <CustomCheckbox key={opt.value} type="radio" checked={price === opt.value} onChange={() => setPrice(opt.value)} label={opt.label} />
        ))}
      </div>

      <div className="bg-white border border-line p-5">
        <h4 className="text-[1rem] mb-4 font-head">Availability</h4>
        <CustomCheckbox checked={onSale} onChange={() => setOnSale(!onSale)} label="On Sale" />
        <CustomCheckbox checked={onlyNew} onChange={() => setOnlyNew(!onlyNew)} label="New Arrivals" />
      </div>
    </>
  );
}
