import { describe, it, expect, beforeAll, afterAll } from "vitest";
import * as vouchersService from "../src/modules/vouchers/vouchers.service.js";
import { prisma } from "../src/config/prisma.js";
import bcrypt from "bcrypt";
import { VOUCHER_STATUS } from "../src/constants/statuses.js";

describe("Partner Vouchers Service Unit Tests", () => {
  const partnerEmail = "partner_voucher_test@test.com";
  const password = "Password123!";

  let partnerUserId = "";
  let partnerId = "";
  let categoryId = "";
  let draftVoucherId = "";

  beforeAll(async () => {
    // Cleanup existing test data if any
    await prisma.voucher.deleteMany({
      where: { partner: { user: { email: partnerEmail } } }
    });

    await prisma.partner.deleteMany({
      where: { user: { email: partnerEmail } }
    });

    await prisma.user.deleteMany({
      where: { email: partnerEmail }
    });

    // Create category if not exist
    let category = await prisma.category.findFirst();
    if (!category) {
      category = await prisma.category.create({
        data: { name: "Test Cat Voucher", slug: "test-cat-voucher", icon: "🎟️" }
      });
    }
    categoryId = category.id;

    const hashedPassword = await bcrypt.hash(password, 10);

    // Create Partner User
    const partnerUser = await prisma.user.create({
      data: {
        email: partnerEmail,
        fullName: "Test Partner Voucher",
        passwordHash: hashedPassword,
        role: "PARTNER"
      }
    });
    partnerUserId = partnerUser.id;

    const partner = await prisma.partner.create({
      data: {
        userId: partnerUser.id,
        businessName: "Test Partner Biz",
        taxCode: "TAX123456",
        representativeName: "Rep Name",
        status: "APPROVED"
      }
    });
    partnerId = partner.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.auditLog.deleteMany({
      where: { actorId: partnerUserId }
    });

    await prisma.voucher.deleteMany({
      where: { partnerId }
    });

    await prisma.partner.deleteMany({
      where: { id: partnerId }
    });

    await prisma.user.deleteMany({
      where: { id: partnerUserId }
    });

    await prisma.$disconnect();
  });

  describe("createVoucher()", () => {
    it("nên tạo voucher với trạng thái DRAFT", async () => {
      const data = {
        categoryId,
        title: "Test Voucher DRAFT",
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 10
      };

      const voucher = await vouchersService.createVoucher(partnerUserId, data);

      expect(voucher).toBeDefined();
      expect(voucher.partnerId).toBe(partnerId);
      expect(voucher.status).toBe(VOUCHER_STATUS.DRAFT);
      expect(Number(voucher.salePrice)).toBe(80000);

      draftVoucherId = voucher.id;
    });
  });

  describe("updateVoucher()", () => {
    it("nên cập nhật thành công voucher DRAFT", async () => {
      const updateData = {
        title: "Test Voucher DRAFT (Updated)",
        salePrice: 75000
      };

      const updated = await vouchersService.updateVoucher(partnerUserId, draftVoucherId, updateData);
      expect(updated.title).toBe(updateData.title);
      expect(Number(updated.salePrice)).toBe(75000);
    });

    it("nên ném lỗi nếu partner không phải là chủ sở hữu", async () => {
      // Dùng userId ảo
      await expect(
        vouchersService.updateVoucher("00000000-0000-0000-0000-000000000000", draftVoucherId, {})
      ).rejects.toThrow(); // Lỗi do không tìm thấy partner
    });
  });

  describe("submitVoucher()", () => {
    it("nên submit voucher và chuyển trạng thái sang PENDING_APPROVAL", async () => {
      const submitted = await vouchersService.submitVoucher(partnerUserId, draftVoucherId);
      expect(submitted.status).toBe(VOUCHER_STATUS.PENDING_APPROVAL);

      // Verify audit log
      const log = await prisma.auditLog.findFirst({
        where: {
          actorId: partnerUserId,
          targetId: draftVoucherId,
          action: "SUBMIT_VOUCHER"
        }
      });
      expect(log).toBeDefined();
    });

    it("nên ném lỗi nếu submit voucher không hợp lệ (đã PENDING_APPROVAL)", async () => {
      await expect(
        vouchersService.submitVoucher(partnerUserId, draftVoucherId)
      ).rejects.toThrow("Trạng thái hiện tại không hợp lệ để duyệt");
    });
  });

  describe("findByPartner()", () => {
    it("nên trả về danh sách voucher của partner bao gồm usedCount", async () => {
      const result = await vouchersService.findByPartner(partnerUserId, { page: 1, limit: 10 });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].id).toBe(draftVoucherId);
      expect(result.data[0].usedCount).toBeDefined();
      expect(result.data[0].usedCount).toBe(0);
      expect(result.pagination.total).toBe(1);
    });
  });
});
