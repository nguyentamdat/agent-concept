# Codebase Structure

## Directory Layout

```
game-design-kit/
├── .claude-plugin/         # Plugin identity and marketplace metadata
│   ├── plugin.json         # Plugin manifest: name, version, MCP server config
│   └── marketplace.json    # Marketplace declaration for Claude Code plugin store
├── agents/                 # Agent persona definitions (markdown, 3-tier hierarchy + legacy helpers)
├── commands/               # Slash command definitions (markdown pipeline steps)
├── skills/                 # Skill packages (behavioral knowledge modules)
│   ├── game-prototype/         # Active prototype-first early-pipeline skill (Phase 1+2+3)
│   ├── game-knowledge/         # Hindsight MCP auto-search behavioral skill
│   ├── game-ui-ux-guide/       # Mobile game UI/UX knowledge skill
│   └── _deprecated/
│       └── game-concept-design/    # Archived legacy GCD methodology skill (replaced by game-prototype)
├── references/             # Static design templates, theory references, review guides
├── hooks/                  # Claude Code session hooks config
│   └── hooks.json          # SessionStart hook → plugin-setup.sh
├── scripts/                # Installation and setup scripts
│   ├── plugin-setup.sh     # SessionStart env check (warns if HINDSIGHT_API_KEY missing)
│   ├── gist-install.sh     # Remote install from GitHub Gist (Linux/macOS)
│   ├── gist-install.ps1    # Remote install from GitHub Gist (Windows PowerShell)
│   └── verify-release-smoke.js # Release/package smoke assertions
├── projects/               # Generated game project output (gitignored)
│   └── {project-name}/
│       └── Game Demo/      # Active output root for the game-prototype skill
├── docs/                   # Internal architecture docs and drafts
│   └── archive/            # Archived planning documents
├── AGENTS.md               # Project knowledge base (pipeline overview, conventions)
├── ARCHITECTURE.md         # Architecture pattern overview, layers, data flow
├── CLAUDE.md               # Claude Code operational guidance for this repo
├── EVALUATION_GUIDE.md     # Evaluation guide for reviewing generated output
├── README.md               # Public-facing plugin readme and quick start
├── install.sh              # Primary installer script
├── uninstall.sh            # Uninstaller script
├── settings.json           # Plugin permission manifest (MCP tool allow-list)
├── package.json            # Package metadata (name, version — no npm deps)
└── LICENSE                 # MIT license
```

## Directory Purposes

**`agents/` — Agent personas (T1 Director, T2 Producers, T3 Reviewers, legacy helpers):**
- Purpose: Each file defines a specialized AI agent with a role, persona, tool permissions, and operating procedures
- Contains: Markdown files with YAML frontmatter (`name`, `description`, `model`, `color`, `tools`) + behavioral instructions
- Active routing key files:
  - `creative-director.md` — T1 Director; orchestrates the pipeline, holds vision, quality gate authority
  - `mockup-designer.md` — T2; generates `mockup.html` (high-fi, all screens, dom-grab component picker) from approved `Game Demo/[slug]-vN.html` + `[slug]-GCD.md`
  - `wireframe-designer.md` — T2; generates `wireframe.html` (flowchart + component spec panels, 1:1 synced with mockup)
  - `document-writer.md` — T2; generates detail design documents from approved `Game Demo/[slug]-GCD.md` + `[slug]-vN.html`
  - `market-researcher.md` — T2; produces market research report; findings feed into `game-prototype` Phase 1
  - `ui-ux-reviewer.md` — T3; reviews `ui-ux-spec.md`, `art-direction.md`, `mockup.html`, `wireframe.html`
  - `detail-doc-reviewer.md` — T3; reviews all other detail documents
  - `feedback-interpreter.md` — T3; interprets and structures user feedback into actionable changes; routes to `game-prototype` skill, `mockup-designer`, `wireframe-designer`, or `document-writer`
- Legacy / manual helpers (preserved but not on active `/design-kit:create` route):
  - `concept-designer.md` — Was T2 Concept Pitch + theory-driven GCD producer
  - `code-prototyper.md` — Was T2 single-file `prototype/index.html` producer
  - `review-concept.md` — Was T3 Concept Pitch + GCD reviewer

