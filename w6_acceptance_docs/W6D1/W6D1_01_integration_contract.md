# W6-D1 — Integration Contract

**Task:** W6-D1 — Integration contract & risk triage  
**Owner:** Duy — Team Lead / Security  
**Sprint window:** 2026-07-28 → 2026-08-01  
**W5 frozen baseline:** `e016793` (`pre-w5-w7-strong-fix`)  
**W6 integration branch:** `integration/w6-w7`  
**Outcome:** thống nhất một nguồn sự thật, cách merge, ranh giới ownership, thứ tự đóng defect và yêu cầu evidence cho toàn bộ W6.

---

## 1. Source of truth

### 1.1. Code source of truth

1. W5 frozen baseline là commit `e016793`; chỉ dùng để so sánh, phục hồi hoặc chứng minh tương thích.
2. Mọi thay đổi W6 được tích hợp trên `integration/w6-w7` hoặc nhánh candidate được tạo từ đúng SHA của nhánh này.
3. Không merge trực tiếp từ working tree chưa sạch. Trước mỗi handoff phải ghi:

```bash
git status --short
git rev-parse --abbrev-ref HEAD
git rev-parse HEAD
git diff --check
```

4. SHA trong evidence phải trùng SHA được kiểm thử. Log của SHA khác không được dùng để ký gate.
5. `main` không phải nguồn sự thật trong lúc W6 đang sửa đồng thời; chỉ cập nhật sau W6-D5 GO.

### 1.2. Requirements source of truth

Thứ tự ưu tiên khi có mâu thuẫn:

1. W6 sprint plan đã chốt.
2. Quyết định trong `W6D1_03_risk_register_decision_log.md`.
3. Business invariant đang được bảo vệ bằng schema, service và test.
4. Tài liệu W5 đã freeze.
5. UI hiện có hoặc ghi chú cũ.

Không dùng một màn hình đang chạy hoặc một test cũ làm lý do hạ cấp invariant bảo mật/dữ liệu mới.

### 1.3. Data source of truth

- PostgreSQL + Prisma schema/migration là nguồn sự thật của dữ liệu.
- Frontend state chỉ là cache; sau mutation nhạy cảm phải refetch từ server.
- Authorization phải kiểm tra server-side. Ẩn menu không phải là kiểm soát truy cập.
- Trạng thái thanh toán, số dư, voucher phát hành, redeem và refund phải được xác nhận từ DB/provider adapter; return URL không tự xác nhận thành công.

---

## 2. In-scope W6

- Clean install và env contract.
- Tách đúng Vitest với Node Test Runner.
- Prisma validate/generate/migrate/seed trên DB trống và bản sao dữ liệu W5.
- Compatibility fix sau khi thêm OTP, PartnerMember/Staff/branch, wallet, payOS, refund, ticket, notification/outbox, reconciliation và audit.
- RBAC/branch hardening và direct API/URL negative tests.
- Idempotency, transaction, row-level locking và concurrency cho checkout/redeem/payment/refund.
- Partner commission summary hiển thị dữ liệu API với nhãn estimated/mock.
- Regression evidence và frozen SHA để bàn giao W7.

## 3. Explicitly out of scope

Không mở mới các feature sau trong W6:

- payout thật;
- partial refund hoặc chargeback;
- KYB thật;
- Redis/RabbitMQ;
- WebSocket/push notification;
- booking;
- loyalty/referral;
- AI recommendation;
- HA/multi-region;
- redesign toàn bộ UI hoặc rewrite module đang hoạt động.

Mọi đề xuất ngoài danh sách W6 phải ghi backlog W7+; không code trong nhánh integration nếu chưa có quyết định của Duy.

---

## 4. Merge protocol

### 4.1. Quy tắc bắt buộc

1. Merge theo module, không copy/paste cả thư mục.
2. Đọc diff W5 ↔ source bổ sung trước khi resolve conflict.
3. Một shared hotspot chỉ có một writer tại một thời điểm.
4. Không dùng `git reset --hard`, `git checkout -- .`, force-push hoặc ghi đè thay đổi teammate trên nhánh integration.
5. Không xóa/skip test để lấy xanh.
6. Không sửa migration đã chạy ở môi trường dùng chung; tạo forward migration mới.
7. Mỗi commit chỉ giải quyết một nhóm invariant/defect có thể review.
8. Mỗi PR/handoff phải nêu: cause, files, commands, result, DB side effect, remaining risk.

### 4.2. Trình tự tích hợp

| Thứ tự | Gate | Owner chính | Điều kiện để mở bước tiếp theo |
|---|---|---|---|
| 1 | Baseline, install, test-runner inventory | Huy | clean install; xác định rõ suite nào thuộc Vitest/Node |
| 2 | Schema/migration/seed compatibility | Huy + Duy review | DB trống và W5-copy migrate không mất dữ liệu |
| 3 | RBAC/PartnerMember/branch invariants | Duy | direct API negative tests pass |
| 4 | Customer/Partner route compatibility | Vinh/Tùng | không blank page; status/error mapping đúng |
| 5 | Payment, checkout, redeem concurrency | Huy | no oversell/double debit/double issue/redeem |
| 6 | Commission UI và operational UI | Duy/Tùng | đúng quyền, đúng đơn vị, nhãn estimated |
| 7 | Refund/outbox/reconcile/support | Huy | idempotent, retry-safe, không rollback nghiệp vụ chính vì SMTP |
| 8 | Security acceptance + regression ×2 | Duy/Huy | P0/P1 = 0, evidence cùng SHA |

