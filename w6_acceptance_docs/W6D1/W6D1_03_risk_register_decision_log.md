# W6-D1 — Risk Register, Blockers & Decision Log

**Owner:** Duy  
**Review cadence:** cuối mỗi ngày W6 và ngay khi phát hiện P0  
**Severity:** P0 = stop-the-line; P1 = phải đóng trước freeze; P2 = có thể waiver có owner/deadline.

---

## 1. Known blocker board

| ID | Blocker / observed condition | Sev. | Owner | Deadline | Status at W6-D1 | Exit criteria |
|---|---|---:|---|---|---|---|
| B-01 | Backend regression từng còn 21 test fail sau source merge; fixture W5 thiếu `status: ACTIVE` và `PartnerMember` | P1 | Huy | 2026-07-28 EOD | OPEN | full backend suite 0 required failures; fixture factory canonical; không nới production auth |
| B-02 | `partner-redeem.test.js` còn gọi chữ ký service 3 tham số thay vì contract 4 tham số có `access` | P1 | Huy, Duy review | 2026-07-28 EOD | OPEN | targeted redeem service/API tests pass; wrong branch/no access negative tests pass |
| B-03 | OTP advisory lock dùng Prisma query API cho hàm PostgreSQL trả `void` | P1 | Huy | 2026-07-29 noon | OPEN | dùng execute API phù hợp; reset-password OTP test pass; không bỏ advisory lock |
| B-04 | Vitest có nguy cơ nhặt `tests-node`; package scripts/CI chưa chứng minh chạy tách hai runner | P1 | Huy | 2026-07-28 EOD | OPEN | backend/frontend Vitest và Node runner có command riêng; mỗi suite chỉ chạy đúng test của nó; CI gọi cả hai |
| B-05 | Migration/seed chưa có evidence trên DB trống và bản sao W5 | P0 nếu mất dữ liệu | Huy | 2026-07-29 EOD | OPEN | validate/generate/deploy/seed pass trên cả hai DB; invariant queries và row-count evidence |
| B-06 | STAFF–branch invariant/backfill chưa được chốt bằng schema + server authorization + negative tests | P0 | Duy + Huy | 2026-07-29 EOD | OPEN | STAFF thiếu/sai branch bị từ chối; dữ liệu cũ được backfill hoặc quarantine; no bypass |
| B-07 | Late/duplicate payOS webhook sau local timeout có thể làm state hoặc fulfillment lặp | P0 | Huy | 2026-07-30 EOD | OPEN | signed duplicate/late webhook tests; exactly-once voucher/audit; terminal state không bị hồi sinh sai |
| B-08 | Refund window có nguy cơ dùng timestamp không thống nhất | P1 | Huy | 2026-07-30 EOD | OPEN | server dùng `paidAt`; boundary tests; UI chỉ hiển thị eligibility từ API |
| B-09 | Commission backend có dữ liệu nhưng Partner UI chưa hiển thị đủ/đúng nghĩa | P2 | Duy | 2026-07-30 EOD | OPEN | gross/rate/fee/estimated revenue từ API; Owner-only; rounding/wording tests |
| B-10 | Walkthrough/evidence hiện có có thể không cùng SHA với candidate cuối | P0 at gate | Duy | 2026-08-01 before GO | OPEN | 4 owner sign-off cùng SHA; command/test/migration evidence ghi exact SHA |

### Blocker handling rule

- P0: dừng merge vào candidate; tạo root-cause record và regression test trước khi mở lại.
- P1: không được mang sang W7 trừ waiver bằng văn bản của Duy với deadline cụ thể.
- P2: có thể waiver nếu không ảnh hưởng security/data/money và đã có owner/date.

---

## 2. Risk register

