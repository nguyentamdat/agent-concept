# Theory Knowledge Base — Game UI/UX

Toàn bộ kiến thức lý thuyết UI/UX game mobile, tổng hợp từ các workshop Casual Game Art và kinh nghiệm thực chiến của các senior game artist tại nhiều studio mobile game, kết hợp nguyên tắc Visual Hierarchy từ design industry.

---

## MỤC LỤC

1. UX là gì & UX Pipeline
2. UI Components
3. Shape Language
4. Color Theory
5. Visual Hierarchy (12 nguyên tắc)
6. Art Principles tổng hợp (6 tiêu chí review)
7. Animation & Micro-interactions
8. Onboarding & Tutorial UX
9. Monetization UI Patterns
10. Accessibility
11. Responsive & Adaptive Layout
12. Localization UI
13. Dark UI / Light UI
14. Quy trình sản xuất
15. Gaming Spectrum & Market Data

---

## 1. UX LÀ GÌ & UX PIPELINE

**UX = Hiểu biết về trải nghiệm người dùng.**

UX tốt khiến người dùng thoải mái, trung thành, và giới thiệu cho người khác. UX tốt → UI tốt (không phải ngược lại).

### UX Pipeline: 8 bước

| # | Bước | Mô tả | Ví dụ |
|---|---|---|---|
| 1 | Persona | Ai chơi? (giới tính, tuổi, vị trí, sở thích) | Nữ/bé gái, 12+, khắp nơi, thích candy & cute animals |
| 2 | Kiến trúc thông tin | Nhóm chức năng thành cây hệ thống | Settings → Sound/Music/Notification/Language |
| 3 | Kịch bản sử dụng | Progression theo vòng đời game | Tutorial → Lv.1-5 → Unlock A → Boss → Guild |
| 4 | Thiết kế tương tác | Cách tương tác (touch, drag, tilt, swipe) | CTA feedback: scale up, sound, vibrate |
| 5 | Sitemap | Bản đồ điều hướng giữa các màn hình | Splash → Login → Start → Play/Shop/Settings |
| 6 | Content Strategy | Từ ngữ phù hợp game & đối tượng | BARN thay SHOP, TRY AGAIN thay FAILED |
| 7 | Tính khả dụng | Đánh giá tính khả thi | Game trẻ em 3-5 tuổi: không guild, không IAP |
| 8 | Wireframe | Layout grayscale cho tất cả screens | Bao gồm tất cả screens cần thiết |

---

## 2. UI COMPONENTS

### Mockup vs Assets
- **Mockup:** Concept hoàn chỉnh 1 màn hình (all elements assembled)
- **Assets:** Từng thành phần rời (nền, nút, font, icon, hiệu ứng, đạo cụ)

### Component Reference

| Component | Vai trò | Lưu ý kỹ thuật |
|---|---|---|
| Border | Base layer, tạo style tổng thể | Nằm lớp dưới cùng |
| Panel/Card | Container chính | Freestyle (unique) hoặc 9-patch (scalable) |
| Panel Secondary | Phân vùng thông tin | Sáng/tối hơn primary để tạo contrast |
| Button Text | CTA có chữ (Play, OK, Buy) | Dùng khi action cần rõ nghĩa |
| Button Icon | CTA chỉ icon (gear, trophy) | Dùng khi icon đủ truyền đạt |
| Items / Icons | Icon = đại diện tính năng, Item = vật phẩm | Khác mục đích sử dụng |
| Checkbox/Radio | Toggle states | Stylize theo theme |
| Textfield | Nhập text (chat, profile) | Keyboard-aware |
| Tab | Phân loại nội dung | Active/inactive state rõ |
| Process bar | Tiến trình | Fill + track, cần contrast |

### 9-patch chi tiết
- 4 góc: giữ nguyên pixel (đối xứng hoặc không)
- 4 cạnh: stretch 1 chiều
- Center: stretch 2 chiều
- Ranh giới tiếp giáp phải liên tục
- Hạn chế texture/complexity ở center
- Phù hợp game có content dynamic lớn