### 4.3. Conflict resolution rule

Khi hai thay đổi cùng chạm một file:

- Owner file đọc cả hai intent và tạo một bản hợp nhất có test.
- Không chọn “ours/theirs” cho toàn file nếu file chứa nhiều module.
- Nếu conflict liên quan schema, authorization hoặc money state, dừng merge và cần Duy + Huy đồng duyệt.
- Nếu conflict chỉ là UI presentation, owner UI quyết định nhưng phải giữ API contract và role guard.

---

## 5. Compatibility contract

### 5.1. User status

- User tạo trực tiếp trong integration test cần khai báo trạng thái phù hợp với scenario.
- Fixture cần đăng nhập/thao tác phải có `status: 'ACTIVE'`.
- Không đổi default production chỉ để làm test cũ pass.
- Test OTP/verification phải chủ động dùng trạng thái pending và chứng minh transition.

### 5.2. Partner membership and branch

- Partner operation yêu cầu Partner được duyệt và PartnerMember đang ACTIVE.
- OWNER có phạm vi Partner; STAFF có phạm vi branch theo invariant đã chốt.
- STAFF không có branch hợp lệ phải bị từ chối rõ ràng hoặc được backfill trước khi constraint có hiệu lực.
- Tất cả mutation Partner/Staff nhận actor/access từ middleware/service authoritative, không tin `partnerId`/`branchId` do client tự khai.

### 5.3. Redeem service contract

- Test/service caller phải dùng chữ ký hiện tại có `access` object.
- Không thêm overload tương thích ngược làm giảm kiểm soát quyền chỉ để giữ test cũ.
- Wrong branch, wrong partner, duplicate redeem và refunded voucher đều phải có negative test và DB before/after assertion.

### 5.4. Payment and refund

- Checkout phải idempotent và dùng transaction/locking trên PostgreSQL thật.
- Duplicate hoặc late payOS webhook không được issue voucher/audit/debit lần hai.
- Return URL không phải bằng chứng thanh toán.
- Refund eligibility dùng cùng mốc `paidAt`; không dùng `createdAt` hoặc timestamp frontend.
- Refund phải khóa/hủy quyền sử dụng voucher trước khi ghi nhận hoàn tiền.

### 5.5. OTP, secrets and logs

- `pg_advisory_xact_lock()` là lệnh không trả result set; implementation phải dùng Prisma API phù hợp cho execute, không deserialize bằng query API.
- Không log OTP, password, JWT, reset token, voucher code, SMTP/payOS secret hoặc raw provider payload chứa dữ liệu nhạy cảm.
- Error UI chỉ hiển thị message/code an toàn và request reference; không hiển thị stack trace.

### 5.6. Commission report

- UI lấy `revenue/gross`, `commissionRate`, `platformFee`, `estimatedPartnerRevenue` từ API.
- Không hardcode rate ở frontend.
- Chỉ Partner Owner đúng tenant được xem.
- Dùng từ “estimated/mô phỏng”; không gọi là payout hoặc số tiền đã thanh toán.

---

## 6. Stop-the-line criteria

Dừng merge/release candidate ngay khi có một trong các dấu hiệu:

- migration xóa/mất/đổi sai dữ liệu W5;
- privilege hoặc branch bypass;
- double debit, double voucher issue, double redeem, double refund;
- oversell trong concurrent checkout;
- OTP/token/secret/voucher code xuất hiện trong log hoặc response;
- required test suite đỏ;
- test runner nhặt sai suite hoặc bỏ sót suite;
- evidence không khớp frozen SHA;
- external provider thật làm deterministic regression flaky.

Chỉ Duy được gỡ stop-the-line sau khi có root cause, fix, test hồi quy và evidence.

---

## 7. Handoff contract cho từng owner

Mỗi owner tạo evidence theo task của mình, tối thiểu gồm:

```text
w6_acceptance_docs/<TASK-ID>/
├── outcome.md
├── commands.log
├── test-results.txt
├── changed-files.txt
└── evidence/                 # screenshot, SQL result hoặc request/response đã redact
```

`outcome.md` phải có:

- SHA và branch;
- mục tiêu;
- root cause;
- file thay đổi;
- command đã chạy;
- pass/fail/skip và lý do;
- DB side effects;
- acceptance đạt/chưa đạt;
- remaining risk;
- handoff tiếp theo.

Không lưu secret, token, OTP, password, voucher code thật hoặc dữ liệu cá nhân trong evidence.

---

## 8. W6-D1 acceptance

- [x] Có source-of-truth và merge protocol.
- [x] Có thứ tự xử lý defect theo dependency.
- [x] Có ranh giới in-scope/out-of-scope.
- [x] Có stop-the-line và evidence contract.
- [x] Known blockers được đưa vào risk register với owner/deadline.
- [x] Mỗi W6 task được trace tới file area và test/evidence trong acceptance matrix.
- [ ] Team walkthrough: Duy, Huy, Vinh, Tùng xác nhận trên cùng integration SHA.

**W6-D1 status:** `READY FOR TEAM WALKTHROUGH`.
