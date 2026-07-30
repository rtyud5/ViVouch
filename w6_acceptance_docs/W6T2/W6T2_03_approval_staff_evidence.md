# W6-T2 — Approval & Staff Integration Evidence Report

## 1. End-to-End Business Flow Evidence

This document proves the technical execution and concurrency/RBAC validity of the 3 key phases in W6-T2:
1. Partner Separate Registration (Partner apply)
2. Admin Partner Approval / Rejection
3. Partner Owner Creating & Managing Branch Staff

---

## 2. Phase 1: Partner Application (Partner apply)

### Endpoint: `POST /api/auth/partner-register`
- **Request Body:** `fullName`, `email`, `phone`, `password`, `businessName`, `taxCode`, `representativeName`, `contactEmail`, `contactPhone`, `address`, `firstBranch` (optional).
- **Execution:**
  - Wraps user creation, partner creation (status: `PENDING`), optional first branch creation, and `PartnerMember` record creation (role: `OWNER`, status: `INVITED`/`ACTIVE`) in a single Prisma transaction `$transaction`.
  - Re-registration cleanup: if an existing unverified email is present, unverified data is cleaned before transaction.
- **Frontend Form:** `PartnerRegisterPage.jsx` (`/partner/apply`).
- **Initial User State:**
  - `user.role` = `'PARTNER'`
  - `partner.status` = `'PENDING'`
  - `partnerMemberships[0].role` = `'OWNER'`
  - Landing path: `/partner/profile` ("Trạng thái hồ sơ").

---

## 3. Phase 2: Admin Approval & Operational Control

### Endpoints:
- `POST /api/admin/partners/:id/approve`
- `POST /api/admin/partners/:id/reject`
- `PATCH /api/admin/partners/:id/status` (SUSPENDED / APPROVED)

### Audit & Security Enforcement:
- **RBAC:** Requires `verifyToken` + `requireRole('ADMIN')`.
- **Database Status Transitions:**
  - `PENDING` → `APPROVED`: Updates `partner.status = 'APPROVED'`, logs audit event `ADMIN_APPROVE_PARTNER`.
  - `PENDING` → `REJECTED`: Updates `partner.status = 'REJECTED'`, sets `rejectReason`, logs audit event `ADMIN_REJECT_PARTNER`.
  - `APPROVED` ↔ `SUSPENDED`: Toggles partner operational state, logs audit event `ADMIN_UPDATE_PARTNER_STATUS`.
- **Frontend Page:** `PartnersPage.jsx` (`/admin/partners`).

---

## 4. Phase 3: Staff Management & Branch Scope Enforcement

### Endpoints:
- `POST /api/partner/members/staff` (createStaff)
- `PATCH /api/partner/members/staff/:id` (updateStaff)
- `GET /api/partner/members/staff` (listStaff)

### Staff Creation & Setup Flow:
1. **Owner Action:** Owner selects an active branch (`isActive = true`) and submits Staff details (`fullName`, `email`, `phone`, `branchId`).
2. **Transaction Safety:** Creates `User` with `role: 'PARTNER'`, `status: 'PENDING_VERIFICATION'`, and `PartnerMember` with `role: 'STAFF'`, `status: 'INVITED'`, `branchId`. Writes audit log `PARTNER_CREATE_STAFF`.
3. **Staff Setup:** Staff receives OTP, navigates to `/staff/setup`, sets password, and account transitions to `status: 'ACTIVE'`, `partnerMember.status: 'ACTIVE'`.
4. **Branch Isolation & Enforcement:**
   - Staff member is scoped exclusively to their assigned `branchId`.
   - `requirePartnerMember()` middleware enforces `branchId` existence for `STAFF`.
   - `assertAccess()` in `redeem.service.js` blocks Staff from validating/redeeming vouchers outside their assigned branch (returns 403 `INVALID_BRANCH_SCOPE`).

---

## 5. Deactivated Staff Isolation & Block Proof

### Deactivation Flow:
1. **Owner Action:** Owner clicks "Khóa" on Staff Management page (`/partner/staff`).
2. **Transaction Execution:**
   ```javascript
   await tx.partnerMember.update({
     where: { id: memberId },
     data: { status: 'INACTIVE' }
   });
   await tx.user.update({
     where: { id: member.userId },
     data: { status: 'LOCKED' }
   });
   ```
3. **Login Block:** When deactivated staff attempts to log in (`POST /api/auth/login`), `auth.service.js` checks `user.status === 'LOCKED'` and rejects with 403 `ACCOUNT_LOCKED` ("Tài khoản của bạn đã bị khóa").
4. **Token Invalidation / Operation Block:** If staff holds an active token, `verifyToken` middleware queries DB user status on every request and rejects with 403 `ACCOUNT_LOCKED`. Frontend `apiClient` interceptor catches 403 `ACCOUNT_LOCKED`, clears auth state, and redirects to `/login`.

---

## 6. Automated Backend Integration Verification

Command executed:
```bash
npx vitest run tests/rbac-authorization.test.js
```
Location: `backend/`  
Database: Real PostgreSQL database  
Test Results: **10/10 PASS (100%)**

### Key Test Evidence Items:
- **Test 5:** Partner A updating Partner B branch returns 403 `FORBIDDEN`.
- **Test 6:** Staff assigned to Branch A checking/redeeming for Branch B returns 403 `INVALID_BRANCH_SCOPE`.
- **Test 7:** Staff member without branchId returns 403 `STAFF_BRANCH_REQUIRED`.
- **Test 8:** Customer escalating role via admin API returns 403 `FORBIDDEN`.
- **Test 9:** Admin toggling lock on self returns 400 `SELF_ACTION`.
- **Test 10:** Suspended partner hitting legacy access fallback returns 403 `PARTNER_NOT_ACTIVE`.
