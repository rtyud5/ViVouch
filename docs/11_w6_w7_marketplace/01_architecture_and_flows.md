# Architecture and Core Flows

## Components

```text
React portals
  -> Express routes/controllers
    -> domain services
      -> Prisma/PostgreSQL
      -> SMTP adapter/outbox
      -> payOS hosted checkout/webhook
```

Network calls are not made inside checkout database transactions. The payOS flow reserves inventory and creates a pending order first, creates the hosted payment link outside the transaction, then stores the link. If link creation fails, a compensating transaction cancels the order and restores inventory.

## Customer registration

```text
POST /auth/register
  -> CUSTOMER + demo wallet + PENDING_VERIFICATION
  -> hashed six-digit OTP
  -> SMTP email
POST /auth/verify-email
  -> consume OTP once
  -> ACTIVE + emailVerifiedAt
```

## Partner application and staff

```text
POST /auth/partner-register
  -> PARTNER user + Partner(PENDING) + PartnerMember(OWNER)
  -> email verification
Admin approves Partner
Owner creates Staff assigned to one active Branch
Staff receives setup OTP and chooses a password
```

## Wallet checkout

```text
Lock User -> lock Vouchers in deterministic order -> reserve stock
-> create Order/Payment -> lock Wallet -> debit Wallet
-> mark PAID/COMPLETED -> issue codes once -> audit/notifications
```

## payOS checkout

```text
Reserve stock and create PENDING order/payment
-> create payOS hosted payment link
-> redirect Customer
-> verify signed webhook
-> lock Order -> lock Payment
-> reject amount mismatch / duplicate event
-> PAID + COMPLETED + issue codes once
```

The browser return URL is only presentation. It does not mark an order as paid.

## Refund

A Customer may request a full-order refund only when the order is paid, every issued code is unused, every voucher allows refund, and the configured refund window is still open. Codes move to `REFUND_PENDING` so Staff cannot redeem them. Wallet refunds are automatic after Admin approval; payOS refunds are recorded as manual completion with a provider reference.
