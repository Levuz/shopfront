import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  DollarSign, ShoppingCart, Package, Users, TrendingUp, AlertTriangle,
} from 'lucide-react';
import api from '../../api/axios';
import Loader from '../../components/Loader';

const STAT_STYLES = {
  revenue:  { icon: DollarSign,   color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/30' },
  orders:   { icon: ShoppingCart, color: 'text-blue-600 dark:text-blue-400',       bg: 'bg-blue-50 dark:bg-blue-900/30' },
  products: { icon: Package,      color: 'text-purple-600 dark:text-purple-400',   bg: 'bg-purple-50 dark:bg-purple-900/30' },
  users:    { icon: Users,        color: 'text-amber-600 dark:text-amber-400',     bg: 'bg-amber-50 dark:bg-amber-900/30' },
};

const STATUS_BADGES = {
  Pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats/')
      .then((r) => setStats(r.data))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full />;
  if (!stats) return <p className="text-slate-500 dark:text-slate-400">Failed to load stats.</p>;

  const cards = [
    { key: 'revenue',  label: 'Total revenue', value: `$${stats.total_revenue.toFixed(2)}` },
    { key: 'orders',   label: 'Total orders',  value: stats.total_orders },
    { key: 'products', label: 'Products',      value: stats.total_products, extra: `${stats.active_products} active` },
    { key: 'users',    label: 'Customers',     value: stats.total_users },
  ];

  const maxRev = Math.max(...stats.revenue_series.map((s) => s.revenue), 1);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">Dashboard overview</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          A snapshot of your store's performance.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        {cards.map(({ key, label, value, extra }) => {
          const S = STAT_STYLES[key];
          const Icon = S.icon;
          return (
            <div key={key} className="card p-4 sm:p-5">
              <div className="flex items-start justify-between">
                <div className="min-w-0">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">{label}</p>
                  <p className="mt-2 truncate text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">{value}</p>
                  {extra && <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">{extra}</p>}
                </div>
                <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${S.bg} ${S.color}`}>
                  <Icon size={18} />
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {stats.low_stock_products > 0 && (
        <div className="flex items-center gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-200">
          <AlertTriangle size={18} className="shrink-0" />
          <p>
            <span className="font-bold">{stats.low_stock_products}</span> product
            {stats.low_stock_products === 1 ? '' : 's'} with low stock.{' '}
            <Link to="/admin/products" className="font-semibold underline">Review inventory →</Link>
          </p>
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="card p-5 lg:col-span-2">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Revenue — last 7 days</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Excludes cancelled orders</p>
            </div>
            <TrendingUp size={18} className="text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="flex h-40 items-end justify-between gap-2 sm:gap-3">
            {stats.revenue_series.map((d) => {
              const h = (d.revenue / maxRev) * 100;
              return (
                <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
                  <div className="relative flex w-full flex-1 items-end">
                    <div
                      className="w-full rounded-t-md bg-gradient-to-t from-brand-600 to-brand-400 transition-all duration-500"
                      style={{ height: `${Math.max(h, 3)}%` }}
                      title={`$${d.revenue.toFixed(2)}`}
                    />
                  </div>
                  <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{d.date}</span>
                </div>
              );
            })}
          </div>
        </div>

        <div className="card p-5">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Orders by status</h3>
          <div className="mt-4 space-y-3">
            {Object.entries(stats.orders_by_status).map(([k, v]) => {
              const pct = stats.total_orders ? (v / stats.total_orders) * 100 : 0;
              return (
                <div key={k}>
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="font-medium text-slate-600 dark:text-slate-300">{k}</span>
                    <span className="font-bold text-slate-800 dark:text-slate-100">{v}</span>
                  </div>
                  <div className="h-1.5 overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        k === 'Pending'    ? 'bg-amber-500'
                        : k === 'Processing' ? 'bg-blue-500'
                        : k === 'Completed'  ? 'bg-emerald-500'
                        : 'bg-red-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-slate-800">
          <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Recent orders</h3>
          <Link to="/admin/orders" className="text-xs font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
            View all →
          </Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500 dark:bg-slate-800/50 dark:text-slate-400">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Order</th>
                <th className="px-5 py-3 text-left font-semibold">Customer</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3 text-right font-semibold">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {stats.recent_orders.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                    No orders yet.
                  </td>
                </tr>
              ) : (
                stats.recent_orders.map((o) => (
                  <tr key={o.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40">
                    <td className="px-5 py-3 font-semibold text-slate-800 dark:text-slate-100">#{o.id}</td>
                    <td className="px-5 py-3 text-slate-600 dark:text-slate-300">{o.username}</td>
                    <td className="px-5 py-3">
                      <span className={`badge ${STATUS_BADGES[o.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                        {o.status}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-slate-900 dark:text-slate-100">
                      ${Number(o.total_price).toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}