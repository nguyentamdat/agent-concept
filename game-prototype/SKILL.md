---
name: game-concept-automatic
description: "Tạo Game Concept tự động cho mobile games. Thu thập 3 thông tin chính (Target Audience, Problem Statement, 8 Kinds of Fun) → Suggest gameplay → Build playable HTML prototype → Iterate → Xuất GCD nhẹ. Use for prototype, làm prototype, demo game, playable demo, game prototype, từ ý tưởng đến demo, build game demo, prototype game mobile."
---

# Game Concept Automatic

Hướng dẫn user từ ý tưởng → playable HTML prototype → Game Concept Document (GCD) nhẹ trong 1 phiên duy nhất, qua 3 phase với 2 approval gate.

Khác với `game-concept-design` (output GCD lý thuyết với 12 theories), skill này tập trung vào prototype playable thực tế và GCD nhẹ chỉ chứa thông tin liên quan đến prototype.

## Scope

**In scope:**
- Mobile games (casual, mid-core, hardcore)
- Single-file HTML prototype (CSS + JS inline, mở trong browser)
- Workflow 3 phase với 2 approval gate

**Out of scope:**
- Full GDD (→ skill khác)
- React/Vite project
- Prototype non-game
- 12 lý thuyết game design (đã có `game-concept-design`)
- Poker/casino games

## Quy Trình 3 Phase

### Phase 1: Lấy thông tin → Chốt Gameplay (chờ approve)

1. **Đánh giá độ hoàn thiện ý tưởng** — hỏi ngay sau khi nhận input:
   > Độ hoàn thiện ý tưởng của bạn đang ở giai đoạn nào?
   > A) Chưa có ý tưởng gì rõ ràng
   > B) Có vài ý tưởng sơ khai
   > C) Đã có ý tưởng hoàn chỉnh nhưng chưa viết
   > D) Tự điền: ___

   Adapt cách hỏi: A → đầy đủ, gợi ý nhiều; B → chỉ hỏi thiếu; C → confirm + bổ sung.

2. **Target Audience** — AI đề xuất 3+1 gợi ý dựa trên context. User chốt 1.

3. **Problem Statement** — Đọc `references/problem-statement-guideline.md`. Suggest 3-5 PS theo format "How to":
   > "Làm sao để [Mục tiêu thiết kế] + bằng cách [Ràng buộc/Mâu thuẫn] + nhằm tạo ra [Cảm xúc/Trải nghiệm]?"
   Chỉ suggest loại Experience-driven (loại cao nhất, có mâu thuẫn rõ + mục tiêu tâm lý), KHÔNG suggest Feature-driven hay Idea-driven. User chọn 1 hoặc tự viết.

4. **8 Kinds of Fun** — Đọc `references/8-kinds-of-fun.md`. Trình bảng 8 loại, user chọn 1-3 loại ưu tiên.

5. **Suggest 3 Gameplay Options + 3 playable concept prototypes** — Đọc:
   - `references/gameplay-suggestion-rules.md` — quy tắc 3 options + format 4 thành phần
   - `references/decisions-guideline.md` — knowledge base về player decisions (load §1.1-§1.6 Concepts, §2.2 Core Loop Heuristics, §3.1 Less-Interesting Decisions, §3.2 Bad Dynamics, Appendix C). Áp dụng riêng cho thành phần "Lựa chọn của người chơi" để decisions có chiều sâu, có agency thực sự, tránh anti-patterns (no-brainer / dominant strategy / paralysis-by-analysis).

   Generate 3 options (Convention / Twist / Ambitious), mỗi option đi kèm:

   **(a) Mô tả text** đầy đủ 4 thành phần:
   - Pitching (1-2 câu góc nhìn player)
   - Mục tiêu trò chơi (Win/Lose condition)
   - **Lựa chọn của người chơi** (2-4 loại quyết định) — apply lý thuyết từ `decisions-guideline.md`: mỗi loại phải có Anatomy of a Choice (cost/value/info/timing rõ ràng), match với Flow zone của Audience, không vi phạm AP1.x (Less-Interesting Decisions)
   - Thử thách của trò chơi

   **(b) 1 mini playable prototype (vertical slice)** lưu vào `Game Demo/[slug]-concept-{A|B|C}.html`:
   - Scope: **1 screen, core mechanic only, 1 puzzle/level đại diện**
   - Size: ~300-500 dòng/file
   - Dùng cùng UI shell + skeleton từ `references/prototype-html-template.md` để 3 prototype dễ so sánh — chỉ khác **core mechanic** (biến số đang test)
   - Mục đích: cho user **FEEL** mechanic khác biệt, không phải sản phẩm cuối
   - Mỗi prototype phải tự chạy được (có start state, win/lose có thể trigger)

   Mỗi option (cả text và prototype) phải giải quyết PS + deliver Kinds of Fun + phù hợp Target Audience.

   **Slug** (dùng chung cho concept prototypes và Phase 2 sau này): AI generate từ game idea (lowercase, kebab-case, 2-4 từ). Announce slug cho user trước khi save.

