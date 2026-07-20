import { useState, useRef, useEffect, useMemo } from "react";

/** Chip filter — giống mockup vivouch_search_results */
const FILTER_CHIPS = [{ key: "category", label: "Danh mục" }];
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
export function VoucherFilter({
  activeCategory,
  onCategoryChange,
  categories = [],
  advancedFilters = {},
  onAdvancedFiltersChange = () => {},
}) {
  const [openChip, setOpenChip] = useState(null);
  const [draft, setDraft] = useState(advancedFilters);
  const panelRef = useRef(null);

  const categoryOptions = useMemo(
    () => [
      { key: "all", label: "Tất cả" },
      ...categories.map((cat) => ({ key: cat.slug, label: cat.name })),
    ],
    [categories],
  );

  const isCategoryActive = activeCategory !== "all";
  const activeCategoryLabel =
    categoryOptions.find((c) => c.key === activeCategory)?.label ?? "Tất cả";

  useEffect(() => {
    setDraft(advancedFilters);
  }, [
    advancedFilters.city,
    advancedFilters.partner,
    advancedFilters.minPrice,
    advancedFilters.maxPrice,
    advancedFilters.minDiscount,
  ]);

  const hasAdvancedFilters = Object.values(advancedFilters).some(
    (value) => value !== "" && value != null,
  );

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
        <details className="dropdown shrink-0">
          <summary className={chipClass(hasAdvancedFilters)}>
            Bộ lọc nâng cao
            <ChevronDown />
          </summary>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              onAdvancedFiltersChange(draft);
              event.currentTarget.closest("details")?.removeAttribute("open");
            }}
            className="dropdown-content z-50 mt-2 w-[min(92vw,520px)] rounded-xl border border-outline-variant bg-surface-container-lowest p-4 shadow-xl"
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-on-surface">
              <label className="text-sm font-medium">
                Khu vực
                <input
                  className="input input-bordered input-sm w-full mt-1"
                  placeholder="Ví dụ: Hồ Chí Minh"
                  value={draft.city || ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      city: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Đối tác
                <input
                  className="input input-bordered input-sm w-full mt-1"
                  placeholder="Tên doanh nghiệp"
                  value={draft.partner || ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      partner: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Giá từ
                <input
                  type="number"
                  min="0"
                  className="input input-bordered input-sm w-full mt-1"
                  value={draft.minPrice || ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      minPrice: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium">
                Giá đến
                <input
                  type="number"
                  min="0"
                  className="input input-bordered input-sm w-full mt-1"
                  value={draft.maxPrice || ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      maxPrice: event.target.value,
                    }))
                  }
                />
              </label>
              <label className="text-sm font-medium sm:col-span-2">
                Giảm tối thiểu (%)
                <input
                  type="number"
                  min="0"
                  max="100"
                  className="input input-bordered input-sm w-full mt-1"
                  value={draft.minDiscount || ""}
                  onChange={(event) =>
                    setDraft((current) => ({
                      ...current,
                      minDiscount: event.target.value,
                    }))
                  }
                />
              </label>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                className="btn btn-ghost btn-sm"
                onClick={() => {
                  const empty = {
                    city: "",
                    partner: "",
                    minPrice: "",
                    maxPrice: "",
                    minDiscount: "",
                  };
                  setDraft(empty);
                  onAdvancedFiltersChange(empty);
                }}
              >
                Xóa bộ lọc
              </button>
              <button type="submit" className="btn btn-primary btn-sm">
                Áp dụng
              </button>
            </div>
          </form>
        </details>
      </div>
    </div>
  );
}
