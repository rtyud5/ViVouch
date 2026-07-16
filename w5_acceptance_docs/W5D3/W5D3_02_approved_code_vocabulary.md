# W5D3_02: Approved Error Code Vocabulary

> **Rule:** Frontend map theo `code`, KHÔNG parse `message`.
> Mọi `AppError` thrown **bắt buộc** dùng code từ file `errorCodes.js`.

---

## Source of Truth

File: `backend/src/constants/errorCodes.js`

---

## Code → User-Friendly Message Mapping

### Authentication & Session (`AUTH_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `UNAUTHORIZED` | 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| `TOKEN_EXPIRED` | 401 | Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại. |
| `INVALID_TOKEN` | 401 | Token không hợp lệ. Vui lòng đăng nhập lại. |
| `INVALID_CREDENTIALS` | 401 | Sai email hoặc mật khẩu. Vui lòng thử lại. |

### Account Status (`ACCOUNT_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `ACCOUNT_LOCKED` | 403 | Tài khoản của bạn đã bị khóa. Vui lòng liên hệ hỗ trợ. |

### Authorization

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `FORBIDDEN` | 403 | Bạn không có quyền thực hiện thao tác này. |

### Validation / Input

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `VALIDATION_ERROR` | 400 | Dữ liệu nhập không hợp lệ. Vui lòng kiểm tra lại. (Xem `details` để biết chi tiết) |

### Voucher Lifecycle (`VOUCHER_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `VOUCHER_NOT_FOUND` | 404 | Voucher không tồn tại hoặc đã bị xóa. |
| `VOUCHER_NOT_ON_SALE` | 400 | Voucher hiện không ở trạng thái đang bán. |
| `VOUCHER_OUT_OF_STOCK` | 400 | Voucher đã hết số lượng. |
| `VOUCHER_EXPIRED` | 400 | Voucher đã hết hạn sử dụng. |
| `VOUCHER_ALREADY_USED` | 400 | Voucher này đã được sử dụng. |
| `VOUCHER_UNAVAILABLE` | 400 | Voucher hiện không khả dụng. |
| `VOUCHER_NOT_YET_ON_SALE` | 400 | Voucher chưa đến thời gian mở bán. |
| `VOUCHER_SALE_EXPIRED` | 400 | Voucher đã hết hạn bán. |
| `INVALID_SALE_PERIOD` | 400 | Thời gian kết thúc bán phải sau thời gian bắt đầu. |
| `INVALID_USE_PERIOD` | 400 | Thời gian sử dụng không hợp lệ. |
| `INVALID_PRICE` | 400 | Giá bán phải nhỏ hơn giá gốc. |
| `INVALID_TOTAL_QTY` | 400 | Số lượng không hợp lệ (không được nhỏ hơn số đã bán). |
| `INVALID_STATUS_TRANSITION` | 400 | Không thể chuyển trạng thái voucher ở bước này. |
| `INVALID_TRANSITION` | 400 | Chuyển trạng thái không hợp lệ. |
| `SALE_PERIOD_EXPIRED` | 400 | Không thể gửi duyệt — thời gian mở bán đã kết thúc. |

### Voucher Code / Redeem

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `VOUCHER_CODE_NOT_FOUND` | 404 | Mã voucher không tồn tại. |
| `VOUCHER_CODE_USED` | 400 | Mã voucher đã được sử dụng. |
| `VOUCHER_CODE_EXPIRED` | 400 | Mã voucher đã hết hạn. |
| `VOUCHER_CODE_CANCELLED` | 400 | Mã voucher đã bị huỷ. |
| `VOUCHER_CODE_LOCKED` | 400 | Mã voucher đang bị tạm khóa. |
| `INVALID_VOUCHER_CODE` | 400 | Mã voucher không hợp lệ. |
| `INVALID_BRANCH_SCOPE` | 403 | Chi nhánh không thuộc phạm vi đổi mã. |
| `INVALID_PARTNER_SCOPE` | 403 | Đối tác không thuộc phạm vi đổi mã. |

