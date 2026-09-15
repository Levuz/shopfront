import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, Search, X } from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import Pagination from '../components/Pagination';
import EmptyState from '../components/EmptyState';
import { SkeletonCard } from '../components/Loader';

const SORTS = [
  { value: '-created_at', label: 'Newest' },
  { value: 'price', label: 'Price: Low → High' },
  { value: '-price', label: 'Price: High → Low' },
  { value: 'title', label: 'Name: A → Z' },
];

export default function Products() {
  const [params, setParams] = useSearchParams();
  const [data, setData] = useState({ results: [], count: 0 });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);

  const search = params.get('search') || '';
  const category = params.get('category') || '';
  const ordering = params.get('ordering') || '-created_at';
  const page = Number(params.get('page') || 1);
  const inStock = params.get('in_stock') === '1';

  const setParam = (key, value) => {
    const next = new URLSearchParams(params);
    if (value) next.set(key, value);
    else next.delete(key);
    if (key !== 'page') next.delete('page');
    setParams(next);
  };

  useEffect(() => {
    api.get('/categories/')
      .then((r) => setCategories(r.data.results ?? r.data))
      .catch(() => {});
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data: res } = await api.get('/products/', {
        params: {
          page,
          ordering,
          ...(search && { search }),
          ...(category && { category }),
          ...(inStock && { in_stock: 1 }),
        },
      });
      setData({
        results: res.results ?? res,
        count: res.count ?? (res.results ?? res).length,
      });
    } catch {
      setData({ results: [], count: 0 });
    } finally {
      setLoading(false);
    }
  }, [page, ordering, search, category, inStock]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const pageSize = 12;
  const totalPages = Math.ceil(data.count / pageSize);
  const hasFilters = !!(search || category || inStock);

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="mb-7">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          {category
            ? categories.find((c) => c.slug === category)?.name || 'Products'
            : 'All Products'}
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {loading ? 'Loading…' : `${data.count} product${data.count === 1 ? '' : 's'} found`}
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-[250px_1fr]">
        <aside className={`${showFilters ? 'block' : 'hidden'} lg:block`}>
          <div className="card sticky top-24 space-y-6 p-5">
            <div>
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Category
              </h3>
              <div className="space-y-1">
                <button
                  onClick={() => setParam('category', '')}
                  className={`block w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    !category
                      ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                      : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                  }`}
                >
                  All categories
                </button>
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setParam('category', c.slug)}
                    className={`flex w-full items-center justify-between rounded-lg px-3 py-2 text-left text-sm transition ${
                      category === c.slug
                        ? 'bg-brand-50 font-semibold text-brand-700 dark:bg-brand-900/30 dark:text-brand-300'
                        : 'text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800'
                    }`}
                  >
                    <span className="truncate">{c.name}</span>
                    <span className="ml-2 shrink-0 text-xs text-slate-400 dark:text-slate-500">{c.product_count}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="border-t border-slate-100 pt-5 dark:border-slate-800">
              <h3 className="mb-3 text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">
                Availability
              </h3>
              <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-slate-50 dark:hover:bg-slate-800">
                <input
                  type="checkbox"
                  checked={inStock}
                  onChange={(e) => setParam('in_stock', e.target.checked ? '1' : '')}
                  className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
                />
                <span className="text-sm text-slate-600 dark:text-slate-300">In stock only</span>
              </label>
            </div>

            {hasFilters && (
              <button
                onClick={() => setParams(new URLSearchParams())}
                className="btn-outline w-full border-red-200 text-red-600 hover:bg-red-50 dark:border-red-900/50 dark:text-red-400 dark:hover:bg-red-900/20"
              >
                <X size={15} /> Clear filters
              </button>
            )}
          </div>
        </aside>

        <div>
          <div className="mb-6 flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search size={17} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
              <input
                defaultValue={search}
                onKeyDown={(e) => e.key === 'Enter' && setParam('search', e.target.value)}
                placeholder="Search products…"
                className="input pl-10"
              />
            </div>

            <select
              value={ordering}
              onChange={(e) => setParam('ordering', e.target.value)}
              className="input w-auto min-w-[180px]"
            >
              {SORTS.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>

            <button onClick={() => setShowFilters((v) => !v)} className="btn-outline lg:hidden">
              <SlidersHorizontal size={16} /> Filters
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : data.results.length === 0 ? (
            <EmptyState
              title="No products found"
              description="Try adjusting your filters or search term."
              actionLabel="Clear filters"
              actionTo="/products"
            />
          ) : (
            <>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
                {data.results.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              <Pagination
                page={page}
                totalPages={totalPages}
                onChange={(p) => setParam('page', String(p))}
              />
            </>
          )}
        </div>
      </div>
    </div>
  );
}