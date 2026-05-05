# Decision Quality Audit Framework (DQAF)

Knowledge base cho skill `game-prototype`. Sử dụng ở Phase 1 step 5a (pre-prototype audit) và step 6 (post-pick audit).

## Triết lý

DQAF kiểm tra **decision quality** của một gameplay option qua 3 layers độc lập về domain. Mọi genre (match-3, card, tactics, RPG, narrative...) đều áp dụng được.

Cặp đôi với `experience-alignment-audit.md` (L4+L5) để cover cả decision quality VÀ experience delivery.

---

## L1 — Substrate Capacity Audit (Quantitative)

**Mục tiêu:** đo lượng option real cho mỗi loại decision. Bắt false choice trap (option D-style: substrate quá nhỏ).

### Universal formula

```
Option Density = (Available actions per turn) × (Distinct outcomes per action)
                  / (Forced moves per turn)
```

### Threshold theo Audience flow zone

| Audience | Decisions/turn | Min Option Density | Genre ví dụ |
|---|---|---|---|
| **Casual** | 1 mỗi 30s | ≥ 3 | Match-3 standard, Hyper-casual |
| **Mid-core** | 1 mỗi 10-20s | ≥ 5 | Roguelike, Puzzle-RPG, Auto-battler |
| **Hardcore** | 1 mỗi 3-10s | ≥ 8 | Strategy, Tactics, Deck-builder |

### Substrate-specific calculators

| Genre | Substrate metric | Cách đo |
|---|---|---|
| Grid puzzle | Adjacent pairs `2N(N-1)` | × % tạo effect (~30-40% match games) |
| Card game | `Hand × LegalTargets` | Hand size × playable targets each card |
| Action RPG | `Abilities × Targets × Positions` | Combat options per second |
| Strategy | `Units × LegalMoves × MoveTypes` | Move options per phase |
| Narrative | `BranchingChoices × MeaningfulConsequences` | Choices changing downstream state |
| Roguelike deck | `HandSize × BoardZones × CardEffects` | Per turn deployment options |
| Racing/Sports | `ControlInputs × StateContexts` | Steer + speed + lane × race state |
| Tower Defense | `TowerTypes × Tiles × UpgradeStates` | Build options per wave |
| Idle/Auto | `UpgradePaths × ResourceStates × PrestigeOptions` | Decision points per session |

### Sub-system Curse Rule

Khi chia game thành K sub-systems (lanes, phases, rooms, panels):
- **Mỗi sub-system phải pass threshold độc lập**
- Tổng cũng phải pass, nhưng **không cộng dồn để bù** (player chỉ tương tác 1 sub-system tại 1 thời điểm)
- Rule of thumb: nếu chia K, mỗi sub-system tối thiểu **threshold / 1.5**

### Red flags

- Option Density < threshold → **AP1.4 False choice** trap
- Sub-system với < 4 options/turn → forced moves
- Action types < 2 → no real choice (chỉ binary)

### Output template L1

```
═══ L1: Substrate Capacity ═══
Audience: [Mid-core, threshold ≥5]
Substrate breakdown:
  - Board: 6×5 = 49 adjacent pairs × 35% match = ~17 options
  - Sub-systems: 1 (no curse)
Decision Density: 17 ✓ PASS
```

---

## L2 — Decision Anatomy Audit (Qualitative)

**Mục tiêu:** đảm bảo mỗi decision có "depth", không phải chỉ có "options".

### Anatomy Score Card (0-3 mỗi field)

Mỗi decision tier scoring 5 fields, trung bình ≥ 2.0/3 để pass.

| Field | 0 (fail) | 1 (basic) | 2 (good) | 3 (excellent) |
|---|---|---|---|---|
| **Cost** | Free, no opportunity cost | Token cost (resource) | Cost + opportunity cost | Multi-dim cost (resource + time + future option) |
| **Value** | Hidden/unclear | Visible single-dim | Visible multi-dim | Visible + scaling with context |
| **Info** | Pure RNG, no signal | Partial info, mostly hidden | Most info visible, some hidden good | Full info but skill-cap to interpret |
| **Timing** | Anytime, no pressure | Window-based but generous | Specific moment, deliberate | Critical timing, missing = lose opportunity |
| **Reversibility** | Permanent lock-in | Hard to recover | Recoverable with cost | Fully reversible / try-and-see |

### Cross-decision check

- **Have ≥ 2 decision tiers?** Mọi prototype tactical phải có ≥ 2 layer (vd: macro + micro). 1 tier = thường shallow.
- **Tier khác frequency** — không 2 tier cùng frequency vì cạnh tranh mental load. Khoảng cách 3-5x giữa frequencies (vd: micro mỗi turn, macro mỗi 5 turn).

