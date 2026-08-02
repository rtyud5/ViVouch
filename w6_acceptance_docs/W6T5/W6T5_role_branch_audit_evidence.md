# W6-T5 — Role / Branch / Audit Evidence

**Task:** W6-T5 — Partner / Admin / Staff frozen-SHA regression  
**Date:** 2026-08-02  
**Branch:** `Partner/Admin/Staff-frozen-SHA-regression`  
**HEAD SHA:** `48cbb1145f47573a9028e85fae1ef18a6f2249ef`

---

## 1. SHA Chain Evidence

```
48cbb11  (HEAD → Partner/Admin/Staff-frozen-SHA-regression, origin/main, main)
         Merge pull request #153 from rtyud5/w6-h5
         
7ffb6eb  chore(qa): Add W6 freeze evidence
         ↑ W6-H5 QA gate commit

02418be  Merge pull request #152 from rtyud5/w6-h4
         ↑ W6 Integration Freeze SHA (documented in w6-freeze-evidence.md)

0d9ebb1  fix(jobs): Refund code locking and idempotent reconcile

dfd9db3  Merge pull request #151 from rtyud5/Code/Operations/Admin-ops-audit-report-validation
         ↑ W6-T4 sign-off commit

7989e96  Merge pull request #150 from rtyud5/Code/Operations/Branch-redeem-payment-operation-sintegration
         ↑ W6-T3 sign-off commit
```

**Verification:**
- `origin/main` tip == `Partner/Admin/Staff-frozen-SHA-regression` tip == `48cbb1145f47573a9028e85fae1ef18a6f2249ef`
- Worktree clean — no uncommitted changes at time of sign-off

---

## 2. Role Session Evidence

### 2.1 CUSTOMER Role Boundaries

| API Endpoint | Customer Token | Expected | Actual |
|---|---|---|---|
| `GET /api/admin/dashboard` | ✓ valid | 403 FORBIDDEN | ✅ 403 |
| `GET /api/partner/vouchers` | ✓ valid | 403 FORBIDDEN | ✅ 403 |
| `PATCH /api/admin/users/:id/role` | ✓ valid | 403 FORBIDDEN | ✅ 403 |

Error response from backend:
```json
{
  "success": false,
  "message": "Không có quyền truy cập",
  "code": "FORBIDDEN"
}
```
Source: `role.middleware.js:22` — explicit deny before any data access.

### 2.2 PARTNER Role Boundaries (Cross-Partner Isolation)

| API Endpoint | Partner A Token | Target | Expected | Actual |
|---|---|---|---|---|
| `PUT /api/partner/vouchers/:id` | ✓ Partner A token | Partner B voucher | 403 FORBIDDEN | ✅ 403 |
| `PUT /api/partner/branches/:id` | ✓ Partner A token | Partner B branch | 403 FORBIDDEN | ✅ 403 |

Error response:
```json
{
  "success": false,
  "message": "Không có quyền sửa voucher này",
  "code": "FORBIDDEN"
}
```

DB assertion: Partner B voucher fields unchanged post-attempt (verified via `prisma.voucher.findUnique` in test).

### 2.3 STAFF Role / Branch Assignment

| Scenario | STAFF Config | Target Branch | Expected | Actual |
|---|---|---|---|---|
| STAFF assigned Branch A → check/redeem Branch B | `branchId=A` assigned | `branchId=B` in request | 403 INVALID_BRANCH_SCOPE | ✅ 403 |
| STAFF no branch assigned | `branchId=null` | Any | 403 STAFF_BRANCH_REQUIRED | ✅ 403 |

Error responses:
```json
{ "code": "INVALID_BRANCH_SCOPE", "message": "Nhân viên chỉ được redeem tại chi nhánh được phân công" }
{ "code": "STAFF_BRANCH_REQUIRED", "message": "Nhân viên chưa được phân công chi nhánh" }
```

DB assertion: `VoucherCode.status` remains `ISSUED` after denied STAFF redeem (no mutation).

### 2.4 ADMIN Escalation Guard

| Scenario | Expected | Actual |
|---|---|---|
| Admin self-lock | 400 SELF_ACTION | ✅ 400 |
| JWT payload tamper (role: ADMIN in forged token) | 403 FORBIDDEN | ✅ 403 |
| Suspended partner access | 403 PARTNER_NOT_ACTIVE | ✅ 403 |

---

## 3. Branch Scope Evidence

### 3.1 Correct Branch Redeem Flow

