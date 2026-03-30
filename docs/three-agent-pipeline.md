# 3-Agent Pipeline — Technical Plan

## 1. Pipeline Overview

```
USER: "Tôi muốn làm game casual puzzle gardening theme"
  │
  ▼
┌─────────────────────────────────────────────────────┐
│  AGENT 1: CONCEPT                                   │
│  Brainstorm + Knowledge Base → spec_v1.yaml         │
└──────────────────────┬──────────────────────────────┘
                       │ spec file
                       ▼
┌─────────────────────────────────────────────────────┐
│  AGENT 2: CODE                                      │
│  spec_v1.yaml → prototype_v1/ (playable web app)    │
└──────────────────────┬──────────────────────────────┘
                       │ playable prototype
                       ▼
              ┌────────────────┐
              │  USER PLAYS    │◄─────────────────────┐
              │  + FEEDBACK    │                       │
              └───────┬────────┘                       │
                      │ "progression quá chậm,         │
                      │  thêm power-ups"               │
                      ▼                                │
┌─────────────────────────────────────┐                │
│  FEEDBACK LOOP                      │                │
│  feedback → spec diff → spec_v2    │                │
│  → Code Agent updates prototype    ├────────────────┘
│  → User plays again...             │
└──────────────────────┬──────────────┘
                       │ user approves spec_vN
                       ▼
┌─────────────────────────────────────────────────────┐
│  AGENT 3: DETAIL DOCUMENT                           │
│  spec_final.yaml → gameplay.md, ui-ux.md,           │
│  economy.md, art-direction.md, content-plan.md,     │
│  technical-requirements.md                           │
└─────────────────────────────────────────────────────┘
```

**Core principle:** Spec file là single source of truth. Mọi agent đọc/viết spec. Prototype được generate từ spec. Documents được expand từ spec. Feedback loop sửa spec → regenerate prototype.

---

## 2. Spec File Format

Đây là artifact quan trọng nhất — bridge giữa 3 agents, human-readable, machine-parseable, diffable, versionable.

### 2.1 Tại sao YAML

| Format | Human-readable | Comments | Multiline text | Diffable | Machine-parse |
|---|---|---|---|---|---|
| JSON | ❌ | ❌ | ❌ | ⚠️ | ✅ |
| YAML | ✅ | ✅ | ✅ | ✅ | ✅ |
| Markdown | ✅ | N/A | ✅ | ✅ | ⚠️ |
| **YAML** ← winner | | | | | |

### 2.2 Spec Schema (Zod + YAML)

```typescript
// src/agents/spec-schema.ts
import { z } from "zod";

export const GameSpecSchema = z.object({
  meta: z.object({
    title: z.string(),
    version: z.number().int(),
    genre: z.string(),
    subGenre: z.string().optional(),
    platform: z.enum(["mobile", "web", "pc", "console", "cross-platform"]),
    createdAt: z.string(),
    updatedAt: z.string(),
  }),

  concept: z.object({
    elevatorPitch: z.string().max(280),
    expandedDescription: z.string(),
    designPillars: z.array(z.object({
      name: z.string(),
      description: z.string(),
      dos: z.array(z.string()),
      donts: z.array(z.string()),
    })).min(2).max(5),
    targetAudience: z.object({
      primaryAge: z.string(),
      platforms: z.array(z.string()),
      sessionLength: z.string(),
      spendingBehavior: z.string(),
      gamingBackground: z.string(),
    }),
    essentialExperience: z.string(),
    uniqueHook: z.string(),
  }),

  coreLoop: z.object({
    summary: z.string(),
    actions: z.array(z.object({
      id: z.string(),
      name: z.string(),
      input: z.string(),
      mechanic: z.string(),
      feedback: z.string(),
      reward: z.string(),
    })),
    sessionFlow: z.object({
      duration: z.string(),
      phases: z.array(z.object({
        name: z.string(),
        duration: z.string(),
        description: z.string(),
      })),
    }),
    progressionLoop: z.object({
      shortTerm: z.string(),
      mediumTerm: z.string(),
      longTerm: z.string(),
    }),
    difficultyApproach: z.string(),
  }),

  mechanics: z.array(z.object({
    id: z.string(),
    name: z.string(),
    category: z.enum([
      "core", "progression", "social", "economy", "meta",
    ]),
    description: z.string(),
    rules: z.array(z.string()),
    controls: z.string(),
    feedbackSystems: z.array(z.string()),
    interactsWith: z.array(z.string()),
  })),

  economy: z.object({
    currencies: z.array(z.object({
      id: z.string(),
      name: z.string(),
      type: z.enum(["soft", "hard", "energy", "social", "event"]),
      earnMethods: z.array(z.string()),
      spendMethods: z.array(z.string()),
      cap: z.string().optional(),
    })),
    monetization: z.object({
      model: z.enum(["free-to-play", "premium", "freemium", "subscription", "ad-supported"]),
      primaryRevenue: z.string(),
      iapTiers: z.array(z.object({
        name: z.string(),
        price: z.string(),
        contents: z.string(),
      })).optional(),
    }),
  }).optional(),

  screens: z.array(z.object({
    id: z.string(),
    name: z.string(),
    purpose: z.string(),
    elements: z.array(z.object({
      type: z.enum(["button", "display", "input", "canvas", "list", "panel", "modal"]),
      id: z.string(),
      label: z.string(),
      behavior: z.string(),
    })),
    transitions: z.array(z.object({
      target: z.string(),
      trigger: z.string(),
    })),
  })),

  visualDirection: z.object({
    style: z.string(),
    colorPalette: z.array(z.string()),
    mood: z.string(),
    references: z.array(z.string()),
  }),

  prototypeScope: z.object({
    includedMechanics: z.array(z.string()),
    excludedMechanics: z.array(z.string()),
    placeholderAssets: z.boolean(),
    targetFidelity: z.enum(["wireframe", "low", "medium"]),
  }),

  history: z.array(z.object({
    version: z.number(),
    date: z.string(),
    changes: z.array(z.string()),
    feedbackSource: z.enum(["initial", "user-feedback", "agent-suggestion", "human-edit"]),
  })),
});

export type GameSpec = z.infer<typeof GameSpecSchema>;
```

### 2.3 Spec File Example

