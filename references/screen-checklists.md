# UI Screen Checklists — Mobile Game

Checklist cho từng loại screen phổ biến trong game mobile. Mỗi checklist bao gồm: required elements, optional elements, UX flow notes, và art guidelines.

---

## Cách sử dụng

1. User cho biết screen type + genre
2. Tra cứu checklist tương ứng
3. Output checklist phù hợp (text/excel/md/pptx)
4. Nếu screen type không có trong danh sách → compose từ các component chung

---

## Screens Index

| # | Screen | Frequency |
|---|--------|-----------|
| 1 | Splash / Loading | Mọi game |
| 2 | Title / Home / Lobby | Mọi game |
| 3 | Saga Map / Level Select | Puzzle, Casual |
| 4 | Ingame HUD | Mọi game |
| 5 | Pause | Mọi game |
| 6 | Victory / Level Complete | Mọi game |
| 7 | Failed / Game Over | Mọi game |
| 8 | Settings | Mọi game |
| 9 | Shop / Store | F2P games |
| 10 | Friends / Social | Social games |
| 11 | Leaderboard / Ranking | Competitive |
| 12 | Daily Reward / Login Bonus | Retention |
| 13 | Lucky Spin / Gacha | Monetization |
| 14 | Offer / Bundle Popup | Monetization |
| 15 | Tutorial / Onboarding | Mọi game |
| 16 | Profile / Player Info | RPG, Social |
| 17 | Inventory / Equipment | RPG, Midcore |
| 18 | Guild / Clan | Social, Midcore |
| 19 | Quest / Mission | RPG, Casual |
| 20 | Battle Pass / Season Pass | Live-ops |

---

## 1. SPLASH / LOADING SCREEN

**Required:**
- [ ] Game logo (centered, prominent)
- [ ] Loading bar hoặc indicator
- [ ] Background art (teaser gameplay hoặc key visual)

**Optional:**
- [ ] Tip text / fun fact (rotating)
- [ ] Version number (góc dưới)
- [ ] Publisher / Developer logo
- [ ] Legal text (terms, privacy)

**UX Notes:**
- Loading bar phải responsive (không fake đứng yên)
- Tip text giúp user không cảm thấy chờ lâu
- Background art là first impression — phải đại diện cho art style game

---

## 2. TITLE / HOME / LOBBY

**Required:**
- [ ] Game logo
- [ ] Play / Start button (CTA chính, nổi bật nhất)
- [ ] Settings button (icon, thường ở góc)
- [ ] Player info (avatar, name, level) — nếu có account system
- [ ] Currency display (coins, gems...)

**Optional:**
- [ ] News / Event banner
- [ ] Social buttons (Friends, Leaderboard)
- [ ] Daily reward entry point
- [ ] Shop entry point
- [ ] Character / mascot
- [ ] Background music toggle

**UX Notes:**
- Play button phải là element lớn nhất, màu bão hòa cao nhất
- Navigation bar (nếu có) thường ở dưới, 4-5 icons max
- Casual: background tươi sáng, character dễ thương
- Midcore: background có thể dramatic hơn, nhiều entry points hơn

**Art Guidelines:**
- Play button: Primary CTA color (xanh lá hoặc cam)
- Background: Full illustration, khớp theme game
- Navigation icons: Đồng bộ style, cùng size (từ dãy số chuẩn)

---

## 3. SAGA MAP / LEVEL SELECT

**Required:**
- [ ] Path/road từ level 1 trở đi
- [ ] Level nodes (with star rating if completed)
- [ ] Current level indicator (highlight, glow, animation)
- [ ] Scroll direction rõ ràng

**Optional:**
- [ ] Character mascot trên map
- [ ] Environmental storytelling (thay đổi theme theo khu vực)
- [ ] Boss nodes (khác biệt visual)
- [ ] Friend avatars trên map
- [ ] Unlock gates giữa các khu vực

**UX Notes:**
- Level đã qua: stars + accessible → tap vào chơi lại
- Level hiện tại: nổi bật nhất (glow, bounce, arrow)
- Level chưa mở: greyed out, locked icon
- Scroll: thường scroll dọc (bottom → top progression)

**Art Guidelines:**
- Path phải rõ ràng, tương phản với background
- Mỗi khu vực (mỗi ~10 levels) nên đổi theme/color
- Decorative elements (nhà, cây, NPC) tạo world-building

---

## 4. INGAME HUD

**Required:**
- [ ] Score / objective display (top, không che gameplay)
- [ ] Moves / Timer counter
- [ ] Pause button
- [ ] Booster/power-up slots (accessible nhưng không che board)

**Optional:**
- [ ] Combo/streak indicator
- [ ] Currency display (nếu cần trong gameplay)
- [ ] Tutorial hand/arrow (first-time)
- [ ] Auto-play toggle (RPG)

**UX Notes:**
- HUD phải MINIMAL — gameplay area là ưu tiên #1
- Safe zone: HUD nằm trong safe area (tránh notch, rounded corners)
- Tap targets: minimum 44x44pt cho mobile
- Casual: HUD càng ít càng tốt, chỉ essential info
- Midcore/RPG: có thể nhiều hơn nhưng phải organized

