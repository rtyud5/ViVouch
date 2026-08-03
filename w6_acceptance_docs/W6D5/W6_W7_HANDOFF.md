# W6 → W7 Handoff

**Handoff owner:** Duy  
**Audit baseline:** `f45323eb99f77d60504da487892da1522e08e6a9`  
**W6 gate:** **NO-GO pending inherited remediation**

## 1. W7 entry decision

W7 chưa được bắt đầu theo nghĩa “quality/release sprint chính thức” cho tới khi:

- P0/P1 của `W6_RISK_WAIVER_REGISTER.md` bằng 0.
- Huy, Vinh và Tùng hoàn thành các mục bắt buộc trong `W6_INHERITED_REMEDIATION_FOR_W7.md`.
- Bốn owner ký cùng một full SHA.
- Exact-SHA CI/regression, W5-copy migration và hai canonical smoke có evidence.

Các correction nói trên vẫn mang nhãn **W6 inherited remediation**. Không tính chúng vào 20 task W7 và không dùng chúng làm bằng chứng hoàn thành W7.

## 2. Baseline capabilities đã có

- React 18/Vite frontend, Express/Prisma/PostgreSQL backend.
- OTP/SMTP flow, Partner Owner/branch-scoped Staff, wallet và payOS flow.
- Checkout idempotency, concurrency tests, duplicate webhook protection.
- Refund/support/notification/outbox/reconciliation/audit flows.
- Branch-scoped redeem và server-side RBAC tests.
- Commission summary API/UI và disclaimer mô phỏng.
- CI workflow với PostgreSQL 16, migrations, seed, backend/frontend tests và build.
- Sonar workflow có quality-gate wait khi secrets được cấu hình.

## 3. Exact command contract cho candidate cuối

### Backend

```bash
cd backend
npm ci --ignore-scripts
npx --no-install prisma validate
npx --no-install prisma generate
npx --no-install prisma migrate deploy
npm run prisma:seed
npm run test:unit:node
npm test
npm audit --omit=dev --audit-level=high
```

### Frontend

```bash
cd frontend
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build
npm audit --omit=dev --audit-level=high
```

### Repository checks

```bash
git status --short
git diff --check
node scripts/static-quality.mjs
node scripts/verify-evidence.mjs
```

**Yêu cầu:** chạy toàn bộ contract hai lần trên candidate cuối. Mỗi run phải ghi full SHA, start/end time, exit code, pass/fail/skip count và artifact URL.

## 4. W5-copy migration drill

1. Tạo database mới từ bản sao W5 hoặc restore W5 backup.
2. Ghi schema version và row count cho các bảng trọng yếu: users, partners, branches, vouchers, voucher_codes, orders, payments, wallets, refund_requests và audit_logs (tên thật theo schema).
3. Chạy `prisma migrate deploy`.
4. Chạy seed chỉ theo deterministic/update-safe policy; không xóa dữ liệu cũ.
5. Chạy invariant queries:
   - STAFF hợp lệ có branch hoặc bị từ chối theo invariant đã chốt.
   - Unique/FK/index không vi phạm.
   - Tổng order/payment/voucher code không giảm ngoài thay đổi có giải thích.
   - Không có orphan records.
6. Chạy targeted RBAC, checkout/concurrency, payOS webhook, redeem, refund/jobs tests.
7. Lưu log redacted và before/after counts vào artifact.

## 5. Canonical W6 closure smokes

### Customer — Vinh

- Register → verify OTP → login.
- Browse/cart → checkout bằng wallet/fake-payOS deterministic.
- Reload/return/cancel/timeout không tạo order mới và không tự xác nhận PAID.
- Order/payment/voucher/wallet state khớp API/DB.
- Request refund; voucher chuyển REFUND_PENDING/REFUNDED và không dùng được.
- Tạo ticket; kiểm tra notification/outbox outcome.
- Kiểm tra no auth/polling loop và viewport 375/768/1280.

### Partner/Admin/Staff — Tùng

- Partner apply → Admin approve → Owner tạo Staff và gán branch.
- Owner-only action bị chặn với Staff.
- Wrong partner/branch/direct URL/API không mutate DB.
- Redeem đúng branch thành công; duplicate/wrong/refund-state bị chặn.
- Admin refund/ticket/audit UI khớp API/DB.
- Commission summary đúng Partner, đúng đơn vị và có disclaimer mô phỏng.

### Security acceptance — Duy

- Kiểm tra log/artifact không có OTP/password/token/voucher code/provider secret/PII nhạy cảm.
- Lấy mẫu requestId → structured log → audit record.
- Xác nhận denied mutation không gây DB side effect.
- Đóng W6-SEC-04 khi H4/V4/T4 evidence đã gắn index.

## 6. W7 scope sau khi W6 GO

W7 mới xử lý:

- Required CI policy, coverage artifacts và Sonar evidence trung thực.
- One-command isolated E2E runner.
- Customer canonical E2E và Partner/Admin/Staff cross-role E2E.
- Security E2E, liveness/readiness và operational signals.
- Staging SMTP/payOS manual smoke.
- Backup/restore sang DB mới, post-restore smoke và rollback decision tree.
- Frozen exact-SHA release candidate và demo rehearsal.

## 7. Không được claim

- Không claim production-ready, enterprise-ready, HA hoặc multi-region.
- Không claim payout thật, automated payOS refund, partial refund/chargeback hoặc KYB thật.
- Không claim Sonar/coverage pass nếu không có remote quality-gate/coverage artifact.
- Không claim 4-owner sign-off nếu SHA không trùng tuyệt đối.

## 8. Handoff record template

```text
W6_FINAL_SHA=<40-char SHA>
W6_GATE=GO
CI_RUN_1=<url>
CI_RUN_2=<url>
W5_COPY_MIGRATION=<artifact url>
CUSTOMER_SIGNOFF=<artifact url>
OPS_SIGNOFF=<artifact url>
SECURITY_SIGNOFF=<artifact url>
P0=0
P1=0
FROZEN_AT=<ISO-8601 +07:00>
W7_BASE_BRANCH=w7-baseline
```
