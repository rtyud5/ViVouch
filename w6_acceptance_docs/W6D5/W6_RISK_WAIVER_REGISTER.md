# W6 — Risk & Waiver Register

**Owner:** Duy  
**Candidate được rà soát:** `f45323eb99f77d60504da487892da1522e08e6a9`  
**Ngày cập nhật:** 2026-08-03 (UTC+07)

## Severity policy

- **P0:** mất dữ liệu, privilege/branch bypass, double debit/issue/redeem/refund, oversell, secret/OTP leak.
- **P1:** required gate không thể chứng minh; migration/regression/canonical flow hoặc sign-off exact-SHA không đạt.
- **P2:** hạn chế chất lượng, maintainability hoặc evidence không chặn staging-ready core nếu có owner/deadline rõ.
- **P3:** cải tiến nhỏ, không ảnh hưởng gate.

P0/P1 không được waiver để đóng W6.

## Open register

| ID | Sev. | Mô tả | Evidence | Owner | Điều kiện đóng | Waiver |
|---|---:|---|---|---|---|---|
| W6-GATE-001 | P1 | Huy/Tùng/Vinh ký các SHA khác nhau; chưa có 4 owner sign-off cùng candidate | H5 `02418be...`; T5 `48cbb114...`; V5 `d1b30b3...`; main `f45323e...` | Duy + all | Cùng ký một full SHA và evidence URLs khớp SHA | Không cho phép |
| W6-H5-001 | P1 | Không có full relevant regression x2; H5 bỏ backend DB test và frontend test | `w6-freeze-evidence.md` | Huy | Hai run độc lập, 0 fail, required skip = 0, worktree sạch | Không cho phép |
| W6-MIG-001 | P1 | Chưa có migration/seed evidence trên bản sao W5 | Chỉ có empty-DB CI | Huy | Before/after counts + invariants + migrate output + no data loss | Không cho phép |
| W6-V5-001 | P1 | V5 chỉ frontend; bỏ backend/DB side effects và chưa có real viewport smoke | `W6V5_outcome.md` | Vinh | Canonical Customer flow + DB/API outcome + 375/768/1280 trên same SHA | Không cho phép |
| W6-SEC-04 | P1 | H4/V4/T4 retained evidence chưa gắn release evidence index | `W6D4_security_audit_acceptance.md` | Huy/Vinh/Tùng; Duy review | Redacted evidence links cùng SHA; Duy chuyển Closed | Không cho phép |
| W6-T5-001 | P1 | T5 regression tốt nhưng chạy trên SHA cũ | `W6T5_outcome.md` | Tùng | Rerun exact final SHA, clean sessions, DB side-effect assertions | Không cho phép |
| W6-EVID-001 | P2 | Evidence CI đang validate W5 docs thay vì W6 docs | `scripts/verify-evidence.mjs` | Huy | Validate W6-D5 index, relative links, empty files/media, SHA fields | Tạm hoãn tối đa tới trước W7-H1 merge |
| W6-DOC-001 | P2 | T5 documents chứa `file:///d:/...`, không dùng được ngoài máy tác giả | W6T5 docs | Tùng | Đổi toàn bộ sang repository-relative links; verifier pass | Không cần waiver nếu sửa cùng inherited PR |
| W6-TRACE-001 | P2 | Acceptance index thiếu D2/D3, H1–H5, V2–V4 | `w6_acceptance_docs/` | Duy/Huy/Vinh | Tạo index ánh xạ task → commit/PR/test/evidence; không bắt buộc sao chép log lớn | Có thể defer phần folder hóa, không defer traceability index |
| W6-T-RISK-001 | P2 | Shared fixture order-dependency và refund race chưa có dedicated test | T5 Remaining Risks R-01/R-04 | Tùng | Isolated fixture + dedicated concurrent refund regression | Hạn đóng trước canonical W7 E2E |
| W7-COV-001 | P2/W7 | Sonar báo 0.0% coverage on new code; CI chưa publish coverage report | Sonar result + config | Huy/Duy | Coverage command/artifacts + Sonar report paths/policy | Thuộc W7 quality scope, không claim coverage ở W6 |
| W7-RUNTIME-001 | P2/W7 | GitHub Actions cảnh báo Node 20 runtime deprecation | Actions warning | Huy | Upgrade/pin compatible actions/runtime; rerun green | Thuộc W7 platform hardening |

## Closed / accepted evidence

| ID | Sev. | Nội dung | Trạng thái |
|---|---:|---|---|
| SEC-01 | P0 | Sensitive secret/OTP/token/voucher code emitted by structured logs | Closed theo W6-D4 source/test review |
| SEC-02 | P0 | Redeem mutation thiếu actor/target/request correlation | Closed theo W6-D4 audit assertion |
| SEC-03 | P1 | Rate-limit rejection thiếu requestId | Closed theo W6-D4 negative-control test |
| TEST-RUNNER-01 | P1 | Vitest nhặt nhầm `tests-node` | Closed: backend Vitest excludes `tests-node/**`; Node runner riêng |
| EMPTY-DB-01 | P1 | Dựng DB trống, migrate và seed | Closed cho empty DB bằng exact-SHA CI; không thay thế W5-copy drill |

## Waiver rules

1. Không waiver P0/P1.
2. P2 waiver phải có owner, lý do, tác động, biện pháp giảm thiểu và deadline cụ thể.
3. Waiver hết hạn tự động khi tới deadline; task trở lại Open.
4. Không dùng câu “sẽ làm trong W7” để che một acceptance criterion W6 chưa đạt. Các correction của Huy/Vinh/Tùng được ghi riêng trong `W6_INHERITED_REMEDIATION_FOR_W7.md`.
5. Không đổi severity chỉ để đạt gate.