```yaml
meta:
  title: "Bloom Garden"
  version: 3
  genre: "puzzle"
  subGenre: "match-3"
  platform: "mobile"
  createdAt: "2026-03-30T10:00:00Z"
  updatedAt: "2026-03-30T14:30:00Z"

concept:
  elevatorPitch: >
    Match-3 puzzle game where every match grows your garden,
    creating a personal zen space that evolves with your skill.
  expandedDescription: >
    Bloom Garden combines satisfying match-3 mechanics with
    a gardening simulation meta-layer. Players match flowers
    to earn seeds, which they plant in their personal garden.
    Each garden reflects the player's puzzle journey.
  designPillars:
    - name: "Satisfying Matches"
      description: "Every match should FEEL good — visual, audio, haptic"
      dos: ["juice animations", "chain combos", "screen shake on big matches"]
      donts: ["silent matches", "static board", "instant clear"]
    - name: "My Garden, My Story"
      description: "Garden is personal expression, not optimal path"
      dos: ["multiple garden layouts", "decorative choices", "seasonal themes"]
      donts: ["one correct garden", "forced layouts", "pay-to-decorate only"]
    - name: "One More Level"
      description: "Session ends with desire to come back"
      dos: ["preview next unlock", "daily garden events", "streak rewards"]
      donts: ["hard paywall at level N", "energy system at start", "punish absence"]
  targetAudience:
    primaryAge: "25-45"
    platforms: ["iOS", "Android"]
    sessionLength: "3-5 minutes"
    spendingBehavior: "light spender, responds to cosmetics"
    gamingBackground: "plays Candy Crush, Gardenscapes, casual puzzle fans"
  essentialExperience: >
    The feeling of tending a garden — patient, meditative,
    each small action contributing to something beautiful.
  uniqueHook: >
    Your puzzle performance directly shapes a living garden.
    Combo chains create rare flowers. Streaks unlock garden expansions.

coreLoop:
  summary: "Match flowers → Earn seeds → Plant garden → Unlock new flowers → Match again"
  actions:
    - id: "match"
      name: "Match Flowers"
      input: "Swipe to swap adjacent tiles"
      mechanic: "match-3 with gravity fill"
      feedback: "Matched tiles burst with particles, chain multiplier shows"
      reward: "Seeds (1 per match, 3x for chains), progress toward level goal"
    - id: "plant"
      name: "Plant Seeds"
      input: "Tap empty garden plot, select seed type"
      mechanic: "placement on grid, growth timer"
      feedback: "Planting animation, growth preview"
      reward: "Garden beauty score increases, unlocks decorations"
    - id: "harvest"
      name: "Harvest & Arrange"
      input: "Tap grown plant to harvest, drag to arrange"
      mechanic: "collection + spatial arrangement"
      feedback: "Harvest sparkle, garden beauty score popup"
      reward: "XP, new seed varieties, garden expansion tokens"
  sessionFlow:
    duration: "3-5 minutes"
    phases:
      - name: "Level Start"
        duration: "5 seconds"
        description: "Show level goal, board preview, power-ups available"
      - name: "Puzzle Play"
        duration: "1-3 minutes"
        description: "Match-3 gameplay, work toward level goal"
      - name: "Garden Time"
        duration: "30-60 seconds"
        description: "Spend earned seeds, arrange garden, see growth"
      - name: "Session End"
        duration: "10 seconds"
        description: "Preview next level reward, daily streak check"
  progressionLoop:
    shortTerm: "Complete level → earn seeds → plant immediately"
    mediumTerm: "Complete world (20 levels) → unlock garden theme + expansion"
    longTerm: "Seasonal events, garden prestige system, friend garden visits"
  difficultyApproach: >
    Gradual ramp with new tile types every 10 levels.
    Difficulty spike before each world boss (level 20, 40, 60).
    Breather levels after boss. No level requires more than 3 attempts for median player.

mechanics:
  - id: "match-3"
    name: "Flower Matching"
    category: "core"
    description: "Swap adjacent tiles to create lines of 3+ same flowers"
    rules:
      - "3-match clears tiles, 4-match creates power-up"
      - "5-match creates rainbow (clears all of one color)"
      - "L-shape or T-shape creates bomb (3x3 area)"
      - "Cascading matches multiply reward: 2x, 3x, 5x"
      - "Board refills from top with gravity"
    controls: "Swipe to swap, tap power-up to activate"
    feedbackSystems:
      - "Particle burst on match (color-coded)"
      - "Screen shake on 4+ chain"
      - "Haptic pulse on match (mobile)"
      - "Combo counter with escalating sound pitch"
    interactsWith: ["garden-planting", "power-ups"]

  - id: "garden-planting"
    name: "Garden Building"
    category: "meta"
    description: "Plant seeds earned from puzzles into personal garden grid"
    rules:
      - "Each seed type grows into specific flower (matches puzzle flowers)"
      - "Growth takes real-time: common=1h, rare=4h, epic=12h"
      - "Adjacent same-type flowers create 'bloom bonus' (beauty multiplier)"
      - "Garden has expandable grid (start 4x4, max 8x8)"
    controls: "Tap plot to plant, drag to rearrange, pinch to zoom"
    feedbackSystems:
      - "Growth animation (sprout → bud → bloom)"
      - "Beauty score updates in real-time"
      - "Notification when plant blooms"
    interactsWith: ["match-3", "progression"]

economy:
  currencies:
    - id: "seeds"
      name: "Seeds"
      type: "soft"
      earnMethods: ["match completion", "daily login", "achievements"]
      spendMethods: ["plant in garden", "buy decorations"]
    - id: "gems"
      name: "Garden Gems"
      type: "hard"
      earnMethods: ["IAP", "rare achievements", "season pass"]
      spendMethods: ["extra moves", "rare seeds", "instant grow", "garden expansion"]
    - id: "energy"
      name: "Sunshine"
      type: "energy"
      earnMethods: ["time regen (1 per 20 min)", "friends gift", "ad watch"]
      spendMethods: ["1 per level attempt"]
      cap: "5 (refills in ~100 min)"
  monetization:
    model: "free-to-play"
    primaryRevenue: "IAP (gems) + optional rewarded ads"
    iapTiers:
      - name: "Starter Pack"
        price: "$0.99"
        contents: "50 gems + 5 rare seeds + remove ads 3 days (first purchase only)"
      - name: "Gem Pouch"
        price: "$4.99"
        contents: "200 gems"
      - name: "Season Pass"
        price: "$9.99"
        contents: "30 days of: double seeds, exclusive garden theme, daily rare seed"

screens:
  - id: "main-menu"
    name: "Garden Home"
    purpose: "Hub screen — see garden + navigate to puzzle"
    elements:
      - { type: "canvas", id: "garden-view", label: "Garden View", behavior: "Shows player's garden, interactive" }
      - { type: "button", id: "play-btn", label: "Play Level", behavior: "Opens level selection or next level" }
      - { type: "display", id: "currency-bar", label: "Seeds / Gems / Energy", behavior: "Shows currency amounts" }
      - { type: "button", id: "shop-btn", label: "Shop", behavior: "Opens IAP shop" }
    transitions:
      - { target: "puzzle-board", trigger: "play-btn tap" }
      - { target: "shop", trigger: "shop-btn tap" }

  - id: "puzzle-board"
    name: "Puzzle Board"
    purpose: "Core gameplay — match-3 puzzle"
    elements:
      - { type: "canvas", id: "board", label: "Match-3 Board", behavior: "8x8 grid, swipe to match, gravity fill" }
      - { type: "display", id: "moves-left", label: "Moves Remaining", behavior: "Countdown of moves" }
      - { type: "display", id: "level-goal", label: "Level Goal", behavior: "Shows target (e.g., collect 20 roses)" }
      - { type: "display", id: "score", label: "Score + Combo", behavior: "Current score and combo multiplier" }
      - { type: "panel", id: "power-ups", label: "Power-ups", behavior: "Available power-ups (earned or bought)" }
    transitions:
      - { target: "level-complete", trigger: "goal reached" }
      - { target: "main-menu", trigger: "pause → quit" }

  - id: "level-complete"
    name: "Level Complete"
    purpose: "Reward screen — show earnings, transition to garden"
    elements:
      - { type: "display", id: "stars", label: "Star Rating", behavior: "1-3 stars based on score" }
      - { type: "display", id: "rewards", label: "Seeds Earned", behavior: "Seeds + bonus items" }
      - { type: "button", id: "to-garden", label: "Plant Seeds!", behavior: "Go to garden with earned seeds" }
      - { type: "button", id: "next-level", label: "Next Level", behavior: "Skip garden, play next" }
    transitions:
      - { target: "main-menu", trigger: "to-garden tap" }
      - { target: "puzzle-board", trigger: "next-level tap" }

visualDirection:
  style: "Soft watercolor illustration, slightly stylized"
  colorPalette: ["#F9A8D4", "#86EFAC", "#93C5FD", "#FDE68A", "#C4B5FD"]
  mood: "Calm, cheerful, meditative — like a Sunday morning garden"
  references: ["Gardenscapes (UI clarity)", "Monument Valley (calm aesthetic)", "Unpacking (satisfying interaction)"]

prototypeScope:
  includedMechanics: ["match-3", "garden-planting"]
  excludedMechanics: ["power-ups", "social", "seasonal-events", "IAP"]
  placeholderAssets: true
  targetFidelity: "low"

history:
  - version: 1
    date: "2026-03-30T10:00:00Z"
    changes: ["Initial concept generated from brainstorm"]
    feedbackSource: "initial"
  - version: 2
    date: "2026-03-30T12:00:00Z"
    changes:
      - "Added cascade multiplier to match-3 (was missing chain reward)"
      - "Changed energy cap from 3 to 5 (too restrictive for casual)"
    feedbackSource: "user-feedback"
  - version: 3
    date: "2026-03-30T14:30:00Z"
    changes:
      - "Added garden beauty score as meta-progression metric"
      - "Added level-complete screen with plant seeds CTA"
    feedbackSource: "user-feedback"
```

