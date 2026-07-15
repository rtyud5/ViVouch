# W5-D1 — Role Matrix: Customer / Partner / Admin

**Baseline commit:** `e016793` (branch `pre-w5-w7-strong-fix`)
**Date:** 2026-07-14
**Source:** BRD `agent-docs/01_project_requirements/03_roles_and_permissions.md` cross-referenced with live code

---

## 1. Role Definitions

| Role | DB Value | Description | Test Account |
|:-----|:---------|:-----------|:-------------|
| **Customer** | `CUSTOMER` | End user who browses, purchases vouchers, views codes, writes reviews. | `customer1@test.com` / `Test@123` |
| **Partner** | `PARTNER` | Business that creates voucher campaigns, manages profile, redeems codes. | `haidilao@vivouch.com` / `Partner@123` |
| **Admin** | `ADMIN` | Platform operator who approves partners/vouchers, manages users, views reports. | `admin@vivouch.com` / `Admin@123` |

---

## 2. Permission Matrix — Capability × Role

### 2.1 Authentication & Account

| Capability | Public | Customer | Partner | Admin | BE Enforcement | FE Guard |
|:-----------|:------:|:--------:|:-------:|:-----:|:---------------|:---------|
| Register customer account | ✅ | — | — | — | `POST /api/auth/register` | `RegisterPage` |
| Login / Logout | ✅ | ✅ | ✅ | ✅ | `POST /api/auth/login`, `/logout` | `LoginPage` |
| Refresh token | — | ✅ | ✅ | ✅ | `POST /api/auth/refresh` | `apiClient` interceptor |
| Update own profile | — | ✅ | ✅ | ✅ | `PUT /api/users/me` | `ProfilePage`, `PartnerProfilePage` |
| Change password | — | ✅ | ✅ | ✅ | `POST /api/users/me/change-password` | `ProfilePage` |

**BE middleware chain:** `auth.middleware.js → requireAuth` → extracts JWT → verifies user exists and not locked (strong-fix rejects locked users).

---

### 2.2 Voucher Browsing & Purchase (Customer Flow)

| Capability | Public | Customer | Partner | Admin | BE Enforcement | FE Guard |
|:-----------|:------:|:--------:|:-------:|:-----:|:---------------|:---------|
| Browse public vouchers | ✅ | ✅ | ✅ | ✅ | `GET /api/vouchers` (public) | `VoucherListPage` |
| Search / filter vouchers | ✅ | ✅ | ✅ | ✅ | Query params: `?search=&category=` | `VoucherListPage` |
| View voucher detail | ✅ | ✅ | ✅ | ✅ | `GET /api/vouchers/:id` | `VoucherDetailPage` |
| Add to cart | — | ✅ | — | — | `POST /api/customer/cart` + `requireRole('CUSTOMER')` | `RoleRoute(['CUSTOMER'])` |
| View / manage cart | — | ✅ | — | — | `GET/PUT/DELETE /api/customer/cart` | `CartPage` |
| Checkout + payment | — | ✅ | — | — | `POST /api/customer/orders/checkout` + `requireRole('CUSTOMER')` | `CheckoutPage` |
| View own orders | — | ✅ | — | Admin: all | `GET /api/customer/orders` + ownership | `OrdersPage` (customer) |
| View own voucher codes | — | ✅ | — | Admin: all | `GET /api/customer/voucher-codes` + ownership | `MyVouchersPage` |
| Write review | — | ✅* | — | — | `POST /api/vouchers/:id/reviews` + purchase check | `VoucherDetailPage` |

*Review requires purchase/use (RB-10). Currently `userEligibility` not returned → B106.

---

### 2.3 Voucher Management (Partner Flow)

| Capability | Public | Customer | Partner | Admin | BE Enforcement | FE Guard |
|:-----------|:------:|:--------:|:-------:|:-----:|:---------------|:---------|
| View partner dashboard | — | — | ✅ | — | `GET /api/partner/dashboard` + `requireRole('PARTNER')` | `RoleRoute(['PARTNER'])` |
| Create voucher | — | — | ✅ | — | `POST /api/partner/vouchers` + partner status check | `CreateVoucherPage` |
| Submit voucher for approval | — | — | ✅ | — | `POST /api/partner/vouchers/:id/submit` + state machine | `PartnerVoucherListPage` |
| Edit own vouchers | — | — | ✅ (restricted) | — | `PUT /api/partner/vouchers/:id` + ownership + status check | `PartnerVoucherListPage` |
| List own vouchers | — | — | ✅ | — | `GET /api/partner/vouchers` + ownership filter | `PartnerVoucherListPage` |
| Check voucher code | — | — | ✅ (own scope) | — | `POST /api/partner/redeem/check` + partner scope | `RedeemVoucherPage` |
| Confirm redeem | — | — | ✅ (own scope) | — | `POST /api/partner/redeem/confirm` + partner scope + row lock | `RedeemVoucherPage` |
| View own reports | — | — | ✅ | — | `GET /api/partner/reports?range=` + ownership | `PartnerReportsPage` |
| Manage own profile | — | — | ✅ | — | `GET/PUT /api/partner/profile` + ownership | `PartnerProfilePage` |
| Manage branches | — | — | 🛑 Stub | — | BE: TODO stub | `BranchesPage` (stub) |

---

### 2.4 Platform Administration (Admin Flow)

