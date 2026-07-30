# W6-T2 — Outcome Report

**Task:** W6-T2 — Partner apply, approval & Staff integration  
**Role:** Partner / Admin Operations  
**Sprint:** W6 (2026-07-28 → 2026-08-01)  

---

## 1. Header & Execution Metadata

```
TASK_ID=W6-T2
BRANCH=feature/fe/Partner-apply-approval-Staff-integration
SHA=latest
STARTED_AT=2026-07-30T07:27:45+07:00
COMPLETED_AT=2026-07-30T07:30:30+07:00
ENVIRONMENT=Windows 11, Node 20, PostgreSQL Real DB
EXIT_CODE=0 (all targeted tests and frontend build passed)
```

---

## 2. Outcome Summary

Task W6-T2 successfully fixed and verified the Partner application, Admin approval, and Owner staff management flow. GAP-01 from W6-T1 (direct URL access for pending partners) and RỦI RO UI cache (stale user permissions in store) have been completely resolved.

---

## 3. Files Modified & Created

| Action | File Path | Description |
|---|---|---|
| `[NEW]` | `frontend/src/routes/PartnerApprovedMemberRoute.jsx` | Guard route component requiring active approved partner member |
| `[MODIFY]` | `frontend/src/utils/roleLanding.js` | Added `isApprovedPartnerMember` helper & updated landing path logic for inactive staff |
| `[MODIFY]` | `frontend/src/routes/AppRoutes.jsx` | Wrapped `/partner/validation` and `/partner/redeem-history` with `PartnerApprovedMemberRoute` |
| `[MODIFY]` | `frontend/src/layouts/PartnerLayout.jsx` | Added `getMe()` auto-sync on layout mount to eliminate UI permission cache staleness |
| `[MODIFY]` | `frontend/tests-node/role-and-refund-utils.test.js` | Expanded unit tests for partner member guards & role landing paths |
| `[NEW]` | `w6_acceptance_docs/W6T2/W6T2_01_portal_integration_fixes.md` | Integration fixes report |
| `[NEW]` | `w6_acceptance_docs/W6T2/W6T2_02_role_aware_navigation_tests.md` | Navigation unit & build test report |
| `[NEW]` | `w6_acceptance_docs/W6T2/W6T2_03_approval_staff_evidence.md` | Approval & Staff integration evidence report |
| `[NEW]` | `w6_acceptance_docs/W6T2/W6T2_outcome.md` | Master outcome document |
| `[NEW]` | `backend/w6-t2-report.md` | Backend verification report |

---

## 4. Commands Executed & Results

| # | Command | Location | Result | Notes |
|---|---|---|---|---|
| 1 | `git status` | root | PASS | Working tree clean on feature branch |
| 2 | `npx vitest run tests/rbac-authorization.test.js` | `backend/` | **PASS (10/10)** | PostgreSQL integration test covering branch scope, legacy fallbacks & self-actions |
| 3 | `npm run test:unit:node` | `frontend/` | **PASS (2/2)** | Node native unit tests for role landing, eligibility & guards |
| 4 | `npm run build` | `frontend/` | **PASS (Exit 0)** | Vite production build clean without errors |

---

## 5. Acceptance Criteria Assessment

| Criterion | Evaluation | Supporting Evidence |
|---|---|---|
| **Pending / Rejected / Approved state correct** | ✅ ĐẠT | `roleLanding.js`, `PartnerApprovedMemberRoute`, `PartnerLayout` sync, `PartnerRegisterPage`, `PartnersPage` |
| **Staff does not see Owner-only actions** | ✅ ĐẠT | `PartnerOwnerRoute` blocks Staff from dashboard, vouchers, branches, staff management & reports |
| **Deactivated Staff cannot login / operate** | ✅ ĐẠT | Deactivating staff sets `user.status = 'LOCKED'`. Login returns 403 `ACCOUNT_LOCKED`. Active tokens blocked by `verifyToken` on every request. |

---

## 6. DB Side Effects

- Zero schema changes required (relied on established H2 migration & D2 authorization).
- Data mutations strictly executed through Prisma transactions:
  - Partner application creates `User`, `Partner`, `Branch` (optional), and `PartnerMember`.
  - Staff creation creates `User` (role `PARTNER`, status `PENDING_VERIFICATION`), `PartnerMember` (role `STAFF`, status `INVITED`, assigned `branchId`), and audit log.
  - Staff deactivation sets `PartnerMember.status = 'INACTIVE'` and `User.status = 'LOCKED'`.

---

## 7. Remaining Risk & Mitigation

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-01 | Latency on `getMe()` network call on layout mount | LOW | Non-blocking background promise; UI renders seamlessly from store while syncing |
| R-02 | Redis JWT blacklist (planned for W7) not present in W6 | LOW | `verifyToken` checks DB `user.status` on every request, providing immediate blockage |

---

## 8. Handoff

- **W6-T3 / W6-T4 / W6-T5:** Portal integration fixes and role-aware navigation are fully wired and tested. Ready for live API session testing.
