import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

// ───────── Shared state & Constants ─────────
const sharedState = {
  adminToken: "",
  customerToken: "",
  adminId: "",
  userId_customer: "",
  partnerId_pending: "",
  partnerId_approved: "",
  voucherId_pending: "",
  myCategoryId: "",
};

const ADMIN_EMAIL = "test_admin_mgmt@example.com";
const CUSTOMER1_EMAIL = "test_customer1_mgmt@example.com";
const CUSTOMER2_EMAIL = "test_customer2_mgmt@example.com";
const PASSWORD = "Password123!";
const PENDING_COMPANY = "PENDING_COMPANY_TEST_123";
const APPROVED_COMPANY = "APPROVED_COMPANY_TEST_123";
const TEST_EMAILS = [ADMIN_EMAIL, CUSTOMER1_EMAIL, CUSTOMER2_EMAIL];

// ───────── Helpers ─────────
async function cleanupAll() {
  if (process.env.NODE_ENV !== "test") {
    throw new Error("Not in test env");
  }

  await prisma.auditLog.deleteMany();
  await prisma.voucher.deleteMany({
    where: { OR: [{ title: "Test Voucher Pending" }, { title: "Test Voucher Approved" }] },
  });
  await prisma.partner.deleteMany({
    where: { OR: [{ businessName: PENDING_COMPANY }, { businessName: APPROVED_COMPANY }] },
  });
  if (sharedState.myCategoryId) {
    await prisma.category.deleteMany({ where: { id: sharedState.myCategoryId } });
  }
  await prisma.user.deleteMany({ where: { email: { in: TEST_EMAILS } } });
}

async function createTestUsers() {
  const resAdminReg = await request(app)
    .post("/api/auth/register")
    .send({ email: ADMIN_EMAIL, password: PASSWORD, fullName: "Admin Mgmt", phone: "0910000001" });
  sharedState.adminId = resAdminReg.body.data.id;

  await prisma.user.update({
    where: { id: sharedState.adminId },
    data: { role: "ADMIN" },
  });

  const resAdminLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: ADMIN_EMAIL, password: PASSWORD });
  sharedState.adminToken = resAdminLogin.body.data.accessToken;

  const resCust1Reg = await request(app)
    .post("/api/auth/register")
    .send({ email: CUSTOMER1_EMAIL, password: PASSWORD, fullName: "Customer Mgmt 1", phone: "0910000002" });
  sharedState.userId_customer = resCust1Reg.body.data.id;

  await request(app)
    .post("/api/auth/register")
    .send({ email: CUSTOMER2_EMAIL, password: PASSWORD, fullName: "Customer Mgmt 2", phone: "0910000003" });

  const resCustomerLogin = await request(app)
    .post("/api/auth/login")
    .send({ email: CUSTOMER1_EMAIL, password: PASSWORD });
  sharedState.customerToken = resCustomerLogin.body.data.accessToken;
}

async function createTestPartners() {
  const partnerPending = await prisma.partner.create({
    data: {
      userId: sharedState.userId_customer,
      businessName: PENDING_COMPANY,
      taxCode: "TAX123_PENDING",
      representativeName: "Pending Rep",
      status: "PENDING",
    },
  });
  sharedState.partnerId_pending = partnerPending.id;

  const partnerApproved = await prisma.partner.create({
    data: {
      userId: sharedState.adminId,
      businessName: APPROVED_COMPANY,
      taxCode: "TAX123_APPROVED",
      representativeName: "Approved Rep",
      status: "APPROVED",
    },
  });
  sharedState.partnerId_approved = partnerApproved.id;
}

async function createTestVouchers(categoryId) {
  const voucherPending = await prisma.voucher.create({
    data: {
      partnerId: sharedState.partnerId_approved,
      categoryId,
      title: "Test Voucher Pending",
      description: "Test Pending",
      originalPrice: 100000,
      salePrice: 80000,
      totalQty: 50,
      status: "PENDING_APPROVAL",
      saleStart: new Date(),
      saleEnd: new Date(Date.now() + 86400000),
    },
  });
  sharedState.voucherId_pending = voucherPending.id;

  await prisma.voucher.create({
    data: {
      partnerId: sharedState.partnerId_approved,
      categoryId,
      title: "Test Voucher Approved",
      description: "Test Approved",
      originalPrice: 100000,
      salePrice: 80000,
      totalQty: 50,
      status: "APPROVED",
      saleStart: new Date(),
      saleEnd: new Date(Date.now() + 86400000),
    },
  });
}

function testAuthGuard(method, urlFn) {
  it("401 nếu không có token", async () => {
    const url = typeof urlFn === "function" ? urlFn() : urlFn;
    const res = await request(app)[method](url);
    expect(res.status).toBe(401);
  });

  it("403 nếu không phải ADMIN", async () => {
    const url = typeof urlFn === "function" ? urlFn() : urlFn;
    const res = await request(app)
      [method](url)
      .set("Authorization", `Bearer ${sharedState.customerToken}`);
    expect(res.status).toBe(403);
  });
}

