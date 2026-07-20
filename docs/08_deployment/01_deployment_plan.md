# Deployment Plan

## Reference topology

- Frontend: static Vite build on Vercel/Netlify or equivalent.
- Backend: Node 20 service on Render/Railway or equivalent.
- Database: managed PostgreSQL (Supabase/Neon/Render) with TLS and backups.

## Required environment

Backend production requires `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, and `CLIENT_URL`. Optional settings define port, token durations, and bcrypt cost. Frontend requires `VITE_API_BASE_URL` at build time.

## Release sequence

1. Freeze candidate identifier and verify clean dependency installation.
2. Back up database and confirm rollback point.
3. Run `prisma migrate deploy`; never use development migration commands in production.
4. Deploy backend and verify `/health` and `/api-docs`.
5. Build/deploy frontend with the exact backend base URL.
6. Run three-role smoke and evidence validation.
7. Create a tag only after acceptance and four-owner sign-off.

## Rollback

Application rollback redeploys the prior image/build. Database migrations in this candidate are additive, so application rollback can retain new CMS/audit columns. A destructive future migration must provide an explicit down/restore procedure.

## Production hardening before real users

- Move refresh/access tokens to secure HttpOnly cookies and add CSRF controls.
- Add shared rate-limit storage, centralized logs/metrics/alerts, backup restore drills, secret rotation, TLS-only endpoints, and data-retention policy.
- Replace simulated payment/message delivery only after vendor security and reconciliation design.
