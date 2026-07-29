# W6-T1 — Portal Route Smoke Report

**Task:** W6-T1 — Partner/Admin compatibility & permission matrix  
**Owner:** Tùng  
**Branch:** main  
**SHA:** 66e305ed1691279d293361d570ef39e638df3acd  
**Reviewed at:** 2026-07-29T12:31 ICT  
**Method:** Static code analysis (backend route files + frontend AppRoutes.jsx + guards)

---

## Kết quả tổng hợp

| Role | Direct URL bypass | API bypass | Menu overflow | Status |
|---|---|---|---|---|
| ADMIN | ✅ BLOCKED (403 nếu không có token) | ✅ BLOCKED (requireRole ADMIN) | n/a — tất cả menu đúng role | **PASS** |
| Partner OWNER (approved) | ✅ Routes chính có PartnerOwnerRoute | ✅ BLOCKED requirePartnerOwner | ✅ Menu đầy đủ | **PASS** |
| Partner STAFF (approved) | ⚠️ /partner/validation accessible (UI render, API deny) | ✅ BLOCKED requirePartnerMember approved | ✅ Menu chỉ Xác thực/Lịch sử | **PARTIAL** |
| Partner PENDING (any role) | ⚠️ /partner/validation accessible (UI render, API deny) | ✅ BLOCKED (requireApproved=true) | ✅ Menu chỉ Trạng thái/Thông báo | **PARTIAL** |
| CUSTOMER | ✅ redirect sang /customer | ✅ 403 trên /api/admin, /api/partner | n/a | **PASS** |
| Anonymous | ✅ redirect sang /login | ✅ 401 UNAUTHORIZED | n/a | **PASS** |

---

## 1. Admin Portal Smoke

### 1.1. Route inventory đối chiếu AppRoutes ↔ AdminLayout menu

| Menu label | Frontend route | Backend endpoint | Match? |
|---|---|---|---|
| Tổng quan | `/admin/dashboard` | `GET /api/admin/dashboard` | ✅ |
| Người dùng | `/admin/users` | `GET /api/admin/users` | ✅ |
| Đối tác | `/admin/partners` | `GET /api/admin/partners` | ✅ |
| Voucher | `/admin/vouchers` | `GET /api/admin/vouchers` | ✅ |
| Đơn hàng | `/admin/orders` | `GET /api/admin/orders` | ✅ |
| Hoàn tiền | `/admin/refunds` | `GET /api/admin/refunds` | ✅ |
| Hỗ trợ | `/admin/tickets` | `GET /api/admin/tickets` | ✅ |
| Thông báo | `/admin/notifications` | `GET /api/notifications` | ✅ |
| Nội dung | `/admin/content` | `GET /api/admin/content/*` | ✅ |
| Nhật ký | `/admin/audit` | `GET /api/admin/audit-logs` | ✅ |

> **Không có menu item nào thiếu backend endpoint.**

### 1.2. Admin routes không có menu (orphan check)

Backend có các endpoints không có menu tương ứng:
- `POST /api/admin/partners/:id/approve` — action button trên PartnersPage ✅
- `POST /api/admin/vouchers/:id/approve` — action button trên VoucherApprovalsPage ✅
- `POST /api/admin/users/:id/toggle-lock` — action button trên UsersPage ✅
- `PATCH /api/admin/users/:id/role` — action button trên UsersPage ✅
- `POST /api/admin/users/:id/wallet-adjust` — action button trên UsersPage ✅
- `GET /api/admin/orders/:id` — detail view ✅
- `POST /api/admin/orders/:id/cancel` — action button ✅

> Tất cả đều hợp lý — là action endpoints, không cần route menu riêng.

### 1.3. Direct URL test (static analysis)

