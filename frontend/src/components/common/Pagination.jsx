/**
 * Pagination — Trang trước / Trang sau + "Trang X / Y"
 */
export function Pagination({ currentPage, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;

  const isFirst = currentPage <= 1;
  const isLast = currentPage >= totalPages;

  return (
    <div
      className="flex items-center justify-center gap-4 mt-8"
      role="navigation"
      aria-label="Phân trang"
    >
      <button
        id="pagination-prev-btn"
        type="button"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={isFirst}
        aria-label="Trang trước"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
          isFirst
            ? "opacity-40 cursor-not-allowed border border-outline-variant text-on-surface-variant"
            : "border border-primary text-primary hover:bg-primary/5"
        }`}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Trang trước
      </button>

      <span
        className="text-sm font-semibold text-on-surface-variant px-2"
        aria-current="page"
      >
        Trang{" "}
        <span className="text-primary font-bold">{currentPage}</span>
        {" / "}
        {totalPages}
      </span>

      <button
        id="pagination-next-btn"
        type="button"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={isLast}
        aria-label="Trang sau"
        className={`flex items-center gap-1.5 px-4 py-2 rounded-full font-label-md text-label-md transition-colors ${
          isLast
            ? "opacity-40 cursor-not-allowed border border-outline-variant text-on-surface-variant"
            : "border border-primary text-primary hover:bg-primary/5"
        }`}
      >
        Trang sau
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2.5}
          stroke="currentColor"
          className="w-3.5 h-3.5"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
