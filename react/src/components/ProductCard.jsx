import { Link } from 'react-router-dom';
import { ShoppingCart, ImageOff } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';

export default function ProductCard({ product }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const outOfStock = product.stock <= 0;

  const handleAdd = (e) => {
    e.preventDefault();
    if (outOfStock) return;
    addToCart(product, 1);
    toast.success(`“${product.title}” added to cart`);
  };

  return (
    <Link
      to={`/product/${product.id}`}
      className="card group flex flex-col overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:shadow-lift"
    >
      <div className="relative aspect-square overflow-hidden bg-slate-100 dark:bg-slate-800">
        {product.image_url ? (
          <img
            src={product.image_url}
            alt={product.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-slate-300 dark:text-slate-600">
            <ImageOff size={40} />
          </div>
        )}

        {outOfStock && (
          <span className="absolute left-3 top-3 badge bg-slate-900/85 text-white">Out of stock</span>
        )}
        {!outOfStock && product.stock <= 5 && (
          <span className="absolute left-3 top-3 badge bg-amber-500 text-white">Only {product.stock} left</span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        {product.category_name && (
          <span className="text-[11px] font-semibold uppercase tracking-wider text-brand-600 dark:text-brand-400">
            {product.category_name}
          </span>
        )}
        <h3 className="mt-1 line-clamp-2 flex-1 text-sm font-semibold text-slate-800 group-hover:text-brand-700 dark:text-slate-100 dark:group-hover:text-brand-300">
          {product.title}
        </h3>

        <div className="mt-3 flex items-center justify-between gap-2">
          <span className="text-lg font-bold text-slate-900 dark:text-slate-100">
            ${Number(product.price).toFixed(2)}
          </span>
          <button
            onClick={handleAdd}
            disabled={outOfStock}
            aria-label="Add to cart"
            className="btn-primary !px-3 !py-2"
          >
            <ShoppingCart size={16} />
          </button>
        </div>
      </div>
    </Link>
  );
}