| Capability | Public | Customer | Partner | Admin | BE Enforcement | FE Guard |
|:-----------|:------:|:--------:|:-------:|:-----:|:---------------|:---------|
| View admin dashboard | — | — | — | ✅ | `GET /api/admin/dashboard` + `requireRole('ADMIN')` | `RoleRoute(['ADMIN'])` |
| Manage users (list/search/lock) | — | — | — | ✅ | `GET /api/admin/users`, `PUT /api/admin/users/:id/status` | `UsersPage` |
| Manage partners (list/approve/ban) | — | — | — | ✅ | `GET /api/admin/partners`, `PUT /api/admin/partners/:id/status` | `PartnersPage` |
| Approve / reject vouchers | — | — | — | ✅ | `POST /api/admin/vouchers/:id/approve|reject` | `VoucherApprovalsPage` |
| Manage orders (list/view) | — | — | — | ✅ | `GET /api/admin/orders` | `OrdersPage` (admin) |
| View audit logs | — | — | — | ✅ | `auditLog.routes.js` = TODO stub (⚠️ B107) | `AuditLogsPage` |
| Manage content (CMS) | — | — | — | ⚪ OOS | Not implemented | `CategoriesPage` (stub), `CmsPagesPage` (stub) |

---

## 3. Backend RBAC Implementation Verification

### 3.1 Middleware Stack

| Middleware | File | Purpose | Status |
|:-----------|:-----|:--------|:------:|
| `requireAuth` | `auth.middleware.js` | Decode JWT, verify user exists: not locked/banned | ✅ |
| `requireRole(role)` | `role.middleware.js` | Check `req.user.role` matches required role | ✅ |
| `requireAnyRole(roles)` | `role.middleware.js` | Check `req.user.role` in allowed list | ✅ |

### 3.2 Route Protection Audit

| Route Group | Middleware Applied | Verified |
|:------------|:------------------|:--------:|
| `/api/auth/*` | Public (register, login) / `requireAuth` (refresh, logout) | ✅ |
| `/api/users/me` | `requireAuth` | ✅ |
| `/api/customer/*` | `requireAuth` + `requireRole('CUSTOMER')` | ✅ |
| `/api/partner/*` | `requireAuth` + `requireRole('PARTNER')` | ✅ |
| `/api/admin/*` | `requireAuth` + `requireRole('ADMIN')` | ✅ |
| `/api/vouchers` (public) | None (public read) | ✅ |
| `/api/vouchers/:id/reviews` (write) | `requireAuth` + `requireRole('CUSTOMER')` | ✅ |

### 3.3 Ownership Enforcement

| Check | Implementation | Status |
|:------|:--------------|:------:|
| Customer sees only own orders | `WHERE userId = req.user.id` | ✅ |
| Customer sees only own voucher codes | `WHERE order.userId = req.user.id` | ✅ |
| Partner manages only own vouchers | `WHERE partnerId = req.user.partnerId` | ✅ |
| Partner redeems only own-scope codes | Voucher ownership + branch check (strong-fix) | ✅ |
| Admin accesses all data | No ownership filter for admin | ✅ |

---

## 4. Frontend Route Guard Verification

| Guard Component | File | Logic | Status |
|:----------------|:-----|:------|:------:|
| `ProtectedRoute` | `routes/ProtectedRoute.jsx` | Redirects to `/login` if no auth token | ✅ |
| `RoleRoute` | `routes/RoleRoute.jsx` | Checks `user.role` against `allowedRoles` prop | ✅ |

| FE Route | Guard | Allowed Roles |
|:---------|:------|:-------------|
| `/customer/*` | `ProtectedRoute` → `RoleRoute` | `['CUSTOMER']` |
| `/partner/*` | `ProtectedRoute` → `RoleRoute` | `['PARTNER']` |
| `/admin/*` | `ProtectedRoute` → `RoleRoute` | `['ADMIN']` |
| `/checkout` | `ProtectedRoute` → `RoleRoute` | `['CUSTOMER']` |
| `/`, `/vouchers`, `/vouchers/:id` | None (public) | All |

---

## 5. Security Gaps & Risks (from RBAC perspective)

| Gap | Severity | Description | Mitigation Status |
|:----|:--------:|:-----------|:------------------|
| No rate limiting | P3 | Brute force login/register possible | `rateLimit.middleware.js` = TODO stub → Tech Debt W6 |
| JWT env validation | P3 | No hard fail if `JWT_ACCESS_SECRET` missing in production | Not enforced → Tech Debt W6 |
| Locked user token refresh | ✅ Fixed | Strong-fix rejects locked users on auth middleware + refreshes role from DB | `auth.middleware.js` updated |
| Cross-partner data access | ✅ Fixed | Partner scope check added to redeem flow (strong-fix) | `redeem` module updated |

---

## 6. Agent Implementation Warnings Compliance Check

| Warning | Status | Evidence |
|:--------|:------:|:---------|
| Do not rely on FE hidden buttons for security | ✅ | All sensitive routes have BE middleware |
| Do not trust `role` from request body | ✅ | Role from JWT only, verified from DB |
| Decode JWT and fetch user status from DB | ✅ | Strong-fix: `auth.middleware.js` checks user active status |
| Block locked/suspended users and partners | ✅ | Strong-fix: locked users rejected at auth layer |
| Check partner status before voucher creation/submission/redeem | ✅ | Strong-fix: partner status validated in voucher service |
