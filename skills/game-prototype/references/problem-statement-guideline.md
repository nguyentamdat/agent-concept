# HƯỚNG DẪN CHI TIẾT: NGHỆ THUẬT VIẾT PROBLEM STATEMENT CHUYÊN NGHIỆP

**Knowledge base** chính cho active skill `game-prototype`. Còn được giữ nguyên tham chiếu dưới `skills/_deprecated/game-concept-design/` cho legacy support — khi update file này, sync sang archive nếu cần duy trì consistency.

---

## 1. Problem Statement là gì?

Trong Game Design, **Problem Statement (PS)** không phải là mô tả tính năng. Nó là một phát biểu ngắn gọn xác định **mâu thuẫn trung tâm** mà người chơi phải đối mặt và **trải nghiệm mục tiêu** mà nhà thiết kế muốn tạo ra.

> **Triết lý:** Game không phải là một danh sách tính năng; game là một **giải pháp cho một bài toán thú vị**.

PS tốt khiến team "ngứa ngáy" muốn tìm giải pháp ngay lập tức. PS yếu khiến team hỏi "Rồi sao nữa?".

---

## 2. Cấu trúc "Vàng" của một Problem Statement

Format chuẩn:

```
"Làm sao để [Mục tiêu thiết kế]
   bằng cách [Ràng buộc/Mâu thuẫn]
   nhằm tạo ra [Cảm xúc/Trải nghiệm]?"
```

### Các thành phần:

| Thành phần | Câu hỏi | Ví dụ |
|------------|---------|-------|
| **Goal (Mục tiêu thiết kế)** | Bạn muốn player làm gì hoặc thay đổi tư duy thế nào? | "Buộc player phải hợp tác" |
| **Constraint (Ràng buộc/Mâu thuẫn)** | Cái "gai" nào ngăn cản? Tại sao họ không thể thắng dễ? | "Mọi nỗ lực đơn độc đều bế tắc" |
| **Experience (Trải nghiệm mục tiêu)** | Sau khi giải quyết, player cảm thấy gì? | "Cảm giác đồng đội thấu hiểu" |

### 2.5 Solvability Sanity Check (BẮT BUỘC) ⚠

Sau khi viết xong PS, **phải tự kiểm tra solvability** trước khi đưa vào skill workflow:

**4 questions:**
1. **Concrete mechanic?** Tôi có thể tưởng tượng ÍT NHẤT 1 mechanic concrete giải quyết PS này không? (Nếu chỉ tưởng tượng được abstract → PS quá vague)
2. **Win condition reachable?** Player có thể THỰC SỰ đạt mục tiêu không, hay chỉ trên lý thuyết?
3. **Constraint actionable?** Constraint có thể implement bằng rule cụ thể không, hay chỉ là "tinh thần"?
4. **Experience triggerable?** Có moment cụ thể nào trong gameplay sẽ trigger feeling đó không?

> **Lý do thêm step này:** PS đẹp nhưng không solvable sẽ dẫn đến gameplay options bí mạch ở Bước 1.5, hoặc puzzles không có path solvable ở Phase 2. Catch sớm tiết kiệm tokens + iterations.

**Nếu fail bất kỳ question nào** → quay lại §3 viết lại PS.

---

## 3. Quy trình 4 bước để viết Problem Statement

### Bước 1: Xác định "Nỗi đau" hoặc "Sự nhàm chán"

Nhìn vào thể loại game đang làm. Điều gì làm player chán?

- _Match-3 quá cô đơn._
- _Đua xe chỉ cần nhấn ga là thắng._
- _Quản lý bóng đá quá dễ đoán sau 3 mùa._

### Bước 2: Đặt ra một "Ràng buộc cứng" (The Hard Constraint)

Đây là lúc tước đi sự thoải mái của player. Đặt điều kiện khiến họ không thể dùng tư duy cũ.

→ Xem §3.6 để chọn loại constraint phù hợp.

### Bước 3: Chuyển từ "What if" sang "How to"

"What if" chỉ dành cho brainstorming. Để document chuyên nghiệp, dùng "How to" để biến nó thành mệnh lệnh hành động.

### Bước 4: Kiểm tra tính "Mở"

PS tốt phải **đặt bài toán** chứ không **cho đáp án**.

| Sai (đưa giải pháp) | Đúng (đặt vấn đề) |
|---------------------|-------------------|
| "Làm sao để chơi chung **bằng cách cho người này gửi gạch cho người kia**?" | "Làm sao để player **phụ thuộc lẫn nhau** đến mức mọi nỗ lực đơn độc đều dẫn đến bế tắc?" |

### 3.5 PS-Fun-Audience Triangulation (cross-skill consistency)

