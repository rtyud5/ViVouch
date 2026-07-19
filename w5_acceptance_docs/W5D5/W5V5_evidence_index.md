# W5-V5: Customer Evidence Index

**Date:** 2026-07-19  
**Operator:** Customer Portal Lead (Vinh)  

---

## 1. Core Flows Evidence

| Flow | Screenshot/Video | API Endpoint | Test Reference |
|---|---|---|---|
| Browse Voucher | `customer_browse.png` | `GET /api/vouchers` | `GET /api/vouchers` success test |
| Detail & Cart | `customer_detail.png` | `GET /api/vouchers/:id` | `GET /api/vouchers/:id` test |
| Checkout & Order | `customer_checkout.png` | `POST /api/orders` | Checkout integration test |
| Order Success | `customer_success.png` | `GET /api/orders/:id` | Checkout integration test |
| My Vouchers | `customer_my_vouchers.png` | `GET /api/customer/vouchers` | Customer vouchers list test |

## 2. Negative Paths

| Negative Case | Expected Error | Screenshot/Video |
|---|---|---|
| Out of stock | 400 Bad Request, UI shows "Hết hàng" | `customer_out_of_stock.png` |
| Invalid quantity | UI prevents quantity > stock | `customer_qty_limit.png` |
| Unauthorized | 401 Unauthorized, redirect to `/login` | `customer_unauth.png` |

## 3. Storage Location

All images and videos are stored in `drive/vivouch/w5_acceptance_docs/W5D5/media/customer_*.png`

*Note: The actual screenshot files will be uploaded during the manual rehearsal phase prior to demo.*
