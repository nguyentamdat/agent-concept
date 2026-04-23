# Art Style Guide Framework — Mobile Game

Framework để tạo art style guide / moodboard brief cho game mobile. Áp dụng cho mọi genre.

---

## Pipeline: Storytelling → Concept → Moodboard → Style Guide

### Bước 1: Storytelling

Thu thập thông tin từ user:

| Câu hỏi | Mục đích |
|---|---|
| Bối cảnh game ở đâu? | Xác định setting (farm, fantasy, city, space...) |
| Câu chuyện chính là gì? | Xác định narrative tone |
| Nhân vật / mục tiêu? | Xác định character style |
| Đối tượng người chơi? (Persona) | Xác định visual appeal |
| Genre game? | Xác định UI complexity level |
| Reference games? | Benchmark cho art direction |

### Bước 2: Tìm ý tưởng (Concept Mining)

Nguồn cảm hứng phổ biến:
- **Season / Holiday:** Giáng sinh, Halloween, Tết, Summer, Winter
- **Fairy tales:** Red Riding Hood, Alice, Snow White
- **Movie / Comic:** Animation styles, color grading reference
- **Music / Culture:** Nhật Bản, Vikings, Egyptian, Steampunk
- **Nature:** Ocean, Forest, Desert, Sky/Clouds, Candy/Sweet

### Bước 3: Moodboard Construction

Output moodboard brief gồm:
1. **Tổng màu chính/phụ** — Primary palette + accent colors
2. **Shape language** — Round vs angular, border radius values
3. **Bố cục** — Layout density, spacing philosophy
4. **Font chữ** — Font families, hierarchy sizes
5. **Texture/Material** — Flat, gỗ, kim loại, pha lê, candy...
6. **Mood keywords** — 5-8 keywords để search reference

---

## Genre-Specific Art Style Parameters

### CASUAL GAME (Playrix / King / Supercell style)

**8 đặc trưng DNA:**
1. High saturation color
2. High contrast color
3. Low Value range (sáng, tránh tối)
4. Simplicity
5. Clean and Fresh
6. Dynamic Shape and Form
7. Cartoony
8. Exaggeration

**Color:**
- Saturation: 70-100% (pick từ góc trên phải color picker)
- Value: 60-100% (tránh vùng tối)
- Panel: Bão hòa thấp, trung tính (cream, beige, light grey)
- CTA Primary: Xanh lá, xanh dương, vàng (positive)
- CTA Negative: Đỏ
- CTA Neutral: Xám nhạt, trắng
- Scheme: Split-Complementary hoặc Analogous

**Shape:**
- Border radius: Lớn, mềm mại (16-24px ở @2x)
- Button: Squircle, capsule shape
- Panel: Rounded rectangle, có thể freestyle (organic shape)
- Icon: Circle hoặc rounded square
- Overall: 80% tròn, 20% vuông bo mềm, 0% tam giác nhọn

**Typography:**
- Font type: Sans-serif (không chân)
- Max fonts: 4 loại
- Title: Bold, playful, có thể dùng display font
- Body: Clean, readable
- Number: Có thể dùng font riêng (chỉ số thường nổi bật)
- Effects (Unity): Stroke + Drop Shadow + Gradients ONLY
- Không dùng serif cho casual

**Material/Texture:**
- Gỗ ấm, cartoon wood
- Candy/pastry textures
- Nature elements (lá, hoa, nấm)
- Soft gradients, không gritty
- Subtle texture, không noisy

---

### MIDCORE GAME (RPG, Strategy, Card game)

**Color:**
- Saturation: 50-80%
- Value: 30-80% (wider range, có thể darker)
- Can use dark background with bright UI elements
- Scheme: Complementary hoặc Tetradic
- Rarity colors thường chuẩn: Common (grey), Uncommon (green), Rare (blue), Epic (purple), Legendary (orange/gold)

**Shape:**
- Border radius: Vừa phải (8-16px)
- Mix rounded + angular
- Panel: Có thể dùng decorative border (scroll, metal frame)
- Icon: Rounded square với border
- Overall: 50% tròn, 40% vuông, 10% angular

**Typography:**
- Font type: Mix sans-serif + serif
- Serif cho title/heading (cảm giác trang trọng)
- Sans-serif cho body/stats
- Number: Monospace cho stats display

**Material/Texture:**
- Metal, stone, leather
- Parchment, old paper
- Glowing effects (magic, sci-fi)
- Richer textures, more detail

---

### HARDCORE GAME (FPS, MOBA, Survival)

**Color:**
- Saturation: 30-60% (desaturated, realistic)
- Value: 20-70% (dark OK)
- Accent colors bright nhưng controlled
- Scheme: Monochromatic + 1-2 accent colors

**Shape:**
- Border radius: Nhỏ hoặc 0 (sharp)
- Angular, aggressive
- Panel: Hard edges, tech/military frame
- Icon: Square, hexagonal
- Overall: 20% tròn, 40% vuông, 40% angular

**Typography:**
- Font type: Sans-serif condensed, military-style
- All caps cho headings phổ biến
- Clean, functional