### Cart (`CART_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `CART_ITEM_NOT_FOUND` | 404 | Sản phẩm không tồn tại trong giỏ hàng. |

### Checkout / Order

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `CHECKOUT_FAILED` | 400 | Thanh toán thất bại. Vui lòng thử lại. |
| `EMPTY_CART` | 400 | Giỏ hàng trống. Vui lòng thêm sản phẩm trước khi thanh toán. |
| `INVALID_IDEMPOTENCY_KEY` | 400 | Idempotency key không hợp lệ (8-128 ký tự). |
| `ORDER_NOT_FOUND` | 404 | Đơn hàng không tồn tại. |

### Partner (`PARTNER_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `PARTNER_NOT_FOUND` | 404 | Không tìm thấy hồ sơ đối tác. |
| `PARTNER_NOT_ACTIVE` | 403 | Tài khoản đối tác chưa được kích hoạt. |
| `SELF_ACTION` | 400 | Không thể thực hiện thao tác trên chính mình. |
| `INVALID_STATUS` | 400 | Trạng thái không hợp lệ. |
| `MISSING_REASON` | 400 | Vui lòng nhập lý do. |

### Branch (`BRANCH_*`)

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `BRANCH_NOT_FOUND` | 404 | Chi nhánh không tồn tại. |
| `BRANCH_IN_USE` | 409 | Chi nhánh đang được sử dụng, không thể xóa. |

### User

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `USER_NOT_FOUND` | 404 | Không tìm thấy người dùng. |
| `INVALID_CURRENT_PASSWORD` | 400 | Mật khẩu hiện tại không đúng. |

### Review

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `REVIEW_ALREADY_EXISTS` | 409 | Bạn đã đánh giá voucher này rồi. |
| `VOUCHER_NOT_USED` | 403 | Bạn cần sử dụng voucher trước khi đánh giá. |

### Duplicate / Conflict

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `EMAIL_EXISTS` | 409 | Email đã tồn tại trong hệ thống. |
| `PHONE_EXISTS` | 409 | Số điện thoại đã tồn tại trong hệ thống. |
| `DUPLICATE_RESOURCE` | 409 | Dữ liệu đã tồn tại, không thể tạo trùng. |
| `RESOURCE_IN_USE` | 409 | Không thể xóa dữ liệu đang được sử dụng. |

### Generic

| Code | HTTP | Message hiển thị cho user |
|------|------|---------------------------|
| `NOT_FOUND` | 404 | Không tìm thấy dữ liệu. |
| `QUERY_ERROR` | 500 | Đã xảy ra lỗi khi truy vấn. Vui lòng thử lại. |
| `INTERNAL_ERROR` | 500 | Đã xảy ra lỗi hệ thống. Vui lòng thử lại sau. |
| `REQUEST_ERROR` | 4xx | Yêu cầu không hợp lệ. |
| `CORS_NOT_ALLOWED` | 403 | Truy cập bị từ chối (CORS). |
| `RATE_LIMITED` | 429 | Quá nhiều yêu cầu. Vui lòng thử lại sau. |

---

## Frontend Integration Guide

### ❌ WRONG — parsing message
```javascript
if (err.response?.data?.message === 'Email đã tồn tại trong hệ thống') {
  // Fragile: sẽ vỡ nếu backend đổi wording
}
```

### ✅ CORRECT — mapping by code
```javascript
const code = err.response?.data?.code;
switch (code) {
  case 'EMAIL_EXISTS':
    toast.error('Email đã được sử dụng. Hãy thử email khác.');
    break;
  case 'VALIDATION_ERROR':
    const details = err.response?.data?.details;
    // Show field-level errors
    break;
  default:
    toast.error(err.response?.data?.message || 'Đã xảy ra lỗi.');
}
```

### VALIDATION_ERROR details format
```json
{
  "success": false,
  "message": "email: Invalid email format, password: String must contain at least 8 character(s)",
  "code": "VALIDATION_ERROR",
  "details": [
    { "path": ["email"], "message": "Invalid email format" },
    { "path": ["password"], "message": "String must contain at least 8 character(s)" }
  ]
}
```
