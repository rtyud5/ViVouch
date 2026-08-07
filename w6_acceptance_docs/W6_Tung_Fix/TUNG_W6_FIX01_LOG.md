# Báo cáo TASK=TUNG-W6-FIX-01 (Bản bổ sung sau review)

## Tóm tắt

| Trường | Giá trị |
|--------|---------|
| **TASK** | `TUNG-W6-FIX-01` |
| **Branch** | `tung/w6-fix-01-evidence-links` |
| **FILES_CHANGED** | `walkthrough.md` (1 file) |
| **FILES_SCANNED** | **170** (kết quả `git ls-files '*.md' \| Measure-Object -Line`) |
| **LOCAL_LINKS_BEFORE** | **31** |
| **LOCAL_LINKS_AFTER** | **0** (real Markdown links) |
| **BROKEN_LINKS** | **0** |
| **VALIDATOR** | **PASS** (`node scripts/verify-evidence.mjs` → "Evidence validation passed: 71 files checked.") |
| **TESTED_SHA** | `c1198a172d0e13b1479d3396701c94aeb6928693` |
| **REMAINING_RISK** | Xem Mục 5 — SHA là HEAD trước commit, thay đổi đang uncommitted |

> [!NOTE]
> **Về "5 false positives" trong báo cáo đầu vs "30+ dòng" trong grep đầy đủ:** Báo cáo đầu dùng regex chặt hơn (`file:///[A-Za-z]:|[A-Za-z]:[/\\][A-Za-z0-9]`) và chỉ paste kết quả trong phạm vi W6 docs — nên chỉ thấy 5 dòng. Báo cáo bổ sung theo yêu cầu review dùng **đúng regex gốc của task spec** (`file:///|[A-Za-z]:[/\\]`) — regex này rộng hơn, khớp thêm cả `http://`, `https://`, `postgresql://` (vì `[A-Za-z]:` match bất kỳ URL scheme nào), và quét **toàn bộ 170 file**. 30+ dòng là kết quả của hai yếu tố cộng lại: regex rộng hơn + phạm vi rộng hơn. Kết luận không thay đổi: **không còn dòng nào dạng `[text](file:///...)` hay `[text](X:/path/...)`** trong toàn bộ 170 file.

---

## Bổ sung theo review

### Mục 1 — FILES_SCANNED chính xác

Lệnh:
```powershell
git ls-files '*.md' | Measure-Object -Line
```

**Kết quả: `170`**

---

### Mục 2 — Raw output git grep cuối cùng (toàn bộ, không tóm tắt)

> **Lưu ý nhất quán với báo cáo đầu:** Báo cáo đầu ghi "5 false positives" vì dùng regex chặt hơn (`file:///[A-Za-z]:|[A-Za-z]:[/\\][A-Za-z0-9]`) và chỉ paste kết quả W6 docs (5 dòng). Grep này dùng **regex gốc của task spec** (`file:///|[A-Za-z]:[/\\]`) quét toàn bộ 170 file — ra 30+ dòng vì regex rộng hơn còn khớp `http://`, `https://`, `postgresql://`. Trong cả hai trường hợp, kết luận như nhau: **zero actual Markdown hyperlink trỏ absolute local path**.

Lệnh chạy:
```bash
git grep -nEi 'file:///|[A-Za-z]:[/\\]' -- '*.md'
```

Raw output (nguyên văn sau khi sửa walkthrough.md, toàn bộ 170 file):

