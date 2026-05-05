# Experience Alignment Audit (L4 + L5)

Knowledge base cho skill `game-prototype`. Bridge **decision quality** (DQAF L1+L2+L3) ↔ **experience delivery** (Problem Statement + Kinds of Fun).

## Triết lý

DQAF audit "decisions có sâu không?" — nhưng decision sâu ≠ experience đúng. Một option có thể pass DQAF hoàn toàn nhưng vẫn fail PS+Fun (vd: tactical đẹp nhưng không feel như HLV).

L4+L5 là **bridge layer** đảm bảo decisions thật sự deliver experience đã chốt ở Phase 1 step 3+4.

---

## L4 — Experience Alignment Audit

3 step: PS Decomposition → Fun Signatures → Mapping Matrix.

### Step 4.1 — PS Decomposition

PS có format chuẩn (từ `problem-statement-guideline.md`):
> "Làm sao để **[Design Goal]** + bằng cách **[Tension/Constraint]** + nhằm tạo ra **[Target Emotion]**?"

Decompose thành 3 element checkable:

| Element | Vai trò | Câu hỏi audit |
|---|---|---|
| **Design Goal** | Strategic frame (player hướng tới gì) | Decision có move player hướng tới goal này không? |
| **Tension/Constraint** | Mechanical conflict (cái cản trở) | Decision có **engage** với constraint này không, hay bypass? |
| **Target Emotion** | Felt outcome (cảm xúc cuối) | Sequence decision có **build up** emotion này không? |

**Quan trọng:** Tension là cốt lõi — nếu decision không engage tension, PS sẽ không deliver. Đa số concept fail vì decision **né tránh** tension thay vì confront nó.

### Step 4.2 — Fun Mechanical Signatures Reference

Mỗi Kind of Fun có **mechanical signature** đặc trưng. Decision phải có signature này thì mới deliver Fun.

| Kind of Fun | Mechanical Signatures | Anti-signature (fail Fun) |
|---|---|---|
| **1. Sensation** | Audio/visual feedback intensity, juicy hit, screen shake, particle effects | Static UI, silent feedback, abstract numbers |
| **2. Fantasy** | Role-aligned verbs, thematic naming, world coherence, "I am [role]" feeling | Generic actions, abstract math, theme reskin |
| **3. Narrative** | Branching outcome, character state change, story beats, persistent consequence | Random win/lose, no consequence persistence |
| **4. Challenge** | Skill ceiling, fail state from wrong decision, optimization, replay improvement | Auto-win, RNG dominant, no skill differentiation |
| **5. Fellowship** | Co-op verbs, shared resource, rivalry feedback, social presence | Pure single-player isolation |
| **6. Discovery** | Hidden info, unknown spaces, "aha" reveal, experimentation reward | Full info upfront, no surprise, deterministic |
| **7. Expression** | Customization options, signature playstyle differentiation, build variety | Locked builds, all players play same |
| **8. Submission** | Repetitive comfort loop, low cognitive load, idle progress, mindless flow | High decision density, time pressure, complexity |

**Audit:** mỗi Fun đã chốt → list signature từ table → check decision tier nào deliver signature đó.

### Step 4.3 — Decision-Experience Mapping Matrix

Vẽ matrix:
- **Rows** = decision tiers từ option (T1, T2, T3, T4...)
- **Cols** = (PS Goal, PS Tension, PS Emotion, Fun-1, Fun-2, ..., Fun-N)
- **Cell** = signature delivered? (`✓` = full, `partial` = some, `✗` = no)

#### Pass criteria

- **Coverage rule:** mỗi PS element + mỗi Fun **phải có ≥ 1 decision tier deliver** (không có column trống)
- **Tension rule:** PS Tension column phải có ≥ 1 ✓ FROM CORE decision (decision có frequency cao nhất). Lý do: tension cốt lõi không thể đẩy ra rìa.
- **No conflict rule:** không có decision tier delivers một Fun rồi delivers một Fun khác **xung đột** (vd: Submission vs Challenge cùng tier = mâu thuẫn)

