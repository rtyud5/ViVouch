# ViVouch W5 — E2E Test Cases & Flow Triage

**Scan ngày:** 2026-07-06
**Môi trường:** Local (Frontend `http://localhost:5173`, Backend `http://localhost:5000`)
**Người thực hiện:** Duy (Acceptance Lead)
**Cách chấm:** ✅ Pass | ❌ Fail | ⛔ Block | ⬜ Chưa test

---

## Flow 1: Admin Portal

**Mục tiêu:** Kiểm tra quyền admin, duyệt partner/voucher, xem danh sách, dashboard.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| ADM-01 | Đăng nhập bằng tài khoản Admin | Đăng nhập thành công, chuyển hướng vào Dashboard Admin | ⬜ | |
| ADM-02 | Dashboard hiển thị KPI | 4 KPI card hiện số liệu thật (users, partners, orders, revenue) | ⬜ | Revenue chart là sample, badge rõ |
| ADM-03 | Truy cập trang "Quản lý Partner" | Bảng danh sách Partner hiển thị đúng, phân trang hoạt động | ⬜ | |
| ADM-04 | Thay đổi trạng thái Partner (Active/Ban) | Toast thông báo thành công, trạng thái trên bảng cập nhật ngay | ⬜ | |
| ADM-05 | Tìm kiếm Partner theo tên/email | Gõ text vào ô Search, danh sách lọc ra dữ liệu khớp | ⬜ | |
| ADM-06 | Xem chi tiết & Phê duyệt Voucher | Modal chi tiết voucher chờ duyệt hiển thị đầy đủ, **không bị Sidebar che** | ✅ | B105: **Đã sửa** — z-index fix trên branch `fixAdminUI` |
| ADM-07 | Từ chối Voucher với lý do | Nhập lý do → bấm "Từ chối" → voucher chuyển sang REJECTED | ⬜ | |
| ADM-08 | Sidebar thu gọn / phóng to | Sidebar tự thu về icon-only; hover thì hiện label đầy đủ | ✅ | Mới implement — `fixAdminUI` branch |
| ADM-09 | Truy cập Voucher tab "Đã duyệt" | Danh sách voucher APPROVED hiển thị đúng | ⬜ | |
| ADM-10 | Quản lý Users — danh sách & search | Bảng users hiện đúng, search theo tên/email | ⬜ | |
| ADM-11 | Quản lý Đơn hàng | Bảng orders hiện đúng, filter status | ⬜ | |

---

## Flow 2: Partner Portal

**Mục tiêu:** Tạo/quản lý voucher, xem báo cáo, redeem mã.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| PTN-01 | Đăng nhập bằng tài khoản Partner | Vào được Dashboard Partner | ⬜ | |
| PTN-02 | Dashboard KPI từ dữ liệu thật | 4 KPI card (voucher đang bán, đã bán, đã dùng, doanh thu) hiện số thật | ⬜ | Chart/timeline là mock — badge rõ |
| PTN-03 | Bộ lọc thời gian biểu đồ | Đổi dropdown → chart cập nhật | ❌ | B103: Select không wire vào state, chart không thay đổi |
| PTN-04 | Nút "Xem tất cả" hoạt động gần đây | Click → điều hướng đến trang phù hợp | ❌ | B104: Button không có onClick |
| PTN-05 | Tạo một Voucher mới | Mở form, điền hợp lệ → Tạo thành công, hiện trên danh sách | ⬜ | |
| PTN-06 | Danh sách Voucher — Filter theo status | Chọn filter "Chờ duyệt" → danh sách lọc đúng | ⬜ | |
| PTN-07 | Search voucher theo keyword | Gõ keyword → danh sách lọc theo tên voucher | ⬜ | |
| PTN-08 | Xem trang Reports — range 7/30/90 ngày | Bộ lọc range hoạt động, chart/table cập nhật theo range | ⬜ | Dùng API thật |
| PTN-09 | Reports khi không có data | Empty state hiện "Chưa có dữ liệu" thay vì crash | ⬜ | |
| PTN-10 | Profile Partner — lưu thông tin | Chỉnh sửa thông tin → Save → cập nhật thành công | ⬜ | |
| PTN-11 | Quản lý Chi nhánh | Trang chi nhánh hiển thị đúng | ❌ | B102 variant: BranchesPage chỉ là stub rỗng |

