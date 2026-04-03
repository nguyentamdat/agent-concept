---
description: Re-enter the game design pipeline with feedback — update any artifact (concept, prototype, Figma, docs)
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
- `gcd.md` — game concept document
- `spec.yaml` — game spec
- `index.html` — prototype
- `ui-ux-spec.md`, `art-direction.md`, and any Figma mockup references — design artifacts
- `gameplay-design.md`, `technical-design.md`, and other detail docs

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

Apply only the changes the user approved. After applying:
- If `spec.yaml` changed, bump the spec version using `spec_bump_version`
- Confirm each file was updated successfully

**Step 4: Determine downstream impact**

After changes are applied, reason about what downstream artifacts may now be out of sync:

| Changed artifact | Possible downstream effects |
|---|---|
| `gcd.md` | `spec.yaml` may need updating |
| `spec.yaml` | `index.html`, Figma mockups, detail docs may need regenerating |
| `ui-ux-spec.md` | Figma mockups, `art-direction.md` may need updating |

List the downstream artifacts that could be affected. Ask the user which ones to regenerate — do not assume.

**Step 5: Regenerate selected artifacts**

For each artifact the user selects, invoke the appropriate agent:

- Prototype (`index.html`) → invoke `code-prototyper`
- Figma mockups → invoke `figma-designer`
- Detail docs (`gameplay-design.md`, `technical-design.md`, etc.) → invoke `document-writer`
- Spec (`spec.yaml`) → invoke `spec-writer` or update inline with `spec_validate` after

For each agent invocation:
1. Present the result or diff to the user
2. Wait for approval before saving
3. Confirm the artifact was updated

Proceed through each selected artifact one at a time. Do not batch-apply without approval.