### Output template L2

```
═══ L2: Decision Anatomy ═══
Tier 1 [name] (freq: every turn): avg 2.4/3 — PASS
  Cost=2, Value=3, Info=2, Timing=2, Reversibility=3
Tier 2 [name] (freq: every 3 turns): avg 1.6/3 — FAIL
  Info=0 pure RNG → Fix: thêm preview "next AI threat" để Info=2
Tier 3 [name] (freq: per-game): avg 2.6/3 — PASS

Cross-check:
  - 3 tiers ✓
  - Frequencies: turn / 3-turn / per-game (good spread) ✓
```

---

## L3 — Interaction Topology Audit (Emergent)

**Mục tiêu:** kiểm tra decisions **có nói chuyện với nhau** tạo emergent strategy hay isolated.

### Decision Interaction Matrix

Vẽ ma trận N×N (N = số decision tier). Mỗi ô (i,j) trả lời:
> "Decision i ảnh hưởng decision j thế nào?"

**3 loại tương tác lành mạnh:**
- **Setup → Payoff** (decision i mở khóa option cho j, vd: Midfielder match → có thêm card cho hand)
- **Trade-off cross-tier** (decision i cost = j gain, vd: focus lane A = bỏ lane B, AI exploit)
- **Information feedback** (j's outcome reveal info cho i lần sau, vd: AI's bid history → bias next bid)

### Pass criteria

- **Coverage:** ≥ 60% ô trong ma trận có ít nhất 1 loại tương tác (không isolated)
- **Diversity:** ít nhất 2 loại tương tác khác nhau (không chỉ Setup→Payoff)
- **Non-degenerate:** không có cycle exploit (vd: A boost B, B boost A, infinite loop)

### Red flag patterns

- **Decision Silo** — tier không liên quan đến nhau (vd: trong D, formation pick KHÔNG ảnh hưởng tackle decision → silo)
- **Linear chain only** (A→B→C) — yếu, dễ bypass
- **Snowball loop** (A boost A) — vi phạm AP2.1
- **All trade-off, no setup** — players cảm thấy bị punish, không cảm thấy clever

### Output template L3

```
═══ L3: Interaction Topology ═══
Matrix (3 tiers):
              T1      T2      T3
  T1 [name]   -       Setup→  Trade-off
  T2 [name]   InfoFb  -       Setup→
  T3 [name]   -       -       -

Coverage: 4/6 cells = 67% ✓
Interaction types: Setup→Payoff, Trade-off, Info-feedback (3 types) ✓
Cycles: none ✓
PASS
```

---

## Khi nào chạy L1, L2, L3

| Layer | Khi chạy | Cost | Lý do |
|---|---|---|---|
| **L1** | Step 5a (pre-prototype) | Cheap (math) | Catch substrate gap trước khi tốn tokens |
| **L2** | Step 5a (pre-prototype) | Medium (per-decision scoring) | Catch shallow decisions từ text |
| **L3** | Step 6 (post-pick) | High (matrix analysis) | Cần concrete prototype để map interactions |

---

## Genre Adapter Tables

DQAF universal nhưng cần adapter cho từng genre:

| Genre | L1 substrate metric | L2 timing critical field | L3 interaction phổ biến |
|---|---|---|---|
| Match-3 | Adjacent pairs × match% | Combo timing | Setup (clear) → Payoff (combo) |
| Card/Deck | Hand × targets | Reactive vs proactive | Hand mgmt ↔ board state |
| Roguelike | Floor exits × loadout | Boss read | Loadout ↔ encounter type |
| Tactics | Units × tile moves | Initiative window | Position ↔ ability synergy |
| Idle/Auto | Upgrades × resources | Prestige timing | Resource ↔ progression rate |
| Puzzle | Solution paths | Hint cost | Pattern recognition ↔ verify |
| Action | Attack patterns × dodge windows | Frame-perfect timing | Position → opening |
| Narrative | Branch points × consequences | Choice deadline | Past choice → future option |

---

## Combined output template (L1+L2+L3)

```
═══ DQAF: [Option Name] ═══

L1 SUBSTRATE
  Threshold: 5 (Mid-core)
  Density: 17 ✓ PASS

L2 ANATOMY
  T1 [name]: 2.4/3 ✓
  T2 [name]: 1.6/3 ✗ — Fix Info field
  T3 [name]: 2.6/3 ✓

L3 TOPOLOGY (post-pick)
  Coverage: 67% ✓
  Diversity: 3 types ✓
  PASS

Total: 1 fail (L2 T2 Info) → propose fix → re-audit
```