**Material/Texture:**
- Carbon fiber, brushed metal
- Concrete, tactical
- Gritty, weathered
- HUD-style overlays

---

## Color Psychology Mapping

| Màu | Ý nghĩa | Dùng cho |
|---|---|---|
| Đỏ | Nguy hiểm, tình yêu, khẩn cấp | Warning, close, delete, hearts/lives, sale badge |
| Cam | Năng lượng, lôi cuốn | Secondary CTA, highlight, notification |
| Vàng | Trẻ trung, giàu có, vui vẻ | Coins, premium, reward, star rating |
| Xanh lá | Thiên nhiên, hy vọng, tích cực | Primary CTA (Play, Accept, Buy, Confirm) |
| Xanh lam | Bình yên, trí tuệ, tin cậy | Info, neutral CTA, mana, ice theme |
| Tím | Huyền bí, hoàng tộc, premium | VIP, magic, epic rarity, special events |
| Hồng | Dễ thương, nữ tính, sweet | Game target nữ, candy theme, love events |
| Trắng/Cream | Sạch, nghỉ ngơi | Panel background, secondary panel |
| Đen/Dark | Mạnh mẽ, huyền bí | Hardcore UI, overlay, border |
| Vàng gold | Luxury, achievement | Premium currency, VIP, legendary |

---

## Color Scheme Recipes

### Complementary (Tương phản)
- 2 màu đối nghịch qua tâm color wheel
- Ưu: Nổi bật mạnh, CTA pop
- Nhược: Dễ chói nếu cả 2 đều high saturation
- Dùng: Khi cần 1 CTA nổi bật trên background

### Split-Complementary (Tương phản bổ sung)
- 1 màu chủ + 2 màu kề bên màu đối nghịch
- Ưu: Mềm hơn Complementary, vẫn có contrast
- Nhược: Cần balance 3 màu
- Dùng: **PHỔ BIẾN NHẤT cho casual game**

### Analogous (Tương đồng)
- 2-3 màu cạnh nhau trên color wheel
- Ưu: Hòa quyện, thống nhất, dễ chịu
- Nhược: Thiếu contrast cho CTA
- Dùng: Background, environment, panel system

### Tetradic (Phối 4 màu)
- 4 màu, mỗi màu = 1 chức năng
- Mapping: Nền / Nút chính / Notification / Accent
- Ưu: Đa dạng nhưng có hệ thống
- Nhược: Khó balance
- Dùng: Game có nhiều UI states cần phân biệt

---

## Output Template: Art Style Brief

Khi user yêu cầu tạo art style guide, output theo template sau:

```
# [Game Name] — Art Style Guide

## 1. Overview
- Genre: [...]
- Theme: [...]
- Target Audience: [...]
- Mood: [5-8 keywords]
- Reference Games: [...]

## 2. Color Palette
- Panel Background: [hex] [swatch]
- CTA Primary: [hex] — dùng cho [...]
- CTA Secondary: [hex] — dùng cho [...]
- CTA Negative: [hex] — dùng cho [...]
- CTA Neutral: [hex] — dùng cho [...]
- Accent 1: [hex] — dùng cho [...]
- Accent 2: [hex] — dùng cho [...]
- Text Primary: [hex]
- Text Secondary: [hex]
- Color Scheme: [Complementary / Split-Complementary / ...]

## 3. Shape Language
- Overall feel: [Rounded / Mixed / Angular]
- Border radius: [value]px
- Button shape: [Capsule / Rounded Rect / ...]
- Panel shape: [Rounded Rect / Freestyle / ...]
- Icon container: [Circle / Rounded Square / ...]

## 4. Typography
- Title Font: [Font name] — [size]pt
- Heading Font: [Font name] — [size]pt
- Body Font: [Font name] — [size]pt
- Number Font: [Font name] — [size]pt
- Font effects: [Stroke / Shadow / Gradient / None]

## 5. Material / Texture
- Primary material: [Gỗ / Kim loại / Flat / ...]
- Texture density: [Minimal / Moderate / Rich]
- Lighting style: [Soft / Dramatic / Flat]

## 6. UI Component Style Summary
- Panel: [mô tả]
- Button: [mô tả]
- Icon: [mô tả]
- Tab: [mô tả]
- Process bar: [mô tả]

## 7. Moodboard Keywords
[Danh sách 10-15 keywords để search reference trên ArtStation, Pinterest, etc.]
```

---

## Master Size & Technical Specs

| Spec | Value |
|---|---|
| Design size | 1500×2668px (portrait) |
| Export size | 750×1334px (iPhone 6 @2x) |
| Scale factor | 200% design → 100% export |
| Items size series | 44, 48, 56, 64, 72, 88, 96, 112, 128, 144, 176, 192, 224, 256, 288, 352, 384 |
| Min tap target | 44×44pt |
| Font effects (Unity) | Stroke, Drop Shadow, Gradients only |
| Panel design | 9-patch compatible (4 góc liên tục, center đơn giản) |
