# Guided Brainstorm — Hướng Dẫn Dẫn Dắt

AI dẫn dắt user qua **4 vòng** câu hỏi lý thuyết để cùng xây dựng concept từng bước. Hỏi từng vòng một — không hỏi dồn. Ghi nhận câu trả lời trước khi chuyển vòng tiếp theo.

---

## Quy Tắc Format Câu Hỏi: 3 Gợi Ý + 1 Tự Điền

**MỌI câu hỏi** (câu chính và câu đào sâu) PHẢI có đúng format sau:

```
> [Câu hỏi]
>
> A) [Gợi ý 1 — bám sát context]
> B) [Gợi ý 2 — bám sát context]
> C) [Gợi ý 3 — bám sát context]
> D) Tự điền: ___
```

**Nguyên tắc tạo 3 gợi ý:**

1. **Bám sát mục tiêu thiết kế ban đầu** — genre, theme, target audience, player type, problem statement đã xác định
2. **Dựa trên các câu trả lời trước đó** — mỗi vòng tiếp theo, gợi ý phải phản ánh những gì user đã chọn ở vòng trước. Ví dụ: nếu Vòng 1 chọn Challenge, thì gợi ý Vòng 2 phải nghiêng về tone căng thẳng, không phải cute
3. **Đa dạng nhưng hợp lý** — 3 gợi ý phải khác nhau rõ ràng (không phải 3 biến thể của cùng 1 ý), nhưng tất cả đều phải phù hợp với context. Không đưa gợi ý "lạc đề" chỉ để đa dạng
4. **Cụ thể, không generic** — "Vương quốc nơi phép thuật bị cấm" tốt hơn "Thế giới fantasy". Gợi ý phải đủ cụ thể để user hình dung ngay
5. **Mỗi gợi ý kèm 1 câu giải thích ngắn** — tại sao nó phù hợp với context hiện tại

**Ví dụ đúng** (game RPG, Challenge, hardcore, 18-24):
> Bối cảnh game diễn ra ở đâu?
>
> A) **Lục địa bị nguyền rủa** — phù hợp tone Challenge vì player luôn ở trong vùng nguy hiểm, mỗi bước đi đều có rủi ro
> B) **Đấu trường thần thánh giữa các phe phái** — tạo điều kiện cho PvP/PvE cạnh tranh gay gắt, phù hợp hardcore
> C) **Mê cung thay đổi liên tục (procedural)** — mỗi run khác nhau, phù hợp Challenge + Discovery qua khám phá bất ngờ
> D) Tự điền: ___

**Ví dụ SAI** (gợi ý không bám context):
> A) Thế giới fantasy *(quá generic)*
> B) Trường học hiện đại *(không phù hợp hardcore RPG Challenge)*
> C) Vương quốc phép thuật *(generic, không khác A)*

---

## Vòng 1 — Fun & Emotion *(8 Kinds of Fun)*

**Mục đích:** Xác định loại cảm xúc cốt lõi game muốn tạo ra — đây là "đích đến" mà mọi quyết định design sau này phải phục vụ.

---

### Câu hỏi chính

> Sau khi chơi xong một session, bạn muốn player cảm thấy điều gì nhất?

Chọn **1–2** cảm giác phù hợp nhất:

| | Loại fun | Cảm giác cốt lõi | Game tham khảo |
|--|----------|-----------------|----------------|
| A | **Sensation** | Thỏa mãn về giác quan — phản xạ, thao tác trơn tru, "game feel" | Osu!, Geometry Dash, Fruit Ninja |
| B | **Fantasy** | Được sống trong thế giới khác, trở thành nhân vật mà ngoài đời không thể | Genshin Impact, Stardew Valley |
| C | **Narrative** | Tò mò chuyện gì xảy ra tiếp theo, muốn biết kết thúc | Visual novel, Ace Attorney |
| D | **Challenge** | Chiến thắng sau nỗ lực thực sự, cảm giác "tôi làm được" | Dark Souls, Clash Royale |
| E | **Fellowship** | Gắn kết với người khác — cùng nhau hoặc đối đầu | Among Us, PUBG, Pokémon GO |
| F | **Discovery** | Tự mình khám phá ra điều ẩn giấu, "à ra thế" | Minecraft, Monument Valley |
| G | **Expression** | Thể hiện bản thân, sáng tạo, để lại dấu ấn riêng | Animal Crossing, The Sims |
| H | **Submission** | Thư giãn, routine dễ chịu, không cần suy nghĩ nhiều | Hay Day, idle clicker |

