# W5-T5: Evidence Index — Partner/Admin Portal

> **Historical snapshot for SHA `0bfef02`.** Superseded for release decisions by the [final scorecard](W5D5_01_final_rubric_scorecard.md), [current three-portal evidence](W5D5_07_three_portal_evidence_index.md), and canonical 179-test log. Stale limitations and counts below are preserved only as provenance.

**Date:** 2026-07-19  
**SHA:** 0bfef02 (main)  
**Operator:** Partner & Admin Portal Lead  
**Baseline from T4:** eaa7864 — 162/162 tests passing

---

## 1. Test Evidence Matrix — Automated (from T4/T5 baseline)

### 1.1 Partner Flows

| # | Scenario | Test File | API Endpoint | Status | Evidence Code |
|---|---|---|---|---|---|
| P1 | Tạo voucher draft | `partner-vouchers.test.js` | `POST /api/partner/vouchers` | ✅ PASS | → 201, `status=DRAFT` |
| P2 | Submit voucher để duyệt | `partner-vouchers.test.js` | `POST /api/partner/vouchers/:id/submit` | ✅ PASS | → `status=PENDING_APPROVAL` |
| P3 | Cập nhật DRAFT/REJECTED | `partner-vouchers.test.js` | `PUT /api/partner/vouchers/:id` | ✅ PASS | DRAFT→200; APPROVED→400 |
| P4 | Validate: salePrice >= originalPrice | `partner-vouchers-api.test.js` | `POST /api/partner/vouchers` | ✅ PASS | → 400, Zod error |
| P5 | Validate: saleEnd < saleStart | `partner-vouchers-api.test.js` | `POST /api/partner/vouchers` | ✅ PASS | → 400 |
| P6 | Validate: totalQty <= 0 | `partner-vouchers-api.test.js` | `POST /api/partner/vouchers` | ✅ PASS | → 400 |
| P7 | Xem danh sách voucher | `partner-vouchers-api.test.js` | `GET /api/partner/vouchers` | ✅ PASS | → 200 |
| P8 | Đổi mã ISSUED thành công | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 200, voucherTitle, customerName, branchId |
| P9 | Đổi mã USED → rejected | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 400 `VOUCHER_CODE_USED`, code không bị consume |
| P10 | Đổi mã EXPIRED → rejected | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 400 `VOUCHER_CODE_EXPIRED` |
| P11 | Wrong partner đổi mã | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 403 `FORBIDDEN` |
| P12 | Mã không tồn tại | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 404 `VOUCHER_CODE_NOT_FOUND` |
| P13 | Branch ngoài scope → code KHÔNG bị consume | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 403 `INVALID_BRANCH_SCOPE`, DB status=ISSUED |
| P14 | branchId missing | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | → 400, no raw DB error |
| P15 | branchId invalid UUID | `partner-redeem-api.test.js` | `POST /api/partner/redeem` | ✅ PASS | Zod validation, clean error |

### 1.2 Admin Flows

| # | Scenario | Test File | API Endpoint | Status | Evidence Code |
|---|---|---|---|---|---|
| A1 | Approve partner (PENDING→APPROVED) | `admin-approval.test.js` | `POST /api/admin/partners/:id/approve` | ✅ PASS | DB: `partner.status=APPROVED`, `user.role=PARTNER` |
| A2 | Approve partner → audit log created | `admin-approval.test.js` | — | ✅ PASS | `auditLog: action=ADMIN_APPROVE_PARTNER` |
| A3 | Reject partner + reason | `admin-approval.test.js` | `POST /api/admin/partners/:id/reject` | ✅ PASS | DB: `partner.status=REJECTED`, `rejectReason` saved |
| A4 | Reject partner → audit log created | `admin-approval.test.js` | — | ✅ PASS | `auditLog: action=ADMIN_REJECT_PARTNER` |
| A5 | SELF_ACTION prevention | `admin-approval.test.js` | — | ✅ PASS | → 400 `SELF_ACTION`, DB status không đổi |
| A6 | Approve voucher → ON_SALE | `admin-approval.test.js` | `POST /api/admin/vouchers/:id/approve` | ✅ PASS | DB: `status=ON_SALE`, `approvedAt`, `approvedBy` |
| A7 | Approve voucher → APPROVED (future sale) | `admin-approval.test.js` | — | ✅ PASS | DB: `status=APPROVED`, `metadata.published=false` |
| A8 | Approve voucher → APPROVED (expired sale) | `admin-approval.test.js` | — | ✅ PASS | DB: `status=APPROVED`, `metadata.published=false` |
| A9 | Reject voucher + reason | `admin-approval.test.js` | `POST /api/admin/vouchers/:id/reject` | ✅ PASS | DB: `rejectReason` saved |
| A10 | Approve DRAFT → 400 invalid transition | `admin-approval.test.js` | — | ✅ PASS | → 400 `/transition/i` |
| A11 | Unauthenticated approve → 401 | `admin-approval.test.js` | — | ✅ PASS | — |
| A12 | Customer token approve → 403 | `admin-approval.test.js` | — | ✅ PASS | — |
| A13 | Admin xem orders list, filter, search | `admin-orders-audit.test.js` | `GET /api/admin/orders` | ✅ PASS | → 200, pagination đúng |
| A14 | Admin xem order chi tiết + voucher codes | `admin-orders-audit.test.js` | `GET /api/admin/orders/:id` | ✅ PASS | items, voucherCodes, user, payment |
| A15 | Admin xem audit logs | `admin-orders-audit.test.js` | `GET /api/admin/audit-logs` | ✅ PASS | → 200 |
| A16 | Admin lock/unlock user | `admin-management.test.js` | `POST /api/admin/users/:id/toggle-lock` | ✅ PASS | audit: `ADMIN_LOCK_USER` / `ADMIN_UNLOCK_USER` |
| A17 | Admin dashboard stats | `admin-dashboard.test.js` | `GET /api/admin/dashboard/stats` | ✅ PASS | totalUsers, activePartners, revenueThisMonth, ordersToday |

