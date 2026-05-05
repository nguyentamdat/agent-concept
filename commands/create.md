---
description: Start the prototype-first game design pipeline — playable HTML5 prototype + lightweight GCD → mockup → wireframe → detail docs
argument-hint: <game idea>
---

Execute the prototype-first game design pipeline. The first half of this command runs the `game-prototype` skill (`skills/game-prototype/SKILL.md`) end-to-end to produce a playable HTML5 prototype and a Vietnamese lightweight GCD. The second half consumes those approved outputs to generate the mockup, wireframe, and selected detail documents.

Follow every step in order. Never skip an approval gate. Never auto-apply changes without user confirmation.

**CRITICAL RULE: Before executing ANY step, announce what is about to happen.** Use this format:

```text
📍 Step N: [Step Name]
[1-2 sentence description of what will happen next and why]
```

Do this before every step, every agent invocation, and every approval gate. The user must always know what is coming next before it starts.

**Prototype-first operating rules:**

- The `game-prototype` skill owns Phase 1 (concept brainstorm + audits), Phase 2 (versioned playable prototype), and Phase 3 (lightweight GCD). It is the single source of truth for the early pipeline.
- Active routing does **not** invoke `concept-designer`, `review-concept`, or `code-prototyper` from this command. Those agents remain in the repo as legacy/manual helpers only.
- Authoritative artifact paths produced by the skill:
  - `projects/{project-name}/Game Demo/[slug]-concept-{A|B|C}.html` — three mini concept prototypes from Phase 1
  - `projects/{project-name}/Game Demo/[slug]-vN.html` — versioned full playable prototype from Phase 2 (final approved version is `vN`)
  - `projects/{project-name}/Game Demo/[slug]-GCD.md` — Vietnamese lightweight GCD from Phase 3
- Downstream stages (mockup, wireframe, detail docs) consume `[slug]-vN.html` (final) and `[slug]-GCD.md` as ground truth.
- Ask for confirmation only at explicit approval gates, destructive rewrites, broad scope changes, or ambiguous product decisions.

---

## Step 0: Project Setup + Optional Market Research

Create the project directory under `projects/`. Use the user's game idea as the project name (kebab-case). Create the `Game Demo/` subdirectory inside it (this is where the `game-prototype` skill will write all its output).

Ask the user via AskUserQuestion:

> "Do you want market research to inform the prototype concept?"
> Options: "Yes, run market research in background" / "No, skip it"

- If yes: invoke the **market-researcher** agent IN BACKGROUND (do not wait for it). Continue immediately to Step 1. The findings will be fed into `game-prototype` Phase 1 step 1 (idea maturity assessment) when the agent returns.
- If no: proceed directly to Step 1.

---

## Step 1: Run the `game-prototype` Skill End-to-End

Invoke the `game-prototype` skill (located at `skills/game-prototype/SKILL.md`). Run it with the current project directory as its output root so all artifacts land under `projects/{project-name}/Game Demo/`.

The skill drives the full early pipeline through three phases. The orchestrator's job is only to route the user's responses into the skill and to surface the skill's own approval gates.

### Phase 1 — Concept brainstorm + audits + Gate 1

The skill collects:

1. Idea maturity (A/B/C/D self-assessment).
2. Target audience (3+1 suggestion format, user picks 1).
3. Problem statement (Experience-driven "How to" format, user picks 1 from 3-5 suggestions or writes their own).
4. 8 Kinds of Fun (user picks 1-3 priority aesthetics).
5. 3 gameplay options (Convention / Twist / Ambitious) — each option includes a text description with 4 components (Pitching, Win/Lose, Player Choices, Challenges) **and** a mini playable concept prototype written to `Game Demo/[slug]-concept-{A|B|C}.html` (~300-500 lines, 1 screen, 1 representative puzzle).
6. **Pre-Prototype Audit (mandatory)** — 5-layer audit (L0 Genre Faithfulness → L1 Substrate Capacity → L2 Decision Anatomy → L4 Experience Alignment → L5 Felt Experience Self-Test) for each of the 3 options. The skill loops up to 2 iterations on failures, then escalates.
7. User picks 1 option (or remixes between options) after playing the 3 mini prototypes.
8. **Anti-pattern Audit (silent, 12 items)** — checklist over the picked option; surface 1-2 line summary only unless the user asks for the full table.
9. **Gate 1** — silent confirm: "Phase 1 complete. Gameplay [Option name] approved. Sang Phase 2?"

