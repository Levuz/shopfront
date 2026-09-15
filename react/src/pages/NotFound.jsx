import { Link } from 'react-router-dom';
import { Home, Search } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-[120px] font-black leading-none text-brand-600 dark:text-brand-500 sm:text-[180px]">
        404
      </p>
      <h1 className="mt-2 text-2xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-3xl">
        Page not found
      </h1>
      <p className="mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        The page you're looking for doesn't exist or has been moved.
      </p>
      <div className="mt-8 flex flex-col gap-3 sm:flex-row">
        <Link to="/" className="btn-primary"><Home size={16} /> Go home</Link>
        <Link to="/products" className="btn-outline"><Search size={16} /> Browse products</Link>
      </div>
    </div>
  );
}