---

## Flow 3: Customer Flow

**Mục tiêu:** Browse → Cart → Checkout → Order Success → My Vouchers → Review.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| CUS-01 | Đăng ký & Đăng nhập | Tài khoản tạo thành công, vào được trang Marketplace | ⬜ | |
| CUS-02 | Browse & Tìm kiếm Voucher | Danh sách hiển thị đúng, search/filter hoạt động | ⬜ | |
| CUS-03 | Xem chi tiết Voucher | Hiển thị đúng ảnh, mô tả, giá, reviews | ⬜ | Reviews hiển thị từ API thật |
| CUS-04 | Thêm vào Giỏ hàng | Cart số lượng tăng, item xuất hiện trong cart | ⬜ | |
| CUS-05 | Trang Checkout — hiển thị đủ thông tin | Hiện danh sách sản phẩm, thông tin người mua, phương thức TT | ⬜ | |
| CUS-06 | Trang Checkout — thiếu nút Back | **Phải có** nút Back để quay lại trang Cart | ❌ | B101: Không có nút Back trên CheckoutPage |
| CUS-07 | Thực hiện Checkout thành công | navigate tới OrderSuccessPage với orderId và voucherCodes | ⬜ | |
| CUS-08 | Order Success — QR và Copy code | Hiển thị QR, nút Sao chép hoạt động với feedback | ⬜ | |
| CUS-09 | My Vouchers — ISSUED/USED/EXPIRED | Tab filter hoạt động, mỗi tab hiện đúng voucher | ⬜ | |
| CUS-10 | My Vouchers — QR Modal | Click xem QR → modal hiện code + QR rõ | ⬜ | |
| CUS-11 | Profile — Cập nhật thông tin | Lưu thông tin thành công | ⬜ | |
| CUS-12 | Profile — Đổi mật khẩu | Đổi mật khẩu thành công | ⬜ | |
| CUS-13 | Viết Review sau khi USED | Form submit review → review xuất hiện trên VoucherDetail | ❌ | B106: FE hook `useReviews` có nhưng form submit chưa tích hợp vào VoucherDetailPage — chỉ hiển thị list |

---

## Flow 4: Redeem Code

**Mục tiêu:** Partner đối soát mã khi sinh viên tới cửa hàng.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| RDM-01 | Tại Partner Portal, vào trang Redeem | Giao diện nhập mã hiển thị sẵn sàng | ⬜ | |
| RDM-02 | Nhập mã ISSUED hợp lệ | Validate thành công, hiển thị thông tin voucher | ⬜ | |
| RDM-03 | Xác nhận Redeem mã | Báo thành công, status DB → USED, usage log sinh ra | ⬜ | |
| RDM-04 | Redeem lại mã đã USED | Báo lỗi rõ "Mã đã được sử dụng" — chống double-redeem | ⬜ | |
| RDM-05 | Redeem mã của partner khác | Báo lỗi "Không có quyền đối soát mã này" | ⬜ | |
| RDM-06 | Redeem mã EXPIRED | Báo lỗi rõ "Mã đã hết hạn" | ⬜ | |
| RDM-07 | Nhập mã không tồn tại | Báo lỗi rõ "Không tìm thấy mã" | ⬜ | |

---

## Danh sách Bug mở (cross-reference với handoff_notes)

| Bug ID | Mức độ | Liên quan Test Case | Tóm tắt |
|:---|:---|:---|:---|
| B101 | **P2** | CUS-06 | CheckoutPage không có nút Back |
| B102 | **P3** | PTN-11 | BranchesPage chỉ là stub rỗng |
| B103 | **P2** | PTN-03 | Dashboard chart time filter không wire |
| B104 | **P2** | PTN-04 | Nút "Xem tất cả" hoạt động gần đây không có onClick |
| B105 | **P1** | ADM-06 | ~~Modal Voucher bị Sidebar che~~ **ĐÃ SỬA** (fixAdminUI) |
| B106 | **P2** | CUS-13 | FE review chỉ hiển thị list, form submit chưa tích hợp |

---

> **Lưu ý sau khi Test:** Điền kết quả ✅/❌/⛔ vào cột Result. Ghi bug mới vào `vivouch_w5_handoff_notes.md` và update BRD matrix.
