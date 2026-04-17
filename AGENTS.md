# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-16
**Branch:** master

## OVERVIEW

Claude Code plugin: AI game design pipeline (Concept > Prototype > Feedback > Documents). Agents organized in a 3-tier hierarchy (Director → Producers → Reviewers). Knowledge via Hindsight MCP (recall/reflect/retain).

## AGENT HIERARCHY

3-tier structure:

**T1 Director**
- `creative-director` — Orchestrates the full pipeline; delegates to Producers and Reviewers

**T2 Producers**
- `concept-designer` — Generates Concept Pitch and GCD
- `code-prototyper` — Generates HTML5 prototype (`index.html`)
- `wireframe-designer` — Generates wireframe (`wireframe.html`)
- `document-writer` — Writes detail design documents
- `market-researcher` — Produces market research report

**T3 Reviewers**
- `review-concept` — Quality-checks Concept Pitch and GCD
- `ui-ux-reviewer` — Reviews `ui-ux-spec.md` and `art-direction.md`
- `detail-doc-reviewer` — Reviews all other detail documents
- `feedback-interpreter` — Interprets and structures user feedback

## STRUCTURE

```
./
├── commands/                  # Slash commands: create, iterate, status, setup
├── agents/                    # Role agents: creative-director, concept-designer, code-prototyper, wireframe-designer, etc.
│   └── (3-tier hierarchy: T1 Director + T2 Producers + T3 Reviewers)
├── skills/                    # Skill packages: game-concept-design, game-knowledge, game-ui-ux-guide
├── references/                # Design templates + theory references + UI/UX & review guides
├── projects/                  # Generated game projects (gitignored output)
├── docs/                      # Architecture docs, pipeline plans
├── scripts/                   # plugin-setup.sh
├── hooks/                     # SessionStart hook → plugin-setup.sh
├── .claude-plugin/            # plugin.json + marketplace.json
└── settings.json              # Plugin permission manifest
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add slash command | `commands/` | Markdown file, referenced by `.claude-plugin/plugin.json` |
| Add agent role | `agents/` | Markdown persona, invoked by commands |
| Add/modify UI/UX review | `agents/ui-ux-reviewer.md` + `skills/game-ui-ux-guide/` | Read-only review agent for `ui-ux-spec.md` + `art-direction.md`; all references consolidated in root `references/` |
| Modify document writer behavior | `agents/document-writer.md` | Behavior-driven writing uses `references/gui-section-guide.md` and `references/gameplay-section-guide.md` |
| Review concept quality | `agents/review-concept.md` | Criteria + template: `references/concept-evaluation-criteria.md`, `references/concept-review-template.md` |
| Review GDD quality | `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md` | Use to assess GDD structure, coverage, and review output |
| Modify concept/pitch | `agents/concept-designer.md` | Generates Concept Pitch + GCD |

## CONVENTIONS

- **Files**: kebab-case. **Classes**: PascalCase. **Functions**: camelCase.
- **Design docs**: `gcd.md` must be written in **Vietnamese**.
- **Concept Pitch**: Structured concept document (`concept-pitch.md`). Generated in Step 4 of create pipeline. Core design reference for all downstream artifacts.
- **Prototypes**: Single `index.html` per project. Vanilla JS, geometric placeholders.
- **Knowledge**: Served via Hindsight MCP (`game-knowledge` bank). No local knowledge processing.

## ANTI-PATTERNS (THIS PROJECT)

- **No framework deps in prototypes**. Canvas API or Three.js CDN only.
- **Never remove mechanics** from Concept Pitch or GCD unless user explicitly requests.
- **Never auto-apply feedback changes** — show diff preview first.

## UNIQUE STYLES

- Commands and agents defined as **markdown files**, not code.
- Plugin uses `${CLAUDE_PLUGIN_ROOT}` env var for path resolution.
- Knowledge served via **Hindsight MCP** at `https://hindsight-api.zingplay.dev/mcp/game-knowledge/`. Agents use `recall`/`reflect`/`retain`.

## NOTES

- `HINDSIGHT_API_KEY` required — must be set in shell environment before launching Claude Code. `scripts/plugin-setup.sh` warns if missing at session start.
- No CI/CD pipeline, no Docker, no linter config.
- No pre-commit hooks.
- Pipeline docs and references for UI/UX review and GDD/concept evaluation: `references/gui-section-guide.md`, `references/gameplay-section-guide.md`, `references/concept-evaluation-criteria.md`, `references/concept-review-template.md`, `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md`.