### Font Rules
- Casual: Sans-serif | Midcore: Mix | Hardcore: Sans condensed
- Max 4 fonts, phải tương đồng style
- Lập Font Guideline: Title + Heading + Body + Number (mỗi loại có font & size)
- Unity effects: CHỈ Stroke, Drop Shadow, Gradients

---

## 3. SHAPE LANGUAGE

### 3 shapes cơ bản

| Shape | Ý nghĩa | Dùng cho |
|---|---|---|
| Vuông | Kiên định, vững chắc, bền bỉ | Panels, containers, ổn định |
| Tròn | Ngây thơ, trong sáng, đáng yêu | Casual games, icons, friendly |
| Tam giác | Nguy hiểm, sắc bén, tốc độ | Hardcore, warning, arrows |

### Tỷ lệ theo genre

| Genre | Tròn | Vuông | Angular |
|---|---|---|---|
| Casual | 80% | 20% bo mềm | 0% |
| Midcore | 50% | 40% | 10% |
| Hardcore | 20% | 40% | 40% |

---

## 4. COLOR THEORY

### Vòng tròn màu
- Cấp 1 (Primary): Vàng, Đỏ, Lam — không thể pha ra
- Cấp 2 (Secondary): Tím, Lục, Cam — pha 2 cấp 1 (50:50)
- Cấp 3 (Tertiary): 6 màu trung gian — pha cấp 1 + cấp 2

### 4 Nguyên tắc phối màu

| Scheme | Mô tả | Dùng cho |
|---|---|---|
| Analogous | Màu cạnh nhau → hòa quyện | Panel, background |
| Complementary | Đối nghịch → nổi bật mạnh | CTA vs background |
| Split-Complementary | 1 chủ + 2 kề đối nghịch | **Phổ biến nhất casual** |
| Tetradic | 4 màu = 4 chức năng (Nền/Nút/Notif/Accent) | Game nhiều UI states |

### Ý nghĩa màu trong game UI

| Màu | Ý nghĩa | Dùng cho |
|---|---|---|
| Đỏ | Nguy hiểm, khẩn cấp | Close, Delete, Warning, Give Up |
| Cam | Năng lượng, lôi cuốn | Secondary CTA, Highlight |
| Vàng | Giàu có, trẻ trung | Coins, Premium, Rewards, Stars |
| Xanh lá | Tích cực, hy vọng | Play, Accept, Buy (Primary CTA) |
| Xanh lam | Bình yên, trí tuệ | Info, Neutral CTA |
| Tím | Huyền bí, hoàng tộc | VIP, Magic, Epic rarity |
| Hồng | Dễ thương, nữ tính | Target nữ, Candy theme |

### Quy tắc Casual Game
- Pick góc trên phải color picker (saturation 70-100%, value 60-100%)
- Tránh vùng tối/xỉn
- Màu cấp 1 ưu tiên làm CTA
- Panel: bão hòa thấp (cream, beige)

---

## 5. VISUAL HIERARCHY — 12 NGUYÊN TẮC

12 nguyên tắc chia 3 nhóm, tất cả phục vụ mục tiêu: dẫn mắt người xem đến thông tin quan trọng nhất.

### Nhóm A: Thu hút mắt (Attention Grabbers)

**1. Size** — Element lớn = quan trọng. CTA nên gấp 1.5-2x xung quanh.

**2. Color** — Màu sáng, bão hòa cao thu hút trước. CTA dùng primary color nổi bật nhất.

**3. Contrast** — Khác biệt tạo focus. Max 3 mức contrast trong 1 screen (primary CTA / secondary / decorative). Nếu mọi thứ đều nổi bật → không gì nổi bật.

**4. Scale** — Tỷ lệ tương đối giữa elements. Title > Body > Caption với ratio tối thiểu 1.5x giữa các level. Khác Size ở chỗ Scale là về relationship, không phải absolute value.

