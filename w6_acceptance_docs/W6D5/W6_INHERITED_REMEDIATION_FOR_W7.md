# W6 Inherited Remediation — Công việc bắt buộc hoàn tất trước khi chính thức bắt đầu W7

**Người điều phối và duyệt cuối:** Duy — Team Lead / Security  
**Đối tượng thực hiện:** Huy, Vinh, Tùng  
**Nguồn yêu cầu:** W6-D5 — `W6 GO/NO-GO & W7 handoff`  
**Baseline của lần rà soát ban đầu:** `f45323eb99f77d60504da487892da1522e08e6a9`  
**Trạng thái hiện tại:** `W6 = NO-GO` cho đến khi toàn bộ mục bắt buộc trong tài liệu này được Duy duyệt `ACCEPTED`

---

## 1. Đọc phần này trước khi làm

### 1.1. Tại sao có tài liệu này?

W6 không chỉ yêu cầu “code đã merge” hoặc “máy của một thành viên chạy được”. W6-D5 yêu cầu team chứng minh rằng phiên bản cuối của W6:

- cài đặt và chạy lại được từ môi trường sạch;
- migrate/seed được trên PostgreSQL;
- không làm hỏng dữ liệu kế thừa từ W5;
- backend tests, frontend tests và build đều đạt;
- Customer flow và Partner/Admin/Staff flow hoạt động trên cùng một phiên bản;
- không còn lỗi P0/P1;
- Duy, Huy, Vinh và Tùng cùng ký xác nhận trên **một commit SHA duy nhất**.

Qua rà soát hiện tại, code có nhiều phần đã chạy và đã có test, nhưng evidence của Huy, Vinh và Tùng đang nằm trên các SHA khác nhau, một số hạng mục chưa chạy đủ backend/PostgreSQL hoặc chưa có retained evidence. Vì vậy W6 chưa đủ điều kiện đóng.

### 1.2. Đây có phải task W7 không?

**Không.** Đây là phần W6 chưa đạt và phải được sửa dưới nhãn W6.

- Không đổi tên các correction trong tài liệu này thành `W7-H1`, `W7-V1`, `W7-T1`.
- Không tính các correction này vào 20 task của W7.
- Có thể thực hiện trong thời gian lịch đã bước sang W7, nhưng khi báo cáo vẫn phải ghi rõ `W6 inherited remediation`.
- Chỉ khi Duy đổi gate từ `NO-GO` thành `GO — staging-ready core` thì team mới chính thức tính tiến độ W7.

### 1.3. Hai giai đoạn bắt buộc

Mỗi thành viên phải hiểu rõ hai giai đoạn sau:

#### Giai đoạn A — Sửa phần W6 còn thiếu

Mỗi thành viên:

1. cập nhật `main` mới nhất;
2. tạo branch correction riêng;
3. sửa code/test/tài liệu thuộc phần mình;
4. chạy targeted tests;
5. mở Pull Request;
6. xử lý review và merge vào `main`.

Ở giai đoạn này, SHA của mỗi branch có thể khác nhau. Đây **chưa phải sign-off cuối**.

#### Giai đoạn B — Ký xác nhận trên frozen SHA chung

Sau khi tất cả correction PR đã merge:

1. Duy lấy SHA mới nhất của `main` và công bố là **frozen candidate SHA**;
2. từ thời điểm freeze, không merge thêm code ngoài defect bắt buộc;
3. Huy, Vinh và Tùng checkout đúng SHA đó để chạy regression/sign-off;
4. nếu có test fail và phải sửa code, SHA cũ không còn giá trị; Duy phải freeze SHA mới và các sign-off liên quan phải chạy lại;
5. Duy chỉ đóng W6 khi bốn owner cùng xác nhận đúng full 40-character SHA.

### 1.4. “Evidence” là gì?

Evidence là bằng chứng để một thành viên khác có thể xác minh kết quả, không phải lời nhắn “đã test rồi”. Evidence hợp lệ gồm:

- full commit SHA 40 ký tự;
- lệnh đã chạy;
- thời gian bắt đầu/kết thúc;
- exit code;
- số test pass/fail/skip;
- GitHub Actions run URL hoặc artifact URL;
- ảnh/trace/log cần thiết đã xóa secret và PII;
- kết quả DB/API trước và sau thao tác quan trọng;
- kết luận acceptance criterion nào đạt/chưa đạt;
- remaining risk nếu còn.

Evidence không hợp lệ:

- ảnh không có SHA hoặc không rõ đang chạy branch nào;
- log của commit cũ;
- link dạng `file:///C:/...` hoặc `file:///D:/...`;
- link chỉ mở được trên máy người tạo;
- chỉ chạy frontend rồi kết luận toàn bộ hệ thống đạt;
- build xanh nhưng không chạy tests;
- sửa bằng cách xóa, skip hoặc nới lỏng test để lấy màu xanh;
- log chứa OTP, token, password, voucher code, SMTP/payOS secret hoặc PII đầy đủ.

---

## 2. Quy trình Git chung cho tất cả thành viên

### 2.1. Trước khi tạo branch correction

```bash
git checkout main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
```

Yêu cầu:

- `git status --short` phải sạch trước khi bắt đầu;
- lưu kết quả `git rev-parse HEAD` vào báo cáo với tên `BASE_SHA`;
- không reset, force-push hoặc ghi đè thay đổi của thành viên khác;
- không làm correction trực tiếp trên `main`.

### 2.2. Branch đề xuất

```bash
# Huy
git checkout -b fix/w6-huy-platform-remediation

# Vinh
git checkout -b fix/w6-vinh-customer-remediation

# Tùng
git checkout -b fix/w6-tung-ops-remediation
```

Tên branch có thể điều chỉnh theo quy ước team, nhưng PR title phải chứa `W6 remediation`.

### 2.3. Kiểm tra trước khi push

```bash
git status --short
git diff --check
git diff --stat
git rev-parse HEAD
```

Mỗi PR phải ghi rõ:

- nguyên nhân correction;
- file thay đổi;
- test đã chạy;
- pass/fail/skip;
- DB side effects;
- evidence path hoặc Actions URL;
- phần chưa làm được và lý do;
- có làm thay đổi API/schema/state machine hay không.

### 2.4. Quy tắc khi phát hiện defect mới

Nếu trong quá trình chạy correction phát hiện lỗi code:

1. tạo issue hoặc ghi defect ID trong PR;
2. mô tả cách tái hiện;
3. thêm regression test có thể fail trước khi sửa, khi khả thi;
4. sửa nguyên nhân gốc, không chỉ che lỗi UI;
5. chạy lại targeted test và full relevant suite;
6. ghi remaining risk;
7. báo Duy nếu defect thuộc P0/P1 để dừng freeze.

---

# 3. HUY — Backend / Platform

## Mục tiêu của Huy

Huy phải chứng minh nền tảng backend/database của W6 có thể tái lập, migration không phá dữ liệu W5, test runner chạy đúng, full regression chạy lặp lại và W6 evidence validator thực sự kiểm tra tài liệu W6.

## Kết quả bàn giao tổng của Huy

Huy phải bàn giao đủ:

1. PR sửa evidence validator và test cho validator;
2. bằng chứng migrate trên database trống;
3. bằng chứng migrate trên bản sao W5;
4. backend/frontend canonical regression chạy hai lần trên frozen SHA;
5. retained evidence cho refund, outbox, reconcile và support/jobs;
6. W6-H5 sign-off trên đúng frozen SHA.

---

## HUY-W6-FIX-01 — Cập nhật W6 evidence validator

### A. Vấn đề hiện tại

`scripts/verify-evidence.mjs` hiện chỉ kiểm tra:

```text
w5_acceptance_docs/W5D5
```

Do đó CI có thể báo evidence pass dù:

