import { Link } from 'react-router-dom';
import {
  ShoppingBag, Mail, Phone, MapPin, Globe, Send, Camera, Code,
} from 'lucide-react';

const categories = ['Electronics', 'Fashion', 'Home & Kitchen', 'Books', 'Sports'];

export default function Footer() {
  return (
    <footer className="mt-20 border-t border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
      <div className="container-app grid gap-10 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
              <ShoppingBag size={18} />
            </span>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white">
              Shop<span className="text-brand-600 dark:text-brand-400">Front</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-slate-500 dark:text-slate-400">
            Curated products, honest prices and fast delivery. Built for people who love great things.
          </p>
          <div className="mt-5 flex gap-2">
            {[Globe, Send, Camera, Code].map((Icon, i) => (
              <a key={i} href="#" aria-label="social"
                className="flex h-9 w-9 items-center justify-center rounded-lg border border-slate-200 text-slate-500 transition hover:border-brand-300 hover:bg-brand-50 hover:text-brand-600 dark:border-slate-700 dark:text-slate-400 dark:hover:border-brand-500 dark:hover:bg-brand-900/30 dark:hover:text-brand-300">
                <Icon size={16} />
              </a>
            ))}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Quick Links</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { to: '/', label: 'Home' },
              { to: '/products', label: 'All Products' },
              { to: '/cart', label: 'Cart' },
              { to: '/my-orders', label: 'My Orders' },
              { to: '/login', label: 'Sign in' },
            ].map((l) => (
              <li key={l.to}>
                <Link to={l.to} className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Categories</h4>
          <ul className="mt-4 space-y-2.5 text-sm">
            {categories.map((c) => (
              <li key={c}>
                <Link to={`/products?category=${encodeURIComponent(c)}`}
                  className="text-slate-500 transition hover:text-brand-600 dark:text-slate-400 dark:hover:text-brand-400">
                  {c}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-bold uppercase tracking-wider text-slate-900 dark:text-slate-100">Contact</h4>
          <ul className="mt-4 space-y-3 text-sm text-slate-500 dark:text-slate-400">
            <li className="flex items-start gap-2.5">
              <MapPin size={16} className="mt-0.5 shrink-0 text-brand-500 dark:text-brand-400" />
              <span>128 Market Street, Suite 400<br />San Francisco, CA 94103</span>
            </li>
            <li className="flex items-center gap-2.5">
              <Phone size={16} className="shrink-0 text-brand-500 dark:text-brand-400" />
              <a href="tel:+15551234567" className="hover:text-brand-600 dark:hover:text-brand-400">+1 (555) 123-4567</a>
            </li>
            <li className="flex items-center gap-2.5">
              <Mail size={16} className="shrink-0 text-brand-500 dark:text-brand-400" />
              <a href="mailto:hello@shopfront.dev" className="hover:text-brand-600 dark:hover:text-brand-400">hello@shopfront.dev</a>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="container-app flex flex-col items-center justify-between gap-3 py-6 text-xs text-slate-500 sm:flex-row dark:text-slate-400">
          <p>© {new Date().getFullYear()} ShopFront. All rights reserved.</p>
          <div className="flex gap-5">
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400">Privacy Policy</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400">Terms of Service</a>
            <a href="#" className="hover:text-brand-600 dark:hover:text-brand-400">Refunds</a>
          </div>
        </div>
      </div>
    </footer>
  );
}