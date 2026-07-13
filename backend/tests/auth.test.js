import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import jwt from "jsonwebtoken";
import { env } from "../src/config/env.js";

describe("Authentication & Authorization API Tests", () => {
  const customerEmail = "test_customer@example.com";
  const adminEmail = "test_admin@example.com";
  const password = "Password123!";

  let customerToken = "";
  let adminToken = "";

  beforeAll(async () => {
    // Dọn dẹp dữ liệu cũ nếu tồn tại
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [customerEmail, adminEmail]
        }
      }
    });

    // 1. Đăng ký Customer
    await request(app)
      .post("/api/auth/register")
      .send({
        email: customerEmail,
        password,
        fullName: "Test Customer",
        phone: "0900000001"
      });

    // Đăng nhập Customer để lấy Token
    const resCustomerLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: customerEmail,
        password
      });
    customerToken = resCustomerLogin.body.data.accessToken;

    // 2. Đăng ký Admin (đăng ký dạng customer trước rồi nâng cấp role)
    const resAdminReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: adminEmail,
        password,
        fullName: "Test Admin",
        phone: "0900000002"
      });
    
    const adminId = resAdminReg.body.data.id;
    
    // Nâng cấp role lên ADMIN trong DB
    await prisma.user.update({
      where: { id: adminId },
      data: { role: "ADMIN" }
    });

    // Đăng nhập Admin để lấy Token
    const resAdminLogin = await request(app)
      .post("/api/auth/login")
      .send({
        email: adminEmail,
        password
      });
    adminToken = resAdminLogin.body.data.accessToken;
  });

  afterAll(async () => {
    // Dọn dẹp dữ liệu test
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [customerEmail, adminEmail]
        }
      }
    });
    await prisma.$disconnect();
  });

  describe("GET /api/auth/me", () => {
    it("nên trả về 401 nếu không cung cấp token", async () => {
      const res = await request(app)
        .get("/api/auth/me");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("nên trả về 401 với thông điệp 'Token expired' nếu token đã hết hạn", async () => {
      // Tạo token hết hạn
      const expiredToken = jwt.sign(
        { userId: "some-user-id", role: "CUSTOMER" },
        env.JWT_ACCESS_SECRET,
        { expiresIn: "-10s" }
      );

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${expiredToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Token expired");
    });

    it("nên trả về 401 với thông điệp 'Invalid token' nếu token không hợp lệ", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", "Bearer invalid-token-string");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Invalid token");
    });

    it("nên trả về 200 và thông tin người dùng nếu token hợp lệ", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty("email", customerEmail);
      expect(res.body.data).toHaveProperty("role", "CUSTOMER");
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });
  });

  describe("Role Guard (requireRole)", () => {
    it("nên trả về 403 nếu user có role CUSTOMER cố gắng truy cập route của ADMIN", async () => {
      const res = await request(app)
        .get("/api/auth/admin-only")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Không có quyền truy cập");
    });

    it("nên trả về 200 nếu user có role ADMIN truy cập route của ADMIN", async () => {
      const res = await request(app)
        .get("/api/auth/admin-only")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Welcome Admin");
    });
  });

  describe("POST /api/auth/logout", () => {
    it("nên trả về 401 nếu không cung cấp token", async () => {
      const res = await request(app)
        .post("/api/auth/logout");

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("nên trả về 200 và thông điệp đăng xuất thành công nếu token hợp lệ", async () => {
      const res = await request(app)
        .post("/api/auth/logout")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toBe("Đăng xuất thành công");
    });
  });

  describe("POST /api/auth/register - Kiểm tra tính duy nhất của Email và Số điện thoại", () => {
    const duplicateEmail = "dup_email@example.com";
    const duplicatePhone = "0999999999";

    beforeAll(async () => {
      // Dọn dẹp trước khi chạy test này
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: { in: [duplicateEmail, "another_email@example.com"] } },
            { phone: { in: [duplicatePhone] } }
          ]
        }
      });

      // Tạo một user mẫu
      await request(app)
        .post("/api/auth/register")
        .send({
          email: duplicateEmail,
          password: "Password123!",
          fullName: "Original User",
          phone: duplicatePhone
        });
    });

    afterAll(async () => {
      // Dọn dẹp sau khi chạy test này
      await prisma.user.deleteMany({
        where: {
          OR: [
            { email: { in: [duplicateEmail, "another_email@example.com"] } },
            { phone: { in: [duplicatePhone] } }
          ]
        }
      });
    });

    it("nên trả về 409 nếu email đã tồn tại", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: duplicateEmail, // trùng email
          password: "Password123!",
          fullName: "Duplicate Email User",
          phone: "0999999991"
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Email đã tồn tại trong hệ thống");
    });

    it("nên trả về 409 nếu số điện thoại đã tồn tại", async () => {
      const res = await request(app)
        .post("/api/auth/register")
        .send({
          email: "another_email@example.com",
          password: "Password123!",
          fullName: "Duplicate Phone User",
          phone: duplicatePhone // trùng phone
        });

      expect(res.status).toBe(409);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Số điện thoại đã tồn tại trong hệ thống");
    });
  });

  describe("JWT payload shape validation (regression)", () => {
    it("401 INVALID_TOKEN khi token được ký hợp lệ nhưng payload là string", async () => {
      // jwt.sign with a string payload → decoded will be a string, not an object
      const stringPayloadToken = jwt.sign("just-a-string", env.JWT_ACCESS_SECRET);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${stringPayloadToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("401 INVALID_TOKEN khi token hợp lệ nhưng payload object không có userId", async () => {
      const noUserIdToken = jwt.sign({ role: "CUSTOMER", email: "x@x.com" }, env.JWT_ACCESS_SECRET);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${noUserIdToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("401 INVALID_TOKEN khi token có userId là chuỗi rỗng", async () => {
      const emptyUserIdToken = jwt.sign({ userId: "" }, env.JWT_ACCESS_SECRET);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${emptyUserIdToken}`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.code).toBe("INVALID_TOKEN");
    });

    it("200 khi token hoàn toàn hợp lệ — không ảnh hưởng sau khi thêm payload shape check", async () => {
      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it("403 ACCOUNT_LOCKED khi user bị lock — shape check không can thiệp", async () => {
      // Create a locked user
      const lockedEmail = "locked_jwt_test@example.com";
      await prisma.user.deleteMany({ where: { email: lockedEmail } });

      const lockedUser = await prisma.user.create({
        data: {
          email: lockedEmail,
          fullName: "Locked JWT User",
          passwordHash: "$2b$10$placeholder",
          role: "CUSTOMER",
          status: "LOCKED",
        },
      });

      const lockedToken = jwt.sign({ userId: lockedUser.id }, env.JWT_ACCESS_SECRET);

      const res = await request(app)
        .get("/api/auth/me")
        .set("Authorization", `Bearer ${lockedToken}`);

      expect(res.status).toBe(403);
      expect(res.body.code).toBe("ACCOUNT_LOCKED");

      await prisma.user.delete({ where: { id: lockedUser.id } });
    });
  });
});
