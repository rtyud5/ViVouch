# W5D3_01: API Error Contract Matrix

> Tài liệu này mô tả đầy đủ mapping giữa endpoint, HTTP status, error code, và điều kiện trigger.
> Frontend **phải** map theo `code` field, **không** parse `message`.

---

## Response Shape Convention

### Success Response
```json
{
  "success": true,
  "message": "Human-readable message (Vietnamese)",
  "data": { ... }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Human-readable error message",
  "code": "STABLE_ERROR_CODE",
  "details": [ ... ]   // optional, chỉ có cho VALIDATION_ERROR
}
```

> **Note:** `stack` chỉ xuất hiện ở non-production mode cho client errors (4xx). Production mode KHÔNG bao giờ trả `stack`.

---

## Error Matrix by Module

### Auth (`/api/auth/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/auth/register` | POST | 409 | `EMAIL_EXISTS` | Email đã tồn tại |
| `/auth/register` | POST | 409 | `PHONE_EXISTS` | Số điện thoại đã tồn tại |
| `/auth/register` | POST | 400 | `VALIDATION_ERROR` | Zod validation fail (email format, password length, etc.) |
| `/auth/login` | POST | 401 | `INVALID_CREDENTIALS` | Sai email hoặc mật khẩu |
| `/auth/login` | POST | 403 | `ACCOUNT_LOCKED` | Tài khoản bị khóa/suspend |
| `/auth/login` | POST | 400 | `VALIDATION_ERROR` | Thiếu email hoặc password |
| `/auth/me` | GET | 404 | `USER_NOT_FOUND` | Token valid nhưng user đã bị xóa |
| `/auth/me` | GET | 401 | `UNAUTHORIZED` | Thiếu/sai token |

### Cart (`/api/customer/cart/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/cart/items` | POST | 404 | `VOUCHER_NOT_FOUND` | Voucher ID không tồn tại |
| `/cart/items` | POST | 400 | `VOUCHER_NOT_ON_SALE` | Voucher không ở trạng thái ON_SALE |
| `/cart/items` | POST | 400 | `VOUCHER_OUT_OF_STOCK` | Số lượng còn lại không đủ |
| `/cart/items/:id` | PUT | 404 | `CART_ITEM_NOT_FOUND` | Cart item không tồn tại |
| `/cart/items/:id` | PUT | 403 | `FORBIDDEN` | Cart item không thuộc user |
| `/cart/items/:id` | PUT | 400 | `VOUCHER_NOT_ON_SALE` | Voucher không còn đang bán |
| `/cart/items/:id` | PUT | 400 | `VOUCHER_OUT_OF_STOCK` | Số lượng yêu cầu vượt stock |
| `/cart/items/:id` | DELETE | 404 | `CART_ITEM_NOT_FOUND` | Cart item không tồn tại |
| `/cart/items/:id` | DELETE | 403 | `FORBIDDEN` | Cart item không thuộc user |

### Orders / Checkout (`/api/customer/orders/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/orders/checkout` | POST | 401 | `UNAUTHORIZED` | Chưa xác thực |
| `/orders/checkout` | POST | 400 | `VALIDATION_ERROR` | Body không hợp lệ (Zod) |
| `/orders/checkout` | POST | 400 | `INVALID_IDEMPOTENCY_KEY` | Key < 8 hoặc > 128 ký tự |
| `/orders/checkout` | POST | 404 | `VOUCHER_NOT_FOUND` | Voucher không tồn tại |
| `/orders/checkout` | POST | 400 | `VOUCHER_UNAVAILABLE` | Voucher không còn ON_SALE |
| `/orders/checkout` | POST | 400 | `VOUCHER_NOT_YET_ON_SALE` | Chưa đến thời gian mở bán |
| `/orders/checkout` | POST | 400 | `VOUCHER_SALE_EXPIRED` | Đã hết hạn bán |
| `/orders/checkout` | POST | 400 | `VOUCHER_OUT_OF_STOCK` | Hết stock |
| `/orders/cart/checkout` | POST | 401 | `UNAUTHORIZED` | Chưa xác thực |
| `/orders/cart/checkout` | POST | 400 | `EMPTY_CART` | Giỏ hàng trống |
| `/orders/cart/checkout` | POST | 400 | `VALIDATION_ERROR` | Body không hợp lệ |

### Vouchers (`/api/partner/vouchers/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/vouchers` | POST | 400 | `INVALID_SALE_PERIOD` | saleEnd < saleStart |
| `/vouchers` | POST | 400 | `INVALID_USE_PERIOD` | useEnd < useStart hoặc useEnd < saleEnd |
| `/vouchers` | POST | 400 | `INVALID_PRICE` | salePrice >= originalPrice |
| `/vouchers/:id` | PUT | 404 | `VOUCHER_NOT_FOUND` | Voucher không tồn tại |
| `/vouchers/:id` | PUT | 403 | `FORBIDDEN` | Voucher không thuộc partner |
| `/vouchers/:id` | PUT | 400 | `INVALID_STATUS_TRANSITION` | Chỉ sửa khi DRAFT/REJECTED |
| `/vouchers/:id` | PUT | 400 | `INVALID_TOTAL_QTY` | totalQty < soldQty |
| `/vouchers/:id/submit` | POST | 404 | `VOUCHER_NOT_FOUND` | Voucher không tồn tại |
| `/vouchers/:id/submit` | POST | 403 | `FORBIDDEN` | Voucher không thuộc partner |
| `/vouchers/:id/submit` | POST | 400 | `INVALID_STATUS_TRANSITION` | Trạng thái không hợp lệ |
| `/vouchers/:id/submit` | POST | 400 | `SALE_PERIOD_EXPIRED` | Hết hạn mở bán |