> *(Đây là câu hỏi duy nhất dùng bảng 8 lựa chọn cố định thay vì format 3+1, vì 8 Kinds of Fun là danh sách đóng. Các câu hỏi sau sẽ dùng format 3+1.)*

---

### Câu hỏi đào sâu

Sau khi user chọn aesthetic, hỏi thêm để làm rõ. **3 gợi ý ở các câu đào sâu phải dựa trên aesthetic vừa chọn + genre + target audience.**

**1. Khoảnh khắc đỉnh cao:**
> Trong toàn bộ trải nghiệm, khoảnh khắc nào bạn muốn player nhớ nhất khi kể cho bạn bè nghe?

**Cách generate 3 gợi ý:** Dựa trên aesthetic đã chọn + genre + audience. Mỗi gợi ý là 1 khoảnh khắc cụ thể (không phải mô tả abstract).

*Ví dụ nếu user chọn Challenge + game Action RPG + hardcore:*
> A) **Hạ boss sau nhiều lần thất bại** — khoảnh khắc "cuối cùng cũng thắng", đỉnh cao của Challenge
> B) **Tìm ra combo skill bất ngờ hủy diệt kẻ địch** — khoảnh khắc "tôi thông minh", kết hợp Challenge + Discovery
> C) **Clutch thắng khi chỉ còn 1 HP** — khoảnh khắc "thót tim", tạo câu chuyện đáng nhớ
> D) Tự điền: ___

**2. Cảm xúc KHÔNG muốn:**
> Ngược lại, cảm giác nào bạn KHÔNG muốn player có?

**Cách generate 3 gợi ý:** Dựa trên aesthetic đã chọn, liệt kê 3 cảm xúc tiêu cực phổ biến nhất mà genre/audience này hay gặp. Đây là các rủi ro thiết kế thực tế.

*Ví dụ nếu user chọn Challenge + game Action RPG + hardcore:*
> A) **Bực bội vì thua do may rủi** — mất 30 phút tiến trình vì 1 critical hit random, không phải vì thiếu skill
> B) **Nhàm chán vì đã tìm ra "meta build" duy nhất** — mọi thứ thách biến mất khi có dominant strategy
> C) **Choáng ngợp vì quá nhiều hệ thống phức tạp ngay từ đầu** — player không biết bắt đầu từ đâu
> D) Tự điền: ___

**3. Game tham khảo:**
> Game nào bạn từng chơi tạo ra cảm giác gần nhất? Điều gì ở game đó khiến bạn thích nhất?

**Cách generate 3 gợi ý:** Đưa ra 3 game phổ biến phù hợp genre + aesthetic + audience, kèm 1 câu chỉ rõ điểm mạnh cảm xúc của game đó.

*Ví dụ nếu user chọn Challenge + game Action RPG + mobile hardcore:*
> A) **Hades** — cảm giác "mỗi lần chết đều học được gì đó", progression qua thất bại
> B) **Clash Royale** — mỗi trận 3 phút căng thẳng đỉnh điểm, quyết định nhanh dưới áp lực
> C) **Slay the Spire** — build strategy qua từng run, mỗi lựa chọn đều meaningful
> D) Tự điền: ___

---

### Điều cần ghi nhận

- **Primary aesthetic:** 1–2 loại fun được chọn
- **Secondary aesthetic:** nếu user đề cập thêm
- **Khoảnh khắc đỉnh:** ghi lại verbatim → dùng để viết "Điểm hấp dẫn riêng" trong Synthesis
- **Cảm xúc cần tránh:** đây là constraint thiết kế — ghi vào ⚠️ Lưu ý trong Synthesis
- **Reference game + lý do thích:** gợi ý hướng mechanics khi làm Pitching Concept

---

## Vòng 2 — Core Decision *(Meaningful Decisions + Anatomy of a Choice)*

**Mục đích:** Xác định quyết định quan trọng nhất — "trái tim" của gameplay, thứ phân biệt game này với việc chỉ nhấn nút.

*Phản chiếu lại:* "Bạn muốn game tạo cảm giác [aesthetic]. Bây giờ hãy tìm ra khoảnh khắc gameplay thú vị nhất."

---

### Câu hỏi chính

**1. Tình huống quyết định:**
> Trong một session, khoảnh khắc nào player phải suy nghĩ nhiều nhất?

