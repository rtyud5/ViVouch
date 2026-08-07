import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('RBAC & Branch Authorization Negative Tests', () => {
  const customerEmail = 'rbac_customer@test.com';
  const partnerAEmail = 'rbac_partner_a@test.com';
  const partnerBEmail = 'rbac_partner_b@test.com';
  const staffNoBranchEmail = 'rbac_staff_nobranch@test.com';
  const staffBranchAEmail = 'rbac_staff_brancha@test.com';
  const adminEmail = 'rbac_admin@test.com';
  const legacySuspendedPartnerEmail = 'rbac_legacy_suspended@test.com';
  const password = 'Password123!';
  let passwordHash = '';

  let customerToken = '';
  let partnerAToken = '';
  let partnerBToken = '';
  let staffNoBranchToken = '';
  let staffBranchAToken = '';
  let adminToken = '';
  let legacySuspendedToken = '';

  let customerId, adminId, partnerAId, partnerBId;
  let branchAId, branchBId;
  let voucherAId, voucherBId;
  let voucherCodeA;

  const cleanup = async () => {
    const emails = [
      customerEmail,
      partnerAEmail,
      partnerBEmail,
      staffNoBranchEmail,
      staffBranchAEmail,
      adminEmail,
      legacySuspendedPartnerEmail,
      'role_inject_user@test.com',
    ];

    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) return;
    const userIds = users.map((u) => u.id);

    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await prisma.voucherUsageLog.deleteMany({ where: { redeemedBy: { in: userIds } } });
    await prisma.voucherCode.deleteMany({ where: { ownerId: { in: userIds } } });
    await prisma.partnerMember.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.refreshToken.deleteMany({ where: { userId: { in: userIds } } });

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
    await prisma.category.deleteMany({ where: { OR: [{ slug: 'rbac-test-cat' }, { name: 'RBAC Test Cat' }] } });
  };

  beforeAll(async () => {
    await cleanup();
    passwordHash = await bcrypt.hash(password, 10);

    // 1. Setup Category
    const category = await prisma.category.upsert({
      where: { slug: 'rbac-test-cat' },
      update: {},
      create: { name: 'RBAC Test Cat', slug: 'rbac-test-cat' },
    });

    // 2. Setup Customer & Admin
    const customer = await prisma.user.create({
      data: { email: customerEmail, fullName: 'RBAC Customer', passwordHash, role: 'CUSTOMER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    customerId = customer.id;

    const admin = await prisma.user.create({
      data: { email: adminEmail, fullName: 'RBAC Admin', passwordHash, role: 'ADMIN', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    adminId = admin.id;

    // Login Customer & Admin
    const resCustomerLogin = await request(app).post('/api/auth/login').send({ email: customerEmail, password });
    customerToken = resCustomerLogin.body.data.accessToken;

    const resAdminLogin = await request(app).post('/api/auth/login').send({ email: adminEmail, password });
    adminToken = resAdminLogin.body.data.accessToken;

    // 3. Setup Partner A & Partner B
    const partnerAUser = await prisma.user.create({
      data: { email: partnerAEmail, fullName: 'Partner A User', passwordHash, role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    const partnerA = await prisma.partner.create({
      data: { userId: partnerAUser.id, businessName: 'Partner A Corp', taxCode: 'RBAC-TAX-A', representativeName: 'Rep A', status: 'APPROVED' },
    });
    partnerAId = partnerA.id;
    await prisma.partnerMember.create({
      data: { partnerId: partnerA.id, userId: partnerAUser.id, role: 'OWNER', status: 'ACTIVE' },
    });

    const partnerBUser = await prisma.user.create({
      data: { email: partnerBEmail, fullName: 'Partner B User', passwordHash, role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    const partnerB = await prisma.partner.create({
      data: { userId: partnerBUser.id, businessName: 'Partner B Corp', taxCode: 'RBAC-TAX-B', representativeName: 'Rep B', status: 'APPROVED' },
    });
    partnerBId = partnerB.id;
    await prisma.partnerMember.create({
      data: { partnerId: partnerB.id, userId: partnerBUser.id, role: 'OWNER', status: 'ACTIVE' },
    });

    const resPartnerALogin = await request(app).post('/api/auth/login').send({ email: partnerAEmail, password });
    partnerAToken = resPartnerALogin.body.data.accessToken;

    const resPartnerBLogin = await request(app).post('/api/auth/login').send({ email: partnerBEmail, password });
    partnerBToken = resPartnerBLogin.body.data.accessToken;

    // 4. Setup Branches & Vouchers
    const branchA = await prisma.branch.create({ data: { partnerId: partnerA.id, name: 'Branch A1', address: '111 St' } });
    branchAId = branchA.id;
    const branchB = await prisma.branch.create({ data: { partnerId: partnerB.id, name: 'Branch B1', address: '222 St' } });
    branchBId = branchB.id;

    const voucherA = await prisma.voucher.create({
      data: { partnerId: partnerA.id, categoryId: category.id, title: 'Original Voucher A', originalPrice: 100, salePrice: 80, totalQty: 10, status: VOUCHER_STATUS.DRAFT },
    });
    voucherAId = voucherA.id;

    const voucherB = await prisma.voucher.create({
      data: { partnerId: partnerB.id, categoryId: category.id, title: 'Original Voucher B', originalPrice: 200, salePrice: 150, totalQty: 20, status: VOUCHER_STATUS.ON_SALE },
    });
    voucherBId = voucherB.id;
    await prisma.voucherBranch.create({ data: { voucherId: voucherB.id, branchId: branchB.id } });

    // Order & VoucherCode for Voucher B
    const order = await prisma.order.create({
      data: { userId: customerId, status: 'COMPLETED', totalAmount: 150, items: { create: [{ voucherId: voucherB.id, qty: 1, unitPrice: 150 }] } },
    });
    voucherCodeA = await prisma.voucherCode.create({
      data: { code: 'RBAC-CODE-B1', orderId: order.id, voucherId: voucherB.id, ownerId: customerId, status: VOUCHER_CODE_STATUS.ISSUED },
    });

    // 5. Setup Staff Users (One with Branch A, one without branch)
    const staffBranchAUser = await prisma.user.create({
      data: { email: staffBranchAEmail, fullName: 'Staff Branch A', passwordHash, role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    await prisma.partnerMember.create({
      data: { partnerId: partnerA.id, userId: staffBranchAUser.id, branchId: branchAId, role: 'STAFF', status: 'ACTIVE' },
    });
    const resStaffBranchALogin = await request(app).post('/api/auth/login').send({ email: staffBranchAEmail, password });
    staffBranchAToken = resStaffBranchALogin.body.data.accessToken;

    const staffNoBranchUser = await prisma.user.create({
      data: { email: staffNoBranchEmail, fullName: 'Staff No Branch', passwordHash, role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    await prisma.partnerMember.create({
      data: { partnerId: partnerA.id, userId: staffNoBranchUser.id, branchId: null, role: 'STAFF', status: 'ACTIVE' },
    });
    const resStaffNoBranchLogin = await request(app).post('/api/auth/login').send({ email: staffNoBranchEmail, password });
    staffNoBranchToken = resStaffNoBranchLogin.body.data.accessToken;

    // 6. Setup Legacy Suspended Partner User (Partner without PartnerMember record, status SUSPENDED)
    const legacySuspendedUser = await prisma.user.create({
      data: { email: legacySuspendedPartnerEmail, fullName: 'Legacy Suspended User', passwordHash, role: 'PARTNER', status: 'ACTIVE', emailVerifiedAt: new Date() },
    });
    await prisma.partner.create({
      data: { userId: legacySuspendedUser.id, businessName: 'Suspended Corp', taxCode: 'RBAC-TAX-SUSPENDED', representativeName: 'Rep S', status: 'SUSPENDED' },
    });
    const resLegacyLogin = await request(app).post('/api/auth/login').send({ email: legacySuspendedPartnerEmail, password });
    legacySuspendedToken = resLegacyLogin.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  // 1. Register role injection
  it('1. Register role injection: POST /api/auth/register with role="ADMIN" creates CUSTOMER role in DB', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        email: 'role_inject_user@test.com',
        password,
        fullName: 'Role Inject Attempt',
        phone: '0988776655',
        role: 'ADMIN',
      });

    expect(res.status).toBe(201);
    expect(res.body.data.role).toBe('CUSTOMER');

    const createdUser = await prisma.user.findUnique({ where: { email: 'role_inject_user@test.com' } });
    expect(createdUser.role).toBe('CUSTOMER');
  });

  // 2. Customer -> Admin Route
  it('2. Customer accessing Admin Route (GET /api/admin/dashboard) returns 403', async () => {
    const res = await request(app)
      .get('/api/admin/dashboard')
      .set('Authorization', `Bearer ${customerToken}`);

    console.log('TEST 2:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  // 3. Customer -> Partner Route
  it('3. Customer accessing Partner Route (GET /api/partner/vouchers) returns 403', async () => {
    const res = await request(app)
      .get('/api/partner/vouchers')
      .set('Authorization', `Bearer ${customerToken}`);

    console.log('TEST 3:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');
  });

  // 4. Cross-partner Voucher Mutation
  it('4. Partner A attempting to update Partner B voucher returns 403 and leaves DB unchanged', async () => {
    const res = await request(app)
      .put(`/api/partner/vouchers/${voucherBId}`)
      .set('Authorization', `Bearer ${partnerAToken}`)
      .send({ title: 'Hacked Voucher B Title' });

    console.log('TEST 4:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');

    const dbVoucher = await prisma.voucher.findUnique({ where: { id: voucherBId } });
    expect(dbVoucher.title).toBe('Original Voucher B');
  });

  // 5. Cross-partner Branch Mutation
  it('5. Partner A attempting to update Partner B branch returns 403 and leaves DB unchanged', async () => {
    const res = await request(app)
      .put(`/api/partner/branches/${branchBId}`)
      .set('Authorization', `Bearer ${partnerAToken}`)
      .send({ name: 'Hacked Branch B Name' });

    console.log('TEST 5:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');

    const dbBranch = await prisma.branch.findUnique({ where: { id: branchBId } });
    expect(dbBranch.name).toBe('Branch B1');
  });

  // 6. STAFF Redeem Wrong Branch
  it('6. STAFF assigned to Branch A attempting to check/redeem for Branch B returns 403 and leaves DB code status ISSUED', async () => {
    const res = await request(app)
      .post('/api/partner/redeem/check')
      .set('Authorization', `Bearer ${staffBranchAToken}`)
      .send({ code: voucherCodeA.code, branchId: branchBId });

    console.log('TEST 6:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('INVALID_BRANCH_SCOPE');

    const dbCode = await prisma.voucherCode.findUnique({ where: { id: voucherCodeA.id } });
    expect(dbCode.status).toBe(VOUCHER_CODE_STATUS.ISSUED);
    expect(dbCode.usedAt).toBeNull();
  });

  // 7. STAFF Without Branch
  it('7. STAFF member without an assigned branchId returns 403 STAFF_BRANCH_REQUIRED', async () => {
    const res = await request(app)
      .post('/api/partner/redeem/check')
      .set('Authorization', `Bearer ${staffNoBranchToken}`)
      .send({ code: voucherCodeA.code, branchId: branchAId });

    console.log('TEST 7:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('STAFF_BRANCH_REQUIRED');
  });

  // 8. Customer calling Admin assign role
  it('8. Customer calling POST /api/admin/users/:id/role returns 403 and leaves user role unchanged', async () => {
    const res = await request(app)
      .patch(`/api/admin/users/${customerId}/role`)
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ role: 'ADMIN' });

    console.log('TEST 8:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('FORBIDDEN');

    const dbUser = await prisma.user.findUnique({ where: { id: customerId } });
    expect(dbUser.role).toBe('CUSTOMER');
  });

  // 9. Admin self-action prevention (Self-lock)
  it('9. Admin attempting to toggle lock on self returns 400 SELF_ACTION', async () => {
    const res = await request(app)
      .post(`/api/admin/users/${adminId}/toggle-lock`)
      .set('Authorization', `Bearer ${adminToken}`);

    console.log('TEST 9:', res.status, res.body);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('SELF_ACTION');

    const dbAdmin = await prisma.user.findUnique({ where: { id: adminId } });
    expect(dbAdmin.status).toBe('ACTIVE');
  });

  // 10. Legacy fallback path for Suspended Partner
  it('10. Suspended partner hitting legacy access fallback returns 403 PARTNER_NOT_ACTIVE', async () => {
    const res = await request(app)
      .get('/api/partner/profile')
      .set('Authorization', `Bearer ${legacySuspendedToken}`);

    console.log('TEST 10:', res.status, res.body);
    expect(res.status).toBe(403);
    expect(res.body.code).toBe('PARTNER_NOT_ACTIVE');
  });
});
