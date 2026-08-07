# W6-H5 — W5-Copy Migration Drill

**Source baseline:** `e016793298ad30b73888b6a9a5ec61044b8c86fe` (`pre-w5-w7-strong-fix`)
**Target code candidate:** `09c6df4cb5971642e0995ef0a84b3147e8d6ce79`
**Database:** isolated PostgreSQL database `w5_copy_migration_audit`
**Date:** 2026-08-07 (UTC+07)
**Result:** PASS

## Method

1. Checked out the exact W5 baseline in a detached worktree.
2. Created an isolated database, applied the nine migrations present at the W5 baseline, and ran the W5 seed.
3. Recorded pre-upgrade row counts and the nine applied migration names.
4. Ran the current backend's `prisma migrate deploy` only. It applied four migrations: CMS content, marketplace enum values, marketplace demo features, and missing indexes/constraints.
5. Did **not** run `prisma migrate reset` and did **not** run the current seed after upgrade.
6. Compared row counts and queried relationship and Staff-branch invariants.
7. Ran the current Node 20/Linux backend command contract against the upgraded W5 database.

## Record preservation

| Table | Before upgrade | After upgrade |
|---|---:|---:|
| User | 8 | 8 |
| Partner | 4 | 4 |
| Branch | 5 | 5 |
| Voucher | 8 | 8 |
| VoucherCode | 18 | 18 |
| Order | 17 | 17 |
| Payment | 17 | 17 |
| AuditLog | 0 | 0 |
| Review | 5 | 5 |
| Cart | 2 | 2 |
| CartItem | 3 | 3 |
| VoucherBranch | 11 | 11 |
| VoucherUsageLog | 8 | 8 |

New W6 tables were created with expected initial values: `PartnerMember` 4, `Wallet` 3, and zero rows in the other newly introduced operational tables. This is expected migration backfill behavior, not a loss of W5 records.

## Invariants after upgrade

```text
OrderItemWithoutOrder=0
PaymentWithoutOrder=0
VoucherCodeWithoutOrder=0
StaffWithoutBranch=0
```

## Current-code validation on upgraded W5 data

The following commands ran in a Node 20 Linux container, matching GitHub Actions, with deterministic test settings and no external provider calls:

```text
npm ci --ignore-scripts                         PASS
npx --no-install prisma generate                PASS
npx --no-install prisma migrate deploy          PASS (no pending migrations)
npm run test:unit:node                          PASS (13/13)
npm test                                        PASS (25 files, 196/196)
npm audit --omit=dev --audit-level=high         PASS (0 high/critical)
```

## Evidence boundary

The historical W5 lockfile did not install cleanly with current npm 10, so the detached W5 worktree used a regenerated temporary dependency installation solely to execute the exact W5 schema, migrations, and seed. No W5 source or database record was altered by the current migration drill beyond the four forward-only W6 migrations.
