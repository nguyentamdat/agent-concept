# Expected Section Categories — GDD Mobile Games

Danh sách 10 loại section thường gặp trong GDD mobile game. Dùng ở Step 2 (Section Discovery) và Step 3 (Gap Analysis).

**Cách sử dụng:**
- Đọc GDD → nhận diện nội dung thuộc category nào
- Một section GDD có thể map vào nhiều categories
- Một category có thể được cover bởi nhiều sections
- KHÔNG bắt buộc GDD phải đặt tên hay sắp xếp theo thứ tự này

---

## 10 Categories

### 1. Game Overview
**Mô tả:** Mô tả tổng quan game — thông tin nền tảng để mọi người hiểu game này là gì.

**Nội dung thường có:**
- Thể loại (genre, sub-genre)
- Platform (mobile, web, cross-platform)
- Target audience (độ tuổi, giới tính, player type)
- Số người chơi (single, multiplayer, modes)
- Session length (thời gian chơi trung bình)
- Art style / art direction
- Tóm tắt game 1-2 câu (elevator pitch)

**Keywords để detect:** thể loại, genre, platform, target, audience, mục tiêu, tổng quan, giới thiệu, overview, mô tả game, description

---

### 2. Core Gameplay
**Mô tả:** Core loop và luật chơi chính — flow cốt lõi mà player lặp lại.

**Nội dung thường có:**
- Core loop (flow chính A → B → C → lặp)
- Luật chơi cơ bản (rules)
- Win/lose conditions (điều kiện thắng/thua)
- Điều kiện kết thúc (session end, match end)
- Mô tả gameplay flow tổng quát

**Keywords để detect:** core loop, gameplay, luật chơi, rules, win, lose, thắng, thua, flow, vòng lặp, cơ bản

---

### 3. GUI / Screens
**Mô tả:** Từng màn hình trong game — layout, elements, navigation.

**Nội dung thường có:**
- Danh sách tất cả screens/pages
- Mỗi screen: tên, layout description, danh sách UI elements
- Mỗi element: vị trí, kích thước/tỷ lệ, chức năng, visual specs
- Navigation flow giữa screens (screen A → screen B khi nào)
- Responsive/adaptive notes (nếu có)

**Keywords để detect:** screen, màn hình, giao diện, GUI, UI, layout, button, nút, panel, overlay, popup, modal, navigation, menu

---

### 4. Interaction & Controls
**Mô tả:** Hành động người chơi và phản hồi hệ thống — mỗi thao tác dẫn đến gì.

**Nội dung thường có:**
- Mỗi thao tác (tap, swipe, drag, long-press, keyboard): trigger gì
- Phản hồi hệ thống: animation, sound, state change
- State transitions: element trước/sau interaction
- Disabled/enabled states: khi nào element bị vô hiệu
- Timing: debounce, cooldown, animation duration

**Keywords để detect:** tap, click, swipe, drag, press, input, control, interaction, thao tác, hành động, điều khiển, touch, gesture

---

### 5. Game Systems & Mechanics
**Mô tả:** Các hệ thống con — combat, economy, scoring, crafting, v.v.

**Nội dung thường có:**
- Mỗi system: tên, mô tả, mục đích
- Formulas / công thức tính toán
- Parameters: tên biến, giá trị, ranges (min/max/default)
- Data tables: bảng thông số
- State machines: trạng thái + transitions
- Relationships giữa systems

**Keywords để detect:** system, hệ thống, mechanics, cơ chế, formula, công thức, damage, score, điểm, economy, tính toán, calculation, mana, health, stamina, combat, chiến đấu

---

### 6. Characters / Entities
**Mô tả:** Nhân vật, đơn vị, items — bất kỳ entity nào có stats/properties.

**Nội dung thường có:**
- Danh sách entities (characters, units, items, cards, v.v.)
- Mỗi entity: stats, abilities/skills, variations
- Stat ranges (min/max per stat)
- Spawn/generation rules (xuất hiện khi nào, ở đâu)
- Bảng thông số tổng hợp
- Rarity / tier system (nếu có)