| Scenario | Expected | Guard | Result |
|---|---|---|---|
| Anonymous → `/admin/dashboard` | redirect `/login` | `ProtectedRoute` | ✅ |
| CUSTOMER → `/admin/dashboard` | redirect `/customer/home` | `RoleRoute(['ADMIN'])` | ✅ |
| PARTNER → `/admin/dashboard` | redirect `/partner/...` | `RoleRoute(['ADMIN'])` | ✅ |
| ADMIN → `/admin/dashboard` | render page | - | ✅ |
| ADMIN `curl /api/admin/dashboard` no token | 401 UNAUTHORIZED | `verifyToken` | ✅ |
| CUSTOMER token `curl /api/admin/users` | 403 FORBIDDEN | `requireRole('ADMIN')` | ✅ |

---

## 2. Partner Portal Smoke

### 2.1. Route inventory đối chiếu AppRoutes ↔ PartnerLayout menu

**OWNER menu:**

| Menu label | Frontend route | Backend endpoint | PartnerOwnerRoute? |
|---|---|---|---|
| Tổng quan | `/partner/dashboard` | `GET /api/admin/dashboard` (partner stats) | ✅ |
| Voucher của tôi | `/partner/vouchers` | `GET /api/partner/vouchers` | ✅ |
| Chi nhánh | `/partner/branches` | `GET /api/partner/branches` | ✅ |
| Nhân viên | `/partner/staff` | `GET /api/partner/staff` | ✅ |
| Xác thực | `/partner/validation` | `POST /api/partner/redeem/*` | route KHÔNG có OwnerRoute guard |
| Báo cáo | `/partner/reports` | `GET /api/partner/reports` | ✅ |
| Thông báo | `/partner/notifications` | `GET /api/notifications` | ✅ |
| Cài đặt | `/partner/profile` | `GET /api/partner/profile` | ✅ |

**STAFF menu:**

| Menu label | Frontend route | Backend | PartnerOwnerRoute? |
|---|---|---|---|
| Xác thực voucher | `/partner/validation` | `POST /api/partner/redeem/*` | ❌ (không có — đúng thiết kế) |
| Lịch sử đổi mã | `/partner/redeem-history` | `GET /api/partner/staff/me/redeem-history` | ❌ (không có — đúng thiết kế) |
| Thông báo | `/partner/notifications` | `GET /api/notifications` | ✅ |
| Hồ sơ | `/partner/profile` | `GET /api/partner/profile` | ✅ |

### 2.2. Partner PENDING redirect

**Từ `roleLanding.js`:**
```javascript
if (!membership || membership.partner?.status !== 'APPROVED') return '/partner/profile';
```
- Partner pending → landing = `/partner/profile` ✅

**Từ `PartnerLayout.jsx`:**
- `!partnerApproved` → menu chỉ có "Trạng thái hồ sơ" và "Thông báo" ✅

**Gap:** Direct URL `/partner/validation` khi pending → frontend LOAD trang, sau đó API call bị 403. **Không có frontend guard** chặn trước khi render.

### 2.3. Direct URL test matrix

| Scenario | URL | Expected | Actual (static) | Status |
|---|---|---|---|---|
| STAFF → Owner page | `/partner/dashboard` | PartnerOwnerRoute → redirect | ✅ redirect | PASS |
| STAFF → Owner page | `/partner/vouchers` | PartnerOwnerRoute → redirect | ✅ redirect | PASS |
| STAFF → Owner page | `/partner/staff` | PartnerOwnerRoute → redirect | ✅ redirect | PASS |
| STAFF → Own page | `/partner/validation` | Render | ✅ render | PASS |
| STAFF → Own page | `/partner/redeem-history` | Render | ✅ render | PASS |
| PENDING → Own page | `/partner/profile` | Render | ✅ render | PASS |
| PENDING → Ops page | `/partner/validation` | Should redirect | ⚠️ RENDERS (API deny ok) | GAP-01 |
| PENDING → Ops page | `/partner/redeem-history` | Should redirect | ⚠️ RENDERS (API deny ok) | GAP-01 |
| Anonymous → partner | `/partner/dashboard` | `/login` | ✅ | PASS |
| CUSTOMER → partner | `/partner/dashboard` | `/customer/home` | ✅ | PASS |

