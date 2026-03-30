(function () {
  const TEMPLATE_KEY = 'gridPuzzle';

  function randomCell(typeCount) {
    return Math.floor(Math.random() * typeCount);
  }

  function createBoard(rows, cols, typeCount) {
    const board = [];
    for (let y = 0; y < rows; y += 1) {
      board[y] = [];
      for (let x = 0; x < cols; x += 1) {
        board[y][x] = randomCell(typeCount);
      }
    }
    return board;
  }

  function getCellAt(state, px, py) {
    const gx = Math.floor((px - state.boardX) / state.cellSize);
    const gy = Math.floor((py - state.boardY) / state.cellSize);
    if (gx < 0 || gy < 0 || gx >= state.cols || gy >= state.rows) return null;
    return { x: gx, y: gy };
  }

  function findMatches(state) {
    const marks = Array.from({ length: state.rows }, () => Array(state.cols).fill(false));
    let matchCount = 0;

    for (let y = 0; y < state.rows; y += 1) {
      let run = 1;
      for (let x = 1; x <= state.cols; x += 1) {
        const same = x < state.cols && state.board[y][x] === state.board[y][x - 1];
        if (same) run += 1;
        if (!same) {
          if (run >= 3) {
            for (let i = 0; i < run; i += 1) marks[y][x - 1 - i] = true;
            matchCount += run;
          }
          run = 1;
        }
      }
    }

    for (let x = 0; x < state.cols; x += 1) {
      let run = 1;
      for (let y = 1; y <= state.rows; y += 1) {
        const same = y < state.rows && state.board[y][x] === state.board[y - 1][x];
        if (same) run += 1;
        if (!same) {
          if (run >= 3) {
            for (let i = 0; i < run; i += 1) marks[y - 1 - i][x] = true;
            matchCount += run;
          }
          run = 1;
        }
      }
    }

    return { marks, matchCount };
  }

  function clearAndCollapse(state, marks) {
    for (let x = 0; x < state.cols; x += 1) {
      const stack = [];
      for (let y = state.rows - 1; y >= 0; y -= 1) {
        if (!marks[y][x]) stack.push(state.board[y][x]);
      }
      for (let y = state.rows - 1; y >= 0; y -= 1) {
        state.board[y][x] = stack[state.rows - 1 - y] ?? randomCell(state.typeCount);
      }
    }
  }

  function resolveBoard(state) {
    let loopGuard = 0;
    while (loopGuard < 10) {
      const { marks, matchCount } = findMatches(state);
      if (!matchCount) break;
      state.score += matchCount * 10;
      state.progress += matchCount;
      clearAndCollapse(state, marks);
      loopGuard += 1;
    }
  }

  function trySwap(state, a, b) {
    const dx = Math.abs(a.x - b.x);
    const dy = Math.abs(a.y - b.y);
    if (dx + dy !== 1) return false;
    const tmp = state.board[a.y][a.x];
    state.board[a.y][a.x] = state.board[b.y][b.x];
    state.board[b.y][b.x] = tmp;
    const { matchCount } = findMatches(state);
    if (!matchCount) {
      state.board[b.y][b.x] = state.board[a.y][a.x];
      state.board[a.y][a.x] = tmp;
      return false;
    }
    resolveBoard(state);
    state.moves -= 1;
    return true;
  }

  function initGame(GAME) {
    // === CUSTOMIZE: board dimensions, colors, move limit, and goal ===
    GAME.state[TEMPLATE_KEY] = {
      rows: 8,
      cols: 8,
      cellSize: 48,
      boardX: 40,
      boardY: 90,
      typeCount: 5,
      colors: ['#4A90E2', '#7ED321', '#F5A623', '#BD10E0', '#D0021B'],
      board: [],
      selected: null,
      score: 0,
      moves: 20,
      goal: 140,
      progress: 0
    };
    const state = GAME.state[TEMPLATE_KEY];
    state.board = createBoard(state.rows, state.cols, state.typeCount);
    resolveBoard(state);
  }

  function registerScreens(GAME) {
    GAME.screens.gridGameplay = {
      update() {
        const state = GAME.state[TEMPLATE_KEY];
        if (!state) return;

        if (GAME.input.justPressed) {
          const cell = getCellAt(state, GAME.input.x, GAME.input.y);
          if (!cell) {
            state.selected = null;
          } else if (!state.selected) {
            state.selected = cell;
          } else {
            const success = trySwap(state, state.selected, cell);
            state.selected = null;
            if (success) playTone(760, 0.05);
          }
        }

        if (state.progress >= state.goal) switchScreen('gridComplete');
        if (state.moves <= 0 && state.progress < state.goal) {
          // === CUSTOMIZE: replace with fail-state screen if needed ===
          initGame(GAME);
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');

        drawText(`Score: ${state.score}`, 24, 28, { color: '#FFFFFF', size: 22 });
        drawText(`Moves: ${state.moves}`, 24, 56, { color: '#AAB2D5', size: 20 });
        drawText(`Goal: ${state.progress}/${state.goal}`, 220, 56, { color: '#AAB2D5', size: 20 });

        for (let y = 0; y < state.rows; y += 1) {
          for (let x = 0; x < state.cols; x += 1) {
            const px = state.boardX + x * state.cellSize;
            const py = state.boardY + y * state.cellSize;
            const color = state.colors[state.board[y][x]];
            drawRect(px + 2, py + 2, state.cellSize - 4, state.cellSize - 4, color);
          }
        }

        if (state.selected) {
          const sx = state.boardX + state.selected.x * state.cellSize;
          const sy = state.boardY + state.selected.y * state.cellSize;
          drawRect(sx, sy, state.cellSize, 4, '#FFFFFF');
          drawRect(sx, sy + state.cellSize - 4, state.cellSize, 4, '#FFFFFF');
          drawRect(sx, sy, 4, state.cellSize, '#FFFFFF');
          drawRect(sx + state.cellSize - 4, sy, 4, state.cellSize, '#FFFFFF');
        }
      }
    };

    GAME.screens.gridComplete = {
      update() {
        if (GAME.input.justPressed) {
          initGame(GAME);
          switchScreen('gridGameplay');
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawText('Level Complete!', GAME.width / 2, GAME.height / 2 - 30, { align: 'center', size: 40 });
        drawText(`Final Score: ${state.score}`, GAME.width / 2, GAME.height / 2 + 14, { align: 'center', size: 24, color: '#AAB2D5' });
        drawText('Tap to continue', GAME.width / 2, GAME.height / 2 + 52, { align: 'center', size: 18, color: '#AAB2D5' });
      }
    };
  }

  window.GameTemplateGridPuzzle = { initGame, registerScreens };
})();
