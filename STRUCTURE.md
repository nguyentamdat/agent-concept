# Codebase Structure

## Directory Layout

```
game-design-kit/
├── .claude-plugin/         # Plugin identity and marketplace metadata
│   ├── plugin.json         # Plugin manifest: name, version, MCP server config
│   └── marketplace.json    # Marketplace declaration for Claude Code plugin store
├── agents/                 # Agent persona definitions (markdown, 3-tier hierarchy)
├── commands/               # Slash command definitions (markdown pipeline steps)
├── skills/                 # Skill packages (behavioral knowledge modules)
│   ├── game-concept-design/    # GCD methodology skill (Phase A→B workflow)
│   ├── game-knowledge/         # Hindsight MCP auto-search behavioral skill
│   └── game-ui-ux-guide/       # Mobile game UI/UX knowledge skill
├── references/             # Static design templates, theory references, review guides
├── hooks/                  # Claude Code session hooks config
│   └── hooks.json          # SessionStart hook → plugin-setup.sh
├── scripts/                # Installation and setup scripts
│   ├── plugin-setup.sh     # SessionStart env check (warns if HINDSIGHT_API_KEY missing)
│   ├── install.sh          # Bash installer (copies plugin to ~/.claude/plugins/)
│   ├── gist-install.sh     # Remote install from GitHub Gist (Linux/macOS)
│   └── gist-install.ps1    # Remote install from GitHub Gist (Windows PowerShell)
├── projects/               # Generated game project output (gitignored)
├── docs/                   # Internal architecture docs and drafts
│   └── archive/            # Archived planning documents
├── AGENTS.md               # Project knowledge base (pipeline overview, conventions)
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

**`agents/` — Agent personas (T1 Director, T2 Producers, T3 Reviewers):**
- Purpose: Each file defines a specialized AI agent with a role, persona, tool permissions, and operating procedures
- Contains: Markdown files with YAML frontmatter (`name`, `description`, `model`, `color`, `tools`) + behavioral instructions
- Key files:
  - `creative-director.md` — T1 Director; orchestrates the pipeline, holds vision, quality gate authority
  - `concept-designer.md` — T2; generates `concept-pitch.md` and `gcd.md` (Vietnamese)
  - `code-prototyper.md` — T2; generates `prototype/index.html` (vanilla JS, Canvas/Three.js CDN)
  - `mockup-designer.md` — T2; generates `mockup.html` (high-fi, all screens, dom-grab component picker)
  - `wireframe-designer.md` — T2; generates `wireframe.html` (flowchart + component spec panels, 1:1 synced with mockup)
  - `document-writer.md` — T2; generates detail design documents
  - `market-researcher.md` — T2; produces market research report
  - `review-concept.md` — T3; quality-checks Concept Pitch and GCD
  - `ui-ux-reviewer.md` — T3; reviews `ui-ux-spec.md`, `art-direction.md`, `mockup.html`, `wireframe.html`
  - `detail-doc-reviewer.md` — T3; reviews all other detail documents
  - `feedback-interpreter.md` — T3; interprets and structures user feedback into actionable changes

**`commands/` — Slash command pipeline definitions:**
- Purpose: User-facing workflows implemented as ordered steps with approval gates and agent invocations
- Contains: Markdown files with YAML frontmatter (`description`, `argument-hint`) + numbered step instructions
- Key files:
  - `create.md` — Full 11-step pipeline (idea → concept → GCD → prototype → mockup → wireframe → docs)
  - `iterate.md` — Feedback-driven update flow with diff preview before any file changes
  - `status.md` — Project artifact checklist + pipeline stage + Hindsight MCP stats
  - `setup.md` — Plugin version check, update from GitHub releases, diagnostics

**`skills/` — Behavioral skill packages:**
- Purpose: Reusable knowledge retrieval and methodology modules loaded by agents on demand
- Contains: `SKILL.md` (skill definition + trigger rules) and `references/` subfolder per skill
- Key files:
  - `game-knowledge/SKILL.md` — Auto-invokes `mcp__hindsight__recall` when game design topics appear
  - `game-concept-design/SKILL.md` — 2-phase GCD workflow (Phase A: brainstorm+pitch; Phase B: full GCD)
  - `game-ui-ux-guide/SKILL.md` — Mobile game UI/UX knowledge: review criteria, screen checklists, art style guide

**`references/` — Static design knowledge (read-only):**
- Purpose: Templates, evaluation criteria, theory references, and review guides consumed by agents and skills
- Contains: Markdown files; no executable logic
- Key files:
  - `gcd-template.md`, `gcd-gameplay-template.md` — GCD document templates
  - `concept-evaluation-criteria.md`, `concept-review-template.md` — Concept review standards
  - `gdd-evaluation-criteria.md`, `gdd-expected-sections.md`, `gdd-review-template.md` — GDD review standards
  - `mockup-review-criteria.md` — Mockup acceptance/rejection criteria (includes dom-grab requirement)
  - `wireframe-overview-guide.md` — Wireframe flowchart layout spec and component panel schema
  - `gui-section-guide.md`, `gameplay-section-guide.md` — Section guides for document-writer
  - `art-style-guide.md` — Visual style and art direction reference
  - `review-checklist.md`, `screen-checklists.md` — UI/UX review checklists
  - `game-design-theories.md`, `theory-knowledge-base.md` — Game design theory references
  - `mechanic-list.md` — Reference mechanic patterns
  - `phase-a-outline-template.md` — Concept pitch Phase A outline template

**`hooks/` — Session lifecycle hooks:**
- Purpose: Declares Claude Code hooks that run at session events
- Contains: `hooks.json` mapping `SessionStart` to `scripts/plugin-setup.sh`

**`scripts/` — Installation and environment scripts:**
- Purpose: Install/uninstall the plugin; check environment at session start
- Key files:
  - `plugin-setup.sh` — SessionStart hook; warns if `HINDSIGHT_API_KEY` is unset
  - `install.sh` / `uninstall.sh` — Copy/remove plugin files to `~/.claude/plugins/`
  - `gist-install.sh` / `gist-install.ps1` — Remote install from GitHub Gist (one-liner install)

**`projects/` — Generated output (gitignored):**
- Purpose: Stores all generated game design artifacts; one subdirectory per game project
- Contains: `{project-name}/concept-pitch.md`, `gcd.md`, `prototype/index.html`, `mockup.html`, `wireframe.html`, and selected detail docs
- Note: Gitignored — not tracked in version control

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
**Agent Personas:** `agents/*.md`: one file per agent role
**Design References:** `references/`: all static templates and guides
**Skill Definitions:** `skills/{skill-name}/SKILL.md`
**Project Knowledge Base:** `AGENTS.md`: pipeline overview, conventions, anti-patterns, where to look
**Project Output:** `projects/{project-name}/`: generated artifacts per game project

## Naming Conventions

**Files:** kebab-case (e.g., `concept-designer.md`, `wireframe-overview-guide.md`)
**Directories:** kebab-case (e.g., `game-ui-ux-guide/`, `game-design-kit/`)
**Project directories:** kebab-case derived from game idea (e.g., `projects/casual-puzzle-garden/`)
**Agent frontmatter `name`:** kebab-case matching filename (e.g., `name: mockup-designer`)
**Design docs in projects:** kebab-case (e.g., `concept-pitch.md`, `gcd.md`, `ui-ux-spec.md`)
**GCD documents:** always written in Vietnamese

## Where to Add New Code

**New slash command:** `commands/{command-name}.md` — add YAML frontmatter + step-by-step pipeline; register in `.claude-plugin/plugin.json` if needed
**New T2 Producer agent:** `agents/{role-name}.md` — follow existing agent structure (YAML frontmatter + tier designation + input requirements + output conventions); reference from `commands/create.md`
**New T3 Reviewer agent:** `agents/{reviewer-name}.md` — include evaluation criteria + scoring; invoke after corresponding T2 producer in `commands/create.md`
**New skill package:** `skills/{skill-name}/SKILL.md` + `skills/{skill-name}/references/` — follow trigger-keyword table pattern from existing skills
**New design reference:** `references/{reference-name}.md` — update the relevant agent's input requirements list to include the new reference
**New pipeline step (in create):** Add numbered step block in `commands/create.md` following the `📍 Step N:` announcement format with AskUserQuestion approval gate
**New design document type (in iterate):** Add row to the downstream impact table in `commands/iterate.md`
