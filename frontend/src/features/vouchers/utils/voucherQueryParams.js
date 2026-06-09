const SORT_TO_API = {
  popular: "popularity",
  newest: "newest",
  "price-asc": "price_asc",
  "price-desc": "price_desc",
};

/**
 * Chuyển filter UI (URL) sang query params của GET /api/vouchers.
 */
export function buildVoucherQueryParams({
  keyword,
  category,
  sort,
  page,
  limit,
  categories = [],
}) {
  const params = {
    page: page ?? 1,
    limit: limit ?? 8,
    sort: SORT_TO_API[sort] ?? sort ?? "popularity",
  };

  if (keyword?.trim()) {
    params.keyword = keyword.trim();
  }

  if (category && category !== "all") {
    const match = categories.find((c) => c.slug === category);
    if (match?.id) {
      params.categoryId = match.id;
    }
  }

  return params;
}