- file W6 bị thiếu;
- W6 có link local `file:///...`;
- link tương đối bị hỏng;
- sign-off không có full SHA;
- file evidence rỗng hoặc placeholder;
- bốn file root W6-D5 không tồn tại.

Đây là lỗi ở release tooling, không phải chỉ thiếu tài liệu.

### B. Phạm vi phải sửa

Cập nhật `scripts/verify-evidence.mjs` để:

1. vẫn kiểm tra W5 hiện có, không phá compatibility;
2. kiểm tra các W6 evidence roots đang tồn tại, ví dụ `w6_acceptance_docs/`;
3. kiểm tra bốn file root:
   - `W6_D5_GATE_REPORT.md`;
   - `W6_RISK_WAIVER_REGISTER.md`;
   - `W6_W7_HANDOFF.md`;
   - `W6_INHERITED_REMEDIATION_FOR_W7.md`;
4. fail khi phát hiện:
   - relative link trỏ tới file không tồn tại;
   - `file:///`, đường dẫn Windows tuyệt đối hoặc đường dẫn máy cá nhân;
   - media file rỗng hoặc sai signature;
   - file evidence bắt buộc rỗng;
   - SHA placeholder như `<SHA>`, `TBD`, `TODO` trong sign-off cuối;
   - SHA sign-off không đủ 40 ký tự, nếu trường đó đã được đánh dấu là final;
5. in lỗi có đường dẫn file và nguyên nhân dễ hiểu;
6. không phụ thuộc hệ điều hành hoặc ổ đĩa của người chạy.

### C. Test bắt buộc cho validator

Tạo test hoặc fixture tự động để chứng minh ít nhất các trường hợp:

| Case | Input cố ý | Kết quả mong đợi |
|---|---|---|
| EV-01 | Link tương đối hợp lệ | Exit code 0 |
| EV-02 | Link tới file không tồn tại | Exit code khác 0 |
| EV-03 | Link `file:///D:/...` | Exit code khác 0 |
| EV-04 | PNG rỗng/sai signature | Exit code khác 0 |
| EV-05 | Thiếu một file root W6 bắt buộc | Exit code khác 0 |
| EV-06 | Final sign-off có SHA ngắn/placeholder | Exit code khác 0 |
| EV-07 | W5 và W6 cùng hợp lệ | Exit code 0 |

Có thể đặt test tại vị trí phù hợp với repo, ví dụ `scripts/tests/verify-evidence.test.mjs`, hoặc tạo fixture chạy qua Node Test Runner. Không hardcode đường dẫn máy cá nhân.

### D. Lệnh kiểm tra tối thiểu

```bash
node scripts/verify-evidence.mjs
node scripts/static-quality.mjs
```

Nếu có test riêng:

```bash
node --test scripts/tests/*.test.mjs
```

Sau đó cố ý tạo một broken link trong fixture để chứng minh validator fail, rồi revert fixture và chạy lại để chứng minh green.

### E. File dự kiến thay đổi

- `scripts/verify-evidence.mjs`;
- test/fixture mới cho validator;
- `.github/workflows/ci.yml` nếu cần gọi test validator mới;
- tài liệu evidence có link hỏng mà Huy phát hiện trong phạm vi review.

### F. Acceptance criteria

- CI không còn chỉ kiểm tra W5;
- broken W6 link làm job evidence fail;
- link local `file:///` bị chặn;
- W5 evidence vẫn pass;
- output lỗi đủ rõ để người tạo tài liệu biết phải sửa file nào;
- không cần secret hoặc external service để chạy validator.

### G. Bàn giao riêng cho task này

Huy gửi:

```text
TASK=HUY-W6-FIX-01
PR_URL=<url>
COMMIT_SHA=<40-char SHA của PR head>
FILES_CHANGED=<list>
VALID_CASE_COMMAND=<command>
VALID_CASE_RESULT=PASS
INTENTIONAL_FAILURE_COMMAND=<command>
INTENTIONAL_FAILURE_RESULT=EXPECTED_FAIL
CI_RUN_URL=<url>
REMAINING_RISK=<none hoặc mô tả>
```

---

## HUY-W6-FIX-02 — Chứng minh migration từ W5-copy

### A. Vấn đề hiện tại

CI hiện dựng PostgreSQL mới, chạy `prisma generate`, `prisma migrate deploy` và seed. Điều đó chứng minh clean database có thể khởi tạo, nhưng chưa chứng minh database đang chứa schema/data W5 có thể nâng cấp mà không mất dữ liệu hoặc vi phạm constraint mới.

### B. Mục tiêu

Tạo một migration drill có thể tái lập, gồm:

1. database nguồn đại diện cho cuối W5;
2. bản sao/restore vào database test riêng;
3. snapshot số lượng và invariant trước migrate;
4. chạy migration W6;
5. snapshot lại sau migrate;
6. chạy targeted integration/concurrency tests;
7. lưu evidence đã redacted.

### C. Chuẩn bị môi trường

Không chạy trực tiếp trên database dùng chung hoặc database production/staging.

Ví dụ dùng PostgreSQL local từ repo:

```bash
docker compose up -d
docker compose ps
```

Tạo database riêng, ví dụ:

```text
voucher_platform_w5_copy
```

Cập nhật `DATABASE_URL` tạm thời cho terminal chạy drill. Không commit credential thật vào repo.

### D. Xác định nguồn W5

Huy phải ghi rõ nguồn nào được dùng:

- backup cuối W5 do team lưu;
- database dump từ W5 frozen SHA;
- hoặc quy trình dựng W5 schema/data từ W5 commit nếu không có dump.

Nếu team không có W5 backup, không được tự ghi “W5-copy migration pass”. Phải ghi blocker và phối hợp Duy xác nhận nguồn thay thế hợp lệ.

### E. Snapshot trước migrate

Khuyến nghị tạo script tái sử dụng, ví dụ:

```text
scripts/w6-snapshot-invariants.mjs
```

Script nên đọc bằng Prisma hoặc SQL read-only và xuất JSON/Markdown gồm:

- schema/migration version hiện có;
- row count các entity trọng yếu theo tên thật trong schema:
  - users;
  - partners;
  - branches;
  - voucher/voucher campaigns;
  - voucher codes;
  - orders;
  - payments;
  - wallets/wallet transactions;
  - refund requests;
  - tickets;
  - notifications/outbox;
  - audit logs;
- các invariant:
  - Staff hợp lệ có partner/branch theo rule đã chốt;
  - không có branch trỏ tới partner không tồn tại;
  - không có order/payment/voucher-code orphan;
  - unique key quan trọng không trùng;
  - tổng số business records không âm/bất thường;
  - enum/state cũ có thể map sang state mới.

Không đưa email, token, voucher code đầy đủ hoặc dữ liệu cá nhân vào artifact. Chỉ lưu count, ID đã mask hoặc aggregate.

### F. Chạy migration

Tại backend:

```bash
npm ci --ignore-scripts
npx --no-install prisma validate
npx --no-install prisma generate
npx --no-install prisma migrate deploy
```

Seed chỉ được chạy nếu seed hiện tại là deterministic/update-safe đối với database có dữ liệu. Nếu seed có nguy cơ xóa/reset dữ liệu, Huy phải:

- không chạy seed trên W5-copy;
- ghi rõ lý do;
- hoặc sửa seed để idempotent/upsert an toàn và thêm test.

Không được dùng `prisma migrate reset` cho W5-copy.

### G. Snapshot sau migrate

Chạy lại cùng script snapshot và lập bảng before/after:

| Entity/Invariant | Before | After | Delta | Giải thích |
|---|---:|---:|---:|---|
| Users |  |  |  |  |
| Partners |  |  |  |  |
| Branches |  |  |  |  |
| Orders |  |  |  |  |
| Payments |  |  |  |  |
| Voucher codes |  |  |  |  |
| Refund requests |  |  |  |  |
| Orphans |  |  |  | Phải bằng 0 |
| Invalid Staff-branch |  |  |  | Phải bằng 0 hoặc có backfill được giải thích |

