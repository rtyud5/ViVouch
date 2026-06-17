import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { env } from "../src/config/env.js";
import { prisma } from "../src/config/prisma.js";

describe("Admin Management API Tests", () => {
  const adminEmail = "test_admin_mgmt@example.com";
  const customer1Email = "test_customer1_mgmt@example.com";
  const customer2Email = "test_customer2_mgmt@example.com";
  const password = "Password123!";

  let adminToken = "";
  let customerToken = "";
  let adminId = "";
  let userId_customer = "";
  
  let partnerId_pending = "";
  let partnerId_approved = "";
  let voucherId_pending = "";
  
  let myCategoryId = "";

  const PENDING_COMPANY = "PENDING_COMPANY_TEST_123";
  const APPROVED_COMPANY = "APPROVED_COMPANY_TEST_123";

  beforeAll(async () => {
    // 0. Cleanup existing test data
    await prisma.auditLog.deleteMany();
    await prisma.voucher.deleteMany({ where: { OR: [{ title: "Test Voucher Pending" }, { title: "Test Voucher Approved" }] } });
    await prisma.partner.deleteMany({ where: { OR: [{ businessName: PENDING_COMPANY }, { businessName: APPROVED_COMPANY }] } });
    await prisma.category.deleteMany({ where: { name: "Test Management Category" } });
    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, customer1Email, customer2Email] }
      }
    });

    // 1. Tạo 1 admin user -> nâng role ADMIN -> login lấy adminToken
    const resAdminReg = await request(app)
      .post("/api/auth/register")
      .send({ email: adminEmail, password, fullName: "Admin Mgmt", phone: "0910000001" });
    adminId = resAdminReg.body.data.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { role: "ADMIN" }
    });

    const resAdminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    adminToken = resAdminLogin.body.data.accessToken;

    // 2. Tạo 2 customer users -> login lấy customerToken (dùng cho 403)
    const resCust1Reg = await request(app)
      .post("/api/auth/register")
      .send({ email: customer1Email, password, fullName: "Customer Mgmt 1", phone: "0910000002" });
    userId_customer = resCust1Reg.body.data.id;

    await request(app)
      .post("/api/auth/register")
      .send({ email: customer2Email, password, fullName: "Customer Mgmt 2", phone: "0910000003" });

    const resCustomerLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: customer1Email, password });
    customerToken = resCustomerLogin.body.data.accessToken;

    // 3. Tạo trực tiếp qua prisma:
    // Category
    const category = await prisma.category.create({
      data: { name: "Test Management Category", slug: "test-mgmt-category" }
    });
    myCategoryId = category.id;

    // Partners
    const partnerPending = await prisma.partner.create({
      data: {
        userId: userId_customer, // Assigning to customer1 for mapping
        businessName: PENDING_COMPANY,
        taxCode: "TAX123_PENDING",
        representativeName: "Pending Rep",
        status: "PENDING"
      }
    });
    partnerId_pending = partnerPending.id;

    const partnerApproved = await prisma.partner.create({
      data: {
        userId: resAdminReg.body.data.id, // Just hook to some user
        businessName: APPROVED_COMPANY,
        taxCode: "TAX123_APPROVED",
        representativeName: "Approved Rep",
        status: "APPROVED"
      }
    });
    partnerId_approved = partnerApproved.id;

    // Vouchers
    const voucherPending = await prisma.voucher.create({
      data: {
        partnerId: partnerId_approved, // Vouchers belong to an approved partner typically
        categoryId: category.id,
        title: "Test Voucher Pending",
        description: "Test Pending",
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 50,
        status: "PENDING_APPROVAL",
        saleStart: new Date(),
        saleEnd: new Date(Date.now() + 86400000)
      }
    });
    voucherId_pending = voucherPending.id;

    await prisma.voucher.create({
      data: {
        partnerId: partnerId_approved,
        categoryId: category.id,
        title: "Test Voucher Approved",
        description: "Test Approved",
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 50,
        status: "APPROVED",
        saleStart: new Date(),
        saleEnd: new Date(Date.now() + 86400000)
      }
    });
  });

  afterAll(async () => {
    // Xóa theo thứ tự: AuditLog -> Voucher -> Partner -> Category -> User
    await prisma.auditLog.deleteMany();
    await prisma.voucher.deleteMany({ where: { OR: [{ title: "Test Voucher Pending" }, { title: "Test Voucher Approved" }] } });
    await prisma.partner.deleteMany({ where: { OR: [{ businessName: PENDING_COMPANY }, { businessName: APPROVED_COMPANY }] } });
    await prisma.category.deleteMany({ where: { id: myCategoryId } });
    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, customer1Email, customer2Email] } }
    });
    await prisma.$disconnect();
  });

  describe("GET /api/admin/partners", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get("/api/admin/partners");
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/partners")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("200 trả về list partners có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/partners")
        .set("Authorization", `Bearer ${adminToken}`);
      
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
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.partners.length).toBeGreaterThanOrEqual(1);
      res.body.data.partners.forEach(p => {
        expect(p.status).toBe("PENDING");
      });
    });

    it("200 search theo tên công ty", async () => {
      const res = await request(app)
        .get(`/api/admin/partners?search=${PENDING_COMPANY}`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.partners.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.partners.some(p => p.businessName === PENDING_COMPANY);
      expect(found).toBe(true);
    });
  });


  describe("GET /api/admin/vouchers", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get("/api/admin/vouchers");
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/vouchers")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("200 trả về list vouchers có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/vouchers")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.vouchers)).toBe(true);
      expect(res.body.data.vouchers.length).toBeGreaterThanOrEqual(2);
      expect(res.body.data.pagination).toHaveProperty("total");
    });

    it("200 filter theo status=PENDING_APPROVAL", async () => {
      const res = await request(app)
        .get("/api/admin/vouchers?status=PENDING_APPROVAL")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.vouchers.length).toBeGreaterThanOrEqual(1);
      res.body.data.vouchers.forEach(v => {
        expect(v.status).toBe("PENDING_APPROVAL");
      });
    });
  });


  describe("GET /api/admin/users", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).get("/api/admin/users");
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("200 trả về list users có pagination", async () => {
      const res = await request(app)
        .get("/api/admin/users")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data.users)).toBe(true);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(3);
      expect(res.body.data.pagination).toHaveProperty("total");
    });

    it("200 filter theo role=CUSTOMER", async () => {
      const res = await request(app)
        .get("/api/admin/users?role=CUSTOMER")
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
      res.body.data.users.forEach(u => {
        expect(u.role).toBe("CUSTOMER");
      });
    });

    it("200 search theo email", async () => {
      const res = await request(app)
        .get(`/api/admin/users?search=${customer1Email}`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.users.length).toBeGreaterThanOrEqual(1);
      const found = res.body.data.users.some(u => u.email === customer1Email);
      expect(found).toBe(true);
    });
  });


  describe("POST /api/admin/users/:id/toggle-lock", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app).post(`/api/admin/users/${userId_customer}/toggle-lock`);
      expect(res.status).toBe(401);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${userId_customer}/toggle-lock`)
        .set("Authorization", `Bearer ${customerToken}`);
      expect(res.status).toBe(403);
    });

    it("400 nếu admin tự lock chính mình", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${adminId}/toggle-lock`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Cannot toggle your own lock status");
    });

    it("200 lock user thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${userId_customer}/toggle-lock`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.isLocked).toBe(true);

      // Kiểm tra DB
      const userInDb = await prisma.user.findUnique({ where: { id: userId_customer } });
      expect(userInDb.status).toBe("LOCKED");

      const log = await prisma.auditLog.findFirst({
        where: { action: "ADMIN_LOCK_USER", targetId: userId_customer }
      });
      expect(log).toBeDefined();
      expect(log.actorId).toBe(adminId);
    });

    it("200 unlock user thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/users/${userId_customer}/toggle-lock`)
        .set("Authorization", `Bearer ${adminToken}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.isLocked).toBe(false);

      // Kiểm tra DB
      const userInDb = await prisma.user.findUnique({ where: { id: userId_customer } });
      expect(userInDb.status).toBe("ACTIVE");

      const log = await prisma.auditLog.findFirst({
        where: { action: "ADMIN_UNLOCK_USER", targetId: userId_customer },
        orderBy: { createdAt: 'desc' }
      });
      expect(log).toBeDefined();
      expect(log.actorId).toBe(adminId);
    });
  });
});
