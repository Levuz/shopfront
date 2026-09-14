export function Spinner({ size = 20, className = '' }) {
  return (
    <span
      className={`inline-block animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
      style={{ width: size, height: size }}
    />
  );
}

export default function Loader({ label = 'Loading…', full = false }) {
  return (
    <div
      className={`flex flex-col items-center justify-center gap-3 ${
        full ? 'min-h-[60vh]' : 'py-16'
      }`}
    >
      <Spinner size={32} className="text-brand-600" />
      <p className="text-sm text-slate-500">{label}</p>
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card overflow-hidden">
      <div className="aspect-square animate-pulse bg-slate-200" />
      <div className="space-y-3 p-4">
        <div className="h-3 w-1/3 animate-pulse rounded bg-slate-200" />
        <div className="h-4 w-3/4 animate-pulse rounded bg-slate-200" />
        <div className="h-5 w-1/2 animate-pulse rounded bg-slate-200" />
      </div>
    </div>
  );
}