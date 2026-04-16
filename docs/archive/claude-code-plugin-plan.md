# Claude Code Plugin Architecture — Game Design Kit

## 1. Architecture Shift

### Before (standalone app)
```
Frontend (React) → API (Hono) → Pipeline Engine → Agent Framework → Knowledge Layer → LLM
          ↑ custom UI                    ↑ custom agents          ↑ bring your own
```

### After (Claude Code plugin)
```
Claude Code (UI + LLM) → Custom Commands/Agents → MCP Server → Knowledge Layer
    ↑ already exists         ↑ .md files            ↑ our code    ↑ already exists
```

**Bỏ hoàn toàn:** API layer, frontend, WebSocket, agent framework, LLMProvider abstraction.

**Claude Code cung cấp sẵn:** UI (terminal), LLM (Claude), file read/write/edit, bash execution, git, streaming output, subagent spawning, memory persistence.

**Ta chỉ cần build:**
1. MCP server (wraps knowledge-layer + spec tools + prototype tools)
2. Custom commands (`.claude/commands/` — prompt templates)
3. Custom agents (`.claude/agents/` — specialized personas)
4. Rules + CLAUDE.md (project instructions)
5. Game templates (for code generation)

---

## 2. Plugin File Structure

```
game-design-kit/
│
├── CLAUDE.md                              # Project-level instructions
├── .claude/
│   ├── settings.json                      # Permissions (allow/deny)
│   ├── .mcp.json                          # MCP server config
│   │
│   ├── commands/                          # Slash commands (user-triggered)
│   │   ├── concept.md                     # /project:concept <idea>
│   │   ├── prototype.md                   # /project:prototype
│   │   ├── feedback.md                    # /project:feedback <feedback>
│   │   ├── approve.md                     # /project:approve
│   │   ├── docs.md                        # /project:docs
│   │   └── status.md                      # /project:status
│   │
│   ├── agents/                            # Subagent personas (Claude-invoked)
│   │   ├── concept-designer.md            # Brainstorms game concepts
│   │   ├── code-prototyper.md             # Generates prototype code
│   │   ├── feedback-interpreter.md        # Interprets playtester feedback
│   │   └── document-writer.md             # Generates detail design docs
│   │
│   ├── skills/                            # Auto-invoked workflows
│   │   └── game-knowledge/
│   │       ├── SKILL.md                   # Auto-searches knowledge base
│   │       └── search-patterns.md         # Query templates per topic
│   │
│   └── rules/                             # Path-scoped instructions
│       ├── spec-format.md                 # Rules for editing .yaml specs
│       ├── prototype-rules.md             # Rules for generating HTML prototypes
│       └── knowledge-queries.md           # How to query knowledge effectively
│
├── mcp-server/                            # MCP server (our TypeScript code)
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── server.ts                      # MCP server entry (stdio transport)
│       ├── tools/
│       │   ├── knowledge.ts               # Ingest, search, graph tools
│       │   ├── spec.ts                    # Validate, diff, bump tools
│       │   └── prototype.ts               # Serve, validate tools
│       └── resources/
│           ├── templates.ts               # Game template resources
│           └── spec-schema.ts             # Spec schema as resource
│
├── templates/                             # Game prototype templates
│   ├── base.html
│   ├── grid-puzzle.js
│   ├── side-scroll.js
│   ├── resource-manager.js
│   ├── card-hand.js
│   └── text-choice.js
│
├── knowledge/                             # PDF knowledge base (existing)
│   ├── *.pdf
│   └── .knowledge-cache/                  # Persisted index + graph
│
└── projects/                              # User game projects
    └── {project-name}/
        ├── spec.yaml                      # Current spec (source of truth)
        ├── spec-history/                  # Previous versions
        │   ├── spec_v1.yaml
        │   └── spec_v2.yaml
        ├── prototype/                     # Generated playable prototype
        │   └── index.html
        └── documents/                     # Generated detail docs
            ├── gameplay-design.md
            ├── ui-ux-spec.md
            ├── economy-design.md
            ├── art-direction.md
            ├── content-plan.md
            ├── technical-requirements.md
            └── sound-design.md
```

---

## 3. MCP Server Design

### 3.1 Configuration (`.claude/.mcp.json`)

```json
[
  {
    "name": "game-design-kit",
    "type": "stdio",
    "command": "bun",
    "args": ["run", "./mcp-server/src/server.ts"],
    "env": {
      "KNOWLEDGE_DIR": "./knowledge",
      "PROJECTS_DIR": "./projects",
      "TEMPLATES_DIR": "./templates"
    }
  }
]
```

