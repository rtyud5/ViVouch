import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { prisma } from '../src/config/prisma.js';
import * as reviewsService from '../src/modules/reviews/reviews.service.js';
import { VOUCHER_CODE_STATUS, VOUCHER_STATUS } from '../src/constants/statuses.js';
import { AUDIT_ACTIONS } from '../src/constants/auditActions.js';

describe('Reviews Service Tests', () => {
  const customerEmail = 'review_customer@test.com';
  const unusedCustomerEmail = 'review_unused_customer@test.com';
  const partnerEmail = 'review_partner@test.com';

  let customerId;
  let unusedCustomerId;
  let partnerId;
  let categoryId;
  let voucherId;
  let orderId;
  let unusedOrderId;

  beforeAll(async () => {
    await prisma.auditLog.deleteMany({
      where: {
        actor: { email: { in: [customerEmail, unusedCustomerEmail, partnerEmail] } },
      },
    });
    await prisma.review.deleteMany({
      where: {
        user: { email: { in: [customerEmail, unusedCustomerEmail] } },
      },
    });
    await prisma.voucherCode.deleteMany({
      where: {
        owner: { email: { in: [customerEmail, unusedCustomerEmail] } },
      },
    });
    await prisma.payment.deleteMany({
      where: {
        order: { user: { email: { in: [customerEmail, unusedCustomerEmail] } } },
      },
    });
    await prisma.orderItem.deleteMany({
      where: {
        order: { user: { email: { in: [customerEmail, unusedCustomerEmail] } } },
      },
    });
    await prisma.order.deleteMany({
      where: {
        user: { email: { in: [customerEmail, unusedCustomerEmail] } },
      },
    });
    await prisma.voucher.deleteMany({
      where: { partner: { user: { email: partnerEmail } } },
    });
    await prisma.partner.deleteMany({
      where: { user: { email: partnerEmail } },
    });
    await prisma.user.deleteMany({
      where: { email: { in: [customerEmail, unusedCustomerEmail, partnerEmail] } },
    });
    await prisma.category.deleteMany({ where: { slug: 'review-service-test' } });

    const [customer, unusedCustomer, partnerUser, category] = await Promise.all([
      prisma.user.create({
        data: {
          email: customerEmail,
          fullName: 'Review Customer',
          passwordHash: 'test-password',
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      }),
      prisma.user.create({
        data: {
          email: unusedCustomerEmail,
          fullName: 'Unused Review Customer',
          passwordHash: 'test-password',
          role: 'CUSTOMER',
          status: 'ACTIVE',
        },
      }),
      prisma.user.create({
        data: {
          email: partnerEmail,
          fullName: 'Review Partner User',
          passwordHash: 'test-password',
          role: 'PARTNER',
          status: 'ACTIVE',
        },
      }),
      prisma.category.create({
        data: {
          name: 'Review Service Test',
          slug: 'review-service-test',
          icon: 'star',
        },
      }),
    ]);

    customerId = customer.id;
    unusedCustomerId = unusedCustomer.id;
    categoryId = category.id;

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: 'Review Partner',
        taxCode: 'REVIEW-TAX-001',
        representativeName: 'Review Rep',
        status: 'APPROVED',
      },
    });
    partnerId = partner.id;

    const voucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'Reviewable Voucher',
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 10,
        soldQty: 2,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });
    voucherId = voucher.id;

    const order = await prisma.order.create({
      data: {
        userId: customerId,
        status: 'COMPLETED',
        totalAmount: 80000,
        items: { create: [{ voucherId, qty: 1, unitPrice: 80000 }] },
        voucherCodes: {
          create: [{
            voucherId,
            ownerId: customerId,
            code: 'VC-REVIEW-USED',
            status: VOUCHER_CODE_STATUS.USED,
            usedAt: new Date(),
          }],
        },
      },
    });
    orderId = order.id;

    const unusedOrder = await prisma.order.create({
      data: {
        userId: unusedCustomerId,
        status: 'COMPLETED',
        totalAmount: 80000,
        items: { create: [{ voucherId, qty: 1, unitPrice: 80000 }] },
        voucherCodes: {
          create: [{
            voucherId,
            ownerId: unusedCustomerId,
            code: 'VC-REVIEW-ISSUED',
            status: VOUCHER_CODE_STATUS.ISSUED,
          }],
        },
      },
    });
    unusedOrderId = unusedOrder.id;
  });

  afterAll(async () => {
    const userIds = [customerId, unusedCustomerId].filter(Boolean);
    const orderIds = [orderId, unusedOrderId].filter(Boolean);

    if (userIds.length === 0 && !voucherId) {
      await prisma.$disconnect();
      return;
    }

    if (userIds.length) {
      await prisma.auditLog.deleteMany({
        where: { actorId: { in: userIds } },
      });
    }
    if (voucherId) {
      await prisma.review.deleteMany({ where: { voucherId } });
      await prisma.voucherCode.deleteMany({ where: { voucherId } });
    }
    if (orderIds.length) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }
    if (voucherId) {
      await prisma.voucher.deleteMany({ where: { id: voucherId } });
    }
    if (partnerId) {
      await prisma.partner.deleteMany({ where: { id: partnerId } });
    }
    await prisma.user.deleteMany({
      where: { email: { in: [customerEmail, unusedCustomerEmail, partnerEmail] } },
    });
    if (categoryId) {
      await prisma.category.deleteMany({ where: { id: categoryId } });
    }
    await prisma.$disconnect();
  });

  it('returns empty review list with zero avgRating', async () => {
    const result = await reviewsService.getByVoucher(voucherId, { page: 1, limit: 10 });

    expect(result.reviews).toHaveLength(0);
    expect(result.avgRating).toBe(0);
    expect(result.totalCount).toBe(0);
  });

  it('rejects review when customer has not used the voucher', async () => {
    await expect(
      reviewsService.createReview(unusedCustomerId, voucherId, { rating: 5, comment: 'Not yet used' })
    ).rejects.toMatchObject({ statusCode: 403, code: 'VOUCHER_NOT_USED' });
  });

  it('creates review for a used voucher code and recalculates rating summary', async () => {
    const result = await reviewsService.createReview(customerId, voucherId, {
      rating: 4,
      comment: 'Good value',
    });

    expect(result.review.rating).toBe(4);
    expect(result.review.user.fullName).toBe('Review Customer');
    expect(result.avgRating).toBe(4);
    expect(result.totalCount).toBe(1);

    const auditLog = await prisma.auditLog.findFirst({
      where: {
        actorId: customerId,
        action: AUDIT_ACTIONS.CUSTOMER_CREATE_REVIEW,
        targetId: result.review.id,
      },
    });
    expect(auditLog).not.toBeNull();
  });

  it('rejects duplicate review for the same voucher', async () => {
    await expect(
      reviewsService.createReview(customerId, voucherId, { rating: 5 })
    ).rejects.toMatchObject({ statusCode: 409, code: 'REVIEW_ALREADY_EXISTS' });
  });
});
