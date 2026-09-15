import { Store, ShieldCheck, Bell, Save } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';

export default function AdminSettings() {
  const { user } = useAuth();
  const toast = useToast();

  const sections = [
    {
      icon: Store,
      title: 'Store information',
      fields: [
        { label: 'Store name', value: 'ShopFront' },
        { label: 'Support email', value: 'support@shopfront.dev' },
        { label: 'Currency', value: 'USD ($)' },
      ],
    },
    {
      icon: ShieldCheck,
      title: 'Security',
      fields: [
        { label: 'Two-factor authentication', value: 'Disabled' },
        { label: 'JWT access token lifetime', value: '60 minutes' },
        { label: 'JWT refresh token lifetime', value: '7 days' },
      ],
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900 dark:text-slate-100 sm:text-2xl">Settings</h1>
        <p className="mt-0.5 text-sm text-slate-500 dark:text-slate-400">
          Configure store preferences and admin account.
        </p>
      </div>

      <div className="card p-5 sm:p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-brand-600 text-xl font-bold uppercase text-white">
            {user?.username?.[0] || 'A'}
          </span>
          <div>
            <p className="text-base font-bold text-slate-900 dark:text-slate-100">
              {user?.full_name || user?.username}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {user?.email || 'no email on record'}
            </p>
            <span className="badge mt-1.5 bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
              <ShieldCheck size={11} className="mr-1" /> Administrator
            </span>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {sections.map(({ icon: Icon, title, fields }) => (
          <div key={title} className="card p-5 sm:p-6">
            <div className="mb-5 flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
                <Icon size={18} />
              </span>
              <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">{title}</h2>
            </div>
            <dl className="space-y-4">
              {fields.map((f) => (
                <div key={f.label}>
                  <dt className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
                    {f.label}
                  </dt>
                  <dd className="mt-1 text-sm font-medium text-slate-800 dark:text-slate-200">{f.value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        <div className="mb-5 flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-900/30 dark:text-brand-400">
            <Bell size={18} />
          </span>
          <h2 className="text-base font-bold text-slate-900 dark:text-slate-100">Notifications</h2>
        </div>
        <div className="space-y-3">
          {['New order emails', 'Low stock alerts', 'Customer signup notifications'].map((n) => (
            <label
              key={n}
              className="flex cursor-pointer items-center justify-between rounded-lg border border-slate-200 px-4 py-3 hover:bg-slate-50 dark:border-slate-800 dark:hover:bg-slate-800/50"
            >
              <span className="text-sm font-medium text-slate-700 dark:text-slate-300">{n}</span>
              <input
                type="checkbox"
                defaultChecked
                className="h-4 w-4 rounded border-slate-300 text-brand-600 focus:ring-brand-500 dark:border-slate-600 dark:bg-slate-800"
              />
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end">
        <button onClick={() => toast.success('Settings saved (demo)')} className="btn-primary">
          <Save size={16} /> Save changes
        </button>
      </div>
    </div>
  );
}