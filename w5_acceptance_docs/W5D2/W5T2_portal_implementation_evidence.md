# W5-T2: Partner/Admin Functional Gaps Evidence

## 1. Mục tiêu
Hoàn tất luồng vận hành Partner/Admin và đảm bảo action phản ánh data thật. Đóng các lỗ hổng về chức năng trên portal, loại bỏ dữ liệu hardcode (mock).

## 2. Portal Implementation Fixes
- **Admin Dashboard**: Thay thế dữ liệu mock `generateRevenueData()` bằng API thực tế thông qua việc cập nhật hàm `getDashboardStats()` trên backend để trả về `revenueByDay`. Cập nhật `AdminDashboardPage.jsx` để render BarChart dựa trên dữ liệu thật.
- **Partner Branch/Profile/Voucher**: Các form tạo, cập nhật, gửi duyệt (submit) voucher và thông tin branch/profile đều liên kết chuẩn với mutation API (các chức năng tạo nháp, cập nhật, gửi duyệt trong `CreateVoucherPage.jsx`, `PartnerProfilePage.jsx`).
- **Redeem Branch Scoped**: Cơ chế quét mã tự động chuyển đổi chi nhánh nếu hợp lệ. Quá trình mapping các mã lỗi từ backend (`INVALID_BRANCH_SCOPE`, `VOUCHER_CODE_USED`, `VOUCHER_CODE_EXPIRED`, v.v.) qua `RedeemVoucherPage.jsx` đã được xử lý và hiển thị thông báo rõ ràng cho người dùng thay vì exception.
- **Partner Reports Filters/Metrics**: Trang `PartnerReportsPage.jsx` tích hợp bộ lọc theo thời gian (7, 30, 90 ngày) và gọi query API `usePartnerReports()` chính xác. Dữ liệu trên báo cáo và bảng là dữ liệu thật từ backend.

## 3. Contract Mismatch List
*Không có mismatch được tìm thấy.*
- Trong quá trình loại bỏ dữ liệu hardcode, một thuộc tính mới `revenueByDay` đã được bổ sung vào hàm `getDashboardStats` ở phía backend nhằm cung cấp dữ liệu theo đúng mô hình biểu đồ yêu cầu. Dữ liệu này được tiêu thụ hợp lệ bởi React Query component frontend.

## 4. Regression Checklist
- [x] Tạo/sửa thông tin branch và doanh nghiệp (Partner Profile)
- [x] Tạo và sửa trạng thái nháp (DRAFT) của voucher
- [x] Đổi mã (Redeem) với kiểm tra phân quyền chi nhánh
- [x] Trang Dashboard báo cáo thống kê hiển thị doanh thu theo các ngày
- [x] Báo cáo Partner Dashboard load chart linh hoạt (đã tích hợp API trước đó)
- [x] Admin Dashboard không dùng hardcode data mẫu
- [x] Giao diện hiển thị trạng thái chờ tải (Loading pulse skeleton) hoạt động đúng lúc lấy API.

## 5. Updated Portal Matrix
| Tính năng | Trạng thái hiện tại |
|---------|-------|
| Partner Voucher CRUD | Đã hoàn thiện & API tương thích |
| Admin Dashboard Chart | Đã tích hợp (Dữ liệu thật từ database) |
| Redeem with Branch Scope | Xử lý map kết quả trực quan (success/failure card) |
| Partner Profile | Kết nối trực tiếp với Database Mutation |

## 6. Lời kết và bàn giao
Tất cả các rủi ro (đặc biệt liên quan đến dữ liệu trả về và contract mismatch) đã được xử lý. Mã nguồn có chứng cứ test tự động (`admin-dashboard.test.js`) xác nhận luồng.
Sẵn sàng bàn giao trạng thái cho T3/T4.
