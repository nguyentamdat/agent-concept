# Evaluation Criteria — Rubric Chấm Điểm

Rubric chấm điểm 1-5 sao cho 6 tiêu chí đánh giá GDD. Dùng khi đánh giá ở Step 4 (Per-Section Evaluation).

---

## Quy Tắc Chung

### Chấm Điểm
- Mỗi section × mỗi tiêu chí: **1-5 sao**
- Nếu tiêu chí không áp dụng cho section (ví dụ: "Data Completeness" cho section chỉ có text mô tả) → bỏ qua, không chấm — mẫu số giảm tương ứng

### Tính Điểm
- **Điểm section** = trung bình các tiêu chí có chấm (bỏ qua tiêu chí không áp dụng)
- **Điểm tiêu chí** = trung bình điểm tiêu chí đó across all sections
- **Điểm tổng GDD** = trung bình tất cả điểm section

### Verdict Thresholds
- 🟢 Strong: ≥ 4.0★
- 🟡 Needs Work: 2.5 – 3.9★
- 🔴 Major Issues: < 2.5★

Áp dụng cho: điểm tổng, điểm per-section, điểm per-tiêu chí.

---

## Tiêu Chí 1: Completeness

**Câu hỏi cốt lõi:** Section có đầy đủ nội dung không? Có placeholder/TODO/trống không?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Section gần như trống, chỉ có tiêu đề hoặc ghi "UPDATE LATER", "TBD", "TODO" |
| ★★☆☆☆ | Khung có sẵn (headings, tables) nhưng nhiều chỗ trống hoặc placeholder — dưới 40% nội dung |
| ★★★☆☆ | Có nội dung chính nhưng thiếu một số subsections hoặc chi tiết — khoảng 60-70% |
| ★★★★☆ | Gần đầy đủ, 1-2 chi tiết nhỏ có thể suy luận được từ context — trên 85% |
| ★★★★★ | Tất cả subsections có nội dung cụ thể, không có placeholder, không có chỗ trống |

**Ví dụ:**
- 1★: Section "Tính Năng" chỉ ghi "Section này là placeholder. Nội dung sẽ được bổ sung trong phiên bản sau."
- 3★: Bảng skills có tên + mana cost nhưng thiếu cột cooldown và use conditions
- 5★: Bảng skills đầy đủ: tên, mana cost, vị trí áp dụng, hiệu ứng cụ thể, cooldown, stacking rules

---

## Tiêu Chí 2: Flow Coverage

**Câu hỏi cốt lõi:** User flow có được mô tả step-by-step không? Có flow nào bị thiếu?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có mô tả flow, chỉ liệt kê tính năng mà không nói thứ tự hay điều kiện |
| ★★☆☆☆ | Chỉ mô tả tổng quát "người chơi làm X rồi Y" mà không step-by-step, thiếu điều kiện rẽ nhánh |
| ★★★☆☆ | Flow chính có step-by-step nhưng thiếu branching hoặc thiếu một số flow phụ |
| ★★★★☆ | Flow chính rõ ràng kèm branching, 1-2 nhánh phụ chưa mô tả chi tiết |
| ★★★★★ | Mọi flow mô tả rõ từng bước A → B → C, kèm điều kiện rẽ nhánh, kết thúc, và quay lại |

**Ví dụ:**
- 1★: "Game có chế độ Tournament" mà không mô tả flow từ bắt đầu đến kết thúc
- 3★: "Setup → Squad → Match → Result" có nhưng không nói khi nào từ Match quay lại Decision, khi nào Result có nút "Tiếp tục giải đấu"
- 5★: Flow đầy đủ: "Setup → Squad Selection (khi đủ 11/đội → enable Start) → Match (auto-tick) → Decision (6-9 lần, gap min 4 phút) → Clash → Outcome (goal/save/miss) → [10-50% sub-scenario] → Resume → ... → Full-time → Result → [Tournament: Bracket → Next Match]"

---

## Tiêu Chí 3: Interaction Clarity

**Câu hỏi cốt lõi:** Mỗi element/action có rõ behavior không? Dev có biết chính xác code gì không?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Chỉ có wireframe/mockup hoặc tên elements mà không mô tả interaction nào |
| ★★☆☆☆ | Chỉ liệt kê elements mà không mô tả behavior khi tương tác — dev phải đoán hoàn toàn |
| ★★★☆☆ | Biết element nào làm gì (chức năng) nhưng thiếu chi tiết response/state change/animation |
| ★★★★☆ | Behavior rõ cho hầu hết interactions: trigger → response → state change. 1-2 chỗ dev có thể tự suy luận |
| ★★★★★ | Mỗi thao tác có: trigger → response → state change → feedback, kèm timing/animation specs |

