# Prototype HTML Template

Knowledge base cho skill `game-concept-automatic`. Sử dụng ở Phase 2 (build prototype).

## Triết lý

Prototype HTML đơn file — open bằng double-click trong browser, không cần build tool. CSS + JS inline trong cùng 1 file. Mục tiêu: validate "fun" của core mechanic nhanh nhất, không phải sản phẩm cuối.

## Scope Decision Rules (silent)

AI tự quyết scope dựa vào Target Audience + complexity của Gameplay đã chốt:

| Scope | Tiêu chí | Screens cần có |
|-------|----------|----------------|
| **Minimal** | Casual / hyper-casual, gameplay đơn giản (1-2 loại quyết định) | 1 screen: Core Gameplay (có in-game UI cho start/restart) |
| **Standard** | Mid-core, gameplay vừa (2-3 loại quyết định) | 3 screens: Setup → Gameplay → End/Result |
| **Full** | Hardcore / strategy, gameplay phức tạp (3-4 loại quyết định, có resource management) | 5+ screens: Menu → Setup → Gameplay → Inventory/Shop → End |

AI announce scope cho user trước khi generate, ví dụ:
> "Mình sẽ build Standard 3-screen vì game thuộc mid-core với 2-3 loại quyết định. Bạn OK hay muốn override (Minimal / Full)?"

## HTML Skeleton

Mỗi prototype phải có structure dưới đây:

```html
<!DOCTYPE html>
<html lang="vi">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>[Tên Game] - Demo</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Orbitron:wght@400;700;900&family=Inter:wght@300;400;600;700&display=swap');
  *{margin:0;padding:0;box-sizing:border-box}
  :root{
    --bg:#0a0e1a;
    --card:#131a2e;
    --card2:#1a2340;
    --accent:#00e676;
    --accent2:#00b0ff;
    --danger:#ff5252;
    --gold:#ffd740;
    --text:#e0e0e0;
    --dim:#5a6a8a;
  }
  body{font-family:'Inter',sans-serif;background:var(--bg);color:var(--text);min-height:100vh;overflow-x:hidden}

  /* Screen system */
  .screen{display:none;min-height:100vh;flex-direction:column;align-items:center}
  .screen.active{display:flex}

  /* Typography */
  .orb{font-family:'Orbitron',monospace}

  /* Buttons */
  .btn-main{font-family:'Orbitron',monospace;font-size:1.1em;font-weight:700;padding:14px 50px;border:none;border-radius:50px;background:linear-gradient(135deg,var(--accent),var(--accent2));color:var(--bg);cursor:pointer;transition:transform .2s,box-shadow .2s;text-transform:uppercase;letter-spacing:2px}
  .btn-main:hover{transform:scale(1.05);box-shadow:0 0 30px rgba(0,230,118,.4)}
  .btn-main:disabled{opacity:.4;pointer-events:none}
  .btn-outline{font-family:'Orbitron',monospace;font-size:.9em;padding:10px 30px;border:2px solid var(--accent);border-radius:50px;background:transparent;color:var(--accent);cursor:pointer;transition:all .3s;text-transform:uppercase;letter-spacing:1px}
  .btn-outline:hover{background:var(--accent);color:var(--bg)}

  /* Add screen-specific styles below... */
</style>
</head>
<body>

<!-- Screen 1: Setup (or first screen) -->
<div id="setup-screen" class="screen active">
  <!-- ... -->
</div>

<!-- Screen 2: Gameplay -->
<div id="gameplay-screen" class="screen">
  <!-- ... -->
</div>

<!-- Screen 3: End -->
<div id="end-screen" class="screen">
  <!-- ... -->
</div>

<script>
  // Game state object
  const gameState = {
    // ...properties
  };

  // Screen switcher
  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
  }

  // Init
  function init() {
    // Setup event handlers
  }

  init();
</script>
</body>
</html>
```

## Screen Patterns

### Setup Screen (chọn nhân vật / level / option)

```html
<div id="setup-screen" class="screen active">
  <h1 class="orb setup-title">[Tên Game]</h1>
  <p class="setup-subtitle">[Tagline ngắn]</p>

  <div class="setup-card">
    <!-- Choices: dropdown / slider / radio buttons -->
  </div>

  <button class="btn-main" onclick="startGame()">Start Game</button>
</div>
```

### Gameplay Screen (core loop)