**Art Guidelines:**
- HUD semi-transparent hoặc minimal style — không che gameplay
- Pause button: nhỏ, góc trên (thường phải), icon ⏸
- Score/objective: đặt ở top, đủ lớn để đọc nhưng không dominant

---

## 5. PAUSE SCREEN

**Required:**
- [ ] Resume button (CTA chính)
- [ ] Sound/Music toggles
- [ ] Quit/Exit button

**Optional:**
- [ ] Settings access
- [ ] Restart level
- [ ] How to play / Tutorial recap

**UX Notes:**
- Resume phải là action dễ nhất (nổi bật nhất, hoặc tap anywhere)
- Quit cần confirm dialog ("Are you sure?")
- Background: dim/blur gameplay underneath

---

## 6. VICTORY / LEVEL COMPLETE

**Required:**
- [ ] Victory text/banner (celebratory)
- [ ] Star rating (1-3 stars visual)
- [ ] Score display
- [ ] Continue/Next Level button (CTA chính)
- [ ] Rewards display (nếu có)

**Optional:**
- [ ] Share button
- [ ] Replay button
- [ ] Double rewards (watch ad)
- [ ] Celebration effects (confetti, sparkle)

**UX Notes:**
- Emotional peak — phải feel rewarding
- Continue button nên tự động highlight hoặc có countdown
- Stars animation: fill từng star một (dopamine per star)

**Art Guidelines:**
- Màu sắc: warm, golden, bright
- Typography: lớn, bold, celebratory font
- Effects: glow, sparkle, particle

---

## 7. FAILED / GAME OVER

**Required:**
- [ ] Failed text (nhẹ nhàng, ví dụ "Try Again" thay vì "FAILED")
- [ ] Score display
- [ ] Try Again button (CTA chính — positive framing)
- [ ] Exit/Quit button

**Optional:**
- [ ] Continue playing (watch ad / spend currency)
- [ ] Hint về strategy
- [ ] Lives remaining indicator

**UX Notes:**
- KHÔNG dùng từ tiêu cực mạnh — "FAILED" → "Try Again", "Out of Moves"
- Continue option (monetization) nên prominent nhưng không ép buộc
- Try Again phải dễ thực hiện hơn Quit

**Art Guidelines:**
- Nhẹ nhàng hơn Victory nhưng KHÔNG u ám
- Try Again button: CTA color tích cực (xanh lá)
- Quit button: neutral hoặc đỏ nhạt (secondary)

---

## 8. SETTINGS

**Required:**
- [ ] Sound volume slider/toggle
- [ ] Music volume slider/toggle
- [ ] Notification toggle
- [ ] Language selector
- [ ] Account info (ID, linked accounts)
- [ ] Close button

**Optional:**
- [ ] Facebook/Google connect
- [ ] Rate Us
- [ ] Help/Support
- [ ] Terms & Conditions
- [ ] Privacy Policy
- [ ] Credits
- [ ] Graphics quality (midcore/hardcore)

**UX Notes:**
- Layout: đếm số items chiều ngang max → chọn size vẽ phù hợp
- Grouped logically: Sound, Account, Social, Legal
- Tab system nếu nhiều settings (Settings, News, Community, More Games)

---

## 9. SHOP / STORE

**Required:**
- [ ] Currency display (top bar)
- [ ] Item grid/list
- [ ] Item name + icon + price
- [ ] Buy button cho mỗi item
- [ ] Category tabs (nếu nhiều loại item)
- [ ] Close/Back button

**Optional:**
- [ ] Item detail popup (tap item → see detail)
- [ ] Sale/discount badges
- [ ] "Best Value" tag
- [ ] IAP packages (real money)
- [ ] Ad-rewarded items

**UX Notes:**
- Casual: dùng thematic container (barrel, shelf, cart...)
- Price tag phải clear — currency icon + number
- Most valuable deal highlight (glow, "BEST VALUE" ribbon)
- Scroll direction rõ ràng nếu nhiều items

**Art Guidelines:**
- Container match theme game (gỗ cho farm, pha lê cho fantasy...)
- Item icons: đều size, cùng style, trên nền nhất quán
- Buy button: CTA primary color, đủ lớn để tap

---

## 10. FRIENDS / SOCIAL

**Required:**
- [ ] Friends list (avatar, name, level, score)
- [ ] Add friend mechanism
- [ ] Send/request gifts
- [ ] Close button

**Optional:**
- [ ] Chat
- [ ] Visit friend's game
- [ ] Invite from contacts/Facebook
- [ ] Online status indicator

---

## 11. LEADERBOARD / RANKING

**Required:**
- [ ] Top 3 podium (visual differentiation: gold, silver, bronze)
- [ ] Scrollable ranking list (rank, avatar, name, score)
- [ ] Player's own position (highlighted, always visible)
- [ ] Scope tabs (Global, Country/Region, Friends)

