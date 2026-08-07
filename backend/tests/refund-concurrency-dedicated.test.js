/**
 * TUNG-W6-FIX-03 — Dedicated Concurrent Refund Tests
 *
 * Tests four concurrency scenarios against a real PostgreSQL database:
 *   REF-CON-01 — Two simultaneous customer refund requests on the same order
 *   REF-CON-02 — Two simultaneous admin approvals of the same refund request
 *   REF-CON-03 — Approve-refund vs redeem racing on the same voucher code
 *   REF-CON-04 — Client retry / idempotency: repeated refund request must not create duplicates
 *
 * Requirements:
 *   - Real PostgreSQL — no SQLite, no in-memory substitute
 *   - Real concurrent requests via Promise.all / Promise.allSettled
 *   - Asserts database side-effects, not just HTTP status
 *   - Deterministic fixtures; cleanup runs before and after each describe block
 *   - No arbitrary sleep; no sequential fake-concurrency
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS, VOUCHER_CODE_STATUS } from '../src/constants/statuses.js';
import { AUDIT_ACTIONS } from '../src/constants/auditActions.js';
import { buyNow } from '../src/modules/orders/orders.service.js';
import {
  createRefundRequest,
  approveRefund,
} from '../src/modules/refunds/refunds.service.js';
import { redeemCode } from '../src/modules/redeem/redeem.service.js';

// ---------------------------------------------------------------------------
// Shared fixture builder helpers
// ---------------------------------------------------------------------------

async function buildFixture(tag) {
  const customerEmail = `rc_customer_${tag}@vivouch-test.invalid`;
  const partnerEmail = `rc_partner_${tag}@vivouch-test.invalid`;
  const adminEmail = `rc_admin_${tag}@vivouch-test.invalid`;
  const categorySlug = `rc-cat-${tag}`;
  const taxCode = `RC-${tag.toUpperCase()}-TAX`;

  await cleanupByTag(tag);

  const category = await prisma.category.create({
    data: { name: `RC Category ${tag}`, slug: categorySlug },
  });

  const adminUser = await prisma.user.create({
    data: {
      email: adminEmail,
      fullName: `RC Admin ${tag}`,
      passwordHash: 'dummy',
      role: 'ADMIN',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });

  const customerUser = await prisma.user.create({
    data: {
      email: customerEmail,
      fullName: `RC Customer ${tag}`,
      passwordHash: 'dummy',
      role: 'CUSTOMER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  const wallet = await prisma.wallet.create({
    data: { userId: customerUser.id, balance: 5000000 },
  });

  const partnerUser = await prisma.user.create({
    data: {
      email: partnerEmail,
      fullName: `RC Partner ${tag}`,
      passwordHash: 'dummy',
      role: 'PARTNER',
      status: 'ACTIVE',
      emailVerifiedAt: new Date(),
    },
  });
  const partner = await prisma.partner.create({
    data: {
      userId: partnerUser.id,
      businessName: `RC Partner ${tag}`,
      taxCode,
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

  const branch = await prisma.branch.create({
    data: {
      partnerId: partner.id,
      name: `Branch ${tag}`,
      address: '123 Test St',
    },
  });

  const voucher = await prisma.voucher.create({
    data: {
      partnerId: partner.id,
      categoryId: category.id,
      title: `Refundable Voucher ${tag}`,
      originalPrice: 200000,
      salePrice: 100000,
      totalQty: 20,
      soldQty: 0,
      status: VOUCHER_STATUS.ON_SALE,
      allowRefund: true,
      refundWindowHours: 24,
    },
  });

  await prisma.voucherBranch.create({
    data: { voucherId: voucher.id, branchId: branch.id },
  });

  return { adminUser, customerUser, partnerUser, partner, branch, wallet, voucher, category, tag };
}

async function placeCompletedOrder(customerId, voucherId) {
  const result = await buyNow(
    customerId,
    [{ id: voucherId, qty: 1 }],
    { paymentMethod: 'VIVOUCH_WALLET' },
  );
  const orderId = result.orderId;
  const voucherCode = await prisma.voucherCode.findFirst({ where: { orderId } });
  return { orderId, voucherCode };
}

async function createPendingRefund(customerId, orderId) {
  return createRefundRequest(customerId, {
    orderId,
    reason: 'Concurrent test — setup refund',
  });
}

async function cleanupByTag(tag) {
  const emails = [
    `rc_customer_${tag}@vivouch-test.invalid`,
    `rc_partner_${tag}@vivouch-test.invalid`,
    `rc_admin_${tag}@vivouch-test.invalid`,
  ];

  const users = await prisma.user.findMany({ where: { email: { in: emails } } });
  if (users.length === 0) return;
  const userIds = users.map((u) => u.id);

  const orders = await prisma.order.findMany({ where: { userId: { in: userIds } } });
  const orderIds = orders.map((o) => o.id);

  if (orderIds.length > 0) {
    await prisma.refundRequest.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.walletTransaction.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.voucherUsageLog.deleteMany({
      where: { voucherCode: { orderId: { in: orderIds } } },
    });
    await prisma.voucherCode.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
    await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
  }

  await prisma.walletTransaction.deleteMany({
    where: { wallet: { userId: { in: userIds } } },
  });
  await prisma.wallet.deleteMany({ where: { userId: { in: userIds } } });
  await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
  await prisma.notification.deleteMany({ where: { userId: { in: userIds } } });

  const partners = await prisma.partner.findMany({ where: { userId: { in: userIds } } });
  const partnerIds = partners.map((p) => p.id);
  if (partnerIds.length > 0) {
    const branches = await prisma.branch.findMany({ where: { partnerId: { in: partnerIds } } });
    const branchIds = branches.map((b) => b.id);
    if (branchIds.length > 0) {
      await prisma.voucherBranch.deleteMany({ where: { branchId: { in: branchIds } } });
      await prisma.branch.deleteMany({ where: { id: { in: branchIds } } });
    }
    await prisma.partnerMember.deleteMany({ where: { partnerId: { in: partnerIds } } });
    await prisma.voucher.deleteMany({ where: { partnerId: { in: partnerIds } } });
    await prisma.partner.deleteMany({ where: { id: { in: partnerIds } } });
  }

  await prisma.user.deleteMany({ where: { id: { in: userIds } } });
  await prisma.category.deleteMany({ where: { slug: `rc-cat-${tag}` } });
}

// ---------------------------------------------------------------------------
// REF-CON-01 — Two simultaneous customer refund requests on the same order
// ---------------------------------------------------------------------------

describe('REF-CON-01: Concurrent customer refund requests on same order', () => {
  const TAG = 'rc01';
  let fixture;
  let orderId;
  let voucherCodeId;
  let walletBalanceBefore;

  beforeAll(async () => {
    fixture = await buildFixture(TAG);

    const walletBefore = await prisma.wallet.findUnique({
      where: { userId: fixture.customerUser.id },
    });
    walletBalanceBefore = Number(walletBefore.balance);

    const placed = await placeCompletedOrder(fixture.customerUser.id, fixture.voucher.id);
    orderId = placed.orderId;
    voucherCodeId = placed.voucherCode.id;
  });

  afterAll(async () => {
    await cleanupByTag(TAG);
  });

  it('exactly one RefundRequest is created; no double wallet credit; voucher stays REFUND_PENDING', async () => {
    const [res1, res2] = await Promise.allSettled([
      createRefundRequest(fixture.customerUser.id, {
        orderId,
        reason: 'REF-CON-01 concurrent request A',
      }),
      createRefundRequest(fixture.customerUser.id, {
        orderId,
        reason: 'REF-CON-01 concurrent request B',
      }),
    ]);

    const winners = [res1, res2].filter((r) => r.status === 'fulfilled');
    const losers = [res1, res2].filter((r) => r.status === 'rejected');
    expect(winners.length).toBe(1);
    expect(losers.length).toBe(1);

    const loserReason = losers[0].reason;
    // Loser hits one of two error codes depending on race timing:
    //   ORDER_NOT_REFUNDABLE — winner already committed REFUND_PENDING status;
    //                          loser's re-read sees wrong status and rejects.
    //   REFUND_ALREADY_EXISTS — both read COMPLETED simultaneously; winner committed
    //                           first and loser's refundRequest check fires.
    //   P2002 — unique constraint on RefundRequest.orderId (last-resort DB guard).
    const ALLOWED_LOSER_CODES = [
      'ORDER_NOT_REFUNDABLE',
      'REFUND_ALREADY_EXISTS',
      'P2002',
    ];
    expect(ALLOWED_LOSER_CODES).toContain(loserReason?.code);

    // DB: exactly one refund request
    const refunds = await prisma.refundRequest.findMany({ where: { orderId } });
    expect(refunds.length).toBe(1);
    expect(refunds[0].status).toBe('REQUESTED');

    // Order: REFUND_PENDING
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order.status).toBe('REFUND_PENDING');

    // Payment: still PAID
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    expect(payment.status).toBe('PAID');

    // VoucherCode: REFUND_PENDING
    const vc = await prisma.voucherCode.findUnique({ where: { id: voucherCodeId } });
    expect(vc.status).toBe(VOUCHER_CODE_STATUS.REFUND_PENDING);

    // Wallet: debited by purchase only, no credit yet
    const wallet = await prisma.wallet.findUnique({
      where: { userId: fixture.customerUser.id },
    });
    expect(Number(wallet.balance)).toBe(walletBalanceBefore - 100000);

    // No REFUND wallet transaction yet
    const refundTxs = await prisma.walletTransaction.findMany({
      where: { orderId, type: 'REFUND' },
    });
    expect(refundTxs.length).toBe(0);

    // Audit log: exactly one CUSTOMER_REQUEST_REFUND
    const auditLogs = await prisma.auditLog.findMany({
      where: { actorId: fixture.customerUser.id, action: AUDIT_ACTIONS.CUSTOMER_REQUEST_REFUND },
    });
    expect(auditLogs.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// REF-CON-02 — Two simultaneous admin approvals of the same refund request
// ---------------------------------------------------------------------------

describe('REF-CON-02: Concurrent admin approvals of the same refund request', () => {
  const TAG = 'rc02';
  let fixture;
  let orderId;
  let refundId;
  let walletBalanceBefore;

  beforeAll(async () => {
    fixture = await buildFixture(TAG);

    const placed = await placeCompletedOrder(fixture.customerUser.id, fixture.voucher.id);
    orderId = placed.orderId;

    const refund = await createPendingRefund(fixture.customerUser.id, orderId);
    refundId = refund.id;

    const walletSnap = await prisma.wallet.findUnique({
      where: { userId: fixture.customerUser.id },
    });
    walletBalanceBefore = Number(walletSnap.balance);
  });

  afterAll(async () => {
    await cleanupByTag(TAG);
  });

  it('only one admin wins; wallet credited once; WalletTransaction unique constraint holds; payment REFUNDED once', async () => {
    const [res1, res2] = await Promise.allSettled([
      approveRefund(fixture.adminUser.id, refundId, { adminNote: 'Approve by admin-A' }),
      approveRefund(fixture.adminUser.id, refundId, { adminNote: 'Approve by admin-B' }),
    ]);

    const winners = [res1, res2].filter((r) => r.status === 'fulfilled');
    const losers = [res1, res2].filter((r) => r.status === 'rejected');
    expect(winners.length).toBe(1);
    expect(losers.length).toBe(1);

    const loserReason = losers[0].reason;
    const isExpectedError =
      loserReason?.code === 'REFUND_ALREADY_RESOLVED' ||
      loserReason?.code === 'P2002' ||
      String(loserReason?.message ?? '').toLowerCase().includes('unique') ||
      String(loserReason?.message ?? '').toLowerCase().includes('already');
    expect(isExpectedError).toBe(true);

    // RefundRequest: REFUNDED
    const refund = await prisma.refundRequest.findUnique({ where: { id: refundId } });
    expect(refund.status).toBe('REFUNDED');
    expect(refund.resolvedAt).not.toBeNull();

    // Wallet: credited exactly once
    const wallet = await prisma.wallet.findUnique({
      where: { userId: fixture.customerUser.id },
    });
    expect(Number(wallet.balance)).toBe(walletBalanceBefore + 100000);

    // WalletTransaction: exactly one REFUND
    const refundTxs = await prisma.walletTransaction.findMany({
      where: { orderId, type: 'REFUND' },
    });
    expect(refundTxs.length).toBe(1);
    expect(Number(refundTxs[0].amount)).toBe(100000);

    // Payment: REFUNDED
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    expect(payment.status).toBe('REFUNDED');

    // Order: REFUNDED
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order.status).toBe('REFUNDED');

    // VoucherCodes: exactly one REFUNDED
    const vcs = await prisma.voucherCode.findMany({
      where: { orderId, status: 'REFUNDED' },
    });
    expect(vcs.length).toBe(1);

    // Audit: exactly one ADMIN_APPROVE_REFUND
    const approveLogs = await prisma.auditLog.findMany({
      where: { action: AUDIT_ACTIONS.ADMIN_APPROVE_REFUND, targetId: refundId },
    });
    expect(approveLogs.length).toBe(1);

    // Notification: exactly one REFUND_RESOLVED for customer
    const notifications = await prisma.notification.findMany({
      where: { userId: fixture.customerUser.id, type: 'REFUND_RESOLVED' },
    });
    expect(notifications.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// REF-CON-03 — Approve-refund vs redeem racing on the same voucher code
// ---------------------------------------------------------------------------

describe('REF-CON-03: Approve-refund vs redeem racing on same voucher code', () => {
  const TAG = 'rc03';
  let fixture;
  let orderId;
  let voucherCode;
  let refundId;

  function buildAccess(partnerUserId, partnerId) {
    return {
      partnerId,
      userId: partnerUserId,
      role: 'OWNER',
      status: 'ACTIVE',
      branchId: null,
      partner: { status: 'APPROVED' },
    };
  }

  beforeAll(async () => {
    fixture = await buildFixture(TAG);

    const placed = await placeCompletedOrder(fixture.customerUser.id, fixture.voucher.id);
    orderId = placed.orderId;
    voucherCode = placed.voucherCode;

    const refund = await createPendingRefund(fixture.customerUser.id, orderId);
    refundId = refund.id;

    // Verify precondition
    const vc = await prisma.voucherCode.findUnique({ where: { id: voucherCode.id } });
    expect(vc.status).toBe(VOUCHER_CODE_STATUS.REFUND_PENDING);
  });

  afterAll(async () => {
    await cleanupByTag(TAG);
  });

  it('redeem is blocked; final state never USED; no usage log created', async () => {
    const access = buildAccess(fixture.partnerUser.id, fixture.partner.id);

    const [approveResult, redeemResult] = await Promise.allSettled([
      approveRefund(fixture.adminUser.id, refundId, { adminNote: 'RC03 approve' }),
      redeemCode(fixture.partnerUser.id, access, voucherCode.code, fixture.branch.id),
    ]);

    // Final voucher code state must never be USED
    const finalVc = await prisma.voucherCode.findUnique({ where: { id: voucherCode.id } });
    expect(finalVc.status).not.toBe(VOUCHER_CODE_STATUS.USED);

    const validStatuses = [VOUCHER_CODE_STATUS.REFUND_PENDING, VOUCHER_CODE_STATUS.REFUNDED];
    expect(validStatuses).toContain(finalVc.status);

    // No VoucherUsageLog (was never legitimately redeemed)
    const usageLogs = await prisma.voucherUsageLog.findMany({
      where: { voucherCodeId: voucherCode.id },
    });
    expect(usageLogs.length).toBe(0);

    // Redeem must have been rejected with a refund-protection error
    if (redeemResult.status === 'rejected') {
      const refundProtectionCodes = [
        'VOUCHER_CODE_REFUND_PENDING',
        'VOUCHER_CODE_REFUNDED',
        'INVALID_VOUCHER_CODE',
      ];
      expect(refundProtectionCodes).toContain(redeemResult.reason?.code);
    }

    // Order status must not be COMPLETED
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order.status).not.toBe('COMPLETED');
    expect(['REFUND_PENDING', 'REFUNDED']).toContain(order.status);

    // Wallet: credit only if approve won
    const refund = await prisma.refundRequest.findUnique({ where: { id: refundId } });
    const refundTxs = await prisma.walletTransaction.findMany({
      where: { orderId, type: 'REFUND' },
    });
    if (refund.status === 'REFUNDED') {
      expect(refundTxs.length).toBe(1);
    } else {
      expect(refundTxs.length).toBe(0);
    }
  });
});

// ---------------------------------------------------------------------------
// REF-CON-04 — Client retry / idempotency: repeated refund request
// ---------------------------------------------------------------------------

describe('REF-CON-04: Client retry does not create duplicate refund', () => {
  const TAG = 'rc04';
  let fixture;
  let orderId;

  beforeAll(async () => {
    fixture = await buildFixture(TAG);

    const placed = await placeCompletedOrder(fixture.customerUser.id, fixture.voucher.id);
    orderId = placed.orderId;
  });

  afterAll(async () => {
    await cleanupByTag(TAG);
  });

  it('sequential retries produce exactly one RefundRequest with stable state', async () => {
    const call = () =>
      createRefundRequest(fixture.customerUser.id, {
        orderId,
        reason: 'REF-CON-04 idempotency retry',
      });

    // First call: must succeed
    const first = await call();
    expect(first.orderId).toBe(orderId);
    expect(first.status).toBe('REQUESTED');

    // Second call (retry): must fail — order is already REFUND_PENDING
    // Acceptable codes: ORDER_NOT_REFUNDABLE (sees updated status) or
    //                   REFUND_ALREADY_EXISTS (sees existing RefundRequest)
    const RETRY_ALLOWED_CODES = ['ORDER_NOT_REFUNDABLE', 'REFUND_ALREADY_EXISTS', 'P2002'];
    const secondResult = await call().catch((e) => e);
    expect(RETRY_ALLOWED_CODES).toContain(secondResult?.code);

    // Third call (another retry): same expectation
    const thirdResult = await call().catch((e) => e);
    expect(RETRY_ALLOWED_CODES).toContain(thirdResult?.code);

    // DB: exactly one RefundRequest
    const refunds = await prisma.refundRequest.findMany({ where: { orderId } });
    expect(refunds.length).toBe(1);
    expect(refunds[0].status).toBe('REQUESTED');

    // Order: REFUND_PENDING
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    expect(order.status).toBe('REFUND_PENDING');

    // Payment: PAID
    const payment = await prisma.payment.findUnique({ where: { orderId } });
    expect(payment.status).toBe('PAID');

    // VoucherCode: REFUND_PENDING
    const vcs = await prisma.voucherCode.findMany({ where: { orderId } });
    expect(vcs.length).toBe(1);
    expect(vcs[0].status).toBe(VOUCHER_CODE_STATUS.REFUND_PENDING);

    // No REFUND wallet transaction
    const refundTxs = await prisma.walletTransaction.findMany({
      where: { orderId, type: 'REFUND' },
    });
    expect(refundTxs.length).toBe(0);

    // Audit: exactly one CUSTOMER_REQUEST_REFUND
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        actorId: fixture.customerUser.id,
        action: AUDIT_ACTIONS.CUSTOMER_REQUEST_REFUND,
        targetType: 'RefundRequest',
      },
    });
    expect(auditLogs.length).toBe(1);
  });

  it('concurrent retries (Promise.allSettled) produce exactly one RefundRequest', async () => {
    // Place a fresh order for this sub-case
    const placed2 = await placeCompletedOrder(
      fixture.customerUser.id,
      fixture.voucher.id,
    );
    const orderId2 = placed2.orderId;

    // Three concurrent calls
    const results = await Promise.allSettled([
      createRefundRequest(fixture.customerUser.id, { orderId: orderId2, reason: 'RC04-C request 1' }),
      createRefundRequest(fixture.customerUser.id, { orderId: orderId2, reason: 'RC04-C request 2' }),
      createRefundRequest(fixture.customerUser.id, { orderId: orderId2, reason: 'RC04-C request 3' }),
    ]);

    const fulfilled = results.filter((r) => r.status === 'fulfilled');
    const rejected = results.filter((r) => r.status === 'rejected');

    expect(fulfilled.length).toBe(1);
    expect(rejected.length).toBe(2);

    // DB: still only one RefundRequest
    const refunds = await prisma.refundRequest.findMany({ where: { orderId: orderId2 } });
    expect(refunds.length).toBe(1);

    // Order: REFUND_PENDING
    const order2 = await prisma.order.findUnique({ where: { id: orderId2 } });
    expect(order2.status).toBe('REFUND_PENDING');

    // Audit: filter by orderId2 metadata
    const allAuditLogs = await prisma.auditLog.findMany({
      where: {
        actorId: fixture.customerUser.id,
        action: AUDIT_ACTIONS.CUSTOMER_REQUEST_REFUND,
      },
    });
    const logsForOrder2 = allAuditLogs.filter(
      (l) => l.metadata?.orderId === orderId2,
    );
    expect(logsForOrder2.length).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// Teardown
// ---------------------------------------------------------------------------

afterAll(async () => {
  await prisma.$disconnect();
});
