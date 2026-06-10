import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as cartService from "../src/modules/cart/cart.service.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";

describe("Cart Service Unit Tests", () => {
  const userAEmail = "service_user_a@test.com";
  const userBEmail = "service_user_b@test.com";
  const partnerEmail = "service_partner@test.com";
  const password = "Password123!";

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
        data: { name: "Test Cat Service", slug: "test-cat-service", icon: "🍜" }
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create User A (Customer)
    const userA = await prisma.user.create({
      data: {
        email: userAEmail,
        fullName: "Service User A",
        passwordHash: hashedPassword,
        role: "CUSTOMER"
      }
    });
    userIdA = userA.id;

    // Create User B (Customer)
    const userB = await prisma.user.create({
      data: {
        email: userBEmail,
        fullName: "Service User B",
        passwordHash: hashedPassword,
        role: "CUSTOMER"
      }
    });
    userIdB = userB.id;

    // Create Partner User
    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        fullName: "Service Partner User",
        passwordHash: hashedPassword,
        role: "PARTNER"
      }
    });

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: "Service Partner",
        taxCode: "TAX654321",
        representativeName: "Rep Service",
        status: "APPROVED"
      }
    });

    // Create test vouchers
    voucherOnSale = await prisma.voucher.create({
      data: {
        partnerId: partner.id,
        categoryId: category.id,
        title: "Service Voucher On Sale 100k",
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
        title: "Service Voucher Draft",
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
        title: "Service Voucher Limited",
        originalPrice: 150000,
        salePrice: 120000,
        totalQty: 5,
        soldQty: 4, // 1 left
        status: "ON_SALE"
      }
    });
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

  describe("getCart()", () => {
    it("nên trả về giỏ hàng trống ban đầu và khởi tạo giỏ hàng mới", async () => {
      const cart = await cartService.getCart(userIdA);
      
      expect(cart).toBeDefined();
      expect(cart.userId).toBe(userIdA);
      expect(cart.items).toHaveLength(0);
      expect(cart.cartTotal).toEqual({
        totalUniqueItems: 0,
        totalQty: 0,
        totalOriginalAmount: 0,
        totalAmount: 0,
        totalSavings: 0
      });
    });
  });

  describe("addItem()", () => {
    it("nên ném lỗi nếu voucher không tồn tại", async () => {
      await expect(
        cartService.addItem(userIdA, { voucherId: "00000000-0000-0000-0000-000000000000", qty: 1 })
      ).rejects.toThrow("Voucher không tồn tại");
    });

    it("nên ném lỗi nếu voucher không ON_SALE", async () => {
      await expect(
        cartService.addItem(userIdA, { voucherId: voucherDraft.id, qty: 1 })
      ).rejects.toThrow("Voucher không ở trạng thái đang bán");
    });

    it("nên ném lỗi nếu số lượng thêm vượt quá tồn kho khả dụng", async () => {
      await expect(
        cartService.addItem(userIdA, { voucherId: voucherLimited.id, qty: 2 })
      ).rejects.toThrow("Số lượng voucher còn lại không đủ");
    });

    it("nên thêm voucher ON_SALE thành công", async () => {
      const cart = await cartService.addItem(userIdA, { voucherId: voucherOnSale.id, qty: 2 });
      
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].voucherId).toBe(voucherOnSale.id);
      expect(cart.items[0].qty).toBe(2);
      expect(cart.cartTotal.totalAmount).toBe(160000); // 2 * 80k
    });

    it("nên cộng dồn khi thêm trùng voucherId (UPSERT)", async () => {
      const cart = await cartService.addItem(userIdA, { voucherId: voucherOnSale.id, qty: 1 });
      
      expect(cart.items).toHaveLength(1);
      expect(cart.items[0].qty).toBe(3); // 2 + 1
      expect(cart.cartTotal.totalAmount).toBe(240000); // 3 * 80k
    });
  });

  describe("updateQty()", () => {
    it("nên ném lỗi 404 nếu không tìm thấy cartItem", async () => {
      await expect(
        cartService.updateQty(userIdA, "00000000-0000-0000-0000-000000000000", 5)
      ).rejects.toThrow("Không tìm thấy sản phẩm này trong giỏ hàng");
    });

    it("nên ném lỗi 403 nếu cập nhật sản phẩm của người khác", async () => {
      // Lấy cartItem của User A
      const cartA = await cartService.getCart(userIdA);
      const cartItemId = cartA.items[0].id;

      // User B cố gắng cập nhật
      await expect(
        cartService.updateQty(userIdB, cartItemId, 5)
      ).rejects.toThrow("Không có quyền truy cập sản phẩm này");
    });

    it("nên cập nhật thành công nếu là chủ sở hữu", async () => {
      const cartA = await cartService.getCart(userIdA);
      const cartItemId = cartA.items[0].id;

      const updatedCart = await cartService.updateQty(userIdA, cartItemId, 5);
      expect(updatedCart.items[0].qty).toBe(5);
      expect(updatedCart.cartTotal.totalAmount).toBe(400000); // 5 * 80k
    });
  });

  describe("removeItem()", () => {
    it("nên ném lỗi 404 nếu không tìm thấy cartItem", async () => {
      await expect(
        cartService.removeItem(userIdA, "00000000-0000-0000-0000-000000000000")
      ).rejects.toThrow("Không tìm thấy sản phẩm này trong giỏ hàng");
    });

    it("nên ném lỗi 403 nếu xóa sản phẩm của người khác", async () => {
      const cartA = await cartService.getCart(userIdA);
      const cartItemId = cartA.items[0].id;

      // User B cố gắng xóa
      await expect(
        cartService.removeItem(userIdB, cartItemId)
      ).rejects.toThrow("Không có quyền truy cập sản phẩm này");
    });

    it("nên xóa thành công nếu là chủ sở hữu", async () => {
      const cartA = await cartService.getCart(userIdA);
      const cartItemId = cartA.items[0].id;

      const updatedCart = await cartService.removeItem(userIdA, cartItemId);
      expect(updatedCart.items).toHaveLength(0);
      expect(updatedCart.cartTotal.totalAmount).toBe(0);
    });
  });
});
