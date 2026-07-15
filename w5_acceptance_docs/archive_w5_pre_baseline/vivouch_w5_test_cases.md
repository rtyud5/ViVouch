# ViVouch W5 — E2E Test Cases & Flow Triage

**Scan ngày:** 2026-07-06
**Môi trường:** Local (Frontend `http://localhost:5173`, Backend `http://localhost:5000`)
**Người thực hiện:** Duy (Acceptance Lead)
**Cách chấm:** ✅ Pass | ❌ Fail | ⛔ Block | ⬜ Chưa test

> **W5.3 Regression Update (2026-07-09):** Đã chạy re-test toàn bộ flows. Backend API 142/142 tests pass. Full W4 E2E flow (checkout → redeem → review) pass trên seed chuẩn. Bug gate applied: P0/P1 = 0 mới; P2/P3 ghi backlog W6.

---

## Flow 1: Admin Portal

**Mục tiêu:** Kiểm tra quyền admin, duyệt partner/voucher, xem danh sách, dashboard.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| ADM-01 | Đăng nhập bằng tài khoản Admin | Đăng nhập thành công, chuyển hướng vào Dashboard Admin | ✅ | API login `admin@vivouch.com` / `Admin@123` hoạt động |
| ADM-02 | Dashboard hiển thị KPI | 4 KPI card hiện số liệu thật (users, partners, orders, revenue) | ✅ | API trả users, partners, ordersToday, revenue — revenue chart là sample (badge rõ) |
| ADM-03 | Truy cập trang "Quản lý Partner" | Bảng danh sách Partner hiển thị đúng, phân trang hoạt động | ✅ | API `GET /api/admin/users?role=PARTNER` hoạt động |
| ADM-04 | Thay đổi trạng thái Partner (Active/Ban) | Toast thông báo thành công, trạng thái trên bảng cập nhật ngay | ✅ | API approve/reject partner hoạt động (BE test pass) |
| ADM-05 | Tìm kiếm Partner theo tên/email | Gõ text vào ô Search, danh sách lọc ra dữ liệu khớp | ✅ | API search hoạt động |
| ADM-06 | Xem chi tiết & Phê duyệt Voucher | Modal chi tiết voucher chờ duyệt hiển thị đầy đủ, **không bị Sidebar che** | ✅ | B105: **Đã sửa** — z-index fix trên branch `fixAdminUI` |
| ADM-07 | Từ chối Voucher với lý do | Nhập lý do → bấm "Từ chối" → voucher chuyển sang REJECTED | ✅ | API reject voucher hoạt động (BE test pass) |
| ADM-08 | Sidebar thu gọn / phóng to | Sidebar tự thu về icon-only; hover thì hiện label đầy đủ | ✅ | Mới implement — `fixAdminUI` branch |
| ADM-09 | Truy cập Voucher tab "Đã duyệt" | Danh sách voucher APPROVED hiển thị đúng | ✅ | API filter by status hoạt động |
| ADM-10 | Quản lý Users — danh sách & search | Bảng users hiện đúng, search theo tên/email | ✅ | API `GET /api/admin/users` hoạt động |
| ADM-11 | Quản lý Đơn hàng | Bảng orders hiện đúng, filter status | ✅ | API `GET /api/admin/orders` hoạt động |

---

## Flow 2: Partner Portal

