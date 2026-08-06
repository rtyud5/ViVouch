# W6-T3 — Branch Redeem & Payment Evidence Report

**Task:** W6-T3 — Branch redeem & payment operations integration  
**Date:** 2026-08-01  
**Branch:** `Code/Operations/Branch-redeem-payment-operation-sintegration`  

---

## 1. Technical Audit Summary

### 1.1. Redeem UX & Error Mapping
- Expanded [RedeemVoucherPage.jsx](../../frontend/src/pages/partner/RedeemVoucherPage.jsx) error handling card to catch `VOUCHER_CODE_REFUND_PENDING` and `VOUCHER_CODE_REFUNDED` API response codes with appropriate Vietnamese user-facing warnings:
  - `VOUCHER_CODE_REFUND_PENDING`: *"Voucher này đang trong quá trình xử lý hoàn tiền."*
  - `VOUCHER_CODE_REFUNDED`: *"Voucher này đã được hoàn tiền thành công."*

### 1.2. Payment & Status Badges
- Updated [AdminStatusBadge.jsx](../../frontend/src/features/admin/components/AdminStatusBadge.jsx) to support `REFUND_PENDING` and `REFUNDED` status visualization across Admin Order/Voucher management pages.
- Verified [OrdersPage.jsx](../../frontend/src/pages/customer/OrdersPage.jsx) and Admin Orders details avoid exposing raw payment provider webhook responses or sensitive gateway parameters.

### 1.3. Concurrency & Row Locking Safety
- Verified backend service in [redeem.service.js](../../backend/src/modules/redeem/redeem.service.js) uses `$queryRaw` with `SELECT ... FOR UPDATE` within a PostgreSQL transaction.
- Wrong branch scope check (`INVALID_BRANCH_SCOPE`) returns 403 HTTP status before executing any update query, guaranteeing the voucher code status remains `ISSUED`.

---

## 2. Test Execution Evidence

### Backend Targeted Test Suite
```text
COMMAND: npx vitest run tests/partner-redeem.test.js tests/partner-redeem-api.test.js tests/rbac-authorization.test.js
LOCATION: backend/
EXIT_CODE: 0
RESULT: 31 passed (31)
```

Key test cases verified:
1. `checks an ISSUED code without consuming it` (PASS)
2. `successfully redeems an ISSUED valid code` (PASS)
3. `rejects a code that is already USED` -> `400 VOUCHER_CODE_USED` (PASS)
4. `rejects an EXPIRED code` -> `400 VOUCHER_CODE_EXPIRED` (PASS)
5. `rejects a code belonging to a different partner` -> `403 FORBIDDEN` (PASS)
6. `rejects an active branch outside the voucher scope without consuming the code` -> `403 INVALID_BRANCH_SCOPE` (PASS)
7. `400 when branchId is missing / invalid UUID` (PASS)
8. `STAFF assigned to Branch A attempting to check/redeem for Branch B returns 403` (PASS)

### Frontend Unit & Build Suite
```text
COMMAND: npm test -- --run
LOCATION: frontend/
EXIT_CODE: 0
RESULT: 23 passed (23)

COMMAND: npm run build
LOCATION: frontend/
EXIT_CODE: 0
RESULT: Built production bundle in 22.14s
```

---

## 3. Database State Invariants

- **Row Lock Assertions:** `FOR UPDATE` lock confirmed active during redeem transaction.
- **Unconsumed Invariant:** When HTTP 403 (`INVALID_BRANCH_SCOPE` or `FORBIDDEN`) is returned, `VoucherCode.status` remains `ISSUED` and `VoucherCode.usedAt` remains `null`. Zero usage log entries are created.
- **Auditing:** Successful redeem creates a corresponding record in `VoucherUsageLog` and logs `PARTNER_REDEEM_VOUCHER` to `AuditLog`.
