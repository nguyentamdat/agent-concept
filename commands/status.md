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

| File | Artifact |
|---|---|
| `market-research.md` | Market Research |
| `concept-pitch.md` | Concept Pitch |
| `gcd.md` | GCD |
| `prototype/index.html` OR `index.html` | Prototype |
| `mockup.html` | Mockup (with component picker) |
| `wireframe.html` | Wireframe Overview |
| `ui-ux-spec.md` | UI/UX Spec |
| `art-direction.md` | Art Direction |
| `gameplay-design.md` | Gameplay Design |
| `economy-design.md` | Economy Design |
| `content-plan.md` | Content Plan |
| `technical-requirements.md` | Technical Requirements |
| `sound-design.md` | Sound Design |

Count how many of the 7 detail docs exist (the docs below `wireframe.html` in the list above, starting from `ui-ux-spec.md`).


**Step 3: Get knowledge base stats**

Call the `mcp__hindsight__get_bank` MCP tool. Extract document count and memory stats. If Hindsight MCP is unavailable, show "Knowledge base: unavailable" instead of failing.

**Step 4: Determine pipeline stage**

Use this logic to determine the current stage:

1. Nothing exists → `not started`
2. `market-research.md` only → `research`
3. `concept-pitch.md` exists → `concept`
4. `gcd.md` exists → `design`
5. `index.html` (prototype) exists → `prototype`
6. `mockup.html` exists → `mockup`
7. `wireframe.html` exists → `wireframe`
8. Any detail doc exists → `documentation`
9. All 7 detail docs exist → `complete`

Pick the highest stage that applies.

**Step 5: Output the status card**

Print the following card, filling in real values. Use ✅ for done, ⬜ for not done.

```
📋 Project: {project name}
📌 Stage: {current stage}

Artifacts:
{✅/⬜} Market Research
{✅/⬜} Concept Pitch
{✅/⬜} GCD
{✅/⬜} Prototype
{✅/⬜} Mockup (with component picker)
{✅/⬜} Wireframe Overview
{✅/⬜} Detail Documents ({count}/7)

| Knowledge Base:
| 📚 Memories: {count}
| 🏦 Bank: game-knowledge
📚 Documents: {count}
🔍 Chunks: {count}
```

No extra commentary. Just the card.
