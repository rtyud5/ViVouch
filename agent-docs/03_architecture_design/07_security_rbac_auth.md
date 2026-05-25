# Security, Auth, and RBAC Design

## 1. Security goals

- Protect passwords.
- Protect admin/partner APIs.
- Prevent unauthorized voucher code access.
- Prevent partner redeeming other partner codes.
- Prevent premature voucher code exposure.
- Validate all input.
- Avoid leaking server internals.

## 2. Password security
Use bcrypt:

```js
const hash = await bcrypt.hash(password, saltRounds);
const ok = await bcrypt.compare(password, user.passwordHash);
```

Never return `passwordHash` to frontend.

## 3. JWT design
Access token payload:

```json
{
  "sub": "user_id",
  "role": "customer"
}
```

Backend should still check user status in DB for sensitive operations.

## 4. RBAC middleware

```js
requireAuth
requireRole('admin')
requireRole('partner')
requireRole('customer')
```

## 5. Ownership checks

### Customer
Can access only own:

- Profile.
- Cart.
- Orders.
- Voucher codes.
- Reviews.

### Partner
Can access only:

- Own profile.
- Own branches.
- Own vouchers.
- Voucher codes belonging to own voucher campaigns/branches.

### Admin
Can access platform-wide data.

## 6. CORS
Allow only frontend origin in production:

```js
cors({ origin: process.env.CLIENT_URL })
```

## 7. Helmet
Use Helmet for standard security headers.

## 8. Input validation
All request body/query/params should be validated with Zod.

## 9. Voucher code visibility
Voucher code can be shown only if:

- User owns the order/code.
- Order payment is success.
- Code is issued.

Do not show voucher code in public catalog or unpaid order.

## 10. Error safety
In production:

- Do not expose stack trace.
- Return safe error messages.
- Log full error internally with Pino.

## 11. Token storage note
For student MVP, localStorage is acceptable but document limitation. More secure production option is httpOnly cookie with CSRF handling.

## 12. Security test cases

- Wrong password fails.
- Customer cannot call admin endpoint.
- Partner cannot call admin endpoint.
- Locked user cannot act.
- Suspended partner cannot create/redeem.
- Partner cannot redeem other partner code.
- Voucher code hidden before payment success.
