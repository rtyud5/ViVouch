# W5D3_03: Evidence Naming Convention

> Quy ước đặt tên và lưu trữ evidence cho hệ thống ViVouch.

---

## Cấu trúc thư mục

```
w5_acceptance_docs/
├── W5D1/
│   ├── W5D1_01_scope_matrix.md
│   └── W5D1_02_bug_board.md
├── W5D2/
│   ├── W5D2_01_rbac_audit.md
│   └── W5D2_02_semantic_consistency.md
├── W5D3/
│   ├── W5D3_01_api_error_contract_matrix.md
│   ├── W5D3_02_approved_code_vocabulary.md
│   ├── W5D3_03_evidence_naming_convention.md
│   └── W5D3_04_review_notes_V3_T3_H3.md
└── archive_w5_pre_baseline/
    ├── vivouch_w5_handoff_notes.md
    └── vivouch_w5_test_cases.md
```

---

## Quy tắc đặt tên

### Format
```
W5{Lane}{Day}_{NN}_{short_name}.md
```

### Giải thích

| Phần | Mô tả | Ví dụ |
|------|--------|-------|
| `W5` | Số tuần (Week 5) | `W5`, `W6`, `W7` |
| `{Lane}` | Lane/track (D = Dev, T = Test, R = Review) | `D`, `T`, `R` |
| `{Day}` | Ngày trong tuần (1-5) | `1`, `2`, `3` |
| `_{NN}` | Số thứ tự 2 chữ số | `_01`, `_02`, `_12` |
| `_{short_name}` | Tên viết tắt, snake_case, tối đa 5 từ | `_api_error_contract_matrix` |

### Ví dụ

| Filename | Giải thích |
|----------|------------|
| `W5D1_01_scope_matrix.md` | W5, Dev lane, Day 1, doc #01: scope matrix |
| `W5D3_02_approved_code_vocabulary.md` | W5, Dev lane, Day 3, doc #02: approved code vocabulary |
| `W6T2_01_regression_results.md` | W6, Test lane, Day 2, doc #01: regression results |

---

## Quy tắc lưu trữ

1. **Thư mục**: `w5_acceptance_docs/W5{Lane}{Day}/`
2. **Format**: Markdown (`.md`) — để dễ đọc, diff, và review trên Git
3. **Encoding**: UTF-8 (hỗ trợ tiếng Việt)
4. **Archive**: Tài liệu cũ/deprecated → move vào `archive_w5_pre_baseline/`

---

## Minimum Evidence per Rubric Item

| Rubric Type | Evidence tối thiểu |
|-------------|-------------------|
| **V (Customer UX)** | Error contract matrix + screenshot/test log cho mỗi error path chính |
| **T (Partner/Admin UX)** | RBAC audit table + evidence response shape consistent |
| **H (Technical/API)** | Diff log (Git) + test suite results + production mode verification |
| **Scope** | Scope matrix (implemented/partial/mock/OOS) |
| **Bug** | Bug board với reproduction steps và severity |

---

## Checklist tạo Evidence mới

- [ ] Đặt tên đúng convention: `W5{Lane}{Day}_{NN}_{short_name}.md`
- [ ] Đặt trong đúng thư mục: `w5_acceptance_docs/W5{Lane}{Day}/`  
- [ ] Có tiêu đề `# W5{Lane}{Day}_{NN}: {Human Readable Title}`
- [ ] Markdown format, UTF-8
- [ ] Không chứa credentials, secrets, hay internal URLs
- [ ] Committed vào Git cùng với code changes liên quan