### 2.4 Spec Utilities

```typescript
// src/agents/spec-io.ts
import { readFile, writeFile } from "node:fs/promises";
import jsYaml from "js-yaml";
import { GameSpecSchema, type GameSpec } from "./spec-schema";

export async function readSpec(path: string): Promise<GameSpec> {
  const raw = await readFile(path, "utf-8");
  const parsed = jsYaml.load(raw);
  return GameSpecSchema.parse(parsed);
}

export async function writeSpec(path: string, spec: GameSpec): Promise<void> {
  const yaml = jsYaml.dump(spec, { lineWidth: 100, noRefs: true, sortKeys: false });
  await writeFile(path, yaml, "utf-8");
}

export function diffSpecs(prev: GameSpec, next: GameSpec): SpecDiff {
  // Returns structured diff of changes between versions
  // Used for: changelog, feedback tracking, prototype update scope
}

export function bumpVersion(spec: GameSpec, changes: string[], source: string): GameSpec {
  return {
    ...spec,
    meta: { ...spec.meta, version: spec.meta.version + 1, updatedAt: new Date().toISOString() },
    history: [...spec.history, {
      version: spec.meta.version + 1,
      date: new Date().toISOString(),
      changes,
      feedbackSource: source as GameSpec["history"][number]["feedbackSource"],
    }],
  };
}
```

---

## 3. Agent 1: Concept Agent

### 3.1 Responsibility

Nhận user input (idea thô) + knowledge base → brainstorm → output spec file hoàn chỉnh.

```
Input:
  - User prompt: "casual puzzle game, gardening theme, mobile, target women 25-45"
  - Knowledge base: 5 PDFs (Schell, MDA, Hooked, Theory of Fun, Players Making Decisions)
  - Optional: comparable games, market data

Output:
  - spec_v1.yaml (complete, valid GameSpec)
```

### 3.2 Architecture

```
User Input
    │
    ▼
┌───────────────────────────────────────────────────┐
│  CONCEPT AGENT                                    │
│                                                   │
│  ┌─────────────────────────────────────────────┐  │
│  │ Phase 1: RESEARCH CONTEXT                   │  │
│  │ Knowledge queries (parallel):               │  │
│  │  • "match-3 puzzle game design patterns"    │  │
│  │  • "gardening game mechanics"               │  │
│  │  • "casual mobile game core loop design"    │  │
│  │  • "MDA aesthetics for puzzle games"        │  │
│  │  • "player motivation casual audience"      │  │
│  │ → synthesisContext (markdown)               │  │
│  └────────────────────┬────────────────────────┘  │
│                       ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │ Phase 2: CONCEPT GENERATION                 │  │
│  │ LLM call #1: Generate 3 concept variants    │  │
│  │ Each variant: pitch + pillars + unique hook  │  │
│  │ Grounded in knowledge context               │  │
│  └────────────────────┬────────────────────────┘  │
│                       ▼                           │
│                [User picks variant]               │
│                       │                           │
│                       ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │ Phase 3: SPEC EXPANSION                     │  │
│  │ LLM call #2: Expand chosen concept →        │  │
│  │   full spec (core loop, mechanics,          │  │
│  │   economy, screens, visual direction)       │  │
│  │ Additional knowledge queries:               │  │
│  │  • "economy design casual puzzle"           │  │
│  │  • "session design mobile 3-5 minutes"      │  │
│  │  • "progression curve casual games"         │  │
│  └────────────────────┬────────────────────────┘  │
│                       ▼                           │
│  ┌─────────────────────────────────────────────┐  │
│  │ Phase 4: VALIDATION                         │  │
│  │ Zod parse → check internal consistency:     │  │
│  │  • mechanics.interactsWith refs exist?      │  │
│  │  • economy currencies used in mechanics?    │  │
│  │  • screens cover all core loop phases?      │  │
│  │  • prototypeScope refs valid mechanic IDs?  │  │
│  └────────────────────┬────────────────────────┘  │
│                       ▼                           │
│              spec_v1.yaml (valid)                 │
└───────────────────────────────────────────────────┘
```

### 3.3 Implementation

```typescript
// src/agents/concept/concept-agent.ts

interface ConceptAgentInput {
  userPrompt: string;                    // raw idea from user
  preferences?: {
    genre?: string;
    platform?: string;
    audience?: string;
    comparables?: string[];              // reference games
  };
}

interface ConceptVariant {
  title: string;
  elevatorPitch: string;
  designPillars: string[];
  uniqueHook: string;
  whyItWorks: string;                    // grounded in knowledge
  risks: string[];
}

interface ConceptAgentOutput {
  variants: ConceptVariant[];            // 3 options for user to pick
  knowledgeCitations: Citation[];        // what knowledge was used
}

const CONCEPT_SYSTEM_PROMPT = `You are a senior game designer who creates novel game concepts.

You MUST ground your designs in established game design theory:
- Use MDA Framework: define target Aesthetics first, then Dynamics, then Mechanics
- Apply Schell's Lenses: Essential Experience, Surprise, Flow, Problem Solving
- Use Hook Model for retention: Trigger → Action → Variable Reward → Investment
- Consider Theory of Fun: games are fun when they present learnable patterns

RULES:
- Every design decision must have a WHY grounded in theory or market evidence
- Cite specific concepts from the knowledge base when making claims
- Generate 3 DISTINCT variants, not minor variations
- Each variant must have a clear UNIQUE HOOK that differentiates it
- Design for the specified platform constraints (session length, input method)