Mọi delta khác 0 phải có nguyên nhân rõ ràng, ví dụ backfill field mới hoặc seed thêm fixture. Không được bỏ qua record giảm mà không giải thích.

### H. Targeted tests sau migration

Sau migrate W5-copy, chạy các nhóm liên quan:

- authentication/RBAC;
- Partner Owner/Staff/branch scope;
- checkout/idempotency/concurrency;
- wallet/payOS webhook duplicate/late cases;
- redeem wrong branch/duplicate/refund state;
- refund/outbox/reconcile/jobs;
- audit log.

Dùng test files thực tế trong repo. Có thể tìm bằng:

```bash
git ls-files 'backend/**/*test*' | grep -Ei 'auth|rbac|branch|checkout|concurr|payment|payos|redeem|refund|outbox|reconcil|audit|job'
```

Sau targeted tests, chạy full backend suite:

```bash
npm run test:unit:node
npm test
```

### I. Acceptance criteria

- `prisma validate`, `generate`, `migrate deploy` đều exit code 0;
- không dùng reset/drop để làm migration pass;
- không mất dữ liệu W5 ngoài delta được Duy duyệt;
- không có orphan/constraint violation;
- Staff-branch invariant đạt hoặc có backfill migration rõ ràng;
- targeted tests và full backend tests đạt;
- artifact không chứa dữ liệu nhạy cảm;
- procedure có thể được thành viên khác chạy lại.

### J. Bàn giao riêng cho task này

Tạo hoặc cập nhật evidence, đề xuất:

```text
w6_acceptance_docs/W6H5/
├── W6H5_migration_w5_copy.md
├── W6H5_before_snapshot.json
├── W6H5_after_snapshot.json
└── W6H5_commands.md
```

Log lớn có thể để trong GitHub Actions artifact; file Markdown trong repo chỉ lưu link, checksum và summary.

Mẫu gửi Duy:

```text
TASK=HUY-W6-FIX-02
SOURCE_W5=<backup/commit/dump source>
BASE_SHA=<40-char SHA trước correction>
TESTED_SHA=<40-char SHA>
DATABASE=<local isolated name, không chứa credential>
BEFORE_SNAPSHOT=<repo path/artifact url>
MIGRATION_COMMAND=npx --no-install prisma migrate deploy
MIGRATION_EXIT_CODE=0
AFTER_SNAPSHOT=<repo path/artifact url>
DATA_LOSS=NO
UNEXPLAINED_DELTA=0
TARGETED_TEST_RESULT=<pass/fail/skip>
FULL_BACKEND_RESULT=<pass/fail/skip>
REMAINING_RISK=<none hoặc mô tả>
```

---

## HUY-W6-FIX-03 — Retained evidence cho H4: refund, outbox, reconcile và support/jobs

### A. Vấn đề hiện tại

Duy chưa thể đóng security/release acceptance vì phần H4 chưa có bộ retained evidence đủ rõ, cùng SHA và có thể truy vết.

### B. Kịch bản bắt buộc

#### H4-01 — Email/SMTP failure không rollback nghiệp vụ chính

- tạo một nghiệp vụ chính thành công có phát sinh email/outbox;
- mô phỏng email adapter thất bại;
- xác nhận transaction nghiệp vụ chính vẫn commit theo thiết kế;
- outbox/email job chuyển trạng thái retry/dead-letter phù hợp;
- chạy lại worker và xác nhận không tạo business record trùng.

#### H4-02 — Outbox chạy lặp không gửi/tạo record trùng

- chạy cùng worker/job hai lần;
- assert cùng message/event không tạo duplicate notification/email record ngoài chính sách retry;
- ghi số record trước/sau.

#### H4-03 — Reconcile job idempotent

- chuẩn bị order/payment cần reconcile;
- chạy reconcile lần 1;
- chạy lại lần 2 với cùng dữ liệu;
- assert lần 2 không duplicate fulfillment, voucher issue, wallet transaction hoặc audit event.

#### H4-04 — Refund lock/cancel trước khi hoàn tiền

- tạo order/voucher đủ điều kiện refund;
- gửi refund request;
- xác nhận voucher chuyển state khóa/cancel theo rule trước hoặc đồng thời với bước hoàn tiền;
- thử redeem trong `REFUND_PENDING`/`REFUNDED` và phải bị chặn;
- xác nhận duplicate refund không tạo thêm wallet/payment side effect.

#### H4-05 — Support/ticket state consistency

- Customer tạo ticket;
- Admin/ops cập nhật ticket;
- assert actor, target, requestId và state transition hợp lệ;
- unauthorized role/direct API không mutate ticket.

### C. Evidence tối thiểu mỗi kịch bản

- setup/fixture;
- request hoặc command;
- expected result;
- actual result;
- DB before/after aggregate;
- requestId/audit sample đã mask;
- test file hoặc run URL;
- exact SHA.

### D. Acceptance criteria

- job chạy hai lần vẫn idempotent;
- SMTP failure không làm rollback nghiệp vụ ngoài thiết kế;
- refund không double-credit/double-state-transition;
- reconcile không duplicate fulfillment;
- support mutation có authorization và audit;
- không có secret/PII trong logs.

### E. Bàn giao

```text
TASK=HUY-W6-FIX-03
TESTED_SHA=<40-char SHA>
H4_01=<artifact/test url>
H4_02=<artifact/test url>
H4_03=<artifact/test url>
H4_04=<artifact/test url>
H4_05=<artifact/test url>
PASS=<count>
FAIL=0
SKIP=0 hoặc documented non-required skip
DB_SIDE_EFFECTS=<summary>
REMAINING_RISK=<none hoặc mô tả>
```

---

## HUY-W6-FIX-04 — Full regression ×2 và W6-H5 final sign-off

### A. Thời điểm thực hiện

Task này chỉ chạy **sau khi**:

- PR correction của Huy, Vinh, Tùng đã merge;
- Duy công bố frozen SHA;
- không còn PR correction đang chờ merge vào candidate.

### B. Checkout exact frozen SHA

```bash
git fetch origin
git checkout --detach <FROZEN_SHA>
git rev-parse HEAD
git status --short
```

Kết quả `git rev-parse HEAD` phải trùng tuyệt đối `<FROZEN_SHA>` và worktree phải sạch.

### C. Canonical command set — backend

Chạy trên PostgreSQL 16 isolated:

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

### D. Canonical command set — frontend

```bash
cd ../frontend
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build
npm audit --omit=dev --audit-level=high
```

### E. Repository checks

```bash
cd ..
git status --short
git diff --check
node scripts/static-quality.mjs
node scripts/verify-evidence.mjs
```

### F. Yêu cầu chạy hai lần

Chạy toàn bộ command contract thành **Run 1** và **Run 2** trên cùng SHA, dùng database test được reset/dựng lại theo procedure an toàn giữa hai run.

Mỗi run ghi:

- exact SHA;
- start/end time;
- environment;
- command;
- exit code;
- pass/fail/skip count;
- artifact URL;
- DB setup/teardown;
- worktree status.

Không được chỉ rerun job fail riêng lẻ rồi gọi là regression ×2.

### G. Acceptance criteria

- hai run độc lập đều green;
- required fail = 0;
- required skip = 0;
- không có flaky test buộc rerun để xanh;
- test runner Node/Vitest không nhặt chéo;
- build pass;
- evidence validator pass;
- worktree sạch;
- toàn bộ evidence khớp frozen SHA.

### H. Final sign-off của Huy

