import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight, Calendar } from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';
import EmptyState from '../components/EmptyState';

const STATUS_STYLES = {
  Pending:    'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
  Processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300',
  Completed:  'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
  Cancelled:  'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300',
};

export default function MyOrders() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/orders/my-orders/')
      .then((r) => setOrders(r.data.results ?? r.data))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <Loader full label="Loading your orders…" />;

  if (orders.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={Package}
          title="No orders yet"
          description="Once you place an order it will appear here."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="mb-8">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
          My Orders
        </h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          {orders.length} order{orders.length === 1 ? '' : 's'} total
        </p>
      </div>

      <div className="space-y-4">
        {orders.map((o) => (
          <div key={o.id} className="card overflow-hidden animate-fade-in">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-5">
              <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-sm">
                <span className="font-bold text-slate-900 dark:text-slate-100">Order #{o.id}</span>
                <span className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
                  <Calendar size={13} />
                  {new Date(o.created_at).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' })}
                </span>
              </div>
              <span className={`badge ${STATUS_STYLES[o.status] || 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'}`}>
                {o.status}
              </span>
            </div>

            <div className="divide-y divide-slate-100 dark:divide-slate-800">
              {o.items.slice(0, 2).map((it) => (
                <div key={it.id} className="flex items-center gap-3 px-4 py-3 sm:px-5">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800">
                    {it.product_image ? (
                      <img src={it.product_image} alt={it.title} className="h-full w-full object-cover" />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-sm font-semibold text-slate-800 dark:text-slate-100">{it.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Qty {it.quantity} · ${Number(it.price).toFixed(2)}
                    </p>
                  </div>
                  <p className="text-sm font-bold text-slate-800 dark:text-slate-100">
                    ${Number(it.subtotal).toFixed(2)}
                  </p>
                </div>
              ))}
              {o.items.length > 2 && (
                <p className="px-4 py-2.5 text-xs text-slate-500 dark:text-slate-400 sm:px-5">
                  + {o.items.length - 2} more item{o.items.length - 2 === 1 ? '' : 's'}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 bg-slate-50/60 px-4 py-3 dark:border-slate-800 dark:bg-slate-900/50 sm:px-5">
              <span className="text-sm text-slate-500 dark:text-slate-400">
                {o.item_count} item{o.item_count === 1 ? '' : 's'}
              </span>
              <div className="flex items-center gap-4">
                <span className="text-base font-extrabold text-slate-900 dark:text-slate-100">
                  ${Number(o.total_price).toFixed(2)}
                </span>
                <Link to={`/product/${o.items[0]?.product || ''}`} className="btn-ghost !p-1.5 text-slate-400 dark:text-slate-500">
                  <ChevronRight size={18} />
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}