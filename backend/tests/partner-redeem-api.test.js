import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('Partner Redeem API Tests', () => {
  const customerEmail = 'redeem_api_customer@test.com';
  const partnerEmail = 'redeem_api_partner@test.com';
  const password = 'Password123!';

  let partnerToken = '';
  let issuedCode = '';
  let usedCode = '';
  let expiredCode = '';
  let wrongPartnerCode = '';
  let branchScopedCode = '';
  let branchId = '';
  let unlinkedBranchId = '';

  const cleanup = async () => {
    const emails = [customerEmail, partnerEmail, 'redeem_api_wrong_partner@test.com'];
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) return;

    const userIds = users.map((u) => u.id);
    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await prisma.voucherUsageLog.deleteMany({ where: { redeemedBy: { in: userIds } } });
    await prisma.voucherCode.deleteMany({ where: { ownerId: { in: userIds } } });

    const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
    const orderIds = orders.map((o) => o.id);
    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    const partners = await prisma.partner.findMany({ where: { userId: { in: userIds } } });
    const partnerIds = partners.map((p) => p.id);
    if (partnerIds.length > 0) {
      const branches = await prisma.branch.findMany({ where: { partnerId: { in: partnerIds } } });
      if (branches.length > 0) {
        await prisma.voucherBranch.deleteMany({ where: { branchId: { in: branches.map((b) => b.id) } } });
        await prisma.branch.deleteMany({ where: { id: { in: branches.map((b) => b.id) } } });
      }
      await prisma.voucher.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await prisma.partner.deleteMany({ where: { id: { in: partnerIds } } });
    }

    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.category.deleteMany({ where: { slug: 'redeem-api-test-cat' } });
  };

  beforeAll(async () => {
    await cleanup();

    const bcrypt = (await import('bcrypt')).default;
    const passwordHash = await bcrypt.hash(password, 10);

    const category = await prisma.category.create({
      data: { name: 'Redeem API Test Cat', slug: 'redeem-api-test-cat' },
    });

    const customer = await prisma.user.create({
      data: { email: customerEmail, fullName: 'Redeem API Customer', passwordHash, role: 'CUSTOMER' },
    });

    const partnerUser = await prisma.user.create({
      data: { email: partnerEmail, fullName: 'Redeem API Partner', passwordHash, role: 'PARTNER' },
    });

    const wrongPartnerUser = await prisma.user.create({
      data: { email: 'redeem_api_wrong_partner@test.com', fullName: 'Wrong API Partner', passwordHash, role: 'PARTNER' },
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: 'Redeem API Partner',
        taxCode: 'REDEEM-API-01',
        representativeName: 'Rep',
        status: 'APPROVED',
      },
    });

    const wrongPartner = await prisma.partner.create({
      data: {
        userId: wrongPartnerUser.id,
        businessName: 'Wrong API Partner',
        taxCode: 'REDEEM-API-02',
        representativeName: 'Rep2',
        status: 'APPROVED',
      },
    });

    const branch = await prisma.branch.create({
      data: { partnerId: partner.id, name: 'Main Branch', address: '123 Street' },
    });
    branchId = branch.id;

    const unlinkedBranch = await prisma.branch.create({
      data: { partnerId: partner.id, name: 'Unlinked Branch', address: '456 Street' },
    });
    unlinkedBranchId = unlinkedBranch.id;

    const rightVoucher = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: 'Redeem API Voucher',
        originalPrice: 100,
        salePrice: 90,
        totalQty: 10,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });

    await prisma.voucherBranch.create({
      data: { voucherId: rightVoucher.id, branchId: branch.id },
    });

    const wrongVoucher = await prisma.voucher.create({
      data: {
        partnerId: wrongPartner.id,
        categoryId: category.id,
        title: 'Wrong API Voucher',
        originalPrice: 100,
        salePrice: 90,
        totalQty: 10,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });

    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        status: 'COMPLETED',
        totalAmount: 500,
        items: { create: [{ voucherId: rightVoucher.id, qty: 5, unitPrice: 90 }] },
      },
    });

    const createCode = async (code, voucherId, status, extra = {}) => {
      const record = await prisma.voucherCode.create({
        data: { code, orderId: order.id, voucherId, ownerId: customer.id, status, ...extra },
      });
      return record.code;
    };

    issuedCode = await createCode('API-ISSUED', rightVoucher.id, VOUCHER_CODE_STATUS.ISSUED);
    usedCode = await createCode('API-USED', rightVoucher.id, VOUCHER_CODE_STATUS.USED, { usedAt: new Date() });
    expiredCode = await createCode('API-EXPIRED', rightVoucher.id, VOUCHER_CODE_STATUS.EXPIRED, {
      expiresAt: new Date(Date.now() - 100000),
    });
    wrongPartnerCode = await createCode('API-WRONG-PARTNER', wrongVoucher.id, VOUCHER_CODE_STATUS.ISSUED);
    branchScopedCode = await createCode('API-WRONG-BRANCH', rightVoucher.id, VOUCHER_CODE_STATUS.ISSUED);

    const loginRes = await request(app).post('/api/auth/login').send({ email: partnerEmail, password });
    partnerToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/partner/redeem').send({ code: issuedCode });
    expect(res.status).toBe(401);
  });

  it('redeems an ISSUED code via HTTP', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: issuedCode, branchId });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.voucherTitle).toBe('Redeem API Voucher');
    expect(res.body.data.customerName).toBe('Redeem API Customer');
    expect(res.body.data.branchId).toBe(branchId);
  });

  it('rejects USED code via HTTP', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: usedCode, branchId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VOUCHER_CODE_USED');
  });

  it('rejects EXPIRED code via HTTP', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: expiredCode, branchId });

    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VOUCHER_CODE_EXPIRED');
  });

  it('rejects wrong partner code via HTTP', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: wrongPartnerCode, branchId });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  it('rejects non-existent code via HTTP', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: 'API-DOES-NOT-EXIST', branchId });

    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VOUCHER_CODE_NOT_FOUND');
  });

  it('rejects a branch outside the voucher scope without consuming the code', async () => {
    const res = await request(app)
      .post('/api/partner/redeem')
      .set('Authorization', `Bearer ${partnerToken}`)
      .send({ code: branchScopedCode, branchId: unlinkedBranchId });

    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INVALID_BRANCH_SCOPE');

    const unchanged = await prisma.voucherCode.findUnique({ where: { code: branchScopedCode } });
    expect(unchanged.status).toBe(VOUCHER_CODE_STATUS.ISSUED);
  });
});
