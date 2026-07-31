# W6-T4 — Admin Ops, Audit & Report Validation Evidence

**Task:** W6-T4 — Admin ops, audit & report validation  
**Date:** 2026-08-01  
**Branch:** `Code/Operations/Admin-ops-audit-report-validation`  
**Role:** Partner / Admin Operations  

---

## 1. Technical Audit & Status Mapping Summary

### 1.1. Admin Refund Operations & payOS Manual Refund Integrity
- Updated [RefundsPage.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/pages/admin/RefundsPage.jsx) to distinguish between automated wallet refunds (`Ví ViVouch (Hoàn tự động)`) and payOS manual refunds (`payOS VietQR (Hoàn thủ công)`).
- Enforced manual refund workflow: approving a payOS refund transitions status to `MANUAL_REFUND_REQUIRED`. The UI requires Admin to perform banking payout manually, enter the required transaction reference code (`providerRefundReference`), and click *"Xác nhận đã chuyển khoản payOS"*.
- Guaranteed **payOS manual refund does NOT pretend to be auto-refund** ("payOS manual refund không giả auto-refund").
- Displayed `Mã GD hoàn` on completed manual refunds.

### 1.2. Support Ticket Operations
- Updated [SupportTicketsPage.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/pages/admin/SupportTicketsPage.jsx) to render support ticket status badges via [AdminStatusBadge.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/features/admin/components/AdminStatusBadge.jsx) (`OPEN`, `PROCESSING`, `RESOLVED`, `REJECTED`).
- Enhanced customer identity display (`fullName`, `email`), ticket description box, and Admin response timeline formatting.

### 1.3. Audit Log Mapping & Actor/Target Clarity
- Expanded action constants and labels in [AuditLogsPage.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/pages/admin/AuditLogsPage.jsx) to cover all system actions:
  - `CUSTOMER_REQUEST_REFUND` (*Yêu cầu hoàn tiền*)
  - `ADMIN_APPROVE_REFUND` (*Duyệt hoàn tiền*)
  - `ADMIN_REJECT_REFUND` (*Từ chối hoàn tiền*)
  - `ADMIN_COMPLETE_MANUAL_REFUND` (*Xác nhận hoàn thủ công payOS*)
  - `CUSTOMER_CREATE_TICKET` (*Tạo ticket hỗ trợ*)
  - `ADMIN_RESPOND_TICKET` (*Phản hồi ticket hỗ trợ*)
  - `PAYMENT_PAYOS_WEBHOOK` (*Webhook payOS*)
  - `SYSTEM_RECONCILE_VOUCHER` (*Đối soát voucher*)
  - `PARTNER_CREATE_STAFF` / `PARTNER_UPDATE_STAFF` (*Tạo/cập nhật nhân viên*)
- **Actor Clarity:** Explicitly renders actor email + role badge, fallback to `Hệ thống (SYSTEM)` for background tasks.
- **Target Clarity:** Renders target entity type (`RefundRequest`, `SupportTicket`, `Order`, `Voucher`, `Partner`) with exact ID.
- **Changes Clarity:** Pretty-formatted JSON preview containing `oldValues`, `newValues`, and `ipAddress`.

### 1.4. Commission Report Reconciliation
- Verified [PartnerReportsPage.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/pages/partner/PartnerReportsPage.jsx) and [CommissionSummaryCards.jsx](file:///d:/01_InformationSystem/07_E_Commerce/03_Project/ViVouch/frontend/src/features/partner/components/CommissionSummaryCards.jsx):
  1. Gross revenue (*Tổng doanh thu*): Formatted in VND (`1.000.000 ₫`).
  2. Platform commission rate (*Tỷ lệ phí nền tảng*): Formatted in % (`15%`).
  3. Platform fee (*Phí nền tảng ước tính*): Formatted in VND (`150.000 ₫`).
  4. Partner net revenue (*Doanh thu Partner ước tính*): Formatted in VND (`850.000 ₫`).
- Enforced explicit disclaimer: *"Các số tiền chỉ là ước tính/mô phỏng, không phải payout thực tế."*
- Prevented confusion between gross revenue and actual partner payout ("RỦI RO: Nhầm doanh thu gross với tiền Partner thực nhận").

---

## 2. Test Execution Evidence

### Backend Targeted Test Suite
```text
COMMAND: npx vitest run tests/admin-orders-audit.test.js tests/partner-reports.test.js tests/rbac-authorization.test.js
LOCATION: backend/
EXIT_CODE: 0
RESULT: 29 passed (29)
```

Key test cases verified:
1. `Admin listing orders and filtering by status` (PASS)
2. `Audit log generation upon order state changes` (PASS)
3. `Partner reports API calculates revenue, platformFee, estimatedPartnerRevenue and commissionRate` (PASS)
4. `Partner reports API returns 401 for unauthorized access` (PASS)
5. `Partner reports API returns 400 for invalid range values` (PASS)
6. `RBAC authorization rules across customer, partner, and admin roles` (PASS)

### Frontend Unit & Build Suite
```text
COMMAND: npm test -- --run
LOCATION: frontend/
EXIT_CODE: 0
RESULT: 26 passed (26)

COMMAND: npm run test:unit:node
LOCATION: frontend/
EXIT_CODE: 0
RESULT: 2 passed (2)

COMMAND: npm run build
LOCATION: frontend/
EXIT_CODE: 0
RESULT: Built production bundle cleanly without errors in 7.68s
```

---

## 3. Database State & Invariant Assertions

- **PostgreSQL Transaction & Audit Invariants:**
  - `RefundRequest` creation and approval execute inside atomic PostgreSQL transactions.
  - Manual refund completion updates `Payment.status = 'REFUNDED'` and populates `Payment.providerReference` with the mandatory transaction reference.
  - Every administrative action creates an immutable `AuditLog` entry detailing `actorId`, `action`, `targetType`, `targetId`, `oldValues`, and `newValues`.
