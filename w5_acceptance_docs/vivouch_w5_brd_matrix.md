# ViVouch Sprint W5 — BRD Coverage Matrix

**Baseline:** `v0.8-w4-e2e` → hiện tại trên branch `fixAdminUI`
**Scan ngày:** 2026-07-06
**Người rà:** Duy (Acceptance Lead)

*Trạng thái: ✅ Implemented | ⚠️ Partial | 🛑 Mocked | ⚪ Out-of-scope*

---

## 🔐 Authentication & Authorization

| Module | Feature | Status | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Auth** | Customer Đăng ký / Đăng nhập | ✅ | JWT + Refresh Token, validated |
| **Auth** | Partner Login / Logout | ✅ | Hoạt động đầy đủ |
| **Auth** | Admin Login | ✅ | Hoạt động đầy đủ |
| **Auth** | Role Guard (BE Middleware) | ✅ | `role.middleware.js` → `requireRole` áp dụng đúng trên routes admin/partner/review/order/cart |
| **Auth** | Route Guard (FE) | ✅ | Protected routes theo role ở `App.jsx` / layout |
| **Auth** | RBAC phân quyền nhân viên Partner | 🛑 | FE chỉ có stub `BranchesPage.jsx` (2 dòng), không có backend |

---

## 🛒 Customer Portal

| Module | Feature | Status | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Customer** | Browse Marketplace / Voucher list | ✅ | Public, phân trang, filter |
| **Customer** | Xem chi tiết Voucher | ✅ | `VoucherDetailPage.jsx` — có Reviews section |
| **Customer** | Thêm vào Giỏ hàng (Cart) | ✅ | API + UI hoạt động |
| **Customer** | Trang Checkout | ⚠️ | Không có nút Back; thiếu recipient/gift fields (B101) |
| **Customer** | Thanh toán (Payment mock) | ⚠️ | 3 phương thức mock có label rõ "Mô phỏng". Không có payment gateway thật |
| **Customer** | Trang Order Success + QR/Code | ✅ | Hiển thị QR, copy code, confetti animation |
| **Customer** | My Vouchers (ISSUED/USED/EXPIRED) | ✅ | Tab filter, QR Modal có sẵn |
| **Customer** | Profile (cập nhật thông tin) | ✅ | `ProfilePage.jsx` hoàn chỉnh, đổi mật khẩu có |
| **Customer** | Đánh giá Voucher (Review) | ⚠️ | BE hoàn chỉnh + tested; FE hook `useReviews.js` có, nhưng **chỉ hiển thị review**, form submit review chưa được tích hợp vào VoucherDetailPage |
| **Customer** | Empty states / Error states | ✅ | `CustomerEmptyState`, `ErrorRetryPanel`, `LoadingSpinner` đã có |

---

## 🤝 Partner Portal

| Module | Feature | Status | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Partner** | Dashboard (KPI thật) | ⚠️ | 4 KPI card tính từ API thật; Chart doanh thu là **dữ liệu mẫu** (MockDataBadge hiển thị rõ); Timeline hoạt động gần đây là mock |
| **Partner** | Bộ lọc thời gian Dashboard | 🛑 | `<select>` không wire vào state — không lọc được (B103) |
| **Partner** | Nút "Xem tất cả" hoạt động gần đây | 🛑 | Button không có onClick handler (B104) |
| **Partner** | Tạo / Chỉnh sửa Voucher | ✅ | `CreateVoucherPage.jsx` đầy đủ |
| **Partner** | Danh sách Voucher + Filter/Search | ✅ | `PartnerVoucherListPage.jsx` — filter status, search, phân trang |
| **Partner** | Redeem Voucher | ✅ | `RedeemVoucherPage.jsx` + BE chống double-redeem, usage log |
| **Partner** | Báo cáo (Reports) | ✅ | API real, range 7/30/90 hoạt động, empty state có xử lý |
| **Partner** | Profile / Thông tin đối tác | ✅ | `PartnerProfilePage.jsx` — lưu được, không hardcode |
| **Partner** | Chi nhánh (Branches) | 🛑 | Stub rỗng — chưa có backend |

---

## 🛡️ Admin Portal

| Module | Feature | Status | Ghi chú |
| :--- | :--- | :---: | :--- |
| **Admin** | Dashboard (KPI thật) | ⚠️ | KPI từ API thật (users, partners, ordersToday, revenue); Revenue chart là **dữ liệu mẫu** (badge rõ) |
| **Admin** | Quản lý Đối tác (Ban/Activate) | ✅ | `PartnersPage.jsx` — kích hoạt / ban, search, phân trang |
| **Admin** | Duyệt Voucher (Approve/Reject) | ✅ | Modal chi tiết, z-index fix (B105 đã sửa), nút approve/reject hoạt động |
| **Admin** | Quản lý Users | ✅ | `UsersPage.jsx` — danh sách, search |
| **Admin** | Đơn hàng (Orders) | ✅ | `OrdersPage.jsx` — filter, search |
| **Admin** | Nhật ký kiểm toán (Audit Logs) | ⚠️ | `AuditLogsPage.jsx` có, backend có `auditLogs` module; cần kiểm tra wire |
| **Admin** | Thanh sidebar tự thu/phóng | ✅ | Mới implement — hover-collapsible (fixAdminUI branch) |

---

## ⚙️ System / Infrastructure

| Module | Feature | Status | Ghi chú |
| :--- | :--- | :---: | :--- |
| **System** | Email Notifications | 🛑 | Log console giả lập, không gửi thật |
| **System** | CORS config | ⚠️ | Dùng `CLIENT_URL` từ env; chưa verify production mode chặt |
| **System** | JWT bắt buộc env production | ⚠️ | Chưa có guard rõ khi `NODE_ENV=production` thiếu secret |
| **System** | Error response chuẩn hóa | ⚠️ | Có global handler, nhưng tính đồng nhất giữa modules chưa 100% |
| **System** | Seed data ổn định | ✅ | Seed script đầy đủ admin/partner/customer; data đủ success/failure states |
| **System** | API tests coverage | ✅ | 16 test files cho admin, auth, cart, checkout, partner, reviews, users |

---

> **W5 Coverage Summary:**
> - **Implemented (✅):** 26 features
> - **Partial (⚠️):** 9 features — cần triage ưu tiên
> - **Mocked (🛑):** 5 features — không có BE hoặc chỉ stub
> - **Out-of-scope (⚪):** 0 — tất cả feature mocked đã được track

> **P1 còn mở:** B101 (Checkout thiếu nút Back), B103/B104 (Partner Dashboard filter/nút không hoạt động)
> **P đã đóng:** B105 (Admin Voucher Modal z-index — đã fix và push lên `fixAdminUI`)