```html
<div id="gameplay-screen" class="screen">
  <header class="gameplay-header">
    <span class="stat">HP: <span id="hp">100</span></span>
    <span class="stat">Score: <span id="score">0</span></span>
    <span class="stat">Turn: <span id="turn">1</span></span>
  </header>

  <main class="gameplay-arena">
    <!-- Visual representation của game state -->
  </main>

  <footer class="gameplay-actions">
    <button class="btn-action" onclick="action1()">[Action 1]</button>
    <button class="btn-action" onclick="action2()">[Action 2]</button>
    <button class="btn-action" onclick="action3()">[Action 3]</button>
  </footer>
</div>
```

### End Screen (win/lose + replay)

```html
<div id="end-screen" class="screen">
  <h1 class="orb end-title" id="end-title">Victory!</h1>
  <div class="end-stats">
    <div>Score: <span id="final-score">0</span></div>
    <div>Turns: <span id="final-turn">0</span></div>
  </div>
  <button class="btn-main" onclick="restart()">Play Again</button>
  <button class="btn-outline" onclick="showScreen('setup-screen')">Menu</button>
</div>
```

## JS State Pattern

```javascript
const gameState = {
  // Player state
  hp: 100,
  score: 0,
  turn: 0,

  // Game-specific state
  inventory: [],
  enemies: [],
  level: 1,

  // Meta
  isOver: false,
  result: null, // 'win' | 'lose' | null
};

function resetState() {
  Object.assign(gameState, {
    hp: 100, score: 0, turn: 0,
    inventory: [], enemies: [], level: 1,
    isOver: false, result: null,
  });
}

function updateUI() {
  document.getElementById('hp').textContent = gameState.hp;
  document.getElementById('score').textContent = gameState.score;
  document.getElementById('turn').textContent = gameState.turn;
  // ...update tất cả UI elements từ state
}

function checkEndCondition() {
  if (gameState.hp <= 0) {
    gameState.isOver = true;
    gameState.result = 'lose';
    endGame();
  } else if (gameState.score >= WIN_SCORE) {
    gameState.isOver = true;
    gameState.result = 'win';
    endGame();
  }
}

function endGame() {
  document.getElementById('end-title').textContent =
    gameState.result === 'win' ? 'Victory!' : 'Game Over';
  document.getElementById('final-score').textContent = gameState.score;
  document.getElementById('final-turn').textContent = gameState.turn;
  showScreen('end-screen');
}
```

## Self-Test Checklist

Sau khi generate HTML, AI **đọc lại file** và verify từng item:

- [ ] **State transitions:** Mọi `showScreen('xxx')` call có id tồn tại trong HTML
- [ ] **Win condition triggerable:** Có code path dẫn đến `gameState.result = 'win'`
- [ ] **Lose condition triggerable:** Có code path dẫn đến `gameState.result = 'lose'`
- [ ] **Buttons có handler:** Mọi `<button onclick="xxx()">` có function `xxx` định nghĩa trong `<script>`
- [ ] **Element IDs khớp:** Mọi `getElementById('xxx')` có element `id="xxx"` trong HTML
- [ ] **Init function called:** Có `init()` hoặc equivalent ở cuối script
- [ ] **No dead code:** Không có function/variable định nghĩa nhưng không dùng
- [ ] **Mobile viewport:** Có `<meta name="viewport">` (đã có trong skeleton)
- [ ] **Color contrast OK:** `--text` đủ contrast với `--bg` cho readability
- [ ] **Reset works:** `restart()` reset state và quay về Setup hoặc Gameplay screen

Nếu fail bất kỳ item nào → **self-fix trước khi đưa user**, không đưa file lỗi.

## Versioning

- File đầu: `Game Demo/[slug]-v1.html`
- Slug: kebab-case từ game idea (vd "Space Trader" → `space-trader`)
- AI announce slug khi save lần đầu, user có thể đổi
- Mỗi update bump version: `-v2.html`, `-v3.html`, ...
- **KHÔNG overwrite** version cũ — user cần so sánh

## Anti-patterns

- ❌ Inline `style="..."` everywhere thay vì class
- ❌ Magic numbers trong code (dùng constant ở đầu script: `const WIN_SCORE = 100;`)
- ❌ External JS/CSS file (phải inline hết — single file rule)
- ❌ Heavy library (jQuery, React, etc.) — vanilla JS only
- ❌ `console.log` debug còn sót lại
- ❌ Win/lose condition unreachable (vd: WIN_SCORE = 999 nhưng score chỉ tăng max 10/turn trong 5 turn)
