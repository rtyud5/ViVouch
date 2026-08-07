# W6 → W7 Handoff

**W6 frozen code candidate:** `09c6df4cb5971642e0995ef0a84b3147e8d6ce79`
**W6 gate:** **GO — staging-ready core**
**Effective date:** 2026-08-07 (UTC+07)

## W7 entry authorization

W7 may start. The W6 gate was approved by the repository owner after Codex completed clean-PostgreSQL migration/seed validation, backend and frontend regression, build, static quality, evidence validation, and backend production dependency audit.

## Required W7 carry-over

1. Repeat backup/restore into a new database as a release-candidate operational rehearsal; the W5-to-W6 migration drill is already complete.
2. Run retained Customer and Partner/Admin/Staff browser E2E on the release SHA.
3. Publish coverage and Sonar evidence.
4. Update the frontend router dependency line to resolve its remaining moderate production audit findings.
5. Define release sign-off policy work for W6-EXC-002.
6. Complete GitHub Actions runtime work for W7-RUNTIME-001.
7. Keep the release claim limited to demonstrated capabilities.

## Boundary

W6 is not production-ready. Real payout, automated external refunds, HA, multi-region deployment, and a proven backup/restore release process remain out of scope until independently verified.
