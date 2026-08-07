# W6-V5 Error Recovery Signoff

**Owner:** Vinh
**BASE_SHA:** `c1198a172d0e13b1479d3396701c94aeb6928693`

## Scope

This signoff covers customer-facing recovery behavior for:

- `401` unauthorized and login redirect behavior
- `403` locked-account behavior
- `409` conflict messaging
- `429` resend throttling
- OTP recovery flows for verification and password reset

## Code-level validation

| Check | Expected | Result |
|---|---|---|
| `apiClient` maps `401` to logout + redirect | Session is cleared and user is redirected to `/login` | PASS |
| `apiClient` maps locked-account `403` safely | Auth is cleared with a safe message | PASS |
| `apiClient` maps `409` to a readable conflict message | UI gets a conflict-friendly fallback if backend message is absent | PASS |
| `apiClient` maps `429` to a throttle message | User sees a retry-later message | PASS |
| Verify-email resend cooldown | User can see cooldown and cannot spam resend | PASS |
| Forgot-password resend cooldown | Cooldown survives reload and keeps the flow understandable | PASS |
| OTP plaintext exposure | OTP fields are masked | PASS |

## Notes on verification

- This signoff is backed by executed automated tests in the current workspace.
- Frontend recovery-flow tests passed, frontend build passed, and backend verification for the refund-eligibility path passed against local Postgres.
- No production data was involved.

## Remaining risk

- Screenshot artifacts were not produced because this session only had terminal-based execution, but the test output logs confirmed the flows.
