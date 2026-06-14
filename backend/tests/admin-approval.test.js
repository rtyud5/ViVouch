import { describe, it, expect, beforeAll, afterAll } from "vitest";
import request from "supertest";
import app from "../src/app.js";
import { prisma } from "../src/config/prisma.js";
import { AUDIT_ACTIONS } from "../src/constants/auditActions.js";

describe("Admin Approve/Reject API (T3.5a)", () => {
  const adminEmail = "admin_approval_test@example.com";
  const customerEmail = "customer_approval_test@example.com";
  const password = "Password123!";

  let adminToken = "";
  let customerToken = "";
  let adminId = "";
  let customerId = "";
  let partnerId = "";
  let voucherId = "";
  let categoryId = "";
  let createdCategory = false;

  const partnerIds = [];
  const voucherIds = [];
  const extraUserEmails = [];

  beforeAll(async () => {
    await prisma.auditLog.deleteMany({
      where: {
        actor: { email: { in: [adminEmail, customerEmail, ...extraUserEmails] } },
      },
    }).catch(() => {});

    await prisma.user.deleteMany({
      where: { email: { in: [adminEmail, customerEmail] } },
    });

    const resCustomerReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: customerEmail,
        password,
        fullName: "Approval Test Customer",
        phone: "0900000101",
      });
    customerId = resCustomerReg.body.data.id;

    const resCustomerLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: customerEmail, password });
    customerToken = resCustomerLogin.body.data.accessToken;

    const resAdminReg = await request(app)
      .post("/api/auth/register")
      .send({
        email: adminEmail,
        password,
        fullName: "Approval Test Admin",
        phone: "0900000102",
      });
    adminId = resAdminReg.body.data.id;

    await prisma.user.update({
      where: { id: adminId },
      data: { role: "ADMIN" },
    });

    const resAdminLogin = await request(app)
      .post("/api/auth/login")
      .send({ email: adminEmail, password });
    adminToken = resAdminLogin.body.data.accessToken;

    const category = await prisma.category.create({
      data: {
        name: "Test Category Approval",
        slug: "test-category-approval",
        icon: "🧪",
      },
    });
    categoryId = category.id;
    createdCategory = true;

    const partner = await prisma.partner.create({
      data: {
        userId: customerId,
        businessName: "Test Partner Approval",
        taxCode: "9990000001",
        representativeName: "Nguyễn Test",
        status: "PENDING",
      },
    });
    partnerId = partner.id;
    partnerIds.push(partnerId);

    const voucher = await prisma.voucher.create({
      data: {
        partnerId,
        categoryId,
        title: "Test Voucher Pending Approval",
        originalPrice: 100000,
        salePrice: 80000,
        totalQty: 50,
        status: "PENDING_APPROVAL",
      },
    });
    voucherId = voucher.id;
    voucherIds.push(voucherId);
  });

  afterAll(async () => {
    await prisma.auditLog.deleteMany({
      where: {
        OR: [
          { actorId: adminId },
          { targetId: { in: [...partnerIds, ...voucherIds] } },
        ],
      },
    });

    await prisma.voucher.deleteMany({
      where: { id: { in: voucherIds } },
    });

    await prisma.partner.deleteMany({
      where: { id: { in: partnerIds } },
    });

    if (createdCategory) {
      await prisma.category.delete({ where: { id: categoryId } }).catch(() => {});
    }

    await prisma.user.deleteMany({
      where: {
        email: { in: [adminEmail, customerEmail, ...extraUserEmails] },
      },
    });

    await prisma.$disconnect();
  });

  describe("POST /api/admin/partners/:id/approve", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${partnerId}/approve`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("403 nếu token không phải ADMIN", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${partnerId}/approve`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("404 nếu partner không tồn tại", async () => {
      const res = await request(app)
        .post("/api/admin/partners/non-existent-id/approve")
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(404);
      expect(res.body.success).toBe(false);
    });

    it("200 approve partner thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${partnerId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const partner = await prisma.partner.findUnique({ where: { id: partnerId } });
      expect(partner.status).toBe("APPROVED");

      const user = await prisma.user.findUnique({ where: { id: partner.userId } });
      expect(user.role).toBe("PARTNER");

      const log = await prisma.auditLog.findFirst({
        where: {
          action: AUDIT_ACTIONS.ADMIN_APPROVE_PARTNER,
          targetId: partnerId,
          actorId: adminId,
        },
      });
      expect(log).toBeTruthy();
      expect(log.targetType).toBe("Partner");
    });
  });

  describe("POST /api/admin/partners/:id/reject", () => {
    let rejectPartnerId = "";

    beforeAll(async () => {
      const rejectOwnerEmail = "reject_partner_owner@example.com";
      extraUserEmails.push(rejectOwnerEmail);

      const resReg = await request(app)
        .post("/api/auth/register")
        .send({
          email: rejectOwnerEmail,
          password,
          fullName: "Reject Partner Owner",
          phone: "0900000103",
        });

      const rejectPartner = await prisma.partner.create({
        data: {
          userId: resReg.body.data.id,
          businessName: "Reject Test Partner",
          taxCode: "9990000002",
          representativeName: "Trần Test",
          status: "PENDING",
        },
      });
      rejectPartnerId = rejectPartner.id;
      partnerIds.push(rejectPartnerId);
    });

    it("400 nếu không có reason trong body", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${rejectPartnerId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("400 nếu reason là chuỗi rỗng", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${rejectPartnerId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("200 reject partner thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${rejectPartnerId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Thông tin không hợp lệ" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const partner = await prisma.partner.findUnique({ where: { id: rejectPartnerId } });
      expect(partner.status).toBe("REJECTED");
      expect(partner.rejectReason).toBe("Thông tin không hợp lệ");

      const log = await prisma.auditLog.findFirst({
        where: {
          action: AUDIT_ACTIONS.ADMIN_REJECT_PARTNER,
          targetId: rejectPartnerId,
          actorId: adminId,
        },
      });
      expect(log).toBeTruthy();
    });
  });

  describe("POST /api/admin/vouchers/:id/approve", () => {
    it("401 nếu không có token", async () => {
      const res = await request(app)
        .post(`/api/admin/vouchers/${voucherId}/approve`);

      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
    });

    it("403 nếu không phải ADMIN", async () => {
      const res = await request(app)
        .post(`/api/admin/vouchers/${voucherId}/approve`)
        .set("Authorization", `Bearer ${customerToken}`);

      expect(res.status).toBe(403);
      expect(res.body.success).toBe(false);
    });

    it("400 nếu voucher status không phải PENDING_APPROVAL", async () => {
      const draftVoucher = await prisma.voucher.create({
        data: {
          partnerId,
          categoryId,
          title: "Test Voucher Draft",
          originalPrice: 50000,
          salePrice: 40000,
          totalQty: 10,
          status: "DRAFT",
        },
      });
      voucherIds.push(draftVoucher.id);

      const res = await request(app)
        .post(`/api/admin/vouchers/${draftVoucher.id}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toMatch(/transition/i);
    });

    it("200 approve voucher thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/vouchers/${voucherId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const voucher = await prisma.voucher.findUnique({ where: { id: voucherId } });
      expect(voucher.status).toBe("APPROVED");
      expect(voucher.approvedBy).toBe(adminId);
      expect(voucher.approvedAt).not.toBeNull();

      const log = await prisma.auditLog.findFirst({
        where: {
          action: AUDIT_ACTIONS.ADMIN_APPROVE_VOUCHER,
          targetId: voucherId,
          actorId: adminId,
        },
      });
      expect(log).toBeTruthy();
      expect(log.targetType).toBe("Voucher");
    });
  });

  describe("Self-action restriction (partner)", () => {
    let selfPartnerId = "";

    beforeAll(async () => {
      const selfPartner = await prisma.partner.create({
        data: {
          userId: adminId,
          businessName: "Admin Own Partner",
          taxCode: "9990000003",
          representativeName: "Admin Self",
          status: "PENDING",
        },
      });
      selfPartnerId = selfPartner.id;
      partnerIds.push(selfPartnerId);
    });

    it("400 nếu admin cố approve partner của chính mình", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${selfPartnerId}/approve`)
        .set("Authorization", `Bearer ${adminToken}`);

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      const partner = await prisma.partner.findUnique({ where: { id: selfPartnerId } });
      expect(partner.status).toBe("PENDING");

      const log = await prisma.auditLog.findFirst({
        where: { action: AUDIT_ACTIONS.ADMIN_APPROVE_PARTNER, targetId: selfPartnerId },
      });
      expect(log).toBeNull();
    });

    it("400 nếu admin cố reject partner của chính mình", async () => {
      const res = await request(app)
        .post(`/api/admin/partners/${selfPartnerId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Tự từ chối" });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);

      const partner = await prisma.partner.findUnique({ where: { id: selfPartnerId } });
      expect(partner.status).toBe("PENDING");
      expect(partner.rejectReason).toBeNull();

      const log = await prisma.auditLog.findFirst({
        where: { action: AUDIT_ACTIONS.ADMIN_REJECT_PARTNER, targetId: selfPartnerId },
      });
      expect(log).toBeNull();
    });
  });

  describe("POST /api/admin/vouchers/:id/reject", () => {
    let rejectVoucherId = "";

    beforeAll(async () => {
      const rejectVoucher = await prisma.voucher.create({
        data: {
          partnerId,
          categoryId,
          title: "Test Voucher For Reject",
          originalPrice: 120000,
          salePrice: 90000,
          totalQty: 20,
          status: "PENDING_APPROVAL",
        },
      });
      rejectVoucherId = rejectVoucher.id;
      voucherIds.push(rejectVoucherId);
    });

    it("400 nếu không có reason", async () => {
      const res = await request(app)
        .post(`/api/admin/vouchers/${rejectVoucherId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
    });

    it("200 reject voucher thành công", async () => {
      const res = await request(app)
        .post(`/api/admin/vouchers/${rejectVoucherId}/reject`)
        .set("Authorization", `Bearer ${adminToken}`)
        .send({ reason: "Hình ảnh không đạt yêu cầu" });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);

      const voucher = await prisma.voucher.findUnique({ where: { id: rejectVoucherId } });
      expect(voucher.status).toBe("REJECTED");
      expect(voucher.rejectReason).toBe("Hình ảnh không đạt yêu cầu");

      const log = await prisma.auditLog.findFirst({
        where: {
          action: AUDIT_ACTIONS.ADMIN_REJECT_VOUCHER,
          targetId: rejectVoucherId,
          actorId: adminId,
        },
      });
      expect(log).toBeTruthy();
    });
  });
});
