# Architecture

## Pattern Overview

**Overall:** Claude Code Plugin with a multi-agent pipeline system — markdown-defined agents and commands orchestrate an AI game design workflow (Concept → Prototype → Mockup → Wireframe → Detail Docs).

**Key Characteristics:**
- All agents and commands are **markdown files** (not code), interpreted by Claude Code at runtime
- A 3-tier agent hierarchy (Director → Producers → Reviewers) with explicit approval gates
- External knowledge is served exclusively via **Hindsight MCP** (remote HTTP API, `game-knowledge` bank)
- Agents use `${CLAUDE_PLUGIN_ROOT}` for path resolution; no hard-coded paths
- No build step, no compiled output — the plugin files ARE the runtime artifacts

## Layers

**T1 Director (`agents/creative-director.md`):**
- Purpose: Orchestrates the full design pipeline; maintains design vision and pillar integrity; acts as quality gate authority
- Location: `agents/creative-director.md`
- Contains: Collaboration protocol, Vision Articulation Framework, Decision Framework, delegation rules
- Depends on: T2 Producers (to create artifacts), T3 Reviewers (to quality-check), Hindsight MCP (for theory grounding)
- Used by: Slash commands (`commands/create.md`, `commands/iterate.md`)

**T2 Producers (`agents/`):**
- Purpose: Create design artifacts — each producer owns one artifact type
- Location: `agents/concept-designer.md`, `agents/code-prototyper.md`, `agents/mockup-designer.md`, `agents/wireframe-designer.md`, `agents/document-writer.md`, `agents/market-researcher.md`
- Contains: Generation logic, input requirements, output conventions, formatting rules
- Depends on: Prior artifacts in the pipeline (concept → prototype → mockup → wireframe), `references/` for templates and guides, Hindsight MCP (via `game-knowledge` skill) for theory
- Used by: `creative-director` (T1), slash commands

**T3 Reviewers (`agents/`):**
- Purpose: Quality-check artifacts produced by T2; produce structured review notes; auto-invoked after each producer completes
- Location: `agents/review-concept.md`, `agents/ui-ux-reviewer.md`, `agents/detail-doc-reviewer.md`, `agents/feedback-interpreter.md`
- Contains: Evaluation criteria, scoring rubrics, review templates, rejection rules
- Depends on: `references/` (criteria files and review templates), Hindsight MCP for theory
- Used by: `creative-director` (T1) immediately after each T2 producer completes

**Commands Layer (`commands/`):**
- Purpose: User-facing entry points that define the full pipeline flow and step-by-step instructions
- Location: `commands/create.md`, `commands/iterate.md`, `commands/status.md`, `commands/setup.md`
- Contains: Step-by-step pipeline orchestration, approval gate logic, agent invocation order, downstream impact analysis
- Depends on: All agents (T1–T3), `projects/` (for artifact storage)
- Used by: End users via `/design-kit:<command>` syntax

**References Layer (`references/`):**
- Purpose: Static design knowledge — templates, evaluation criteria, theory references, and review guides used by agents
- Location: `references/`
- Contains: GCD templates, concept evaluation criteria, review checklists, mockup/wireframe guides, art style guide, gameplay section guides
- Depends on: Nothing (read-only reference material)
- Used by: All agents and skills

**Skills Layer (`skills/`):**
- Purpose: Reusable behavioral skill packages that extend agent capabilities
- Location: `skills/game-concept-design/`, `skills/game-knowledge/`, `skills/game-ui-ux-guide/`
- Contains: Skill definitions (`SKILL.md`), sub-references per skill
- Depends on: Hindsight MCP (game-knowledge skill), `references/` (ui-ux-guide skill)
- Used by: Agents and commands that require specialized knowledge retrieval or design methodology

## Data Flow

**Full Design Pipeline (Happy Path):**

1. User runs `/design-kit:create <idea>` — `commands/create.md`
2. Step 0: Project directory created under `projects/{project-name}/` — `commands/create.md`
3. Step 1–3: Concept info gathered, brainstorm direction chosen — `commands/create.md`
4. Step 4: `concept-designer` produces `concept-pitch.md` — `agents/concept-designer.md`; `review-concept` auto-invoked — `agents/review-concept.md`
5. Step 5: `concept-designer` produces `gcd.md` (in Vietnamese) — `agents/concept-designer.md`
6. Step 6: `code-prototyper` produces `prototype/index.html` — `agents/code-prototyper.md`
7. Step 7: `mockup-designer` produces `mockup.html` (with dom-grab component picker) — `agents/mockup-designer.md`; `ui-ux-reviewer` auto-invoked
8. Step 8: `wireframe-designer` produces `wireframe.html` (1:1 synced with `mockup.html`) — `agents/wireframe-designer.md`; `ui-ux-reviewer` auto-invoked
9. Step 9: Feedback gate — `feedback-interpreter` structures user feedback if provided
10. Steps 10–11: `document-writer` generates selected detail docs; appropriate reviewer auto-invoked after each

