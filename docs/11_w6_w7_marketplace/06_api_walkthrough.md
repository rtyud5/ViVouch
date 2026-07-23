# API Walkthrough

## Identity

```text
POST /api/auth/register
POST /api/auth/partner-register
POST /api/auth/verify-email
POST /api/auth/resend-verification
POST /api/auth/forgot-password
POST /api/auth/reset-password
POST /api/auth/staff/setup
POST /api/auth/staff/resend-setup
```

## Partner Owner and Staff

```text
GET/PATCH /api/partner/profile
GET/POST/PUT/DELETE /api/partner/branches
GET/POST/PATCH /api/partner/staff
GET /api/partner/staff/me/redeem-history
POST /api/partner/redeem/check
POST /api/partner/redeem/confirm
```

## Checkout and payments

```text
POST /api/customer/orders/checkout
POST /api/customer/orders/cart/checkout
GET  /api/payments/:orderId/status
POST /api/payments/payos/webhook
```

Checkout accepts `paymentMethod` as `VIVOUCH_WALLET` or `PAYOS`. Send a stable `Idempotency-Key` header for retries.

## Refund, support, and notifications

```text
GET/POST /api/customer/refunds
GET/POST /api/customer/tickets
GET/PATCH /api/notifications
GET/POST /api/admin/refunds/...
GET/POST /api/admin/tickets/...
```

Admin wallet adjustment:

```text
POST /api/admin/users/:id/wallet-adjust
```

All protected responses follow the existing `{ success, message?, data? }` envelope. Unexpected errors include a safe `requestId` that is also returned in the `x-request-id` response header.