Output format: JSON matching the provided schema.`;

async function generateConcepts(
  input: ConceptAgentInput,
  knowledge: KnowledgeTool,
  llm: LLMProvider,
): Promise<ConceptAgentOutput> {

  // Phase 1: Parallel knowledge retrieval
  const queries = buildConceptQueries(input);
  const knowledgeResults = await Promise.all(
    queries.map(q => knowledge.deepSearch(q, { llm, topK: 5 }))
  );
  const synthesisContext = mergeKnowledgeContexts(knowledgeResults);

  // Phase 2: Generate 3 variants
  const variantsRaw = await llm.chat([
    { role: "system", content: CONCEPT_SYSTEM_PROMPT },
    { role: "user", content: buildConceptPrompt(input, synthesisContext) },
  ]);

  const variants = ConceptVariantsSchema.parse(JSON.parse(variantsRaw));
  const citations = extractCitations(knowledgeResults);

  return { variants, knowledgeCitations: citations };
}

async function expandToSpec(
  chosenVariant: ConceptVariant,
  input: ConceptAgentInput,
  knowledge: KnowledgeTool,
  llm: LLMProvider,
): Promise<GameSpec> {

  // Phase 3: Deep knowledge queries for specific areas
  const detailQueries = [
    `core loop design for ${chosenVariant.title}`,
    `economy design ${input.preferences?.genre} games`,
    `session design ${input.preferences?.platform} ${input.preferences?.audience}`,
    `progression curve ${input.preferences?.genre}`,
    `UI patterns ${input.preferences?.platform} games`,
  ];
  const detailResults = await Promise.all(
    detailQueries.map(q => knowledge.deepSearch(q, { llm, topK: 5 }))
  );
  const detailContext = mergeKnowledgeContexts(detailResults);

  // Phase 3: Expand to full spec
  const specRaw = await llm.chat([
    { role: "system", content: SPEC_EXPANSION_PROMPT },
    { role: "user", content: buildExpansionPrompt(chosenVariant, input, detailContext) },
  ]);

  const spec = GameSpecSchema.parse(JSON.parse(specRaw));

  // Phase 4: Validate internal consistency
  const issues = validateSpecConsistency(spec);
  if (issues.length > 0) {
    // Self-heal: ask LLM to fix consistency issues
    return await selfHealSpec(spec, issues, llm);
  }

  return spec;
}
```

### 3.4 Knowledge Query Strategy

| Phase | Query Pattern | Target Knowledge |
|---|---|---|
| Research | `"{genre} game design patterns"` | Schell: mechanics lenses, MDA: genre aesthetics |
| Research | `"{theme} game mechanics"` | Specific mechanic examples from all books |
| Research | `"core loop design {platform}"` | Theory of Fun: loop patterns, Schell: flow |
| Research | `"MDA aesthetics {genre}"` | MDA paper: 8 aesthetics mapping |
| Research | `"player motivation {audience}"` | Hooked: trigger types, Players Making Decisions: motivation |
| Expansion | `"economy design {genre}"` | Schell: economy lenses, existing economy patterns |
| Expansion | `"session design {platform}"` | Theory of Fun: session pacing |
| Expansion | `"progression curve {genre}"` | Schell: challenge lens, flow lens |
| Expansion | `"UI UX patterns {platform}"` | General game UI patterns |

### 3.5 Validation Rules

```typescript
function validateSpecConsistency(spec: GameSpec): ConsistencyIssue[] {
  const issues: ConsistencyIssue[] = [];
  const mechanicIds = new Set(spec.mechanics.map(m => m.id));
  const screenIds = new Set(spec.screens.map(s => s.id));
  const currencyIds = new Set(spec.economy?.currencies.map(c => c.id) ?? []);

  // 1. mechanics.interactsWith must reference existing mechanic IDs
  for (const m of spec.mechanics) {
    for (const ref of m.interactsWith) {
      if (!mechanicIds.has(ref)) {
        issues.push({ type: "broken-ref", message: `Mechanic "${m.id}" interacts with unknown "${ref}"` });
      }
    }
  }

  // 2. prototypeScope.includedMechanics must reference existing mechanic IDs
  for (const id of spec.prototypeScope.includedMechanics) {
    if (!mechanicIds.has(id)) {
      issues.push({ type: "broken-ref", message: `Prototype includes unknown mechanic "${id}"` });
    }
  }

  // 3. screen transitions must reference existing screen IDs
  for (const screen of spec.screens) {
    for (const t of screen.transitions) {
      if (!screenIds.has(t.target)) {
        issues.push({ type: "broken-ref", message: `Screen "${screen.id}" transitions to unknown "${t.target}"` });
      }
    }
  }

  // 4. Core loop actions should map to at least one mechanic
  for (const action of spec.coreLoop.actions) {
    const hasMechanic = spec.mechanics.some(m =>
      m.name.toLowerCase().includes(action.mechanic.toLowerCase()) ||
      action.mechanic.toLowerCase().includes(m.id)
    );
    if (!hasMechanic) {
      issues.push({ type: "unmapped", message: `Core loop action "${action.id}" mechanic "${action.mechanic}" has no matching mechanic spec` });
    }
  }

  // 5. If economy exists, at least one mechanic should reference earning/spending
  // ... more rules

  return issues;
}
```

---

## 4. Agent 2: Code Agent (Prototype Generator)

### 4.1 Responsibility

Nhận spec file → generate playable web prototype. Prototype dùng để validate core loop, KHÔNG phải production code.

```
Input:
  - spec.yaml (valid GameSpec)
  - Previous prototype code (for iterations)

Output:
  - Runnable web project: index.html + game.js + style.css
  - Playable in browser at localhost
```

### 4.2 Design Decisions

| Decision | Choice | Rationale |
|---|---|---|
| Rendering | **HTML5 Canvas** | LLMs generate Canvas code well; no framework dependency |
| Framework | **None (vanilla JS)** | Maximum LLM reliability; prototype = throwaway code |
| Structure | **Single HTML file** | Simple to serve, preview, share. No build step. |
| Fidelity | **Geometric shapes + colors** | Speed > polish. Rectangles, circles, text = sufficient for validation |
| Iteration | **Full regeneration** | Prototype is small (<2000 LOC). Patching is error-prone. Regenerate from spec each time. |
| Serving | **Bun.serve() static** | Zero config, instant preview |

### 4.3 Architecture

```
spec.yaml
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  CODE AGENT                                          │
│                                                      │
│  ┌────────────────────────────────────────────────┐  │
│  │ Step 1: ANALYZE SPEC                           │  │
│  │ Parse spec → identify:                         │  │
│  │  • Which mechanics to implement                │  │
│  │  • Screen flow graph                           │  │
│  │  • Input methods (swipe, tap, etc.)            │  │
│  │  • Visual requirements (colors, style)         │  │
│  └───────────────────────┬────────────────────────┘  │
│                          ▼                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Step 2: SELECT TEMPLATE                        │  │
│  │ Match genre → template:                        │  │
│  │  • puzzle/match-3 → grid-based template        │  │
│  │  • platformer → side-scroll template           │  │
│  │  • idle/clicker → resource-display template    │  │
│  │  • card game → hand/board template             │  │
│  │  • narrative → text/choice template            │  │
│  │  • custom → blank canvas template              │  │
│  └───────────────────────┬────────────────────────┘  │
│                          ▼                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Step 3: GENERATE CODE                          │  │
│  │ LLM prompt:                                    │  │
│  │  • System: "You are a game prototype coder..." │  │
│  │  • Context: template code + spec sections      │  │
│  │  • Constraints: Canvas API, vanilla JS,        │  │
│  │    single file, geometric shapes               │  │
│  │ Output: Complete HTML file                     │  │
│  └───────────────────────┬────────────────────────┘  │
│                          ▼                           │
│  ┌────────────────────────────────────────────────┐  │
│  │ Step 4: VALIDATE                               │  │
│  │  • Syntax check (parse as HTML/JS)             │  │
│  │  • Required elements present?                  │  │
│  │  • Self-test: headless browser smoke test?     │  │
│  │  • If fail → retry with error context          │  │
│  └───────────────────────┬────────────────────────┘  │
│                          ▼                           │
│              prototype/index.html                    │
│              (serve at localhost:3000)                │
└──────────────────────────────────────────────────────┘
```

