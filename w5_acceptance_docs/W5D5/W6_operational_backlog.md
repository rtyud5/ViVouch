# W6 Operational Backlog — Partner/Admin Portal

> **Historical W5-T5 snapshot.** This file is retained for provenance and is superseded by the [final W6/W7 backlog](W5D5_02_prioritized_backlog.md). Branch management, Categories/CMS, direct usage/audit assertions, audit filters, and the previously failing review assertions were closed during consolidated D5 remediation; do not treat their rows below as open work.

**Carryover from W5-T5 | Owner: Partner & Admin Portal Lead**  
**Date:** 2026-07-19  
**Priority:** P2 = Within W6 | P3 = Nice-to-have / Post-submission

---

## P2 — Should Fix in W6

| # | Item | File | Rationale |
|---|---|---|---|
| W6-PA-01 | Partner Dashboard chart dùng real API data thay vì mock | `PartnerDashboardPage.jsx` | Mock data đang được label rõ ràng nhưng cần real revenue trend cho demo chuyên nghiệp. Endpoint `GET /api/partner/reports` đã sẵn có. |
| W6-PA-02 | Partner Dashboard timeline dùng real activity feed | `PartnerDashboardPage.jsx` | Timeline MOCK_TIMELINE hardcoded. Cần backend endpoint hoặc tái dùng audit logs với filter `actorId = partnerId`. |
| W6-PA-03 | KPI Dashboard tính phía backend thay vì FE limit=48 | `PartnerDashboardPage.jsx` | Hiện dùng `limit=48` để lấy toàn bộ voucher và tính tổng FE-side. Không chính xác nếu có >48 voucher. Cần aggregate endpoint `GET /api/partner/kpi`. |
| W6-PA-04 | BranchesPage đầy đủ | `partner/BranchesPage.jsx` | File hiện là placeholder 68 bytes. Cần UI tạo/sửa/xóa chi nhánh, toggle active/inactive. |
| W6-PA-05 | Admin CategoriesPage | `admin/CategoriesPage.jsx` | File hiện là placeholder 72 bytes. Cần CRUD category cho admin. |
| W6-PA-06 | Admin CmsPagesPage | `admin/CmsPagesPage.jsx` | File hiện là placeholder 68 bytes. Out-of-BRD scope cho W5, nhưng cần xác nhận với team nếu rubric yêu cầu. |
| W6-PA-07 | Voucher Approval — hiển thị thêm thông tin chi tiết | `VoucherApprovalsPage.jsx` | Modal hiện chỉ hiện title, giá, mô tả. Cần thêm: saleStart/saleEnd, totalQty, danh sách branch scope, category. |
| W6-PA-08 | voucherUsageLog direct assertion trong test | `partner-redeem-api.test.js` | Hiện chỉ có indirect evidence (cleanup confirmation). Cần direct assertion: `await prisma.voucherUsageLog.findFirst({ where: { voucherCodeId } })` sau redeem thành công. |

---

## P3 — Nice-to-Have / Post-Submission

| # | Item | File | Rationale |
|---|---|---|---|
| W6-PA-09 | Partner Dashboard responsive chart | `PartnerDashboardPage.jsx` | Chart height cố định 300px, cần ResponsiveContainer height dynamic trên mobile |
| W6-PA-10 | Admin Audit Log — text search filter | `AuditLogsPage.jsx` | Hiện chỉ có action dropdown. Cần thêm search box cho actor email hoặc targetId |
| W6-PA-11 | Voucher Approval — pagination | `VoucherApprovalsPage.jsx` | Hiện fetch page 1 limit 10 nhưng không có pagination UI. Cần thêm nếu có nhiều voucher pending. |
| W6-PA-12 | Partner Voucher — bulk action | `PartnerVoucherListPage.jsx` | Submit/delete nhiều voucher cùng lúc — tiện lợi nhưng ngoài BRD |
| W6-PA-13 | Redeem history cho partner | New page | Partner xem lịch sử các mã đã đổi trong kỳ — cần API `GET /api/partner/redeem-history` |
| W6-PA-14 | Admin real-time notification | New feature | Khi có partner mới đăng ký hoặc voucher mới submit, admin nhận notification — WebSocket hoặc polling |
| W6-PA-15 | reviews-api.test.js P3 string-matching | `reviews-api.test.js` | 3 test case fail do error message format khác (`Too small: expected number...` vs `/rating/i`). Không ảnh hưởng core, nhưng cần fix cho 165/162 target |

---

## Tech Debt Registry (carryover)

| Debt | Location | Source |
|---|---|---|
| KPI tính FE-side với limit=48 | PartnerDashboardPage.jsx | T4 Remaining Risk |
| Mock chart/timeline trong Partner Dashboard | PartnerDashboardPage.jsx | T3 limitation |
| voucherUsageLog evidence gián tiếp | partner-redeem-api.test.js | T4 Remaining Risk |
| Responsive screenshots chưa automated | Manual only | T4 Pending |

---

## Dependencies for W6

- **Endpoint cần thêm:** `GET /api/partner/kpi` (aggregate, không dùng limit=48 trick)
- **Endpoint cần thêm:** `GET /api/partner/activity` (activity feed thật)
- **Endpoint cần thêm:** `GET /api/partner/redeem-history` (lịch sử đổi mã)
- **Schema cần kiểm tra:** `voucherUsageLog` có đủ fields để build history page không
- **Phối hợp:** Backend Lead (Huy) cần implement aggregate endpoints trước khi PA có thể hook FE

---

*Handover: W6 PA Lead — ưu tiên W6-PA-01, W6-PA-03, W6-PA-08 cho accuracy and completeness.*
