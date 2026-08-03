# Apply W6-D5 deliverables

Các file trong thư mục này được thiết kế để đặt trực tiếp tại root của repository ViVouch:

- `W6_D5_GATE_REPORT.md`
- `W6_RISK_WAIVER_REGISTER.md`
- `W6_W7_HANDOFF.md`
- `W6_INHERITED_REMEDIATION_FOR_W7.md`

## Cách áp dụng

```bash
cp W6_D5_GATE_REPORT.md <ViVouch-root>/
cp W6_RISK_WAIVER_REGISTER.md <ViVouch-root>/
cp W6_W7_HANDOFF.md <ViVouch-root>/
cp W6_INHERITED_REMEDIATION_FOR_W7.md <ViVouch-root>/
cd <ViVouch-root>
git diff --check
git status --short
```

Sau khi các correction được hoàn tất, cập nhật `W6_D5_GATE_REPORT.md`:

- thay candidate SHA bằng final frozen SHA;
- đổi `NO-GO` thành `GO — staging-ready core`;
- điền bốn sign-off cùng SHA;
- xác nhận P0/P1 = 0;
- gắn GitHub Actions/artifact URLs.
