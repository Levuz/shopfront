import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, ShoppingBag, Loader2, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';

export default function Register() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    username: '', email: '', first_name: '', last_name: '', password: '', password2: '',
  });
  const [show, setShow] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const change = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const strength = (() => {
    const p = form.password;
    if (!p) return 0;
    let s = 0;
    if (p.length >= 6) s += 1;
    if (p.length >= 10) s += 1;
    if (/[A-Z]/.test(p) && /[a-z]/.test(p)) s += 1;
    if (/\d/.test(p)) s += 1;
    if (/[^A-Za-z0-9]/.test(p)) s += 1;
    return Math.min(s, 4);
  })();

  const strengthMeta = [
    { label: '', color: '' },
    { label: 'Weak', color: 'bg-red-500' },
    { label: 'Fair', color: 'bg-amber-500' },
    { label: 'Good', color: 'bg-yellow-500' },
    { label: 'Strong', color: 'bg-emerald-500' },
  ][strength];

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password !== form.password2) {
      setError('Passwords do not match.');
      return;
    }
    if (form.password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created — welcome to ShopFront!');
      navigate('/', { replace: true });
    } catch (err) {
      const data = err.response?.data;
      let msg = 'Registration failed. Please try again.';
      if (data && typeof data === 'object') {
        const firstKey = Object.keys(data)[0];
        const val = data[firstKey];
        msg = Array.isArray(val) ? val[0] : String(val);
      }
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg">
            <ShoppingBag size={22} />
          </div>
          <h1 className="mt-4 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
            Create your account
          </h1>
          <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">
            Join ShopFront and start shopping
          </p>
        </div>

        <form onSubmit={submit} className="card space-y-5 p-6 sm:p-7 animate-fade-in">
          {error && (
            <div className="rounded-lg border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-700 dark:border-red-900/50 dark:bg-red-900/20 dark:text-red-300">
              {error}
            </div>
          )}

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="label">First name</label>
              <input name="first_name" value={form.first_name} onChange={change} className="input" placeholder="Jane" />
            </div>
            <div>
              <label className="label">Last name</label>
              <input name="last_name" value={form.last_name} onChange={change} className="input" placeholder="Doe" />
            </div>
          </div>

          <div>
            <label className="label">Username *</label>
            <input name="username" value={form.username} onChange={change} autoComplete="username" className="input" placeholder="Choose a username" required minLength={3} />
          </div>

          <div>
            <label className="label">Email *</label>
            <input name="email" type="email" value={form.email} onChange={change} autoComplete="email" className="input" placeholder="you@example.com" required />
          </div>

          <div>
            <label className="label">Password *</label>
            <div className="relative">
              <input
                name="password"
                type={show ? 'text' : 'password'}
                value={form.password}
                onChange={change}
                autoComplete="new-password"
                className="input pr-10"
                placeholder="At least 6 characters"
                required
                minLength={6}
              />
              <button
                type="button"
                onClick={() => setShow((v) => !v)}
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:text-slate-500 dark:hover:bg-slate-700"
              >
                {show ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            {form.password && (
              <div className="mt-2">
                <div className="flex gap-1">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition ${
                        i <= strength ? strengthMeta.color : 'bg-slate-200 dark:bg-slate-700'
                      }`}
                    />
                  ))}
                </div>
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  Password strength: <span className="font-semibold">{strengthMeta.label || '—'}</span>
                </p>
              </div>
            )}
          </div>

          <div>
            <label className="label">Confirm password *</label>
            <input
              name="password2"
              type={show ? 'text' : 'password'}
              value={form.password2}
              onChange={change}
              autoComplete="new-password"
              className="input"
              placeholder="Repeat your password"
              required
              minLength={6}
            />
            {form.password2 && form.password === form.password2 && (
              <p className="mt-1.5 flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 size={12} /> Passwords match
              </p>
            )}
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full !py-3 text-base">
            {loading ? <><Loader2 size={17} className="animate-spin" /> Creating account…</> : 'Create account'}
          </button>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Already have an account?{' '}
            <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-700 dark:text-brand-400 dark:hover:text-brand-300">
              Sign in
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
}