# Evaluation Criteria — Rubric Chấm Điểm

Rubric chấm điểm 1-5 sao cho 12 lý thuyết game design. Dùng khi đánh giá GCD ở Bước 3 (Evaluate).

Thứ tự: canonical order (Pillar → GCD section).

---

## Quy Tắc Chung

### Chấm Điểm
- Mỗi lý thuyết: **1-5 sao** hoặc **N/E** (Not Evaluable)
- N/E khi GCD thiếu thông tin để đánh giá lý thuyết đó
- N/E không tính vào tổng điểm — mẫu số giảm tương ứng

### Verdict Logic
- **Tổng thể**: 🟢 ≥80% | 🟡 50-79% | 🔴 <50%
- **Per-Pillar**: Cùng logic tỷ lệ %
- **Override 1**: Bất kỳ lý thuyết nào ≤1 sao → verdict tổng thể tối đa 🟡
- **Override 2**: ≥4 lý thuyết N/E → verdict tối đa 🟡 + cảnh báo "GCD thiếu quá nhiều thông tin"

### Per-Pillar Thresholds (khi không có N/E)

| Pillar | Theories | Max | 🟢 ≥ | 🟡 ≥ | 🔴 < |
|--------|----------|-----|-------|-------|------|
| I. Experience Design | 4 | 20 | 16 | 10 | 10 |
| II. Decision Design | 3 | 15 | 12 | 8 | 8 |
| III. Pacing & Learning | 4 | 20 | 16 | 10 | 10 |
| IV. Player Motivation | 1 | 5 | 4 | 3 | 3 |

*Nếu có N/E trong Pillar: max giảm 5 per N/E theory, thresholds tính lại theo %.*

---

## Pillar I: Experience Design

### 1. Problem Statements

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có concept statement, hoặc concept quá mơ hồ ("game vui cho mọi người") |
| ★★☆☆☆ | Có concept nhưng không xác định rõ vấn đề/nhu cầu của player |
| ★★★☆☆ | Concept statement có nhưng chưa cụ thể, hoặc bị functional fixedness (copy game khác) |
| ★★★★☆ | Concept rõ ràng, xác định đúng vấn đề, có USP |
| ★★★★★ | Concept sắc bén, vấn đề được validated, approach độc đáo và khả thi |

### 2. MDA Framework

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có MDA analysis, hoặc chỉ liệt kê mechanics mà không trace đến dynamics/aesthetics |
| ★★☆☆☆ | Có liệt kê M, D, A nhưng không có mapping rõ ràng giữa chúng |
| ★★★☆☆ | Mapping M→D→A có nhưng thiếu reverse check, hoặc có 1-2 mechanics không trace được |
| ★★★★☆ | Mapping đầy đủ cả 2 chiều, phát hiện được potential unwanted dynamics |
| ★★★★★ | Mapping xuất sắc, có ví dụ cụ thể cho mỗi chain, phân tích edge cases |

### 3. 8 Kinds of Fun

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không xác định target aesthetics, hoặc target quá nhiều (>4) |
| ★★☆☆☆ | Có target aesthetics nhưng mechanics không support chúng |
| ★★★☆☆ | Target 2-3 aesthetics, mechanics có support nhưng chưa nhất quán |
| ★★★★☆ | Target rõ ràng, mechanics support tốt, secondary aesthetics bổ trợ |
| ★★★★★ | Aesthetics strategy xuất sắc, mỗi mechanic trace được về aesthetic, không có xung đột |

### 4. Milieu

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có milieu, hoặc milieu mâu thuẫn với mechanics |
| ★★☆☆☆ | Có milieu nhưng chưa nhất quán (tone, art, audio không match) |
| ★★★☆☆ | Milieu nhất quán nhưng chưa có polish plan hoặc player type targeting |
| ★★★★☆ | Milieu phù hợp genre và audience, nhất quán, có player type targeting |
| ★★★★★ | Milieu xuất sắc, polish plan cụ thể, immersion cao, support aesthetics hoàn hảo |

---

## Pillar II: Decision Design

### 5. Meaningful Decisions

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có decision points, hoặc game hoàn toàn passive |
| ★★☆☆☆ | Có decisions nhưng không có consequences rõ ràng |
| ★★★☆☆ | Có decision points với consequences, nhưng mức agency chưa phù hợp audience |
| ★★★★☆ | Decision points rõ ràng, consequences meaningful, agency phù hợp |
| ★★★★★ | Decision design xuất sắc, automate đúng chỗ, agency tối ưu cho audience |

