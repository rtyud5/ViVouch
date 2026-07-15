# W5-D1 — Bug Board & Daily Checkpoint Template

**Baseline commit:** `e016793` (branch `pre-w5-w7-strong-fix`)
**Date:** 2026-07-14
**Lead:** Duy (Acceptance & Security Lead)

---

## 1. Severity Definitions

| Level | Criteria | Action | SLA |
|:------|:---------|:-------|:----|
| **P0 — Blocker** | App crash, 500 error, data corruption, security breach | **Stop-the-line.** Fix immediately. Block all other tasks. | Same day |
| **P1 — Critical** | Core business flow broken, wrong data, auth bypass, data leak | Fix before next checkpoint. Blocks deployment. | 24h |
| **P2 — Major** | UX flow interrupted but workaround exists, missing expected feature | Schedule for current sprint. Does not block demo. | Sprint |
| **P3 — Minor** | UI polish, labels, non-critical missing features | Backlog. Fix if time allows. | Backlog |

---

## 2. Active Bug Board (as of W5-D1 baseline)

### P0 — Blockers (MUST be 0 before Thứ 4)

| ID | Component | Description | Owner | Repro Steps | Status |
|:---|:----------|:-----------|:------|:------------|:-------|
| — | — | *No P0 bugs identified* | — | — | — |

> ✅ **P0 = 0** — Baseline gate PASSED.

---

### P1 — Critical (MUST be 0 before Thứ 4)

| ID | Component | Description | Owner | Repro Steps | Status |
|:---|:----------|:-----------|:------|:------------|:-------|
| B105 | FE — `VoucherApprovalsPage.jsx` | Modal voucher bị Sidebar che z-index | Duy | Login Admin → Vouchers → Click voucher row → Modal bị Sidebar che | ✅ **CLOSED** (fixAdminUI) |

> ✅ **P1 mở = 0** — Baseline gate PASSED.

---

### P2 — Major (Track, schedule within sprint)

| ID | Component | Description | Owner | Repro Steps | Status | Gate |
|:---|:----------|:-----------|:------|:------------|:-------|:-----|
| B101 | FE — `CheckoutPage.jsx` | Checkout không có nút Back quay lại Cart | Vinh | Login customer → Add to cart → Checkout → No Back button visible | 🔴 Open | → Backlog W6 |
| B103 | FE — `PartnerDashboardPage.jsx` | Bộ lọc thời gian chart doanh thu không wire vào state | Tùng | Login partner → Dashboard → Change dropdown → Chart unchanged | 🔴 Open | → Backlog W6 |
| B104 | FE — `PartnerDashboardPage.jsx` | Nút "Xem tất cả" hoạt động gần đây không có onClick | Tùng | Login partner → Dashboard → Click "Xem tất cả" → Nothing happens | 🔴 Open | → Backlog W6 |
| B106 | FE — `VoucherDetailPage.jsx` + BE | WriteReviewForm UI có nhưng BE không trả `userEligibility` → form luôn NOT_ELIGIBLE | Vinh | Login customer (has USED code) → Voucher Detail → Review form shows NOT_ELIGIBLE | 🔴 Open | → Backlog W6 |
| B107 | BE — `auditLog.routes.js` | Audit log READ API route = TODO stub. FE `AuditLogsPage.jsx` exists (7.5KB) but may have no data source. | Huy | Login admin → Audit Logs page → Check if data loads | ✅ **CLOSED** (False Alarm) | API ok ở admin router |

---

### P3 — Minor (Backlog)