### 3.2 Tools (callable by Claude)

```typescript
// mcp-server/src/tools/knowledge.ts

tools = {
  // ── Knowledge Base ───────────────────────────────────
  knowledge_ingest: {
    description: "Ingest a document (PDF/MD/TXT/DOCX/CSV/JSON/YAML) into knowledge base",
    params: { filePath: "string", category?: "string", tags?: "string[]" },
    returns: "{ documentId, sourceType, chunkCount }",
  },

  knowledge_ingest_dir: {
    description: "Ingest all supported documents from a directory",
    params: { dirPath: "string" },
    returns: "{ documents: [{ documentId, title, type, chunks }], total }",
  },

  knowledge_search: {
    description: "Search knowledge base (BM25 lexical or focused with graph expansion)",
    params: { query: "string", mode?: "lexical|focused", topK?: "number" },
    returns: "{ results: [{ text, score, source, section }] }",
  },

  knowledge_deep_search: {
    description: "Deep search with LLM query decomposition (uses Claude via MCP sampling)",
    params: { query: "string", topK?: "number" },
    returns: "{ results, subQueries, entities, relationships, synthesisContext }",
  },

  knowledge_build_graph: {
    description: "Build knowledge graph from ingested documents (extracts entities + relations)",
    params: { batchSize?: "number" },
    returns: "{ entityCount, relationCount, entityTypes, relationTypes }",
  },

  knowledge_query_entity: {
    description: "Look up a game design entity and its relations in the knowledge graph",
    params: { name: "string" },
    returns: "{ entity, relations: [{ type, target, description }] }",
  },

  knowledge_stats: {
    description: "Get knowledge base statistics",
    params: {},
    returns: "{ documents, chunks, entities, relations, graphBuilt }",
  },

  // ── Spec Tools ───────────────────────────────────────
  spec_validate: {
    description: "Validate a game spec YAML file against schema, check internal consistency",
    params: { specPath: "string" },
    returns: "{ valid, errors: [{ path, message }], warnings: [{ path, message }] }",
  },

  spec_diff: {
    description: "Compare two spec versions and show structured diff",
    params: { specPath1: "string", specPath2: "string" },
    returns: "{ changes: [{ section, field, before, after }] }",
  },

  spec_bump_version: {
    description: "Increment spec version, add history entry, archive previous version",
    params: { specPath: "string", changes: "string[]", source: "string" },
    returns: "{ newVersion, archivedTo }",
  },

  // ── Prototype Tools ──────────────────────────────────
  prototype_serve: {
    description: "Serve prototype directory as static web server for playtesting",
    params: { dir: "string", port?: "number" },
    returns: "{ url, port }",
  },

  prototype_stop: {
    description: "Stop the prototype server",
    params: {},
    returns: "{ stopped: true }",
  },

  prototype_validate: {
    description: "Validate generated prototype HTML against spec (screen check, mechanic check)",
    params: { htmlPath: "string", specPath: "string" },
    returns: "{ valid, issues: [{ type, message }] }",
  },

  // ── Project Tools ────────────────────────────────────
  project_create: {
    description: "Create new game design project directory structure",
    params: { name: "string" },
    returns: "{ projectDir, specPath }",
  },

  project_list: {
    description: "List all game design projects",
    params: {},
    returns: "{ projects: [{ name, specVersion, lastUpdated, status }] }",
  },
};
```

### 3.3 Resources (readable by Claude)

```typescript
// mcp-server/src/resources/templates.ts

resources = {
  "template://base":        { content: baseTemplate },      // base HTML game loop
  "template://grid-puzzle":  { content: gridPuzzleTemplate },
  "template://side-scroll":  { content: sideScrollTemplate },
  "template://resource-mgr": { content: resourceTemplate },
  "template://card-hand":    { content: cardHandTemplate },
  "template://text-choice":  { content: textChoiceTemplate },

  "schema://game-spec":     { content: gameSpecSchemaYaml }, // spec format reference
  "schema://game-spec-example": { content: exampleSpecYaml },
};
```

### 3.4 MCP Server Implementation

