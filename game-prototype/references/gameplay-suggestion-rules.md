# Gameplay Suggestion Rules

Knowledge base cho skill `game-concept-automatic`. Sử dụng ở Phase 1 bước 5 (suggest 3 gameplay options).

## Mục tiêu

Sau khi user đã chốt **Target Audience + Problem Statement + Kinds of Fun**, AI suggest 3 gameplay options:
- **Mỗi option có mô tả text** đầy đủ 4 thành phần (Pitching, Mục tiêu, Lựa chọn, Thử thách)
- **Mỗi option đi kèm 1 mini playable prototype** (vertical slice ~300-500 dòng) lưu vào `Game Demo/[slug]-concept-{A|B|C}.html`

User chơi thử cả 3 prototype + đọc text → chốt 1 option (hoặc remix).

## Quy tắc 3 Options

3 options phải khác biệt rõ ràng để user có lựa chọn thật sự:

| Option | Đặc điểm | Khi nào pick |
|--------|----------|--------------|
| **1. Convention** | Theo công thức tiêu chuẩn của thể loại. An toàn, dễ predict | User muốn chắc chắn / target casual đại chúng |
| **2. Twist** | Giữ core convention nhưng đổi 1 element bất ngờ (resource, win condition, control scheme...) | User muốn khác biệt nhưng không quá rủi ro |
| **3. Ambitious** | Cách tiếp cận táo bạo, có thể innovate hoặc hybrid 2 thể loại | User muốn đột phá / target hardcore |

**Quy tắc:** 3 options phải khác **về mechanic chứ không chỉ về theme/art**. Nếu bỏ theme đi mà 3 option giống nhau thì là fail.

## 4 Thành phần Gameplay

Mỗi option phải đầy đủ 4 thành phần dưới đây:

### 1. Pitching (1-2 câu, góc nhìn player)

Format: "Bạn là **[role]**, mỗi ván bạn phải **[hành động cốt lõi]**, để **[mục tiêu cảm xúc]**."

Ví dụ:
- ✅ "Bạn là một thuyền trưởng buôn lậu, mỗi chuyến phải né patrol và đoán giá cảng để kiếm lời, để cảm thấy như một đầu sỏ thông minh."
- ❌ "Game space trader có nhiều planet và crew." (mô tả feature, không pitching)

### 2. Mục tiêu trò chơi

Phải có **win condition** + **lose condition** rõ ràng.

Format:
- **Win:** [điều kiện cụ thể, đo được] (vd: "đạt 10,000 gold trong 20 ngày", "tiêu diệt boss tại level 30")
- **Lose:** [điều kiện cụ thể] (vd: "hết HP", "phá sản", "hết turn")
- **Session length:** ước lượng (vd: "5-10 phút mỗi ván", "vô hạn — không có lose")

### 3. Lựa chọn của người chơi (2-4 loại quyết định)

> **Đọc thêm:** `decisions-guideline.md` — knowledge base sâu về player decisions (Hiwiller "Players Making Decisions"). Cụ thể load §1.2 Player Agency, §1.3 Anatomy of a Choice, §2.2 Core Loop Heuristics, §3.1 Less-Interesting Decisions, §3.2 Bad Dynamics. Áp dụng các heuristics + tránh anti-patterns dưới.

#### Spec mỗi loại quyết định (4 fields, mở rộng từ 3 fields cũ)

- **Khi nào** player phải quyết định (mỗi turn? mỗi screen? mỗi battle?)
- **Có những option gì** (2-3 option cụ thể, không chung chung)
- **Hậu quả/trade-off** (chọn A có gì lợi/hại so với B)
- **Anatomy of choice** (theo §1.3) — mỗi option phải có **cost + value + info + timing** rõ ràng:
  - **Cost:** chọn option này tốn gì (resource, turn, opportunity cost)?
  - **Value:** option này mang lại gì (lợi ích đo được)?
  - **Info:** player có đủ thông tin để đoán được hậu quả không, hay random/hidden?
  - **Timing:** quyết định có phải dưới time pressure, hay deliberate?

#### Heuristics khi suggest decisions (từ §2.2)

- **H2.2.1 — Meaningful trade-off:** mọi quyết định phải có ít nhất 2 đường cong có thể chọn, không có 1 dominant strategy
- **H2.2.2 — Match decision frequency với Audience flow zone:** Casual = 1 decision per 30s, Mid-core = 1 per 10-20s, Hardcore = 1 per 3-10s
- **H2.2.3 — Lead with verbs, not features:** describe quyết định bằng "player chooses to X" thay vì "player has feature Y"
- **H2.2.4 — Respect player agency (§1.2):** mọi outcome quan trọng phải có ít nhất 1 input từ player skill/judgment, không pure RNG quyết định win/lose

