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

Call the `project_create` MCP tool to initialize the project. Use the user's game idea as the project name.

Ask the user via AskUserQuestion:

> "Do you want market research to inform the concept?"
> Options: "Yes, run market research" / "No, skip it"

- If yes: invoke the **market-researcher** agent IN BACKGROUND (do not wait for it). Continue immediately to Step 1.
- If no: proceed directly to Step 1.

---

## Step 1: Collect Concept Info

Ask the user the following questions via AskUserQuestion. Use multiple-choice where possible. Ask all questions in a single interaction.

1. **Genre** (required, pick one): Action, Puzzle, RPG, Strategy, Simulation, Adventure, Idle, Sports, Other
2. **Target audience** (required):
   - Player type: Casual / Mid-core / Hardcore
   - Age range: Under 13 / 13-17 / 18-25 / 26-35 / 35+
3. **Platform**: Do NOT ask unless the user already mentioned a non-mobile platform in their idea. If they did not mention a platform, force Mobile and do not ask.
4. **Game mechanisms**:
   > "Do you want to specify game mechanisms, or let me choose from the knowledge base?"
   > Options: "I'll specify them" / "Auto-select from knowledge base"
   - If user specifies: record the mechanisms they describe.
   - If auto: search the knowledge base using `knowledge_search` and read `references/game-design-theories.md` to select mechanisms that fit the genre and audience. Do not ask the user about this.
5. **Reference games** (optional): "Any games you'd like this to feel similar to? (leave blank to skip)"

Do NOT ask about monetization at any point.

---

## Step 2: Brainstorm Concepts

1. Search the knowledge base using the `knowledge_search` MCP tool for game design patterns relevant to the genre and audience.
2. Recall prior game design context using `hindsight_recall` and `hindsight_reflect` tools.
3. Read `references/game-design-theories.md` for theory grounding.
4. Generate 3 to 5 distinct concept ideas. Each concept must include:
   - A short title (one line)
   - A 5-sentence pitch focused on unique appeal and play feel
   - No detailed mechanics. Focus on emotion, tone, and differentiator only.
5. Present all concepts to the user via AskUserQuestion and ask them to pick one.

**STOP. Wait for the user to select a concept before proceeding.**

---

## Step 3: Generate Outline

1. If market research was requested in Step 0, collect the background agent's results now.
2. Invoke the **concept-designer** agent to generate a concept outline using `references/phase-a-outline-template.md` as the template.
3. Immediately after, invoke the **review-concept** agent automatically to quality-check the outline. Do not present the outline to the user before the review completes.
4. Present the outline (with review notes if any) to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": apply the requested revisions and re-present. Repeat until approved or skipped.
- If "Approve" or "Skip": continue to Step 4.

---

## Step 4: Generate GCD (Game Concept Document)

1. Invoke the **concept-designer** agent to generate the GCD using `references/gcd-template.md` as the template.
2. Apply all 12 game design theories from `references/game-design-theories.md` to enrich the document.
3. Write the GCD output in Vietnamese.
4. Do NOT generate a GCD-Gameplay document at this step.
5. Immediately invoke the **review-concept** agent automatically to quality-check the GCD.
6. Present the GCD (with review notes) to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": revise and re-present. Repeat until approved or skipped.
- If "Approve" or "Skip": continue to Step 5.

---

## Step 5: Prototype + UI Mockups (Parallel)

Invoke both agents simultaneously, in parallel:

- **code-prototyper** agent: generate an HTML5 prototype from the current spec.
- **figma-designer** agent: create UI mockups from the current spec.
  - The figma-designer agent will automatically check if Figma is available.
  - If Figma plugin is running: create mockups in Figma.
  - If Figma is unavailable: fall back to generating `.excalidraw` files (plain JSON, viewable at excalidraw.com).
  - No user action needed — the fallback is automatic.

Wait for both to complete. Present both results to the user via AskUserQuestion.

**STOP. Wait for approval.**

> Options: "Approve" / "Request changes" / "Skip"

- If "Request changes": apply revisions to whichever artifact the user flags, then re-present.
- If "Approve" or "Skip": continue to Step 5.5.
---

## Step 5.5: Feedback Gate

Ask the user via AskUserQuestion:

> "Do you have any feedback to improve the concept, prototype, or mockups before we move to detailed documents?"
> Options: "Yes, I have feedback" / "No, everything looks good"

- If "Yes, I have feedback":
  1. Collect the feedback.
  2. Invoke the **feedback-interpreter** agent to interpret and structure the feedback.
  3. Apply the changes.
  4. **Loop back to Step 2** and re-run the pipeline from concept brainstorming with the updated direction.
- If "No, everything looks good": continue to Step 6.

---

## Step 6: Select Detail Documents

Ask the user via AskUserQuestion which detail documents to generate. Allow multiple selections:

- gameplay-design.md
- ui-ux-spec.md
- economy-design.md
- art-direction.md
- content-plan.md
- technical-requirements.md
- sound-design.md

Record the user's selections. Proceed to Step 7.

---

## Step 7+: Generate Detail Documents (One by One)

For each document the user selected, in order:

1. Invoke the **document-writer** agent to generate the document.
2. Immediately after:
   - If the document is `ui-ux-spec.md`: invoke the **ui-ux-reviewer** agent automatically.
   - For all other documents: invoke the **detail-doc-reviewer** agent automatically.
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
   - Concept outline
   - GCD (Vietnamese)
   - HTML5 prototype
   - Figma mockups
   - Each detail document generated
2. Show the current project status using the appropriate MCP tool.
3. Let the user know the pipeline is complete and they can invoke individual commands to regenerate or revise any artifact.