```
README.md:31:- [Node.js 20+](https://nodejs.org)
README.md:32:- [Docker Desktop](https://www.docker.com/products/docker-desktop)
README.md:33:- [Git](https://git-scm.com)
README.md:42:git clone https://github.com/<your-org>/ViVouch.git
README.md:102:# → http://localhost:5000
README.md:109:# → http://localhost:5173
README.md:116:| http://localhost:5000/health/live | `{"success":true,"status":"live"}` |
README.md:117:| http://localhost:5000/health/ready | readiness including PostgreSQL |
README.md:118:| http://localhost:5173 | React app is running |
README.md:119:| http://localhost:5555 | Prisma Studio (run `npx prisma studio`) |
README.md:130:CLIENT_URL=http://localhost:5173
README.md:131:DATABASE_URL=postgresql://postgres:postgres@localhost:5432/voucher_platform
README.md:158:VITE_API_BASE_URL=http://localhost:5000/api
W6_HUY_REPORT.md:24:  - Chặn các đường dẫn local tuyệt đối (ví dụ `file:///`).
agent-docs/02_tech_stack/05_testing_api_docs_deploy_spec.md:66:DATABASE_URL=postgresql://...
agent-docs/02_tech_stack/05_testing_api_docs_deploy_spec.md:70:CLIENT_URL=http://localhost:5173
agent-docs/02_tech_stack/05_testing_api_docs_deploy_spec.md:77:VITE_API_BASE_URL=http://localhost:5000/api
agent-docs/02_tech_stack/07_package_list_and_commands.md:92:curl http://localhost:5000/health
agent-docs/02_tech_stack/07_package_list_and_commands.md:93:curl http://localhost:5000/api-docs
agent-docs/03_architecture_design/13_deployment_env_and_operations.md:24:Environment: VITE_API_BASE_URL=https://your-render-api.onrender.com/api
agent-docs/03_architecture_design/13_deployment_env_and_operations.md:45:CLIENT_URL=https://your-vercel-app.vercel.app
agent-docs/03_architecture_design/13_deployment_env_and_operations.md:63:http://localhost:5173
agent-docs/03_architecture_design/13_deployment_env_and_operations.md:64:https://your-vercel-domain.vercel.app
docs/11_w6_w7_marketplace/04_payos_setup.md:9:PAYOS_RETURN_URL=https://frontend.example.com/customer/payment-result
docs/11_w6_w7_marketplace/04_payos_setup.md:10:PAYOS_CANCEL_URL=https://frontend.example.com/customer/payment-result
docs/11_w6_w7_marketplace/04_payos_setup.md:11:PUBLIC_API_URL=https://api.example.com
docs/11_w6_w7_marketplace/04_payos_setup.md:21:POST https://api.example.com/api/payments/payos/webhook
docs/11_w6_w7_marketplace/05_test_release_runbook.md:46:DATABASE_URL='postgresql://...' scripts/backup-db.sh evidence/backup.dump
docs/11_w6_w7_marketplace/05_test_release_runbook.md:47:TARGET_DATABASE_URL='postgresql://...new_database...' scripts/restore-db.sh evidence/backup.dump
w5_acceptance_docs/W5D5/W5T5_demo_script.md:26:- **URL:** `http://localhost:5173/login`
w5_acceptance_docs/W5D5/W5T5_demo_script.md:61:- **URL:** `http://localhost:5173/login`
w5_acceptance_docs/W5D5/W5T5_demo_script.md:121:- **URL:** `http://localhost:5173/partner/redeem`
w5_acceptance_docs/W5D5/W5V5_customer_demo_script.md:24:- **URL:** `http://localhost:5173/`
w5_acceptance_docs/archive_w5_pre_baseline/vivouch_w5_test_cases.md:4:**Môi trường:** Local (Frontend `http://localhost:5173`, Backend `http://localhost:5000`)
w6_acceptance_docs/W6D1/W6D1_04_command_baseline_acceptance_matrix.md:67:curl -fsS http://localhost:3000/health/live
w6_acceptance_docs/W6D1/W6D1_04_command_baseline_acceptance_matrix.md:68:curl -fsS http://localhost:3000/health/ready
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:82:- link dạng `file:///C:/...` hoặc `file:///D:/...`;
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:190:- W6 có link local `file:///...`;
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:211:   - `file:///`, đường dẫn Windows tuyệt đối hoặc đường dẫn máy cá nhân;
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:227:| EV-03 | Link `file:///D:/...` | Exit code khác 0 |
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:261:- link local `file:///` bị chặn;
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:1022:- không dùng `file:///`;
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:1135:file:///D:/...
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:1145:git grep -nEi 'file:///|[A-Za-z]:[/\\\\]' -- '*.md'
w6_acceptance_docs/W6D5/W6_INHERITED_REMEDIATION_FOR_W7.md:1167:\file:///D:/project/evidence.png
w6_acceptance_docs/W6D5/W6_RISK_WAIVER_REGISTER.md:27:| W6-DOC-001 | P2 | T5 documents chứa `file:///d:/...`, không dùng được ngoài máy tác giả | W6T5 docs | Tùng | Đổi toàn bộ sang repository-relative links; verifier pass | Không cần waiver nếu sửa cùng inherited PR |
w6_acceptance_docs/W6T1/W6T1_03_negative_scenarios.md:34:curl -fsS http://localhost:3000/api/partner/profile
w6_acceptance_docs/W6T1/W6T1_03_negative_scenarios.md:53:curl -fsS -H "Authorization: Bearer $CUSTOMER_TOKEN" http://localhost:3000/api/admin/dashboard
```

#### Phân tích từng hit — tại sao không phải Markdown link thật

| File:Line | Nội dung dòng | Lý do không sửa |
|-----------|---------------|-----------------|
| `README.md:31–33` | `https://nodejs.org`, Docker, Git | URL HTTPS công khai — không phải `file:///` hay Windows path tuyệt đối |
| `README.md:42` | `https://github.com/...` | URL HTTPS công khai |
| `README.md:102,109,116–119,130–131,158` | `http://localhost:*`, `postgresql://...` | URL dev server / connection string — không phải Markdown link `[text](file:///...)` |
| `W6_HUY_REPORT.md:24` | `` `file:///` `` | Inline backtick — text mô tả, không phải `[text](url)` |
| `agent-docs/...` | `localhost:*`, `https://example.com`, `postgresql://...` | URL dịch vụ trong config mẫu |
| `docs/11_w6_w7_marketplace/...` | `https://frontend.example.com/...`, `postgresql://...` | Placeholder URL trong runbook |
| `w5_acceptance_docs/**` | `http://localhost:5173/...` | URL dev server trong script demo W5 — không phải `file:///` |
| `w6_acceptance_docs/W6D1/**:67–68` | `curl -fsS http://localhost:3000/...` | Lệnh shell trong code block — không phải Markdown link |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:82` | `` `file:///C:/...` hoặc `file:///D:/...` `` | Inline backtick trong bullet list — ví dụ minh họa Evidence không hợp lệ |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:190` | `` `file:///...` `` | Inline backtick — criteria |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:211` | `` `file:///` `` | Inline backtick — criteria |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:227` | `` `file:///D:/...` `` | Trong ô bảng, backtick — test input ví dụ EV-03 |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:261` | `` `file:///` `` | Inline backtick — criteria |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:1022` | `` `file:///` `` | Inline backtick — quy tắc |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:1135` | `file:///D:/...` | Trong **```text** code fence (dòng 1134–1136) — ví dụ minh họa của chính FIX-01 |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:1145` | `` git grep -nEi 'file:///|...' `` | Trong **```bash** code fence (dòng 1144–1146) — lệnh shell trong hướng dẫn |
| `W6_INHERITED_REMEDIATION_FOR_W7.md:1167` | `\file:///D:/project/evidence.png` | Trong **```markdown** code fence (dòng 1166–1168) — ví dụ "không được dùng", có ký tự thoát `\` |
| `W6_RISK_WAIVER_REGISTER.md:27` | `` `file:///d:/...` `` | Backtick trong ô bảng — mô tả rủi ro, không phải hyperlink |
| `W6T1/W6T1_03_negative_scenarios.md:34,53` | `curl -fsS http://localhost:3000/...` | Lệnh curl trong code block — URL localhost, không phải file path |

