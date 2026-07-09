# Danh sách Technical Debt - W6

Dưới đây là các phần nợ kỹ thuật và các tính năng bổ sung dự kiến sẽ được đẩy sang Tuần 6 (W6) sau khi Backend đã freeze cho baseline:

## 1. Security & Rate Limiting
- [ ] **Rate Limits:** Cấu hình Rate Limits cho các API nhạy cảm (`login`, `register`, `checkout`, `redeem`) trong `src/middlewares/rateLimit.middleware.js`.
- [ ] **Idempotency-Key:** Hỗ trợ middleware Idempotency cho các API quan trọng có thể gây lỗi khi retry trùng lặp ở tầng mạng (như `checkout`, `redeem`).

## 2. Tích hợp thanh toán
- [ ] **Payment Gateway:** Thay thế hoặc mở rộng `payment.service.js` (hiện tại đang là simulated) bằng cổng thanh toán thực tế (VNPAY, MoMo, v.v.).

## 3. Tính năng & CRUD chưa hoàn thiện
- [ ] **Branches Module:** Hoàn thiện module Quản lý Chi nhánh (CRUD: controller, routes, service, validators) trong thư mục `src/modules/branches`.
- [ ] **Categories Validator:** Hoàn thiện các schema validate bằng Zod cho module `categories`.
- [ ] **Audit Log API:** Mở và hoàn thiện các endpoint đọc Audit Log cho Admin tại `src/modules/auditLogs`.
- [ ] **Date Utils:** Thêm các helper functions cho xử lý ngày tháng ở `src/utils/date.js`.
- [ ] **Validation Middleware:** Cập nhật chặt chẽ hơn middleware dùng Zod schemas ở `src/middlewares/validate.middleware.js`.

## 4. API Documentation
- [ ] **Swagger/OpenAPI:** Tích hợp và cấu hình load file YAML/JSON Swagger để sinh tài liệu API chuẩn tại endpoint `/api-docs`.

---
*Tài liệu này được tạo tại thời điểm Backend Stable Freeze.*
