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
  sort,
  page = 1,
  limit = 8,
  categories = [],
}) {
  const params = {
    page,
    limit,
    sort: SORT_TO_API[sort] ?? "popularity",
  };

  if (keyword?.trim()) {
    params.keyword = keyword.trim();
  }

  if (category && category !== "all") {
    const match = categories.find((c) => c.slug === category);
    if (match) {
      params.categoryId = match.id;
    }
  }

  return params;
}