### 6. Anatomy of a Choice

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Decision points không được phân tích, hoặc chỉ mô tả kết quả |
| ★★☆☆☆ | Có phân tích nhưng thiếu 2+ khía cạnh (Before/Communication/Action/Consequences/Feedback) |
| ★★★☆☆ | Phân tích đủ 5 khía cạnh nhưng chưa sâu, 1-2 khía cạnh còn sơ sài |
| ★★★★☆ | 5 khía cạnh đầy đủ và rõ ràng cho mỗi decision point chính |
| ★★★★★ | Phân tích xuất sắc, dùng để chẩn đoán và fix vấn đề, có edge case analysis |

### 7. Interesting vs Less-Interesting Decisions

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Nhiều blind decisions bị lock-in, hoặc có dominant strategy rõ ràng |
| ★★☆☆☆ | Có 1-2 blind decisions hoặc 1 dominant strategy chưa được address |
| ★★★☆☆ | Không có vấn đề lớn, nhưng trade-offs chưa rõ ràng ở mọi decision |
| ★★★★☆ | Mỗi decision có trade-offs rõ ràng, không có dominant strategy |
| ★★★★★ | Decision design xuất sắc, mỗi option có situational value, expert-proof |

---

## Pillar III: Pacing & Learning

### 8. Game Flow

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không đề cập flow, hoặc challenge không scale theo skill |
| ★★☆☆☆ | Có đề cập flow nhưng thiếu cụ thể (không có challenge curve, không có rest points) |
| ★★★☆☆ | Flow design cơ bản: có challenge scaling, có rest points, nhưng chưa tinh tế |
| ★★★★☆ | Flow channel phù hợp audience, oscillation rõ ràng, 3 điều kiện flow được address |
| ★★★★★ | Flow design xuất sắc, dynamic difficulty, feedback loop tốt, rest/tension cân bằng |

### 9. Interest Curves

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có interest curve hoặc session structure |
| ★★☆☆☆ | Có session structure nhưng không có hook, hoặc không xác định interest floor |
| ★★★☆☆ | Có hook + climax nhưng thiếu mini-climaxes hoặc rest points |
| ★★★★☆ | Interest curve đầy đủ: hook, rising, mini-climaxes, climax, end > start |
| ★★★★★ | Interest curve tinh tế, có cả micro và macro level, session kết thúc tạo mong muốn chơi lại |

### 10. Learning Curves

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có onboarding design, hoặc dump tất cả mechanics cùng lúc |
| ★★☆☆☆ | Có onboarding nhưng first payoff quá muộn hoặc quá nhiều mechanics cùng lúc |
| ★★★☆☆ | Onboarding cơ bản: dạy từng mechanic, nhưng chưa tận dụng chunking hoặc prior knowledge |
| ★★★★☆ | Onboarding tốt: first payoff sớm, progressive disclosure, phù hợp audience |
| ★★★★★ | Onboarding xuất sắc: learn-by-doing tự nhiên, chunking tốt, cho phép skip nếu đã biết |

### 11. Randomness

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Random không được đề cập, hoặc random quá nhiều/quá ít mà không có lý do |
| ★★☆☆☆ | Có random nhưng không phân biệt input/output, không có mitigation |
| ★★★☆☆ | Vị trí trên Skill-Luck spectrum rõ ràng, nhưng mitigation chưa đủ |
| ★★★★☆ | Random strategy phù hợp audience, input/output được phân biệt, có mitigation |
| ★★★★★ | Random design tinh tế, tạo variety mà không phá agency, mitigation tự nhiên |

---

## Pillar IV: Player Motivation

### 12. Intrinsic & Extrinsic Motivation

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Chỉ có extrinsic rewards, không có intrinsic motivation design |
| ★★☆☆☆ | Có đề cập intrinsic nhưng thiếu 2/3 nhu cầu (Autonomy, Mastery, Purpose) |
| ★★★☆☆ | Cả 3 nhu cầu được address nhưng chưa sâu, hoặc overjustification risk chưa được đánh giá |
| ★★★★☆ | Balance tốt giữa intrinsic/extrinsic, overjustification risk thấp |
| ★★★★★ | Motivation design xuất sắc, extrinsic hooks + intrinsic retains, ethics được cân nhắc |

---

## Phân Tích Thử Thách Kỹ Năng

Phần bổ sung — không thuộc 4 Trụ Cột, không tính vào tổng điểm X/60. Đánh giá từng kỹ năng mà game thử thách, mỗi kỹ năng chấm theo 5 tiêu chí con, điểm = trung bình 5 tiêu chí.

