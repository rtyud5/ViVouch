# W5-D5 — GO/NO-GO Decision and Release Record

**Decision date:** 2026-07-21

**Code base:** `523390ae4177daefe1b7dfa99412a7db91b56ae9`

**Candidate under review:** base SHA plus the W5 closeout patch in [the delivery manifest](W5D5_06_delivery_manifest.md)

**Decision owner:** Acceptance & Security Lead

## Decision

- **GO — technical candidate may proceed to W6 and demonstration preparation.**
- **NO-GO / HOLD — do not create a release tag yet.** Apply the patch, commit it as one immutable candidate SHA, obtain green hosted CI on that SHA, and collect all four owner-authored approvals first.

This split decision is deliberate: the system has no open P0/P1 and the evidence is green, but a tool cannot manufacture a team member's signature or a hosted CI URL for unpushed code.

## 1. Gate assessment

| Gate | Required | Observed | Result |
|---|---|---|---:|
| Product P0/P1 | 0/0 | P0 = **0**, P1 = **0** after consolidated remediation | **PASS** |
| Evidence links/files | accessible, valid, non-empty | local link validator passes; 18 runtime PNGs are valid and non-empty | **PASS** |
| Known limitations | complete and honest | payment/email simulation, localStorage, per-process rate limits, demo analytics, and patch/CI/signature state are explicit | **PASS** |
| Canonical backend | migrate/seed/test/audit pass | 10 migrations current; seed pass; **179/179**; runtime audit **0** | **PASS** |
| Canonical frontend | test/build/audit pass | **20/20**; production build pass; runtime audit **0** | **PASS** |
| Three-portal browser rehearsal | pass | Customer 12, Partner 3, Admin 3 captures; no page error in final portal rehearsal | **PASS** |
| 20 tasks/waivers | 20/20 disposition | **20/20 technical outputs closed**; no silent/unratified waiver used for a core point | **PASS** |
| Internal rubric | evidence for every point | **10.0/10.0 internal assignment-readiness** | **PASS** |
| Immutable frozen candidate | one commit SHA | current handoff is base SHA plus patch; resulting commit SHA does not yet exist | **HOLD** |
| Hosted CI | green on frozen SHA | workflow is executable locally/in source, but cannot run on an unpushed patch | **HOLD** |
| Four-owner sign-off | 4/4 on same SHA | **0/4 recorded for the resulting commit**; sheet is ready | **HOLD** |

## 2. Outcome and rationale

The earlier NO-GO reasons have been removed technically:

- Redeem now has a non-mutating check followed by an explicit atomic confirm.
- Authentication now rotates refresh tokens, blocks replay, revokes on logout, and supports one-time password reset.
- Auth/checkout/redeem rate limits return stable `429` errors and are tested.
- Review eligibility, full catalog filters, Partner Branch management, Admin management, CMS, and audit context are implemented.
- The placeholder CI workflow now runs PostgreSQL migrate/seed/test, frontend test/build, dependency audits, and evidence validation.
- Documentation TODO stubs and the missing presentation have been replaced with code-aligned deliverables.
- Zero-byte evidence was replaced by real browser captures across Customer, Partner, and Admin.
- A QA review caught and removed client-visible stack traces from 4xx responses; a regression assertion prevents recurrence.

The remaining HOLD items are governance steps that require the repository owners or GitHub: create the immutable candidate commit, run its hosted checks, and sign that exact SHA. They do not reopen product P0/P1, but they do prohibit tagging.

## 3. Commands, results, and retained evidence

| Command/check | Pass / fail / skip | Evidence |
|---|---:|---|
| `npx prisma validate` | PASS | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npx prisma generate` | PASS | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npx prisma migrate status` | PASS — 10 migrations current | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npm run prisma:seed` | PASS | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npm test` in `backend/` | PASS — 20 files, 179 tests | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npm audit --omit=dev` in `backend/` | PASS — 0 | [backend canonical log](evidence/canonical-backend-20260721.log) |
| `npm test -- --run` in `frontend/` | PASS — 5 files, 20 tests | [frontend canonical log](evidence/canonical-frontend-20260721.log) |
| `npm run build` in `frontend/` | PASS | [frontend canonical log](evidence/canonical-frontend-20260721.log) |
| `npm audit --omit=dev` in `frontend/` | PASS — 0 | [frontend canonical log](evidence/canonical-frontend-20260721.log) |
| Browser rehearsal on seeded PostgreSQL | PASS — 18 captures | [three-portal evidence index](W5D5_07_three_portal_evidence_index.md) |
| `node scripts/verify-evidence.mjs` | PASS after final doc/evidence generation | [evidence manifest](evidence/W5D5_evidence_manifest.sha256) |
| Presentation render + overflow check | PASS — 10 slides, no overflow | [release deck](../../docs/10_presentation/ViVouch_W5_Release_Deck.pptx) |
| Hosted GitHub Actions on resulting commit | **SKIP/HOLD** — patch is not pushed | Must be supplied by a repo owner |
| Four owner-authored signatures | **SKIP/HOLD** — human approval required | [sign-off sheet](W5D5_04_release_signoff.md) |

## 4. Acceptance criteria

| Criterion | Status |
|---|---:|
| P0/P1 = 0 | **Met** |
| Evidence links accessible | **Met locally and packaged** |
| Known limitations honest | **Met** |
| Do not tag if any gate fails | **Met — tag remains on HOLD** |
| Canonical smoke rerun | **Met** |
| Frozen SHA/test logs | **Partially met** — base SHA and logs are retained; final commit SHA must be created after patch apply |
| Four sign-offs | **Not yet met** — 0/4; no signature fabricated |

## 5. Release authorization

**Authorized now:** W6 engineering, review, and demo rehearsal.

**Not authorized now:** release tag, production deployment, or a claim that four owners approved.

The next authorized action is for a repository owner to apply the ZIP, review the [delivery manifest](W5D5_06_delivery_manifest.md), commit the complete patch, push it, wait for green CI, and then have Duy, Huy, Vinh, and Tùng sign the resulting SHA in the [sign-off sheet](W5D5_04_release_signoff.md).
