# ViVouch W5 Closeout — Consolidated Release Notes

**Date:** 2026-07-21

**Base SHA:** `523390ae4177daefe1b7dfa99412a7db91b56ae9`

**Release state:** technical GO to W6; release tag on HOLD pending one committed candidate SHA, green hosted CI, and 4/4 owner approval.

## Highlights

- Closed the BRD's two-step redeem flow with a non-mutating partner/branch-scoped check and an explicit atomic confirm.
- Hardened checkout/redeem concurrency, idempotency, stock/code state, cancel/refund effects, and audit logging.
- Added rotating refresh sessions, replay rejection, logout revocation, one-time password reset, client auto-refresh, and forgot-password UI.
- Added tested `429` rate limits to authentication, checkout, and redeem.
- Removed client-visible error stacks; server logs retain diagnostic detail.
- Completed Customer filters and review eligibility, Partner Branch management, Admin management, CMS, and searchable audit context.
- Added real CI jobs for PostgreSQL migration/seed/backend tests, frontend tests/build, runtime dependency audits, and evidence validation.
- Completed the academic documentation set and added a ten-slide release/defense deck.
- Replaced empty media placeholders with 18 real browser captures across Customer, Partner, and Admin.

## Backend and data

- Prisma adds CMS page/banner models and supporting enums/relations through migration `20260721090000_add_cms_content`.
- Admin can assign roles, lock users, suspend/reactivate partners, cancel/refund orders, and manage CMS content; sensitive actions write audit records with old/new values and request context.
- Partner branch CRUD enforces ownership and active state; redeem confirm revalidates inside a transaction and records usage/audit state.
- Payment creation is explicitly simulated and persisted as `PAID` for the assignment flow.
- Canonical PostgreSQL result: 10 migrations current, seed PASS, backend **179/179**, runtime dependency audit **0**.

## Frontend

- Customer catalog supports city, partner, price, discount, category, search, sort, pagination, and URL-state preservation.
- Voucher review UI reads backend eligibility and shows the ineligibility reason.
- Partner Branch and two-step Redeem pages are functional.
- Admin Users, Partners, Orders, CMS, and Audit pages expose the new operations and filters.
- Auth automatically refreshes once on `401`, logs out safely on refresh failure, and exposes password recovery.
- Route-level lazy loading keeps production chunks below the previous warning threshold.
- Canonical result: frontend **20/20**, production build PASS, runtime dependency audit **0**.

## Security notes

- Access authorization is server-enforced; UI hiding is not treated as a control.
- Refresh tokens rotate and are stored hashed; replay and revoked token use are rejected.
- Password-reset tokens are one-time and hashed in storage. Delivery remains simulated in this assignment candidate.
- Stable rate-limit errors protect high-risk endpoints. The current store is process-local and is prioritized for W6 before horizontal scaling.
- Error responses no longer expose stack traces or filesystem paths in development/test clients.

## Known limitations

- Real payment processing and real email/SMS delivery are not integrated and are not claimed.
- Browser tokens remain in localStorage; move to secure httpOnly cookies plus CSRF controls before production use.
- Rate-limit state is in memory; use a shared store for multi-instance deployment.
- Some dashboard chart/timeline content remains demonstration-oriented.
- Object storage, production observability, backup/restore rehearsal, accessibility audit, and performance budgets are W6/W7 work.
- The delivered artifact is a patch over the base SHA, not a committed release candidate. A repository owner must create and push the final commit.
- Four owner signatures are intentionally blank; no tool-generated approval is valid.

## Upgrade and verification

1. Apply the delivered ZIP at repository root without deleting unrelated local work.
2. Run `npm ci` in `backend/` and `frontend/`.
3. Configure a non-production PostgreSQL `DATABASE_URL` and JWT secrets.
4. Run `npx prisma generate`, `npx prisma migrate deploy`, and `npm run prisma:seed` in `backend/`.
5. Run backend tests, frontend tests/build, both runtime audits, and `node scripts/verify-evidence.mjs`.
6. Review `git diff`, create one candidate commit, push it, and require all CI jobs to pass.
7. Collect all four approvals in [the sign-off sheet](W5D5_04_release_signoff.md); tag only afterward.