**Cách generate 3 gợi ý:** Dựa trên aesthetic + genre + setting + player role. Mỗi gợi ý mô tả 1 tình huống cụ thể (không phải mechanic trừu tượng), kèm trade-off rõ ràng.

*Ví dụ nếu Challenge + RPG + "Tháp phép thuật" + "Thợ săn quái vật":*
> A) **Trước mỗi tầng, chọn 1 trong 3 con đường: dễ-ít loot / vừa-loot vừa / khó-loot hiếm** — trade-off rủi ro vs phần thưởng, quyết định dựa trên tình trạng HP/item hiện tại
> B) **Giữa combat, chọn dùng kỹ năng mạnh (cooldown dài) hay combo kỹ năng yếu (an toàn hơn)** — trade-off burst damage vs sustained damage, phụ thuộc vào pattern kẻ địch
> C) **Sau khi hạ quái, chọn: lấy item rare (nặng, chiếm slot) hay bỏ qua để giữ mobility** — trade-off sức mạnh tương lai vs linh hoạt hiện tại
> D) Tự điền: ___

**2. Lựa chọn và hậu quả:**
> Mỗi lựa chọn dẫn đến điều gì khác nhau?

**Cách generate 3 gợi ý:** Dựa trên tình huống user vừa chọn, mô tả 3 mô hình hậu quả khác nhau.

*Ví dụ nếu user chọn "chọn đường trước mỗi tầng":*
> A) **Hậu quả tức thì + dài hạn** — đường khó cho loot tốt hơn cho tầng SAU, không chỉ tầng hiện tại. Mỗi lựa chọn ảnh hưởng cả run
> B) **Hậu quả ngẫu nhiên có trọng số** — đường khó có 70% loot hiếm + 30% bẫy nguy hiểm. Player đánh giá xác suất dựa trên kinh nghiệm
> C) **Hậu quả xã hội** — đường khó mở shortcut cho những run sau (persistent unlock). Player đầu tư cho tương lai
> D) Tự điền: ___

---

### Câu hỏi đào sâu

**3. Nguồn áp lực:**
> Điều gì tạo áp lực buộc player phải quyết định nhanh thay vì suy nghĩ mãi?

**Cách generate 3 gợi ý:** Dựa trên aesthetic + genre. Challenge thường cần áp lực rõ ràng; Submission thì không.

*Ví dụ nếu Challenge + "Tháp phép thuật":*
> A) **Timer đếm ngược mỗi tầng** — đứng quá lâu = tầng sụp đổ. Buộc player quyết định nhanh
> B) **Quái vật spawn liên tục** — không quyết định = bị bao vây. Áp lực tự nhiên từ gameplay
> C) **Tài nguyên hồi phục giảm dần theo thời gian** — càng chần chừ càng yếu đi. Áp lực ngầm
> D) Tự điền: ___

**4. Thông tin player có:**
> Khi đưa ra quyết định, player biết gì và KHÔNG biết gì?

**Cách generate 3 gợi ý:** Dựa trên core decision vừa chọn. Mỗi gợi ý là 1 mức "sương mù thông tin" khác nhau.

*Ví dụ nếu "chọn đường trước mỗi tầng":*
> A) **Biết rõ độ khó, chỉ ẩn loại quái** — player đánh giá được risk, bất ngờ đến từ encounters cụ thể
> B) **Chỉ biết biểu tượng mơ hồ (lửa, băng, ?)** — player đoán dựa trên kinh nghiệm tích lũy qua nhiều run
> C) **Biết toàn bộ thông tin nhưng chỉ có 5 giây chọn** — pressure đến từ thời gian, không phải thiếu thông tin
> D) Tự điền: ___

**5. Tần suất và biến thể:**
> Quyết định này xảy ra bao nhiêu lần trong 1 session? Mỗi lần có khác nhau không?

**Cách generate 3 gợi ý:** Dựa trên session structure đã hint.

*Ví dụ nếu "tháp 100 tầng, mỗi session = 1 run":*
> A) **Mỗi 5 tầng một lần (khoảng 6-8 lần/run)** — đủ thường xuyên để quan trọng, đủ giãn cách để suy nghĩ
> B) **Mỗi tầng (liên tục)** — micro-decisions nhanh, tạo nhịp "chọn → hành động → chọn"
> C) **Chỉ ở các tầng boss (3-4 lần/run)** — mỗi lần là big decision, stakes cao
> D) Tự điền: ___

**6. Kết quả thất bại:**
> Nếu player chọn sai, điều gì xảy ra?

