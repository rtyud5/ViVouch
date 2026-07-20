const SORT_TO_API = {
  popular: "popularity",
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
};

/**
 * Map filter UI / URL → query params cho GET /api/vouchers.
 */
export function buildVoucherQueryParams({
  keyword,
  category,
  city,
  partner,
  minPrice,
  maxPrice,
  minDiscount,
  sort,
  page = 1,
  limit = 8,
  categories = [],
}) {
  const params = {
    page: Math.max(1, Number(page) || 1),
    limit: Math.max(1, Number(limit) || 8),
    sort: SORT_TO_API[sort] ?? "popularity",
  };

  if (keyword && typeof keyword === "string" && keyword.trim()) {
    params.keyword = keyword.trim();
  }

  if (category && category !== "all" && Array.isArray(categories)) {
    const match = categories.find((c) => c && c.slug === category);
    if (match) {
      params.categoryId = match.id;
    } else if (categories.length > 0) {
      // Nếu danh sách danh mục đã tải xong mà không khớp slug, đây là slug không hợp lệ.
      // Dùng nil UUID hợp lệ để API trả về kết quả rỗng thay vì tải tất cả danh mục.
      params.categoryId = "00000000-0000-0000-0000-000000000000";
    }
  }

  if (typeof city === "string" && city.trim()) params.city = city.trim();
  if (typeof partner === "string" && partner.trim()) params.partner = partner.trim();

  const normalizedMinPrice = Number(minPrice);
  const normalizedMaxPrice = Number(maxPrice);
  const normalizedDiscount = Number(minDiscount);
  if (minPrice !== "" && minPrice != null && Number.isFinite(normalizedMinPrice) && normalizedMinPrice >= 0) {
    params.minPrice = normalizedMinPrice;
  }
  if (maxPrice !== "" && maxPrice != null && Number.isFinite(normalizedMaxPrice) && normalizedMaxPrice >= 0) {
    params.maxPrice = normalizedMaxPrice;
  }
  if (minDiscount !== "" && minDiscount != null && Number.isFinite(normalizedDiscount) && normalizedDiscount >= 0) {
    params.minDiscount = Math.min(100, normalizedDiscount);
  }

  return params;
}