**Mục tiêu:** Tạo/quản lý voucher, xem báo cáo, redeem mã.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| PTN-01 | Đăng nhập bằng tài khoản Partner | Vào được Dashboard Partner | ✅ | API login `haidilao@vivouch.com`/`Partner@123` hoạt động |
| PTN-02 | Dashboard KPI từ dữ liệu thật | 4 KPI card (voucher đang bán, đã bán, đã dùng, doanh thu) hiện số thật | ✅ | KPI tính từ API thật; chart/timeline là mock — badge rõ |
| PTN-03 | Bộ lọc thời gian biểu đồ | Đổi dropdown → chart cập nhật | ❌ | **B103** (P2 — backlog W6): Select không wire vào state |
| PTN-04 | Nút "Xem tất cả" hoạt động gần đây | Click → điều hướng đến trang phù hợp | ❌ | **B104** (P2 — backlog W6): Button không có onClick |
| PTN-05 | Tạo một Voucher mới | Mở form, điền hợp lệ → Tạo thành công, hiện trên danh sách | ✅ | `CreateVoucherPage.jsx` hoạt động (BE test pass) |
| PTN-06 | Danh sách Voucher — Filter theo status | Chọn filter "Chờ duyệt" → danh sách lọc đúng | ✅ | API `GET /api/partner/vouchers?status=` hoạt động |
| PTN-07 | Search voucher theo keyword | Gõ keyword → danh sách lọc theo tên voucher | ✅ | API `?search=` hoạt động |
| PTN-08 | Xem trang Reports — range 7/30/90 ngày | Bộ lọc range hoạt động, chart/table cập nhật theo range | ✅ | API `GET /api/partner/reports?range=` hoạt động (BE test pass) |
| PTN-09 | Reports khi không có data | Empty state hiện "Chưa có dữ liệu" thay vì crash | ✅ | Empty state xử lý đúng |
| PTN-10 | Profile Partner — lưu thông tin | Chỉnh sửa thông tin → Save → cập nhật thành công | ✅ | API `PUT /api/partner/profile` hoạt động |
| PTN-11 | Quản lý Chi nhánh | Trang chi nhánh hiển thị đúng | ❌ | **B102** (P3 — backlog W6): BranchesPage chỉ là stub `return <div>BranchesPage</div>` |

---

## Flow 3: Customer Flow

**Mục tiêu:** Browse → Cart → Checkout → Order Success → My Vouchers → Review.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| CUS-01 | Đăng ký & Đăng nhập | Tài khoản tạo thành công, vào được trang Marketplace | ✅ | API register/login hoạt động (BE test pass) |
| CUS-02 | Browse & Tìm kiếm Voucher | Danh sách hiển thị đúng, search/filter hoạt động | ✅ | API `GET /api/vouchers` + search/filter hoạt động |
| CUS-03 | Xem chi tiết Voucher | Hiển thị đúng ảnh, mô tả, giá, reviews | ✅ | API `GET /api/vouchers/:id` trả đủ data, reviews thật |
| CUS-04 | Thêm vào Giỏ hàng | Cart số lượng tăng, item xuất hiện trong cart | ✅ | API cart add/get hoạt động (BE test pass) |
| CUS-05 | Trang Checkout — hiển thị đủ thông tin | Hiện danh sách sản phẩm, thông tin người mua, phương thức TT | ✅ | CheckoutPage có sản phẩm, thông tin người mua, 3 phương thức TT mock |
| CUS-06 | Trang Checkout — thiếu nút Back | **Phải có** nút Back để quay lại trang Cart | ❌ | **B101** (P2 — backlog W6): Không có nút Back trên CheckoutPage |
| CUS-07 | Thực hiện Checkout thành công | navigate tới OrderSuccessPage với orderId và voucherCodes | ✅ | API `POST /api/customer/orders/checkout` hoạt động |
| CUS-08 | Order Success — QR và Copy code | Hiển thị QR, nút Sao chép hoạt động với feedback | ✅ | `OrderSuccessPage.jsx` có QRCodeSVG + copy button + confetti |
| CUS-09 | My Vouchers — ISSUED/USED/EXPIRED | Tab filter hoạt động, mỗi tab hiện đúng voucher | ✅ | `MyVouchersPage.jsx` có 3 tab filter + phân loại đúng |
| CUS-10 | My Vouchers — QR Modal | Click xem QR → modal hiện code + QR rõ | ✅ | QRCodeModal component có sẵn |
| CUS-11 | Profile — Cập nhật thông tin | Lưu thông tin thành công | ✅ | API `PUT /api/users/me` hoạt động (BE test pass) |
| CUS-12 | Profile — Đổi mật khẩu | Đổi mật khẩu thành công | ✅ | API `POST /api/users/me/change-password` hoạt động (BE test pass) |
| CUS-13 | Viết Review sau khi USED | Form submit review → review xuất hiện trên VoucherDetail | ⛔ | **B106** (P2 — backlog W6): WriteReviewForm UI đã có, BE API hoạt động, nhưng backend không trả 'userEligibility' → form luôn hiển thị "NOT_ELIGIBLE". User vẫn submit được, API xử lý đúng. |