**Feedback / Iterate Flow:**

1. User runs `/design-kit:iterate <feedback>` — `commands/iterate.md`
2. `feedback-interpreter` diagnoses root cause and proposes minimal change set
3. Diff preview shown to user before any file is modified
4. After approval, affected agents regenerate only the changed artifacts
5. Downstream impact analysis determines which subsequent artifacts need regeneration

**Knowledge Retrieval Flow:**

1. Agent or skill invokes `mcp__hindsight__recall` or `mcp__hindsight__reflect`
2. Hindsight MCP server (`https://hindsight-api.zingplay.dev/mcp/game-knowledge/`) is called with Bearer auth (`HINDSIGHT_API_KEY`)
3. Response grounds the agent's design recommendations in game design theory

## Key Abstractions

**Agent (markdown persona):**
- Purpose: Defines a specialized AI role with a persona, tier designation, tool permissions, and operating procedures
- Location: `agents/*.md`
- Pattern: YAML frontmatter (`name`, `description`, `model`, `color`, `tools`) + markdown body with behavioral instructions

**Command (pipeline step definition):**
- Purpose: Defines a user-invocable workflow as a numbered sequence of steps with explicit approval gates
- Location: `commands/*.md`
- Pattern: YAML frontmatter (`description`, `argument-hint`) + markdown body with ordered steps, agent invocation points, and AskUserQuestion gates

**Skill (behavioral package):**
- Purpose: Reusable knowledge retrieval or methodology that agents load on demand
- Location: `skills/{skill-name}/SKILL.md`
- Pattern: YAML frontmatter (`name`, `description`) + trigger keyword tables + how-to-use procedures referencing sub-files in `skills/{skill-name}/references/`

**Approval Gate:**
- Purpose: Mandatory user confirmation step between each pipeline phase — no artifact auto-advances without explicit approval
- Pattern: `AskUserQuestion` with options `"Approve" / "Request changes" / "Skip"` — enforced in `commands/create.md` after every producer completes

**Project Directory:**
- Purpose: Isolated working directory for each game design session
- Location: `projects/{project-name}/`
- Contains: `concept-pitch.md`, `gcd.md`, `prototype/index.html`, `mockup.html`, `wireframe.html`, and selected detail docs

## Entry Points

**`/design-kit:create <idea>` (Primary):**
- Location: `commands/create.md`
- Triggers: User invocation from Claude Code CLI
- Responsibilities: Runs the full 11-step pipeline from idea collection through detail document generation; manages all agent invocations and approval gates

**`/design-kit:iterate <feedback>`:**
- Location: `commands/iterate.md`
- Triggers: User invocation after any artifact exists in `projects/`
- Responsibilities: Analyzes feedback impact, invokes `feedback-interpreter`, shows diff preview, applies approved changes, handles downstream artifact regeneration

**`/design-kit:status`:**
- Location: `commands/status.md`
- Triggers: User invocation at any time
- Responsibilities: Reports current pipeline stage, artifact checklist, and Hindsight MCP stats

**`/design-kit:setup`:**
- Location: `commands/setup.md`
- Triggers: User invocation; subcommands `update` / `doctor`
- Responsibilities: Checks plugin version against GitHub releases, updates plugin files, runs diagnostics

**SessionStart Hook:**
- Location: `hooks/hooks.json` → `scripts/plugin-setup.sh`
- Triggers: Every new Claude Code session
- Responsibilities: Warns if `HINDSIGHT_API_KEY` is missing from the shell environment

## Error Handling

**Strategy:** Fail informatively — approval gates prevent downstream damage; agents display clear error states rather than silently continuing.

- Missing `HINDSIGHT_API_KEY`: warned at session start by `scripts/plugin-setup.sh`; knowledge tools unavailable but rest of pipeline continues
- Missing prerequisite artifacts: commands check for required inputs and stop with clear instructions (e.g., `iterate` stops if no project exists)
- Auto-reject triggers: mockup without dom-grab component picker = auto-REJECT; wireframe not 1:1 with mockup = auto-REJECT; changes applied without user approval = forbidden
- Feedback changes: never auto-applied — always show diff preview first

## Cross-Cutting Concerns

**Knowledge Base:** Served via Hindsight MCP at `https://hindsight-api.zingplay.dev/mcp/game-knowledge/`; agents use `mcp__hindsight__recall` and `mcp__hindsight__reflect`; no local knowledge files
**Permissions:** Declared in `settings.json`; Hindsight MCP tools explicitly listed in allow-list
**Plugin Identity:** Declared in `.claude-plugin/plugin.json` (name, version, MCP server config) and `.claude-plugin/marketplace.json`
**Localization:** `gcd.md` always written in Vietnamese; all other artifacts in English
**Installation:** `install.sh` / `uninstall.sh` copy plugin files to `~/.claude/plugins/`; `scripts/gist-install.sh` / `gist-install.ps1` for remote install from GitHub Gist
