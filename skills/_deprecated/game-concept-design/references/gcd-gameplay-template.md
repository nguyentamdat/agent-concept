# Phase B: GCD-Gameplay Template

Tài liệu thứ 2 được xuất ra sau Phase B (cùng với GCD chính). Mô tả gameplay theo dạng rulebook/hướng dẫn chơi.

---

## Template

~~~markdown
# [TÊN GAME] — Game Design Concept: Gameplay

**Version:** [1.0]
**Ngày tạo:** [YYYY-MM-DD]
**Cập nhật:** [YYYY-MM-DD]
**Trạng thái:** [Draft / Review / Approved]

---

## 1. Giới Thiệu & Mục Tiêu *(The Hook & The Goal)*

### Bối Cảnh *(Thematic Pitch)*

[2–3 câu ngắn gọn về câu chuyện và thế giới của game. Ví dụ: "Bạn là một nhà thám hiểm trẻ tuổi trong một vũ trụ nơi các ngôi sao đang dần tắt..."]

### Mục Tiêu Cốt Lõi

**Điều kiện chiến thắng:** [Ví dụ: Người đầu tiên đạt 100 Điểm Thắng, hoặc người sống sót cuối cùng, hoặc hoàn thành Quest chính]

---

## 2. Thành Phần & Chuẩn Bị *(Components & Setup)*

> 💡 **Lưu ý:** Hình ảnh minh họa ở phần này là cực kỳ quan trọng. Cần thêm ảnh mockup bàn game sau khi setup hoàn tất.

### Danh Sách Thành Phần

[Liệt kê đầy đủ để người chơi kiểm tra trước khi bắt đầu]

| Thành phần | Số lượng | Mô tả |
|------------|----------|-------|
| [Thành phần 1] | [số lượng] | [mô tả ngắn] |
| [Thành phần 2] | [số lượng] | [mô tả ngắn] |
| [Thành phần 3] | [số lượng] | [mô tả ngắn] |

### Sơ Đồ Setup

```
[Mô tả bố cục bàn game sau khi bày biện xong — dạng text hoặc ASCII art]

Ví dụ:
  [HUD / Status Bar]
  ┌─────────────────────────────┐
  │  [Khu vực chơi chính]       │
  │                             │
  │         [Player]            │
  └─────────────────────────────┘
  [Controls / Action Bar]
```

### Các Bước Chuẩn Bị

1. [Bước chuẩn bị 1 — Ví dụ: Chia bài, đặt token ban đầu]
2. [Bước chuẩn bị 2 — Ví dụ: Mỗi người chơi nhận X tài nguyên]
3. [Bước chuẩn bị 3 — Ví dụ: Xác định người đi đầu tiên]
4. [Bước chuẩn bị tiếp theo nếu có]

---

## 3. Khái Niệm Cơ Bản *(The Anatomy)*

> Giải thích "ngôn ngữ" của game trước khi đi vào logic chơi.

### Giải Mã Biểu Tượng *(Iconography)*

| Biểu tượng / Icon | Ý nghĩa | Ví dụ sử dụng |
|-------------------|---------|--------------|
| [Icon 1] | [ý nghĩa] | [xuất hiện ở đâu] |
| [Icon 2] | [ý nghĩa] | [xuất hiện ở đâu] |
| [Icon 3] | [ý nghĩa] | [xuất hiện ở đâu] |

### Định Nghĩa Thuật Ngữ

| Thuật ngữ | Định nghĩa |
|-----------|-----------|
| **[Từ khóa 1]** | [Giải thích trong ngữ cảnh game. Ví dụ: "Triệu Hồi" — hành động đưa một đơn vị từ tay vào bàn chơi] |
| **[Từ khóa 2]** | [Giải thích] |
| **[Từ khóa 3]** | [Giải thích] |

---

## 4. Luật Chơi *(Gameplay)*

### 4.1 Goals — Mục Tiêu Trò Chơi