> [!IMPORTANT]
> **Không còn dòng nào trong toàn bộ 170 file có dạng `[link text](file:///...)` hoặc `[link text](X:/path/...)`** — syntax Markdown hyperlink thực sự trỏ tới local absolute path.

---

### Mục 3 — Phạm vi quét evidence T1–T5

**Thư mục T1–T5 được xác định** (đã lọc bỏ `node_modules`):

```
w6_acceptance_docs/W6T1/
w6_acceptance_docs/W6T2/
w6_acceptance_docs/W6T3/
w6_acceptance_docs/W6T4/
w6_acceptance_docs/W6T5/
```

**16 file `.md` tracked trong W6T1–T5** (từ `git ls-files`):

```
w6_acceptance_docs/W6T1/W6T1_01_permission_matrix.md
w6_acceptance_docs/W6T1/W6T1_02_portal_route_smoke_report.md
w6_acceptance_docs/W6T1/W6T1_03_negative_scenarios.md
w6_acceptance_docs/W6T1/W6T1_outcome.md
w6_acceptance_docs/W6T2/W6T2_01_portal_integration_fixes.md
w6_acceptance_docs/W6T2/W6T2_02_role_aware_navigation_tests.md
w6_acceptance_docs/W6T2/W6T2_03_approval_staff_evidence.md
w6_acceptance_docs/W6T2/W6T2_outcome.md
w6_acceptance_docs/W6T3/W6T3_outcome.md
w6_acceptance_docs/W6T3/w6_t3_branch_redeem_payment_evidence.md
w6_acceptance_docs/W6T4/W6T4_outcome.md
w6_acceptance_docs/W6T4/w6_t4_admin_ops_audit_evidence.md
w6_acceptance_docs/W6T5/W6T5_ops_regression_matrix.md
w6_acceptance_docs/W6T5/W6T5_outcome.md
w6_acceptance_docs/W6T5/W6T5_role_branch_audit_evidence.md
w6_acceptance_docs/W6T5/W7_ops_e2e_backlog.md
```

