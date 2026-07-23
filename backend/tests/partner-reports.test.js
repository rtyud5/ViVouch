import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('Partner Reports API Tests', () => {
  const partnerEmail = 'reports_partner@test.com';
  const customerEmail = 'reports_customer@test.com';
  const password = 'Password123!';

  let partnerToken = '';

  const cleanup = async () => {
    const emails = [partnerEmail, customerEmail];
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) {
      await prisma.category.deleteMany({ where: { slug: 'reports-api-test' } });
      return;
    }

    const userIds = users.map((user) => user.id);

    await prisma.voucherCode.deleteMany({ where: { ownerId: { in: userIds } } });

    const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
    const orderIds = orders.map((order) => order.id);
    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    const partners = await prisma.partner.findMany({ where: { userId: { in: userIds } } });
    const partnerIds = partners.map((partner) => partner.id);
    if (partnerIds.length > 0) {
      await prisma.voucher.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await prisma.partner.deleteMany({ where: { id: { in: partnerIds } } });
    }

    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.category.deleteMany({ where: { slug: 'reports-api-test' } });
  };

  beforeAll(async () => {
    await cleanup();

    const category = await prisma.category.create({
      data: { name: 'Reports API Test', slug: 'reports-api-test' },
    });

    const passwordHash = await bcrypt.hash(password, 10);
    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        fullName: 'Reports Partner',
        passwordHash,
        role: 'PARTNER',
        status: 'ACTIVE',
      },
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: 'Reports Partner Co',
        taxCode: 'REPORTS-TAX-01',
        representativeName: 'Rep',
        status: 'APPROVED',
      },
    });

    await prisma.partnerMember.create({
      data: {
        partnerId: partner.id,
        userId: partnerUser.id,
        role: 'OWNER',
        status: 'ACTIVE',
      },
    });

    const voucher = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: 'Reports Voucher',
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 20,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });

    const customer = await prisma.user.create({
      data: {
        email: customerEmail,
        fullName: 'Reports Customer',
        passwordHash: await bcrypt.hash(password, 10),
        role: 'CUSTOMER',
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        status: 'COMPLETED',
        totalAmount: 160000,
        items: { create: { voucherId: voucher.id, qty: 2, unitPrice: 80000 } },
        payment: { create: { method: 'VIVOUCH_WALLET', status: 'PAID', amount: 160000 } },
        voucherCodes: {
          create: [
            { voucherId: voucher.id, ownerId: customer.id, code: 'VC-REPORTS-USED', status: 'USED', usedAt: new Date() },
            { voucherId: voucher.id, ownerId: customer.id, code: 'VC-REPORTS-ISSUED', status: 'ISSUED' },
          ],
        },
      },
    });

    await prisma.order.findUniqueOrThrow({ where: { id: order.id } });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: partnerEmail, password });

    partnerToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).get('/api/partner/reports');
    expect(res.status).toBe(401);
  });

  it('returns report summary for valid range values', async () => {
    for (const range of [7, 30, 90]) {
      const res = await request(app)
        .get(`/api/partner/reports?range=${range}`)
        .set('Authorization', `Bearer ${partnerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.summary).toMatchObject({
        revenue: 160000,
        orders: 1,
        customers: 1,
      });
      expect(res.body.data.summary.conversion).toBe(50);
      expect(res.body.data.revenueByDay).toHaveLength(range);
      expect(res.body.data.topVouchers[0]).toMatchObject({
        name: 'Reports Voucher',
        revenue: 160000,
        orders: 1,
        count: 2,
      });
    }
  });

  it('defaults to 30 days when range is omitted', async () => {
    const res = await request(app)
      .get('/api/partner/reports')
      .set('Authorization', `Bearer ${partnerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.revenueByDay).toHaveLength(30);
  });

  it('rejects invalid range', async () => {
    const res = await request(app)
      .get('/api/partner/reports?range=14')
      .set('Authorization', `Bearer ${partnerToken}`);

    expect(res.status).toBe(400);
    expect(res.body.message).toMatch(/range/i);
  });
});
