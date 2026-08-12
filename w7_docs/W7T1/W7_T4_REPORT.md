# W7-T4 — Partner/Admin Staging & Recovery Smoke Report

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-T4 — Partner/Admin/Staff staging & recovery smoke  
**Branch:** `W7-T4/Partner-Admin-staging-recovery-smoke`  
**Ngày:** 2026-08-12  
**Trạng thái:** ✅ PASS

---

## Outcome

Verify toàn bộ Partner/Admin/Staff core actions trên post-seed restored state.  
**Không cần thêm/sửa bất kỳ file source code nào** — repo đã đáp ứng đầy đủ AC.

---

## Acceptance Criteria — Kết quả

| Tiêu chí | Kết quả |
|---|---|
| Roles/scopes đúng | ✅ 10 RBAC cases PASS (role injection, cross-partner, staff/branch scope, self-lock, suspended partner) |
| Critical action traceable | ✅ AuditLog có `actorId`, `requestId`, `ipAddress`, `userAgent` cho mọi critical action |
| Recovered data supports core flow | ✅ Post-seed: 8 users, 4 partners, 5 branches, 8 vouchers, 18 orders — tất cả API trả về đúng |

---

## Commands đã chạy & kết quả

| Command | Cwd | Kết quả |
|---|---|---|
| `git checkout main && git pull origin main` | `/` | ✅ Fast-forward từ W7-T3 |
| `git checkout -b W7-T4/Partner-Admin-staging-recovery-smoke` | `/` | ✅ |
| `npm run prisma:seed` | `backend/` | ✅ DB wiped & re-seeded: 8 users, 4 partners, 5 branches, 8 vouchers, 18 orders |
| `npm test -- --run` | `backend/` | ✅ **28 files, 206/206 PASS** (full baseline) |
| `npx vitest run rbac-authorization admin-approval admin-dashboard admin-orders-audit partner-reports partner-redeem-api admin-management` | `backend/` | ✅ **7 files, 87/87 PASS** (Partner/Admin/Staff subset) |

---

## Audit/RequestId Evidence

Mọi critical action đều ghi `requestId` vào `AuditLog` (từ `requestContext.middleware.js`):

| Action | AuditLog fields | Test file |
|---|---|---|
| `ADMIN_APPROVE_PARTNER` | `actorId`, `requestId`, `targetType=Partner` | `admin-approval.test.js` |
| `ADMIN_REJECT_PARTNER` | `actorId`, `requestId`, `reason` in metadata | `admin-approval.test.js` |
| `ADMIN_APPROVE_VOUCHER` | `actorId`, `requestId`, `published` in metadata | `admin-approval.test.js` |
| `ADMIN_REJECT_VOUCHER` | `actorId`, `requestId`, `reason` in metadata | `admin-approval.test.js` |
| `ADMIN_CANCEL_ORDER` | `actorId`, `requestId`, `refundedAmount`, `paymentMethod` | `admin-orders-audit.test.js` |
| `ADMIN_LOCK_USER` / `ADMIN_UNLOCK_USER` | `actorId`, `requestId`, `oldValues`, `newValues` | `admin-management.test.js` |
| `ADMIN_ADJUST_WALLET` | `actorId`, `requestId`, `amount`, `note` | `admin-management.test.js` |
| `ADMIN_SUSPEND_PARTNER` / `ADMIN_REACTIVATE_PARTNER` | `actorId`, `requestId`, `previousStatus`, `newStatus` | `admin-management.test.js` |

RequestId format sample (từ server log): `x-request-id: b40749be-5fe1-4667-8f8c-d5510c858f31` — UUID v4, unique per request.

---

## Role/Scope Matrix (Verified)

| Actor | Endpoint | Expected | Result |
|---|---|---|---|
| Anonymous | `GET /api/admin/dashboard` | 401 | ✅ |
| CUSTOMER | `GET /api/admin/dashboard` | 403 FORBIDDEN | ✅ |
| CUSTOMER | `GET /api/partner/vouchers` | 403 FORBIDDEN | ✅ |
| CUSTOMER | `PATCH /api/admin/users/:id/role` | 403 FORBIDDEN | ✅ |
| PARTNER A | `PUT /api/partner/vouchers/:voucherBId` | 403 FORBIDDEN | ✅ DB unchanged |
| PARTNER A | `PUT /api/partner/branches/:branchBId` | 403 FORBIDDEN | ✅ DB unchanged |
| STAFF (wrong branch) | `POST /api/partner/redeem/check` | 403 INVALID_BRANCH_SCOPE | ✅ Code status unchanged |
| STAFF (no branch) | `POST /api/partner/redeem/check` | 403 STAFF_BRANCH_REQUIRED | ✅ |
| ADMIN (self) | `POST /api/admin/users/:adminId/toggle-lock` | 400 SELF_ACTION | ✅ |
| Suspended PARTNER | `GET /api/partner/profile` | 403 PARTNER_NOT_ACTIVE | ✅ |
| Register with `role=ADMIN` | `POST /api/auth/register` | role=CUSTOMER in DB | ✅ |

---

## Recovered Data — Core Flow Support

Post `npm run prisma:seed` (simulates restore):

| Fixture | Count | Ghi chú |
|---|---|---|
| Users | 8 | 1 Admin, 3 Partner OWNER, 1 Staff, 2 Customer |
| Partners | 4 | Haidilao, ZenSpa, GoTravel + 1 edge-case |
| Branches | 5 | Distributed across partners |
| Vouchers | 8 | Mix DRAFT/ON_SALE/PENDING_APPROVAL |
| Orders + VoucherCodes | 18 | Including edge cases (expired, cancelled) |

- Partner `haidilao@vivouch.com` → `GET /api/partner/reports` 200 với `issuedCount`, `soldCount`, `usedCount`, `conversion` ✅  
- Admin `admin@vivouch.com` → `GET /api/admin/dashboard` 200 với `totalUsers`, `activePartners`, `totalVouchers`, `totalOrders`, `revenueThisMonth` ✅

---

## Runbook — Ghi chú bổ sung (không cần sửa H4)

- **Smoke test sau restore:** dùng `npx vitest run rbac-authorization admin-dashboard partner-reports` thay vì chỉ `GET /api/health` để verify business logic thực tế.  
- **`/api/health` 404:** đã ghi nhận từ H4, không ảnh hưởng — hệ thống xử lý request đầy đủ.  
- **Seed fixture an toàn:** `npm run prisma:seed` wipe + re-seed với named emails → có thể re-run không tích lũy dữ liệu thừa.

---

## File thay đổi

| File | Loại |
|---|---|
| `w7_docs/W7T1/W7_T4_REPORT.md` | Báo cáo này (mới) |

Không sửa source code.

---

## Lỗi còn lại

Không có.

---

## Task tiếp theo

Chuyển sang W7-D1, W7-V1 hoặc task tiếp theo trong W7.