#### Fun Conflict Reference

Cặp Fun **xung đột mechanical**:
- Submission ↔ Challenge (relax vs stress)
- Submission ↔ Discovery (mindless vs curious)
- Narrative ↔ Submission (consequence vs no-consequence)
- Fellowship ↔ Discovery (social vs solo exploration)

Cặp Fun **synergize tốt**:
- Fantasy + Narrative
- Challenge + Expression
- Discovery + Challenge
- Sensation + bất kỳ (universal enhancer)

### Output template L4

```
═══ L4: Experience Alignment ═══

PS Decomposition:
  Goal: [...]
  Tension: [...]
  Emotion: [...]

Fun chosen: [list]

Mapping Matrix:
              | Goal | Tension | Emotion | Fun-1 | Fun-2
  T1 [name]   |  ✓   |   ✓     |  partial|   ✓   |   -
  T2 [name]   |  -   |   -     |    ✓    |   ✓   |   ✓
  T3 [name]   |  ✓   |   -     |    ✓    |   -   |   ✓

Coverage check:
  ✓ Goal: T1, T3
  ✓ Tension: T1 (core decision = pass tension rule)
  ✓ Emotion: T2, T3
  ✓ Fun-1: T1, T2
  ✓ Fun-2: T2, T3

Fun conflict check:
  ✓ No conflicting Fun in same tier

Status: PASS / FAIL [list specific gaps]
```

### Common L4 failure patterns

| Pattern | Symptom | Fix approach |
|---|---|---|
| **Empty Fun column** | Fun chosen nhưng không decision deliver | Add mechanic carrying signature (vd: add character avatar for Fantasy) |
| **Empty Tension column** | Decisions bypass core conflict | Redesign decision to engage tension (vd: force decision under constraint instead of free choice) |
| **Fun conflict in tier** | Tier delivers Submission AND Challenge | Split into 2 tiers OR pick 1 Fun |
| **Tension pushed to rare tier** | Tension only in tier with low frequency | Promote tension to core decision (most frequent) |
| **All ✗ in row** | Decision tier doesn't deliver anything | Cut the tier (it's noise) |

---

## L5 — Felt Experience Self-Test

L4 là structural mapping. L5 là **simulation test** — AI tự "chơi" prototype trong đầu và check 4 câu định tính.

### 4 Questions (phải answer YES for all)

#### Q1 — First-30-seconds test
> "Trong 30 giây đầu chơi, player có cảm nhận được PS Target Emotion ở mức tối thiểu không?"

- **Pass:** Đầu game đã có signal evoke emotion (vd: countdown bar tạo time pressure, glow tile tạo "đọc nhịp")
- **Fail:** Phải chơi 5 phút mới feel → onboarding fail

#### Q2 — Audience-fit test
> "Audience đã chốt có ngay lập tức **nhận diện được tropes của domain** trong cơ chế không?"

- **Pass:** Audience là football fan → thấy ngay shot/defense/coach metaphor mapping rõ ràng
- **Fail:** Cơ chế thuần abstract math, theme chỉ là skin → audience không "vào thế giới" → Fantasy fail

#### Q3 — Tension-engagement test
> "Khi player thắng/thua, lý do thắng/thua có **liên quan trực tiếp** đến PS Tension không?"

- **Pass:** Win vì đọc đúng nhịp tempo (tension = nhịp); lose vì sai tempo
- **Fail:** Win vì RNG hay grind, lose vì unlucky → tension không drive outcome → PS fail

#### Q4 — Replay-motivation test
> "Sau 1 ván, lý do player muốn chơi ván nữa có match với Fun đã chốt không?"

- **Fun = Challenge** → replay vì "lần này tôi sẽ chơi tốt hơn / unlock skill mới"
- **Fun = Fantasy** → replay vì "muốn thử AI style khác / formation khác / role khác"
- **Fun = Discovery** → replay vì "muốn unlock content mới"
- **Fun = Submission** → replay vì "comfort loop"
- **Fail:** Replay motivation = generic ("vui vui") → Fun không stick

