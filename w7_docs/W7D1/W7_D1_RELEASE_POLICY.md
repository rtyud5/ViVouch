# W7-D1 — Release Policy & Required Quality Gates

**Project:** ViVouch  
**Sprint:** Week 7 — Production-ready Gate  
**Task:** W7-D1  
**Owner:** Duy — Release & Quality Lead  
**Status:** PASS — Ready to hand off to W7-H1

---

## 1. Mục tiêu

W7-D1 thống nhất một bộ kiểm tra đơn giản để cả nhóm biết:

- Check nào bắt buộc phải pass trước khi merge.
- Lỗi nào phải chặn merge.
- Ai chịu trách nhiệm khi check fail.
- Lệnh local nào tương ứng với CI.
- Secret và database test phải được tách khỏi môi trường thật.

W7-D1 chỉ định nghĩa **policy/gate**. Việc chỉnh CI workflow để thực thi đầy đủ policy thuộc **W7-H1**.

---

## 2. Current CI baseline

Repo hiện đã có `.github/workflows/ci.yml` với 3 job chính:

| Job | Nội dung hiện tại |
|---|---|
| `backend` | PostgreSQL 16, `npm ci`, Prisma generate/migrate/seed, backend tests, `npm audit` |
| `frontend` | `npm ci`, frontend tests, production build, `npm audit` |
| `evidence` | static quality + evidence validation |

CI hiện dùng:

- Node.js 20.
- PostgreSQL 16 chạy riêng trong CI.
- `npm ci` và lockfile.
- Test-only environment variables.
- Không cần production database.
- Không cần live payOS/SMTP để chạy CI.

Đây là baseline đủ tốt để bắt đầu W7.

---

## 3. Quality gate policy

### 3.1 Required checks

Các check sau là **bắt buộc**:

1. **Backend CI pass**
   - dependency install pass;
   - Prisma generate pass;
   - migration pass;
   - seed pass;
   - backend tests pass;
   - production dependency audit không có lỗi mức `high` trở lên.

2. **Frontend CI pass**
   - dependency install pass;
   - unit/frontend tests pass;
   - production build pass;
   - production dependency audit không có lỗi mức `high` trở lên.

3. **Evidence/static quality pass**
   - `scripts/static-quality.mjs` pass;
   - `scripts/verify-evidence.mjs` pass.

4. **Không còn P0/P1**
   - Không merge nếu đang biết có lỗi nghiêm trọng ảnh hưởng core flow hoặc dữ liệu.

### 3.2 Informational / chưa bắt buộc ở W7-D1

Các mục sau **không chặn merge ở đầu W7**:

- SonarQube/SonarCloud nếu project chưa cấu hình secret ổn định.
- Real payOS smoke.
- Real SMTP smoke.
- Browser E2E.
- Screenshot responsive.
- Staging smoke.
- Backup/restore drill.

Các mục này sẽ được xử lý ở task W7 tiếp theo.

---

## 4. NO-GO conditions

Không merge nếu gặp một trong các lỗi sau:

### Backend / Database

- Migration hoặc seed fail.
- Backend test fail.
- Checkout có thể oversell voucher.
- Retry cùng idempotency key tạo duplicate order/payment.
- Duplicate payment webhook phát hành voucher nhiều hơn một lần.
- Voucher có thể redeem thành công hơn một lần.
- Refund có thể cộng tiền/hoàn tiền nhiều hơn một lần.

### Authorization

- Customer truy cập được API Partner/Admin.
- Partner A thao tác dữ liệu Partner B.
- Staff redeem tại branch không được gán.
- Staff/Partner/Branch bị suspend nhưng vẫn thực hiện được protected action.

### Frontend

- Frontend test fail.
- Production build fail.
- Core page không build được do import/runtime configuration sai.

### Security

- Commit `.env` hoặc secret thật.
- Log password, OTP, access token, refresh token hoặc payment secret.
- CI phải dùng production database hoặc live credential mới chạy được.

Nếu chỉ là lỗi tài liệu, wording, UI nhỏ hoặc warning không ảnh hưởng core flow thì ghi lại để sửa trong W7, không cần quay lại W6.

