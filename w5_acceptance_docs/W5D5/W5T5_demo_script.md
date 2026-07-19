# W5-T5: Partner/Admin Demo Script

**Date:** 2026-07-19  
**SHA (baseline):** 0bfef02 (main, post-pull)  
**Operator:** Partner & Admin Portal Lead (Tùng)  
**Environment:** Local dev — backend :5000, frontend :5173, PostgreSQL Docker  
**Dependency:** W5-T4 (eaa7864) — 162/162 tests passing. Main HEAD at 0bfef02.

---

## Pre-Demo Checklist

| Check | Command / Action | Expected |
|---|---|---|
| Docker PostgreSQL up | `docker ps` | Container `vivouch-db` running |
| Backend up | `npm run dev` in `backend/` | Listening on :5000 |
| Frontend up | `npm run dev` in `frontend/` | Listening on :5173 |
| No console errors | Open browser DevTools | 0 errors on load |
| Fixture state | Ensure fresh test data (see Fallback Fixtures below) | Clean state |

---

## Scene A — Partner: Tạo & Submit Voucher

### A1. Đăng nhập Partner
- **URL:** `http://localhost:5173/login`
- **Account:** Dùng account partner đã APPROVED trong DB
- **Expected:** Redirect về `/partner/dashboard`

### A2. Xem Dashboard Partner
- **URL:** `/partner/dashboard`
- **Evidence:** KPI cards (Voucher Đang Bán, Tổng Đã Bán, Đã Sử Dụng, Doanh Thu Ước Tính) — dữ liệu thật từ API
- **Limitation ghi nhận:** Chart doanh thu và Timeline dùng mock data (Tech-debt W6)

### A3. Tạo Voucher Draft
- **URL:** `/partner/vouchers/new`
- **Action:** Điền form đầy đủ: Tên, Giá gốc > Giá bán, Số lượng > 0, saleStart < saleEnd
- **Expected:** 201 Created, redirect về danh sách, status = DRAFT
- **API:** `POST /api/partner/vouchers`

### A4. Xem Danh Sách Voucher
- **URL:** `/partner/vouchers`
- **Evidence:** Voucher mới tạo hiển thị tab "Nháp", badge DRAFT
- **Action:** Thử filter tab "Chờ duyệt" → trống (chưa submit)

### A5. Submit Voucher Chờ Duyệt
- **URL:** `/partner/vouchers` → click vào voucher → nút "Gửi duyệt"
- **API:** `POST /api/partner/vouchers/:id/submit`
- **Expected:** Status thay đổi → PENDING_APPROVAL. Badge cập nhật ngay.

### A6. Validation Negative — Giá salePrice >= originalPrice
- **URL:** `/partner/vouchers/new`
- **Action:** Nhập salePrice >= originalPrice
- **Expected:** 400, Zod error message, không có raw DB error trong response body

---

## Scene B — Admin: Duyệt/Từ Chối Voucher

### B1. Đăng nhập Admin
- **URL:** `http://localhost:5173/login`
- **Account:** account có role = ADMIN
- **Expected:** Redirect về `/admin/dashboard`

### B2. Dashboard Admin — KPI Overview
- **URL:** `/admin/dashboard`
- **Evidence:** 4 KPI cards — dữ liệu thật từ `GET /api/admin/dashboard/stats`
- **Evidence:** Biểu đồ doanh thu 30 ngày (revenueByDay từ API)
- **Evidence:** Sidebar "Đối tác chờ duyệt" — dữ liệu thật, nút "Xử lý" navigate đúng tới `/admin/partners`

### B3. Kiểm Duyệt Voucher — Approve
- **URL:** `/admin/voucher-approvals`
- **Action:** Filter tab "Chờ duyệt" → thấy voucher từ Scene A5
- **Action:** Click row → Mở modal → Xem chi tiết (title, giá, mô tả đầy đủ)
- **Action:** Click "Duyệt Voucher"
- **API:** `POST /api/admin/vouchers/:id/approve`
- **Expected:** Success toast "Đã phê duyệt voucher thành công."
- **DB verify:** `voucher.status` = ON_SALE (nếu trong thời gian bán) hoặc APPROVED
- **DB verify:** `voucher.approvedBy` = adminId, `voucher.approvedAt` set

### B4. Kiểm Duyệt Voucher — Reject
- **URL:** `/admin/voucher-approvals` → tab "Chờ duyệt"
- **Action:** Chọn voucher khác (chuẩn bị fixture trước) → Nhập lý do từ chối → Click "Từ chối"
- **API:** `POST /api/admin/vouchers/:id/reject`
- **Expected:** Success toast "Đã từ chối voucher thành công."
- **DB verify:** `voucher.status` = REJECTED, `voucher.rejectReason` = lý do đã nhập

### B5. Negative — Approve DRAFT (Invalid Transition)
- **Evidence:** Test A10 — `POST /api/admin/vouchers/:id/approve` với DRAFT → 400 /transition/i
- **UX guard:** Tab chỉ show PENDING_APPROVAL, không expose DRAFT/REJECTED để approve

---

## Scene C — Admin: Duyệt/Từ Chối Đối Tác

### C1. Quản Lý Đối Tác
- **URL:** `/admin/partners`
- **Action:** Filter tab "Chờ duyệt"
- **Evidence:** Danh sách partner PENDING với nút check (approve) và cancel (reject) inline

