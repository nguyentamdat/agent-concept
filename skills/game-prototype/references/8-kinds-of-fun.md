# 8 Kinds of Fun (LeBlanc Taxonomy)

Knowledge base cho skill `game-prototype`. Sử dụng ở Phase 1 bước 4 (chọn loại fun mà game nhắm tới).

Nguồn: "MDA: A Formal Approach to Game Design" — LeBlanc, Hunin, Zubek (2004).

## Cách dùng

1. Trình bảng 8 loại cho user.
2. User chọn **1-3 loại ưu tiên** (không nhiều hơn — tập trung mới deliver được fun).
3. Mọi gameplay suggestion sau đó phải **chứng minh được mechanic deliver fun đã chọn**.

**Anti-pattern:** Gán đại "game này có Challenge và Discovery" rồi không có bằng chứng. Mỗi loại fun chọn phải tương ứng 1-2 mechanic cụ thể trong gameplay.

## Bảng 8 Kinds of Fun

| # | Tên | Mô tả ngắn | Cảm xúc target | Game ví dụ |
|---|-----|------------|----------------|------------|
| 1 | **Sensation** | Game-as-sense-pleasure. Trải nghiệm thị giác, âm thanh, xúc giác hấp dẫn | Sướng mắt, đã tai, thoả mãn giác quan | Beat Saber, Tetris Effect, Journey |
| 2 | **Fantasy** | Game-as-make-believe. Nhập vai, sống trong thế giới khác | Trốn thoát, hoá thân, mơ mộng | Skyrim, GTA V, Animal Crossing |
| 3 | **Narrative** | Game-as-drama. Kể chuyện qua sự kiện và lựa chọn | Hồi hộp, xúc động, tò mò cốt truyện | The Last of Us, Disco Elysium, Detroit: Become Human |
| 4 | **Challenge** | Game-as-obstacle-course. Vượt qua thử thách, mài kỹ năng | Tự hào, quyết tâm, thoả mãn vượt khó | Dark Souls, Celeste, Chess |
| 5 | **Fellowship** | Game-as-social-framework. Kết nối, chơi cùng người khác | Thân thiện, đồng đội, thuộc về | Among Us, Animal Crossing, MMO |
| 6 | **Discovery** | Game-as-uncharted-territory. Khám phá thế giới, hệ thống, bí mật | Tò mò, kinh ngạc, "aha moment" | Outer Wilds, Subnautica, No Man's Sky |
| 7 | **Expression** | Game-as-self-discovery. Tự thể hiện, sáng tạo, để lại dấu ấn cá nhân | Sáng tạo, tự hào sản phẩm | Minecraft, Mario Maker, Animal Crossing |
| 8 | **Submission** | Game-as-pastime. Thư giãn, lặp lại nhịp đều, "vô tâm" | An toàn, dễ chịu, "zen mode" | Stardew Valley, Idle games, Solitaire |

## Hướng dẫn map gameplay → fun

Khi user chọn 1-3 loại fun, AI **phải verify** mỗi loại có tương ứng mechanic cụ thể trong gameplay options sau:

| Loại fun | Cần có mechanic gì để deliver |
|----------|-------------------------------|
| Sensation | Visual feedback mạnh (combo, particle, sound) |
| Fantasy | Theme + roleplay element + thế giới có "luật riêng" |
| Narrative | Câu chuyện theo tuyến tính/branching, NPC dialog, event |
| Challenge | Độ khó tăng dần, skill ceiling, fail state có ý nghĩa |
| Fellowship | Multiplayer / co-op / social feature (chat, gift, leaderboard) |
| Discovery | Map/world để explore, secret, hidden mechanic |
| Expression | Customization, build crafting, sandbox tool |
| Submission | Loop ngắn, không stress, không fail state hard |

## Quy tắc kết hợp

- 1 game **không thể deliver tốt cả 8** — chọn 1-3 cái core
- Loại fun chính = 1 cái dominate (60%+ trải nghiệm)
- Loại fun phụ = 1-2 cái support
- Tránh combo mâu thuẫn: Submission + Challenge (không thể vừa zen vừa khó), Fellowship + Narrative single-player
