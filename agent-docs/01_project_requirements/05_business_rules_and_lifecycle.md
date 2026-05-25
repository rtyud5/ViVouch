# Business Rules and Lifecycle Design

## 1. Business rule implementation strategy
Each business rule must be enforced in one or more layers:

| Layer | Purpose |
|---|---|
| Frontend validation | Good UX and early error message. |
| Backend validation | Security and business enforcement. |
| Database constraint | Last line of defense. |
| Transaction/lock | Prevent race conditions. |
| Audit log | Traceability. |

## 2. Rule enforcement table

| Code | Rule | Enforcement |
|---|---|---|
| RB-01 | Voucher only sold after admin approval | Voucher must be `on_sale`; admin transition only. |
| RB-02 | Sale price lower than original | Zod validation + DB check if possible. |
| RB-03 | Clear sale/use time | Required fields, date validation. |
| RB-04 | No sale when quantity exhausted or sale period over | Checkout validation inside transaction. |
| RB-05 | Issue code only after payment success | Code generation only after simulated payment success in transaction. |
| RB-06 | Code unique/hard to guess | nanoid + `UNIQUE(code)` index. |
| RB-07 | Used code cannot be reused | Redeem requires `status = issued`; row lock. |
| RB-08 | Expired/cancelled/locked cannot be used | Redeem validation. |
| RB-09 | Partner validates only own scope | Partner ownership + branch checks. |
| RB-10 | User reviews only after purchase/use | Review API checks order/code ownership. |
| RB-11 | Sold quantity cannot exceed issued quantity | Transaction + row lock + quantity constraints. |
| RB-12 | Critical admin operations logged | `audit_logs` service. |
| RB-13 | Cancelled order cannot issue voucher | Checkout/cancel flow state checks. |
| RB-14 | Refund/cancel follows policy | Store policy on voucher; simulate outcome. |
| RB-15 | Check stock at order/payment time | Checkout transaction. |

## 3. Partner lifecycle

```text
pending -> approved
pending -> rejected
approved -> suspended
suspended -> approved
```

Rules:
- Only admin can approve/reject/suspend partner.
- Partner must be `approved` to submit vouchers for sale.
- Suspended partner cannot create or redeem vouchers.

## 4. Voucher lifecycle

```text
draft -> pending_approval -> approved -> on_sale
pending_approval -> rejected
on_sale -> paused -> on_sale
on_sale -> expired
on_sale -> suspended
```

Rules:
- Partner creates voucher as `draft`.
- Partner submits `draft` to `pending_approval`.
- Admin changes `pending_approval` to `approved` or `rejected`.
- System/admin changes `approved` to `on_sale` when sale period is valid.
- Customer can buy only `on_sale` vouchers.
- Partner can edit `draft` and possibly `rejected` vouchers.
- Partner cannot freely edit core commercial terms after approval unless system permits controlled changes.

## 5. Order lifecycle

```text
pending_payment -> paid -> completed
pending_payment -> cancelled
paid -> refunded
```

MVP simplification:
- Checkout can simulate immediate payment success, so order becomes `paid` in the same request.
- `completed` can be used after all voucher codes are used or after order finalization.
- Cancel/refund is admin-simulated.

## 6. Payment lifecycle

```text
pending -> success
pending -> failed
success -> refunded
```

MVP:
- Payment method can be `mock_card`, `mock_bank`, `mock_wallet`, or `cash_simulation`.
- Simulated payment success should be deterministic for demo.

## 7. Voucher code lifecycle

```text
issued -> used
issued -> expired
issued -> cancelled
issued -> locked
```

Rules:
- Code is created only after payment success.
- Code belongs to one customer and one order item.
- Code can be redeemed only once.
- Redeem must lock the code row to prevent race condition.

## 8. Review lifecycle

Simple statuses:

```text
pending -> visible
pending -> hidden
```

MVP simplification:
- Review can be immediately visible if customer has purchased or used the voucher.

## 9. Common invalid transitions
Agents must reject these:

- `draft -> on_sale` without admin approval.
- `rejected -> on_sale` without resubmission/approval.
- `used -> issued`.
- `expired -> used`.
- `cancelled order -> issue voucher code`.
- `customer -> admin route/API`.
- `partner A -> redeem partner B code`.

## 10. State transition helper requirement
Implement status transitions using helper functions or service methods, not scattered updates.

Example:

```js
const voucherTransitions = {
  draft: ['pending_approval'],
  pending_approval: ['approved', 'rejected'],
  approved: ['on_sale'],
  on_sale: ['paused', 'expired', 'suspended'],
  paused: ['on_sale', 'expired'],
  rejected: ['draft'],
};
```

The service must call `canTransition(current, next)` before updating status.
