# W6-D5 — GO/NO-GO & W7 Handoff Gate Report

**Owner:** Duy — Team Lead / Security  
**Ngày đánh giá:** 2026-08-03 (UTC+07)  
**Repository:** `rtyud5/ViVouch`  
**Baseline được rà soát:** `main@f45323eb99f77d60504da487892da1522e08e6a9`  
**Kết luận hiện tại:** **NO-GO — chưa được phép đóng W6**

> Đây là kết luận gate theo evidence hiện có trong repository và GitHub Actions. Kết luận không phủ nhận phần code đã hoàn thành; NO-GO phát sinh do chưa chứng minh đủ các điều kiện bắt buộc của W6-D5 trên cùng một frozen SHA.

## 1. Điều kiện gate W6-D5

W6 chỉ được đóng khi đồng thời đạt đủ các điều kiện sau:

- P0/P1 bằng 0.
- Duy, Huy, Vinh và Tùng ký xác nhận trên cùng một frozen SHA.
- Migration/seed, backend tests, frontend tests và frontend build có evidence truy vết tới frozen SHA.
- Migration được chứng minh trên cả database trống và bản sao dữ liệu/schema W5.
- Canonical smoke của Customer và Partner/Admin/Staff đã chạy trên candidate cuối.
- Không dùng báo cáo miệng, log không có SHA hoặc log của SHA cũ để ký gate.
- Chỉ tuyên bố `staging-ready core`; không tuyên bố `production-ready` trước W7.

## 2. Evidence đã kiểm tra

| Hạng mục | Evidence hiện có | Đánh giá |
|---|---|---|
| Baseline cuối | Merge PR #156 tạo `f45323eb99f77d60504da487892da1522e08e6a9` | Xác định được candidate mới nhất |
| CI tại candidate cuối | GitHub Actions CI thành công; workflow có PostgreSQL 16, `prisma migrate deploy`, seed, Node tests, Vitest backend, Vitest frontend và frontend build | **PASS một lần**; chưa phải regression x2 |
| Tách test runner | Backend Vitest loại `tests-node/**`; Node Test Runner có script riêng | **PASS** |
| Empty-DB migration | CI dựng PostgreSQL mới rồi migrate/seed | **PASS** cho DB trống |
| W5-copy migration | Không có log/count/invariant trước và sau khi migrate bản sao W5 | **FAIL / thiếu evidence** |
| Duy W6-D4 | Security checklist đóng SEC-01 đến SEC-03; SEC-04 vẫn mở vì thiếu retained evidence H4/V4/T4 | **PARTIAL** |
| Huy W6-H5 | `w6-freeze-evidence.md` tham chiếu SHA `02418be...`; backend integration test bị comment, frontend chỉ build bằng `npm install`, không có regression x2 | **FAIL** |
| Tùng W6-T5 | 52 backend + 26 frontend tests trên SHA `48cbb114...`; evidence chi tiết nhưng SHA cũ hơn candidate cuối | **PARTIAL** |
| Vinh W6-V5 | Frontend 26 tests + build trên SHA `d1b30b3...`; tài liệu ghi rõ bỏ qua backend/DB side effects và chỉ GO cho frontend | **FAIL** |
| W6 evidence validation | `scripts/verify-evidence.mjs` đang kiểm tra `w5_acceptance_docs/W5D5`, không kiểm tra W6-D5/W6 evidence | **FAIL** |
| W6 acceptance index | Có D1, D4, T1–T5, V1, V5; không có acceptance folder D2, D3, H1–H5, V2–V4 | **Thiếu traceability** |

## 3. Chênh lệch frozen SHA

| Owner | SHA trong sign-off/evidence | Trạng thái so với `f45323e...` |
|---|---|---|
| Huy | `02418be58997c77c47728cd0de78a148310cae2b` | Không trùng; cũ hơn nhiều merge tiếp theo |
| Tùng | `48cbb1145f47573a9028e85fae1ef18a6f2249ef` | Không trùng; chưa gồm các merge sau đó |
| Vinh | `d1b30b3dda46fb4f6f235132bcaa95f969fa794a` | Không trùng merge commit cuối `f45323e...` |
| Duy | Chưa có W6-D5 sign-off cuối | Chưa thể ký khi các P1 còn mở |

**Kết luận:** điều kiện “4 owner sign-off cùng SHA” chưa đạt.

## 4. Gate blockers

### P1 — W6-GATE-001: Sign-off không cùng frozen SHA

Ba owner đang dùng ba SHA khác nhau; chưa có bộ evidence thống nhất cho candidate cuối.

**Điều kiện đóng:** chốt một candidate mới sau khi bổ sung tài liệu/fix, chạy lại required checks, rồi cả bốn owner ký cùng full SHA đó.