**Keywords để detect:** character, nhân vật, cầu thủ, unit, đơn vị, item, vật phẩm, card, thẻ, entity, stats, chỉ số, skill, kỹ năng, ability

---

### 7. Game Modes
**Mô tả:** Các mode chơi khác nhau — luật riêng, setup riêng.

**Nội dung thường có:**
- Danh sách các mode
- Mỗi mode: setup, luật riêng, win conditions
- Điểm khác biệt giữa modes
- Mode-specific parameters (AI difficulty, time limits, v.v.)
- Mode unlock conditions (nếu có)

**Keywords để detect:** mode, chế độ, quick match, tournament, giải đấu, campaign, story, PvP, PvE, multiplayer, single player, ranked, casual

---

### 8. Progression & Meta
**Mô tả:** Hệ thống tiến trình dài hạn — những gì giữ player quay lại.

**Nội dung thường có:**
- Leveling system: XP curves, level milestones
- Unlock conditions: mở khóa content khi nào
- Reward tables: phần thưởng gì, khi nào, bao nhiêu
- Currencies: loại tiền, cách kiếm, cách tiêu
- Long-term loop: daily/weekly/seasonal
- Achievement/collection systems

**Keywords để detect:** level, progression, tiến trình, unlock, mở khóa, reward, phần thưởng, XP, currency, tiền, achievement, thành tựu, daily, weekly, season, meta

---

### 9. Audio & VFX
**Mô tả:** Âm nhạc, SFX, hiệu ứng visual — sensory feedback.

**Nội dung thường có:**
- BGM tracks: danh sách, mô tả mood, khi nào phát
- SFX: danh sách, mô tả, trigger condition, duration
- VFX: danh sách, mô tả visual, trigger condition, duration, specs
- Animation specs: timing, easing, keyframes
- Particle effects: số lượng, hướng, fade

**Keywords để detect:** audio, âm thanh, nhạc, BGM, SFX, sound, effect, hiệu ứng, VFX, animation, particle, visual, flash

---

### 10. Edge Cases & Error Handling
**Mô tả:** Tình huống đặc biệt và xử lý lỗi — những gì xảy ra ngoài happy path.

**Nội dung thường có:**
- Boundary values: giá trị cực biên (0, max, overflow)
- Concurrent events: nhiều sự kiện xảy ra cùng lúc
- Network issues: mất kết nối, timeout, retry
- Invalid states: state không hợp lệ, recovery
- Fallback behaviors: khi system fail, dùng gì thay thế
- Race conditions: thứ tự xử lý khi đồng thời

**Keywords để detect:** edge case, error, lỗi, fallback, boundary, giới hạn, concurrent, đồng thời, timeout, invalid, exception, special case, tình huống đặc biệt

---

## Gap Detection Guide

### Phân biệt Missing vs Thin vs Present

| Status | Tiêu chí | Ví dụ |
|--------|----------|-------|
| **❌ Missing** | Không tìm thấy nội dung nào thuộc category | GDD không có section nào nói về Audio/VFX |
| **⚠️ Thin** | Có đề cập nhưng thiếu chi tiết — dưới 30% nội dung kỳ vọng | Có 1 dòng "game có SFX" mà không liệt kê SFX nào |
| **✅ Present** | Có nội dung đầy đủ hoặc gần đầy đủ | Có bảng SFX với trigger, duration, mô tả cho từng sound |

### Lưu ý khi mapping

- Một section GDD tên "Gameplay Mechanics" có thể cover cả category 2 (Core Gameplay) và category 5 (Game Systems)
- Một category như "Edge Cases" có thể nằm rải rác trong nhiều sections khác nhau (ví dụ: mỗi section có phần "special cases")
- Không phạt GDD vì tên section khác — chỉ quan tâm nội dung có hay không
- Category 10 (Edge Cases) thường không có section riêng — tìm trong các sections khác
