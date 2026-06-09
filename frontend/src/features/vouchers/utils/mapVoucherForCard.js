/**
 * Chuyển voucher từ API sang shape mà VoucherCard dùng.
 */
export function mapVoucherForCard(voucher, categories = []) {
  const soldQuantity = voucher.soldQty ?? voucher.soldQuantity ?? 0;
  const remaining =
    voucher.remainingQty ??
    Math.max(0, (voucher.totalQuantity ?? 0) - soldQuantity);
  const totalQuantity =
    voucher.totalQty ?? soldQuantity + remaining;

  const categorySlug =
    categories.find((c) => c.name === voucher.category?.name)?.slug ??
    voucher.category?.slug ??
    "";

  return {
    id: voucher.id,
    name: voucher.title ?? voucher.name,
    partnerName: voucher.partner?.businessName ?? voucher.partnerName ?? "",
    category: categorySlug,
    categoryLabel: voucher.category?.name,
    location: voucher.location,
    imageUrl: voucher.imageUrl,
    originalPrice: voucher.originalPrice,
    salePrice: voucher.salePrice,
    rating: voucher.avgRating ?? voucher.rating ?? 0,
    reviewCount: voucher.reviewCount ?? 0,
    totalQuantity,
    soldQuantity,
  };
}