### Kết Luận Từng Kỹ Năng
- 🟢 Tốt: ≥4.0/5
- 🟡 Cần Cải Thiện: ≥3.0/5
- 🔴 Có Vấn Đề Lớn: <3.0/5

### Kết Luận Tổng Thể Thử Thách Kỹ Năng
- 🟢 Tốt: Tất cả kỹ năng ≥ 🟡, đa số ≥ 🟢
- 🟡 Cần Cải Thiện: Có 1-2 kỹ năng 🔴, hoặc đa số 🟡
- 🔴 Có Vấn Đề Lớn: ≥3 kỹ năng 🔴, hoặc kỹ năng chính 🔴

### Tiêu Chí 1: Độ Phủ Cơ Chế

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có cơ chế nào thử thách kỹ năng này, hoặc chỉ là ảo giác thử thách |
| ★★☆☆☆ | Có 1 cơ chế liên quan nhưng thử thách quá đơn giản, không có chiều sâu |
| ★★★☆☆ | Nhiều cơ chế liên quan nhưng chưa kết hợp tốt — thử thách rời rạc |
| ★★★★☆ | Cơ chế kết hợp tạo thử thách có chiều sâu, có nhiều mức độ (người mới → chuyên gia) |
| ★★★★★ | Cơ chế phối hợp xuất sắc, thử thách nổi trội, trần kỹ năng cao và biểu hiện kỹ năng rõ ràng |

### Tiêu Chí 2: Đủ Thông Tin

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Người chơi hoàn toàn bị mù — không có thông tin để thực hiện thử thách |
| ★★☆☆☆ | Thông tin có nhưng quá ít hoặc quá muộn, phần lớn là đoán mò |
| ★★★☆☆ | Thông tin cơ bản đủ, nhưng thiếu phản hồi rõ ràng về kết quả của quyết định |
| ★★★★☆ | Người chơi có đủ thông tin để lập chiến lược, phản hồi rõ ràng về hiệu suất kỹ năng |
| ★★★★★ | Thiết kế thông tin xuất sắc — đủ để lên kế hoạch, đủ để học từ sai lầm, không bị quá tải thông tin |

### Tiêu Chí 3: Công Cụ & Quyền Chủ Động

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Người chơi không có công cụ/cơ chế để thể hiện kỹ năng — bị giới hạn bởi hệ thống |
| ★★☆☆☆ | Có công cụ nhưng quá ít lựa chọn, không cho phép thể hiện kỹ năng |
| ★★★☆☆ | Công cụ đủ cho thử thách cơ bản, nhưng người chơi giỏi bị trần kỹ năng thấp |
| ★★★★☆ | Đủ công cụ cho nhiều mức kỹ năng, giao diện không cản trở việc thể hiện kỹ năng |
| ★★★★★ | Công cụ phong phú, cho phép giải quyết vấn đề sáng tạo, thể hiện kỹ năng rõ ràng ở mọi cấp độ |

### Tiêu Chí 4: Hiệu Chỉnh Độ Khó

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Các chỉ số cân bằng không tạo thử thách thực sự — quá dễ hoặc quá khó ngay từ đầu |
| ★★☆☆☆ | Có thử thách nhưng độ khó không tăng theo tiến trình |
| ★★★☆☆ | Độ khó tăng nhưng thiếu tinh tế — sàn kỹ năng hoặc trần kỹ năng chưa phù hợp |
| ★★★★☆ | Sàn kỹ năng thấp cho người mới, trần kỹ năng cao cho chuyên gia, đường cong độ khó hợp lý |
| ★★★★★ | Hiệu chỉnh độ khó tinh tế, thay đổi linh hoạt, thưởng rõ ràng cho sự thành thạo, tiến trình tự nhiên |

### Tiêu Chí 5: Phù Hợp Đối Tượng

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Mức thử thách hoàn toàn sai đối tượng — game nhẹ đòi kỹ năng nặng hoặc ngược lại |
| ★★☆☆☆ | Có nhận thức về đối tượng nhưng 1-2 kỹ năng đòi hỏi vượt mức đối tượng chấp nhận |
| ★★★☆☆ | Nhìn chung phù hợp đối tượng, nhưng thiếu yếu tố may mắn bù (nhẹ) hoặc thiếu chiều sâu (nặng) |
| ★★★★☆ | Yêu cầu kỹ năng khớp với kỳ vọng đối tượng, có sự linh hoạt cho khác biệt trình độ |
| ★★★★★ | Phù hợp đối tượng hoàn hảo — game nhẹ có tha thứ, trung bình có thể hiện, nặng có trần thành thạo |
