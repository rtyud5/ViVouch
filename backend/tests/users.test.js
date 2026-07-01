import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";

describe("Users /me API Tests", () => {
  const customerEmail = "users_me_customer@example.com";
  const password = "Password123!";
  const newPassword = "NewPassword456!";

  let customerToken = "";
  let customerId = "";

  beforeAll(async () => {
    await prisma.user.deleteMany({
      where: { email: customerEmail }
    });

    const registerRes = await request(app)
      .post("/api/auth/register")
      .send({
        email: customerEmail,
        password,
        fullName: "Users Me Customer",
        phone: "0900000099"
      });

    customerId = registerRes.body.data.id;

    const loginRes = await request(app)
      .post("/api/auth/login")
      .send({ email: customerEmail, password });

    customerToken = loginRes.body.data.accessToken;
  });

  afterAll(async () => {
    await prisma.user.deleteMany({
      where: { email: customerEmail }
    });
  });

  describe("GET /api/users/me", () => {
    it("returns 401 without token", async () => {
      const res = await request(app).get("/api/users/me");
      expect(res.status).toBe(401);
    });

    it("returns current user without passwordHash", async () => {
      const res = await request(app)
        .get("/api/users/me")
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.email).toBe(customerEmail);
      expect(res.body.data.fullName).toBe("Users Me Customer");
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });
  });

  describe("PUT /api/users/me", () => {
    it("updates fullName and phone", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          fullName: "Users Me Updated",
          phone: "0900000100"
        });

      expect(res.status).toBe(200);
      expect(res.body.data.fullName).toBe("Users Me Updated");
      expect(res.body.data.phone).toBe("0900000100");
      expect(res.body.data).not.toHaveProperty("passwordHash");
    });

    it("rejects empty fullName", async () => {
      const res = await request(app)
        .put("/api/users/me")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          fullName: "   ",
          phone: "0900000100"
        });

      expect(res.status).toBe(400);
    });
  });

  describe("PUT /api/users/me/password", () => {
    it("rejects wrong current password with clear message", async () => {
      const res = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          currentPassword: "WrongPassword!",
          newPassword: "AnotherPassword789!"
        });

      expect(res.status).toBe(400);
      expect(res.body.message).toBe("Mật khẩu hiện tại không đúng");
    });

    it("changes password with correct current password", async () => {
      const res = await request(app)
        .put("/api/users/me/password")
        .set("Authorization", `Bearer ${customerToken}`)
        .send({
          currentPassword: password,
          newPassword
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const loginOld = await request(app)
        .post("/api/auth/login")
        .send({ email: customerEmail, password });

      expect(loginOld.status).toBe(401);

      const loginNew = await request(app)
        .post("/api/auth/login")
        .send({ email: customerEmail, password: newPassword });

      expect(loginNew.status).toBe(200);
    });
  });
});
