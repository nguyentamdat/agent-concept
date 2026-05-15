# Architecture

## Pattern Overview

**Overall:** Claude Code Plugin with a multi-agent pipeline system — markdown-defined agents, a single early-pipeline skill, and commands orchestrate an AI game design workflow (Prototype + Lightweight GCD → Mockup → Wireframe → Detail Docs).

**Key Characteristics:**
- All agents and commands are **markdown files** (not code), interpreted by Claude Code at runtime
- The first half of the pipeline is owned by a single **skill** (`game-prototype`) rather than chained agents — keeps brainstorm + playable spike + lightweight GCD coherent inside one workflow
- A 3-tier agent hierarchy (Director → Producers → Reviewers) drives the second half (mockup, wireframe, detail docs) with explicit approval gates
- External knowledge is served exclusively via **Hindsight MCP** (remote HTTP API, `game-knowledge` bank)
- Agents use `${CLAUDE_PLUGIN_ROOT}` for path resolution; no hard-coded paths
- No build step, no compiled output — the plugin files ARE the runtime artifacts

## Layers

**T1 Director (`agents/creative-director.md`):**
- Purpose: Orchestrates the full design pipeline; maintains design vision and pillar integrity; acts as quality gate authority
- Location: `agents/creative-director.md`
- Contains: Collaboration protocol, Vision Articulation Framework, Decision Framework, delegation rules
- Depends on: the `game-prototype` skill (early pipeline), T2 Producers (downstream artifacts), T3 Reviewers (quality checks), Hindsight MCP (theory grounding)
- Used by: Slash commands (`commands/create.md`, `commands/iterate.md`)

**Early-pipeline skill (`skills/game-prototype/SKILL.md`):**
- Purpose: Owns Phase 1 (concept brainstorm + audits + Gate 1), Phase 2 (versioned playable prototype + iteration + Gate 2), and Phase 3 (Vietnamese lightweight GCD)
- Location: `skills/game-prototype/SKILL.md` + `skills/game-prototype/references/*`
- Contains: Phase workflow, suggestion rules, audit frameworks, prototype HTML template, GCD output template
- Outputs (under `projects/{project-name}/Game Demo/`):
  - `[slug]-concept-{A|B|C}.html` — three Phase 1 mini concept prototypes
  - `[slug]-vN.html` — Phase 2 versioned playable prototype (highest N is the current "approved" version)
  - `[slug]-GCD.md` — Phase 3 Vietnamese lightweight GCD
- Depends on: Hindsight MCP (game-knowledge skill) for theory grounding; market-researcher findings (when requested) feed into Phase 1
- Used by: `creative-director` (T1), `commands/create.md`, `commands/iterate.md`

**T2 Producers (downstream, `agents/`):**
- Purpose: Create downstream design artifacts from the approved prototype + lightweight GCD — each producer owns one artifact type
- Active routing locations:
  - `agents/mockup-designer.md` — `mockup.html`
  - `agents/wireframe-designer.md` — `wireframe.html`
  - `agents/document-writer.md` — detail docs
  - `agents/market-researcher.md` — `market-research.md` (background-runnable)
- Contains: Generation logic, input requirements, output conventions, formatting rules
- Depends on: Approved `Game Demo/[slug]-vN.html` and `Game Demo/[slug]-GCD.md` as ground truth, `mockup.html` (for wireframe and `ui-ux-spec.md`), `references/` for templates and guides, Hindsight MCP (via `game-knowledge` skill) for theory
- Used by: `creative-director` (T1), slash commands
- Legacy / manual helpers (preserved but not on active routing): `agents/concept-designer.md`, `agents/code-prototyper.md`, `agents/review-concept.md`

**T3 Reviewers (`agents/`):**
- Purpose: Quality-check artifacts produced by T2; produce structured review notes; auto-invoked after each producer completes
- Location: `agents/ui-ux-reviewer.md`, `agents/detail-doc-reviewer.md`, `agents/feedback-interpreter.md` (active); `agents/review-concept.md` (legacy/manual)
- Contains: Evaluation criteria, scoring rubrics, review templates, rejection rules
- Depends on: `references/` (criteria files and review templates), `skills/game-ui-ux-guide/` (for ui-ux-reviewer), approved `Game Demo/[slug]-GCD.md` + `[slug]-vN.html` as ground truth, Hindsight MCP for theory
- Used by: `creative-director` (T1) immediately after each T2 producer completes; `feedback-interpreter` is invoked by `commands/iterate.md` to route feedback to the right producer/skill

**Commands Layer (`commands/`):**
- Purpose: User-facing entry points that define the full pipeline flow and step-by-step instructions
- Location: `commands/create.md`, `commands/iterate.md`, `commands/status.md`, `commands/setup.md`
- Contains: Step-by-step pipeline orchestration, approval gate logic, agent + skill invocation order, downstream impact analysis
- Depends on: All agents, the `game-prototype` skill, `projects/` (for artifact storage)
- Used by: End users via `/design-kit:<command>` syntax

