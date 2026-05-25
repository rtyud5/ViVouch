# Database Design and Prisma Guide

## 1. Schema design goals

- Satisfy relational database constraint.
- Represent voucher lifecycle correctly.
- Support e-commerce checkout.
- Support partner redemption.
- Support admin reports and audit logs.

## 2. Naming conventions

- Prisma models: PascalCase, singular: `User`, `VoucherCode`.
- Database tables: Prisma default or mapped snake_case. Choose one and stay consistent.
- JS fields: camelCase.

## 3. Critical model separation

Do not combine these:

| Entity | Why separate |
|---|---|
| Voucher | Product/campaign sold to many customers |
| VoucherCode | Individual issued code after a specific order |
| VoucherUsageLog | Proof of code redemption |
| AuditLog | Proof of system action |

## 4. Quantity design

Voucher should have:

```text
quantityTotal
quantitySold
quantityAvailable
```

Update `quantitySold` and `quantityAvailable` only inside checkout transaction.

## 5. Price design

Use integer amount in VND or decimal carefully.

Recommended for simplicity:

```text
originalPrice Int
salePrice Int
```

Store VND amount as integer.

## 6. Date design

Voucher has 2 time periods:

```text
saleStartAt / saleEndAt
validFrom / validTo
```

Meaning:
- Sale period: when customer can buy.
- Valid period: when customer can use.

## 7. Voucher code expiry
`VoucherCode.expiresAt` should usually copy `Voucher.validTo` at issuance time.

## 8. Audit JSON values
Use JSON fields for old/new values if supported:

```prisma
oldValue Json?
newValue Json?
```

## 9. Migration process

```bash
npx prisma migrate dev --name init
npx prisma generate
npm run seed
```

## 10. Seed process
Seed must be idempotent enough for repeated development. Either clear demo tables first or upsert fixed records.

## 11. Prisma implementation priorities

1. Enums.
2. Core models.
3. Relationships.
4. Unique constraints.
5. Indexes.
6. Seed data.
7. Queries and transactions.
