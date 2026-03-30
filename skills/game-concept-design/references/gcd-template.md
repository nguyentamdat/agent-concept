# Phase B: GCD Template

Sử dụng template này để viết Game Concept Document sau khi Phase A Outline được approve.

## Template

~~~markdown
# [TÊN GAME] — Game Concept Document

**Version:** [1.0]
**Ngày tạo:** [YYYY-MM-DD]
**Cập nhật:** [YYYY-MM-DD]
**Trạng thái:** [Draft / Review / Approved]

---

## 1. Tổng Quan Game

*Lý thuyết áp dụng: Problem Statements*

### 1.1 Concept Statement

[Game name] là game [genre] cho [target audience] giải quyết [vấn đề/nhu cầu] bằng cách [approach/mechanic chính].

### 1.2 Thông Tin Cơ Bản

| Thông tin | Giá trị |
|-----------|---------|
| Genre | [genre] |
| Sub-genre | [sub-genre] |
| Platform | Mobile |
| Target Audience | [audience + độ tuổi] |
| Monetization | [model] |
| Session Length | [thời gian phiên chơi mục tiêu] |

### 1.3 USP (Unique Selling Point)

[Điều gì khiến game này khác biệt? 2-3 bullet points]

### 1.4 Reference Games

| Game | Điểm tham khảo | Điểm khác biệt |
|------|-----------------|-----------------|
| [game 1] | [học gì từ game này] | [concept này khác thế nào] |
| [game 2] | [học gì từ game này] | [concept này khác thế nào] |

---

## 2. Trải Nghiệm Cốt Lõi

*Lý thuyết áp dụng: 8 Kinds of Fun, MDA Framework, Milieu*

### 2.1 Target Aesthetics (8 Kinds of Fun)

**Primary Aesthetics:**
- [Aesthetic 1]: [Tại sao chọn — liên hệ với audience và concept]
- [Aesthetic 2]: [Tại sao chọn]

**Secondary Aesthetics:**
- [Aesthetic 3]: [Vai trò bổ trợ]

### 2.2 MDA Analysis

#### Mechanics → Dynamics → Aesthetics Mapping

| Mechanic (Rules) | Dynamic (Behaviors) | Aesthetic (Emotions) |
|-------------------|---------------------|----------------------|
| [mechanic 1] | [behavior emerge từ mechanic] | [emotional response] |
| [mechanic 2] | [behavior emerge từ mechanic] | [emotional response] |
| [mechanic 3] | [behavior emerge từ mechanic] | [emotional response] |

#### Reverse Check

| Target Aesthetic | Required Dynamic | Supporting Mechanic | ✓/✗ |
|------------------|------------------|---------------------|-----|
| [aesthetic mong muốn] | [dynamic cần có] | [mechanic hỗ trợ] | [có đủ không] |

### 2.3 Milieu

- **Setting:** [thế giới, bối cảnh]
- **Tone:** [nghiêm túc / hài hước / dark / whimsical / ...]
- **Art Direction:** [phong cách visual]
- **Audio Direction:** [phong cách âm thanh]
- **Target Player Types:** [Socializer / Achiever / Explorer / Killer — chọn 1-2 chính]

---

## 3. Core Loop & Mechanics

*Lý thuyết áp dụng: Meaningful Decisions, Anatomy of a Choice, Interesting vs Less-Interesting Decisions*

### 3.1 Core Loop

```
[Diagram dạng text]
Ví dụ:
  ┌→ Explore → Combat → Loot ─┐
  │                             │
  └──── Upgrade ←──────────────┘
```

### 3.2 Primary Mechanics

| Mechanic | Mô tả | Aesthetic hỗ trợ |
|----------|-------|-------------------|
| [mechanic 1] | [chi tiết] | [aesthetic nào] |
| [mechanic 2] | [chi tiết] | [aesthetic nào] |

### 3.3 Secondary Mechanics

| Mechanic | Mô tả | Vai trò |
|----------|-------|---------|
| [mechanic 1] | [chi tiết] | [bổ trợ core loop thế nào] |

### 3.4 Meaningful Decisions — Phân Tích Decision Points

#### Decision Point 1: [Tên]

