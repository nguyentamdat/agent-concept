(() => {
  const TEMPLATE_KEY = "threeScene";

  function v3(x = 0, y = 0, z = 0) {
    return new THREE.Vector3(x, y, z);
  }

  function createEntity(type, options = {}) {
    const radius = options.radius ?? 0.6;
    const size = options.size ?? v3(1, 1, 1);
    return {
      id: options.id ?? `${type}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      radius,
      size,
      mesh: null,
      velocity: options.velocity ?? v3(0, 0, 0),
      onSelect: options.onSelect ?? null,
      alive: true,
    };
  }

  function setupThree(state) {
    const container = state.container;
    state.renderer = new THREE.WebGLRenderer({ antialias: true });
    state.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    state.renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(state.renderer.domElement);

    state.scene = new THREE.Scene();
    state.scene.background = new THREE.Color(0x0d0f18);

    state.camera = new THREE.PerspectiveCamera(
      60,
      container.clientWidth / container.clientHeight,
      0.1,
      1000
    );
    state.camera.position.set(0, 8, 12);
    state.camera.lookAt(0, 0, 0);

    const ambient = new THREE.AmbientLight(0xffffff, 0.55);
    const directional = new THREE.DirectionalLight(0xffffff, 0.8);
    directional.position.set(8, 12, 6);
    state.scene.add(ambient, directional);

    const floor = new THREE.Mesh(
      new THREE.PlaneGeometry(24, 24),
      new THREE.MeshStandardMaterial({ color: 0x1d2233 })
    );
    floor.rotation.x = -Math.PI / 2;
    floor.position.y = -0.01;
    state.scene.add(floor);
  }

  function setupHud(state) {
    state.hud.innerHTML = `
      <div style="position:absolute;left:16px;top:16px;color:#fff;font-family:Arial,sans-serif;line-height:1.4;">
        <div style="font-size:22px;font-weight:700;">Three.js Prototype</div>
        <div id="hud-status" style="font-size:14px;color:#b8c2ff;">Click objects to select</div>
      </div>
      <div style="position:absolute;right:16px;top:16px;color:#fff;font-family:Arial,sans-serif;font-size:12px;text-align:right;">
        <div>Renderer: WebGL (Three.js r128)</div>
        <div>Template: three-scene.js</div>
      </div>
    `;
    state.hudStatus = state.hud.querySelector("#hud-status");
  }

  function setStatus(state, message) {
    if (state.hudStatus) state.hudStatus.textContent = message;
  }

  function spawnDemoEntities(state) {
    // === CUSTOMIZE: replace with entities from spec mechanics ===
    const box = createEntity("box", { size: v3(1.2, 1.2, 1.2), radius: 0.9 });
    box.mesh = new THREE.Mesh(
      new THREE.BoxGeometry(box.size.x, box.size.y, box.size.z),
      new THREE.MeshStandardMaterial({ color: 0x4a90e2 })
    );
    box.mesh.position.set(-2.5, 0.6, 0);
    box.onSelect = () => setStatus(state, "Selected: Box unit");

    const sphere = createEntity("sphere", { radius: 0.7 });
    sphere.mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.7, 24, 18),
      new THREE.MeshStandardMaterial({ color: 0xf5a623 })
    );
    sphere.mesh.position.set(2, 0.7, 0);
    sphere.onSelect = () => setStatus(state, "Selected: Sphere unit");

    state.entities.push(box, sphere);
    state.scene.add(box.mesh, sphere.mesh);
  }

  function collidesSphereSphere(a, b) {
    return a.mesh.position.distanceTo(b.mesh.position) <= a.radius + b.radius;
  }

  function collidesBoxBox(a, b) {
    const dx = Math.abs(a.mesh.position.x - b.mesh.position.x);
    const dz = Math.abs(a.mesh.position.z - b.mesh.position.z);
    return dx <= (a.size.x + b.size.x) / 2 && dz <= (a.size.z + b.size.z) / 2;
  }

  function updateEntities(state, dt) {
    for (const entity of state.entities) {
      if (!entity.alive) continue;
      entity.mesh.position.addScaledVector(entity.velocity, dt);
      entity.mesh.rotation.y += dt * 0.6;
    }

    if (state.entities.length >= 2) {
      const a = state.entities[0];
      const b = state.entities[1];
      const hit =
        (a.type === "sphere" && b.type === "sphere" && collidesSphereSphere(a, b)) ||
        (a.type === "box" && b.type === "box" && collidesBoxBox(a, b)) ||
        collidesSphereSphere(a, b);
      if (hit) setStatus(state, "Collision detected between active entities");
    }
  }

  function onPointerDown(state, clientX, clientY) {
    const rect = state.renderer.domElement.getBoundingClientRect();
    state.pointer.x = ((clientX - rect.left) / rect.width) * 2 - 1;
    state.pointer.y = -((clientY - rect.top) / rect.height) * 2 + 1;
    state.raycaster.setFromCamera(state.pointer, state.camera);

    const meshes = state.entities.map((entity) => entity.mesh);
    const hits = state.raycaster.intersectObjects(meshes, false);
    if (!hits.length) return;

    const selectedMesh = hits[0].object;
    const selectedEntity = state.entities.find((entity) => entity.mesh === selectedMesh);
    if (!selectedEntity) return;
    if (selectedEntity.onSelect) selectedEntity.onSelect();
  }

  function resize(state) {
    const w = state.container.clientWidth;
    const h = state.container.clientHeight;
    state.camera.aspect = w / h;
    state.camera.updateProjectionMatrix();
    state.renderer.setSize(w, h);
  }

  function registerScreens(GAME) {
    GAME.screens.threeBoot = {
      enter() {
        // === CUSTOMIZE: create gameplay entities, camera behavior, controls ===
      },
      update(dt) {
        const state = GAME.state[TEMPLATE_KEY];
        updateEntities(state, dt);
      },
      render() {
        const state = GAME.state[TEMPLATE_KEY];
        state.renderer.render(state.scene, state.camera);
      },
    };
  }

  function initGame(GAME) {
    const container = document.getElementById("game-root");
    const hud = document.getElementById("hud-overlay");

    GAME.state[TEMPLATE_KEY] = {
      container,
      hud,
      scene: null,
      camera: null,
      renderer: null,
      entities: [],
      pointer: new THREE.Vector2(),
      raycaster: new THREE.Raycaster(),
      hudStatus: null,
    };

    const state = GAME.state[TEMPLATE_KEY];
    setupThree(state);
    setupHud(state);
    spawnDemoEntities(state);

    const pointerHandler = (event) => onPointerDown(state, event.clientX, event.clientY);
    state.renderer.domElement.addEventListener("pointerdown", pointerHandler);
    window.addEventListener("resize", () => resize(state));
  }

  window.GameTemplateThreeScene = { initGame, registerScreens };
})();
