# W6-D1 — Command Baseline & Acceptance Matrix

**Purpose:** tạo command contract lặp lại được và trace 20 task W6 tới file area, test và evidence.  
**Rule:** không ghi “pass” nếu command chưa chạy trên exact SHA; kết quả run được lưu ở evidence của task tương ứng.

---

## 1. Environment contract

| Component | Contract |
|---|---|
| Node.js | Node 20+; cùng major local/CI |
| Package install | `npm ci`, không dùng `npm install` để tạo drift |
| Database | PostgreSQL 16-compatible; transaction/concurrency evidence phải dùng PostgreSQL thật |
| Backend | Express + Prisma, JavaScript |
| Frontend | React 18 + Vite, JavaScript |
| Secrets | chỉ qua env; không commit/log SMTP, payOS, JWT, OTP hoặc DB credential |
| Test providers | fake SMTP/payOS cho deterministic suite; manual smoke tách riêng |
| Evidence | exact branch + SHA + timestamp + command + exit code |

---

## 2. Preflight commands

Chạy tại repository root:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git diff --check
node --version
npm --version
docker compose config
```

Acceptance:

- đúng integration branch/candidate;
- working tree sạch hoặc changed files đã được liệt kê;
- không có whitespace/conflict marker;
- Docker Compose parse được;
- SHA được ghi vào `outcome.md` và log.

---

## 3. Clean install and startup baseline

```bash
docker compose up -d

cd backend
npm ci
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed

cd ../frontend
npm ci
npm run build
```

Health check sau khi start backend theo env dự án:

```bash
curl -fsS http://localhost:3000/health/live
curl -fsS http://localhost:3000/health/ready
```

Nếu port trong env khác, dùng port thực tế và ghi command vào evidence; không hardcode port trong source.

---

## 4. Database compatibility baseline

### 4.1. Empty database

1. Tạo PostgreSQL database trống dành riêng cho test.
2. Gán `DATABASE_URL` vào DB đó.
3. Chạy:

```bash
cd backend
npx prisma validate
npx prisma generate
npx prisma migrate deploy
npm run prisma:seed
npx prisma migrate status
```

Evidence bắt buộc:

- migration list và exit code;
- seed output;
- row counts của bảng lõi;
- invariant query cho User status, PartnerMember/branch, order/payment/voucher/refund;
- không có schema drift.

### 4.2. W5-copy database

1. Clone/restore bản sao DB tương ứng W5 baseline vào DB test riêng.
2. Ghi before-count và mẫu key records.
3. Chạy `prisma migrate deploy`, không `migrate reset`.
4. Chạy backfill/seed chỉ theo contract đã duyệt.
5. Ghi after-count và invariant queries.

Stop ngay nếu:

- row count giảm không có migration decision;
- FK/unique/NOT NULL fail do dữ liệu cũ;
- Partner/Staff mất tenant/branch;
- order/payment/voucher state bị đổi ngoài migration scope.

---

## 5. Test runner baseline

### 5.1. Commands hiện có trước H1

```bash
cd backend
npm test

