import { prisma } from '../../config/prisma.js';
import { customAlphabet } from 'nanoid';

const generateVoucherCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

/**
 * Helper xử lý lõi của luồng Checkout (gồm khóa dòng, kiểm tra tồn kho, tạo Order, tạo Payment)
 * Chạy bên trong một Prisma Transaction đã được khởi tạo.
 * 
 * @param {Object} tx - Prisma Transaction Client
 * @param {string} userId - ID của người dùng
 * @param {Array<{id: string, qty: number}>} sortedItems - Danh sách voucher đã được sắp xếp để tránh deadlock
 * @returns {Promise<Object>} Kết quả checkout
 */
const processCheckout = async (tx, userId, sortedItems) => {
  let totalAmount = 0;
  const orderItemsData = [];
  const returnVoucherCodes = [];

  for (const item of sortedItems) {
    const voucherId = item.id;
    const qty = item.qty;

    // Row-level lock: Lock row của voucher để đảm bảo an toàn đồng thời
    await tx.$executeRaw`SELECT id FROM "Voucher" WHERE id = ${voucherId} FOR UPDATE`;

    const voucher = await tx.voucher.findFirst({
      where: { id: voucherId, status: 'ON_SALE' }
    });

    if (!voucher) {
      throw new Error("VOUCHER_UNAVAILABLE:" + voucherId);
    }

    // Kiểm tra tồn kho
    const remainingQty = voucher.totalQty - voucher.soldQty;
    if (remainingQty < qty) {
      throw new Error("INSUFFICIENT_STOCK:" + voucherId);
    }

    // Cập nhật số lượng đã bán (soldQty)
    await tx.voucher.update({
      where: { id: voucherId },
      data: { soldQty: { increment: qty } }
    });

    const unitPrice = Number(voucher.salePrice);
    totalAmount += unitPrice * qty;

    orderItemsData.push({
      voucherId,
      title: voucher.title,
      qty,
      unitPrice: voucher.salePrice,
      useEnd: voucher.useEnd
    });
  }

  // Chuẩn bị dữ liệu VoucherCode trước
  const voucherCodesData = [];
  for (const item of orderItemsData) {
    for (let i = 0; i < item.qty; i++) {
      const code = `VC-2026-${generateVoucherCode()}`;
      voucherCodesData.push({
        code,
        voucherId: item.voucherId,
        ownerId: userId,
        status: 'ISSUED',
        expiresAt: item.useEnd || null
      });

      returnVoucherCodes.push({
        code,
        voucherTitle: item.title,
        expiresAt: item.useEnd || null
      });
    }
  }

  // Tạo Order(COMPLETED), OrderItems và VoucherCodes bằng Nested Writes
  const order = await tx.order.create({
    data: {
      userId,
      status: 'COMPLETED',
      totalAmount,
      items: {
        create: orderItemsData.map(({ voucherId, qty, unitPrice }) => ({
          voucherId, qty, unitPrice
        }))
      },
      voucherCodes: {
        create: voucherCodesData
      }
    }
  });

  // Tạo Payment(PAID/mock)
  await tx.payment.create({
    data: {
      orderId: order.id,
      method: 'MOCK_GATEWAY',
      status: 'PAID',
      amount: totalAmount
    }
  });

  return {
    orderId: order.id,
    voucherCodes: returnVoucherCodes
  };
};

/**
 * Luồng Mua Ngay (Buy Now)
 * @param {string} userId - ID của người dùng
 * @param {Array<{id: string, qty: number}>} items - Danh sách voucher cần mua
 * @returns {Promise<Object>} Order đã tạo
 */
export const buyNow = async (userId, items) => {
  if (!items || items.length === 0) {
    throw new Error('EMPTY_ITEMS');
  }

  // Gộp các item trùng ID và cộng dồn số lượng
  const aggregatedMap = new Map();
  for (const item of items) {
    const currentQty = aggregatedMap.get(item.id) || 0;
    aggregatedMap.set(item.id, currentQty + item.qty);
  }
  const aggregatedItems = Array.from(aggregatedMap.entries()).map(([id, qty]) => ({ id, qty }));

  // Sắp xếp items theo id để tránh deadlock khi lock nhiều row
  const sortedItems = aggregatedItems.sort((a, b) => a.id.localeCompare(b.id));

  return await prisma.$transaction(async (tx) => {
    return await processCheckout(tx, userId, sortedItems);
  }, {
    timeout: 10000
  });
};

/**
 * Luồng Thanh Toán từ Giỏ hàng (Checkout from Cart)
 * @param {string} userId - ID của người dùng
 * @returns {Promise<Object>} Order đã tạo
 */
export const checkoutFromCart = async (userId) => {
  let cartItemIdsToDelete = [];

  const result = await prisma.$transaction(async (tx) => {
    // Lấy giỏ hàng
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new Error('EMPTY_CART');
    }

    const checkoutItems = cart.items.map(item => ({
      id: item.voucherId,
      qty: item.qty
    }));

    // Sắp xếp items theo id để tránh deadlock khi lock nhiều row
    const sortedItems = [...checkoutItems].sort((a, b) => a.id.localeCompare(b.id));

    // Lấy ID để xóa sau transaction
    cartItemIdsToDelete = cart.items.map(item => item.id);

    // Thực thi xử lý Checkout lõi
    return await processCheckout(tx, userId, sortedItems);
  }, {
    timeout: 10000
  });

  // Xóa các cart items đã mua sau khi transaction hoàn tất thành công
  if (cartItemIdsToDelete.length > 0) {
    try {
      await prisma.cartItem.deleteMany({
        where: { id: { in: cartItemIdsToDelete } }
      });
    } catch (err) {
      console.error("Lỗi xóa CartItem ngoài transaction:", err);
    }
  }

  return result;
};

/**
 * Lấy danh sách đơn hàng của user
 */
export const getUserOrders = async (userId) => {
  return await prisma.order.findMany({
    where: { userId },
    include: {
      items: {
        include: {
          voucher: {
            select: {
              title: true,
              imageUrl: true
            }
          }
        }
      },
      payment: true
    },
    orderBy: { createdAt: 'desc' }
  });
};

/**
 * Lấy danh sách mã voucher đã mua của user
 */
export const getUserVoucherCodes = async (userId) => {
  return await prisma.voucherCode.findMany({
    where: { ownerId: userId },
    include: {
      voucher: {
        select: {
          title: true,
          imageUrl: true
        }
      }
    },
    orderBy: { issuedAt: 'desc' }
  });
};

export default { buyNow, checkoutFromCart, getUserOrders, getUserVoucherCodes };
