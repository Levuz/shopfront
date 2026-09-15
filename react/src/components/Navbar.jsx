import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import {
  ShoppingBag, Search, Menu, X, User, LogOut, LayoutDashboard,
  Package, ShoppingCart, Sun, Moon,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { useTheme } from '../context/ThemeContext';

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [menu, setMenu] = useState(false);
  const { user, isAuthenticated, isAdmin, logout } = useAuth();
  const { totalItems } = useCart();
  const { isDark, toggle } = useTheme();
  const navigate = useNavigate();

  const submitSearch = (e) => {
    e.preventDefault();
    const q = query.trim();
    navigate(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
    setOpen(false);
  };

  const handleLogout = () => {
    logout();
    setMenu(false);
    setOpen(false);
    navigate('/');
  };

  const navLink = ({ isActive }) =>
    `rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
      isActive
        ? 'text-brand-700 bg-brand-50 dark:text-brand-300 dark:bg-brand-900/30'
        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100 dark:text-slate-300 dark:hover:text-white dark:hover:bg-slate-800'
    }`;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/85 backdrop-blur-lg dark:border-slate-800 dark:bg-slate-900/85">
      <div className="container-app flex h-16 items-center gap-3">
        {/* Logo */}
        <Link to="/" className="flex shrink-0 items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white shadow-sm">
            <ShoppingBag size={18} />
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight text-slate-900 dark:text-white sm:block">
            Shop<span className="text-brand-600 dark:text-brand-400">Front</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="ml-2 hidden items-center gap-1 lg:flex">
          <NavLink to="/" className={navLink} end>Home</NavLink>
          <NavLink to="/products" className={navLink}>Shop</NavLink>
        </nav>

        {/* Search */}
        <form onSubmit={submitSearch} className="ml-auto hidden max-w-md flex-1 md:block">
          <div className="relative">
            <Search
              size={17}
              className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
            />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search products…"
              className="input !py-2 pl-10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100 dark:placeholder:text-slate-500"
            />
          </div>
        </form>

        {/* Actions */}
        <div className="ml-auto flex items-center gap-1 md:ml-2">
          {/* Theme toggle */}
          <button
            onClick={toggle}
            className="btn-ghost dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={18} /> : <Moon size={18} />}
          </button>

          {/* Cart */}
          <Link
            to="/cart"
            className="relative btn-ghost dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Cart"
          >
            <ShoppingCart size={20} />
            {totalItems > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-brand-600 px-1 text-[11px] font-bold text-white">
                {totalItems > 99 ? '99+' : totalItems}
              </span>
            )}
          </Link>

          {isAuthenticated ? (
            <div className="relative hidden md:block">
              <button
                onClick={() => setMenu((v) => !v)}
                className="btn-ghost dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
                aria-haspopup="true"
              >
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-100 text-xs font-bold uppercase text-brand-700 dark:bg-brand-900/40 dark:text-brand-300">
                  {user?.username?.[0] || 'U'}
                </span>
                <span className="hidden max-w-[90px] truncate text-sm font-medium lg:block">
                  {user?.username}
                </span>
              </button>

              {menu && (
                <>
                  <div className="fixed inset-0 z-10" onClick={() => setMenu(false)} />
                  <div className="absolute right-0 z-20 mt-2 w-56 origin-top-right animate-fade-in rounded-xl border border-slate-200 bg-white p-1.5 shadow-lift dark:border-slate-700 dark:bg-slate-800">
                    <div className="border-b border-slate-100 px-3 py-2 dark:border-slate-700">
                      <p className="truncate text-sm font-semibold text-slate-800 dark:text-slate-100">
                        {user?.full_name || user?.username}
                      </p>
                      <p className="truncate text-xs text-slate-500 dark:text-slate-400">
                        {user?.email || 'no email'}
                      </p>
                    </div>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setMenu(false)}
                        className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                      >
                        <LayoutDashboard size={16} /> Admin Dashboard
                      </Link>
                    )}
                    <Link
                      to="/my-orders"
                      onClick={() => setMenu(false)}
                      className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-slate-700"
                    >
                      <Package size={16} /> My Orders
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
                    >
                      <LogOut size={16} /> Sign out
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link to="/login" className="btn-ghost dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white">
                <User size={16} /> Login
              </Link>
              <Link to="/register" className="btn-primary !py-2">
                Sign up
              </Link>
            </div>
          )}

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            className="btn-ghost md:hidden dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-white"
            aria-label="Menu"
          >
            {open ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      {open && (
        <div className="animate-fade-in border-t border-slate-200 bg-white md:hidden dark:border-slate-800 dark:bg-slate-900">
          <div className="container-app space-y-3 py-4">
            <form onSubmit={submitSearch}>
              <div className="relative">
                <Search
                  size={17}
                  className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500"
                />
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search products…"
                  className="input pl-10 dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"
                />
              </div>
            </form>

            <nav className="grid gap-1">
              <NavLink to="/" end className={navLink} onClick={() => setOpen(false)}>Home</NavLink>
              <NavLink to="/products" className={navLink} onClick={() => setOpen(false)}>Shop</NavLink>
              <NavLink to="/cart" className={navLink} onClick={() => setOpen(false)}>Cart ({totalItems})</NavLink>
              {isAuthenticated && (
                <NavLink to="/my-orders" className={navLink} onClick={() => setOpen(false)}>My Orders</NavLink>
              )}
              {isAdmin && (
                <NavLink to="/admin" className={navLink} onClick={() => setOpen(false)}>Admin Dashboard</NavLink>
              )}
            </nav>

            <div className="border-t border-slate-100 pt-3 dark:border-slate-800">
              {isAuthenticated ? (
                <button
                  onClick={handleLogout}
                  className="btn-outline w-full dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                >
                  <LogOut size={16} /> Sign out ({user?.username})
                </button>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  <Link
                    to="/login"
                    onClick={() => setOpen(false)}
                    className="btn-outline dark:border-slate-700 dark:bg-slate-800 dark:text-slate-200"
                  >
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setOpen(false)} className="btn-primary">
                    Sign up
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}