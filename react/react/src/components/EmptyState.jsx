import { PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function EmptyState({
  icon: Icon = PackageOpen,
  title = 'Nothing here yet',
  description = '',
  actionLabel,
  actionTo,
}) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-white/60 px-6 py-16 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-400">
        <Icon size={26} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800">{title}</h3>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-slate-500">{description}</p>
      )}
      {actionLabel && actionTo && (
        <Link to={actionTo} className="btn-primary mt-6">
          {actionLabel}
        </Link>
      )}
    </div>
  );
}