[Mô tả chi tiết cách chiến thắng trong game. Bao gồm các mục tiêu ngắn hạn (per session) và dài hạn (overall win condition)]

**Mục tiêu ngắn hạn (per session/turn):**
- [Mục tiêu 1]
- [Mục tiêu 2]

**Mục tiêu dài hạn (win condition):**
- [Điều kiện thắng]

---

### 4.2 Obstacles — Thử Thách Của Trò Chơi

[Mô tả chi tiết các thành phần tạo nên thử thách trong game]

#### [Loại thử thách 1 — Ví dụ: Kẻ Địch]

**[Tên kẻ địch/thử thách A]**
- Mô tả: [...]
- Hành vi: [...]
- Cách xử lý: [...]

**[Tên kẻ địch/thử thách B]**
- Mô tả: [...]
- Hành vi: [...]
- Cách xử lý: [...]

#### [Loại thử thách 2 — Ví dụ: Môi Trường]

**[Cơ chế môi trường A — Ví dụ: Bẫy, Chướng ngại vật]**
- Mô tả: [...]
- Cách tương tác: [...]

---

### 4.3 Decisions — Quyết Định Của Người Chơi

[Giải thích chi tiết các hành động người chơi có thể làm và cách thực hiện]

#### Hành Động [A]: [Tên hành động]

- **Mô tả:** [Hành động này là gì]
- **Cách thực hiện:** [Người chơi làm gì — gesture, button, mechanic]
- **Chi phí / điều kiện:** [Cần tài nguyên/điều kiện gì]
- **Kết quả:** [Điều gì xảy ra]

#### Hành Động [B]: [Tên hành động]

- **Mô tả:** [...]
- **Cách thực hiện:** [...]
- **Chi phí / điều kiện:** [...]
- **Kết quả:** [...]

#### Hành Động [C]: [Tên hành động]

- **Mô tả:** [...]
- **Cách thực hiện:** [...]
- **Chi phí / điều kiện:** [...]
- **Kết quả:** [...]

---

### 4.4 Hệ Thống Phản Hồi *(Feedback System)*

> Sau mỗi quyết định, game phải trả lời câu hỏi của người chơi: *"Điều tôi vừa làm có ý nghĩa gì?"*

#### Thông Tin Người Chơi Nhận Được

Sau mỗi hành động, người chơi nhìn thấy các loại phản hồi sau:

| Loại phản hồi | Hiển thị như thế nào | Ý nghĩa game |
|---------------|----------------------|--------------|
| **[Phản hồi tức thì]** | [Ví dụ: Animation, số bật lên, màu sắc thay đổi] | [Hành động thành công/thất bại] |
| **[Phản hồi trạng thái]** | [Ví dụ: Thanh HP, icon buff/debuff, số liệu cập nhật] | [Chỉ số hiện tại của player/enemy] |
| **[Phản hồi chiến lược]** | [Ví dụ: Preview tác động, highlight lựa chọn tiếp theo] | [Gợi ý hướng đi tiếp theo] |
| **[Phản hồi rủi ro]** | [Ví dụ: Indicator nguy hiểm, cảnh báo màu đỏ] | [Cảnh báo hậu quả tiềm ẩn] |

#### Phân Tích Thông Tin → Ảnh Hưởng Đến Quyết Định

Mỗi loại thông tin dẫn người chơi đến **một câu hỏi chiến thuật**:

**[Tình huống A — Ví dụ: HP thấp]**
- Người chơi thấy: [Mô tả visual cụ thể — Ví dụ: Thanh HP chuyển đỏ, nhân vật run rẩy]
- Câu hỏi được đặt ra: [Ví dụ: "Tôi nên phòng thủ hay tấn công liều ăn nhiều?"]
- Lựa chọn mở ra: [Ví dụ: A) Dùng Potion (an toàn nhưng tốn tài nguyên), B) Tấn công tất tay (rủi ro cao, phần thưởng cao)]
- Độ khó quyết định: [Ví dụ: Cao — không có đáp án đúng tuyệt đối]

