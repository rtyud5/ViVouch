# Báo cáo QA Customer Portal

**Phạm vi:** CUS-01 đến CUS-15  
**Ngày retest evidence:** 2026-08-16  
**Kết luận:** PASS. Bộ evidence gồm đúng 33 screenshot theo `CUSTOMER_QA_TASK_EXECUTION_GUIDE.md`, không có ảnh thừa.

## Điều kiện retest

- Đăng nhập bằng tài khoản Customer và kiểm tra trên frontend local.
- Trước mỗi ảnh, chờ ảnh trong vùng nội dung tải xong; kiểm tra không có text icon lỗi: `receipt_long`, `currency_exchange`, `support_agent`, `notifications`, `qr_code_2`, `schedule`, `storefront`, `timer`, `expand_more`.
- Icon Customer dùng SVG nội bộ; ảnh voucher dùng ảnh chất lượng cao và fallback cục bộ khi ảnh ngoài lỗi.
- `npm run build`: PASS. `npm run test -- --run`: PASS, 16 files / 38 tests.

## Kết quả chi tiết

### CUS-01 - Login + Logout: PASS

Đăng nhập dẫn đến Customer Home; sau logout/back phải quay về Login. Evidence: [sau login](screenshots/CUS-01_login_success.png), [sau logout/back](screenshots/CUS-01_logout_back_blocked.png).

### CUS-02 - Customer Role Guard: PASS

Customer bị chặn khỏi Admin và Partner. Evidence: [Admin dashboard](screenshots/CUS-02_admin_dashboard_blocked.png), [Admin users](screenshots/CUS-02_admin_users_blocked.png), [Partner dashboard](screenshots/CUS-02_partner_dashboard_blocked.png), [Partner vouchers](screenshots/CUS-02_partner_vouchers_blocked.png).

### CUS-03 - Catalog / Home: PASS

Catalog hiển thị card, giá, partner và ảnh; click card mở detail. Evidence: [Catalog](screenshots/CUS-03_catalog_home.png), [Detail](screenshots/CUS-03_voucher_detail_sample.png).

### CUS-04 - Search: PASS

Evidence: [kết quả có dữ liệu](screenshots/CUS-04_search_results.png), [empty state](screenshots/CUS-04_search_empty_state.png).

### CUS-05 - Voucher Detail + Invalid State: PASS

Evidence: [detail hợp lệ](screenshots/CUS-05_voucher_detail.png), [ID không hợp lệ](screenshots/CUS-05_invalid_id_handled.png).

### CUS-06 - Add To Cart: PASS

Evidence: [cart, danh sách và tổng tiền](screenshots/CUS-06_cart_items_total.png).

### CUS-07 - Cart Quantity / Remove: PASS

Evidence: [trước/sau đổi số lượng](screenshots/CUS-07_cart_before_after.png), [sau xóa](screenshots/CUS-07_cart_removed.png).

### CUS-08 - Empty Cart: PASS

Evidence: [empty cart và checkout bị chặn](screenshots/CUS-08_empty_cart.png).

### CUS-09 - Orders List + Ownership: PASS

Evidence: [orders list](screenshots/CUS-09_orders_list.png), [order detail](screenshots/CUS-09_order_detail.png).

### CUS-10 - My Vouchers: PASS

Evidence theo từng tab bắt buộc: [ISSUED](screenshots/CUS-10_vouchers_issued.png), [USED](screenshots/CUS-10_vouchers_used.png), [EXPIRED](screenshots/CUS-10_vouchers_expired.png).

### CUS-11 - Profile Persistence: PASS

Evidence: [trước lưu](screenshots/CUS-11_profile_before_save.png), [sau lưu/reload](screenshots/CUS-11_profile_after_save.png).

### CUS-12 - Support Ticket: PASS

Evidence: [validation](screenshots/CUS-12_ticket_validation.png), [ticket history](screenshots/CUS-12_ticket_history.png).

### CUS-13 - Notifications: PASS

Evidence: [notifications và badge](screenshots/CUS-13_notifications.png).

### CUS-14 - Responsive Mobile: PASS

Viewport `390x844`. Evidence: [Home](screenshots/CUS-14_mobile_home.png), [Detail](screenshots/CUS-14_mobile_voucher_detail.png), [Cart](screenshots/CUS-14_mobile_cart.png), [Orders](screenshots/CUS-14_mobile_orders.png), [My Vouchers](screenshots/CUS-14_mobile_vouchers.png), [Support](screenshots/CUS-14_mobile_support.png).

### CUS-15 - Offline Error Handling: PASS

Evidence: [offline error state](screenshots/CUS-15_offline_error.png).

## Xác nhận evidence

Thư mục `screenshots/` hiện có đúng 33 ảnh yêu cầu trong guide. Tất cả được tạo lại sau khi sửa icon/ảnh; không giữ các ảnh cũ có icon hiển thị thành chữ hoặc thumbnail voucher trống.