#### Anti-patterns CẤM (từ §3.1, §3.2)

- ❌ **AP1.1 No-brainer / Dominant strategy** — 1 option luôn tối ưu (vd: bullet xuyên giáp 1.5x luôn pick)
- ❌ **AP1.2 Coin-flip** — không có info để judge, pure 50/50 RNG
- ❌ **AP1.3 Paralysis-by-analysis** — quá nhiều option (>5) không khác biệt rõ
- ❌ **AP1.4 False choice** — option khác nhau về mặt thẩm mỹ nhưng cùng outcome
- ❌ **AP1.5 Lock-in regret** — quyết định early-game định đoạt cuối-game không thể recover
- ❌ **AP2.1 Snowball** — winner-take-all feedback loop, người dẫn đầu thắng càng nhanh
- ❌ **AP2.3 Degenerate strategy** — strategy unintended từ designer's POV mà player tìm ra để break game

#### Ví dụ tốt (đầy đủ Anatomy of Choice)

> **[Port stop]** Mỗi cảng (every 3 turns), player chọn 1 trong 3:
> - **Buy/Sell hàng** — Cost: 1 turn + risk patrol. Value: 200-800 gold (info: thấy giá hàng). Timing: deliberate.
> - **Repair tàu** — Cost: 100 gold + 1 turn. Value: tránh game over (info: HP gauge thấy). Timing: critical khi HP <30%.
> - **Hire crew** — Cost: 500 gold + 5 upkeep/turn. Value: +20% speed (info: rõ trade-off). Timing: deliberate.
>
> Trade-off: speed vs safety vs profit. Cả 3 options có cost/value đo được, info đầy đủ, timing khác nhau → meaningful choice.

### 4. Thử thách của trò chơi

Cái gì cản player đạt mục tiêu? Phải có:
- **Loại thử thách** (enemy, time pressure, resource scarcity, info hidden, RNG...)
- **Cách player vượt qua** (mechanic nào counter)
- **Độ khó scale** thế nào (level-based, adaptive, fixed...)

Ví dụ tốt:
> "Patrol ship spawn theo route ngẫu nhiên — player phải đọc map và đoán safe path. Càng late game, patrol càng nhiều và route càng phức tạp. Player có thể buy radar (đắt) hoặc bribe (rủi ro) để counter."

## Evolutionary Rule

Mỗi option **phải reference** các thông tin đã chốt ở bước trước:
- Phải **giải quyết Problem Statement** (PS = bài toán, gameplay = giải pháp)
- Phải **deliver Kinds of Fun** đã chọn (mỗi loại fun = 1-2 mechanic cụ thể)
- Phải **phù hợp Target Audience** (casual = đơn giản, hardcore = phức tạp/depth)

Trước khi present 3 options, AI tự kiểm tra: nếu remove 1 trong 3 input đó (PS / Fun / Audience), option có còn make sense không? Nếu có → option đó generic, cần redesign.

## Anti-patterns

- ❌ **Feature list:** "Game có 50 levels, 10 nhân vật, 100 vũ khí" — không phải gameplay, là content
- ❌ **Theme reskin:** 3 option chỉ khác art/theme nhưng cùng mechanic
- ❌ **Vague choice:** "Player chọn chiến thuật phù hợp" — không cụ thể
- ❌ **Missing trade-off:** "Player chọn 1 trong 3 path" mà không nói path nào lợi/hại gì
- ❌ **Mismatched fun:** Chọn Submission nhưng option có Challenge cao (mâu thuẫn)

## Format trình cho user

```
═══ OPTION 1 (Convention) ═══
**Pitching:** [...]
**Mục tiêu:** Win: [...] / Lose: [...] / Session: [...]
**Lựa chọn:**
  - [Loại 1]: [option] — trade-off: [...]
  - [Loại 2]: [option] — trade-off: [...]
**Thử thách:**
  - [Loại]: [cách scale] — counter: [...]

═══ OPTION 2 (Twist) ═══
[...giống format...]

═══ OPTION 3 (Ambitious) ═══
[...giống format...]
```

Sau khi trình text, **AI chạy Pre-Prototype Audit (step 5a)** trước khi generate prototype.

---

## Pre-Prototype Audit (BẮT BUỘC ở Bước 1.5 step 5a)

