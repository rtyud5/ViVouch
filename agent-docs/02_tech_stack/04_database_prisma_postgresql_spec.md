# Database, Prisma, and PostgreSQL Specification

## 1. Why PostgreSQL
PostgreSQL is required because the assignment requires a relational database and the system has many relationships.

## 2. Why Prisma
Prisma provides:

- Schema definition.
- Migrations.
- DB client.
- Relation query.
- Transaction API.
- Seed support.

## 3. Prisma file locations

```text
backend/prisma/schema.prisma
backend/prisma/seed.js
backend/prisma/migrations/
```

## 4. Required models

Minimum models:

```text
User
Partner
Branch
Category
Voucher
VoucherBranch
Cart
CartItem
Order
OrderItem
Payment
VoucherCode
VoucherUsageLog
Review
AuditLog
Banner
CmsPage
```

## 5. Required enums

```prisma
enum UserRole {
  customer
  partner
  admin
}

enum UserStatus {
  active
  locked
  deleted
}

enum PartnerStatus {
  pending
  approved
  rejected
  suspended
}

enum VoucherStatus {
  draft
  pending_approval
  approved
  on_sale
  paused
  expired
  rejected
  suspended
}

enum OrderStatus {
  pending_payment
  paid
  completed
  cancelled
  refunded
}

enum PaymentStatus {
  pending
  success
  failed
  refunded
}

enum VoucherCodeStatus {
  issued
  used
  expired
  cancelled
  locked
}
```

## 6. Important constraints

- `User.email` unique.
- `Order.orderNumber` unique.
- `VoucherCode.code` unique.
- `Partner.userId` unique.
- FK relations for all linked tables.
- Composite unique for `VoucherBranch(voucherId, branchId)`.
- Composite unique for `Order(userId, idempotencyKey)` if idempotency implemented.

## 7. Transaction requirements
Use `$transaction` for:

- Checkout.
- Redeem voucher.
- Admin approval with audit log.
- Refund/cancel with code status changes.

## 8. Row-level lock note
Prisma does not always expose `SELECT ... FOR UPDATE` directly as a first-class abstraction. Use `$queryRaw` inside transaction where needed, or perform atomic conditional updates.

Checkout strategy options:

### Option A — raw row lock

```js
await tx.$queryRaw`SELECT id FROM "Voucher" WHERE id = ${voucherId} FOR UPDATE`;
```

Then re-read voucher and update quantity.

### Option B — atomic conditional update

```js
const updated = await tx.voucher.updateMany({
  where: {
    id: voucherId,
    status: 'on_sale',
    quantityAvailable: { gte: quantity },
  },
  data: {
    quantityAvailable: { decrement: quantity },
    quantitySold: { increment: quantity },
  },
});

if (updated.count !== 1) throw new AppError('VOUCHER_OUT_OF_STOCK');
```

For student project, Option B is simpler and effective.

## 9. Seed script requirements
Seed script must create:

- roles through enum values.
- admin account.
- partner accounts/profiles/branches.
- customer accounts.
- categories.
- vouchers with varied statuses.
- orders/payment/voucher codes.
- audit logs.

## 10. Prisma commands

```bash
npx prisma init
npx prisma migrate dev --name init
npx prisma generate
node prisma/seed.js
npx prisma studio
```
