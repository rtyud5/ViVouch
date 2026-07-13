# W5-D1 — Baseline Decision Record

**Baseline commit:** `e016793` (branch `pre-w5-w7-strong-fix`)
**Date:** 2026-07-14
**Lead:** Duy (Acceptance & Security Lead)

---

## 1. Context & Purpose

Mục tiêu của tài liệu này là ghi nhận các quyết định (Decision Record) đã được thống nhất tại thời điểm chốt baseline W5-D1. Nó đóng vai trò là "single source of truth" (nguồn sự thật duy nhất) cho toàn bộ team để tránh tranh cãi về feature scope, ranh giới P0/P1/P2, và quy định thực thi trong sprint W5.

Tài liệu này chặn vĩnh viễn hành vi tự thêm feature (feature creep) hoặc tranh cãi về việc "tính năng này có bắt buộc không". Mọi thay đổi về scope sau mốc baseline này đều phải được thông qua Acceptance Lead.

---

## 2. Scope Decisions (Quyết định Phạm vi)

Các tính năng/module dưới đây được phân loại rõ ràng dựa trên BRD và tình trạng codebase hiện tại.

### ✅ In-Scope (Bắt buộc hoàn thiện 100%)
*Đây là cốt lõi của assignment. Phải sửa ngay nếu có lỗi.*
1. **Toàn bộ luồng W4 (Mua hàng - Đối soát):** Customer đăng nhập → Chọn voucher → Checkout → Sinh code → Partner redeem → Trạng thái cập nhật (Issued → Used).
2. **Quản lý Vòng đời Voucher:** Partner tạo (Draft) → Submit (Pending) → Admin duyệt (Approved/Rejected) → Auto publish khi đến hạn (On Sale).
3. **RBAC (Phân quyền):** Customer KHÔNG được gọi API Admin/Partner. Partner KHÔNG được gọi API Admin hoặc redeem code của Partner khác.
4. **Dashboard cơ bản (Real data KPIs):** Số liệu KPI (Users, Partners, Orders, Revenue) trên Admin Dashboard và Partner Dashboard phải tính từ dữ liệu thật. (Lưu ý: Chart doanh thu của Admin cho phép dùng mock data có dán nhãn theo NFR-04/ASM-04).

### ⚪ Out-of-Scope (Tuyệt đối không làm trong W5)
*Lý do: Không bắt buộc ở mức High priority trong BRD (Medium) hoặc chưa có FE/BE đủ để sửa nhanh (thấp hơn return on investment - ROI).*
1. **CMS Module (Banners, Categories Management, Articles):** Mặc dù BRD có nhắc đến (BR-ADM-05 - Medium priority), hiện tại chỉ có stub. Tuyệt đối không tự Build full CRUD cho CMS trong W5 để tập trung vào luồng mua hàng.
2. **Branches Module (Quản lý chi nhánh):** FE chỉ có component trống `BranchesPage`, BE chỉ có stub. Không tự implement. Dùng `voucher_branches` cơ bản đã có sẵn nếu cần.
3. **Quên mật khẩu bằng Email thật:** Chỉ giới hạn ở mức "Mô phỏng" (ASM-02).
4. **Thanh toán Real (VNPAY/MoMo):** Hiện tại là simulated (ASM-01).

---

## 3. Bug Validation & Classification Decisions

Các bug hiện tại đã được phân loại và chốt chặn (gate).

1. **Bug B101 (Thiếu nút Back ở Checkout):** Phân loại là **P2** (Major - UX). Đẩy sang backlog W6. Lý do: Người dùng vẫn có thể bấm logo hoặc dùng nút Back của trình duyệt. Không block E2E flow.
2. **Bug B105 (Modal Voucher bị che - z-index):** Đã phân loại **P1** và ĐÃ FIX ở branch `fixAdminUI`. **Chốt: Hiện tại P0/P1 = 0.**
3. **Bug B106 (Review form bị disable do `userEligibility`):** Phân loại **P2**. UX bị cản trở nhưng API submit vẫn hoạt động và đã có test. Đẩy sang W6 vì việc móc nối kiểm tra đơn hàng đã mua vào endpoint GET voucher detail khá phức tạp và rủi ro cao ở thời điểm freeze.
4. **Bug B110, B111, B112 (Các middleware stub):** Phân loại Technical Debt (P3/W6). Các stub này (Rate Limit, Validator chung) không cản trở business logic hiện tại (các service đã tự validate cục bộ). Chỉ cấu hình trong W6.

---

## 4. Execution Rules (Quy định Thực thi) - "Stop the line"

Tất cả team members (Huy, Vinh, Tùng) **BẮT BUỘC** tuân thủ các quy định sau khi nhận task W5-D2 trở đi:

1. **NO NEW FEATURES:** Cấm thêm thư viện mới (dependencies), bảng mới (schema changes), hoặc tính năng ngoài scope (ví dụ: gửi mail thật, tính năng chat) nếu chưa được Duy approve. Nếu phát hiện thiếu logic báo cáo ngay, sửa vào OOS hoặc ghi log.
2. **DO NOT SKIP TESTS:** Cấm comment out (xoá) test case hoặc đổi logic test để CI pass. Mọi thay đổi code BE phải pass 100% test hiện tại.
3. **STOP THE LINE TRÊN P0/P1:** Nếu đang code và phát hiện lỗi P0 (Crash, Data loss, Bypass RBAC) hoặc P1 (Broken core flow), phải DỪNG task hiện tại, báo cáo lên Bug Board, và fix lỗi đó trước.
4. **NO AD-HOC DEPLOY:** Mọi code phải nằm trên branch riêng theo chuẩn Trello task, pass CI/CD gate (Sonar, Vitest) và review chéo. Chỉ merge vào main khi Duy/Lead QA cho phép.
5. **Ghi Log Trung Thực:** Bất kỳ thay đổi nào (dù là CSS fix nhỏ) đều phải ghi vào `handoff_notes.md` hoặc PR description kèm ảnh/bằng chứng pass/fail rõ ràng. KHÔNG tự kết luận PASS.

---

## 5. Artifacts Handoff Summary

Các tài liệu sau đây là nguồn sự thật duy nhất và không thể thay đổi trừ khi có P0 xảy ra:
1. `W5D1_01_brd_rubric_evidence_matrix.md`: Bằng chứng BRD so khớp với code/test.
2. `W5D1_02_bug_board_checkpoint.md`: Danh sách Bug và Mẫu Daily Checkpoint.
3. `W5D1_03_role_matrix.md`: Ma trận Phân quyền.
4. `W5D1_04_baseline_decision_record.md`: Tài liệu này.

Tất cả các tài liệu đã được kiểm tra chéo (smoke canonical flow/link check) và pass validation. Đầu ra của W5-D1 đã hoàn tất, sãn sàng chặn/đầu vào cho W5-D2 (Fix/Hardening tasks của Huy, Vinh, Tùng).

**Ký duyệt (Acceptance Baseline Locked):**
- *Le Duc Duy - Acceptance & Security Lead - 2026-07-14*
