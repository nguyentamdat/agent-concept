# Decisions Guideline — Knowledge Base về Player Decisions trong Game Design

> Deep-dive về thiết kế quyết định trong game, dựa trên "Players Making Decisions" (Zack Hiwiller) — Part 3 (ch 9-12) + Part 4 (ch 13-18).

**File này là knowledge base cho 3 skill:** `game-concept-design`, `game-concept-review`, `game-prototype`. File được duplicate sang `references/` của cả 3 skill — khi update, sync cả 3 nơi.

**Quan hệ với `game-design-theories.md`**: file đó là quick overview broad cho 12 lý thuyết. File này đào sâu riêng về **decisions** với heuristics + anti-patterns chi tiết hơn.

---

## Khi nào load file này?

| Skill | Load §1 (Concepts) | Load §2 (Heuristics) | Load §3 (Anti-patterns) | Load Appendix |
|-------|---|---|---|---|
| `game-concept-design` | All | §2.1 + §2.2 | §3.1 + §3.2 + §3.3 | A, C |
| `game-concept-review` | All | §2.2 + §2.3 | All | A, B |
| `game-prototype` | §1.1-§1.6 | §2.2 | §3.1 + §3.2 | C |

---

## Mục lục (TOC)

**§1. Concepts & Principles**
- [§1.1 Flow & Fundamental Game Design Directive](#flow-directive)
- [§1.2 Player Agency](#agency)
- [§1.3 Anatomy of a Choice](#anatomy-choice)
- [§1.4 Interest Curve & Learning Curve](#interest-curve)
- [§1.5 Goals & Goal Hierarchy](#goals)
- [§1.6 MDA Framework + Common Dynamics](#mda)
- [§1.7 Randomness](#randomness)
- [§1.8 Rules & Verbs](#rules-verbs)
- [§1.9 Balance & Numeric Relationships](#balance)
- [§1.10 Feedback Loops](#feedback-loops)
- [§1.11 Milieu & Player Types](#milieu)

**§2. Decision Heuristics**
- [§2.1 Concept Phase](#h-concept-phase) (H1.1-H1.5)
- [§2.2 Core Loop Phase](#h-core-loop-phase) (H2.1-H2.6)
- [§2.3 Mechanics & Balance Phase](#h-mechanics-balance-phase) (H3.1-H3.7)
- [§2.4 Polish & Iteration Phase](#h-polish-iteration-phase) (H4.1-H4.6)

**§3. Anti-patterns**
- [§3.1 Less-Interesting Decisions](#less-interesting) (AP1.1-AP1.7)
- [§3.2 Bad Dynamics](#bad-dynamics) (AP2.1-AP2.6)
- [§3.3 Goal Problems](#goal-problems) (AP3.1-AP3.4)
- [§3.4 Feedback Loop Pitfalls](#feedback-pitfalls) (AP4.1-AP4.4)
- [§3.5 Ineffective Puzzles](#ineffective-puzzles) (AP5.1-AP5.7)
- [§3.6 Balance & Numeric Traps](#balance-traps) (AP6.1-AP6.3)

**Appendices**
- Appendix A: Concept Index (~60 entries alphabet)
- Appendix B: Decision Quality Scorecard (5-dimension /10)
- Appendix C: Quick Reference Cards (15 compact summaries)

---

## §1. Concepts & Principles

### §1.1. Flow & Fundamental Game Design Directive {#flow-directive}

**Nguồn**: "Players Making Decisions" Ch.9 — pages 86-100

**Định nghĩa cốt lõi**:
- **Flow** (Csikszentmihalyi): trạng thái tập trung intrinsically rewarding khi task có goals rõ + feedback ngay + balance challenge/skill
- **Fundamental Game Design Directive**: mọi quyết định game design phải phục vụ tạo flow cho player
- **Flow Channel**: dải giữa Anxiety (challenge > skill) và Boredom (challenge < skill)
- 3 điều kiện flow: clear goals, immediate feedback, balanced challenge

**Cơ chế / Anatomy**:
- Designer phải craft trước trải nghiệm trong khi không biết skill thực của player
- **Casual** thường err về phía under-challenge (boredom); **Hardcore** err về phía over-challenge (frustration)
- Pattern flow channel oscillation: Boss Fight (high challenge) → Easy Section (rest) → Boss Fight harder...
- Ví dụ Super Mario Bros World 1-1: low challenge ban đầu (an toàn experiment) → Goomba → tăng dần
- Ví dụ Shadow of the Colossus: boss fights cường độ cao xen kẽ ride ngựa peaceful

**Áp dụng khi thiết kế**:
- Khi review concept: hỏi "Quyết định/mechanic/level này đẩy player gần hay xa flow?"
- Tránh thiết kế lệch về frustration (Dark Souls thiên về frustration là choice intentional, không phải mặc định)
- Mini-climaxes pattern: cho player taste of payoff sớm để vượt qua learning curve dài (Portal pattern)
- Đo flow gián tiếp qua **Interest Curve** (xem [§1.4](#interest-curve))

**Câu hỏi kiểm tra**:
- Concept có goals rõ ràng player có thể nhận ra không?
- Player có nhận feedback ngay khi action không?
- Challenge curve có match skill curve cho target audience không?
- Concept có dồn quá nhiều learning trước payoff đầu tiên không?

**Liên kết**:
- See also: [H1.1 Fundamental Directive](#h1-1), [H4.3 Map Interest Curve](#h4-3), [§1.4 Interest Curve](#interest-curve)

### §1.2. Player Agency {#agency}

**Nguồn**: "Players Making Decisions" Ch.10 — pages 102-103

**Định nghĩa cốt lõi**:
- **Agency**: khả năng player tác động thực sự đến game state qua quyết định của mình
- Watch movie = no agency. Play game where choices không affect state = no agency.
- **More agency ≠ better.** SimCity bỏ agency quản lý lịch thu rác vì nó không tạo meaningful decision

**Cơ chế / Anatomy**:
- Spectrum, không phải binary: NBA Live (high agency, simulation) ↔ NBA Street (low agency, arcade)
- Cho agency ở những nơi player CẦN; bỏ ở nơi không cần
- Bản thân hành động CHỌN đã motivating, kể cả khi choice không tăng control thực sự (Cordova & Lepper 1996)
- Audience matter: casual có thể frustrated với high-agency game (NBA Live too complex); hardcore có thể bored với low-agency game (NBA Street too simple)

**Áp dụng khi thiết kế**:
- Liệt kê tất cả decision points trong core loop, hỏi: "Player có quan tâm đến decision này không?"
- Decisions không quan tâm → automate (như SimCity automate trash schedule)
- Match agency level với target audience profile
- Test ở extremes: nếu game có quá nhiều agency cho casual, simplify; nếu quá ít cho hardcore, enrich

**Câu hỏi kiểm tra**:
- Mỗi decision point có thật sự ảnh hưởng game state không?
- Audience target có khớp với agency level không?
- Có quyết định nào đáng nên automate không?
- Choice nào cho cảm giác chọn mà không thật sự control? (illusion of choice — xem [AP1.7](#ap1-7))

**Liên kết**:
- See also: [§1.3 Anatomy of a Choice](#anatomy-choice), [H1.3 Match Agency to Audience](#h1-3), [AP1.7 Illusion of Choice](#ap1-7)

### §1.3. Anatomy of a Choice {#anatomy-choice}

**Nguồn**: "Players Making Decisions" Ch.10 — pages 103-115 (kèm Trade-offs, Risk/Reward, Expected Value)

**Định nghĩa cốt lõi (5 yếu tố — Salen & Zimmerman)**:
- **Before**: bối cảnh trước choice — game state là gì? player biết gì?
- **Communication**: cách choice được trình bày — player có biết có choice không, options là gì?
- **Action**: cơ chế ra quyết định — player làm gì để chọn (press button, play card, dialog menu)?
- **Consequences**: kết quả thay đổi game state thế nào? Affects future choices ra sao?
- **Feedback**: kết quả communicate ngược lại player như thế nào?

**Cơ chế / Anatomy**:
- 3 pattern decision interesting:
  - **Trade-off**: 2+ options, mỗi option có benefit + drawback so với cái khác (Team Fortress 2 Pyro flamethrower vs backburner; Dominion buying Action vs Victory cards)
  - **Risk/Reward**: option certainty cao/payoff thấp ↔ option certainty thấp/payoff cao (Donkey Kong route B short risky vs route C long safe; Let's Make A Deal mystery prize)
  - **Expected Value**: EV = Σ(probability × payoff). Options có EV gần nhau → choice interesting; chênh lệch lớn → obvious
- Choice paralysis: quá nhiều options thực ra giảm engagement (Iyengar & Lepper 2000 jam study: 6 options 10x conversion so với 24 options)

**Áp dụng khi thiết kế**:
- Review từng decision point bằng 5 lenses:
  - Nếu player thấy decision meaningless → check Consequences
  - Nếu player confused → check Communication và Feedback
  - Nếu player frustrated với mechanic → check Action
- Limit options khi không có lý do narrative; 3-7 options thường đủ
- Khi đặt trade-off, đảm bảo benefit/drawback rõ ràng — nếu drawback ẩn, decision sẽ obvious một chiều
- Time-shifting risk/reward: ngắn hạn safe vs dài hạn risky (XP grind vs gamble strategy)

**Câu hỏi kiểm tra**:
- Mỗi decision point có đầy đủ 5 yếu tố không?
- Consequences có thay đổi game state đáng kể không?
- Mỗi option có rõ benefit + drawback không?
- Có option nào dominant không (EV cao hơn rõ rệt)?
- Player có nhận feedback rõ về kết quả không?

**Liên kết**:
- See also: [H2.1 Anatomy Check](#h2-1), [H2.2 Trade-off Pattern](#h2-2), [H2.3 Risk/Reward Pattern](#h2-3), [H2.4 Expected Value](#h2-4), [§3.1 Less-Interesting Decisions](#less-interesting)

### §1.4. Interest Curve & Learning Curve {#interest-curve}

**Nguồn**: "Players Making Decisions" Ch.9 — pages 92-100

**Định nghĩa cốt lõi**:
- **Interest Curve** (Schell): graph engagement theo thời gian — y=interest, x=time. Có "minimum interest" floor; rớt dưới = quit point
- **Learning Curve**: graph lượng kiến thức player phải học theo thời gian — y=cumulative learning, x=time
- **"Steep learning curve" thường bị hiểu sai**: nghĩa đúng là học NHANH trong thời gian ngắn (steep ascent), KHÔNG phải "khó học". Game khó học = curve dài, không phải steep.
- Aristotelian dramatic structure analog: Inciting Incident → Rising Action → Turning Points → Climax → Resolution

**Cơ chế / Anatomy**:
- Interest Curve oscillates: spike ở moments-of-interest (boss fight, plot twist, level-up), valley ở rest periods để player recover
- Half-Life 2 Episode One example: spike at boss fights/setpieces, valleys after để cho player digest
- Khi player đang LEARN → designer có thể increase challenge (challenge tracks skill curve); khi player plateau (đã thuần thục) → giữ flat hoặc add new mechanic
- 3 cách mitigate quit-point ở steep learning curve dài (Dwarf Fortress problem):
  1. **Mini-climaxes early** (Portal pattern): cho player taste of payoff trong vài phút đầu
  2. **Reduce learning amount**: sports games "casual mode" cắt depth để curve ngắn hơn
  3. **Cater to long-tolerance audience only**: chấp nhận market nhỏ hơn (Dwarf Fortress, EVE Online)

**Áp dụng khi thiết kế**:
- Vẽ interest curve dự kiến TRƯỚC khi build: mark moment-of-interest dự kiến trên timeline (phút 0, 5, 15, 30, 60...)
- Sau playtest, ask player rate 1-10 ở mỗi điểm — build actual curve, fix dips
- Đo learning curve qua "first meaningful win" time: player mất bao lâu để hoàn thành goal đầu tiên?
- Nếu first meaningful win > 10 phút cho casual / > 60 phút cho hardcore → có vấn đề
- Đảm bảo có "mini-climax" trong session đầu tiên — đừng bắt player học hết tutorial mới được fun

**Câu hỏi kiểm tra**:
- Khoảng cách giữa các moments-of-interest có < 5-10 phút không?
- Player có "first meaningful win" trong session đầu không?
- Có chỗ nào curve dồn xuống dưới minimum interest line không?
- Learning curve có match audience tolerance không (steep cho hardcore, gentle cho casual)?

**Liên kết**:
- See also: [§1.1 Flow](#flow-directive), [H4.3 Map Interest Curve](#h4-3), [H4.4 Mini-Climaxes Before Big Payoff](#h4-4), [AP3.4 Steep Learning Curve Before First Payoff](#ap3-4)

### §1.5. Goals & Goal Hierarchy {#goals}

**Nguồn**: "Players Making Decisions" Ch.12 — pages 124-133

**Định nghĩa cốt lõi**:
- Game = activity với rules + goals. Goals drive decisions; nếu goals mơ hồ, decisions sẽ meaningless
- **Schell's 3 Criteria for Goals**: **Concrete** (specific, observable) + **Achievable** (player tin có thể đạt) + **Rewarding** (đạt rồi cảm thấy đáng)
- **Goal Hierarchy** (3 tầng):
  - **Short-term goal**: phục vụ 1 game mechanic (defeat enemy, find item)
  - **Medium-term goal**: gồm nhiều short-term (collect all sword fragments, complete chapter)
  - **Object of the Game**: longest-term, the "why" của tất cả sub-goals
- **Players Determine Goals via Scientific Method**: Theorize → Hypothesize → Experiment → Evaluate → Understand (loop liên tục while playing)

**Cơ chế / Anatomy**:
- Examples từ sách:
  - **Project Gotham Racing**: Short = drift through turn → Medium = first place in circuit → Object = collect all gold medals
  - **Heavy Rain**: Short = find clue/solve mini-puzzle → Medium = reconcile each character's storyline → Object = solve Origami Killer
  - **Braid**: Short = collect puzzle piece → Medium = assemble jigsaw per world → Object = rescue princess (with twist)
- **Strategy ≠ Goal** (common confusion): "Use light to your advantage" trong Alan Wake là STRATEGY (cách đạt goal), không phải goal. Goal là "survive the night / escape Bright Falls".
- **Vague Goals** = goals fail Concrete criterion. "Learn the basics" trong Guitar Hero là vague — đo bằng gì? "Complete tutorial level 1 with 80% accuracy" mới concrete.
- **Goal-Setting Pyramid (Designer's Workflow)**: Problem Statement → Object of Game → Medium-Term Goals → Short-Term Goals → Mechanics. Top-down ensures mechanics phục vụ goals.

**Áp dụng khi thiết kế**:
- TRƯỚC khi viết mechanics, viết Object of the Game (1 câu) — concrete + achievable + rewarding
- List 3-5 Medium-term goals support Object — phải đo được
- List 5-15 Short-term goals support Medium-term
- Verify mỗi mechanic phục vụ ít nhất 1 short-term goal — mechanic không có goal là dead weight
- Tránh đặt strategy chỗ goal: "Hide in shadows" (strategy) vs "Reach the exit undetected" (goal)
- Sandbox games (Minecraft, Dwarf Fortress) cho player TỰ định nghĩa goals — designer cung cấp possibility space đủ rộng

**Câu hỏi kiểm tra**:
- Object of the Game có nói được trong 1 câu không?
- Mỗi goal có concrete (đo được) + achievable (khả thi) + rewarding (đáng) không?
- Có lẫn lộn strategy với goal không?
- Mỗi mechanic có support ít nhất 1 short-term goal không?
- Player mới có hiểu Object trong vài phút đầu không?

**Liên kết**:
- See also: [H1.4 Define Goal Hierarchy Early](#h1-4), [AP3.1 Vague Goals](#ap3-1), [AP3.2 Strategy Mistaken for Goal](#ap3-2), [AP3.3 Players Set Counter-Goals](#ap3-3)

### §1.6. MDA Framework + Common Dynamics {#mda}

**Nguồn**: "Players Making Decisions" Ch.13 — pages 138-150

**Định nghĩa cốt lõi**:
- **MDA** (Hunicke, LeBlanc, Zubek 2004) = framework phân tích game qua 3 layer:
  - **Mechanics**: rules — DUY NHẤT thứ designer điều chỉnh trực tiếp được
  - **Dynamics**: runtime behaviors emerge khi mechanics chạm vào player choices
  - **Aesthetics**: emotional responses player cảm thấy
- **LeBlanc's 8 Kinds of Fun** (taxonomy aesthetics): Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission
- **Designer flow**: M → D → A. **Player flow**: A → D → M (reverse). Designer chỉ có nút vặn ở M; player chỉ cảm A.
- **MDA descriptive, không normative**: không đánh giá tốt/xấu, chỉ phân tích cách elements tạo experience

**Cơ chế / Anatomy**:
- Examples từ sách:
  - **Realm of the Mad God**: Mechanic drop item on death → Dynamic "trading" emerges (player give items đến friend trước khi chết) → Aesthetic Fellowship
  - **Monopoly với Free Parking variant**: Mechanic Free Parking jackpot → Dynamic game kéo dài + cash injection → Aesthetic loss of strategic tension (game lẽ ra có winner đã thua bạc)
  - **Chess**: Mechanic = rules movement → Dynamic = position trade-offs, tempo battles → Aesthetic Challenge + Discovery
- Common dynamics đáng chú ý:
  - **Press-Your-Luck** (positive dynamic): trade-off safe stop vs risky continue (Can't Stop board game; football 4th down decision; Yahtzee re-roll)
  - **Turtling, Camping, Kingmaking, Button Mashing, Grinding, Dominant Strategy** = bad dynamics (chi tiết ở [§3.2](#bad-dynamics))
  - **Trading**: player exchange resources → fellowship + economy
  - **Bluffing**: hidden info + bet → tension (Poker, Sheriff of Nottingham)

**Áp dụng khi thiết kế**:
- Bắt đầu thiết kế từ AESTHETICS mong muốn (1-3 từ trong 8 Kinds of Fun) → dynamics nào tạo aesthetic đó → mechanics nào sinh dynamics
- Không thiết kế xuôi M→D→A: dễ ra mechanic ngẫu nhiên không hội tụ về aesthetic mong muốn
- Khi review concept, thử mapping: list mechanics → predict dynamics → predict aesthetics. Nếu aesthetics dự đoán không match aesthetic mong muốn → redesign mechanics
- Nhận biết unintended dynamics qua playtest — Free Parking case: rule "innocent" tạo dynamic phá game

**Câu hỏi kiểm tra**:
- Aesthetic mong muốn của game này là gì (1-3 từ)?
- Dynamics nào sẽ tạo aesthetic đó?
- Mỗi mechanic phục vụ dynamic nào?
- Có mechanic nào tạo dynamic không mong muốn không (trade một cách player exploit)?

**Liên kết**:
- See also: [H1.2 Identify Aesthetic First](#h1-2), [§3.2 Bad Dynamics](#bad-dynamics)

### §1.7. Randomness {#randomness}

**Nguồn**: "Players Making Decisions" Ch.11 — pages 117-123

**Định nghĩa cốt lõi**:
- **Randomness Spectrum**: Completely Random ↔ Mitigated Random ↔ Skill-Based
  - **Completely Random**: LCR (Left-Center-Right), War (card game), Baccarat, Candy Land — không có decision có ý nghĩa
  - **Skill-Based**: Chess, Darts — outcome quyết định bởi skill thuần
  - **Mitigated Random**: Settlers of Catan, Magic: The Gathering, Dominion — random + player skill cùng đóng góp
- **Pure-skill problem**: identical players → same outcome every time → no mystery, lose replay value
- **Pure-luck problem**: no skill involvement → not satisfying for adults (Caillois: "destiny is the sole artisan of victory")
- **Perceived Fairness > Actual Fairness**: player chấp nhận thua do random kém hơn rất nhiều so với thua do rule unfair

**Cơ chế / Anatomy**:
- **Sid Meier Civ study** (perceived fairness): Civ players felt 1:3 underdog "should" win 25%, 3:1 favorite "should never lose" — mặc dù asymmetric. Dev đã skew probabilities khỏi math thật để fit perception → player happier
- **De Koven**: random outcome cảm thấy "công bằng" hơn rule unfair, vì random không có ý đồ; rule có ý đồ designer
- 3 mitigation patterns:
  - **Drafting**: random deal hands → mỗi turn player chọn 1 card → pass remaining → giảm variance theo time (Agricola, 7 Wonders)
  - **Limit randomness pre-exposure**: random ở setup, deterministic in-game (Pandemic infection deck pre-shuffled; Settlers map random nhưng turns deterministic)
  - **Self-balancing through agency**: Dominion player chọn deck composition → tự điều chỉnh probability mỗi turn
- **Hidden info ≠ random**: Stratego có hidden pieces nhưng deterministic (no dice). Hidden info tạo uncertainty mà không cần RNG

**Áp dụng khi thiết kế**:
- Định vị game trên spectrum trước: pure random / mitigated / pure skill — chọn theo aesthetic mong muốn (Challenge wants more skill, Sensation/Submission OK với more random)
- Nếu random, dùng mitigation patterns: drafting, pre-shuffle, agency để chọn distribution
- Test perceived fairness với playtest thật, không chỉ math: player có cảm thấy fair khi thua không?
- Tránh "random spike mid-game without agency to mitigate" — đó là khi player blame designer
- Có thể skew probabilities khỏi true math nếu nó cải thiện perceived fairness (Civ trick)

**Câu hỏi kiểm tra**:
- Game đang ở đâu trên spectrum random↔skill?
- Có random spike nào player không thể mitigate không?
- Player thua có cảm thấy fair không (playtest)?
- Random có distribution match player expectation không?
- Có cần drafting/pre-shuffle pattern để giảm variance không?

**Liên kết**:
- See also: [H3.4 Limit Randomness Pre-Exposure](#h3-4), [H3.5 Perceived Fairness](#h3-5), [§1.3 Anatomy of a Choice](#anatomy-choice)

### §1.8. Rules & Verbs {#rules-verbs}

**Nguồn**: "Players Making Decisions" Ch.15 — pages 164-169

**Định nghĩa cốt lõi**:
- **Rules** = constraint giới hạn player action để tạo meaningful choice. Không có rules → no game (Caillois)
- **Verbs** = actions player có thể take trong game (the "interaction vocabulary")
- **5 Qualities of Rules** (Salen & Zimmerman):
  1. **Limit player action** — rule định nghĩa cái KHÔNG được làm
  2. **Explicit and unambiguous** — no win/no lose state phải được handle rõ
  3. **Shared by all players** — cùng hiểu cùng rule (kể cả Cops/Robbers asymmetric roles vẫn shared rule set)
  4. **Fixed** — chỉ change theo meta-rule (Fluxx có rule "rule có thể change", đó là constitutive)
  5. **Binding & Repeatable** — rule áp dụng consistent, không tùy hứng

**Cơ chế / Anatomy**:
- **3 Types of Rules**:
  - **Operational**: ghi trong instruction sheet — most rules belong here
  - **Constitutive**: underlying logic / mathematical structure (Hearts có 13 heart cards trong deck — đó là constitutive)
  - **Implicit**: tacit agreements (no marking cards, sportsmanship, etiquette)
- **Verbs examples**:
  - **Baseball**: run, hit, catch, slide, pitch, throw, tag...
  - **Mario**: walk, run, jump, stomp, throw fireball, slide
  - **Portal**: walk, jump, shoot blue portal, shoot orange portal, pick up, drop
- **Orphaned Verbs** (Anthropy & Clark): verb không kết nối với verbs/mechanics khác → unused capability, complexity tax không có payoff
  - Ví dụ counter (good design): **Super Metroid** dùng "shoot" để mở door thay vì add new "open" verb → không orphaned
  - Bad: verb ăn 1 nút riêng nhưng chỉ dùng ở 1 mechanic
- **Too few verbs** = không có choice (Dragon's Lair: chỉ press right button → not really game)
- **Too many verbs** = unfocused, confusing player

**Áp dụng khi thiết kế**:
- List tất cả verbs player có; cho mỗi verb, ghi 2-3 verb khác nó tương tác. Nếu chỉ tương tác 0-1, candidate orphan.
- Trước khi add verb mới, hỏi: "Verb sẵn có có làm được không?" (Super Metroid pattern)
- Audit rules by 5 qualities: rule có explicit không? Repeatable không? Có shared không?
- Edge cases là nơi rules ambiguity trồi lên — design phải cover (no win state? draw? simultaneous death?)
- Kiểm tra implicit rules: nếu game cần player tự agree gì đó (no looking at opponent's cards), hợp thức hóa thành operational rule

**Câu hỏi kiểm tra**:
- Rules có đủ 5 qualities (limit/explicit/shared/fixed/repeatable) không?
- Có verb nào orphaned không (chỉ kết nối 1 mechanic)?
- Có thể consolidate verbs (re-use existing thay vì add new)?
- Có edge case nào rule không cover không (no-win, simultaneous, etc.)?

**Liên kết**:
- See also: [H2.6 Avoid Orphaned Verbs](#h2-6), [H3.7 Make Rules Explicit](#h3-7)

### §1.9. Balance & Numeric Relationships {#balance}

**Nguồn**: "Players Making Decisions" Ch.16 — pages 170-182

**Định nghĩa cốt lõi**:
- **Symmetry ≠ Balance**: Chess đối xứng nhưng champion vs novice không "balanced". Pandemic asymmetric (mỗi role khác nhau) nhưng balanced (feels fair).
- **Balance là maximization, không phải solving equation**: tìm "good enough" range, không có "đáp án đúng" duy nhất
- **Balance theo player satisfaction**, không theo rule symmetry
- **Self-balancing mechanisms**: cho player tự define giá trị thay vì designer hard-code (auctions, supply/demand, market)

**Cơ chế / Anatomy**:
- **Numeric Relationships** (theo growth rate):
  - **Flat**: n(x) = n(0). Mỗi unit cùng utility — Mario coin (100 = 1up), $200 mỗi vòng Monopoly
  - **Linear**: n(x) = k·x + m. Scale tuyến tính — XP per kill bằng nhau
  - **Linear Inverse**: n(x) = m - k·x. First-mover bonus giảm dần (Roll Through the Ages: builder bonus)
  - **Triangular**: n(x) = x + k·n(x-1). Gap tăng dần — Ticket to Ride (4-route=7pt, 5-route=10pt, 6-route=15pt). Reward investment.
  - **Fibonacci**: 1,1,2,3,5,8,13,21,34... RPG XP curves, gentler exponential
  - **Exponential**: n(x) = k·x^m. Out of control nhanh — penny doubling 30 days = $10M. Player resources không nên dùng exponential!
- **Self-balancing mechanisms**:
  - **Auctions**: English (open ascending), Dutch (open descending), Vickrey (sealed second-price). Player tự define giá trị item.
  - **Supply and demand**: Power Grid resource pricing — fewer left → more expensive
- **Balance Heuristics** (Hiwiller):
  - **Always consider extremes**: nếu player làm 1 action liên tục, lucky/unlucky liên tục, x=0, x=∞ → game vẫn balance không?
  - **Find "Good Enough"** — doubling/halving values cho convergence nhanh hơn nudging ±1 (binary search-like)
  - **Keep goals in mind**: Arkham Horror không balanced theo nghĩa truyền thống (player hay thua), nhưng phù hợp aesthetic challenge → đó là "balanced" with respect to design goal

**Áp dụng khi thiết kế**:
- Match relationship type với design intent: flat cho commodity, triangular cho investment reward, linear cho steady scale, AVOID exponential cho player-accumulating resources
- Khi tune values, dùng doubling/halving không nudging ±1
- Test ở extremes trước khi test mid-range
- Thay vì hard-code giá trị, cân nhắc auction/supply-demand để player tự define
- Đừng nhầm symmetry với balance — asymmetric vẫn balance được nếu feels fair

**Câu hỏi kiểm tra**:
- Mỗi numeric relationship có match design intent không?
- Có xài exponential cho player resources không (red flag)?
- Đã test edges (x=0, x=max, all-lucky, all-unlucky) chưa?
- "Balanced" theo asymmetry (rule) hay theo player satisfaction?
- Có chỗ nào nên dùng auction/market thay vì hard-code?

**Liên kết**:
- See also: [H3.1 Pick Right Numeric Relationship](#h3-1), [H3.2 Test Extremes](#h3-2), [H3.3 Find Good Enough](#h3-3), [H3.6 Self-balancing Mechanisms](#h3-6), [AP6.1 Hidden Exponential Growth](#ap6-1), [AP6.2 Symmetry Mistaken for Balance](#ap6-2)

### §1.10. Feedback Loops {#feedback-loops}

**Nguồn**: "Players Making Decisions" Ch.17 — pages 183-192

**Định nghĩa cốt lõi**:
- **Feedback Loop**: action ảnh hưởng future actions; output trở thành input cho cycle tiếp theo
- 2 flavors:
  - **Positive Feedback Loop**: success breeds more success ("rich get richer"). Examples: Risk armies → conquer more → more armies; Quake II respawn weapons; Mafia Wars Mega Casinos exponential
  - **Negative Feedback Loop**: hinder leader / help loser; tendency về equilibrium. Examples: Mario Kart blue shell, football possession swap sau touchdown, 8-ball pool (leader has fewer balls left to defend)
- Positive ≠ "good", Negative ≠ "bad" — đó chỉ là direction của loop

**Cơ chế / Anatomy**:
- **4 Methods** (combinable):
  - Positive: **Reward Success** OR **Punish Failure** OR both
  - Negative: **Reward Failure** OR **Punish Success** OR both
- **Heads Up Poker** = zero-sum: 1 player thắng tiền, 1 thua → cùng action vừa reward success vừa punish failure (positive loop)
- Pitfalls:
  - **Runaway positive loop**: game decided early, late-game decisions meaningless (Monopoly endgame: leader has all property, others bankrupt → no recovery)
  - **Demotivating negative loop**: punish player cho việc strive toward stated goal (rubber-band AI gây frustration vì player skill không matter)
  - **Endgame drought**: WoW max level — designer hết content, không còn meaningful reward (positive loop chạm trần)
  - **Mixed signal**: stated goal "win race" nhưng negative loop "leader gets bombed" → contradicting message
- Fixing strategies:
  - **Pair positive with negative**: RPG level up + monster level up song song (D&D scaling)
  - **Decouple reward from power**: FarmVille harvester là cosmetic, không feed XP loop
  - **Salary cap analog** (NFL pattern): limit accumulation
  - **Endgame loops separately designed**: raids, PvP rankings, cosmetics chứ không leveling

**Áp dụng khi thiết kế**:
- Map mọi feedback loop trong concept: liệt kê positive và negative, mark intensity
- Nếu positive loop có growth rate > linear → high risk runaway → pair với negative
- Decouple cosmetic reward (skin, title, badge) from power (level, XP, damage) để tránh runaway
- Negative feedback phải align với player goals, không contradict (rubber-band AI bad; competitive matchmaking good)
- Plan endgame ngay từ concept: khi player chạm cap, loop nào còn engaging?

**Câu hỏi kiểm tra**:
- Có bao nhiêu positive loops? Negative loops?
- Có loop nào exponential growth không (red flag)?
- Reward có tách khỏi power không?
- Negative feedback có align với player goals không?
- Endgame có content không hay drought?

**Liên kết**:
- See also: [H4.1 Pair Feedback Loops](#h4-1), [H4.2 Decouple Reward from Power](#h4-2), [§3.4 Feedback Loop Pitfalls](#feedback-pitfalls)

### §1.11. Milieu & Player Types {#milieu}

**Nguồn**: "Players Making Decisions" Ch.14 — pages 152-162

**Định nghĩa cốt lõi**:
- **Milieu**: tập hợp personal/social/cultural assumptions player mang vào game. Cùng mechanics có thể tạo dynamics + aesthetics khác nhau với players từ milieu khác nhau.
- Mechanic không tồn tại trong vacuum — context matters
- **Polish** (Swink): "any effect that creates nonessential cues about physical properties through interaction" — không thiết yếu cho gameplay nhưng tạo aesthetic
- Hai mô hình player profiling: **Bartle's Player Types** (4 suits) và **OCEAN/Five Domains of Play** (5 dimensions)

**Cơ chế / Anatomy**:
- **Genocide Tetris example** (Koster): mechanics giống Tetris hoàn toàn, nhưng theme là "stack human bodies" → milieu changed → player phản ứng khác hẳn (disgust thay vì satisfaction)
- **Super Columbine Massacre RPG!** vs Final Fantasy VI: mechanic JRPG identical, milieu khác → media reaction (controversy vs acclaim)
- **Spent** (playspent.org): cùng mechanic Lemonade Stand-style economy, nhưng milieu poverty → aesthetic of sympathy/empathy (educational về homelessness)
- **Polish examples**:
  - **Resident Evil stair-climbing animation**: thay vì loading screen, dùng animation lên thang dài → mechanical polish (mask load) + thematic polish (build dread)
  - **Polish có thể thematic** (theme/narrative cues) **và/hoặc mechanical** (game feel, juicy feedback)
- **Bartle's Player Types** (1996, MUD research, suit metaphor):
  - **HEARTS (Socializers)**: chơi để chia sẻ trải nghiệm với người khác — guild chat, co-op
  - **DIAMONDS (Achievers)**: chơi để hoàn thành/master — leaderboards, achievements, badges
  - **CLUBS (Killers)**: chơi để show mastery qua defeat opponents — PvP, ranked
  - **SPADES (Explorers)**: chơi để khám phá — biết hết mọi thứ về system, lore, secrets
- **OCEAN Personality Model → Vandenberghe's Five Domains of Play** (5-factor):
  - **Openness → Novelty**: Minecraft (high) vs Madden NFL (low novelty)
  - **Conscientiousness → Challenge**: Dark Souls (high) vs Lego Star Wars (low)
  - **Extroversion → Stimulation**: Just Dance (high) vs Flower (low)
  - **Agreeableness → Harmony**: Street Fighter IV (low harmony) vs LittleBigPlanet (high)
  - **Neuroticism → Threat**: Peggle (low threat) vs League of Legends (high)

**Áp dụng khi thiết kế**:
- Trước khi chọn mechanic, profile target audience theo Bartle/OCEAN
- Match mechanic family với dominant player type:
  - Achievers → progression systems, leaderboards
  - Socializers → guild, co-op, trading
  - Killers → PvP, ranked
  - Explorers → lore, hidden content, sandbox
- Verify polish (theme, art, sound) match milieu của target audience — không chỉ mechanic
- Test với target audience thật, không assume; cùng mechanic có thể fail với audience khác milieu (Spent, Genocide Tetris)
- Polish mở rộng aesthetic; đầu tư polish vào điểm contact với milieu của audience

**Câu hỏi kiểm tra**:
- Target audience profile theo Bartle/OCEAN là gì?
- Mechanic có match dominant player type không?
- Theme/polish có phù hợp milieu không?
- Có giả định cultural nào unstated không (sẽ alienate audience khác)?
- Polish ưu tiên ở đâu — theme hay game feel?

**Liên kết**:
- See also: [H1.5 Match Mechanic to Milieu](#h1-5), [H4.5 Polish via Nonessential Cues](#h4-5)

---

## §2. Decision Heuristics

### §2.1. Concept Phase Heuristics {#h-concept-phase}

Áp dụng khi đang định hình ý tưởng tổng — chưa có core loop chi tiết.

#### H1.1: Fundamental Game Design Directive {#h1-1}
- **Rule**: Mọi quyết định design (mechanic, randomness, balance, polish) phải ĐẨY player gần flow.
- **Why**: Đây là "fundamental directive" của Hiwiller — flow là metric chung của hầu hết heuristics game design khác (xem [§1.1](#flow-directive)).
- **How to apply**:
  - Với mỗi feature đề xuất, hỏi: "Feature này tăng/giảm flow cho target audience?"
  - Khi tradeoff giữa 2 mechanics, chọn cái phục vụ flow tốt hơn
- **Red flag**: Feature designer thấy "cool" nhưng không nâng flow → khả năng cao là vanity feature.

#### H1.2: Identify the Aesthetic First (MDA Reverse) {#h1-2}
- **Rule**: Bắt đầu thiết kế từ Aesthetics mong muốn → Dynamics cần emerge → Mechanics nào tạo ra dynamics đó.
- **Why**: Designer chỉ điều chỉnh được Mechanics, nhưng player trải nghiệm A→D→M (xem [§1.6](#mda)). Nếu thiết kế xuôi M→D→A, dễ ra mechanic ngẫu nhiên không hội tụ về aesthetic mong muốn.
- **How to apply**:
  - Viết Aesthetic statement: 1-3 từ trong 8 Kinds of Fun (sensation/fellowship/challenge...)
  - List Dynamics nào sẽ tạo aesthetic đó
  - Reverse-engineer Mechanics nào sinh ra dynamics
- **Red flag**: Concept có mechanic-list dài nhưng aesthetic mơ hồ ("it'll be fun!").

#### H1.3: Match Player Agency to Audience {#h1-3}
- **Rule**: Casual → ít agency, automate decisions player không quan tâm. Hardcore → nhiều agency, expose simulation depth.
- **Why**: More agency ≠ better. NBA Live (high agency) frustrates casual; NBA Street (low agency) bores hardcore (xem [§1.2](#agency)).
- **How to apply**:
  - List target audience profile (Bartle/OCEAN — xem [§1.11](#milieu))
  - List decision points trong core loop, đánh dấu cái nào player target sẽ care
  - Automate cái không care (SimCity trash schedule pattern)
- **Red flag**: Casual game có > 10 decision points/turn; hardcore game < 3 decision points/turn.

#### H1.4: Define Goal Hierarchy Early {#h1-4}
- **Rule**: Trước khi viết mechanics, định nghĩa Object of Game → Medium-term goals → Short-term goals.
- **Why**: Goals drive decisions. Nếu goals mơ hồ, decisions sẽ meaningless (xem [§1.5](#goals)).
- **How to apply**:
  - Viết 1 Object of Game (concrete, achievable, rewarding)
  - List 3-5 Medium-term goals support Object
  - List 5-15 Short-term goals support Medium-term
  - Verify mỗi mechanic phục vụ ít nhất 1 short-term goal
- **Red flag**: Concept có "core loop" nhưng không có Object rõ ràng → game sẽ aimless.

#### H1.5: Match Mechanic to Player Milieu {#h1-5}
- **Rule**: Nắm OCEAN/Bartle profile của target audience trước khi chọn mechanic family.
- **Why**: Cùng mechanic có thể fail với audience milieu khác (Genocide Tetris, Spent — xem [§1.11](#milieu)).
- **How to apply**:
  - Map target audience đến 1-2 OCEAN dimensions chính
  - Chọn mechanic match: Openness→novelty mechanics (sandbox); Conscientiousness→challenge mechanics; etc.
  - Verify polish (theme, art, sound) match milieu — không chỉ mechanic
- **Red flag**: Mechanic chosen "vì nó hot" without considering audience milieu.

### §2.2. Core Loop Phase Heuristics {#h-core-loop-phase}

Áp dụng khi đang định hình core loop chi tiết — đã xác định aesthetic + audience, đang lựa mechanics và decision points.

#### H2.1: Anatomy Check on Every Decision Point {#h2-1}
- **Rule**: Mỗi decision point phải có đủ 5 yếu tố — **Before** (context/state), **Communication** (player biết choice tồn tại), **Action** (cơ chế thực hiện), **Consequences** (kết quả game state), **Feedback** (player biết kết quả).
- **Why**: Đây là diagnostic framework — symptom maps to which aspect (xem [§1.3](#anatomy-choice)). Không có 5 yếu tố thì không thể chẩn đoán khi playtest fail.
- **How to apply**:
  - Liệt kê tất cả decision points trong core loop
  - Vẽ table 5 cột (Before/Communication/Action/Consequences/Feedback) × N rows (decision points)
  - Fill mỗi cell, ô empty là red flag → cần thiết kế lại
- **Red flag**: Player confused → **Communication** thiếu; meaningless → **Consequences** thiếu; frustrated → **Action** awkward; "did it work?" → **Feedback** thiếu.

#### H2.2: Apply Trade-off Pattern {#h2-2}
- **Rule**: Mỗi option trong choice phải có **benefit + drawback** so với options khác.
- **Why**: Nếu có option dominant, decision sẽ obvious. **Trade-off** forces opportunity cost — player phải cân nhắc thay vì calculate (xem [§1.3](#anatomy-choice)).
- **How to apply**:
  - List options của decision
  - Cho mỗi option, ghi 1 dòng "Pros: X / Cons: Y" so với các options khác
  - Nếu có option chỉ có Pros (không Cons), redesign — đó là dominant strategy
- **Red flag**: Option "tốt nhất" đối với mọi tình huống → dominant strategy [AP2.6](#ap2-6).

#### H2.3: Apply Risk/Reward Pattern {#h2-3}
- **Rule**: Cặp options có **certainty/payoff** trade-off — high certainty/low payoff vs low certainty/high payoff.
- **Why**: Risk creates anticipation → engagement. Near-miss psychology là motor cảm xúc cốt lõi (xem [§1.1](#flow-directive)).
- **How to apply**:
  - Donkey Kong route B (risky shortcut) vs route C (safe long path)
  - Let's Make A Deal mystery prize: certain $500 vs door với 1/3 cơ hội $5000
  - Add risky shortcut hoặc gamble option vào core loop
- **Red flag**: Game có 0 risk option — player chỉ cần optimal play, no anticipation.

#### H2.4: Use Expected Value Analysis {#h2-4}
- **Rule**: Options có **EV (Expected Value)** gần nhau → choice interesting; EV chênh lệch lớn → obvious.
- **Why**: EV = Σ(P × payoff). Player rational tendency chọn high EV (dù có biases — xem book Ch.26 về cognitive biases).
- **How to apply**:
  - Tính EV mỗi option
  - Mục tiêu: EV cách nhau < 20%
  - Adjust drop rate / cost / payoff để cân bằng
- **Red flag**: 1 option EV cao gấp 2x options khác → others sẽ bị bỏ.

#### H2.5: Eliminate Decisions Player Doesn't Care About {#h2-5}
- **Rule**: Decision player không quan tâm → automate (SimCity trash schedule pattern).
- **Why**: **Player Agency** ở nơi không cần = noise (xem [§1.2](#agency)). More agency ≠ better.
- **How to apply**:
  - Playtest với question "Did this decision feel meaningful?" sau mỗi action
  - Automate những "no" responses
  - SimCity ví dụ: trash collection schedule auto vì không player nào hứng thú
- **Red flag**: Tutorial buộc player make decision rồi nói "this doesn't matter" → automate ngay.

#### H2.6: Avoid Orphaned Verbs {#h2-6}
- **Rule**: Mỗi **verb** player có phải kết nối với verbs/mechanics khác.
- **Why**: **Orphaned verb** = unused capability, complexity tax không có payoff (xem [§1.8](#rules-verbs)).
- **How to apply**:
  - List all verbs player có
  - Cho mỗi verb, ghi 2-3 verb khác nó tương tác với
  - Nếu chỉ tương tác với 0-1, candidate orphan → reuse existing verb thay vì add new
- **Red flag**: Verb chỉ dùng ở 1 mechanic → cân nhắc dùng verb sẵn có thay vì add new.

### §2.3. Mechanics & Balance Phase Heuristics {#h-mechanics-balance-phase}

Áp dụng khi tinh chỉnh giá trị numeric, balance, randomness, rules.

#### H3.1: Pick Right Numeric Relationship {#h3-1}
- **Rule**: Match relationship type to design intent — Flat / Linear / Linear Inverse / Triangular / Fibonacci / Exponential (xem [§1.9](#balance)).
- **Why**: Wrong relationship phá scaling. Exponential cho player resource → game break sớm; Linear cho difficulty → boring late game.
- **How to apply**:
  - Define design intent: "I want gap to grow slowly" → Triangular; "I want explosive cost increase" → Exponential
  - Verify edge values (x=0, x=max) match expectation
  - Common: Triangular cho XP requirements, Linear cho damage scaling
- **Red flag**: Dùng Exponential cho resource player accumulate → game break.

#### H3.2: Test Extremes First {#h3-2}
- **Rule**: Luôn test formula với input cực đại / cực tiểu / lucky-streak / unlucky-streak trước khi test mid-range.
- **Why**: Mid-range thường ổn; bugs ẩn ở extremes (xem [§1.9](#balance)). Player sẽ tìm và exploit chúng.
- **How to apply**:
  - Plug x=0, x=1, x=∞ vào formula
  - Simulate 100 lucky rolls liên tiếp + 100 unlucky rolls liên tiếp
  - Verify game vẫn playable, không crash, không degenerate
- **Red flag**: Formula chỉ test mid-range → break ở edges.

#### H3.3: Find "Good Enough", Not Perfect {#h3-3}
- **Rule**: Khi balance, dùng doubling/halving values cho convergence nhanh; nudging ±1 lãng phí playtest cycles.
- **Why**: Search space lớn; binary search converge nhanh hơn linear scan.
- **How to apply**:
  - Round 1: thử value 100. Quá mạnh? → 50. Quá yếu? → 200.
  - Round 2: thu hẹp range, halving step.
  - Stop khi "good enough" — last 5% tuning để post-launch live ops.
- **Red flag**: Đã 10 round playtest mà chưa converge → tăng step size.

#### H3.4: Limit Randomness Pre-Exposure {#h3-4}
- **Rule**: Random ở **setup**, deterministic **in-game** (Agricola pattern — xem [§1.7](#randomness)).
- **Why**: Random spike mid-game without player agency to mitigate → frustrating loss attribution.
- **How to apply**:
  - Reveal random elements early (board setup, starting cards)
  - Player có turns để plan around chúng
  - Avoid random damage spikes mid-combat without dodge/block options
- **Red flag**: Random spike mid-game without player agency to mitigate.

#### H3.5: Perceived Fairness > Actual Fairness {#h3-5}
- **Rule**: **Player chấp nhận thua do random kém hơn nhiều so với thua do rule.** Adjust perceived odds, không chỉ math odds.
- **Why**: Sid Meier 1:3 / 3:1 study (xem [§1.7](#randomness)) — players feel cheated khi 3:1 advantage thua, dù math fair. Phải tilt perceived odds in player favor.
- **How to apply**:
  - Civilization tilt: 3:1 advantage thực tế win > 75%
  - Show feedback that emphasizes player agency, hide unlucky rolls
  - Display "you have advantage" framing
- **Red flag**: Balanced theo math nhưng player feel cheated.

#### H3.6: Use Self-balancing Mechanisms {#h3-6}
- **Rule**: Auctions / supply-demand thay vì hard-code values cho large item sets.
- **Why**: Designer chỉ điều chỉnh được hữu hạn values; market mechanism scale tự nhiên (xem [§1.9](#balance)).
- **How to apply**:
  - Thay vì set 50+ giá cố định, dùng auction (Power Grid)
  - Resource pricing tự cân theo demand (Catch the Train)
- **Red flag**: Designer phải arbitrarily set 50+ giá trị → không scalable, dùng auction pattern.

#### H3.7: Make Rules Explicit/Unambiguous/Repeatable/Binding/Shared {#h3-7}
- **Rule**: 5 qualities Salen & Zimmerman — mọi rule phải đầy đủ (xem [§1.8](#rules-verbs)).
- **Why**: Rule có "hole" (ambiguous edge case) → player sẽ argue, lawyering thay vì play.
- **How to apply**:
  - Read each rule aloud, ask "What if X edge case?"
  - Test với cold subjects (chưa biết game) để spot ambiguity
  - Verify rule binding — không có "house rule" override path mặc định
- **Red flag**: Rule có "win/no-win" hole → players sẽ argue.

### §2.4. Polish & Iteration Phase Heuristics {#h-polish-iteration-phase}

Áp dụng khi core loop đã solid, đang polish + tune feedback loops + interest curve.

#### H4.1: Pair Positive Feedback with Negative {#h4-1}
- **Rule**: Nếu **positive loop** out of control, pair với **negative loop** để cân bằng (xem [§1.10](#feedback-loops)).
- **Why**: Positive loop cô lập → leader pulls away exponentially → game decided early. RPG level up + monster level up tăng cùng để keep challenge constant.
- **How to apply**:
  - Identify positive loops (success → more resources → more success)
  - Add counter-negative: leader takes upkeep cost, hoặc enemies scale to player level
  - Mario Kart blue shell pattern (negative feedback target leader)
- **Red flag**: Leader gain advantage exponentially → game decided early.

#### H4.2: Decouple Reward from Power {#h4-2}
- **Rule**: Reward player với cosmetic/tangential things, không affect future success.
- **Why**: Every reward feed back into power loop = runaway positive (xem [§1.10](#feedback-loops)). Decoupling cho phép reward sustain motivation mà không break balance.
- **How to apply**:
  - FarmVille harvester: cosmetic upgrade, không tăng harvest rate
  - Cosmetic skins, titles, achievements thay vì +damage gear
  - Side rewards (collectibles) tách khỏi main progression
- **Red flag**: Every reward feeds back into power loop → runaway.

#### H4.3: Map Interest Curve via Playtest {#h4-3}
- **Rule**: Survey player at random points (1-10 scale "How interested are you right now?") trong playtest, build curve, fix dips.
- **Why**: **Interest Curve** (xem [§1.4](#interest-curve)) phải climb với mini-peaks. Extended dips = quit risk.
- **How to apply**:
  - Random interrupt mỗi 5-10 phút playtest, hỏi 1-10
  - Plot curve, identify dips
  - Fix dips bằng add event / mini-climax / pacing change
- **Red flag**: Extended periods of low interest sau climax → save event for climax.

#### H4.4: Mini-Climaxes Before Big Payoff {#h4-4}
- **Rule**: Cho player taste payoff sớm để vượt qua **Learning Curve** dài (Portal pattern — xem [§1.4](#interest-curve)).
- **Why**: 1+ giờ tutorial trước first payoff → player quit. Mini-climax giữ engagement qua learning phase.
- **How to apply**:
  - Portal: solve simple puzzle ngay sau 5 phút, nếm thắng lợi trước khi puzzle phức tạp
  - Cho ability sớm, then deepen mechanic later
- **Red flag**: 1+ giờ tutorial trước first payoff → quit risk.

#### H4.5: Polish via Nonessential Cues {#h4-5}
- **Rule**: **Polish** phục vụ aesthetic, không gameplay-essential. Nonessential cues (animation, sound, visual flourish) tăng feel mà không thay đổi mechanics.
- **Why**: Polish tăng perceived quality + immersion (xem [§1.11](#milieu)). Resident Evil stair-walk animation thay loading screen → maintain immersion.
- **How to apply**:
  - Add nonessential animations (door open, character idle)
  - Sound design cho mọi action quan trọng
  - Visual feedback (particle, screenshake) cho impact moments
- **Red flag**: Game looks "complete" nhưng feel cheap → nonessential cues thiếu.

#### H4.6: Always Underestimate Player Skill in Long Run {#h4-6}
- **Rule**: Assume ≥1 player sẽ break system fully. YouTube tutorials reveal exploit ngày 1.
- **Why**: Aggregate playtime của playerbase >> designer. "No one would do this" assumption fails at scale.
- **How to apply**:
  - Test mọi exploit hypothesis bạn nghĩ ra
  - Test các exploit bạn KHÔNG nghĩ ra (cold playtest)
  - Hard cap những vector có thể abuse (max stat, max stack)
- **Red flag**: "No one would do this" assumption → đó chính là exploit player sẽ tìm.

---

## §3. Anti-patterns

### §3.1. Less-Interesting Decisions {#less-interesting}

Anti-patterns liên quan đến decision points yếu hoặc giả tạo. Mỗi pattern dùng template: **Triệu chứng / Tại sao tệ / Ví dụ / Cách fix**.

#### AP1.1: Blind Decisions {#ap1-1}
- **Triệu chứng**: Player không có cơ sở để chọn — buộc decide trước khi có info.
- **Tại sao tệ**: Random pick = no skill expression, agency illusory (xem [§1.2](#agency)).
- **Ví dụ**: RPG character creation đầu game ("Human/Elf/Dwarf?" khi player chưa biết game work thế nào).
- **Cách fix**: Make decision reversible OR turn into informed (tutorial cho try all races trước khi commit) → see [H2.1](#h2-1).

#### AP1.2: Obvious Decisions {#ap1-2}
- **Triệu chứng**: 1 lựa chọn rational duy nhất; option khác strictly inferior.
- **Tại sao tệ**: Decision vô nghĩa khi player nhận ra; novice may engage temporarily nhưng experienced player skip.
- **Ví dụ**: Tic-Tac-Toe sau khi strategy được hiểu; Hobson's Choice ("Do X hoặc thua game"); Monopoly Income Tax (10% vs $200 — math obvious cho mọi state).
- **Cách fix**: Automate (gun reload pattern — player không cần choose to reload nếu always optimal) OR add trade-off → see [H2.2](#h2-2).

#### AP1.3: Meaningless Decisions {#ap1-3}
- **Triệu chứng**: Result không thay đổi game state.
- **Tại sao tệ**: Disrespects player time + agency; player nhận ra fakery sẽ disengage.
- **Ví dụ**: RPG "Will you accept the quest?" khi "No" force re-prompt cho đến khi player chọn "Yes".
- **Cách fix**: Remove decision OR make consequences real (cho "No" branch dẫn đến alternative quest).

#### AP1.4: After-the-fact Meaningless {#ap1-4}
- **Triệu chứng**: Có ý nghĩa lúc chọn, nhưng sau mới biết là vô nghĩa.
- **Tại sao tệ**: Player không thể learn từ decisions; demotivates future engagement.
- **Ví dụ**: Blackjack hit/stay khi opponent có hand đã guarantee win regardless; play caller trong football khi defense quá mạnh nên mọi play đều fail.
- **Cách fix**: Hard to fix structurally; tăng signal trước choice (probabilistic info, scouting, partial reveal).

#### AP1.5: Misleading Decisions {#ap1-5}
- **Triệu chứng**: Game đi ngược lại lựa chọn của player để force narrative.
- **Tại sao tệ**: Phá player trust; agency revealed as illusion.
- **Ví dụ**: "No, I won't save kingdom" → game cho monster phá nhà player → force quest anyway.
- **Cách fix**: Remove illusion of choice; force narrative without fake decision (cinematic reveal thay vì faux dialogue).

#### AP1.6: Handcuffing Decisions {#ap1-6}
- **Triệu chứng**: Action loại bỏ phần lớn agency của players khác.
- **Tại sao tệ**: Other players "have nothing to do"; multi-player engagement collapse.
- **Ví dụ**: Guillotine "Callous Guards" card; Skip Turn cards; Monopoly Jail (long stretch không action).
- **Cách fix**: Limit duration/scope của handcuff; ensure handcuffed player still has minor decisions hoặc passive interactions.

#### AP1.7: Illusion of Choice {#ap1-7}
- **Triệu chứng**: Game offer decisions but all paths lead to same outcome.
- **Tại sao tệ**: Replay reveals fakery → trust collapse; agency feels hollow.
- **Ví dụ**: Many narrative-focused games; replaying reveals same path regardless of dialogue choices.
- **Cách fix**: Either commit to branching (Telltale Walking Dead intentional mix of meaningful + meaningless dialogue) OR drop choice (linear narrative is honest).

### §3.2. Bad Dynamics {#bad-dynamics}

Anti-patterns ở **Dynamics** layer của MDA — emerge từ mechanics khi player exploit hoặc gaps trong design.

#### AP2.1: Turtling {#ap2-1}
- **Triệu chứng**: Player gain more by doing nothing — defensive stance dominant strategy.
- **Tại sao tệ**: Game grinds to halt; nobody attacks vì attacker disadvantaged.
- **Ví dụ**: RTS without upkeep cost — player turtle, accumulate resources, never attack.
- **Cách fix**: Add upkeep cost on idle units; add glory/score bonus cho aggressive play; add map shrinkage forcing engagement.

#### AP2.2: Camping {#ap2-2}
- **Triệu chứng**: Tactically superior position + không buộc move khỏi vị trí.
- **Tại sao tệ**: Camper degrades game cho opponents; reduces dynamic play.
- **Ví dụ**: FPS sniper điểm cao không có incentive di chuyển; chess fortress positions.
- **Cách fix**: Add positional decay (poison gas zone), mobile objectives (capture-point rotation), time pressure forcing movement.

#### AP2.3: Kingmaking {#ap2-3}
- **Triệu chứng**: Player không thể thắng nhưng quyết định ai thắng giữa các player còn lại.
- **Tại sao tệ**: Eliminated player wields outsized influence; original strategy made meaningless.
- **Ví dụ**: Risk endgame — player bị suy yếu chọn ai họ muốn giúp thắng; Diplomacy.
- **Cách fix**: Hidden victory points / hidden roles / random disruption; ensure all decisions tied to own win condition.

#### AP2.4: Button Mashing {#ap2-4}
- **Triệu chứng**: Random button press có thể thắng — không có skill differentiation.
- **Tại sao tệ**: Skill irrelevant; meaningful choice collapse.
- **Ví dụ**: Rock-Paper-Scissors original (random equally good).
- **Cách fix**: Add risk to every move (Rock-Paper-Scissors v2 với scissors có rare instant-loss); add cost cho action không nghĩ.

#### AP2.5: Grinding {#ap2-5}
- **Triệu chứng**: Repeated play without meaningful decisions — same action loop endlessly.
- **Tại sao tệ**: Engagement ≠ fun; player burnout, sense of waste of time.
- **Ví dụ**: MMO XP grinding zones; mobile farming loops without strategic choice.
- **Cách fix**: Add content variety; or accept grind as feature with **decoupled reward** (cosmetic/title) — see [H4.2](#h4-2).

#### AP2.6: Dominant Strategy {#ap2-6}
- **Triệu chứng**: 1 strategy luôn tốt hơn — others strictly inferior.
- **Tại sao tệ**: All decisions collapse to "pick dominant"; depth illusory.
- **Ví dụ**: Settlers of Catan early "buy development cards" exploit (pre-balance patches).
- **Cách fix**: Increase cost / lower effect / buff alternatives; verify EV similar across strategies — see [H2.2](#h2-2), [H2.4](#h2-4).

### §3.3. Goal Problems {#goal-problems}

Anti-patterns liên quan đến **Goals** — vague, mistargeted, hoặc undermined.

#### AP3.1: Vague Goals {#ap3-1}
- **Triệu chứng**: Goal không **concrete + measurable** — "Learn the basics" thay vì "Complete tutorial level 1".
- **Tại sao tệ**: Player không biết khi nào achieved → no satisfaction; no clear path forward (xem [§1.5](#goals)).
- **Ví dụ**: Tutorial mục tiêu "Get familiar with combat"; sandbox không có clear win condition.
- **Cách fix**: Rewrite goals as concrete + measurable — "Defeat 3 training dummies"; "Reach level 5"; "Build a house with 4 walls and roof".

#### AP3.2: Strategy Mistaken for Goal {#ap3-2}
- **Triệu chứng**: Game trình bày HOW (strategy) như là WHAT (goal).
- **Tại sao tệ**: Confuses player; "use light to your advantage" không phải goal — goal là "survive the night".
- **Ví dụ**: Alan Wake "Use light to your advantage" instructions trình bày như goals.
- **Cách fix**: Distinguish "what player works toward" (goal) vs "how to do it" (strategy/tactic). Goal first, strategy as hint.

#### AP3.3: Players Set Counter-Goals {#ap3-3}
- **Triệu chứng**: Player ignore designer goals, set goals của riêng họ — griefers, subversion.
- **Tại sao tệ**: Designer's vision broken; community split.
- **Ví dụ**: Desert Bus subversion (designer "drive bus", players turn into endurance challenge); MMO griefers in PvE servers.
- **Cách fix**: Provide goals players actually want (player research first); or accept counter-goals (Desert Bus turned into charity event).

#### AP3.4: Steep Learning Curve Before First Payoff {#ap3-4}
- **Triệu chứng**: Player phải học rất nhiều trước khi nhận reward đầu tiên.
- **Tại sao tệ**: Quit risk extreme; only niche tolerates (xem [§1.4](#interest-curve)).
- **Ví dụ**: Dwarf Fortress pattern — 10+ giờ học trước first satisfying gameplay loop.
- **Cách fix**: Mini-climaxes (Portal pattern — see [H4.4](#h4-4)); reduce learning amount; OR cater to long-tolerance niche intentionally.

### §3.4. Feedback Loop Pitfalls {#feedback-pitfalls}

Anti-patterns liên quan đến **Feedback Loops** — runaway, demotivating, hoặc misaligned (xem [§1.10](#feedback-loops)).

#### AP4.1: Runaway Positive Loop {#ap4-1}
- **Triệu chứng**: Success → more resources → more success, exponential without check.
- **Tại sao tệ**: Leader pulls away; game decided early; remaining play is foregone conclusion.
- **Ví dụ**: Mafia Wars Mega Casinos exponential cash gain pre-balance; Monopoly late-game dominance.
- **Cách fix**: Pair with negative loop (RPG enemy scaling); decouple reward from power (cosmetic) — see [H4.1](#h4-1), [H4.2](#h4-2).

#### AP4.2: Demotivating Negative Loop {#ap4-2}
- **Triệu chứng**: Negative feedback quá mạnh → punish leader excessively → quit incentive.
- **Tại sao tệ**: Skill irrelevant; leading position becomes liability; rage quit.
- **Ví dụ**: Mario Kart blue shell extreme cases (close finish line); rubber-band AI cheating.
- **Cách fix**: Tune intensity; ensure negative feedback align with player goals (not punish success of stated goal); add counter-counter (item shielding).

#### AP4.3: Endgame Drought {#ap4-3}
- **Triệu chứng**: Reach max progression, no meaningful rewards remain.
- **Tại sao tệ**: Long-term retention collapse; "what now?" feeling.
- **Ví dụ**: WoW max level pre-raid content; reaching credits in story-only games with no NG+.
- **Cách fix**: Design endgame loops separately (raids, PvP rankings, cosmetics, prestige systems).

#### AP4.4: Mixed Signal Negative Feedback {#ap4-4}
- **Triệu chứng**: Punish thành công đi ngược stated goal — reward and punishment contradict directive.
- **Tại sao tệ**: Player confused; can't tell what designer wants; learning impossible.
- **Ví dụ**: Game says "score points" but punishes scoring; "save civilians" but penalizes time spent saving.
- **Cách fix**: Ensure feedback doesn't contradict directive given to player; align reward/punishment with goal hierarchy.

### §3.5. Ineffective Puzzles {#ineffective-puzzles}

Anti-patterns đặc thù của puzzle design — failure modes khiến puzzle frustrating thay vì satisfying.

#### AP5.1: Incomplete Critical Information / Missed Assumptions {#ap5-1}
- **Triệu chứng**: Designer biết solution sẵn → blind to missing context cho player.
- **Tại sao tệ**: Player không có info để suy luận; stuck mà không biết why.
- **Ví dụ**: Adventure game puzzles requiring obscure knowledge designer assumed player has.
- **Cách fix**: Playtest với cold subjects, "think aloud" protocol — reveal assumption gaps.

#### AP5.2: Lack of Ability to Experiment {#ap5-2}
- **Triệu chứng**: Player không thể manipulate puzzle pieces để form hypothesis.
- **Tại sao tệ**: Forced trial-and-error mà không có feedback.
- **Ví dụ**: Key trước door (Spector's rule violation) — player gặp key không biết door nào, gặp door không có key.
- **Cách fix**: Door first, then key — make hypothesis formation possible. Show problem first, then provide tools.

#### AP5.3: Brute Force Solution Only {#ap5-3}
- **Triệu chứng**: Solution duy nhất là exhaust all possibilities.
- **Tại sao tệ**: No skill expression; tedium thay vì insight.
- **Ví dụ**: "Number 1-100" guessing without hints; memory match games trước reveal pattern.
- **Cách fix**: Provide reasoning hooks beyond exhaustion — partial info, narrowing clues.

#### AP5.4: Triviality Surrounded by Complexity {#ap5-4}
- **Triệu chứng**: Puzzle looks complex nhưng solution trivial; complexity là red herring.
- **Tại sao tệ**: Time wasted on parsing decoration; "aha" moment feels cheap.
- **Ví dụ**: Maze with simple wall-follow algorithm hiding behind elaborate visual; red herring puzzle elements.
- **Cách fix**: Ensure complexity is genuine, không decorative — every element should matter.

#### AP5.5: Lack of Possibility Space {#ap5-5}
- **Triệu chứng**: Only 1 valid path/solution.
- **Tại sao tệ**: Player không thể explore; agency illusory.
- **Ví dụ**: "1+1=???" — chỉ 1 answer.
- **Cách fix**: Design multiple solution paths or wider possibility space (open-ended puzzles).

#### AP5.6: Arbitrariness {#ap5-6}
- **Triệu chứng**: Multiple logical solutions but only 1 accepted.
- **Tại sao tệ**: Player feels arbitrarily wrong; loses trust in puzzle logic.
- **Ví dụ**: Drawing letter "R" trong specific pixel pattern game requires (different valid R's rejected).
- **Cách fix**: Accept all valid solutions OR constrain inputs more strictly so only intended solution is logical.

#### AP5.7: Riddles Without Breadcrumbs {#ap5-7}
- **Triệu chứng**: No way to reduce possibility space; pure guess.
- **Tại sao tệ**: Cannot iteratively converge; no progressive insight.
- **Ví dụ**: Cryptic riddles without context clues; "guess the word I'm thinking" without category.
- **Cách fix**: Add extrinsic hints (Layton hint coins) OR intrinsic structure (crossword cross-clues narrow letters).

### §3.6. Balance & Numeric Traps {#balance-traps}

Anti-patterns ở balance & math layer — hidden by mid-range testing, exposed at extremes.

#### AP6.1: Hidden Exponential Growth {#ap6-1}
- **Triệu chứng**: Exponential relationship vô tình áp dụng cho player resource.
- **Tại sao tệ**: Penny doubling 30 days = $10M — game break sớm; combo blow up uncontrollable.
- **Ví dụ**: Resource production multiplicative stacking; combo damage scaling without cap.
- **Cách fix**: Avoid exponential cho player resources; use **Triangular** instead — see [H3.1](#h3-1).

#### AP6.2: Symmetry Mistaken for Balance {#ap6-2}
- **Triệu chứng**: Designer assume "same starting position" = "balanced".
- **Tại sao tệ**: Symmetry không guarantee balance theo skill — Chess đối xứng nhưng champion vs novice không balanced.
- **Ví dụ**: Mirror-match mode trong unbalanced fighting game; identical starting deck unbalanced gameplay.
- **Cách fix**: Distinguish symmetry from balance; balance theo player satisfaction, không theo rule symmetry — see [§1.9](#balance).

#### AP6.3: Untested Extremes {#ap6-3}
- **Triệu chứng**: Formula chỉ test mid-range; break ở edges.
- **Tại sao tệ**: Player sẽ tìm và exploit extremes; "no one would do this" assumption fails (xem [H4.6](#h4-6)).
- **Ví dụ**: Damage formula tested level 10-50, fails at level 100 (overflow); luck multiplier untested at extreme streaks.
- **Cách fix**: Always test với x=0, x=∞, lucky-streak, unlucky-streak — see [H3.2](#h3-2).

---

## Appendix A: Concept Index

Bảng tra cứu nhanh **named-concept terms** → vị trí. Sort alphabetically.

> Index chỉ cover các thuật ngữ có tên định danh rõ (vd "Kingmaking", "Trade-off", "Press-Your-Luck") — không cover các AP có nhãn mô tả (vd "Runaway Positive Loop", "Hidden Exponential Growth" là descriptive labels, không phải named terms). Đối với danh sách đầy đủ anti-patterns, xem [§3.1](#less-interesting), [§3.2](#bad-dynamics), [§3.3](#goal-problems), [§3.4](#feedback-pitfalls), [§3.5](#ineffective-puzzles), [§3.6](#balance-traps).

| Thuật ngữ | Section chính | Liên quan |
|---|---|---|
| 8 Kinds of Fun | [§1.6](#mda) | H1.2 |
| Aesthetics (MDA) | [§1.6](#mda) | H1.2, AP2.* |
| Anatomy of a Choice (5 aspects) | [§1.3](#anatomy-choice) | H2.1, AP1.* |
| Bartle Player Types (HEARTS/DIAMONDS/CLUBS/SPADES) | [§1.11](#milieu) | H1.5 |
| Blind Decisions | [AP1.1](#ap1-1) | H2.1, §1.3 |
| Brute Force Puzzles | [AP5.3](#ap5-3) | §1.10 |
| Button Mashing | [AP2.4](#ap2-4) | §1.6, H2.4 |
| Camping | [AP2.2](#ap2-2) | §1.10 |
| Concrete/Achievable/Rewarding (Schell) | [§1.5](#goals) | H1.4 |
| Constitutive Rules | [§1.8](#rules-verbs) | H3.7 |
| Decoupled Reward | [H4.2](#h4-2) | §1.10, AP4.1 |
| Dominant Strategy | [AP2.6](#ap2-6) | H2.2, H2.4 |
| Drafting (randomness mitigation) | [§1.7](#randomness) | H3.4 |
| Dynamics (MDA) | [§1.6](#mda) | §3.2 |
| Endgame Drought | [AP4.3](#ap4-3) | §1.10 |
| Expected Value | [§1.3](#anatomy-choice) | H2.4 |
| Exponential Relationship | [§1.9](#balance) | AP6.1 |
| Extrinsic Breadcrumbs (puzzle) | [§1.4](#interest-curve) | AP5.7 |
| Fairness (perceived vs actual) | [§1.7](#randomness) | H3.5 |
| Feedback Loops (Positive/Negative) | [§1.10](#feedback-loops) | H4.1, AP4.* |
| Fibonacci Sequence | [§1.9](#balance) | H3.1 |
| Flow / Flow Channel | [§1.1](#flow-directive) | H1.1, H4.3 |
| Fundamental Game Design Directive | [§1.1](#flow-directive) | H1.1 |
| Goal Hierarchy (Short/Medium/Object) | [§1.5](#goals) | H1.4 |
| Grinding | [AP2.5](#ap2-5) | H4.2 |
| Handcuffing Decisions | [AP1.6](#ap1-6) | §1.2 |
| Hobson's Choice | [AP1.2](#ap1-2) | §1.3 |
| Illusion of Choice | [AP1.7](#ap1-7) | §1.2 |
| Implicit Rules | [§1.8](#rules-verbs) | H3.7 |
| Interest Curve | [§1.4](#interest-curve) | H4.3 |
| Kingmaking | [AP2.3](#ap2-3) | §1.10 |
| Learning Curve | [§1.4](#interest-curve) | AP3.4 |
| Linear Inverse Relationship | [§1.9](#balance) | H3.1 |
| Linear Relationship | [§1.9](#balance) | H3.1 |
| MDA Framework | [§1.6](#mda) | H1.2 |
| Meaningful Decision | [§1.2](#agency), [§1.3](#anatomy-choice) | H2.* |
| Meaningless Decisions | [AP1.3](#ap1-3) | §1.3 |
| Milieu | [§1.11](#milieu) | H1.5 |
| Mini-Climaxes | [H4.4](#h4-4) | §1.4 |
| Misleading Decisions | [AP1.5](#ap1-5) | §1.3 |
| OCEAN Personality (5-factor) | [§1.11](#milieu) | H1.5 |
| Object of the Game | [§1.5](#goals) | H1.4 |
| Obvious Decisions | [AP1.2](#ap1-2) | §1.3 |
| Operational Rules | [§1.8](#rules-verbs) | H3.7 |
| Orphaned Verbs | [§1.8](#rules-verbs) | H2.6 |
| Player Agency | [§1.2](#agency) | H1.3 |
| Polish (Swink) | [§1.11](#milieu) | H4.5 |
| Possibility Space | [AP5.5](#ap5-5) | §1.4 |
| Press-Your-Luck | [§1.6](#mda) | H2.3 |
| Punish Failure (feedback method) | [§1.10](#feedback-loops) | H4.1 |
| Reward Success (feedback method) | [§1.10](#feedback-loops) | H4.1 |
| Risk/Reward | [§1.3](#anatomy-choice) | H2.3 |
| Self-Balancing Mechanisms (Auctions, Supply/Demand) | [§1.9](#balance) | H3.6 |
| Symmetry vs Balance | [§1.9](#balance) | AP6.2 |
| Trade-off | [§1.3](#anatomy-choice) | H2.2 |
| Triangular Relationship | [§1.9](#balance) | H3.1 |
| Turtling | [AP2.1](#ap2-1) | §1.10 |
| Vague Goals | [AP3.1](#ap3-1) | §1.5 |
| Verbs (player actions) | [§1.8](#rules-verbs) | H2.6 |

---

## Appendix B: Decision Quality Scorecard

Template scoring 1 decision point trong GCD theo 5 dimension, mỗi dimension 0-2 điểm. Tổng /10. Dành cho `/game-concept-review` skill khi đánh giá chi tiết.

### Cách dùng
1. Trong GCD identify danh sách decision points trong core loop
2. Cho mỗi decision point, score theo 5 dimension dưới đây
3. Tổng /10. Decision points score ≤ 4 cần redesign.

### 5 Dimensions

**1. Player Agency** (0-2)
- 0: blind / forced / illusion of choice
- 1: có agency nhưng audience-mismatch (quá nhiều hoặc quá ít cho target)
- 2: agency đúng mức cho target audience

**2. Anatomy Completeness** (0-2)
- 0: thiếu ≥ 2 trong 5 yếu tố (Before/Communication/Action/Consequences/Feedback)
- 1: thiếu 1 yếu tố
- 2: đầy đủ cả 5

**3. Consequences Meaningfulness** (0-2)
- 0: meaningless / misleading / after-the-fact meaningless
- 1: có consequence nhưng minor / temporary
- 2: thay đổi game state đáng kể, affects future choices

**4. Decision Pattern Quality** (0-2)
- 0: obvious / dominant strategy / handcuffing
- 1: trade-off đơn giản hoặc risk/reward đơn giản
- 2: trade-off + EV gần nhau giữa options, multi-dimensional

**5. Flow Alignment** (0-2)
- 0: phá flow (frustrate hoặc trivial)
- 1: trung tính, không phá nhưng cũng không đẩy flow
- 2: explicitly serve flow (Fundamental Directive)

### Output Format

```
DECISION POINT: [tên]
1. Player Agency: __/2 — [lý do]
2. Anatomy Completeness: __/2 — [lý do]
3. Consequences Meaningfulness: __/2 — [lý do]
4. Decision Pattern Quality: __/2 — [lý do]
5. Flow Alignment: __/2 — [lý do]
TOTAL: __/10

Verdict: [Excellent ≥9 / Good 7-8 / Acceptable 5-6 / Needs Redesign ≤4]
Recommendations: [bullet list của improvements ưu tiên]
```

---

## Appendix C: Quick Reference Cards

16 compact summaries (1 paragraph mỗi cái) cho concepts dùng nhiều nhất. Skill load Appendix C khi cần ngữ cảnh ngắn gọn không cần full §1 section.

**MDA**: Mechanics → Dynamics → Aesthetics. Designer chỉ điều chỉnh Mechanics; Dynamics và Aesthetics emerge. Descriptive system, không phải normative. Designer thiết kế từ Aesthetics ngược về Mechanics.

**Anatomy of a Choice (5 aspects)**: Before (context/state) → Communication (player biết choice) → Action (cơ chế chọn) → Consequences (kết quả game state) → Feedback (player biết kết quả). Diagnostic framework: confused → check Communication; meaningless → check Consequences; frustrated → check Action.

**Trade-off**: Option A có benefit X + drawback Y vs Option B có benefit Y + drawback X. Mỗi option phải có cả 2 mặt; nếu không, decision sẽ obvious một chiều. Opportunity cost framing.

**Risk/Reward**: Cặp options certainty cao/payoff thấp với certainty thấp/payoff cao. Risk creates anticipation. Time-shifting variant: short-term safe vs long-term risky.

**Expected Value**: EV = Σ(probability × payoff). Options có EV gần nhau → choice interesting. EV chênh lệch lớn → option dominant.

**Player Agency**: Khả năng player tác động game state. More agency ≠ better. Match agency level với target audience. Automate decisions player không quan tâm (SimCity trash schedule).

**Flow / Fundamental Directive**: Trạng thái balance giữa challenge và skill. Mọi quyết định design phải đẩy player gần flow. Mini-climaxes pattern để mitigate steep learning curves.

**Goals (Schell)**: Concrete + Achievable + Rewarding. Hierarchy: Short-term → Medium-term → Object of the Game. Strategy ≠ Goal.

**Randomness Spectrum**: Pure random → Mitigated → Pure skill. Perceived fairness > actual fairness. Drafting pattern: random deal → player choose → pass remaining.

**Bartle Types**: HEARTS (socializers), DIAMONDS (achievers), CLUBS (killers), SPADES (explorers). Match mechanic family to dominant type in target audience.

**OCEAN → Five Domains of Play**: Openness→Novelty, Conscientiousness→Challenge, Extroversion→Stimulation, Agreeableness→Harmony, Neuroticism→Threat.

**Feedback Loops**: Positive (success breeds success — rich richer) vs Negative (hinder leader). Methods: reward success/punish failure (positive), reward failure/punish success (negative). Pair them OR decouple reward from power.

**Numeric Relationships**: Flat (constant), Linear (k·x+m), Linear Inverse (m-k·x), Triangular (gap grows), Fibonacci, Exponential (k·x^m). Match relationship to design intent. Avoid exponential for player resources.

**Less-Interesting Decisions** (7 patterns): Blind (no info), Obvious (1 rational choice), Meaningless (no state change), After-the-fact Meaningless (Blackjack-style — meaningful at choice time, revealed irrelevant after), Misleading (game contradicts choice), Handcuffing (skip turn / lock options), Illusion of Choice (multiple paths same outcome). Diagnose with Anatomy of a Choice.

**Bad Dynamics**: Turtling, Camping, Kingmaking, Button Mashing, Grinding, Dominant Strategy. Often emerge from missing risk/cost on action.

**Puzzle Design Pitfalls**: Incomplete info, no experiment ability, brute force only, triviality wrapped in complexity, lack of possibility space, arbitrariness, no breadcrumbs. Spector rule: door before key.