### 4.4 Template System

Templates là code scaffolds cho từng game genre. LLM KHÔNG generate from scratch — LLM CUSTOMIZE template dựa trên spec.

Tại sao template thay vì from-scratch:
- LLM reliability tăng 3-5x khi modify existing code vs write new
- Prototype chất lượng consistent hơn
- Reduce hallucinated APIs

```
src/agents/code/templates/
├── base.html              # Common: Canvas setup, game loop, input handling, screen manager
├── grid-puzzle.js         # Match-3, Tetris, Minesweeper pattern
├── side-scroll.js         # Platformer, runner pattern
├── resource-manager.js    # Idle, tycoon, clicker pattern
├── card-hand.js           # Card game, deck builder pattern
├── text-choice.js         # Narrative, visual novel pattern
└── blank-canvas.js        # Fallback: empty game loop
```

**Base template structure (~200 LOC):**

```javascript
// base.html template (embedded JS)
// Provides: Canvas, game loop, screen manager, input, simple audio, state

const GAME = {
  canvas: null, ctx: null, width: 0, height: 0,
  currentScreen: "main-menu",
  screens: {},
  state: {},         // game state (populated from spec)
  input: { x: 0, y: 0, pressed: false, swipe: null },
  dt: 0, time: 0,
};

function init() { /* canvas setup, register screens, load state from spec */ }
function update(dt) { GAME.screens[GAME.currentScreen]?.update(dt); }
function render(ctx) { GAME.screens[GAME.currentScreen]?.render(ctx); }
function changeScreen(id) { GAME.currentScreen = id; }

// Input handling (mouse/touch unified)
// Game loop (requestAnimationFrame)
// Screen registration API

// === GENERATED CODE BELOW (by Code Agent) ===
// LLM fills in: screen implementations, game logic, mechanics
```

### 4.5 Code Generation Prompt Strategy

```typescript
const CODE_SYSTEM_PROMPT = `You are a game prototype developer. You create playable HTML5 Canvas prototypes.

STRICT RULES:
- Output a SINGLE complete HTML file with embedded CSS and JS
- Use HTML5 Canvas API ONLY for rendering (no DOM game elements)
- Vanilla JavaScript only — NO frameworks, NO imports, NO npm
- Geometric shapes for all visuals: rectangles, circles, text, lines
- Use the provided color palette from the spec
- Implement ONLY mechanics listed in prototypeScope.includedMechanics
- Every screen in the spec must exist (at minimum: show screen name + nav buttons)
- Game must be playable immediately on load — no loading screens
- Handle both mouse (desktop) and touch (mobile) input
- Code must be under 2000 lines total
- Include basic sound effects using Web Audio API oscillator (optional beeps)

TEMPLATE:
You will receive a base template. DO NOT rewrite it. Extend it by implementing:
1. Each screen's update() and render() functions
2. Game state initialization from the spec
3. Mechanic logic as described in spec.mechanics[].rules
4. Screen transitions as described in spec.screens[].transitions

QUALITY CHECKS (self-verify before outputting):
- Can the player complete one full core loop cycle?
- Does every button/action have visible feedback?
- Is there a win/lose/progress condition?
- Are colors from the spec's visual direction applied?`;

function buildCodePrompt(spec: GameSpec, template: string): string {
  // Only include spec sections relevant to prototype
  const protoSpec = {
    meta: { title: spec.meta.title, genre: spec.meta.genre },
    coreLoop: spec.coreLoop,
    mechanics: spec.mechanics.filter(m =>
      spec.prototypeScope.includedMechanics.includes(m.id)
    ),
    screens: spec.screens,
    visualDirection: spec.visualDirection,
    prototypeScope: spec.prototypeScope,
  };

  return `
## BASE TEMPLATE (extend this, do not rewrite):
\`\`\`html
${template}
\`\`\`

## GAME SPEC (implement this):
\`\`\`yaml
${jsYaml.dump(protoSpec)}
\`\`\`

Generate the COMPLETE HTML file. Include the base template code + your implementations.
  `;
}
```

### 4.6 Prototype Validation

```typescript
async function validatePrototype(html: string, spec: GameSpec): Promise<ValidationResult> {
  const issues: string[] = [];

  // 1. Syntax check: parse HTML
  if (!html.includes("<canvas")) {
    issues.push("Missing <canvas> element");
  }
  if (!html.includes("requestAnimationFrame")) {
    issues.push("Missing game loop (requestAnimationFrame)");
  }

  // 2. Screen check: all spec screens referenced
  for (const screen of spec.screens) {
    if (!html.includes(screen.id)) {
      issues.push(`Screen "${screen.id}" not found in generated code`);
    }
  }

  // 3. Mechanic check: included mechanics referenced
  for (const mechId of spec.prototypeScope.includedMechanics) {
    const mech = spec.mechanics.find(m => m.id === mechId);
    if (mech && !html.toLowerCase().includes(mechId.replace(/-/g, ""))) {
      issues.push(`Mechanic "${mechId}" not found in generated code`);
    }
  }

  // 4. (Optional) Headless browser smoke test
  // Launch Puppeteer/Playwright → load HTML → check no JS errors → screenshot
  // This is expensive but catches runtime errors

  return { valid: issues.length === 0, issues };
}
```

### 4.7 Serving the Prototype

```typescript
// src/agents/code/serve.ts
function servePrototype(projectDir: string, port = 3000) {
  return Bun.serve({
    port,
    fetch(req) {
      const url = new URL(req.url);
      const filePath = `${projectDir}/prototype${url.pathname === "/" ? "/index.html" : url.pathname}`;
      const file = Bun.file(filePath);
      return new Response(file);
    },
  });
}
```

---

## 5. Feedback Loop

### 5.1 Flow

```
                    ┌─────────────────────────┐
                    │    User plays prototype  │
                    │    at localhost:3000      │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  User writes feedback     │
                    │  (free text + structured) │
                    │                           │
                    │  Free text:               │
                    │  "Matching feels good but │
                    │   progression too slow.   │
                    │   Want power-ups."         │
                    │                           │
                    │  Structured (optional):   │
                    │  ☑ Core loop fun?    YES  │
                    │  ☑ Too easy/hard?   EASY  │
                    │  ☑ Session length?  OK    │
                    │  ☑ Want more depth? YES   │
                    └────────────┬─────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  FEEDBACK INTERPRETER     │
                    │  (LLM-powered)            │
                    │                           │
                    │  Analyzes feedback →      │
                    │  Proposes spec changes:   │
                    │                           │
                    │  1. Add mechanic:         │
                    │     "power-ups" to        │
                    │     mechanics[] and       │
                    │     prototypeScope        │
                    │                           │
                    │  2. Adjust difficulty:    │
                    │     difficultyApproach    │
                    │     ramp speed            │
                    │                           │
                    │  3. Add progression:      │
                    │     shortTerm reward      │
                    │     visibility            │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  DIFF PREVIEW             │
                    │  Show user what changes   │
                    │  in spec (YAML diff)      │
                    │                           │
                    │  User: approve / edit /   │
                    │        reject changes     │
                    └────────────┬──────────────┘
                                 │ approved
                    ┌────────────▼─────────────┐
                    │  UPDATE SPEC              │
                    │  Apply diff → spec_v(N+1) │
                    │  Add to history[]         │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  CODE AGENT               │
                    │  Regenerate prototype     │
                    │  from updated spec        │
                    └────────────┬──────────────┘
                                 │
                    ┌────────────▼─────────────┐
                    │  User plays again...      │
                    │  (repeat until approve)   │
                    └──────────────────────────┘
