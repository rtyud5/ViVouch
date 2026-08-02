# W6-T5 — W7 Ops E2E Backlog

**Source:** W6-T5 QA sign-off  
**Date:** 2026-08-02  
**Context:** W7 picks up from W6 baseline SHA `48cbb1145f47573a9028e85fae1ef18a6f2249ef`

---

## W7 Bootstrapping Commands

```bash
git fetch origin
git checkout main
git pull origin main
# Verify HEAD matches: 48cbb1145f47573a9028e85fae1ef18a6f2249ef
git checkout -b w7-baseline
```

---

## W7 Ops E2E Backlog

### 1. Refund — Full E2E (Wallet + payOS)

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-RF-01 | Customer request refund → Admin approve (Wallet) → Wallet balance verified | E2E | HIGH |
| W7-RF-02 | Customer request refund → Admin approve (payOS) → Admin complete manual → `providerRefundReference` verified in DB | E2E | HIGH |
| W7-RF-03 | Customer request refund → Admin reject → Order returns to COMPLETED → Codes return to ISSUED | E2E | HIGH |
| W7-RF-04 | Refund request trùng lặp (idempotency) — 2nd request on same orderId phải 409 | E2E | MEDIUM |
| W7-RF-05 | Refund ngoài refundWindow — phải 409 REFUND_WINDOW_EXPIRED | E2E | MEDIUM |
| W7-RF-06 | Refund concurrency — 2 admin approve cùng lúc (race condition trên PostgreSQL) | Concurrency | HIGH |

### 2. Branch Redeem — E2E với Admin + Staff Sessions

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-BR-01 | Partner owner redeem tại branch của mình → USED | E2E | HIGH |
| W7-BR-02 | Staff (branch A) redeem đúng branch A → USED | E2E | HIGH |
| W7-BR-03 | Staff (branch A) thử redeem branch B → 403, DB không đổi | Negative | HIGH |
| W7-BR-04 | Partner tạo staff mới, gán branch, staff login và redeem ngay | E2E | MEDIUM |
| W7-BR-05 | Concurrent redeem cùng code từ 2 staff sessions | Concurrency | HIGH |
| W7-BR-06 | Redeem code ở trạng thái REFUND_PENDING → blocked đúng | Negative | MEDIUM |

### 3. Admin Audit Ops

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-AU-01 | Admin approve partner → AuditLog verified với actor.email, targetType=Partner | E2E | HIGH |
| W7-AU-02 | Admin cancel order → AuditLog ADMIN_CANCEL_ORDER với oldValues/newValues | E2E | HIGH |
| W7-AU-03 | Admin filter audit log theo action=ADMIN_APPROVE_REFUND — pagination đúng | E2E | MEDIUM |
| W7-AU-04 | System reconcile job chạy → SYSTEM_RECONCILE_VOUCHER log (actorId null) | E2E | MEDIUM |
| W7-AU-05 | AuditLog UI: actor SYSTEM hiển thị "Hệ thống (SYSTEM)", không blank | UI | MEDIUM |

### 4. RBAC Hardening

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-RB-01 | Staff không thể gọi `/api/admin/*` — toàn bộ admin routes | Negative | HIGH |
| W7-RB-02 | Customer không thể gọi `/api/partner/*` kể cả với PARTNER email pattern | Negative | HIGH |
| W7-RB-03 | Token expired → 401 UNAUTHORIZED (không fallback sang anonymous) | Negative | HIGH |
| W7-RB-04 | Refresh token rotation — old refresh token revoked sau khi dùng 1 lần | Security | HIGH |
| W7-RB-05 | Admin tạm ngưng Partner → Partner token hiện tại bị từ chối | E2E | MEDIUM |

### 5. Jobs / Reconciliation

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-JB-01 | `runReconciliation` expire APPROVED voucher đã qua `saleEnd` → status `EXPIRED` | E2E | HIGH |
| W7-JB-02 | `runReconciliation` activate APPROVED voucher đến `saleStart` → `ON_SALE` | E2E | HIGH |
| W7-JB-03 | `expirePendingPayOsOrders` cancel order PENDING_PAYMENT > 15 phút | E2E | HIGH |
| W7-JB-04 | Parallel reconcile runs — chỉ 1 instance xử lý mỗi record (SKIP LOCKED) | Concurrency | HIGH |
| W7-JB-05 | Email outbox SMTP failure → `emailDelivery.status=FAILED`, retry sau | E2E | MEDIUM |

### 6. Partner Reports

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-PR-01 | Reports API scoped đúng partnerId — không leak data của partner khác | Security | HIGH |
| W7-PR-02 | Range=7, 30, 90 — từng value đều trả data đúng khoảng thời gian | E2E | MEDIUM |
| W7-PR-03 | Reports UI: disclaimer "mô phỏng" hiển thị đúng vị trí, không hidden | UI | LOW |

### 7. Status UI / API Consistency

| ID | Scenario | Type | Priority |
|---|---|---|---|
| W7-UI-01 | Admin refunds list: MANUAL_REFUND_REQUIRED badge "Chờ hoàn thủ công payOS" | UI | HIGH |
| W7-UI-02 | Partner redeem: REFUND_PENDING code → error card đúng message | UI | HIGH |
| W7-UI-03 | Customer orders list: REFUND_PENDING → "Đang chờ hoàn tiền" | UI | MEDIUM |
| W7-UI-04 | Admin support tickets: OPEN/PROCESSING/RESOLVED badges render đúng | UI | MEDIUM |

---

## Risks Carried Forward

| ID | Risk | Mitigation |
|---|---|---|
| R-01 | Shared test fixture gây test phụ thuộc thứ tự | Mỗi test file phải `beforeAll` cleanup + `afterAll` cleanup, không dùng global state |
| R-02 | Real DB tests chạy parallel gây race trên shared data | Dùng unique email/data per test suite, hoặc chạy tuần tự (`--sequence`) |
| R-03 | payOS manual refund reference nhập tay — human error | W7 UI: thêm validation format mã tham chiếu ngân hàng |
| R-04 | `reconciliation.service.js` không log `SYSTEM_RECONCILE_VOUCHER` vào AuditLog hiện tại | W7: thêm audit log cho reconcile jobs |

---

## Tech Debt Items (từ tech-debt-w6.md)

| ID | Item | Sprint Target |
|---|---|---|
| TD-01 | `window.prompt()` trong `RefundsPage.jsx` → modal component | W7 |
| TD-02 | Wallet mock `VIVOUCH_WALLET` → real wallet service integration | W7+ |
| TD-03 | `partner-reports.test.js` chỉ 4 tests — mở rộng coverage | W7 |
| TD-04 | Rate limit test chỉ 2 scenarios — thêm per-role limits | W7 |
