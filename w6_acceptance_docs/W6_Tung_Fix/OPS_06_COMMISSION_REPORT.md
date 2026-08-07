# OPS-06 — Partner Commission Report Validation Evidence

**Task Reference:** TUNG-W6-FIX-04  
**Tested SHA:** `3f60c1d61bf503aef75d65b73361fca432573eb6`  
**Scenario:** OPS-06 — Commission Report Validation  

---

## 1. Metric & Calculation Reconciliation

### 1.1 Commission Metrics Breakdown
For Partner Fixture (`partnerId: test-partner-01`):
- **Gross Revenue (*Tổng doanh thu*):** `1.000.000 ₫`
- **Commission Rate (*Tỷ lệ phí nền tảng*):** `15%`
- **Platform Fee (*Phí nền tảng ước tính*):** `150.000 ₫` (Calculated: Gross Revenue × Commission Rate)
- **Estimated Partner Revenue (*Doanh thu Partner ước tính*):** `850.000 ₫` (Calculated: Gross Revenue - Platform Fee)

### 1.2 Currency, Rounding & Security Rules
- **Units & Rounding:** All monetary amounts formatted in VND (`₫`) with integer rounding. Rates formatted in percentage (`%`).
- **Owner Scope Access:** Report endpoint (`GET /api/partner/reports`) strictly enforces authorization — accessible ONLY by the authenticated Owner of the specific Partner. Unauthorized partners receive `403 FORBIDDEN`.
- **Wording & Disclaimers:**
  - UI components (`CommissionSummaryCards.jsx`, `PartnerReportsPage.jsx`) explicitly include wording:
    > *"Các số tiền chỉ là ước tính/mô phỏng, không phải payout thực tế."*
  - Explicitly prevents confusion between gross revenue and actual partner payout ("RỦI RO: Nhầm doanh thu gross với tiền Partner thực nhận").

---

## 2. Automated Test Evidence

```text
SUITE: tests/partner-reports.test.js
RESULTS:
 - returns 401 without token (PASS)
 - returns report summary for valid range values (PASS)
 - defaults to 30 days when range is omitted (PASS)
 - rejects invalid range (PASS)
```
