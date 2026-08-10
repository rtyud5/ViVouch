# W7-D3 — Runtime Readiness, Privacy & Audit Check

**Project:** ViVouch / Marketplace-Lite  
**Task:** W7-D3  
**Owner:** Duy — Release & Quality Lead  
**Status:** PASS  
**Date:** 2026-08-10

---

## 1. Readiness checklist

| Check | Endpoint / mechanism | Expected | Evidence | Result |
|---|---|---|---|---|
| Liveness (cheap) | `GET /health/live` | HTTP 200, `{ status: "live" }` | `tests/health-ready.test.js` | PASS |
| Legacy health | `GET /health` | HTTP 200 | source: `app.js` | PASS |
| Readiness (DB up) | `GET /health/ready` | HTTP 200, `{ status: "ready" }` | mock `$queryRaw` in test | PASS |
| Readiness (DB down) | `GET /health/ready` | HTTP **503**, `code: DATABASE_NOT_READY` | mock reject in test | PASS |
| Readiness (DB timeout) | `GET /health/ready` | HTTP **503** within ~2s | mock hang in test | PASS |
| Request correlation | `X-Request-Id` middleware | Safe id echoed on response + error body | `tests-node/request-context.test.js`, `tests/rate-limit.test.js` | PASS |

**Dependency outage simulation:** DB failure is simulated via Prisma mock in `health-ready.test.js` (no live postgres stop required — lower-level proof sufficient per W7 scope).

---

## 2. Privacy / log check

| Control | Implementation | Automated proof | Result |
|---|---|---|---|
| Structured log redaction | `backend/src/config/logger.js` — pino redact for auth header, cookie, password/hash, OTP, tokens, email/recipient, payOS keys | `tests-node/logger-redaction.test.js` | PASS |
| Error payload safety | `error.middleware.js` logs method/path/requestId only; JSON errors carry `requestId`, not request body | `tests-node/logger-redaction.test.js` (probe) | PASS |
| API response safety | `publicUser()` strips `passwordHash`; login/register responses use safe projection | `tests/users.test.js` | PASS |
| Health 503 logs | pino-http uses `silent` level for `/health*` — no noisy dependency errors in normal ops logs | source review `app.js` | PASS |

**Inspect logs (503 sample):** readiness failure returns `{ success:false, status:"not_ready", code:"DATABASE_NOT_READY" }` — no stack trace, no DB credentials, no connection string.

---

## 3. Critical audit trace samples

### Sample A — Partner redeem (core mutation)

Source: `tests/partner-redeem-api.test.js`

| Field | Value |
|---|---|
| Request header | `X-Request-Id: w6d4-redeem-audit-001` |
| action | `PARTNER_REDEEM_VOUCHER` |
| targetType / targetId | `VoucherCode` / UUID |
| actorId | authenticated partner user UUID |
| requestId | `w6d4-redeem-audit-001` |
| side effect | `voucherUsageLog` row + code `ISSUED → USED` |

### Sample B — Admin order cancel

Source: `tests/admin-orders-audit.test.js`

| Field | Value |
|---|---|
| action | `ADMIN_CANCEL_ORDER` |
| targetId | order UUID |
| actorId | admin user |
| state change | order CANCELLED, payment REFUNDED, codes CANCELLED, stock restored |

### Sample C — Rate-limit rejection (correlation without leak)

Source: `tests/rate-limit.test.js`

| Field | Value |
|---|---|
| HTTP status | 429 |
| requestId | `rate-limit-test-001` (header + body) |
| leaked secrets | none (no token/email/password in body) |

---

## 4. Commands run

```bash
# Test DB bootstrap (local only)
docker exec vivouch_db psql -U postgres -c "CREATE DATABASE voucher_platform_test;"
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voucher_platform_test?schema=public npx prisma migrate deploy

# W7-D3 proof suite
cd backend
npm test -- tests/health-ready.test.js tests/rate-limit.test.js tests/partner-redeem-api.test.js tests/admin-orders-audit.test.js
npm run test:unit:node   # includes request-context + logger-redaction
```

**Results:** 32/32 vitest (4 files) PASS · 15/15 node unit tests PASS

---

## 5. Acceptance criteria

| Criterion | Verdict |
|---|---|
| DB down readiness non-200 | **PASS** (503) |
| No token/password/PII leak | **PASS** |
| Core action traceable | **PASS** |

---

## 6. Files touched (W7-D3)

| File | Change |
|---|---|
| `backend/src/config/logger.js` | **updated** — add top-level `token`/`refreshToken`/`accessToken` redact paths |
| `backend/tests-node/logger-redaction.test.js` | **added** — minimal privacy/redaction proof |
| `w7_docs/W7D3/W7_D3_RUNTIME_READINESS.md` | **added** — this report |

Runtime changes limited to logger redact path hardening; readiness/requestId/audit already present from W6.

---

## 7. Remaining risk / next task

- Real postgres outage smoke (docker stop) is optional; mock proof is sufficient for student demo gate.
- H3 E2E traffic should reuse `X-Request-Id` in canonical flow evidence index.
- **Next:** W7-D4 or H3 handoff per sprint board.
