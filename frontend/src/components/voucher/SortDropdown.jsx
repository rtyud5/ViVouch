import { useState, useRef, useEffect } from "react";

export const SORT_OPTIONS = [
  { key: "popular", label: "Phổ biến" },
  { key: "newest", label: "Mới nhất" },
  { key: "price-asc", label: "Giá tăng" },
  { key: "price-desc", label: "Giá giảm" },
];

/**
 * SortDropdown — nút "Sắp xếp" bên phải hàng kết quả (theo mockup)
 */
export function SortDropdown({ activeSort, onSortChange }) {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  const activeLabel =
    SORT_OPTIONS.find((o) => o.key === activeSort)?.label ?? "Phổ biến";

  useEffect(() => {
    function handleClickOutside(e) {
      if (ref.current && !ref.current.contains(e.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        id="voucher-sort-btn"
        onClick={() => setIsOpen((v) => !v)}
        className="flex items-center gap-1 text-on-surface-variant hover:text-on-surface font-label-md text-label-md transition-colors"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
          className="w-5 h-5"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12"
          />
        </svg>
        Sắp xếp
        {activeSort !== "popular" && (
          <span className="text-primary text-xs">({activeLabel})</span>
        )}
      </button>

      {isOpen && (
        <div
          role="listbox"
          aria-label="Tuỳ chọn sắp xếp"
          className="absolute right-0 top-full mt-1 z-50 min-w-[160px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1"
        >
          {SORT_OPTIONS.map((opt) => (
            <button
              key={opt.key}
              type="button"
              role="option"
              aria-selected={activeSort === opt.key}
              onClick={() => {
                onSortChange(opt.key);
                setIsOpen(false);
              }}
              className={`w-full text-left px-4 py-2 font-body-md text-body-md hover:bg-surface-container-low transition-colors ${
                activeSort === opt.key
                  ? "text-primary font-semibold"
                  : "text-on-surface"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
