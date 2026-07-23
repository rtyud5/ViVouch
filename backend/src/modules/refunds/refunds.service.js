import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { notify } from '../notifications/notifications.service.js';
import { log as auditLog } from '../auditLogs/auditLog.service.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';


async function restoreReservedInventory(tx, orderId) {
  const items = await tx.orderItem.findMany({
    where: { orderId },
    select: { voucherId: true, qty: true },
  });
  for (const item of items) {
    await tx.$executeRaw`
      UPDATE "Voucher"
      SET "soldQty" = GREATEST(0, "soldQty" - ${item.qty}),
          "updatedAt" = NOW()
      WHERE id = ${item.voucherId}
    `;
  }
}

function mapRefund(refund) {
  return {
    ...refund,
    order: refund.order ? { ...refund.order, totalAmount: Number(refund.order.totalAmount) } : undefined,
  };
}

export async function createRefundRequest(userId, { orderId, reason }) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${orderId} FOR UPDATE`;
    await tx.$queryRaw`
      SELECT id FROM "VoucherCode"
      WHERE "orderId" = ${orderId}
      ORDER BY id
      FOR UPDATE
    `;
    const order = await tx.order.findFirst({
      where: { id: orderId, userId },
      include: {
        payment: true,
        refundRequest: true,
        voucherCodes: true,
        items: { include: { voucher: { select: { allowRefund: true, refundWindowHours: true, title: true } } } },
      },
    });
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
    if (order.status !== 'COMPLETED' || order.payment?.status !== 'PAID') {
      throw new AppError('Chỉ đơn đã thanh toán mới được yêu cầu hoàn tiền', 409, 'ORDER_NOT_REFUNDABLE');
    }
    if (order.refundRequest) throw new AppError('Đơn đã có yêu cầu hoàn tiền', 409, 'REFUND_ALREADY_EXISTS');
    if (order.voucherCodes.length === 0 || order.voucherCodes.some((code) => code.status !== 'ISSUED')) {
      throw new AppError('Voucher đã dùng, bị khóa hoặc không còn hợp lệ để hoàn', 409, 'VOUCHER_NOT_REFUNDABLE');
    }
    const now = Date.now();
    for (const item of order.items) {
      if (!item.voucher.allowRefund) {
        throw new AppError(`Voucher "${item.voucher.title}" không hỗ trợ hoàn tiền`, 409, 'REFUND_NOT_ALLOWED');
      }
      const deadline = order.createdAt.getTime() + item.voucher.refundWindowHours * 60 * 60 * 1000;
      if (now > deadline) throw new AppError('Đã quá thời hạn yêu cầu hoàn tiền', 409, 'REFUND_WINDOW_EXPIRED');
    }

    const refund = await tx.refundRequest.create({ data: { orderId, userId, reason } });
    await tx.order.update({ where: { id: orderId }, data: { status: 'REFUND_PENDING' } });
    await tx.voucherCode.updateMany({ where: { orderId, status: 'ISSUED' }, data: { status: 'REFUND_PENDING' } });
    await auditLog(userId, AUDIT_ACTIONS.CUSTOMER_REQUEST_REFUND, 'RefundRequest', refund.id, {
      orderId,
      oldValues: { orderStatus: 'COMPLETED', voucherCodeStatus: 'ISSUED' },
      newValues: { orderStatus: 'REFUND_PENDING', voucherCodeStatus: 'REFUND_PENDING' },
    }, tx);
    return refund;
  }, { timeout: 10000 });
}

export async function listUserRefunds(userId) {
  const refunds = await prisma.refundRequest.findMany({
    where: { userId },
    include: { order: { include: { payment: true } } },
    orderBy: { createdAt: 'desc' },
  });
  return refunds.map(mapRefund);
}

export async function listAdminRefunds({ status, page = 1, limit = 20 } = {}) {
  const where = status ? { status } : {};
  const [items, total] = await Promise.all([
    prisma.refundRequest.findMany({
      where,
      include: {
        user: { select: { id: true, email: true, fullName: true } },
        order: { include: { payment: true, voucherCodes: { select: { status: true } } } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.refundRequest.count({ where }),
  ]);
  return { items: items.map(mapRefund), pagination: { page, limit, total, totalPages: Math.ceil(total / limit) } };
}

async function notifyRefund(tx, refund, status, adminNote) {
  const user = await tx.user.findUnique({ where: { id: refund.userId }, select: { email: true } });
  await notify({
    userId: refund.userId,
    type: 'REFUND_RESOLVED',
    title: 'Yêu cầu hoàn tiền đã được xử lý',
    message: `Yêu cầu hoàn tiền đơn ${refund.orderId}: ${status}.`,
    referenceType: 'REFUND',
    referenceId: refund.id,
    email: user?.email,
    emailTemplate: 'REFUND_RESOLVED',
    emailPayload: { orderId: refund.orderId, status, adminNote },
  }, tx);
}

export async function approveRefund(adminId, refundId, { adminNote }) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "RefundRequest" WHERE id = ${refundId} FOR UPDATE`;
    const refund = await tx.refundRequest.findUnique({
      where: { id: refundId },
      include: { order: { include: { payment: true } } },
    });
    if (!refund) throw new AppError('Không tìm thấy yêu cầu hoàn tiền', 404, 'REFUND_NOT_FOUND');
    if (refund.status !== 'REQUESTED') throw new AppError('Yêu cầu đã được xử lý', 409, 'REFUND_ALREADY_RESOLVED');

    if (refund.order.payment.method === 'PAYOS') {
      const updated = await tx.refundRequest.update({
        where: { id: refundId },
        data: { status: 'MANUAL_REFUND_REQUIRED', adminNote, resolvedBy: adminId, resolvedAt: null },
      });
      await notifyRefund(tx, refund, 'CẦN HOÀN THỦ CÔNG', adminNote);
      await auditLog(adminId, AUDIT_ACTIONS.ADMIN_APPROVE_REFUND, 'RefundRequest', refundId, {
        paymentMethod: 'PAYOS',
        newValues: { status: 'MANUAL_REFUND_REQUIRED' },
      }, tx);
      return updated;
    }

    await tx.$executeRaw`SELECT id FROM "Wallet" WHERE "userId" = ${refund.userId} FOR UPDATE`;
    const wallet = await tx.wallet.findUnique({ where: { userId: refund.userId } });
    if (!wallet) throw new AppError('Không tìm thấy Ví ViVouch', 404, 'WALLET_NOT_FOUND');
    const amount = Number(refund.order.totalAmount);
    const before = Number(wallet.balance);
    const after = before + amount;
    await tx.wallet.update({ where: { id: wallet.id }, data: { balance: after } });
    await tx.walletTransaction.create({
      data: {
        walletId: wallet.id,
        orderId: refund.orderId,
        type: 'REFUND',
        amount,
        balanceBefore: before,
        balanceAfter: after,
        note: `Hoàn tiền đơn ${refund.orderId}`,
      },
    });
    await tx.payment.update({ where: { orderId: refund.orderId }, data: { status: 'REFUNDED' } });
    await restoreReservedInventory(tx, refund.orderId);
    await tx.order.update({ where: { id: refund.orderId }, data: { status: 'REFUNDED' } });
    await tx.voucherCode.updateMany({ where: { orderId: refund.orderId, status: 'REFUND_PENDING' }, data: { status: 'REFUNDED' } });
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: { status: 'REFUNDED', adminNote, resolvedBy: adminId, resolvedAt: new Date() },
    });
    await notifyRefund(tx, refund, 'ĐÃ HOÀN TIỀN', adminNote);
    await auditLog(adminId, AUDIT_ACTIONS.ADMIN_APPROVE_REFUND, 'RefundRequest', refundId, {
      paymentMethod: 'VIVOUCH_WALLET',
      amount,
      newValues: { status: 'REFUNDED' },
    }, tx);
    return updated;
  }, { timeout: 10000 });
}

