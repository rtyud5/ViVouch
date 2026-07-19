# W5-V5: Customer Portal Demo Script

**Date:** 2026-07-19  
**SHA (baseline):** 0bfef02 (main, post-pull)  
**Operator:** Customer Portal Lead (Vinh)  
**Environment:** Local dev — backend :5000, frontend :5173, PostgreSQL Docker  

---

## Pre-Demo Checklist

| Check | Command / Action | Expected |
|---|---|---|
| Fixture state | Dùng seed data chuẩn (seed customer) | Clean state, no leftover carts |
| Backend up | `npm run dev` in `backend/` | Listening on :5000 |
| Frontend up | `npm run dev` in `frontend/` | Listening on :5173 |
| No console errors | Open browser DevTools | 0 errors on load |

---

## Scene A — Customer: Browse & Search Voucher

### A1. Xem trang chủ (Home)
- **URL:** `http://localhost:5173/`
- **Expected:** Hiển thị danh sách voucher nổi bật, categories.
- **Evidence:** Voucher fetch từ `GET /api/vouchers`.

### A2. Tìm kiếm và Lọc (Filter)
- **Action:** Nhập từ khóa tìm kiếm, lọc theo giá hoặc category.
- **Expected:** Danh sách voucher thay đổi tương ứng.

### A3. Xem chi tiết Voucher
- **Action:** Click vào 1 voucher.
- **URL:** `/voucher/:id`
- **Expected:** Hiển thị đầy đủ thông tin: title, originalPrice, salePrice, description, partner, conditions. Nút "Thêm vào giỏ" hiện enabled (nếu còn stock).

---

## Scene B — Customer: Cart & Checkout

### B1. Thêm vào giỏ hàng (Cart)
- **Action:** Chọn số lượng và click "Thêm vào giỏ".
- **URL:** Modal hoặc popup.
- **Expected:** Toast thành công, số lượng trên icon cart tăng lên.

### B2. Xem giỏ hàng
- **URL:** `/cart`
- **Expected:** Danh sách item đã chọn, tổng tiền tính đúng (salePrice * qty). Nút "Tiến hành thanh toán".

### B3. Thanh toán (Checkout)
- **URL:** `/checkout`
- **Action:** Chọn phương thức thanh toán (Mock payment do W5 limitation), tùy chọn tặng quà (Gift recipient). Click "Thanh toán".
- **API:** `POST /api/orders`
- **Expected:** Chuyển sang trang Order Success.

### B4. Đặt hàng thành công
- **URL:** `/customer/order-success`
- **Expected:** Hiển thị mã đơn hàng, trạng thái thanh toán, tổng tiền. Nút "Xem voucher của tôi".

---

## Scene C — Customer: Quản lý Vouchers & Đơn hàng

### C1. Vouchers của tôi
- **URL:** `/customer/my-vouchers`
- **Expected:** Liệt kê các mã voucher code đã mua (status = ISSUED).

### C2. Lịch sử đơn hàng
- **URL:** `/orders`
- **Expected:** Danh sách đơn hàng đã đặt, click vào xem chi tiết item.

### C3. Xem thông tin tài khoản
- **URL:** `/profile`
- **Expected:** Hiển thị thông tin customer, có thể edit profile.

---

## Fallback Fixtures

Nếu không có dữ liệu sẵn:
- Logout và dùng seed account customer chuẩn.

> **Rủi ro:** Demo phụ thuộc cache cũ.
> **Mitigation:** Đăng xuất và đăng nhập lại bằng customer seed account sạch trước khi demo.