**5. Typography** — Font weight, size, spacing tạo reading path. Bold + large = đọc trước. Regular + small = đọc sau. Hierarchy: Title (bold, 48pt) → Heading (medium, 32pt) → Body (regular, 24pt) → Caption (light, 18pt).

**6. Perspective** — Depth cues tạo không gian. Parallax scrolling trong saga map, depth-of-field blur cho background, size giảm dần theo "khoảng cách". Game UI tạo depth bằng overlay layers (gameplay → HUD → popup → dim overlay).

### Nhóm B: Sắp xếp (Organizers)

**7. Proximity (Gestalt)** — Gần = liên quan, xa = không liên quan. Settings screen: Sound + Music gần nhau (cùng group), tách xa Account info. Popup: title-content-CTA gần nhau bên trong panel, tách khỏi background.

**8. White space** — Khoảng trống emphasis và cho mắt nghỉ. Casual cần NHIỀU, Hardcore có thể dense hơn. Counter-example: WoW raid UI = quá dense.

**9. Alignment** — Grid tạo trật tự. 2 cấp: Element ↔ Màn hình (margins), Element ↔ Element (trong group). Grid nhất quán = chuyên nghiệp.

**10. Repetition** — Lặp lại tạo unity. Cùng loại element phải trông giống nhau: tất cả primary buttons cùng style, tất cả icons cùng treatment. Đây là nền tảng của Consistency.

**11. Composition** — Bố cục tổng thể. Rule of thirds: đặt focal point ở 1/3 màn hình (không phải chính giữa) cho dynamic layout. Popup là ngoại lệ — center justifiable. F2P thường: character 1/3 trái + CTA 1/3 phải.

### Nhóm C: Mẫu đọc (Reading Patterns)

**12. F & Z Patterns:**
- **F-pattern:** Quét ngang trên → ngang giữa ngắn hơn → dọc trái. Dùng cho content-heavy: Settings, Friends list, Leaderboard, Shop list.
- **Z-pattern:** Zigzag: trên-trái → trên-phải → dưới-trái → dưới-phải. Dùng cho landing/sparse: Lobby, Victory popup, Offer popup.

---

## 6. ART PRINCIPLES TỔNG HỢP — 6 TIÊU CHÍ REVIEW

Tất cả kiến thức ở trên được gom vào 6 tiêu chí review không overlap:

### Tầng 1 — Art Quality (game-specific)
| # | Tiêu chí | Gom từ | Hỏi |
|---|---|---|---|
| 1 | Visual Style | Ánh sáng + Shape language + Chất liệu + Perspective + Art DNA | Art style có đúng và nhất quán? |
| 2 | Color System | Palette harmony + CTA mapping + Color psychology + Saturation | Màu có hoạt động đúng chức năng? |
| 3 | Consistency | Repetition + Font compliance + Theme coherence | Tất cả element follow cùng rules? |
| 4 | Technical Readiness | 9-patch + Sizing series + Engine constraints + Asset org | Implement được trên mobile? |

### Tầng 2 — Layout Quality (universal design)
| # | Tiêu chí | Gom từ | Hỏi |
|---|---|---|---|
| 5 | Visual Hierarchy | Size/Scale + Contrast levels + Composition + Reading pattern + Trọng lực + Quy tắc 2 giây | Mắt biết nhìn đâu trước? |
| 6 | Spatial Organization | Alignment + Proximity + White space | Sắp xếp logic, thoáng? |

---

## 7. ANIMATION & MICRO-INTERACTIONS

Animation là "hơi thở" của game UI — biến giao diện tĩnh thành trải nghiệm sống động. Khác với illustration hay visual art, animation trong UI phục vụ chức năng, không phải trang trí.

