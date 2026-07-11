'use client';

import { useState } from 'react';
import { formatPrice } from '@/lib/utils';
import { CloseIcon } from '@/components/ui/Icons';

interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  oldPrice: number | null;
  badge: string | null;
  colors: string;
  images: string;
  desc: string;
  rating: number;
  reviews: number;
  active: boolean;
}

interface FormState {
  name: string;
  category: string;
  price: string;
  oldPrice: string;
  badge: string;
  colorsText: string; // "Maroon:#8b1e2b, Emerald:#2f5e4a"
  images: string[]; // real image URLs / data URIs
  desc: string;
  active: boolean;
}

const EMPTY_FORM: FormState = { name: '', category: '', price: '', oldPrice: '', badge: '', colorsText: '', images: [], desc: '', active: true };

const MAX_DIMENSION = 1400;
const JPEG_QUALITY = 0.82;

function parseColors(text: string) {
  return text
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
    .map((s) => {
      const [name, hex] = s.split(':').map((x) => x.trim());
      return { name: name || 'Colour', hex: hex || '#8b1e2b' };
    });
}

function colorsToText(colorsJson: string) {
  try {
    const colors = JSON.parse(colorsJson) as { name: string; hex: string }[];
    return colors.map((c) => `${c.name}:${c.hex}`).join(', ');
  } catch {
    return '';
  }
}

function imagesFromJson(imagesJson: string): string[] {
  try {
    return JSON.parse(imagesJson) as string[];
  } catch {
    return [];
  }
}

function firstImage(imagesJson: string): string | undefined {
  const src = imagesFromJson(imagesJson)[0];
  return typeof src === 'string' && (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:')) ? src : undefined;
}

function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Could not read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Could not decode image'));
      img.onload = () => {
        let { width, height } = img;
        if (width > MAX_DIMENSION || height > MAX_DIMENSION) {
          const scale = MAX_DIMENSION / Math.max(width, height);
          width = Math.round(width * scale);
          height = Math.round(height * scale);
        }
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) return reject(new Error('Canvas not supported'));
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL('image/jpeg', JPEG_QUALITY));
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}

