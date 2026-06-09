/**
 * Map voucher từ API response sang shape mà VoucherCard đang dùng.
 */
export function mapVoucherForCard(apiVoucher) {
  const soldQty = apiVoucher.soldQty ?? 0;
  const remainingQty = apiVoucher.remainingQty ?? 0;

  return {
    id: apiVoucher.id,
    name: apiVoucher.title,
    partnerName: apiVoucher.partner?.businessName ?? "",
    category: apiVoucher.category?.name ?? "",
    categoryLabel: apiVoucher.category?.name ?? "",
    imageUrl: apiVoucher.imageUrl,
    originalPrice: apiVoucher.originalPrice,
    salePrice: apiVoucher.salePrice,
    rating: apiVoucher.avgRating ?? 0,
    reviewCount: apiVoucher.reviewCount ?? 0,
    totalQuantity: soldQty + remainingQty,
    soldQuantity: soldQty,
  };
}
