import { prisma } from '../../config/prisma.js';
import { env } from '../../config/env.js';
import { logger } from '../../config/logger.js';

export async function reconcileVoucherLifecycle(now = new Date()) {
  const [activated, expired, expiredCodes] = await prisma.$transaction([
    prisma.$executeRaw`
      UPDATE "Voucher"
      SET status = 'ON_SALE'::"VoucherStatus", "updatedAt" = ${now}
      WHERE status = 'APPROVED'::"VoucherStatus"
        AND "saleStart" <= ${now}
        AND "saleEnd" >= ${now}
        AND "soldQty" < "totalQty"
    `,
    prisma.voucher.updateMany({
      where: {
        status: { in: ['APPROVED', 'ON_SALE', 'PAUSED'] },
        saleEnd: { lt: now },
      },
      data: { status: 'EXPIRED' },
    }),
    prisma.voucherCode.updateMany({
      where: { status: 'ISSUED', expiresAt: { lte: now } },
      data: { status: 'EXPIRED' },
    }),
  ]);
  const result = { activated: Number(activated), expired: expired.count, expiredCodes: expiredCodes.count };
  logger.info({ event: 'voucher_reconciliation', ...result }, 'Voucher lifecycle reconciled');
  return result;
}

export async function expirePendingPayOsOrders(now = new Date()) {
  const cutoff = new Date(now.getTime() - env.PAYOS_LINK_EXPIRES_MINUTES * 60 * 1000);
  const candidates = await prisma.order.findMany({
    where: {
      status: 'PENDING_PAYMENT',
      createdAt: { lt: cutoff },
      payment: { method: 'PAYOS', status: 'PENDING' },
    },
    select: { id: true },
    take: 100,
  });
  let cancelled = 0;
  for (const candidate of candidates) {
    const changed = await prisma.$transaction(async (tx) => {
      await tx.$queryRaw`SELECT id FROM "Order" WHERE id = ${candidate.id} FOR UPDATE`;
      const paymentLocator = await tx.payment.findUnique({ where: { orderId: candidate.id }, select: { id: true } });
      if (paymentLocator) {
        await tx.$queryRaw`SELECT id FROM "Payment" WHERE id = ${paymentLocator.id} FOR UPDATE`;
      }
      const order = await tx.order.findUnique({ where: { id: candidate.id }, include: { payment: true, items: true } });
      if (!order || order.status !== 'PENDING_PAYMENT' || order.payment?.status !== 'PENDING') return false;
      for (const item of order.items) {
        await tx.voucher.update({ where: { id: item.voucherId }, data: { soldQty: { decrement: item.qty } } });
      }
      await tx.payment.update({ where: { orderId: order.id }, data: { status: 'CANCELLED', cancelledAt: now } });
      await tx.order.update({ where: { id: order.id }, data: { status: 'CANCELLED' } });
      return true;
    });
    if (changed) cancelled += 1;
  }
  if (cancelled > 0) logger.info({ event: 'pending_payment_expiry', cancelled }, 'Expired pending payOS orders');
  return { cancelled };
}

export async function runReconciliation() {
  const startedAt = Date.now();
  const [vouchers, payments] = await Promise.all([
    reconcileVoucherLifecycle(),
    expirePendingPayOsOrders(),
  ]);
  return { ...vouchers, ...payments, durationMs: Date.now() - startedAt };
}