**References Layer (`references/`):**
- Purpose: Static design knowledge — templates, evaluation criteria, theory references, and review guides used by agents
- Location: `references/`
- Contains: Mockup/wireframe guides, art style guide, gameplay/gui section guides, theory references, plus legacy concept/GCD templates kept for manual review use
- Depends on: Nothing (read-only reference material)
- Used by: All agents (active and legacy) and skills

**Skills Layer (`skills/`):**
- Purpose: Reusable behavioral skill packages that extend agent or command capabilities
- Location: `skills/game-prototype/`, `skills/game-knowledge/`, `skills/game-ui-ux-guide/`, plus archived `skills/_deprecated/game-concept-design/`
- Contains: Skill definitions (`SKILL.md`), sub-references per skill
- Depends on: Hindsight MCP (game-knowledge skill), `references/` (ui-ux-guide skill)
- Used by: Commands and agents that require specialized knowledge retrieval or design methodology

## Data Flow

**Full Design Pipeline (Happy Path):**

1. User runs `/design-kit:create <idea>` — `commands/create.md`
2. Step 0: Project directory created under `projects/{project-name}/` with `Game Demo/` subdirectory; optional market-researcher launched in background — `commands/create.md`
3. Step 1: `commands/create.md` invokes the `game-prototype` skill end-to-end (`skills/game-prototype/SKILL.md`):
   - Phase 1 produces `Game Demo/[slug]-concept-{A|B|C}.html` plus the approved gameplay option (passes Gate 1)
   - Phase 2 produces `Game Demo/[slug]-vN.html` and iterates to the final approved version (passes Gate 2)
   - Phase 3 produces Vietnamese `Game Demo/[slug]-GCD.md` (passes user approval)
4. Step 2: `mockup-designer` produces `mockup.html` (with dom-grab component picker) from approved `[slug]-vN.html` + `[slug]-GCD.md`; `ui-ux-reviewer` auto-invoked
5. Step 3: `wireframe-designer` produces `wireframe.html` (1:1 synced with `mockup.html`) using `[slug]-GCD.md` and `[slug]-vN.html` as supporting context; `ui-ux-reviewer` auto-invoked
6. Step 4: Feedback gate — `feedback-interpreter` structures user feedback if provided; routes prototype/GCD changes back into `game-prototype`, mockup-only into `mockup-designer`, wireframe-only into `wireframe-designer`
7. Steps 5–6: `document-writer` generates selected detail docs from `[slug]-GCD.md` + `[slug]-vN.html` (plus `mockup.html`/`wireframe.html` for `ui-ux-spec.md`); appropriate reviewer auto-invoked after each

**Feedback / Iterate Flow:**

1. User runs `/design-kit:iterate <feedback>` — `commands/iterate.md`
2. `feedback-interpreter` diagnoses root cause and proposes minimal change set
3. Diff preview shown to user before any file is modified
4. After approval, the matching owner regenerates the changed artifact:
   - Playable behavior / balance / mechanic / GCD wording → re-enter the `game-prototype` skill (Phase 2 writes a new `[slug]-vN+1.html`; Phase 3 refreshes `[slug]-GCD.md`)
   - Mockup-only feedback → `mockup-designer`
   - Wireframe-only feedback → `wireframe-designer`
   - Detail-doc-only feedback → `document-writer`
5. Downstream impact analysis determines which subsequent artifacts need regeneration

**Knowledge Retrieval Flow:**

1. Agent or skill invokes `mcp__hindsight__recall` or `mcp__hindsight__reflect`
2. Hindsight MCP server (`https://hindsight.zingplay.dev/mcp/game-knowledge/`) is called with Bearer auth (`HINDSIGHT_API_KEY`)
3. Response grounds the agent's design recommendations in game design theory

## Key Abstractions

**Agent (markdown persona):**
- Purpose: Defines a specialized AI role with a persona, tier designation, tool permissions, and operating procedures
- Location: `agents/*.md`
- Pattern: YAML frontmatter (`name`, `description`, `model`, `color`, `tools`) + markdown body with behavioral instructions

**Command (pipeline step definition):**
- Purpose: Defines a user-invocable workflow as a numbered sequence of steps with explicit approval gates
- Location: `commands/*.md`
- Pattern: YAML frontmatter (`description`, `argument-hint`) + markdown body with ordered steps, agent + skill invocation points, and AskUserQuestion gates

**Skill (behavioral package):**
- Purpose: Reusable knowledge retrieval or methodology that agents/commands load on demand. The `game-prototype` skill goes further: it owns the entire early pipeline (Phase 1+2+3) instead of being merely a knowledge lookup.
- Location: `skills/{skill-name}/SKILL.md`
- Pattern: YAML frontmatter (`name`, `description`) + trigger keyword tables + how-to-use procedures referencing sub-files in `skills/{skill-name}/references/`

