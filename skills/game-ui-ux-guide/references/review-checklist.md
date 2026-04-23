# UI Mockup Review Checklist — 6 Tiêu Chí, 2 Tầng

Bộ tiêu chí đánh giá UI mockup game mobile. Chấm điểm 1-5 sao cho mỗi tiêu chí.

Thiết kế theo nguyên tắc: mỗi tiêu chí có ranh giới rõ ràng, không trùng lặp, mỗi vấn đề chỉ trừ điểm ở đúng 1 chỗ.

---

## Cách sử dụng

1. Xác định **genre game** (Casual / Midcore / Hardcore)
2. Xác định **loại screen** (Lobby, Shop, Ingame, Popup, Settings...)
3. Chấm điểm 6 tiêu chí (4 Art + 2 Layout)
4. Tổng hợp score /30 + feedback + gợi ý cụ thể

**Thang điểm:**
- ⭐ (1): Cần làm lại hoàn toàn
- ⭐⭐ (2): Có nhiều vấn đề cần sửa
- ⭐⭐⭐ (3): Chấp nhận được, cần polish
- ⭐⭐⭐⭐ (4): Tốt, chỉ cần tinh chỉnh nhỏ
- ⭐⭐⭐⭐⭐ (5): Xuất sắc, production-ready

---

# TẦNG 1: ART QUALITY (Game-specific)

Những thứ đặc trưng cho game UI — web/app UI thông thường không kiểm tra.

---

## 1. VISUAL STYLE (Phong cách thị giác)

**Hỏi:** Art style có đúng, có đẹp, và có nhất quán không?

### Sub-checks:

**Ánh sáng:**
- Tất cả UI elements có top-lit không? (highlight trên, shadow dưới — quy tắc tuyệt đối)
- Bevel/emboss, drop shadow có cùng hướng?
- Có element nào bị ngược sáng?

**Shape language:**
- Shape vocabulary có phù hợp genre?
  - Casual: 80% tròn + 20% vuông bo mềm → thân thiện
  - Midcore: 50% tròn + 40% vuông + 10% angular → cân bằng
  - Hardcore: 20% tròn + 40% vuông + 40% angular → mạnh mẽ
- Border radius có nhất quán giữa các element cùng loại?
- Button shape match với panel shape?

**Chất liệu & Texture:**
- Material có phù hợp theme? (gỗ cho farm, kim loại cho sci-fi, candy cho sweet...)
- Texture density có đúng genre? (casual = subtle, midcore = moderate, hardcore = rich)
- Không mix material lung tung (ví dụ: nút gỗ trên panel kim loại sci-fi)

**Perspective & Depth:**
- Có depth cues phù hợp? (parallax, scale variation, blur)
- Saga map / world map có cảm giác không gian?
- UI overlays có depth separation rõ với gameplay layer?

**Genre benchmarks:**
- Casual: High saturation, clean, cartoony, exaggerated, dynamic shapes, low value range
- Midcore: Rich, detailed, thematic borders (scroll, metal), glowing effects
- Hardcore: Desaturated, gritty, angular, HUD-style, tactical

**5 sao:** Art style nhất quán, đẹp, phù hợp genre, mọi element cùng "nói một ngôn ngữ"
**1 sao:** Các element trông như lấy từ nhiều game khác nhau

---

## 2. COLOR SYSTEM (Hệ thống màu sắc)

**Hỏi:** Màu sắc có hoạt động đúng chức năng không?

### Sub-checks:

**Palette harmony:**
- Color scheme có theo nguyên tắc phối màu? (Analogous, Complementary, Split-Complementary, Tetradic)
- Tổng thể có quá nhiều màu gây rối?
- Casual: high saturation (70-100%), pick góc trên phải color picker
- Midcore: moderate saturation (50-80%)
- Hardcore: low saturation (30-60%) + bright accent

**CTA color mapping:**
- Primary CTA (Play, Buy): Màu bão hòa cao nhất, nổi bật rõ (xanh lá, xanh dương, vàng)
- Secondary CTA (Cancel, Back): Nhạt hơn, neutral
- Negative CTA (Give Up, Delete, Close): Đỏ
- Disabled state: Xám, desaturated
- Max 3 mức contrast variation (primary / secondary / decorative)

**Color psychology:**
- Đỏ dùng đúng cho tiêu cực/khẩn cấp?
- Xanh lá dùng đúng cho tích cực?
- Màu chủ đạo truyền đúng mood theme?

**Panel vs Content:**
- Panel background: bão hòa thấp, trung tính (cream, beige)?
- Content trên panel: đủ contrast để đọc được?
- Secondary panel sáng/tối hơn primary để phân vùng?

