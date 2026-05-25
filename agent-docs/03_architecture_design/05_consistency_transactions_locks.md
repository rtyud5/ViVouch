# Consistency, Transactions, and Locks

## 1. Consistency classification

| Flow | Consistency | Why |
|---|---|---|
| Catalog list | Relaxed | Small delay acceptable |
| Dashboard | Relaxed | Metrics can be delayed seconds |
| Checkout | Strong | Money/order/voucher quantity/code |
| Voucher code issue | Strong | Must match paid order |
| Redeem | Strong | Code must not be used twice |
| Audit logs | Strong for critical actions | Traceability |

## 2. Checkout transaction

Required atomic steps:

```text
1. Validate user is customer.
2. Validate cart/items.
3. Begin transaction.
4. For each voucher, ensure status = on_sale.
5. Ensure sale period is active.
6. Ensure quantity is available.
7. Decrease quantity_available and increase quantity_sold atomically.
8. Create order.
9. Create order_items.
10. Create simulated payment with status success.
11. Generate voucher_codes for each quantity purchased.
12. Clear cart or mark cart checked out.
13. Create audit logs.
14. Commit.
```

Rollback on any failure.

## 3. Recommended atomic stock update
For simplicity with Prisma:

```js
const updated = await tx.voucher.updateMany({
  where: {
    id: voucherId,
    status: 'on_sale',
    quantityAvailable: { gte: quantity },
    saleStartAt: { lte: now },
    saleEndAt: { gte: now },
  },
  data: {
    quantityAvailable: { decrement: quantity },
    quantitySold: { increment: quantity },
  },
});

if (updated.count !== 1) {
  throw new AppError('Voucher is out of stock or not available', 'VOUCHER_UNAVAILABLE', 400);
}
```

## 4. Voucher code issue
Codes are generated inside checkout transaction after payment success.

Rules:

- Generate one code per purchased unit unless design says otherwise.
- Use nanoid.
- Insert with unique code.
- Retry on unique collision.
- Set status `issued`.
- Set expiresAt from voucher `validTo`.

## 5. Redeem transaction

Required atomic steps:

```text
1. Validate partner is approved.
2. Begin transaction.
3. Find voucher code by code.
4. Lock or conditionally update code where status = issued.
5. Check not expired.
6. Check voucher belongs to partner.
7. Check branch belongs to partner and is in voucher branches.
8. Update voucher_code status = used, used_at = now.
9. Create voucher_usage_log.
10. Create audit_log.
11. Commit.
```

## 6. Conditional update pattern for redeem

```js
const updated = await tx.voucherCode.updateMany({
  where: {
    id: voucherCode.id,
    status: 'issued',
    expiresAt: { gte: now },
  },
  data: {
    status: 'used',
    usedAt: now,
  },
});

if (updated.count !== 1) {
  throw new AppError('Voucher code cannot be redeemed', 'VOUCHER_CODE_NOT_REDEEMABLE', 400);
}
```

## 7. Row-level lock option
If using raw SQL:

```js
await tx.$queryRaw`SELECT id FROM "VoucherCode" WHERE code = ${code} FOR UPDATE`;
```

Then validate/update.

## 8. Transaction anti-patterns
Do not:

- Create order outside transaction then code inside later.
- Generate code before payment success.
- Decrease quantity after transaction commit.
- Create audit log after transaction if it must prove the state change.
- Redeem by first reading status and later updating without condition/lock.

## 9. Redis lock note
Redis lock can be added later, but PostgreSQL must remain source of truth. Never rely only on Redis for voucher quantity correctness.
