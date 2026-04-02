---
description: Đánh giá chất lượng Outline hoặc GCD theo checklist (quality gate)
argument-hint: "[outline|gcd|all]"
---

# /design-kit:review-concept [outline|gcd|all]

**Mô tả:** Đánh giá chất lượng Outline hoặc GCD/GCD-Gameplay/spec.yaml theo checklist. Dùng độc lập hoặc tự động trong /design-kit:concept. Đây là quality gate — nếu không đạt sẽ yêu cầu sửa.

## Steps

1. Parse argument: `outline` → review outline only, `gcd` → review GCD+GCD-Gameplay+spec, `all` → review cả hai (mặc định nếu không có argument).
2. Đọc project files tương ứng: `outline.md` hoặc `gcd.md` + `gcd-gameplay.md` + `spec.yaml`.
3. Invoke `review-concept` agent với chế độ tương ứng (Mode 1 hoặc Mode 2).
4. Trình kết quả review: danh sách `[PASS/FAIL]` items.
5. Nếu FAIL: liệt kê issues cần sửa. Nếu PASS: output `✅ APPROVED`.

## Output Requirements

- Structured `[PASS/FAIL]` format cho từng item
- Summary verdict cuối cùng