| ID | Component | Description | Owner | Repro Steps | Status | Gate |
|:---|:----------|:-----------|:------|:------------|:-------|:-----|
| B102 | FE — `BranchesPage.jsx` + BE | BranchesPage = stub `<div>BranchesPage</div>`. BE branches module = TODO stubs. | Tùng | Login partner → Navigate to Branches → Empty page | 🔴 Open | → **Out-of-scope W5** |
| B108 | FE — `CategoriesPage.jsx` | Admin CategoriesPage = stub. Categories seeded but no CRUD. | — | Login admin → (page not routed) | ⚪ OOS | BR-ADM-05 Medium |
| B109 | FE — `CmsPagesPage.jsx` | Admin CMS pages = stub. | — | Login admin → (page not routed) | ⚪ OOS | BR-ADM-05 Medium |
| B110 | BE — `rateLimit.middleware.js` | Rate limiting = TODO stub. Not wired to any route. | Huy | Direct API stress test on login/checkout | 🔴 Open | → Tech Debt W6 |
| B111 | BE — `validate.middleware.js` | Generic Zod validate middleware = TODO stub. (Inline validation still works in services.) | Huy | N/A — code review finding | 🔴 Open | → Tech Debt W6 |
| B112 | BE — `idempotency.middleware.js` | Idempotency middleware file = TODO stub. (DB-backed idempotency in checkout exists separately.) | Huy | N/A — code review finding | ⚠️ Partial | Generic middleware stub, but checkout-specific implementation exists |

---

## 3. Bug Gate Rules

### Stop-the-line triggers:
1. **Any P0 discovered** → All team members stop current task. Fix immediately.
2. **Any P1 discovered** → Owner must fix within 24h. Blocks Thứ 4 checkpoint.
3. **P0/P1 count > 0 at Thứ 4** → Cannot proceed to D3/D4/D5 tasks.

### Escalation path:
```
P0 discovered → Slack/notify ALL → Fix immediately → Re-test → Close
P1 discovered → Slack/notify owner + Duy → Fix within 24h → Re-test → Close
P2 discovered → Log in bug board → Assign owner → Schedule fix or backlog
P3 discovered → Log in bug board → Backlog unless trivial (< 15 min fix)
```

### New bug discovery rules:
- **Any new bug must be logged** with: ID, component, description, owner, repro steps.
- **Do NOT fix ad-hoc** without first logging.
- **Do NOT delete/skip tests** to make a bug disappear.
- **If a fix creates a new bug**, both must be tracked.

---

## 4. Daily Checkpoint Template

Copy this template daily from W5-D2 to W5-D5.

```markdown
# W5-D[X] Daily Checkpoint — [Date]

## Attendees
- [ ] Duy (Acceptance Lead)
- [ ] Huy (BE Stability)
- [ ] Vinh (Customer)
- [ ] Tùng (Partner)

## Bug Gate Status
| Level | Count | Target | Gate |
|:------|------:|-------:|:-----|
| P0    |     0 |      0 | ✅ / ❌ |
| P1    |     0 |      0 | ✅ / ❌ |
| P2    |       |    N/A | Track |
| P3    |       |    N/A | Track |

## New Bugs Discovered Today
| ID | Severity | Component | Description | Owner |
|:---|:---------|:----------|:-----------|:------|
|    |          |           |            |       |

## Bugs Closed Today
| ID | Severity | Evidence of Fix |
|:---|:---------|:---------------|
|    |          |                |

## Task Progress ([Owner])
| Task ID | Description | Status | Blockers |
|:--------|:-----------|:------:|:---------|
|         |            | ⬜/🟡/✅ |         |

## Stop-the-line Items
- [ ] Any P0/P1 discovered? If yes → detail here.
- [ ] Any scope creep attempted? If yes → rejected / documented as OOS.

## Decision Log
| Decision | Rationale | Agreed by |
|:---------|:---------|:----------|
|          |          |           |

## Action Items for Tomorrow
| Action | Owner | ETA |
|:-------|:------|:----|
|        |       |     |
```

---

## 5. Weekly Bug Trend Tracker

| Day | P0 Open | P1 Open | P2 Open | P3 Open | New | Closed | Net |
|:----|--------:|--------:|--------:|--------:|----:|-------:|----:|
| D1 (Tue) | 0 | 0 | 5 | 4 | 3 (B107-B112 logged) | 0 | +3 |
| D2 (Wed) | | | | | | | |
| D3 (Thu) | | | | | | | |
| D4 (Fri) | | | | | | | |
| D5 (Sat) | | | | | | | |

> **Target end of W5:** P0 = 0, P1 = 0, all P2 either fixed or explicitly deferred to W6 with rationale.