### Redeem (`/api/partner/redeem/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/redeem/verify` | POST | 404 | `VOUCHER_CODE_NOT_FOUND` | Mã không tồn tại |
| `/redeem/verify` | POST | 403 | `FORBIDDEN` | Partner không có quyền |
| `/redeem/confirm` | POST | 404 | `VOUCHER_CODE_NOT_FOUND` | Mã không tồn tại |
| `/redeem/confirm` | POST | 400 | `VOUCHER_CODE_USED` | Mã đã được sử dụng |
| `/redeem/confirm` | POST | 400 | `VOUCHER_CODE_EXPIRED` | Mã đã hết hạn |
| `/redeem/confirm` | POST | 400 | `VOUCHER_CODE_CANCELLED` | Mã đã bị huỷ |
| `/redeem/confirm` | POST | 400 | `VOUCHER_CODE_LOCKED` | Mã đang bị khoá |
| `/redeem/confirm` | POST | 400 | `INVALID_VOUCHER_CODE` | Mã không hợp lệ |

### Partners (`/api/partner/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/partner/profile` | GET | 404 | `PARTNER_NOT_FOUND` | Chưa đăng ký partner |
| `/partner/branches/:id` | PUT | 404 | `BRANCH_NOT_FOUND` | Chi nhánh không tồn tại |
| `/partner/branches/:id` | PUT | 403 | `FORBIDDEN` | Chi nhánh không thuộc partner |
| `/partner/branches/:id` | DELETE | 404 | `BRANCH_NOT_FOUND` | Chi nhánh không tồn tại |
| `/partner/branches/:id` | DELETE | 403 | `FORBIDDEN` | Chi nhánh không thuộc partner |
| `/partner/branches/:id` | DELETE | 409 | `BRANCH_IN_USE` | Chi nhánh đang được sử dụng |

### Users (`/api/customer/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/customer/profile` | PUT | 409 | `PHONE_EXISTS` | Số điện thoại trùng |
| `/customer/password` | PUT | 404 | `USER_NOT_FOUND` | User không tồn tại |
| `/customer/password` | PUT | 400 | `INVALID_CURRENT_PASSWORD` | Mật khẩu cũ sai |

### Reviews (`/api/customer/reviews/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `/reviews` | POST | 404 | `VOUCHER_NOT_FOUND` | Voucher không tồn tại |
| `/reviews` | POST | 409 | `REVIEW_ALREADY_EXISTS` | Đã đánh giá rồi |
| `/reviews` | POST | 403 | `VOUCHER_NOT_USED` | Chưa sử dụng voucher |

### Admin (`/api/admin/*`)

| Endpoint | Method | HTTP Status | Error Code | Điều kiện |
|----------|--------|-------------|------------|-----------|
| `*` | ANY | 403 | `FORBIDDEN` | User không phải ADMIN role |
| `/admin/partners/:id/status` | PUT | 400 | `INVALID_STATUS` | Status không hợp lệ |
| `/admin/partners/:id/status` | PUT | 400 | `MISSING_REASON` | Thiếu lý do khi reject/suspend |
| `/admin/partners/:id/status` | PUT | 400 | `SELF_ACTION` | Tự thao tác trên chính mình |

---

## Prisma Auto-Mapped Errors

Các lỗi Prisma được error middleware tự động map:

| Prisma Code | HTTP Status | API Error Code | Description |
|-------------|-------------|----------------|-------------|
| `P2002` | 409 | `DUPLICATE_RESOURCE` | Unique constraint violation |
| `P2025` | 404 | `NOT_FOUND` | Record not found |
| `P2003` | 409 | `RESOURCE_IN_USE` | Foreign key constraint violation |

---

## Global Error Handling

| Scenario | HTTP Status | Error Code | Description |
|----------|-------------|------------|-------------|
| Zod validation fails | 400 | `VALIDATION_ERROR` | Input không hợp lệ (kèm `details` array) |
| Unhandled 5xx | 500 | `INTERNAL_ERROR` | Message luôn là "Internal Server Error" ở production |
| Unknown 4xx | Varies | `REQUEST_ERROR` | Fallback cho client errors thiếu code |
| Rate limited | 429 | `RATE_LIMITED` | Quá nhiều request |
| CORS rejected | 403 | `CORS_NOT_ALLOWED` | Origin không được phép |