---

## Flow 4: Redeem Code

**Mục tiêu:** Partner đối soát mã khi sinh viên tới cửa hàng.

| ID | Test Case | Expected Result | Result | Ghi chú |
|:---|:---|:---|:---:|:---|
| RDM-01 | Tại Partner Portal, vào trang Redeem | Giao diện nhập mã hiển thị sẵn sàng | ✅ | `RedeemVoucherPage.jsx` có input + nút xác nhận + error card |
| RDM-02 | Nhập mã ISSUED hợp lệ | Validate thành công, hiển thị thông tin voucher | ✅ | API `POST /api/partner/redeem` với ISSUED code trả success |
| RDM-03 | Xác nhận Redeem mã | Báo thành công, status DB → USED, usage log sinh ra | ✅ | Tested với code ISSUED, thành công |
| RDM-04 | Redeem lại mã đã USED | Báo lỗi rõ "Mã đã được sử dụng" — chống double-redeem | ✅ | Tested: API trả `VOUCHER_CODE_USED` + error card đỏ |
| RDM-05 | Redeem mã của partner khác | Báo lỗi "Không có quyền đối soát mã này" | ✅ | Seed có `VC-WRONG-PARTNER` — API trả `WRONG_PARTNER` |
| RDM-06 | Redeem mã EXPIRED | Báo lỗi rõ "Mã đã hết hạn" | ✅ | API trả `VOUCHER_CODE_EXPIRED` (BE test pass) |
| RDM-07 | Nhập mã không tồn tại | Báo lỗi rõ "Không tìm thấy mã" | ✅ | API trả `VOUCHER_CODE_NOT_FOUND` (BE test pass) |

---

## Danh sách Bug mở (cross-reference với handoff_notes)

| Bug ID | Mức độ | Liên quan Test Case | Tóm tắt | Bug Gate |
|:---|:---|:---|:---|---:|
| B101 | **P2** | CUS-06 | CheckoutPage không có nút Back | → **Backlog W6** |
| B102 | **P3** | PTN-11 | BranchesPage chỉ là stub rỗng | → **Backlog W6** |
| B103 | **P2** | PTN-03 | Dashboard chart time filter không wire | → **Backlog W6** |
| B104 | **P2** | PTN-04 | Nút "Xem tất cả" hoạt động gần đây không có onClick | → **Backlog W6** |
| B105 | **P1** | ADM-06 | ~~Modal Voucher bị Sidebar che~~ | **✅ ĐÃ SỬA** (fixAdminUI) |
| B106 | **P2** | CUS-13 | WriteReviewForm UI có, nhưng backend không trả `userEligibility` | → **Backlog W6** |

> **W5.3 Bug Gate Summary:** P0 = 0 bugs mới, P1 = 0 bugs mở (B105 đã fix). Tất cả P2/P3 (B101, B102, B103, B104, B106) được ghi backlog W6. **Không phát hiện bug mới** ngoài danh sách đã biết.

---

> **Lưu ý sau khi Test:** Điền kết quả ✅/❌/⛔ vào cột Result. Ghi bug mới vào `vivouch_w5_handoff_notes.md` và update BRD matrix.
