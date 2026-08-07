# OPS-03 — Redeem Integrity & Edge Cases Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-03 — Redeem Integrity & State Protection  

---

## 1. Redeem Protection & State Machine

### 1.1 Valid & Invalid Redemption Flows
- **Correct Branch Redemption:**
  - Code redemption executed by assigned Staff at correct branch (`POST /api/partner/redeem/confirm`) succeeds exactly once under PostgreSQL transaction + row lock (`SELECT FOR UPDATE`).
  - Code state transitions from `ISSUED` ➔ `USED`.
- **Wrong Branch Redemption:**
  - Blocked with `403 INVALID_BRANCH_SCOPE`. Code is NOT consumed and stays `ISSUED`.
- **Duplicate Redemption Idempotency:**
  - Second redeem attempt on an already `USED` code is blocked with `400 VOUCHER_CODE_ALREADY_USED`.
  - Concurrent duplicate redeem attempts produce exactly 1 success and 1 blocked response without double mutation.
- **Protected/Invalid States Blocking:**
  - `REFUND_PENDING`: Blocked with `400 VOUCHER_CODE_REFUND_PENDING`.
  - `REFUNDED`: Blocked with `400 VOUCHER_CODE_REFUNDED`.
  - `EXPIRED`: Blocked with `400 VOUCHER_CODE_EXPIRED`.
  - `USED`: Blocked with `400 VOUCHER_CODE_ALREADY_USED`.

### 1.2 Frontend & UI Alignment
- UI never reports false success on backend rejection. Any non-200 HTTP response displays clear toast error and leaves voucher state untouched in client cache.

---

## 2. Automated Test & DB Evidence

```text
SUITE: tests/voucher-redemption.test.js & tests/refund-concurrency-dedicated.test.js
RESULTS:
 - STAFF assigned to Branch A attempting to check/redeem for Branch B returns 403 and leaves DB code status ISSUED (PASS)
 - Approve-refund vs redeem racing on same voucher code > redeem is blocked; final state never USED; no usage log created (PASS)
 - Client retry does not create duplicate refund (PASS)
```

- **DB Invariant Verification:**
  - `VoucherUsageLog`: Exactly 1 log entry created per successful redemption. 0 log entries created on blocked or failed attempts.
  - `VoucherCode.status`: strictly atomic transitions. Never enters dirty combination states (e.g. both USED and REFUNDED).
