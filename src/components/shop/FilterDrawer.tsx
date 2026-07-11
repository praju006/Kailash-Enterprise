'use client';

import { CloseIcon } from '@/components/ui/Icons';
import FilterPanel from './FilterPanel';
import { CatalogCategory } from '@/lib/catalog';

interface FilterDrawerProps {
  open: boolean;
  onClose: () => void;
  resultCount: number;
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

export default function FilterDrawer(props: FilterDrawerProps) {
  const { open, onClose, resultCount } = props;

  return (
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-[200] transition-opacity md:hidden ${open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed top-0 right-0 h-full w-[86%] max-w-[360px] bg-cream z-[210] overflow-y-auto transition-transform duration-300 md:hidden ${
          open ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="sticky top-0 bg-cream flex items-center justify-between p-4 border-b border-line z-10">
          <h3 className="m-0 text-lg font-head">Filters</h3>
          <button onClick={onClose} aria-label="Close filters" className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-cream-dark">
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="p-4">
          <FilterPanel {...props} />
        </div>
        <div className="sticky bottom-0 bg-cream border-t border-line p-4">
          <button onClick={onClose} className="btn-primary w-full py-3">
            Show {resultCount} Result{resultCount !== 1 ? 's' : ''}
          </button>
        </div>
      </div>
    </>
  );
}
