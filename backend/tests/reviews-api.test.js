import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('Reviews API Tests', () => {
  const usedCustomerEmail = 'reviews_api_used_customer@test.com';
  const unusedCustomerEmail = 'reviews_api_unused_customer@test.com';
  const duplicateCustomerEmail = 'reviews_api_duplicate_customer@test.com';
  const partnerEmail = 'reviews_api_partner@test.com';
  const password = 'Password123!';

  let usedCustomerToken = '';
  let unusedCustomerToken = '';
  let duplicateCustomerToken = '';

  let voucherId = '';
  let usedCustomerId = '';
  let duplicateCustomerId = '';

  const cleanup = async () => {
    const emails = [
      usedCustomerEmail,
      unusedCustomerEmail,
      duplicateCustomerEmail,
      partnerEmail,
    ];
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) {
      await prisma.category.deleteMany({ where: { slug: 'reviews-api-test' } });
      return;
    }

    const userIds = users.map((user) => user.id);

    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await prisma.review.deleteMany({ where: { userId: { in: userIds } } });
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
    await prisma.category.deleteMany({ where: { slug: 'reviews-api-test' } });
  };

  const login = async (email) => {
    const res = await request(app).post('/api/auth/login').send({ email, password });
    return res.body.data.accessToken;
  };

  beforeAll(async () => {
    await cleanup();

    const passwordHash = await bcrypt.hash(password, 10);
    const category = await prisma.category.create({
      data: { name: 'Reviews API Test', slug: 'reviews-api-test' },
    });

    const [usedCustomer, unusedCustomer, duplicateCustomer, partnerUser] = await Promise.all([
      prisma.user.create({
        data: {
          email: usedCustomerEmail,
          fullName: 'Reviews Used Customer',
          passwordHash,
          role: 'CUSTOMER',
        },
      }),
      prisma.user.create({
        data: {
          email: unusedCustomerEmail,
          fullName: 'Reviews Unused Customer',
          passwordHash,
          role: 'CUSTOMER',
        },
      }),
      prisma.user.create({
        data: {
          email: duplicateCustomerEmail,
          fullName: 'Reviews Duplicate Customer',
          passwordHash,
          role: 'CUSTOMER',
        },
      }),
      prisma.user.create({
        data: {
          email: partnerEmail,
          fullName: 'Reviews API Partner',
          passwordHash,
          role: 'PARTNER',
        },
      }),
    ]);

    usedCustomerId = usedCustomer.id;
    duplicateCustomerId = duplicateCustomer.id;

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: 'Reviews API Partner',
        taxCode: 'REVIEWS-API-01',
        representativeName: 'Rep',
        status: 'APPROVED',
      },
    });

    const voucher = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: 'Reviews API Voucher',
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 10,
        soldQty: 3,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });
    voucherId = voucher.id;

    const createOrderWithCode = async (userId, code, status, extra = {}) =>
      prisma.order.create({
        data: {
          userId,
          status: 'COMPLETED',
          totalAmount: 80000,
          items: { create: [{ voucherId, qty: 1, unitPrice: 80000 }] },
          voucherCodes: {
            create: [{
              voucherId,
              ownerId: userId,
              code,
              status,
              ...extra,
            }],
          },
        },
      });

    await createOrderWithCode(usedCustomer.id, 'API-REVIEW-USED', VOUCHER_CODE_STATUS.USED, {
      usedAt: new Date(),
    });
    await createOrderWithCode(unusedCustomer.id, 'API-REVIEW-ISSUED', VOUCHER_CODE_STATUS.ISSUED);
    await createOrderWithCode(duplicateCustomer.id, 'API-REVIEW-DUP', VOUCHER_CODE_STATUS.USED, {
      usedAt: new Date(),
    });

    await prisma.review.create({
      data: {
        userId: duplicateCustomer.id,
        voucherId,
        rating: 5,
        comment: 'Already reviewed',
      },
    });

    [usedCustomerToken, unusedCustomerToken, duplicateCustomerToken] = await Promise.all([
      login(usedCustomerEmail),
      login(unusedCustomerEmail),
      login(duplicateCustomerEmail),
    ]);
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  describe('GET /api/vouchers/:id/reviews', () => {
    it('returns public review list', async () => {
      const res = await request(app).get(`/api/vouchers/${voucherId}/reviews`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.reviews)).toBe(true);
      expect(res.body.data).toHaveProperty('avgRating');
      expect(res.body.data).toHaveProperty('totalCount');
    });
  });

  describe('POST /api/vouchers/:id/reviews', () => {
    it('returns 401 without token', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .send({ rating: 5 });

      expect(res.status).toBe(401);
    });

    it('rejects review when voucher has not been used', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${unusedCustomerToken}`)
        .send({ rating: 5, comment: 'Not used yet' });

      expect(res.status).toBe(403);
      expect(res.body.code).toBe('VOUCHER_NOT_USED');
    });

    it('creates review for a used voucher', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${usedCustomerToken}`)
        .send({ rating: 4, comment: 'Good via HTTP' });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rating).toBe(4);
      expect(res.body.data.user.fullName).toBe('Reviews Used Customer');

      const listRes = await request(app).get(`/api/vouchers/${voucherId}/reviews`);
      expect(listRes.body.data.totalCount).toBeGreaterThanOrEqual(2);
      expect(listRes.body.data.avgRating).toBeGreaterThan(0);
    });

    it('rejects duplicate review', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${duplicateCustomerToken}`)
        .send({ rating: 3 });

      expect(res.status).toBe(409);
      expect(res.body.code).toBe('REVIEW_ALREADY_EXISTS');
      expect(res.body.message).toMatch(/đã đánh giá/i);
    });

    it('rejects rating below 1', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${usedCustomerToken}`)
        .send({ rating: 0 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/rating/i);
    });

    it('rejects rating above 5', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${usedCustomerToken}`)
        .send({ rating: 6 });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/rating/i);
    });

    it('rejects comment longer than 1000 characters', async () => {
      const res = await request(app)
        .post(`/api/vouchers/${voucherId}/reviews`)
        .set('Authorization', `Bearer ${usedCustomerToken}`)
        .send({ rating: 5, comment: 'a'.repeat(1001) });

      expect(res.status).toBe(400);
      expect(res.body.message).toMatch(/comment/i);
    });
  });
});
