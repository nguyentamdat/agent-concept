---
description: Show current project state — pipeline stage, artifacts, knowledge stats
---

**Step 1: Find the current project**

List directories under `projects/`. If no projects exist, output:

```
No project found. Run /design-kit:create to start.
```

Otherwise, use the most recently modified project (or ask the user if multiple exist and none is obvious).

**Step 2: Check which artifacts exist**

Read the project directory. For each artifact below, note whether it exists:

| File / Glob | Artifact | Status |
|---|---|---|
| `market-research.md` | Market Research | active |
| `Game Demo/*-concept-*.html` | Phase 1 mini concept prototypes (game-prototype skill) | active |
| `Game Demo/*-v*.html` | Phase 2 versioned playable prototype (game-prototype skill) — highest version is current | active |
| `Game Demo/*-GCD.md` | Phase 3 Vietnamese lightweight GCD (game-prototype skill) | active |
| `mockup.html` | Mockup (with component picker) | active |
| `wireframe.html` | Wireframe Overview | active |
| `ui-ux-spec.md` | UI/UX Spec | active |
| `art-direction.md` | Art Direction | active |
| `gameplay-design.md` | Gameplay Design | active |
| `economy-design.md` | Economy Design | active |
| `content-plan.md` | Content Plan | active |
| `technical-requirements.md` | Technical Requirements | active |
| `sound-design.md` | Sound Design | active |
| `concept-pitch.md` | Concept Pitch | **legacy** — replaced by lightweight GCD Section 1+2 |
| `gcd.md` (project root) | Full theory GCD | **legacy** — replaced by `Game Demo/*-GCD.md` |
| `prototype/index.html` or root `index.html` | Old single-file prototype | **legacy** — replaced by `Game Demo/*-v*.html` |

For the legacy artifacts, only show them in the status card under a separate "Legacy artifacts (from older runs)" section if they exist; do not gate the pipeline stage on them.

Count how many of the 7 detail docs exist (`ui-ux-spec.md`, `art-direction.md`, `gameplay-design.md`, `economy-design.md`, `content-plan.md`, `technical-requirements.md`, `sound-design.md`).

**Step 3: Get knowledge base stats**

Call the `mcp__hindsight__get_bank` MCP tool. Extract document count and memory stats. If Hindsight MCP is unavailable, show "Knowledge base: unavailable" instead of failing.

**Step 4: Determine pipeline stage**

Use this logic to determine the current stage (pick the highest stage that applies):

1. Nothing exists → `not started`
2. Only `market-research.md` exists → `research`
3. `Game Demo/*-concept-*.html` exists (any of A/B/C) → `concept brainstorm` (game-prototype Phase 1)
4. `Game Demo/*-v*.html` exists (at least one version) → `prototype` (game-prototype Phase 2)
5. `Game Demo/*-GCD.md` exists → `lightweight GCD` (game-prototype Phase 3)
6. `mockup.html` exists → `mockup`
7. `wireframe.html` exists → `wireframe`
8. Any of the 7 detail docs exists → `documentation`
9. All 7 detail docs exist → `complete`

**Step 5: Output the status card**

Print the following card, filling in real values. Use ✅ for done, ⬜ for not done. If a `Game Demo/*-v*.html` exists, show the highest version number next to the Prototype line.

```
📋 Project: {project name}
📌 Stage: {current stage}

Artifacts:
{✅/⬜} Market Research
{✅/⬜} Phase 1 Concept Prototypes ({count}/3 of A/B/C present)
{✅/⬜} Playable Prototype (latest: Game Demo/{slug}-v{N}.html)
{✅/⬜} Lightweight GCD (Game Demo/{slug}-GCD.md)
{✅/⬜} Mockup (with component picker)
{✅/⬜} Wireframe Overview
{✅/⬜} Detail Documents ({count}/7)

Knowledge Base:
📚 Memories: {count}
🏦 Bank: game-knowledge
📚 Documents: {count}
🔍 Chunks: {count}
```

If any **legacy** artifacts (`concept-pitch.md`, root `gcd.md`, `prototype/index.html`) exist, append a small footer to the card:

```
Legacy artifacts (from older runs, not part of active pipeline):
{✅} concept-pitch.md
{✅} gcd.md
{✅} prototype/index.html
```

No extra commentary. Just the card.