DB state after successful redeem:
```
VoucherCode.status  : ISSUED → USED
VoucherCode.usedAt  : null  → <timestamp>
VoucherUsageLog     : new record created (partnerId, branchId, redeemedAt)
AuditLog            : PARTNER_REDEEM_VOUCHER action logged
```

### 3.2 Wrong Branch Denied Flow

DB state after denied redeem (wrong branch):
```
VoucherCode.status  : ISSUED (unchanged)
VoucherCode.usedAt  : null  (unchanged)
VoucherUsageLog     : no record created
AuditLog            : no entry
```

Transaction rollback confirmed via `FOR UPDATE` row-level lock in `redeem.service.js`.

---

## 4. Audit Log Evidence

### 4.1 Actions Covered in W6

| Action Constant | Vietnamese Label | Service |
|---|---|---|
| `ADMIN_CANCEL_ORDER` | Hủy/hoàn tiền đơn | `admin.service.js` |
| `ADMIN_APPROVE_REFUND` | Duyệt hoàn tiền | `refunds.service.js` |
| `ADMIN_REJECT_REFUND` | Từ chối hoàn tiền | `refunds.service.js` |
| `ADMIN_COMPLETE_MANUAL_REFUND` | Xác nhận hoàn thủ công payOS | `refunds.service.js` |
| `CUSTOMER_REQUEST_REFUND` | Yêu cầu hoàn tiền | `refunds.service.js` |
| `PARTNER_REDEEM_VOUCHER` | Đổi mã voucher | `redeem.service.js` |
| `PAYMENT_PAYOS_WEBHOOK` | Webhook payOS | `payos.service.js` |
| `SYSTEM_RECONCILE_VOUCHER` | Đối soát voucher | `reconciliation.service.js` |

### 4.2 AuditLog Schema Invariants

Every AuditLog record contains:
- `actorId` — userId of actor (null for SYSTEM jobs)
- `action` — string constant from `AUDIT_ACTIONS`
- `targetType` — entity type string (`Order`, `RefundRequest`, `Voucher`, etc.)
- `targetId` — entity UUID
- `oldValues` / `newValues` — JSON diff (when applicable)
- `ipAddress` — HTTP request IP (when applicable)
- `createdAt` — immutable timestamp

### 4.3 Frontend Audit Display Evidence

`AuditLogsPage.jsx` renders:
- Actor: `actor.email` + role badge OR `"Hệ thống (SYSTEM)"` for background jobs
- Action: Vietnamese label via `ACTION_LABELS` lookup
- Target: `targetType + targetId` (e.g., `RefundRequest / abc-123`)
- Changes: Pretty-printed JSON `{ oldValues, newValues, ipAddress }`

---

## 5. Admin Refund Integrity Evidence

### payOS — No Auto-Refund Bypass

```
Admin approves payOS refund:
  RefundRequest.status: REQUESTED → MANUAL_REFUND_REQUIRED
  Payment.status: PAID (unchanged)
  Wallet: no credit
  AuditLog: ADMIN_APPROVE_REFUND with paymentMethod: "PAYOS"

Admin completes manual refund (with providerRefundReference):
  RefundRequest.status: MANUAL_REFUND_REQUIRED → REFUNDED
  RefundRequest.providerRefundReference: populated
  Payment.status: PAID → REFUNDED
  Payment.providerReference: populated (banking TX ref)
  VoucherCode.status: REFUND_PENDING → REFUNDED
  Order.status: REFUND_PENDING → REFUNDED
  soldQty: decremented (inventory restored)
  AuditLog: ADMIN_COMPLETE_MANUAL_REFUND
```

Source: `refunds.service.js` L123–235 — all operations within `prisma.$transaction`.

---

## 6. Concurrency / Lock Evidence

| Operation | Lock Type | Location |
|---|---|---|
| Refund request create | `SELECT FOR UPDATE` on `Order` + `VoucherCode` | `refunds.service.js` L32–38 |
| Refund approve | `SELECT FOR UPDATE` on `RefundRequest` | `refunds.service.js` L125` |
| Wallet credit | `SELECT FOR UPDATE` on `Wallet` | `refunds.service.js` L150` |
| Redeem confirm | `SELECT FOR UPDATE` on `VoucherCode` | `redeem.service.js` |
| payOS order expiry job | `SELECT FOR UPDATE SKIP LOCKED` on `Order` | `reconciliation.service.js` L46` |
| Email outbox job | Idempotent query with status filter | `email.service.js` |

Parallel job test (`jobs-stabilization.test.js`): both `processEmailOutbox` and `runReconciliation` ran concurrently — no duplicate processing, no crash.
