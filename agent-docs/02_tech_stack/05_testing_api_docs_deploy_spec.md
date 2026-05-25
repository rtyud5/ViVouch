# Testing, API Docs, and Deploy Specification

## 1. Testing stack

```text
Vitest + Supertest
```

Vitest runs tests. Supertest calls Express APIs.

## 2. Minimum API tests

| Test group | Required cases |
|---|---|
| Auth | login success, login failure, protected API without token |
| RBAC | customer cannot call admin API; partner cannot call admin API |
| Voucher | partner creates/submits voucher; admin approves/rejects |
| Checkout | success; out of stock; unapproved voucher blocked |
| Code issue | code unique; code only after paid order |
| Redeem | success; used blocked; expired blocked; wrong partner blocked |
| Audit | approval/checkout/redeem create audit logs |
| Dashboard | returns aggregate metrics |

## 3. API Docs: Swagger/OpenAPI
API docs are required for agent/dev coordination and presentation.

Use:

```text
swagger-ui-express
swagger-jsdoc
```

Expose:

```text
GET /api-docs
```

Each API should include:

- Method.
- Path.
- Description.
- Required role.
- Request body/query/params.
- Response success.
- Response errors.

## 4. Deploy stack

| Component | Platform |
|---|---|
| Frontend | Vercel |
| Backend | Render |
| Database | Supabase PostgreSQL |
| Optional Redis | Upstash Redis |

## 5. Environment variables

### Backend `.env`

```env
NODE_ENV=development
PORT=5000
DATABASE_URL=postgresql://...
JWT_ACCESS_SECRET=change_me
JWT_ACCESS_EXPIRES_IN=1d
BCRYPT_SALT_ROUNDS=10
CLIENT_URL=http://localhost:5173
REDIS_URL=
```

### Frontend `.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api
```

## 6. Health check
Backend should expose:

```text
GET /health
```

Response:

```json
{
  "success": true,
  "message": "Voucher API is running"
}
```

## 7. Deployment readiness checklist

- Environment variables set.
- Database migrations applied.
- Seed data loaded.
- CORS allows frontend domain.
- Swagger accessible or disabled intentionally in production.
- Demo accounts documented.
- API base URL set in Vercel.
- Render backend awake before presentation.
