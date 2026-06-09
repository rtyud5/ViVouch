import { useEffect, useMemo, useCallback } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { VoucherCard } from "../../components/voucher/VoucherCard";
import { VoucherCardSkeleton } from "../../components/voucher/VoucherCardSkeleton";
import { VoucherFilter } from "../../components/voucher/VoucherFilter";
import { SortDropdown } from "../../components/voucher/SortDropdown";
import { SearchInput } from "../../components/common/SearchInput";
import { Pagination } from "../../components/common/Pagination";
import { EmptyState } from "../../components/common/EmptyState";
import { ApiErrorToast } from "../../components/common/ApiErrorToast";
import { useVouchers, useCategories } from "../../features/vouchers/hooks";
import { buildVoucherQueryParams } from "../../features/vouchers/utils/buildVoucherQueryParams";
import { mapVoucherForCard } from "../../features/vouchers/utils/mapVoucherForCard";

const PAGE_SIZE = 8;

function readFiltersFromParams(searchParams) {
  const keyword = searchParams.get("keyword") ?? searchParams.get("q") ?? "";
  const pageParam = searchParams.get("page");
  const parsedPage = pageParam ? parseInt(pageParam, 10) : 1;
  return {
    keyword,
    category: searchParams.get("category") ?? "all",
    sort: searchParams.get("sort") ?? "popular",
    page: Number.isNaN(parsedPage) || parsedPage < 1 ? 1 : parsedPage,
  };
}

function buildSearchParams({ keyword, category, sort, page }) {
  const params = {};
  if (keyword.trim()) params.keyword = keyword.trim();
  if (category !== "all") params.category = category;
  if (sort !== "popular") params.sort = sort;
  if (page > 1) params.page = String(page);
  return params;
}

export function VoucherListPage() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { keyword, category, sort, page } = readFiltersFromParams(searchParams);
  const { categories } = useCategories();

  useEffect(() => {
    const q = searchParams.get("q");
    if (q && !searchParams.get("keyword")) {
      const filters = readFiltersFromParams(searchParams);
      setSearchParams(buildSearchParams({ ...filters, keyword: q }), { replace: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateFilters = useCallback(
    (updates, { replace = false } = {}) => {
      const next = { keyword, category, sort, page, ...updates };
      setSearchParams(buildSearchParams(next), { replace });
    },
    [keyword, category, sort, page, setSearchParams]
  );

  const voucherParams = useMemo(
    () =>
      buildVoucherQueryParams({
        keyword,
        category,
        sort,
        page,
        limit: PAGE_SIZE,
        categories,
      }),
    [keyword, category, sort, page, categories]
  );

  const {
    vouchers: rawVouchers,
    pagination,
    isLoading,
    error,
  } = useVouchers(voucherParams);

  const vouchers = useMemo(
    () => rawVouchers.map((v) => mapVoucherForCard(v, categories)),
    [rawVouchers, categories]
  );

  const totalPages = Math.max(1, pagination?.totalPages ?? 1);
  const totalCount = pagination?.total ?? 0;
  const safePage = pagination?.page ?? page;

  useEffect(() => {
    if (pagination && page > totalPages) {
      updateFilters({ page: totalPages }, { replace: true });
    }
  }, [page, totalPages, pagination, updateFilters]);

  const handleKeywordChange = useCallback(
    (newKeyword) => updateFilters({ keyword: newKeyword, page: 1 }, { replace: true }),
    [updateFilters]
  );

  const handleCategoryChange = useCallback(
    (cat) => updateFilters({ category: cat, page: 1 }),
    [updateFilters]
  );

  const handleSortChange = useCallback(
    (newSort) => updateFilters({ sort: newSort, page: 1 }),
    [updateFilters]
  );

  const handlePageChange = useCallback(
    (newPage) => updateFilters({ page: newPage }),
    [updateFilters]
  );

  const handleResetFilters = useCallback(() => {
    setSearchParams({}, { replace: false });
  }, [setSearchParams]);

  const handleSuggestionClick = useCallback(
    (text) => updateFilters({ keyword: text, category: "all", page: 1 }),
    [updateFilters]
  );

  return (
    <div className="bg-background min-h-screen pb-24 md:pb-0">
      <ApiErrorToast
        error={error}
        message="Không thể tải danh sách voucher"
      />

      <header className="sticky top-0 z-40 bg-surface shadow-sm">
        <div className="max-w-[1200px] mx-auto">
          <div className="flex items-center gap-3 px-container-margin py-base h-16">
            <button
              type="button"
              aria-label="Quay lại"
              onClick={() => navigate(-1)}
              className="p-2 -ml-2 rounded-full text-on-surface hover:bg-surface-container-high transition-colors shrink-0"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                className="w-6 h-6"
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <SearchInput
              value={keyword}
              onChange={handleKeywordChange}
              placeholder="Tìm kiếm voucher..."
              delay={300}
            />
          </div>

          <VoucherFilter
            activeCategory={category}
            onCategoryChange={handleCategoryChange}
            categories={categories}
          />
        </div>
      </header>

      <main className="max-w-[1200px] mx-auto px-container-margin py-section-gap">
        {!isLoading && (
          <div className="flex justify-between items-center mb-6">
            <h1
              className="font-headline-md text-headline-md text-on-surface"
              aria-live="polite"
              aria-atomic="true"
            >
              {totalCount === 0
                ? "Không tìm thấy kết quả"
                : `${totalCount} kết quả`}
            </h1>
            <SortDropdown activeSort={sort} onSortChange={handleSortChange} />
          </div>
        )}

        {isLoading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter md:gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <VoucherCardSkeleton key={i} />
            ))}
          </div>
        ) : vouchers.length === 0 ? (
          <EmptyState
            title="Không tìm thấy voucher"
            description={
              keyword
                ? `Không có kết quả cho từ khóa "${keyword}". Thử tìm với từ khóa khác nhé!`
                : "Không có voucher nào trong danh mục này."
            }
            action={
              <button
                id="empty-state-reset-btn"
                type="button"
                onClick={handleResetFilters}
                className="font-label-md text-label-md bg-primary text-on-primary px-6 py-3 rounded-full hover:bg-surface-tint transition-colors shadow-sm"
              >
                Xem tất cả
              </button>
            }
            onSuggestion={handleSuggestionClick}
          />
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter md:gap-6">
            {vouchers.map((voucher) => (
              <VoucherCard key={voucher.id} voucher={voucher} variant="search" />
            ))}
          </div>
        )}

        {!isLoading && vouchers.length > 0 && (
          <Pagination
            currentPage={safePage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
          />
        )}
      </main>
    </div>
  );
}
