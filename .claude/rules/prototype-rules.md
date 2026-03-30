---
paths: ["projects/**/prototype/**"]
---

# Prototype Rules

1. Keep prototypes as a single HTML file.
2. Use vanilla JavaScript only.
3. Respect `prototypeScope.renderer`:
   - `2d`: Canvas API flow
   - `3d`: Three.js flow
4. For `3d` renderer, load Three.js from CDN:
   - `https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js`
5. For `3d`, use geometric primitives (BoxGeometry, SphereGeometry, PlaneGeometry) and simple lighting.
6. Keep geometric placeholders rather than production assets.
7. Keep implementation under 2000 lines.
8. Support both mouse and touch interactions.
9. Ensure all required spec screens are present and navigable.
