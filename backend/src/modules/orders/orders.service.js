import { customAlphabet } from 'nanoid';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { log as auditLog } from '../auditLogs/auditLog.service.js';
import { notify } from '../notifications/notifications.service.js';
import { createPayOsPaymentLink } from '../payments/payos.service.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import {
  aggregateAndSortItems,
  createCheckoutFingerprint,
  createNumericProviderOrderCode,
} from './orders.utils.js';

const generateVoucherCode = customAlphabet('ABCDEFGHJKLMNPQRSTUVWXYZ23456789', 12);

function mapOrderResult(order, idempotentReplay = false) {
  return {
    orderId: order.id,
    orderStatus: order.status,
    paymentMethod: order.payment?.method || null,
    paymentStatus: order.payment?.status || null,
    checkoutUrl: order.payment?.checkoutUrl || null,
    idempotentReplay,
    voucherCodes: (order.voucherCodes || []).map((item) => ({
      code: item.code,
      voucherId: item.voucherId,
      voucherTitle: item.voucher.title,
      imageUrl: item.voucher.imageUrl,
      expiresAt: item.expiresAt,
    })),
  };
}

async function findExistingOrder(tx, userId, idempotencyKey, fingerprint) {
  if (!idempotencyKey) return null;
  const order = await tx.order.findFirst({
    where: { userId, idempotencyKey },
    include: {
      payment: true,
      voucherCodes: { include: { voucher: { select: { title: true, imageUrl: true } } } },
    },
  });
  if (!order) return null;
  if (order.requestFingerprint && order.requestFingerprint !== fingerprint) {
    throw new AppError(
      'Idempotency-Key đã được dùng cho một nội dung checkout khác',
      409,
      'IDEMPOTENCY_PAYLOAD_CONFLICT',
    );
  }
  return mapOrderResult(order, true);
}


async function findCartCheckoutReplay(userId, checkoutData) {
  if (!checkoutData.idempotencyKey) return null;
  const order = await prisma.order.findFirst({
    where: { userId, idempotencyKey: checkoutData.idempotencyKey },
    include: {
      items: { select: { voucherId: true, qty: true } },
      payment: true,
      voucherCodes: { include: { voucher: { select: { title: true, imageUrl: true } } } },
    },
  });
  if (!order) return null;
  const items = order.items
    .map((item) => ({ id: item.voucherId, qty: item.qty }))
    .sort((left, right) => left.id.localeCompare(right.id));
  const fingerprint = createCheckoutFingerprint(items, checkoutData);
  if (order.requestFingerprint && order.requestFingerprint !== fingerprint) {
    throw new AppError(
      'Idempotency-Key đã được dùng cho một nội dung checkout khác',
      409,
      'IDEMPOTENCY_PAYLOAD_CONFLICT',
    );
  }
  return mapOrderResult(order, true);
}

async function reserveVoucherInventory(tx, sortedItems) {
  const prepared = [];
  let totalAmount = 0;
  for (const item of sortedItems) {
    await tx.$executeRaw`SELECT id FROM "Voucher" WHERE id = ${item.id} FOR UPDATE`;
    const voucher = await tx.voucher.findUnique({
      where: { id: item.id },
      include: { partner: { select: { status: true } } },
    });
    if (!voucher) throw new AppError('Không tìm thấy voucher', 404, 'VOUCHER_NOT_FOUND');
    const now = new Date();
    if (voucher.status !== 'ON_SALE' || voucher.partner.status !== 'APPROVED') {
      throw new AppError(`Voucher "${voucher.title}" không còn được bán`, 400, 'VOUCHER_UNAVAILABLE');
    }
    if (voucher.saleStart && voucher.saleStart > now) {
      throw new AppError(`Voucher "${voucher.title}" chưa mở bán`, 400, 'VOUCHER_NOT_YET_ON_SALE');
    }
    if (voucher.saleEnd && voucher.saleEnd < now) {
      throw new AppError(`Voucher "${voucher.title}" đã hết thời gian bán`, 400, 'VOUCHER_SALE_EXPIRED');
    }
    const remaining = voucher.totalQty - voucher.soldQty;
    if (remaining < item.qty) {
      throw new AppError(`Voucher "${voucher.title}" chỉ còn ${remaining}`, 409, 'VOUCHER_OUT_OF_STOCK');
    }
    await tx.voucher.update({ where: { id: voucher.id }, data: { soldQty: { increment: item.qty } } });
    totalAmount += Number(voucher.salePrice) * item.qty;
    prepared.push({
      voucherId: voucher.id,
      qty: item.qty,
      unitPrice: voucher.salePrice,
      useEnd: voucher.useEnd,
      title: voucher.title,
      imageUrl: voucher.imageUrl,
    });
  }
  return { prepared, totalAmount };
}

