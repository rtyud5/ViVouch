# W5D3_04: Review Notes — V3, T3, H3

> Review notes cho 3 rubric items liên quan đến error contract standardization.

---

## V3 — Customer UX: Error Handling Quality

### Tiêu chí
Customer phải nhận được thông báo lỗi rõ ràng, nhất quán, và hữu ích ở mọi failure path.

### Trước W5D3
- ❌ Một số error trả `message: err.code` (VD: `message: "EMPTY_CART"`) — người dùng thấy code thô thay vì text human-readable
- ❌ `orders.controller.js` inline catch → response shape không nhất quán (`{ message }` thay vì `{ success, message, code }`)
- ❌ Zod validation errors thiếu `code` field → frontend không phân biệt được validation error vs business error

### Sau W5D3
- ✅ Mọi error response có shape chuẩn: `{ success: false, message, code }`
- ✅ `message` luôn human-readable (tiếng Việt), `code` là stable identifier
- ✅ Zod errors có `code: "VALIDATION_ERROR"` + `details` array cho field-level errors
- ✅ `orders.controller.js` dùng `asyncHandler` + throw `AppError` → consistent error shape

### Evidence
- [x] Test suite: 16 files, 157 tests PASS
- [x] `checkout-api.test.js` verify `code: 'EMPTY_CART'` thay vì `message: 'EMPTY_CART'`
- [x] Error contract matrix: `W5D3_01_api_error_contract_matrix.md`

---

## T3 — Partner/Admin UX: Response Consistency

### Tiêu chí
Partner và Admin endpoints trả response shape nhất quán.

### Trước W5D3
- ❌ `partners.controller.js` một số endpoint thiếu `success` field
- ❌ Response shape hỗn tạp: có nơi `{ data }`, có nơi `{ success, data }`, có nơi `{ success, message, data }`

### Sau W5D3
- ✅ Tất cả `partners.controller.js` endpoints trả `{ success: true, data }` 
- ✅ Response shape convention thống nhất:
  - **Success**: `{ success: true, [message,] data }`
  - **Error**: `{ success: false, message, code [, details] }`
- ✅ Admin GET endpoints giữ `{ success: true, data }` (không cần message cho GET success — đã được approve trong implementation plan)

### Evidence
- [x] `partners.controller.js` diff — thêm `success: true` vào tất cả responses
- [x] Error middleware đảm bảo `success: false` cho mọi error response
- [x] Test suite regression: 157/157 tests pass

---

## H3 — API Contract: Error Code Stability & No Regression

### Tiêu chí
API error contract phải stable — frontend map theo `code`, không parse `message`.

### Trước W5D3
- ❌ `auth.service.js` dùng `new Error()` — thiếu `code` field trong error response
- ❌ `cart.service.js` dùng `new Error()` — thiếu `code` field
- ❌ `errorCodes.js` chỉ có ~10 codes, thiếu ~25 codes đang dùng inline
- ❌ `asyncHandler.js` không set `code` cho ZodError → middleware fallback `REQUEST_ERROR`
- ❌ Frontend phải parse `message` string để xử lý lỗi

### Sau W5D3
- ✅ Toàn bộ `new Error()` trong service layer → `new AppError(msg, status, code)`
- ✅ `errorCodes.js` centralize 40+ codes, phân nhóm rõ ràng
- ✅ `asyncHandler.js` set `code: 'VALIDATION_ERROR'` + `details` cho ZodError
- ✅ `error.middleware.js` luôn trả `{ success, message, code }` — kể cả Prisma errors
- ✅ Production mode: `stack` KHÔNG bao giờ xuất hiện trong response
- ✅ Approved code vocabulary: `W5D3_02_approved_code_vocabulary.md`

### Breaking Changes
> ⚠️ **Một thay đổi có thể ảnh hưởng frontend:**
> - `orders.controller.js` trước đây trả `message: err.code` (VD: `message: "EMPTY_CART"`)
> - Sau fix: `message: "Giỏ hàng trống"`, `code: "EMPTY_CART"`
> - **Impact**: Frontend code nào parse `message` để detect `EMPTY_CART` sẽ cần chuyển sang `code`
> - **Mitigation**: Response vẫn backward-compatible — chỉ *thêm* `code` field, không xóa `message`

### Evidence
- [x] Full error code vocabulary: `W5D3_02_approved_code_vocabulary.md`
- [x] Error contract matrix: `W5D3_01_api_error_contract_matrix.md`
- [x] Test suite: 157/157 pass — no regression
- [x] Production stack leak: verified in `error.middleware.js:58` — `env.NODE_ENV !== "production"` guard

---

## Checklist: Frontend Migration (Recommended next steps)

> Các bước sau đây **khuyến nghị** cho frontend team nhưng KHÔNG nằm trong scope W5D3.

- [ ] Chuyển tất cả `err?.response?.data?.message` checks → `err?.response?.data?.code`
- [ ] Tạo centralized error handler utility dùng `code`-based switching
- [ ] Implement `VALIDATION_ERROR` details rendering (field-level errors)
- [ ] Test checkout flow với `EMPTY_CART`, `VOUCHER_OUT_OF_STOCK` codes
- [ ] Test auth flow với `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED` codes