**5 sao:** Palette harmonious, CTA mapping rõ ràng, mood đúng theme, text dễ đọc
**1 sao:** Màu chọn tùy tiện, CTA không nổi bật, text khó đọc trên background

---

## 3. CONSISTENCY (Tính nhất quán)

**Hỏi:** Tất cả element có follow cùng một bộ rules không?

### Sub-checks:

**Repetition — Cùng loại element phải trông giống nhau:**
- Tất cả primary buttons: cùng shape, cùng size, cùng color?
- Tất cả icon containers: cùng shape (circle hoặc rounded square)?
- Tất cả panels: cùng border style, cùng corner treatment?
- Tất cả text cùng level: cùng font, cùng size, cùng color?

**Font guideline compliance:**
- Có follow font hierarchy? (Title / Heading / Body / Number)
- Max 4 fonts?
- Các font có tương đồng style?
- Font effects đúng engine constraints? (Unity: chỉ Stroke, Drop Shadow, Gradients)

**Theme coherence:**
- Decorative elements (lá, dây leo, bolt, rivet...) có match theme?
- Gradient direction nhất quán?
- Icon style nhất quán (line vs filled vs 3D)?

**5 sao:** Nhìn bất kỳ 2 element cùng loại đều giống nhau, có thể đoán được style guide
**1 sao:** Mỗi element một kiểu, không nhận ra pattern nào

---

## 4. TECHNICAL READINESS (Sẵn sàng kỹ thuật)

**Hỏi:** UI này implement được trên mobile không?

### Sub-checks:

**9-patch compatibility:**
- Panels có thiết kế 9-patch được? (4 góc liên tục, center đơn giản)
- Center region không có pattern/text sẽ bị stretch?
- Ranh giới tiếp giáp mỗi phần liên tục?

**Sizing:**
- Items size có nằm trong dãy chuẩn? (44, 48, 56, 64, 72, 88, 96, 112, 128, 144, 176, 192, 224, 256...)
- Tap targets >= 44×44pt?
- Công thức đúng? (chiều ngang ÷ số items → làm tròn về số gần nhất)

**Asset organization:**
- Elements có tách được thành SmartObject / component tái sử dụng?
- Có tổ chức vào 1 file quản lý?
- Layer effects còn giữ (không flatten)?

**Responsive & Safe area:**
- Layout có adapt được cho nhiều aspect ratio? (16:9, 18:9, 19.5:9, 20:9)
- Safe area (notch, dynamic island, rounded corners, home indicator) có được tính?
- Anchor-based layout hay fixed position?

**Animation-ready:**
- Có ghi chú/spec cho animation states? (idle, pressed, disabled, hover)
- Button có thiết kế pressed state?
- Popup có consider appear/dismiss direction?
- Elements có separate đủ để animate independently?

**Accessibility baseline:**
- Text contrast ratio đạt 4.5:1 (body) / 3:1 (large text)?
- Thông tin không chỉ truyền bằng color-only? (có icon/text backup)
- Tap targets đủ 44×44pt với spacing ≥ 8pt?
- Font size ≥ 11pt trên mobile?

**Localization-ready:**
- Buttons/labels có dự phòng space cho text expansion (+30%)?
- Layout có break nếu text dài hơn 30% so với English?
- Number/date format có tính localization?

**5 sao:** Mọi element implement được ngay, đã tính engine constraints, animation, accessibility, responsive, localization
**1 sao:** Thiết kế đẹp nhưng không thể đưa vào game production

---

# TẦNG 2: LAYOUT QUALITY (Universal design principles)

Những nguyên tắc áp dụng cho mọi loại UI — bắt nguồn từ Visual Hierarchy & Gestalt.

---

## 5. VISUAL HIERARCHY (Phân cấp thị giác)

**Hỏi:** Mắt có biết nhìn đâu trước không?

### Sub-checks:

**Focal point & Quy tắc 2 giây:**
- Nhìn 2 giây, nhận ra screen này để làm gì?
- Có 1 hero element rõ ràng (nổi bật nhất)?
- Primary CTA có phải là thứ dễ thấy nhất?

**Size & Scale hierarchy:**
- Element quan trọng nhất có lớn nhất?
- Typography có phân cấp rõ? (Title >> Body >> Caption, ratio tối thiểu 1.5x)
- CTA button gấp 1.5-2x so với secondary elements?

**Contrast levels (max 3):**
- Level 1 (cao nhất): Primary CTA, hero content
- Level 2 (trung bình): Secondary actions, important info
- Level 3 (thấp nhất): Decorative, backgrounds, disabled
- Không có quá 3 levels? (nếu mọi thứ đều nổi bật → không gì nổi bật)

