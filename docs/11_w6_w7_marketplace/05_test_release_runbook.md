# Test and Release Runbook

## Local prerequisites

- Node.js 20+
- PostgreSQL 16+
- Backend and frontend lockfiles
- SMTP test or real credentials
- payOS credentials only for staging/manual integration

## Clean validation

```bash
cd backend
npm ci --ignore-scripts
npx --no-install prisma generate
npx --no-install prisma migrate deploy
npm run prisma:seed
npm run test:unit:node
npm test

cd ../frontend
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build

cd ..
node scripts/static-quality.mjs
git diff --check
```

## Staging smoke

- Customer registration, real SMTP OTP, login, and password reset.
- Partner application, Admin approval, Owner login, branch and Staff creation.
- Staff setup email and branch-scoped access.
- Wallet checkout and payOS checkout.
- Duplicate checkout, duplicate webhook, insufficient wallet, out-of-stock, and duplicate redeem.
- Refund request, wallet refund, payOS manual refund record, support ticket, and notification.
- `/health/live` remains healthy while `/health/ready` reflects database availability.

## Backup and restore

```bash
DATABASE_URL='postgresql://...' scripts/backup-db.sh evidence/backup.dump
TARGET_DATABASE_URL='postgresql://...new_database...' scripts/restore-db.sh evidence/backup.dump
```

Restore only to a separate test database. Run migration status, record counts, and canonical smoke after restore.

## Sonar

The `SonarQube` workflow requires `SONAR_TOKEN` and `SONAR_HOST_URL` repository secrets. It runs the local static preflight and waits for the remote quality gate. A release is not signed off when the configured Sonar quality gate is red or unavailable.

## Release gate

- Required CI green on the frozen SHA.
- No open P0/P1 defects.
- No committed SMTP/payOS secrets.
- Canonical Customer and Partner/Admin flows pass.
- Backup restored to a different database and verified.
- Four owners sign the same SHA.
