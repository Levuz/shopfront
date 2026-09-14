import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, ShoppingCart, Users, Settings,
  ShoppingBag, LogOut, Menu, ArrowLeft, Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { to: '/admin',          icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package,         label: 'Products' },
  { to: '/admin/orders',   icon: ShoppingCart,    label: 'Orders' },
  { to: '/admin/users',    icon: Users,           label: 'Users' },
  { to: '/admin/settings', icon: Settings,        label: 'Settings' },
];

export default function AdminLayout() {
  const [open, setOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const linkClass = ({ isActive }) =>
    `flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition ${
      isActive
        ? 'bg-brand-600 text-white shadow-sm'
        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
    }`;

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const Sidebar = (
    <div className="flex h-full flex-col bg-slate-900">
      <div className="flex h-16 shrink-0 items-center gap-2 border-b border-slate-800 px-5">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-white">
          <ShoppingBag size={18} />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-bold text-white">ShopFront</p>
          <p className="truncate text-[11px] text-slate-400">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {NAV.map(({ to, icon: Icon, label, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={linkClass}
            onClick={() => setOpen(false)}
          >
            <Icon size={17} /> {label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-slate-800 p-3">
        <Link
          to="/"
          onClick={() => setOpen(false)}
          className="flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-slate-300 transition hover:bg-slate-800 hover:text-white"
        >
          <ArrowLeft size={17} /> Back to store
        </Link>
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium text-red-400 transition hover:bg-red-500/10 hover:text-red-300"
        >
          <LogOut size={17} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 lg:block">
        {Sidebar}
      </aside>

      {/* Mobile sidebar */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            onClick={() => setOpen(false)}
          />
          <aside className="fixed inset-y-0 left-0 z-50 w-64 animate-fade-in lg:hidden">
            {Sidebar}
          </aside>
        </>
      )}

      <div className="lg:pl-64">
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-slate-200 bg-white/85 px-4 backdrop-blur-lg sm:px-6 lg:px-8">
          <button
            onClick={() => setOpen(true)}
            className="btn-ghost !p-2 lg:hidden"
            aria-label="Menu"
          >
            <Menu size={20} />
          </button>

          <h1 className="text-base font-bold text-slate-900 sm:text-lg">Admin</h1>

          <div className="ml-auto flex items-center gap-2">
            <button className="btn-ghost !p-2 text-slate-500" aria-label="Notifications">
              <Bell size={18} />
            </button>
            <div className="flex items-center gap-2.5 rounded-full border border-slate-200 bg-white py-1 pl-1 pr-3.5">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-brand-600 text-xs font-bold uppercase text-white">
                {user?.username?.[0] || 'A'}
              </span>
              <div className="hidden text-left sm:block">
                <p className="max-w-[120px] truncate text-xs font-semibold text-slate-800">
                  {user?.username}
                </p>
                <p className="text-[10px] font-medium uppercase tracking-wide text-brand-600">
                  Administrator
                </p>
              </div>
            </div>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}