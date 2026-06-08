/**
 * EmptyState
 *
 * Hien thi khi khong co ket qua tim kiem.
 * Thiet ke theo vivouch_search_empty_state/code.html
 *
 * Props:
 *  title        {string}      - tieu de chinh (vd: "Khong tim thay voucher")
 *  description  {string}      - mo ta phu
 *  action       {ReactNode}   - nut hanh dong chinh (vd: "Xem tat ca")
 *  onSuggestion {function}    - (optional) goi khi user bam vao tu khoa goi y
 *  keyword      {string}      - tu khoa hien tai de hien thi trong mo ta
 */
export function EmptyState({ title, description, action, onSuggestion }) {
  const suggestions = ["Buffet nướng", "Spa thư giãn", "Vé xem phim", "Trà sữa"];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      {/* Icon vong tron lon */}
      <div className="relative w-36 h-36 mb-6">
        {/* Vong sang blur phia sau */}
        <div className="absolute inset-0 rounded-full bg-primary/10 blur-2xl" />
        {/* Vong chinh */}
        <div className="relative w-full h-full flex items-center justify-center bg-base-100 rounded-full shadow-lg border border-base-200">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1}
            stroke="currentColor"
            className="w-16 h-16 text-base-content/25"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
        </div>
      </div>

      {/* Tieu de + mo ta */}
      <h2 className="text-xl font-bold text-base-content mb-2">{title}</h2>
      {description && (
        <p className="text-sm text-base-content/60 max-w-sm mb-6">{description}</p>
      )}

      {/* Nut hanh dong */}
      {action && <div className="mb-8">{action}</div>}

      {/* Tu khoa goi y */}
      {onSuggestion && (
        <div className="w-full max-w-sm">
          <p className="text-xs font-semibold text-base-content/50 mb-3 uppercase tracking-wide">
            Từ khóa phổ biến
          </p>
          <div className="flex flex-wrap gap-2 justify-center">
            {suggestions.map((s) => (
              <button
                key={s}
                type="button"
                onClick={() => onSuggestion(s)}
                className="
                  px-4 py-1.5
                  rounded-full
                  border border-base-300
                  bg-base-100
                  text-sm text-base-content/70
                  hover:border-primary hover:text-primary
                  transition-colors duration-150
                  cursor-pointer
                "
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
