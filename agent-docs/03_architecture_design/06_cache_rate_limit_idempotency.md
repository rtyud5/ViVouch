# Cache, Rate Limit, and Idempotency

## 1. Cache strategy
Use 2 levels:

1. Client-side cache with TanStack Query — must have.
2. Server-side Redis cache — optional.

## 2. What can be cached

| Data | Cache? | Where | TTL |
|---|---:|---|---:|
| Categories | Yes | TanStack/Redis | 10-30 min |
| Public voucher list | Yes | TanStack/Redis optional | 30-60 sec |
| Voucher detail | Yes | TanStack | 30-60 sec |
| Admin dashboard | Yes | TanStack/Redis optional | 30-60 sec |
| Partner report | Yes | TanStack/Redis optional | 30-60 sec |
| Cart | TanStack only or no | Server source DB | short |
| Checkout | No | Never | none |
| Voucher code redeem | No | Never | none |
| Voucher code status | Very short or no | TanStack refetch | short |

## 3. Cache invalidation

| Action | Invalidate |
|---|---|
| Admin approves voucher | voucher list/detail, admin vouchers |
| Partner updates voucher | voucher detail, partner vouchers |
| Checkout success | voucher list/detail, cart, my vouchers, dashboard |
| Redeem success | my vouchers, partner report, dashboard |
| Admin changes category | categories, voucher list |

## 4. Rate limit strategy
Use `express-rate-limit`.

| API | Limit | Reason |
|---|---:|---|
| `POST /api/auth/login` | 5/min/IP | Prevent brute-force |
| `POST /api/auth/register` | 10/10min/IP | Prevent spam |
| `POST /api/auth/forgot-password` | 3/10min/IP/email | Prevent abuse |
| `POST /api/customer/orders/checkout` | 10/min/user | Prevent order spam |
| `GET /api/partner/redeem/check` | 30/min/user | Prevent code enumeration |
| `POST /api/partner/redeem/confirm` | 10/min/user | Prevent redeem spam |
| Public catalog | 100/min/IP | Basic protection |

## 5. Rate limit response

```json
{
  "success": false,
  "message": "Too many requests. Please try again later.",
  "code": "RATE_LIMITED"
}
```

## 6. Idempotency strategy
Use idempotency for risky duplicate operations.

Required for:

- Checkout.
- Redeem confirm.

### Why
Duplicate request may happen when:

- User double-clicks button.
- Network retries.
- Browser resubmits.

### Checkout idempotency
Frontend sends:

```text
Idempotency-Key: checkout-<uuid>
```

Backend stores unique:

```text
user_id + idempotency_key
```

If repeated, return existing order result.

### Simpler implementation
Add fields to `orders`:

```text
idempotency_key
```

Unique constraint:

```text
UNIQUE(user_id, idempotency_key)
```

## 7. Redis usage optional
If using Upstash Redis:

- Rate limit store.
- Cache categories/dashboard.
- Short lock key for checkout/redeem, but DB still validates.

Example lock key:

```text
lock:checkout:voucher:{voucherId}
lock:redeem:code:{code}
```

## 8. Agent rule
Do not cache checkout/redeem decisions. Always read/write database transactionally.
