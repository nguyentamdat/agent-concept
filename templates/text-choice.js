(function () {
  const TEMPLATE_KEY = 'textChoice';

  function initStoryData() {
    return {
      start: {
        id: 'start',
        speaker: 'Guide',
        text: 'You stand at the gate of the floating city. The lights above pulse like stars. What do you do?',
        choices: [
          { text: 'Enter through the main gate', next: 'gate', effect: { courage: 1 } },
          { text: 'Search for a hidden path', next: 'alley', effect: { stealth: 1 } }
        ]
      },
      gate: {
        id: 'gate',
        speaker: 'Guard',
        text: 'The guard studies your face and asks for your purpose.',
        choices: [
          { text: 'Speak honestly', next: 'honest', effect: { trust: 1 } },
          { text: 'Invent a story', next: 'lie', effect: { deceit: 1 } }
        ]
      },
      alley: {
        id: 'alley',
        speaker: 'Narrator',
        text: 'You slip between market stalls and discover a quiet side door.',
        choices: [
          { text: 'Open the side door', next: 'inside', effect: { stealth: 1 } }
        ]
      },
      honest: { id: 'honest', speaker: 'Guard', text: 'Truth has weight. The gate opens.', choices: [] },
      lie: { id: 'lie', speaker: 'Guard', text: 'The guard narrows his eyes. You are delayed.', choices: [] },
      inside: { id: 'inside', speaker: 'Narrator', text: 'You step into a chamber full of maps and secrets.', choices: [] }
    };
  }

  function initGame(GAME) {
    // === CUSTOMIZE: replace passages with your own narrative graph ===
    const passages = initStoryData();
    GAME.state[TEMPLATE_KEY] = {
      passages,
      currentId: 'start',
      history: [],
      vars: {
        courage: 0,
        stealth: 0,
        trust: 0,
        deceit: 0
      },
      visibleChars: 0,
      typeSpeed: 45,
      typeAcc: 0
    };
  }

  function applyChoiceEffect(state, effect) {
    if (!effect) return;
    for (const key of Object.keys(effect)) {
      state.vars[key] = (state.vars[key] || 0) + effect[key];
    }
  }

  function wrapText(text, maxWidth, size) {
    const words = text.split(' ');
    const lines = [];
    let current = '';
    GAME.ctx.font = `${size}px Arial`;
    for (const word of words) {
      const test = current ? `${current} ${word}` : word;
      if (GAME.ctx.measureText(test).width > maxWidth) {
        if (current) lines.push(current);
        current = word;
      } else {
        current = test;
      }
    }
    if (current) lines.push(current);
    return lines;
  }

  function registerScreens(GAME) {
    GAME.screens.storyDisplay = {
      update(dt) {
        const state = GAME.state[TEMPLATE_KEY];
        const passage = state.passages[state.currentId];
        const fullText = passage.text;

        state.typeAcc += dt;
        while (state.typeAcc >= 1 / state.typeSpeed) {
          state.typeAcc -= 1 / state.typeSpeed;
          state.visibleChars = Math.min(fullText.length, state.visibleChars + 1);
        }

        const textDone = state.visibleChars >= fullText.length;
        if (GAME.input.justPressed && !textDone) {
          state.visibleChars = fullText.length;
          return;
        }

        if (textDone) {
          const choices = passage.choices;
          for (let i = 0; i < choices.length; i += 1) {
            const btn = { x: 40, y: 340 + i * 66, w: GAME.width - 80, h: 54 };
            if (drawButton(btn, choices[i].text, { textSize: 18 })) {
              state.history.push(state.currentId);
              applyChoiceEffect(state, choices[i].effect);
              state.currentId = choices[i].next;
              state.visibleChars = 0;
              state.typeAcc = 0;
              playTone(620, 0.05);
            }
          }
        }

        const backBtn = { x: GAME.width - 130, y: 20, w: 100, h: 40 };
        if (drawButton(backBtn, 'Back', { textSize: 16 }) && state.history.length) {
          state.currentId = state.history.pop();
          state.visibleChars = 0;
          state.typeAcc = 0;
          playTone(460, 0.04);
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        const passage = state.passages[state.currentId];
        const visibleText = passage.text.slice(0, state.visibleChars);

        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawRect(24, 70, GAME.width - 48, 240, '#1D2233');

        drawText(passage.speaker || 'Narrator', 40, 92, { size: 20, color: '#4A90E2', baseline: 'top' });

        const lines = wrapText(visibleText, GAME.width - 96, 22);
        for (let i = 0; i < lines.length; i += 1) {
          drawText(lines[i], 40, 130 + i * 30, { size: 22, color: '#FFFFFF', baseline: 'top' });
        }

        const textDone = state.visibleChars >= passage.text.length;
        if (!textDone) {
          drawText('Tap to continue text...', GAME.width - 40, 286, { align: 'right', size: 16, color: '#AAB2D5' });
        } else if (!passage.choices.length) {
          // === CUSTOMIZE: branch to next chapter or ending summary ===
          drawText('End of branch. Tap Back to revisit choices.', 40, 340, { size: 18, color: '#AAB2D5', baseline: 'top' });
        }

        drawText(
          `Courage ${state.vars.courage} | Stealth ${state.vars.stealth} | Trust ${state.vars.trust} | Deceit ${state.vars.deceit}`,
          40,
          GAME.height - 24,
          { size: 16, color: '#AAB2D5', baseline: 'bottom' }
        );
      }
    };
  }

  window.GameTemplateTextChoice = { initGame, registerScreens };
})();