**Approval Gate:**
- Purpose: Mandatory user confirmation step between each pipeline phase — no artifact auto-advances without explicit approval
- Pattern: `AskUserQuestion` with options `"Approve" / "Request changes" / "Skip"` — enforced in `commands/create.md` after every producer/skill phase completes (the `game-prototype` skill enforces its own Gate 1 + Gate 2 + Phase 3 approval internally)

**Project Directory:**
- Purpose: Isolated working directory for each game design session
- Location: `projects/{project-name}/`
- Contains: `Game Demo/[slug]-concept-{A|B|C}.html`, `Game Demo/[slug]-vN.html`, `Game Demo/[slug]-GCD.md`, `mockup.html`, `wireframe.html`, optional `market-research.md`, and selected detail docs. Legacy artifacts (`concept-pitch.md`, root `gcd.md`, `prototype/index.html`) may exist from older runs and are read-only context.

## Entry Points

**`/design-kit:create <idea>` (Primary):**
- Location: `commands/create.md`
- Triggers: User invocation from Claude Code CLI
- Responsibilities: Runs the prototype-first pipeline from idea collection through detail document generation; manages all agent + skill invocations and approval gates

**`/design-kit:iterate <feedback>`:**
- Location: `commands/iterate.md`
- Triggers: User invocation after any artifact exists in `projects/`
- Responsibilities: Analyzes feedback impact, invokes `feedback-interpreter`, shows diff preview, applies approved changes via the right producer or skill phase, handles downstream artifact regeneration

**`/design-kit:status`:**
- Location: `commands/status.md`
- Triggers: User invocation at any time
- Responsibilities: Reports current pipeline stage (with `Game Demo/*-v*.html` and `*-GCD.md` as primary indicators), artifact checklist, and Hindsight MCP stats; reports legacy artifacts only as a separate footer

**`/design-kit:setup`:**
- Location: `commands/setup.md`
- Triggers: User invocation; subcommands `update` / `doctor`
- Responsibilities: Checks plugin version against GitHub releases and updates plugin files; `setup doctor` delegates to `/design-kit:doctor`

**`/design-kit:doctor`:**
- Location: `commands/doctor.md`
- Triggers: User invocation or `/design-kit:setup doctor`
- Responsibilities: Diagnoses plugin structure, MCP environment variables, MCP reachability, and version consistency

**`/design-kit:mcp-setup`:**
- Location: `commands/mcp-setup.md`
- Triggers: User invocation when MCP env vars are missing or need to be changed
- Responsibilities: Discovers MCP server placeholders from the plugin manifest, prompts for required values, writes them to `~/.claude/settings.json`, and explains restart/verification steps

**SessionStart Hook:**
- Location: `hooks/hooks.json` → `scripts/plugin-setup.sh`
- Triggers: Every new Claude Code session
- Responsibilities: Warns if `HINDSIGHT_API_KEY` is missing from the shell environment

## Error Handling

**Strategy:** Fail informatively — approval gates prevent downstream damage; agents and the `game-prototype` skill display clear error states rather than silently continuing.

- Missing `HINDSIGHT_API_KEY`: warned at session start by `scripts/plugin-setup.sh`; knowledge tools unavailable but rest of pipeline continues
- Missing prerequisite artifacts: commands check for required inputs and stop with clear instructions (e.g., `iterate` stops if no project exists; mockup stops if no `Game Demo/[slug]-vN.html` was approved)
- Auto-reject triggers: mockup without dom-grab component picker = auto-REJECT; wireframe not 1:1 with mockup = auto-REJECT; lightweight GCD inventing mechanics not present in `[slug]-vN.html` = auto-REJECT; changes applied without user approval = forbidden
- Iteration safety: prototype iterations always write `[slug]-vN+1.html` rather than overwriting an existing approved version
- Feedback changes: never auto-applied — always show diff preview first

## Cross-Cutting Concerns

**Knowledge Base:** Served via Hindsight MCP at `https://hindsight.zingplay.dev/mcp/game-knowledge/`; agents use `mcp__hindsight__recall` and `mcp__hindsight__reflect`; no local knowledge files
**Permissions:** Declared in `settings.json`; Hindsight MCP tools explicitly listed in allow-list
**Plugin Identity:** Declared in `.claude-plugin/plugin.json` (name, version, MCP server config) and `.claude-plugin/marketplace.json`
**Localization:** `Game Demo/[slug]-GCD.md` always written in Vietnamese; all other artifacts in English
**Installation:** `install.sh` / `uninstall.sh` copy plugin files to `~/.claude/plugins/`; `scripts/gist-install.sh` / `gist-install.ps1` for remote install from GitHub Gist
