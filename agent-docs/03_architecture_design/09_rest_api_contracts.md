# REST API Contracts

## 1. API principles

- Use JSON.
- Use RESTful resource naming.
- Use plural nouns.
- Use role-based route grouping.
- Return consistent response shape.
- Use pagination for lists.
- Document with Swagger/OpenAPI.

## 2. Public APIs

```text
GET /api/vouchers
GET /api/vouchers/:id
GET /api/categories
```

Voucher query params:

```text
page
limit
keyword
categoryId
partnerId
city
minPrice
maxPrice
minDiscount
status
sort
```

## 3. Auth APIs

```text
POST /api/auth/register
POST /api/auth/login
POST /api/auth/logout
GET  /api/auth/me
POST /api/auth/change-password
POST /api/auth/forgot-password
```

## 4. Customer APIs

```text
GET    /api/customer/cart
POST   /api/customer/cart/items
PATCH  /api/customer/cart/items/:id
DELETE /api/customer/cart/items/:id
POST   /api/customer/orders/checkout
GET    /api/customer/orders
GET    /api/customer/orders/:id
GET    /api/customer/voucher-codes
POST   /api/customer/reviews
```

## 5. Partner APIs

```text
GET   /api/partner/profile
PATCH /api/partner/profile
GET   /api/partner/branches
POST  /api/partner/branches
PATCH /api/partner/branches/:id
GET   /api/partner/vouchers
POST  /api/partner/vouchers
GET   /api/partner/vouchers/:id
PATCH /api/partner/vouchers/:id
POST  /api/partner/vouchers/:id/submit
GET   /api/partner/redeem/check?code=
POST  /api/partner/redeem/confirm
GET   /api/partner/reports
```

## 6. Admin APIs

```text
GET   /api/admin/dashboard
GET   /api/admin/users
PATCH /api/admin/users/:id/lock
PATCH /api/admin/users/:id/unlock
GET   /api/admin/partners
PATCH /api/admin/partners/:id/approve
PATCH /api/admin/partners/:id/reject
PATCH /api/admin/partners/:id/suspend
GET   /api/admin/vouchers
PATCH /api/admin/vouchers/:id/approve
PATCH /api/admin/vouchers/:id/reject
PATCH /api/admin/vouchers/:id/pause
GET   /api/admin/orders
PATCH /api/admin/orders/:id/cancel
PATCH /api/admin/orders/:id/refund
GET   /api/admin/categories
POST  /api/admin/categories
PATCH /api/admin/categories/:id
GET   /api/admin/audit-logs
```

## 7. Pagination response

```json
{
  "success": true,
  "message": "Fetched successfully",
  "data": [],
  "pagination": {
    "page": 1,
    "limit": 12,
    "total": 100,
    "totalPages": 9
  }
}
```

## 8. Checkout request example

```json
{
  "buyerName": "Nguyen Van A",
  "buyerEmail": "a@example.com",
  "buyerPhone": "0900000000",
  "paymentMethod": "mock_wallet"
}
```

Header:

```text
Idempotency-Key: checkout-random-uuid
```

## 9. Redeem confirm request example

```json
{
  "code": "VC-2026-K8P2Q9LX",
  "branchId": "branch_id",
  "note": "Customer used at counter"
}
```

## 10. Swagger requirement
Every route must include:

- Tags.
- Security requirement if protected.
- Request schema.
- Response schema.
- Error examples.