**Cách generate 3 gợi ý:** Dựa trên aesthetic + audience. Hardcore = hậu quả nặng. Casual = forgiving.

*Ví dụ nếu Challenge + hardcore:*
> A) **Mất toàn bộ run, quay lại tầng 1** — high stakes, mỗi quyết định đều "sống còn" (roguelike classic)
> B) **Mất tầng hiện tại + 1 item, chơi lại tầng đó** — đau nhưng không mất hết, cho cơ hội học
> C) **Không chết nhưng bị debuff nặng cho 3 tầng tiếp** — hậu quả kéo dài, player phải adapt thay vì restart
> D) Tự điền: ___

---

### Kiểm tra chất lượng quyết định

Sau khi nhận câu trả lời, tự kiểm tra:

| Vấn đề | Dấu hiệu nhận biết | Gợi ý |
|--------|-------------------|-------|
| **Blind Decision** | Player không có đủ thông tin để quyết định hợp lý | Cần thêm cơ chế thông tin (preview, scout, hint) |
| **Dominant Strategy** | Luôn có 1 lựa chọn rõ ràng tốt hơn | Cần điều chỉnh trade-off — thêm cost cho lựa chọn "an toàn" |
| **Meaningless Choice** | Kết quả thất bại = "không có gì" | Cần stakes rõ ràng hơn |
| **Quá nhiều lựa chọn** | Player liệt kê 7+ phương án | Thu hẹp xuống 2-3 core choice có trade-off rõ |

Nếu phát hiện vấn đề: ghi chú nhẹ nhàng, đề xuất hướng điều chỉnh, không phủ nhận ý tưởng.

---

### Điều cần ghi nhận

- Core decision: mô tả cụ thể (tình huống + lựa chọn + hậu quả)
- Nguồn áp lực → ảnh hưởng đến Interest Curve (Vòng 3)
- Thông tin player có/không có → thiết kế Feedback System trong GCD-Gameplay
- Tần suất → ước tính session structure
- Kết quả kiểm tra chất lượng

---

## Vòng 3 — Rhythm & Intensity *(Game Flow + Interest Curves)*

**Mục đích:** Xác định game "thở" như thế nào — nhịp căng/thả, thời gian session, và điều gì giữ player muốn chơi tiếp.

*Phản chiếu lại:* "Bạn muốn player [cảm giác], với quyết định cốt lõi là [decision]. Bây giờ hãy xác định nhịp điệu một session diễn ra."

---

### Câu hỏi chính

**1. Thời lượng session:**
> Một session lý tưởng kéo dài bao lâu?

**Cách generate 3 gợi ý:** Dựa trên genre + audience + aesthetic. Mỗi gợi ý kèm lý do tại sao phù hợp.

*Ví dụ nếu Challenge + RPG + hardcore + mobile:*
> A) **5–10 phút/run** — đủ ngắn để chơi trên mobile, đủ dài để có build-up và climax. Phù hợp roguelike
> B) **15–20 phút/run** — cho phép strategy sâu hơn, nhưng cần checkpoint giữa session. Phù hợp nếu mỗi tầng có nhiều encounter
> C) **2–3 phút/run (speed run style)** — micro-sessions căng thẳng liên tục, replay nhiều. Phù hợp nếu focus vào reflex + quick decisions
> D) Tự điền: ___

**2. Điểm khởi đầu:**
> Player bắt đầu mỗi session ở trạng thái nào?

**Cách generate 3 gợi ý:** Dựa trên genre + core decision. Mỗi gợi ý tạo dynamic khác nhau cho decision đã chọn.

*Ví dụ nếu "tháp roguelike" + "chọn đường mỗi tầng":*
> A) **Từ tầng 1, sức mạnh = 0, build lại từ đầu mỗi run** — mỗi run là trải nghiệm mới, decision ở tầng đầu rất khác tầng cuối
> B) **Từ checkpoint tầng đã unlock (mỗi 10 tầng)** — giảm frustration khi mất run, nhưng vẫn phải chinh phục tầng còn lại
> C) **Chọn "loadout" trước khi vào tháp** — meta-decision trước run ảnh hưởng cả session. Decision bắt đầu từ trước khi chơi
> D) Tự điền: ___

**3. Đường cong cường độ:**
> Cường độ căng thẳng trong session biến đổi thế nào?

**Cách generate 3 gợi ý:** Dựa trên aesthetic + session length + core decision. Mỗi pattern kèm mô tả cụ thể cho game này.

