# W6-T5 — Outcome Report

**Task:** W6-T5 — Partner / Admin / Staff frozen-SHA regression  
**Role:** Partner / Admin Operations  
**Sprint:** W6 (2026-07-28 → 2026-08-01)

---

## 1. Header & Execution Metadata

```text
TASK_ID=W6-T5
BRANCH=Partner/Admin/Staff-frozen-SHA-regression
HEAD_SHA=48cbb1145f47573a9028e85fae1ef18a6f2249ef (= origin/main = W6 freeze gate)
STARTED_AT=2026-08-02T21:06:09+07:00
COMPLETED_AT=2026-08-02T21:12:22+07:00
ENVIRONMENT=Windows 11, Node 20, PostgreSQL Real DB (localhost:5432)
EXIT_CODE=0
BACKEND_TESTS=52 passed / 52 total (0 fail, 0 skip)
FRONTEND_TESTS=26 passed / 26 total (0 fail, 0 skip)
```

---

## 2. Outcome Summary

Task W6-T5 thực hiện **frozen-SHA regression QA** trên candidate `48cbb1145f47573a9028e85fae1ef18a6f2249ef` — toàn bộ W6 integration/hardening đã được merge vào `main`.

Kết quả:
1. **Privilege / Branch Bypass:** 10 negative RBAC scenarios tất cả trả 403/400 đúng. DB state không bị thay đổi sau các attempt bị từ chối.
2. **Duplicate Consume / Refund:** Duplicate redeem bị block `VOUCHER_CODE_USED`. payOS approve không giả auto-refund (chuyển `MANUAL_REFUND_REQUIRED`, không credit wallet). Parallel outbox/reconcile idempotent.
3. **Status UI khớp API/DB:** `AdminStatusBadge` labels đúng tiếng Việt cho 18 status variants. `RedeemVoucherPage` error card map đủ 10 error codes kể cả `REFUND_PENDING` / `REFUNDED`.
4. **Audit Trail:** Mọi admin action tạo `AuditLog` immutable với actor email + role, action label, target entity + ID, old/new values JSON.
5. **Jobs Stability:** Parallel `processEmailOutbox` và `runReconciliation` chạy đồng thời không gây duplicate, không crash.

---

## 3. Deliverables

| Deliverable | File |
|---|---|
| Ops Regression Matrix | [W6T5_ops_regression_matrix.md](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/w6_acceptance_docs/W6T5/W6T5_ops_regression_matrix.md) |
| Role / Branch / Audit Evidence | [W6T5_role_branch_audit_evidence.md](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/w6_acceptance_docs/W6T5/W6T5_role_branch_audit_evidence.md) |
| W7 Ops E2E Backlog | [W7_ops_e2e_backlog.md](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/w6_acceptance_docs/W6T5/W7_ops_e2e_backlog.md) |

---

## 4. Commands Executed & Results

| # | Command | Location | Result |
|---|---|---|---|
| 1 | `git checkout main && git pull origin main` | root | **PASS** — HEAD: `48cbb11` |
| 2 | `git checkout -b Partner/Admin/Staff-frozen-SHA-regression` | root | **PASS** — New branch at `48cbb11` |
| 3 | `npx vitest run tests/admin-orders-audit.test.js tests/rbac-authorization.test.js tests/partner-redeem.test.js tests/partner-redeem-api.test.js tests/partner-reports.test.js tests/jobs-stabilization.test.js` | `backend/` | **PASS — 52/52 tests** |
| 4 | `npm test -- --run` | `frontend/` | **PASS — 26/26 tests** |

---

## 5. Acceptance Criteria Assessment

| Criterion | Verdict | Evidence |
|---|---|---|
| **No privilege/branch bypass** | ✅ ĐẠT | 10 RBAC negative tests PASS. DB state unchanged after denied attempts. |
| **No duplicate consume/refund** | ✅ ĐẠT | Dup redeem blocked. payOS MANUAL_REFUND_REQUIRED path. Parallel jobs idempotent. |
| **Status UI khớp API/DB** | ✅ ĐẠT | 3 frontend badge tests PASS. Error code mapping complete in RedeemVoucherPage. |

---

## 6. Database Side Effects

- **Schema:** Zero migration changes (W6-T5 là QA-only task, no code changes).
- **Mutations from tests:** All test data cleaned up via `beforeAll`/`afterAll` cleanup functions. No residual test data.
- **Lock patterns verified:**
  - `FOR UPDATE` on `Order`, `VoucherCode`, `RefundRequest`, `Wallet`
  - `FOR UPDATE SKIP LOCKED` trên job runner (payOS order expiry)

---

## 7. Remaining Risks

| ID | Risk | Impact | Mitigation |
|---|---|---|---|
| R-01 | Shared fixture order-dependency | MEDIUM | W7: enforce isolated cleanup per test suite |
| R-02 | `window.prompt()` cho admin refund reference | LOW | W7: thay bằng modal component |
| R-03 | reconcile job chưa log AuditLog | LOW | W7 backlog item TD-04 |
| R-04 | Refund concurrency race chưa có dedicated test | MEDIUM | W7-RF-06 trong backlog |

---

## 8. Handoff

- W6 candidate SHA `48cbb1145f47573a9028e85fae1ef18a6f2249ef` **đã được ký xác nhận** bởi W6-T5 QA gate.
- W7 bootstrap từ branch này: `git checkout -b w7-baseline` tại HEAD trên.
- W7 Ops E2E Backlog: xem [W7_ops_e2e_backlog.md](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/w6_acceptance_docs/W6T5/W7_ops_e2e_backlog.md) — 7 categories, 35 test scenarios.
