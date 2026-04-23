---
description: Start the game design pipeline — from idea to complete design documents
argument-hint: <game idea>
---

Execute the full game design pipeline from idea to complete design documents. Follow every step in order. Never skip an approval gate. Never auto-apply changes without user confirmation.

**CRITICAL RULE: Before executing ANY step, announce what is about to happen.** Use this format:

```
📍 Step N: [Step Name]
[1-2 sentence description of what will happen next and why]
```

Do this BEFORE every step, every agent invocation, and every approval gate. The user must always know what is coming next before it starts.

---

## Step 0: Project Setup

Create the project directory under `projects/`. Use the user's game idea as the project name (kebab-case). Create subdirectories `prototype/` and `documents/` inside it.

Ask the user via AskUserQuestion:

> "Do you want market research to inform the concept?"
> Options: "Yes, run market research" / "No, skip it"

- If yes: invoke the **market-researcher** agent IN BACKGROUND (do not wait for it). Continue immediately to Step 1.
- If no: proceed directly to Step 1.

---

## Step 1: Collect Concept Info

Analyze the user's input (the game idea argument). Identify what information is already provided vs what is missing.

**Required information** (MUST have before proceeding):
- Game idea / theme
- Genre (Action, Puzzle, RPG, Strategy, Simulation, Adventure, Idle, Sports, etc.)
- Player type (Casual / Mid-core / Hardcore)
- Age group (Under 13 / 13-17 / 18-25 / 26-35 / 35+)

**Optional information** (infer or skip if not provided):
- Sub-genre (e.g., Idle RPG, Hyper-casual, Roguelike)
- Core mechanic preference
- Monetization direction (IAP, Ads, Premium)
- Reference games

**Process:**
1. Parse the user's game idea for any information already present.
2. List what is already known and what is still missing.
3. Ask ONLY for the missing required fields via AskUserQuestion (multiple-choice where possible). Do not re-ask what the user already provided.
4. If all 4 required fields are present in the original input, confirm the interpretation and proceed — no questions needed.

---

## Step 2: Choose Brainstorm Direction

Ask the user via AskUserQuestion:

> "How should I brainstorm concepts?"
> Options:
> - **"AI tự do sáng tạo"** — AI generates original concepts freely based on the game idea, genre, and audience
> - **"Kết hợp mechanics từ các game"** — AI analyzes mechanics from existing games and proposes novel combinations

**STOP. Wait for the user to choose a direction.**

After selection:
- If "AI tự do sáng tạo": search knowledge base using `mcp__hindsight__recall`, read `references/game-design-theories.md`. Generate concepts freely.
- If "Kết hợp mechanics từ các game": search knowledge base for mechanics patterns across the genre, search for reference game mechanics, identify mechanics from different games that could combine in novel ways. Generate concepts as combinations.

---

## Step 3: Brainstorm Concepts

Generate 3 to 5 distinct concept ideas based on the chosen direction.

Ask the user via AskUserQuestion how to present the concepts:

> "How should I present each concept?"
> Options:
> - **"Pitch cảm xúc và điểm khác biệt"** — Emotional pitch: what it feels like, why it's unique, what makes it exciting
> - **"Liệt kê mechanics sources + cách kết hợp"** — Mechanics breakdown: which game mechanics are combined, how they interact, what emerges

**STOP. Wait for the user to choose a presentation style.**

Then generate 3-5 concepts. Each concept includes:
- A short title (one line)
- Content based on chosen style:
  - Emotion pitch: 5-sentence pitch focused on unique appeal, play feel, and differentiator. No detailed mechanics.
  - Mechanics breakdown: list source games/mechanics, explain the combination, describe the emergent gameplay.

Present all concepts to the user via AskUserQuestion and ask them to pick one.

**STOP. Wait for the user to select a concept before proceeding.**

---

## Step 4: Concept Pitch

Generate a structured concept pitch for the selected concept.

If market research was requested in Step 0, collect the background agent's results now.

Invoke the **concept-designer** agent to generate a Concept Pitch containing these sections:

### Section 1: Target Aesthetics
Select 2-3 primary aesthetics from the 8 Kinds of Fun (LeBlanc):
Sensation, Fantasy, Narrative, Challenge, Fellowship, Discovery, Expression, Submission.
Explain WHY each was chosen for this concept and audience.

### Section 2: Core Pillars
Define 3-4 design pillars — the non-negotiable principles that guide every design decision.
Each pillar: name + 2-3 sentence explanation of what it means for this game.

### Section 3: Core Loop Summary
Describe how a single session works:
- Core loop (what the player DOES repeatedly)
- Primary actions (the 2-3 main verbs)
- Flow of one session (start → middle → end, with timing)

### Section 4: Meaningful Decisions Analysis
Apply the 12 game design theories from `references/game-design-theories.md`:
- Key decision points in the core loop
- Anatomy of each choice (Before, Communication, Action, Consequences, Feedback)
- Check for blind decisions, dominant strategies, meaningless choices
- Flow and interest curve for a typical session
- Skill-luck spectrum positioning

Invoke the **review-concept** agent automatically to quality-check the pitch.

Present the complete Concept Pitch to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": revise and re-present. Repeat until approved or skipped.
- If "Approve" or "Skip": continue to Step 5.

---

## Step 5: Generate GCD (Game Concept Document)

