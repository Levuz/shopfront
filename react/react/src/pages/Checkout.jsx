import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  CreditCard, Truck, Lock, CheckCircle2, ArrowLeft, ShieldCheck,
} from 'lucide-react';
import api from '../api/axios';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { Spinner } from '../components/Loader';

export default function Checkout() {
  const { items, subtotal, shipping, total, clearCart } = useCart();
  const { user } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    full_name:
      user?.full_name ||
      `${user?.first_name || ''} ${user?.last_name || ''}`.trim() ||
      user?.username ||
      '',
    email: user?.email || '',
    phone: user?.phone || '',
    address: user?.address || '',
    card: '4242 4242 4242 4242',
    expiry: '12/30',
    cvc: '123',
  });
  const [loading, setLoading] = useState(false);
  const [stage, setStage] = useState('form'); // 'form' | 'paying' | 'done'
  const [orderId, setOrderId] = useState(null);

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    if (items.length === 0) return toast.error('Your cart is empty.');
    if (!form.full_name || !form.email || !form.address) {
      return toast.error('Please fill in name, email and address.');
    }

    setLoading(true);
    setStage('paying');

    try {
      await new Promise((r) => setTimeout(r, 900)); // simulated payment

      const payload = {
        full_name: form.full_name,
        email: form.email,
        phone: form.phone,
        address: form.address,
        items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
      };

      const { data } = await api.post('/orders/', payload);
      setOrderId(data.id);
      clearCart();
      setStage('done');
      toast.success('Order placed successfully!');
    } catch (err) {
      setStage('form');
      const msg =
        err.response?.data?.items?.[0] ||
        err.response?.data?.detail ||
        'Payment failed. Please try again.';
      toast.error(typeof msg === 'string' ? msg : 'Checkout failed.');
    } finally {
      setLoading(false);
    }
  };

  /* ------------------------------------------------------ Success */
  if (stage === 'done') {
    return (
      <div className="container-app py-20">
        <div className="card mx-auto max-w-md p-8 text-center animate-fade-in">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
            <CheckCircle2 size={32} />
          </div>
          <h1 className="mt-5 text-2xl font-extrabold text-slate-900">Thank you!</h1>
          <p className="mt-2 text-sm text-slate-500">
            Your order{' '}
            <span className="font-bold text-slate-800">#{orderId}</span> has
            been placed. You'll receive a confirmation email shortly.
          </p>
          <div className="mt-7 flex flex-col gap-2 sm:flex-row sm:justify-center">
            <Link to="/my-orders" className="btn-primary">View my orders</Link>
            <Link to="/products" className="btn-outline">Continue shopping</Link>
          </div>
        </div>
      </div>
    );
  }

  /* -------------------------------------------------------- Empty */
  if (items.length === 0) {
    return (
      <div className="container-app py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Your cart is empty</h1>
        <Link to="/products" className="btn-primary mt-6">Shop now</Link>
      </div>
    );
  }

  return (
    <div className="container-app py-8 lg:py-12">
      <Link to="/cart" className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={16} /> Back to cart
      </Link>

      <h1 className="mb-8 text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
        Checkout
      </h1>

      <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_380px]">
        <div className="space-y-6">
          {/* Shipping */}
          <div className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <Truck size={18} />
              </span>
              <h2 className="text-lg font-bold text-slate-900">Shipping details</h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Full name *</label>
                <input
                  name="full_name"
                  value={form.full_name}
                  onChange={change}
                  className="input"
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div>
                <label className="label">Email *</label>
                <input
                  name="email"
                  type="email"
                  value={form.email}
                  onChange={change}
                  className="input"
                  placeholder="you@example.com"
                  required
                />
              </div>
              <div>
                <label className="label">Phone</label>
                <input
                  name="phone"
                  value={form.phone}
                  onChange={change}
                  className="input"
                  placeholder="+1 555 000 0000"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="label">Shipping address *</label>
                <textarea
                  name="address"
                  value={form.address}
                  onChange={change}
                  rows={3}
                  className="input resize-none"
                  placeholder="Street, city, state, ZIP"
                  required
                />
              </div>
            </div>
          </div>

          {/* Payment */}
          <div className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                <CreditCard size={18} />
              </span>
              <div>
                <h2 className="text-lg font-bold text-slate-900">Payment</h2>
                <p className="text-xs text-slate-500">Simulated — no real charge</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="sm:col-span-2">
                <label className="label">Card number</label>
                <input
                  name="card"
                  value={form.card}
                  onChange={change}
                  className="input font-mono"
                  placeholder="4242 4242 4242 4242"
                />
              </div>
              <div>
                <label className="label">Expiry</label>
                <input
                  name="expiry"
                  value={form.expiry}
                  onChange={change}
                  className="input font-mono"
                  placeholder="MM/YY"
                />
              </div>
              <div>
                <label className="label">CVC</label>
                <input
                  name="cvc"
                  value={form.cvc}
                  onChange={change}
                  className="input font-mono"
                  placeholder="123"
                />
              </div>
            </div>

            <p className="mt-4 flex items-center gap-2 text-xs text-slate-500">
              <Lock size={13} /> Your details are encrypted and secure.
            </p>
          </div>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24 lg:h-fit">
          <div className="card space-y-4 p-5 sm:p-6">
            <h2 className="text-lg font-bold text-slate-900">Your order</h2>

            <ul className="max-h-64 space-y-3 overflow-y-auto pr-1">
              {items.map((i) => (
                <li key={i.id} className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-100">
                    {i.image_url ? (
                      <img
                        src={i.image_url}
                        alt={i.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="line-clamp-1 text-xs font-semibold text-slate-800">
                      {i.title}
                    </p>
                    <p className="text-[11px] text-slate-500">Qty {i.quantity}</p>
                  </div>
                  <span className="text-xs font-bold text-slate-800">
                    ${(i.price * i.quantity).toFixed(2)}
                  </span>
                </li>
              ))}
            </ul>

            <dl className="space-y-2.5 border-t border-slate-200 pt-4 text-sm">
              <div className="flex justify-between">
                <dt className="text-slate-500">Subtotal</dt>
                <dd className="font-semibold text-slate-800">
                  ${subtotal.toFixed(2)}
                </dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-slate-500">Shipping</dt>
                <dd className="font-semibold text-slate-800">
                  {shipping === 0 ? 'Free' : `$${shipping.toFixed(2)}`}
                </dd>
              </div>
              <div className="flex justify-between border-t border-slate-200 pt-2.5 text-base">
                <dt className="font-bold text-slate-900">Total</dt>
                <dd className="font-extrabold text-slate-900">
                  ${total.toFixed(2)}
                </dd>
              </div>
            </dl>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full !py-3 text-base"
            >
              {loading ? (
                <>
                  <Spinner /> Processing…
                </>
              ) : (
                <>
                  <Lock size={16} /> Place order
                </>
              )}
            </button>

            <p className="flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <ShieldCheck size={13} /> Secure checkout
            </p>
          </div>
        </aside>
      </form>
    </div>
  );
}