Sau khi viết xong text 3 options, **trước khi build 3 HTML prototype**, AI phải chạy 5-layer audit cho **mỗi option** để đảm bảo:
- Genre faithfulness (L0) — proposal trung thành với genre statement gốc của user
- Decision quality đủ sâu (DQAF L1+L2)
- Experience đúng PS+Fun (Experience Alignment L4+L5)

Mục đích: catch design gap trên text trước khi tốn tokens build 3 prototype.

### 5 Layer chạy ở step 5a

| Layer | Source | Lý do | Cost |
|---|---|---|---|
| **L0 Genre Faithfulness** | `genre-faithfulness-audit.md` | Catch genre mismatch — option có thể pass L1+L2+L4+L5 vẫn fail vì heavy 1 element nhẹ element kia trong genre compound user nói ("X + Y") | Cheap (text) |
| **L1 Substrate Capacity** | `decision-quality-audit-framework.md` §L1 | Catch substrate gap (false choice trap) | Cheap (math) |
| **L2 Decision Anatomy** | `decision-quality-audit-framework.md` §L2 | Catch shallow decisions (low Cost/Value/Info/Timing/Reversibility) | Medium |
| **L4 Experience Alignment** | `experience-alignment-audit.md` §L4 | Catch decisions không deliver PS+Fun (decision đẹp nhưng không feel đúng) | Medium |
| **L5 Felt Experience Self-Test** | `experience-alignment-audit.md` §L5 | Gut check 4 question (first-30s / audience-fit / tension / replay) | Low |

**Thứ tự bắt buộc: L0 → L1 → L2 → L4 → L5.** L0 chạy FIRST vì cheapest và catch genre mismatch trước khi tốn tokens audit decision/experience. Nếu L0 fail trên option nào, fix option đó trước khi sang L1.

L3 (Topology) + 12 anti-patterns hiện có vẫn ở step 6 (sau user pick) vì cần concrete prototype.

### Workflow step 5a

1. **Re-read original user message** — extract genre statement gốc (statement đầu tiên về thể loại/concept)
2. Đọc `genre-faithfulness-audit.md` (load workflow + Strength rubric)
3. Đọc `decision-quality-audit-framework.md` (load §L1 + §L2 + Genre Adapter table phù hợp)
4. Đọc `experience-alignment-audit.md` (load §L4 + §L5)
5. Với MỖI option (3 options):
   - **L0:** trigger nếu genre statement có pattern compound ("X + Y", "X kết hợp Y", "X hybrid Y") → build evidence matrix per option, đánh Strength Strong/Medium/Weak cho mỗi component
   - **L1:** tính Option Density vs threshold của Audience
   - **L2:** score 5 fields per decision tier
   - **L4:** build PS Decomposition + Fun Signature mapping matrix
   - **L5:** 4 questions self-test
6. Output bảng audit consolidated cho 3 options (L0 hiển thị riêng phần đầu)
7. **Nếu option có FAIL:**
   - L0 fail → propose mechanic dedicated cho element yếu (vd "puzzle Weak → add limited moves + telegraphed boss + multi-turn preview")
   - L1-L5 fail → propose fix theo từng layer
   - Update text option với fix
   - Re-audit từ L0 (vì fix có thể impact các layer khác)
   - Loop max 2 iterations, sau đó discuss với user
8. **Chỉ sau khi cả 3 options pass mọi layer** → generate 3 prototype

### Output template step 5a

```
═══ PRE-PROTOTYPE AUDIT ═══

User genre statement: "[quote nguyên gốc]"
Components: [X, Y, ...]   (chỉ output nếu compound, có L0)

L0 GENRE FAITHFULNESS:
  Option 1 [name]:
    X: [evidence mechanic] — Strong/Medium/Weak
    Y: [evidence mechanic] — Strong/Medium/Weak
    STATUS: ✓ PASS / ⚠ FAIL ([component yếu])
  Option 2 [name]: ...
  Option 3 [name]: ...

[Nếu L0 fail, fix + re-audit, then continue:]

Option 1 [name]:
  L0 Genre: ✓ PASS
  L1 Substrate: 15 ✓ (threshold 5)
  L2 Anatomy: T1=2.4 ✓, T2=1.8 ✗ (Info=0)
  L4 Alignment: Fun "Fantasy" column ✗ (no tier delivers role-feel)
  L5 Self-test: 3/4 (Q2 fail — audience không identify domain)

  Fixes proposed:
    - L2 T2: thêm visual signal trước AI attack → Info=2
    - L4 Fantasy: rename mechanic dùng vocab domain-native ("Press" thay "Attack mode")
    - L5 Q2: add character avatar response → audience identify
  
  Apply fixes → re-audit:
    L2 T2: 2.2 ✓ | L4: ✓ | L5: 4/4 ✓

Option 2 [name]: ALL PASS
Option 3 [name]: ALL PASS

Status: All 3 options ready for prototype generation.
```