```text
OWNER=Huy
TASK=W6-H5
FROZEN_SHA=<40-char SHA>
RUN_1_URL=<url>
RUN_2_URL=<url>
W5_COPY_MIGRATION=<artifact url>
BACKEND_PASS=<count>
FRONTEND_PASS=<count>
FAIL=0
SKIP=0
BUILD=PASS
EVIDENCE_VALIDATOR=PASS
P0=0
P1=0
SIGNED_AT=<ISO-8601 +07:00>
VERDICT=ACCEPTED_FOR_W6_STAGING_READY_CORE
```

---

# 4. VINH — Customer Experience

## Mục tiêu của Vinh

Vinh phải chứng minh Customer lifecycle hoạt động với frontend, backend và PostgreSQL thật/isolated; UI phục hồi đúng khi lỗi; responsive được kiểm tra thực tế; và V2–V4 có evidence truy vết, không chỉ dựa trên code review hoặc frontend build.

## Kết quả bàn giao tổng của Vinh

Vinh phải bàn giao đủ:

1. Customer canonical integration matrix;
2. API/DB assertions cho các state quan trọng;
3. payment recovery/reload/cancel/timeout evidence;
4. error handling matrix 401/403/409/429/5xx/network;
5. responsive evidence 375/768/1280;
6. evidence index cho V2, V3, V4;
7. W6-V5 sign-off trên frozen SHA.

---

## VINH-W6-FIX-01 — Customer canonical integration flow

### A. Vấn đề hiện tại

V5 trước đây chủ yếu chứng minh frontend tests/build. Backend và DB side effects chưa được chạy trong cùng canonical flow, nên chưa thể kết luận toàn bộ Customer lifecycle đạt.

### B. Môi trường bắt buộc

- backend đang chạy với PostgreSQL test/isolated;
- frontend trỏ đúng `VITE_API_BASE_URL`;
- email dùng `TEST`/fake mailbox deterministic cho required regression;
- payment dùng wallet hoặc fake payOS deterministic cho required regression;
- không dùng credential production;
- dùng browser profile/session sạch.

### C. Customer scenario matrix

#### CUS-01 — Register và verify OTP

1. mở trang đăng ký bằng session sạch;
2. đăng ký Customer mới;
3. lấy OTP từ fake mailbox/test adapter, không từ log plaintext;
4. verify OTP;
5. đăng nhập;
6. reload sau verify và xác nhận không bị auth loop.

Assert:

- user được tạo đúng role Customer;
- public register không thể tự chọn Admin/Partner Owner/Staff;
- OTP hết hạn/sai/quá số lần thử trả lỗi an toàn;
- resend cooldown hoạt động;
- UI không hiển thị OTP plaintext;
- log/screenshot không chứa OTP/token đầy đủ.

#### CUS-02 — Browse, cart và checkout

1. browse voucher còn bán;
2. thêm vào cart;
3. kiểm tra quantity/price từ server;
4. checkout bằng wallet hoặc fake payment deterministic;
5. refresh/reload tại bước đang xử lý.

Assert:

- server tính lại giá/tồn kho;
- reload không tạo order thứ hai;
- idempotency key không bị tạo lại sai trong cùng attempt;
- concurrent/duplicate submit không double debit;
- order/payment/wallet/voucher outcome khớp API và DB.

#### CUS-03 — Payment return/cancel/timeout/unknown

Chạy riêng các case:

| Case | Hành động | Kết quả mong đợi |
|---|---|---|
| PAY-01 | Return URL khi provider chưa xác nhận | UI không tự đánh dấu PAID |
| PAY-02 | Cancel URL | Order/payment phản ánh trạng thái server, không tự issue voucher |
| PAY-03 | Reload nhiều lần | Không tạo order/payment mới |
| PAY-04 | Local timeout nhưng webhook đến muộn | UI refetch và hiển thị final server state |
| PAY-05 | Duplicate webhook | Không issue voucher/audit/wallet side effect lần hai |
| PAY-06 | Network chập chờn | Retry bounded, không polling vô hạn |

Vinh chịu trách nhiệm UI/recovery evidence; Huy chịu backend concurrency/webhook tests. Hai người phải dùng cùng state contract.

#### CUS-04 — Voucher lifecycle

1. mở danh sách voucher đã mua;
2. xem voucher hợp lệ;
3. không để raw code xuất hiện trong log/console/artifact;
4. kiểm tra trạng thái khi voucher chuyển `REFUND_PENDING`, `REFUNDED`, `USED`, `EXPIRED` theo dữ liệu fixture.

Assert:

- voucher refund-pending/refunded không thể sử dụng;
- UI không tự suy diễn eligibility trái với server;
- state stale được refetch sau mutation;
- error không lộ provider payload/stack.

#### CUS-05 — Refund

1. tạo order đủ điều kiện;
2. gửi refund request;
3. kiểm tra mốc eligibility do server trả;
4. kiểm tra trạng thái order/payment/voucher/wallet;
5. thử gửi duplicate request.

Assert:

- không double refund;
- voucher bị khóa theo state;
- UI không hiển thị refund thành công nếu backend từ chối;
- mốc thời gian refund nhất quán với `paidAt`/rule backend;
- request reference an toàn xuất hiện khi lỗi bất ngờ.

#### CUS-06 — Ticket và notification

1. Customer tạo ticket;
2. kiểm tra trạng thái ticket;
3. tạo sự kiện phát sinh notification/outbox;
4. reload/refetch;
5. kiểm tra read/unread nếu có trong scope.

Assert:

- ticket thuộc đúng Customer;
- Customer khác không đọc/sửa được;
- notification không duplicate khi job chạy lại;
- UI không giữ state stale sau update.

### D. API/DB evidence bắt buộc

Với CUS-02 đến CUS-06, không chỉ chụp UI. Cần lưu aggregate hoặc ID đã mask để chứng minh:

- số order tạo ra;
- payment state;
- wallet balance/transaction delta;
- voucher code state;
- refund request state;
- ticket ownership/state;
- notification/outbox count;
- audit/requestId khi phù hợp.

Không commit voucher code thật, token hoặc email đầy đủ.

### E. Test tự động

Nếu canonical flow phát hiện defect, Vinh phải:

- thêm frontend regression test cho mapping/recovery;
- phối hợp Huy thêm backend/integration test nếu nguyên nhân nằm server;
- không chỉ tăng timeout hoặc thêm sleep;
- ưu tiên wait theo UI state/network response.

### F. Acceptance criteria

- CUS-01 đến CUS-06 đạt trên cùng tested SHA;
- không có blank page, auth loop hoặc polling loop;
- reload không tạo duplicate order;
- UI không tự xác nhận payment;
- voucher/refund/ticket/notification state khớp API/DB;
- fail = 0;
- required skip = 0;
- không có secret/PII trong artifact.

### G. Bàn giao

```text
TASK=VINH-W6-FIX-01
TESTED_SHA=<40-char SHA>
ENVIRONMENT=<local isolated/GitHub run>
CUS_01=<PASS + artifact>
CUS_02=<PASS + artifact>
CUS_03=<PASS + artifact>
CUS_04=<PASS + artifact>
CUS_05=<PASS + artifact>
CUS_06=<PASS + artifact>
API_DB_ASSERTIONS=<path/url>
FRONTEND_TEST=<pass/fail/skip>
BACKEND_DEPENDENCY_RUN=<url hoặc Huy evidence ref>
FAIL=0
REMAINING_RISK=<none hoặc mô tả>
```

---

## VINH-W6-FIX-02 — Recovery/error-state matrix

### A. Mục tiêu

Chứng minh UI xử lý lỗi server/network đúng, không báo success giả, không reload vô hạn và không lộ thông tin nhạy cảm.

### B. Case bắt buộc

