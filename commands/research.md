---
description: Phân tích thị trường game cho idea hoặc project hiện có
argument-hint: <game idea or project>
---

# /design-kit:research <game idea or project>

**Mô tả:** Phân tích thị trường game ban đầu cho một game idea độc lập hoặc project hiện có, ưu tiên đọc `spec.yaml` để lấy genre, audience, mechanics; nếu thiếu thông tin thì hỏi user trước khi nghiên cứu.

## Steps

1. Xác định context: nếu có `spec.yaml` trong project hiện tại thì đọc genre, target audience, mechanics; nếu không có thì dùng game idea trong argument làm đầu vào chính.
2. Nếu thiếu genre hoặc target audience, hỏi user bằng câu hỏi ngắn gọn trước khi tiếp tục.
3. Gọi `market-researcher` agent ở Mode 1 (Initial Research) để làm: competitor analysis, audience profile, trends, revenue benchmarks.
4. Yêu cầu agent tổng hợp kết quả theo ngữ cảnh hiện có, không tự bịa số liệu và không thay agent làm phần nghiên cứu.
5. Lưu báo cáo vào `{project}/market-research.md`; nếu project chưa có thì tạo project folder phù hợp trước khi lưu.
6. Trình bày kết quả cho user, nêu rõ đầu vào đã dùng: project context từ `spec.yaml` và/hoặc game idea standalone.

## Output Requirements

- Báo cáo bằng tiếng Việt.
- Tối đa 3 trang, có section rõ ràng, dùng tables và bullet points.
- Mọi nhận định quan trọng phải có nguồn từ knowledge base kèm page reference.