### Quy tắc resolution

- **All pass mọi layer** → generate 3 prototype
- **L0 fail** → option lệch genre, MUST fix trước (priority cao hơn L1-L5)
- **L1-L5 fail** → propose fix → update text → re-audit từ L0 → loop đến all pass
- **Persistent fail** sau 2 iterations → discuss với user (có thể design flaw deeper, cần redesign option)

---

Sau audit pass + generate prototype, hỏi user:
> "Bạn chơi thử cả 3 prototype rồi chọn option nào? Có thể remix giữa các option hoặc tự viết option 4."

---

## Anti-pattern Audit Checklist (BẮT BUỘC ở Bước 1.5 step 6)

Sau khi user chốt 1 gameplay option, AI **PHẢI** chạy audit này TRƯỚC khi mở Gate sang Phase 2. Mục đích: catch design flaws sớm khi còn dễ sửa.

### 12 Anti-patterns cần check

**Decision-level (5 items, từ `decisions-guideline.md` §3.1):**

| ID | Tên | Định nghĩa | Cách check |
|----|-----|------------|------------|
| **AP1.1** | No-brainer / Dominant strategy | 1 option luôn tối ưu, không có lý do real để pick option khác | Với mỗi loại quyết định, tự hỏi: "Tại sao player KHÔNG luôn pick option X?" Nếu không trả lời được = vi phạm. |
| **AP1.2** | Coin-flip | Pure RNG, player không có info để judge → cảm giác may rủi | Với mỗi quyết định, tự hỏi: "Player có info nào để dự đoán hậu quả không?" Nếu chỉ là Math.random() blind = vi phạm. |
| **AP1.3** | Paralysis-by-analysis | >5 options gần giống nhau, player overwhelm không biết chọn gì | Đếm số option mỗi loại quyết định. >5 + không có sub-categorization = vi phạm. |
| **AP1.4** | False choice | Options khác nhau về cosmetic (icon, name) nhưng outcome giống nhau | Với mỗi cặp options A vs B, tự hỏi: "Outcome cuối có khác không?" Nếu giống = vi phạm. |
| **AP1.5** | Lock-in regret | Quyết định early-game định đoạt cuối-game không recover | Có decision nào permanent không revert? Có cách counter sau không? |

**Game-level (2 items, từ `decisions-guideline.md` §3.2):**

| ID | Tên | Định nghĩa | Cách check |
|----|-----|------------|------------|
| **AP2.1** | Snowball | Winner-take-all feedback loop — người dẫn đầu càng dẫn đầu nhanh, kẻ thua không catchup được | Có cơ chế comeback/rubber-band không? Hay losing player chỉ losing more? |
| **AP2.3** | Degenerate strategy | Strategy unintended từ designer mà player tìm ra để break game (vd infinite loop, exploit edge case) | Có combo nào bypass core challenge không? Có rule nào ép player phải dùng intended path? |

**Format-level (5 items, từ section "Anti-patterns" ở trên):**

| ID | Tên | Định nghĩa |
|----|-----|------------|
| **F1** | Feature list | Mô tả gameplay dạng "có 50 levels, 10 nhân vật" thay vì "experience" |
| **F2** | Theme reskin | Mechanic giống nhau, chỉ khác art/theme |
| **F3** | Vague choice | "Player chọn chiến thuật phù hợp" — không cụ thể, không liệt kê option |
| **F4** | Missing trade-off | Có option nhưng không nói lợi/hại của từng option |
| **F5** | Mismatched fun | Kinds of Fun đã chọn mâu thuẫn với mechanic (vd Submission + Challenge cao) |

### Output Mode (SILENT — chỉ tóm tắt)

**Audit chạy NGẦM** — AI thực hiện 12 checks internally nhưng KHÔNG trình bảng đầy đủ cho user (giảm noise, focus vào next step).

**Output user-facing:**

#### Trường hợp 1: Pass (0 ✗)
Chỉ 1 dòng:
```
✓ Anti-pattern audit passed (12/12). Ready for Phase 2.
```
→ Tự động qua step 7 (gate).

