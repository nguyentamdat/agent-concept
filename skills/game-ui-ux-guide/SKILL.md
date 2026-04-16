---
name: game-ui-ux-guide
description: "Kiến thức UI/UX game mobile toàn diện — từ casual đến midcore/hardcore. Dùng skill này khi user cần: (1) Review/critique UI mockup game (upload ảnh → nhận feedback chi tiết theo 6 tiêu chí), (2) Tạo UI checklist cho từng loại screen game (lobby, shop, settings, ingame HUD, popup, leaderboard, offer, gacha, tutorial...), (3) Tạo art style guide / moodboard brief từ game concept, (4) Hỗ trợ training team về UI/UX game. Trigger khi user nhắc đến: review UI game, critique mockup, UI checklist, art style guide game, moodboard game, game UI feedback, đánh giá giao diện game, phân tích UI, hướng dẫn vẽ UI game, training UI/UX game, casual game art, hoặc upload ảnh mockup game và hỏi ý kiến. CŨNG trigger khi user hỏi về: shape language, color theory game, visual hierarchy game, 9-patch, wireframe game, sitemap game, font guideline game, CTA design, reading pattern, micro-interaction game, animation UI, onboarding tutorial, monetization UI, accessibility game, responsive layout game, localization UI, dark UI game, offer popup design, gacha UI."
---

# Game UI/UX Guide — Mobile Game Art Knowledge Base

Skill này chứa toàn bộ kiến thức UI/UX game mobile, tổng hợp từ các workshop Casual Game Art của các senior game artist có kinh nghiệm tại nhiều studio mobile game lớn, kết hợp với các nguyên tắc Visual Hierarchy từ design industry. Áp dụng cho mọi genre mobile game.

---

## Khi nào dùng skill này

| User muốn... | Hành động |
|---|---|
| Review UI mockup game | Đọc `references/review-checklist.md` → chấm điểm 6 tiêu chí + feedback |
| Tạo UI checklist cho screen cụ thể | Đọc `references/screen-checklists.md` → output checklist |
| Tạo art style guide / moodboard brief | Đọc `references/art-style-guide.md` → output brief |
| Hỏi lý thuyết UI/UX game | Đọc `references/theory-knowledge-base.md` → giải thích |
| Training team | Kết hợp tất cả references → format phù hợp |

---

## Quy trình xử lý theo task

### Task 1: Review/Critique UI Mockup

Khi user upload ảnh UI game và muốn feedback:

1. **Đọc** `references/review-checklist.md` để có bộ 6 tiêu chí đánh giá
2. **Xác định genre** (Casual / Midcore / Hardcore) — hỏi user nếu chưa rõ
3. **Phân tích ảnh** theo 2 tầng:
   - Tầng 1 — Art Quality: Visual Style, Color System, Consistency, Technical Readiness
   - Tầng 2 — Layout Quality: Visual Hierarchy, Spatial Organization
4. **Chấm điểm** mỗi tiêu chí từ 1-5 sao
5. **Output** dạng scorecard + nhận xét chi tiết + gợi ý cải thiện cụ thể
6. Nếu user yêu cầu file → xuất Excel scorecard hoặc Markdown report

**Lưu ý quan trọng khi review:**
- Luôn bắt đầu bằng điểm tốt trước, sau đó mới đến điểm cần cải thiện
- Mỗi feedback phải đi kèm gợi ý cụ thể (không chỉ nói "chưa tốt" mà phải nói "nên làm thế nào")
- Đánh giá dựa trên genre game — casual game khác midcore khác hardcore
- Không double-count: mỗi vấn đề chỉ trừ điểm ở 1 tiêu chí duy nhất

### Task 2: Generate UI Checklist

Khi user cần checklist cho một loại screen cụ thể:

1. **Đọc** `references/screen-checklists.md` để lấy checklist template
2. **Hỏi user** genre game + screen type nếu chưa rõ
3. **Output** checklist phù hợp, tùy format user muốn:
   - Text trực tiếp trong chat (default)
   - Markdown document
   - Excel file (dùng xlsx skill)
   - PowerPoint slide (dùng pptx skill)

### Task 3: Art Style Guide / Moodboard Brief

Khi user có game concept và cần art direction:

1. **Đọc** `references/art-style-guide.md` để có framework
2. **Thu thập thông tin** từ user: genre, theme, target audience, reference games
3. **Output** Art Style Brief bao gồm:
   - Color palette (primary, secondary, accent, neutral) với mã hex
   - Shape language guidelines (round vs angular, border radius)
   - Typography recommendations (font families, size hierarchy)
   - UI material/texture direction (gỗ, kim loại, pha lê, flat...)
   - Moodboard keyword list (để search reference)
   - CTA color mapping

### Task 4: Training / Giải thích lý thuyết

Khi user hỏi về kiến thức UI/UX game:

1. **Đọc** `references/theory-knowledge-base.md`
2. **Trả lời** bằng tiếng Việt, kèm ví dụ thực tế
3. Nếu user muốn training slides → dùng pptx skill để tạo

---

## Nguyên tắc output chung

- **Ngôn ngữ:** Tiếng Việt informal là default, chuyển Anh khi user yêu cầu
- **Genre-aware:** Luôn xác định genre trước khi đưa ra advice — casual/midcore/hardcore có rules rất khác nhau
- **Actionable:** Mọi feedback phải có gợi ý cụ thể có thể thực hiện được
- **Visual-first:** Khi giải thích, ưu tiên dùng ví dụ hình ảnh hoặc tạo diagram/visualization thay vì chỉ text

---

## References

| File | Nội dung | Khi nào đọc |
|---|---|---|
| `references/review-checklist.md` | Bộ 6 tiêu chí review UI (2 tầng) + thang điểm + sub-checks | Task 1: Review mockup |
| `references/screen-checklists.md` | Checklist cho từng loại screen (20+ screens) | Task 2: Generate checklist |
| `references/art-style-guide.md` | Framework tạo art style guide + color/shape/font theory | Task 3: Art style guide |
| `references/theory-knowledge-base.md` | 15 chủ đề: UX pipeline, UI components, shape, color, visual hierarchy, 6 review criteria, animation/micro-interactions, onboarding, monetization UI, accessibility, responsive layout, localization, dark/light UI, production pipeline, market data | Task 4: Training/giải thích |
