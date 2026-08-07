# W6 → W7 Handoff

**W6 frozen code candidate:** `6c542363d1beeebf6173988ef9cac15c3dae40cb`
**W6 gate:** **GO — staging-ready core**
**Effective date:** 2026-08-07 (UTC+07)

## W7 entry authorization

W7 may start. The W6 gate was approved by the repository owner after Codex completed clean-PostgreSQL migration/seed validation, backend and frontend regression, build, static quality, evidence validation, and production dependency audit.

## Required W7 carry-over

1. Perform a genuine backup/restore and W5-copy-style migration drill before the release candidate.
2. Run retained Customer and Partner/Admin/Staff browser E2E on the release SHA.
3. Publish coverage and Sonar evidence.
4. Update the frontend router dependency line to resolve its remaining moderate production audit findings.
5. Keep the release claim limited to demonstrated capabilities.

## Boundary

W6 is not production-ready. Real payout, automated external refunds, HA, multi-region deployment, and a proven backup/restore release process remain out of scope until independently verified.
