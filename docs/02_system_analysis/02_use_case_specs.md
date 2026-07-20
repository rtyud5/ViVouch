# Use-case Specifications

## UC-01 — Checkout and code issue

- Actor: Customer.
- Preconditions: authenticated active customer; non-empty cart; each voucher is on sale and in stock.
- Main flow: submit recipient/payment data and idempotency key → lock voucher rows → revalidate status/date/stock → create completed order and paid simulated payment → increment sold quantities → issue unique codes → clear cart → audit.
- Alternatives: invalid input `400`; unavailable voucher `409`; repeated idempotency key returns prior result without duplicate order.
- Postcondition: order/payment/code state is committed atomically.

## UC-02 — Voucher approval

- Actors: Partner, Admin.
- Preconditions: approved partner owns a draft/rejected campaign and has an active branch.
- Main flow: partner completes data → submits campaign → admin reviews → approve publishes when sale window is active, otherwise preserves approved state → audit records decision.
- Alternatives: admin rejects with mandatory reason; stale concurrent transition returns `INVALID_TRANSITION`.

## UC-03 — Two-step redemption

- Actor: Partner.
- Preconditions: approved partner, active branch assigned to the voucher, issued unexpired code.
- Main flow: staff enters code/branch → `POST /redeem/check` returns customer/voucher/branch without mutation → staff verifies customer → explicit `POST /redeem/confirm` locks code row → status becomes `USED` → usage/audit logs are written.
- Alternatives: not found `404`; wrong partner/branch `403`; used/expired/cancelled/locked `400`; concurrent second confirmation fails.

## UC-04 — Review

- Actor: Customer.
- Preconditions: customer owns a `USED` code for the voucher and has not reviewed it.
- Main flow: UI reads eligibility → customer submits rating/comment → service rechecks eligibility in transaction → review and audit are created.
- Alternatives: not used `403`; duplicate `409`; invalid rating/comment `400`.

## UC-05 — Admin cancellation/refund simulation

- Actor: Admin.
- Preconditions: order exists and contains no used code.
- Main flow: lock order → cancel issued/locked codes → restore voucher sold quantities → mark paid payment `REFUNDED` → mark order `CANCELLED` → audit reason.
- Alternative: any used code blocks cancellation with `409`.
