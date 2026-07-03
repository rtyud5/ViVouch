# W4 API Contract — Redeem & Reviews

## POST /api/partner/redeem
Request body: { "code": "VC-2026-XXXXXXXXXX" }
Auth: PARTNER

Success 200:
{ "success": true, "message": "...", "data": { "voucherTitle", "customerName", "redeemedAt" } }

Errors:
- 404: code không tồn tại
- 400: USED / EXPIRED
- 403: sai partner

---

## GET /api/vouchers/:id/reviews?page=1&limit=10
Public.
{ "success": true, "data": { "reviews": [...], "avgRating": 4.2, "totalCount": 15, "pagination": {...} } }

## POST /api/vouchers/:id/reviews
Auth: CUSTOMER. Body: { "rating": 1-5, "comment": "..." (optional) }
Guard: user phải có VoucherCode status=USED của voucher đó.

Errors:
- 403: chưa dùng voucher
- 409: đã review rồi
- 400: rating ngoài 1-5
