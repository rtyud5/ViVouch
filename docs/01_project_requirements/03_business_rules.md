# Business Rules

| Rule | Enforcement |
|---|---|
| Voucher is sold only while `ON_SALE`, inside sale dates, with approved partner and stock | Catalog query and checkout transaction |
| `salePrice < originalPrice` | Zod validation plus update-time comparison |
| Sale/use dates are ordered consistently | Validator and service guard |
| Sold quantity never exceeds total quantity | PostgreSQL transaction, row lock, conditional update |
| Payment succeeds before code issue | Checkout transaction order |
| Voucher codes are unique and difficult to guess | `nanoid` plus unique database constraint |
| Used/expired/cancelled/locked code cannot be redeemed | Redeem state guard |
| Partner can redeem only own voucher at an active assigned branch | Partner, voucher, branch-scope checks |
| Check never consumes; confirm consumes exactly once | Separate `/check` and `/confirm` endpoints; confirm row lock |
| Review requires a `USED` code owned by the reviewer | Review eligibility and create transaction |
| One user reviews one voucher once | Compound unique constraint |
| Cancellation cannot refund a used voucher | Admin cancellation guard |
| Valid cancellation cancels codes, refunds simulated payment, restores stock | Single admin transaction |
| Critical state changes create audit records | Audit service and request context |

## Lifecycle summaries

```text
Voucher: DRAFT → PENDING_APPROVAL → APPROVED → ON_SALE → PAUSED/EXPIRED/SUSPENDED
Order: PENDING_PAYMENT → COMPLETED → CANCELLED
Payment: PENDING → PAID → REFUNDED | FAILED
VoucherCode: ISSUED → USED | EXPIRED | CANCELLED | LOCKED
Partner: PENDING → APPROVED ↔ SUSPENDED; PENDING → REJECTED
```

Invalid transitions return stable 4xx error codes and do not partially update related data.