5a. **Pre-Prototype Audit (BẮT BUỘC, chạy GIỮA bước 5 text và bước 5 build)** — Sau khi viết text 3 options, **trước khi build 3 HTML prototype**, AI phải chạy 5-layer audit cho mỗi option để đảm bảo genre faithfulness + decision quality + experience delivery.

   **Đọc:**
   - `references/genre-faithfulness-audit.md` — load workflow + Strength rubric (Strong/Medium/Weak) cho L0
   - `references/decision-quality-audit-framework.md` — load §L1 (Substrate Capacity) + §L2 (Decision Anatomy) + Genre Adapter table phù hợp với genre đang thiết kế
   - `references/experience-alignment-audit.md` — load §L4 (PS Decomposition + Fun Signatures + Mapping Matrix) + §L5 (4 questions self-test)

   **Workflow (thứ tự bắt buộc L0 → L1 → L2 → L4 → L5):**
   - **Re-read original user message** — extract genre statement gốc (statement đầu tiên về thể loại/concept) để feed L0
   - Với MỖI option (3 options):
     - **L0 Genre Faithfulness** — trigger nếu genre statement có pattern compound ("X + Y", "X kết hợp Y", "X hybrid Y", "X meets Y"). Build evidence matrix per option, đánh Strength Strong/Medium/Weak cho mỗi component. Pass khi mọi component ≥ Medium.
     - **L1 Substrate Capacity** — tính Option Density vs threshold của Audience flow zone (Casual ≥3, Mid-core ≥5, Hardcore ≥8). Áp dụng Sub-system Curse Rule nếu chia lanes/zones/sub-boards.
     - **L2 Decision Anatomy** — score 5 fields (Cost/Value/Info/Timing/Reversibility) per decision tier. Trung bình ≥ 2.0/3 mới pass.
     - **L4 Experience Alignment** — decompose PS thành (Goal/Tension/Emotion), list Fun Signatures, build Mapping Matrix (decision tier × experience element). Check coverage rule + tension rule + no conflict rule.
     - **L5 Felt Experience Self-Test** — 4 questions: First-30-seconds / Audience-fit / Tension-engagement / Replay-motivation. Phải 4/4 YES.
   - Output bảng audit consolidated cho 3 options (L0 hiển thị riêng phần đầu nếu trigger).
   - **Nếu option có FAIL:**
     - L0 fail → option lệch genre, MUST fix trước (priority cao hơn L1-L5). Propose mechanic dedicated cho element yếu (vd "puzzle Weak → add limited moves + telegraphed boss + multi-turn preview").
     - L1-L5 fail → propose fix cụ thể theo từng layer.
     - Update text option với fix → re-audit từ L0 (vì fix có thể impact các layer khác).
     - Loop max 2 iterations, sau đó discuss với user.
   - **Chỉ sau khi cả 3 options pass mọi layer** → generate 3 HTML prototype.

   **Lý do:** Catch design gap (genre mismatch, false choice trap, shallow decisions, experience mismatch) trên text trước khi tốn tokens build prototype. Bài học: case "card battle + puzzle" Option A pass L1+L2+L4+L5 nhưng heavy match-3 nhẹ puzzle deliberate → fail genre faithfulness; Concept D 3×3 lane (substrate gap); Concept B Fantasy gap (experience gap).

   User chơi thử cả 3 → chốt 1 option (hoặc remix giữa các option).