### Micro-interaction là gì
Một sự kiện nhỏ hoàn thành 1 nhiệm vụ duy nhất. Gồm 4 thành phần:
- **Trigger:** User action (tap, swipe) hoặc system event (notification, timer)
- **Rules:** Logic xác định chuyện gì xảy ra
- **Feedback:** Phản hồi thị giác/âm thanh cho user biết action đã được ghi nhận
- **Loops & Modes:** Hành vi lặp lại hoặc thay đổi theo điều kiện

### Phân loại animation trong game UI

| Loại | Mục đích | Ví dụ |
|---|---|---|
| Feedback animation | Xác nhận action đã thực hiện | Button press (scale down → bounce back), toggle switch slide |
| State change | Thể hiện chuyển trạng thái | Tab active/inactive, checkbox check/uncheck, HP bar fill/drain |
| Transition | Chuyển đổi giữa screens/panels | Popup slide up, screen fade, panel expand/collapse |
| Attention | Thu hút mắt đến element quan trọng | CTA pulse/glow, notification badge bounce, new item shine |
| Celebration | Thưởng cảm xúc cho achievement | Stars fill, confetti, coin rain, character dance |
| Loading/Progress | Giảm cảm giác chờ đợi | Spinner, skeleton screen, progress bar with character chạy |
| Spatial guidance | Hướng dẫn vị trí/quan hệ | Parallax scroll, card expand from tap point, element fly to inventory |

### Nguyên tắc animation game UI

**Purposeful:** Mỗi animation phải có lý do tồn tại — feedback, guidance, hoặc emotion. Không animate vì đẹp.

**Subtle & Brief:** Animation UI nên ngắn (200-500ms cho phần lớn). Quá dài = cản trở flow. Exception: celebration effect có thể dài hơn (1-2s) vì đó là reward moment.

**Consistent:** Cùng loại action → cùng loại animation. Tất cả button tap đều bounce giống nhau. Tất cả popup đều appear cùng kiểu.

**Physics-based:** Motion nên theo vật lý tự nhiên — có easing (ease-out cho appear, ease-in cho dismiss), có overshoot nhẹ cho bounce. Tuyến tính = cứng nhắc, không tự nhiên.

**Không block interaction:** User phải có thể tap/action ngay cả khi animation đang chạy. Animation không bao giờ "lock" user chờ xong mới cho thao tác tiếp (trừ celebration ngắn).

### Timing guidelines

| Action | Duration | Easing |
|---|---|---|
| Button press feedback | 100-150ms | ease-out |
| Popup appear | 200-300ms | ease-out (overshoot nhẹ) |
| Popup dismiss | 150-200ms | ease-in |
| Screen transition | 250-400ms | ease-in-out |
| Tab switch | 150-200ms | ease-out |
| Toggle switch | 200ms | spring |
| Star fill (victory) | 300-400ms mỗi star | ease-out + bounce |
| Notification badge | 300ms appear + 1-2 bounce | spring |

### CTA Feedback (từ workshop)
Khi cần user chú ý CTA, kết hợp:
- Scale up (phóng to nhẹ → thu lại)
- Sound (hiệu ứng âm thanh)
- Vibrate (haptic feedback trên mobile)
- Glow/pulse (ánh sáng nhấp nháy)

---

## 8. ONBOARDING & TUTORIAL UX

### Tại sao quan trọng
Casual game có quy tắc 2 giây cho UI readability, nhưng onboarding là ngoại lệ — đây là lúc duy nhất user "cho phép" game dạy. Onboarding tệ = user drop ngay trong 60 giây đầu.

### Phân loại Tutorial Pattern

**Contextual (In-context):** Dạy ngay trong gameplay, khi action cần xảy ra. Ví dụ: hand pointer chỉ vào piece để swipe. Tốt nhất cho casual — user learn by doing.

**Frontloaded:** Dạy hết trước khi chơi (dạng slides hoặc video). Rủi ro: user skip hết → không hiểu gì. Chỉ phù hợp cho game phức tạp (strategy, RPG).

