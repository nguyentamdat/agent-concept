---
name: game-ui-ux
description: "Kiến thức UI/UX game mobile toàn diện — từ casual đến midcore/hardcore. Dùng skill này khi user cần review UI mockup, tạo UI checklist cho screen game, tạo art style guide / moodboard brief, hoặc training team về UI/UX game. Trigger khi user nhắc đến review UI game, critique mockup, UI checklist, art style guide game, moodboard game, game UI feedback, phân tích UI, hoặc hỏi về shape language, color theory, visual hierarchy, CTA design, onboarding, accessibility, responsive layout, localization, dark UI, offer popup, gacha UI."
---

# Game UI/UX Guide — Mobile Game Art Knowledge Base

Skill này chứa kiến thức UI/UX game mobile, tổng hợp từ các workshop Casual Game Art và các nguyên tắc visual hierarchy trong thiết kế game.

---

## Khi nào dùng skill này

| User muốn... | Hành động |
|---|---|
| Review UI mockup game | Đọc `@references/review-checklist.md` → chấm điểm 6 tiêu chí + feedback |
| Tạo UI checklist cho screen cụ thể | Đọc `@references/screen-checklists.md` → output checklist |
| Tạo art style guide / moodboard brief | Đọc `@references/art-style-guide.md` → output brief |
| Hỏi lý thuyết UI/UX game | Đọc `@references/theory-knowledge-base.md` → giải thích |
| Training team | Kết hợp tất cả `@references/` → format phù hợp |

---

## Quy trình xử lý theo task

### Task 1: Review/Critique UI Mockup

Khi user upload ảnh UI game và muốn feedback:

1. **Đọc** `@references/review-checklist.md` để có bộ tiêu chí đánh giá
2. **Xác định genre** (Casual / Midcore / Hardcore) — hỏi user nếu chưa rõ
3. **Phân tích ảnh** theo 2 tầng:
   - Tầng 1 — Art Quality: Visual Style, Color System, Consistency, Technical Readiness
   - Tầng 2 — Layout Quality: Visual Hierarchy, Spatial Organization
4. **Chấm điểm** mỗi tiêu chí từ 1-5 sao
5. **Output** dạng scorecard + nhận xét chi tiết + gợi ý cải thiện cụ thể
6. Nếu user yêu cầu file → xuất Excel scorecard hoặc Markdown report

### Task 2: Generate UI Checklist

Khi user cần checklist cho một loại screen cụ thể:

1. **Đọc** `@references/screen-checklists.md` để lấy checklist template
2. **Hỏi user** genre game + screen type nếu chưa rõ
3. **Output** checklist phù hợp, tùy format user muốn

### Task 3: Art Style Guide / Moodboard Brief

Khi user có game concept và cần art direction:

1. **Đọc** `@references/art-style-guide.md` để có framework
2. **Thu thập thông tin** từ user: genre, theme, target audience, reference games
3. **Output** Art Style Brief bao gồm:
   - Color palette (primary, secondary, accent, neutral) với mã hex
   - Shape language guidelines (round vs angular, border radius)
   - Typography recommendations (font families, size hierarchy)
   - UI material/texture direction
   - Moodboard keyword list
   - CTA color mapping

### Task 4: Training / Giải thích lý thuyết

Khi user hỏi về kiến thức UI/UX game:

1. **Đọc** `@references/theory-knowledge-base.md`
2. **Trả lời** bằng tiếng Việt, kèm ví dụ thực tế
3. Nếu user muốn training slides → dùng công cụ phù hợp để tạo

---

## Nguyên tắc output chung

- **Ngôn ngữ:** Tiếng Việt informal là mặc định
- **Genre-aware:** Luôn xác định genre trước khi đưa ra advice
- **Actionable:** Mọi feedback phải có gợi ý cụ thể có thể thực hiện được
- **Visual-first:** Khi giải thích, ưu tiên ví dụ hình ảnh hoặc diagram

---

## References

| File | Nội dung | Khi nào đọc |
|---|---|---|
| `@references/review-checklist.md` | Bộ tiêu chí review UI + thang điểm + sub-checks | Task 1: Review mockup |
| `@references/screen-checklists.md` | Checklist cho từng loại screen | Task 2: Generate checklist |
| `@references/art-style-guide.md` | Framework tạo art style guide + color/shape/font theory | Task 3: Art style guide |
| `@references/theory-knowledge-base.md` | Chủ đề UI/UX game, visual hierarchy, animation, onboarding, monetization, accessibility, pipeline | Task 4: Training/giải thích |