```typescript
// mcp-server/src/server.ts
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { KnowledgeTool } from "../../src/knowledge";

const server = new McpServer({
  name: "game-design-kit",
  version: "1.0.0",
});

// Persistent KnowledgeTool instance
let knowledgeTool: KnowledgeTool | null = null;

async function getKnowledge(): Promise<KnowledgeTool> {
  if (!knowledgeTool) {
    knowledgeTool = new KnowledgeTool();
    // Load persisted index + graph if exists
    const cacheDir = `${process.env.KNOWLEDGE_DIR}/.knowledge-cache`;
    // ... load from cache
  }
  return knowledgeTool;
}

// Register tools
server.tool("knowledge_search", {
  query: z.string(),
  mode: z.enum(["lexical", "focused"]).default("lexical"),
  topK: z.number().default(5),
}, async ({ query, mode, topK }) => {
  const kt = await getKnowledge();
  const result = kt.search({
    query, topK, retrievalMode: mode,
    includeRawText: false, includeStructured: false,
  });
  return {
    content: [{ type: "text", text: formatSearchResults(result) }],
  };
});

// ... register all tools

// Register resources
server.resource("template://base", async () => ({
  contents: [{ uri: "template://base", mimeType: "text/html",
    text: await Bun.file("./templates/base.html").text() }],
}));

// Start
const transport = new StdioServerTransport();
await server.connect(transport);
```

---

## 4. Custom Commands

### `/project:concept` — Start new game concept

```markdown
---
description: Brainstorm a game concept from an idea. Generates 3 variants, user picks one, expands to full spec.
argument-hint: <game idea in natural language>
---

## Step 1: Research Knowledge Base

Search the knowledge base for relevant game design theory:

!`echo "Searching knowledge base for: $ARGUMENTS"`

Use these MCP tools to gather context:
1. `knowledge_search` with queries related to the genre, theme, and mechanics mentioned
2. `knowledge_search` for "MDA framework aesthetics" to ground the concept
3. `knowledge_search` for "core loop design" + the genre
4. `knowledge_search` for "player motivation" + the target audience

## Step 2: Generate 3 Concept Variants

Based on the knowledge context and the user's idea: "$ARGUMENTS"

Generate 3 DISTINCT game concept variants. For each:
- Title + elevator pitch (1-2 sentences)
- 3 design pillars
- Unique hook (what makes it different)
- Target aesthetics (from MDA: which of the 8?)
- Why it works (grounded in knowledge base findings)
- Key risks

Present all 3 to the user. Ask them to pick one (or blend).

## Step 3: Expand to Full Spec

After user picks a variant, read the spec schema:
- Read resource `schema://game-spec` for the format
- Read resource `schema://game-spec-example` for an example

Generate a complete `spec.yaml` following the schema exactly.
Use `project_create` to set up the project directory.
Write the spec file.
Use `spec_validate` to check it's valid.

## Step 4: Confirm

Show the user a summary of the generated spec.
Ask if they want to proceed to prototype generation.
```

### `/project:prototype` — Generate playable prototype

```markdown
---
description: Generate a playable HTML5 prototype from the current spec.yaml
---

## Step 1: Read Current Spec

Read the spec.yaml in the current project directory.
Identify which mechanics are in `prototypeScope.includedMechanics`.

## Step 2: Select Template

Based on the genre, read the appropriate template resource:
- Puzzle/match-3 → `template://grid-puzzle`
- Platformer/runner → `template://side-scroll`
- Idle/tycoon → `template://resource-mgr`
- Card game → `template://card-hand`
- Narrative → `template://text-choice`

Also read `template://base` for the common game loop framework.

## Step 3: Generate Prototype

Generate a SINGLE `index.html` file that:
- Uses HTML5 Canvas for all rendering
- Vanilla JavaScript only (no frameworks, no imports)
- Geometric shapes for visuals (rectangles, circles, text)
- Uses colors from `spec.visualDirection.colorPalette`
- Implements ONLY mechanics in `prototypeScope.includedMechanics`
- Has all screens defined in `spec.screens[]`
- Handles both mouse and touch input
- Is under 2000 lines total

Write the file to `{project}/prototype/index.html`.

## Step 4: Validate & Serve

Use `prototype_validate` to check the prototype against the spec.
If issues found, fix them.

Use `prototype_serve` to start a local server.
Tell the user the URL to open in their browser.

Say: "Prototype ready at {url}. Play it and tell me your feedback when ready,
or use /project:feedback to submit structured feedback."
```

### `/project:feedback` — Process playtest feedback

```markdown
---
description: Process playtest feedback, propose spec changes, update prototype
argument-hint: <feedback text>
---

## Step 1: Analyze Feedback

User feedback: "$ARGUMENTS"