| ID | Lỗi mô phỏng | Kỳ vọng UI |
|---|---|---|
| ERR-401 | Access token hết hạn/không hợp lệ | Refresh hoặc điều hướng login đúng; không loop |
| ERR-403 | Sai role/owner/branch | Hiển thị forbidden; không mutate local state thành success |
| ERR-409 | Conflict/idempotency/duplicate action | Hiển thị business message; refetch server state |
| ERR-429 | OTP/rate limit | Hiển thị cooldown/retry time hợp lý; không spam request |
| ERR-500 | Internal error | Generic safe message + request reference nếu có |
| ERR-NET | Offline/timeout/network fail | Cho retry có kiểm soát; không polling vô hạn |
| ERR-MALFORMED | Response thiếu field/bất thường | Không crash/blank page; fallback an toàn |

### C. Điều cần kiểm tra trong DevTools/artifact

- không log access token/refresh token;
- không log OTP;
- không log full Axios response chứa PII;
- không log voucher code;
- không lộ stack trace/provider secret ra UI;
- retry count có giới hạn;
- request bị hủy khi component unmount nếu cần;
- success toast chỉ xuất hiện sau server success.

### D. Acceptance criteria

- toàn bộ case trong bảng có actual result;
- không blank page;
- không infinite loop;
- không false success;
- có recovery path rõ;
- evidence đủ để teammate khác tái hiện.

### E. Bàn giao

```text
TASK=VINH-W6-FIX-02
TESTED_SHA=<40-char SHA>
ERR_401=PASS
ERR_403=PASS
ERR_409=PASS
ERR_429=PASS
ERR_500=PASS
ERR_NET=PASS
ERR_MALFORMED=PASS
TRACE_URL=<url>
SCREENSHOT_INDEX=<path/url>
SECRET_PII_REVIEW=PASS
REMAINING_RISK=<none hoặc mô tả>
```

---

## VINH-W6-FIX-03 — Responsive evidence thật tại 375/768/1280

### A. Vấn đề hiện tại

Frontend build hoặc Tailwind compile thành công không chứng minh màn hình sử dụng được trên mobile/tablet/desktop.

### B. Viewport bắt buộc

- `375 × 812` — mobile;
- `768 × 1024` — tablet;
- `1280 × 720` hoặc lớn hơn — desktop.

### C. Màn hình bắt buộc

Tại mỗi viewport, kiểm tra ít nhất:

1. Register/OTP verify;
2. Login/forgot password nếu thuộc V2;
3. Browse/voucher detail/cart;
4. Checkout;
5. Payment result/recovery;
6. My vouchers/voucher detail;
7. Refund request/status;
8. Ticket list/detail/create;
9. Notification area.

### D. Tiêu chí kiểm tra

- không tràn ngang bất thường;
- CTA chính nhìn thấy và bấm được;
- modal/dropdown không vượt viewport;
- form label/error không bị che;
- bảng chuyển thành layout phù hợp hoặc scroll có chủ đích;
- trạng thái loading/empty/error đều hiển thị đúng;
- text/payment amount không bị cắt;
- keyboard focus cơ bản không bị mất;
- console không có uncaught error.

### E. Evidence

Tạo screenshot index có tên nhất quán, ví dụ:

```text
w6_acceptance_docs/W6V5/screenshots/
├── 375-register-otp.png
├── 375-checkout.png
├── 375-payment-recovery.png
├── 375-refund.png
├── 768-checkout.png
├── 768-ticket.png
├── 1280-voucher.png
└── 1280-notification.png
```

Không chụp OTP, token, voucher code hoặc email cá nhân thật. Dùng fixture account.

### F. Acceptance criteria

- ba viewport đều có checklist;
- các màn hình trọng yếu không broken;
- mọi lỗi responsive phát hiện được sửa và có ảnh after-fix;
- console error P0/P1 = 0.

### G. Bàn giao

```text
TASK=VINH-W6-FIX-03
TESTED_SHA=<40-char SHA>
VIEWPORT_375=PASS
VIEWPORT_768=PASS
VIEWPORT_1280=PASS
SCREENSHOT_INDEX=<repo path/artifact url>
CONSOLE_ERROR=0
KNOWN_LOW_SEVERITY_UI_ISSUES=<list hoặc none>
```

---

## VINH-W6-FIX-04 — Traceability và retained evidence cho V2–V4

### A. Mục tiêu

Tạo một index để Duy có thể mở từng acceptance criterion của V2, V3 và V4 và thấy ngay code/test/evidence tương ứng.

### B. Tạo evidence index

Đề xuất:

```text
w6_acceptance_docs/W6V5/W6V2_V4_EVIDENCE_INDEX.md
```

Bảng tối thiểu:

| Task | Acceptance criterion | PR/commit | Files changed | Automated test | Manual/integration evidence | SHA | Status |
|---|---|---|---|---|---|---|---|
| W6-V2 | OTP plaintext không hiển thị |  |  |  |  |  |  |
| W6-V2 | Resend/recovery đúng |  |  |  |  |  |  |
| W6-V2 | Forgot password không enumerate email |  |  |  |  |  |  |
| W6-V3 | Return URL không tự xác nhận PAID |  |  |  |  |  |  |
| W6-V3 | Reload không tạo order mới |  |  |  |  |  |  |
| W6-V3 | Bounded polling/refetch |  |  |  |  |  |  |
| W6-V4 | Refund-pending/refunded không dùng voucher |  |  |  |  |  |  |
| W6-V4 | Eligibility lấy từ server |  |  |  |  |  |  |
| W6-V4 | Error không lộ stack/provider detail |  |  |  |  |  |  |

### C. Quy tắc link

- dùng repository-relative link hoặc GitHub Actions URL;
- không dùng `file:///`;
- không dùng link tới branch sẽ bị xóa nếu artifact quan trọng;
- link phải truy được tới SHA;
- log lớn dùng Actions artifact, không copy toàn bộ vào Markdown.

### D. Acceptance criteria

- không còn acceptance criterion V2–V4 không có owner/evidence;
- evidence cùng candidate SHA hoặc ghi rõ code commit được chứa trong candidate;
- V4 evidence đủ để Duy đóng `W6-SEC-04`;
- validator W6 của Huy pass.

### E. Bàn giao

```text
TASK=VINH-W6-FIX-04
INDEX_PATH=<repo-relative path>
V2_CRITERIA_COVERED=<x/x>
V3_CRITERIA_COVERED=<x/x>
V4_CRITERIA_COVERED=<x/x>
BROKEN_LINKS=0
LOCAL_FILE_LINKS=0
VALIDATOR=PASS
REMAINING_GAP=<none hoặc mô tả>
```

---

## VINH-W6-FIX-05 — W6-V5 final sign-off

### A. Thời điểm

Chỉ thực hiện sau khi Duy công bố frozen SHA.

### B. Checkout exact SHA

```bash
git fetch origin
git checkout --detach <FROZEN_SHA>
git rev-parse HEAD
git status --short
```

### C. Frontend command set

```bash
cd frontend
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build
```

### D. Canonical smoke

Chạy lại tối thiểu:

- CUS-01 → CUS-06;
- ERR-401/403/409/429/500/NET;
- viewport 375/768/1280;
- clean session;
- backend/PostgreSQL đang dùng đúng frozen candidate.

### E. Final sign-off của Vinh

```text
OWNER=Vinh
TASK=W6-V5
FROZEN_SHA=<40-char SHA>
FRONTEND_TEST_URL=<url>
CUSTOMER_CANONICAL_EVIDENCE=<url/path>
API_DB_ASSERTIONS=<url/path>
RESPONSIVE_EVIDENCE=<url/path>
PASS=<count>
FAIL=0
SKIP=0
AUTH_LOOP=0
POLLING_LOOP=0
CONSOLE_P0_P1=0
P0=0
P1=0
SIGNED_AT=<ISO-8601 +07:00>
VERDICT=ACCEPTED_FOR_W6_STAGING_READY_CORE
```

---

# 5. TÙNG — Partner / Admin Operations

## Mục tiêu của Tùng

