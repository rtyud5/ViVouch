# W6-D1 — Merge & File Ownership Map

**Mục tiêu:** chặn sửa chồng, xác định single writer cho shared hotspot và trace từng khu vực code tới owner/reviewer/test.

## 1. Ownership principles

- **Primary owner** là người duy nhất merge/resolve conflict trong khu vực đó.
- **Contributor** có thể sửa trên feature branch nhưng phải handoff diff cho primary owner nếu chạm shared hotspot.
- **Mandatory reviewer** phải duyệt khi thay đổi tác động security, schema hoặc money state.
- Ownership theo invariant/module, không theo người “đã sửa file gần nhất”.

## 2. Top-level repository map

| Path / area | Primary owner | Reviewer | W6 purpose |
|---|---|---|---|
| `w6_acceptance_docs/W6D1/**` | Duy | Team | integration contract, ownership, risks, commands, acceptance |
| `.github/workflows/**` | Huy | Duy | tách test runners, deterministic CI, PostgreSQL service |
| `scripts/verify-evidence.mjs` và evidence tooling | Huy | Duy | evidence cùng SHA, không bỏ sót suite |
| `backend/prisma/**` | Huy | Duy | schema, migration, seed, W5 compatibility |
| `backend/src/middlewares/**` | Duy | Huy | auth/RBAC/PartnerMember/branch security |
| `backend/src/modules/auth/**` | Duy cho security contract; Huy cho DB/OTP implementation | Duy + Huy | OTP, register/reset, status enforcement, rate limit |
| `backend/src/modules/partners/**`, membership/branch access | Duy cho authorization; Huy cho persistence | Duy + Huy | OWNER/STAFF/branch invariant |
| `backend/src/modules/orders/**`, checkout/cart/inventory | Huy | Duy | idempotency, locking, no oversell |
| `backend/src/modules/payments/**`, wallet/payos | Huy | Duy | exactly-once fulfillment, late/duplicate webhook |
| `backend/src/modules/vouchers/**`, redeem | Huy implementation; Duy authorization review | Duy + Huy | issue/redeem atomicity và branch scope |
| `backend/src/modules/refunds/**` | Huy | Duy | paidAt eligibility, voucher lock, idempotent refund |
| `backend/src/modules/{tickets,notifications,email-outbox,audit}/**` | Huy | Duy | operational consistency, redaction, requestId |
| `backend/src/jobs/**` | Huy | Duy | outbox/reconcile retry/idempotency |
| `backend/tests/**` shared fixtures/helpers | Huy | Duy | cập nhật fixture W6, PostgreSQL integration/concurrency |
| `backend/tests/**` authorization negative tests | Duy | Huy | wrong role/partner/branch, no mutation |
| `backend/tests-node/**` | Huy | Duy | Node Test Runner suite riêng |
| `frontend/src/features/auth/**`, customer identity pages | Vinh | Duy | OTP/register/reset compatibility |
| `frontend/src/features/{cart,checkout,payments,wallet}/**` | Vinh | Huy | checkout recovery, polling, refetch |
| `frontend/src/features/{vouchers,refunds,tickets,notifications}/**` Customer | Vinh | Huy | post-purchase lifecycle |
| `frontend/src/features/partner/**` Owner/Staff/branch/redeem | Tùng | Duy | permission-aware Partner operations |
| `frontend/src/features/admin/**` | Tùng | Duy | approval/refund/ticket/audit operations |
| Partner commission report page/components/tests | Duy | Tùng + Huy | gross/rate/fee/estimated revenue, Owner-only |
| `frontend/src/routes/**` | Tùng cho Partner/Admin; Vinh cho Customer; Duy final merge | Duy | route guards và direct URL behavior |
| `frontend/src/services/**` shared API client/interceptors | Vinh primary | Duy + Huy | 401/403/409/429 mapping, requestId, no localhost |
| `frontend/src/stores/**`, providers/query setup | Vinh primary | Duy | role/status cache invalidation, server refetch |
| `frontend/src/tests/**` hoặc component tests | Feature owner | Duy/Huy tùy invariant | UI acceptance |
| `frontend/tests-node/**` | Huy runner config; feature owner test content | Duy | Node suite tách khỏi Vitest |
| `backend/package*.json` | Huy | Duy | backend scripts/dependencies |
| `frontend/package*.json`, Vite/Vitest config | Huy | Vinh | frontend scripts/test exclusions/build |
| `docker-compose.yml`, deployment/runbooks | Huy | Duy | reproducible local PostgreSQL/runtime |
| Root architecture/docs (`README`, `TREE`, `walkthrough`) | Duy | module owner | cập nhật sau khi code/test đã đúng |

> Tên module cụ thể có thể khác nhẹ trong cây source; ownership áp dụng theo chức năng và glob tương ứng, không tạo module song song chỉ để né ownership.

## 3. Shared hotspots — single-writer lock

