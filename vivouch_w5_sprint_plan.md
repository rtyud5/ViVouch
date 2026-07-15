# Week 5 — Assignment Excellence

## Mục tiêu

> **Outcome:** bản strong-fix trở thành assignment-complete candidate có thể dựng từ môi trường sạch, demo đủ ba portal, đối chiếu trọn BRD/rubric và có evidence lặp lại được. Không mở feature ngoài rubric.

W5 ưu tiên business correctness, completeness, UX và bằng chứng chấm điểm. Production hardening chuyên sâu vẫn thuộc W6–W7, trừ P0/P1 phát hiện trong regression.

## Phân vai cố định

| Thành viên | Vai trò | Trọng tâm công việc | Kế hoạch tuần |
| :--- | :--- | :--- | :--- |
| **Duy** | Acceptance & Security Lead | *Xem timeline và chi tiết task bên dưới* | `BLUE` |
| **Huy** | Backend & Data Lead | *Xem timeline và chi tiết task bên dưới* | `GREEN` |
| **Vinh** | Customer Portal Lead | *Xem timeline và chi tiết task bên dưới* | `VIOLET` |
| **Tùng** | Partner & Admin Portal Lead | *Xem timeline và chi tiết task bên dưới* | `ORANGE` |

## Timeline Grid

