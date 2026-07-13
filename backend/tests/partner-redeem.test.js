import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/config/prisma.js';
import * as redeemService from '../src/modules/redeem/redeem.service.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('Redeem Service Tests', () => {
  const customerEmail = 'redeem_customer@test.com';
  const partnerEmail = 'redeem_partner@test.com';
  const wrongPartnerEmail = 'wrong_partner@test.com';

  let customerId, partnerUserId, wrongPartnerUserId, partnerId, wrongPartnerId, categoryId;
  let voucherId, wrongVoucherId;
  let issuedCode, usedCode, expiredCode, wrongPartnerCode, cancelledCode, lockedCode;
  let branchId, unlinkedBranchId;

  const cleanup = async () => {
    const emails = [customerEmail, partnerEmail, wrongPartnerEmail];
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) return;
    
    const userIds = users.map(u => u.id);
    
    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await prisma.voucherUsageLog.deleteMany({ where: { redeemedBy: { in: userIds } } });
    await prisma.voucherCode.deleteMany({ where: { ownerId: { in: userIds } } });

    const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
    const orderIds = orders.map(o => o.id);
    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    const partners = await prisma.partner.findMany({ where: { userId: { in: userIds } } });
    const partnerIds = partners.map(p => p.id);
    if (partnerIds.length > 0) {
      const branches = await prisma.branch.findMany({ where: { partnerId: { in: partnerIds } } });
      if (branches.length > 0) {
         await prisma.voucherBranch.deleteMany({ where: { branchId: { in: branches.map(b => b.id) } } });
         await prisma.branch.deleteMany({ where: { id: { in: branches.map(b => b.id) } } });
      }
      await prisma.voucher.deleteMany({ where: { partnerId: { in: partnerIds } } });
      await prisma.partner.deleteMany({ where: { id: { in: partnerIds } } });
    }

    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.category.deleteMany({ where: { slug: 'redeem-test-cat' } });
  };

  beforeAll(async () => {
    await cleanup();

    // Setup Category
    const category = await prisma.category.create({
      data: { name: 'Redeem Test Cat', slug: 'redeem-test-cat' }
    });
    categoryId = category.id;

    // Setup Users
    const customer = await prisma.user.create({
      data: { email: customerEmail, fullName: 'Redeem Customer', passwordHash: 'hash', role: 'CUSTOMER' }
    });
    customerId = customer.id;

    const partnerUser = await prisma.user.create({
      data: { email: partnerEmail, fullName: 'Redeem Partner User', passwordHash: 'hash', role: 'PARTNER' }
    });
    partnerUserId = partnerUser.id;

    const wrongPartnerUser = await prisma.user.create({
      data: { email: wrongPartnerEmail, fullName: 'Wrong Partner User', passwordHash: 'hash', role: 'PARTNER' }
    });
    wrongPartnerUserId = wrongPartnerUser.id;

    // Setup Partners
    const partner = await prisma.partner.create({
      data: { userId: partnerUser.id, businessName: 'Right Partner', taxCode: 'REDEEM-TAX-01', representativeName: 'Rep', status: 'APPROVED' }
    });
    partnerId = partner.id;

    const wrongPartner = await prisma.partner.create({
      data: { userId: wrongPartnerUser.id, businessName: 'Wrong Partner', taxCode: 'REDEEM-TAX-02', representativeName: 'Rep2', status: 'APPROVED' }
    });
    wrongPartnerId = wrongPartner.id;

    // Setup Branch
    const branch = await prisma.branch.create({
      data: { partnerId, name: 'Main Branch', address: '123 Street' }
    });
    branchId = branch.id;
    const unlinkedBranch = await prisma.branch.create({
      data: { partnerId, name: 'Unlinked Branch', address: '456 Street' }
    });
    unlinkedBranchId = unlinkedBranch.id;

    // Setup Vouchers
    const rightVoucher = await prisma.voucher.create({
      data: { partnerId, categoryId, title: 'Right Voucher', originalPrice: 100, salePrice: 90, totalQty: 10, status: VOUCHER_STATUS.ON_SALE }
    });
    voucherId = rightVoucher.id;
    
    // Link branch
    await prisma.voucherBranch.create({
       data: { voucherId: rightVoucher.id, branchId: branch.id }
    });

    const wrongVoucher = await prisma.voucher.create({
      data: { partnerId: wrongPartnerId, categoryId, title: 'Wrong Voucher', originalPrice: 100, salePrice: 90, totalQty: 10, status: VOUCHER_STATUS.ON_SALE }
    });
    wrongVoucherId = wrongVoucher.id;

    // Create Order to own codes
    const order = await prisma.order.create({
      data: { userId: customerId, status: 'COMPLETED', totalAmount: 500, items: { create: [{ voucherId, qty: 5, unitPrice: 90 }] } }
    });

    // Create codes directly
    const createCode = async (code, vId, status, extra = {}) => {
       return await prisma.voucherCode.create({
         data: { code, orderId: order.id, voucherId: vId, ownerId: customerId, status, ...extra }
       });
    };

    issuedCode = await createCode('TEST-ISSUED', voucherId, VOUCHER_CODE_STATUS.ISSUED);
    usedCode = await createCode('TEST-USED', voucherId, VOUCHER_CODE_STATUS.USED, { usedAt: new Date() });
    expiredCode = await createCode('TEST-EXPIRED', voucherId, VOUCHER_CODE_STATUS.EXPIRED, { expiresAt: new Date(Date.now() - 100000) });
    wrongPartnerCode = await createCode('TEST-WRONG-PARTNER', wrongVoucherId, VOUCHER_CODE_STATUS.ISSUED);
    cancelledCode = await createCode('TEST-CANCELLED', voucherId, VOUCHER_CODE_STATUS.CANCELLED);
    lockedCode = await createCode('TEST-LOCKED', voucherId, VOUCHER_CODE_STATUS.LOCKED);
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('successfully redeems an ISSUED valid code', async () => {
    const res = await redeemService.redeemCode(partnerUserId, issuedCode.code, branchId);
    expect(res.voucherTitle).toBe('Right Voucher');
    expect(res.customerName).toBe('Redeem Customer');
    expect(res.branchId).toBe(branchId);
    expect(res.redeemedAt).toBeDefined();

    // Check DB status changed
    const dbCode = await prisma.voucherCode.findUnique({ where: { code: issuedCode.code } });
    expect(dbCode.status).toBe(VOUCHER_CODE_STATUS.USED);
  });

  it('rejects a code that is already USED', async () => {
    await expect(redeemService.redeemCode(partnerUserId, usedCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 400, code: 'VOUCHER_CODE_USED' });
  });

  it('rejects an EXPIRED code', async () => {
    await expect(redeemService.redeemCode(partnerUserId, expiredCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 400, code: 'VOUCHER_CODE_EXPIRED' });
  });

  it('rejects a code belonging to a different partner', async () => {
    await expect(redeemService.redeemCode(partnerUserId, wrongPartnerCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
    
    // Also test reverse: wrong partner trying to redeem right code
    await expect(redeemService.redeemCode(wrongPartnerUserId, issuedCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 403, code: 'FORBIDDEN' });
  });

  it('rejects a CANCELLED code', async () => {
    await expect(redeemService.redeemCode(partnerUserId, cancelledCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a LOCKED code', async () => {
    await expect(redeemService.redeemCode(partnerUserId, lockedCode.code, branchId))
      .rejects.toMatchObject({ statusCode: 400 });
  });

  it('rejects a non-existent code', async () => {
    await expect(redeemService.redeemCode(partnerUserId, 'DOES-NOT-EXIST-CODE', branchId))
      .rejects.toMatchObject({ statusCode: 404, code: 'VOUCHER_CODE_NOT_FOUND' });
  });

  it('rejects an active branch outside the voucher scope without consuming the code', async () => {
    const scopedCode = await prisma.voucherCode.create({
      data: {
        code: 'TEST-WRONG-BRANCH',
        orderId: issuedCode.orderId,
        voucherId,
        ownerId: customerId,
        status: VOUCHER_CODE_STATUS.ISSUED,
      },
    });

    await expect(redeemService.redeemCode(partnerUserId, scopedCode.code, unlinkedBranchId))
      .rejects.toMatchObject({ statusCode: 403, code: 'INVALID_BRANCH_SCOPE' });

    const unchanged = await prisma.voucherCode.findUnique({ where: { id: scopedCode.id } });
    expect(unchanged.status).toBe(VOUCHER_CODE_STATUS.ISSUED);
  });
});