**Ví dụ:**
- 2★: "Có nút CHỌN ĐỘI HÌNH" mà không nói tap vào thì chuyển sang screen nào, animation gì
- 3★: "Tap player row → chọn cầu thủ" nhưng không nói highlight viền gì, count thay đổi ra sao, chuyện gì xảy ra khi đã đủ 11
- 5★: "Tap player (chưa chọn) → highlight viền accent → count +1 | Tap player (đã chọn) → bỏ highlight → count -1 | Tap khi đủ 11 → không phản hồi, row locked 40% opacity → phải bỏ chọn 1 trước"

---

## Tiêu Chí 4: Data Completeness

**Câu hỏi cốt lõi:** Formulas, giá trị số, ranges có đầy đủ không? Dev có phải đoán giá trị nào không?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Không có data nào — hoàn toàn mô tả bằng lời, dev phải tự nghĩ tất cả giá trị |
| ★★☆☆☆ | Chỉ mô tả "tính theo stat" hoặc "damage phụ thuộc level" mà không có công thức cụ thể |
| ★★★☆☆ | Có data chính (formulas, bảng giá trị) nhưng thiếu edge values, đơn vị, hoặc một số hằng số |
| ★★★★☆ | Hầu hết data đầy đủ: formulas + parameters + ranges. 1-2 giá trị dev có thể suy luận từ context |
| ★★★★★ | Mọi formula đầy đủ biến + hằng số, bảng giá trị có min/max/default, đơn vị rõ ràng (ms, px, %, v.v.) |

**Ví dụ:**
- 1★: "Damage tăng theo cấp" mà không có con số nào
- 3★: Công thức "atkRate = baseRate × (0.6 + statRatio × 0.5)" có nhưng không nói baseRate range bao nhiêu, statRatio tính từ đâu
- 5★: Công thức đầy đủ kèm bảng: "atkRate = baseRate × (0.6 + statRatio × 0.5) × (1.3 - oppDef × 0.4) + skillBonus | baseRate: 12-18% (Safe), 30-42% (Medium), 45-58% (Risky) | statRatio = myATK / oppDEF, range 0.4-2.5"

---

## Tiêu Chí 5: Consistency

**Câu hỏi cốt lõi:** Tên gọi, con số, logic có nhất quán xuyên suốt tài liệu không?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Tài liệu tự mâu thuẫn nghiêm trọng — dev không biết tin section nào, giá trị khác nhau cho cùng parameter |
| ★★☆☆☆ | Nhiều mâu thuẫn: giá trị khác nhau ở các sections (ví dụ: max mana = 100 ở section A, max = 80 ở section B), logic đối nghịch |
| ★★★☆☆ | Một số chỗ mâu thuẫn nhỏ: tên gọi khác nhau cho cùng concept (ví dụ: "mana" vs "energy"), giá trị gần giống nhưng không khớp |
| ★★★★☆ | Nhất quán, 1-2 chỗ dùng tên khác nhau nhưng rõ ý nghĩa giống nhau, không gây nhầm lẫn |
| ★★★★★ | Thuật ngữ, giá trị, logic hoàn toàn nhất quán xuyên suốt, không mâu thuẫn nào |

**Ví dụ:**
- 2★: Section 3 ghi "Mana ban đầu: 80, Max: 100" nhưng Section 4 ghi "Mana: 80" mà không nói max. Section 6 ghi skill cost "25 mana" nhưng Section 3 nói "mana tối đa 80" — dev không biết 25 là từ pool 80 hay 100
- 5★: Mọi nơi đều ghi "Mana: 80 (max 100)" nhất quán, skill costs trong bảng đều nằm trong range hợp lý so với max mana

---

## Tiêu Chí 6: Edge Cases

**Câu hỏi cốt lõi:** Tình huống đặc biệt, boundary, concurrent events có được cover không?

| Điểm | Tiêu chí |
|------|----------|
| ★☆☆☆☆ | Hoàn toàn không đề cập tình huống đặc biệt nào — chỉ mô tả happy path |
| ★★☆☆☆ | Chỉ mô tả happy path, hầu như không có edge case. 1-2 mentions rời rạc |
| ★★★☆☆ | Một số edge cases được đề cập nhưng không hệ thống — thiếu nhiều tình huống quan trọng |
| ★★★★☆ | Edge cases chính được cover cho hầu hết systems. 1-2 tình huống hiếm chưa đề cập |
| ★★★★★ | Mỗi system/interaction đều có "Nếu X thì Y", cover boundary values, error states, race conditions |

**Ví dụ:**
- 1★: Mô tả "player chọn cầu thủ" nhưng không nói chuyện gì xảy ra khi tap quá nhanh, khi đủ 11 rồi tap thêm, khi bỏ chọn rồi chọn lại
- 3★: Có "Nếu mana không đủ → choice disabled" nhưng thiếu: mana = 0 thì sao? Tất cả choices đều disabled thì sao? Mana reward vượt max thì sao?
- 5★: Mỗi interaction có bảng edge cases: "mana = 0: tất cả choices cost > 0 disabled, hiện tooltip 'Hết mana' | mana reward > max: cap tại 100, hiện '+X (capped)' | Tất cả choices disabled: auto-skip decision, hiện 'Hết mana — bỏ qua lượt'"
