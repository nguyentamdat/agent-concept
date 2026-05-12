---
description: Re-enter the prototype-first game design pipeline with feedback — update playable prototype, lightweight GCD, mockup, wireframe, or detail docs
argument-hint: <feedback text>
---

If no project exists in `projects/`, stop and tell the user to run `/design-kit:create` first.

Re-enter the pipeline with a **prototype-first** bias. Feedback that affects gameplay, feel, controls, pacing, scoring, difficulty, balance, or player comprehension is routed back into the `game-prototype` skill (`skills/game-prototype/SKILL.md`) which owns the playable prototype and lightweight GCD. Mockup-only feedback routes to `mockup-designer`. Wireframe-only feedback routes to `wireframe-designer`. Detail-doc feedback routes to `document-writer`.

**CRITICAL RULE: Before executing ANY step, announce what is about to happen.** Format:

```text
📍 Step N: [Step Name]
[1-2 sentence description of what will happen next]
```

Receive the feedback text from the user argument, or ask for it if not provided.

**Prototype-first iteration rules:**

- Default first edit target for any playable behavior, feel, balance, or mechanic feedback is the next versioned `Game Demo/[slug]-vN+1.html` produced by the `game-prototype` skill, never an in-place rewrite of an older version.
- Make the smallest reversible change that can test the feedback.
- Do not regenerate downstream artifacts until the affected source artifact is approved.
- Keep user approval gates for ambiguous product direction, destructive rewrites, broad scope changes, and final artifact acceptance.
- Report every applied change with diff summary and validation evidence.
- Do **not** route active concept/prototype/GCD work through `concept-designer`, `review-concept`, or `code-prototyper`. Those agents remain in the repo for legacy/manual support only.
- **Every regenerated artifact passes the review loop before reaching the user.** Read `references/review-loop.md` once at the start of an iterate run. Producer → domain reviewer → creative-director, sequential, both must `APPROVE`. CONCERNS or REJECT → feedback packet to producer, restart from domain reviewer.

---

## Step 1: Inventory Artifacts and Classify Feedback

Read the current project directory. Identify which artifacts exist:

- `Game Demo/[slug]-concept-{A|B|C}.html` — Phase 1 mini concept prototypes (rarely re-edited after Phase 1)
- `Game Demo/[slug]-vN.html` — versioned full playable prototypes (highest N is the current "approved" version)
- `Game Demo/[slug]-GCD.md` — Vietnamese lightweight GCD
- `mockup.html` — high-fidelity interactive mockup with component picker (dom-grab)
- `wireframe.html` — single-page overview flowchart with component spec panels
- `ui-ux-spec.md`, `art-direction.md`, and other design artifacts
- `gameplay-design.md`, `economy-design.md`, `content-plan.md`, `technical-requirements.md`, `sound-design.md`, and other detail docs
- `market-research.md`

Note any **legacy artifacts** that may exist from older project runs and now sit outside the active pipeline:

- `concept-pitch.md` (legacy — replaced by Section 1+2 of the lightweight GCD)
- `gcd.md` at project root (legacy — replaced by `Game Demo/[slug]-GCD.md`)
- `prototype/index.html` (legacy — replaced by `Game Demo/[slug]-vN.html`)

Treat legacy artifacts as read-only context. Do not regenerate them; only the active `Game Demo/` artifacts are updated.

Classify the feedback into one or more categories:

| Feedback category | First artifact to update | Owner | Examples |
|---|---|---|---|
| Playable behavior / mechanic / balance | `Game Demo/[slug]-vN+1.html` | `game-prototype` skill (Phase 2 iteration) | controls, mechanics, scoring, pacing, difficulty, feedback, win/fail states, formula tuning |
| Lightweight GCD wording / structure | `Game Demo/[slug]-GCD.md` | `game-prototype` skill (Phase 3 regeneration) | screen list mismatch, rule clarification, terminology, audience refinement |
| Concept framing (audience / problem statement / kinds of fun) | `Game Demo/[slug]-vN+1.html` then `[slug]-GCD.md` | `game-prototype` skill (Phase 1 re-entry then Phase 2/3) | target audience pivot, problem statement rewrite, kinds-of-fun rebalance |
| UI presentation / visual / component look | `mockup.html` | `mockup-designer` | layout, hierarchy, copy, component states, component-picker feedback |
| Screen flow / spec / component behavior | `wireframe.html` after mockup is current | `wireframe-designer` | navigation, screen map, component tables, data bindings, missing component states |
| Detail-doc-only correction | relevant markdown | `document-writer` | typo, section rewrite, clarification that does not affect play |

