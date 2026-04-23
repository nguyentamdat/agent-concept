# Mockup Review Criteria

Review checklist dùng bởi `ui-ux-reviewer` (T3) và `mockup-designer` (T2 self-check) để kiểm tra chất lượng `projects/{project-name}/mockup.html`.

## Tier 1 — Coverage (bắt buộc pass 100%)

### 1.1 Screen Inventory
- [ ] Mọi màn hình liệt kê trong GCD section "Màn hình" đều có mặt trong mockup
- [ ] Mọi màn hình có trong prototype (`index.html`) đều có mặt trong mockup
- [ ] Không có màn hình "placeholder trắng" — màn hình nào có trong sidebar phải được implement
- [ ] Danh sách màn hình đã được user xác nhận TRƯỚC khi build (brainstorm output)

### 1.2 Component Picker Integration
- [ ] Script tag `<script src="https://unpkg.com/dom-grab"></script>` có mặt trước `</body>`
- [ ] Help banner hiển thị ở top page giải thích cách dùng picker
- [ ] Help banner có nút dismiss (×) hoạt động
- [ ] Mọi component quan trọng (button, input, CTA, HUD element) có `data-component` attribute
- [ ] `data-component` value dùng kebab-case, mô tả vai trò (không phải `button1`, `div2`)
- [ ] `data-screen` attribute có mặt trên ít nhất container cấp cao nhất của mỗi màn hình
- [ ] Test: mở mockup.html trong browser, hold Cmd+C 200ms, click button → clipboard có context với selector + data-component

### 1.3 Navigation
- [ ] Sidebar liệt kê đầy đủ danh sách màn hình
- [ ] Click sidebar item → nhảy đến màn hình đúng
- [ ] Màn hình active được highlight trong sidebar
- [ ] Mỗi màn hình (trừ Splash/Lobby) có back button hoặc cách thoát rõ ràng
- [ ] Không có dead-end (màn hình không thể thoát ra)

## Tier 2 — Fidelity (pass ≥ 80%)

### 2.1 Visual Consistency
- [ ] Màu sắc lấy từ GCD/art-direction.md — không phải màu tùy tiện
- [ ] Primary/secondary/accent color dùng đúng theo art-direction
- [ ] Typography (font-family, font-size scale) match art-direction hoặc mặc định sensible
- [ ] Spacing (padding/margin) nhất quán giữa các màn hình
- [ ] Hierarchy thị giác rõ ràng: primary action nổi bật, secondary action mờ hơn

### 2.2 Component States
- [ ] Button có visual state phân biệt: idle, hover (nếu desktop), pressed/active, disabled
- [ ] Input có state: empty (placeholder), focused, filled, error nếu liên quan
- [ ] Loading state có visual indicator (spinner, skeleton, progress) khi liên quan
- [ ] Error state có message rõ ràng + gợi ý hành động

### 2.3 Mobile Frame
- [ ] Viewport render đúng 390×844px (iPhone 14 Pro)
- [ ] Mobile frame căn giữa trang
- [ ] Background page neutral (không che frame)
- [ ] Content trong frame scrollable nếu dài hơn 844px
- [ ] Touch target tối thiểu 44×44px cho các action quan trọng

### 2.4 Transitions
- [ ] Chuyển màn hình có animation (fade/slide), không instant swap
- [ ] Duration 200-300ms, easing ease-in-out
- [ ] Không flash hoặc jitter khi transition

## Tier 3 — Technical (pass 100%)

### 3.1 Constraints
- [ ] Single file `mockup.html` tại `projects/{project-name}/mockup.html`
- [ ] Vanilla JS only — không React/Vue/jQuery/Angular
- [ ] Không CDN ngoại trừ `dom-grab` (cho picker)
- [ ] Không external font CDN — dùng system font stack
- [ ] Không external image/icon CDN — dùng Unicode emoji hoặc inline SVG
- [ ] Code dưới 2000 dòng
- [ ] HTML semantic (`<header>`, `<nav>`, `<main>`, `<section>`, `<button>`)

### 3.2 Graceful Degradation
- [ ] Nếu `dom-grab` CDN fail (test bằng cách block unpkg.com), mockup vẫn render đầy đủ
- [ ] Không có console error khi page load (ngoại trừ có thể cảnh báo picker unavailable)
- [ ] Mọi màn hình render được cả khi JavaScript tắt (sidebar nav sẽ không hoạt động nhưng markup vẫn hiện)

### 3.3 Accessibility (nice-to-have)
- [ ] `<button>` element cho mọi action clickable (không dùng `<div onclick>`)
- [ ] `aria-label` cho button chỉ có icon
- [ ] Contrast text ≥ 4.5:1 cho body text
- [ ] Focus visible khi tab qua

## Reject Criteria (tự động REJECT)

Mockup bị REJECT nếu bất kỳ điều sau đúng:

1. Thiếu component picker integration (không có `dom-grab` script hoặc không có `data-component` attributes)
2. Thiếu trên 20% màn hình so với GCD/prototype
3. Dùng framework (React/Vue/jQuery) bất kỳ
4. Có game logic thực sự (không phải mockup mà là prototype trá hình)
5. CDN dependency khác ngoài `dom-grab`
6. File > 2000 dòng
7. Danh sách màn hình chưa được user phê duyệt trong brainstorm step

## Verdict Format

Reviewer output theo format:

```
VERDICT: APPROVE | CONCERNS | REJECT

Tier 1 Coverage: {pass_count}/{total} items pass
Tier 2 Fidelity: {pass_percent}% pass
Tier 3 Technical: {pass_count}/{total} items pass

Strengths:
- ...

Issues:
- [TIER.N.M] {description} — {severity: blocker|major|minor}

Suggested fixes:
- ...
```
