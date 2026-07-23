# W6-W7 Marketplace Demo+ Extension

This package extends the W5 voucher marketplace without changing its modular-monolith architecture.

## W6 outcome

- Email OTP for customer registration, partner registration, password reset, and staff setup.
- Separate public partner application and Admin approval flow.
- Partner Owner and branch-scoped Staff memberships.
- ViVouch demo wallet and payOS hosted VietQR checkout.
- Full-order refund request, simple support ticket, in-app notification, and transactional email outbox.
- Idempotent checkout, inventory locking, duplicate webhook protection, branch-scoped redeem, request correlation, rate limits, audit, and lifecycle reconciliation.

## W7 outcome

- Reproducible CI with PostgreSQL, Prisma migrations/seed, tests, frontend build, and static quality checks.
- SonarQube/SonarCloud workflow that waits for the configured quality gate.
- Liveness/readiness endpoints, background job controls, backup/restore scripts, staging smoke checklist, and release evidence requirements.

## Scope boundary

This is a student demo foundation. payOS is used to prove real payment integration, while partner settlement, automatic payOS refunds, chargebacks, legal KYB verification, and high-availability infrastructure remain out of scope.

See:

- [Architecture and flows](01_architecture_and_flows.md)
- [Permissions and state rules](02_permissions_and_states.md)
- [SMTP setup](03_smtp_setup.md)
- [payOS setup](04_payos_setup.md)
- [Test and release runbook](05_test_release_runbook.md)
- [API walkthrough](06_api_walkthrough.md)