### 2.4. API deny sampling (expected responses)

| Scenario | Endpoint | Expected code | Backend guard |
|---|---|---|---|
| No token | `GET /api/partner/profile` | 401 UNAUTHORIZED | verifyToken |
| CUSTOMER token | `POST /api/partner/vouchers` | 403 FORBIDDEN | requireRole('PARTNER') |
| STAFF token | `GET /api/partner/vouchers` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() |
| STAFF token | `POST /api/partner/branches` | 403 PARTNER_OWNER_REQUIRED | requirePartnerOwner() |
| PENDING member | `POST /api/partner/redeem/check` | 403 PARTNER_NOT_ACTIVE | requirePartnerMember() → assertActivePartner |
| STAFF wrong branch | `POST /api/partner/redeem/confirm` (branchId khác) | 403 INVALID_BRANCH_SCOPE | redeem.service → assertAccess |
| PARTNER token | `GET /api/admin/users` | 403 FORBIDDEN | requireRole('ADMIN') |

---

## 3. Staff Management Smoke

### 3.1. Tạo Staff flow

```
Owner POST /api/partner/staff  →  requirePartnerOwner()
  → createStaff() → prisma.$transaction:
      User(status=PENDING_VERIFICATION, role=PARTNER)
      PartnerMember(role=STAFF, status=INVITED, branchId=assigned)
      auditLog(PARTNER_CREATE_STAFF)
  → issueOtp(STAFF_SETUP)
  → queueEmail(STAFF_ACCOUNT_CREATED)
```

- **OTP/email fail không rollback business transaction** ✅ (delivery flag ghi lại)
- **Staff được gán đúng branchId từ request**, không thể tự khai branchId tuỳ ý ✅

### 3.2. Staff activation flow

Staff nhận email → `/staff/setup` (public route) → verify OTP → set password → login  
Sau login: `status=ACTIVE`, `mustChangePassword=false`

### 3.3. Staff deactivation

```
Owner PATCH /api/partner/staff/:id → requirePartnerOwner()
  → updateStaff() → status=INACTIVE
  → user.status = LOCKED
```
- Deactivation immediate (JWT expiry sau đó) — **không invalidate existing JWT** ⚠️
- Nhưng `verifyToken` check `user.status !== 'ACTIVE'` → 403 ACCOUNT_LOCKED tại request tiếp theo ✅

---

## 4. Acceptance Checklist

| Criterion | Status | Evidence |
|---|---|---|
| Direct URL không vượt quyền (backend) | ✅ PASS | verifyToken + requireRole + requirePartnerOwner chains |
| Direct URL không vượt quyền (frontend) | ⚠️ PARTIAL | PartnerOwnerRoute đúng; pending/redeem gap GAP-01 |
| STAFF chỉ thấy nghiệp vụ branch | ✅ PASS | Menu filter + PartnerOwnerRoute + assertAccess branch scope |
| Partner pending không vào vận hành | ✅ PASS (API) | requirePartnerMember(requireApproved=true) block |
| Partner pending không vào vận hành | ⚠️ PARTIAL (UI) | Frontend render trang trước khi API deny — GAP-01 |

---

## 5. Risk tồn đọng

| ID | Description | Mức | Owner |
|---|---|---|---|
| GAP-01 | `/partner/validation` và `/partner/redeem-history` không có pending-check guard ở frontend | LOW | W6-T2 hoặc fix nhỏ trong sprint |
| GAP-02 | JWT không bị invalidate ngay khi Staff bị deactivate — chờ token expiry | ACCEPTABLE | Documented, trong scope W7 (Redis blacklist) |
| GAP-03 | `adminRefundRouter`/`adminTicketRouter` không có `verifyToken` riêng — dựa vào admin.routes mount | ✅ OK | Inheritance đúng |
