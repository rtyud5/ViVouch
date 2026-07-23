# Permissions and State Rules

## Role matrix

| Capability | Customer | Partner Owner | Branch Staff | Admin |
|---|---:|---:|---:|---:|
| Public partner application | Yes | Yes | No | No |
| Manage partner profile | No | Yes | No | Review/status |
| Manage branches | No | Yes | View assigned | Yes |
| Create/submit vouchers | No | Yes | No | Approve/reject |
| Manage Staff | No | Yes | No | No |
| Redeem voucher | No | Yes | Assigned branch only | No |
| View partner-wide report | No | Yes | No | Dashboard |
| Request refund/ticket | Own orders | No | No | Resolve |
| Adjust demo wallet | No | No | No | Yes |

Frontend route guards improve UX; backend middleware and service scope checks are authoritative.

## Identity states

```text
PENDING_VERIFICATION -> ACTIVE -> LOCKED
```

Partner approval is independent from email verification:

```text
Partner: PENDING -> APPROVED | REJECTED
APPROVED <-> SUSPENDED
```

## Partner membership states

```text
Owner registration: INVITED -> ACTIVE after email verification
Staff invitation: INVITED -> ACTIVE after setup OTP
ACTIVE <-> INACTIVE by Owner
```

A Staff membership must have a branch. Staff redeem is rejected when the requested branch is not the assigned active branch.

## Payment/order states

```text
Wallet: PENDING_PAYMENT/PENDING -> COMPLETED/PAID
payOS: PENDING_PAYMENT/PENDING -> COMPLETED/PAID
Pending payOS timeout -> CANCELLED/CANCELLED
Refund request -> REFUND_PENDING
Wallet approval -> REFUNDED/REFUNDED
payOS approval -> MANUAL_REFUND_REQUIRED -> REFUNDED/REFUNDED
```

## Invariants

- `soldQty <= totalQty` under concurrent checkout.
- Same idempotency key + same payload replays the same order.
- Same idempotency key + changed payload returns conflict.
- A payment webhook event is persisted once.
- A paid order issues the expected number of codes once.
- A voucher code can produce at most one successful usage log.
- A refunded or refund-pending code cannot be redeemed.