export async function rejectRefund(adminId, refundId, { adminNote }) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "RefundRequest" WHERE id = ${refundId} FOR UPDATE`;
    const refund = await tx.refundRequest.findUnique({ where: { id: refundId } });
    if (!refund) throw new AppError('Không tìm thấy yêu cầu hoàn tiền', 404, 'REFUND_NOT_FOUND');
    if (refund.status !== 'REQUESTED') throw new AppError('Yêu cầu đã được xử lý', 409, 'REFUND_ALREADY_RESOLVED');
    await tx.order.update({ where: { id: refund.orderId }, data: { status: 'COMPLETED' } });
    await tx.voucherCode.updateMany({ where: { orderId: refund.orderId, status: 'REFUND_PENDING' }, data: { status: 'ISSUED' } });
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: { status: 'REJECTED', adminNote, resolvedBy: adminId, resolvedAt: new Date() },
    });
    await notifyRefund(tx, refund, 'TỪ CHỐI', adminNote);
    await auditLog(adminId, AUDIT_ACTIONS.ADMIN_REJECT_REFUND, 'RefundRequest', refundId, { adminNote }, tx);
    return updated;
  });
}

export async function completeManualRefund(adminId, refundId, { adminNote, providerRefundReference }) {
  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "RefundRequest" WHERE id = ${refundId} FOR UPDATE`;
    const refund = await tx.refundRequest.findUnique({ where: { id: refundId } });
    if (!refund) throw new AppError('Không tìm thấy yêu cầu hoàn tiền', 404, 'REFUND_NOT_FOUND');
    if (refund.status !== 'MANUAL_REFUND_REQUIRED') {
      throw new AppError('Yêu cầu không ở trạng thái chờ hoàn thủ công', 409, 'MANUAL_REFUND_NOT_REQUIRED');
    }
    await tx.payment.update({ where: { orderId: refund.orderId }, data: { status: 'REFUNDED', providerReference: providerRefundReference } });
    await restoreReservedInventory(tx, refund.orderId);
    await tx.order.update({ where: { id: refund.orderId }, data: { status: 'REFUNDED' } });
    await tx.voucherCode.updateMany({ where: { orderId: refund.orderId, status: 'REFUND_PENDING' }, data: { status: 'REFUNDED' } });
    const updated = await tx.refundRequest.update({
      where: { id: refundId },
      data: {
        status: 'REFUNDED',
        adminNote,
        providerRefundReference,
        resolvedBy: adminId,
        resolvedAt: new Date(),
      },
    });
    await notifyRefund(tx, refund, 'ĐÃ HOÀN TIỀN THỦ CÔNG', adminNote);
    await auditLog(adminId, AUDIT_ACTIONS.ADMIN_COMPLETE_MANUAL_REFUND, 'RefundRequest', refundId, {
      providerRefundReference,
      newValues: { status: 'REFUNDED' },
    }, tx);
    return updated;
  });
}
