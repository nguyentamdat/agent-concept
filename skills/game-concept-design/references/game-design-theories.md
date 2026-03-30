# 12 Lý Thuyết Game Design

Knowledge base cho skill game-concept-design. Mỗi lý thuyết gồm: Định nghĩa → Áp dụng → Câu hỏi kiểm tra.

Nguồn: "Players Making Decisions" (Zack Hiwiller) và "A Theory of Fun for Game Design" (Raph Koster).

---

## 1. MDA Framework (Mechanics, Dynamics, Aesthetics)

**Nguồn**: Hunicke, LeBlanc, Zubek (2004) / Players Making Decisions Ch.13

**Định nghĩa**:
- **Mechanics**: Luật chơi, rules — thứ DUY NHẤT designer trực tiếp điều chỉnh được. Từ mechanics alone, người khác phải có thể reconstruct game.
- **Dynamics**: Hành vi "runtime" khi player tương tác với mechanics. Không được viết trong rules nhưng emerge từ rules. Ví dụ: trong Chess, hy sinh pawn để bắt queen không phải rule nhưng là dynamic emerge từ rules.
- **Aesthetics**: Phản hồi cảm xúc — trải nghiệm emotional mà game tạo ra. LeBlanc phân loại thành 8 Kinds of Fun (xem lý thuyết #12).
- Designer thiết kế từ trái → phải: Mechanics → Dynamics → Aesthetics
- Player trải nghiệm từ phải → trái: Aesthetics → Dynamics → Mechanics
- MDA là hệ thống MÔ TẢ (descriptive), KHÔNG phải hệ thống ĐÁNH GIÁ (normative). Mục đích không phải nói game "tốt" hay "xấu" mà là phân tích cách các elements tạo ra trải nghiệm.

**Áp dụng**:
- Với mỗi mechanic, xác định: dynamics nào sẽ emerge? → aesthetics nào sẽ được tạo ra?
- Thiết kế ngược: Xác định aesthetic mong muốn → cần dynamics gì → cần mechanics gì để tạo dynamics đó
- Khi concept có vấn đề: kiểm tra ngược từ aesthetic không mong muốn → dynamic nào gây ra → mechanic nào là nguồn
- Ví dụ: Realm of the Mad God — mechanic "drop item" → dynamic "bartering/trading community" → aesthetic "fellowship". Designers không dự đoán được dynamic này nhưng nó emerge từ mechanic.
- Ví dụ: Monopoly chơi sai (Free Parking cho tiền) — thay đổi mechanic nhỏ → dynamic thay đổi lớn (game kéo dài, mất strategic tension) → aesthetic thay đổi (mất challenge, trở nên luck-driven).

**Câu hỏi kiểm tra**:
- Mechanic X sẽ tạo ra dynamic gì khi player tương tác?
- Dynamic đó có dẫn đến aesthetic mong muốn không?
- Có dynamic không mong muốn nào có thể emerge không? (turtling, dominant strategies, exploits)
- Designer chỉ điều chỉnh được mechanics — aesthetic mong muốn có thể đạt được chỉ qua mechanics không?

---

## 2. Problem Statements

**Nguồn**: Players Making Decisions Ch.2

**Định nghĩa**:
- Game design là PROBLEM SOLVING, không phải brainstorming tự do hay "idea generation"
- Mỗi game concept cần trả lời: "Game này giải quyết VẤN ĐỀ GÌ cho player?"
- Vấn đề ở đây không phải bug hay technical issue, mà là nhu cầu trải nghiệm chưa được đáp ứng
- Tránh functional fixedness: đừng bị giam trong giải pháp quen thuộc hoặc giải pháp của game khác
- "Everyone has a great game idea" — ý tưởng không có giá trị, giải pháp cho vấn đề rõ ràng mới có giá trị

**Áp dụng**:
- Concept Statement phải rõ ràng: "[Game name] là game [genre] cho [audience] giải quyết [vấn đề/nhu cầu] bằng cách [approach/mechanic chính]"
- Kiểm tra: nếu bỏ theme/art, concept statement có còn meaningful không?
- Tránh "idea guy" syndrome: concept phải có đủ chi tiết để prototype, không chỉ là mô tả abstract

**Câu hỏi kiểm tra**:
- Vấn đề/nhu cầu mà game giải quyết là gì? (Boredom? Thiếu social connection? Thiếu challenge?)
- Giải pháp có bị functional fixedness không? (Copy nguyên xi game khác?)
- Concept có đủ cụ thể để prototype không?

---

## 3. Meaningful Decisions

**Nguồn**: Players Making Decisions Ch.10

**Định nghĩa**:
- Player cần AGENCY — khả năng tác động game state qua quyết định của mình
- Quyết định có ý nghĩa (meaningful) khi có CONSEQUENCES thực sự — nó thay đổi game state theo cách mà player quan tâm
- KHÔNG phải nhiều agency hơn = tốt hơn. SimCity bỏ quản lý lịch thu rác vì nó không tạo meaningful decision.
- Cho player agency ở nơi họ CẦN và nơi tạo trải nghiệm mong muốn, bỏ ở nơi không cần
- Simulation vs Arcade: không phải binary mà là spectrum of agency. NBA Live (nhiều agency) vs NBA Street (ít agency) — cả hai đều valid
- Bản thân hành động CHỌN đã motivating, kể cả khi lựa chọn không tăng control thực sự

**Áp dụng**:
- Xác định decision points chính trong core loop
- Mỗi decision phải có consequences rõ ràng — nếu không có, loại bỏ hoặc redesign
- Cân nhắc mức agency phù hợp cho target audience: casual → ít decisions, hardcore → nhiều decisions
- Automate những quyết định mà player KHÔNG quan tâm

**Câu hỏi kiểm tra**:
- Mỗi decision point có consequences thực sự không?
- Mức agency có phù hợp target audience không?
- Có quyết định nào nên được automate không?
- Player có cảm thấy actions của mình matter không?

---

## 4. Game Flow (Csikszentmihalyi)

**Nguồn**: Players Making Decisions Ch.9 / Theory of Fun for Game Design

**Định nghĩa**:
- Flow là trạng thái tập trung sâu, nằm giữa FRUSTRATION (quá khó) và BOREDOM (quá dễ)
- 3 điều kiện để đạt flow: (1) mục tiêu rõ ràng, (2) feedback tức thì, (3) challenge phù hợp skill level
- Flow channel: vùng giữa anxiety và boredom trên đồ thị Challenge vs Skill
- Designer cần giữ player OSCILLATE trong flow channel — boss fight (khó) → easy section (nghỉ) → harder challenge
- **Fundamental Game Design Directive**: Mọi quyết định thiết kế game (cho mục đích entertainment) nên hướng đến tạo flow cho player
- Game designer Jenova Chen (flOw, Journey) đã nghiên cứu và áp dụng flow theory vào game design
- Fun from games arises out of MASTERY and COMPREHENSION — learning is the drug (Raph Koster)
- Boredom = brain casting about for new information. Game ngừng dạy → player thấy boring

**Áp dụng**:
- Map challenge curve qua các giai đoạn của game
- Sau mỗi đoạn khó, cần đoạn nghỉ (giống dramatic structure)
- Khác audience, khác flow channel: casual cần channel rộng hơn (tha thứ hơn), hardcore cần channel hẹp hơn (thử thách hơn)
- Dynamic difficulty adjustment: detect skill level, adjust challenge tương ứng
- Tại sao meaningful decisions quan trọng? → Vì không có chúng, player thiếu challenge → rơi khỏi flow
- Tại sao playtest quan trọng? → Vì chưa có "flowometer", playtest là cách tốt nhất để đo flow

**Câu hỏi kiểm tra**:
- Player có mục tiêu rõ ràng ở mỗi thời điểm không?
- Feedback có đủ nhanh không?
- Challenge có scale theo skill không? Có đoạn nào quá khó hoặc quá dễ kéo dài?
- Sau mỗi đoạn khó, có đoạn nghỉ không?
- Flow channel có phù hợp target audience không?

---

## 5. Interest Curves (Jesse Schell)

**Nguồn**: Players Making Decisions Ch.9 / The Art of Game Design (Jesse Schell)

**Định nghĩa**:
- Đồ thị ENGAGEMENT (y-axis) theo THỜI GIAN (x-axis) trong trải nghiệm game
- Cấu trúc "tốt" giống Aristotelian dramatic structure: Hook → Rising Action (nhiều mini-climaxes) → Climax → Resolution
- Interest FLOOR: mức engagement tối thiểu — khi xuống dưới mức này, player QUIT
- Không phải mọi khoảnh khắc đều phải là climax — cần cả rest periods, nhưng không được để interest xuống dưới floor
- Mini-climaxes giữ player engaged giữa các rest periods
- Ví dụ: Half-Life 2 Episode One — death rate data cho thấy pattern rõ ràng: spike (khó) → valley (nghỉ) → spike cao hơn → climax cuối

**Áp dụng**:
- Thiết kế interest curve cho một session chơi điển hình
- Xác định: hook (gì giữ player trong 30 giây đầu?), rising moments, climax, rest points
- Đảm bảo interest KHÔNG BAO GIỜ xuống dưới floor (điểm quit)
- Sau mỗi climax, interest nên giảm nhẹ (rest) nhưng vẫn trên floor, rồi tăng lên lại
- Phiên chơi nên KẾT THÚC khi interest > lúc bắt đầu → player muốn chơi lại

**Câu hỏi kiểm tra**:
- Hook đầu tiên là gì? Player có lý do chơi tiếp sau 30 giây không?
- Có đủ mini-climaxes để duy trì engagement không?
- Có đoạn nào interest có thể xuống dưới floor không?
- Session kết thúc ở mức interest cao hơn lúc bắt đầu không?

---

## 6. Learning Curves

**Nguồn**: Players Making Decisions Ch.9 + Ch.24 / Theory of Fun for Game Design

**Định nghĩa**:
- Đồ thị LEARNING (y-axis) theo THỜI GIAN (x-axis)
- Lưu ý: "Steep learning curve" trong ngôn ngữ phổ thông = khó học, nhưng nghĩa gốc = học NHANH (steep = nhiều learning trên ít time)
- Liên hệ với Flow: khi player đang HỌC (range A) → cần TĂNG difficulty; khi player NGỪNG HỌC (range B) → GIỮ difficulty
- Games are fundamentally about LEARNING (Raph Koster). Fun comes from comprehension and mastery of patterns.
- Constructivism: mỗi player xây dựng knowledge dựa trên những gì họ ĐÃ BIẾT. Player có experience khác nhau → learning curve khác nhau
- Novice vs Expert: Expert "chunk" thông tin (giống nhớ số điện thoại theo nhóm), novice xử lý từng bit riêng lẻ
- Ví dụ xấu: Dwarf Fortress — learning curve quá dốc (phải học quá nhiều trước payoff đầu tiên), nhiều player quit trước khi "get it"
- Ví dụ tốt: Super Mario Bros World 1-1 — dạy từng mechanic một cách tự nhiên, không cần text tutorial

**Áp dụng**:
- Thiết kế onboarding: dạy 1 mechanic tại 1 thời điểm, trong môi trường an toàn
- First payoff phải đến SỚM — trước khi player đạt interest floor
- Không giả định player biết gì — nhưng cho phép skip nếu player đã biết
- Tận dụng chunking: nhóm mechanics liên quan thành concepts quen thuộc
- Mobile game đặc biệt cần learning curve thoải — player có thể bị interrupt bất cứ lúc nào

**Câu hỏi kiểm tra**:
- Payoff đầu tiên đến khi nào? Có quá muộn không?
- Có bao nhiêu mechanics cần học trước khi chơi được? Có quá nhiều không?
- Player mới có bị overwhelm không?
- Onboarding có tận dụng kiến thức player đã có (từ game cùng genre) không?

---

## 7. Anatomy of a Choice (Salen & Zimmerman)

**Nguồn**: Players Making Decisions Ch.10 / Rules of Play (Salen & Zimmerman, 2003)

**Định nghĩa**:
5 khía cạnh phân tích một lựa chọn trong game:
1. **Before (Bối cảnh)**: Điều gì xảy ra trước khi player được cho lựa chọn? Game state hiện tại?
2. **Communication (Truyền đạt)**: Player biết mình CÓ lựa chọn bằng cách nào? Các option được hiển thị thế nào?
3. **Action (Hành động)**: Player thực hiện lựa chọn bằng cách nào? (nhấn nút, kéo thả, nói, đặt lá bài?)
4. **Consequences (Hậu quả)**: Kết quả của lựa chọn là gì? Nó ảnh hưởng các lựa chọn TƯƠNG LAI thế nào?
5. **Feedback (Phản hồi)**: Kết quả được truyền đạt đến player bằng cách nào? Player biết chuyện gì đã xảy ra?

**Áp dụng**:
- Phân tích mỗi decision point chính trong core loop qua 5 khía cạnh
- Dùng để CHẨN ĐOÁN vấn đề:
  - Decisions cảm thấy vô nghĩa → kiểm Consequences
  - Player confused → kiểm Communication và Feedback
  - Player frustrated với UX → kiểm Action
  - Player không hiểu context → kiểm Before

**Câu hỏi kiểm tra**:
- Mỗi decision point có đủ 5 khía cạnh không?
- Communication có rõ ràng không? Player có biết mình có choices không?
- Consequences có đủ meaningful không?
- Feedback có đủ nhanh và rõ ràng không?

---

## 8. Interesting vs Less-Interesting Decisions

**Nguồn**: Players Making Decisions Ch.10

**Định nghĩa**:
Các loại quyết định KÉMM thú vị (less-interesting) cần tránh:

- **Blind Decisions**: Player không có thông tin để quyết định. Ví dụ: "Chọn Human, Mole-person, hay Lizard-man?" ở đầu game khi player chưa biết gì.
  - Fix: cho tutorial trước khi chọn, hoặc làm blind decision REVERSIBLE / minimal impact
  - Blind decisions chấp nhận được nếu chúng DẪN ĐẾN thông tin cho decisions sau (iterative learning)
  - Designer biết tất cả mechanics nên decision không blind với designer — nhưng với PLAYER thì có

- **Dominant Strategies**: Một lựa chọn LUÔN TỐT HƠN tất cả lựa chọn khác → không còn là quyết định thực sự
  - Fix: mỗi lựa chọn phải có trade-off — tốt trong context này, xấu trong context khác

- **Meaningless Choices**: Kết quả GIỐNG NHAU bất kể chọn gì → ảo tưởng về agency
  - Fix: mỗi lựa chọn phải dẫn đến game state KHÁC NHAU một cách có ý nghĩa

- Informed decision > Blind decision. Mỗi lựa chọn cần TRADE-OFF thực sự — không có "đáp án đúng" rõ ràng.
- "Never underestimate how a player will be able to break your systems" — expert players SẼ tìm ra dominant strategy nếu có.

**Áp dụng**:
- Scan tất cả decisions trong concept, check: blind? dominant? meaningless?
- Mỗi decision cần ít nhất 2 options với trade-offs rõ ràng
- Cho player đủ information trước khi quyết định (trừ khi blind decision là intentional và reversible)

**Câu hỏi kiểm tra**:
- Có blind decision nào ở early game mà player bị lock-in không?
- Có dominant strategy nào mà 1 option luôn tốt hơn không?
- Có meaningless choice nào mà kết quả giống nhau không?
- Expert player có thể "solve" game bằng 1 strategy duy nhất không?

---

## 9. Randomness

**Nguồn**: Players Making Decisions Ch.11

**Định nghĩa**:
- Mọi game nằm trên spectrum: Pure Skill ←→ Pure Luck
- **Input randomness**: Random xảy ra TRƯỚC quyết định. Player nhận random state rồi quyết định. Ví dụ: chia bài poker (random → player quyết định bet/fold)
- **Output randomness**: Random xảy ra SAU quyết định. Player quyết định rồi random xác định kết quả. Ví dụ: xúc xắc tấn công trong board game (player chọn tấn công → dice quyết định kết quả)
- Input randomness thường cảm thấy CÔNG BẰNG hơn vì player vẫn có agency sau random event
- Output randomness có thể gây FRUSTRATION vì player mất control sau khi đã quyết định
- Cần MITIGATE randomness để player cảm thấy fair — ví dụ: cho re-roll, cho nhiều attempts, giảm variance
- Quá nhiều luck → player mất agency, game cảm thấy random; Quá ít luck → game trở nên predictable, meta stale

**Áp dụng**:
- Xác định vị trí game trên Skill-Luck spectrum — phù hợp target audience
- Ưu tiên input randomness khi cần random (player vẫn có agency)
- Nếu dùng output randomness, cung cấp mitigation (re-rolls, insurance, average over time)
- Casual games có thể dùng nhiều luck hơn (equalizer); Hardcore games ưu tiên skill

**Câu hỏi kiểm tra**:
- Game nằm ở đâu trên Skill-Luck spectrum? Có phù hợp audience không?
- Random elements là input hay output? Có gây frustration không?
- Player có cách mitigate bad luck không?
- Skilled player có advantage rõ ràng so với unskilled player không?

---

## 10. Milieu

**Nguồn**: Players Making Decisions Ch.14

**Định nghĩa**:
- Bối cảnh TỔNG THỂ của game: theme, tone, atmosphere, setting, visual style, audio direction
- **Polish**: chi tiết nhỏ tạo IMMERSION — không ảnh hưởng gameplay nhưng tạo cảm giác chỉn chu
  - Ví dụ: Resident Evil dùng loading screen giả (cửa mở chậm) để tải level; Dead of Winter mỗi character có backstory riêng; Zelda: Ocarina of Time có chi tiết nhỏ (cá bơi, gà phản ứng)
- **Player Types** (Bartle taxonomy — gốc từ MUD games):
  - Hearts/Socializers: chơi vì tương tác xã hội
  - Diamonds/Achievers: chơi vì completion, collection, progression
  - Clubs/Killers: chơi vì dominance, competition
  - Spades/Explorers: chơi vì khám phá, tìm hiểu
- **Five Domains of Play** (Jason VandenBerghe): Novelty, Challenge, Stimulation, Harmony, Threat — correlate với Big Five personality traits
- Milieu PHẢI PHÙ HỢP mechanics — zombie survival game không nên có art style cute pink

**Áp dụng**:
- Chọn milieu phù hợp genre, audience, và target aesthetics
- Xác định player types chính mà game target → design milieu elements phù hợp
- Polish có thể plan ở concept level: liệt kê loại polish nào sẽ tăng immersion

**Câu hỏi kiểm tra**:
- Milieu có phù hợp target aesthetics và genre không?
- Art style, tone, setting có NHẤT QUÁN không?
- Game target player type nào? Milieu có support player type đó không?
- Có điểm nào milieu mâu thuẫn với mechanics không?

---

## 11. Intrinsic & Extrinsic Motivation

**Nguồn**: Players Making Decisions Ch.25

**Định nghĩa**:
- **Intrinsic Motivation**: Chơi vì bản thân hoạt động THÚ VỊ — player enjoy quá trình, không cần phần thưởng bên ngoài
  - Self-Determination Theory (Deci & Ryan): 3 nhu cầu cơ bản:
    - **Autonomy**: Player cảm thấy mình KIỂM SOÁT (có choices, có agency)
    - **Mastery/Competence**: Player cảm thấy mình GIỎI LÊN (learning, skill growth)
    - **Purpose/Relatedness**: Player cảm thấy mình THUỘC VỀ cái gì đó lớn hơn (narrative, community, meaning)

- **Extrinsic Motivation**: Chơi vì phần thưởng BÊN NGOÀI — points, unlocks, rewards, leaderboards, loot
  - Variable-ratio reward schedule: hiệu quả nhất cho engagement (slot machine principle)
  - Goal-gradient effect: player effort tăng khi GẦN ĐẾN mục tiêu
  - Anticipation: sự chờ đợi phần thưởng có thể vui hơn bản thân phần thưởng

- **Overjustification Effect**: Thưởng extrinsic QUÁ NHIỀU có thể GIẾT intrinsic motivation. Player chơi vì reward thay vì vì fun → khi reward hết, player quit.
- Post-reward resetting: sau khi nhận reward, player tạm thời GIẢM desire cho rewards tiếp theo
- Loss aversion (Kahneman & Tversky): mất x đau hơn được x vui. Ví dụ: Metroid Prime cho tất cả weapons rồi lấy lại → player motivated tìm lại vì loss aversion
- Cân bằng lý tưởng: Extrinsic hooks player VÀO game, Intrinsic giữ player Ở LẠI game

**Áp dụng**:
- Map intrinsic motivators: Autonomy (player có choices nào?), Mastery (player học gì?), Purpose (player thuộc về cái gì?)
- Map extrinsic motivators: rewards là gì, schedule thế nào, có variable-ratio không
- Kiểm tra overjustification: game có quá phụ thuộc vào extrinsic rewards không?
- Cân nhắc ethics: variable-ratio rewards CÓ THỂ gây addictive behavior — cần responsible design

**Câu hỏi kiểm tra**:
- Nếu bỏ tất cả rewards, core gameplay có còn fun không? (test intrinsic)
- Reward schedule có đa dạng không? Có gây post-reward resetting không?
- Có overjustification risk không? (player chỉ chơi vì rewards)
- Autonomy, Mastery, Purpose — cả 3 đều được address chưa?

---

## 12. 8 Kinds of Fun (LeBlanc)

**Nguồn**: MDA paper (Hunicke, LeBlanc, Zubek, 2004) / Players Making Decisions Ch.13

**Định nghĩa**:
8 loại aesthetic response (play aesthetics) mà games có thể tạo ra. Đây là taxonomy KHÔNG ĐẦY ĐỦ (LeBlanc thừa nhận) nhưng bao phủ phần lớn trải nghiệm game:

1. **Sensation**: Khoái cảm giác quan — visual đẹp, âm thanh hay, haptic feedback thỏa mãn. Game as sense-pleasure.
2. **Fantasy**: Nhập vai vào thế giới/nhân vật/tình huống khác. Game as make-believe.
3. **Narrative**: Trải nghiệm câu chuyện, drama, diễn biến bất ngờ. Game as drama.
4. **Challenge**: Vượt qua trở ngại, giải puzzle, test skill. Game as obstacle course.
5. **Fellowship**: Tương tác xã hội, teamwork, community, shared experience. Game as social framework.
6. **Discovery**: Khám phá thế giới, hệ thống, secrets, knowledge mới. Game as uncharted territory.
7. **Expression**: Thể hiện bản thân — customize, create, leave mark. Game as self-discovery.
8. **Submission**: Thư giãn, pastime, đắm chìm vào hệ thống lặp lại. Game as pastime.

- Mỗi game nên target 2-3 aesthetics CHÍNH — không cần và không nên target tất cả
- Khác audience sẽ trải nghiệm cùng 1 game nhưng hưởng aesthetics KHÁC NHAU
  - Ví dụ: World of Warcraft — Discovery cho explorers, Fellowship cho socializers, Challenge cho raiders
- Aesthetics chính quyết định HƯỚNG ĐI của toàn bộ design — mechanics phải SUPPORT aesthetics đã chọn
- "Fun" và "Not Fun" quá chung chung — dùng 8 Kinds of Fun để phân tích CỤ THỂ hơn

**Áp dụng**:
- Chọn 1-2 PRIMARY aesthetics và 1-2 SECONDARY aesthetics cho concept
- Đảm bảo mọi mechanics SUPPORT primary aesthetics
- Dùng để communicate: "Game này fun theo kiểu nào?" thay vì chỉ nói "game này fun"
- Khi nhận feedback "game không fun" → hỏi "loại fun nào thiếu?" → map vào 8 kinds

**Câu hỏi kiểm tra**:
- Primary aesthetics là gì? Mọi core mechanics có support chúng không?
- Secondary aesthetics có bổ trợ hay XUNG ĐỘT với primary?
- Target audience muốn loại fun nào? Concept có deliver đúng loại fun đó không?
- Có mechanic nào tạo aesthetic KHÔNG MONG MUỐN không?
