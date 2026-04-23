# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-21
**Branch:** master

## OVERVIEW

Claude Code plugin: AI game design pipeline (Concept → Prototype → Mockup (with component picker) → Wireframe Overview → Feedback → Detail Docs). Agents organized in a 3-tier hierarchy (Director → Producers → Reviewers). Knowledge via Hindsight MCP (recall/reflect/retain).

## AGENT HIERARCHY

3-tier structure:

**T1 Director**
- `creative-director` — Orchestrates the full pipeline; delegates to Producers and Reviewers

**T2 Producers**
- `concept-designer` — Generates Concept Pitch and GCD
- `code-prototyper` — Generates playable HTML5 prototype (`prototype/index.html`)
- `mockup-designer` — Generates high-fidelity interactive mockup for all screens (`mockup.html`) with embedded **dom-grab** component picker (CDN) for user-driven component feedback
- `wireframe-designer` — Generates single-page wireframe overview (`wireframe.html`) as interactive flowchart: screens as boxes, SVG wires for navigation, click-to-expand detail panels with full component spec (ID / type / states / actions / data bindings). Wireframe must be 1:1 synced with mockup.
- `document-writer` — Writes detail design documents; `ui-ux-spec.md` now references `mockup.html` + `wireframe.html` as ground truth (no re-invention)
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
├── agents/                    # Role agents: creative-director, concept-designer, code-prototyper, mockup-designer, wireframe-designer, document-writer, market-researcher, ui-ux-reviewer, detail-doc-reviewer, feedback-interpreter, review-concept
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
| Add/modify UI/UX review | `agents/ui-ux-reviewer.md` + `skills/game-ui-ux-guide/` | Read-only review agent for `mockup.html`, `wireframe.html`, `ui-ux-spec.md`, `art-direction.md`; all references consolidated in root `references/` |
| Modify mockup generation | `agents/mockup-designer.md` + `references/mockup-review-criteria.md` | High-fi mockup with dom-grab component picker integration |
| Modify wireframe generation | `agents/wireframe-designer.md` + `references/wireframe-overview-guide.md` | Single-page flowchart + component spec panels, 1:1 synced with mockup |
| Modify document writer behavior | `agents/document-writer.md` | Behavior-driven writing uses `references/gui-section-guide.md` and `references/gameplay-section-guide.md`; `ui-ux-spec.md` pulls from `mockup.html` + `wireframe.html` |
| Review concept quality | `agents/review-concept.md` | Criteria + template: `references/concept-evaluation-criteria.md`, `references/concept-review-template.md` |
| Review GDD quality | `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md` | Use to assess GDD structure, coverage, and review output |
| Modify concept/pitch | `agents/concept-designer.md` | Generates Concept Pitch + GCD |

## CONVENTIONS

- **Files**: kebab-case. **Classes**: PascalCase. **Functions**: camelCase.
- **Design docs**: `gcd.md` must be written in **Vietnamese**.
- **Concept Pitch**: Structured concept document (`concept-pitch.md`). Generated in Step 4 of create pipeline. Core design reference for all downstream artifacts.
- **Prototypes**: Single `prototype/index.html` per project. Vanilla JS, geometric placeholders. Playable, tests mechanic.
- **Mockup**: Single `mockup.html` per project. Vanilla JS + `<script src="https://unpkg.com/dom-grab">` for component picker. All screens, high-fi visual, mobile viewport 390×844, sidebar nav. Every component has `data-component` attribute for picker context.
- **Wireframe Overview**: Single `wireframe.html` per project. Vanilla JS + inline SVG. Single-page flowchart of all screens with navigation wires + click-to-expand component detail panels. 1:1 synced with mockup (no ghost screens/components).
- **Pipeline ordering** (Steps 6-8): Prototype → approve → Mockup → approve → Wireframe → approve → Feedback Gate → Detail Docs.
- **Knowledge**: Served via Hindsight MCP (`game-knowledge` bank). No local knowledge processing.

## ANTI-PATTERNS (THIS PROJECT)

- **No framework deps in prototypes**. Canvas API or Three.js CDN only.
- **No framework deps in mockup/wireframe** beyond `dom-grab` (mockup only, for picker). Vanilla JS + inline CSS/SVG.
- **Mockup MUST include component picker**. Mockup without `dom-grab` + `data-component` attrs is auto-REJECT.
- **Wireframe MUST be 1:1 with mockup**. Wireframe that invents screens or components not present in `mockup.html` is auto-REJECT.
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
- Pipeline references: `references/gui-section-guide.md`, `references/gameplay-section-guide.md`, `references/concept-evaluation-criteria.md`, `references/concept-review-template.md`, `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md`, `references/mockup-review-criteria.md`, `references/wireframe-overview-guide.md`.
