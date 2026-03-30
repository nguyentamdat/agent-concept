# /design-kit:prototype

Generate and serve a playable prototype from the current spec.

## Steps

1. Read `spec.yaml`, especially:
   - `prototypeScope.includedMechanics`
   - `prototypeScope.renderer` (default: `2d`)
2. Select template from `template://index` and `template://{name}` by renderer:
   - If renderer = `2d`: use Canvas template flow (existing templates)
   - If renderer = `3d`: use Three.js starter flow (`templates/three-scene.js`)
3. Generate one `index.html` prototype with vanilla JavaScript only.
4. Renderer constraints:
   - `2d`: Canvas API + geometric placeholder visuals
   - `3d`: Three.js via CDN, geometric meshes, no asset pipeline
5. Write to `{project}/prototype/index.html`.
6. Run `prototype_validate` and fix all blocking issues.
7. Run `prototype_serve` and return served URL.

## Output Requirements

- Include all core prototype screens specified by the spec.
- Support mouse and touch interactions.
- Keep code concise and readable.