**Xác nhận scope:** `git grep -- '*.md'` quét **toàn bộ 170 file** — bao gồm đủ cả 16 file W6T1–T5. Trong 16 file đó, chỉ `W6T1_03_negative_scenarios.md:34,53` xuất hiện trong grep output do chứa `http://localhost:3000/...` trong lệnh curl (không phải `file:///` hay Windows absolute path). **Không có file T1–T5 nào chứa absolute local Markdown link.** 31 link cần sửa chỉ nằm trong `walkthrough.md` — kết luận này là kết quả của quét toàn bộ, không phải do phạm vi bị thu hẹp.

---

### Mục 4 — Diff mẫu thật (trích từ `git diff walkthrough.md`)

```diff
-W6–W7 introduced stricter enforcement in [auth.middleware.js](file:///d:/ViVouch/ViVouch/backend/src/middlewares/auth.middleware.js#L45-L47):
+W6–W7 introduced stricter enforcement in [auth.middleware.js](backend/src/middlewares/auth.middleware.js#L45-L47):

-W6–W7 introduced the `PartnerMember` model to support multi-member partner organizations (OWNER / STAFF). The [partnerAccess.middleware.js](file:///d:/ViVouch/ViVouch/backend/src/middlewares/partnerAccess.middleware.js) and [redeem.service.js](file:///d:/ViVouch/ViVouch/backend/src/modules/redeem/redeem.service.js#L26-L33) `assertAccess()` function now require an **ACTIVE PartnerMember** record linked to an **APPROVED Partner**:
+W6–W7 introduced the `PartnerMember` model to support multi-member partner organizations (OWNER / STAFF). The [partnerAccess.middleware.js](backend/src/middlewares/partnerAccess.middleware.js) and [redeem.service.js](backend/src/modules/redeem/redeem.service.js#L26-L33) `assertAccess()` function now require an **ACTIVE PartnerMember** record linked to an **APPROVED Partner**:

-| [partner-redeem-api.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem-api.test.js) | Added `status: 'ACTIVE'` to 3 user creates + added `PartnerMember` for partner user | ✅ 12/12 |
+| [partner-redeem-api.test.js](backend/tests/partner-redeem-api.test.js) | Added `status: 'ACTIVE'` to 3 user creates + added `PartnerMember` for partner user | ✅ 12/12 |

-| [cart.test.js](file:///d:/ViVouch/ViVouch/backend/tests/cart.test.js) | Added `status: 'ACTIVE'` to 3 user creates (UserA, UserB, PartnerUser) | ✅ 11/11 |
+| [cart.test.js](backend/tests/cart.test.js) | Added `status: 'ACTIVE'` to 3 user creates (UserA, UserB, PartnerUser) | ✅ 11/11 |

-| [auth.test.js](file:///d:/ViVouch/ViVouch/backend/tests/auth.test.js) | OTP reset-password test: `pg_advisory_xact_lock()` returns void, Prisma `$queryRaw` cannot deserialize. Need to use `$executeRaw` instead of `$queryRaw` in [otp.service.js](file:///d:/ViVouch/ViVouch/backend/src/modules/otp/otp.service.js#L23). |
+| [auth.test.js](backend/tests/auth.test.js) | OTP reset-password test: `pg_advisory_xact_lock()` returns void, Prisma `$queryRaw` cannot deserialize. Need to use `$executeRaw` instead of `$queryRaw` in [otp.service.js](backend/src/modules/otp/otp.service.js#L23). |

-The [seed.js](file:///d:/ViVouch/ViVouch/backend/prisma/seed.js) was already updated correctly for all three patterns, but the integration tests were written against the pre-W6 schema.
+The [seed.js](backend/prisma/seed.js) was already updated correctly for all three patterns, but the integration tests were written against the pre-W6 schema.

-| [partner-redeem.test.js](file:///d:/ViVouch/ViVouch/backend/tests/partner-redeem.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` (partial — still needs 4-arg signature fix) |
+| [partner-redeem.test.js](backend/tests/partner-redeem.test.js) | Test | `status: 'ACTIVE'` + `PartnerMember` (partial — still needs 4-arg signature fix) |
```

**Pattern nhất quán trên toàn bộ 31 thay đổi:** xóa prefix `file:///d:/ViVouch/ViVouch/` khỏi Markdown link URL, giữ nguyên phần path `backend/...`. Không có thay đổi nào với text hiển thị, ký tự Unicode, hay nội dung code block.