**Progressive disclosure:** Mở khóa tính năng dần theo progression. Level 1-5: chỉ match cơ bản. Level 6: mở booster. Level 10: mở shop. Level 15: mở friends. Tốt nhất cho retention dài hạn.

### UI Elements cho Tutorial

| Element | Mô tả | Dùng khi |
|---|---|---|
| Hand pointer | Ngón tay/arrow chỉ vào element cần tap | Hướng dẫn tap cụ thể |
| Spotlight/Mask | Dim toàn màn hình, chỉ sáng element target | Focus attention |
| Coachmark | Tooltip nhỏ cạnh element, có text hướng dẫn | Giải thích chức năng |
| Dialog bubble | NPC/character nói hướng dẫn | Story-driven tutorial |
| Progress dots | ● ○ ○ ○ — cho biết còn bao nhiêu bước | Multi-step tutorial |
| Skip button | Cho phép bỏ qua | LUÔN CÓ — respect user đã biết chơi |

### Best Practices

- **Show, don't tell:** Hành động trước, giải thích sau. Đừng show wall of text.
- **Max 3 bước mỗi tutorial sequence:** Quá dài = user mất kiên nhẫn.
- **Reward after tutorial:** Hoàn thành tutorial → nhận thưởng ngay (coins, item). Reinforcement.
- **Allow replay:** Có cách xem lại tutorial (Help/? button) cho user quên.
- **Don't block exploration:** Sau tutorial cơ bản, cho user tự khám phá. Chỉ popup hướng dẫn khi user rõ ràng bị stuck.

---

## 9. MONETIZATION UI PATTERNS

### Nguyên tắc chung
Monetization UI phải transparent và fair. UI tốt khiến user MUỞn mua, không phải ÉP mua. User cảm thấy bị lừa = uninstall + negative review.

### Pattern phổ biến

**Price Anchoring:**
- Show giá gốc gạch ngang, giá sale bên cạnh: ~~$9.99~~ → $2.99
- "75% OFF" badge nổi bật (đỏ/cam)
- Bundle so sánh: gói nhỏ $0.99 (100 gems) vs gói lớn $4.99 (800 gems + bonus) — gói lớn highlight "BEST VALUE"

**FOMO (Fear Of Missing Out):**
- Countdown timer ("2h 34m left!")
- "Limited" badge
- Seasonal offer với theme artwork
- "Only X remaining" stock indicator
- Dùng vừa phải — quá nhiều FOMO = user cảm thấy manipulated

**IAP Layout Hierarchy:**
- 3 gói: Small / Medium / Large
- Gói giữa (recommended) nổi bật nhất (larger, highlighted border, "POPULAR" tag)
- Giá real money nên rõ ràng, không ẩn sau nhiều lớp currency
- CTA "BUY" dùng primary color (xanh lá)

**Rewarded Ad Flow:**
- Offer rõ ràng: "Watch ad → get X" (hiển thị reward trước khi watch)
- Button "Watch" khác biệt với "Buy" (thường kèm video icon ▶)
- Sau khi watch → reward animation → satisfaction
- Không ép watch — luôn có alternative path (dù chậm hơn)

**First Purchase Offer:**
- Popup sau session 3-5 (đã hook nhưng chưa mua)
- Giá cực thấp (Starter Pack $0.99)
- Giá trị cực cao so với bình thường ("10x value!")
- Chỉ hiện 1 lần → tạo urgency

### UI Rules cho Monetization Screens

- **Không bao giờ che gameplay** khi user đang trong session (chờ end-of-session hoặc natural break)
- **Close button phải rõ ràng** — user phải thoát được offer trong 1 tap. X button đủ lớn (≥44pt), không delay, không ẩn
- **Hiển thị currency rõ** — user luôn biết mình đang trả bao nhiều (in-game currency vs real money)
- **Confirmation cho real money** — double confirm trước khi charge

---

## 10. ACCESSIBILITY

