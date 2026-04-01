# Hướng Dẫn Viết Section Giao Diện (GUI)

Guide này giúp viết section 3 (Giao Diện) trong Detail GDD. Mỗi GUI section phải mô tả **behavior-driven** — không chỉ "trông như nào" mà còn "hoạt động như nào".

## Nguyên Tắc Chung

1. **Mỗi màn hình = 1 subsection riêng** — không gộp nhiều màn hình
2. **Elements trước, behavior sau** — liệt kê elements trên màn hình → sau đó mô tả hành vi
3. **Interaction Cases bắt buộc** — với mỗi element có thể tương tác, mô tả GUI thay đổi thế nào
4. **System Feedback bắt buộc** — mô tả cách hệ thống phản hồi cho mọi thao tác
5. **Edge cases không được bỏ qua** — nghĩ đến các trạng thái lỗi, offline, timeout, empty state

## Cách Viết Từng Phần

### Layout & Elements

Liệt kê TẤT CẢ elements hiển thị trên màn hình:
- Buttons, labels, icons, images, lists, tables
- Ghi rõ vị trí (trên/dưới/trái/phải/giữa)
- Ghi rõ chức năng của mỗi element

**Ví dụ tốt:**

| # | Element | Vị Trí | Chức Năng |
|---|---------|--------|-----------|
| 1 | Avatar người chơi | Góc trên trái | Hiển thị ảnh đại diện, tap để mở Profile |
| 2 | Số Gold | Cạnh Avatar | Hiển thị số gold hiện có |
| 3 | Nút Chơi Ngay | Giữa màn hình | Bắt đầu matchmaking nhanh |
| 4 | Danh sách Bàn | Dưới nút Chơi Ngay | Scroll dọc, hiển thị các bàn đang mở |

### Flow Chuyển Màn

Mô tả mọi cách user có thể rời khỏi màn hình hiện tại:
- Tap button nào → đi đến đâu
- Swipe gesture → đi đến đâu
- Hardware back button → đi đến đâu
- Auto-redirect (timeout, event) → đi đến đâu

### Interaction Cases

**Đây là phần quan trọng nhất.** Với mỗi element có thể tương tác:

1. **Hành động người chơi:** User làm gì? (tap, swipe, hold, drag)
2. **GUI phản hồi:** Màn hình thay đổi thế nào? (animation, highlight, show/hide element, chuyển màn)
3. **Trường hợp rẽ nhánh:** Cùng 1 hành động nhưng kết quả khác nhau tùy trạng thái

**Ví dụ — Nút "Vào Bàn":**

| # | Hành Động | GUI Thay Đổi | Ghi Chú |
|---|-----------|-------------|---------|
| 1 | Tap "Vào Bàn" (đủ tiền) | Hiển thị animation loading → chuyển sang GUI Bàn Chơi | Trừ tiền cược |
| 2 | Tap "Vào Bàn" (không đủ tiền) | Hiển thị popup "Không đủ Gold" với 2 nút: "Mua Gold" / "Đóng" | Không chuyển màn |
| 3 | Tap "Vào Bàn" (bàn đã đầy) | Hiển thị toast "Bàn đã đầy, vui lòng chọn bàn khác" | Toast tự ẩn sau 3s |

**Checklist câu hỏi để tìm interaction cases:**
- Khi user tap vào element này, chuyện gì xảy ra?
- Nếu điều kiện không thỏa mãn (không đủ tiền, không đủ quyền, bàn đầy...) thì sao?
- Nếu đang loading / chờ server thì hiển thị gì?
- Nếu server trả lỗi thì hiển thị gì?
- Nếu user tap nhiều lần liên tục thì sao? (debounce?)
- Nếu user quay lại (back) giữa chừng thì sao?

### System Feedback

Mô tả cách hệ thống thông báo cho người chơi:

| Loại Feedback | Khi Nào | Cách Hiển Thị | Ví Dụ |
|---------------|---------|---------------|-------|
| **Success** | Thao tác thành công | Toast/animation xanh | "Vào bàn thành công" |
| **Error** | Thao tác thất bại | Popup/toast đỏ | "Lỗi kết nối, thử lại" |
| **Loading** | Đang chờ server | Spinner/progress bar | Spinner overlay |
| **Warning** | Cần cảnh báo user | Popup xác nhận | "Bạn sẽ mất 100 Gold?" |
| **Info** | Thông tin hệ thống | Banner/toast | "Bảo trì lúc 2:00 AM" |

### Edge Cases

Các trạng thái đặc biệt cần mô tả:

- **Empty state:** Danh sách trống hiển thị gì? (vd: "Chưa có bàn nào")
- **Offline:** Mất kết nối giữa chừng → hiển thị gì? Retry như nào?
- **Timeout:** Server không phản hồi → hiển thị gì?
- **First time:** Lần đầu mở màn hình → có tutorial/tooltip không?
- **Concurrent update:** Thông tin thay đổi real-time (vd: số người trong bàn tăng/giảm)
- **Permission:** Tính năng bị khóa → hiển thị gì? (disabled button, lock icon, popup)
