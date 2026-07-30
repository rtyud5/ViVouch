# W6-T2 — Backend Verification Report

## Summary
- **Task:** W6-T2 — Partner apply, approval & Staff integration
- **Branch:** `feature/fe/Partner-apply-approval-Staff-integration`
- **Execution Date:** 2026-07-30
- **Database:** Real PostgreSQL instance

---

## Targeted Automated Test Execution

Command:
```bash
npx vitest run tests/rbac-authorization.test.js
```

Output:
```
 ✓ tests/rbac-authorization.test.js (10 tests) 1388ms

 Test Files  1 passed (1)
      Tests  10 passed (10)
   Start at  07:29:36
   Duration  4.01s (transform 637ms, setup 0ms, import 2.40s, tests 1.39s, environment 0ms)
```

---

## Verification Criteria Checklist

1. **Partner Application (Separate flow):**
   - User creates account as Partner Owner via `POST /api/auth/partner-register`.
   - Partner profile is created with status `PENDING`.
   - Unapproved profile blocks operation endpoints via `requirePartnerMember({ requireApproved: true })` / `requirePartnerOwner({ requireApproved: true })`.

2. **Admin Approval & Status Management:**
   - Admin approves partner via `POST /api/admin/partners/:id/approve`.
   - Partner status transitions to `APPROVED`.
   - Admin can suspend/reactivate partner via `PATCH /api/admin/partners/:id/status`.

3. **Staff Creation & Branch Isolation:**
   - Owner creates Staff via `POST /api/partner/members/staff` assigned to an active branch.
   - Staff is strictly scoped to assigned `branchId`.
   - Redeem service (`assertAccess()`) blocks Staff from validating/redeeming codes outside their branch (403 `INVALID_BRANCH_SCOPE`).

4. **Deactivated Staff Isolation:**
   - When Owner deactivates staff, `partnerMember.status` becomes `INACTIVE` and `user.status` becomes `LOCKED`.
   - Deactivated staff login is rejected with 403 `ACCOUNT_LOCKED`.
   - Any API request with an existing JWT is blocked by `verifyToken` middleware (user status check from DB on every request).