// ═════════ TEST SUITE ═════════
describe("Admin Management API Tests", () => {
  beforeAll(async () => {
    await cleanupAll();
    await createTestUsers();

    const category = await prisma.category.create({
      data: { name: "Test Management Category", slug: "test-mgmt-category" },
    });
    sharedState.myCategoryId = category.id;

    await createTestPartners();
    await createTestVouchers(category.id);
  });

  afterAll(async () => {
    await cleanupAll();
    await prisma.$disconnect();
  });

  // ── Partners ──
  describe("GET /api/admin/partners", () => {
    testAuthGuard("get", "/api/admin/partners");

    it("200 trả về list partners có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/partners")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.partners)).toBe(true);
      expect(res.body.data.partners.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toHaveProperty("total");
      expect(res.body.data.pagination).toHaveProperty("page");
      expect(res.body.data.pagination).toHaveProperty("limit");
      expect(res.body.data.pagination).toHaveProperty("totalPages");
    });

    it("200 filter theo status=PENDING chỉ trả về PENDING", async () => {
      const res = await request(app)
        .get("/api/admin/partners?status=PENDING")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.partners.length).toBeGreaterThanOrEqual(1);
      res.body.data.partners.forEach((p) => {
        expect(p.status).toBe("PENDING");
      });
    });

    it("200 search theo tên công ty", async () => {
      const res = await request(app)
        .get(`/api/admin/partners?search=${PENDING_COMPANY}`)
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.partners.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.partners.some((p) => p.businessName === PENDING_COMPANY);
      expect(found).toBe(true);
    });
  });

  // ── Vouchers ──
  describe("GET /api/admin/vouchers", () => {
    testAuthGuard("get", "/api/admin/vouchers");

    it("200 trả về list vouchers có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/vouchers")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.vouchers)).toBe(true);
      expect(res.body.data.vouchers.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toHaveProperty("total");
    });

    it("200 filter theo status=PENDING_APPROVAL", async () => {
      const res = await request(app)
        .get("/api/admin/vouchers?status=PENDING_APPROVAL")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.vouchers.length).toBeGreaterThanOrEqual(1);
      res.body.data.vouchers.forEach((v) => {
        expect(v.status).toBe("PENDING_APPROVAL");
      });
    });
  });

  // ── Users ──
  describe("GET /api/admin/users", () => {
    testAuthGuard("get", "/api/admin/users");

    it("200 trả về list users có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data.pagination).toHaveProperty("total");
    });

    it("200 filter theo role=CUSTOMER", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=CUSTOMER")
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
      res.body.data.users.forEach((u) => {
        expect(u.role).toBe("CUSTOMER");
      });
    });

    it("200 search theo email", async () => {
      const res = await request(app)
        .get(`/api/admin/users?search=${CUSTOMER1_EMAIL}`)
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.users.some((u) => u.email === CUSTOMER1_EMAIL);
      expect(found).toBe(true);
    });
  });

  // ── Toggle Lock ──
  describe("POST /api/admin/users/:id/toggle-lock", () => {
    testAuthGuard("post", () => `/api/admin/users/${sharedState.userId_customer}/toggle-lock`);

    it("400 nếu admin tự lock chính mình", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${sharedState.adminId}/toggle-lock`)
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Cannot toggle your own lock status");
    });

    it("200 lock user thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${sharedState.userId_customer}/toggle-lock`)
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isLocked).toBe(true);

      const userInDb = await prisma.user.findUnique({ where: { id: sharedState.userId_customer } });
      expect(userInDb.status).toBe("LOCKED");

      const log = await prisma.auditLog.findFirst({
        where: { action: "ADMIN_LOCK_USER", targetId: sharedState.userId_customer },
      });
      expect(log).toBeDefined();
      expect(log.actorId).toBe(sharedState.adminId);

      const blockedRes = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${sharedState.customerToken}`);
      expect(blockedRes.status).toBe(403);
      expect(blockedRes.body.code).toBe("ACCOUNT_LOCKED");
    });

    it("200 unlock user thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${sharedState.userId_customer}/toggle-lock`)
        .set("Authorization", `Bearer ${sharedState.adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isLocked).toBe(false);

      const userInDb = await prisma.user.findUnique({ where: { id: sharedState.userId_customer } });
      expect(userInDb.status).toBe("ACTIVE");

      const log = await prisma.auditLog.findFirst({
        where: { action: "ADMIN_UNLOCK_USER", targetId: sharedState.userId_customer },
        orderBy: { createdAt: "desc" },
      });
      expect(log).toBeDefined();
      expect(log.actorId).toBe(sharedState.adminId);
    });
  });
});
