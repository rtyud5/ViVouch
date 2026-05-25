# Design Patterns and Coding Rules

## 1. Layered Architecture Pattern

Required flow:

```text
Route -> Middleware -> Controller -> Service -> Prisma -> Database
```

## 2. Service Layer Pattern
All business rules must live in services.

Controllers should:
- Read request data.
- Call service.
- Return response.
- Pass errors to error middleware.

Controllers should not:
- Run long business workflows.
- Directly manage transactions unless the service owns them.
- Contain status transition rules.

## 3. Middleware Pattern
Use middleware for:

- Auth.
- Role check.
- Input validation.
- Error handling.
- Rate limit.

## 4. Repository pattern decision
Do not create a heavy repository layer unless needed. Prisma client can be used inside services for this student project.

Allowed:

```text
Controller -> Service -> Prisma
```

Optional later:

```text
Controller -> Service -> Repository -> Prisma
```

## 5. State Machine Pattern
Use state transition helpers for:

- Partner status.
- Voucher status.
- Order status.
- Payment status.
- Voucher code status.

No random status updates.

## 6. DTO/Schema Pattern
Every API request should have a Zod schema.

Examples:

```text
registerSchema
loginSchema
createVoucherSchema
submitVoucherSchema
checkoutSchema
redeemConfirmSchema
adminRejectVoucherSchema
```

## 7. Policy/Guard Pattern
Business authorization beyond role should be explicit.

Examples:

```js
canPartnerManageVoucher(partnerId, voucherId)
canPartnerRedeemCode(partnerId, voucherCode)
canCustomerViewOrder(userId, orderId)
canCustomerReviewVoucher(userId, voucherId)
```

## 8. Factory/helper pattern
Use helpers for:

- Voucher code generation.
- Order number generation.
- Response formatting.
- Error creation.

## 9. Transaction script pattern
For checkout/redeem, use a clear transaction script in service.

Example:

```text
validate -> transaction -> lock/update -> create records -> audit -> commit
```

## 10. Coding rules

- Do not duplicate status strings throughout code; centralize constants/enums.
- Do not return password hash.
- Do not expose internal stack traces in production.
- Do not update voucher quantity outside checkout transaction.
- Do not redeem code outside redeem transaction.
- Do not use frontend role checks as security boundary.
- Do not physically delete order/payment/voucher_code/audit_log records.
