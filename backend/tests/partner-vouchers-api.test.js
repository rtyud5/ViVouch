import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import bcrypt from 'bcrypt';

describe('Partner Vouchers API Contract Tests', () => {
  const partnerEmail = 'voucher_api_partner@test.com';
  const password = 'Password123!';

  let partnerToken = '';
  let partnerId = '';
  let categoryId = '';
  let branchId = '';

  const cleanup = async () => {
    const user = await prisma.user.findUnique({ where: { email: partnerEmail } });
    if (!user) return;

    await prisma.auditLog.deleteMany({ where: { actorId: user.id } });
    
    const partner = await prisma.partner.findUnique({ where: { userId: user.id } });
    if (partner) {
      const branches = await prisma.branch.findMany({ where: { partnerId: partner.id } });
      const vouchers = await prisma.voucher.findMany({ where: { partnerId: partner.id } });
      
      await prisma.voucherBranch.deleteMany({ where: { branchId: { in: branches.map(b => b.id) } } });
      await prisma.voucher.deleteMany({ where: { partnerId: partner.id } });
      await prisma.branch.deleteMany({ where: { partnerId: partner.id } });
      await prisma.partner.deleteMany({ where: { id: partner.id } });
    }

    await prisma.user.delete({ where: { id: user.id } });
    await prisma.category.deleteMany({ where: { slug: 'voucher-api-test-cat' } });
  };

  beforeAll(async () => {
    await cleanup();

    const passwordHash = await bcrypt.hash(password, 10);
    const category = await prisma.category.create({
      data: { name: 'Voucher API Test Cat', slug: 'voucher-api-test-cat', icon: '🎫' }
    });
    categoryId = category.id;

    const user = await prisma.user.create({
      data: { email: partnerEmail, fullName: 'Voucher API Partner', passwordHash, role: 'PARTNER', status: 'ACTIVE' }
    });

    const partner = await prisma.partner.create({
      data: {
        userId: user.id, businessName: 'Voucher API Partner', taxCode: 'VOUCHER-API-01', representativeName: 'Rep', status: 'APPROVED'
      }
    });
    partnerId = partner.id;

    await prisma.partnerMember.create({
      data: {
        partnerId: partner.id,
        userId: user.id,
        role: 'OWNER',
        status: 'ACTIVE',
      }
    });

    const branch = await prisma.branch.create({
      data: { partnerId: partner.id, name: 'Main Branch', address: '123 Street' }
    });
    branchId = branch.id;

    const loginRes = await request(app).post('/api/auth/login').send({ email: partnerEmail, password });
    partnerToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  describe('POST /api/partner/vouchers (Create Voucher Validation)', () => {
    it('returns 400 when salePrice >= originalPrice', async () => {
      const res = await request(app)
        .post('/api/partner/vouchers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          categoryId,
          title: 'Invalid Price Voucher',
          originalPrice: 100000,
          salePrice: 150000, // Invalid: salePrice > originalPrice
          totalQty: 10
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('salePrice phải nhỏ hơn originalPrice');
    });

    it('returns 400 when saleEnd < saleStart', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);

      const res = await request(app)
        .post('/api/partner/vouchers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          categoryId,
          title: 'Invalid Date Voucher',
          originalPrice: 100000,
          salePrice: 80000,
          totalQty: 10,
          saleStart: now.toISOString(),
          saleEnd: past.toISOString() // Invalid: saleEnd < saleStart
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('saleEnd phải lớn hơn hoặc bằng saleStart');
    });

    it('returns 400 when useEnd < useStart', async () => {
      const now = new Date();
      const past = new Date(now.getTime() - 86400000);

      const res = await request(app)
        .post('/api/partner/vouchers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          categoryId,
          title: 'Invalid Use Date Voucher',
          originalPrice: 100000,
          salePrice: 80000,
          totalQty: 10,
          useStart: now.toISOString(),
          useEnd: past.toISOString() // Invalid: useEnd < useStart
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('useEnd phải lớn hơn hoặc bằng useStart');
    });

    it('returns 400 when useEnd < saleEnd', async () => {
      const now = new Date();
      const future = new Date(now.getTime() + 86400000);

      const res = await request(app)
        .post('/api/partner/vouchers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          categoryId,
          title: 'Invalid Use End Voucher',
          originalPrice: 100000,
          salePrice: 80000,
          totalQty: 10,
          saleEnd: future.toISOString(),
          useEnd: now.toISOString() // Invalid: useEnd < saleEnd
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('useEnd không được kết thúc trước saleEnd');
    });

    it('returns 400 when totalQty <= 0', async () => {
      const res = await request(app)
        .post('/api/partner/vouchers')
        .set('Authorization', `Bearer ${partnerToken}`)
        .send({
          categoryId,
          title: 'Invalid Qty Voucher',
          originalPrice: 100000,
          salePrice: 80000,
          totalQty: 0 // Invalid: totalQty <= 0
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });
  });
});
