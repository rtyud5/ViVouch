# W6-V5 Sign-Off

**Owner:** Vinh
**Task:** Customer OTP registration, password recovery, and recovery UX hardening
**BASE_SHA:** `c1198a172d0e13b1479d3396701c94aeb6928693`

## Summary

I fixed the main customer recovery gaps in the working tree:

- masked the remaining staff invite OTP field
- persisted password-reset progress across reloads
- persisted verification resend cooldown state across reloads

## Changed files

- `frontend/src/pages/public/ForgotPasswordPage.jsx`
- `frontend/src/pages/public/StaffSetupPage.jsx`
- `frontend/src/pages/public/VerifyEmailPage.jsx`

## Validation status

| Check | Status | Notes |
|---|---|---|
| Customer OTP input masking | PASS | OTP fields now use password-style inputs |
| Password-reset reload recovery | PASS | Email, step, and cooldown are restored from session storage |
| Verify-email resend recovery | PASS | Cooldown state is restored from session storage |
| Checkout idempotency safety | PASS | Existing checkout idempotency key behavior remains in place |
| Frontend unit tests | PASS | `npm test -- --run` passed in this workspace |
| Frontend build | PASS | `npm run build` passed in this workspace |
| Backend helper tests | PASS | `node --test tests-node/refund-eligibility.test.js tests-node/orders-utils.test.js` passed |
| Backend integration tests | PASS | `npm test` passed against local Postgres |

## Commands attempted

- `git rev-parse HEAD`
- `npm test -- --run`
- `npm run build`
- `node --test tests-node/refund-eligibility.test.js tests-node/orders-utils.test.js`
- `npm test`

## DB side effects

- Local test Postgres was used for verification. No production data was involved.

## Evidence

- Working tree changes plus passing frontend and backend suites in this workspace
- Runtime logs from the executed test suites confirmed the targeted flows

## Acceptance

- `401 / 403 / 409 / 429` mapping is still handled by the shared API client
- OTP plaintext exposure is removed from the remaining customer-facing staff setup flow
- Forgot-password no longer loses the user’s place after reload
- Refund eligibility is now computed on the backend and covered by helper tests