cd ../frontend
npm test -- --run
npm run build
```

### 5.2. Target commands H1 phải chuẩn hóa

Backend và frontend phải có script rõ nghĩa:

```bash
npm run test:vitest
npm run test:node
```

Contract:

- `test:vitest` chỉ collect Vitest suite, exclude `tests-node/**`.
- `test:node` chỉ collect Node Test Runner suite.
- CI gọi cả hai dưới step riêng và giữ exit code.
- Không dùng `--passWithNoTests` để che thiếu suite.
- H1 phải lưu test collection/output chứng minh không nhặt chéo.

Fallback để inventory file Node tests trên môi trường POSIX:

```bash
find tests-node -type f \( -name '*.test.js' -o -name '*.spec.js' \) -print
```

H1 chọn command Node tương thích cây file thực tế và khóa nó trong `package.json`; D1 không giả định glob trước khi inventory.

---

## 6. Targeted verification order

Chạy theo thứ tự, dừng khi fail:

1. Config/test collection.
2. Prisma validate/generate.
3. Targeted fixture/auth/PartnerMember tests.
4. Redeem service/API tests.
5. OTP/reset test.
6. Migration empty + W5-copy.
7. Authorization direct API negative tests.
8. Checkout/payment/redeem/refund concurrency tests trên PostgreSQL.
9. Customer UI targeted tests/build.
10. Partner/Admin UI targeted tests/build.
11. Full backend/frontend suites.
12. Evidence verifier.
13. Lặp full canonical run lần hai tại H5.

Canonical gate commands sau H1:

```bash
cd backend
npm run test:vitest
npm run test:node

cd ../frontend
npm run test:vitest
npm run test:node
npm run build

cd ..
node scripts/verify-evidence.mjs
git status --short
git diff --check
```

---

## 7. Required invariant checks

| Domain | Must prove |
|---|---|
| Identity | OTP purpose/expiry/attempt/cooldown; no enumeration; ACTIVE/PENDING behavior intentional |
| RBAC | Customer/Partner/Staff/Admin deny matrix; direct URL/API cannot bypass |
| Partner | approved Partner + ACTIVE PartnerMember; STAFF branch scope; deactivation immediate |
| Checkout | idempotent request; no oversell; no double debit/order/voucher |
| Payment | signed callback; duplicate/late webhook safe; return URL not authoritative |
| Redeem | correct Partner/branch; row lock; duplicate/wrong/refunded code blocked without mutation |
| Refund | eligibility from `paidAt`; voucher lock before refund; retry safe |
| Jobs | outbox/reconcile run twice without duplicate side effects |
| Logging | requestId/audit available; no OTP/token/password/secret/voucher code/PII leak |
| Commission | API-derived gross/rate/fee/estimated revenue; Owner-only; correct unit/rounding/wording |

---

## 8. W6 acceptance matrix — 20 tasks

| Task | Owner | Primary file/module area | Required verification | Required evidence | Exit/acceptance |
|---|---|---|---|---|---|
| W6-D1 | Duy | `w6_acceptance_docs/W6D1/**` | diff W5/source review; 4-owner walkthrough | 4 D1 documents + acknowledgement | source/ownership/risk/commands traceable |
| W6-H1 | Huy | package scripts, Vitest config, `.github/workflows/ci.yml`, env examples | clean `npm ci`; each runner collection; frontend build | commands + collection output + changed files | Vitest/Node do not cross-collect; no skipped tests |
| W6-V1 | Vinh | Customer routes, API client, stores/providers | auth/browse/cart smoke; 401/403/409/429 mapping; build | smoke matrix + test/build | no blank/import error; no localhost/provider hardcode |
| W6-T1 | Tùng | Partner/Admin route/menu/API map | clean sessions; direct URL/API deny sampling | permission matrix + negative scenarios | UI and backend permission gaps identified/owned |
| W6-D2 | Duy | auth/role/partnerAccess middleware/service + tests | wrong role/partner/branch; public register privileged role; DB unchanged | targeted authz logs + before/after DB | no privilege/branch bypass; STAFF invariant enforced |
| W6-H2 | Huy | Prisma schema/migrations/seed/fixtures | validate/generate; empty DB; W5-copy; invariant SQL | migration logs, counts, queries | no data loss/drift; constraints/backfill valid |
| W6-V2 | Vinh | OTP register/verify/resend/reset UI/tests | reload/resend/cooldown/recovery; fake SMTP; build | component/integration output + checklist | no OTP plaintext; no email enumeration; clear recovery |
| W6-T2 | Tùng | Partner apply/approval/Staff UI | pending/rejected/approved; Owner vs Staff; deactivation | role navigation tests + screenshots | Staff no Owner-only action; stale role cache cleared |
| W6-D3 | Duy | Partner commission report UI/components/tests | API-mock component tests; sample backend numbers | screenshots + test + sample reconciliation | API-derived; Owner-only; estimated/mock wording |
| W6-H3 | Huy | checkout/orders/inventory/wallet/payOS | parallel checkout/wallet; duplicate/late signed webhook | PostgreSQL concurrency logs + DB assertions | no oversell/double debit/issue; exactly-once fulfillment |
| W6-V3 | Vinh | checkout return/reload/cancel/timeout UI | fake provider states; bounded polling; reload | frontend test/build + state matrix | return URL not PAID; no duplicate order; correct refetch |
| W6-T3 | Tùng | branch redeem/payment ops UI | wrong branch, duplicate, refunded state, stale UI | cross-role tests + audit sample | no consume on deny; status matches API/DB |
| W6-D4 | Duy | security checklist, logs, audit/requestId | inspect failed requests/logs; rate-limit/negative controls | redacted log/audit samples + finding disposition | no sensitive leak; critical mutations traceable; P0/P1 closed |
| W6-H4 | Huy | refund/outbox/reconcile/jobs/tickets backend | run jobs twice; SMTP fail; refund/redeem race | integration output + runbook notes | retry-safe; no duplicate; email failure not rollback core |
| W6-V4 | Vinh | Customer voucher/refund/ticket/notification UI | lifecycle state transitions; safe errors; responsive build | tests + 375/768/1280 screenshots | refund states disable voucher; no stack/provider leakage |
| W6-T4 | Tùng | Admin refund/ticket/audit/report UI | manual refund semantics; audit detail; commission sample | frontend tests + API/DB reconciliation | no fake auto-refund; actor/action/target clear; report correct |
| W6-D5 | Duy | gate report, risk/waiver, handoff | sample canonical flows; evidence index vs SHA | GO/NO-GO + frozen SHA + W7 handoff | P0/P1=0; four owners same SHA; no production-ready claim |
| W6-H5 | Huy | whole repo/platform evidence | canonical command set ×2; clean worktree | two full run logs + migration/concurrency index | no flaky required test/build/config/schema drift |
| W6-V5 | Vinh | Customer regression evidence | clean session OTP→checkout→voucher→refund/ticket/notification | matrix + tests/build/screenshots exact SHA | flow pass; no auth/poll loop; responsive pass |
| W6-T5 | Tùng | Partner/Admin/Staff regression evidence | clean role sessions; branch/redeem/refund/audit | matrix + API/DB evidence exact SHA | no bypass/duplicate; UI status matches API/DB |

---

## 9. Traceability from current integration findings

| Finding | Owning task | Minimum regression |
|---|---|---|
| Fixture user defaults to `PENDING_VERIFICATION` | H1/H2, D2 review | ACTIVE fixture succeeds; pending/locked intentionally denied |
| Partner tests missing PartnerMember | H1/H2 | approved Partner + ACTIVE OWNER/STAFF fixture; inactive denied |
| Redeem direct test uses old signature | H1/H3, D2 review | service/API use access context; wrong branch DB unchanged |
| OTP advisory lock uses query API | H2/H4 | reset-password OTP transaction passes PostgreSQL |
| Vitest may collect `tests-node` | H1 | collection output proves isolation in local and CI |
| Migration must pass empty and W5-copy | H2 | deploy/seed + before/after invariants |
| Late/duplicate payOS webhook | H3 | signed replay/late cases; one fulfillment/audit |
| Refund timestamp mismatch risk | H3/H4 | `paidAt` boundary tests and UI API-driven eligibility |
| Commission missing from Partner UI | D3/T4 | API sample reconciliation + Owner-only component test |

---

## 10. Evidence naming and result format

Recommended filenames:

```text
w6_acceptance_docs/W6H1/outcome.md
w6_acceptance_docs/W6H1/commands.log
w6_acceptance_docs/W6H1/test-vitest.txt
w6_acceptance_docs/W6H1/test-node.txt
w6_acceptance_docs/W6H1/build.txt
```

Every test result starts with:

```text
TASK_ID=
BRANCH=
SHA=
STARTED_AT=
COMMAND=
ENVIRONMENT=
EXIT_CODE=
```

Screenshots alone không thay thế test output/DB assertion cho security, migration, transaction hoặc concurrency.

---

## 11. W6-D1 walkthrough checklist

- [ ] Huy xác nhận platform/schema/money ownership và command baseline.
- [ ] Vinh xác nhận Customer UI boundaries và handoff states.
- [ ] Tùng xác nhận Partner/Admin/Staff boundaries và permission matrix.
- [ ] Duy xác nhận stop-the-line, risk priorities và security gates.
- [ ] Cả bốn ghi cùng integration SHA.
- [ ] B-01…B-10 có owner/deadline, không có blocker vô chủ.

**W6-D1 deliverable status:** `COMPLETE — pending team acknowledgement only`.