```

### 5.2 Feedback Interpreter

```typescript
// src/agents/feedback/feedback-agent.ts

interface FeedbackInput {
  freeText: string;
  structured?: {
    coreLoopFun: "yes" | "somewhat" | "no";
    difficulty: "too-easy" | "ok" | "too-hard";
    sessionLength: "too-short" | "ok" | "too-long";
    wantMoreDepth: boolean;
    specificIssues?: string[];
  };
  currentSpec: GameSpec;
}

interface SpecChange {
  path: string;           // e.g., "mechanics", "coreLoop.difficultyApproach"
  action: "add" | "modify" | "remove";
  description: string;    // human-readable change description
  before?: unknown;       // current value (for modify/remove)
  after: unknown;         // new value (for add/modify)
}

interface FeedbackInterpretation {
  summary: string;              // one-line interpretation
  proposedChanges: SpecChange[];
  reasoning: string;            // why these changes address the feedback
  knowledgeBasis: string[];     // which design principles support these changes
}

const FEEDBACK_SYSTEM_PROMPT = `You are a game design consultant interpreting playtester feedback.

Given:
1. The current game spec (YAML)
2. User feedback (free text + optional structured)

Your job:
1. Interpret WHAT the user is really saying (surface complaint → root cause)
2. Propose SPECIFIC changes to the spec that address the root cause
3. Ground changes in game design theory when possible
4. Be CONSERVATIVE — smallest change that addresses the feedback
5. NEVER remove mechanics without explicit user request
6. ALWAYS preserve design pillars unless user questions them

Output: JSON with proposed changes in structured diff format.
Each change must specify the exact YAML path and new value.`;
```

### 5.3 Iteration State Machine

```typescript
type IterationState =
  | { phase: "generating-concept" }
  | { phase: "user-choosing-variant"; variants: ConceptVariant[] }
  | { phase: "expanding-spec" }
  | { phase: "generating-prototype" }
  | { phase: "user-playing"; prototypeUrl: string }
  | { phase: "processing-feedback"; feedback: string }
  | { phase: "user-reviewing-changes"; changes: SpecChange[] }
  | { phase: "approved"; finalSpec: GameSpec }
  | { phase: "generating-documents" }
  | { phase: "complete"; documents: GeneratedDocument[] };
```

### 5.4 Feedback Loop Limits

| Guard | Value | Rationale |
|---|---|---|
| Max iterations | 10 | Prevent infinite loops |
| Max spec changes per feedback | 5 | Keep changes manageable |
| Max mechanic additions | 3 per iteration | Scope control |
| Cooldown between iterations | None (user-driven) | Don't slow down creativity |

---

## 6. Agent 3: Detail Document Agent

### 6.1 Responsibility

Nhận final approved spec → generate detailed documents cho từng department/aspect.

```
Input:
  - spec_final.yaml (approved GameSpec)
  - Knowledge base (for framework references)
  - Prototype feedback history (for context)

Output:
  - gameplay-design.md      — chi tiết mọi mechanic, rules, balance
  - ui-ux-spec.md           — wireframes (text-based), flows, interaction spec
  - economy-design.md       — full economy model, simulation projections
  - art-direction.md        — visual style guide, asset list, references
  - content-plan.md         — levels, items, characters, scope matrix
  - technical-requirements.md — tech stack, architecture, API surface
  - sound-design.md         — audio direction, SFX list, music mood
```

### 6.2 Architecture

```
spec_final.yaml
    │
    ▼
┌──────────────────────────────────────────────────────┐
│  DETAIL DOCUMENT AGENT                               │
│                                                      │
│  For each document type (parallel):                  │
│  ┌────────────────────────────────────────────────┐  │
│  │ 1. Extract relevant spec sections              │  │
│  │ 2. Query knowledge base for best practices     │  │
│  │ 3. LLM: expand spec → detailed document        │  │
│  │ 4. Validate: cross-reference other documents   │  │
│  └────────────────────────────────────────────────┘  │
│                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ gameplay-design.md   │  │ economy-design.md    │  │
│  │ Spec sections used:  │  │ Spec sections used:  │  │
│  │  - coreLoop          │  │  - economy           │  │
│  │  - mechanics[]       │  │  - mechanics (econ)  │  │
│  │  - prototypeScope    │  │  - coreLoop.rewards  │  │
│  │ Knowledge queries:   │  │ Knowledge queries:   │  │
│  │  - "game balance"    │  │  - "F2P economy"     │  │
│  │  - "difficulty curve" │  │  - "source sink"     │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                      │
│  ┌──────────────────────┐  ┌──────────────────────┐  │
│  │ ui-ux-spec.md        │  │ art-direction.md     │  │
│  │ Spec sections used:  │  │ Spec sections used:  │  │
│  │  - screens[]         │  │  - visualDirection   │  │
│  │  - mechanics.controls│  │  - mechanics (visual) │  │
│  │  - sessionFlow       │  │  - screens (layout)  │  │
│  └──────────────────────┘  └──────────────────────┘  │
│                                                      │
│  ... (content-plan, technical-requirements, sound)   │
└──────────────────────────────────────────────────────┘
```

### 6.3 Document Specs

#### gameplay-design.md

```typescript
const GAMEPLAY_DOC_PROMPT = `You are a game designer writing a detailed gameplay design document.

FROM THE SPEC, expand each mechanic into:
1. **Overview**: What this mechanic IS and WHY it exists (link to design pillars)
2. **Detailed Rules**: Every rule with edge cases. Format as numbered list.
3. **State Diagram**: Text-based state diagram for mechanic lifecycle
4. **Balance Parameters**: Every tunable number as a table (name, value, range, rationale)
5. **Interaction Matrix**: How this mechanic interacts with every other mechanic
6. **Player Experience Flow**: What the player FEELS at each step
7. **Known Risks**: What could go wrong, mitigation

For the Core Loop section:
- Minute-by-minute session walkthrough
- Difficulty curve with specific numbers
- Progression milestones table (level → unlock → reward)

Use MDA Framework language: describe intended Aesthetics → required Dynamics → implemented Mechanics.

Cite knowledge base when referencing design principles.`;