Tùng phải chứng minh Partner/Admin/Staff flow đúng quyền và branch scope, redeem/refund không duplicate, report/audit UI khớp API/DB, evidence có thể mở trên máy khác, fixture không phụ thuộc thứ tự và refund concurrency có dedicated test.

## Kết quả bàn giao tổng của Tùng

Tùng phải bàn giao đủ:

1. sửa toàn bộ local evidence links;
2. fixture isolation/order-independent tests;
3. dedicated concurrent refund test;
4. retained evidence cho T4;
5. Ops canonical regression trên frozen SHA;
6. W6-T5 final sign-off.

---

## TUNG-W6-FIX-01 — Sửa evidence links không portable

### A. Vấn đề hiện tại

Một số tài liệu sử dụng link kiểu:

```text
file:///D:/...
```

Link này chỉ mở trên máy tác giả. Duy, CI và thành viên khác không thể xác minh.

### B. Việc phải làm

1. tìm toàn bộ local link trong tài liệu W6:

```bash
git grep -nEi 'file:///|[A-Za-z]:[/\\\\]' -- '*.md'
```

2. rà các folder evidence T1–T5;
3. đổi link sang:
   - repository-relative link nếu file nằm trong repo;
   - GitHub Actions artifact URL nếu file lớn;
   - PR/commit permalink nếu là source diff;
4. kiểm tra file target tồn tại và không rỗng;
5. chạy validator W6 sau khi Huy cập nhật.

### C. Quy tắc đặt link

Ví dụ đúng:

```markdown
[Regression matrix](./W6T5_regression_matrix.md)
```

Ví dụ không được dùng:

```markdown
[Evidence](file:///D:/project/evidence.png)
```

### D. Acceptance criteria

- `git grep` không còn local absolute link trong W6 evidence;
- clone sạch trên máy khác mở được link;
- validator pass;
- không làm mất nguồn evidence gốc.

### E. Bàn giao

```text
TASK=TUNG-W6-FIX-01
PR_URL=<url>
TESTED_SHA=<40-char SHA>
FILES_SCANNED=<count>
LOCAL_LINKS_BEFORE=<count>
LOCAL_LINKS_AFTER=0
BROKEN_LINKS=0
VALIDATOR=PASS
```

---

## TUNG-W6-FIX-02 — Tách fixture để test không phụ thuộc thứ tự

### A. Vấn đề hiện tại

Nếu nhiều tests dùng chung Staff, voucher code đã redeem, refund request hoặc order state, test có thể:

- chỉ pass khi chạy theo thứ tự cố định;
- fail khi chạy riêng;
- fail ngẫu nhiên trong CI;
- che duplicate mutation vì state đã bị test trước thay đổi.

### B. Việc phải làm

1. xác định tests dùng shared mutable fixture;
2. mỗi test/scenario tạo dữ liệu riêng có ID/email/code unique;
3. cleanup hoặc transaction rollback phù hợp sau test;
4. không phụ thuộc test trước tạo Partner/Staff/order;
5. không dùng chung voucher code đã consume;
6. không dùng arbitrary sleep để chờ state;
7. chạy test:
   - từng file riêng;
   - toàn suite;
   - lặp nhiều lần;
   - nếu framework hỗ trợ, thay đổi order/seed.

### C. Cách tìm test liên quan

```bash
git ls-files 'backend/**/*test*' 'frontend/**/*test*' | grep -Ei 'partner|staff|branch|redeem|refund|report|audit|admin'
```

### D. Kịch bản chứng minh isolation

| ID | Cách chạy | Kỳ vọng |
|---|---|---|
| ISO-01 | Chạy test redeem riêng | Pass |
| ISO-02 | Chạy test refund riêng | Pass |
| ISO-03 | Chạy test role/branch riêng | Pass |
| ISO-04 | Chạy toàn suite 3 lần | Không flaky |
| ISO-05 | Chạy lại sau DB reset | Kết quả giống nhau |
| ISO-06 | Hai test tạo code/order song song | Không collision unique fixture |

### E. Acceptance criteria

- test chạy riêng và chạy suite đều đạt;
- không shared used-code state;
- không phụ thuộc order;
- teardown không xóa nhầm fixture của test khác;
- không nới lỏng assertion để lấy xanh.

### F. Bàn giao

```text
TASK=TUNG-W6-FIX-02
PR_URL=<url>
TESTED_SHA=<40-char SHA>
TEST_FILES_CHANGED=<list>
RUN_SINGLE_RESULT=<pass/fail>
RUN_SUITE_1=<pass/fail>
RUN_SUITE_2=<pass/fail>
RUN_SUITE_3=<pass/fail>
FLAKY_TEST=0
ORDER_DEPENDENCY=0
REMAINING_RISK=<none hoặc mô tả>
```

---

## TUNG-W6-FIX-03 — Dedicated concurrent refund test

### A. Vấn đề hiện tại

Có dấu hiệu backend đã dùng transaction/lock, nhưng chưa có dedicated test chứng minh hai yêu cầu refund/approve đồng thời không gây double refund hoặc state corruption.

### B. Mục tiêu test

Tạo test chạy trên PostgreSQL thật, không dùng database giả, để gửi hai thao tác refund cạnh tranh vào cùng một order/refund request.

### C. Các case bắt buộc

#### REF-CON-01 — Hai Customer refund requests đồng thời

- cùng order;
- gửi hai request gần như đồng thời;
- kỳ vọng chỉ một request tạo/chuyển state hợp lệ;
- request còn lại nhận conflict/idempotent outcome theo contract;
- chỉ có một refund business record hợp lệ.

#### REF-CON-02 — Hai Admin approve actions đồng thời

- cùng refund request;
- hai Admin action đồng thời;
- kỳ vọng chỉ một transition thắng;
- không double-credit wallet;
- không double-update payment/order;
- không duplicate notification/outbox/audit ngoài thiết kế.

#### REF-CON-03 — Approve và redeem cạnh tranh

- voucher đủ điều kiện trước refund;
- refund chuyển sang pending/approved trong lúc Staff redeem;
- kết quả cuối phải tuân state machine;
- không được vừa redeemed vừa refunded trong trạng thái bất hợp lệ;
- wrong/losing operation không gây DB side effect.

#### REF-CON-04 — Duplicate retry sau response timeout

- giả lập client không nhận response và gửi lại cùng operation/idempotency reference;
- không double refund;
- kết quả retry phản ánh state đã có.

### D. Assertions bắt buộc

Sau mỗi case, assert:

- refund request count/state;
- wallet balance và wallet transaction count;
- order/payment state;
- voucher code state;
- inventory/issued code nếu có liên quan;
- notification/outbox count;
- audit count/action;
- chỉ một winner mutation;
- loser request không mutate DB ngoài audit denied/conflict nếu thiết kế có.

### E. Yêu cầu kỹ thuật

- chạy trên PostgreSQL 16 thật/isolated;
- tạo Promise/concurrent request thật, không gọi tuần tự rồi đặt tên concurrency;
- không dùng SQLite/in-memory substitute;
- không chỉ assert HTTP status; phải assert DB side effects;
- test phải deterministic và cleanup được;
- nếu test phát hiện race, sửa trong service/transaction/constraint, không chỉ disable nút UI.

### F. Acceptance criteria

- bốn case có test hoặc lý do kỹ thuật được Duy duyệt;
- exactly-once state/credit đạt;
- không double refund;
- không invalid redeemed+refunded combination;
- test chạy lặp không flaky;
- full backend suite vẫn pass.

### G. Bàn giao

```text
TASK=TUNG-W6-FIX-03
PR_URL=<url>
TESTED_SHA=<40-char SHA>
TEST_FILE=<path>
POSTGRES_VERSION=16
REF_CON_01=PASS
REF_CON_02=PASS
REF_CON_03=PASS
REF_CON_04=PASS
FULL_BACKEND_SUITE=PASS
DOUBLE_REFUND=0
INVALID_FINAL_STATE=0
REMAINING_RISK=<none hoặc mô tả>
```