---

## 2. Audit Log Evidence Fields

| Action | actor | targetType | targetId | metadata |
|---|---|---|---|---|
| `ADMIN_APPROVE_PARTNER` | adminId | Partner | partnerId | `{}` |
| `ADMIN_REJECT_PARTNER` | adminId | Partner | partnerId | `{ reason }` |
| `ADMIN_APPROVE_VOUCHER` | adminId | Voucher | voucherId | `{ published: true/false }` |
| `ADMIN_REJECT_VOUCHER` | adminId | Voucher | voucherId | `{ reason }` |
| `ADMIN_LOCK_USER` | adminId | User | userId | `{ previousState, newState }` |
| `ADMIN_UNLOCK_USER` | adminId | User | userId | `{ previousState, newState }` |
| `PARTNER_REDEEM_VOUCHER` | partner.userId | VoucherCode | voucherCode.id | `{ code, branchId, redeemedAt }` |

All fields verified via direct DB assertion trong `admin-approval.test.js` and `partner-redeem-api.test.js`.

---

## 3. Negative Proof — Code Không Bị Consume

### 3.1 Branch Ngoài Scope (INVALID_BRANCH_SCOPE)
```js
// Test: partner-redeem-api.test.js
expect(res.status).toBe(403);
expect(res.body.code).toBe('INVALID_BRANCH_SCOPE');
const unchanged = await prisma.voucherCode.findUnique({ where: { code: branchScopedCode } });
expect(unchanged.status).toBe('ISSUED');  // ✅ Không bị consume
```
**Mechanism:** Branch check xảy ra trong transaction, trước `updateMany`. Nếu branch sai → throw → rollback → status giữ nguyên ISSUED.

### 3.2 Wrong Partner (FORBIDDEN)
```js
// Test P11
expect(res.status).toBe(403);
expect(res.body.code).toBe('FORBIDDEN');
// Code vẫn là ISSUED trong DB — không bị consume
```

### 3.3 Code Đã USED (VOUCHER_CODE_USED)
```js
// Test P9
expect(res.status).toBe(400);
expect(res.body.code).toBe('VOUCHER_CODE_USED');
// Code giữ nguyên USED — không bị "re-consumed"
```

---

## 4. Frontend Pages Evidence

| Portal | Page | URL | Data Source | Status |
|---|---|---|---|---|
| Admin | Dashboard | `/admin/dashboard` | `GET /api/admin/dashboard/stats` (thật) | ✅ Live |
| Admin | Voucher Approvals | `/admin/voucher-approvals` | `GET /api/admin/vouchers?status=PENDING_APPROVAL` | ✅ Live |
| Admin | Partners | `/admin/partners` | `GET /api/admin/partners` | ✅ Live |
| Admin | Orders | `/admin/orders` | `GET /api/admin/orders` | ✅ Live |
| Admin | Audit Logs | `/admin/audit-logs` | `GET /api/admin/audit-logs` | ✅ Live |
| Partner | Dashboard | `/partner/dashboard` | KPI thật; Chart+Timeline = mock | ✅ Live (KPI) |
| Partner | Voucher List | `/partner/vouchers` | `GET /api/partner/vouchers` | ✅ Live |
| Partner | Create Voucher | `/partner/vouchers/new` | `POST /api/partner/vouchers` | ✅ Live |
| Partner | Redeem | `/partner/redeem` | `POST /api/partner/redeem` | ✅ Live |
| Partner | Reports | `/partner/reports` | `GET /api/partner/reports` | ✅ Live |

---

## 5. Test Run Summary — Baseline (T4)

| Metric | Value |
|---|---|
| SHA | eaa7864 |
| Test Files | 17 passed / 0 failed |
| Tests | **162 passed / 0 failed** |
| Duration | ~27s |

> **T5 retest:** Chạy lại sau khi pull 0bfef02 để xác nhận không có regression từ PR #130 (customer e2e).

---

## 6. Portal Limitations — Ghi Nhận Tường Minh

| Limitation | Severity | File | W6 Backlog Item |
|---|---|---|---|
| Partner Dashboard chart dùng mock data | Tech Debt | `PartnerDashboardPage.jsx` | Cần API `GET /api/partner/reports` → map vào chart |
| Partner Dashboard timeline dùng mock data | Tech Debt | `PartnerDashboardPage.jsx` | Cần endpoint hoạt động gần đây |
| KPI Dashboard tính FE-side với limit=48 | Tech Debt | `PartnerDashboardPage.jsx` | Cần aggregate endpoint backend |
| `BranchesPage.jsx` chỉ là placeholder | P2 | `partner/BranchesPage.jsx` | Cần trang quản lý branch đầy đủ |
| `CategoriesPage.jsx` placeholder | P2 | `admin/CategoriesPage.jsx` | Cần trang category management |
| Report chart responsive trên mobile | Minor | `PartnerReportsPage.jsx` | Responsive breakpoint adjustment |
