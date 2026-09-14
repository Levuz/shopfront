import { ChevronLeft, ChevronRight } from 'lucide-react';

export default function Pagination({ page, totalPages, onChange }) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(totalPages, start + 4);
  for (let i = start; i <= end; i += 1) pages.push(i);

  return (
    <nav className="mt-10 flex items-center justify-center gap-1.5">
      <button
        onClick={() => onChange(page - 1)}
        disabled={page <= 1}
        className="btn-outline !px-3 !py-2"
        aria-label="Previous page"
      >
        <ChevronLeft size={16} />
      </button>

      {start > 1 && (
        <>
          <button onClick={() => onChange(1)} className="btn-outline !px-3.5 !py-2">
            1
          </button>
          {start > 2 && <span className="px-1 text-slate-400">…</span>}
        </>
      )}

      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          className={
            p === page
              ? 'btn !px-3.5 !py-2 bg-brand-600 text-white'
              : 'btn-outline !px-3.5 !py-2'
          }
        >
          {p}
        </button>
      ))}

      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-slate-400">…</span>}
          <button onClick={() => onChange(totalPages)} className="btn-outline !px-3.5 !py-2">
            {totalPages}
          </button>
        </>
      )}

      <button
        onClick={() => onChange(page + 1)}
        disabled={page >= totalPages}
        className="btn-outline !px-3 !py-2"
        aria-label="Next page"
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}