6. **Anti-pattern Audit (BẮT BUỘC, SILENT)** — Sau khi user chốt 1 gameplay option, AI audit option đó qua checklist 12 anti-patterns. **Chạy ngầm** — không trình bảng chi tiết cho user.

   **Đọc:** `references/gameplay-suggestion-rules.md` section "Anti-pattern Audit Checklist" + `references/decisions-guideline.md` §3.1 + §3.2.

   **Audit 12 items (internal):** AP1.1-AP1.5 (decision), AP2.1+AP2.3 (game), F1-F5 (format).

   **Output user-facing — chỉ 1-2 dòng tóm tắt:**

   - **Nếu 0 ✗** → 1 dòng: `✓ Anti-pattern audit passed (12/12). Ready for Phase 2.` → sang step 7 (gate).
   - **Nếu có ✗** → tóm tắt issues + propose fix:
     ```
     ⚠ Audit found N issue(s):
     - [Tên anti-pattern]: [1 câu mô tả vấn đề]
       → Fix: [đề xuất cụ thể]
     ```
     Ask user: "Apply fix? (Yes → tôi update + re-audit / No → giữ nguyên / Manual → user sửa). Hoặc 'Show full audit' để xem chi tiết 12 items."
   - User có thể request `Show full audit` bất kỳ lúc nào để thấy bảng đầy đủ.
   - Lặp đến 0 ✗ hoặc user explicit accept rủi ro.

7. **GATE 1 (SILENT confirm)** — Báo gọn: `Phase 1 complete. Gameplay [Option name] approved. Sang Phase 2?` Chờ user reply Yes/No (hoặc tự sang nếu user đã approve trong step 6).

### Phase 2: Build Prototype + Iterate (chờ approve)

1. **AI quyết Scope** (silent) dựa vào Target Audience + complexity của Gameplay:
   - **Minimal** (casual): 1 screen Core Gameplay
   - **Standard** (mid-core): 3 screens Setup → Gameplay → End
   - **Full** (hardcore): 5+ screens Menu → Setup → Gameplay → Inventory/Shop → End
   AI announce scope cho user và **chờ user confirm hoặc override** trước khi tiếp tục steps 2-4.

2. **Slug đã có** từ Phase 1 step 5 (concept prototypes đã dùng). Không generate lại.

3. **Đọc `references/prototype-html-template.md`** — lấy skeleton, CSS conventions (Orbitron+Inter, dark theme, color vars), screen patterns, JS state pattern, self-test checklist.

4. **Single-shot generation — expand từ chosen concept prototype**:
   - Bắt đầu từ `Game Demo/[slug]-concept-{X}.html` (concept đã chốt) — giữ nguyên core mechanic + JS logic
   - Expand thêm screens (Setup / End / Inventory / Menu) theo scope đã quyết
   - Expand thêm levels/puzzles để có run hoàn chỉnh
   - Apply CSS conventions từ template (dark theme, Orbitron+Inter)
   - Save vào `Game Demo/[slug]-v1.html` (full version, 1000-3000 dòng tùy scope)

5. **Self-test** — AI đọc lại file vừa tạo, check theo checklist trong template, self-fix bug.

6. **Báo user** — "Prototype full version xong, mở `Game Demo/[slug]-v1.html` trong browser để chơi."

7. **Iterate loop:**
   - User feedback tự do.
   - **Nếu mơ hồ** → AI hỏi clarify 1-2 câu.
   - **Nếu rõ** → update HTML trực tiếp, save version mới (`-v2.html`, `-v3.html`...). KHÔNG overwrite version cũ.
   - Lặp đến khi user chốt.

8. **DỪNG** — chờ user approve final prototype trước khi sang Phase 3.

### Phase 3: Xuất GCD nhẹ (output cuối)

1. Đọc `references/gcd-output-template.md`.

2. Đọc lại file HTML đã chốt + lịch sử conversation Phase 1+2.

3. Generate GCD theo template, save vào `Game Demo/[slug]-GCD.md`.

4. Báo user: "GCD xuất tại `Game Demo/[slug]-GCD.md`. Có thể chạy skill `game-concept-review` để đánh giá chi tiết."

5. Skill kết thúc.

## Key Principles

- **Hỏi từng câu một** — không hỏi dồn cùng lúc
- **3+1 format** mọi suggestion (3 gợi ý + 1 tự điền), trừ bảng 8 Kinds of Fun
- **Evolutionary suggestion** — mọi gợi ý phải reference các thông tin đã chốt ở bước trước
- **Self-test trước khi đưa user** — không generate xong là đẩy ngay
- **Versioning** — không overwrite, giữ tất cả version để so sánh
- **Approval gates** — DỪNG ở cuối Phase 1 và Phase 2, chờ user approve

## Anti-patterns

- KHÔNG suggest gameplay dạng "feature list" — phải là "experience" (player cảm thấy gì khi chơi)
- KHÔNG bịa rule trong GCD — Section 3 (Screens) và Section 4 (Rules) phải đọc từ HTML
- KHÔNG include 12 lý thuyết / MDA / flow analysis trong GCD (đó là việc của `game-concept-design`)
- KHÔNG hỏi gộp nhiều câu trong 1 message
