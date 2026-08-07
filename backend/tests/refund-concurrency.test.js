import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app.js';
import request from 'supertest';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS } from '../src/constants/statuses.js';
import { buyNow } from '../src/modules/orders/orders.service.js';
import { createRefundRequest } from '../src/modules/refunds/refunds.service.js';

describe('Refund Concurrency & State Tests', () => {
  let userId = '';
  let partnerId = '';
  let categoryId = '';
  let voucherId = '';
  let orderId = '';
  let voucherCodeId = '';
  let walletId = '';

  const cleanup = async () => {
    const userEmails = ['refund_customer@test.com', 'refund_partner@test.com'];
    const users = await prisma.user.findMany({ where: { email: { in: userEmails } } });
    if (users.length > 0) {
      const userIds = users.map(u => u.id);
      
      const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
      const orderIds = orders.map(o => o.id);
      if (orderIds.length > 0) {
        await prisma.refundRequest.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.walletTransaction.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.voucherUsageLog.deleteMany({ where: { voucherCode: { orderId: { in: orderIds } } } });
        await prisma.voucherCode.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
      }

      await prisma.walletTransaction.deleteMany({ where: { wallet: { userId: { in: userIds } } } });
      await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
      await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
      
      const partner = await prisma.partner.findFirst({ where: { userId: { in: userIds } } });
      if (partner) {
        await prisma.voucher.deleteMany({ where: { partnerId: partner.id } });
        await prisma.partner.deleteMany({ where: { id: partner.id } });
      }
      await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    }
    await prisma.category.deleteMany({ where: { slug: 'refund-concurrency-test' } });
  };

  beforeAll(async () => {
    await cleanup();
    const category = await prisma.category.create({ data: { name: 'Refund Concurrency Test', slug: 'refund-concurrency-test' } });
    categoryId = category.id;
    
    const user1 = await prisma.user.create({
      data: { email: 'refund_customer@test.com', fullName: 'Refund Customer', passwordHash: 'dummy', role: 'CUSTOMER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    userId = user1.id;
    const wallet = await prisma.wallet.create({ data: { userId: userId, balance: 1000000 } });
    walletId = wallet.id;

    const user2 = await prisma.user.create({
      data: { email: 'refund_partner@test.com', fullName: 'Refund Partner', passwordHash: 'dummy', role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    
    const partner = await prisma.partner.create({
      data: { userId: user2.id, businessName: 'Refund Partner', taxCode: 'REF-01', representativeName: 'Rep', status: 'APPROVED' },
    });
    partnerId = partner.id;

    const voucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'Refundable Voucher',
        originalPrice: 100000,
        salePrice: 50000,
        totalQty: 10,
        soldQty: 0,
        status: VOUCHER_STATUS.ON_SALE,
        allowRefund: true,
        refundWindowHours: 24
      },
    });
    voucherId = voucher.id;

    // Create an order directly
    const orderData = await buyNow(userId, [{ id: voucherId, qty: 1 }], { paymentMethod: 'VIVOUCH_WALLET' });
    orderId = orderData.orderId;
    const vc = await prisma.voucherCode.findFirst({ where: { orderId } });
    voucherCodeId = vc.id;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('duplicate refund requests should be handled idempotently and correctly', async () => {
    // Send two refund requests for the same order at the same time
    const promise1 = createRefundRequest(userId, { orderId, reason: 'Duplicate refund test 1' });
    const promise2 = createRefundRequest(userId, { orderId, reason: 'Duplicate refund test 2' });

    const results = await Promise.allSettled([promise1, promise2]);
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    
    // Both might fulfill if idempotency works by returning the existing refund, 
    // or one fails with "Already requested"
    // The key invariant is NO duplicate database entries for wallet or refund request

    const refunds = await prisma.refundRequest.findMany({ where: { orderId } });
    expect(refunds.length).toBe(1); // Only ONE refund request created
    
    const refundTx = await prisma.walletTransaction.findMany({
      where: { orderId, type: 'REFUND' }
    });
    // Assuming auto refund, it should be 1. If manual, it's 0. Let's check status
    const req = refunds[0];
    if (req.status === 'REFUNDED') {
      expect(refundTx.length).toBe(1); // Only ONE refund transaction created
    }

    // Check voucher state
    const vc = await prisma.voucherCode.findUnique({ where: { id: voucherCodeId } });
    expect(vc.status).not.toBe('ISSUED'); // It should be REFUND_PENDING or REFUNDED

    // Try to redeem
    // Depending on logic, it should fail
  });
});
