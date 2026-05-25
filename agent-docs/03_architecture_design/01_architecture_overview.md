# Architecture Overview

## 1. Architecture choice
Use **Modular Monolith**.

Why:

- Suitable for student project.
- One backend application is easier to deploy and debug.
- Still allows clean separation by business module.
- Avoids unnecessary microservice complexity.

## 2. High-level system architecture

```text
React Frontend
  -> REST API over HTTPS/HTTP
Express Backend
  -> Prisma ORM
PostgreSQL Database
```

Optional:

```text
Express Backend -> Upstash Redis for cache/rate-limit/optional locks
```

## 3. Logical layers

```text
Client UI
  -> API Client
  -> Routes
  -> Middleware
  -> Controller
  -> Service
  -> Prisma
  -> PostgreSQL
```

## 4. Architectural principles

1. Business logic belongs in services.
2. Controllers only handle request/response.
3. All protected APIs use auth middleware.
4. Role checks happen on backend and frontend.
5. Checkout and redeem must be transactional.
6. Voucher and voucher code are separate entities.
7. State transitions must be controlled.
8. Critical actions must create audit logs.
9. Database constraints are required, not optional.
10. API responses must be consistent.

## 5. System context diagram

```text
Customer Browser      Partner Browser       Admin Browser
       \                   |                   /
        \                  |                  /
         ------------ React Frontend ---------
                          |
                       REST API
                          |
                   Express Backend
                          |
             Prisma ORM + Transaction Layer
                          |
                    PostgreSQL DB
```

## 6. Module-level architecture

```text
auth
users
partners
vouchers
cart
orders
voucherCodes
reviews
admin
reports
auditLogs
cms
```

Each module follows:

```text
routes -> controller -> service -> prisma
```

## 7. Data consistency zones

| Flow | Consistency need | Design |
|---|---|---|
| Catalog browsing | Eventual/relaxed | Cache allowed |
| Dashboard/report | Slightly delayed OK | Cache 30-60s allowed |
| Checkout | Strong | Transaction + row lock/atomic update |
| Voucher code issue | Strong | Inside checkout transaction |
| Voucher redeem | Strong | Transaction + row lock/conditional update |
| Audit log | Strong for critical actions | Same transaction if possible |

## 8. Non-goals
Do not implement:

- Microservices.
- Kafka/RabbitMQ.
- Kubernetes.
- Event sourcing.
- Full DDD.
- Real payment gateway.