### Pass criteria

**4/4 YES.** Nếu < 4 → option có **experience gap** dù decision tốt.

### Output template L5

```
═══ L5: Felt Experience Self-Test ═══

Q1 First-30s: ✓ Countdown bar + glow tile tạo immediate "đọc nhịp" feel
Q2 Audience-fit: ✓ Football fan thấy ngay tempo công/thủ metaphor
Q3 Tension-engagement: ✓ Win/lose driven bởi đọc tempo đúng, không phải RNG
Q4 Replay-motivation: ✓ Challenge — replay để react nhanh hơn

4/4 PASS
```

### Common L5 failure patterns

| Failure | Diagnosis | Fix |
|---|---|---|
| Q1 fail | Onboarding flat, no immediate hook | Add early-game stress/hook (timer, threat, reveal) |
| Q2 fail | Theme reskin, audience không identify | Rename mechanics with domain-native vocab + add genre-iconic visual |
| Q3 fail | RNG/grind dominant | Reduce RNG impact, add skill-gated outcomes |
| Q4 fail | No reason to replay | Add progression / variation / mastery curve |

---

## Khi nào chạy L4 + L5

| Layer | Khi chạy | Cost | Lý do |
|---|---|---|---|
| **L4** | Step 5a (pre-prototype) | Medium (matrix building) | Catch experience gap từ text trước khi build prototype |
| **L5** | Step 5a (pre-prototype) | Low (4 questions) | Gut check; cheap final filter |

Cả 2 ở step 5a vì experience-level audit không cần prototype concrete (text + spec đủ để judge).

---

## Combined L4+L5 example (Concept B retroactive)

**PS B:** "feel nhịp công–thủ + cảm giác HLV đọc trận"
- Goal: kiểm soát nhịp trận
- Tension: phải đọc đúng nhịp (forced switch) trong giới hạn time
- Emotion: cảm giác chiến thuật + đọc trận

**Fun:** Fantasy (HLV) + Challenge (đọc bàn cờ)

### L4 Matrix

| Tier | Goal | Tension | Emotion | Fantasy(HLV) | Challenge |
|---|:---:|:---:|:---:|:---:|:---:|
| D1 (in/off-phase match) | ✓ | ✓ | partial | ✗ | ✓ |
| D2 (combo timing) | partial | ✓ | ✓ | ✗ | ✓ |
| D3 (now vs future setup) | ✓ | ✓ | ✓ | partial | ✓ |
| D4 (aggressive vs patient) | ✓ | partial | ✓ | partial | ✓ |

**Diagnosis:**
- Fantasy column = mostly ✗ ❌ → B deliver Challenge tốt nhưng KHÔNG deliver Fantasy "HLV"
- Tension covered tốt ✓
- Goal/Emotion covered ✓

**Status:** FAIL Fantasy column → propose fix:
- Add coach character avatar phản ứng emote (cười / lo / hét) theo phase outcome
- Add post-phase commentary text "Tactical adjustment needed at half-time"
- Rename mechanic: "Press" thay vì "Attack mode", "Catenaccio" thay vì "Defense mode"

### L5 (sau fix)
- Q1 ✓ (countdown bar + tile glow tạo immediate stress)
- Q2 ✓ (HLV avatar + tactical naming)
- Q3 ✓ (lose vì miss tempo, win vì đọc đúng)
- Q4 ✓ (Challenge: "lần này react nhanh hơn")

→ B pass đầy đủ sau fix.

---

## Tổng kết bridge

```
PS Decomposition (Goal/Tension/Emotion)
    +
Fun Mechanical Signatures
    ↓
L4 Mapping Matrix (Decision × Experience)
    ↓
L5 Felt Experience Self-Test (4 Q gut check)
    ↓
Decision quality + Experience delivery = aligned prototype
```
