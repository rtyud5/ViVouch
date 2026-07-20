# Security Design

| Threat/control area | Implemented control |
|---|---|
| Password disclosure | bcrypt hashing; password hashes never returned |
| Session theft/replay | Short access token; rotating, revocable refresh token; password reset revokes sessions |
| Broken authorization | Server-side JWT verification and role middleware; ownership/scope checks in services |
| Brute force/abuse | Stable `RATE_LIMITED` response on auth, checkout, check and confirm routes |
| Injection | Zod validation and Prisma/parameterized SQL templates |
| Overselling/double use | Transactions, row locks, conditional updates, idempotency |
| Browser attack surface | Helmet headers; environment-specific CORS allowlist; no secrets in frontend |
| Audit gaps | Actor/action/target, old/new values, IP, user agent and timestamp |
| Dependency risk | Locked versions, reproducible `npm ci`, production audits in CI |

## Token flow

Login returns an access token and rotating refresh token. A successful refresh revokes the presented token and issues a new pair; replay of the old refresh token fails. Role changes revoke existing refresh tokens. Logout revokes the supplied session or all active sessions for the user.

Password reset delivery is simulated. Development/test responses may expose the reset token for demonstration; production responses never return it.

## Known limitations

- The student SPA persists tokens in browser storage. Production should prefer secure, HttpOnly, SameSite cookies with CSRF protection.
- Rate limiting is per process; multi-instance production requires a shared store.
- Real payment, email, SMS, malware scanning, WAF, backups, and incident response are deployment responsibilities outside the basic assignment.
