# Review Output Template

Sử dụng template này để xuất kết quả đánh giá GDD. Output gồm 3 layers theo thứ tự.

## Template

~~~markdown
# GDD Review: [TÊN GAME]

📅 [YYYY-MM-DD] | 📄 [Source file path] | 🎯 Tổng: [★★★☆☆] ([X.X]/5) [🟢/🟡/🔴]

---

## Layer 1: Scorecard

### Theo Tiêu Chí

| Tiêu Chí | Điểm | Verdict |
|-----------|-------|---------|
| Completeness | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |
| Flow Coverage | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |
| Interaction Clarity | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |
| Data Completeness | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |
| Consistency | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |
| Edge Cases | [★★★★★] ([X.X]) | [🟢/🟡/🔴] |

### Theo Section

| Section | Comp. | Flow | Inter. | Data | Cons. | Edge | TB | Verdict |
|---------|-------|------|--------|------|-------|------|----|---------|
| [Section name] | [1-5] | [1-5] | [1-5] | [1-5] | [1-5] | [1-5] | [X.X] | [🟢/🟡/🔴] |
| [Lặp lại cho mỗi section] | | | | | | | | |

### Missing / Thin Categories

- ❌ [Category name] — [lý do: không tìm thấy nội dung nào cover category này]
- ⚠️ [Category name] — [lý do: chỉ đề cập sơ lược, thiếu chi tiết gì]
- [Nếu không có Missing/Thin: ghi "Tất cả 10 categories đều được cover đầy đủ."]

---

## Layer 2: Checklist Chi Tiết

[Lặp lại block sau cho MỖI section phát hiện được trong GDD]

### [Tên Section Trong GDD]

> Mapped categories: [Category 1], [Category 2], ...

#### ✅ Đạt
- [Tag tiêu chí] Mô tả cụ thể điều đạt được
- [Tag tiêu chí] Mô tả cụ thể điều đạt được

#### ❌ Thiếu / Cần Bổ Sung
- [Tag tiêu chí] Mô tả cụ thể điều thiếu → **Gợi ý:** nên bổ sung gì
- [Tag tiêu chí] Mô tả cụ thể điều thiếu → **Gợi ý:** nên bổ sung gì

#### ⚠️ Mập Mờ / Dev Phải Đoán
- [Tag tiêu chí] Trích dẫn đoạn mập mờ → **Vấn đề:** dev sẽ không biết code gì → **Gợi ý:** cần clarify gì
- [Tag tiêu chí] Trích dẫn đoạn mập mờ → **Vấn đề:** dev sẽ không biết code gì → **Gợi ý:** cần clarify gì

[Nếu section không có items ❌ hoặc ⚠️, bỏ sub-section đó — không ghi "Không có"]

---

## Layer 3: Action Items

### 🔴 Critical (chặn dev implement)
Những thiếu sót khiến dev KHÔNG THỂ lập trình được — phải sửa trước khi bắt tay code.

1. **[Tên vấn đề]** — Section: [tên section] | Tiêu chí: [tag]
   - Vấn đề: [mô tả cụ thể]
   - Gợi ý sửa: [hướng dẫn actionable]

[Nếu không có: ghi "Không có vấn đề critical."]

### 🟡 Important (dev phải đoán hoặc hỏi lại)
Những chỗ mập mờ khiến dev phải đoán hoặc dừng lại hỏi GD/PM.

1. **[Tên vấn đề]** — Section: [tên section] | Tiêu chí: [tag]
   - Vấn đề: [mô tả cụ thể]
   - Gợi ý sửa: [hướng dẫn actionable]

[Nếu không có: ghi "Không có vấn đề important."]

### 🟢 Minor (cải thiện chất lượng tài liệu)
Những cải tiến giúp GDD rõ ràng hơn nhưng dev vẫn có thể tự suy luận.

1. **[Tên vấn đề]** — Section: [tên section] | Tiêu chí: [tag]
   - Vấn đề: [mô tả cụ thể]
   - Gợi ý sửa: [hướng dẫn actionable]

[Nếu không có: ghi "Không có vấn đề minor."]

~~~

## Hướng Dẫn Sử Dụng Template

### Quy tắc chung
1. Thay tất cả placeholder `[...]` bằng nội dung đánh giá thực tế
2. Điểm dùng ký hiệu sao: ★☆☆☆☆ (1), ★★☆☆☆ (2), ★★★☆☆ (3), ★★★★☆ (4), ★★★★★ (5)
3. Output hoàn toàn bằng **tiếng Việt có dấu**
4. Lưu file vào `docs/superpowers/reviews/[YYYY-MM-DD]-[game-name]-gdd-review.md`

### Tags tiêu chí
Dùng trong Layer 2 checklist để gắn vào mỗi item:
- `[Completeness]`
- `[Flow]`
- `[Interaction]`
- `[Data]`
- `[Consistency]`
- `[Edge]`

### Bảng "Theo Section" (Layer 1)
- Cột `Comp.` đến `Edge`: điểm 1-5 cho mỗi tiêu chí
- Nếu tiêu chí không áp dụng cho section → ghi `—`
- Cột `TB`: trung bình (chỉ tính cột có điểm, bỏ `—`)
- Cột `Verdict`: dựa trên TB → 🟢 ≥ 4.0 | 🟡 2.5-3.9 | 🔴 < 2.5

### Quy tắc phân loại severity (Layer 3)
- **🔴 Critical:** Section trống/placeholder, formula thiếu biến quan trọng, flow chính bị thiếu bước, mâu thuẫn nghiêm trọng giữa sections khiến dev không biết tin section nào
- **🟡 Important:** Behavior không rõ (dev phải đoán), giá trị thiếu nhưng có thể hỏi PM, edge case quan trọng bị bỏ sót (ví dụ: giá trị = 0, max overflow)
- **🟢 Minor:** Tên gọi chưa nhất quán nhưng hiểu được, animation timing thiếu nhưng dev có thể tự quyết, edge case hiếm gặp

### Lưu ý
- Mỗi Action Item phải có cả 3 phần: tên vấn đề, mô tả, gợi ý sửa
- Trích dẫn từ GDD khi mô tả vấn đề (dùng > blockquote)
- Gợi ý sửa phải actionable — không chung chung như "cần bổ sung thêm"
- Nếu một section toàn ✅ trong Layer 2, vẫn giữ section đó — nó cho thấy GDD làm tốt ở đâu
