import { createHash } from 'node:crypto';
import { prisma } from '../../config/prisma.js';
import { AppError } from '../../utils/appError.js';
import { verifyPayOsWebhook } from './payos.service.js';
import { notify } from '../notifications/notifications.service.js';
import { log as auditLog } from '../auditLogs/auditLog.service.js';
import { AUDIT_ACTIONS } from '../../constants/auditActions.js';
import { logger } from '../../config/logger.js';
import { issueVoucherCodesForOrder } from '../orders/orders.service.js';

export function getPaymentStatus(userId, orderId) {
  return prisma.order.findFirst({
    where: { userId, OR: [{ id: orderId }, { payment: { providerOrderCode: orderId } }] },
    select: {
      id: true,
      status: true,
      totalAmount: true,
      payment: {
        select: { method: true, status: true, checkoutUrl: true, paidAt: true, cancelledAt: true },
      },
      voucherCodes: {
        select: {
          code: true,
          voucherId: true,
          expiresAt: true,
          voucher: { select: { title: true, imageUrl: true } },
        },
      },
    },
  }).then((order) => {
    if (!order) throw new AppError('Không tìm thấy đơn hàng', 404, 'ORDER_NOT_FOUND');
    return {
      ...order,
      totalAmount: Number(order.totalAmount),
      voucherCodes: order.voucherCodes.map((item) => ({
        code: item.code,
        voucherId: item.voucherId,
        voucherTitle: item.voucher.title,
        imageUrl: item.voucher.imageUrl,
        expiresAt: item.expiresAt,
      })),
    };
  });
}

export async function processPayOsWebhook(payload) {
  if (!verifyPayOsWebhook(payload)) {
    throw new AppError('Chữ ký webhook payOS không hợp lệ', 400, 'INVALID_PAYOS_SIGNATURE');
  }

  const data = payload.data || {};
  const providerOrderCode = String(data.orderCode ?? '');
  if (!providerOrderCode) throw new AppError('Webhook thiếu orderCode', 400, 'INVALID_PAYOS_WEBHOOK');

  const eventKey = createHash('sha256')
    .update(`${payload.signature}:${data.reference || ''}:${data.transactionDateTime || ''}:${data.code || ''}`)
    .digest('hex');

  // Locate first, then re-read only after locking. The lock order is always Order -> Payment
  // so webhook, timeout compensation and expiry cannot deadlock each other.
  const locator = await prisma.payment.findUnique({
    where: { providerOrderCode },
    select: { id: true, orderId: true },
  });
  if (!locator) {
    // payOS sends a signed sample event while validating a webhook URL.
    // Acknowledge valid unmatched events so that setup succeeds, but retain a warning
    // because an unmatched real order code still requires investigation.
    logger.warn({ event: 'payos_unmatched_webhook', providerOrderCode }, 'Valid payOS webhook has no matching payment');
    return { duplicate: false, ignored: true, reason: 'PAYMENT_NOT_FOUND', providerOrderCode };
  }

  return prisma.$transaction(async (tx) => {
    await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${locator.orderId} FOR UPDATE`;
    await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${locator.id} FOR UPDATE`;

    const payment = await tx.payment.findUnique({
      where: { id: locator.id },
      include: {
        order: { include: { user: { select: { email: true, fullName: true } }, items: true } },
      },
    });
    if (!payment) throw new AppError('Không tìm thấy giao dịch payOS', 404, 'PAYMENT_NOT_FOUND');

    const duplicate = await tx.paymentWebhook.findUnique({ where: { eventKey } });
    if (duplicate) return { duplicate: true, orderId: payment.orderId };

    await tx.paymentWebhook.create({
      data: { paymentId: payment.id, eventKey, payload },
    });

    const paid = payload.success === true && (data.code === '00' || data.code === undefined);
    if (!paid) return { duplicate: false, ignored: true, orderId: payment.orderId };

    if (Number(data.amount) !== Number(payment.amount)) {
      throw new AppError('Số tiền webhook không khớp đơn hàng', 409, 'PAYMENT_AMOUNT_MISMATCH');
    }
    if (payment.status === 'PAID') return { duplicate: true, orderId: payment.orderId };
    if (payment.status !== 'PENDING' || payment.order.status !== 'PENDING_PAYMENT') {
      throw new AppError('Đơn hàng không còn chờ thanh toán', 409, 'ORDER_NOT_PAYABLE');
    }

    const paidAt = new Date();
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: 'PAID', paidAt, providerReference: data.reference || null },
    });
    await tx.order.update({ where: { id: payment.orderId }, data: { status: 'COMPLETED' } });
    const codes = await issueVoucherCodesForOrder(tx, payment.orderId, payment.order.userId);

    await notify({
      userId: payment.order.userId,
      type: 'PAYMENT_SUCCESS',
      title: 'Thanh toán thành công',
      message: `Đơn ${payment.orderId} đã thanh toán thành công qua payOS.`,
      referenceType: 'ORDER',
      referenceId: payment.orderId,
      email: payment.order.user.email,
      emailTemplate: 'PAYMENT_SUCCESS',
      emailPayload: { orderId: payment.orderId, amount: Number(payment.amount), method: 'payOS VietQR' },
    }, tx);
    await notify({
      userId: payment.order.userId,
      type: 'VOUCHER_ISSUED',
      title: 'Voucher đã được phát hành',
      message: `${codes.length} voucher đã sẵn sàng sử dụng.`,
      referenceType: 'ORDER',
      referenceId: payment.orderId,
      email: payment.order.user.email,
      emailTemplate: 'VOUCHER_ISSUED',
      emailPayload: { orderId: payment.orderId, quantity: codes.length },
    }, tx);
    await auditLog(payment.order.userId, AUDIT_ACTIONS.PAYMENT_PAYOS_WEBHOOK, 'Payment', payment.id, {
      providerOrderCode,
      providerReference: data.reference || null,
      oldValues: { status: payment.status },
      newValues: { status: 'PAID', paidAt },
    }, tx);

    return { duplicate: false, orderId: payment.orderId, voucherCount: codes.length };
  }, { timeout: 10000 });
}
