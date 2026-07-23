# W6–W7 Integration: Test Suite Fix Walkthrough

> **Branch:** `integration/w6-w7`  
> **Date:** 2026-07-24  
> **Status:** IN PROGRESS — 154 passed, 21 failed (down from 45+)

---

## 1. Problem Statement

After applying the W6–W7 source code (OTP, PartnerMember, Wallet, payOS, refund, etc.) into the repository, the full backend Vitest suite was failing with **45+ test failures**. The majority surfaced as `403 PARTNER_NOT_ACTIVE` or `403 ACCOUNT_LOCKED` errors, indicating a systemic issue rather than individual test bugs.

---

## 2. Root Cause Analysis

Two root causes were identified, plus a third category of **service API signature changes**:

### 2.1 Missing `status: 'ACTIVE'` on User Creation

W6–W7 introduced stricter enforcement in [auth.middleware.js](file:///d:/ViVouch/ViVouch/backend/src/middlewares/auth.middleware.js#L45-L47):

```javascript
if (user.status !== "ACTIVE") {
  return next(new AppError("Tài khoản đã bị khoá", 403, "ACCOUNT_LOCKED"));
}
```

The Prisma schema's `User.status` field defaults to `PENDING_VERIFICATION` (not `ACTIVE`). Pre-W6 tests created users via `prisma.user.create()` **without setting `status: 'ACTIVE'`**, relying on the old default. After W6, these users were immediately rejected at the auth layer with `ACCOUNT_LOCKED`.

### 2.2 Missing `PartnerMember` Records

W6–W7 introduced the `PartnerMember` model to support multi-member partner organizations (OWNER / STAFF). The [partnerAccess.middleware.js](file:///d:/ViVouch/ViVouch/backend/src/middlewares/partnerAccess.middleware.js) and [redeem.service.js](file:///d:/ViVouch/ViVouch/backend/src/modules/redeem/redeem.service.js#L26-L33) `assertAccess()` function now require an **ACTIVE PartnerMember** record linked to an **APPROVED Partner**:

```javascript
function assertAccess(access, branchId) {
  if (!access || access.status !== 'ACTIVE' || access.partner.status !== 'APPROVED') {
    throw new AppError('...', 403, 'PARTNER_NOT_ACTIVE');
  }
}
```

Old tests created `Partner` records but never created the corresponding `PartnerMember` entries, causing `PARTNER_NOT_ACTIVE` rejections.

### 2.3 Service API Signature Changes (partner-redeem.test.js)

The `redeemService.checkCode()` and `redeemService.redeemCode()` functions changed from a 3-parameter signature `(actorId, code, branchId)` to a 4-parameter signature `(actorId, access, code, branchId)`. The `partner-redeem.test.js` unit test calls the service directly with the old 3-arg signature, requiring the test to be updated to first load the `access` object and pass it as the second argument.

---

## 3. Fixes Applied

### 3.1 Completed Test File Fixes (6 files — all passing ✅)

| Test File | Changes | Result |
|-----------|---------|--------|
| [partner-redeem-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem-api.test.js) | Added `status: 'ACTIVE'` to 3 user creates + added `PartnerMember` for partner user | ✅ 12/12 |
| [cart.test.js](file:///d:/ViVouch/ViVouch/backend/tests/cart.test.js) | Added `status: 'ACTIVE'` to 3 user creates (UserA, UserB, PartnerUser) | ✅ 11/11 |
| [partner-vouchers-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-vouchers-api.test.js) | Added `status: 'ACTIVE'` to user create + added `PartnerMember` | ✅ 5/5 |
| [partner-reports.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-reports.test.js) | Added `status: 'ACTIVE'` to user create + added `PartnerMember` | ✅ 4/4 |
| [partner-branches-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-branches-api.test.js) | Added `status: 'ACTIVE'` to 2 user creates + added 2 `PartnerMember` records | ✅ 1/1 |
| [checkout-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/checkout-api.test.js) | Added `status: 'ACTIVE'` to 2 user creates | ✅ 4/5 (1 unrelated) |

### 3.2 In-Progress Fix (1 file — partially done)

| Test File | Changes | Status |
|-----------|---------|--------|
| [partner-redeem.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem.test.js) | Added `status: 'ACTIVE'` + `PartnerMember`. Still needs service call signature update (3-arg → 4-arg with `access` param) | 🔧 In Progress |

### 3.3 Pattern of Fix (Applied to API-level tests)

Every fix follows the same two-step pattern:

**Step A — User creation:** Add `status: 'ACTIVE'`

```diff
 const user = await prisma.user.create({
-  data: { email, fullName, passwordHash, role: 'PARTNER' }
+  data: { email, fullName, passwordHash, role: 'PARTNER', status: 'ACTIVE' }
 });
```

**Step B — PartnerMember creation** (for partner-role tests only):

```diff
+ await prisma.partnerMember.create({
+   data: { partnerId: partner.id, userId: user.id, role: 'OWNER', status: 'ACTIVE' }
+ });
```

---

## 4. Test Results Progress

| Run | Passed | Failed | Notes |
|-----|--------|--------|-------|
| Initial (pre-fix) | ~130 | 45+ | Systemic `ACCOUNT_LOCKED` / `PARTNER_NOT_ACTIVE` |
| After 6 files fixed | **154** | **21** | Core partner and cart tests passing |

---

## 5. Remaining Failures (21 tests) — Categorized

### Category A: Tests using `prisma.user.create()` without `status: 'ACTIVE'` (need same fix pattern)

| File | Users Created | Partners Created | Fix Required |
|------|--------------|-----------------|--------------|
| [partner-vouchers.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-vouchers.test.js) | 1 partner user | 1 partner | `status: 'ACTIVE'` + `PartnerMember` |
| [reviews-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/reviews-api.test.js) | 4 users (3 customers, 1 partner) | 1 partner | `status: 'ACTIVE'` on all 4 users |
| [reviews-service.test.js](file:///d:/ViVouch/ViVouch/backend/tests/reviews-service.test.js) | 3 users (2 customers, 1 partner) | 1 partner | `status: 'ACTIVE'` on all (service-level, no login) |
| [cart-service.test.js](file:///d:/ViVouch/ViVouch/backend/tests/cart-service.test.js) | 3 users (2 customers, 1 partner) | 1 partner | `status: 'ACTIVE'` on users (service-level, no login) |
| [admin-orders-audit.test.js](file:///d:/ViVouch/ViVouch/backend/tests/admin-orders-audit.test.js) | 1 partner user via `prisma.user.create` (not API register) | 1 partner | `status: 'ACTIVE'` on partner user |

### Category B: Tests using `/api/auth/register` (should be OK already)

These tests use the registration API which auto-sets `status: 'ACTIVE'` in test env (`EMAIL_VERIFICATION_REQUIRED = false`):

| File | Expected Status |
|------|----------------|
| [admin-approval.test.js](file:///d:/ViVouch/ViVouch/backend/tests/admin-approval.test.js) | Should pass ✅ |
| [admin-management.test.js](file:///d:/ViVouch/ViVouch/backend/tests/admin-management.test.js) | Should pass ✅ |
| [admin-dashboard.test.js](file:///d:/ViVouch/ViVouch/backend/tests/admin-dashboard.test.js) | Should pass ✅ |
| [users.test.js](file:///d:/ViVouch/ViVouch/backend/tests/users.test.js) | Should pass ✅ |
| [cms-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/cms-api.test.js) | Should pass ✅ |

### Category C: Service signature mismatch

| File | Issue |
|------|-------|
| [partner-redeem.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem.test.js) | `checkCode/redeemCode` now take `(actorId, access, code, branchId)` — 4 args. Test calls with 3 args. Must load `access` via `getPartnerAccessByUserId()` and pass it. |

### Category D: Prisma `$queryRaw` deserialization issue

| File | Issue |
|------|-------|
| [auth.test.js](file:///d:/ViVouch/ViVouch/backend/tests/auth.test.js) | OTP reset-password test: `pg_advisory_xact_lock()` returns void, Prisma `$queryRaw` cannot deserialize. Need to use `$executeRaw` instead of `$queryRaw` in [otp.service.js](file:///d:/ViVouch/ViVouch/backend/src/modules/otp/otp.service.js#L23). |

### Category E: Minor assertion mismatch

| File | Issue |
|------|-------|
| [checkout-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/checkout-api.test.js) | `buyNow` out-of-stock test — expected `400` got `400` but response body assertion doesn't match (likely assertion on code or message) |

---

## 6. Next Steps (Priority Order)

| Priority | Action | Impact |
|----------|--------|--------|
| **P0** | Apply `status: 'ACTIVE'` + `PartnerMember` to remaining Category A files (5 files) | ~10-12 tests fixed |
| **P1** | Fix `partner-redeem.test.js` service call signatures (Category C) | ~8 tests fixed |
| **P2** | Fix `pg_advisory_xact_lock` → use `$executeRaw` in `otp.service.js` (Category D) | 1 test fixed |
| **P3** | Investigate `checkout-api.test.js` buyNow assertion (Category E) | 1 test fixed |
| **P4** | Run full suite clean → verify 0 failures | Gate for GO status |
| **P5** | Run frontend tests + Node test runner | Gate for GO status |

---

## 7. Key Architectural Insight

> [!IMPORTANT]
> The W6–W7 migration introduced **three breaking changes** that affect the test suite:
> 1. **User `status` enforcement** — `auth.middleware.js` now rejects non-ACTIVE users with `ACCOUNT_LOCKED`.
> 2. **PartnerMember requirement** — Partner operations now require a `PartnerMember` record with `status = 'ACTIVE'` linked to an `APPROVED` Partner.
> 3. **Service API signature change** — `redeemService.checkCode/redeemCode` now require an `access` object as the 2nd parameter (loaded via `getPartnerAccessByUserId()`).

The [seed.js](file:///d:/ViVouch/ViVouch/backend/prisma/seed.js) was already updated correctly for all three patterns, but the integration tests were written against the pre-W6 schema.

---

## 8. Files Modified So Far

| File | Type | Change |
|------|------|--------|
| [partner-redeem-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem-api.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` |
| [cart.test.js](file:///d:/ViVouch/ViVouch/backend/tests/cart.test.js) | Test | `status: 'ACTIVE'` |
| [partner-vouchers-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-vouchers-api.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` |
| [partner-reports.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-reports.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` |
| [partner-branches-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-branches-api.test.js) | Test | `status: 'ACTIVE'` + 2× `PartnerMember` |
| [checkout-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/checkout-api.test.js) | Test | `status: 'ACTIVE'` |
| [partner-redeem.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` (partial — still needs 4-arg signature fix) |