### Tại sao game cũng cần accessibility
~15% dân số thế giới có dạng khuyết tật nào đó. Game accessible = thị trường lớn hơn + ethical + nhiều nước bắt đầu có quy định pháp lý.

### Contrast & Readability

- **Text contrast ratio:** Tối thiểu 4.5:1 cho body text, 3:1 cho large text (≥24px)
- **Không dùng color-only để truyền thông tin:** Ví dụ success/fail chỉ khác xanh/đỏ → thêm icon (✓/✗) hoặc text
- **Color-blind safe palette:** Tránh chỉ dựa vào đỏ-xanh lá phân biệt (8% nam giới bị deuteranopia). Dùng thêm hình dạng, pattern, hoặc label
- **Test:** Dùng công cụ simulate color blindness (Photoshop View → Proof Setup → Color Blindness)

### Touch & Motor

- **Tap target:** Minimum 44×44pt (Apple) hoặc 48×48dp (Google). Đã có trong sizing series
- **Tap spacing:** Minimum 8pt giữa 2 tap targets để tránh mis-tap
- **Generous hit area:** Invisible hit area có thể lớn hơn visual element
- **Avoid precise gestures:** Swipe ok, nhưng tránh yêu cầu pinch/rotate chính xác cho core gameplay trên casual game
- **One-handed play:** Casual game nên chơi được bằng 1 tay (thumb zone)

### Text & Font

- **Minimum font size:** 11pt trên mobile (nhỏ hơn = không đọc được trên device thật)
- **Line height:** 1.4-1.6x font size
- **Avoid all-caps cho body text:** Khó đọc hơn mixed case. OK cho short labels/headings
- **Support text scaling:** Nếu OS tăng font size, game UI không bị vỡ layout

### Motion Sensitivity

- **Option giảm animation:** Respect `prefers-reduced-motion` hoặc in-game toggle
- **Không dùng flash nhanh hơn 3 lần/giây** (có thể gây seizure)
- **Parallax, screen shake:** Nên có toggle tắt

---

## 11. RESPONSIVE & ADAPTIVE LAYOUT

### Thực tế mobile hiện nay
Không chỉ có 1 kích thước. Các aspect ratio phổ biến: 16:9 (cũ), 18:9, 19.5:9 (iPhone), 20:9 (Samsung), 21:9 (Xperia). Tablet: 4:3, 3:2. Foldable: thay đổi khi gập/mở.

### Safe Area

- **Notch/Dynamic Island:** UI elements không được nằm dưới notch. Dùng safe area inset của OS
- **Rounded corners:** Nội dung không được bị cắt bởi bo góc màn hình
- **Home indicator (iOS):** Vùng 34pt dưới cùng, tránh đặt interactive elements
- **Navigation bar (Android):** Tương tự, tránh vùng gesture area

### Chiến lược Adaptive

**Anchor-based layout:**
- UI elements anchor vào cạnh màn hình (top, bottom, left, right)
- Gameplay area co giãn ở giữa
- HUD giữ vị trí cố định relative to edges

**Pillarbox/Letterbox:**
- Content thiết kế cho 1 ratio cố định (ví dụ 16:9)
- Ratio rộng hơn → thêm bar đen 2 bên (pillarbox)
- Ratio cao hơn → thêm bar đen trên dưới (letterbox)
- Đơn giản nhưng waste screen space

**Flexible zones:**
- Chia màn hình thành zones: Header (fixed height), Content (flexible), Footer (fixed height)
- Content zone co giãn theo screen height
- Horizontal: margins co giãn, content giữ max-width

### Tablet vs Phone

| Yếu tố | Phone | Tablet |
|---|---|---|
| Interaction | 1 tay (thumb) | 2 tay (cầm ngang) |
| Info density | Ít hơn, focus 1 task | Có thể show nhiều hơn |
| Font size | Lớn hơn relative | Có thể nhỏ hơn relative |
| Layout | Single column | Có thể 2 column |
| Bottom nav | Cần (thumb reach) | Optional (có thể sidebar) |