---

## TUNG-W6-FIX-04 — Retained evidence cho T4

### A. Mục tiêu

Bổ sung evidence để Duy xác minh Admin ops, ticket/refund/audit UI và Partner commission report đúng với API/DB.

### B. Kịch bản bắt buộc

#### OPS-01 — Partner apply và Admin approval

- Partner apply;
- Admin xem và approve/reject;
- pending/rejected/approved state đúng;
- direct URL/API của pending Partner bị chặn;
- role/status cache được refetch sau thay đổi.

#### OPS-02 — Owner tạo/deactivate Staff và branch scope

- Owner tạo Staff;
- gán branch;
- Staff chỉ thấy action thuộc branch;
- Staff không thấy/thực hiện Owner-only action;
- deactivate Staff rồi xác nhận không đăng nhập/thao tác được;
- direct API wrong branch không mutate DB.

#### OPS-03 — Redeem

- đúng branch: redeem thành công một lần;
- wrong branch: bị chặn và code không bị consume;
- duplicate redeem: idempotent/blocked đúng;
- refund-pending/refunded/expired/used: bị chặn;
- UI không báo success khi backend từ chối.

#### OPS-04 — Admin refund và ticket

- Admin xem refund/ticket;
- state mapping đúng;
- manual payOS refund không được hiển thị như automated provider refund;
- error có request reference an toàn;
- actor/target/requestId có thể truy vết.

#### OPS-05 — Audit

- lấy mẫu critical actions: approve Partner, create/deactivate Staff, redeem, refund, ticket update;
- audit ghi actor/action/target/requestId/branch khi phù hợp;
- không chứa secret/PII/voucher code đầy đủ.

#### OPS-06 — Commission report validation

Đối chiếu UI/API/DB cho một Partner fixture:

- gross revenue;
- commission rate;
- platform fee;
- estimated Partner revenue;
- đơn vị tiền và rounding;
- chỉ Owner đúng Partner xem được;
- có wording `estimated`/`mock`/`mô phỏng`;
- không gọi là payout thật.

### C. Acceptance criteria

- wrong role/branch/direct API không mutate DB;
- redeem không duplicate;
- refund/ticket state UI khớp API/DB;
- audit trace rõ;
- report đúng Partner và không gây hiểu nhầm payout;
- evidence đã redacted;
- cùng tested SHA.

### D. Bàn giao

```text
TASK=TUNG-W6-FIX-04
TESTED_SHA=<40-char SHA>
OPS_01=<artifact url>
OPS_02=<artifact url>
OPS_03=<artifact url>
OPS_04=<artifact url>
OPS_05=<artifact url>
OPS_06=<artifact url>
PRIVILEGE_BYPASS=0
BRANCH_BYPASS=0
DUPLICATE_REDEEM=0
REPORT_RECONCILIATION=PASS
SECRET_PII_REVIEW=PASS
REMAINING_RISK=<none hoặc mô tả>
```

---

## TUNG-W6-FIX-05 — W6-T5 frozen-SHA regression và final sign-off

### A. Thời điểm

Chỉ chạy sau khi Duy công bố frozen SHA.

### B. Checkout exact SHA

```bash
git fetch origin
git checkout --detach <FROZEN_SHA>
git rev-parse HEAD
git status --short
```

### C. Session/fixture yêu cầu

Dùng session riêng cho:

- Admin;
- Partner Owner;
- Branch Staff A;
- Branch Staff B hoặc Staff thuộc branch khác;
- Customer fixture nếu cần tạo order/voucher.

Không dùng session cache chung để chuyển role.

### D. Canonical Ops flow

Chạy lại theo thứ tự:

1. Partner apply;
2. Admin approve;
3. Owner tạo Staff và gán branch;
4. Staff thử Owner-only action và phải bị chặn;
5. redeem đúng branch;
6. redeem wrong branch;
7. duplicate redeem;
8. redeem code refund-pending/refunded;
9. Admin xử lý refund/ticket;
10. kiểm tra audit;
11. kiểm tra commission summary;
12. đối chiếu API/DB sample.

### E. Automated commands liên quan

```bash
cd backend
npm ci --ignore-scripts
npm run test:unit:node
npm test

cd ../frontend
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build
```

Có thể dùng kết quả full run của Huy làm nền tảng, nhưng Tùng vẫn phải chạy/ghi targeted Ops suite và canonical role sessions của mình trên exact SHA.

### F. Acceptance criteria

- no privilege bypass;
- no branch bypass;
- no duplicate consume/refund;
- UI status khớp API/DB;
- audit đúng;
- report đúng Partner/đơn vị/disclaimer;
- fail = 0;
- required skip = 0;
- exact SHA trùng frozen candidate.

### G. Final sign-off của Tùng

```text
OWNER=Tung
TASK=W6-T5
FROZEN_SHA=<40-char SHA>
OPS_AUTOMATED_RUN=<url>
OPS_CANONICAL_EVIDENCE=<url/path>
CONCURRENT_REFUND_TEST=<url/path>
AUDIT_REPORT_EVIDENCE=<url/path>
PASS=<count>
FAIL=0
SKIP=0
PRIVILEGE_BYPASS=0
BRANCH_BYPASS=0
DUPLICATE_CONSUME=0
DUPLICATE_REFUND=0
P0=0
P1=0
SIGNED_AT=<ISO-8601 +07:00>
VERDICT=ACCEPTED_FOR_W6_STAGING_READY_CORE
```

---

# 6. Thứ tự phối hợp và dependency

## 6.1. Có thể làm song song

Các mục sau có thể làm song song trên branch riêng:

- Huy: `HUY-W6-FIX-01`, `HUY-W6-FIX-02`, `HUY-W6-FIX-03`;
- Vinh: `VINH-W6-FIX-01` đến `VINH-W6-FIX-04`;
- Tùng: `TUNG-W6-FIX-01` đến `TUNG-W6-FIX-04`.

## 6.2. Dependency cần lưu ý

- Vinh cần Huy cung cấp backend/PostgreSQL environment và state contract ổn định;
- Tùng cần Huy hỗ trợ PostgreSQL integration environment cho concurrent refund test;
- Tùng chỉ có thể chạy validator hoàn chỉnh sau khi Huy merge `HUY-W6-FIX-01`;
- Duy chỉ đóng `W6-SEC-04` sau khi nhận retained evidence H4, V4 và T4;
- các final sign-off `HUY-W6-FIX-04`, `VINH-W6-FIX-05`, `TUNG-W6-FIX-05` chỉ chạy sau freeze.

## 6.3. Trình tự merge đề xuất

1. Huy merge evidence validator;
2. Tùng sửa link và chạy validator;
3. Huy merge migration/evidence work;
4. Tùng merge fixture/concurrent refund tests;
5. Vinh merge Customer defect fixes/tests/evidence;
6. Huy/Vinh/Tùng merge retained evidence indexes;
7. Duy review security/privacy/evidence;
8. Duy công bố frozen SHA;
9. Huy chạy regression ×2;
10. Vinh và Tùng chạy frozen-SHA canonical sign-off;
11. Duy kiểm tra và quyết định GO/NO-GO.

Thứ tự có thể điều chỉnh theo PR thực tế, nhưng freeze luôn phải diễn ra sau tất cả correction merge.

---

# 7. Cấu trúc evidence đề xuất

Không bắt buộc phải đúng tuyệt đối cấu trúc này, nhưng phải dễ tìm và validator mở được:

