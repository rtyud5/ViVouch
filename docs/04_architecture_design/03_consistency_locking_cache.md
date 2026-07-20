# Consistency, Locking, and Cache

## Checkout consistency

Checkout runs in one PostgreSQL transaction. It locks relevant voucher rows, rechecks approval, dates and stock, creates order/payment/codes, increments sold quantity, clears the cart and writes audit evidence. Any failure rolls the entire unit back.

An idempotency key is unique per user. Retrying a completed request returns the original order instead of issuing additional codes.

## Redemption consistency

`/redeem/check` is read-only. `/redeem/confirm` starts a transaction, locks the `VoucherCode`, rechecks state/expiry/partner/branch, conditionally updates `ISSUED → USED`, and creates usage/audit records. A concurrent second confirmation cannot pass the conditional update.

## Cancellation consistency

Admin cancellation locks the order and refuses any order containing a used code. Eligible cancellation atomically cancels unused codes, restores sold quantity, marks a paid simulated payment as refunded, changes order status, and records the reason.

## Cache policy

- PostgreSQL is the source of truth for stock, codes, orders, and permissions.
- The frontend query cache is invalidated after mutations; it is never used for authorization or stock decisions.
- No server-side distributed cache is required for the student-scale candidate.
- A future Redis layer may cache public catalog reads, but must not cache redemption or checkout decisions.
