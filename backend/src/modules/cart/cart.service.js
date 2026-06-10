import { prisma } from "../../config/prisma.js";

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
 * Lấy hoặc tạo giỏ hàng cho user
 */
const getOrCreateCartId = async (userId) => {
  let cart = await prisma.cart.findUnique({
    where: { userId }
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId }
    });
  }
  return cart.id;
};

/**
 * Lấy chi tiết giỏ hàng
 * @param {string} userId
 * @returns {Promise<Object>} giỏ hàng kèm cartTotal
 */
export const getCart = async (userId) => {
  const cartId = await getOrCreateCartId(userId);

  const cart = await prisma.cart.findUnique({
    where: { id: cartId },
    include: {
      items: {
        include: {
          voucher: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      }
    }
  });

  const now = new Date();
  const mappedItems = cart.items.map(item => {
    const remainingQty = item.voucher.totalQty - item.voucher.soldQty;
    const isSaleActive = !item.voucher.saleEnd || new Date(item.voucher.saleEnd) >= now;
    const isSaleStarted = !item.voucher.saleStart || new Date(item.voucher.saleStart) <= now;
    const isAvailable = item.voucher.status === "ON_SALE" &&
                        remainingQty >= item.qty &&
                        isSaleActive &&
                        isSaleStarted;

    return {
      ...item,
      isAvailable
    };
  });

  const availableItems = mappedItems.filter(i => i.isAvailable);

  return {
    ...cart,
    items: mappedItems,
    cartTotal: calculateCartTotal(availableItems)
  };
};

/**
 * Thêm sản phẩm vào giỏ hàng
 * @param {string} userId
 * @param {Object} data { voucherId, qty }
 * @returns {Promise<Object>} giỏ hàng đã cập nhật
 */
export const addItem = async (userId, { voucherId, qty = 1 }) => {
  const cartId = await getOrCreateCartId(userId);

  await prisma.$transaction(async (tx) => {
    const voucher = await tx.voucher.findUnique({
      where: { id: voucherId }
    });

    if (!voucher) {
      const error = new Error("Voucher không tồn tại");
      error.statusCode = 404;
      throw error;
    }

    if (voucher.status !== "ON_SALE") {
      const error = new Error("Voucher không ở trạng thái đang bán");
      error.statusCode = 400;
      throw error;
    }

    const remainingQty = voucher.totalQty - voucher.soldQty;
    if (remainingQty < qty) {
      const error = new Error(`Số lượng voucher còn lại không đủ (còn ${remainingQty})`);
      error.statusCode = 400;
      throw error;
    }

    // UPSERT CartItem inside transaction
    const existingItem = await tx.cartItem.findUnique({
      where: {
        cartId_voucherId: {
          cartId,
          voucherId
        }
      }
    });

    if (existingItem) {
      // Nếu cập nhật thì nên kiểm tra lại tổng qty có vượt quá remainingQty không
      const newQty = existingItem.qty + qty;
      if (remainingQty < newQty) {
        const error = new Error(`Tổng số lượng trong giỏ (${newQty}) vượt quá số lượng còn lại (${remainingQty})`);
        error.statusCode = 400;
        throw error;
      }

      await tx.cartItem.update({
        where: { id: existingItem.id },
        data: { qty: newQty }
      });
    } else {
      await tx.cartItem.create({
        data: {
          cartId,
          voucherId,
          qty
        }
      });
    }
  });

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
  await prisma.$transaction(async (tx) => {
    const item = await tx.cartItem.findUnique({
      where: { id: cartItemId },
      include: {
        cart: true,
        voucher: true
      }
    });

    if (!item) {
      const error = new Error("Không tìm thấy sản phẩm này trong giỏ hàng");
      error.statusCode = 404;
      throw error;
    }

    if (item.cart.userId !== userId) {
      const error = new Error("Không có quyền truy cập sản phẩm này");
      error.statusCode = 403;
      throw error;
    }

    if (item.voucher.status !== "ON_SALE") {
      const error = new Error("Voucher không ở trạng thái đang bán");
      error.statusCode = 400;
      throw error;
    }

    const remainingQty = item.voucher.totalQty - item.voucher.soldQty;
    if (remainingQty < qty) {
      const error = new Error(`Số lượng voucher còn lại không đủ (còn ${remainingQty})`);
      error.statusCode = 400;
      throw error;
    }

    await tx.cartItem.update({
      where: { id: cartItemId },
      data: { qty }
    });
  });

  return getCart(userId);
};

/**
 * Xóa một CartItem khỏi giỏ hàng
 * @param {string} userId
 * @param {string} cartItemId
 * @returns {Promise<Object>} giỏ hàng đã cập nhật
 */
export const removeItem = async (userId, cartItemId) => {
  const item = await prisma.cartItem.findUnique({
    where: { id: cartItemId },
    include: { cart: true }
  });

  if (!item) {
    const error = new Error("Không tìm thấy sản phẩm này trong giỏ hàng");
    error.statusCode = 404;
    throw error;
  }

  if (item.cart.userId !== userId) {
    const error = new Error("Không có quyền truy cập sản phẩm này");
    error.statusCode = 403;
    throw error;
  }

  await prisma.cartItem.delete({
    where: { id: cartItemId }
  });

  return getCart(userId);
};