Read the current spec.yaml. Analyze the feedback to identify:
1. What is the ROOT CAUSE (not just the symptom)?
2. Which spec sections need to change?
3. What specific changes would address the feedback?

Search knowledge base for relevant design principles:
- If about difficulty → search "difficulty curve design" "flow state"
- If about progression → search "progression design" "reward schedules"
- If about boring/repetitive → search "variable reward" "surprise element"
- If about confusion → search "mental model" "UX clarity"

## Step 2: Propose Changes

Propose SPECIFIC changes to spec.yaml. For each change:
- What section changes
- Current value → new value
- Why this addresses the feedback (grounded in knowledge)

Show the changes as a clear diff to the user.
Ask: "Apply these changes? (yes / edit / no)"

## Step 3: Apply & Regenerate

If approved:
1. Use `spec_bump_version` to archive current spec and increment version
2. Apply the changes to spec.yaml
3. Use `spec_validate` to verify
4. Regenerate the prototype (same flow as /project:prototype)
5. Use `prototype_serve` to restart the server

Tell the user the prototype has been updated and they can play again.
```

### `/project:approve` — Approve spec and generate documents

```markdown
---
description: Approve the current spec as final and generate all detail design documents
---

## Confirm

Read the current spec.yaml. Show the user:
- Title, version, last updated
- Number of feedback iterations
- Design pillars
- Mechanics (included + excluded from prototype)

Ask: "Approve this spec as final? This will generate 7 detail documents."

## Generate Documents

If approved, delegate to the `document-writer` agent for each document:

Generate these documents in `{project}/documents/`:

1. **gameplay-design.md** — Every mechanic expanded: rules, state diagrams, balance parameters, interaction matrix
2. **ui-ux-spec.md** — ASCII wireframes for every screen, element specs, transition flows, responsive notes
3. **economy-design.md** — Currency flows, earn/spend rates, inflation analysis per archetype, monetization deep-dive
4. **art-direction.md** — Visual style guide, color usage, mood board description, asset list
5. **content-plan.md** — Level count, item count, character count, scope matrix (MVP vs full), workload estimates
6. **technical-requirements.md** — Tech stack recommendation, architecture, API surface, performance targets
7. **sound-design.md** — Audio direction, SFX list per action, music mood per screen

For each document, use `knowledge_search` to find relevant best practices.

After all documents are generated, show a summary with file paths.
```

---

## 5. Custom Agents

### `concept-designer.md`

```markdown
---
name: concept-designer
description: Expert game concept designer. Brainstorms novel game concepts grounded
  in game design theory. Use when creating new concepts or evaluating ideas.
model: sonnet
tools: Read, Write, Edit, Bash, Grep, Glob,
  mcp__game-design-kit__knowledge_search,
  mcp__game-design-kit__knowledge_query_entity,
  mcp__game-design-kit__spec_validate,
  mcp__game-design-kit__project_create
maxTurns: 30
---

You are a senior game designer who creates novel, viable game concepts.

## Your Expertise
- MDA Framework (Mechanics → Dynamics → Aesthetics)
- Schell's Lenses (100+ design evaluation lenses)
- Hook Model (Trigger → Action → Variable Reward → Investment)
- Player psychology and motivation theory

## Rules
- Every design decision must have a WHY grounded in theory
- When citing theory, search the knowledge base first — don't hallucinate
- Generate concepts that are FEASIBLE for a small indie team
- Balance innovation with proven patterns
- Always validate specs after writing them
```

### `code-prototyper.md`

```markdown
---
name: code-prototyper
description: Game prototype developer. Generates playable HTML5 Canvas prototypes
  from spec files. Use when creating or updating prototypes.
model: sonnet
tools: Read, Write, Edit, Bash,
  mcp__game-design-kit__prototype_validate,
  mcp__game-design-kit__prototype_serve
maxTurns: 20
---

You are a game prototype developer specializing in rapid HTML5 Canvas prototypes.

## Strict Rules
- Output SINGLE complete HTML file with embedded CSS and JS
- Canvas API ONLY for rendering (no DOM game elements)
- Vanilla JavaScript ONLY (no frameworks, no imports, no npm)
- Geometric shapes ONLY (rectangles, circles, text, lines)
- Code MUST be under 2000 lines
- Handle both mouse and touch input
- EVERY screen in the spec must exist
- Game must be playable immediately on load

## Quality Self-Check (verify before outputting)
- Can player complete one full core loop cycle?
- Does every button/action have visible feedback?
- Is there a win/lose/progress condition?
- Are spec colors applied?
```

### `feedback-interpreter.md`

```markdown
---
name: feedback-interpreter
description: Game design consultant who interprets playtester feedback and proposes
  spec changes. Use when processing feedback from playtesting.