| Khía cạnh | Phân tích |
|-----------|-----------|
| **Before** (Bối cảnh) | [Game state khi player đối mặt quyết định] |
| **Communication** (Truyền đạt) | [Player biết có choices bằng cách nào] |
| **Action** (Hành động) | [Player thực hiện choice thế nào] |
| **Consequences** (Hậu quả) | [Kết quả + ảnh hưởng lên future choices] |
| **Feedback** (Phản hồi) | [Player biết kết quả thế nào] |

[Lặp lại cho mỗi decision point chính trong core loop]

### 3.5 Decision Quality Check

| Kiểm tra | Kết quả | Ghi chú |
|----------|---------|---------|
| Blind Decisions? | [Có/Không] | [Chi tiết nếu có] |
| Dominant Strategies? | [Có/Không] | [Chi tiết nếu có] |
| Meaningless Choices? | [Có/Không] | [Chi tiết nếu có] |
| Mọi decision có trade-off? | [Có/Không] | [Chi tiết nếu không] |

---

## 4. Game Flow & Pacing

*Lý thuyết áp dụng: Game Flow (Csikszentmihalyi), Interest Curves*

### 4.1 Flow Analysis

- **Flow Channel Width:** [Narrow (hardcore) / Wide (casual) / Medium]
- **Challenge Scaling Strategy:** [Cách tăng challenge theo player skill]
- **Rest Points:** [Khi nào player được nghỉ]

#### Challenge Curve (Phiên Chơi Điển Hình)

```
Engagement
  ▲
  │      ╱╲    ╱╲     ╱╲╲
  │    ╱╱  ╲╲╱╱  ╲╲╱╱    ╲
  │  ╱╱                    ╲
  │╱╱                       ╲
  └──────────────────────────→ Time
  Hook  Rise  Rest  Rise  Climax  End
```

### 4.2 Interest Curve

| Thời điểm | Event | Interest Level | Ghi chú |
|------------|-------|----------------|---------|
| 0-30s | [Hook event] | ▲ Rising | [Gì giữ player] |
| 1-3min | [First challenge] | ▲ Rising | [First payoff] |
| 3-5min | [Rest/reward] | ▼ Dip | [Nghỉ nhưng trên floor] |
| 5-8min | [Escalation] | ▲▲ Rising | [Tăng stakes] |
| 8-10min | [Session climax] | ▲▲▲ Peak | [Payoff lớn] |
| End | [Session end] | ▲ Above start | [Player muốn chơi lại] |

### 4.3 Session Structure

- **Session length mục tiêu:** [phút]
- **Số sessions/ngày mục tiêu:** [số]
- **Session hook:** [gì kéo player vào session mới]
- **Session exit point:** [natural stopping point ở đâu]

---

## 5. Progression & Learning

*Lý thuyết áp dụng: Learning Curves, Randomness*

### 5.1 Learning Curve Design

- **Complexity level:** [Low / Medium / High]
- **First payoff timing:** [khi nào — phải sớm]
- **Tutorial approach:** [Learn-by-doing / Guided / Contextual tips]

#### Onboarding Sequence

| Bước | Mechanic được dạy | Cách dạy | Thời điểm |
|------|-------------------|----------|-----------|
| 1 | [mechanic cơ bản nhất] | [phương pháp] | [khi nào] |
| 2 | [mechanic tiếp theo] | [phương pháp] | [khi nào] |
| 3 | [mechanic kết hợp] | [phương pháp] | [khi nào] |

### 5.2 Skill Progression

| Giai đoạn | Player Level | Mechanics Available | Challenge Level |
|-----------|-------------|--------------------|-----------------|
| Beginner | [mô tả] | [mechanics nào] | [mức challenge] |
| Intermediate | [mô tả] | [thêm mechanics nào] | [mức challenge] |
| Advanced | [mô tả] | [full mechanics] | [mức challenge] |

### 5.3 Randomness Strategy

- **Vị trí trên Skill-Luck spectrum:** [Mostly Skill / Balanced / Mostly Luck]
- **Phù hợp audience:** [Tại sao vị trí này hợp lý]

| Random Element | Loại (Input/Output) | Mục đích | Mitigation |
|----------------|---------------------|----------|------------|
| [element 1] | [Input/Output] | [tại sao cần random] | [cách giảm frustration] |
| [element 2] | [Input/Output] | [tại sao cần random] | [cách giảm frustration] |

---

## 6. Motivation & Retention

*Lý thuyết áp dụng: Intrinsic & Extrinsic Motivation*

### 6.1 Intrinsic Motivation