**Optional:**
- [ ] Season/period indicator
- [ ] Reward preview per tier
- [ ] Previous season results

---

## 12. DAILY REWARD / LOGIN BONUS

**Required:**
- [ ] Calendar/grid layout showing 7-28 days
- [ ] Current day highlighted (glow, arrow, "TODAY")
- [ ] Past days: claimed state (checkmark, greyed out)
- [ ] Future days: locked/preview state
- [ ] Claim button (CTA primary)
- [ ] Reward icon + amount cho mỗi ngày

**Optional:**
- [ ] Milestone rewards (day 7, 14, 28 — bigger reward, visually larger)
- [ ] Week tabs (Week 1, Week 2...)
- [ ] Streak indicator
- [ ] VIP/Premium track song song

**UX Notes:**
- Auto-open khi login (nhưng dismiss dễ dàng)
- Claim animation → reward fly to currency bar
- Missed days: show nhưng không punish quá nặng

---

## 13. LUCKY SPIN / GACHA

**Required:**
- [ ] Spin wheel / gacha machine visual
- [ ] All possible rewards visible trước khi spin
- [ ] Spin button (CTA primary, rõ cost)
- [ ] Cost display (currency icon + amount)
- [ ] Result popup (reward received)

**Optional:**
- [ ] Pity system indicator (guaranteed after X spins)
- [ ] History log
- [ ] Free spin timer/counter
- [ ] Rate/probability disclosure

**UX Notes:**
- Wheel phải spin đủ lâu để tạo anticipation (2-3s) nhưng không quá lâu
- Near-miss effect: đáng tranh cãi ethical nhưng phổ biến
- Hiển thị probability khi required by law (JP, CN, EU)

---

## 14. OFFER / BUNDLE POPUP

**Required:**
- [ ] Visual showcase (items artwork, rõ ràng)
- [ ] Price (real money hoặc in-game currency)
- [ ] Buy button (CTA primary)
- [ ] Close/X button (RÕ RÀNG, đủ lớn, không delay)
- [ ] Value proposition text ("5x value!", "75% OFF")

**Optional:**
- [ ] Original price gạch ngang (price anchoring)
- [ ] Countdown timer (FOMO)
- [ ] "BEST VALUE" / "POPULAR" tag
- [ ] Limited stock indicator

**UX Notes:**
- Không bao giờ popup giữa gameplay session
- Timing tốt: end of session, after victory, after fail (offer continue)
- Max 1 offer popup per session — nhiều hơn = annoying
- Close button: KHÔNG delay, KHÔNG ẩn, KHÔNG tiny

**Art Guidelines:**
- Character/mascot presenting offer → personal touch
- Reward items: xếp thành fan/pile → cảm giác nhiều
- Price tag: red badge cho sale, green cho original
- Background: dim overlay, focus 100% vào offer panel

---

## 15. TUTORIAL / ONBOARDING

**Required:**
- [ ] Contextual hand pointer (hướng dẫn tap)
- [ ] Spotlight/mask (dim tất cả, sáng element target)
- [ ] Short instruction text (1 câu, max 2 câu)
- [ ] Skip button (LUÔN CÓ)

**Optional:**
- [ ] NPC/character dialog bubble
- [ ] Progress dots (● ○ ○ ○)
- [ ] Reward sau tutorial completion
- [ ] Help/? button để xem lại

**UX Notes:**
- Contextual > Frontloaded — dạy khi cần, không dạy trước
- Max 3 steps mỗi tutorial sequence
- Show, don't tell — action trước, text sau
- Progressive disclosure: unlock features dần (không dump tất cả)
- Cho phép replay tutorial

---

## 16-20. REMAINING SCREENS

Profile, Inventory/Equipment, Guild/Clan, Quest/Mission, Battle Pass follow cùng pattern:

**Mỗi screen cần:**
1. Clear purpose — user biết screen này để làm gì trong 2 giây
2. Primary CTA — action chính nổi bật nhất
3. Exit path — luôn có cách thoát rõ ràng
4. Consistent style — match với toàn bộ game UI
5. Genre-appropriate density — casual sparse, midcore balanced, hardcore dense

---

## Component Chung (Áp dụng mọi screen)

### Top Bar / Status Bar
- Currency display (coin icon + number, gem icon + number)
- "+" button cạnh currency → link tới Shop
- Player level/avatar (nếu có)

### Navigation Bar (Bottom)
- 4-5 icons max cho casual
- Icon + text label
- Active state highlight
- Badge/notification dot cho new content

### Popup/Dialog
- Dim overlay background (50-70% black)
- Panel centered
- Title ở trên
- Content ở giữa
- Actions ở dưới (primary right, secondary left)
- Close button: "X" ở góc trên phải, NẰM NGOÀI panel (overlap corner)

### Back/Close Button Convention
- "X" button: đóng popup/overlay → quay về screen trước
- "←" button: navigate back trong hierarchy
- Vị trí: góc trên phải (X) hoặc góc trên trái (←)
