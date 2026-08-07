# OPS-04 — Admin Refund & Support Ticket Operations Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-04 — Admin refund và ticket operations  

---

## 1. Refund & Support Ticket Integration

### 1.1 State Mapping & Visual Badging
- Integrated `AdminStatusBadge.jsx` for standard state mapping across Admin Operations UI:
  - **Refund Requests:** `REQUESTED`, `MANUAL_REFUND_REQUIRED`, `APPROVED`, `REJECTED`, `COMPLETED`.
  - **Support Tickets:** `OPEN`, `PROCESSING`, `RESOLVED`, `CLOSED`.

### 1.2 payOS Manual Refund vs Automated Wallet Refund Integrity
- **Automated Wallet Refund:** Completed automatically via system wallet credit with `Payment.status = REFUNDED`.
- **payOS VietQR Manual Refund:**
  - Approving payOS refund transitions status to `MANUAL_REFUND_REQUIRED`.
  - Admin must execute manual banking transfer and input `providerRefundReference`.
  - **payOS manual refund is NOT displayed or spoofed as automated provider refund.**
  - Displayed explicitly as `payOS VietQR (Hoàn thủ công)` with mandatory `Mã GD hoàn` reference log.

### 1.3 Safe Error Handling & Traceability
- Error responses include safe request reference (`requestId`) without exposing internal trace details or sensitive database errors to client.
- Full traceability for every action with `actorId`, `targetType`, `targetId`, `requestId`, and timestamp.

---

## 2. Automated Test & Execution Evidence

```text
SUITE: tests/admin-orders-audit.test.js & frontend vitest suite
RESULTS:
 - GET /api/admin/orders > 200 trả về list orders có pagination (PASS)
 - GET /api/admin/orders/:id > 200 trả về order detail đầy đủ (PASS)
 - AdminStatusBadge renders correct status colors and labels (PASS)
```

- **DB Mutations:**
  - `Payment.status`: set to `REFUNDED`.
  - `Payment.providerReference`: populated with manual transaction code.
  - `SupportTicket.status`: updated upon Admin response.
