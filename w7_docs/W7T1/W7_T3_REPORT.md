# W7-T3 — Admin Dashboard, Partner Report & CMS Closure

**Project:** ViVouch Marketplace-Lite  
**Sprint:** Week 7  
**Task:** W7-T3 — Admin dashboard, Partner report & CMS mapping closure  
**Branch:** `W7-T3/Admin-dashboard-Partner-report-CMS-closure`  
**Ngày:** 2026-08-12  
**Trạng thái:** ✅ PASS

---

## Outcome

Repo đã có phần lớn chức năng từ W6. Sau verify toàn bộ:

- **Không cần rewrite/refactor** bất kỳ file nào.
- Bổ sung tối thiểu **4 field** để đóng AC còn gap:
  - `totalVouchers`, `totalOrders` → `getDashboardStats()`
  - `issuedCount`, `soldCount`, `usedCount` → `getPartnerReports()` summary
- Frontend Dashboard KPI desktop: thêm tile **"Voucher (tổng)"** + trend hiển thị `totalOrders`.
- Frontend PartnerReportsPage: thêm **dải badge** `sold / used / issued / utilization%` ngay dưới CommissionSummaryCards.

---

## Commands đã chạy & kết quả

| Command | Cwd | Kết quả |
|---|---|---|
| `vitest run admin-dashboard.test.js partner-reports.test.js cms-api.test.js` | `backend/` | ✅ 3 files, **15/15 PASS** (pre-change verify) |
| `npm test` | `backend/` | ✅ 28 files, **206/206 PASS** (full suite, no regression) |
| `npm test -- --run` | `frontend/` | ✅ 16 files, **38/38 PASS** |
| `vitest run admin-dashboard.test.js partner-reports.test.js` | `backend/` | ✅ 2 files, **11/11 PASS** (post-change, incl. new assertions) |

---

## Acceptance Criteria

| Tiêu chí | Kết quả |
|---|---|
| Admin dashboard có user/partner/voucher/order/revenue | ✅ `totalUsers`, `activePartners`, `totalVouchers`, `totalOrders`, `revenueThisMonth`, `ordersToday` |
| Partner report có revenue + issued/sold/used/utilization | ✅ `revenue`, `orders`, `customers`, `issuedCount`, `soldCount`, `usedCount`, `conversion` |
| CMS mapping dùng current model/UI, không xây CMS mới | ✅ `categories`, `pages`, `banners` + auditLog mọi thao tác |
| Critical action traceable | ✅ AuditLog có `actorId`, `targetType`, `targetId`, `requestId`; AuditLogsPage filter + paginate |

---

## File thay đổi

| File | Loại |
|---|---|
| `backend/src/modules/admin/admin.service.js` | Thêm `totalVouchers`, `totalOrders` vào `getDashboardStats()` |
| `backend/src/modules/reports/reports.service.js` | Thêm `issuedCount`, `soldCount`, `usedCount`; bỏ date-filter voucherCodes (đếm toàn bộ) |
| `frontend/src/pages/admin/AdminDashboardPage.jsx` | KPI desktop: thêm tile "Voucher (tổng)" + trend hiển thị `totalOrders` |
| `frontend/src/pages/partner/PartnerReportsPage.jsx` | Badge row `sold / used / issued / utilization%` |
| `backend/tests/admin-dashboard.test.js` | Thêm assertion `totalVouchers`, `totalOrders` |
| `w7_docs/W7T1/W7_T3_REPORT.md` | Báo cáo này |

---

## Pre-existing (đã verify, KHÔNG sửa)

| Thành phần | Trạng thái |
|---|---|
| `AdminDashboardPage.jsx` — Chart 30 ngày, pending partners sidebar, orders table | ✅ |
| `AuditLogsPage.jsx` — Filter action + ngày, paginate | ✅ |
| `CmsPagesPage.jsx` — CRUD categories/pages/banners, tab-based | ✅ |
| `PartnerReportsPage.jsx` — CommissionSummaryCards, LineChart, Top Vouchers, bảng | ✅ |
| `cms.service.js` — auditLog CREATE/UPDATE/DELETE | ✅ |
| `admin-approval.test.js` + `admin-orders-audit.test.js` — audit assertions đầy đủ | ✅ |
| `partner-reports.test.js` — revenue, orders, customers, conversion | ✅ |

---

## Lỗi còn lại

Không có.

---

## Task tiếp theo

Chuyển sang task tiếp theo theo kế hoạch W7 (W7-D1, W7-V1, v.v.).