| Hotspot | Single writer | Required reviewers | Lock rule |
|---|---|---|---|
| `backend/prisma/schema.prisma` | Huy | Duy | chỉ merge sau data/invariant decision |
| `backend/prisma/migrations/**` | Huy | Duy | forward-only; không sửa migration đã dùng chung |
| seed/fixture factories | Huy | Duy | một canonical fixture cho ACTIVE user + PartnerMember |
| auth middleware | Duy | Huy | không nới production rule để làm test cũ pass |
| partner access middleware/service | Duy | Huy | server derives tenant/branch scope |
| checkout/payment fulfillment transaction | Huy | Duy | review transaction boundary + unique constraints |
| redeem transaction | Huy | Duy | review row lock + branch authorization |
| refund state transition | Huy | Duy | paidAt, voucher lock, idempotency |
| `backend/src/app.js` / route registration | Huy | Duy | feature owner không tự sửa trực tiếp cùng lúc |
| frontend root route table | Duy final merge | Vinh + Tùng | route owner gửi isolated diff |
| shared API client | Vinh | Duy + Huy | không thay global behavior cho một màn hình riêng |
| frontend package lock/config | Huy | Vinh | gom dependency/config change vào một commit |
| CI workflow | Huy | Duy | không bỏ suite hoặc giảm gate để lấy xanh |

## 4. Task-to-owner merge lanes

### Duy

| Task | Write area | Không được tự ý chạm |
|---|---|---|
| W6-D1 | `w6_acceptance_docs/W6D1/**` | feature implementation ngoài integration contract |
| W6-D2 | auth/RBAC/partnerAccess middleware/service + negative tests | schema/migration nếu chưa phối hợp Huy |
| W6-D3 | Partner commission report UI/tests | backend finance formula nếu API contract đã đúng |
| W6-D4 | security checklist/evidence, audit/log review | thay logic feature không có regression test |
| W6-D5 | gate report, risk/waiver, frozen SHA | sửa feature sau freeze trừ stop-the-line fix |

### Huy

| Task | Write area | Handoff |
|---|---|---|
| W6-H1 | package scripts, Vitest config, CI, env baseline | command matrix + runner evidence |
| W6-H2 | Prisma schema/migrations/seed/fixture | empty DB + W5-copy migration evidence |
| W6-H3 | checkout, wallet, payOS, idempotency/concurrency tests | Duy security/money review |
| W6-H4 | refund, outbox, reconcile, jobs, support backend | Vinh/Tùng API state matrix |
| W6-H5 | full regression ×2, clean worktree, freeze SHA | Duy gate package |

### Vinh

| Task | Write area | Handoff |
|---|---|---|
| W6-V1 | Customer routes/API compatibility | route/shared-client conflict to Duy/Vinh owner |
| W6-V2 | OTP/register/reset UI/tests | auth API mismatch to Duy/Huy |
| W6-V3 | wallet/payOS return/reload/cancel/timeout UX | payment state mapping to Huy |
| W6-V4 | voucher/refund/ticket/notification UI | operational API mismatch to Huy |
| W6-V5 | Customer frozen-SHA regression evidence | Duy gate |

### Tùng

| Task | Write area | Handoff |
|---|---|---|
| W6-T1 | permission matrix và portal smoke | bypass finding to Duy |
| W6-T2 | Partner apply/approval/Staff UI/tests | auth/branch backend to Duy/Huy |
| W6-T3 | branch redeem/payment operations UI/tests | redeem/payment backend to Huy/Duy |
| W6-T4 | Admin refund/ticket/audit + commission validation | report discrepancy to Duy/Huy |
| W6-T5 | Partner/Admin/Staff frozen-SHA regression | Duy gate |

## 5. Known overlap resolution

### 5.1. W6-D2 ↔ W6-H2

- Huy owns schema/migration mechanics.
- Duy owns security invariant and acceptance test.
- Schema proposal được ghi trước; Huy implement; Duy review negative/backfill behavior.

### 5.2. W6-D3 ↔ W6-T4

- Duy code commission summary.
- Tùng không sửa cùng component; Tùng xác nhận role, API/DB sample, đơn vị và wording.
- Backend discrepancy giao Huy; không sửa bằng phép tính frontend.

### 5.3. W6-H3 ↔ W6-V3/T3

- Huy định nghĩa canonical payment/order/voucher states.
- Vinh/Tùng chỉ map UI theo contract.
- UI không tự chuyển PAID hoặc redeem success khi backend chưa xác nhận.

### 5.4. W6-H4 ↔ W6-V4/T4

- Huy chịu trách nhiệm state transition và idempotency.
- Vinh/Tùng chịu trách nhiệm presentation/operations.
- Nếu UI và DB khác nhau, DB/service contract thắng; tạo defect thay vì workaround local state.

## 6. Merge checklist cho mỗi PR/handoff

- [ ] Branch tạo từ integration SHA đã ghi.
- [ ] `git diff --check` sạch.
- [ ] Không có file ngoài ownership hoặc đã ghi reviewer.
- [ ] Không commit `.env`, secret, log chứa PII/token/OTP/voucher code.
- [ ] Targeted test pass.
- [ ] Full relevant suite/build pass.
- [ ] Migration/transaction test chạy trên PostgreSQL khi liên quan DB.
- [ ] `changed-files.txt` khớp diff.
- [ ] Evidence ghi exact SHA.
- [ ] Remaining risk và dependency được handoff.

## 7. Ownership disputes

Khi ownership chưa rõ:

1. Dừng sửa file shared.
2. Xác định invariant bị tác động.
3. Áp bảng top-level: security → Duy; persistence/platform/money → Huy; Customer UI → Vinh; Partner/Admin UI → Tùng.
4. Duy ghi quyết định mới vào decision log trước khi merge.

**Status:** ownership map đã đủ để bắt đầu H1/V1/T1 mà không sửa chồng.
