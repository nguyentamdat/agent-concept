---
description: Show current project state — pipeline stage, artifacts, knowledge stats
---

**Step 1: Find the current project**

Use the `project_list` MCP tool to get all projects. If no projects exist, output:

```
No project found. Run /design-kit:create to start.
```

Otherwise, use the most recently modified project (or ask the user if multiple exist and none is obvious).

**Step 2: Check which artifacts exist**

Read the project directory. For each artifact below, note whether it exists:

| File | Artifact |
|---|---|
| `market-research.md` | Market Research |
| `outline.md` | Outline |
| `gcd.md` | GCD |
| `spec.yaml` | Spec |
| `index.html` | Prototype |
| `ui-ux-spec.md` | UI/UX Spec |
| `art-direction.md` | Art Direction |
| `gameplay-design.md` | Gameplay Design |
| `economy-design.md` | Economy Design |
| `content-plan.md` | Content Plan |
| `technical-requirements.md` | Technical Requirements |
| `sound-design.md` | Sound Design |

Count how many of the 7 detail docs exist (the docs below `index.html` in the list above, starting from `ui-ux-spec.md`).

Read `spec.yaml` if it exists and extract the `version` field.

**Step 3: Get knowledge base stats**

Call the `knowledge_stats` MCP tool. Extract document count and chunk count.

**Step 4: Determine pipeline stage**

Use this logic to determine the current stage:

1. Nothing exists → `research`
2. `market-research.md` exists → `concept`
3. `outline.md` exists → `outline`
4. `gcd.md` exists → `gcd`
5. `spec.yaml` exists → `prototype+figma`
6. `index.html` exists → `docs`
7. All 7 detail docs exist → `complete`

Pick the highest stage that applies.

**Step 5: Output the status card**

Print the following card, filling in real values. Use ✅ for done, ⬜ for not done.

```
📋 Project: {project name}
📌 Stage: {current stage}
📄 Spec Version: {version or "—"}

Artifacts:
{✅/⬜} Market Research
{✅/⬜} Outline
{✅/⬜} GCD
{✅/⬜} Spec
{✅/⬜} Prototype
{✅/⬜} Figma Mockups
{✅/⬜} Detail Documents ({count}/7)

Knowledge Base:
📚 Documents: {count}
🔍 Chunks: {count}
```

No extra commentary. Just the card.
