import { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Login() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const redirect = params.get('redirect') || '/';

  const [form, setForm] = useState({ username: '', password: '' });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(form.username.trim(), form.password);
      toast.success(`Welcome back, ${user.username}!`);
      navigate(user.is_admin || user.is_staff ? '/admin' : redirect, { replace: true });
    } catch (err) {
      const msg = err.response?.data?.detail || 'Invalid username or password.';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (u, p) => {
    setForm({ username: u, password: p });
    toast.info(`Demo ${u === 'admin' ? 'admin' : 'customer'} credentials filled`);
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
            <ShoppingBag size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Welcome back
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Sign in to continue to ShopFront
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-6 sm:p-7 animate-fade-in">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div>
            <label className="label">Username</label>
            <input
              name="username"
              value={form.username}
              onChange={change}
              autoComplete="username"
              className="input"
              placeholder="Enter your username"
              required
            />
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="label !mb-0">Password</label>
              <a href="#" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
                Forgot?
              </a>
            </div>
            <div className="relative">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={change}
                autoComplete="current-password"
                className="input pr-10"
                placeholder="••••••••"
                required
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Signing in…</> : 'Sign in'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              Sign up
            </Link>
          </p>
        </form>

        <div className="mt-6 rounded-xl border border-dashed border-slate-300 bg-white/60 p-4 text-xs dark:border-slate-700 dark:bg-slate-900/40">
          <p className="mb-2 font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Demo accounts
          </p>
          <div className="grid grid-cols-2 gap-2">
            <button onClick={() => fillDemo('admin', 'admin12345')} className="btn-outline !py-2 !text-xs">
              👑 Admin
            </button>
            <button onClick={() => fillDemo('customer', 'customer12345')} className="btn-outline !py-2 !text-xs">
              🛒 Customer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}