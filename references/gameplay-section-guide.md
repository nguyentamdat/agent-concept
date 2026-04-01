# Hướng Dẫn Viết Section Gameplay

Guide này giúp viết section 4 (Gameplay) trong Detail GDD. Mỗi gameplay mode phải được mô tả chi tiết như một **rulebook** — rõ ràng, không mơ hồ, đủ để developer implement.

## Nguyên Tắc Chung

1. **Mỗi mode = 1 section riêng** — không gộp nhiều modes
2. **Viết như rulebook** — ai đọc cũng hiểu luật chơi mà không cần hỏi thêm
3. **Không mơ hồ** — "ngẫu nhiên" phải nói rõ xác suất; "nhanh" phải nói rõ bao nhiêu giây
4. **Cover mọi trường hợp** — phạm lỗi, edge cases, tình huống đặc biệt
5. **Có ví dụ cụ thể** — mỗi luật phức tạp cần 1 ví dụ minh họa

## Cách Viết Từng Phần

### Flow Vào Bàn Chơi

Mô tả chi tiết từ lúc user chọn chơi đến khi game bắt đầu:
- Bước 1: User tap gì?
- Bước 2: Matchmaking/chờ đợi như nào?
- Bước 3: Countdown?
- Bước 4: Game bắt đầu

Dùng diagram text nếu flow phức tạp.

### Setup Ban Đầu

Mô tả trạng thái ban đầu — CHÍNH XÁC:
- Số lượng elements (bài, bi, quân cờ...)
- Vị trí ban đầu (layout cụ thể)
- Resources ban đầu (HP, mana, gold, cards in hand...)
- Ai đi trước và cách xác định

**Ví dụ tốt:**
> "Bàn chơi 8 bi: 15 bi màu (1-7 trơn, 9-15 sọc) + 1 bi cái trắng. 15 bi màu được xếp hình tam giác tại điểm foot spot. Bi số 8 ở giữa tam giác. Bi cái đặt tại kitchen (¼ bàn phía đối diện)."

**Ví dụ xấu:**
> "Các bi được đặt trên bàn theo cách thông thường."

### Luật Chơi Chi Tiết

Viết từng luật rõ ràng, đánh số:

1. **Luật cơ bản:** Áp dụng mọi lúc, mọi lượt
2. **Luật đặc biệt:** Chỉ áp dụng trong điều kiện cụ thể
3. **Luật ưu tiên:** Khi 2 luật xung đột, luật nào thắng?

Mỗi luật phức tạp cần **ví dụ minh họa:**

> **Luật:** Nếu bi cái rơi vào lỗ (scratch), đối thủ được đặt bi cái tại bất kỳ vị trí nào trong kitchen area.
>
> **Ví dụ:** Player A đánh bi cái, bi cái bật bàn và rơi vào lỗ góc. Player B nhận lượt, được phép đặt bi cái tại bất kỳ đâu trong ¼ bàn phía trên (kitchen area) trước khi đánh.

### Điều Khiển

Mô tả CHÍNH XÁC cách tương tác trên mobile:
- Gesture nào (tap, drag, swipe, pinch, hold)?
- Touch area ở đâu?
- Có aim assist / guide line không?
- Sensitivity settings?

### Lượt Chơi

Mô tả rõ:
- Ai đi trước? (ngẫu nhiên? thắng trước? thua trước?)
- Điều kiện chuyển lượt (đánh xong? hết giờ? phạm lỗi?)
- Timer mỗi lượt: bao nhiêu giây? Hiển thị ở đâu? Hết giờ thì sao?
- Có "extra turn" không? Điều kiện?

### Phạm Lỗi

Liệt kê TẤT CẢ trường hợp phạm lỗi:
- Loại lỗi gì?
- Khi nào xảy ra? (điều kiện chính xác)
- Hậu quả? (mất lượt? penalty? đối thủ được advantage gì?)

**Quan trọng:** Không để lại lỗ hổng — developer cần biết MỌI trường hợp phạm lỗi.

### Combo / Bonus

Mô tả mechanics bonus/combo:
- Điều kiện kích hoạt (chính xác)
- Phần thưởng / hiệu ứng
- Có giới hạn không? (max combo? cooldown?)
- Feedback khi kích hoạt (animation, sound)

### Thắng / Thua

Điều kiện CHÍNH XÁC:
- Thắng khi nào? (liệt kê tất cả điều kiện)
- Thua khi nào?
- Hòa khi nào? (nếu có)
- Trường hợp disconnect?
- Trường hợp surrender/give up?

### Kết Quả & Phần Thưởng

Mô tả chi tiết:
- Màn hình kết quả hiển thị gì?
- Phần thưởng theo kết quả (thắng/thua/hòa)
- Có bonus multiplier không?
- EXP/Rating thay đổi thế nào?

## Checklist Cho Mỗi Gameplay Section

- [ ] Flow vào bàn đầy đủ, từ lobby đến game start
- [ ] Setup ban đầu chính xác (số lượng, vị trí, resources)
- [ ] Luật chơi không mơ hồ, có ví dụ cho luật phức tạp
- [ ] Điều khiển mô tả rõ gesture + touch area
- [ ] Lượt chơi: ai đi trước, chuyển lượt, timer, extra turn
- [ ] TOÀN BỘ trường hợp phạm lỗi được liệt kê
- [ ] Combo/bonus có điều kiện kích hoạt cụ thể
- [ ] Thắng/thua có điều kiện chính xác
- [ ] Kết quả & phần thưởng chi tiết
- [ ] Không có chỗ nào developer phải "đoán"
