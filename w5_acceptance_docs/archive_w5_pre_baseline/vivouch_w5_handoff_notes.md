# ViVouch W5 — Handoff & Triage Notes

**Baseline build:** `v0.8-w4-e2e`
**Scan ngày:** 2026-07-06 — Duy (Acceptance Lead)
**Branch hiện tại:** `fixAdminUI` (chứa fix B105 + collapsible sidebar)

---

## 1. Tóm tắt tình trạng hệ thống

| Area | Tình trạng | Ghi chú |
|:---|:---:|:---|
| Auth / Role Guard | ✅ Stable | JWT, requireRole middleware hoạt động đúng |
| Admin Portal | ✅ Mostly stable | Modal fix done; chart là sample (đã badge rõ) |
| Partner Portal | ⚠️ Partial | KPI thật; chart/timeline mock; 2 bug dashboard còn mở |
| Customer Portal | ⚠️ Partial | Review submit chưa tích hợp; thiếu Back button Checkout |
| Redeem Flow | ✅ Stable | BE đầy đủ, double-redeem chặn đúng |
| Reports (Partner) | ✅ Stable | API thật, range 7/30/90 hoạt động |
| Branches / RBAC | 🛑 Stub | Chưa có BE, FE là placeholder |
| Email Notifications | 🛑 Mocked | Console log |
| Seed Data | ✅ Stable | Admin/partner/customer accounts hoạt động |
| API Tests | ✅ Good | 16 test files cho các flow chính |

---

## 2. Gaps List (Tính năng trong scope nhưng chưa hoàn chỉnh)

1. **Review submit FE chưa tích hợp:** BE `POST /vouchers/:id/reviews` hoàn chỉnh và có test. FE có `useReviews.js` hook nhưng `VoucherDetailPage.jsx` chỉ hiển thị list, không có form submit. → **Owner: Vinh (Customer)**

2. **Checkout thiếu nút Back:** `CheckoutPage.jsx` không có nút quay lại (navigate(-1) hoặc Link to Cart). → **Owner: Vinh (Customer)**

3. **Partner Dashboard chart bộ lọc thời gian không wire:** `<select>` ở chart "Doanh thu 30 ngày" không kết nối state. → **Owner: Tùng (Partner)**

4. **Partner Dashboard nút "Xem tất cả":** Button trong timeline không có `onClick` handler. → **Owner: Tùng (Partner)**

5. **BranchesPage stub:** Chỉ là `export function BranchesPage() { return <div>BranchesPage</div>; }` — cần quyết định: out-of-scope hoặc basic UI. → **Owner: Tùng (Partner)**

6. **Admin revenue chart là mock:** Dùng seeded random data thay vì API. Badge "Dữ liệu mẫu" đã có — acceptable cho W5, cần API real cho W6. → **Technical debt W6**

7. **CORS/JWT env validation:** Chưa có hard fail khi `NODE_ENV=production` và thiếu env quan trọng. → **Owner: Huy (BE Stability) / W5.2**

8. **Phân trang Admin tables:** Một số bảng admin chưa có pagination UI (hiển thị hết data trong giới hạn limit). → **Technical debt W6**

---

## 3. Bug Triage

*(P0: Blockers/Crash; P1: Lỗi nghiệp vụ chính; P2: UX/Flow bị ảnh hưởng; P3: UI/Message)*

| ID | Mức độ | Component | Tóm tắt lỗi | Owner | Trạng thái |
|:---|:---:|:---|:---|:---|:---|
| B101 | **P2** | FE — `CheckoutPage.jsx` | Trang thanh toán không có nút Back để quay lại trang Cart | Vinh | 🔴 Mở |
| B102 | **P3** | FE — `BranchesPage.jsx` | Trang Chi nhánh là stub rỗng, không có nội dung | Tùng | 🔴 Mở |
| B103 | **P2** | FE — `PartnerDashboardPage.jsx` | Bộ lọc thời gian biểu đồ doanh thu không wire vào state — không lọc được | Tùng | 🔴 Mở |
| B104 | **P2** | FE — `PartnerDashboardPage.jsx` | Nút "Xem tất cả" hoạt động gần đây không có onClick handler | Tùng | 🔴 Mở |
| B105 | **P1** | FE — `VoucherApprovalsPage.jsx` | Modal chi tiết voucher bị z-index Sidebar che khuất bên trái | Duy | ✅ Đã sửa (`fixAdminUI`) |
| B106 | **P2** | FE — `VoucherDetailPage.jsx` | Review list hiển thị nhưng không có form để submit review mới | Vinh | 🔴 Mở |

---

## 4. Kết quả Fix đã thực hiện (W5)

| Fix | Branch | Mô tả |
|:---|:---|:---|
| **B105 — Modal z-index** | `fixAdminUI` | Tăng z-index modal VoucherApprovals từ `z-[100]` lên `z-[9999]` |
| **Admin Sidebar Collapsible** | `fixAdminUI` | Sidebar tự thu về `w-72px` (icon-only), hover → `w-260px` với transition mượt |
| **Content area responsive** | `fixAdminUI` | `DashboardLayout` dùng `isCollapsible` prop, content tự điều chỉnh theo sidebar width |

