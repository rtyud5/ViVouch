# W6-T2 — Portal Integration Fixes Report

## 1. Context & Objectives

Sprint W6-T2 focuses on fixing portal integration gaps identified during W6-T1 static analysis and ensuring strict end-to-end enforcement of Partner Owner & Branch Staff roles across registration, approval, staff creation, and navigation.

---

## 2. Identified & Resolved Gaps

### GAP-01: Direct Access to Operation Routes when Pending/Rejected/Inactive
- **Issue:** Previously, pending partner owners or deactivated staff could type `/partner/validation` or `/partner/redeem-history` directly into the address bar, causing the UI to render before backend API returned 403.
- **Fix:**
  - Added `isApprovedPartnerMember` guard helper in `frontend/src/utils/roleLanding.js`.
  - Created `PartnerApprovedMemberRoute` guard component in `frontend/src/routes/PartnerApprovedMemberRoute.jsx`.
  - Wrapped `/partner/validation` and `/partner/redeem-history` in `PartnerApprovedMemberRoute` in `AppRoutes.jsx`.

### GAP-02: Stale UI Role & Approval Status Cache (RỦI RO: UI cache)
- **Issue:** When a partner's approval status changed from `PENDING` to `APPROVED` in DB (via Admin Portal), or when a staff member was deactivated, the frontend store (`useAuthStore` in `localStorage`) retained stale `user` data until re-login.
- **Fix:**
  - Added auto-sync mechanism in `frontend/src/layouts/PartnerLayout.jsx`.
  - On layout mount, `getMe()` fetches the current user profile from `/api/auth/me` and updates `authStore`.
  - On approval change, the layout dynamically recalculates menu items and immediately unlocks full Owner tabs (`Dashboard`, `Vouchers`, `Branches`, `Staff`, `Báo cáo`, `Cài đặt`).
  - On staff deactivation, `getMe()` or subsequent API calls trigger 403 `ACCOUNT_LOCKED`, causing `apiClient` interceptor to clear auth and redirect to `/login`.

---

## 3. Verified Route Guard Structure

| Route | Protected By | Accessible To | Redirect If Unauthorized |
|---|---|---|---|
| `/partner/profile` | ProtectedRoute, RoleRoute(PARTNER) | PENDING, REJECTED, APPROVED (Owner & Staff) | `/login` |
| `/partner/notifications` | ProtectedRoute, RoleRoute(PARTNER) | PENDING, REJECTED, APPROVED (Owner & Staff) | `/login` |
| `/partner/dashboard` | PartnerOwnerRoute | Active APPROVED Owner | `getRoleLandingPath(user)` |
| `/partner/vouchers` | PartnerOwnerRoute | Active APPROVED Owner | `getRoleLandingPath(user)` |
| `/partner/branches` | PartnerOwnerRoute | Active APPROVED Owner | `getRoleLandingPath(user)` |
| `/partner/staff` | PartnerOwnerRoute | Active APPROVED Owner | `getRoleLandingPath(user)` |
| `/partner/reports` | PartnerOwnerRoute | Active APPROVED Owner | `getRoleLandingPath(user)` |
| `/partner/validation` | PartnerApprovedMemberRoute | Active APPROVED Owner & Active APPROVED Staff | `getRoleLandingPath(user)` (`/partner/profile`) |
| `/partner/redeem-history` | PartnerApprovedMemberRoute | Active APPROVED Owner & Active APPROVED Staff | `getRoleLandingPath(user)` (`/partner/profile`) |

---

## 4. Modified Files

1. `frontend/src/utils/roleLanding.js`
2. `frontend/src/routes/PartnerApprovedMemberRoute.jsx` (NEW)
3. `frontend/src/routes/AppRoutes.jsx`
4. `frontend/src/layouts/PartnerLayout.jsx`
5. `frontend/tests-node/role-and-refund-utils.test.js`
