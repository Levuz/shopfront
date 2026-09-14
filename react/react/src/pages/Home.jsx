import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight, Truck, ShieldCheck, RefreshCw, Headphones, Sparkles,
} from 'lucide-react';
import api from '../api/axios';
import ProductCard from '../components/ProductCard';
import { SkeletonCard } from '../components/Loader';

const PERKS = [
  { icon: Truck, title: 'Free Shipping', text: 'On orders over $100' },
  { icon: ShieldCheck, title: 'Secure Payment', text: '256-bit SSL encryption' },
  { icon: RefreshCw, title: 'Easy Returns', text: '30-day money back' },
  { icon: Headphones, title: '24/7 Support', text: 'Always here to help' },
];

export default function Home() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [pRes, cRes] = await Promise.all([
          api.get('/products/', { params: { page_size: 8, ordering: '-created_at' } }),
          api.get('/categories/'),
        ]);
        if (!alive) return;
        setProducts(pRes.data.results ?? pRes.data);
        setCategories(cRes.data.results ?? cRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  return (
    <div>
      {/* -------------------------------------------------------- HERO */}
      <section className="relative overflow-hidden bg-slate-900">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_rgba(99,102,241,.35),transparent_55%)]" />
        <div className="absolute -left-24 top-1/2 h-72 w-72 -translate-y-1/2 rounded-full bg-brand-600/25 blur-3xl" />

        <div className="container-app relative grid items-center gap-10 py-16 sm:py-20 lg:grid-cols-2 lg:py-28">
          <div className="animate-fade-in">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-xs font-semibold text-brand-200 backdrop-blur">
              <Sparkles size={13} /> New season collection is live
            </span>

            <h1 className="mt-5 text-4xl font-extrabold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-6xl">
              Everything you love,
              <br />
              <span className="bg-gradient-to-r from-brand-300 to-indigo-200 bg-clip-text text-transparent">
                delivered fast.
              </span>
            </h1>

            <p className="mt-5 max-w-lg text-base leading-relaxed text-slate-300 sm:text-lg">
              Discover thousands of hand-picked products across electronics,
              fashion, home and more — with free shipping over $100.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/products" className="btn-primary !px-6 !py-3 text-base">
                Shop Now <ArrowRight size={18} />
              </Link>
              <Link
                to="/products?ordering=-price"
                className="btn !px-6 !py-3 text-base border border-white/20 text-white hover:bg-white/10"
              >
                Browse Best Sellers
              </Link>
            </div>

            <div className="mt-10 flex flex-wrap gap-x-10 gap-y-4">
              {[
                ['10k+', 'Happy customers'],
                ['5k+', 'Products'],
                ['4.9★', 'Avg. rating'],
              ].map(([v, l]) => (
                <div key={l}>
                  <p className="text-2xl font-extrabold text-white">{v}</p>
                  <p className="text-xs uppercase tracking-wider text-slate-400">{l}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((p, i) => (
                <div
                  key={p.id}
                  className={`overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur ${
                    i % 2 === 1 ? 'translate-y-6' : ''
                  }`}
                >
                  <div className="aspect-square bg-slate-800">
                    {p.image_url ? (
                      <img
                        src={p.image_url}
                        alt={p.title}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- PERKS */}
      <section className="border-b border-slate-200 bg-white">
        <div className="container-app grid grid-cols-2 gap-6 py-8 lg:grid-cols-4">
          {PERKS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-50 text-brand-600">
                <Icon size={20} />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{title}</p>
                <p className="truncate text-xs text-slate-500">{text}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* -------------------------------------------------- CATEGORIES */}
      {categories.length > 0 && (
        <section className="container-app py-14">
          <div className="mb-7 flex items-end justify-between">
            <div>
              <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
                Shop by category
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Find exactly what you're looking for
              </p>
            </div>
            <Link
              to="/products"
              className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex items-center gap-1"
            >
              View all <ArrowRight size={15} />
            </Link>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            {categories.slice(0, 6).map((c) => (
              <Link
                key={c.id}
                to={`/products?category=${c.slug}`}
                className="card group flex flex-col items-center gap-2 p-5 text-center transition hover:-translate-y-1 hover:border-brand-300 hover:shadow-lift"
              >
                <span className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-50 text-lg font-bold text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white">
                  {c.name.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-slate-800">{c.name}</span>
                <span className="text-xs text-slate-400">{c.product_count} items</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ---------------------------------------------------- FEATURED */}
      <section className="container-app pb-14">
        <div className="mb-7 flex items-end justify-between">
          <div>
            <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 sm:text-3xl">
              Featured products
            </h2>
            <p className="mt-1 text-sm text-slate-500">Hand-picked just for you</p>
          </div>
          <Link
            to="/products"
            className="hidden text-sm font-semibold text-brand-600 hover:text-brand-700 sm:flex items-center gap-1"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="card p-12 text-center text-sm text-slate-500">
            No products yet. Run{' '}
            <code className="rounded bg-slate-100 px-1.5 py-0.5">
              python manage.py seed_data
            </code>
            .
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}

        <div className="mt-8 flex justify-center sm:hidden">
          <Link to="/products" className="btn-outline w-full">
            View all products
          </Link>
        </div>
      </section>

      
      <section className="container-app pb-16">
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-indigo-700 px-8 py-12 sm:px-14 sm:py-16">
          <div className="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="relative max-w-xl">
            <span className="badge bg-white/15 text-white">Limited time</span>
            <h3 className="mt-4 text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              Get 20% off your first order
            </h3>
            <p className="mt-3 text-brand-100">
              Use code{' '}
              <span className="rounded bg-white/15 px-2 py-0.5 font-mono font-bold text-white">
                WELCOME20
              </span>{' '}
              at checkout. Free shipping on orders over $100.
            </p>
            <Link
              to="/products"
              className="btn mt-7 bg-white !px-6 !py-3 text-base font-bold text-brand-700 hover:bg-brand-50"
            >
              Start shopping <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}