---

## 5. Technical Debt → W6 Backlog

| Item | Priority | Mô tả |
|:---|:---:|:---|
| Admin Revenue Chart API | High | Thay mock data bằng `GET /api/admin/stats/revenue?days=30` |
| Partner Dashboard Chart wire | Medium | Kết nối select vào rangeDays state, fetch API thật theo range |
| Review Submit FE | Medium | Tích hợp form submit review vào VoucherDetailPage |
| Checkout Back button | Medium | Thêm nút Back (navigate(-1) hoặc Link to /cart) |
| CORS/JWT env production guard | Medium | Hard fail nếu thiếu env trong production mode |
| Idempotency Checkout | High | Chặn double-submit checkout request |
| Rate Limiting | Medium | Áp dụng express-rate-limit cho các endpoint nhạy cảm |
| Audit Logs wire | Low | Verify AuditLogsPage FE hiển thị đúng data từ BE |
| Branches / RBAC Partner | Low | Quyết định scope W6 hoặc out-of-scope |

---

## 6. Hướng dẫn Seed & Chạy hệ thống

```bash
# 1. Khởi động DB
docker compose up -d

# 2. Backend (port 5000)
cd backend
npm run dev

# 3. Frontend (port 5173)
cd frontend
npm run dev

# Tài khoản test:
# Admin:   admin@vivouch.com / 123456 (hoặc theo seed)
# Partner: partner@vivouch.com / 123456
# Customer: customer@vivouch.com / 123456
```

---

## 7. Checklist W5 theo Sprint Plan

- [x] Full flow W4 còn pass: Partner tạo → Admin duyệt → Customer mua → Partner redeem
- [x] Không còn bug P0/P1 trong toàn hệ thống (B105 đã fix; P2/P3 ghi backlog W6)
- [x] BRD matrix đã rà với trạng thái rõ ràng
- [x] Checkout đủ nghiệp vụ (recipient/policy có; Back button → backlog W6 — B101)
- [x] Redeem edge cases pass đầy đủ (USED/EXPIRED/wrong partner/not found) — verified
- [x] AdminDashboard không crash; mock data có badge rõ
- [ ] Security baseline (CORS/JWT/env) kiểm tra và hardening — W5.2 đang chạy
- [x] Seed chạy sạch, 3 role login được
- [x] Modal Voucher approval không bị Sidebar che (B105 fixed)
- [ ] Tag `v0.9-assignment-complete` chưa tạo — chờ W5.2 merge xong

---

> **W5.3 Regression (2026-07-09):** Đã chạy xong W5.3 regression coordinator. Backend 142/142 tests pass. Full W4 E2E flow pass. Bug gate applied: không còn P0/P1 mở (B105 đã fix), tất cả P2/P3 ghi backlog W6. Regression report tại `vivouch_w5_regression_report.md`.

---

## 8. Kết quả W5.3 Regression Update

### Bug Triage (sau W5.3 gate)

| ID | Mức độ | Component | Tóm tắt lỗi | Owner | Trạng thái |
|:---|:---:|:---|:---|:---|:---:|
| B101 | **P2** | FE — `CheckoutPage.jsx` | Trang thanh toán không có nút Back để quay lại trang Cart | Vinh | 🔴 **Backlog W6** |
| B102 | **P3** | FE — `BranchesPage.jsx` | Trang Chi nhánh là stub rỗng, không có nội dung | Tùng | 🔴 **Backlog W6** |
| B103 | **P2** | FE — `PartnerDashboardPage.jsx` | Bộ lọc thời gian biểu đồ doanh thu không wire vào state — không lọc được | Tùng | 🔴 **Backlog W6** |
| B104 | **P2** | FE — `PartnerDashboardPage.jsx` | Nút "Xem tất cả" hoạt động gần đây không có onClick handler | Tùng | 🔴 **Backlog W6** |
| B105 | **P1** | FE — `VoucherApprovalsPage.jsx` | Modal chi tiết voucher bị z-index Sidebar che khuất bên trái | Duy | ✅ **Đã sửa** (`fixAdminUI`) |
| B106 | **P2** | FE — `VoucherDetailPage.jsx` | WriteReviewForm UI có, BE API hoạt động, nhưng backend không trả `userEligibility` → form review luôn NOT_ELIGIBLE | Vinh | 🔴 **Backlog W6** |

> **Bug Gate note:** Không phát hiện bug mới ngoài danh sách đã biết. **P0/P1 = 0 mở.** Tất cả P2/P3 ghi backlog W6. **Feature creep check:** Pass — không có fix nào thêm feature ngoài scope.

### Candidate stable tag `v0.9-assignment-complete`

| Điều kiện | Trạng thái |
|:---|---:|
| Full W4 flow pass | ✅ Verified |
| Không P0/P1 mở | ✅ B105 fixed |
| Seed chạy sạch | ✅ |
| Cần chờ: W5.2 Security baseline merge | ⏳ Đang chạy song song |
