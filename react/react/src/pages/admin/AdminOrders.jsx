import { useEffect, useState, useCallback } from 'react';
import {
  Search, ChevronDown, Package, Mail, Phone, MapPin, X,
} from 'lucide-react';
import api from '../../api/axios';
import { useToast } from '../../context/ToastContext';
import Loader from '../../components/Loader';
import EmptyState from '../../components/EmptyState';
import Pagination from '../../components/Pagination';

const STATUSES = ['Pending', 'Processing', 'Completed', 'Cancelled'];

const STATUS_BADGES = {
  Pending:    'bg-amber-100 text-amber-700 border-amber-200',
  Processing: 'bg-blue-100 text-blue-700 border-blue-200',
  Completed:  'bg-emerald-100 text-emerald-700 border-emerald-200',
  Cancelled:  'bg-red-100 text-red-700 border-red-200',
};

export default function AdminOrders() {
  const toast = useToast();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [count, setCount] = useState(0);
  const [detail, setDetail] = useState(null);

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/admin/orders/', {
        params: {
          page,
          search: search || undefined,
          status: statusFilter || undefined,
        },
      });
      setOrders(data.results ?? data);
      setCount(data.count ?? (data.results ?? data).length);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  }, [page, search, statusFilter, toast]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const updateStatus = async (order, newStatus) => {
    const old = order.status;
    setOrders((prev) =>
      prev.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o))
    );
    try {
      await api.patch(`/admin/orders/${order.id}/`, { status: newStatus });
      toast.success(`Order #${order.id} → ${newStatus}`);
    } catch {
      setOrders((prev) =>
        prev.map((o) => (o.id === order.id ? { ...o, status: old } : o))
      );
      toast.error('Failed to update status');
    }
  };

  const totalPages = Math.ceil(count / 12);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 sm:text-2xl">Orders</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {count} order{count === 1 ? '' : 's'} total
        </p>
      </div>

      <div className="flex flex-wrap gap-3">
        <div className="relative min-w-[220px] flex-1">
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
            placeholder="Search by order #, username or email…"
            className="input pl-10"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => {
            setStatusFilter(e.target.value);
            setPage(1);
          }}
          className="input w-auto min-w-[160px]"
        >
          <option value="">All statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <Loader />
      ) : orders.length === 0 ? (
        <EmptyState
          icon={Package}
          title="No orders found"
          description="Adjust your filters or wait for orders to come in."
        />
      ) : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[820px] text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-3 text-left font-semibold">Order</th>
                  <th className="px-5 py-3 text-left font-semibold">Customer</th>
                  <th className="px-5 py-3 text-left font-semibold">Date</th>
                  <th className="px-5 py-3 text-center font-semibold">Items</th>
                  <th className="px-5 py-3 text-right font-semibold">Total</th>
                  <th className="px-5 py-3 text-left font-semibold">Status</th>
                  <th className="px-5 py-3 text-right font-semibold"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60">
                    <td className="px-5 py-3 font-semibold text-slate-800">
                      #{o.id}
                    </td>
                    <td className="px-5 py-3">
                      <p className="font-medium text-slate-800">{o.username}</p>
                      <p className="text-xs text-slate-500">
                        {o.email || o.user_email}
                      </p>
                    </td>
                    <td className="px-5 py-3 text-xs text-slate-500">
                      {new Date(o.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-5 py-3 text-center text-slate-700">
                      {o.item_count}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900">
                      ${Number(o.total_price).toFixed(2)}
                    </td>
                    <td className="px-5 py-3">
                      <div className="relative inline-block">
                        <select
                          value={o.status}
                          onChange={(e) => updateStatus(o, e.target.value)}
                          className={`cursor-pointer appearance-none rounded-full border py-1.5 pl-3 pr-8 text-xs font-bold transition focus:outline-none focus:ring-2 focus:ring-brand-500/30 ${STATUS_BADGES[o.status]}`}
                        >
                          {STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                        <ChevronDown
                          size={12}
                          className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2"
                        />
                      </div>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => setDetail(o)}
                        className="btn-ghost !text-xs"
                      >
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />

      {detail && (
        <div className="fixed inset-0 z-50 bg-black/50" onClick={() => setDetail(null)}>
          <div
            onClick={(e) => e.stopPropagation()}
            className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl animate-slide-in"
          >
            <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  Order #{detail.id}
                </h2>
                <p className="text-xs text-slate-500">
                  {new Date(detail.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setDetail(null)}
                className="btn-ghost !p-2"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6">
              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Customer
                </h3>
                <div className="rounded-xl bg-slate-50 p-4 text-sm space-y-2">
                  <p className="font-semibold text-slate-800">
                    {detail.full_name || detail.username}
                  </p>
                  <p className="flex items-center gap-2 text-slate-600">
                    <Mail size={13} /> {detail.email || detail.user_email}
                  </p>
                  {detail.phone && (
                    <p className="flex items-center gap-2 text-slate-600">
                      <Phone size={13} /> {detail.phone}
                    </p>
                  )}
                  {detail.address && (
                    <p className="flex items-start gap-2 text-slate-600">
                      <MapPin size={13} className="mt-0.5 shrink-0" /> {detail.address}
                    </p>
                  )}
                </div>
              </section>

              <section>
                <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                  Items ({detail.item_count})
                </h3>
                <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                  {detail.items.map((it) => (
                    <li key={it.id} className="flex items-center gap-3 p-3">
                      <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                        {it.product_image ? (
                          <img
                            src={it.product_image}
                            alt={it.title}
                            className="h-full w-full object-cover"
                          />
                        ) : (
                          <div className="h-full w-full" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="line-clamp-1 text-xs font-semibold text-slate-800">
                          {it.title}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          Qty {it.quantity} × ${Number(it.price).toFixed(2)}
                        </p>
                      </div>
                      <span className="text-xs font-bold text-slate-800">
                        ${Number(it.subtotal).toFixed(2)}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="border-t border-slate-200 p-5">
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-500">Order total</span>
                <span className="text-xl font-extrabold text-slate-900">
                  ${Number(detail.total_price).toFixed(2)}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}