| Nhu cầu | Cách game đáp ứng |
|---------|-------------------|
| **Autonomy** (Tự chủ) | [Player có choices nào? Cảm giác control thế nào?] |
| **Mastery** (Thành thạo) | [Player học gì? Skill growth thế nào?] |
| **Purpose** (Ý nghĩa) | [Player thuộc về gì? Narrative/community/goal lớn hơn?] |

### 6.2 Extrinsic Motivation

| Reward Type | Schedule | Mô tả |
|-------------|----------|-------|
| [reward 1] | [Fixed / Variable / Milestone] | [chi tiết] |
| [reward 2] | [Fixed / Variable / Milestone] | [chi tiết] |

### 6.3 Motivation Balance

- **Intrinsic test:** Nếu bỏ tất cả rewards, gameplay có còn fun không? [Đánh giá]
- **Overjustification risk:** [Low / Medium / High — giải thích]
- **Retention strategy:** Extrinsic hooks player VÀO → Intrinsic giữ player Ở LẠI [chi tiết]

---

## 7. Đánh Giá & Cảnh Báo

### 7.1 MDA Consistency Check

| Target Aesthetic | Supporting Mechanics | Alignment |
|------------------|---------------------|-----------|
| [aesthetic 1] | [mechanics hỗ trợ] | [✓ Aligned / ⚠ Partial / ✗ Missing] |
| [aesthetic 2] | [mechanics hỗ trợ] | [✓ Aligned / ⚠ Partial / ✗ Missing] |

### 7.2 Potential Issues & Recommendations

| # | Vấn đề | Lý thuyết liên quan | Mức độ | Recommendation |
|---|--------|---------------------|--------|----------------|
| 1 | [mô tả vấn đề] | [lý thuyết nào phát hiện] | [Low/Medium/High] | [đề xuất cụ thể] |
| 2 | [mô tả vấn đề] | [lý thuyết nào phát hiện] | [Low/Medium/High] | [đề xuất cụ thể] |

### 7.3 Tổng Kết Lý Thuyết Đã Áp Dụng

| # | Lý thuyết | Section áp dụng | Insight chính |
|---|-----------|-----------------|---------------|
| 1 | MDA Framework | 2. Trải Nghiệm Cốt Lõi | [insight] |
| 2 | Problem Statements | 1. Tổng Quan | [insight] |
| ... | ... | ... | ... |
~~~

## Hướng Dẫn Viết GCD

1. Bám sát Outline đã approve ở Phase A — không thêm features ngoài scope
2. Đọc `references/game-design-theories.md` TRƯỚC khi viết — dùng câu hỏi kiểm tra ở mỗi lý thuyết
3. Mỗi section phải ghi rõ lý thuyết nào được áp dụng
4. MDA Analysis phải check CẢ HAI CHIỀU: mechanics→aesthetics VÀ aesthetics→mechanics
5. Decision Points: phân tích ít nhất 2-3 decision points chính qua Anatomy of a Choice
6. Section 7 (Đánh Giá): phải thật sự phân tích phê phán, không chỉ xác nhận concept tốt
7. Nếu phát hiện vấn đề: CẢNH BÁO rõ ràng + ĐỀ XUẤT recommendation cụ thể
8. Output hoàn toàn bằng **tiếng Việt**

## Checklist Trước Khi Trình User

- [ ] Concept Statement rõ ràng (Problem Statements)
- [ ] Target Aesthetics được chọn và justified (8 Kinds of Fun)
- [ ] MDA mapping nhất quán — reverse check pass (MDA Framework)
- [ ] Milieu phù hợp aesthetics và genre (Milieu)
- [ ] Core Loop logic, có diagram (Core Loop)
- [ ] Ít nhất 2 decision points được phân tích qua Anatomy of a Choice
- [ ] Không có blind decisions bị lock-in, dominant strategies, meaningless choices
- [ ] Flow channel phù hợp audience (Game Flow)
- [ ] Interest curve có hook, climax, kết thúc trên start (Interest Curves)
- [ ] Learning curve không quá steep, first payoff sớm (Learning Curves)
- [ ] Randomness strategy phù hợp audience (Randomness)
- [ ] Cả 3 intrinsic motivators được address (Motivation)
- [ ] Overjustification risk được đánh giá (Motivation)
- [ ] Section 7 có phân tích phê phán thực sự, không chỉ rubber-stamp
