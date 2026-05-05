# Genre Faithfulness Audit (L0)

Knowledge base cho skill `game-concept-automatic`. Layer audit đầu tiên (cheapest, runs FIRST) trong Pre-Prototype Audit ở Phase 1 step 5a.

## Triết lý

Decision quality audit (DQAF L1+L2+L3) và Experience alignment audit (L4+L5) đảm bảo decision sâu + match PS/Fun/Audience. **Nhưng KHÔNG đảm bảo proposal trung thành với genre statement gốc của user.**

Bài học từ session card-battle-puzzle: Option có thể pass cả 4 layers L1/L2/L4/L5 mà vẫn fail vì heavy 1 element và nhẹ element kia trong genre compound user nói ("X + Y").

L0 là **first filter** — catch genre mismatch sớm bằng text comparison (cheap), trước khi tốn tokens audit decision/experience.

---

## Khi nào trigger L0?

L0 **bắt buộc chạy** khi user statement có pattern compound:

| Pattern | Ví dụ |
|---|---|
| "X + Y" | "card battle + puzzle", "RPG + roguelike" |
| "X kết hợp Y" | "match-3 kết hợp deck-building" |
| "X hybrid Y" | "tactics hybrid card game" |
| "X meets Y" | "Slay the Spire meets Tetris" |
| "X with Y elements" | "puzzle game với combat elements" |

L0 **skip** nếu user state single genre rõ ràng ("tôi muốn làm match-3", "RPG đơn thuần").

---

## L0 Workflow

### Step 1 — Extract genre components

Re-read original user message (statement đầu tiên về thể loại). Tách thành list components.

Ví dụ:
- "card battle + puzzle" → `[card battle, puzzle]`
- "Slay the Spire meets Tetris với roguelike progression" → `[deck-builder combat, spatial puzzle, roguelike progression]`

### Step 2 — Build evidence matrix

Cho MỖI option (3 options), build table:

| Component | Evidence (mechanic name cụ thể) | Strength |
|---|---|---|
| X | mechanic giao diện X (vd "cast cards from hand") | Strong / Medium / Weak |
| Y | mechanic giao diện Y (vd "match-3 reactive") | Strong / Medium / Weak |

**Quy tắc đánh Strength:**

| Strength | Định nghĩa |
|---|---|
| **Strong** | Mechanic dedicated cho element này, là core decision tier (T2 hoặc T3), occupies meaningful UI/screen real estate |
| **Medium** | Mechanic có ý đồ deliver element này, nhưng share với element khác hoặc ở tier phụ |
| **Weak** | Element bị reduced thành theme reskin / surface mention; không có decision tier dedicated; player không "feel" element này khi play |

### Step 3 — Pass/Fail criteria

| Pattern matrix | Status |
|---|---|
| Mọi components: Strong hoặc Medium | ✓ PASS |
| 1+ component: Weak | ✗ FAIL — flag + propose rebalance |
| 2+ component: Weak | ✗✗ FAIL — option lạc đề, cần redesign |
| Evidence chỉ là theme reskin | ✗ FAIL — option không thật sự deliver element |

### Step 4 — Resolution

Nếu Weak detected:
- **Propose fix** cụ thể: thêm mechanic dedicated cho element yếu (vd "puzzle Weak → add limited moves + telegraphed boss + multi-turn preview")
- **Update text option** với fix
- **Re-audit L0** đến khi pass

Loop max 2 iterations. Sau đó discuss với user nếu vẫn fail.

---

## Output template

```
═══ L0: Genre Faithfulness ═══
User genre statement: "[quote nguyên gốc]"
Components: [X, Y, ...]

Option A [name]:
  X (e.g. card battle): [evidence] — Strength: Strong/Medium/Weak
  Y (e.g. puzzle):      [evidence] — Strength: Strong/Medium/Weak
  STATUS: ✓ PASS / ⚠ FAIL ([component yếu])

Option B [name]:
  X: ...
  Y: ...
  STATUS: ...

Option C [name]:
  X: ...
  Y: ...
  STATUS: ...

Resolution:
  - Option A: [fix proposed nếu fail]
  - All options pass after fix → proceed L1+L2+L4+L5
```

---

## Ví dụ: card battle + puzzle (lessons learned)

**User statement:** "tôi muốn làm game thể loại card battle kết hợp puzzle"

**Components:** [card battle, puzzle]

```
Option A — Spell-Forge Match (gốc):
  card battle: cast cards consume mana to damage boss (Strong)
  puzzle: match-3 swap với random refill, vô hạn moves, no telegraph (Weak — reactive không deliberate)
  STATUS: ⚠ FAIL — puzzle weak

Option B — Card Tetris Architect:
  card battle: deploy card-shapes attacking boss HP via combo (Strong)
  puzzle: spatial reasoning + adjacency planning + grid pressure (Strong)
  STATUS: ✓ PASS

Option C — Reaction Chamber Alchemist:
  card battle: reagent cards vs boss shield + HP (Medium — share substrate với puzzle)
  puzzle: hidden rule discovery + experimentation (Strong)
  STATUS: ✓ PASS

Resolution Option A:
  Add: limited moves/turn (3), telegraphed boss attack pattern,
       hand visible upfront with 2-card preview, level-specific obstacles
  → puzzle becomes Strong (deliberate planning required)
  Re-audit: ✓ PASS
```

---

## Anti-patterns L0 catches

| Pattern | Symptom | Fix |
|---|---|---|
| **Theme reskin** | "có boss HP để gọi là battle" nhưng combat không có decision sâu | Add real combat decision tier (cards có effect distinct, mana economy, damage variance) |
| **Single-element dominant** | 1 element occupies 90% screen + 90% mechanics | Carve UI space + dedicated mechanic cho element yếu |
| **Surface mention** | Element chỉ ở pitch text nhưng không reflected trong decision tiers | Add decision tier deliver element đó, hoặc flag và bỏ element nếu user không thật sự cần |
| **Implicit conversion** | Element bị "convert" thành element khác (vd "puzzle" → action match-3) | Restore element original definition, add mechanic phù hợp |

---

## Khi nào chạy L0

| Layer | Khi chạy | Cost | Lý do thứ tự |
|---|---|---|---|
| **L0** | Step 5a (FIRST) | Cheap (text comparison) | Catch genre mismatch sớm — nếu fail, fix trước khi tốn tokens audit decision/experience |
| **L1** | Step 5a (sau L0 pass) | Cheap (math) | Substrate capacity |
| **L2** | Step 5a | Medium | Decision anatomy |
| **L4** | Step 5a | Medium | Experience alignment |
| **L5** | Step 5a | Low | Felt experience |

L0 → L1 → L2 → L4 → L5 chạy tuần tự. Nếu L0 fail trên option nào, fix option đó trước khi sang L1.

---

## Liên kết

- See also: `gameplay-suggestion-rules.md` (Evolutionary Rule + 4-component spec)
- See also: `decision-quality-audit-framework.md` (L1+L2+L3)
- See also: `experience-alignment-audit.md` (L4+L5)
