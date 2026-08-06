# W6-T3 — Outcome Report

**Task:** W6-T3 — Branch redeem & payment operations integration  
**Role:** Partner / Admin Operations  
**Sprint:** W6 (2026-07-28 → 2026-08-01)  

---

## 1. Header & Execution Metadata

```text
TASK_ID=W6-T3
BRANCH=Code/Operations/Branch-redeem-payment-operation-sintegration
SHA=latest
STARTED_AT=2026-08-01T00:08:20+07:00
COMPLETED_AT=2026-08-01T00:10:45+07:00
ENVIRONMENT=Windows 11, Node 20, PostgreSQL Real DB
EXIT_CODE=0 (All targeted backend redeem/RBAC tests & frontend unit tests/build passed)
```

---

## 2. Outcome Summary

Task W6-T3 has successfully integrated and verified **Branch redeem & payment operations**:
1. **Redeem UX & Error Fixes:** Extended `RedeemVoucherPage.jsx` error mapping to support refund states (`VOUCHER_CODE_REFUND_PENDING` and `VOUCHER_CODE_REFUNDED`), preventing generic fallback toasts.
2. **Payment & Order Status Mapping:** Standardized status badges across Admin Portal in `AdminStatusBadge.jsx` for `REFUND_PENDING` and `REFUNDED` statuses. Verified Customer order/payment view in `OrdersPage.jsx` mapping `VIVOUCH_WALLET` (Mock) and `PAYOS` (Real) payment methods correctly without raw secret/payload exposure.
3. **Branch & Refund Concurrency Security:** Confirmed DB-level row locks (`SELECT FOR UPDATE`) and transaction safety during voucher redeem in PostgreSQL. Verified wrong-branch attempts reject with 403 `INVALID_BRANCH_SCOPE` and leave DB voucher status `ISSUED` untouched.

---

## 3. Files Modified & Created

| Action | File Path | Description |
|---|---|---|
| `[MODIFY]` | [RedeemVoucherPage.jsx](../../frontend/src/pages/partner/RedeemVoucherPage.jsx) | Added refund status error handling (`VOUCHER_CODE_REFUND_PENDING`, `VOUCHER_CODE_REFUNDED`) |
| `[MODIFY]` | [AdminStatusBadge.jsx](../../frontend/src/features/admin/components/AdminStatusBadge.jsx) | Added `REFUND_PENDING` and `REFUNDED` badge design mappings |
| `[NEW]` | [w6_t3_branch_redeem_payment_evidence.md](../../w6_acceptance_docs/W6T3/w6_t3_branch_redeem_payment_evidence.md) | Technical evidence document covering cross-role cases & DB assertions |
| `[NEW]` | [W6T3_outcome.md](../../w6_acceptance_docs/W6T3/W6T3_outcome.md) | Master outcome report for W6-T3 |

---

## 4. Commands Executed & Results

| # | Command | Location | Result | Notes |
|---|---|---|---|---|
| 1 | `git status` | root | **PASS** | Clean working tree on working branch |
| 2 | `npx vitest run tests/partner-redeem.test.js tests/partner-redeem-api.test.js tests/rbac-authorization.test.js` | `backend/` | **PASS (31/31 tests)** | Real PostgreSQL transaction, row-level lock, wrong branch, and duplicate redeem test suite |
| 3 | `npm test -- --run` | `frontend/` | **PASS (23/23 tests)** | All frontend unit tests clean |
| 4 | `npm run build` | `frontend/` | **PASS (Exit 0)** | Vite production build generated without errors |

---

## 5. Acceptance Criteria Assessment

| Criterion | Evaluation | Supporting Evidence |
|---|---|---|
| **Wrong branch không consume code** | ✅ ĐẠT | Rejected with HTTP 403 `INVALID_BRANCH_SCOPE`. Verified in DB: status remains `ISSUED` and `usedAt` remains `null`. |
| **Duplicate redeem idempotent / blocked đúng** | ✅ ĐẠT | Second redeem attempt fails with 409/400 `VOUCHER_CODE_USED`. Transaction `FOR UPDATE` lock prevents double-consume race conditions. |
| **Không hiển thị raw provider payload / secret** | ✅ ĐẠT | Payment methods sanitized as "Ví ViVouch (Mock)" / "payOS VietQR (Real)". Admin/Customer views display clean user-facing statuses. |

---

## 6. Database Side Effects

- **Schema:** Zero migration changes required (utilized baseline schema).
- **Mutations:**
  - Valid redeem updates `VoucherCode.status` to `USED`, sets `usedAt = now()`, inserts a record in `VoucherUsageLog`, and logs to `AuditLog`.
  - Failed/Denied redeem (wrong branch, duplicate, wrong partner, refund pending/refunded) causes complete transaction rollback with zero DB mutations.

---

## 7. Remaining Risk & Mitigation

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-01 | Network disconnect during confirm API | LOW | Frontend loading spinner disables double clicks; idempotency lock on PostgreSQL backend prevents double-redemption. |

---

## 8. Handoff

- Handing off clean branch state for **W6-T4 / W6-T5** (Admin refund/ticket/audit UI and final W6 regression matrix).
