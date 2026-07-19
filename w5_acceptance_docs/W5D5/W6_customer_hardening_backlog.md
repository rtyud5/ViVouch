# W6 Customer Hardening Backlog

**Carryover from W5-V5 | Owner: Customer Portal Lead (Vinh)**  
**Date:** 2026-07-19  
**Priority:** P2 = Within W6 | P3 = Nice-to-have / Post-submission

---

## P2 — Should Fix in W6

| # | Item | File | Rationale |
|---|---|---|---|
| W6-CU-01 | Tích hợp cổng thanh toán thật (Mock payment limitation) | `CheckoutPage.jsx` | Hiện đang dùng mock payment. Cần tích hợp VNPay/MoMo hoặc Stripe. |
| W6-CU-02 | Gửi email xác nhận đơn hàng | Backend Service | Order API mới chỉ tạo DB records, chưa có tính năng gửi email xác nhận. |
| W6-CU-03 | Đánh giá / Review tính năng đầy đủ | `OrderSuccessPage.jsx` / `MyVouchersPage.jsx` | Cho phép customer đánh giá (rating, comment) sau khi voucher trạng thái USED. |
| W6-CU-04 | Tối ưu SEO meta tags & SSR | Multiple pages | Cải thiện SEO cho các trang public, đặc biệt là trang Voucher Details. |

---

## P3 — Nice-to-Have / Post-Submission

| # | Item | File | Rationale |
|---|---|---|---|
| W6-CU-05 | Dark Mode Support | `tailwind.config.js` | Tăng trải nghiệm UX cho customer portal. |
| W6-CU-06 | Tính năng Wishlist / Yêu thích | New Page | Cho phép lưu voucher yêu thích (favorites) nhưng không đưa vào giỏ. |
| W6-CU-07 | Voucher Recommendation | `HomePage.jsx` | Đề xuất voucher liên quan dựa trên category. |

---

## Tech Debt Registry (carryover)

| Debt | Location | Source |
|---|---|---|
| Mock Payment | `CheckoutPage.jsx` | W5 Limitation |
| Thiếu loading skeleton cho một số list | `HomePage.jsx`, `OrdersPage.jsx` | Tăng UX perceived performance |
