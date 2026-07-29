# W6-T1 — Permission Matrix UI/API

**Task:** W6-T1 — Partner/Admin compatibility & permission matrix  
**Owner:** Tùng — Partner / Admin Operations  
**Branch:** main  
**SHA:** 66e305ed1691279d293361d570ef39e638df3acd  
**Reviewed at:** 2026-07-29T12:31 ICT  

---

## 1. Tổng quan kiến trúc RBAC

### 1.1. Các lớp bảo vệ backend

| Layer | File | Mô tả |
|---|---|---|
| JWT verify | `auth.middleware.js` | Xác thực token, load `req.user.{userId, role}`, từ chối nếu user không ACTIVE |
| Role check | `role.middleware.js` | `requireRole(...roles)` — 403 FORBIDDEN nếu role không khớp |
| Partner member | `partnerAccess.middleware.js` | `requirePartnerMember()` — cần PartnerMember ACTIVE + (tuỳ chọn) partner APPROVED |
| Partner owner | `partnerAccess.middleware.js` | `requirePartnerOwner()` — cần member ACTIVE + role=OWNER + (tuỳ chọn) APPROVED |
| Branch scope | `redeem.service.js → assertAccess()` | STAFF chỉ redeem tại branchId được phân công |

### 1.2. Các lớp bảo vệ frontend (React Router)

| Guard | File | Mô tả |
|---|---|---|
| `ProtectedRoute` | `routes/ProtectedRoute.jsx` | Redirect `/login` nếu `isAuthenticated = false` |
| `RoleRoute` | `routes/RoleRoute.jsx` | Redirect về landing path nếu `user.role` không trong `allowedRoles` |
| `PartnerOwnerRoute` | `routes/PartnerOwnerRoute.jsx` | Gọi `isApprovedPartnerOwner(user)` — cần role=PARTNER, membership.role=OWNER, membership.status=ACTIVE, partner.status=APPROVED |
| Menu filter | `layouts/PartnerLayout.jsx` | Sidebar khác nhau cho pending/STAFF/OWNER — `isOwner`, `partnerApproved` |

---

## 2. Permission Matrix — API Endpoints

### 2.1. Admin routes — `GET|POST /api/admin/*`

**Gate toàn bộ:** `verifyToken` → `requireRole('ADMIN')`

| Endpoint | Method | Guard | Notes |
|---|---|---|---|
| `/api/admin/dashboard` | GET | ADMIN only | Stats tổng quan |
| `/api/admin/partners` | GET | ADMIN only | List tất cả partner |
| `/api/admin/partners/:id/approve` | POST | ADMIN only | Duyệt partner |
| `/api/admin/partners/:id/reject` | POST | ADMIN only | Từ chối partner |
| `/api/admin/partners/:id/status` | PATCH | ADMIN only | Đổi status partner |
| `/api/admin/vouchers` | GET | ADMIN only | List voucher chờ duyệt |
| `/api/admin/vouchers/:id/approve` | POST | ADMIN only | Duyệt voucher |
| `/api/admin/vouchers/:id/reject` | POST | ADMIN only | Từ chối voucher |
| `/api/admin/users` | GET | ADMIN only | List users |
| `/api/admin/users/:id/toggle-lock` | POST | ADMIN only | Lock/unlock user |
| `/api/admin/users/:id/role` | PATCH | ADMIN only | Gán role |
| `/api/admin/users/:id/wallet-adjust` | POST | ADMIN only | Điều chỉnh ví |
| `/api/admin/orders` | GET | ADMIN only | List orders |
| `/api/admin/orders/:id` | GET | ADMIN only | Chi tiết order |
| `/api/admin/orders/:id/cancel` | POST | ADMIN only | Huỷ order |
| `/api/admin/audit-logs` | GET | ADMIN only | Nhật ký hệ thống |
| `/api/admin/refunds` | GET | ADMIN only | List refund (via adminRefundRouter) |
| `/api/admin/refunds/:id/approve` | POST | ADMIN only | Duyệt hoàn tiền |
| `/api/admin/refunds/:id/reject` | POST | ADMIN only | Từ chối hoàn tiền |
| `/api/admin/refunds/:id/complete` | POST | ADMIN only | Hoàn thành hoàn tiền |
| `/api/admin/tickets` | GET | ADMIN only | List support tickets |
| `/api/admin/tickets/:id/respond` | POST | ADMIN only | Trả lời ticket |
| `/api/admin/content/categories` | GET/POST/PATCH/DELETE | ADMIN only | CMS categories |
| `/api/admin/content/pages` | GET/POST/PATCH/DELETE | ADMIN only | CMS pages |
| `/api/admin/content/banners` | GET/POST/PATCH/DELETE | ADMIN only | CMS banners |

> ✅ **Nhận xét:** `adminRefundRouter` và `adminTicketRouter` được mount trong `admin.routes.js` dưới `router.use(verifyToken, requireRole('ADMIN'))` — inheritance guard đúng.

### 2.2. Partner routes — `GET|POST /api/partner/*`

