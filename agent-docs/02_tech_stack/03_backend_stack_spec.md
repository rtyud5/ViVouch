# Backend Stack Specification

## 1. Node.js + Express.js + JavaScript
Use Express to expose REST APIs.

Required backend structure:

```text
backend/src/
  app.js
  server.js
  config/
  middlewares/
  modules/
  utils/
```

## 2. Express middleware stack

Required global middleware:

```js
helmet()
cors()
express.json()
pinoHttp logger
rateLimit for sensitive routes
routes
errorMiddleware
```

## 3. Auth: JWT + bcrypt

### bcrypt
Use bcrypt to hash password at registration/change password.

### JWT
JWT payload should contain minimal data:

```json
{
  "sub": "user_id",
  "role": "customer|partner|admin"
}
```

Access token can be stored in frontend localStorage for student MVP. Document limitation and use HTTPS in deployment.

## 4. Validation: Zod
Use Zod schemas for request body/query/params.

Required validator middleware:

```js
validateBody(schema)
validateQuery(schema)
validateParams(schema)
```

## 5. Service layer
Controllers must not contain complex business logic.

Example:

```js
// controller
async function checkout(req, res, next) {
  const result = await orderService.checkout(req.user.id, req.body, req.headers['idempotency-key']);
  res.status(201).json(success(result));
}
```

Service handles transaction, validation, status updates, audit log.

## 6. Pino logging
Use Pino for technical logs:

- Request method/path/status/time.
- Server errors.
- Database errors.
- Debugging checkout/redeem failures.

Do not use Pino as replacement for audit logs.

## 7. Audit log service
Every critical business action should call:

```js
auditLogService.create({
  actorId,
  actorRole,
  action,
  targetType,
  targetId,
  oldValue,
  newValue,
  ipAddress,
  userAgent,
  tx // optional Prisma transaction client
});
```

Critical actions:

- Admin approves/rejects partner.
- Partner creates/submits voucher.
- Admin approves/rejects voucher.
- Customer checkout.
- System issues voucher code.
- Partner redeems voucher.
- Admin locks user.
- Admin refunds order.

## 8. nanoid voucher code
Voucher code generation helper:

```js
import { customAlphabet } from 'nanoid';
const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
const nanoid = customAlphabet(alphabet, 8);
export function generateVoucherCode() {
  return `VC-${new Date().getFullYear()}-${nanoid()}`;
}
```

Always rely on DB unique constraint and retry if collision occurs.

## 9. Error handling
Use centralized error middleware and custom AppError.

Error response shape:

```json
{
  "success": false,
  "message": "Voucher has already been used",
  "code": "VOUCHER_ALREADY_USED"
}
```

## 10. Required backend modules

```text
auth
users
partners
branches
vouchers
cart
orders
payments
voucherCodes
reviews
admin
reports
auditLogs
cms
```
