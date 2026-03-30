# /design-kit:concept <game idea>

Thiết kế concept theo quy trình 2 phase: Phase A (brainstorm + outline + chờ approve) và Phase B (GCD + GCD-Gameplay + spec).

## Phase A: Thu thập thông tin → Brainstorm → Outline (chờ approve)

1. Thu thập thông tin bắt buộc từ user:
   - Game idea/theme
   - Genre
   - Target audience (casual/mid-core/hardcore + độ tuổi)
2. Nếu thiếu thông tin bắt buộc, hỏi bổ sung bằng câu hỏi ngắn gọn (ưu tiên multiple choice).
3. Search knowledge base (`knowledge_search`) để lấy theory/pattern liên quan đến idea + genre + audience.
4. Brainstorm 3-5 concept variants, mỗi concept gồm:
   - Tiêu đề (1 dòng)
   - Pitch tối đa 5 câu, tập trung điểm độc đáo và cảm giác chơi
5. Trình bày danh sách concept và yêu cầu user chọn 1 concept.
6. Sau khi user chọn, tạo Outline theo:
   - @references/phase-a-outline-template.md
7. Trình bày Outline và yêu cầu user approve.
8. Dừng lại, không sang Phase B cho tới khi user approve.

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

## Output Requirements

- GCD và GCD-Gameplay bắt buộc viết bằng tiếng Việt.
- Áp dụng lý thuyết có hệ thống, không nêu chung chung.
- Cited claims phải có source + page khi phụ thuộc knowledge base.
