# OPS-02 — Staff Creation, Deactivation & Branch Scope Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-02 — Owner tạo/deactivate Staff và branch scope  

---

## 1. Business & Authorization Rules

### 1.1 Owner Operations
- **Staff Creation & Branch Assignment:** Owner creates staff (`POST /api/partner/staff`) and assigns `branchId`.
- **Owner-Only Privilege Enforcement:**
  - Staff cannot create other staff members or alter partner business parameters.
  - Staff cannot manage branch settings (`PUT /api/partner/branches/:id`). Attempting to do so returns `403 FORBIDDEN`.

### 1.2 Branch Isolation & Scope Enforcements
- **Assigned Branch Actions:** Staff can only verify and redeem voucher codes belonging to their assigned `branchId`.
- **Cross-Branch Mutation Blocking:**
  - Staff attempting to check or redeem codes for a different branch (`Branch B` while assigned to `Branch A`) returns `403 FORBIDDEN` (`INVALID_BRANCH_SCOPE`).
  - Direct API requests attempting wrong-branch redemption do NOT mutate DB state; voucher code remains `ISSUED`.
- **Staff Deactivation:**
  - Owner deactivates staff (`PATCH /api/partner/staff/:id/deactivate`).
  - Deactivated staff authentication is rejected on subsequent API calls (`401 UNAUTHORIZED` / `403 FORBIDDEN`), preventing login and branch operations.

---

## 2. Automated Test & DB Evidence

```text
SUITE: tests/partner-staff-branch.test.js & tests/rbac-authorization.test.js
RESULTS:
 - STAFF assigned to Branch A attempting to check/redeem for Branch B returns 403 and leaves DB code status ISSUED (PASS)
 - STAFF member without an assigned branchId returns 403 STAFF_BRANCH_REQUIRED (PASS)
 - Partner A attempting to update Partner B branch returns 403 and leaves DB unchanged (PASS)
```

- **DB Invariant Verification:**
  - `PartnerMember.isActive`: set to `false` on deactivation.
  - `VoucherCode.status`: stays `ISSUED` upon blocked cross-branch redeem request.
  - `AuditLog`: Recorded with `action = PARTNER_CREATE_STAFF` / `PARTNER_DEACTIVATE_STAFF`, actor `ownerId`, target `Staff:id`, and assigned `branchId`.