**Reading pattern:**
- Content-heavy screens (settings, list): Theo F-pattern? (quét ngang trên → ngang giữa → dọc trái)
- Landing/popup (lobby, victory): Theo Z-pattern? (trên-trái → trên-phải → dưới-trái → dưới-phải → CTA)
- Mắt di chuyển tự nhiên hay bị "nhảy" lung tung?

**Composition:**
- Focal point đặt ở vùng mạnh? (rule of thirds: 1/3 màn hình, không phải chính giữa trừ popups)
- Đối tượng chính vs phụ có phân cấp rõ về size, color, position?

**Visual weight / Trọng lực:**
- Element nặng (dark, dense) ở dưới, nhẹ (light, airy) ở trên?
- Layout có cảm giác "đứng vững"?
- Header area nhẹ hơn footer/nav area?

**5 sao:** Hierarchy crystal clear — 2 giây hiểu ngay screen purpose, mắt đi theo đúng flow
**1 sao:** Không biết nhìn đâu trước, mọi thứ cùng mức prominence

---

## 6. SPATIAL ORGANIZATION (Tổ chức không gian)

**Hỏi:** Các element có được sắp xếp logic không?

### Sub-checks:

**Alignment (Căn gióng):**
- Cấp 1: Elements căn lề với màn hình (margins, safe area)?
- Cấp 2: Elements trong cùng group căn lề với nhau?
- Grid system rõ ràng, nhất quán?
- Spacing giữa các element đều nhau?

**Proximity (Gestalt — gần = liên quan):**
- Elements liên quan có đặt gần nhau? (Sound + Music cùng group, tách xa Account info)
- Elements không liên quan có tách rõ?
- Có thể nhận ra grouping chỉ bằng spatial relationship?

**White space (Khoảng thở):**
- Đủ padding giữa element và viền panel?
- Đủ gap giữa các element?
- Có vùng nào quá dày đặc?
- Casual: cần NHIỀU white space
- Midcore: vừa phải
- Hardcore: có thể dense nhưng vẫn cần logical grouping

**5 sao:** Bố cục thoáng, grouping tự nhiên, grid rõ ràng, mắt không bị overwhelm
**1 sao:** Chen chúc, không thấy grouping logic, spacing tùy tiện

---

# OUTPUT FORMAT

## Dạng Text (Default — trả trong chat)

```
## UI Review: [Tên screen / Game]
**Genre:** [Casual / Midcore / Hardcore]
**Screen type:** [Lobby / Shop / Settings / ...]

### TẦNG 1 — ART QUALITY
| # | Tiêu chí | Score | Nhận xét ngắn |
|---|---|---|---|
| 1 | Visual Style | ⭐⭐⭐⭐ | Top-lit nhất quán, shape phù hợp casual |
| 2 | Color System | ⭐⭐⭐ | CTA ok nhưng palette hơi nhiều màu |
| 3 | Consistency | ⭐⭐⭐⭐ | Buttons đồng bộ, font compliance tốt |
| 4 | Technical Readiness | ⭐⭐⭐⭐⭐ | 9-patch ready, sizing chuẩn |

### TẦNG 2 — LAYOUT QUALITY
| # | Tiêu chí | Score | Nhận xét ngắn |
|---|---|---|---|
| 5 | Visual Hierarchy | ⭐⭐⭐ | CTA nổi nhưng typography scale chưa rõ |
| 6 | Spatial Organization | ⭐⭐⭐⭐ | Grid tốt, grouping logic |

**Tổng: 23/30 — Khá tốt, cần polish color và hierarchy**

### Điểm tốt
- [2-3 điểm nổi bật]

### Cần cải thiện (ưu tiên cao → thấp)
1. [Vấn đề] → [Gợi ý cụ thể] — ảnh hưởng tiêu chí [#]
2. [Vấn đề] → [Gợi ý cụ thể] — ảnh hưởng tiêu chí [#]
3. [Vấn đề] → [Gợi ý cụ thể] — ảnh hưởng tiêu chí [#]
```

## Dạng Excel (Khi user yêu cầu file)

Tạo Excel với 2 sheet:
- Sheet "Scorecard": Bảng 6 tiêu chí + điểm + nhận xét chi tiết
- Sheet "Action Items": Danh sách gợi ý cải thiện, sắp theo priority (High/Medium/Low)

## Dạng Markdown (Khi user yêu cầu document)

Export full review thành file .md trong /mnt/user-data/outputs/
