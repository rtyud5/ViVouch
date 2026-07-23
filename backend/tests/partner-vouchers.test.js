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
  let branchId = "";

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
        role: "PARTNER",
        status: "ACTIVE"
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

    await prisma.partnerMember.create({
      data: {
        partnerId,
        userId: partnerUserId,
        role: "OWNER",
        status: "ACTIVE"
      }
    });

    const branch = await prisma.branch.create({
      data: {
        partnerId,
        name: "Partner Voucher Test Branch",
        address: "123 Test Street",
      },
    });
    branchId = branch.id;
  });

  afterAll(async () => {
    // Cleanup
    await prisma.auditLog.deleteMany({
      where: { actorId: partnerUserId }
    });

    await prisma.voucherBranch.deleteMany({ where: { branchId } });

    await prisma.voucher.deleteMany({
      where: { partnerId }
    });

    await prisma.branch.deleteMany({ where: { id: branchId } });

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
        totalQty: 10,
        saleStart: new Date(Date.now() - 60_000),
        saleEnd: new Date(Date.now() + 86_400_000),
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

    it("nên lọc theo status — PENDING_APPROVAL trả về đúng voucher", async () => {
      // Voucher đã được submit ở test trên → status = PENDING_APPROVAL
      const result = await vouchersService.findByPartner(partnerUserId, {
        page: 1,
        limit: 10,
        status: VOUCHER_STATUS.PENDING_APPROVAL,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].status).toBe(VOUCHER_STATUS.PENDING_APPROVAL);
    });

    it("nên lọc theo status — DRAFT không trả về voucher nào", async () => {
      const result = await vouchersService.findByPartner(partnerUserId, {
        page: 1,
        limit: 10,
        status: VOUCHER_STATUS.DRAFT,
      });
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });

    it("nên tìm kiếm theo keyword trong title", async () => {
      const result = await vouchersService.findByPartner(partnerUserId, {
        page: 1,
        limit: 10,
        keyword: "Test Voucher",
      });
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].title).toContain("Test Voucher");
    });

    it("nên trả về rỗng khi keyword không khớp", async () => {
      const result = await vouchersService.findByPartner(partnerUserId, {
        page: 1,
        limit: 10,
        keyword: "nonexistent-xyz-keyword-999",
      });
      expect(result.data).toHaveLength(0);
      expect(result.pagination.total).toBe(0);
    });
  });

  describe("submitVoucher() — concurrent submission (regression)", () => {
    let concurrentVoucherId = "";

    beforeAll(async () => {
      const concurrentVoucher = await prisma.voucher.create({
        data: {
          partnerId,
          categoryId,
          title: "Concurrent Submit Test Voucher",
          originalPrice: 100000,
          salePrice: 75000,
          totalQty: 10,
          soldQty: 0,
          status: VOUCHER_STATUS.DRAFT,
          saleStart: new Date(Date.now() - 60_000),   // already started
          saleEnd: new Date(Date.now() + 86_400_000), // tomorrow
        },
      });
      concurrentVoucherId = concurrentVoucher.id;

      // Ensure the partner has an active branch for the submit to succeed
      await prisma.branch.updateMany({
        where: { id: branchId },
        data: { isActive: true },
      });
    });

    afterAll(async () => {
      await prisma.auditLog.deleteMany({ where: { targetId: concurrentVoucherId } });
      await prisma.voucherBranch.deleteMany({ where: { voucherId: concurrentVoucherId } });
      await prisma.voucher.deleteMany({ where: { id: concurrentVoucherId } });
    });

    it("dois concurrent submits: exatamente um sucede, o outro lança INVALID_STATUS_TRANSITION 400", async () => {
      // Fire two concurrent submits
      const [r1, r2] = await Promise.allSettled([
        vouchersService.submitVoucher(partnerUserId, concurrentVoucherId),
        vouchersService.submitVoucher(partnerUserId, concurrentVoucherId),
      ]);

      const successes = [r1, r2].filter((r) => r.status === "fulfilled");
      const failures  = [r1, r2].filter((r) => r.status === "rejected");

      // Exactly one should succeed
      expect(successes).toHaveLength(1);
      // Exactly one should fail
      expect(failures).toHaveLength(1);

      const failureReason = failures[0].reason;

      // Must NOT leak raw P2025
      expect(failureReason?.code).not.toBe("P2025");
      // Must be 400
      expect(failureReason?.statusCode).toBe(400);
      // Must carry INVALID_STATUS_TRANSITION code
      expect(failureReason?.code).toBe("INVALID_STATUS_TRANSITION");

      // Final state must be PENDING_APPROVAL
      const voucher = await prisma.voucher.findUnique({ where: { id: concurrentVoucherId } });
      expect(voucher.status).toBe(VOUCHER_STATUS.PENDING_APPROVAL);

      // Should have exactly one SUBMIT_VOUCHER audit log
      const logs = await prisma.auditLog.findMany({
        where: { targetId: concurrentVoucherId, action: "SUBMIT_VOUCHER" },
      });
      expect(logs).toHaveLength(1);
    });
  });
});
