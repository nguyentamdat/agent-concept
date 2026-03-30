(function () {
  const TEMPLATE_KEY = 'cardHand';

  function createDeck() {
    const suits = ['♠', '♥', '♦', '♣'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const deck = [];
    let id = 1;
    for (const suit of suits) {
      for (const value of values) {
        deck.push({ id: id++, suit, value, faceUp: true });
      }
    }
    for (let i = deck.length - 1; i > 0; i -= 1) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    return deck;
  }

  function drawInitialHand(state, count) {
    for (let i = 0; i < count; i += 1) {
      if (!state.deck.length) break;
      state.hand.push(state.deck.pop());
    }
  }

  function initGame(GAME) {
    // === CUSTOMIZE: replace with game-specific deck rules ===
    const deck = createDeck();
    GAME.state[TEMPLATE_KEY] = {
      deck,
      hand: [],
      discard: [],
      board: [],
      selectedCardId: null,
      dragCardId: null,
      turn: 1,
      phase: 'main'
    };
    drawInitialHand(GAME.state[TEMPLATE_KEY], 5);
  }

  function getCardRect(index, total, cardW, cardH, y) {
    const spacing = Math.min(70, (GAME.width - 120 - cardW) / Math.max(1, total - 1));
    const handWidth = cardW + spacing * (total - 1);
    const startX = (GAME.width - handWidth) / 2;
    return { x: startX + index * spacing, y, w: cardW, h: cardH };
  }

  function getHandIndexAt(state, x, y) {
    const cardW = 86;
    const cardH = 126;
    const handY = GAME.height - cardH - 20;
    for (let i = state.hand.length - 1; i >= 0; i -= 1) {
      const rect = getCardRect(i, state.hand.length, cardW, cardH, handY);
      if (isInsideRect(x, y, rect)) return i;
    }
    return -1;
  }

  function drawCard(card, rect, selected) {
    drawRect(rect.x, rect.y, rect.w, rect.h, card.faceUp ? '#FAFAFA' : '#1D2233');
    drawRect(rect.x + 2, rect.y + 2, rect.w - 4, rect.h - 4, card.faceUp ? '#FFFFFF' : '#2E3550');
    const color = card.suit === '♥' || card.suit === '♦' ? '#D0021B' : '#111111';
    if (card.faceUp) {
      drawText(`${card.value}${card.suit}`, rect.x + 10, rect.y + 18, { size: 16, color, baseline: 'top' });
      drawText(`${card.value}${card.suit}`, rect.x + rect.w / 2, rect.y + rect.h / 2, { align: 'center', size: 26, color });
    }
    if (selected) {
      drawRect(rect.x, rect.y, rect.w, 4, '#4A90E2');
      drawRect(rect.x, rect.y + rect.h - 4, rect.w, 4, '#4A90E2');
    }
  }

  function registerScreens(GAME) {
    GAME.screens.cardGameplay = {
      update() {
        const state = GAME.state[TEMPLATE_KEY];
        const drawPileRect = { x: 28, y: GAME.height / 2 - 72, w: 86, h: 126 };
        const playZoneRect = { x: GAME.width / 2 - 180, y: GAME.height / 2 - 120, w: 360, h: 180 };

        if (GAME.input.justPressed) {
          if (isInsideRect(GAME.input.x, GAME.input.y, drawPileRect) && state.deck.length) {
            state.hand.push(state.deck.pop());
            playTone(700, 0.04);
            return;
          }

          const handIndex = getHandIndexAt(state, GAME.input.x, GAME.input.y);
          if (handIndex >= 0) {
            state.selectedCardId = state.hand[handIndex].id;
            state.dragCardId = state.hand[handIndex].id;
            return;
          }
        }

        if (GAME.input.justReleased && state.dragCardId) {
          const idx = state.hand.findIndex((c) => c.id === state.dragCardId);
          if (idx >= 0 && isInsideRect(GAME.input.x, GAME.input.y, playZoneRect)) {
            const [played] = state.hand.splice(idx, 1);
            state.board.push(played);
            playTone(840, 0.05);
            // === CUSTOMIZE: apply card effects and turn logic ===
          }
          state.dragCardId = null;
        }

        const endTurnBtn = { x: GAME.width - 170, y: 20, w: 140, h: 44 };
        if (drawButton(endTurnBtn, 'End Turn', { textSize: 18 })) {
          state.turn += 1;
          state.phase = 'main';
          while (state.hand.length < 5 && state.deck.length) state.hand.push(state.deck.pop());
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawText(`Turn ${state.turn}`, 24, 28, { size: 28 });
        drawText(`Deck: ${state.deck.length}`, 24, 58, { size: 18, color: '#AAB2D5' });
        drawText(`Discard: ${state.discard.length}`, 130, 58, { size: 18, color: '#AAB2D5' });

        const drawPileRect = { x: 28, y: GAME.height / 2 - 72, w: 86, h: 126 };
        drawRect(drawPileRect.x, drawPileRect.y, drawPileRect.w, drawPileRect.h, '#1D2233');
        drawText('Draw', drawPileRect.x + drawPileRect.w / 2, drawPileRect.y + drawPileRect.h / 2, { align: 'center', size: 18 });

        const discardRect = { x: 130, y: GAME.height / 2 - 72, w: 86, h: 126 };
        drawRect(discardRect.x, discardRect.y, discardRect.w, discardRect.h, '#1D2233');
        if (state.discard.length) {
          const top = state.discard[state.discard.length - 1];
          drawText(`${top.value}${top.suit}`, discardRect.x + discardRect.w / 2, discardRect.y + discardRect.h / 2, { align: 'center', size: 24 });
        }

        const playZoneRect = { x: GAME.width / 2 - 180, y: GAME.height / 2 - 120, w: 360, h: 180 };
        drawRect(playZoneRect.x, playZoneRect.y, playZoneRect.w, playZoneRect.h, '#1D2233');
        drawText('Play Area', GAME.width / 2, playZoneRect.y + 20, { align: 'center', size: 18, color: '#AAB2D5' });

        for (let i = 0; i < state.board.length; i += 1) {
          const c = state.board[i];
          const rect = { x: playZoneRect.x + 20 + i * 64, y: playZoneRect.y + 46, w: 56, h: 90 };
          drawCard(c, rect, false);
        }

        const cardW = 86;
        const cardH = 126;
        const handY = GAME.height - cardH - 20;
        for (let i = 0; i < state.hand.length; i += 1) {
          const card = state.hand[i];
          const rect = getCardRect(i, state.hand.length, cardW, cardH, handY);
          const selected = card.id === state.selectedCardId;
          drawCard(card, rect, selected);
        }

        drawText('Tap cards to select, drag to play', GAME.width / 2, GAME.height - 10, { align: 'center', size: 16, color: '#AAB2D5', baseline: 'bottom' });
      }
    };

    GAME.screens.cardHandDisplay = {
      update() {
        if (GAME.input.justPressed) switchScreen('cardGameplay');
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawText('Hand Overview', GAME.width / 2, 80, { align: 'center', size: 36 });
        drawText(`Cards in hand: ${state.hand.length}`, GAME.width / 2, 130, { align: 'center', size: 22, color: '#AAB2D5' });
        drawText('Tap to return', GAME.width / 2, 170, { align: 'center', size: 18, color: '#AAB2D5' });
      }
    };
  }

  window.GameTemplateCardHand = { initGame, registerScreens };
})();