**`commands/` — Slash command pipeline definitions:**
- Purpose: User-facing workflows implemented as ordered steps with approval gates and agent invocations
- Contains: Markdown files with YAML frontmatter (`description`, `argument-hint`) + numbered step instructions
- Key files:
  - `create.md` — Prototype-first pipeline: Step 0 setup + optional market research → Step 1 `game-prototype` skill (Phase 1 brainstorm + audits → Phase 2 versioned playable prototype with iteration → Phase 3 lightweight Vietnamese GCD) → Step 2 Mockup → Step 3 Wireframe → Step 4 Feedback Gate → Step 5 detail-doc selection → Step 6 detail-doc generation
  - `iterate.md` — Feedback-driven update flow with diff preview before any file changes; same routing rules as `feedback-interpreter`
  - `status.md` — Project artifact checklist + pipeline stage (with `Game Demo/*-v*.html` and `Game Demo/*-GCD.md` as primary indicators) + Hindsight MCP stats
  - `setup.md` — Plugin version check, update from GitHub releases, diagnostics (doctor requires `skills/game-prototype/SKILL.md`)

**`skills/` — Behavioral skill packages:**
- Purpose: Reusable knowledge retrieval and methodology modules loaded by agents on demand
- Contains: `SKILL.md` (skill definition + trigger rules) and `references/` subfolder per skill
- Active key files:
  - `game-prototype/SKILL.md` — **Active prototype-first early-pipeline skill.** Owns Phase 1 (idea + audience + problem statement + 8 KoF + 3 gameplay options + 3 mini concept prototypes + audits + Gate 1), Phase 2 (versioned full playable prototype `Game Demo/[slug]-vN.html` + iteration + Gate 2), and Phase 3 (Vietnamese lightweight GCD `Game Demo/[slug]-GCD.md`).
  - `game-knowledge/SKILL.md` — Auto-invokes `mcp__hindsight__recall` when game design topics appear
  - `game-ui-ux-guide/SKILL.md` — Mobile game UI/UX knowledge: review criteria, screen checklists, art style guide
- Deprecated (preserved for legacy/manual support, not auto-discovered):
  - `_deprecated/game-concept-design/SKILL.md` — Original 2-phase theory-driven GCD methodology (Phase A: brainstorm+pitch; Phase B: full GCD with 12 theories). Replaced by `game-prototype`. Has a deprecation banner.

**`references/` — Static design knowledge (read-only):**
- Purpose: Templates, evaluation criteria, theory references, and review guides consumed by agents and skills
- Contains: Markdown files; no executable logic
- Active key files (still on the create route):
  - `mockup-review-criteria.md` — Mockup acceptance/rejection criteria (includes dom-grab requirement)
  - `wireframe-overview-guide.md` — Wireframe flowchart layout spec and component panel schema
  - `gui-section-guide.md`, `gameplay-section-guide.md` — Section guides for document-writer
  - `mechanic-list.md` — Reference mechanic patterns
- Canonical UI/UX references live under `skills/game-ui-ux-guide/references/`:
  - `art-style-guide.md` — Visual style and art direction reference
  - `review-checklist.md`, `screen-checklists.md` — UI/UX review checklists
  - `theory-knowledge-base.md` — Game UI/UX theory reference
- Legacy/manual reference files (still in `references/` but no longer on the active create route):
  - `gcd-template.md`, `gcd-gameplay-template.md` — Theory-driven GCD document templates (used by archived `game-concept-design` skill)
  - `concept-evaluation-criteria.md`, `concept-review-template.md` — Concept Pitch review standards (used by archived `review-concept` agent)
  - `gdd-evaluation-criteria.md`, `gdd-expected-sections.md`, `gdd-review-template.md` — Theory GDD review standards
  - `phase-a-outline-template.md` — Concept pitch Phase A outline template
- Canonical legacy game theory reference lives under `skills/_deprecated/game-concept-design/references/game-design-theories.md`.

**`hooks/` — Session lifecycle hooks:**
- Purpose: Declares Claude Code hooks that run at session events
- Contains: `hooks.json` mapping `SessionStart` to `scripts/plugin-setup.sh`

**`scripts/` — Installation and environment scripts:**
- Purpose: Check environment at session start and run packaging smoke assertions
- Key files:
  - `plugin-setup.sh` — SessionStart hook; warns if `HINDSIGHT_API_KEY` is unset
  - Root `install.sh` / `uninstall.sh` — Copy/remove plugin files under `~/.claude/plugins/cache/local/game-design-kit/` and update Claude plugin registry/settings
  - `gist-install.sh` / `gist-install.ps1` — Remote install from GitHub Gist (one-liner install)
  - `verify-release-smoke.js` — Local/CI manifest, package, and installer hygiene checks