| Thành viên / Ngày | Thứ 3 (Baseline & inventory) | Thứ 4 (Functional closure) | Thứ 5 (UX & contract) | Thứ 6 (Regression & evidence) | Thứ 7 (Candidate & sign-off) |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Duy** | [W5-D1](#w5-d1) | [W5-D2](#w5-d2) | [W5-D3](#w5-d3) | [W5-D4](#w5-d4) | [W5-D5](#w5-d5) |
| **Huy** | [W5-H1](#w5-h1) | [W5-H2](#w5-h2) | [W5-H3](#w5-h3) | [W5-H4](#w5-h4) | [W5-H5](#w5-h5) |
| **Vinh** | [W5-V1](#w5-v1) | [W5-V2](#w5-v2) | [W5-V3](#w5-v3) | [W5-V4](#w5-v4) | [W5-V5](#w5-v5) |
| **Tùng** | [W5-T1](#w5-t1) | [W5-T2](#w5-t2) | [W5-T3](#w5-t3) | [W5-T4](#w5-t4) | [W5-T5](#w5-t5) |

## Definition of Done chung cho mọi task

- [ ] Đọc AGENTS.md và tài liệu module liên quan trước khi sửa.

## Checklist Gate & Sign-off cuối W5

- [ ] 20/20 task cá nhân hoàn thành hoặc có waiver được cả nhóm chấp thuận.

## End W5 — Assignment-Complete Stable

<b>Điểm đồ án kỳ vọng: 9.7–10/10.</b> Có 20 task owner rõ ràng, full BRD evidence và stable demo candidate. Production foundation khoảng 8.3–8.5/10; W6 tiếp tục concurrency, security, reconciliation và operational hardening.

---

# Chi tiết Task

## <a id="w5-d1"></a>W5-D1: Khóa BRD/rubric acceptance baseline

- **Người thực hiện:** Duy (Acceptance & Security Lead)
- **Thời gian:** Thứ 3
- **Dependency:** Đầu vào: strong-fix và tài liệu dự án. Đầu ra chặn W5-D2/H2/V2/T2.
- **Rủi ro kiểm soát:** Rủi ro: mở scope ngoài rubric; phải ghi Out-of-scope thay vì tự thêm feature.

### Mục tiêu
Tạo nguồn sự thật duy nhất cho phạm vi chấm điểm và severity trước khi nhóm sửa tiếp.

### Phạm vi thực hiện
-  Đối chiếu BRD, acceptance criteria và demo script với code hiện tại
-  Lập matrix Implemented/Partial/Mock/Out-of-scope cho ba portal
-  Tạo P0/P1/P2/P3 board có owner và reproduction
-  Khóa baseline commit/tag và quy tắc stop-the-line

### Output bàn giao
-  BRD/rubric evidence matrix có link page/API/test
-  Bug board ưu tiên và daily checkpoint template
-  Role matrix Customer/Partner/Admin
-  Baseline decision record

### Acceptance Criteria
-  100% core rubric item có trạng thái và owner
-  Không còn tiêu chí mơ hồ hoặc chỉ đánh dấu bằng cảm tính
-  P0 baseline chặn Thứ 4
-  Cả nhóm xác nhận matrix

### Verify / Test
-  Review chéo matrix với Huy/Vinh/Tùng
-  Smoke canonical flow để kiểm tra mapping
-  Kiểm tra link evidence không hỏng

### Handoff Prompt
```text
Bạn là Acceptance & Security Lead của dự án ViVouch, phụ trách W5-D1 — Khóa BRD/rubric acceptance baseline.

MỤC TIÊU:
Tạo nguồn sự thật duy nhất cho phạm vi chấm điểm và severity trước khi nhóm sửa tiếp.

PHẠM VI BẮT BUỘC:
1. Đối chiếu BRD, acceptance criteria và demo script với code hiện tại
2. Lập matrix Implemented/Partial/Mock/Out-of-scope cho ba portal
3. Tạo P0/P1/P2/P3 board có owner và reproduction
4. Khóa baseline commit/tag và quy tắc stop-the-line

OUTPUT PHẢI BÀN GIAO:
1. BRD/rubric evidence matrix có link page/API/test
2. Bug board ưu tiên và daily checkpoint template
3. Role matrix Customer/Partner/Admin
4. Baseline decision record

ACCEPTANCE CRITERIA:
- 100% core rubric item có trạng thái và owner
- Không còn tiêu chí mơ hồ hoặc chỉ đánh dấu bằng cảm tính
- P0 baseline chặn Thứ 4
- Cả nhóm xác nhận matrix

VERIFY/TEST:
- Review chéo matrix với Huy/Vinh/Tùng
- Smoke canonical flow để kiểm tra mapping
- Kiểm tra link evidence không hỏng

DEPENDENCY:
Đầu vào: strong-fix và tài liệu dự án. Đầu ra chặn W5-D2/H2/V2/T2.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: mở scope ngoài rubric; phải ghi Out-of-scope thay vì tự thêm feature.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-h1"></a>W5-H1: Clean setup, DB và test baseline

- **Người thực hiện:** Huy (Backend & Data Lead)
- **Thời gian:** Thứ 3
- **Dependency:** Đầu vào: branch review-fix ổn định. Cung cấp baseline cho toàn bộ lane backend.
- **Rủi ro kiểm soát:** Rủi ro: test pollution hoặc dùng nhầm DATABASE_URL; xác nhận DB name trước cleanup.

### Mục tiêu
Chứng minh backend có thể dựng và chạy lại từ môi trường sạch, không phụ thuộc dữ liệu máy cá nhân.

### Phạm vi thực hiện
-  Kiểm tra lockfile và npm install/npm ci
-  Xác minh env contract, Prisma validate/generate/migrate/seed
-  Chạy targeted core suite và full backend suite
-  Ghi schema/migration/seed drift nếu có

### Output bàn giao
-  Setup log và command chuẩn
-  DB baseline report
-  Test result có pass/fail/skip
-  Blocker reproduction nếu clean setup fail

### Acceptance Criteria
-  DB test sạch migrate và seed thành công
-  Không sửa lockfile tùy tiện để che lỗi
-  Backend full suite có kết quả tái hiện được
-  Không dùng production DB

### Verify / Test
-  npm ci hoặc quyết định lockfile rõ ràng
-  npx prisma validate và prisma generate
-  npm test
-  Lặp lại từ DB sạch

### Handoff Prompt
```text
Bạn là Backend & Data Lead của dự án ViVouch, phụ trách W5-H1 — Clean setup, DB và test baseline.

MỤC TIÊU:
Chứng minh backend có thể dựng và chạy lại từ môi trường sạch, không phụ thuộc dữ liệu máy cá nhân.

PHẠM VI BẮT BUỘC:
1. Kiểm tra lockfile và npm install/npm ci
2. Xác minh env contract, Prisma validate/generate/migrate/seed
3. Chạy targeted core suite và full backend suite
4. Ghi schema/migration/seed drift nếu có

OUTPUT PHẢI BÀN GIAO:
1. Setup log và command chuẩn
2. DB baseline report
3. Test result có pass/fail/skip
4. Blocker reproduction nếu clean setup fail

ACCEPTANCE CRITERIA:
- DB test sạch migrate và seed thành công
- Không sửa lockfile tùy tiện để che lỗi
- Backend full suite có kết quả tái hiện được
- Không dùng production DB

VERIFY/TEST:
- npm ci hoặc quyết định lockfile rõ ràng
- npx prisma validate và prisma generate
- npm test
- Lặp lại từ DB sạch

DEPENDENCY:
Đầu vào: branch review-fix ổn định. Cung cấp baseline cho toàn bộ lane backend.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: test pollution hoặc dùng nhầm DATABASE_URL; xác nhận DB name trước cleanup.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-v1"></a>W5-V1: Customer portal smoke & gap inventory

- **Người thực hiện:** Vinh (Customer Portal Lead)
- **Thời gian:** Thứ 3
- **Dependency:** Dùng setup của Huy và rubric của Duy; đầu ra cho W5-V2.
- **Rủi ro kiểm soát:** Rủi ro: nhầm lỗi seed với lỗi UI; luôn kiểm tra response API.

### Mục tiêu
Lập inventory chính xác cho toàn bộ hành trình Customer trước khi đóng gap.

### Phạm vi thực hiện
-  Browse/search/filter/detail voucher
-  Cart, checkout, gift recipient và order success
-  My orders, my vouchers, review và profile
-  Loading/empty/error/success ở 375/768/1280

### Output bàn giao
-  Customer route matrix
-  Screenshot/reproduction cho từng gap
-  Console/network error inventory
-  Ưu tiên customer P0/P1/P2

### Acceptance Criteria
-  Mọi customer route in-scope đã smoke
-  Gap gắn BRD ID và expected behavior
-  Không đánh PASS bằng mock-only data
-  Blocker báo trong ngày

### Verify / Test
-  Chạy app với seed chuẩn
-  DevTools network và console
-  Manual smoke ba viewport

### Handoff Prompt
```text
Bạn là Customer Portal Lead của dự án ViVouch, phụ trách W5-V1 — Customer portal smoke & gap inventory.

MỤC TIÊU:
Lập inventory chính xác cho toàn bộ hành trình Customer trước khi đóng gap.

PHẠM VI BẮT BUỘC:
1. Browse/search/filter/detail voucher
2. Cart, checkout, gift recipient và order success
3. My orders, my vouchers, review và profile
4. Loading/empty/error/success ở 375/768/1280

OUTPUT PHẢI BÀN GIAO:
1. Customer route matrix
2. Screenshot/reproduction cho từng gap
3. Console/network error inventory
4. Ưu tiên customer P0/P1/P2

ACCEPTANCE CRITERIA:
- Mọi customer route in-scope đã smoke
- Gap gắn BRD ID và expected behavior
- Không đánh PASS bằng mock-only data
- Blocker báo trong ngày

VERIFY/TEST:
- Chạy app với seed chuẩn
- DevTools network và console
- Manual smoke ba viewport

DEPENDENCY:
Dùng setup của Huy và rubric của Duy; đầu ra cho W5-V2.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: nhầm lỗi seed với lỗi UI; luôn kiểm tra response API.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-t1"></a>W5-T1: Partner/Admin smoke & gap inventory

- **Người thực hiện:** Tùng (Partner & Admin Portal Lead)
- **Thời gian:** Thứ 3
- **Dependency:** Dùng setup H1 và matrix D1; đầu ra cho W5-T2.
- **Rủi ro kiểm soát:** Rủi ro: dùng admin/partner sai trạng thái làm sai kết luận; ghi rõ test fixture.

### Mục tiêu
Khóa danh sách gap chức năng và UX của Partner/Admin theo flow vận hành thật.

### Phạm vi thực hiện
-  Partner profile, branch, voucher create/edit/list/submit
-  Redeem đúng/sai partner và branch
-  Reports/dashboard states
-  Admin users, partners, vouchers, orders và audit

### Output bàn giao
-  Partner/Admin route matrix
-  Gap list có severity và reproduction
-  Role/ownership failure cases
-  Ảnh/network evidence

### Acceptance Criteria
-  Mọi route Partner/Admin in-scope đã smoke
-  Approve/reject/redeem có success và failure observation
-  Không bỏ qua suspended/locked/inactive
-  Gap liên kết rubric

### Verify / Test
-  Seed accounts theo role
-  Manual smoke ở ba viewport
-  Kiểm tra DB/audit cho action quan trọng

### Handoff Prompt
```text
Bạn là Partner & Admin Portal Lead của dự án ViVouch, phụ trách W5-T1 — Partner/Admin smoke & gap inventory.

MỤC TIÊU:
Khóa danh sách gap chức năng và UX của Partner/Admin theo flow vận hành thật.

PHẠM VI BẮT BUỘC:
1. Partner profile, branch, voucher create/edit/list/submit
2. Redeem đúng/sai partner và branch
3. Reports/dashboard states
4. Admin users, partners, vouchers, orders và audit

OUTPUT PHẢI BÀN GIAO:
1. Partner/Admin route matrix
2. Gap list có severity và reproduction
3. Role/ownership failure cases
4. Ảnh/network evidence

ACCEPTANCE CRITERIA:
- Mọi route Partner/Admin in-scope đã smoke
- Approve/reject/redeem có success và failure observation
- Không bỏ qua suspended/locked/inactive
- Gap liên kết rubric

VERIFY/TEST:
- Seed accounts theo role
- Manual smoke ở ba viewport
- Kiểm tra DB/audit cho action quan trọng

DEPENDENCY:
Dùng setup H1 và matrix D1; đầu ra cho W5-T2.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: dùng admin/partner sai trạng thái làm sai kết luận; ghi rõ test fixture.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-d2"></a>W5-D2: Đóng gap RBAC và acceptance semantics

- **Người thực hiện:** Duy (Acceptance & Security Lead)
- **Thời gian:** Thứ 4
- **Dependency:** Phụ thuộc D1 và code lanes ngày Thứ 4; cung cấp contract cho D3.
- **Rủi ro kiểm soát:** Rủi ro: sửa UI thay vì enforcement service; backend là nguồn quyết định.

### Mục tiêu
Bảo đảm mọi core action đúng role, owner và business status như rubric yêu cầu.

### Phạm vi thực hiện
-  Review auth middleware và role guards
-  Kiểm tra locked user, suspended/unapproved partner
-  Đối chiếu voucher lifecycle và error codes
-  Review fix của H2/V2/T2 theo acceptance matrix

### Output bàn giao
-  RBAC/status decision table
-  Danh sách acceptance fix đã duyệt
-  Regression scenarios cho invalid role/status
-  Cập nhật rubric matrix

### Acceptance Criteria
-  Không còn route core thiếu guard
-  Client không quyết định authorization thay backend
-  401/403/400 semantics nhất quán
-  P0/P1 được đóng hoặc stop-line

### Verify / Test
-  Targeted auth/admin/redeem tests
-  Manual cross-role requests
-  Review response code/message

### Handoff Prompt
```text
Bạn là Acceptance & Security Lead của dự án ViVouch, phụ trách W5-D2 — Đóng gap RBAC và acceptance semantics.

MỤC TIÊU:
Bảo đảm mọi core action đúng role, owner và business status như rubric yêu cầu.

PHẠM VI BẮT BUỘC:
1. Review auth middleware và role guards
2. Kiểm tra locked user, suspended/unapproved partner
3. Đối chiếu voucher lifecycle và error codes
4. Review fix của H2/V2/T2 theo acceptance matrix

OUTPUT PHẢI BÀN GIAO:
1. RBAC/status decision table
2. Danh sách acceptance fix đã duyệt
3. Regression scenarios cho invalid role/status
4. Cập nhật rubric matrix

ACCEPTANCE CRITERIA:
- Không còn route core thiếu guard
- Client không quyết định authorization thay backend
- 401/403/400 semantics nhất quán
- P0/P1 được đóng hoặc stop-line

VERIFY/TEST:
- Targeted auth/admin/redeem tests
- Manual cross-role requests
- Review response code/message

DEPENDENCY:
Phụ thuộc D1 và code lanes ngày Thứ 4; cung cấp contract cho D3.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: sửa UI thay vì enforcement service; backend là nguồn quyết định.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-h2"></a>W5-H2: Đóng backend BRD & data consistency gaps

- **Người thực hiện:** Huy (Backend & Data Lead)
- **Thời gian:** Thứ 4
- **Dependency:** Nhận bug board D1, portal reproduction V1/T1; bàn giao API cho V2/T2.
- **Rủi ro kiểm soát:** Rủi ro: gom nhiều module vào một diff khó review; chia commit/task scope rõ.

### Mục tiêu
Sửa các gap backend core được xác nhận ở baseline mà không mở feature ngoài BRD.

### Phạm vi thực hiện
-  Checkout/order/payment/voucher-code data integrity
-  Voucher price/date/stock/partner guards
-  Review eligibility và audit action
-  Partner/Admin filter, pagination, reports field thật

### Output bàn giao
-  Backend fixes theo module
-  Regression tests cho mỗi gap
-  DB before/after evidence
-  Danh sách schema change nếu thật sự cần, ưu tiên không đổi

### Acceptance Criteria
-  Core matrix backend chuyển Implemented
-  Controller mỏng, business logic ở service
-  Transaction/audit giữ nguyên tính nguyên tử
-  Không raw Prisma error ra client

### Verify / Test
-  Targeted module tests
-  DB assertions cho order/code/soldQty/log
-  Prisma validate nếu chạm schema

### Handoff Prompt
```text
Bạn là Backend & Data Lead của dự án ViVouch, phụ trách W5-H2 — Đóng backend BRD & data consistency gaps.

MỤC TIÊU:
Sửa các gap backend core được xác nhận ở baseline mà không mở feature ngoài BRD.

PHẠM VI BẮT BUỘC:
1. Checkout/order/payment/voucher-code data integrity
2. Voucher price/date/stock/partner guards
3. Review eligibility và audit action
4. Partner/Admin filter, pagination, reports field thật

OUTPUT PHẢI BÀN GIAO:
1. Backend fixes theo module
2. Regression tests cho mỗi gap
3. DB before/after evidence
4. Danh sách schema change nếu thật sự cần, ưu tiên không đổi

ACCEPTANCE CRITERIA:
- Core matrix backend chuyển Implemented
- Controller mỏng, business logic ở service
- Transaction/audit giữ nguyên tính nguyên tử
- Không raw Prisma error ra client

VERIFY/TEST:
- Targeted module tests
- DB assertions cho order/code/soldQty/log
- Prisma validate nếu chạm schema

DEPENDENCY:
Nhận bug board D1, portal reproduction V1/T1; bàn giao API cho V2/T2.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: gom nhiều module vào một diff khó review; chia commit/task scope rõ.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-v2"></a>W5-V2: Đóng Customer functional gaps

- **Người thực hiện:** Vinh (Customer Portal Lead)
- **Thời gian:** Thứ 4
- **Dependency:** Dựa H2 API và D2 semantics; output cho V3.
- **Rủi ro kiểm soát:** Rủi ro: stale React Query cache; verify sau mutation và reload.

### Mục tiêu
Hoàn tất hành trình Customer theo BRD bằng API thật và state đúng.

### Phạm vi thực hiện
-  Browse/detail/filter/cart quantity
-  Checkout gift recipient, idempotent retry và success mapping
-  My vouchers/order history/review eligibility
-  Profile/auth navigation và cache invalidation

### Output bàn giao
-  Customer implementation fixes
-  Unit/checklist evidence từng gap
-  API contract mismatch list gửi Huy
-  Updated customer route matrix

### Acceptance Criteria
-  Canonical customer flow chạy end-to-end
-  Không placeholder/mock che API thiếu
-  Double action được khóa
-  Success screen dùng data response thật

### Verify / Test
-  Frontend tests liên quan
-  Manual flow seed data
-  Network inspection và DB spot-check

### Handoff Prompt
```text
Bạn là Customer Portal Lead của dự án ViVouch, phụ trách W5-V2 — Đóng Customer functional gaps.

MỤC TIÊU:
Hoàn tất hành trình Customer theo BRD bằng API thật và state đúng.

PHẠM VI BẮT BUỘC:
1. Browse/detail/filter/cart quantity
2. Checkout gift recipient, idempotent retry và success mapping
3. My vouchers/order history/review eligibility
4. Profile/auth navigation và cache invalidation

OUTPUT PHẢI BÀN GIAO:
1. Customer implementation fixes
2. Unit/checklist evidence từng gap
3. API contract mismatch list gửi Huy
4. Updated customer route matrix

ACCEPTANCE CRITERIA:
- Canonical customer flow chạy end-to-end
- Không placeholder/mock che API thiếu
- Double action được khóa
- Success screen dùng data response thật

VERIFY/TEST:
- Frontend tests liên quan
- Manual flow seed data
- Network inspection và DB spot-check

DEPENDENCY:
Dựa H2 API và D2 semantics; output cho V3.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: stale React Query cache; verify sau mutation và reload.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-t2"></a>W5-T2: Đóng Partner/Admin functional gaps

- **Người thực hiện:** Tùng (Partner & Admin Portal Lead)
- **Thời gian:** Thứ 4
- **Dependency:** Dựa H2 backend và D2 RBAC; output cho T3.
- **Rủi ro kiểm soát:** Rủi ro: UI success khi backend rollback; kiểm tra response và DB.

### Mục tiêu
Hoàn tất luồng vận hành Partner/Admin và đảm bảo action phản ánh data thật.

### Phạm vi thực hiện
-  Partner branch/profile/voucher create-edit-submit
-  Redeem branch scoped và result mapping
-  Partner reports filters/metrics
-  Admin approve/reject/search/order/audit flows

### Output bàn giao
-  Portal implementation fixes
-  Contract mismatch list
-  Regression checklist
-  Updated portal matrix

### Acceptance Criteria
-  Partner chỉ thao tác own scope
-  Admin action tạo audit phù hợp
-  Redeem không consume code khi failure
-  Dashboard/report không dùng hardcode

### Verify / Test
-  Portal targeted tests nếu có
-  Manual E2E Partner/Admin
-  DB audit/usage-log assertions

### Handoff Prompt
```text
Bạn là Partner & Admin Portal Lead của dự án ViVouch, phụ trách W5-T2 — Đóng Partner/Admin functional gaps.

MỤC TIÊU:
Hoàn tất luồng vận hành Partner/Admin và đảm bảo action phản ánh data thật.

PHẠM VI BẮT BUỘC:
1. Partner branch/profile/voucher create-edit-submit
2. Redeem branch scoped và result mapping
3. Partner reports filters/metrics
4. Admin approve/reject/search/order/audit flows

OUTPUT PHẢI BÀN GIAO:
1. Portal implementation fixes
2. Contract mismatch list
3. Regression checklist
4. Updated portal matrix

ACCEPTANCE CRITERIA:
- Partner chỉ thao tác own scope
- Admin action tạo audit phù hợp
- Redeem không consume code khi failure
- Dashboard/report không dùng hardcode

VERIFY/TEST:
- Portal targeted tests nếu có
- Manual E2E Partner/Admin
- DB audit/usage-log assertions

DEPENDENCY:
Dựa H2 backend và D2 RBAC; output cho T3.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: UI success khi backend rollback; kiểm tra response và DB.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-d3"></a>W5-D3: Chuẩn hóa API/error contract & evidence rules

- **Người thực hiện:** Duy (Acceptance & Security Lead)
- **Thời gian:** Thứ 5
- **Dependency:** Phụ thuộc closure ngày Thứ 4; chặn regression matrix ngày Thứ 6.
- **Rủi ro kiểm soát:** Rủi ro: đổi contract quá rộng; giữ backward compatibility hoặc cập nhật consumer cùng task.

### Mục tiêu
Làm cho response và UX có semantics ổn định để demo và test không phụ thuộc raw error.

### Phạm vi thực hiện
-  Chuẩn success/message/code/details core endpoints
-  Phân biệt validation, auth, forbidden, conflict, not found
-  Kiểm tra production không leak stack/internal
-  Định nghĩa evidence tối thiểu cho từng rubric item

### Output bàn giao
-  API/error contract matrix
-  Approved message/code vocabulary
-  Evidence naming và storage convention
-  Review notes cho V3/T3/H3

### Acceptance Criteria
-  Core failure path có code ổn định
-  Không raw Prisma/stack ở production response
-  Frontend mapping theo code, không parse message mong manh
-  Matrix được các lane áp dụng

### Verify / Test
-  Sample request/response review
-  Production-mode error smoke
-  Cross-check frontend error handling

### Handoff Prompt
```text
Bạn là Acceptance & Security Lead của dự án ViVouch, phụ trách W5-D3 — Chuẩn hóa API/error contract & evidence rules.

MỤC TIÊU:
Làm cho response và UX có semantics ổn định để demo và test không phụ thuộc raw error.

PHẠM VI BẮT BUỘC:
1. Chuẩn success/message/code/details core endpoints
2. Phân biệt validation, auth, forbidden, conflict, not found
3. Kiểm tra production không leak stack/internal
4. Định nghĩa evidence tối thiểu cho từng rubric item

OUTPUT PHẢI BÀN GIAO:
1. API/error contract matrix
2. Approved message/code vocabulary
3. Evidence naming và storage convention
4. Review notes cho V3/T3/H3

ACCEPTANCE CRITERIA:
- Core failure path có code ổn định
- Không raw Prisma/stack ở production response
- Frontend mapping theo code, không parse message mong manh
- Matrix được các lane áp dụng

VERIFY/TEST:
- Sample request/response review
- Production-mode error smoke
- Cross-check frontend error handling

DEPENDENCY:
Phụ thuộc closure ngày Thứ 4; chặn regression matrix ngày Thứ 6.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: đổi contract quá rộng; giữ backward compatibility hoặc cập nhật consumer cùng task.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-h3"></a>W5-H3: Tự động hóa API contract regression

- **Người thực hiện:** Huy (Backend & Data Lead)
- **Thời gian:** Thứ 5
- **Dependency:** Nhận contract D3 và fixes H2; cung cấp suite cho H4/D4.
- **Rủi ro kiểm soát:** Rủi ro: brittle exact-message assertion; ưu tiên stable error code.

### Mục tiêu
Biến các business/error contract quan trọng thành test lặp lại được.

### Phạm vi thực hiện
-  Auth/locked/role response contracts
-  Voucher schedule/stock/status validation
-  Checkout replay and failure contracts
-  Redeem wrong branch/partner/status contracts

### Output bàn giao
-  Targeted integration tests
-  Test fixtures cleanup an toàn
-  Contract assertion helpers tối thiểu
-  Test command cho handoff

### Acceptance Criteria
-  Test kiểm tra code và data side effects, không chỉ status
-  Không test pollution
-  Không phụ thuộc thứ tự file
-  Failure message hữu ích

### Verify / Test
-  Chạy targeted suite hai lần
-  Chạy trong full backend suite
-  Kiểm tra DB cleanup

### Handoff Prompt
```text
Bạn là Backend & Data Lead của dự án ViVouch, phụ trách W5-H3 — Tự động hóa API contract regression.

MỤC TIÊU:
Biến các business/error contract quan trọng thành test lặp lại được.

PHẠM VI BẮT BUỘC:
1. Auth/locked/role response contracts
2. Voucher schedule/stock/status validation
3. Checkout replay and failure contracts
4. Redeem wrong branch/partner/status contracts

OUTPUT PHẢI BÀN GIAO:
1. Targeted integration tests
2. Test fixtures cleanup an toàn
3. Contract assertion helpers tối thiểu
4. Test command cho handoff

ACCEPTANCE CRITERIA:
- Test kiểm tra code và data side effects, không chỉ status
- Không test pollution
- Không phụ thuộc thứ tự file
- Failure message hữu ích

VERIFY/TEST:
- Chạy targeted suite hai lần
- Chạy trong full backend suite
- Kiểm tra DB cleanup

DEPENDENCY:
Nhận contract D3 và fixes H2; cung cấp suite cho H4/D4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: brittle exact-message assertion; ưu tiên stable error code.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-v3"></a>W5-V3: Customer UX states & responsive closure

- **Người thực hiện:** Vinh (Customer Portal Lead)
- **Thời gian:** Thứ 5
- **Dependency:** Dựa V2 và D3 contract; đầu ra cho V4.
- **Rủi ro kiểm soát:** Rủi ro: redesign ngoài rubric; chỉ sửa usability và correctness.

### Mục tiêu
Đưa Customer portal tới mức demo-ready ở bốn UI state và ba viewport.

### Phạm vi thực hiện
-  Loading skeleton/disabled double action
-  Empty state có next action
-  Error có code-based message và retry
-  Responsive 375/768/1280, focus/label cơ bản

### Output bàn giao
-  UX state fixes
-  Responsive evidence
-  Error mapping table
-  Console-clean checklist

### Acceptance Criteria
-  Không alert/debug/blank screen
-  Không overflow core page
-  Token expired/locked/validation rõ nghĩa
-  Mutation thành công cập nhật UI đúng

### Verify / Test
-  Frontend unit tests
-  Manual viewport matrix
-  Keyboard/focus smoke
-  Production build

### Handoff Prompt
```text
Bạn là Customer Portal Lead của dự án ViVouch, phụ trách W5-V3 — Customer UX states & responsive closure.

MỤC TIÊU:
Đưa Customer portal tới mức demo-ready ở bốn UI state và ba viewport.

PHẠM VI BẮT BUỘC:
1. Loading skeleton/disabled double action
2. Empty state có next action
3. Error có code-based message và retry
4. Responsive 375/768/1280, focus/label cơ bản

OUTPUT PHẢI BÀN GIAO:
1. UX state fixes
2. Responsive evidence
3. Error mapping table
4. Console-clean checklist

ACCEPTANCE CRITERIA:
- Không alert/debug/blank screen
- Không overflow core page
- Token expired/locked/validation rõ nghĩa
- Mutation thành công cập nhật UI đúng

VERIFY/TEST:
- Frontend unit tests
- Manual viewport matrix
- Keyboard/focus smoke
- Production build

DEPENDENCY:
Dựa V2 và D3 contract; đầu ra cho V4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: redesign ngoài rubric; chỉ sửa usability và correctness.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-t3"></a>W5-T3: Partner/Admin UX states & responsive closure

- **Người thực hiện:** Tùng (Partner & Admin Portal Lead)
- **Thời gian:** Thứ 5
- **Dependency:** Dựa T2 và D3; đầu ra T4.
- **Rủi ro kiểm soát:** Rủi ro: success toast che data stale; refetch và kiểm tra row/status.

### Mục tiêu
Làm portal vận hành rõ ràng khi loading, empty, error, success và trên viewport nhỏ.

### Phạm vi thực hiện
-  Form validation và disabled actions
-  Approve/reject/redeem success/failure cards
-  Table/filter empty and error states
-  Responsive dashboard/report/form/navigation

### Output bàn giao
-  Portal UX fixes
-  State matrix và screenshots
-  Error-code mapping
-  Accessibility smoke notes

### Acceptance Criteria
-  Không stale branch/status sau mutation
-  Không raw API/Prisma error
-  Danger action có confirmation/clear outcome
-  375/768/1280 usable

### Verify / Test
-  Manual portal matrix
-  Frontend build/tests
-  Network and console inspection

### Handoff Prompt
```text
Bạn là Partner & Admin Portal Lead của dự án ViVouch, phụ trách W5-T3 — Partner/Admin UX states & responsive closure.

MỤC TIÊU:
Làm portal vận hành rõ ràng khi loading, empty, error, success và trên viewport nhỏ.

PHẠM VI BẮT BUỘC:
1. Form validation và disabled actions
2. Approve/reject/redeem success/failure cards
3. Table/filter empty and error states
4. Responsive dashboard/report/form/navigation

OUTPUT PHẢI BÀN GIAO:
1. Portal UX fixes
2. State matrix và screenshots
3. Error-code mapping
4. Accessibility smoke notes

ACCEPTANCE CRITERIA:
- Không stale branch/status sau mutation
- Không raw API/Prisma error
- Danger action có confirmation/clear outcome
- 375/768/1280 usable

VERIFY/TEST:
- Manual portal matrix
- Frontend build/tests
- Network and console inspection

DEPENDENCY:
Dựa T2 và D3; đầu ra T4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: success toast che data stale; refetch và kiểm tra row/status.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-d4"></a>W5-D4: Security & rubric acceptance regression

- **Người thực hiện:** Duy (Acceptance & Security Lead)
- **Thời gian:** Thứ 6
- **Dependency:** Phụ thuộc D3 và regression của ba lane; chặn D5 nếu fail.
- **Rủi ro kiểm soát:** Rủi ro: thiếu độc lập review; dùng evidence và reproduction, không chỉ trao đổi miệng.

### Mục tiêu
Độc lập xác nhận core flow đạt rubric và không có regression quyền/trạng thái.

### Phạm vi thực hiện
-  Cross-role/ownership negative matrix
-  Locked/suspended/inactive scenarios
-  Voucher lifecycle acceptance
-  Review evidence của H4/V4/T4 và phân severity

### Output bàn giao
-  Acceptance regression report
-  P0/P1 disposition
-  Rubric evidence links đã verify
-  GO/hold recommendation cho Thứ 7

### Acceptance Criteria
-  Không self-asserted PASS từ task owner
-  Mọi P0/P1 có retest evidence
-  Role/status negative paths pass
-  Matrix không còn core Partial

### Verify / Test
-  Targeted security tests
-  Manual API negative calls
-  Evidence sampling

### Handoff Prompt
```text
Bạn là Acceptance & Security Lead của dự án ViVouch, phụ trách W5-D4 — Security & rubric acceptance regression.

MỤC TIÊU:
Độc lập xác nhận core flow đạt rubric và không có regression quyền/trạng thái.

PHẠM VI BẮT BUỘC:
1. Cross-role/ownership negative matrix
2. Locked/suspended/inactive scenarios
3. Voucher lifecycle acceptance
4. Review evidence của H4/V4/T4 và phân severity

OUTPUT PHẢI BÀN GIAO:
1. Acceptance regression report
2. P0/P1 disposition
3. Rubric evidence links đã verify
4. GO/hold recommendation cho Thứ 7

ACCEPTANCE CRITERIA:
- Không self-asserted PASS từ task owner
- Mọi P0/P1 có retest evidence
- Role/status negative paths pass
- Matrix không còn core Partial

VERIFY/TEST:
- Targeted security tests
- Manual API negative calls
- Evidence sampling

DEPENDENCY:
Phụ thuộc D3 và regression của ba lane; chặn D5 nếu fail.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: thiếu độc lập review; dùng evidence và reproduction, không chỉ trao đổi miệng.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-h4"></a>W5-H4: Full backend regression ×2 & DB evidence

- **Người thực hiện:** Huy (Backend & Data Lead)
- **Thời gian:** Thứ 6
- **Dependency:** Dựa H3 suite và code freeze chiều Thứ 5; output H5/D4.
- **Rủi ro kiểm soát:** Rủi ro: concurrent teammate push giữa hai run; khóa commit SHA khi test.

### Mục tiêu
Chứng minh backend ổn định, không flaky/pollution và giữ toàn vẹn dữ liệu.

### Phạm vi thực hiện
-  Targeted auth/approval/checkout/redeem/review
-  Full backend suite hai lần liên tiếp
-  DB assertions order/payment/code/soldQty/audit/usage log
-  Prisma validate/generate và seed smoke

### Output bàn giao
-  Full test logs ×2
-  Data integrity evidence
-  Flaky/pollution report
-  Backend P0/P1 retest

### Acceptance Criteria
-  Full suite pass hai lần
-  Không skip mới
-  Replay không ghi/trừ lần hai
-  Failure transaction rollback sạch

### Verify / Test
-  npm test ×2
-  Queries before/after scenarios
-  Clean DB rerun

### Handoff Prompt
```text
Bạn là Backend & Data Lead của dự án ViVouch, phụ trách W5-H4 — Full backend regression ×2 & DB evidence.

MỤC TIÊU:
Chứng minh backend ổn định, không flaky/pollution và giữ toàn vẹn dữ liệu.

PHẠM VI BẮT BUỘC:
1. Targeted auth/approval/checkout/redeem/review
2. Full backend suite hai lần liên tiếp
3. DB assertions order/payment/code/soldQty/audit/usage log
4. Prisma validate/generate và seed smoke

OUTPUT PHẢI BÀN GIAO:
1. Full test logs ×2
2. Data integrity evidence
3. Flaky/pollution report
4. Backend P0/P1 retest

ACCEPTANCE CRITERIA:
- Full suite pass hai lần
- Không skip mới
- Replay không ghi/trừ lần hai
- Failure transaction rollback sạch

VERIFY/TEST:
- npm test ×2
- Queries before/after scenarios
- Clean DB rerun

DEPENDENCY:
Dựa H3 suite và code freeze chiều Thứ 5; output H5/D4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: concurrent teammate push giữa hai run; khóa commit SHA khi test.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-v4"></a>W5-V4: Customer E2E & data evidence

- **Người thực hiện:** Vinh (Customer Portal Lead)
- **Thời gian:** Thứ 6
- **Dependency:** Dựa V3 và H4 candidate; output V5/D4.
- **Rủi ro kiểm soát:** Rủi ro: test data dùng lại gây false failure; tạo fixture/seed reset rõ.

### Mục tiêu
Xác nhận Customer success/failure paths trên candidate bằng data thật.

### Phạm vi thực hiện
-  Browse→cart→checkout→order success
-  Gift fields và retry/replay behavior
-  My vouchers→redeem precondition→review
-  Auth/error/responsive negative paths

### Output bàn giao
-  Customer E2E matrix
-  Screenshots/video tối thiểu
-  Order/voucher-code DB spot-check
-  Bug reproduction và retest

### Acceptance Criteria
-  Canonical customer flow pass
-  Out-of-stock/expired/duplicate rõ nghĩa
-  No console error
-  Ba viewport pass

### Verify / Test
-  Manual E2E trên frozen SHA
-  Frontend tests/build
-  API/DB spot checks với Huy

### Handoff Prompt
```text
Bạn là Customer Portal Lead của dự án ViVouch, phụ trách W5-V4 — Customer E2E & data evidence.

MỤC TIÊU:
Xác nhận Customer success/failure paths trên candidate bằng data thật.

PHẠM VI BẮT BUỘC:
1. Browse→cart→checkout→order success
2. Gift fields và retry/replay behavior
3. My vouchers→redeem precondition→review
4. Auth/error/responsive negative paths

OUTPUT PHẢI BÀN GIAO:
1. Customer E2E matrix
2. Screenshots/video tối thiểu
3. Order/voucher-code DB spot-check
4. Bug reproduction và retest

ACCEPTANCE CRITERIA:
- Canonical customer flow pass
- Out-of-stock/expired/duplicate rõ nghĩa
- No console error
- Ba viewport pass

VERIFY/TEST:
- Manual E2E trên frozen SHA
- Frontend tests/build
- API/DB spot checks với Huy

DEPENDENCY:
Dựa V3 và H4 candidate; output V5/D4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: test data dùng lại gây false failure; tạo fixture/seed reset rõ.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-t4"></a>W5-T4: Partner/Admin E2E & audit evidence

- **Người thực hiện:** Tùng (Partner & Admin Portal Lead)
- **Thời gian:** Thứ 6
- **Dependency:** Dựa T3, H4 và D3 contract; output T5/D4.
- **Rủi ro kiểm soát:** Rủi ro: redeem code reuse giữa test cases; tách fixture từng scenario.

### Mục tiêu
Xác nhận vận hành Partner/Admin end-to-end và traceability đúng.

### Phạm vi thực hiện
-  Partner create/update/submit voucher
-  Admin approve/reject và dashboard/search
-  Redeem đúng branch và negative cases
-  Reports, audit log, usage log

### Output bàn giao
-  Partner/Admin E2E matrix
-  Audit/usage DB evidence
-  Responsive screenshots
-  Bug/retest report

### Acceptance Criteria
-  Wrong partner/branch không consume code
-  Approve/reject phản ánh status thật
-  Audit actor/target/action đúng
-  Portal không console error

### Verify / Test
-  Manual E2E frozen SHA
-  Backend targeted tests liên quan
-  DB audit/usage assertions

### Handoff Prompt
```text
Bạn là Partner & Admin Portal Lead của dự án ViVouch, phụ trách W5-T4 — Partner/Admin E2E & audit evidence.

MỤC TIÊU:
Xác nhận vận hành Partner/Admin end-to-end và traceability đúng.

PHẠM VI BẮT BUỘC:
1. Partner create/update/submit voucher
2. Admin approve/reject và dashboard/search
3. Redeem đúng branch và negative cases
4. Reports, audit log, usage log

OUTPUT PHẢI BÀN GIAO:
1. Partner/Admin E2E matrix
2. Audit/usage DB evidence
3. Responsive screenshots
4. Bug/retest report

ACCEPTANCE CRITERIA:
- Wrong partner/branch không consume code
- Approve/reject phản ánh status thật
- Audit actor/target/action đúng
- Portal không console error

VERIFY/TEST:
- Manual E2E frozen SHA
- Backend targeted tests liên quan
- DB audit/usage assertions

DEPENDENCY:
Dựa T3, H4 và D3 contract; output T5/D4.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: redeem code reuse giữa test cases; tách fixture từng scenario.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-d5"></a>W5-D5: Rubric score, GO/NO-GO & release sign-off

- **Người thực hiện:** Duy (Acceptance & Security Lead)
- **Thời gian:** Thứ 7
- **Dependency:** Phụ thuộc toàn bộ D4/H5/V5/T5.
- **Rủi ro kiểm soát:** Rủi ro: chấm điểm cảm tính; mọi điểm phải gắn evidence cụ thể.

### Mục tiêu
Chốt bằng chứng điểm 10 và quyết định candidate có đủ điều kiện sang W6.

### Phạm vi thực hiện
-  Review 20 task và waiver
-  Tính score theo rubric có evidence
-  Chốt P0/P1/P2/P3 backlog
-  Soạn GO/NO-GO và release notes tổng

### Output bàn giao
-  Final rubric scorecard
-  GO/NO-GO record
-  W6/W7 prioritized backlog
-  4-owner sign-off sheet

### Acceptance Criteria
-  P0/P1 = 0
-  Evidence link truy cập được
-  Known limitations ghi trung thực
-  Không tag nếu gate fail

### Verify / Test
-  Chạy lại canonical smoke
-  Kiểm tra frozen SHA/test logs
-  Thu đủ 4 sign-off

### Handoff Prompt
```text
Bạn là Acceptance & Security Lead của dự án ViVouch, phụ trách W5-D5 — Rubric score, GO/NO-GO & release sign-off.

MỤC TIÊU:
Chốt bằng chứng điểm 10 và quyết định candidate có đủ điều kiện sang W6.

PHẠM VI BẮT BUỘC:
1. Review 20 task và waiver
2. Tính score theo rubric có evidence
3. Chốt P0/P1/P2/P3 backlog
4. Soạn GO/NO-GO và release notes tổng

OUTPUT PHẢI BÀN GIAO:
1. Final rubric scorecard
2. GO/NO-GO record
3. W6/W7 prioritized backlog
4. 4-owner sign-off sheet

ACCEPTANCE CRITERIA:
- P0/P1 = 0
- Evidence link truy cập được
- Known limitations ghi trung thực
- Không tag nếu gate fail

VERIFY/TEST:
- Chạy lại canonical smoke
- Kiểm tra frozen SHA/test logs
- Thu đủ 4 sign-off

DEPENDENCY:
Phụ thuộc toàn bộ D4/H5/V5/T5.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: chấm điểm cảm tính; mọi điểm phải gắn evidence cụ thể.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-h5"></a>W5-H5: Backend release candidate & reproducibility pack

- **Người thực hiện:** Huy (Backend & Data Lead)
- **Thời gian:** Thứ 7
- **Dependency:** Dựa H4 và code freeze; cung cấp sign-off cho D5.
- **Rủi ro kiểm soát:** Rủi ro: tag chứa file local/test output; review tracked files trước đề xuất.

### Mục tiêu
Đóng gói backend candidate có setup/test/data evidence để W6 tiếp tục an toàn.

### Phạm vi thực hiện
-  Xác nhận migration/seed/lockfile
-  Chốt backend test commands và logs
-  Kiểm tra diff/schema drift
-  Soạn backend known risks và rollback reference

### Output bàn giao
-  Backend handoff note
-  Reproducibility commands
-  Final test summary
-  Candidate SHA/tag recommendation

### Acceptance Criteria
-  Clean setup pass trên candidate
-  Full regression result gắn SHA
-  Không uncommitted schema/migration
-  Rollback reference rõ

### Verify / Test
-  Fresh install/DB smoke nếu khả thi
-  git diff --check/status
-  npm test final hoặc reuse frozen log có lý do

### Handoff Prompt
```text
Bạn là Backend & Data Lead của dự án ViVouch, phụ trách W5-H5 — Backend release candidate & reproducibility pack.

MỤC TIÊU:
Đóng gói backend candidate có setup/test/data evidence để W6 tiếp tục an toàn.

PHẠM VI BẮT BUỘC:
1. Xác nhận migration/seed/lockfile
2. Chốt backend test commands và logs
3. Kiểm tra diff/schema drift
4. Soạn backend known risks và rollback reference

OUTPUT PHẢI BÀN GIAO:
1. Backend handoff note
2. Reproducibility commands
3. Final test summary
4. Candidate SHA/tag recommendation

ACCEPTANCE CRITERIA:
- Clean setup pass trên candidate
- Full regression result gắn SHA
- Không uncommitted schema/migration
- Rollback reference rõ

VERIFY/TEST:
- Fresh install/DB smoke nếu khả thi
- git diff --check/status
- npm test final hoặc reuse frozen log có lý do

DEPENDENCY:
Dựa H4 và code freeze; cung cấp sign-off cho D5.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: tag chứa file local/test output; review tracked files trước đề xuất.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-v5"></a>W5-V5: Customer demo pack & acceptance sign-off

- **Người thực hiện:** Vinh (Customer Portal Lead)
- **Thời gian:** Thứ 7
- **Dependency:** Dựa V4 và H5 reproducibility; cung cấp D5.
- **Rủi ro kiểm soát:** Rủi ro: demo phụ thuộc cache/session cũ; rehearsal từ logout/seed chuẩn.

### Mục tiêu
Biến Customer flow thành demo ngắn, ổn định và truy vết về rubric.

### Phạm vi thực hiện
-  Soạn demo steps và accounts
-  Chọn evidence cho customer rubric
-  Chạy rehearsal có thời lượng
-  Ghi known limitations và fallback

### Output bàn giao
-  Customer demo script
-  Screenshot/evidence index
-  Customer sign-off
-  W6 customer hardening backlog

### Acceptance Criteria
-  Demo không cần chỉnh DB thủ công
-  Flow pass từ seed chuẩn
-  Không che mock payment limitation
-  Tất cả customer core rubric có evidence

### Verify / Test
-  Rehearsal trên candidate
-  Link/evidence check
-  Responsive final smoke

### Handoff Prompt
```text
Bạn là Customer Portal Lead của dự án ViVouch, phụ trách W5-V5 — Customer demo pack & acceptance sign-off.

MỤC TIÊU:
Biến Customer flow thành demo ngắn, ổn định và truy vết về rubric.

PHẠM VI BẮT BUỘC:
1. Soạn demo steps và accounts
2. Chọn evidence cho customer rubric
3. Chạy rehearsal có thời lượng
4. Ghi known limitations và fallback

OUTPUT PHẢI BÀN GIAO:
1. Customer demo script
2. Screenshot/evidence index
3. Customer sign-off
4. W6 customer hardening backlog

ACCEPTANCE CRITERIA:
- Demo không cần chỉnh DB thủ công
- Flow pass từ seed chuẩn
- Không che mock payment limitation
- Tất cả customer core rubric có evidence

VERIFY/TEST:
- Rehearsal trên candidate
- Link/evidence check
- Responsive final smoke

DEPENDENCY:
Dựa V4 và H5 reproducibility; cung cấp D5.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: demo phụ thuộc cache/session cũ; rehearsal từ logout/seed chuẩn.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

## <a id="w5-t5"></a>W5-T5: Partner/Admin demo pack & sign-off

- **Người thực hiện:** Tùng (Partner & Admin Portal Lead)
- **Thời gian:** Thứ 7
- **Dependency:** Dựa T4 và H5 candidate; cung cấp D5.
- **Rủi ro kiểm soát:** Rủi ro: code voucher đã USED; chuẩn bị fixture/fallback hợp lệ.

### Mục tiêu
Chốt demo vận hành Partner/Admin và evidence cho approval, redeem, reports, audit.

### Phạm vi thực hiện
-  Demo partner voucher/branch flow
-  Demo admin approval/rejection
-  Demo redeem branch-scoped và audit
-  Ghi portal limitations/backlog

### Output bàn giao
-  Partner/Admin demo script
-  Evidence index
-  Portal sign-off
-  W6 operational backlog

### Acceptance Criteria
-  Demo dùng role/account đúng
-  Redeem có success và một negative proof
-  Audit evidence truy vết được
-  Portal rubric đủ evidence

### Verify / Test
-  Rehearsal candidate
-  Reset fixture giữa flows
-  Final responsive/console smoke

### Handoff Prompt
```text
Bạn là Partner & Admin Portal Lead của dự án ViVouch, phụ trách W5-T5 — Partner/Admin demo pack & sign-off.

MỤC TIÊU:
Chốt demo vận hành Partner/Admin và evidence cho approval, redeem, reports, audit.

PHẠM VI BẮT BUỘC:
1. Demo partner voucher/branch flow
2. Demo admin approval/rejection
3. Demo redeem branch-scoped và audit
4. Ghi portal limitations/backlog

OUTPUT PHẢI BÀN GIAO:
1. Partner/Admin demo script
2. Evidence index
3. Portal sign-off
4. W6 operational backlog

ACCEPTANCE CRITERIA:
- Demo dùng role/account đúng
- Redeem có success và một negative proof
- Audit evidence truy vết được
- Portal rubric đủ evidence

VERIFY/TEST:
- Rehearsal candidate
- Reset fixture giữa flows
- Final responsive/console smoke

DEPENDENCY:
Dựa T4 và H5 candidate; cung cấp D5.

RỦI RO CẦN KIỂM SOÁT:
Rủi ro: code voucher đã USED; chuẩn bị fixture/fallback hợp lệ.

BÁO CÁO CUỐI:
Nêu outcome; file thay đổi; lý do; command đã chạy; pass/fail/skip; evidence; acceptance criteria đã đạt/chưa đạt; remaining risks; dependency bàn giao cho task tiếp theo.
```

---