**[Tình huống B — Ví dụ: Kẻ địch sắp ra đòn mạnh]**
- Người chơi thấy: [Mô tả visual — Ví dụ: Icon cảnh báo trên kẻ địch, đếm ngược]
- Câu hỏi được đặt ra: [Ví dụ: "Tôi có kịp hạ địch trước không, hay nên né?"]
- Lựa chọn mở ra: [Ví dụ: A) Dùng kỹ năng mạnh ngay (cần đủ EP), B) Chịu đòn + phản công sau]
- Độ khó quyết định: [Ví dụ: Trung bình — phụ thuộc vào EP còn lại]

**[Tình huống C — thêm nếu cần]**
- Người chơi thấy: [...]
- Câu hỏi được đặt ra: [...]
- Lựa chọn mở ra: [...]
- Độ khó quyết định: [...]

#### Nguyên Tắc Thiết Kế Feedback

**Trực quan — người chơi hiểu ngay không cần đọc text:**
- [Quy tắc màu sắc — Ví dụ: Đỏ = nguy hiểm, Xanh = an toàn, Vàng = cơ hội]
- [Animation tương ứng — Ví dụ: Số thiệt hại bật lên ngay điểm bị đánh]
- [Âm thanh tương ứng — Ví dụ: Tiếng chuông = phần thưởng, tiếng va chạm = tấn công]

**Tức thì — feedback xuất hiện trong vòng [X] giây sau hành động:**
- [Phản hồi tức thì (< 0.1s): Ví dụ: Animation nhân vật]
- [Phản hồi ngắn hạn (< 1s): Ví dụ: Số thiệt hại, thay đổi HP bar]
- [Phản hồi trung hạn (1-3s): Ví dụ: Trạng thái mới, loot nhận được]

**Có ý nghĩa — mỗi feedback gắn với một quyết định tiếp theo:**
- [Không hiển thị thông tin thừa không ảnh hưởng đến gameplay]
- [Mỗi thay đổi trạng thái phải dẫn đến ít nhất 1 lựa chọn mới]

---

### 4.5 Quy Tắc Chi Tiết

[Đi sâu vào các cơ chế phức tạp hơn — chiến đấu, sử dụng kỹ năng đặc biệt, tương tác giữa các mechanic]

#### [Cơ chế phức tạp 1 — Ví dụ: Hệ Thống Chiến Đấu]

[Mô tả chi tiết quy tắc]

1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

#### [Cơ chế phức tạp 2 — Ví dụ: Hệ Thống Kỹ Năng]

[Mô tả chi tiết quy tắc]

---

## 5. Tiến Trình Trò Chơi *(Gameplay Loop)*

### Cấu Trúc Vòng Chơi *(Round Structure)*

[Các giai đoạn diễn ra trong một vòng/lượt]

```
Ví dụ:
  ┌─────────────────────────────────────────────┐
  │              MỘT VÒNG CHƠI                  │
  │                                              │
  │  1. [Pha Bắt Đầu]  →  2. [Pha Hành Động]   │
  │          ↑                      ↓            │
  │  4. [Pha Kết Thúc] ←  3. [Pha Phản Hồi]    │
  └─────────────────────────────────────────────┘
```

| Pha | Tên | Mô tả | Thời gian ước tính |
|-----|-----|-------|--------------------|
| 1 | [Tên pha 1] | [Điều gì xảy ra] | [giây/phút] |
| 2 | [Tên pha 2] | [Điều gì xảy ra] | [giây/phút] |
| 3 | [Tên pha 3] | [Điều gì xảy ra] | [giây/phút] |
| 4 | [Tên pha 4] | [Điều gì xảy ra] | [giây/phút] |

---

## 6. Kết Thúc & Tính Điểm *(End Game & Scoring)*

### Điều Kiện Kết Thúc

Game kết thúc khi:
- [Điều kiện 1 — Ví dụ: Hết chồng bài]
- [Điều kiện 2 — Ví dụ: Một người chơi đạt 50 điểm]
- [Điều kiện 3 nếu có]

