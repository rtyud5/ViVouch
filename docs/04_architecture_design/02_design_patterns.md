# Design Patterns

| Pattern | Use in ViVouch | Benefit |
|---|---|---|
| Modular monolith | Business modules under `backend/src/modules` | Clear ownership without distributed-system overhead |
| Layered architecture | Routes, controllers, validators, services, Prisma | Keeps HTTP details outside business logic |
| Service layer | Checkout, redeem, review, admin operations | Centralized invariants and reusable tests |
| Repository/ORM boundary | Prisma client | Parameterized queries and relational mapping |
| State machine | Voucher/order/code transitions | Rejects invalid lifecycle changes |
| Unit of work | Prisma `$transaction` | Atomic multi-table changes |
| Pessimistic lock | SQL `FOR UPDATE` | Prevents oversell/double redemption |
| Idempotency | `(userId, idempotencyKey)` | Safe checkout retries |
| Middleware pipeline | Auth, role, validation, rate limit, error | Consistent cross-cutting behavior |
| Adapter | Simulated payment/reset delivery | Clear replacement point for external integrations |
| Query cache | TanStack Query | Loading/error/cache invalidation consistency |

Controllers should remain thin. A controller parses request data, invokes one service operation, and maps its result to the common response envelope. State-changing operations record audit evidence.
