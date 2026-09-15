import { Link, useNavigate } from 'react-router-dom';
import {
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, ImageOff, ArrowLeft,
} from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import EmptyState from '../components/EmptyState';

export default function Cart() {
  const {
    items, updateQuantity, removeFromCart,
    subtotal, shipping, total, totalItems,
  } = useCart();
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();

  if (items.length === 0) {
    return (
      <div className="container-app py-16">
        <EmptyState
          icon={ShoppingBag}
          title="Your cart is empty"
          description="Browse products and add something you love."
          actionLabel="Start shopping"
          actionTo="/products"
        />
      </div>
    );
  }

  const goCheckout = () => {
    navigate(isAuthenticated ? '/checkout' : '/login?redirect=/checkout');
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <div className="mb-7 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100 sm:text-3xl">
            Shopping Cart
          </h1>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            {totalItems} item{totalItems === 1 ? '' : 's'} in your cart
          </p>
        </div>
        <Link to="/products" className="btn-ghost hidden sm:flex">
          <ArrowLeft size={16} /> Continue shopping
        </Link>
      </div>

      <div className="grid gap-8 lg:grid-cols-[1fr_360px]">
        <div className="card divide-y divide-slate-100 overflow-hidden dark:divide-slate-800">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 p-4 sm:p-5">
              <Link
                to={`/product/${item.id}`}
                className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-slate-100 dark:bg-slate-800 sm:h-24 sm:w-24"
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
                    <ImageOff size={22} />
                  </div>
                )}
              </Link>

              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <Link
                    to={`/product/${item.id}`}
                    className="line-clamp-2 text-sm font-semibold text-slate-800 hover:text-brand-700 dark:text-slate-100 dark:hover:text-brand-300"
                  >
                    {item.title}
                  </Link>
                  <button
                    onClick={() => removeFromCart(item.id)}
                    className="btn-ghost !p-2 text-slate-400 hover:!bg-red-50 hover:text-red-600 dark:text-slate-500 dark:hover:!bg-red-900/20 dark:hover:text-red-400"
                    aria-label="Remove"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>

                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  ${item.price.toFixed(2)} each
                </p>

                <div className="mt-auto flex items-center justify-between pt-3">
                  <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white dark:border-slate-700 dark:bg-slate-800">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Minus size={14} />
                    </button>
                    <span className="w-9 text-center text-sm font-bold text-slate-900 dark:text-slate-100">
                      {item.quantity}
                    </span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.stock}
                      className="flex h-8 w-8 items-center justify-center text-slate-600 hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:hover:bg-slate-700"
                    >
                      <Plus size={14} />
                    </button>
                  </div>

                  <p className="text-base font-bold text-slate-900 dark:text-slate-100">
                    ${(item.price * item.quantity).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100">Order Summary</h2>

            <dl className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Subtotal</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">${subtotal.toFixed(2)}</dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-slate-500 dark:text-slate-400">Shipping</dt>
                <dd className="font-semibold text-slate-800 dark:text-slate-200">
                  {shipping === 0 ? <span className="text-emerald-600 dark:text-emerald-400">Free</span> : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              {subtotal < 100 && (
                <p className="rounded-lg bg-brand-50 px-3 py-2 text-xs text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  Add <span className="font-bold">${(100 - subtotal).toFixed(2)}</span> more for free shipping.
                </p>
              )}
              <div className="flex items-center justify-between border-t border-slate-200 pt-3 text-base dark:border-slate-800">
                <dt className="font-bold text-slate-900 dark:text-slate-100">Total</dt>
                <dd className="font-extrabold text-slate-900 dark:text-slate-100">${total.toFixed(2)}</dd>
              </div>
            </dl>

            <button onClick={goCheckout} className="btn-primary w-full !py-3 text-base">
              Checkout <ArrowRight size={18} />
            </button>

            <Link to="/products" className="block text-center text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              or continue shopping
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}