State the classification clearly before proceeding, including which artifact is the source of truth for this feedback.

---

## Step 2: Invoke `feedback-interpreter`

Invoke the **feedback-interpreter** agent with the feedback text, the existing artifact list, and the impact classification.

The feedback-interpreter must:

1. Diagnose the root cause of the feedback.
2. Classify impact (Cosmetic / Balance / Structural / Vision).
3. Identify the smallest set of source-artifact changes needed.
4. Prefer prototype changes first when the feedback affects gameplay, feel, or balance — recommend re-entering `game-prototype` Phase 2 to produce `Game Demo/[slug]-vN+1.html`, never to overwrite an existing version.
5. Identify downstream artifacts (mockup, wireframe, detail docs) that may become stale.
6. Show a diff preview of every proposed change before touching any file.
7. Wait for explicit user approval before applying anything.

**Do not apply any changes until the user approves the diff preview.**

---

## Step 3: Apply Approved Source-Artifact Changes

Apply only the source-artifact changes the user approved.

Routing rules:

- **Playable behavior / balance / mechanic feedback:** route the user's request into `game-prototype` Phase 2 iteration. The skill writes a new `Game Demo/[slug]-vN+1.html`. Do not overwrite the older versions.
- **Lightweight GCD wording:** route into `game-prototype` Phase 3 regeneration over `Game Demo/[slug]-GCD.md`.
- **Concept framing (audience / PS / kinds of fun):** route into `game-prototype` Phase 1 re-entry; flow back through Phase 2 (new `[slug]-vN+1.html`) and Phase 3 (refreshed `[slug]-GCD.md`).
- **Mockup-only:** invoke `mockup-designer` to update `mockup.html`. The agent reads the latest approved `Game Demo/[slug]-vN.html` and `Game Demo/[slug]-GCD.md` for context.
- **Wireframe-only:** invoke `wireframe-designer` to update `wireframe.html`. The agent re-reads the latest `mockup.html` so wireframe stays 1:1 synced with mockup, and pulls supporting context from `Game Demo/[slug]-GCD.md` and `[slug]-vN.html`.
- **Detail-doc-only:** invoke `document-writer` for the affected document. The agent reads `Game Demo/[slug]-GCD.md` + `[slug]-vN.html` (plus `mockup.html`/`wireframe.html` for `ui-ux-spec.md`) before writing.

Confirm each updated file and summarize the diff.

---

## Step 4: Validate the Changed Source Artifact

Run the strongest available validation for the changed artifact.

For `Game Demo/[slug]-vN+1.html`:

1. Verify the new versioned file exists and remains self-contained HTML5.
2. Smoke-check that expected controls, loop state, scoring/feedback, and restart path still exist.
3. If browser automation or a local preview tool is available, open or run the prototype and verify the changed behavior end-to-end.
4. Report exactly what was validated and any gaps.

For `Game Demo/[slug]-GCD.md`:

1. Verify Section 3 (Screens) still maps 1:1 with the screens present in the current `[slug]-vN.html`.
2. Verify Section 4.2 (Resolve rules) formulas still match the JS code in the prototype.
3. Verify Section 5 references the latest version number.

For `mockup.html`:

1. Verify required screens and `data-component` attributes still exist.
2. Confirm dom-grab component-picker instructions remain present.
3. If possible, preview or smoke-check screen navigation.

For `wireframe.html`:

1. Verify it is synced with the latest `mockup.html` screens and components.
2. Confirm flowchart navigation and detail panels remain present.

For markdown detail docs:

1. Check that links and referenced artifact names still match the project files.
2. Run markdown lint/format checks if available.

If validation fails, fix the issue and rerun this step before proceeding.

---

## Step 5: Determine Downstream Sync Needs

After the source change is approved and validated, reason about downstream artifacts that may now be out of sync:

| Changed source artifact | Downstream sync effects |
|---|---|
| `Game Demo/[slug]-vN+1.html` | `Game Demo/[slug]-GCD.md` may need Section 3-5 refresh; mockup, wireframe, and gameplay/economy/content/technical detail docs may need updates |
| `Game Demo/[slug]-GCD.md` | Mockup, wireframe, and detail docs may need updates; prototype changes only if the GCD edit reflects mechanic changes already in `[slug]-vN.html` |
| `mockup.html` | Wireframe MUST be regenerated or re-synced 1:1; `ui-ux-spec.md` likely needs update |
| `wireframe.html` | `ui-ux-spec.md` component tables may need update |
| `ui-ux-spec.md` | Mockup, wireframe, and art direction may need update only if the spec changed source-of-truth decisions |
| `art-direction.md` | Mockup color/typography may need update |

List the downstream artifacts that could be affected. Ask the user via AskUserQuestion which ones to sync or regenerate. Do not assume.

---

## Step 6: Sync Selected Downstream Artifacts

For each selected downstream artifact, invoke the appropriate agent one at a time:

- Lightweight GCD (`Game Demo/[slug]-GCD.md`) → **re-enter `game-prototype` Phase 3** over the latest `[slug]-vN.html` (NOT `document-writer`; the GCD producer is the skill).
- Playable prototype (`Game Demo/[slug]-vN+1.html`) → re-enter `game-prototype` Phase 2 only if a downstream decision explicitly changes playable behavior.
- Mockup (`mockup.html`) → invoke `mockup-designer` and preserve validated prototype interactions.
- Wireframe overview (`wireframe.html`) → invoke `wireframe-designer`; it MUST re-read the latest `mockup.html` first so wireframe stays 1:1 synced.
- Detail docs (`gameplay-design.md`, `economy-design.md`, `content-plan.md`, `technical-requirements.md`, `sound-design.md`, etc.) → invoke `document-writer` and reference the approved prototype + lightweight GCD plus current mockup/wireframe when relevant.

**Scope of the review loop in iterate**: the loop runs only on artifacts that are *actually regenerated* in this iterate run (whether selected by the user in Step 5 or pulled in as a sync side-effect of an upstream regeneration). Artifacts the user chose NOT to sync are left as-is — do NOT invoke the loop on them just because they look stale; surface them in the iteration summary at Step 7 as "intentionally stale" instead.

For each agent invocation:

1. **Run the review loop (`references/review-loop.md`) on the regenerated artifact** before showing anything to the user:
   - Domain reviewer (per artifact type — `ui-ux-reviewer` for mockup/wireframe/`ui-ux-spec.md`/`art-direction.md`, `detail-doc-reviewer` for the lightweight GCD and the other detail docs).
   - On non-APPROVE: feedback packet → producer in revise mode → regenerate → restart at domain reviewer.
   - On reviewer APPROVE: **creative-director** at the matching `CD-*` gate.
   - On non-APPROVE from director: feedback → producer revise → restart at domain reviewer.
2. Present the result or diff to the user only after both reviewers `APPROVE`.
3. Wait for approval before saving or moving to the next selected artifact.
4. Confirm the artifact was updated.
5. Run the relevant validation from Step 4.

Proceed through selected artifacts one at a time. Do not batch-apply without approval.

---

## Step 7: Stage Knowledge-Base Contributions (Optional Governance Gate)

If the iteration produced reusable knowledge (validated playtest insight, finalized design decision, or a novel cross-project pattern), do **not** write directly to Hindsight.

1. Create `projects/{project-name}/.kb-contributions/pending/{timestamp}-{slug}.json`.
2. Include `content`, `tags`, `source_artifacts`, `rationale`, and `status: "pending"`.
3. Ask the user/reviewer to accept or reject the pending contribution.
4. Only after explicit approval may an operator with `mcp__hindsight__retain` permission write it to Hindsight.
5. If Hindsight MCP is unavailable, leave the pending JSON in place and report it as "KB write deferred".

---

## Iteration Complete

When approved changes and selected downstream syncs are complete:

1. Summarize updated artifacts (cite the final `[slug]-vN.html` version number if the prototype was iterated).
2. Identify which artifact is now the source of truth for the iterated change.
3. List validation evidence.
4. List any intentionally stale artifacts the user chose not to sync.
5. Remind the user they can run `/design-kit:iterate <feedback>` again, and that prototype-affecting feedback will always produce a new `Game Demo/[slug]-vN+1.html` rather than overwriting an existing version.