---

## 12. LOCALIZATION UI

### Text Expansion/Contraction

Khi dịch từ English sang ngôn ngữ khác, text thay đổi chiều dài:

| Ngôn ngữ | So với EN |
|---|---|
| German | +30% dài hơn |
| French | +20% dài hơn |
| Spanish | +20% dài hơn |
| Russian | +20% dài hơn |
| Japanese | -30% ngắn hơn |
| Chinese | -50% ngắn hơn |
| Korean | -10% ngắn hơn |
| Arabic | +25% dài hơn |

### UI Design cho Localization

- **Buttons:** Không fix width cứng. Dùng padding + min-width. Text "Play" (4 chars) vs "Spielen" (7 chars) vs "Играть" (6 chars)
- **Labels:** Dự phòng ít nhất 30% extra space so với English
- **Font fallback:** CJK characters (Chinese/Japanese/Korean) cần font riêng. Đảm bảo font fallback chain có CJK support
- **Number format:** 1,000.00 (US) vs 1.000,00 (DE) vs 1 000,00 (FR)
- **Date format:** MM/DD/YYYY (US) vs DD/MM/YYYY (EU) vs YYYY/MM/DD (Asia)
- **Currency symbol:** Vị trí khác nhau: $100 vs 100€ vs ¥100

### RTL (Right-to-Left) Layout

- Arabic, Hebrew: text đọc phải → trái
- Toàn bộ layout cần mirror: menu items, progress bars, navigation arrows
- Icons có hướng (arrow, progress) cần flip
- Icons không có hướng (gear, home) KHÔNG flip
- Number vẫn đọc trái → phải trong văn bản RTL

### Cultural Sensitivity

- **Màu sắc:** Trắng = tang lễ (VN, China, Nhật) vs tinh khiết (Western). Đỏ = may mắn (China) vs nguy hiểm (Western)
- **Biểu tượng:** Cử chỉ tay OK (👌) = xúc phạm ở một số nước. Tránh dùng gesture-specific icons
- **Hình ảnh:** Trang phục, food, architecture cần phù hợp văn hóa target
- **Tôn giáo:** Tránh sử dụng biểu tượng tôn giáo (thánh giá, trăng lưỡi liềm) trong decoration

---

## 13. DARK UI / LIGHT UI

### Khi nào dùng Dark UI

| Context | Dark | Light |
|---|---|---|
| Casual game (default) | ❌ | ✅ |
| Casual game (night theme) | ✅ | ❌ |
| Midcore RPG/Strategy | ✅ | ⚠️ Tùy theme |
| Hardcore (FPS, Survival) | ✅ | ❌ |
| Cinema/cutscene mode | ✅ | ❌ |
| Casino/Slot | ✅ | ❌ |

### Legibility Rules trên Dark Background