*Ví dụ nếu Challenge + "5-10 phút" + "tháp roguelike":*
> A) **Tăng dần đến đỉnh** — tầng 1-3 dễ (học cách chơi), tầng 4-7 khó dần (áp dụng chiến thuật), tầng 8-10 boss (tất cả hoặc không gì)
> B) **Peak-Valley** — mỗi 2 tầng combat xen kẽ 1 tầng "safe room" (chọn item, hồi phục). Nhịp: căng → thở → căng mạnh hơn → thở → climax
> C) **Escalation with surprise burst** — tăng đều nhưng ngẫu nhiên có tầng "Elite" bất ngờ, phá vỡ nhịp đều và buộc adapt
> D) Tự điền: ___

---

### Câu hỏi đào sâu

**4. Khoảnh khắc nghỉ:**
> Trong session, có đoạn nào player được "thở" không? Lúc đó họ làm gì?

**Cách generate 3 gợi ý:** Dựa trên intensity pattern vừa chọn.

*Ví dụ nếu "Peak-Valley" + "safe room":*
> A) **Safe room: chọn 1 trong 3 item + hồi 30% HP** — rest point vừa là reward vừa là decision (chọn item nào)
> B) **Cutscene ngắn 10 giây giữa các tầng** — narrative break, không có decision, chỉ thở
> C) **Minigame nhẹ (fishing, puzzle)** — thay đổi nhịp hoàn toàn, reset tâm lý trước khi combat lại
> D) Tự điền: ___

**5. Khoảnh khắc đỉnh cao:**
> Khoảnh khắc hồi hộp nhất trong session diễn ra khi nào?

**Cách generate 3 gợi ý:** Dựa trên intensity pattern + core decision.

*Ví dụ nếu "tăng dần đến đỉnh":*
> A) **Boss tầng cuối — attack pattern mới hoàn toàn, chỉ có 1 cơ hội** — climax rõ ràng, "now or never"
> B) **Tầng áp chót — phải chọn dùng hết item hay giữ cho boss** — tension cực đại vì biết boss đang chờ
> C) **Khoảnh khắc random "Tháp rung chuyển" — tất cả quái rush cùng lúc** — burst surprise, adrenaline spike
> D) Tự điền: ___

**6. Phần thưởng sau đỉnh:**
> Sau khoảnh khắc căng thẳng nhất, player nhận gì?

**Cách generate 3 gợi ý:** Dựa trên aesthetic + motivation direction.

*Ví dụ nếu Challenge + roguelike:*
> A) **Item hiếm + unlock nhân vật mới cho run sau** — reward vừa cho run này vừa cho meta-progression
> B) **Leaderboard ranking + replay ghost** — challenge-oriented reward: bạn giỏi cỡ nào so với người khác
> C) **Lore fragment — mỗi run thắng mở 1 mảnh câu chuyện** — reward narrative cho những ai muốn hiểu sâu hơn
> D) Tự điền: ___

**7. Hook session tiếp theo:**
> Sau khi kết thúc session, điều gì khiến player muốn chơi lại ngay?

**Cách generate 3 gợi ý:** Dựa trên toàn bộ context đã có — aesthetic, world, decision, rhythm.

*Ví dụ nếu Challenge + roguelike + "tháp phép thuật":*
> A) **"Lần này tôi biết cách counter boss rồi, chỉ cần build đúng item"** — knowledge = power, muốn thử lại với chiến thuật mới
> B) **"Tôi mới unlock class mới, chắc gameplay khác hẳn"** — tò mò về meta-progression content
> C) **"Tôi đã tới tầng 87, chỉ còn 13 tầng nữa"** — near-miss effect, gần đích quá không thể dừng
> D) Tự điền: ___

---

### Kiểm tra Flow sau Vòng 3

| Session length | Phù hợp với aesthetic | Lưu ý |
|---------------|----------------------|-------|
| < 2 phút | Sensation, Submission | Khó tạo deep Flow; phù hợp pick-up play |
| 2–5 phút | Challenge, Fellowship | Cần hook mạnh ngay đầu; reward phải rõ |
| 5–15 phút | Discovery, Challenge, Fantasy | Đây là "Flow zone" — đủ time để immerse |
| 15–30 phút | Narrative, Fellowship, Fantasy | Cần rest point tránh fatigue |
| 30 phút+ | Narrative, Discovery | Cần save system; session exit point tự nhiên |

Nếu session length mâu thuẫn với aesthetic từ Vòng 1: gợi ý điều chỉnh nhẹ nhàng.

