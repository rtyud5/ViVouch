/**
 * Mock voucher data for development / UI testing.
 * Shape mirrors the real API response so it can be swapped easily later.
 *
 * Fields:
 *  id            - unique voucher product id
 *  name          - display name
 *  partnerName   - business / partner name
 *  category      - one of: "am-thuc" | "lam-dep" | "du-lich" | "mua-sam" | "giai-tri"
 *  imageUrl      - product image (null to test placeholder fallback)
 *  originalPrice - price before discount (VND)
 *  salePrice     - price after discount (VND)
 *  rating        - average rating (0–5)
 *  reviewCount   - total reviews
 *  totalQuantity - vouchers issued
 *  soldQuantity  - vouchers already sold
 */
export const mockVouchers = [
  {
    id: "mock-1",
    name: "Buffet Hải Sản Cao Cấp 5 Sao",
    partnerName: "Nhà hàng Ocean Blue",
    category: "am-thuc",
    imageUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80",
    originalPrice: 650000,
    salePrice: 350000,
    rating: 4.8,
    reviewCount: 120,
    totalQuantity: 50,
    soldQuantity: 45,
  },
  {
    id: "mock-2",
    name: "Gói Massage Trị Liệu Cổ Vai Gáy",
    partnerName: "Zen Spa & Wellness",
    category: "lam-dep",
    imageUrl:
      "https://images.unsplash.com/photo-1519823551278-64ac92734fb1?w=400&q=80",
    originalPrice: 290000,
    salePrice: 199000,
    rating: 4.9,
    reviewCount: 85,
    totalQuantity: 200,
    soldQuantity: 120,
  },
  {
    id: "mock-3",
    name: "Voucher Phòng Deluxe 2 Ngày 1 Đêm",
    partnerName: "Sunrise Resort Đà Nẵng",
    category: "du-lich",
    imageUrl:
      "https://images.unsplash.com/photo-1566073771259-6a8506099945?w=400&q=80",
    originalPrice: 1700000,
    salePrice: 850000,
    rating: 4.7,
    reviewCount: 230,
    totalQuantity: 30,
    soldQuantity: 28,
  },
  {
    id: "mock-4",
    name: "Vé Vào Cổng Khu Vui Chơi VR Cao Cấp",
    partnerName: "Galaxy VR Center",
    category: "giai-tri",
    imageUrl:
      "https://images.unsplash.com/photo-1592478411213-6153e4ebc07d?w=400&q=80",
    originalPrice: 200000,
    salePrice: 160000,
    rating: 4.6,
    reviewCount: 50,
    totalQuantity: 100,
    soldQuantity: 45,
  },
  {
    id: "mock-5",
    name: "Combo 2 Burger Bò Nướng Phô Mai",
    partnerName: "Burger King",
    category: "am-thuc",
    // imageUrl null → should show placeholder without crash
    imageUrl: null,
    originalPrice: 145000,
    salePrice: 99000,
    rating: 4.5,
    reviewCount: 310,
    totalQuantity: 500,
    soldQuantity: 320,
  },
  {
    id: "mock-6",
    name: "Voucher Mua Laptop Apple / Dell",
    partnerName: "FPT Shop",
    category: "mua-sam",
    imageUrl:
      "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&q=80",
    originalPrice: 2000000,
    salePrice: 0,   // Free voucher edge-case
    rating: 4.3,
    reviewCount: 18,
    totalQuantity: 10,
    soldQuantity: 0,
  },
];

/** Category definitions used for the filter tabs */
export const CATEGORIES = [
  { key: "all",      label: "Tất cả",  emoji: "" },
  { key: "am-thuc",  label: "Ẩm thực", emoji: "🍜" },
  { key: "lam-dep",  label: "Làm đẹp", emoji: "💆" },
  { key: "du-lich",  label: "Du lịch", emoji: "✈️" },
  { key: "mua-sam",  label: "Mua sắm", emoji: "🛍️" },
  { key: "giai-tri", label: "Giải trí", emoji: "🎮" },
];
