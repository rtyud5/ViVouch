# W6-T5 Canonical Ops Roles & Canonical Lifecycle Verification Evidence

**Task:** W6-T5 — Frozen-SHA Regression & Final Sign-Off  
**Frozen SHA:** `b2a32e3b7bcce3bbec3af0d966f0c628b4d5b6d1`  
**Date:** `2026-08-07T18:25:55+07:00`  
**Tester:** Tung (Partner & Admin Operations Lead)  

---

## 1. Role Session & Fixture Isolation

Canonical regression testing strictly used dedicated, non-overlapping sessions/fixtures:

| Role Fixture | Session Identifier / Token | Target Scope / Branch |
|---|---|---|
| **Admin** | `admin-session-ops@vivouch.vn` | System-wide Admin Operations |
| **Partner Owner** | `owner-session-ops@merchant.com` | Partner Entity `partner-ops-01` |
| **Branch Staff A** | `staff-a-session@merchant.com` | Branch `branch-alpha-01` |
| **Branch Staff B** | `staff-b-session@merchant.com` | Branch `branch-beta-02` |
| **Customer** | `customer-session-ops@gmail.com` | User Orders & Vouchers |

*Rule Verification:* Token caches and local sessions were completely isolated between role executions. Zero role leakage or dirty session state observed.

---

## 2. Canonical Ops Flow Step-by-Step Verification

1. **Partner Apply (`POST /api/partner/apply`):**
   - Application created in `PENDING` state. Direct API access to partner endpoints returns `403 PARTNER_NOT_ACTIVE`.
2. **Admin Approve (`POST /api/admin/partners/:id/approve`):**
   - Admin approves application ➔ State transitions to `APPROVED`, user role updated to `PARTNER`. Token refetched cleanly.
3. **Owner creates Staff & assigns branch (`POST /api/partner/staff`):**
   - Owner creates Staff A and assigns to `Branch Alpha`.
4. **Staff attempts Owner-only action:**
   - Staff A attempts `PUT /api/partner/branches/:id` ➔ Blocked with `403 FORBIDDEN`. DB remains unchanged.
5. **Redeem at correct branch (`POST /api/partner/redeem/confirm`):**
   - Staff A redeems code at `Branch Alpha` ➔ Success. State transitions `ISSUED` ➔ `USED`.
6. **Redeem at wrong branch:**
   - Staff B attempts to redeem code belonging to `Branch Alpha` at `Branch Beta` ➔ Blocked with `403 INVALID_BRANCH_SCOPE`. Code stays `ISSUED`.
7. **Duplicate redeem:**
   - Staff A re-submits redeem for already `USED` code ➔ Blocked with `400 VOUCHER_CODE_ALREADY_USED`.
8. **Redeem code refund-pending/refunded:**
   - Staff A attempts to redeem code under `REFUND_PENDING` or `REFUNDED` status ➔ Blocked with `400 VOUCHER_CODE_REFUND_PENDING` / `VOUCHER_CODE_REFUNDED`.
9. **Admin handles refund & ticket:**
   - Admin processes payOS manual refund flow ➔ Transitions to `MANUAL_REFUND_REQUIRED`, requires `providerRefundReference`. Does NOT spoof as auto-refund.
10. **Audit verification (`GET /api/admin/audit-logs`):**
    - Audit log records `actor`, `action`, `target`, `requestId`, and `branchId`. Zero raw secrets/PII stored.
11. **Commission summary verification (`GET /api/partner/reports`):**
    - Report verifies Gross Revenue, Platform Fee %, Estimated Partner Revenue in VND (`₫`). Displays disclaimer (*"Các số tiền chỉ là ước tính/mô phỏng, không phải payout thực tế"*).
12. **API/DB sample reconciliation:**
    - Real PostgreSQL state matches API responses 1:1 across all entities.

---

## 3. Execution Results

- **Backend Node Unit Tests (`npm run test:unit:node`):** PASS (13/13 passed)
- **Backend Full Vitest Suite (`npm test`):** PASS (202/202 passed across 27 files)
- **Frontend Node Unit Tests (`npm run test:unit:node`):** PASS (2/2 passed)
- **Frontend Vitest Suite (`npm test -- --run`):** PASS (33/33 passed across 13 files)
- **Frontend Production Build (`npm run build`):** PASS (Exit code 0, 2663 modules transformed)
- **Ops Targeted Vitest Suite:** PASS (34/34 passed across 4 dedicated test files)
