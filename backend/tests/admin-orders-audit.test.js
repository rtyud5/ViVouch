import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

const CUSTOMER_EMAIL = "test_customer_orders@example.com";
const ADMIN_EMAIL = "test_admin_orders@example.com";
const PARTNER_EMAIL = "test_partner_orders@example.com";
const PASSWORD = "Password123!";
const TEST_EMAILS = [CUSTOMER_EMAIL, ADMIN_EMAIL, PARTNER_EMAIL];

async function cleanupAll() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Not in test env");
  }

  await prisma.auditLog.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.voucherUsageLog.deleteMany();
  await prisma.voucherCode.deleteMany();
  await prisma.order.deleteMany();
  await prisma.voucherBranch.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.review.deleteMany();
  await prisma.voucher.deleteMany();
  await prisma.branch.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.category.deleteMany({ where: { slug: "test-category" } });
  await prisma.user.deleteMany({
    where: { email: { in: TEST_EMAILS } }
  });
}

async function createTestCustomer() {
  const resReg = await request(app)
    .post("/api/auth/register")
    .send({ email: CUSTOMER_EMAIL, password: PASSWORD, fullName: "Customer", phone: "0900000301" });

  const resLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: CUSTOMER_EMAIL, password: PASSWORD });
  
  return {
    id: resReg.body.data.id,
    token: resLogin.body.data.accessToken
  };
}

async function createTestAdmin() {
  const resReg = await request(app)
    .post("/api/auth/register")
    .send({ email: ADMIN_EMAIL, password: PASSWORD, fullName: "Admin", phone: "0900000302" });
  
  const adminId = resReg.body.data.id;

  await prisma.user.update({
    where: { id: adminId },
    data: { role: "ADMIN" }
  });

  const resLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: ADMIN_EMAIL, password: PASSWORD });

  return {
    id: adminId,
    token: resLogin.body.data.accessToken
  };
}

async function createTestOrder(customerId, voucherId) {
  const order = await prisma.order.create({
    data: {
      userId: customerId,
      status: "COMPLETED",
      totalAmount: 90
    }
  });

  await prisma.orderItem.create({
    data: {
      orderId: order.id,
      voucherId: voucherId,
      qty: 1,
      unitPrice: 90
    }
  });

  await prisma.payment.create({
    data: {
      orderId: order.id,
      method: "MOMO",
      status: "PAID",
      amount: 90
    }
  });

  return order;
}

async function createTestAuditLog(actorId, targetId) {
  return await prisma.auditLog.create({
    data: {
      actorId: actorId,
      action: "ADMIN_APPROVE_VOUCHER",
      targetType: "Voucher",
      targetId: targetId
    }
  });
}

describe("Admin Orders & Audit Logs API Tests", () => {
  let customerId = "";
  let customerToken = "";
  let adminId = "";
  let adminToken = "";
  let createdOrderId = "";
  let createdVoucherId = "";

  beforeAll(async () => {
    await cleanupAll();

    const customer = await createTestCustomer();
    customerId = customer.id;
    customerToken = customer.token;

    const admin = await createTestAdmin();
    adminId = admin.id;
    adminToken = admin.token;

    const partnerUser = await prisma.user.create({
      data: {
        email: PARTNER_EMAIL,
        passwordHash: "dummyhash",
        fullName: "Partner",
        role: "PARTNER",
        phone: "0900000303"
      }
    });

    const category = await prisma.category.create({
      data: { name: "Test Category", slug: "test-category" }
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: "Test Partner",
        taxCode: "TAX123456",
        representativeName: "Rep",
        status: "APPROVED"
      }
    });

    const voucher = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: "Test Voucher Orders",
        originalPrice: 100,
        salePrice: 90,
        totalQty: 10,
        soldQty: 1,
        status: "APPROVED"
      }
    });
    createdVoucherId = voucher.id;

    const order = await createTestOrder(customerId, voucher.id);
    createdOrderId = order.id;

    await prisma.voucherCode.create({
      data: {
        code: "ADMIN-CANCEL-ISSUED",
        orderId: order.id,
        voucherId: voucher.id,
        ownerId: customerId,
        status: "ISSUED",
      },
    });

    await createTestAuditLog(adminId, voucher.id);
  });

  afterAll(async () => {
    await cleanupAll();
    await prisma.$disconnect();
  });

  describe("GET /api/admin/orders", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get("/api/admin/orders");
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("200 trả về list orders có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/orders")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.orders)).toBe(true);
      expect(res.body.data.pagination).toHaveProperty("total");
      expect(res.body.data.pagination).toHaveProperty("page");
      expect(res.body.data.pagination).toHaveProperty("limit");
      expect(res.body.data.pagination).toHaveProperty("totalPages");
      expect(res.body.data.pagination.total).toBeGreaterThanOrEqual(1);
    });

    it("200 filter theo status=COMPLETED", async () => {
      const res = await request(app)
        .get("/api/admin/orders?status=COMPLETED")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.orders.forEach(order => {
        expect(order.status).toBe("COMPLETED");
      });
    });

    it("200 search theo orderId", async () => {
      const res = await request(app)
        .get(`/api/admin/orders?search=${createdOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.orders.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/admin/orders/:id", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get(`/api/admin/orders/${createdOrderId}`);
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/${createdOrderId}`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("404 nếu order không tồn tại", async () => {
      const fakeId = "12345678-1234-1234-1234-123456789012";
      const res = await request(app)
        .get(`/api/admin/orders/${fakeId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(404);
    });

    it("200 trả về order detail đầy đủ", async () => {
      const res = await request(app)
        .get(`/api/admin/orders/${createdOrderId}`)
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data).toHaveProperty("id", createdOrderId);
      expect(res.body.data).toHaveProperty("items");
      expect(res.body.data).toHaveProperty("user");
      expect(res.body.data).toHaveProperty("payment");
      expect(Array.isArray(res.body.data.items)).toBe(true);
      expect(res.body.data.items.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe("GET /api/admin/audit-logs", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get("/api/admin/audit-logs");
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("200 trả về list audit logs có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.logs)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
    });

    it("200 filter theo action=ADMIN_APPROVE_VOUCHER", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs?action=ADMIN_APPROVE_VOUCHER")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      res.body.data.logs.forEach(log => {
        expect(log.action).toBe("ADMIN_APPROVE_VOUCHER");
      });
      expect(res.body.data.logs.length).toBeGreaterThanOrEqual(1);
    });

    it("200 mỗi log có actor info", async () => {
      const res = await request(app)
        .get("/api/admin/audit-logs?action=ADMIN_APPROVE_VOUCHER")
        .set("Authorization", `Bearer ${adminToken}`);
      expect(res.status).toBe(200);
      expect(res.body.data.logs[0]).toHaveProperty("actor");
      expect(res.body.data.logs[0].actor).toHaveProperty("email");
    });
  });

  describe("POST /api/admin/orders/:id/cancel", () => {
    it("cancels codes, refunds payment, restores stock and writes audit evidence", async () => {
      const res = await request(app)
        .post(`/api/admin/orders/${createdOrderId}/cancel`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Customer-approved cancellation" });
      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe("CANCELLED");
      expect(res.body.data.payment.status).toBe("REFUNDED");
      expect(res.body.data.voucherCodes[0].status).toBe("CANCELLED");

      const voucher = await prisma.voucher.findUnique({ where: { id: createdVoucherId } });
      expect(voucher.soldQty).toBe(0);
      const log = await prisma.auditLog.findFirst({ where: { action: "ADMIN_CANCEL_ORDER", targetId: createdOrderId } });
      expect(log).toBeTruthy();
    });
  });
});