| Risk ID | Scenario | Sev. | Likelihood | Primary control | Detection / evidence | Owner | State |
|---|---|---:|---|---|---|---|---|
| R-001 | Copy/paste source bổ sung ghi đè fix W5 | P0 | Medium | module-by-module merge; single writer; W5 diff review | changed-files + focused diff | Duy | ACTIVE |
| R-002 | Migration làm mất hoặc biến đổi sai dữ liệu W5 | P0 | Medium | forward-only migration; backup/copy; backfill trước constraint | before/after counts, invariant SQL, migration logs | Huy | ACTIVE |
| R-003 | Schema drift giữa local, CI và DB copy W5 | P1 | Medium | `prisma validate/generate/migrate deploy`; clean DB | generated client + migration status | Huy | ACTIVE |
| R-004 | User test fixture bị `ACCOUNT_LOCKED`, team sửa bằng cách nới auth production | P0 | Medium | sửa fixture/scenario, giữ default/invariant | auth negative tests + fixture review | Duy/Huy | ACTIVE |
| R-005 | Partner có record nhưng không có ACTIVE PartnerMember | P1 | High | canonical Partner factory + migration/backfill | fixture scan + partner tests | Huy | ACTIVE |
| R-006 | STAFF hoặc Owner truy cập sai tenant/branch qua direct API | P0 | High | server derives access; deny by default; branch constraint | 403 + DB unchanged assertions | Duy | ACTIVE |
| R-007 | Chỉ ẩn menu nhưng direct URL/API vẫn dùng được | P0 | Medium | backend authorization là lớp chính | cross-role URL/API test | Duy/Tùng | ACTIVE |
| R-008 | Redeem caller dùng contract cũ hoặc bỏ qua access object | P1 | High | một service signature; caller/test update | unit/API compile/runtime tests | Huy/Duy | ACTIVE |
| R-009 | Concurrent checkout oversell inventory | P0 | Medium | transaction + row-level lock + invariant check | PostgreSQL parallel test | Huy | ACTIVE |
| R-010 | Retry checkout tạo order/debit/voucher mới | P0 | Medium | idempotency key + unique constraint + replay result | repeated request assertions | Huy | ACTIVE |
| R-011 | Duplicate payOS webhook fulfillment/audit lần hai | P0 | High | verified signature, provider event/order uniqueness, atomic fulfillment | duplicate webhook integration test | Huy | ACTIVE |
| R-012 | Late PAID webhook sau timeout/cancel làm corrupt terminal state | P0 | Medium | explicit state machine; allowed transition table | late callback cases + DB trace | Huy | ACTIVE |
| R-013 | Network/provider call nằm trong DB transaction gây lock dài | P1 | Medium | separate provider I/O from short DB transaction; reconcile | timing/log review + concurrency test | Huy | ACTIVE |
| R-014 | Refund dựa `createdAt` thay vì `paidAt` | P1 | Medium | one server-side eligibility function | boundary tests around paidAt | Huy | ACTIVE |
| R-015 | Refund hoàn tiền trước khi khóa/hủy voucher | P0 | Medium | atomic state transition / reservation before refund action | refund/redeem race test | Huy/Duy | ACTIVE |
| R-016 | Outbox/reconcile/job chạy lặp tạo duplicate notification/refund | P1 | Medium | idempotent job keys, status/attempt controls | run job twice assertions | Huy | ACTIVE |
| R-017 | SMTP failure rollback registration/order/refund business action | P1 | Medium | outbox; email is secondary side effect | forced SMTP failure test | Huy | ACTIVE |
| R-018 | OTP/token/password/voucher code/secret lộ trong logs/evidence | P0 | Medium | redaction, allow-list logging, sanitized evidence | log grep + failed-request inspection | Duy | ACTIVE |
| R-019 | Prisma `$queryRaw` cố deserialize `void` advisory lock | P1 | High | execute API for lock statement | OTP reset targeted test | Huy | ACTIVE |
| R-020 | Vitest chạy nhầm `tests-node` hoặc Node suite không chạy | P1 | High | explicit include/exclude + separate scripts/CI steps | test collection output | Huy | ACTIVE |
| R-021 | External SMTP/payOS làm regression flaky | P1 | Medium | deterministic adapters/fakes in CI; one manual smoke separate | repeated suite ×2 | Huy | ACTIVE |
| R-022 | Frontend polling vô hạn hoặc reload tạo idempotency key mới | P1 | Medium | bounded polling, stable operation key, server refetch | fake provider UI tests | Vinh | ACTIVE |
| R-023 | Role/status cache còn quyền cũ sau approval/deactivation | P0 | Medium | invalidate session/query; server re-check every mutation | role transition test | Vinh/Tùng/Duy | ACTIVE |
| R-024 | Commission UI hardcode rate, sai rounding/đơn vị | P2 | Medium | API fields + shared money formatter + sample reconciliation | component/API mock + DB sample | Duy/Tùng | ACTIVE |
| R-025 | Commission wording khiến hiểu nhầm là payout thật | P2 | Medium | explicit estimated/mock label | copy review/screenshot | Duy | ACTIVE |
| R-026 | UI success state trong khi backend từ chối branch/payment action | P1 | Medium | response-driven UI + refetch | stale-state/manual negative test | Tùng/Vinh | ACTIVE |
| R-027 | Root docs/TREE cũ khiến team sửa nhầm module | P2 | High | code tree + ownership map are authoritative; docs update after freeze | doc diff review | Duy | ACTIVE |
| R-028 | Log/test artifact rải ở source gây nhầm evidence hoặc commit noise | P2 | High | evidence folder convention; `.gitignore`; exact SHA | clean worktree + evidence index | Huy/Duy | ACTIVE |
| R-029 | Required suite được “green” bằng skip/delete/assertion weakening | P0 | Medium | diff review; no new unexplained skip; mutation-sensitive assertions | test diff + skip count | Duy | ACTIVE |
| R-030 | Evidence của run cũ được dùng cho frozen SHA mới | P0 | Medium | SHA header in every artifact; regenerate after freeze | evidence verifier + four-owner sign-off | Duy/Huy | ACTIVE |

---

## 3. Decision log

### ADR-W6-001 — Frozen baseline and integration source

**Decision:** W5 reference baseline là `e016793`; W6 work diễn ra trên `integration/w6-w7`. Candidate chỉ được gọi là frozen sau H5 và được Duy ghi exact SHA trong D5.  
**Reason:** ngăn evidence/merge dựa trên “latest main” thay đổi liên tục.  
**Consequence:** mọi owner phải rebase/merge có chủ đích từ integration branch và ghi SHA.

