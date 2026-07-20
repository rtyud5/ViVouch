import { prisma } from '../../config/prisma.js';
import { customAlphabet } from 'nanoid';
import { log as auditLog } from '../auditLogs/auditLog.service.js';
import { AppError } from '../../utils/appError.js';
import { createSimulatedPayment } from '../payments/payment.service.js';

const generateVoucherCode = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

const mapExistingOrder = (order) => ({
  orderId: order.id,
  idempotentReplay: true,
  voucherCodes: order.voucherCodes.map((voucherCode) => ({
    code: voucherCode.code,
    voucherId: voucherCode.voucherId,
    voucherTitle: voucherCode.voucher.title,
    imageUrl: voucherCode.voucher.imageUrl,
    expiresAt: voucherCode.expiresAt,
  })),
});

const findIdempotentOrder = async (tx, userId, idempotencyKey) => {
  if (!idempotencyKey) return null;

  const order = await tx.order.findFirst({
    where: {
      userId,
      idempotencyKey,
    },
    include: {
      voucherCodes: {
        include: {
          voucher: { select: { title: true, imageUrl: true } },
        },
      },
    },
  });

  return order ? mapExistingOrder(order) : null;
};

/**
 * Helper xử lý lõi của luồng Checkout (gồm khóa dòng, kiểm tra tồn kho, tạo Order, tạo Payment)
 * Chạy bên trong một Prisma Transaction đã được khởi tạo.
 * 
 * @param {Object} tx - Prisma Transaction Client
 * @param {string} userId - ID của người dùng
 * @param {Array<{id: string, qty: number}>} sortedItems - Danh sách voucher đã được sắp xếp để tránh deadlock
 * @param {Object} checkoutData - Thông tin thanh toán và quà tặng/ghi chú
 * @returns {Promise<Object>} Kết quả checkout
 */
