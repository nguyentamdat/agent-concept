# Wireframe Overview Guide

Hướng dẫn chi tiết cho `wireframe-designer` khi sinh `projects/{project-name}/wireframe.html` — single-page interactive flowchart làm tài liệu spec tham chiếu.

## Mục tiêu của Wireframe Overview

Wireframe KHÔNG phải để chơi, KHÔNG phải để demo visual. Nó là **spec document dạng diagram + data** mà artist, engineer, QA sử dụng để biết:

1. Toàn bộ cấu trúc navigation của game (ở level overview)
2. Mỗi màn hình có component gì, thuộc type nào, position ở đâu
3. Mỗi component có những state nào cần visual + logic
4. Mỗi component phản ứng như thế nào với event (onClick, onHover, etc.)
5. Mỗi component bind data nào (dynamic value)

Wireframe là **single source of truth** cho component spec. Ui-ux-spec.md sẽ trích từ wireframe, không viết lại.

---

## Phần 1: Flowchart Layout Rules

### 1.1 Layout Strategy

Chọn 1 trong 3 strategy dựa vào game:

| Strategy | Khi dùng | Đặc điểm |
|---|---|---|
| **Linear** | Onboarding → Tutorial → Gameplay (hyper-casual, narrative) | Flow ngang từ trái sang phải, ít phân nhánh |
| **Hub-and-spoke** | Mobile game có Lobby là trung tâm (Casual/Midcore) | Lobby ở center, các feature (Shop, Inventory, Leaderboard...) là node xung quanh |
| **Tree** | Progression có nhánh (RPG, Roguelike, Adventure) | Root ở top, leaves ở bottom, depth = progression depth |

Designer phải explicit chọn strategy trong code:
```javascript
const LAYOUT_STRATEGY = 'hub-and-spoke'; // 'linear' | 'hub-and-spoke' | 'tree'
```

### 1.2 Box Positioning (manual, deterministic)

Mỗi screen có `position: { x, y }` trong `WIREFRAME_DATA.screens`. Designer đặt manually — KHÔNG dùng force-directed random.

**Grid:** 40px step để align sạch.

**Spacing guideline:**
- **Compact mode:** Box 180×120px
- **Visual mode:** Box 200×280px (có chứa mini wireframe preview ~160×180px)
- Horizontal spacing giữa box: tối thiểu 80px (compact), 100px (visual)
- Vertical spacing: tối thiểu 60px (compact), 80px (visual)
- Canvas tối thiểu 1200×800px (có pan/zoom nếu lớn hơn)
- Box size: 180×120px
- Horizontal spacing giữa box: tối thiểu 80px
- Vertical spacing: tối thiểu 60px
- Canvas tối thiểu 1200×800px (có pan/zoom nếu lớn hơn)

**Hub-and-spoke mẫu:**
```
              ┌──────┐
              │Shop  │
              └──┬───┘
                 │
┌──────┐     ┌───▼──┐     ┌──────────┐
│Splash│────▶│Lobby │────▶│ Gameplay │
└──────┘     └──┬───┘     └──────────┘
                │
              ┌─▼────┐
              │Inv   │
              └──────┘
```

**Linear mẫu:**
```
┌──────┐   ┌──────────┐   ┌────────┐   ┌──────┐   ┌───────┐
│Splash│──▶│Onboarding│──▶│Tutorial│──▶│Lobby │──▶│Gameply│
└──────┘   └──────────┘   └────────┘   └──────┘   └───────┘
```

**Visual mode mẫu (box lớn với mini preview):**
```
┌──────────────────┐
│   Lobby [12]     │
│  ┌────────────┐  │
│  │ ┌──┐  ┌──┐ │  │
│  │ │Nav│  │$ │ │  │
│  │ └──┘  └──┘ │  │
│  │  ┌────────┐ │  │
│  │  │  Play  │ │  │
│  │  └────────┘ │  │
│  └────────────┘  │
└──────────────────┘
```
- Box kích thước 200×280px
- Header: screen name + component count badge
- Preview area: ~160×180px SVG với component boxes
- Border: 2px neutral (brand color cho màn hình chính)

### 1.3 Wire (Edge) Rules

Mỗi edge trong `WIREFRAME_DATA.edges`:

```javascript
{
  from: 'lobby',           // Screen ID
  to: 'gameplay',          // Screen ID
  trigger: 'Tap Play',     // Human-readable trigger
  style: 'solid',          // 'solid' | 'dashed' | 'dotted'
  label_position: 'mid'    // 'start' | 'mid' | 'end' — nơi đặt label text
}
```

**Style classification:**
- `solid` — User action trigger (tap, click, swipe, drag) — DEFAULT
- `dashed` — Conditional/branching (success/error path, level complete, etc.)
- `dotted` — System event (timeout, push notification, network event)

**Arrowhead:** PHẢI có ở end để chỉ direction. Bidirectional nav thì vẽ 2 edge riêng biệt, không dùng double-arrow.

**Label placement:** Text label có padding + background trắng (1px border) để đọc được khi đè lên wire. Tối thiểu 10px, tối đa 60px length — nếu dài hơn thì rút gọn và có tooltip.

**Crossing rules:**
- Cố gắng tránh crossing bằng cách reposition box
- Nếu không thể tránh, wire đi dưới wire khác tại intersection (z-index thấp hơn)
- Không dùng "bridge over" notation (arc trên intersection) — quá phức tạp

### 1.4 Canvas Behavior

- **Pan:** drag on empty canvas area (mousedown + move on background, not on box)
- **Zoom:** Ctrl+scroll (desktop) hoặc pinch (touchpad), range 50%-200%, step 10%
- **Reset view button:** icon ở corner, click resets pan=0,0 zoom=100%
- **Mini-map:** optional, xuất hiện khi `screens.length > 10`, corner bottom-right, ~200×150px, hiện vị trí viewport hiện tại + boxes tỷ lệ thu nhỏ
- **Visual Mode Toggle:** Button trên header bar để switch giữa:
  - **Compact:** Box 180×120px, chỉ text info
  - **Visual:** Box 200×280px, có mini wireframe preview bên trong box (~160×180px SVG)

- **Pan:** drag on empty canvas area (mousedown + move on background, not on box)
- **Zoom:** Ctrl+scroll (desktop) hoặc pinch (touchpad), range 50%-200%, step 10%
- **Reset view button:** icon ở corner, click resets pan=0,0 zoom=100%
- **Mini-map:** optional, xuất hiện khi `screens.length > 10`, corner bottom-right, ~200×150px, hiện vị trí viewport hiện tại + boxes tỷ lệ thu nhỏ

---

## Phần 2: Component Detail Panel Schema

### 2.1 Panel Layout

JX|```
XJ|┌─────────────────────────────────┐
XM|│ Lobby                        [×]│  <- Header
PT|│ screen-lobby                    │
TN|├─────────────────────────────────┤
TN|│ Purpose                         │
QJ|│ Central hub for all features... │
ZR|├─────────────────────────────────┤
MR|│ Entry Points                    │
YM|│ ← Splash (on loading complete)  │
NB|├─────────────────────────────────┤
PP|│ Exit Points                     │
NR|│ → Gameplay (tap Play)           │
NX|│ → Shop (tap shop icon)          │
MP|├─────────────────────────────────┤
VH|│ Visual Preview                  │
SS|│ ┌─────────────────────────────┐ │
NP|│ │  ┌─────┐  ┌─────┐          │ │
RY|│ │  │ Nav │  │Coin │          │ │
SW|│ │  └─────┘  └─────┘          │ │
RM|│ │      ┌──────────┐          │ │
RZ|│ │      │   CTA    │          │ │
RK|│ │      └──────────┘          │ │
PR|│ │  [wireframe boxes...]      │ │
KY|│ └─────────────────────────────┘ │
MP|├─────────────────────────────────┤
VH|│ Components                      │
SS|│ [filter input]                  │
NP|│ ┌─────────────────────────────┐ │
RY|│ │ Table: ID/Type/.../Notes   │ │
SW|│ │ (scrollable, sticky head)  │ │
RM|│ └─────────────────────────────┘ │
RZ|├─────────────────────────────────┤
RK|│ Art Assets Needed               │
PR|│ - bg_lobby.png (1170×2532)      │
KY|├─────────────────────────────────┤
NQ|│ Open Questions                  │
SH|│ - Animation timing for CTA?     │
JY|└─────────────────────────────────┘
PW|```