#### Trường hợp 2: Có Fail
Tóm tắt chỉ items ✗ + propose fix:
```
⚠ Audit found N issue(s):

- AP1.5 Lock-in regret: Card pick không revert được sau fire
  → Fix: Cho phép re-pick card trong preview phase, lock chỉ khi commit FIRE.

- F4 Missing trade-off: Card "Heavy" không có downside rõ
  → Fix: Thêm cost (giảm range 20%) hoặc trade-off rõ.

Apply fix? (Yes / No / Manual edit)
Show full audit để xem chi tiết 12 items.
```

**Lặp đến khi 0 ✗** hoặc user explicit accept rủi ro.

### Quy tắc Status (internal — không show user trừ khi yêu cầu)

- **✓ Pass:** không vi phạm. Internal note 1 câu evidence.
- **✗ Fail:** vi phạm rõ ràng. **PHẢI propose fix cụ thể** ở user-facing output.
- **⚠ Warning:** edge case. Mặc định KHÔNG show ở silent mode (chỉ show nếu user request "Show full audit"). Nếu Warning critical (vd Snowball PVP), nâng lên Fail-equivalent để show.

### "Show full audit" trigger

User có thể bất kỳ lúc nào nói:
- `"Show full audit"` / `"Hiện chi tiết audit"` / `"Audit details"`

→ AI trình bảng 12 dòng đầy đủ với evidence/notes mỗi item:
```
═══ ANTI-PATTERN AUDIT: [Option Name] ═══

| #     | Anti-pattern              | Status | Notes                                          |
|-------|---------------------------|--------|------------------------------------------------|
| AP1.1 | No-brainer                | ✓ Pass | "Card X có cost cao nhưng range xa, Y rẻ ngắn" |
| AP1.2 | Coin-flip                 | ✓ Pass | "Player thấy CP positions trước khi chọn"      |
| ...   | ...                       | ...    | ...                                            |

Total: 10 ✓ | 1 ✗ | 1 ⚠
```

### Resolution Loop (silent)

1. Run audit internal
2. Pass → 1 dòng confirm + sang gate
3. Fail → tóm tắt + propose fix → user 3 lựa chọn (Apply / Manual / Accept) → loop

### Anti-pattern audit, KHÔNG audit lại 3 options ở Bước 1.5 step 5

Audit chỉ chạy cho **1 option đã chốt** (sau user pick). KHÔNG audit cả 3 options trước (waste tokens, vì 2 options sẽ bị bỏ).

---

## Concept Prototype Spec (vertical slice)

Mỗi option ở Bước 1.5 phải đi kèm 1 concept prototype playable. Spec cho prototype này:

### File & Naming
- Path: `Game Demo/[slug]-concept-A.html` (hoặc B/C theo option)
- Slug: kebab-case từ game idea (vd "Path Architect" → `path-architect`), dùng chung cho cả 3 concept prototypes và Phase 2 sau này

### Scope
- **Size:** ~300-500 dòng/file
- **Screens:** 1 screen duy nhất (core gameplay)
  - Có thể có in-game UI cho start/restart, win/lose state messages
  - KHÔNG cần Menu / Setup / Pick / End screen tách biệt
- **Content:** 1 puzzle/level đại diện cho mechanic
  - KHÔNG cần roguelike progression (5 puzzles, object pick...)
  - KHÔNG cần inventory đầy đủ — chỉ object types essential cho mechanic
- **Win/lose:** Phải triggerable trong 1 ván chơi (1-2 phút)

### Yêu cầu chất lượng
- ✅ Tự chạy được — open file trong browser, click 1-2 button là vào game
- ✅ Core mechanic deliver được "feel" của option đó (player hiểu trong 30s)
- ✅ Win/lose có thể trigger
- ✅ Self-test: state transitions, button handler, no console.log (như checklist trong `prototype-html-template.md`)

### Comparability rule (cực quan trọng)
3 concept prototypes phải dùng **cùng UI shell** (cùng dark theme, cùng font Orbitron+Inter, cùng button style, cùng layout pattern). Chỉ khác **core mechanic** — biến số đang test.

**Lý do:** user phải isolate được mechanic là điểm khác biệt, không bị nhiễu bởi visual/UX khác nhau.

**Anti-pattern:** option A dùng grid, option B dùng canvas, option C dùng card layout → user không so sánh được mechanic vì UX khác nhau quá.

### Quan hệ với Phase 2 v1
Khi user chốt 1 concept ở Bước 1.5, Phase 2 sẽ:
1. Lấy concept prototype đã chọn làm base
2. Expand thêm screens (Setup/End/Menu) theo Standard/Full scope
3. Expand thêm levels/puzzles để có run hoàn chỉnh
4. Save vào `Game Demo/[slug]-v1.html`

→ Phase 2 không bắt đầu từ scratch — nó **expands** chosen concept.