If market research from Step 0 has returned by now, feed its summary into the skill before Phase 1 starts so it can shape audience and problem-statement suggestions.

**STOP. Wait for the skill's Gate 1 user confirm before continuing.**

### Phase 2 — Full versioned prototype + iteration + Gate 2

The skill then:

1. Decides scope (Minimal/Standard/Full) silently from audience + complexity, announces it, and waits for user confirm or override.
2. Reuses the slug from Phase 1 (no regeneration).
3. Reads `references/prototype-html-template.md` to lock in skeleton + CSS/JS conventions.
4. Single-shot expands the chosen `Game Demo/[slug]-concept-{X}.html` into a full version saved as `Game Demo/[slug]-v1.html`.
5. Self-tests the file against the template checklist and applies fixes.
6. Announces: "Prototype full version xong, mở `Game Demo/[slug]-v1.html` trong browser để chơi."
7. Iteration loop: each user revision saves a new version (`-v2.html`, `-v3.html`, …). **Never overwrite.** The "approved final version" is the highest-numbered file from this loop.

**STOP. Wait for user approval of the final `[slug]-vN.html` before continuing to Phase 3.**

### Phase 3 — Lightweight GCD

The skill then writes `projects/{project-name}/Game Demo/[slug]-GCD.md` in **Vietnamese**, following `references/gcd-output-template.md`. The lightweight GCD must contain the minimum downstream context required by mockup, wireframe, and detail-doc agents:

- Section 1: Target Audience, Problem Statement, 1-3 Kinds of Fun (with the concrete prototype mechanic that delivers each).
- Section 2: Pitching, Win/Lose conditions, player choices (read from the HTML), challenges (read from the HTML).
- Section 3: Screen list — one entry per screen actually present in `[slug]-vN.html` (1:1 mapping with the prototype).
- Section 4: Game state schema (read from the `gameState` JS object), resolve rules with formulas (read from JS functions), random/probability triggers, edge cases.
- Section 5: Reference prototype version history.

Equivalent experience goals (aesthetics/pillars) are expressed via Section 1 (Kinds of Fun) and Section 2.1 (Pitching). No `concept-pitch.md` is produced.

When the skill reports completion, present `Game Demo/[slug]-GCD.md` to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": route the user's feedback back into `game-prototype` (Phase 2 if it touches playable behavior, Phase 3 if it touches the GCD wording only) and re-present.
- If "Approve" or "Skip": continue to Step 2.

---

## Step 2: Mockup (all screens, with component picker)

Invoke the **mockup-designer** agent to generate `projects/{project-name}/mockup.html` — a high-fidelity interactive mockup covering all screens. The mockup embeds the **dom-grab** component picker (via CDN) so the user can click any component in the browser, copy its context to clipboard, and paste it into feedback when requesting changes.

The mockup-designer will:

1. Read the approved `projects/{project-name}/Game Demo/[slug]-vN.html`, `projects/{project-name}/Game Demo/[slug]-GCD.md`, optional `projects/{project-name}/Game Demo/[slug]-concept-{A|B|C}.html` for variant reference, and `projects/{project-name}/art-direction.md` (if present) as input.
2. Treat the prototype's validated interactions and the lightweight GCD's screen list as mandatory ground truth.
3. Run the brainstorm protocol to confirm the full screen list with the user before building.
4. Produce `mockup.html` with sidebar navigation, mobile viewport (390×844), screen transitions, brand colors, and `data-component` attributes on every meaningful UI element.
5. Include a help banner at the top of the page explaining how to activate the component picker (hold Cmd+C or Ctrl+C for 200ms, then click any component).

Wait for the mockup-designer to complete. Invoke the **ui-ux-reviewer** agent automatically to quality-check the mockup against `references/mockup-review-criteria.md` and the approved prototype.

Present the mockup (with review notes) to the user via AskUserQuestion. Tell the user how to open `mockup.html` in a browser and use the component picker for feedback.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": collect feedback (ideally with component picker clipboard output pasted in), apply revisions, and re-present.
- If "Approve" or "Skip": continue to Step 3.

---

## Step 3: Wireframe Overview (single-page flowchart + component spec)

Invoke the **wireframe-designer** agent to generate `projects/{project-name}/wireframe.html` — a single-page interactive flowchart showing all screens as connected boxes with a detail panel per screen listing every component, its states, actions, and data bindings.

The wireframe-designer will:

1. Read `projects/{project-name}/Game Demo/[slug]-GCD.md`, the approved `projects/{project-name}/Game Demo/[slug]-vN.html`, and most importantly `projects/{project-name}/mockup.html` (the approved ground truth) as input.
2. Extract every screen and every `data-component` from `mockup.html` — wireframe must be 1:1 synced with mockup.
3. Preserve the validated prototype loop in the flowchart.
4. Present the proposed flowchart layout strategy (linear / hub-and-spoke / tree) for user confirmation.
5. Build `wireframe.html` with: SVG flowchart canvas (pan + zoom), screen boxes connected by labeled wires with arrowheads, and a slide-in detail panel per screen showing component tables (ID / type / position / states / actions / data / notes) per `references/wireframe-overview-guide.md`.

Wait for the wireframe-designer to complete. Invoke the **ui-ux-reviewer** agent automatically to quality-check the wireframe overview against the mockup and prototype.

Present the wireframe (with review notes) to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": apply revisions and re-present.
- If "Approve" or "Skip": continue to Step 4.

---

## Step 4: Feedback Gate

Ask the user via AskUserQuestion:

> "Do you have any feedback on the prototype, lightweight GCD, mockup, or wireframe before we move to detailed documents?"
> Options: "Yes, I have feedback" / "No, everything looks good"

- If "Yes, I have feedback":
  1. Collect the feedback. Encourage the user to paste any component-picker clipboard output from the mockup.
  2. Invoke the **feedback-interpreter** agent to interpret and structure the feedback — including identifying which upstream artifact needs updating.
  3. Apply the changes to the smallest scope possible.
  4. **Loop back** to the earliest affected step:
     - If the feedback affects playable behavior, the lightweight GCD, or core mechanic — re-enter Step 1 at the relevant `game-prototype` phase (Phase 2 for prototype changes, Phase 3 for GCD wording changes). Save a new `[slug]-vN+1.html` and/or update `[slug]-GCD.md`.
     - If the feedback only affects mockup look/feel — re-run Step 2.
     - If the feedback only affects wireframe specs — re-run Step 3.
- If "No, everything looks good": continue to Step 5.

---

## Step 5: Select Detail Documents

Ask the user via AskUserQuestion which detail documents to generate. Allow multiple selections:

- gameplay-design.md
- ui-ux-spec.md
- economy-design.md
- art-direction.md
- content-plan.md
- technical-requirements.md
- sound-design.md

Record the user's selections. Proceed to Step 6.

---

## Step 6: Generate Detail Documents

For each document the user selected, in order:

1. Invoke the **document-writer** agent to generate the document.
   - Every document type must read `projects/{project-name}/Game Demo/[slug]-GCD.md` (lightweight GCD) and the final `projects/{project-name}/Game Demo/[slug]-vN.html` (approved playable prototype) before writing.
   - When generating `ui-ux-spec.md`, document-writer MUST additionally read `mockup.html` and `wireframe.html` as authoritative source for screen list, component list, and component specs. The goal is to extract / reference existing spec, not re-invent it.
   - When generating `art-direction.md`, document-writer additionally consults the approved mockup for visual direction consistency.
2. Immediately after document generation, invoke the appropriate reviewer automatically:
   - For `ui-ux-spec.md` and `art-direction.md`: invoke **ui-ux-reviewer**.
   - For all other documents: invoke **detail-doc-reviewer**.
3. Present the document (with review notes) to the user via AskUserQuestion.

**STOP. Wait for approval before generating the next document.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": revise and re-present. Repeat until approved or skipped.
- If "Approve" or "Skip": move to the next selected document.

Repeat for every selected document.

---

## Pipeline Complete

Once all selected documents are approved or skipped:

1. Summarize all artifacts created:
   - Project name and directory
   - `Game Demo/[slug]-concept-{A|B|C}.html` — three Phase 1 mini concept prototypes
   - `Game Demo/[slug]-vN.html` — final approved playable prototype (cite the version number)
   - `Game Demo/[slug]-GCD.md` — Vietnamese lightweight GCD
   - `mockup.html` — high-fi interactive mockup with dom-grab component picker
   - `wireframe.html` — single-page wireframe overview synced 1:1 with the mockup
   - `market-research.md` (if requested)
   - Each detail document generated
2. Show the current project status by listing the artifacts in the project directory.
3. Remind the user they can run `/design-kit:iterate <feedback>` to update any single artifact, or re-open `mockup.html` in a browser to grab component contexts for targeted feedback.