### C2. Approve Partner
- **Action:** Click ✓ (check_circle icon) trên row PENDING partner
- **API:** `POST /api/admin/partners/:id/approve`
- **Expected:** Toast thành công. Row tự cập nhật status.
- **DB verify:** `partner.status` = APPROVED, `user.role` = PARTNER

### C3. Reject Partner
- **Action:** Click ✗ (cancel icon) → Sidebar mở ra → Nhập lý do → Click "Từ chối"
- **API:** `POST /api/admin/partners/:id/reject`
- **Expected:** Toast thành công.
- **DB verify:** `partner.status` = REJECTED, `partner.rejectReason` saved

### C4. Negative — Self-Action
- **Evidence:** Test A5 — Admin approve partner của mình → 400 SELF_ACTION, DB không đổi

---

## Scene D — Partner: Redeem Voucher (Branch-Scoped)

### D1. Đăng nhập Partner
- **URL:** `http://localhost:5173/partner/redeem`

### D2. Redeem Thành Công
- **Prerequisite:** Code ISSUED (customer đã mua, code chưa dùng), branch hợp lệ
- **Action:** Chọn chi nhánh từ dropdown → Nhập mã code ISSUED → Click "Xác nhận đổi mã"
- **API:** `POST /api/partner/redeem`
- **Expected:** Card thành công màu xanh với: voucherTitle, customerName, branchName, redeemedAt
- **DB verify:** `voucherCode.status` = USED, `voucherUsageLog` entry created (cùng transaction)

### D3. Negative — Mã Đã Dùng (USED)
- **Action:** Nhập lại mã vừa dùng ở D2
- **Expected:** Error card màu warning: "Voucher này đã được sử dụng."
- **API response:** 400, code = VOUCHER_CODE_USED
- **Critical check:** DB `voucherCode.status` vẫn = USED (không đổi trạng thái)

### D4. Negative — Branch Ngoài Scope
- **Action:** Chọn chi nhánh KHÔNG linked với voucher → nhập mã ISSUED hợp lệ
- **API:** `POST /api/partner/redeem`
- **Expected:** Error card: "Voucher này không áp dụng tại chi nhánh đã chọn."
- **API response:** 403, code = INVALID_BRANCH_SCOPE
- **Critical check:** DB `voucherCode.status` vẫn = ISSUED (không bị consume — transaction rollback)

### D5. Negative — Wrong Partner
- **Evidence:** Test P11 — Partner B dùng code của Partner A → 403 FORBIDDEN
- **DB verify:** Code status không thay đổi sau khi bị reject

---

## Scene E — Admin: Reports & Audit Log

### E1. Xem Audit Log
- **URL:** `/admin/audit-logs`
- **Evidence:** Bảng hiển thị logs từ D2, C2, C3, B3, B4
- **Filter:** Dropdown "Đổi mã voucher" → chỉ hiện `PARTNER_REDEEM_VOUCHER`
- **Columns:** Thời gian | Người thực hiện (email + role badge) | Thao tác (badge màu) | Mục tiêu (type | id) | metadata JSON

### E2. Truy Vết Audit Entry — Redeem
- **Action:** Tìm log `PARTNER_REDEEM_VOUCHER`
- **Evidence actor:** `actor.email` = email partner, `actor.role` = PARTNER
- **Evidence target:** `targetType` = VoucherCode, `targetId` = voucherCode.id (8 ký tự đầu)
- **Evidence metadata:** `{ code: "...", branchId: "...", redeemedAt: "..." }`

### E3. Xem Orders Admin
- **URL:** `/admin/orders`
- **Evidence:** Filter, pagination. Click row → chi tiết: items, voucherCodes, user, payment

### E4. Partner Reports
- **URL:** `/partner/reports`
- **Action:** Chọn range 7/30/90 ngày
- **Evidence:** `GET /api/partner/reports?days=30` → `{ summary, revenueByDay, topVouchers }`
- **Chart:** Line chart doanh thu theo ngày (dữ liệu thật từ API)
- **Table:** Bảng thống kê theo ngày (8 rows gần nhất)

---

## Scene F — Responsive / Console Smoke

### F1. Responsive Check
| Breakpoint | Page | Check |
|---|---|---|
| 375px | Admin Dashboard | KPI 2-col, chart full width |
| 375px | Partner Dashboard | KPI 1-col stacked |
| 375px | Redeem Page | Form full width, centered |
| 768px | Admin Dashboard | KPI 4-col, sidebar đúng layout |
| 1280px | Admin Dashboard | Desktop layout đầy đủ |

### F2. Console Smoke
- **Action:** Mở DevTools Console trước khi demo
- **Expected:** 0 error logs trên mọi page
- **Check:** Không có raw Prisma/DB errors trong API response body

---

## Fallback Fixtures

Nếu không có dữ liệu sẵn:

```js
// Tạo voucher PENDING_APPROVAL để approve/reject trong demo
await prisma.voucher.update({
  where: { id: voucherId },
  data: { status: 'PENDING_APPROVAL' }
});

// Tạo fresh code ISSUED cho redeem demo
await prisma.voucherCode.create({
  data: {
    code: 'DEMO-VIVOUCH-001',
    voucherId,
    orderId,
    status: 'ISSUED',
  }
});
```

> **Rủi ro:** Code ISSUED có thể đã USED từ lần chạy test trước.  
> **Mitigation:** Luôn tạo fresh code mới hoặc reset trước mỗi flow.

### Reset Between Flows (demo only)
```sql
-- Reset USED về ISSUED cho demo lại
UPDATE "VoucherCode" SET status = 'ISSUED' WHERE code = 'DEMO-VIVOUCH-001';
```
