# W4 API Contract — Redeem & Reviews

## POST /api/partner/redeem
Request body: { "code": "VC-2026-XXXXXXXXXX", "branchId": "<branch-id>" }
Auth: PARTNER

Success 200:
{ "success": true, "message": "...", "data": { "voucherTitle", "customerName", "branchId", "branchName", "redeemedAt" } }

Errors:
- 404: code không tồn tại
- 400: USED / EXPIRED
- 403: sai partner
- 403 `INVALID_BRANCH_SCOPE`: chi nhánh không hoạt động hoặc voucher không áp dụng tại chi nhánh

---

## GET /api/vouchers/:id/reviews?page=1&limit=10
Public.
{ "success": true, "data": { "reviews": [...], "avgRating": 4.2, "totalCount": 15, "pagination": {...} } }

## POST /api/vouchers/:id/reviews
Auth: CUSTOMER. Body: { "rating": 1-5, "comment": "..." (optional) }
Guard: user phải có VoucherCode status=USED của voucher đó.

Success 201:
{ "success": true, "message": "Đánh giá thành công", "data": { /* review object */ } }

Errors:
- 403: chưa dùng voucher
- 409: đã review rồi
- 400: rating ngoài 1-5