### Cách Tính Điểm

[Hướng dẫn từng bước tính điểm cuối game]

| Nguồn điểm | Cách tính | Điểm tối đa |
|------------|-----------|-------------|
| [Nguồn 1] | [Công thức/quy tắc] | [số điểm] |
| [Nguồn 2] | [Công thức/quy tắc] | [số điểm] |
| [Thưởng đặc biệt] | [Điều kiện và số điểm] | [số điểm] |

**Thứ tự tính điểm:**
1. [Bước 1]
2. [Bước 2]
3. [Bước 3]

### Phân Định Thắng Thua *(Tie-breakers)*

Nếu hai hoặc nhiều người chơi bằng điểm nhau:
1. [Tie-breaker 1 — Ví dụ: Người có nhiều tài nguyên nhất thắng]
2. [Tie-breaker 2 nếu vẫn hòa — Ví dụ: Người đi sau thắng]
3. [Tie-breaker cuối cùng — Ví dụ: Chia thắng lợi]
~~~

---

## Hướng Dẫn Viết GCD-Gameplay

1. **Tone:** Viết như rulebook thực tế — rõ ràng, không mơ hồ, người chưa biết game có thể đọc và hiểu ngay
2. **Thứ tự:** Đi từ big picture → chi tiết. Người đọc phải hiểu mục tiêu TRƯỚC khi học mechanics
3. **Section 2 (Setup):** Ghi chú placeholder cho hình ảnh minh họa — đây là phần quan trọng nhất cho sản xuất thực tế
4. **Section 3 (Anatomy):** Định nghĩa tất cả từ khóa đặc thù trước khi dùng ở các section sau
5. **Section 4 (Gameplay):** Phần Goals → Obstacles → Decisions phải nhất quán với Core Loop trong GCD chính
6. **Section 4.4 (Feedback System):** Mỗi tình huống feedback phải trả lời đủ 4 câu hỏi: (1) Người chơi thấy gì? (2) Nó có nghĩa gì? (3) Câu hỏi nào được đặt ra? (4) Lựa chọn nào mở ra? — Feedback không có ý nghĩa game là feedback thừa
7. **Section 5 (Loop):** Round Structure phải sync với Interest Curve đã thiết kế trong GCD chính
8. **Không lặp lại lý thuyết:** GCD-Gameplay tập trung vào "cách chơi", không cần nhắc lại phân tích MDA hay 12 lý thuyết — điều đó đã có trong GCD chính
9. **Output:** Hoàn toàn bằng **tiếng Việt**

## Checklist GCD-Gameplay

- [ ] Bối cảnh 2-3 câu đủ sức hook người chơi mới
- [ ] Danh sách thành phần đầy đủ (có thể dùng để kiểm tra trước khi chơi)
- [ ] Sơ đồ setup rõ ràng (có placeholder hình ảnh)
- [ ] Tất cả biểu tượng/icon được giải thích
- [ ] Tất cả thuật ngữ game-specific được định nghĩa trước khi dùng
- [ ] Goals rõ ràng (ngắn hạn và dài hạn)
- [ ] Obstacles mô tả đủ để player biết cách phản ứng
- [ ] Mỗi hành động có đủ 4 yếu tố: mô tả, cách thực hiện, chi phí, kết quả
- [ ] Feedback System có ít nhất 2-3 tình huống cụ thể (không phải generic)
- [ ] Mỗi tình huống feedback trả lời đủ: thấy gì → nghĩa gì → câu hỏi → lựa chọn mở ra
- [ ] Nguyên tắc màu sắc / âm thanh / animation được định nghĩa rõ
- [ ] Không có feedback thừa (mọi thông tin hiển thị đều dẫn đến quyết định game)
- [ ] Round Structure có diagram dạng text
- [ ] Điều kiện kết thúc rõ ràng, không mơ hồ
- [ ] Tie-breaker được xác định
- [ ] Nhất quán với GCD chính (core loop, mechanics, aesthetics)