**Gate router-level:** `verifyToken` → `requireRole('PARTNER')`

| Endpoint | Method | Extra Guard | OWNER | STAFF | PENDING |
|---|---|---|---|---|---|
| `/api/partner/profile` | GET | `requirePartnerMember({requireApproved: false})` | ✅ | ✅ | ✅ (nếu member) |
| `/api/partner/profile` | PUT | `requirePartnerOwner({requireApproved: false})` | ✅ | ❌ 403 | ✅ (owner pending) |
| `/api/partner/branches` | GET | `requirePartnerMember()` (approved) | ✅ | ✅ | ❌ 403 |
| `/api/partner/branches` | POST | `requirePartnerOwner()` (approved) | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/branches/:id` | PUT | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/branches/:id` | DELETE | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/vouchers` | GET | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/vouchers` | POST | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/vouchers/:id` | PUT | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/vouchers/:id/submit` | POST | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/redeem/check` | POST | `requirePartnerMember()` + rate limit | ✅ | ✅ | ❌ 403 |
| `/api/partner/redeem/confirm` | POST | `requirePartnerMember()` + rate limit | ✅ | ✅ | ❌ 403 |
| `/api/partner/redeem` | POST | `requirePartnerMember()` + rate limit | ✅ | ✅ | ❌ 403 |
| `/api/partner/staff` | GET | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/staff` | POST | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/staff/:id` | PATCH | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |
| `/api/partner/staff/me/redeem-history` | GET | `requirePartnerMember()` | ✅ | ✅ | ❌ 403 |
| `/api/partner/reports` | GET | `requirePartnerOwner()` | ✅ | ❌ 403 | ❌ 403 |

> ⚠️ **Vấn đề phát hiện P1:** `GET /api/partner/branches` dùng `requirePartnerMember()` (requireApproved mặc định = true). STAFF có `branchId` nhưng service `getBranches()` filter đúng theo scope (`access.role === 'STAFF' ? { id: access.branchId }` ). Đây là thiết kế đúng.

### 2.3. Customer routes

| Prefix | Guard | Ghi chú |
|---|---|---|
| `/api/customer/cart` | `verifyToken` + `requireRole('CUSTOMER')` | Giỏ hàng |
| `/api/customer/orders` | `verifyToken` + `requireRole('CUSTOMER')` | Đơn hàng |
| `/api/customer/refunds` | `verifyToken` + `requireRole('CUSTOMER')` | Hoàn tiền customer |
| `/api/customer/tickets` | `verifyToken` + `requireRole('CUSTOMER')` | Ticket customer |

### 2.4. Public routes (không cần auth)

| Endpoint | Auth | Notes |
|---|---|---|
| `/api/vouchers` | Không | Browse danh sách |
| `/api/vouchers/:id` | Không | Chi tiết voucher |
| `/api/categories` | Không | Danh mục |
| `/api/content` | Không | CMS public |
| `/api/auth/*` | Không | Login/register/OTP |
| `/api/payments/callback` | Không (signed) | payOS webhook — xác thực bằng signature |
| `/health`, `/health/live`, `/health/ready` | Không | Health check |

---

## 3. Permission Matrix — Frontend Routes

### 3.1. Admin Portal — `/admin/*`

**Gate:** `ProtectedRoute` → `RoleRoute(['ADMIN'])`

| Route | Page | Guard |
|---|---|---|
| `/admin/dashboard` | `AdminDashboardPage` | ADMIN role |
| `/admin/users` | `UsersPage` | ADMIN role |
| `/admin/partners` | `PartnersPage` | ADMIN role |
| `/admin/vouchers` | `VoucherApprovalsPage` | ADMIN role |
| `/admin/orders` | `OrdersPage` | ADMIN role |
| `/admin/refunds` | `RefundsPage` | ADMIN role |
| `/admin/tickets` | `SupportTicketsPage` | ADMIN role |
| `/admin/notifications` | `NotificationsPage` | ADMIN role |
| `/admin/audit` | `AuditLogsPage` | ADMIN role |
| `/admin/content` | `CmsPagesPage` | ADMIN role |

**Admin sidebar menu items** (từ `AdminLayout.jsx`):
- Tổng quan, Người dùng, Đối tác, Voucher, Đơn hàng, Hoàn tiền, Hỗ trợ, Thông báo, Nội dung, Nhật ký

> ✅ Tất cả routes đều được bảo vệ đúng. Không có route admin nào accessible mà không cần ADMIN role.

### 3.2. Partner Portal — `/partner/*`

**Gate router:** `ProtectedRoute` → `RoleRoute(['PARTNER'])`

| Route | Page | Extra Guard | OWNER | STAFF | PENDING |
|---|---|---|---|---|---|
| `/partner` (index) | `PartnerLandingRedirect` | None | → dashboard | → validation | → profile |
| `/partner/dashboard` | `PartnerDashboardPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/vouchers/new` | `CreateVoucherPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/vouchers/:id/edit` | `CreateVoucherPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/vouchers` | `PartnerVoucherListPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/branches` | `BranchesPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/staff` | `StaffManagementPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/reports` | `PartnerReportsPage` | `PartnerOwnerRoute` | ✅ | ❌ redirect | ❌ redirect |
| `/partner/validation` | `RedeemVoucherPage` | None (PARTNER role only) | ✅ | ✅ | ❌* |
| `/partner/redeem-history` | `StaffRedeemHistoryPage` | None (PARTNER role only) | ✅ | ✅ | ❌* |
| `/partner/notifications` | `NotificationsPage` | None (PARTNER role only) | ✅ | ✅ | ✅ (menu visible) |
| `/partner/profile` | `PartnerProfilePage` | None (PARTNER role only) | ✅ | ✅ | ✅ |

> ⚠️ `*` — `/partner/validation` và `/partner/redeem-history`: không có `PartnerOwnerRoute` guard ở frontend. Partner pending có thể điều hướng URL trực tiếp và thấy trang. **Backend sẽ chặn** nhờ `requirePartnerMember()` (requireApproved=true). Tuy nhiên đây là **UI gap**: pending user thấy màn hình redeem.

**Partner sidebar menu (PartnerLayout.jsx):**

| Trạng thái | Menu hiển thị |
|---|---|
| `!partnerApproved` | Trạng thái hồ sơ, Thông báo |
| `isStaff` (approved) | Xác thực voucher, Lịch sử đổi mã, Thông báo, Hồ sơ |
| `isOwner` (approved) | Tổng quan, Voucher, Chi nhánh, Nhân viên, Xác thực, Báo cáo, Thông báo, Cài đặt |

---

## 4. PartnerOwnerRoute — Điều kiện isApprovedPartnerOwner

Từ `roleLanding.js`:

```javascript
export function isApprovedPartnerOwner(user) {
  const membership = user?.partnerMemberships?.[0];
  return user?.role === 'PARTNER'
    && membership?.role === 'OWNER'
    && membership?.status === 'ACTIVE'
    && membership?.partner?.status === 'APPROVED';
}
```

**Các trường hợp trả về false (bị redirect):**
- `user.role !== 'PARTNER'`
- `membership === undefined` (chưa có membership)
- `membership.role === 'STAFF'`
- `membership.status !== 'ACTIVE'` (INVITED, INACTIVE)
- `membership.partner.status !== 'APPROVED'` (PENDING, REJECTED, SUSPENDED)

---

## 5. Redeem branch scope enforcement

Từ `redeem.service.js → assertAccess()`:

```javascript
function assertAccess(access, branchId) {
  if (!access || access.status !== 'ACTIVE' || access.partner.status !== 'APPROVED') {
    throw new AppError('...', 403, 'PARTNER_NOT_ACTIVE');
  }
  if (access.role === 'STAFF' && access.branchId !== branchId) {
    throw new AppError('Nhân viên chỉ được redeem tại chi nhánh được phân công', 403, 'INVALID_BRANCH_SCOPE');
  }
}
```

- STAFF chỉ được redeem tại branch được phân công (so sánh `access.branchId !== branchId`)
- OWNER không bị giới hạn branch trong assertAccess
- Sau đó `getRedeemBranch()` kiểm tra `branchId` phải thuộc `partnerId` và `isActive`

---

## 6. Findings tổng hợp

| ID | Mức | Mô tả | Backend | Frontend | Đề xuất |
|---|---|---|---|---|---|
| F-01 | INFO | Partner pending có thể truy cập `/partner/validation` direct URL | ✅ blocked (403) | ⚠️ trang load, gọi API mới bị chặn | Thêm guard PENDING check ở `RedeemVoucherPage` hoặc một route guard riêng |
| F-02 | INFO | Partner pending truy cập `/partner/redeem-history` | ✅ blocked (403 via requirePartnerMember) | ⚠️ UI render, API fail | Tương tự F-01 |
| F-03 | ✅ PASS | STAFF không thể GET `/api/partner/vouchers` | ✅ 403 OWNER_REQUIRED | ✅ menu không hiển thị | - |
| F-04 | ✅ PASS | STAFF không thể POST branch/staff/voucher | ✅ 403 | ✅ menu ẩn | - |
| F-05 | ✅ PASS | STAFF chỉ thấy branch của mình trong getBranches | ✅ filter `access.branchId` | ✅ | - |
| F-06 | ✅ PASS | STAFF redeem sai branch bị chặn backend | ✅ 403 INVALID_BRANCH_SCOPE | n/a | - |
| F-07 | ✅ PASS | Admin routes inherited auth đúng (refundRouter/ticketRouter) | ✅ | ✅ | - |
| F-08 | ✅ PASS | CUSTOMER không thể truy cập `/api/admin/*` | ✅ 403 | ✅ redirect | - |
| F-09 | ✅ PASS | PARTNER không thể truy cập `/api/admin/*` | ✅ 403 | ✅ redirect | - |
| F-10 | ✅ PASS | Commission report chỉ Owner mới xem được | ✅ `requirePartnerOwner()` | ✅ menu ẩn với STAFF | - |
