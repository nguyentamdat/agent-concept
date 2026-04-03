---
name: game-ui-ux
version: 1.0.0
description: "This skill should be used when the user asks to 'review UI mockup', 'create UI checklist', 'generate art style guide', 'create moodboard brief', 'review game UI', 'critique mockup', 'phân tích UI game', 'tạo art style guide', or discusses mobile game UI/UX topics such as shape language, color theory, visual hierarchy, CTA design, onboarding flow, accessibility, responsive layout, dark UI, offer popup, gacha UI, or screen-specific design patterns."
---

# Game UI/UX Skill — Mobile Game Art & Design Knowledge

Comprehensive UI/UX knowledge for mobile games across all genres: casual, midcore, and hardcore. This skill covers visual design principles, screen-specific patterns, art direction, and review methodology drawn from Casual Game Art workshops and industry best practices.

---

## Task Routing

| When the user wants... | Action |
|---|---|
| Review or critique a UI mockup | Load `references/review-checklist.md` → score 6 criteria + provide feedback |
| A checklist for a specific screen type | Load `references/screen-checklists.md` → output tailored checklist |
| An art style guide or moodboard brief | Load `references/art-style-guide.md` → generate structured brief |
| Theory explanations or training content | Load `references/theory-knowledge-base.md` → explain with examples |
| GUI section writing guidance | Load `references/gui-section-guide.md` → follow section structure |
| Gameplay section writing guidance | Load `references/gameplay-section-guide.md` → follow section structure |

---

## Workflow 1: Review / Critique UI Mockup

Use when the user shares a UI image or mockup and wants structured feedback.

1. Load `references/review-checklist.md` to get the evaluation criteria set.
2. Identify the game genre (Casual / Midcore / Hardcore). Ask the user if unclear.
3. Analyze the mockup across two layers:
   - **Art Quality layer:** Visual Style, Color System, Consistency, Technical Readiness
   - **Layout Quality layer:** Visual Hierarchy, Spatial Organization
4. Score each criterion on a 1-5 scale.
5. Output a scorecard with per-criterion scores, detailed observations, and specific improvement suggestions.
6. If the user requests a file export, produce an Excel scorecard or Markdown report.

**Key questions to answer in the review:**
- Does the visual style match the genre conventions?
- Is the color system coherent (primary, secondary, accent, neutral)?
- Are interactive elements (CTAs, buttons) visually distinct and accessible?
- Does the layout guide the eye to the most important action?
- Are spacing and alignment consistent across elements?

---

## Workflow 2: Generate UI Checklist

Use when the user needs a checklist for a specific screen or feature.

1. Load `references/screen-checklists.md` to get checklist templates.
2. Confirm the genre and screen type with the user if not specified.
3. Output the appropriate checklist in the format the user prefers (Markdown, table, or numbered list).

Screen types covered include: main menu, HUD, inventory, shop/offer popup, gacha pull screen, onboarding flow, settings, and battle results.

---

## Workflow 3: Art Style Guide / Moodboard Brief

Use when the user has a game concept and needs art direction.

1. Load `references/art-style-guide.md` to get the framework.
2. Gather context from the user: genre, theme, target audience, and reference games.
3. Generate an Art Style Brief containing:
   - **Color palette** — primary, secondary, accent, and neutral colors with hex codes
   - **Shape language** — round vs. angular, border radius guidelines, silhouette principles
   - **Typography** — font family recommendations, size hierarchy (H1/H2/body/caption)
   - **UI material direction** — texture, gloss, matte, or flat style guidance
   - **Moodboard keywords** — 8-12 descriptive terms for visual tone
   - **CTA color mapping** — which colors map to which action types (confirm, cancel, premium)

---

## Workflow 4: Theory Explanation / Training

Use when the user asks about UI/UX concepts or needs training material.

1. Load `references/theory-knowledge-base.md` for the relevant topic.
2. Explain the concept clearly, with real game examples where possible.
3. For training slide requests, structure content as titled sections with key points and visual examples.

Topics covered: visual hierarchy, color theory, shape language, animation principles, onboarding design, monetization UI (offer popups, gacha, battle pass), accessibility, responsive layout, localization considerations, and dark UI patterns.

---

## Output Principles

- **Genre-aware first.** Always confirm the genre before giving advice. Casual, midcore, and hardcore games have different visual conventions and player expectations.
- **Actionable feedback only.** Every critique must include a concrete suggestion the designer can act on. Avoid vague observations like "this looks off."
- **Specific over general.** Name the exact element, color, or spacing issue. "The CTA button lacks contrast against the background (ratio ~2.1:1, target 4.5:1)" beats "the button is hard to see."
- **Visual examples when possible.** Reference real games or describe a concrete visual pattern rather than abstract principles.
- **Vietnamese domain terms are acceptable.** Terms like "gacha UI", "offer popup", "dark UI", "visual hierarchy" can stay in English or Vietnamese depending on context. Don't force translation of established design vocabulary.
- **Format matches the request.** Checklists get checkboxes. Scorecards get tables. Theory explanations get prose with headers. Don't over-format simple answers.

---

## References

| File | Contents | Used in |
|---|---|---|
| `references/review-checklist.md` | 6-criteria review framework, scoring rubric, sub-checks per criterion | Workflow 1: Review mockup |
| `references/screen-checklists.md` | Per-screen checklists (HUD, shop, gacha, onboarding, etc.) | Workflow 2: Generate checklist |
| `references/art-style-guide.md` | Art direction framework: color, shape, typography, material, moodboard | Workflow 3: Art style guide |
| `references/theory-knowledge-base.md` | UI/UX theory topics: hierarchy, animation, monetization UI, accessibility, pipeline | Workflow 4: Theory/training |
| `references/gui-section-guide.md` | Writing guide for GUI sections in design documents | Document writing tasks |
| `references/gameplay-section-guide.md` | Writing guide for gameplay sections in design documents | Document writing tasks |