PS không đứng riêng. Nó phải **tương thích** với Audience và Kinds of Fun đã chọn (hoặc sẽ chọn) — nếu không, sẽ ra concept mismatch ở Bước 1.5.

**Triangle check:**

```
        Audience
           ▲
          / \
         /   \
        /     \
       PS─────Fun
```

**Mỗi cạnh phải consistent:**

| Cạnh | Câu hỏi check |
|------|--------------|
| **PS ↔ Audience** | Audience có sức bear constraint của PS không? (Casual không chịu được constraint quá khắc nghiệt) |
| **PS ↔ Fun** | Fun đã chọn (Sensation/Challenge/Discovery/...) có match với Experience trong PS không? |
| **Fun ↔ Audience** | Fun có phù hợp Audience flow zone không? (Submission cho hardcore = mâu thuẫn) |

**Anti-pattern:** PS hay nhưng Fun không deliver được Experience. Vd PS đòi "cảm giác bế tắc đến mức phải hợp tác" + Fun chọn "Submission" = bế tắc và Submission đối lập.

### 3.6 3 loại Constraint (mở rộng tư duy)

Constraint không chỉ là "không thể X" (negative). Có 3 loại:

| Loại | Format | Ví dụ |
|------|--------|-------|
| **Negative (Loss)** | "Không thể X" / "X bị giảm dần" | "Tài nguyên giảm theo thời gian", "Không thể attack quá 3 lần" |
| **Positive (Pressure)** | "Phải X" / "Phải làm trong giới hạn Y" | "Phải hợp tác để mở cửa", "Phải fire trong 5s" |
| **Trade-off (Choice)** | "X chỉ đạt được nếu hy sinh Y" | "Mạnh thì chậm, nhanh thì yếu", "Buff team nhưng giảm self DPS" |

**Tip:** Constraint dạng **Trade-off** thường tạo PS sâu nhất vì ép player phải decide thay vì execute.

---

## 4. Bảng so sánh các cấp độ viết

| Cấp độ | Đặc điểm | Ví dụ | Đánh giá |
|--------|----------|-------|----------|
| **Sơ cấp (Feature-driven)** | Mô tả tính năng, không có bài toán | "Sẽ thế nào nếu game Match-3 có thể chơi cùng bạn bè?" | **Yếu** |
| **Trung cấp (Idea-driven)** | Có mục tiêu nhưng thiếu lực ép (constraint) | "Làm sao để player Match-3 thấu hiểu ý đồ của nhau thay vì chỉ lo cho bảng của mình?" | **Khá** |
| **Chuyên nghiệp (Experience-driven)** | Có mâu thuẫn rõ + mục tiêu tâm lý | "Làm sao để chuyển dịch tư duy player sang thấu hiểu đồng đội bằng cách biến sự bế tắc cá nhân thành động lực cho hợp tác?" | **Tốt** |

**Skill `game-prototype` chỉ accept Experience-driven** (cấp cao nhất).

---

## 5. Checklist trước khi xuất bản (10 items, mở rộng từ 4)

Trước khi đưa PS vào workflow, tự hỏi:

### Cấu trúc (4 items)
- [ ] Có **mâu thuẫn (constraint)** rõ ràng không?
- [ ] Có **mục tiêu tâm lý (experience)** cụ thể không?
- [ ] Có **ép player thay đổi hành vi cũ** không?
- [ ] Đủ **mở** để team Creative + Technical sáng tạo giải pháp đa dạng?

### Solvability (3 items, từ §2.5)
- [ ] Tôi tưởng tượng được ÍT NHẤT 1 concrete mechanic giải quyết PS?
- [ ] Constraint có thể implement bằng rule cụ thể, không phải "tinh thần"?
- [ ] Experience có moment trigger cụ thể trong gameplay?

### Cross-consistency (3 items, từ §3.5)
- [ ] PS tương thích với Audience flow zone?
- [ ] PS tương thích với Kinds of Fun đã chọn?
- [ ] Nếu lấy đi lớp đồ họa, **bài toán** này có còn thú vị không?

**Pass tất cả 10 → ready.** Fail bất kỳ → quay lại revise.

---

## 6. Anti-pattern Catalog (PS-A1 đến PS-A6)

Các sai lầm thường gặp khi viết PS:

### PS-A1) Solution-disguised-as-problem
**Vấn đề:** PS thực ra là 1 solution preset, không phải bài toán mở.
**Ví dụ ❌:** "Làm sao để tạo deck-builder kiểu Hearthstone?"
**Sửa ✅:** "Làm sao để player cảm thấy quyết định trước trận quan trọng hơn skill trong trận, bằng cách giới hạn input runtime nhưng cho phép craft kit trước?"
**Cách phát hiện:** Nếu PS chứa tên thể loại/game cụ thể → red flag.