1. Invoke the **concept-designer** agent to generate the full GCD using `references/gcd-template.md` as the template.
2. Apply all 12 game design theories from `references/game-design-theories.md` to enrich the document.
3. Write the GCD output in Vietnamese.
4. Do NOT generate a GCD-Gameplay document.
5. Invoke the **review-concept** agent automatically to quality-check the GCD.
6. Present the GCD (with review notes) to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": revise and re-present. Repeat until approved or skipped.
- If "Approve" or "Skip": continue to Step 6.
---

## Step 6: Prototype

Invoke the **code-prototyper** agent to generate an HTML5 prototype from the Concept Pitch + GCD.

Wait for it to complete. Present the result to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": apply revisions and re-present.
- If "Approve" or "Skip": continue to Step 7.
---

## Step 7: Mockup (all screens, with component picker)

Invoke the **mockup-designer** agent to generate `projects/{project-name}/mockup.html` — a high-fidelity interactive mockup covering all screens. The mockup embeds the **dom-grab** component picker (via CDN) so the user can click any component in the browser, copy its context to clipboard, and paste it into feedback when requesting changes.

The mockup-designer will:
1. Read `concept-pitch.md`, `gcd.md`, `prototype/index.html`, and `art-direction.md` (if present) as input.
2. Run the brainstorm protocol to confirm the full screen list with the user before building.
3. Produce `mockup.html` with sidebar navigation, mobile viewport (390×844), screen transitions, brand colors, and `data-component` attributes on every meaningful UI element.
4. Include a help banner at the top of the page explaining how to activate the component picker (hold Cmd+C or Ctrl+C for 200ms, then click any component).

Wait for the mockup-designer to complete. Invoke the **ui-ux-reviewer** agent automatically to quality-check the mockup against `references/mockup-review-criteria.md`.

Present the mockup (with review notes) to the user via AskUserQuestion. Tell the user how to open `mockup.html` in a browser and use the component picker for feedback.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": collect feedback (ideally with component picker clipboard output pasted in), apply revisions, and re-present.
- If "Approve" or "Skip": continue to Step 8.

---

## Step 8: Wireframe Overview (single-page flowchart + component spec)

Invoke the **wireframe-designer** agent to generate `projects/{project-name}/wireframe.html` — a single-page interactive flowchart showing all screens as connected boxes with a detail panel per screen listing every component, its states, actions, and data bindings.

The wireframe-designer will:
1. Read `concept-pitch.md`, `gcd.md`, and most importantly `mockup.html` (the approved ground truth) as input.
2. Extract every screen and every `data-component` from `mockup.html` — wireframe must be 1:1 synced with mockup.
3. Present the proposed flowchart layout strategy (linear / hub-and-spoke / tree) for user confirmation.
4. Build `wireframe.html` with: SVG flowchart canvas (pan + zoom), screen boxes connected by labeled wires with arrowheads, and a slide-in detail panel per screen showing component tables (ID / type / position / states / actions / data / notes) per `references/wireframe-overview-guide.md`.

Wait for the wireframe-designer to complete. Invoke the **ui-ux-reviewer** agent automatically to quality-check the wireframe overview.

Present the wireframe (with review notes) to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": apply revisions and re-present.
- If "Approve" or "Skip": continue to Step 9.

---

## Step 9: Feedback Gate

Ask the user via AskUserQuestion:

> "Do you have any feedback on the concept, prototype, mockup, or wireframe before we move to detailed documents?"
> Options: "Yes, I have feedback" / "No, everything looks good"

- If "Yes, I have feedback":
  1. Collect the feedback. Encourage the user to paste any component-picker clipboard output from the mockup.
  2. Invoke the **feedback-interpreter** agent to interpret and structure the feedback — including identifying which upstream artifact (concept / gcd / prototype / mockup / wireframe) needs updating.
  3. Apply the changes to the smallest scope possible (don't regenerate upstream artifacts unless necessary).
  4. **Loop back** to the earliest affected step (Step 2 if concept changes, Step 5 if GCD changes, Step 6 if prototype changes, Step 7 if only mockup, Step 8 if only wireframe) and re-run from there with the updated context.
- If "No, everything looks good": continue to Step 10.

---

## Step 10: Select Detail Documents

Ask the user via AskUserQuestion which detail documents to generate. Allow multiple selections:

- gameplay-design.md
- ui-ux-spec.md
- economy-design.md
- art-direction.md
- content-plan.md
- technical-requirements.md
- sound-design.md

Record the user's selections. Proceed to Step 11.

---

## Step 11: Generate Detail Documents

For each document the user selected, in order:

1. Invoke the **document-writer** agent to generate the document.
   - When generating `ui-ux-spec.md`, document-writer MUST read `mockup.html` and `wireframe.html` as authoritative source for screen list, component list, and component specs. The goal is to extract / reference existing spec, not re-invent it.
   - When generating `art-direction.md`, document-writer consults the approved mockup for visual direction consistency.
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
   - Project name and ID
   - Concept Pitch
   - GCD (Vietnamese)
   - HTML5 prototype (`prototype/index.html`)
   - Mockup with component picker (`mockup.html`)
   - Wireframe overview (`wireframe.html`)
   - Market research (if requested)
   - Each detail document generated
2. Show the current project status by listing the artifacts in the project directory.
3. Remind the user they can run `/design-kit:iterate <feedback>` to update any single artifact, or re-open `mockup.html` in a browser to grab component contexts for targeted feedback.
