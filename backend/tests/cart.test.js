import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Cart API Tests", () => {
  const userAEmail = "cart_user_a@test.com";
  const userBEmail = "cart_user_b@test.com";
  const partnerEmail = "cart_partner@test.com";
  const password = "Password123!";

  let tokenA = "";
  let tokenB = "";
  let partnerToken = "";

  let userIdA = "";
  let userIdB = "";

  let voucherOnSale = null;
  let voucherDraft = null;
  let voucherLimited = null;

  beforeAll(async () => {
    // Cleanup existing test data if any
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          user: {
            email: { in: [userAEmail, userBEmail] }
          }
        }
      }
    });

    await prisma.cart.deleteMany({
      where: {
        user: {
          email: { in: [userAEmail, userBEmail] }
        }
      }
    });

    await prisma.voucher.deleteMany({
      where: {
        partner: {
          user: {
            email: partnerEmail
          }
        }
      }
    });

    await prisma.partner.deleteMany({
      where: {
        user: {
          email: partnerEmail
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [userAEmail, userBEmail, partnerEmail] }
      }
    });

    // Create categories if not exist
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Test Cat", slug: "test-cat", icon: "🍜" }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User A (Customer)
    const userA = await prisma.user.create({
      data: {
        email: userAEmail,
        fullName: "User A",
        passwordHash: hashedPassword,
        role: "CUSTOMER"
      }
    });
    userIdA = userA.id;

    // Create User B (Customer)
    const userB = await prisma.user.create({
      data: {
        email: userBEmail,
        fullName: "User B",
        passwordHash: hashedPassword,
        role: "CUSTOMER"
      }
    });
    userIdB = userB.id;

    // Create Partner User
    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        fullName: "Partner User",
        passwordHash: hashedPassword,
        role: "PARTNER"
      }
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: "Test Cart Partner",
        taxCode: "TAX123456",
        representativeName: "Rep",
        status: "APPROVED"
      }
    });

    // Create test vouchers
    voucherOnSale = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: "Voucher On Sale 100k",
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 10,
        soldQty: 2,
        status: "ON_SALE"
      }
    });

    voucherDraft = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: "Voucher Draft",
        originalPrice: 50000,
        salePrice: 40000,
        totalQty: 100,
        soldQty: 0,
        status: "DRAFT"
      }
    });

    voucherLimited = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: "Voucher Limited",
        originalPrice: 150000,
        salePrice: 120000,
        totalQty: 5,
        soldQty: 4, // 1 left
        status: "ON_SALE"
      }
    });

    // Login to get tokens
    const loginResA = await request(app).post("/api/auth/login").send({ email: userAEmail, password });
    tokenA = loginResA.body.data.accessToken;

    const loginResB = await request(app).post("/api/auth/login").send({ email: userBEmail, password });
    tokenB = loginResB.body.data.accessToken;

    const loginResP = await request(app).post("/api/auth/login").send({ email: partnerEmail, password });
    partnerToken = loginResP.body.data.accessToken;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.cartItem.deleteMany({
      where: {
        cart: {
          user: {
            email: { in: [userAEmail, userBEmail] }
          }
        }
      }
    });

    await prisma.cart.deleteMany({
      where: {
        user: {
          email: { in: [userAEmail, userBEmail] }
        }
      }
    });

    await prisma.voucher.deleteMany({
      where: {
        partner: {
          user: {
            email: partnerEmail
          }
        }
      }
    });

    await prisma.partner.deleteMany({
      where: {
        user: {
          email: partnerEmail
        }
      }
    });

    await prisma.user.deleteMany({
      where: {
        email: { in: [userAEmail, userBEmail, partnerEmail] }
      }
    });

    await prisma.$disconnect();
  });

  describe("Auth & Role Validation", () => {
    it("nên chặn truy cập nếu không gửi token", async () => {
      const res = await request(app).get("/api/customer/cart");
      expect(res.status).toBe(401);
    });

    it("nên chặn truy cập (403) nếu role là PARTNER", async () => {
      const res = await request(app)
        .get("/api/customer/cart")
        .set("Authorization", `Bearer ${partnerToken}`);
      expect(res.status).toBe(403);
    });
  });

  describe("GET /api/customer/cart", () => {
    it("nên trả về giỏ hàng trống nếu chưa có item", async () => {
      const res = await request(app)
        .get("/api/customer/cart")
        .set("Authorization", `Bearer ${tokenA}`);
      
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.cartTotal.totalUniqueItems).toBe(0);
      expect(res.body.data.cartTotal.totalAmount).toBe(0);
    });
  });

  describe("POST /api/customer/cart/items (addItem)", () => {
    it("nên báo lỗi nếu thêm voucher ở trạng thái DRAFT", async () => {
      const res = await request(app)
        .post("/api/customer/cart/items")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ voucherId: voucherDraft.id, qty: 1 });
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("không ở trạng thái đang bán");
    });

    it("nên báo lỗi nếu số lượng thêm lớn hơn số lượng còn lại", async () => {
      const res = await request(app)
        .post("/api/customer/cart/items")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ voucherId: voucherLimited.id, qty: 2 }); // remaining is 1 (5 - 4)
      
      expect(res.status).toBe(400);
      expect(res.body.message).toContain("Số lượng voucher còn lại không đủ");
    });

    it("nên thêm thành công voucher ON_SALE vào giỏ hàng", async () => {
      const res = await request(app)
        .post("/api/customer/cart/items")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ voucherId: voucherOnSale.id, qty: 2 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1);
      expect(res.body.data.items[0].voucherId).toBe(voucherOnSale.id);
      expect(res.body.data.items[0].qty).toBe(2);

      // Verify cartTotal
      // original: 100k * 2 = 200k
      // sale: 80k * 2 = 160k
      // savings: 40k
      expect(res.body.data.cartTotal.totalAmount).toBe(160000);
      expect(res.body.data.cartTotal.totalOriginalAmount).toBe(200000);
      expect(res.body.data.cartTotal.totalSavings).toBe(40000);
    });

    it("nên cộng dồn qty khi thêm trùng voucherId và không sinh thêm row", async () => {
      const res = await request(app)
        .post("/api/customer/cart/items")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ voucherId: voucherOnSale.id, qty: 1 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(1); // Still 1 unique row
      expect(res.body.data.items[0].qty).toBe(3);  // 2 + 1 = 3

      // total: 3 * 80k = 240k
      expect(res.body.data.cartTotal.totalAmount).toBe(240000);
    });
  });

  describe("PATCH /api/customer/cart/items/:id (updateQty) & Access Guard", () => {
    let cartItemId = "";

    beforeAll(async () => {
      const res = await request(app)
        .get("/api/customer/cart")
        .set("Authorization", `Bearer ${tokenA}`);
      cartItemId = res.body.data.items[0].id;
    });

    it("nên chặn user B cập nhật cart item của user A (403)", async () => {
      const res = await request(app)
        .patch(`/api/customer/cart/items/${cartItemId}`)
        .set("Authorization", `Bearer ${tokenB}`)
        .send({ qty: 5 });
      
      expect(res.status).toBe(403);
    });

    it("nên cho phép user A cập nhật số lượng của chính mình", async () => {
      const res = await request(app)
        .patch(`/api/customer/cart/items/${cartItemId}`)
        .set("Authorization", `Bearer ${tokenA}`)
        .send({ qty: 5 });
      
      expect(res.status).toBe(200);
      expect(res.body.data.items[0].qty).toBe(5);
      expect(res.body.data.cartTotal.totalAmount).toBe(400000); // 5 * 80k = 400k
    });
  });

  describe("DELETE /api/customer/cart/items/:id (removeItem) & Access Guard", () => {
    let cartItemId = "";

    beforeAll(async () => {
      const res = await request(app)
        .get("/api/customer/cart")
        .set("Authorization", `Bearer ${tokenA}`);
      cartItemId = res.body.data.items[0].id;
    });

    it("nên chặn user B xóa cart item của user A (403)", async () => {
      const res = await request(app)
        .delete(`/api/customer/cart/items/${cartItemId}`)
        .set("Authorization", `Bearer ${tokenB}`);
      
      expect(res.status).toBe(403);
    });

    it("nên cho phép user A xóa cart item của chính mình", async () => {
      const res = await request(app)
        .delete(`/api/customer/cart/items/${cartItemId}`)
        .set("Authorization", `Bearer ${tokenA}`);
      
      expect(res.status).toBe(200);
      expect(res.body.data.items).toHaveLength(0);
      expect(res.body.data.cartTotal.totalAmount).toBe(0);
    });
  });
});