---

## 5. Job / Owner matrix

| Phần | Người phụ trách chính | Khi fail |
|---|---|---|
| Release gate / quyết định GO-NO-GO | Duy | Duy phân loại blocker |
| Backend, DB, Prisma, CI | Huy | Huy sửa/triage |
| Customer frontend/tests | Vinh | Vinh sửa/triage |
| Partner/Admin frontend/tests | Tùng | Tùng sửa/triage |
| Cross-role/RBAC | Tùng + Huy | Cùng kiểm tra |
| Payment/webhook/concurrency | Huy | Huy kiểm tra backend |
| Evidence/static quality | Duy | Duy kiểm tra |

**Rule đơn giản:** check của phần nào đỏ thì owner phần đó xử lý trước khi tiếp tục merge feature mới.

---

## 6. Local commands map sang CI

### Backend

Chạy trong `backend/`:

```bash
npm ci --ignore-scripts
npx --no-install prisma generate
npx --no-install prisma migrate deploy
npm run prisma:seed
npm run test:unit:node
npm test
npm audit --omit=dev --audit-level=high
```

CI tương ứng: `backend`.

### Frontend

Chạy trong `frontend/`:

```bash
npm ci --ignore-scripts
npm run test:unit:node
npm test -- --run
npm run build
npm audit --omit=dev --audit-level=high
```

CI tương ứng: `frontend`.

### Evidence / static quality

Chạy tại repository root:

```bash
node scripts/static-quality.mjs
node scripts/verify-evidence.mjs
```

CI tương ứng: `evidence`.

---

## 7. Branch / merge rule

Áp dụng cho `main`:

- Làm việc trên branch riêng.
- Mở Pull Request trước khi merge.
- Required CI phải xanh.
- Không dùng `continue-on-error` cho backend/frontend/evidence core checks.
- Không force-push trực tiếp vào `main`.
- Không merge khi còn P0/P1.
- Nếu CI đỏ do code của mình thì sửa trước khi merge.

GitHub Branch Protection có thể được Huy cấu hình ở W7-H1; policy này vẫn có hiệu lực kể cả khi chưa bật setting đó.

---

## 8. Secret và database policy

### CI được phép dùng

- PostgreSQL test riêng trong GitHub Actions.
- JWT secret giả dành riêng cho CI.
- OTP pepper giả dành riêng cho CI.
- Email mode `TEST`.
- Mock payment/test fixture.

### Không được commit

- `.env`.
- Production `DATABASE_URL`.
- SMTP password/app password.
- payOS API key/checksum key.
- JWT secret thật.
- Access token / refresh token.
- OTP thật.

### Quy tắc

CI phải chạy được mà **không cần production/shared database và không cần live payOS/SMTP**.

---

## 9. Artifact policy đơn giản

Không cần retention policy phức tạp.

Trong W7 chỉ cần giữ:

- CI result trên GitHub Actions.
- Log lỗi khi test/build fail.
- E2E screenshot/trace khi W7-H2 được làm.
- Final frozen SHA.
- Staging smoke + backup/restore result ở cuối W7.

Không upload `.env`, secret hoặc dữ liệu nhạy cảm vào artifact/evidence.

---

## 10. Risk → Gate trace

| Risk quan trọng | Gate kiểm soát |
|---|---|
| Broken migration / schema | Backend CI: migrate + seed |
| Oversell / duplicate checkout | Backend tests |
| Duplicate webhook / voucher issuance | Backend tests |
| Double redeem | Backend tests |
| Wrong branch Staff | Backend RBAC/redeem tests |
| Double refund | Backend concurrency tests |
| Broken Customer UI | Frontend tests + build |
| Broken Partner/Admin UI | Frontend tests + build |
| Evidence sai / thiếu | Evidence CI |
| Secret thật trong source | Review + static quality |

Mục tiêu là chỉ giữ các gate có giá trị trực tiếp với đồ án, tránh tạo quá nhiều gate chậm hoặc flaky.

---

## 11. Dry-run failure scenarios

Đây là kiểm tra logic policy, chưa cần cố tình phá CI ở W7-D1.