**`projects/` — Generated output (gitignored):**
- Purpose: Stores all generated game design artifacts; one subdirectory per game project
- Contains:
  - `{project-name}/Game Demo/[slug]-concept-{A|B|C}.html` — Phase 1 mini concept prototypes
  - `{project-name}/Game Demo/[slug]-vN.html` — Phase 2 versioned playable prototypes (highest N is the current "approved" version)
  - `{project-name}/Game Demo/[slug]-GCD.md` — Phase 3 Vietnamese lightweight GCD
  - `{project-name}/mockup.html`, `wireframe.html`, and selected detail docs
  - Optional `{project-name}/market-research.md`
- Note: Gitignored — not tracked in version control. Legacy artifacts from older runs (`concept-pitch.md`, root `gcd.md`, `prototype/index.html`) may exist but are no longer part of the active pipeline.

**`.claude-plugin/` — Plugin identity:**
- Purpose: Claude Code plugin manifest and marketplace registration
- Key files:
  - `plugin.json` — Plugin name, version, author, MCP server config (Hindsight endpoint + auth)
  - `marketplace.json` — Marketplace listing metadata

## Key File Locations

**Entry Points (Slash Commands):** `commands/create.md`, `commands/iterate.md`, `commands/status.md`, `commands/setup.md`
**Plugin Manifest:** `.claude-plugin/plugin.json`: name, version, Hindsight MCP server config
**Permission Manifest:** `settings.json`: MCP tool allow-list for Hindsight operations
**Session Hook:** `hooks/hooks.json` → `scripts/plugin-setup.sh`
**Active early-pipeline skill:** `skills/game-prototype/SKILL.md`
**Agent Personas:** `agents/*.md`: one file per agent role
**Design References:** `references/`: all static templates and guides
**Skill Definitions:** `skills/{skill-name}/SKILL.md`
**Project Knowledge Base:** `AGENTS.md`: pipeline overview, conventions, anti-patterns, where to look
**Project Output:** `projects/{project-name}/`: generated artifacts per game project; the active early-pipeline output sits under `projects/{project-name}/Game Demo/`

## Naming Conventions

**Files:** kebab-case (e.g., `mockup-designer.md`, `wireframe-overview-guide.md`)
**Directories:** kebab-case (e.g., `game-ui-ux-guide/`, `game-design-kit/`)
**Project directories:** kebab-case derived from game idea (e.g., `projects/casual-puzzle-garden/`)
**Agent frontmatter `name`:** kebab-case matching filename (e.g., `name: mockup-designer`)
**Skill frontmatter `name`:** kebab-case matching directory (e.g., `name: game-prototype`)
**Active design docs in projects:**
- Lightweight GCD: `Game Demo/[slug]-GCD.md` (Vietnamese, derived 1:1 from approved playable prototype)
- Versioned playable prototype: `Game Demo/[slug]-vN.html` (never overwritten across iterations)
- Mockup: `mockup.html`. Wireframe: `wireframe.html`. Detail docs: kebab-case markdown.
- Legacy artifacts (`concept-pitch.md`, root `gcd.md`, `prototype/index.html`) may still exist on older project runs but are no longer produced by the active pipeline.

## Where to Add New Code

**New slash command:** `commands/{command-name}.md` — add YAML frontmatter + step-by-step pipeline; register in `.claude-plugin/plugin.json` if needed
**New T2 Producer agent:** `agents/{role-name}.md` — follow existing agent structure (YAML frontmatter + tier designation + input requirements + output conventions); reference from `commands/create.md` after the `game-prototype` skill output stage
**New T3 Reviewer agent:** `agents/{reviewer-name}.md` — include evaluation criteria + scoring; invoke after corresponding T2 producer in `commands/create.md`
**New skill package:** `skills/{skill-name}/SKILL.md` + `skills/{skill-name}/references/` — follow trigger-keyword table pattern from existing skills. To extend the early-pipeline behavior instead, edit `skills/game-prototype/SKILL.md` (do not create a parallel competing skill).
**New design reference:** `references/{reference-name}.md` — update the relevant agent's input requirements list to include the new reference
**New pipeline step (in create):** Add numbered step block in `commands/create.md` following the `📍 Step N:` announcement format with AskUserQuestion approval gate
**New design document type (in iterate):** Add row to the downstream impact table in `commands/iterate.md`