---

### Điều cần ghi nhận

- Session length target
- Interest curve pattern (tên pattern + mô tả cụ thể cho game này)
- Rest points: có hay không, diễn ra như thế nào
- Peak moment: khi nào, phần thưởng là gì
- Hook cho session tiếp theo → đây là retention mechanic cốt lõi
- Kết quả kiểm tra Flow consistency

---

## Vòng 4 — Synthesis *(Tổng Hợp)*

**Mục đích:** AI tổng hợp toàn bộ câu trả lời thành 1 concept statement hoàn chỉnh, trình cho user xác nhận.

> *(Vòng này không hỏi câu hỏi mới — AI tổng hợp và trình bày. Không áp dụng format 3+1.)*

---

### Format tổng hợp

```
# [TÊN GỢI Ý] — Concept Statement

**Problem Statement:** [problem statement đã chọn ở bước trước]

---

## Core Experience

[Tên game] là game [genre] cho [target audience].

Cảm xúc cốt lõi: **[Primary Aesthetic]** — [mô tả cảm giác bằng ngôn ngữ của user từ Vòng 1]

---

## Khoảnh Khắc Gameplay Cốt Lõi

Player phải quyết định: **[tình huống core decision từ Vòng 2]**

Lựa chọn: [option A] vs [option B] vs [option C nếu có]
Áp lực đến từ: [nguồn áp lực từ Vòng 2]
Hậu quả rõ ràng: [kết quả của mỗi lựa chọn]

---

## Nhịp Độ Session

Session [thời lượng] theo pattern: **[tên pattern từ Vòng 3]**

- Bắt đầu: [điểm khởi đầu]
- Đỉnh cao: [khoảnh khắc căng thẳng nhất — khi nào, phần thưởng là gì]
- Hook tiếp theo: [điều giữ player quay lại]

---

## Điểm Hấp Dẫn Riêng

[2–3 câu tóm tắt tại sao concept này thú vị — rút ra từ sự kết hợp độc đáo của
aesthetic + world + decision + rhythm. Đây là "pitch" ngắn gọn nhất của game]

---

⚠️ Lưu Ý Thiết Kế (nếu có)

- [Vấn đề phát hiện trong quá trình brainstorm + gợi ý điều chỉnh]
- [Mâu thuẫn giữa các lựa chọn + đề xuất giải pháp]
- [Cảm xúc cần tránh từ Vòng 1 + cách design tránh nó]
```

---

### Câu hỏi xác nhận

> Concept này có phản ánh đúng ý bạn không?
>
> **A) Đúng rồi** → tiếp tục Generate Pitching Concept đầy đủ
> **B) Chỉnh một vài điểm** → user nêu điểm cần thay đổi, AI cập nhật và trình lại
> **C) Bắt đầu lại một vòng cụ thể** → quay về vòng user muốn làm lại

**DỪNG LẠI** — chờ user xác nhận trước khi sang bước Pitching Concept.

---

## Nguyên Tắc Dẫn Dắt

1. **Format 3+1 bắt buộc** — mọi câu hỏi (trừ Vòng 1 bảng 8 aesthetics và Vòng 4 synthesis) phải có 3 gợi ý contextual + 1 tự điền. Không bao giờ hỏi open-ended không có gợi ý.
2. **Gợi ý phải tiến hóa** — gợi ý ở Vòng 3 phải phản ánh tất cả lựa chọn từ Vòng 1-2. Không bao giờ tạo gợi ý chỉ dựa trên genre mà bỏ qua context đã tích lũy.
3. **Hỏi từng vòng một** — đợi câu trả lời xong mới chuyển vòng tiếp theo.
4. **Phản chiếu lại** — trước mỗi vòng, tóm tắt 1 câu những gì đã xác định được, để user thấy concept đang hình thành dần.
5. **Đào sâu có chọn lọc** — không hỏi hết tất cả câu hỏi phụ. Chỉ hỏi thêm khi câu trả lời chính quá mơ hồ hoặc khi phát hiện vấn đề cần làm rõ.
6. **Không phán xét** — mọi câu trả lời đều hợp lệ. Nếu có vấn đề thiết kế, ghi nhận và đề xuất nhẹ nhàng bằng câu hỏi, không phủ nhận.
7. **Linh hoạt bỏ qua** — nếu user không biết trả lời một vòng, AI suy luận từ context và tiếp tục, ghi chú "AI suy luận" trong Synthesis để user xác nhận.
