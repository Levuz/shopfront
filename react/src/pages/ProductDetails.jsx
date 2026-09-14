import { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Minus, Plus, ShoppingCart, Truck, ShieldCheck,
  RefreshCw, ImageOff, CheckCircle2,
} from 'lucide-react';
import api from '../api/axios';
import Loader from '../components/Loader';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const toast = useToast();

  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [qty, setQty] = useState(1);
  const [error, setError] = useState(false);

  useEffect(() => {
    setLoading(true);
    api.get(`/products/${id}/`)
      .then((r) => {
        setProduct(r.data);
        setQty(1);
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Loader full label="Loading product…" />;

  if (error || !product) {
    return (
      <div className="container-app py-20 text-center">
        <h2 className="text-2xl font-bold text-slate-900">Product not found</h2>
        <p className="mt-2 text-slate-500">
          The product you're looking for doesn't exist or was removed.
        </p>
        <Link to="/products" className="btn-primary mt-6">Back to shop</Link>
      </div>
    );
  }

  const outOfStock = product.stock <= 0;
  const maxQty = Math.max(1, product.stock);

  const handleAdd = () => {
    addToCart(product, qty);
    toast.success(`Added ${qty} × “${product.title}” to cart`);
  };

  const handleBuyNow = () => {
    addToCart(product, qty);
    navigate('/checkout');
  };

  return (
    <div className="container-app py-8 lg:py-12">
      <button onClick={() => navigate(-1)} className="btn-ghost mb-6 -ml-2">
        <ArrowLeft size={16} /> Back
      </button>

      <div className="grid gap-10 lg:grid-cols-2">
        {/* ---------------------------------------------- Image */}
        <div className="card overflow-hidden">
          <div className="aspect-square bg-slate-100">
            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.title}
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center text-slate-300">
                <ImageOff size={64} />
              </div>
            )}
          </div>
        </div>

        {/* --------------------------------------------- Detail */}
        <div className="flex flex-col">
          {product.category_name && (
            <Link
              to={`/products?category=${product.category_slug}`}
              className="text-xs font-bold uppercase tracking-wider text-brand-600 hover:text-brand-700"
            >
              {product.category_name}
            </Link>
          )}

          <h1 className="mt-2 text-2xl font-extrabold leading-tight tracking-tight text-slate-900 sm:text-3xl lg:text-4xl">
            {product.title}
          </h1>

          <div className="mt-5 flex flex-wrap items-center gap-4">
            <span className="text-3xl font-extrabold text-slate-900 sm:text-4xl">
              ${Number(product.price).toFixed(2)}
            </span>
            {outOfStock ? (
              <span className="badge bg-red-100 text-red-700">Out of stock</span>
            ) : product.stock <= 5 ? (
              <span className="badge bg-amber-100 text-amber-700">
                Only {product.stock} left
              </span>
            ) : (
              <span className="badge bg-emerald-100 text-emerald-700">
                <CheckCircle2 size={12} className="mr-1" /> In stock
              </span>
            )}
          </div>

          <p className="mt-6 leading-relaxed text-slate-600">
            {product.description || 'No description available for this product.'}
          </p>

          {!outOfStock && (
            <div className="mt-8">
              <label className="label">Quantity</label>
              <div className="inline-flex items-center rounded-lg border border-slate-300 bg-white">
                <button
                  onClick={() => setQty((q) => Math.max(1, q - 1))}
                  disabled={qty <= 1}
                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <Minus size={16} />
                </button>
                <span className="w-14 text-center text-sm font-bold text-slate-900">
                  {qty}
                </span>
                <button
                  onClick={() => setQty((q) => Math.min(maxQty, q + 1))}
                  disabled={qty >= maxQty}
                  className="flex h-11 w-11 items-center justify-center text-slate-600 transition hover:bg-slate-100 disabled:opacity-40"
                >
                  <Plus size={16} />
                </button>
              </div>
            </div>
          )}

          <div className="mt-7 flex flex-col gap-3">
            <div className="flex gap-3">
              <button
                onClick={handleAdd}
                disabled={outOfStock}
                className="btn-outline flex-1 !py-3 text-base"
              >
                <ShoppingCart size={18} /> Add to cart
              </button>
              <button
                onClick={handleBuyNow}
                disabled={outOfStock}
                className="btn-primary flex-1 !py-3 text-base"
              >
                Buy now
              </button>
            </div>
          </div>

          <div className="mt-8 grid grid-cols-1 gap-3 border-t border-slate-200 pt-6 sm:grid-cols-3">
            {[
              { icon: Truck, title: 'Free shipping', text: 'Orders over $100' },
              { icon: ShieldCheck, title: 'Secure payment', text: 'SSL encrypted' },
              { icon: RefreshCw, title: '30-day returns', text: 'Money back' },
            ].map(({ icon: Icon, title, text }) => (
              <div key={title} className="flex items-center gap-3">
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-brand-50 text-brand-600">
                  <Icon size={18} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-xs font-semibold text-slate-800">{title}</p>
                  <p className="truncate text-[11px] text-slate-500">{text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}