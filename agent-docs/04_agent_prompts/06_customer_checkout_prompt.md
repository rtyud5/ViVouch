# Prompt — Customer Catalog, Cart, Checkout

Implement customer e-commerce flow.

Task:
1. Public voucher catalog with search/filter/pagination.
2. Voucher detail page.
3. Customer cart APIs/UI.
4. Checkout API with PostgreSQL transaction.
5. Simulated payment success.
6. Issue voucher codes after payment success.
7. My vouchers page with qrcode.react.

Rules:
- Customer can buy only on_sale vouchers.
- Must check sale period and quantity.
- Use transaction and atomic stock update.
- Voucher code created only after payment success.
- Use nanoid and unique DB index.
- Support idempotency key for checkout if possible.

Acceptance:
- Checkout creates order/payment/order_items/voucher_codes.
- Quantity decreases correctly.
- Out-of-stock fails.
- My vouchers shows code + QR.