const processCheckout = async (tx, userId, sortedItems, checkoutData = {}) => {
  // Tuần tự hóa checkout của cùng một user để check idempotency và trừ kho là atomic.
  await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

  const existingOrder = await findIdempotentOrder(tx, userId, checkoutData.idempotencyKey);
  if (existingOrder) return existingOrder;

  const paymentMethod = checkoutData.paymentMethod || 'MOCK_GATEWAY';
  const recipientName = checkoutData.recipientName || null;
  const recipientPhone = checkoutData.recipientPhone || null;
  const note = checkoutData.note || null;

  let totalAmount = 0;
  const orderItemsData = [];
  const returnVoucherCodes = [];

  for (const item of sortedItems) {
    const voucherId = item.id;
    const qty = item.qty;

    // Row-level lock: Lock row của voucher để đảm bảo an toàn đồng thời
    await tx.$executeRaw`SELECT id FROM "Voucher" WHERE id = ${voucherId} FOR UPDATE`;

    const voucher = await tx.voucher.findUnique({
      where: { id: voucherId },
      include: { partner: { select: { status: true } } },
    });

    if (!voucher) {
      throw new AppError('Không tìm thấy voucher hoặc voucher không tồn tại.', 404, 'VOUCHER_NOT_FOUND');
    }

    if (voucher.status !== 'ON_SALE' || voucher.partner.status !== 'APPROVED') {
      throw new AppError(`Voucher "${voucher.title}" hiện không còn được bán.`, 400, 'VOUCHER_UNAVAILABLE');
    }

    // Check saleStart/saleEnd cơ bản khi checkout
    const now = new Date();
    if (voucher.saleStart && now < new Date(voucher.saleStart)) {
      throw new AppError(`Voucher "${voucher.title}" chưa đến thời gian mở bán.`, 400, 'VOUCHER_NOT_YET_ON_SALE');
    }
    if (voucher.saleEnd && now > new Date(voucher.saleEnd)) {
      throw new AppError(`Voucher "${voucher.title}" đã hết hạn bán.`, 400, 'VOUCHER_SALE_EXPIRED');
    }

    // Kiểm tra tồn kho
    const remainingQty = voucher.totalQty - voucher.soldQty;
    if (remainingQty <= 0) {
      throw new AppError(`Voucher "${voucher.title}" đã hết số lượng phát hành.`, 400, 'VOUCHER_OUT_OF_STOCK');
    }
    if (remainingQty < qty) {
      throw new AppError(`Voucher "${voucher.title}" không đủ số lượng yêu cầu (Còn lại: ${remainingQty}).`, 400, 'VOUCHER_OUT_OF_STOCK');
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
      imageUrl: voucher.imageUrl,
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
        voucherId: item.voucherId,
        voucherTitle: item.title,
        imageUrl: item.imageUrl,
        expiresAt: item.useEnd || null
      });
    }
  }

  // Tạo Order(COMPLETED), OrderItems và VoucherCodes bằng Nested Writes
  const order = await tx.order.create({
    data: {
      userId,
      idempotencyKey: checkoutData.idempotencyKey || null,
      status: 'COMPLETED',
      totalAmount,
      recipientName,
      recipientPhone,
      note,
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
  await createSimulatedPayment(tx, { orderId: order.id, method: paymentMethod, amount: totalAmount });

  // Ghi audit log
  await auditLog(userId, 'CHECKOUT', 'Order', order.id, {
    totalAmount,
    recipientName,
    recipientPhone,
    note
  }, tx);

  return {
    orderId: order.id,
    voucherCodes: returnVoucherCodes
  };
};

/**
 * Luồng Mua Ngay (Buy Now)
 * @param {string} userId - ID của người dùng
 * @param {Array<{id: string, qty: number}>} items - Danh sách voucher cần mua
 * @param {Object} checkoutData - Thông tin thanh toán và quà tặng/ghi chú
 * @returns {Promise<Object>} Order đã tạo
 */
export const buyNow = async (userId, items, checkoutData = {}) => {
  if (!items || items.length === 0) {
    throw new AppError('Danh sách sản phẩm không được rỗng', 400, 'EMPTY_ITEMS');
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
    return await processCheckout(tx, userId, sortedItems, checkoutData);
  }, {
    timeout: 10000
  });
};

/**
 * Luồng Thanh Toán từ Giỏ hàng (Checkout from Cart)
 * @param {string} userId - ID của người dùng
 * @param {Object} checkoutData - Thông tin thanh toán và quà tặng/ghi chú
 * @returns {Promise<Object>} Order đã tạo
 */
export const checkoutFromCart = async (userId, checkoutData = {}) => {
  return await prisma.$transaction(async (tx) => {
    // 0. Lock User trước để đảm bảo thứ tự lock nhất quán: User -> Cart -> Voucher
    await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;

    const existingOrder = await findIdempotentOrder(tx, userId, checkoutData.idempotencyKey);
    if (existingOrder) return existingOrder;

    // 1. Lock Cart trước khi đọc để đảm bảo atomic cho luồng giỏ hàng
    // Lưu ý: Các API thêm/sửa/xóa CartItem khác hiện chưa được bọc transaction chung với lock này,
    // nên lock này chủ yếu để chặn double-submit trên chính đường checkout này.
    await tx.$executeRaw`SELECT id FROM "Cart" WHERE "userId" = ${userId} FOR UPDATE`;

    // 2. Lấy giỏ hàng
    const cart = await tx.cart.findUnique({
      where: { userId },
      include: {
        items: true
      }
    });

    if (!cart || !cart.items || cart.items.length === 0) {
      throw new AppError('Giỏ hàng trống', 400, 'EMPTY_CART');
    }

    const checkoutItems = cart.items.map(item => ({
      id: item.voucherId,
      qty: item.qty
    }));

    // Sắp xếp items theo id để tránh deadlock khi lock nhiều row
    const sortedItems = [...checkoutItems].sort((a, b) => a.id.localeCompare(b.id));

    const cartItemIdsToDelete = cart.items.map(item => item.id);

    // 3. Thực thi xử lý Checkout lõi (Sẽ thực hiện lock User và trừ tồn kho)
    const result = await processCheckout(tx, userId, sortedItems, checkoutData);

    // 4. Xóa các cart items đã mua ngay BÊN TRONG transaction để đảm bảo tính nhất quán (Clear fallback: rollback if fails)
    if (cartItemIdsToDelete.length > 0) {
      await tx.cartItem.deleteMany({
        where: { id: { in: cartItemIdsToDelete } }
      });
      // Nếu có lỗi lúc xóa, toàn bộ transaction sẽ tự rollback
    }

    return result;
  }, {
    timeout: 10000
  });
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
