# OPS-01 — Partner Apply và Admin Approval Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-01 — Partner Apply và Admin Approval  

---

## 1. Business Lifecycle Verification

### 1.1 State Transitions
- **Application Submission (`POST /api/partner/apply`):** Partner profile is created with `status = PENDING`.
- **Admin Review (`GET /api/admin/partners`):** Admin views pending applications list and detail page.
- **Admin Approval (`POST /api/admin/partners/:id/approve`):** Partner profile transitions to `APPROVED`, and corresponding user role is updated to `PARTNER`.
- **Admin Rejection (`POST /api/admin/partners/:id/reject`):** Partner profile transitions to `REJECTED`, preserving rejection reason in audit metadata.

### 1.2 Access & Cache Invariants
- **Direct API & Navigation Blocking:**
  - Users with `PENDING` or `REJECTED` partner state attempting to access protected Partner endpoints (`/api/partner/vouchers`, `/api/partner/branches`, `/api/partner/reports`) receive `403 FORBIDDEN` with code `PARTNER_NOT_ACTIVE`.
- **Role/Status Cache Refetching:**
  - Auth context refetches user token/session upon status mutation, ensuring UI immediately reflects updated role without dirty state lingering.

---

## 2. Automated Test & DB Evidence

```text
SUITE: tests/rbac-authorization.test.js
RESULTS:
 - POST /api/auth/register with role="ADMIN" creates CUSTOMER role in DB (PASS)
 - Customer accessing Partner Route (GET /api/partner/vouchers) returns 403 (PASS)
 - Suspended partner hitting legacy access fallback returns 403 PARTNER_NOT_ACTIVE (PASS)
```

- **DB Mutation Audit:**
  - `Partner.status`: PENDING ➔ APPROVED / REJECTED.
  - `User.role`: CUSTOMER ➔ PARTNER (upon approval).
  - `AuditLog`: Recorded with `action = ADMIN_APPROVE_PARTNER` or `ADMIN_REJECT_PARTNER`, actor `adminId`, target `Partner:id`, and timestamp.
