# W5 Sprint — Four-owner Release Sign-off Sheet

**Base SHA reviewed by D5:** `523390ae4177daefe1b7dfa99412a7db91b56ae9`

**Resulting candidate commit SHA:** `PENDING — set after the delivered patch is applied and committed`

**Technical status:** **GO to W6**

**Release-tag status:** **HOLD / NOT AUTHORIZED**

An owner name, an earlier commit, or a tool-generated checkbox is not a signature. Every owner must independently review the same resulting candidate commit, its hosted CI run, logs, limitations, scorecard, and backlog. No row below may be changed to `APPROVE` on another person's behalf.

## 1. Evidence package each owner must review

- [Final rubric scorecard](W5D5_01_final_rubric_scorecard.md)
- [GO/NO-GO record](W5D5_03_go_nogo_record.md)
- [W6/W7 prioritized backlog](W5D5_02_prioritized_backlog.md)
- [Release notes](W5D5_05_release_notes.md)
- [Delivery manifest](W5D5_06_delivery_manifest.md)
- [Three-portal evidence index](W5D5_07_three_portal_evidence_index.md)
- [Backend canonical log](evidence/canonical-backend-20260721.log)
- [Frontend canonical log](evidence/canonical-frontend-20260721.log)
- [Evidence checksum manifest](evidence/W5D5_evidence_manifest.sha256)
- [Release deck](../../docs/10_presentation/ViVouch_W5_Release_Deck.pptx)
- Hosted GitHub Actions URL for the resulting candidate SHA

## 2. Four-owner status

| Owner | Required review | Technical evidence ready | Owner decision | Candidate SHA | Date/time + timezone | Owner-authored proof |
|---|---|---:|---:|---|---|---|
| Duy — Acceptance & Security | 20 tasks/waivers, score, P0/P1, limitations, decision | **YES** | **PENDING** | — | — | owner commit/comment/signature required |
| Huy — Backend & Data | clean setup, 10 migrations, seed, 179 tests, audit, rollback implications | **YES** | **PENDING** | — | — | owner commit/comment/signature required |
| Vinh — Customer Portal | 12 Customer captures, responsive/negative states, 20 FE tests, limitations | **YES** | **PENDING** | — | — | owner commit/comment/signature required |
| Tùng — Partner/Admin Portal | branches, two-step redeem, Admin/CMS/audit, six portal captures | **YES** | **PENDING** | — | — | owner commit/comment/signature required |

**Current sign-off count: 0/4.** Technical evidence being ready is not owner approval.

## 3. Declaration template

Each owner must add an owner-authored commit, signed comment, or reviewed row containing all fields below:

> I independently reviewed candidate SHA `<40-character SHA>`, its green hosted CI run, the canonical logs, 20-task disposition, internal rubric score, release notes, all known limitations, and the W6/W7 backlog. My decision is `<APPROVE|REJECT>`. Date/time: `<ISO-8601 with timezone>`. Evidence link: `<owner-authored URL or commit>`.

| Owner | Exact 40-character candidate SHA | Decision (`APPROVE` / `REJECT`) | Date/time + timezone | Evidence URL/commit |
|---|---|---|---|---|
| Duy | — | **PENDING** | — | — |
| Huy | — | **PENDING** | — | — |
| Vinh | — | **PENDING** | — | — |
| Tùng | — | **PENDING** | — | — |

## 4. Authorization rule

A release tag requires all of the following:

1. P0 = 0 and P1 = 0.
2. One immutable candidate commit contains the complete patch.
3. Backend, frontend, build, audits, and evidence checks are green in hosted CI on that exact SHA.
4. Evidence links resolve and media are valid/non-empty.
5. Known limitations and the P2/P3 backlog are retained without misleading production claims.
6. Duy, Huy, Vinh, and Tùng independently record `APPROVE` for the same SHA.

**Current authorization:** **DENIED / TAG HOLD** because items 2, 3, and 6 require repository-owner action after handoff. No release tag may be created from this sheet yet.
