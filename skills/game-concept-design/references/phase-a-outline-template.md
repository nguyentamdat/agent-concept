# Phase A: Outline Template

Sử dụng template này để tạo Outline cho Phase A. Điền tất cả sections trước khi trình user approve.

## Template

~~~markdown
# [TÊN GAME] — Game Concept Outline

**Ngày tạo:** [YYYY-MM-DD]
**Trạng thái:** Chờ Approve

---

## 1. Tóm Tắt Concept

[2-3 câu mô tả core concept: game này là gì, player làm gì, điều gì khiến nó thú vị]

## 2. Thông Tin Cơ Bản

| Thông tin | Giá trị |
|-----------|---------|
| Genre | [genre chính] |
| Sub-genre | [sub-genre nếu có] |
| Platform | Mobile |
| Target Audience | [casual/mid-core/hardcore + độ tuổi] |
| Monetization | [IAP / Ads / Premium / Hybrid] |
| Reference Games | [1-3 game tham khảo] |

## 3. Target Aesthetics (8 Kinds of Fun)

**Primary (1-2):**
- [Aesthetic chính — lý do chọn]

**Secondary (1-2):**
- [Aesthetic phụ — lý do chọn]

Danh sách 8 aesthetics: Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission.

## 4. Core Loop Sơ Bộ

```
[Mô tả core loop dạng diagram text]
Ví dụ: Explore → Combat → Loot → Upgrade → Explore (harder)
```

**Primary Mechanics:**
- [Mechanic 1]: [mô tả ngắn]
- [Mechanic 2]: [mô tả ngắn]

## 5. Định Hướng Flow & Progression

- **Flow strategy:** [Cách duy trì challenge vs skill balance]
- **Session length mục tiêu:** [thời gian phiên chơi điển hình]
- **Progression type:** [Level-based / Skill-based / Content-based / Hybrid]
- **Learning curve:** [Gradual / Moderate / Steep — với lý do]

## 6. Điểm Đáng Lưu Ý & Rủi Ro

- [Rủi ro 1: mô tả + mức độ nghiêm trọng]
- [Rủi ro 2: mô tả + mức độ nghiêm trọng]
~~~

## Hướng Dẫn Sử Dụng

1. Điền template dựa trên thông tin thu thập từ user
2. Với mỗi thông tin bắt buộc chưa rõ, hỏi user qua `AskUserQuestion`
3. Thông tin optional: AI suy luận dựa trên genre, audience, reference games
4. Target Aesthetics: chọn dựa trên genre + audience + idea, giải thích lý do
5. Core Loop: phải logic và phù hợp genre
6. Rủi ro: dựa trên phân tích sơ bộ qua 12 lý thuyết
7. Trình Outline hoàn chỉnh cho user review
8. **Chờ user approve** — không tự ý chuyển sang Phase B

## Checklist Trước Khi Trình Approve

- [ ] Đã xác nhận game idea, genre, target audience (3 thông tin bắt buộc)
- [ ] Target Aesthetics phù hợp genre và audience
- [ ] Core Loop logic, không mâu thuẫn
- [ ] Flow strategy hợp lý cho target audience
- [ ] Rủi ro đã được liệt kê (ít nhất 1)
