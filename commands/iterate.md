---
description: Re-enter the game design pipeline with feedback — update any artifact (concept, prototype, wireframe, docs)
argument-hint: <feedback text>
---

If no project exists in `projects/`, stop and tell the user to run `/design-kit:create` first.

**CRITICAL RULE: Before executing ANY step, announce what is about to happen.** Format:

```
📍 Step N: [Step Name]
[1-2 sentence description of what will happen next]
```

Receive the feedback text from the user argument (or ask for it if not provided).

**Step 1: Analyze impact**

Read the current project directory. Identify which artifacts exist:
- `concept-pitch.md` — concept pitch document
- `gcd.md` — game concept document
- `index.html` — prototype
- `wireframe.html` — wireframe
- `ui-ux-spec.md`, `art-direction.md`, and other design artifacts
- `gameplay-design.md`, `technical-requirements.md`, and other detail docs

Based on the feedback text, determine which artifacts are most likely affected. State this analysis clearly before proceeding.

**Step 2: Invoke feedback-interpreter**

Invoke the `feedback-interpreter` agent with the feedback text and the list of affected artifacts.

The feedback-interpreter must:
1. Diagnose the root cause of the feedback (what design decision or gap is being addressed)
2. Propose the minimal set of changes needed — avoid cascading edits unless necessary
3. Show a diff preview of every proposed change before touching any file
4. Wait for explicit user approval before applying anything

Do not apply any changes until the user approves the diff preview.

**Step 3: Apply approved changes**

Apply only the changes the user approved. Confirm each file was updated successfully.

**Step 4: Determine downstream impact**

After changes are applied, reason about what downstream artifacts may now be out of sync:

| Changed artifact | Possible downstream effects |
|---|---|
| `concept-pitch.md` | `gcd.md`, prototype, wireframe, detail docs may need updating |
| `gcd.md` | Prototype, wireframe, detail docs may need regenerating |
| `ui-ux-spec.md` | `wireframe.html`, `art-direction.md` may need updating |

List the downstream artifacts that could be affected. Ask the user which ones to regenerate — do not assume.

**Step 5: Regenerate selected artifacts**

For each artifact the user selects, invoke the appropriate agent:

- Concept Pitch (`concept-pitch.md`) → invoke `concept-designer`
- GCD (`gcd.md`) → invoke `concept-designer`
- Prototype (`index.html`) → invoke `code-prototyper`
- Wireframe (`wireframe.html`) → invoke `wireframe-designer`
- Detail docs (`gameplay-design.md`, `technical-requirements.md`, etc.) → invoke `document-writer`

For each agent invocation:
1. Present the result or diff to the user
2. Wait for approval before saving
3. Confirm the artifact was updated

Proceed through each selected artifact one at a time. Do not batch-apply without approval.