interface GameplayDocSections {
  overview: string;
  coreLoopDetailed: {
    minuteByMinute: string;
    difficultyCurve: BalanceTable;
    progressionMilestones: MilestoneTable;
  };
  mechanics: Array<{
    mechanicId: string;
    overview: string;
    detailedRules: string[];
    stateDiagram: string;
    balanceParameters: BalanceTable;
    interactionMatrix: string;
    playerExperience: string;
    risks: string[];
  }>;
  mdaMapping: {
    aesthetics: string[];
    dynamics: string[];
    mechanics: string[];
  };
}
```

#### ui-ux-spec.md

```typescript
const UI_UX_DOC_PROMPT = `You are a UI/UX designer writing a detailed interface specification.

For each screen:
1. **ASCII Wireframe**: Text-based layout showing element positions (use box-drawing characters)
2. **Element Specifications**: Each UI element with exact behavior, states, animations
3. **User Flow**: Step-by-step interaction walkthrough
4. **Transition Specs**: How screens connect, animation type, duration
5. **Responsive Notes**: How layout adapts to different screen sizes
6. **Accessibility**: Color contrast, touch target sizes, text sizing
7. **Error States**: What happens on failure, empty states, loading states

Master Flow Diagram:
- Show ALL screens connected by transitions
- Mark primary flow vs secondary flows
- Mark points of no return

Use box-drawing for wireframes:
┌─────────────────────────┐
│     GAME TITLE          │
│                         │
│  ┌─────────────────┐    │
│  │   Garden View    │    │
│  │   (canvas)       │    │
│  └─────────────────┘    │
│                         │
│  [ Play Level ]         │
│  Seeds: 150  Gems: 10   │
└─────────────────────────┘`;
```

#### economy-design.md

```typescript
const ECONOMY_DOC_PROMPT = `You are a game economy designer writing a detailed economy document.

Expand the economy spec into:
1. **Currency Flow Diagram**: ASCII diagram showing all sources and sinks per currency
2. **Earn Rate Tables**: Per-activity earn rates with formulas
3. **Spend Rate Tables**: Per-item costs with progression scaling
4. **Inflation Analysis**: Project currency accumulation over 30/60/90 days for 4 player archetypes
5. **Monetization Deep-Dive**: Each IAP with conversion funnel, price psychology, value perception
6. **F2P vs Paying Gap Analysis**: What F2P can achieve vs each spending tier
7. **Event Economy**: How limited-time events inject/drain currency
8. **Balance Levers**: What to tune when economy is too loose/tight

Player archetypes to model:
- Whale (top 1%): spending $50+/month
- Dolphin (top 10%): spending $10-50/month
- Minnow (top 50%): spending $1-10/month
- F2P (bottom 50%): $0

For each archetype, model Day 1, 7, 14, 30 experience.`;
```

### 6.4 Cross-Document Validation

Sau khi generate tất cả documents, chạy cross-validation:

```typescript
async function crossValidateDocuments(
  documents: Map<string, string>,
  spec: GameSpec,
  llm: LLMProvider,
): Promise<CrossValidationReport> {

  const CROSS_VALIDATE_PROMPT = `You are a QA reviewer for game design documents.

Given these documents generated from the same spec, find INCONSISTENCIES:

1. Does gameplay.md describe mechanics that economy.md doesn't account for?
2. Does ui-ux.md reference screens not in gameplay.md flows?
3. Does economy.md assume progression rates that contradict gameplay.md difficulty curve?
4. Does content-plan.md scope match what gameplay.md describes?
5. Does art-direction.md style conflict with any ui-ux.md wireframe assumptions?

For each inconsistency:
- Severity: high (blocks development), medium (causes confusion), low (nitpick)
- Which documents conflict
- Specific sections/values that conflict
- Suggested resolution`;

  const raw = await llm.chat([
    { role: "system", content: CROSS_VALIDATE_PROMPT },
    { role: "user", content: formatDocumentsForReview(documents) },
  ]);

  return CrossValidationSchema.parse(JSON.parse(raw));
}
```

---

## 7. Implementation Structure

```
src/
├── knowledge.ts                    # (existing) KnowledgeTool
├── agents/
│   ├── spec-schema.ts              # Zod schema for GameSpec
│   ├── spec-io.ts                  # Read/write/diff/bump YAML spec files
│   │
│   ├── concept/
│   │   ├── concept-agent.ts        # Phase 1-4: brainstorm → spec
│   │   ├── prompts.ts              # System prompts + prompt builders
│   │   └── validation.ts           # Spec consistency checker
│   │
│   ├── code/
│   │   ├── code-agent.ts           # Spec → prototype HTML
│   │   ├── template-selector.ts    # Genre → template mapping
│   │   ├── templates/
│   │   │   ├── base.html           # Common game loop, canvas, input
│   │   │   ├── grid-puzzle.js      # Match-3, sudoku, etc.
│   │   │   ├── side-scroll.js      # Platformer, runner
│   │   │   ├── resource-manager.js # Idle, tycoon
│   │   │   ├── card-hand.js        # Card games
│   │   │   └── text-choice.js      # Narrative
│   │   ├── validator.ts            # HTML/JS validation
│   │   └── serve.ts                # Bun.serve static prototype
│   │
│   ├── feedback/
│   │   ├── feedback-agent.ts       # Interpret feedback → spec changes
│   │   └── prompts.ts              # Feedback interpretation prompts
│   │
│   └── document/
│       ├── document-agent.ts       # Spec → detail documents
│       ├── generators/
│       │   ├── gameplay.ts         # Gameplay design doc generator
│       │   ├── ui-ux.ts            # UI/UX spec generator
│       │   ├── economy.ts          # Economy design doc generator
│       │   ├── art-direction.ts    # Art direction doc generator
│       │   ├── content-plan.ts     # Content plan generator
│       │   ├── tech-requirements.ts # Tech requirements generator
│       │   └── sound-design.ts     # Sound design doc generator
│       ├── cross-validator.ts      # Cross-document consistency check
│       └── prompts.ts              # Document generation prompts
│
├── pipeline/
│   ├── pipeline.ts                 # Orchestrator: concept → code → feedback → docs
│   ├── state.ts                    # IterationState machine
│   └── project.ts                  # Project storage (spec versions, prototypes, docs)
│
└── cli.ts                          # (existing) + new agent commands
```

### CLI Commands

```bash
# Start new project
bun run cli new "casual puzzle gardening mobile"

# → Generates 3 concept variants, prompts user to pick
# → Expands to spec_v1.yaml
# → Generates prototype
# → Opens localhost:3000

# Give feedback (after playing)
bun run cli feedback "progression too slow, want power-ups"

# → Interprets feedback
# → Shows proposed spec changes
# → User approves → spec_v2.yaml
# → Regenerates prototype

# Approve current spec
bun run cli approve

# → Triggers detail document generation
# → Outputs 7 markdown files

# Manual spec edit
bun run cli edit-spec

# → Opens spec.yaml in $EDITOR
# → On save: validates + regenerates prototype

# Serve prototype
bun run cli serve

# Show project status
bun run cli status

# Export all documents
bun run cli export --format markdown --output ./output/
```

---

## 8. Estimation

### Team: 1 fullstack dev (Bun/TS)

```
Phase 1 ────── Phase 2 ────── Phase 3 ────── Phase 4 ────── Phase 5
 1.5 weeks      2.5 weeks      2 weeks        2 weeks        1 week
