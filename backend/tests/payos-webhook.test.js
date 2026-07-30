import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS } from '../src/constants/statuses.js';
import { createPayOsSignature } from '../src/modules/payments/payos.signature.js';

describe('PayOS Webhook API Tests', () => {
  let userId = '';
  let partnerId = '';
  let categoryId = '';
  let voucherId = '';
  let orderIdPending = '';
  let orderIdCancelled = '';
  let paymentIdPending = '';
  let paymentIdCancelled = '';

  const CHECKSUM_KEY = process.env.PAYOS_CHECKSUM_KEY || 'TEST_CHECKSUM_KEY';

  const cleanup = async () => {
    const orders = await prisma.order.findMany({ where: { user: { email: 'webhook_test@test.com' } } });
    if (orders.length > 0) {
      const orderIds = orders.map((o) => o.id);
      await prisma.paymentWebhook.deleteMany({ where: { payment: { orderId: { in: orderIds } } } });
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.voucherCode.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    const user = await prisma.user.findFirst({ where: { email: 'webhook_test@test.com' } });
    if (user) {
      await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
      const partner = await prisma.partner.findFirst({ where: { userId: user.id } });
      if (partner) {
        await prisma.voucher.deleteMany({ where: { partnerId: partner.id } });
        await prisma.partner.deleteMany({ where: { id: partner.id } });
      }
      await prisma.user.deleteMany({ where: { id: user.id } });
    }
    await prisma.category.deleteMany({ where: { slug: 'webhook-test' } });
  };

  beforeAll(async () => {
    await cleanup();
    const category = await prisma.category.create({ data: { name: 'Webhook Test', slug: 'webhook-test' } });
    categoryId = category.id;
    const user = await prisma.user.create({
      data: {
        email: 'webhook_test@test.com',
        fullName: 'Webhook Customer',
        passwordHash: 'dummy',
        role: 'CUSTOMER',
        status: 'ACTIVE',
      },
    });
    userId = user.id;

    const partner = await prisma.partner.create({
      data: { userId, businessName: 'WH Partner', taxCode: 'WH-01', representativeName: 'Rep', status: 'APPROVED' },
    });
    partnerId = partner.id;

    const voucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'WH Voucher',
        originalPrice: 100000,
        salePrice: 50000,
        totalQty: 100,
        soldQty: 2,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });
    voucherId = voucher.id;

    const order1 = await prisma.order.create({
      data: {
        userId,
        status: 'PENDING_PAYMENT',
        totalAmount: 50000,
        items: { create: [{ voucherId, qty: 1, unitPrice: 50000 }] },
        payment: { create: { method: 'PAYOS', status: 'PENDING', amount: 50000, providerOrderCode: '10001' } },
      },
      include: { payment: true },
    });
    orderIdPending = order1.id;
    paymentIdPending = order1.payment.id;

    const order2 = await prisma.order.create({
      data: {
        userId,
        status: 'CANCELLED',
        totalAmount: 50000,
        items: { create: [{ voucherId, qty: 1, unitPrice: 50000 }] },
        payment: { create: { method: 'PAYOS', status: 'CANCELLED', amount: 50000, providerOrderCode: '10002' } },
      },
      include: { payment: true },
    });
    orderIdCancelled = order2.id;
    paymentIdCancelled = order2.payment.id;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  function makeWebhookPayload(orderCode, amount, code = '00') {
    const data = {
      orderCode,
      amount,
      description: 'Test payment',
      accountNumber: '123',
      reference: 'REF123',
      transactionDateTime: '2023-01-01 10:00:00',
      currency: 'VND',
      paymentLinkId: 'link123',
      code,
      desc: 'Success',
    };
    const signature = createPayOsSignature(data, CHECKSUM_KEY);
    return { code: '00', desc: 'success', success: true, data, signature };
  }

  it('rejects invalid signature', async () => {
    const payload = makeWebhookPayload(10001, 50000);
    payload.signature = 'invalid';
    const res = await request(app).post('/api/payments/payos/webhook').send(payload);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('INVALID_PAYOS_SIGNATURE');
  });

  it('processes valid webhook and issues voucher codes exactly once', async () => {
    const payload = makeWebhookPayload(10001, 50000);
    const res = await request(app).post('/api/payments/payos/webhook').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.data.duplicate).toBe(false);
    expect(res.body.data.voucherCount).toBe(1);

    const order = await prisma.order.findUnique({ where: { id: orderIdPending }, include: { payment: true, voucherCodes: true } });
    expect(order.status).toBe('COMPLETED');
    expect(order.payment.status).toBe('PAID');
    expect(order.voucherCodes).toHaveLength(1);

    const res2 = await request(app).post('/api/payments/payos/webhook').send(payload);
    expect(res2.status).toBe(200);
    expect(res2.body.data.duplicate).toBe(true);

    const orderAgain = await prisma.order.findUnique({ where: { id: orderIdPending }, include: { voucherCodes: true } });
    expect(orderAgain.voucherCodes).toHaveLength(1);
  });

  it('handles late PAID webhook on a cancelled order gracefully', async () => {
    const payload = makeWebhookPayload(10002, 50000);
    const res = await request(app).post('/api/payments/payos/webhook').send(payload);
    expect(res.status).toBe(200);
    expect(res.body.data.ignored).toBe(true);
    expect(res.body.data.reason).toBe('LATE_WEBHOOK_ALREADY_CANCELLED');

    const order = await prisma.order.findUnique({ where: { id: orderIdCancelled }, include: { payment: true, voucherCodes: true } });
    expect(order.status).toBe('CANCELLED');
    expect(order.payment.status).toBe('CANCELLED');
    expect(order.voucherCodes).toHaveLength(0);
  });
});