- **Text trên dark bg:** Dùng trắng hoặc light grey (#E0E0E0 - #FFFFFF). Tránh pure white quá sáng (#FFFFFF) cho body text dài → dùng ~#E8E8E8
- **Contrast khác:** Trên light bg, dark text trên light panel. Trên dark bg, bright text trên dark panel. CTA vẫn dùng màu bão hòa cao nhưng cần sáng hơn (tint up)
- **Panel trên dark bg:** Semi-transparent dark (rgba(0,0,0,0.4-0.7)) hoặc dark grey nhẹ (#1A1A2E, #2D2D44). Không dùng pure black panel trên pure black bg (mất depth)
- **Border/Separator:** Dùng light border (rgba(255,255,255,0.1-0.2)) thay vì dark border

### CTA trên Dark vs Light

| Element | Light UI | Dark UI |
|---|---|---|
| Primary CTA | Saturated green/blue | Brighter version of same color |
| Secondary CTA | Light grey | Dark grey with light border |
| Negative CTA | Red | Brighter red hoặc red với glow |
| Disabled | Light grey | Dark grey (gần bg nhưng vẫn visible) |
| Text on CTA | White | White (không đổi) |

### Shadow & Depth trên Dark UI

- Light UI: Drop shadow (dark, down) tạo depth
- Dark UI: Shadow không visible trên dark bg → dùng **light edge/glow** thay thế hoặc **elevation = lighter shade** (Material Design approach: cao hơn = sáng hơn)
- Inner glow nhẹ (rgba(255,255,255,0.05-0.1)) thay vì drop shadow

---

## 14. QUY TRÌNH SẢN XUẤT

### High-level Pipeline
Brainstorm → Concept/Mockup → Build/Test → Revision → Release

### Storytelling → Concept → Moodboard
1. **Storytelling:** Bối cảnh? Câu chuyện? Nhân vật/mục tiêu?
2. **Tìm ý tưởng:** Season/Fairy tales, Movie/Comic, Music/Culture
3. **Moodboard:** Tổng màu + Shape + Bố cục + Font + Texture + Mood keywords

### Production Pipeline
Wireframe (grayscale) → Moodboard (ref+style) → Cách điệu (stylize assets) → Saga Map → Master

### Technical Specs
- Design: 1500×2668px (200%)
- Export: 750×1334px (iPhone 6 @2x)
- Items size series: 44, 48, 56, 64, 72, 88, 96, 112, 128, 144, 176, 192, 224, 256, 288, 352, 384
- Min tap target: 44×44pt
- Sizing formula: chiều ngang ÷ số items → làm tròn về số gần nhất trong dãy

### Sketching
- Nét: Grayscale, focus shape/layout
- Màu: Color rough, test variation nhanh

### Asset Management
- Gom tất cả UI elements vào 1 file PSD
- Mỗi element = SmartObject, giữ layer effects

---

## 15. GAMING SPECTRUM & MARKET DATA

### Spectrum
Casual ←→ Midcore ←→ Hardcore

### Casual Game đặc điểm
1. Thông dụng, phổ biến
2. Đối tượng đa dạng (mọi lứa tuổi, giới tính, quốc gia)
3. Thời lượng session ngắn, nội dung đơn giản
4. Luật chơi dễ nắm bắt

### 8 đặc trưng DNA Casual Art
1. High saturation color
2. High contrast color
3. Low Value (sáng)
4. Simplicity
5. Clean and Fresh
6. Dynamic Shape and Form
7. Cartoony
8. Exaggeration

### Style Parameters theo genre

| Yếu tố | Casual | Midcore | Hardcore |
|---|---|---|---|
| Saturation | 70-100% | 50-80% | 30-60% |
| Value | 60-100% | 30-80% | 20-70% |
| Border radius | 16-24px | 8-16px | 0-8px |
| Font | Sans-serif | Mix | Sans condensed |
| Material | Gỗ, candy, nature | Metal, stone, parchment | Carbon fiber, concrete |
| Color scheme | Split-Comp | Complementary, Tetradic | Monochromatic + accent |

### Sub-genres
**Casual:** Puzzle (Match-3, Action, Word/Board), Arcade (Platformer, Idler, Hyper Casual), Simulation (Tycoon, Breeding, Time Management), Lifestyle (Customization, Interactive Story)
**Midcore:** Shooter (BR, FPS, Tactical), RPG (Action/Turn-based/MMORPG), Strategy (4X, MOBA, Build&Battle), Card Battler
**Casino:** Bingo, Poker/Cards, Slots
**Sports & Racing:** Casual/Licensed variants

### Market Data — US Top 200 Grossing Art Style

| Genre | Cartoon | Realistic | Manga |
|---|---|---|---|
| Casual | **71%** | 27% | 2% |
| Midcore | 24% | **59%** | 17% |
| Sports | 30% | **70%** | — |
| Casino | 14% | **86%** | — |

Takeaway: Casual = Cartoon chiếm ưu thế áp đảo.
