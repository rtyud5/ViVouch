import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("GET /api/admin/dashboard", () => {
  const customer1Email = "dash_customer1@example.com";
  const customer2Email = "dash_customer2@example.com";
  const adminEmail = "dash_admin@example.com";
  const testEmails = [customer1Email, customer2Email, adminEmail];
  const password = "Password123!";

  let customerToken = "";
  let adminToken = "";
  let customer1Id = "";
  let customer2Id = "";
  let orderId = "";
  let partnerId = "";

  async function cleanupByEmails(emails) {
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true },
    });
    const userIds = users.map((u) => u.id);
    if (userIds.length === 0) return;

    const orders = await prisma.order.findMany({
      where: { userId: { in: userIds } },
      select: { id: true },
    });
    const orderIds = orders.map((o) => o.id);

    if (orderIds.length > 0) {
      await prisma.payment.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.orderItem.deleteMany({ where: { orderId: { in: orderIds } } });
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } });
    }

    await prisma.partner.deleteMany({ where: { userId: { in: userIds } } });
    await prisma.user.deleteMany({ where: { email: { in: emails } } });
  }

  beforeAll(async () => {
    await cleanupByEmails(testEmails);

    const resCustomer1Reg = await request(app)
      .post("/api/auth/register")
      .send({
        email: customer1Email,
        password,
        fullName: "Dashboard Customer 1",
        phone: "0900000201",
      });
    customer1Id = resCustomer1Reg.body.data.id;

    const resCustomer2Reg = await request(app)
      .post("/api/auth/register")
      .send({
        email: customer2Email,
        password,
        fullName: "Dashboard Customer 2",
        phone: "0900000202",
      });
    customer2Id = resCustomer2Reg.body.data.id;

    const resCustomerLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: customer1Email, password });
    customerToken = resCustomerLogin.body.data.accessToken;

    const resAdminReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: adminEmail,
        password,
        fullName: "Dashboard Admin",
        phone: "0900000203",
      });
    const adminId = resAdminReg.body.data.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { role: "ADMIN" },
    });

    const resAdminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    adminToken = resAdminLogin.body.data.accessToken;

    const partner = await prisma.partner.create({
      data: {
        userId: customer1Id,
        businessName: "Dashboard Test Partner",
        taxCode: "8880000001",
        representativeName: "Nguyễn Dashboard",
        status: "APPROVED",
      },
    });
    partnerId = partner.id;

    const now = new Date();
    const order = await prisma.order.create({
      data: {
        userId: customer2Id,
        status: "COMPLETED",
        totalAmount: 500000,
        createdAt: now,
      },
    });
    orderId = order.id;

    await prisma.payment.create({
      data: {
        orderId,
        method: "WALLET",
        status: "PAID",
        amount: 500000,
        createdAt: now,
      },
    });
  });

  afterAll(async () => {
    await prisma.payment.deleteMany({ where: { orderId } });
    await prisma.order.deleteMany({ where: { id: orderId } });
    await prisma.partner.deleteMany({ where: { id: partnerId } });
    await prisma.user.deleteMany({ where: { email: { in: testEmails } } });
    await prisma.$disconnect();
  });

  it("401 nếu không có token", async () => {
    const res = await request(app).get("/api/admin/dashboard");

    expect(res.status).toBe(401);
    expect(res.body.success).toBe(false);
  });

  it("403 nếu token không phải ADMIN", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${customerToken}`);

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
  });

  it("200 trả về đủ 4 trường stats", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveProperty("totalUsers");
    expect(res.body.data).toHaveProperty("activePartners");
    expect(res.body.data).toHaveProperty("revenueThisMonth");
    expect(res.body.data).toHaveProperty("ordersToday");
    expect(typeof res.body.data.totalUsers).toBe("number");
    expect(typeof res.body.data.activePartners).toBe("number");
    expect(typeof res.body.data.revenueThisMonth).toBe("number");
    expect(typeof res.body.data.ordersToday).toBe("number");
  });

  it("200 totalUsers chỉ đếm CUSTOMER, không đếm ADMIN", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalUsers).toBeGreaterThanOrEqual(2);

    const customerCount = await prisma.user.count({ where: { role: "CUSTOMER" } });
    expect(res.body.data.totalUsers).toBe(customerCount);

    const adminCount = await prisma.user.count({ where: { role: "ADMIN" } });
    expect(adminCount).toBeGreaterThanOrEqual(1);
    expect(res.body.data.totalUsers).toBeLessThan(customerCount + adminCount);
  });

  it("200 activePartners đếm đúng status APPROVED", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.activePartners).toBeGreaterThanOrEqual(1);
  });

  it("200 revenueThisMonth >= 500000", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.revenueThisMonth).toBeGreaterThanOrEqual(500000);
  });

  it("200 ordersToday >= 1", async () => {
    const res = await request(app)
      .get("/api/admin/dashboard")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.ordersToday).toBeGreaterThanOrEqual(1);
  });
});
