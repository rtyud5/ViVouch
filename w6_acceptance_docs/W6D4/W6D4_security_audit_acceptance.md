# W6-D4 Security, privacy & audit acceptance

**Owner:** Duy (Team Lead / Security)
**Scope:** W6 integration baseline after D2/D3 and H3
**Evidence basis:** source review, PostgreSQL integration tests, negative-control tests, and redacted request/audit assertions.

## Security checklist

| Control | Evidence | Result |
|---|---|---|
| Sensitive log redaction | `backend/src/config/logger.js` redacts authorization/cookie, password/hash, OTP/hash, tokens, email/recipient and payOS credentials. Error middleware logs method/path/requestId rather than request body. | PASS |
| OTP privacy | OTP is generated, hashed with `OTP_PEPPER`, and only passed to the email adapter; `issueOtp()` returns expiry/cooldown only. | PASS |
| Token/password response safety | `publicUser()` removes `passwordHash`; error responses do not return request bodies, tokens, or stack traces. | PASS |
| Voucher-code logging | Redeem errors and audit metadata use record identifiers/statuses; no structured logger writes voucher-code plaintext. | PASS |
| payOS secret/payload safety | Signature validation consumes the configured checksum key; structured logs contain only event/order identifiers. Webhook payload is retained in the database for provider reconciliation, not emitted to logs/audit evidence. | PASS |
| Owner/tenant controls | Partner routes require authenticated `PARTNER`; reports require `requirePartnerOwner()`. Cross-partner/branch negative controls keep target state unchanged. | PASS |
| Rate limiting | Auth, OTP, checkout, redeem-check and redeem-confirm routes are protected. The test forces limiter execution and verifies the 429 contract plus `x-request-id`. | PASS |
| Audit traceability | Redeem integration test proves a critical mutation writes actorId, target type/id, and caller-provided requestId atomically. | PASS |

## Redacted trace samples

### Redeem mutation

Request correlation input: `X-Request-Id: w6d4-redeem-audit-001`.

| Audit field | Expected evidence |
|---|---|
| actorId | UUID of authenticated Partner user (not email/token) |
| action | `PARTNER_REDEEM_VOUCHER` |
| targetType / targetId | `VoucherCode` / UUID |
| requestId | `w6d4-redeem-audit-001` |
| old/new values | `ISSUED` -> `USED` with timestamp |

### Rate-limit rejection

The request `X-Request-Id: rate-limit-test-001` returns HTTP 429 with a matching response header/body requestId. No authorization header, account email, OTP, password, token, or voucher code is included in the response.

## Finding disposition

| ID | Severity | Finding | Disposition | Owner |
|---|---|---|---|---|
| SEC-01 | P0 | OTP/token/password/voucher code/secret emitted by structured logs | Closed: source review and redaction/negative-request inspection found no leak path. | Duy |
| SEC-02 | P0 | Critical redeem mutation lacks actor/target/request correlation | Closed: integration assertion now proves actorId, target, and requestId in `AuditLog`. | Duy |
| SEC-03 | P1 | Rate-limit rejection could lack a usable correlation ID | Closed: rate-limit test now covers middleware ordering and 429 requestId contract. | Duy |
| SEC-04 | P1 | H4/V4/T4 evidence identifiers are absent from this workspace | Open evidence follow-up: no source change is required; Huy/Vinh/Tung must attach their retained logs/screenshots to the release evidence index before freeze. | Huy / Vinh / Tung |

## Boundary and remaining risk

- This review does not treat a hidden frontend menu as authorization; server-side RBAC/tenant checks remain authoritative.
- Real SMTP/payOS manual smoke must use redacted operational logs only. No secret, token, OTP, password, full email address, or voucher code may be copied into release evidence.
- The audit schema allows a nullable requestId for non-HTTP/system jobs; HTTP critical-mutation paths reviewed here receive request context through application middleware.
