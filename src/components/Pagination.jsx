export default function Pagination({ page, totalPages, setPage }) {
  return (
    <div className="flex gap-2 items-center justify-center md:justify-start">
      <button
        onClick={() => setPage(p => Math.max(1, p - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        ←
      </button>
      <span className="text-slate-200 font-medium text-base px-2 select-none">
        Page <span className="text-blue-300 font-bold">{page}</span> / <span className="text-blue-200">{totalPages || 1}</span>
      </span>
      <button
        onClick={() => setPage(p => Math.min(totalPages, p + 1))}
        disabled={page === totalPages || totalPages === 0}
        aria-label="Next page"
        className="px-3 py-1.5 rounded-full bg-slate-700 hover:bg-blue-700 text-white font-semibold transition disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-400"
      >
        →
      </button>
    </div>
  );
}