model: sonnet
tools: Read, Write, Edit,
  mcp__game-design-kit__knowledge_search,
  mcp__game-design-kit__spec_validate,
  mcp__game-design-kit__spec_bump_version,
  mcp__game-design-kit__spec_diff
maxTurns: 15
---

You are a game design consultant who interprets playtester feedback.

## Rules
- Interpret ROOT CAUSE, not surface symptoms
- "Too hard" might mean: bad controls, unclear feedback, or actual difficulty
- Be CONSERVATIVE — smallest change that addresses the feedback
- NEVER remove mechanics unless user explicitly requests
- ALWAYS preserve design pillars
- Ground changes in game design theory (search knowledge base)
- Show diff preview, NEVER auto-apply changes
```

### `document-writer.md`

```markdown
---
name: document-writer
description: Technical writer for game design documents. Expands specs into detailed
  documents with proper structure. Use when generating design documents.
model: sonnet
tools: Read, Write, Edit, Glob,
  mcp__game-design-kit__knowledge_search,
  mcp__game-design-kit__knowledge_query_entity
maxTurns: 40
---

You are a technical writer specializing in game design documentation.

## Document Quality Standards
- Every section must be ACTIONABLE (developer/artist can implement from it)
- Include specific numbers, not vague descriptions
- Use tables for parameters, lists for rules, ASCII art for diagrams
- Cross-reference other documents when relevant
- Cite knowledge base for design rationale

## Document Structure
Each document must have:
1. Overview (what this document covers, who should read it)
2. Detailed sections (specific to document type)
3. Open Questions (things that need playtesting to answer)
4. References (knowledge base citations)
```

---

## 6. CLAUDE.md

```markdown
# Game Design Kit

AI-powered game design pipeline: concept → prototype → documents.

## Knowledge Base
- 5 game design PDFs in `knowledge/` (Schell, MDA, Hooked, Theory of Fun, Players Making Decisions)
- Use MCP tool `knowledge_search` to find relevant theory BEFORE making design decisions
- Use `knowledge_build_graph` once after initial ingest to enable entity relationships

## Workflow
1. `/project:concept <idea>` — Brainstorm → pick variant → generate spec.yaml
2. `/project:prototype` — Generate playable HTML5 prototype from spec
3. Play the prototype in browser, then `/project:feedback <feedback>`
4. Iterate steps 2-3 until satisfied
5. `/project:approve` — Generate 7 detail design documents

## Spec Files
- Central artifact: `projects/{name}/spec.yaml`
- Format: see MCP resource `schema://game-spec`
- ALWAYS validate after editing: `spec_validate`
- NEVER edit spec without bumping version: `spec_bump_version`

## Prototype Rules
- Single HTML file, Canvas-based, vanilla JS, geometric shapes
- Templates available via MCP resources: `template://base`, `template://grid-puzzle`, etc.
- Serve via `prototype_serve`, validate via `prototype_validate`

## Commands
bun run mcp-server/src/server.ts   # MCP server (auto-started by Claude)
bun test                            # Run knowledge-layer tests
```

---

## 7. Updated Estimation

### What got eliminated

| Removed | Original Effort | Reason |
|---|---|---|
| API layer (Hono) | 2 weeks | Claude Code IS the API |
| Frontend (React) | 2 weeks | Terminal IS the UI |
| WebSocket streaming | 0.5 week | Claude handles streaming |
| Agent framework | 1 week | Claude IS the agent |
| Pipeline state machine | 0.5 week | Commands + spec versioning replace this |
| LLMProvider abstraction (for agents) | 0.5 week | Claude IS the LLM |
| **Total saved** | **~6.5 weeks** | |

### New estimation: ~5 weeks (1 dev)

```
Phase 1 ────── Phase 2 ────── Phase 3 ────── Phase 4 ────── Phase 5
  1 week       1.5 weeks      1 week         1 week        0.5 week
