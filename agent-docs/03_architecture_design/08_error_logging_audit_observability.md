# Error Handling, Logging, Audit, and Observability

## 1. Response standard

### Success

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error

```json
{
  "success": false,
  "message": "Voucher code has already been used",
  "code": "VOUCHER_ALREADY_USED"
}
```

## 2. AppError class

```js
class AppError extends Error {
  constructor(message, code = 'INTERNAL_ERROR', statusCode = 500, details = null) {
    super(message);
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
```

## 3. Common error codes

```text
UNAUTHORIZED
FORBIDDEN
VALIDATION_ERROR
NOT_FOUND
INVALID_STATUS_TRANSITION
VOUCHER_NOT_FOUND
VOUCHER_NOT_ON_SALE
VOUCHER_OUT_OF_STOCK
VOUCHER_EXPIRED
VOUCHER_ALREADY_USED
VOUCHER_CODE_NOT_FOUND
VOUCHER_CODE_NOT_REDEEMABLE
INVALID_PARTNER_SCOPE
ORDER_NOT_FOUND
PAYMENT_FAILED
RATE_LIMITED
```

## 4. Technical logging with Pino
Log:

- Request method/path/status/duration.
- Errors.
- Startup info.
- DB connection failures.

Do not log:

- Passwords.
- Full JWT tokens.
- Sensitive personal data unnecessarily.

## 5. Audit logging
Audit logs are business records, not debug logs.

Required fields:

```text
actor_id
actor_role
action
target_type
target_id
old_value_json
new_value_json
ip_address
user_agent
created_at
```

## 6. Required audit actions

```text
ADMIN_APPROVE_PARTNER
ADMIN_REJECT_PARTNER
ADMIN_SUSPEND_PARTNER
PARTNER_CREATE_VOUCHER
PARTNER_SUBMIT_VOUCHER
ADMIN_APPROVE_VOUCHER
ADMIN_REJECT_VOUCHER
ADMIN_PAUSE_VOUCHER
CUSTOMER_CHECKOUT
SYSTEM_ISSUE_VOUCHER_CODE
PARTNER_CHECK_VOUCHER_CODE
PARTNER_REDEEM_VOUCHER
ADMIN_LOCK_USER
ADMIN_UNLOCK_USER
ADMIN_CANCEL_ORDER
ADMIN_REFUND_ORDER
```

## 7. Audit log transaction rule
For state-changing operations, create audit log within the same transaction whenever possible.

Example redeem:

```text
update voucher code -> create usage log -> create audit log -> commit
```

## 8. Admin audit page filters
Admin should filter audit logs by:

- Actor.
- Action.
- Target type.
- Date range.

## 9. Observability for demo
Minimum:

- `/health` endpoint.
- Pino logs in console/Render logs.
- Admin audit logs page.
- Swagger API docs.
