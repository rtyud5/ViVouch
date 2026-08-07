# W6-V5 Customer Matrix

**Owner:** Vinh
**Scope:** Customer OTP registration, password recovery, checkout recovery UX
**BASE_SHA:** `c1198a172d0e13b1479d3396701c94aeb6928693`

| Area | Scenario | Expected | Result | Status |
|---|---|---|---|---|
| Register / Verify | OTP entry on verify-email screen | OTP must not be shown as plaintext | OTP input stays masked with `type="password"` | PASS |
| Register / Verify | Resend verification OTP | Cooldown is visible and reuses the same flow after reload | Cooldown state is persisted in session storage and restored on reload | PASS |
| Register / Verify | Wrong OTP / backend validation error | User sees backend message or safe fallback message | Error is surfaced without exposing secret data | PASS |
| Forgot password | Request reset OTP | Email is accepted and reset flow advances safely | Reset step is stored and restored after reload | PASS |
| Forgot password | Resend reset OTP | Cooldown prevents spam and remains understandable | Cooldown countdown is persisted and resumed after refresh | PASS |
| Forgot password | Reset with OTP | OTP must not be displayed in plaintext | OTP input is masked and numeric | PASS |
| Staff setup | Staff invite OTP entry | OTP must not be displayed in plaintext | OTP input changed to password-style masked input | PASS |
| Checkout recovery | Reload during checkout recovery | Reload must not create a new order | Idempotency key stays in session storage; order creation is not reissued by UI | PASS |
| Checkout recovery | PayOS redirect / return | UI should resume from payment state instead of confirming paid blindly | Return path remains bounded to payment-result handling | PASS |

## Notes

- These results were verified by automated frontend and backend test runs in this workspace.
- Frontend recovery-flow tests and the full frontend build passed.
- Backend helper and integration tests passed against the local Postgres test database.
- No production data was involved.
