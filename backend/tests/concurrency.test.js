import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS } from '../src/constants/statuses.js';
import { buyNow } from '../src/modules/orders/orders.service.js';

describe('Concurrency Tests', () => {
  let userId1 = '';
  let userId2 = '';
  let partnerId = '';
  let categoryId = '';
  let voucherId = '';

  const cleanup = async () => {
    const userEmails = ['concurrency_customer1@test.com', 'concurrency_customer2@test.com'];
    const users = await prisma.user.findMany({ where: { email: { in: userEmails } } });
    if (users.length > 0) {
      const userIds = users.map(u => u.id);
      
      const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
      const orderIds = orders.map(o => o.id);
      if (orderIds.length > 0) {
        await prisma.walletTransaction.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
        await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
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
    await prisma.category.deleteMany({ where: { slug: 'concurrency-test' } });
  };

  beforeAll(async () => {
    await cleanup();
    const category = await prisma.category.create({ data: { name: 'Concurrency Test', slug: 'concurrency-test' } });
    categoryId = category.id;
    
    const user1 = await prisma.user.create({
      data: { email: 'concurrency_customer1@test.com', fullName: 'Customer 1', passwordHash: 'dummy', role: 'CUSTOMER', status: 'ACTIVE' },
    });
    userId1 = user1.id;
    await prisma.wallet.create({ data: { userId: userId1, balance: 1000000 } });

    const user2 = await prisma.user.create({
      data: { email: 'concurrency_customer2@test.com', fullName: 'Customer 2', passwordHash: 'dummy', role: 'PARTNER', status: 'ACTIVE' },
    });
    userId2 = user2.id;
    await prisma.wallet.create({ data: { userId: userId2, balance: 1000000 } });

    const partner = await prisma.partner.create({
      data: { userId: userId2, businessName: 'WH Partner', taxCode: 'WH-01', representativeName: 'Rep', status: 'APPROVED' },
    });
    partnerId = partner.id;

    const voucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'Concurrency Voucher',
        originalPrice: 100000,
        salePrice: 50000,
        totalQty: 2,
        soldQty: 1, // Only 1 left!
        status: VOUCHER_STATUS.ON_SALE,
      },
    });
    voucherId = voucher.id;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('parallel checkouts for limited quantity should not oversell (one succeeds, one fails)', async () => {
    // Both users try to buy 1 voucher at the exact same time
    // Since only 1 is left, one should fail with VOUCHER_OUT_OF_STOCK
    const checkoutData1 = { paymentMethod: 'VIVOUCH_WALLET' };
    const checkoutData2 = { paymentMethod: 'VIVOUCH_WALLET' };

    const promise1 = buyNow(userId1, [{ id: voucherId, qty: 1 }], checkoutData1);
    const promise2 = buyNow(userId2, [{ id: voucherId, qty: 1 }], checkoutData2);

    const results = await Promise.allSettled([promise1, promise2]);
    
    const fulfilled = results.filter(r => r.status === 'fulfilled');
    const rejected = results.filter(r => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(1);

    expect(rejected[0].reason.code).toBe('VOUCHER_OUT_OF_STOCK');

    const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
    expect(voucher.soldQty).toBe(2);
  });
});