export async function issueVoucherCodesForOrder(tx, orderId, ownerId) {
  const existing = await tx.voucherCode.findMany({
    where: { orderId },
    include: { voucher: { select: { title: true, imageUrl: true } } },
  });
  if (existing.length > 0) return existing;

  const items = await tx.orderItem.findMany({
    where: { orderId },
    include: { voucher: { select: { title: true, imageUrl: true, useEnd: true } } },
  });
  const result = [];
  for (const item of items) {
    for (let index = 0; index < item.qty; index += 1) {
      const created = await tx.voucherCode.create({
        data: {
          code: `VC-${generateVoucherCode()}`,
          orderId,
          voucherId: item.voucherId,
          ownerId,
          status: 'ISSUED',
          expiresAt: item.voucher.useEnd || null,
        },
        include: { voucher: { select: { title: true, imageUrl: true } } },
      });
      result.push(created);
    }
  }
  return result;
}

async function payWithWallet(tx, order, user) {
  await tx.$executeRaw`SELECT id FROM "Wallet" WHERE "userId" = ${user.id} FOR UPDATE`;
  const wallet = await tx.wallet.findUnique({ where: { userId: user.id } });
  if (!wallet) throw new AppError('Không tìm thấy Ví ViVouch', 404, 'WALLET_NOT_FOUND');
  const amount = Number(order.totalAmount);
  const before = Number(wallet.balance);
  if (before < amount) throw new AppError('Số dư Ví ViVouch không đủ', 409, 'INSUFFICIENT_WALLET_BALANCE');
  const after = before - amount;
  await tx.wallet.update({ where: { id: wallet.id }, data: { balance: after } });
  await tx.walletTransaction.create({
    data: {
      walletId: wallet.id,
      orderId: order.id,
      type: 'PAYMENT',
      amount,
      balanceBefore: before,
      balanceAfter: after,
      note: `Thanh toán đơn ${order.id}`,
    },
  });
  const paidAt = new Date();
  await tx.payment.update({ where: { orderId: order.id }, data: { status: 'PAID', paidAt } });
  await tx.order.update({ where: { id: order.id }, data: { status: 'COMPLETED' } });
  const codes = await issueVoucherCodesForOrder(tx, order.id, user.id);

  await notify({
    userId: user.id,
    type: 'PAYMENT_SUCCESS',
    title: 'Thanh toán thành công',
    message: `Đơn ${order.id} đã thanh toán bằng Ví ViVouch.`,
    referenceType: 'ORDER',
    referenceId: order.id,
    email: user.email,
    emailTemplate: 'PAYMENT_SUCCESS',
    emailPayload: { orderId: order.id, amount, method: 'Ví ViVouch' },
  }, tx);
  await notify({
    userId: user.id,
    type: 'VOUCHER_ISSUED',
    title: 'Voucher đã được phát hành',
    message: `${codes.length} voucher đã sẵn sàng sử dụng.`,
    referenceType: 'ORDER',
    referenceId: order.id,
    email: user.email,
    emailTemplate: 'VOUCHER_ISSUED',
    emailPayload: { orderId: order.id, quantity: codes.length },
  }, tx);
  return codes;
}

async function createReservation({ userId, sortedItems, checkoutData, cartItemIds = [] }) {
  const fingerprint = createCheckoutFingerprint(sortedItems, checkoutData);
  return prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM "User" WHERE id = ${userId} FOR UPDATE`;
    const existing = await findExistingOrder(tx, userId, checkoutData.idempotencyKey, fingerprint);
    if (existing) return { result: existing, existing: true };

    const user = await tx.user.findUnique({ where: { id: userId }, select: { id: true, email: true, fullName: true } });
    if (!user) throw new AppError('Không tìm thấy người dùng', 404, 'USER_NOT_FOUND');
    const { prepared, totalAmount } = await reserveVoucherInventory(tx, sortedItems);
    const method = checkoutData.paymentMethod;
    const providerOrderCode = method === 'PAYOS' ? createNumericProviderOrderCode() : null;
    const order = await tx.order.create({
      data: {
        userId,
        idempotencyKey: checkoutData.idempotencyKey || null,
        requestFingerprint: fingerprint,
        status: 'PENDING_PAYMENT',
        totalAmount,
        recipientName: checkoutData.recipientName || null,
        recipientPhone: checkoutData.recipientPhone || null,
        note: checkoutData.note || null,
        items: { create: prepared.map(({ voucherId, qty, unitPrice }) => ({ voucherId, qty, unitPrice })) },
        payment: {
          create: { method, status: 'PENDING', amount: totalAmount, providerOrderCode },
        },
      },
      include: { payment: true },
    });

    let codes = [];
    if (method === 'VIVOUCH_WALLET') {
      codes = await payWithWallet(tx, order, user);
      if (cartItemIds.length > 0) await tx.cartItem.deleteMany({ where: { id: { in: cartItemIds } } });
    }
    await auditLog(userId, AUDIT_ACTIONS.CUSTOMER_CHECKOUT, 'Order', order.id, {
      paymentMethod: method,
      totalAmount,
      idempotencyKey: checkoutData.idempotencyKey || null,
    }, tx);

    return {
      existing: false,
      result: {
        orderId: order.id,
        orderStatus: method === 'VIVOUCH_WALLET' ? 'COMPLETED' : 'PENDING_PAYMENT',
        paymentMethod: method,
        paymentStatus: method === 'VIVOUCH_WALLET' ? 'PAID' : 'PENDING',
        checkoutUrl: null,
        idempotentReplay: false,
        voucherCodes: codes.map((item) => ({
          code: item.code,
          voucherId: item.voucherId,
          voucherTitle: item.voucher.title,
          imageUrl: item.voucher.imageUrl,
          expiresAt: item.expiresAt,
        })),
      },
      providerOrderCode,
      amount: totalAmount,
      cartItemIds,
    };
  }, { timeout: 10000 });
}

async function compensatePayOsFailure(orderId) {
  await prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
    const paymentLocator = await tx.payment.findUnique({ where: { orderId }, select: { id: true } });
    if (paymentLocator) {
      await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${paymentLocator.id} FOR UPDATE`;
    }
    const order = await tx.order.findUnique({ where: { id: orderId }, include: { items: true, payment: true } });
    if (!order || order.status !== 'PENDING_PAYMENT' || order.payment?.status !== 'PENDING') return;
    for (const item of order.items) {
      await tx.voucher.update({ where: { id: item.voucherId }, data: { soldQty: { decrement: item.qty } } });
    }
    await tx.payment.update({ where: { orderId }, data: { status: 'FAILED' } });
    await tx.order.update({ where: { id: orderId }, data: { status: 'CANCELLED' } });
  }, { timeout: 10000 });
}

