(function () {
  const TEMPLATE_KEY = 'resourceManager';

  function formatNumber(value) {
    if (value >= 1e9) return `${(value / 1e9).toFixed(1)}B`;
    if (value >= 1e6) return `${(value / 1e6).toFixed(1)}M`;
    if (value >= 1e3) return `${(value / 1e3).toFixed(1)}K`;
    return `${Math.floor(value)}`;
  }

  function initGame(GAME) {
    // === CUSTOMIZE: resource list, base rates, and upgrades ===
    GAME.state[TEMPLATE_KEY] = {
      activeScreen: 'main',
      resources: {
        coins: 0,
        wood: 0,
        gems: 0
      },
      rates: {
        coins: 1,
        wood: 0.4,
        gems: 0
      },
      clickGain: 1,
      upgrades: [
        { id: 'pickaxe', name: 'Better Pickaxe', cost: 25, target: 'coins', addRate: 1.1, bought: 0 },
        { id: 'lumber', name: 'Lumber Crew', cost: 60, target: 'wood', addRate: 0.8, bought: 0 },
        { id: 'gemLab', name: 'Gem Lab', cost: 250, target: 'gems', addRate: 0.25, bought: 0 }
      ],
      prestige: {
        level: 0,
        bonus: 1
      }
    };
  }

  function buyUpgrade(state, upgrade) {
    const wallet = state.resources.coins;
    if (wallet < upgrade.cost) return false;
    state.resources.coins -= upgrade.cost;
    state.rates[upgrade.target] += upgrade.addRate;
    upgrade.bought += 1;
    upgrade.cost = Math.floor(upgrade.cost * 1.45);
    playTone(690, 0.05);
    return true;
  }

  function registerScreens(GAME) {
    GAME.screens.resourceMain = {
      update(dt) {
        const state = GAME.state[TEMPLATE_KEY];
        const bonus = state.prestige.bonus;
        state.resources.coins += state.rates.coins * bonus * dt;
        state.resources.wood += state.rates.wood * bonus * dt;
        state.resources.gems += state.rates.gems * bonus * dt;

        const clickBtn = { x: GAME.width / 2 - 120, y: 170, w: 240, h: 140 };
        if (GAME.input.justPressed && isInsideRect(GAME.input.x, GAME.input.y, clickBtn)) {
          state.resources.coins += state.clickGain * bonus;
          playTone(820, 0.03);
        }

        const shopBtn = { x: GAME.width - 180, y: 20, w: 150, h: 46 };
        if (drawButton(shopBtn, 'Shop', { textSize: 20 })) {
          state.activeScreen = 'shop';
          switchScreen('resourceShop');
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');

        drawText('Resource Manager', 24, 28, { size: 30 });
        drawText(`Coins: ${formatNumber(state.resources.coins)}`, 24, 74, { size: 22, color: '#F5A623' });
        drawText(`Wood: ${formatNumber(state.resources.wood)}`, 24, 104, { size: 22, color: '#7ED321' });
        drawText(`Gems: ${formatNumber(state.resources.gems)}`, 24, 134, { size: 22, color: '#4A90E2' });

        drawRect(GAME.width / 2 - 120, 170, 240, 140, '#1D2233');
        drawText('Tap to Earn', GAME.width / 2, 242, { align: 'center', size: 28 });
        drawText(`+${state.clickGain} coins`, GAME.width / 2, 282, { align: 'center', size: 18, color: '#AAB2D5' });

        drawText('Passive income per second:', 24, 360, { size: 18, color: '#AAB2D5' });
        drawText(`Coins +${state.rates.coins.toFixed(1)}`, 24, 390, { size: 18 });
        drawText(`Wood +${state.rates.wood.toFixed(1)}`, 24, 416, { size: 18 });
        drawText(`Gems +${state.rates.gems.toFixed(1)}`, 24, 442, { size: 18 });

        // === CUSTOMIZE: implement real prestige/reset progression ===
        drawRect(GAME.width - 220, GAME.height - 90, 190, 56, '#1D2233');
        drawText('Prestige (TODO)', GAME.width - 125, GAME.height - 62, { align: 'center', size: 16, color: '#AAB2D5' });
      }
    };

    GAME.screens.resourceShop = {
      update() {
        const state = GAME.state[TEMPLATE_KEY];
        for (let i = 0; i < state.upgrades.length; i += 1) {
          const up = state.upgrades[i];
          const rect = { x: 40, y: 90 + i * 92, w: GAME.width - 80, h: 78 };
          if (drawButton(rect, `${up.name} ($${formatNumber(up.cost)})`, { textSize: 20 })) {
            buyUpgrade(state, up);
          }
        }
        const backBtn = { x: GAME.width - 180, y: 20, w: 150, h: 46 };
        if (drawButton(backBtn, 'Back', { textSize: 20 })) {
          state.activeScreen = 'main';
          switchScreen('resourceMain');
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawText('Upgrade Shop', 24, 32, { size: 30 });
        drawText(`Coins: ${formatNumber(state.resources.coins)}`, 24, 62, { size: 20, color: '#F5A623' });

        for (let i = 0; i < state.upgrades.length; i += 1) {
          const up = state.upgrades[i];
          const y = 90 + i * 92;
          drawRect(40, y, GAME.width - 80, 78, '#1D2233');
          drawText(up.name, 56, y + 24, { size: 20 });
          drawText(`+${up.addRate.toFixed(2)} ${up.target}/sec`, 56, y + 50, { size: 16, color: '#AAB2D5' });
          drawText(`Owned: ${up.bought}`, GAME.width - 92, y + 24, { align: 'right', size: 16, color: '#AAB2D5' });
          drawText(`Cost: ${formatNumber(up.cost)}`, GAME.width - 92, y + 50, { align: 'right', size: 16, color: '#F5A623' });
        }
      }
    };
  }

  window.GameTemplateResourceManager = { initGame, registerScreens };
})();
