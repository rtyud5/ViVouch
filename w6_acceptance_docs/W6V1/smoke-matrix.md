# W6-V1 Customer Smoke Matrix

| Module | Scenario | Expected | Actual | Status |
|--------|----------|----------|--------|--------|
| Auth | Đăng nhập với tài khoản hợp lệ | Chuyển hướng tới trang chủ/dashboard; AuthStore cập nhật token | Chuyển hướng đúng, token lưu ở AuthStore | PASS |
| Auth | Lỗi 401 (Hết hạn Token) | Interceptor catch, chuyển sang trang /login kèm authMessage | Token refresh thử, fail thì redirect đúng | PASS |
| Auth | Lỗi 403 (Account Locked) | Redirect /login với thông báo bị khoá tài khoản | Thông báo hiển thị qua authMessage | PASS |
| Browse | Liệt kê Vouchers | Dữ liệu load không báo lỗi, không có hardcode localhost URL | Gọi đúng API_BASE_URL, ảnh placeholder nếu cần | PASS |
| Cart | Add to cart, Update quantity | Mutation gọi API thành công, render không bị crash/blank page | Không blank page, handle loading/error retry | PASS |
| Cart | Rate Limit (429) | Báo "Thao tác quá nhanh (Too Many Requests)" | Lỗi UI qua ApiErrorToast với text mapping mới | PASS |
| Cart/Checkout | Xung đột DB (409) | Báo "Xung đột dữ liệu (Conflict)" | Lỗi UI qua ApiErrorToast với text mapping mới | PASS |
| Checkout | Chọn phương thức thanh toán | Thanh toán Ví ViVouch hoặc PayOS không lỗi giao diện | Chọn PayOS, Ví ViVouch load bình thường | PASS |
