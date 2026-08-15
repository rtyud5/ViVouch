# BÁO CÁO KIỂM THỬ: ROLE CUSTOMER (CUSTOMER PORTAL)

**Người thực hiện:** Vinh (Customer Portal Lead)
**Dự án:** ViVouch
**Thư mục lưu trữ:** W7V5

---

## 1. Mục tiêu kiểm thử
Xác nhận tính chính xác của các luồng nghiệp vụ dành riêng cho người dùng với vai trò `CUSTOMER`, đảm bảo giao diện trực quan, không phát sinh lỗi trong quá trình thao tác.
Đặc biệt, kiểm tra và xác nhận các lỗi đã report trước đây đã được fix triệt để:
- Đã thêm nút "Đơn hàng" (Orders) vào Sidebar (Desktop) và Bottom Navigation (Mobile).
- Giao diện trang "Hoàn tiền" và "Hỗ trợ" đã được thiết kế lại, khắc phục lỗi text đụng form và bố cục sơ sài.

## 2. Các chức năng đã thực hiện Test (Sử dụng Browser Agent)

Quá trình test được thực hiện tự động hoá thông qua Browser Agent. 
Tài khoản test: `customer1@test.com` / `Test@123`

### 2.1. Đăng nhập hệ thống
- **Thao tác:** Điều hướng đến `/login` và thực hiện đăng nhập.
- **Kết quả:** Đăng nhập thành công, token được lưu trữ đúng cách và hệ thống tự động điều hướng sang trang chủ khách hàng `/customer/home`.
- **Đánh giá:** **(PASS)**

### 2.2. Kiểm tra chức năng Đơn Hàng (Orders)
- **Thao tác:** Truy cập vào `/customer/orders` thông qua menu điều hướng mới được thêm vào.
- **Kết quả:** Giao diện lịch sử mua hàng tải dữ liệu thành công. Không có lỗi UI/UX, bảng hiển thị rõ ràng.
- **Đánh giá:** **(PASS)** 
*(Xem screenshot đính kèm: `screenshots/customer_orders_view.png`)*

### 2.3. Kiểm tra chức năng Hoàn Tiền (Refunds)
- **Thao tác:** Truy cập vào `/customer/refunds`.
- **Kết quả:** Giao diện chia 2 cột rõ ràng (Form yêu cầu bên trái, Lịch sử bên phải). Không còn tình trạng text label đè lên form hay padding bị lỗi. Danh sách đơn đủ điều kiện hoàn được load đầy đủ.
- **Đánh giá:** **(PASS)** 
*(Xem screenshot đính kèm: `screenshots/customer_refund_ui.png`)*

### 2.4. Kiểm tra chức năng Hỗ Trợ & Khiếu Nại (Support)
- **Thao tác:** Truy cập vào `/customer/support`.
- **Kết quả:** Form tạo ticket hỗ trợ được bố trí lại chuyên nghiệp và khoảng cách rộng rãi hơn. Text area không bị giới hạn chiều rộng sai cách.
- **Đánh giá:** **(PASS)** 
*(Xem screenshot đính kèm: `screenshots/customer_support_ui.png`)*

---

## 3. Screenshots Đính Kèm
Tất cả ảnh chụp màn hình trong quá trình test bằng Browser Agent đã được lưu trữ trong thư mục `screenshots`:
1. `screenshots/customer_orders_view.png`
2. `screenshots/customer_refund_ui.png`
3. `screenshots/customer_support_ui.png`

## 4. Tổng kết
- Role Customer đã sẵn sàng và hoạt động mượt mà.
- Giao diện đã được nâng cấp đáng kể, sửa toàn bộ các lỗi UI theo phản hồi của team.
- Đề xuất merge nhánh chức năng này và tiến hành test Role Partner/Admin.