async function completePayOsLink(reservation) {
  try {
    const link = await createPayOsPaymentLink({
      orderCode: reservation.providerOrderCode,
      amount: reservation.amount,
      description: `ViVouch ${reservation.result.orderId.slice(0, 8)}`,
    });
    await prisma.$transaction(async (tx) => {
      await tx.payment.update({
        where: { orderId: reservation.result.orderId },
        data: {
          providerPaymentLinkId: link.paymentLinkId || link.id || null,
          checkoutUrl: link.checkoutUrl,
        },
      });
      if (reservation.cartItemIds.length > 0) {
        await tx.cartItem.deleteMany({ where: { id: { in: reservation.cartItemIds } } });
      }
    });
    return { ...reservation.result, checkoutUrl: link.checkoutUrl };
  } catch (error) {
    await compensatePayOsFailure(reservation.result.orderId);
    throw error;
  }
}

async function executeCheckout({ userId, items, checkoutData, cartItemIds = [] }) {
  const sortedItems = aggregateAndSortItems(items);
  if (sortedItems.length === 0) throw new AppError('Danh sách sản phẩm không được rỗng', 400, 'EMPTY_ITEMS');
  const reservation = await createReservation({ userId, sortedItems, checkoutData, cartItemIds });
  if (reservation.existing) return reservation.result;
  return checkoutData.paymentMethod === 'PAYOS' ? completePayOsLink(reservation) : reservation.result;
}

export function buyNow(userId, items, checkoutData) {
  return executeCheckout({ userId, items, checkoutData });
}

export async function checkoutFromCart(userId, checkoutData) {
  const replay = await findCartCheckoutReplay(userId, checkoutData);
  if (replay) return replay;

  const cartSnapshot = await prisma.$transaction(async (tx) => {
    await tx.$executeRaw`SELECT id FROM "Cart" WHERE "userId" = ${userId} FOR UPDATE`;
    const cart = await tx.cart.findUnique({ where: { userId }, include: { items: true } });
    if (!cart || cart.items.length === 0) throw new AppError('Giỏ hàng trống', 400, 'EMPTY_CART');
    return {
      items: cart.items.map((item) => ({ id: item.voucherId, qty: item.qty })),
      cartItemIds: cart.items.map((item) => item.id),
    };
  });
  return executeCheckout({ userId, checkoutData, ...cartSnapshot });
}

export async function getUserOrders(userId) {
  const orders = await prisma.order.findMany({
    where: { userId },
    include: {
      items: { include: { voucher: { select: { title: true, imageUrl: true, allowRefund: true, refundWindowHours: true } } } },
      payment: true,
      refundRequest: true,
      voucherCodes: { select: { id: true, status: true, expiresAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });
  return orders.map((order) => ({ ...order, totalAmount: Number(order.totalAmount) }));
}

export function getUserVoucherCodes(userId) {
  return prisma.voucherCode.findMany({
    where: { ownerId: userId },
    include: { voucher: { select: { title: true, imageUrl: true } } },
    orderBy: { issuedAt: 'desc' },
  });
}

export default { buyNow, checkoutFromCart, getUserOrders, getUserVoucherCodes };