export default function AdminProductsTable({ initialProducts, categories }: { initialProducts: Product[]; categories: { slug: string; name: string }[] }) {
  const [products, setProducts] = useState(initialProducts);
  const [editing, setEditing] = useState<Product | null>(null);
  const [creating, setCreating] = useState(false);
  const [form, setForm] = useState<FormState>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  function openCreate() {
    setForm(EMPTY_FORM);
    setCreating(true);
    setEditing(null);
  }

  function openEdit(p: Product) {
    setForm({
      name: p.name,
      category: p.category,
      price: String(p.price),
      oldPrice: p.oldPrice ? String(p.oldPrice) : '',
      badge: p.badge || '',
      colorsText: colorsToText(p.colors),
      images: imagesFromJson(p.images),
      desc: p.desc,
      active: p.active,
    });
    setEditing(p);
    setCreating(false);
  }

  function closeModal() {
    setEditing(null);
    setCreating(false);
  }

  async function handleFiles(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    setUploading(true);
    try {
      const compressed = await Promise.all(files.map(compressImage));
      setForm((f) => ({ ...f, images: [...f.images, ...compressed] }));
    } catch {
      // skip files that fail to read/decode
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  }

  function removeImage(idx: number) {
    setForm((f) => ({ ...f, images: f.images.filter((_, i) => i !== idx) }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (form.images.length === 0) {
      alert('Please add at least one photo of the saree.');
      return;
    }
    setSaving(true);
    const payload = {
      name: form.name,
      category: form.category,
      price: Number(form.price),
      oldPrice: form.oldPrice ? Number(form.oldPrice) : null,
      badge: form.badge || null,
      colors: JSON.stringify(parseColors(form.colorsText)),
      images: JSON.stringify(form.images),
      desc: form.desc,
      active: form.active,
    };

    try {
      if (editing) {
        const res = await fetch(`/api/admin/products/${editing.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { product } = await res.json();
          setProducts((prev) => prev.map((p) => (p.id === product.id ? product : p)));
          closeModal();
        }
      } else {
        const res = await fetch('/api/admin/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
        if (res.ok) {
          const { product } = await res.json();
          setProducts((prev) => [...prev, product]);
          closeModal();
        }
      }
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(p: Product) {
    if (!confirm(`Delete "${p.name}"? This cannot be undone.`)) return;
    const res = await fetch(`/api/admin/products/${p.id}`, { method: 'DELETE' });
    if (res.ok) setProducts((prev) => prev.filter((x) => x.id !== p.id));
  }

  const showModal = editing || creating;

  return (
    <div>
      <div className="flex justify-end mb-4">
        <button onClick={openCreate} className="btn-primary px-5 py-2.5">+ Add Product</button>
      </div>

      <div className="bg-white border border-line shadow-sm overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left font-mono text-[10.5px] uppercase tracking-[0.08em] text-ink-soft border-b border-line">
              <th className="p-4">Photo</th>
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Badge</th>
              <th className="p-4"></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const thumb = firstImage(p.images);
              return (
                <tr key={p.id} className="border-b border-line last:border-0">
                  <td className="p-4">
                    <div className="w-11 h-14 bg-cream-dark border border-line overflow-hidden">
                      {thumb && <img src={thumb} alt={p.name} className="w-full h-full object-cover object-top" />}
                    </div>
                  </td>
                  <td className="p-4 font-semibold">{p.name}{!p.active && <span className="ml-2 font-mono text-[10px] text-ink-soft">(hidden)</span>}</td>
                  <td className="p-4 text-ink-soft">{p.category}</td>
                  <td className="p-4">{formatPrice(p.price)}{p.oldPrice ? <span className="line-through text-ink-soft ml-1.5 text-xs">{formatPrice(p.oldPrice)}</span> : ''}</td>
                  <td className="p-4">{p.badge && <span className="text-xs bg-cream-dark px-2 py-0.5 rounded-full">{p.badge}</span>}</td>
                  <td className="p-4 text-right whitespace-nowrap">
                    <button onClick={() => openEdit(p)} className="text-xs text-maroon underline mr-3">Edit</button>
                    <button onClick={() => handleDelete(p)} className="text-xs text-ink-soft underline">Delete</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 z-[300] flex items-center justify-center p-4" onClick={closeModal}>
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-4">
              <h3 className="m-0">{editing ? 'Edit Product' : 'Add Product'}</h3>
              <button onClick={closeModal} aria-label="Close"><CloseIcon className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Name</label>
                <input required value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Category</label>
                  <select required value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white">
                    <option value="">Select…</option>
                    {categories.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Badge</label>
                  <select value={form.badge} onChange={(e) => setForm((f) => ({ ...f, badge: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line bg-white">
                    <option value="">None</option>
                    <option value="Bestseller">Bestseller</option>
                    <option value="New">New</option>
                    <option value="Sale">Sale</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Price (₹)</label>
                  <input required type="number" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line" />
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">Old Price (₹, optional)</label>
                  <input type="number" value={form.oldPrice} onChange={(e) => setForm((f) => ({ ...f, oldPrice: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Colours (name:hex, comma-separated)</label>
                <input value={form.colorsText} onChange={(e) => setForm((f) => ({ ...f, colorsText: e.target.value }))} placeholder="Maroon:#8b1e2b, Emerald:#2f5e4a" className="w-full px-3.5 py-2.5 rounded-lg border border-line" />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Photos of the actual saree</label>
                <input type="file" accept="image/*" multiple onChange={handleFiles} className="w-full text-sm" />
                {uploading && <p className="text-xs text-ink-soft mt-1.5">Processing photo…</p>}
                {form.images.length > 0 && (
                  <div className="flex flex-wrap gap-2.5 mt-3">
                    {form.images.map((src, i) => (
                      <div key={i} className="relative w-16 h-20 border border-line overflow-hidden group">
                        <img src={src} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          aria-label="Remove photo"
                          className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center text-[10px]"
                        >
                          ×
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1.5">Description</label>
                <textarea required rows={3} value={form.desc} onChange={(e) => setForm((f) => ({ ...f, desc: e.target.value }))} className="w-full px-3.5 py-2.5 rounded-lg border border-line" />
              </div>
              <label className="flex items-center gap-2.5 text-sm font-semibold">
                <input type="checkbox" checked={form.active} onChange={(e) => setForm((f) => ({ ...f, active: e.target.checked }))} />
                Visible on website
              </label>
              <button type="submit" disabled={saving || uploading} className="btn-primary w-full py-3.5 disabled:opacity-60">
                {saving ? 'Saving…' : editing ? 'Save Changes' : 'Create Product'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