---

### Mục 5 — Làm rõ TESTED_SHA

> [!IMPORTANT]
> **TESTED_SHA=`c1198a172d0e13b1479d3396701c94aeb6928693` là HEAD của commit TRƯỚC KHI thay đổi `walkthrough.md`. Thay đổi 31 link trong `walkthrough.md` hiện đang ở trạng thái UNCOMMITTED (working tree modified, chưa staged, chưa có trong bất kỳ commit nào). SHA này KHÔNG phản ánh trạng thái sau khi sửa. Validator đã được chạy ở working tree sau sửa, trước commit.**

Nói cách khác: nếu ai đó `git checkout c1198a17...` thì sẽ thấy file `walkthrough.md` **chưa được sửa**. SHA của commit thực sự chứa fix sẽ được tạo ra khi bạn duyệt và chạy `git commit`.

---

### Mục 6 — Kiểm tra line-ending

```
git diff --stat walkthrough.md
→  walkthrough.md | 62 +++++++++++++++++++++++++++++-----------------------------
   1 file changed, 31 insertions(+), 31 deletions(-)
```

**Phân tích:** 31 insertions + 31 deletions = 62 lines thay đổi = đúng 31 dòng edit (mỗi dòng được tính 1 deletion cũ + 1 insertion mới). File có 182 dòng tổng; nếu PowerShell đổi CRLF→LF toàn file, diff sẽ hiện 182+182=364 lines changed. Con số 62 xác nhận **không có line ending noise**.

**Kỹ thuật:** `[System.IO.File]::ReadAllText(..., UTF8)` + `[System.IO.File]::WriteAllText(..., UTF8)` — giữ nguyên CRLF gốc của file, không convert.

---

## Ghi chú kỹ thuật tổng hợp

| Điểm | Trạng thái |
|------|-----------|
| Encoding UTF-8 | ✅ Bảo toàn — `–`, `✅`, `🔧`, `→`, tiếng Việt nguyên vẹn |
| Line ending CRLF | ✅ Giữ nguyên — không có conversion noise |
| Scope | ✅ Chỉ `walkthrough.md` — `backend/`, `frontend/`, `database/`, `w6_acceptance_docs/` không bị chạm |
| TESTED_SHA | ⚠️ `c1198a172d0e13b1479d3396701c94aeb6928693` = HEAD **TRƯỚC** commit — thay đổi đang UNCOMMITTED |
| Validator | ✅ PASS tại working tree sau sửa |
| Commit/push | ❌ Chưa — đang chờ duyệt |
