import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcrypt';
import app from '../src/app.js';
import { prisma } from '../src/config/prisma.js';
import { VOUCHER_STATUS } from '../src/constants/statuses.js';

describe('Cart Checkout API Tests', () => {
  const customerEmail = 'checkout_api_customer@test.com';
  const partnerEmail = 'checkout_api_partner@test.com';
  const password = 'Password123!';

  let customerToken = '';
  let voucherId = '';
  let partnerId = '';
  let categoryId = '';

  const cleanup = async () => {
    const emails = [customerEmail, partnerEmail];
    const users = await prisma.user.findMany({ where: { email: { in: emails } } });
    if (users.length === 0) {
      await prisma.category.deleteMany({ where: { slug: 'checkout-api-test' } });
      return;
    }

    const userIds = users.map((user) => user.id);

    await prisma.cartItem.deleteMany({ where: { cart: { userId: { in: userIds } } } });
    await prisma.cart.deleteMany({ where: { userId: { in: userIds } } });
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

    await prisma.auditLog.deleteMany({ where: { actorId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { id: { in: userIds } } });
    await prisma.category.deleteMany({ where: { slug: 'checkout-api-test' } });
  };

  beforeAll(async () => {
    await cleanup();

    const category = await prisma.category.create({
      data: { name: 'Checkout API Test', slug: 'checkout-api-test' },
    });
    categoryId = category.id;

    const passwordHash = await bcrypt.hash(password, 10);

    const customer = await prisma.user.create({
      data: {
        email: customerEmail,
        fullName: 'Checkout API Customer',
        passwordHash,
        role: 'CUSTOMER',
      },
    });

    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        fullName: 'Checkout API Partner',
        passwordHash,
        role: 'PARTNER',
      },
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: 'Checkout API Partner',
        taxCode: 'CHECKOUT-API-01',
        representativeName: 'Rep',
        status: 'APPROVED',
      },
    });
    partnerId = partner.id;

    const voucher = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: 'Checkout API Voucher',
        originalPrice: 100000,
        salePrice: 75000,
        totalQty: 20,
        soldQty: 0,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });
    voucherId = voucher.id;

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: customerEmail, password });

    customerToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await cleanup();
    await prisma.$disconnect();
  });

  it('returns 401 without token', async () => {
    const res = await request(app).post('/api/customer/orders/cart/checkout');
    expect(res.status).toBe(401);
  });

  it('returns 400 when cart is empty', async () => {
    const res = await request(app)
      .post('/api/customer/orders/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ paymentMethod: 'VIVOUCH_WALLET' });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe('EMPTY_CART');
  });

  it('checkout from cart creates order, voucher codes, and clears cart', async () => {
    const addRes = await request(app)
      .post('/api/customer/cart/items')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ voucherId, qty: 2 });

    expect(addRes.status).toBe(200);
    expect(addRes.body.data.items).toHaveLength(1);

    const checkoutRes = await request(app)
      .post('/api/customer/orders/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('Idempotency-Key', 'checkout-cart-success-001')
      .send({ paymentMethod: 'VIVOUCH_WALLET' });

    expect(checkoutRes.status).toBe(201);
    expect(checkoutRes.body.success).toBe(true);
    expect(checkoutRes.body.data.orderId).toBeTruthy();
    expect(checkoutRes.body.data.voucherCodes).toHaveLength(2);
    expect(checkoutRes.body.data.voucherCodes[0]).toMatchObject({
      voucherId,
      voucherTitle: 'Checkout API Voucher',
    });

    const cartRes = await request(app)
      .get('/api/customer/cart')
      .set('Authorization', `Bearer ${customerToken}`);

    expect(cartRes.status).toBe(200);
    expect(cartRes.body.data.items).toHaveLength(0);
    expect(cartRes.body.data.cartTotal.totalAmount).toBe(0);

    const order = await prisma.order.findUnique({
      where: { id: checkoutRes.body.data.orderId },
      include: { payment: true, items: true },
    });

    expect(order?.status).toBe('COMPLETED');
    expect(Number(order?.totalAmount)).toBe(150000);
    expect(order?.payment?.status).toBe('PAID');
    expect(order?.items).toHaveLength(1);
    expect(order?.items[0].qty).toBe(2);

    const replayRes = await request(app)
      .post('/api/customer/orders/cart/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .set('Idempotency-Key', 'checkout-cart-success-001')
      .send({ paymentMethod: 'VIVOUCH_WALLET' });

    expect(replayRes.status).toBe(200);
    expect(replayRes.body.data.orderId).toBe(checkoutRes.body.data.orderId);
    expect(replayRes.body.data.idempotentReplay).toBe(true);
    expect(replayRes.body.data.voucherCodes).toHaveLength(2);

    const matchingOrders = await prisma.order.count({
      where: { userId: order.userId, idempotencyKey: 'checkout-cart-success-001' },
    });
    expect(matchingOrders).toBe(1);
  });

  it('returns 400 when buying an out-of-stock voucher via buyNow', async () => {
    const outOfStockVoucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'Out of stock Voucher',
        originalPrice: 100000,
        salePrice: 75000,
        totalQty: 10,
        soldQty: 10,
        status: VOUCHER_STATUS.ON_SALE,
      },
    });

    const res = await request(app)
      .post('/api/customer/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ id: outOfStockVoucher.id, qty: 1 }],
        paymentMethod: 'VIVOUCH_WALLET'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it('returns 400 when buying an expired sale voucher via buyNow', async () => {
    const expiredVoucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: 'Expired Voucher',
        originalPrice: 100000,
        salePrice: 75000,
        totalQty: 10,
        soldQty: 0,
        status: VOUCHER_STATUS.ON_SALE,
        saleEnd: new Date(Date.now() - 86400000), // expired yesterday
      },
    });

    const res = await request(app)
      .post('/api/customer/orders/checkout')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        items: [{ id: expiredVoucher.id, qty: 1 }],
        paymentMethod: 'VIVOUCH_WALLET'
      });

    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});
