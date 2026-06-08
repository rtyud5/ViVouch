// Dữ liệu mẫu ban đầu để Frontend có thể chạy thử hiển thị danh sách và tính toán tổng
let mockCart = {
  id: "cart-uuid-123456",
  userId: "user-uuid-999999",
  items: [
    {
      id: "cart-item-uuid-001",
      cartId: "cart-uuid-123456",
      voucherId: "e9f735f1-39c4-4e31-8db2-df66b72a6b25",
      qty: 2,
      createdAt: new Date("2026-06-08T10:16:52.000Z"),
      updatedAt: new Date("2026-06-08T10:16:52.000Z"),
      voucher: {
        id: "e9f735f1-39c4-4e31-8db2-df66b72a6b25",
        title: "Highlands Coffee Voucher 50k",
        imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500",
        originalPrice: 50000,
        salePrice: 40000,
        status: "ON_SALE"
      }
    },
    {
      id: "cart-item-uuid-002",
      cartId: "cart-uuid-123456",
      voucherId: "b8c8d8f0-1234-5678-abcd-ef0123456789",
      qty: 1,
      createdAt: new Date("2026-06-08T10:16:52.000Z"),
      updatedAt: new Date("2026-06-08T10:16:52.000Z"),
      voucher: {
        id: "b8c8d8f0-1234-5678-abcd-ef0123456789",
        title: "Phúc Long Tea & Coffee Voucher 100k",
        imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500",
        originalPrice: 100000,
        salePrice: 90000,
        status: "ON_SALE"
      }
    },
    {
      id: "cart-item-uuid-003",
      cartId: "cart-uuid-123456",
      voucherId: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      qty: 3,
      createdAt: new Date("2026-06-08T10:16:52.000Z"),
      updatedAt: new Date("2026-06-08T10:16:52.000Z"),
      voucher: {
        id: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
        title: "CGV Cinema Vé Xem Phim 3D",
        imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
        originalPrice: 120000,
        salePrice: 85000,
        status: "ON_SALE"
      }
    }
  ]
};

/**
 * Tính toán các thông số tổng hợp của giỏ hàng
 * @param {Array} items
 * @returns {Object} cartTotal
 */
const calculateCartTotal = (items) => {
  const totalUniqueItems = items.length;
  const totalQty = items.reduce((sum, item) => sum + item.qty, 0);
  const totalOriginalAmount = items.reduce((sum, item) => sum + (item.qty * Number(item.voucher.originalPrice)), 0);
  const totalAmount = items.reduce((sum, item) => sum + (item.qty * Number(item.voucher.salePrice)), 0);
  const totalSavings = totalOriginalAmount - totalAmount;

  return {
    totalUniqueItems,
    totalQty,
    totalOriginalAmount,
    totalAmount,
    totalSavings
  };
};

/**
 * Lấy chi tiết giỏ hàng
 * @param {string} userId
 * @returns {Promise<Object>} giỏ hàng kèm cartTotal
 */
export const getCart = async (userId) => {
  return {
    ...mockCart,
    userId,
    cartTotal: calculateCartTotal(mockCart.items)
  };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string} userId
 * @param {Object} data { voucherId, qty }
 * @returns {Promise<Object>} giỏ hàng đã cập nhật
 */
export const addItem = async (userId, { voucherId, qty = 1 }) => {
  // Từ điển giả lập các voucher để lấy thông tin chi tiết khi thêm vào giỏ hàng
  const mockVouchers = {
    "e9f735f1-39c4-4e31-8db2-df66b72a6b25": {
      id: "e9f735f1-39c4-4e31-8db2-df66b72a6b25",
      title: "Highlands Coffee Voucher 50k",
      imageUrl: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=500",
      originalPrice: 50000,
      salePrice: 40000,
      status: "ON_SALE"
    },
    "b8c8d8f0-1234-5678-abcd-ef0123456789": {
      id: "b8c8d8f0-1234-5678-abcd-ef0123456789",
      title: "Phúc Long Tea & Coffee Voucher 100k",
      imageUrl: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=500",
      originalPrice: 100000,
      salePrice: 90000,
      status: "ON_SALE"
    },
    "a1b2c3d4-5678-90ab-cdef-1234567890ab": {
      id: "a1b2c3d4-5678-90ab-cdef-1234567890ab",
      title: "CGV Cinema Vé Xem Phim 3D",
      imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=500",
      originalPrice: 120000,
      salePrice: 85000,
      status: "ON_SALE"
    },
    "d2e3f4a5-6789-0abc-def1-234567890abc": {
      id: "d2e3f4a5-6789-0abc-def1-234567890abc",
      title: "KFC Voucher Gà Rán 150k",
      imageUrl: "https://images.unsplash.com/photo-1513639773648-2b96d2243ade?w=500",
      originalPrice: 150000,
      salePrice: 125000,
      status: "ON_SALE"
    }
  };

  const voucherInfo = mockVouchers[voucherId] || {
    id: voucherId,
    title: "Voucher Ưu Đãi Mới Thêm",
    imageUrl: "https://images.unsplash.com/photo-1555529669-e69e7aa0ba9a?w=500",
    originalPrice: 200000,
    salePrice: 180000,
    status: "ON_SALE"
  };

  const existingItemIndex = mockCart.items.findIndex(item => item.voucherId === voucherId);

  if (existingItemIndex > -1) {
    // Cộng dồn số lượng nếu đã tồn tại voucherId trong giỏ
    mockCart.items[existingItemIndex].qty += qty;
    mockCart.items[existingItemIndex].updatedAt = new Date();
  } else {
    // Thêm mới một CartItem vào mảng mockCart
    const newItem = {
      id: `cart-item-uuid-${Math.random().toString(36).substr(2, 9)}`,
      cartId: mockCart.id,
      voucherId,
      qty,
      createdAt: new Date(),
      updatedAt: new Date(),
      voucher: voucherInfo
    };
    mockCart.items.push(newItem);
  }

  return getCart(userId);
};

/**
 * Cập nhật số lượng của một CartItem trong giỏ hàng
 * @param {string} userId
 * @param {string} cartItemId
 * @param {number} qty
 * @returns {Promise<Object>} giỏ hàng đã cập nhật
 */
export const updateQty = async (userId, cartItemId, qty) => {
  const itemIndex = mockCart.items.findIndex(item => item.id === cartItemId);

  if (itemIndex === -1) {
    const error = new Error("Không tìm thấy sản phẩm này trong giỏ hàng");
    error.statusCode = 404;
    throw error;
  }

  mockCart.items[itemIndex].qty = qty;
  mockCart.items[itemIndex].updatedAt = new Date();

  return getCart(userId);
};

/**
 * Xóa một CartItem khỏi giỏ hàng
 * @param {string} userId
 * @param {string} cartItemId
 * @returns {Promise<Object>} giỏ hàng đã cập nhật
 */
export const removeItem = async (userId, cartItemId) => {
  const itemIndex = mockCart.items.findIndex(item => item.id === cartItemId);

  if (itemIndex === -1) {
    const error = new Error("Không tìm thấy sản phẩm này trong giỏ hàng");
    error.statusCode = 404;
    throw error;
  }

  mockCart.items.splice(itemIndex, 1);

  return getCart(userId);
};
