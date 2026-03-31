# /design-kit:review-docs [doc1,doc2,...|all]

**Mô tả:** Đánh giá tài liệu thiết kế chi tiết: kiểm tra tính nhất quán giữa các tài liệu và mức độ sẵn sàng cho production. Dùng độc lập hoặc tự động trong /design-kit:approve.

## Available Documents

- `gameplay` → `gameplay-design.md`
- `ui-ux` → `ui-ux-spec.md`
- `economy` → `economy-design.md`
- `art` → `art-direction.md`
- `content` → `content-plan.md`
- `tech` → `technical-requirements.md`
- `sound` → `sound-design.md`

## Steps

1. Parse argument: `all` (mặc định) → review tất cả 7 tài liệu; hoặc chỉ định `gameplay,ui-ux,economy,art,content,tech,sound`.
2. Đọc `spec.yaml` làm baseline so sánh.
3. Đọc các tài liệu cần review từ `{project}/documents/`.
4. Invoke `detail-doc-reviewer` agent.
5. Trình kết quả: `[PASS/FAIL]` cho từng document và từng nhóm kiểm tra (`consistency`, `readiness`).
6. Nếu FAIL: liệt kê issues; nếu ALL PASS: output `✅ APPROVED`.

## Output Requirements

- Per-document structured review với `[PASS/FAIL]` items.
- Overall verdict: tất cả PASS hoặc danh sách document cần sửa.