MCP Server    Commands +     Templates +    Documents +    Testing +
+ Spec        Agents         Prototype      Cross-val      Polish
```

### Phase 1: MCP Server + Spec (Week 1)

| Task | Days | Deliverable |
|---|---|---|
| MCP server scaffold (stdio transport, tool registration) | 1 | `mcp-server/src/server.ts` |
| Knowledge tools (ingest, search, graph, entity query) | 1 | `tools/knowledge.ts` |
| Knowledge persistence (save/load index + graph to disk) | 1 | Cache in `.knowledge-cache/` |
| Spec schema (Zod) + validation + diff + bump | 1 | `tools/spec.ts` + `spec-schema.ts` |
| Project create/list tools | 0.5 | `tools/prototype.ts` |
| Template resources | 0.5 | `resources/templates.ts` |

**Milestone:** `claude mcp add` → tools appear → `knowledge_ingest`, `knowledge_search`, `spec_validate` work.

### Phase 2: Commands + Agents (Weeks 2–3)

| Task | Days | Deliverable |
|---|---|---|
| CLAUDE.md + rules/ | 0.5 | Project instructions |
| `/project:concept` command | 1 | `commands/concept.md` |
| `concept-designer` agent | 1 | `agents/concept-designer.md` |
| `/project:feedback` command | 0.5 | `commands/feedback.md` |
| `feedback-interpreter` agent | 0.5 | `agents/feedback-interpreter.md` |
| `/project:status` command | 0.25 | `commands/status.md` |
| Game knowledge skill (auto-invoke) | 0.5 | `skills/game-knowledge/` |
| Testing concept flow end-to-end | 1 | Working concept generation |
| Prompt tuning with real PDFs | 1.5 | Tuned prompts |

**Milestone:** `/project:concept "casual puzzle gardening"` → 3 variants → pick → spec_v1.yaml.

### Phase 3: Templates + Prototype (Week 4)

| Task | Days | Deliverable |
|---|---|---|
| Base HTML template (canvas, game loop, input, screens) | 1 | `templates/base.html` |
| Genre templates (grid-puzzle, side-scroll, resource-mgr) | 1.5 | 3 template files |
| `/project:prototype` command | 0.5 | `commands/prototype.md` |
| `code-prototyper` agent | 0.5 | `agents/code-prototyper.md` |
| Prototype validation tool | 0.5 | Checks screens, mechanics refs |
| Prototype server (Bun.serve static) | 0.25 | `tools/prototype.ts` |
| Integration: spec → prototype → feedback → update → regen | 0.75 | Full feedback loop |

**Milestone:** Full loop works: concept → prototype → play → feedback → update → play again.

### Phase 4: Documents + Cross-validation (Week 5)

| Task | Days | Deliverable |
|---|---|---|
| `/project:approve` + `/project:docs` commands | 0.5 | Commands |
| `document-writer` agent | 0.5 | Agent persona |
| Document rules (per doc type: gameplay, UI/UX, economy, art, content, tech, sound) | 2 | 7 generation rules in `rules/` |
| Cross-document validation logic | 0.5 | Consistency checks |
| Testing with real specs | 0.5 | Quality assurance |

**Milestone:** `/project:approve` → 7 detailed markdown documents with cross-references.

### Phase 5: Polish (3 days)

| Task | Days |
|---|---|
| End-to-end testing (full pipeline × 2 different game types) | 1 |
| Error handling in MCP tools | 0.5 |
| Knowledge base pre-ingestion script | 0.5 |
| README + installation guide | 0.5 |

**Milestone:** Ship-ready plugin package.

---

## 8. Installation Guide (for users)

```bash
# 1. Clone the game-design-kit
git clone <repo> game-design-kit
cd game-design-kit

# 2. Install dependencies
bun install

# 3. Ingest knowledge base (one-time)
bun run setup-knowledge

# 4. Open any project with Claude Code
claude

# 5. The .claude/ directory auto-configures:
#    - MCP server starts automatically
#    - Commands available as /project:concept, /project:prototype, etc.
#    - Knowledge base ready to query

# 6. Start designing!
# > /project:concept casual puzzle game with gardening theme for mobile
```

---

## 9. Key Advantages of Plugin Architecture

| Aspect | Standalone App | Claude Code Plugin |
|---|---|---|
| **Dev effort** | ~12 weeks | **~5 weeks** |
| **UI** | Build custom React frontend | Claude terminal (free) |
| **LLM** | BYO LLMProvider, manage keys | Claude built-in |
| **Streaming** | WebSocket implementation | Built-in |
| **File operations** | Custom API endpoints | Claude's native tools |
| **Git integration** | Not included | Built-in |
| **Code generation** | Custom agent framework | Claude IS the coder |
| **Maintenance** | Full stack (API + FE + agents) | MCP server only |
| **Distribution** | Deploy server + serve frontend | `git clone` + `bun install` |
| **Extensibility** | API changes required | Add .md file = new feature |