Foundation    Concept Agent   Code Agent     Detail Docs     Polish
+ Spec        + Feedback      + Templates    + Cross-val
                Loop
```

**Total: ~9 weeks (1 dev) · ~5 weeks (2 devs)**

---

### Phase 1: Foundation + Spec (Week 1–1.5)

| Task | Days | Deliverable |
|---|---|---|
| `GameSpecSchema` Zod schema | 1 | `spec-schema.ts` |
| Spec I/O (read/write/diff/bump YAML) | 0.5 | `spec-io.ts` |
| Spec consistency validator | 1 | `validation.ts` |
| Project structure (dir layout, state persistence) | 0.5 | `project.ts` |
| Knowledge layer: persistence (save/load) | 1.5 | `KnowledgeTool.save/load` |
| CLI scaffolding (new, status, edit-spec) | 1 | Updated `cli.ts` |

**Milestone:** `bun run cli new` tạo project dir, `edit-spec` mở YAML, validation chạy.

---

### Phase 2: Concept Agent + Feedback Loop (Weeks 2–4)

| Task | Days | Deliverable |
|---|---|---|
| Concept Agent Phase 1-2 (research + 3 variants) | 2.5 | `concept-agent.ts` generate variants |
| Concept Agent Phase 3-4 (expand + validate spec) | 2.5 | Full spec generation |
| Prompt engineering + testing with real knowledge base | 2 | Tuned prompts |
| Feedback Interpreter Agent | 2 | `feedback-agent.ts` |
| Spec diff preview + apply flow | 1 | CLI feedback command |
| Integration: concept → spec → feedback → updated spec | 1.5 | Working loop (without prototype) |
| Iteration state machine | 1 | `state.ts` |

**Milestone:** `bun run cli new "..."` → spec_v1.yaml. `bun run cli feedback "..."` → spec_v2.yaml. Full text-based loop works.

---

### Phase 3: Code Agent + Templates (Weeks 5–6.5)

| Task | Days | Deliverable |
|---|---|---|
| Base template (canvas, game loop, input, screen manager) | 2 | `base.html` |
| Genre templates (grid-puzzle, side-scroll, resource-manager) | 3 | 3 template files |
| Code Agent (spec → HTML generation + template selection) | 2.5 | `code-agent.ts` |
| Prototype validator (syntax, screen check, mechanic check) | 1 | `validator.ts` |
| Static file server (Bun.serve) | 0.5 | `serve.ts` |
| Integration: spec → generate → serve → feedback → regen | 1.5 | Full loop with playable prototype |

**Milestone:** `bun run cli new "match-3 puzzle"` → playable prototype at localhost:3000. `bun run cli feedback "..."` → prototype updates.

---

### Phase 4: Detail Document Agent (Weeks 7–8.5)

| Task | Days | Deliverable |
|---|---|---|
| Document Agent framework (parallel generation) | 1 | `document-agent.ts` |
| Gameplay design doc generator + prompts | 1.5 | `gameplay.ts` |
| UI/UX spec generator + wireframes | 1.5 | `ui-ux.ts` |
| Economy design doc generator | 1 | `economy.ts` |
| Art direction + content plan + tech requirements | 1.5 | 3 generators |
| Sound design doc generator | 0.5 | `sound-design.ts` |
| Cross-document validator | 1 | `cross-validator.ts` |
| Prompt tuning with real specs | 1.5 | Tuned prompts |

**Milestone:** `bun run cli approve` → 7 detailed markdown documents + cross-validation report.

---

### Phase 5: Polish + Testing (Week 9)

| Task | Days | Deliverable |
|---|---|---|
| End-to-end testing (full pipeline: new → feedback × 3 → approve → docs) | 2 | E2E test suite |
| Error handling, retry logic, edge cases | 1.5 | Robust error handling |
| CLI UX polish (progress bars, colored output) | 1 | Better CLI experience |
| Documentation (how to use, spec format guide) | 0.5 | README update |

**Milestone:** Production-ready v1.0 CLI tool.

---

## 9. Risk Assessment

| Risk | Severity | Mitigation |
|---|---|---|
| **LLM generates broken prototype code** | High | Template-based approach (LLM extends templates, not writes from scratch). Validation step with retry. Max 3 retries with error context. |
| **Spec format too rigid/too flexible** | Medium | Start with current schema, iterate. Schema is versioned. Add `extensions: Record<string, unknown>` for flexibility. |
| **Feedback interpretation wrong** | Medium | Always show proposed changes for human approval. Never auto-apply. |
| **Knowledge base insufficient for genre** | Medium | Graceful degradation: agent works without knowledge (less grounded). Users can add own docs. |
| **Prototype too simple to validate concept** | Medium | Template system handles common genres well. For novel genres, degrade to wireframe fidelity with text descriptions. |
| **LLM context window overflow** (large spec + template + knowledge) | Medium | Keep spec compact (YAML, no redundancy). Chunk documents for Detail Agent. Use focused search (not deep) when context is tight. |
| **Infinite feedback loop** (user never satisfied) | Low | Max 10 iterations warning. Track changes-per-iteration metric. |

---

## 10. LLM Token Budget per Pipeline Run

| Phase | Calls | Est. tokens (prompt+completion) | Cost (GPT-4o-mini) |
|---|---|---|---|
| Knowledge base build (one-time) | ~100-160 | ~500K | ~$0.15 |
| Concept: research queries (5 deep searches) | 5 | ~25K | ~$0.01 |
| Concept: 3 variants generation | 1 | ~8K | ~$0.003 |
| Concept: spec expansion | 1 | ~15K | ~$0.005 |
| Code: prototype generation | 1 | ~20K | ~$0.007 |
| Feedback: interpretation | 1 per iteration | ~5K | ~$0.002 |
| Code: regeneration | 1 per iteration | ~20K | ~$0.007 |
| Documents: 7 parallel | 7 | ~70K | ~$0.025 |
| Documents: cross-validation | 1 | ~30K | ~$0.010 |
| **Total (3 feedback iterations)** | **~20** | **~250K** | **~$0.08** |

---

## 11. Open Questions

| # | Question | Impact | Recommendation |
|---|---|---|---|
| 1 | **Prototype scope**: Should prototype support multiplayer/social mechanics? | Template complexity | No for v1. Social = UI mockups only. |
| 2 | **Spec versioning**: Git-based or in-file history? | Tooling | In-file `history[]` for v1. Git-based for v2. |
| 3 | **Headless browser testing**: Use Playwright for prototype validation? | Reliability vs complexity | Optional for v1. Add in v2 if code quality is an issue. |
| 4 | **Template extensibility**: Can users create custom templates? | Flexibility | Not in v1. Internal templates only. |
| 5 | **Multi-LLM strategy**: Different models for different agents? | Cost/quality | Yes. Concept=smart model, Code=code model, Docs=balanced model. |
| 6 | **Prototype asset generation**: Generate placeholder images/sprites with DALL-E? | Visual quality | No for v1. Geometric shapes only. Consider v2. |
| 7 | **Detail doc format**: Markdown only? Or also Notion/Confluence export? | Integration | Markdown for v1. Export adapters in v2. |