### 2.2 Visual Preview Section

Mục đích: Cho phép user **nhìn thấy layout** của màn hình ngay trong detail panel, không chỉ đọc text table.

**Đặc điểm:**
- Render dạng SVG với các boxes đại diện cho components
- Box style: wireframe grayscale (border #4b5563, fill white/#f3f4f6)
- Kích thước: width ~300-340px (fit panel), height tỷ lệ theo màn hình (mobile 390×844 → scale 0.35-0.4)
- Label: component ID hoặc type (nếu ID quá dài)
- Scrollable: nếu màn hình dài (vh > 800px)

**Interactivity:**
- Hover vào box trong preview → highlight row tương ứng trong component table
- Click box trong preview → scroll đến component đó trong table + highlight
- Ngược lại: hover row trong table → highlight box trong preview

**Box Position Mapping:**
| Position hint | Box placement |
|---|---|
| "header top" / "navbar" | y=0, full width |
| "header right" | top area, right aligned |
| "center" | middle of screen |
| "bottom sticky" | y=bottom - height |
| "grid row X col Y" | grid layout calculation |

**Technical:**
- SVG viewBox tỷ lệ với mobile viewport (390×844)
- Scale để fit trong panel width
- Không cần pixel-perfect — chỉ cần relative position đúng

### 2.3 Component Table Columns

| Column | Required | Format |
|---|---|---|
| **ID** | YES | `data-component` value từ mockup.html, kebab-case |
| **Type** | YES | One of: `button` / `input` / `label` / `image` / `container` / `list` / `modal` / `toast` / `icon` / `progress` / `navbar` / `card` |
| **Position** | YES | Brief layout hint: `"header right"`, `"center below title"`, `"bottom sticky"`, `"grid 2nd row col 1"` |
| **States** | YES | Array of strings. Valid values depend on type (xem 2.3) |
| **Actions** | CONDITIONAL (required for interactive types) | Array of `{event, effect}` objects |
| **Data** | CONDITIONAL (required nếu dynamic) | Schema: `{field_name: type}` (e.g., `{coin_count: 'number'}`) |
| **Notes** | OPTIONAL | Free-form text cho edge case, accessibility, responsive |

### 2.4 Valid States per Component Type

**button:**
- `idle` (default) — luôn có
- `hover` — desktop only, có thể skip cho mobile-only
- `pressed` / `active` — khi đang bấm
- `disabled` — khi action không khả dụng
- `loading` — khi action đang xử lý
- `focused` — cho keyboard nav

**input:**
- `empty` — chưa có text, show placeholder
- `focused` — con trỏ active
- `filled` — có text
- `error` — validation fail
- `success` — validation pass (optional)
- `disabled`

**image:**
- `loading` — skeleton
- `loaded` — đã render
- `error` — fail to load, show fallback

**list:**
- `empty` — 0 items
- `loading` — đang fetch
- `loaded` — có items
- `error` — fetch fail

**progress:**
- `zero` — 0%
- `partial` — 0-100%
- `complete` — 100%
- `indeterminate` — không biết tiến độ (loading spinner)

**modal / toast:**
- `hidden` — default
- `visible` — khi hiển thị
- `dismissing` — transition out

**Khác (label, container, icon, navbar, card):** Ít nhất `idle`. State khác tùy vào context.

**QUY TẮC:** Mỗi component PHẢI có ít nhất 1 state. Không được để `states: []`.

### 2.5 Actions Schema

Mỗi action object:
```javascript
{
  event: 'onClick',       // 'onClick' | 'onHover' | 'onFocus' | 'onChange' | 'onSubmit' | 'onSwipe' | 'onLongPress'
  effect: 'navigate:gameplay'  // Format: 'navigate:{screen_id}' | 'toggle:{target_id}' | 'emit:{event_name}' | 'open:{modal_id}' | free text
}
```

**Effect prefix conventions:**
- `navigate:{screen_id}` — Chuyển màn hình (phải match một screen trong data)
- `toggle:{component_id}` — Toggle visibility/state của component khác
- `open:{modal_id}` — Mở modal
- `emit:{event_name}` — Phát event cho parent (e.g., `emit:purchase_confirmed`)
- Free text cho trường hợp phức tạp: `"deduct 10 coins + show confetti + persist to server"`

### 2.6 Data Bindings

Cho component hiển thị dynamic data:
```javascript
data: {
  coin_count: 'number',
  player_name: 'string',
  avatar_url: 'string',
  is_premium: 'boolean'
}
```

Type values: `string` | `number` | `boolean` | `date` | `array` | `object` | `enum:{values}`.

---

## Phần 3: Self-check Checklist cho Output

Agent self-check trước khi present wireframe.html:

### Coverage
- [ ] `WIREFRAME_DATA.screens.length` === số màn hình trong mockup.html
- [ ] Mỗi screen ID trong wireframe có tương ứng `data-screen` trong mockup
- [ ] Mỗi `data-component` trong mockup có entry trong components table của screen tương ứng
- [ ] Không có "ghost component" (có trong wireframe nhưng không có trong mockup)

### Edges
- [ ] Mọi edge từ và đến đều trỏ đến screen ID tồn tại trong data
- [ ] Mọi edge có `trigger` text rõ ràng (không `undefined`, không empty)
- [ ] Không có screen orphan (không có entry edge VÀ không có exit edge — trừ Splash chỉ có exit, App Close chỉ có entry)
- [ ] Style classification đúng: user action = solid, conditional = dashed, system event = dotted

### Components
- [ ] Mỗi component có ít nhất 1 state
- [ ] Mỗi interactive component (button, input, swipeable) có ít nhất 1 action
- [ ] `navigate:{target}` effect trỏ đến screen ID tồn tại
- [ ] Data bindings có type hợp lệ

### Layout
- [ ] Box position manually set (không random)
- [ ] Layout strategy explicit (`LAYOUT_STRATEGY` variable)
- [ ] Không có box overlap
- [ ] Canvas render đẹp ở zoom 100% trên viewport 1280×720
### Visual Mode (Flowchart Nodes)
- [ ] Compact mode: Box 180×120px, chỉ hiển thị text info
- [ ] Visual mode: Box 200×280px, có mini wireframe preview (~160×180px SVG)
- [ ] Mini preview trong node hiển thị đúng component boxes (grayscale, relative positions)
- [ ] Toggle button trên header bar switch được giữa 2 mode
- [ ] Visual mode boxes không overlap với nhau
### Technical
- [ ] Single file `wireframe.html`
- [ ] Vanilla JS + SVG inline, không CDN
- [ ] < 3000 lines (cho phép Visual Preview code)
- [ ] Render đầy đủ khi JavaScript enabled
- [ ] Pan/zoom hoạt động mượt

- [ ] Visual Preview render đúng layout component (boxes, labels, relative positions)
- [ ] Preview-to-table interactivity hoạt động (hover highlight, click scroll)
---

## Phần 4: Anti-patterns (tránh)

1. **Visual polish** — wireframe không phải nơi để design đẹp. Giữ grayscale + 1 accent color (brand).
2. **Chi tiết pixel-level** — không miêu tả "padding 12px 16px" trong component notes. Đó là việc của mockup.
3. **Tự thêm màn hình** — nếu thấy mockup thiếu màn hình quan trọng, ESCALATE lên mockup-designer để fix mockup trước, không tự thêm vào wireframe.
4. **~~Component mock-ups~~** — đã được thay thế bởi Visual Preview trong panel. Preview là wireframe-style, không visual polish.
5. **Game logic simulation** — không có interactive demo trong wireframe. Click box chỉ mở panel, không "play" gì cả.
6. **Force-directed layout** — không dùng. Box position phải deterministic để review/diff dễ dàng.

---

## Phần 5: Data Export (Optional)

Nếu user yêu cầu, wireframe.html có thể export `WIREFRAME_DATA` ra JSON file để team khác ingest:

```javascript
function exportJSON() {
  const blob = new Blob([JSON.stringify(WIREFRAME_DATA, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'wireframe-spec.json';
  a.click();
  URL.revokeObjectURL(url);
}
```

Điều này giúp ui-ux-spec.md doc-writer có thể parse JSON để auto-generate component tables.