### ADR-W6-002 — No broad overwrite

**Decision:** cấm copy/paste nguyên module/thư mục để “đồng bộ source”; resolve theo file/invariant và ownership map.  
**Reason:** source bổ sung có breaking changes về status, PartnerMember và service signature; broad overwrite có thể xóa fix W5.  
**Consequence:** changed-files phải nhỏ, reviewable và gắn targeted test.

### ADR-W6-003 — Production invariant wins over legacy tests

**Decision:** không nới auth/partner access production để giữ test W5. Sửa fixture để phản ánh scenario W6 (`ACTIVE`, PartnerMember/Partner state).  
**Reason:** test cũ đang dựa trên default và dữ liệu không còn hợp lệ.  
**Consequence:** tạo canonical fixture factory; test pending/locked phải khai báo có chủ đích.

### ADR-W6-004 — STAFF branch invariant

**Decision:** Partner operation luôn cần ACTIVE membership; STAFF chỉ được thao tác branch được gán. STAFF không có branch phải bị deny rõ hoặc được backfill trước constraint.  
**Reason:** branch scope là security boundary.  
**Consequence:** Huy xử lý data/migration; Duy xử lý middleware/service + negative tests.

### ADR-W6-005 — Separate test runners

**Decision:** Vitest và Node Test Runner có script/include/exclude độc lập ở backend và frontend; CI gọi từng suite thành step riêng.  
**Reason:** collection chéo tạo false failure hoặc bỏ sót test.  
**Consequence:** H1 phải chứng minh collection list và exit code cho từng runner.

### ADR-W6-006 — PostgreSQL is mandatory for transactional evidence

**Decision:** SQLite/mock/in-memory không đủ cho migration, advisory lock, row-level lock, concurrency hoặc unique-race evidence.  
**Reason:** invariant phụ thuộc PostgreSQL semantics.  
**Consequence:** targeted unit có thể mock, nhưng acceptance transaction/concurrency phải chạy PostgreSQL thật.

### ADR-W6-007 — Current redeem service contract only

**Decision:** caller/test dùng contract hiện tại có authoritative `access`; không thêm overload 3-arg để tương thích ngược.  
**Reason:** overload có thể bỏ qua security context.  
**Consequence:** cập nhật test và tất cả direct callers.

### ADR-W6-008 — Payment fulfillment exactly once

**Decision:** return URL không cập nhật PAID; signed webhook/reconcile là nguồn xác nhận. Fulfillment phải atomic, idempotent và có unique guard.  
**Reason:** duplicate/late callback là behavior bình thường của provider.  
**Consequence:** duplicate/late/concurrent tests là gate P0.

### ADR-W6-009 — Refund clock and ordering

**Decision:** refund window tính từ `paidAt`. Voucher được khóa/hủy quyền dùng trước hoặc cùng atomic transition với refund request.  
**Reason:** `createdAt` không phản ánh thời điểm tiền đã thu; redeem/refund race gây double value.  
**Consequence:** một eligibility service dùng chung cho UI/API/job; boundary/race test.

### ADR-W6-010 — External side effects via retry-safe boundary

**Decision:** SMTP/provider failure không rollback business transaction đã commit; dùng outbox/reconcile/retry có idempotency.  
**Reason:** external systems không cùng transaction với PostgreSQL.  
**Consequence:** regression dùng fake adapter; manual smoke tách khỏi deterministic gate.

### ADR-W6-011 — Commission is estimated, not payout

**Decision:** Partner UI hiển thị gross revenue, commission rate, platform fee và estimated Partner revenue từ API; dán nhãn mô phỏng.  
**Reason:** payout thật ngoài scope.  
**Consequence:** không tạo payout ledger/action; role Owner-only và sample reconciliation.

### ADR-W6-012 — Evidence is part of acceptance

**Decision:** một fix không hoàn tất nếu thiếu exact SHA, command, result, changed files và remaining risk.  
**Reason:** báo cáo miệng hoặc screenshot không trace được không đủ cho gate.  
**Consequence:** D5 từ chối sign-off nếu evidence khác SHA hoặc thiếu test relevant.

---

## 4. Waiver format

Chỉ dùng cho P2 hoặc P1 được Duy chấp thuận đặc biệt:

```text
Waiver ID:
Risk/Task:
Reason cannot close in W6:
Impact:
Compensating control:
Owner:
Hard deadline:
Evidence/link:
Approved by Duy:
```

Không waiver P0 liên quan data loss, authorization bypass, double money/value, secret leak hoặc evidence mismatch.

## 5. Daily triage order

1. P0 security/data/money.
2. Runner/migration blockers làm mất khả năng tin vào test.
3. Breaking compatibility fixture/signature.
4. Customer/Partner operational UX.
5. P2 wording/docs/cleanup.

**Risk posture at W6-D1:** `CONDITIONAL GO` cho H1/V1/T1; chưa đủ điều kiện freeze hoặc claim staging-ready cho đến khi B-01…B-10 được đóng theo gate.
