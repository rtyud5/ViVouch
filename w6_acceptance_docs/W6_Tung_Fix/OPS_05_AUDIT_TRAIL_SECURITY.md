# OPS-05 — Audit Trail & Security Sanitization Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-05 — Critical Actions Audit Logging  

---

## 1. Audit Coverage & Field Verification

### 1.1 Action Coverage
Critical business actions produce structured, immutable `AuditLog` records:
- **`ADMIN_APPROVE_PARTNER` / `ADMIN_REJECT_PARTNER`:** Partner application decisions.
- **`PARTNER_CREATE_STAFF` / `PARTNER_DEACTIVATE_STAFF`:** Staff account management.
- **`VOUCHER_REDEEM`:** Voucher redemption at branch.
- **`ADMIN_APPROVE_REFUND` / `ADMIN_COMPLETE_MANUAL_REFUND`:** Refund approvals and manual completions.
- **`ADMIN_RESPOND_TICKET`:** Support ticket status updates.

### 1.2 Structured Logging Metadata
Every audit record includes:
- **Actor:** `actorId`, `actorEmail`, `actorRole` (or `SYSTEM`).
- **Action:** Vietnamese human-readable action label.
- **Target:** `targetType` (`Partner`, `Staff`, `VoucherCode`, `RefundRequest`, `SupportTicket`), `targetId`.
- **Context:** `requestId`, `branchId` (where applicable), `ipAddress`.
- **State Change:** `oldValues` and `newValues` JSON payloads.

### 1.3 Secret & PII Sanitization
- **Redaction Policy Enforced:**
  - Passwords, authentication tokens, session secrets, and payment credentials are strictly stripped.
  - Voucher codes are redacted/masked (e.g. `VOUCHER-***-89AB`), ensuring full raw voucher codes never exist in audit logs.

---

## 2. Automated Test & DB Evidence

```text
SUITE: tests/admin-orders-audit.test.js
RESULTS:
 - GET /api/admin/audit-logs > 200 trả về list audit logs có pagination (PASS)
 - GET /api/admin/audit-logs > 200 filter theo action=ADMIN_APPROVE_VOUCHER (PASS)
 - GET /api/admin/audit-logs > 200 mỗi log có actor info (PASS)
 - POST /api/admin/orders/:id/cancel > writes audit evidence (PASS)
```
