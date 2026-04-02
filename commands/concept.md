---
description: Thiết kế game concept: Phase A (brainstorm + outline) → Phase B (GCD + GCD-Gameplay + spec.yaml)
argument-hint: <game idea>
---

# /design-kit:concept <game idea>

**Mô tả:** Thiết kế game concept theo quy trình 2 phase - Phase A (brainstorm + outline + chờ duyệt) và Phase B (sinh GCD + GCD-Gameplay + spec.yaml). Dựa trên 12 lý thuyết game design cốt lõi.

## Phase A: Thu thập thông tin → Brainstorm → Outline (chờ approve)

1. Thu thập thông tin bắt buộc từ user:
   - Game idea/theme
   - Genre
   - Target audience (casual/mid-core/hardcore + độ tuổi)
2. Nếu thiếu thông tin bắt buộc, hỏi bổ sung bằng câu hỏi ngắn gọn (ưu tiên multiple choice).
3. Invoke market-researcher agent ở Chế độ 1 (Initial Research) dựa trên game idea + genre + audience thu thập được. Lưu kết quả vào `{project}/market-research.md`.
4. Search knowledge base (`knowledge_search`) để lấy theory/pattern liên quan đến idea + genre + audience.
5. Brainstorm 3-5 concept variants, mỗi concept gồm:
   - Tiêu đề (1 dòng)
   - Pitch tối đa 5 câu, tập trung điểm độc đáo và cảm giác chơi
6. Trình bày danh sách concept và yêu cầu user chọn 1 concept.
7. Invoke market-researcher agent ở Chế độ 2 (Validation Research) cho concept vừa được chọn. Cập nhật `{project}/market-research.md` với phần đánh giá khả thi.
8. Sau khi user chọn, tạo Outline theo:
   - @references/phase-a-outline-template.md
9. Trình bày Outline và yêu cầu user approve.
10. Invoke review-concept agent ở Chế độ 1 (Review Outline). Nếu FAIL → yêu cầu concept-designer sửa các vấn đề cụ thể → re-review (tối đa 2 lần). Nếu vẫn FAIL → trình issues cho user.
11. Dừng lại, không sang Phase B cho tới khi user approve.

## Phase B: Generate tài liệu sau khi approve Outline

1. Đọc và áp dụng 12 lý thuyết từ:
   - @references/game-design-theories.md
2. Đọc cấu trúc GCD từ:
   - @references/gcd-template.md
3. Generate Tài liệu 1: GCD (phân tích thiết kế, áp dụng lý thuyết theo từng section).
4. Đọc cấu trúc GCD-Gameplay từ:
   - @references/gcd-gameplay-template.md
5. Generate Tài liệu 2: GCD-Gameplay (rulebook-style, tập trung cách chơi).
6. Generate `spec.yaml` (internal format cho prototype agent).
7. Ghi 3 file vào thư mục project:
   - `gcd.md`
   - `gcd-gameplay.md`
   - `spec.yaml`
8. Chạy `spec_validate` cho `spec.yaml` và sửa mọi lỗi schema/consistency.
9. Invoke review-concept agent ở Chế độ 2 (Review GCD + GCD-Gameplay + spec.yaml). Nếu FAIL → yêu cầu concept-designer sửa → re-review (tối đa 2 lần). Nếu vẫn FAIL → trình issues cho user.

## Output Requirements

- GCD và GCD-Gameplay bắt buộc viết bằng tiếng Việt.
- Áp dụng lý thuyết có hệ thống, không nêu chung chung.
- Cited claims phải có source + page khi phụ thuộc knowledge base.
