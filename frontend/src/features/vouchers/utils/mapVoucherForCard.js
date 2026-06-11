/**
 * Chuyển voucher từ API sang shape mà VoucherCard dùng.
 */
export function mapVoucherForCard(voucher, categories = []) {
  if (!voucher) return null;

  const soldQuantity = voucher.soldQty ?? voucher.soldQuantity ?? 0;
  const remaining =
    voucher.remainingQty ??
    Math.max(0, (voucher.totalQuantity ?? 0) - soldQuantity);
  const totalQuantity =
    voucher.totalQty ?? soldQuantity + remaining;

  const matchedCategory = Array.isArray(categories)
    ? categories.find((c) => c && c.name === voucher.category?.name)
    : null;
  const categorySlug = matchedCategory?.slug || voucher.category?.slug || "";

  return {
    id: voucher.id,
    name: voucher.title ?? voucher.name ?? "",
    partnerName: voucher.partner?.businessName ?? voucher.partnerName ?? "",
    category: categorySlug,
    categoryLabel: voucher.category?.name ?? "",
    location: voucher.location ?? "",
    imageUrl: voucher.imageUrl ?? "",
    originalPrice: Number(voucher.originalPrice) || 0,
    salePrice: Number(voucher.salePrice) || 0,
    rating: Number(voucher.avgRating ?? voucher.rating) || 0,
    reviewCount: Number(voucher.reviewCount) || 0,
    totalQuantity,
    soldQuantity,
  };
}
