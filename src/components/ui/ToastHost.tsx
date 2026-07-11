'use client';

import { useStore } from '@/context/StoreContext';

export default function ToastHost() {
  const { toasts } = useStore();
  return (
    <div className="fixed bottom-6 right-6 z-[999] flex flex-col gap-2 items-end">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="bg-maroon-dark text-white px-5 py-3 rounded-xl shadow-custom text-sm animate-fade-up"
        >
          {t.message}
        </div>
      ))}
    </div>
  );
}
