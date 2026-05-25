# State Machines

## 1. Why state machines matter
Voucher systems fail when status can change randomly. State machines prevent invalid business transitions.

## 2. Partner state machine

```text
pending -> approved
pending -> rejected
approved -> suspended
suspended -> approved
```

Allowed transitions:

```js
const partnerTransitions = {
  pending: ['approved', 'rejected'],
  approved: ['suspended'],
  suspended: ['approved'],
  rejected: ['pending'],
};
```

## 3. Voucher state machine

```text
draft -> pending_approval -> approved -> on_sale
pending_approval -> rejected
on_sale -> paused
paused -> on_sale
on_sale -> expired
on_sale -> suspended
```

Allowed transitions:

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

## 4. Order state machine

```text
pending_payment -> paid -> completed
pending_payment -> cancelled
paid -> refunded
```

Allowed transitions:

```js
const orderTransitions = {
  pending_payment: ['paid', 'cancelled'],
  paid: ['completed', 'refunded'],
};
```

## 5. Payment state machine

```text
pending -> success
pending -> failed
success -> refunded
```

## 6. Voucher code state machine

```text
issued -> used
issued -> expired
issued -> cancelled
issued -> locked
```

Allowed transitions:

```js
const voucherCodeTransitions = {
  issued: ['used', 'expired', 'cancelled', 'locked'],
};
```

## 7. UI badge mapping

| Status | Suggested badge |
|---|---|
| draft | neutral |
| pending_approval | warning |
| approved | info |
| on_sale | success |
| rejected | error |
| paused | warning |
| expired | neutral |
| suspended | error |
| issued | info |
| used | success |
| cancelled | error |
| locked | error |

## 8. API behavior for invalid transition
Return:

```json
{
  "success": false,
  "message": "Invalid status transition from draft to on_sale",
  "code": "INVALID_STATUS_TRANSITION"
}
```
