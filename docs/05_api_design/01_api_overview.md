# REST API Overview

Base path: `/api`. Success responses use `{ success, message, data }`; paginated resources include a pagination object. Errors use `{ success: false, code, message }`.

| Group | Representative routes | Authorization |
|---|---|---|
| Auth | `POST /auth/register`, `/login`, `/refresh`, `/logout`, `/forgot-password`, `/reset-password` | Public or authenticated as documented |
| Public catalog | `GET /categories`, `/vouchers`, `/vouchers/:id`, reviews | Public |
| Public content | `GET /content/banners`, `/content/pages/:slug` | Public |
| Customer | `/customer/cart/*`, `/customer/orders/*`, review create/eligibility | CUSTOMER |
| Partner | `/partner/profile`, `/branches`, `/vouchers`, `/redeem/check`, `/redeem/confirm`, `/reports` | PARTNER |
| Admin | `/admin/dashboard`, `/users`, `/partners`, `/vouchers`, `/orders`, `/content`, `/audit-logs` | ADMIN |

## Contract rules

- Input is validated before service execution.
- Authentication failure is `401`; authorization/ownership failure is `403`.
- Missing resources are `404`; state/uniqueness conflicts are `409` where appropriate.
- Rate limiting is `429 RATE_LIMITED`.
- `Idempotency-Key` is required for resilient checkout clients.
- Redeem check is non-mutating; confirm is the only consume operation.
- Page/limit inputs are bounded to protect list endpoints.

Interactive documentation is available at `/api-docs` when the backend is running.