### P1 — W6-H5-001: Full regression x2 và freeze evidence chưa đạt

Evidence H5 không chạy backend PostgreSQL test, không chạy frontend tests, không dùng `npm ci`, chỉ ghi schema validation và không có hai lượt regression độc lập.

**Điều kiện đóng:** Huy chạy canonical command set hai lần trên candidate cuối, lưu run URL/log, test count, duration, SHA và trạng thái worktree.

### P1 — W6-MIG-001: Thiếu migration evidence từ W5-copy

CI chứng minh migrate trên database trống nhưng không chứng minh upgrade dữ liệu W5.

**Điều kiện đóng:** restore/copy W5 DB, ghi before counts/invariants, chạy `prisma migrate deploy`, seed theo policy đã chốt, ghi after counts/invariants và xác nhận không mất dữ liệu.

### P1 — W6-V5-001: Customer sign-off không bao phủ canonical flow

V5 chỉ kiểm tra frontend component/build; backend và DB side effects bị bỏ qua. Việc Tailwind build thành công không chứng minh responsive 375/768/1280.

**Điều kiện đóng:** Vinh chạy Customer smoke với backend + PostgreSQL trên candidate cuối, kiểm tra OTP → checkout → order/voucher → refund/ticket/notification, state refetch và ba viewport.

### P1 — W6-SEC-04: Retained evidence H4/V4/T4 chưa được gắn vào release index

W6-D4 vẫn ghi finding này là open evidence follow-up.

**Điều kiện đóng:** Huy, Vinh và Tùng gắn log/screenshot/test run đã redacted, cùng SHA, vào evidence index; Duy review và chuyển finding sang Closed.

## 5. Những phần đã đạt và được giữ nguyên

- Test runner backend Node/Vitest đã tách đúng.
- CI hiện dựng PostgreSQL 16, migrate, seed, chạy backend Node tests, backend Vitest, frontend Node tests, frontend Vitest và build.
- Bộ backend tests bao phủ auth, checkout/concurrency, payOS webhook, RBAC, branch redeem, partner reports, admin audit và jobs stabilization.
- W6-D4 có checklist bảo mật cụ thể cho log redaction, OTP, token/password, voucher code, payOS secrets, tenant controls, rate limit và audit trace.
- Tùng đã tạo regression matrix vận hành chi tiết; phần này chỉ cần tái chạy/đính kèm trên candidate cuối và sửa các khoảng trống nêu trong file inherited remediation.

## 6. Quyết định

**NO-GO tại `f45323eb99f77d60504da487892da1522e08e6a9`.**

Không bắt đầu task nghiệp vụ W7 khi năm blocker P1 phía trên chưa được đóng. Các correction này là **W6 inherited remediation**, không được đổi tên hoặc gộp thành thành tích W7.

## 7. Trình tự để chuyển thành GO

1. Merge bộ tài liệu W6-D5 và file `W6_INHERITED_REMEDIATION_FOR_W7.md`.
2. Huy, Vinh, Tùng hoàn thành correction bắt buộc trong file inherited remediation.
3. Chốt candidate SHA mới; không merge thêm code ngoài correction đã duyệt.
4. Huy chạy canonical CI/regression hai lần và W5-copy migration drill.
5. Vinh chạy Customer canonical smoke; Tùng chạy Ops canonical smoke trên đúng candidate.
6. Ba owner nộp sign-off kèm full SHA và evidence URL/artifact.
7. Duy kiểm tra SHA consistency, đóng W6-SEC-04, cập nhật risk register về P0/P1 = 0.
8. Duy đổi kết luận tài liệu này từ `NO-GO` sang `GO — staging-ready core`, ghi frozen SHA và thời điểm freeze.

## 8. Mẫu sign-off cuối

```text
OWNER=<Duy|Huy|Vinh|Tung>
TASK=<W6-D5|W6-H5|W6-V5|W6-T5>
FROZEN_SHA=<40-char SHA>
RUN_URLS=<GitHub Actions/artifact links>
LOCAL_DB_EVIDENCE=<path or artifact>
PASS=<count>
FAIL=0
SKIP=0 or documented non-required skip
P0=0
P1=0
SIGNED_AT=<ISO-8601 +07:00>
VERDICT=ACCEPTED_FOR_W6_STAGING_READY_CORE
```

## 9. Boundary of this audit

Repository clone/test execution từ môi trường đánh giá không thực hiện được do môi trường hiện tại không phân giải được `github.com`. Báo cáo dựa trên source, tree, pull requests, committed evidence và GitHub Actions công khai của exact SHA nêu trên. Vì vậy, các bước local W5-copy migration và canonical browser smoke vẫn phải do team chạy và đính kèm evidence trước khi đổi gate sang GO.