| Scenario | Kết quả mong đợi | D1 result |
|---|---|---|
| Backend test fail | Không merge | PASS |
| Prisma migrate fail | Không merge | PASS |
| Frontend test fail | Không merge | PASS |
| Frontend build fail | Không merge | PASS |
| Evidence validator fail | Không merge | PASS |
| Sonar chưa cấu hình | Không chặn core CI | PASS |
| payOS sandbox đang lỗi | PR CI vẫn chạy bằng mock/test | PASS |
| Có P0/P1 về duplicate/redeem/RBAC | Không merge | PASS |

W7-H1 có thể thực hiện intentional-failure test nếu cần xác nhận workflow thực tế trả exit code đúng.

---

## 12. CI Acceptance Checklist

### W7-D1 policy

- [x] Đã xác định required checks.
- [x] Đã tách required và informational checks.
- [x] Required job fail thì không merge.
- [x] Không cho `continue-on-error` ở core gate.
- [x] Đã xác định NO-GO conditions.
- [x] Đã phân owner khi check fail.
- [x] Đã map local commands sang CI jobs.
- [x] Đã xác định secret/DB isolation.
- [x] Đã xác định artifact/evidence cần giữ ở mức đơn giản.
- [x] Đã trace các risk chính sang gate.
- [x] Đã dry-run các failure scenario ở mức policy.

### Current repo baseline

- [x] Có backend CI.
- [x] Có frontend CI.
- [x] Có evidence CI.
- [x] Backend CI dùng PostgreSQL riêng.
- [x] Prisma generate/migrate/seed nằm trong CI.
- [x] Backend tests nằm trong CI.
- [x] Frontend tests + build nằm trong CI.
- [x] CI dùng test-only secrets/config.
- [ ] Aggregate `release-gate` job — W7-H1.
- [ ] Verify GitHub Branch Protection — W7-H1.
- [ ] Browser E2E — W7-H2/V2/T2.
- [ ] Staging + recovery evidence — W7-H4/D4.
- [ ] Final frozen SHA + 4 sign-off — W7-H5/V5/T5/D5.

Các mục chưa check là dependency của task tiếp theo, **không phải W7-D1 fail**.

---

## 13. Verify / Test result

### Review commands

Các command trong tài liệu đã được đối chiếu với:

- `.github/workflows/ci.yml`
- `backend/package.json`
- `frontend/package.json`

Kết quả: **MATCH** với current CI baseline.

Huy sẽ dùng chính command map này khi thực hiện W7-H1.

### Risk trace

Các risk P0/P1 quan trọng của W6 được đưa vào required gate:

- database/migration;
- checkout/idempotency;
- payment webhook;
- redeem;
- branch authorization;
- refund concurrency;
- frontend build.

Kết quả: **PASS**.

### Dry-run

Các failure scenario chính đều có quyết định rõ `BLOCK` hoặc `NON-BLOCKING`.

Kết quả: **PASS**.

---

## 14. W7-D1 Final Result

**W7-D1 STATUS: PASS / DONE**

### Blocking findings

**0**

### Non-blocking handoff items

- W7-H1: làm CI reproducible và kiểm tra branch protection.
- W7-H2/V2/T2: thêm E2E.
- W7-H4/D4: staging + backup/restore.
- W7-H5/V5/T5/D5: freeze final SHA và sign-off.

### Handoff

**Next task:** W7-H1 — Reproducible CI pipeline.

Huy cần bảo đảm:

1. Clean checkout chạy được CI.
2. Không phụ thuộc machine state.
3. Không dùng production/shared DB.
4. Failure trả exit code đúng.
5. Backend/frontend/evidence required checks không bị bypass.

---

## 15. Kết luận

W7-D1 đã hoàn thành đúng phạm vi đồ án sinh viên:

- Có quality gate rõ.
- Có người chịu trách nhiệm.
- Có NO-GO conditions.
- Có command map.
- Có secret/DB isolation.
- Có acceptance checklist.
- Không thêm quy trình enterprise không cần thiết.

**Decision: PASS W7-D1 → chuyển W7-H1.**