### PS-A2) Vague experience
**Vấn đề:** Experience quá chung chung, không actionable.
**Ví dụ ❌:** "Làm sao để player thấy vui?"
**Sửa ✅:** "Làm sao để player có moment 'aha' khi tìm ra cách bend trajectory phá puzzle?" (specific Discovery + Challenge)
**Cách phát hiện:** Experience không thuộc 1 trong 8 Kinds of Fun cụ thể → vague.

### PS-A3) Too-narrow constraint
**Vấn đề:** Constraint quá specific, đóng khung quá sớm, giết creativity.
**Ví dụ ❌:** "Làm sao để player solve puzzle trong **đúng 3 turn**?"
**Sửa ✅:** "Làm sao để player luôn cảm thấy thiếu tài nguyên, bằng cách hệ thống decay theo thời gian?"
**Cách phát hiện:** Constraint chứa số cụ thể hoặc rule mechanic → có thể quá hẹp.

### PS-A4) Conflicting constraint
**Vấn đề:** Constraint mâu thuẫn nội tại với Experience hoặc với Fun.
**Ví dụ ❌:** "Làm sao để player **thư giãn** (Submission Fun) bằng cách **gấp gáp 5s/turn**?"
**Sửa ✅:** Chọn 1 hướng — hoặc thư giãn (bỏ time pressure) hoặc gấp gáp (đổi Fun sang Challenge).
**Cách phát hiện:** Mismatch với Fun đã chọn (xem §3.5).

### PS-A5) Goal without tension
**Vấn đề:** Có mục tiêu nhưng không có constraint → không phải puzzle.
**Ví dụ ❌:** "Làm sao để player thấy mạnh mẽ?"
**Sửa ✅:** "Làm sao để player thấy mạnh mẽ chỉ khi vượt qua boss yêu cầu skill mặc dù họ thiếu trang bị?"
**Cách phát hiện:** PS không có "bằng cách [constraint]" → thiếu tension.

### PS-A6) Player-as-puppet
**Vấn đề:** PS dictate hành vi player thay vì tạo điều kiện cho hành vi.
**Ví dụ ❌:** "Làm sao để **buộc** player phải build deck X-Y-Z?"
**Sửa ✅:** "Làm sao để player **tự khám phá** rằng combo X-Y-Z hiệu quả nhất qua trial?"
**Cách phát hiện:** Verb "buộc/force" thay vì "encourage/enable" → red flag.

---

## 7. Genre Adapter (PS theo Audience)

PS format chuẩn nhưng emphasis khác nhau theo Audience:

### 7.1 Casual (15-30p session, không cần học)

- **Goal:** thiên về **emotional outcome** (vui, satisfying, relax)
- **Constraint:** dùng Negative (Loss) đơn giản, dễ hiểu trong 30s
- **Experience:** focus "feel" hơn "tactical"

**Ví dụ Casual PS:**
> "Làm sao để player có moment 'satisfying click' mỗi lần phá puzzle, bằng cách gộp 3+ block cùng màu nhưng có chỉ 1 cú swipe per turn, nhằm tạo ra cảm giác combo thông minh nhanh?"

### 7.2 Mid-core (30-60p session, accept depth)

- **Goal:** thiên về **tactical satisfaction** (decisive moments)
- **Constraint:** Trade-off (Choice) là sweet spot
- **Experience:** mix "smart" + "lucky" thường effective

**Ví dụ Mid-core PS:**
> "Làm sao để player vừa cảm thấy thông minh vừa hên cùng lúc, bằng cách buộc họ accept RNG nhưng cho cảm giác kiểm soát qua việc đọc bàn cờ trước mỗi cú bắn?"

### 7.3 Hardcore (1-2h session, mastery-driven)

- **Goal:** thiên về **mastery curve** (skill ceiling cao)
- **Constraint:** Multi-layer constraint OK (constraint trên constraint)
- **Experience:** tập trung vào "depth", "discovery", "expression"

**Ví dụ Hardcore PS:**
> "Làm sao để player cảm thấy như cao thủ cờ đọc trước nước, bằng cách ép họ predict opponent intent + counter qua build deck dài hạn, nhằm tạo trải nghiệm chiến thắng qua intelligence không phải reflex?"

---

## 8. Multi-PS Hierarchy (game đa-layer)

Nếu game có **nhiều layer** (vd PVP + Roguelike + Puzzle), 1 PS thường KHÔNG đủ. Cần phân hierarchy:

```
Core PS (1 main)
   │
   ├── Sub-PS A (mở rộng cho layer 1)
   ├── Sub-PS B (mở rộng cho layer 2)
   └── Sub-PS C (mở rộng cho layer 3)
```

**Quy tắc:**
- **Core PS** đặt bài toán cốt lõi cho cả game
- **Sub-PS** đặt bài toán cho từng layer/system
- Sub-PS phải **không mâu thuẫn** với Core PS
- Ưu tiên 1 Core PS + tối đa 3 Sub-PS (>3 → game scope quá rộng, nên cut)

**Ví dụ:** Game Roguelike PVP

- **Core PS:** "Làm sao để player cảm thấy chuẩn bị trước trận quan trọng hơn skill trong trận, bằng cách giới hạn input runtime + cho phép build deck đa dạng?"
- **Sub-PS A (Combat layer):** "Làm sao mỗi turn combat thành moment hồi hộp, bằng cách hidden info từ opponent + 5s timer?"
- **Sub-PS B (Roguelike layer):** "Làm sao mỗi run feel khác nhau, bằng cách random card pool + permanent meta-progression?"

**Anti-pattern:** Quá nhiều Sub-PS không liên quan → game incoherent.

---

## 9. Ví dụ thực tế (mở rộng)

### Game Kinh dị
> "Làm sao để tạo sự sợ hãi khi công cụ phòng vệ duy nhất của player (ánh sáng) lại là thứ chỉ dẫn kẻ thù tìm thấy họ?"

- Goal: tạo sợ hãi
- Constraint (Trade-off): an toàn hay bị phát hiện
- Experience: paranoia liên tục

### Game Chiến thuật
> "Làm sao để buộc player phải hy sinh những đơn vị mạnh nhất để bảo vệ những đơn vị yếu nhất, nhằm tạo ra trải nghiệm về sự tận hiến?"

- Goal: hy sinh có ý nghĩa
- Constraint (Positive): phải bảo vệ unit yếu
- Experience: cảm giác sacrifice

### Game Casual Match-3
> "Làm sao để mỗi swipe cảm thấy có hậu quả lan tỏa, bằng cách combo cascade tự động + giới hạn 20 swipes/level, nhằm tạo cảm giác 'mỗi cú đều quan trọng'?"

- Goal: mỗi swipe có weight
- Constraint (Negative): swipes giới hạn
- Experience: tactical satisfaction nhẹ

### Game Roguelike Card
> "Làm sao để player thấy mỗi run là 1 câu chuyện riêng dù mechanic không đổi, bằng cách random card pool + relics có synergy ẩn, nhằm tạo cảm giác discovery mỗi run?"

- Goal: replayability
- Constraint (Positive): phải craft synergy từ random
- Experience: Discovery + Expression

---

## 10. PS → Decision Quality Bridge

PS chất lượng cao **trực tiếp dẫn đến** decisions chất lượng cao. PS yếu → decisions cũng yếu.

### Quan hệ PS ↔ Decisions

| PS đặc điểm | → Decision quality |
|-------------|---------------------|
| Constraint mạnh + Trade-off | → Decisions có meaningful trade-off (tránh AP1.1 No-brainer) |
| Experience cụ thể | → Decisions có timing & info rõ (tránh AP1.2 Coin-flip) |
| Constraint actionable | → Decisions có cost/value đo được (Anatomy of Choice §1.3) |
| Goal mở (đa giải pháp) | → Decisions có nhiều paths (tránh AP1.4 False choice) |

### Validation flow

Khi viết PS xong, dùng `decisions-guideline.md` để verify:
1. PS có hint at meaningful trade-offs không?
2. PS có suggest concrete decisions không, hay chỉ "feeling"?
3. PS có ép player phải decide (không phải execute) không?

**Nếu PS pass nhưng decisions sau này yếu** → quay lại revise PS, không phải patch decisions.

---

## 11. Tổng kết

**Lời khuyên cuối:** Một PS tốt sẽ khiến team "ngứa ngáy" muốn tìm giải pháp ngay. Nếu viết xong mà team hỏi "Rồi sao nữa?", quay lại Bước 2 và **tăng độ khó của constraint**.

**Workflow chuẩn:**
1. Viết draft PS theo §2 format
2. Run §2.5 Solvability check
3. Verify §3.5 PS-Fun-Audience triangle
4. Choose constraint type §3.6
5. Run §5 Checklist 10 items
6. Scan §6 Anti-pattern catalog
7. Adapt theo Audience §7
8. Decompose nếu multi-layer §8
9. (Optional) Bridge với Decision Quality §10

**Pass tất cả** → PS ready cho Bước 1.5.