```text
w6_acceptance_docs/
├── W6H5/
│   ├── W6H5_outcome.md
│   ├── W6H5_regression_run_1.md
│   ├── W6H5_regression_run_2.md
│   ├── W6H5_migration_w5_copy.md
│   └── W6H4_retained_evidence.md
├── W6V5/
│   ├── W6V5_outcome.md
│   ├── W6V2_V4_EVIDENCE_INDEX.md
│   ├── W6V5_customer_matrix.md
│   ├── W6V5_error_recovery_matrix.md
│   └── screenshots/
└── W6T5/
    ├── W6T5_outcome.md
    ├── W6T5_ops_matrix.md
    ├── W6T4_retained_evidence.md
    └── W6T5_concurrent_refund.md
```

Quy tắc:

- Markdown chỉ chứa summary và link;
- log lớn để trong Actions artifact;
- link phải portable;
- mỗi file ghi exact SHA;
- không commit secret/PII;
- không lưu raw voucher code;
- screenshot phải dùng fixture account.

---

# 8. Mẫu Pull Request cho correction

```markdown
## W6 remediation task

- Owner: <Huy/Vinh/Tung>
- Task IDs: <list>
- Base SHA: `<40-char SHA>`
- Head SHA: `<40-char SHA>`

## Vì sao phải sửa

<Mô tả gap W6 và rủi ro nếu không sửa>

## File thay đổi

- `path/to/file`: <lý do>

## Cách kiểm tra

```bash
<commands>
```

## Kết quả

- Pass: <count>
- Fail: 0
- Skip: 0 hoặc giải thích non-required skip
- Build: PASS/NOT_APPLICABLE
- Database side effects: <summary>

## Evidence

- CI run: <url>
- Artifact: <url>
- Repo evidence: <relative path>

## Security/privacy check

- [ ] Không có OTP/password/token/voucher code/secret/PII
- [ ] Không có local absolute link
- [ ] `git diff --check` pass
- [ ] Evidence validator pass

## Remaining risk

<none hoặc mô tả>
```

---

# 9. Mẫu báo cáo bàn giao correction cho Duy

Mỗi thành viên gửi một message hoặc comment tổng hợp:

```text
OWNER=<Huy|Vinh|Tung>
REMEDIATION_TASKS=<IDs đã hoàn tất>
PR_URLS=<list>
MERGED_COMMITS=<full SHA list>
FILES_CHANGED=<summary>
COMMANDS_RUN=<summary hoặc evidence path>
AUTOMATED_PASS=<count>
AUTOMATED_FAIL=0
AUTOMATED_SKIP=0 hoặc documented non-required skip
MANUAL_SCENARIOS=<pass count/total>
DATABASE_SIDE_EFFECTS=<summary>
EVIDENCE_INDEX=<repo path>
ACTIONS_ARTIFACTS=<urls>
P0_FOUND=<0 hoặc defect IDs>
P1_FOUND=<0 hoặc defect IDs>
REMAINING_RISK=<none hoặc list>
READY_FOR_FROZEN_SHA_SIGNOFF=YES/NO
HANDED_OFF_AT=<ISO-8601 +07:00>
```

`READY_FOR_FROZEN_SHA_SIGNOFF=YES` không có nghĩa W6 đã GO. Nó chỉ có nghĩa correction của thành viên đã merge và sẵn sàng chờ Duy freeze.

---

# 10. Duy kiểm tra trước khi công bố frozen SHA

Duy chỉ freeze khi:

- [ ] correction PR của Huy đã merge;
- [ ] correction PR của Vinh đã merge;
- [ ] correction PR của Tùng đã merge;
- [ ] không còn PR W6 blocker đang chờ;
- [ ] evidence validator đã kiểm tra W6;
- [ ] local absolute links bằng 0;
- [ ] migration W5-copy đã có before/after evidence;
- [ ] concurrent refund test đã có kết quả;
- [ ] V2–V4 và T4/H4 retained evidence đã có index;
- [ ] `main` CI xanh;
- [ ] P0 mở = 0;
- [ ] P1 blocker chưa giải quyết = 0 hoặc chưa freeze.

Lấy SHA:

```bash
git checkout main
git pull --ff-only origin main
git status --short
git rev-parse HEAD
```

Duy công bố:

```text
W6_FROZEN_SHA=<40-char SHA>
FROZEN_AT=<ISO-8601 +07:00>
RULE=Không merge thêm code. Nếu có defect fix, SHA sẽ được freeze lại và sign-off liên quan phải chạy lại.
```

---

# 11. Checklist đóng correction

| Owner | Correction PR merged | Tests theo task | Retained evidence | Ready for freeze | Frozen-SHA sign-off | Duy accepted |
|---|---:|---:|---:|---:|---:|---:|
| Huy | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Vinh | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |
| Tùng | [ ] | [ ] | [ ] | [ ] | [ ] | [ ] |

## Definition of Closed cho từng correction

Một correction chỉ được đánh dấu `Closed` khi:

- có diff code/test/evidence rõ ràng;
- có PR đã merge hoặc evidence commit đã được Duy chấp nhận;
- có regression test phù hợp hoặc canonical smoke có API/DB assertion;
- commands và actual results được ghi lại;
- không có secret/PII/local absolute link;
- remaining risk được ghi trung thực;
- Duy comment `ACCEPTED` kèm ngày giờ.

## Definition of Done cuối W6

W6 chỉ được đổi thành `GO — staging-ready core` khi:

- Huy regression ×2 đạt trên frozen SHA;
- migration DB trống đạt;
- migration W5-copy đạt;
- Vinh Customer canonical matrix đạt;
- Tùng Ops canonical matrix đạt;
- security/privacy/audit acceptance đạt;
- bốn owner ký cùng một SHA;
- P0 = 0;
- P1 = 0;
- evidence validator pass;
- `W6_D5_GATE_REPORT.md` đã được Duy cập nhật từ `NO-GO` sang `GO`.

---

# 12. Những việc không được làm

- Không bắt đầu tính task W7 khi W6 vẫn `NO-GO`.
- Không đổi nhãn correction W6 thành W7 để báo đủ tiến độ.
- Không ký trên branch/SHA khác frozen SHA.
- Không dùng evidence cũ để xác nhận code mới.
- Không xóa/skip test để lấy xanh.
- Không dùng `prisma migrate reset` để chứng minh W5-copy migration.
- Không dùng frontend visibility làm bằng chứng duy nhất cho backend authorization.
- Không chỉ assert HTTP status với concurrency/security test; phải kiểm tra DB side effects.
- Không dùng provider thật trong required deterministic regression.
- Không đưa credential, OTP, token, voucher code hoặc PII vào repo/artifact.
- Không ghi `production-ready`; outcome tối đa của W6 là `staging-ready core`.

---

# 13. Kênh báo blocker cho Duy

Báo ngay cho Duy, không tự waiver, nếu gặp một trong các trường hợp:

- migration làm mất hoặc giảm business record không giải thích được;
- Staff/Partner/Admin có thể vượt role/branch;
- double debit, double voucher issue, double redeem hoặc double refund;
- oversell;
- late/duplicate webhook làm sai final state;
- OTP/token/password/voucher code/secret bị log;
- required suite đỏ;
- evidence không khớp SHA;
- không có nguồn W5 backup/commit đủ tin cậy để chạy migration drill.

Mẫu blocker:

```text
BLOCKER_ID=<W6-...>
OWNER=<name>
SEVERITY=<P0|P1|P2>
FOUND_ON_SHA=<40-char SHA>
SCENARIO=<steps>
EXPECTED=<expected>
ACTUAL=<actual>
DB_SIDE_EFFECT=<summary>
EVIDENCE=<url/path>
PROPOSED_OWNER=<name>
W7_START_IMPACT=BLOCK/NO_BLOCK
```

---

**Kết luận cho Huy, Vinh và Tùng:** Hãy hoàn tất correction branch và bàn giao evidence trước. Sau khi tất cả correction được merge, chờ Duy công bố frozen SHA rồi mới chạy final sign-off. Chỉ khi Duy cập nhật W6-D5 thành `GO — staging-ready core` thì team mới chính thức bắt đầu và tính tiến độ W7.
