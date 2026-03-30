(function () {
  const TEMPLATE_KEY = 'sideScroll';

  function initGame(GAME) {
    // === CUSTOMIZE: tune physics and spawn rates ===
    GAME.state[TEMPLATE_KEY] = {
      player: { x: 80, y: 300, w: 36, h: 48, vx: 0, vy: 0, grounded: false },
      gravity: 1300,
      jumpStrength: -520,
      speed: 240,
      worldWidth: 5000,
      cameraX: 0,
      score: 0,
      distance: 0,
      gameOver: false,
      obstacleTimer: 0,
      obstacleEvery: 1.4,
      platforms: [
        { x: 0, y: 530, w: 1200, h: 70 },
        { x: 360, y: 430, w: 220, h: 24 },
        { x: 730, y: 370, w: 180, h: 24 },
        { x: 1080, y: 470, w: 190, h: 24 },
        { x: 1500, y: 420, w: 210, h: 24 },
        { x: 1960, y: 350, w: 210, h: 24 }
      ],
      obstacles: [],
      particles: []
    };
  }

  function spawnObstacle(state) {
    const x = state.cameraX + 900 + Math.random() * 400;
    const h = 30 + Math.random() * 70;
    state.obstacles.push({ x, y: 530 - h, w: 26, h, vx: -state.speed });
  }

  function spawnBurst(state, x, y, color) {
    for (let i = 0; i < 12; i += 1) {
      state.particles.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 260,
        vy: -Math.random() * 280,
        life: 0.5,
        color
      });
    }
  }

  function aabb(a, b) {
    return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
  }

  function resolvePlatformCollision(player, platforms, dt) {
    player.grounded = false;
    for (const p of platforms) {
      const wasAbove = player.y + player.h <= p.y + 2;
      const nextY = player.y + player.vy * dt;
      const crossing = nextY + player.h >= p.y;
      const overlapX = player.x + player.w > p.x && player.x < p.x + p.w;
      if (wasAbove && crossing && overlapX && player.vy >= 0) {
        player.y = p.y - player.h;
        player.vy = 0;
        player.grounded = true;
      }
    }
  }

  function registerScreens(GAME) {
    GAME.screens.sideGameplay = {
      update(dt) {
        const state = GAME.state[TEMPLATE_KEY];
        if (!state || state.gameOver) return;

        const player = state.player;
        const jumpPressed = GAME.input.justPressed;

        player.vx = state.speed;
        player.vy += state.gravity * dt;
        if (jumpPressed && player.grounded) {
          player.vy = state.jumpStrength;
          playTone(740, 0.05);
        }

        player.x += player.vx * dt;
        player.y += player.vy * dt;
        resolvePlatformCollision(player, state.platforms, dt);

        state.obstacleTimer += dt;
        if (state.obstacleTimer >= state.obstacleEvery) {
          state.obstacleTimer = 0;
          spawnObstacle(state);
        }

        for (const obstacle of state.obstacles) obstacle.x += obstacle.vx * dt;
        state.obstacles = state.obstacles.filter((o) => o.x + o.w > state.cameraX - 100);

        for (const obstacle of state.obstacles) {
          if (aabb(player, obstacle)) {
            state.gameOver = true;
            spawnBurst(state, player.x + player.w / 2, player.y + player.h / 2, '#F55');
            playTone(180, 0.2);
            switchScreen('sideGameOver');
          }
        }

        for (const p of state.particles) {
          p.life -= dt;
          p.x += p.vx * dt;
          p.y += p.vy * dt;
          p.vy += 680 * dt;
        }
        state.particles = state.particles.filter((p) => p.life > 0);

        state.cameraX = Math.max(0, player.x - 180);
        state.distance = Math.floor(player.x / 10);
        state.score = state.distance;

        if (player.y > GAME.height + 120) {
          state.gameOver = true;
          switchScreen('sideGameOver');
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        const cameraX = state.cameraX;

        drawRect(0, 530, GAME.width, 70, '#1D2233');
        for (const p of state.platforms) {
          drawRect(p.x - cameraX, p.y, p.w, p.h, '#4A90E2');
        }

        for (const o of state.obstacles) {
          drawRect(o.x - cameraX, o.y, o.w, o.h, '#D0021B');
        }

        const pl = state.player;
        drawRect(pl.x - cameraX, pl.y, pl.w, pl.h, '#7ED321');

        for (const px of state.particles) {
          drawCircle(px.x - cameraX, px.y, 3, px.color);
        }

        drawText(`Distance: ${state.distance}`, 20, 28, { size: 22 });
        drawText('Tap/Click to Jump', 20, 54, { size: 18, color: '#AAB2D5' });
      }
    };

    GAME.screens.sideGameOver = {
      update() {
        if (GAME.input.justPressed) {
          initGame(GAME);
          switchScreen('sideGameplay');
        }
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        drawRect(0, 0, GAME.width, GAME.height, '#0D0F18');
        drawText('Game Over', GAME.width / 2, GAME.height / 2 - 36, { align: 'center', size: 44 });
        drawText(`Score: ${state.score}`, GAME.width / 2, GAME.height / 2 + 8, { align: 'center', size: 24, color: '#AAB2D5' });
        drawText('Tap to restart', GAME.width / 2, GAME.height / 2 + 46, { align: 'center', size: 18, color: '#AAB2D5' });
      }
    };
  }

  window.GameTemplateSideScroll = { initGame, registerScreens };
})();
