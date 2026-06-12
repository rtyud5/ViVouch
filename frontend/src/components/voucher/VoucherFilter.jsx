import { useState, useRef, useEffect, useMemo } from "react";

/** Chip filter — giống mockup vivouch_search_results */
const FILTER_CHIPS = [
  { key: "category", label: "Danh mục" },
];
function ChevronDown() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      className="w-[18px] h-[18px]"
      aria-hidden="true"
    >
      <path d="M7 10l5 5 5-5H7z" />
    </svg>
  );
}

/**
 * VoucherFilter — hàng chip Danh mục / Khu vực / Giá / Giảm giá
 * (theo vivouch_search_results_desktop & mobile mockup)
 */
export function VoucherFilter({ activeCategory, onCategoryChange, categories = [] }) {
  const [openChip, setOpenChip] = useState(null);
  const panelRef = useRef(null);

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      ...categories.map((cat) => ({ key: cat.slug, label: cat.name })),
    ],
    [categories]
  );

  const isCategoryActive = activeCategory !== "all";
  const activeCategoryLabel =
    categoryOptions.find((c) => c.key === activeCategory)?.label ?? "Tất cả";

  // Đóng dropdown khi click ra ngoài
  useEffect(() => {
    function handleClickOutside(e) {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setOpenChip(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function toggleChip(key) {
    setOpenChip((prev) => (prev === key ? null : key));
  }

  function chipClass(isActive) {
    return `flex items-center gap-1 px-4 py-1.5 rounded-full border font-label-md text-label-md transition-colors whitespace-nowrap shrink-0 ${
      isActive
        ? "border-primary bg-primary-container text-on-primary-container"
        : "border-outline-variant bg-surface text-on-surface hover:bg-surface-container-low"
    }`;
  }

  return (
    <div
      ref={panelRef}
      className="px-container-margin py-2 border-t border-surface-variant"
    >
      <div className="flex items-center gap-2 overflow-x-auto hide-scrollbar whitespace-nowrap">
        {FILTER_CHIPS.map((chip) => {
          const isActive =
            chip.key === "category" ? isCategoryActive : openChip === chip.key;

          return (
            <div key={chip.key} className="relative shrink-0">
              <button
                type="button"
                onClick={() => toggleChip(chip.key)}
                className={chipClass(isActive)}
                aria-expanded={openChip === chip.key}
              >
                {chip.key === "category" && isCategoryActive
                  ? activeCategoryLabel
                  : chip.label}
                <ChevronDown />
              </button>

              {/* Dropdown Danh mục */}
              {chip.key === "category" && openChip === "category" && (
                <div className="absolute top-full left-0 mt-1 z-50 min-w-[160px] bg-surface-container-lowest border border-outline-variant rounded-xl shadow-lg py-1">
                  {categoryOptions.map((cat) => (
                    <button
                      key={cat.key}
                      type="button"
                      onClick={() => {
                        onCategoryChange(cat.key);
                        setOpenChip(null);
                      }}
                      className={`w-full text-left px-4 py-2 font-body-md text-body-md hover:bg-surface-container-low transition-colors ${
                        activeCategory === cat.key
                          ? "text-primary font-semibold"
                          : "text-on-surface"
                      }`}
                    >
                      {cat.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

