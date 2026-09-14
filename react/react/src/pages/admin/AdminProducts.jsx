import { useEffect, useState, useCallback } from 'react';
import {
  Plus, Pencil, Trash2, Search, X, ImageOff, Loader2, AlertTriangle,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const emptyForm = {
  title: '',
  description: '',
  price: '',
  stock: '',
  category: '',
  is_active: true,
  image: null,
};

export default function AdminProducts() {
  const toast = useToast();
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);

  const [modal, setModal] = useState(null);        // { mode, product }
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/products/', {
        params: { page, search: search || undefined, ordering: '-created_at' },
      });
      setProducts(data.results ?? data);
      setCount(data.count ?? (data.results ?? data).length);
    } catch {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [page, search, toast]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    api.get('/categories/')
      .then((r) => setCategories(r.data.results ?? r.data))
      .catch(() => {});
  }, []);

  const openCreate = () => {
    setForm(emptyForm);
    setModal({ mode: 'create' });
  };

  const openEdit = (p) => {
    setForm({
      title: p.title || '',
      description: p.description || '',
      price: p.price ?? '',
      stock: p.stock ?? '',
      category: p.category || '',
      is_active: p.is_active,
      image: null,
    });
    setModal({ mode: 'edit', product: p });
  };

  const closeModal = () => {
    if (saving) return;
    setModal(null);
    setForm(emptyForm);
  };

  const submit = async (e) => {
    e.preventDefault();
    if (!form.title || form.price === '' || form.stock === '') {
      return toast.error('Title, price and stock are required.');
    }

    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description || '');
      fd.append('price', form.price);
      fd.append('stock', form.stock);
      fd.append('is_active', form.is_active);
      if (form.category) fd.append('category', form.category);
      if (form.image) fd.append('image', form.image);

      if (modal.mode === 'create') {
        await api.post('/admin/products/', fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product created');
      } else {
        await api.put(`/admin/products/${modal.product.id}/`, fd, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        toast.success('Product updated');
      }
      closeModal();
      fetchProducts();
    } catch (err) {
      const data = err.response?.data;
      const msg =
        data && typeof data === 'object'
          ? Object.values(data).flat()[0]
          : 'Save failed';
      toast.error(String(msg));
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    setDeleting(true);
    try {
      await api.delete(`/admin/products/${deleteTarget.id}/`);
      toast.success(`Deleted “${deleteTarget.title}”`);
      setDeleteTarget(null);
      fetchProducts();
    } catch {
      toast.error('Delete failed');
    } finally {
      setDeleting(false);
    }
  };

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Products</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your product catalogue.</p>
        </div>
        <button onClick={openCreate} className="btn-primary">
          <Plus size={16} /> New product
        </button>
      </div>

      <div className="relative max-w-md">
        <Search
          size={17}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
        />
        <input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search products…"
          className="input pl-10"
        />
      </div>

      {loading ? (
        <Loader />
      ) : products.length === 0 ? (
        <EmptyState
          title="No products yet"
          description="Create your first product to get started."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Product</th>
                  <th className="px-5 py-3 text-left font-semibold">Category</th>
                  <th className="px-5 py-3 text-right font-semibold">Price</th>
                  <th className="px-5 py-3 text-right font-semibold">Stock</th>
                  <th className="px-5 py-3 text-center font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {products.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                          {p.image_url ? (
                            <img
                              src={p.image_url}
                              alt={p.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex h-full w-full items-center justify-center text-slate-300">
                              <ImageOff size={14} />
                            </div>
                          )}
                        </div>
                        <p className="line-clamp-1 font-semibold text-slate-800">
                          {p.title}
                        </p>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-slate-600">
                      {p.category_name || '—'}
                    </td>
                    <td className="px-5 py-3 text-right font-semibold text-slate-800">
                      ${Number(p.price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <span
                        className={`font-semibold ${
                          p.stock === 0
                            ? 'text-red-600'
                            : p.stock <= 5
                            ? 'text-amber-600'
                            : 'text-slate-700'
                        }`}
                      >
                        {p.stock}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      {p.is_active ? (
                        <span className="badge bg-emerald-100 text-emerald-700">Active</span>
                      ) : (
                        <span className="badge bg-slate-100 text-slate-600">Hidden</span>
                      )}
                    </td>
                    <td className="px-5 py-3">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => openEdit(p)}
                          className="btn-ghost !p-2"
                          aria-label="Edit"
                        >
                          <Pencil size={15} />
                        </button>
                        <button
                          onClick={() => setDeleteTarget(p)}
                          className="btn-ghost !p-2 text-red-500 hover:!bg-red-50 hover:text-red-700"
                          aria-label="Delete"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {/* ------------------------------------------ Create/Edit modal */}
      {modal && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 sm:items-center sm:p-4"
          onClick={closeModal}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="max-h-[92vh] w-full max-w-lg animate-fade-in overflow-y-auto rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl sm:p-7"
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="text-lg font-bold text-slate-900">
                {modal.mode === 'create' ? 'New product' : 'Edit product'}
              </h2>
              <button onClick={closeModal} className="btn-ghost !p-2" aria-label="Close">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div>
                <label className="label">Title *</label>
                <input
                  value={form.title}
                  onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                  className="input"
                  placeholder="e.g. Aurora Headphones"
                  required
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  rows={3}
                  className="input resize-none"
                  placeholder="Product details…"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="label">Price ($) *</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={form.price}
                    onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
                <div>
                  <label className="label">Stock *</label>
                  <input
                    type="number"
                    min="0"
                    value={form.stock}
                    onChange={(e) => setForm((f) => ({ ...f, stock: e.target.value }))}
                    className="input"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="label">Category</label>
                <select
                  value={form.category}
                  onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                  className="input"
                >
                  <option value="">— No category —</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label">Image</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) =>
                    setForm((f) => ({ ...f, image: e.target.files?.[0] || null }))
                  }
                  className="block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-3 file:py-2 file:text-sm file:font-semibold file:text-brand-700 hover:file:bg-brand-100"
                />
              </div>

              <label className="flex cursor-pointer items-center gap-2.5">
                <input
                  type="checkbox"
                  checked={form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-slate-700">Visible on storefront</span>
              </label>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={closeModal}
                  className="btn-outline flex-1"
                >
                  Cancel
                </button>
                <button type="submit" disabled={saving} className="btn-primary flex-1">
                  {saving ? (
                    <>
                      <Loader2 size={16} className="animate-spin" /> Saving…
                    </>
                  ) : (
                    'Save product'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------ Delete confirm */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => !deleting && setDeleteTarget(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-sm animate-fade-in rounded-2xl bg-white p-6 text-center shadow-2xl"
          >
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-red-100 text-red-600">
              <AlertTriangle size={26} />
            </div>
            <h2 className="mt-4 text-lg font-bold text-slate-900">Delete product?</h2>
            <p className="mt-1.5 text-sm text-slate-500">
              “{deleteTarget.title}” will be permanently removed. This cannot be undone.
            </p>
            <div className="mt-6 flex gap-3">
              <button
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
                className="btn-outline flex-1"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="btn-danger flex-1"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" /> Deleting…
                  </>
                ) : (
                  'Delete'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}