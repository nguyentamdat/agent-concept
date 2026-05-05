# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-21
**Updated:** 2026-05-05 (prototype-first pipeline replacement)
**Branch:** master

## OVERVIEW

Claude Code plugin: AI game design pipeline. Pipeline is **prototype-first**: an idea is taken end-to-end through the `game-prototype` skill (concept brainstorm → versioned playable HTML5 prototype → Vietnamese lightweight GCD), then the approved prototype + lightweight GCD feed downstream producers (mockup with component picker → wireframe overview → feedback gate → detail docs). Knowledge via Hindsight MCP (recall/reflect/retain).

## AGENT HIERARCHY

3-tier structure plus an early-pipeline skill:

**T1 Director**
- `creative-director` — Orchestrates the full pipeline; delegates to the `game-prototype` skill, T2 Producers, and T3 Reviewers.

**Early-pipeline skill (active)**
- `game-prototype` (`skills/game-prototype/SKILL.md`) — Owns Phase 1 (idea + audience + problem statement + 8 KoF + 3 gameplay options + 3 mini concept prototypes + audits + Gate 1), Phase 2 (versioned full playable prototype `Game Demo/[slug]-vN.html` + iteration + Gate 2), and Phase 3 (Vietnamese lightweight GCD `Game Demo/[slug]-GCD.md`).

**T2 Producers**
- `mockup-designer` — Generates high-fidelity interactive mockup for all screens (`mockup.html`) with embedded **dom-grab** component picker (CDN) for user-driven component feedback. Reads approved `Game Demo/[slug]-vN.html` + `[slug]-GCD.md` as ground truth.
- `wireframe-designer` — Generates single-page wireframe overview (`wireframe.html`) as interactive flowchart: screens as boxes, SVG wires for navigation, click-to-expand detail panels with full component spec (ID / type / states / actions / data bindings). Wireframe must be 1:1 synced with `mockup.html`; pulls additional context from `Game Demo/[slug]-GCD.md` and `[slug]-vN.html`.
- `document-writer` — Writes detail design documents from approved `Game Demo/[slug]-GCD.md` + `[slug]-vN.html`; `ui-ux-spec.md` additionally references `mockup.html` + `wireframe.html` as ground truth (no re-invention).
- `market-researcher` — Produces market research report. Findings feed into `game-prototype` Phase 1.

**T3 Reviewers**
- `ui-ux-reviewer` — Reviews `mockup.html`, `wireframe.html`, `ui-ux-spec.md`, and `art-direction.md` against the lightweight GCD + approved prototype.
- `detail-doc-reviewer` — Reviews the 7 detail design documents against the lightweight GCD + approved prototype.
- `feedback-interpreter` — Interprets and structures user feedback; routes prototype/concept/balance feedback to `game-prototype`, mockup-only to `mockup-designer`, wireframe-only to `wireframe-designer`, doc-only to `document-writer`.

**Legacy / manual helpers (not in active routing)**
- `concept-designer`, `code-prototyper`, `review-concept` — Preserved in `agents/` but not invoked by `/design-kit:create` after the prototype-first replacement.
- `skills/_deprecated/game-concept-design/` — Archived skill; replaced by `game-prototype`.

## STRUCTURE

```
./
├── commands/                  # Slash commands: create, iterate, status, setup
├── agents/                    # Role agents (T1 Director + T2 Producers + T3 Reviewers + legacy helpers)
│   └── (active routing covers: creative-director, mockup-designer, wireframe-designer, document-writer, market-researcher, ui-ux-reviewer, detail-doc-reviewer, feedback-interpreter)
├── skills/                    # Skill packages
│   ├── game-prototype/        # Active prototype-first early-pipeline skill (Phase 1+2+3)
│   ├── game-knowledge/        # Hindsight MCP auto-search behavioral skill
│   ├── game-ui-ux-guide/      # Mobile game UI/UX knowledge skill
│   └── _deprecated/
│       └── game-concept-design/   # Archived; replaced by game-prototype
├── references/                # Design templates + theory references + UI/UX & review guides
├── projects/                  # Generated game projects (gitignored output)
│   └── {project-name}/
│       └── Game Demo/         # Output root for the game-prototype skill: [slug]-concept-{A|B|C}.html, [slug]-vN.html, [slug]-GCD.md
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
| Modify early-pipeline (concept brainstorm + playable prototype + lightweight GCD) | `skills/game-prototype/SKILL.md` + `skills/game-prototype/references/` | Active prototype-first workflow; owns `Game Demo/[slug]-concept-*.html`, `Game Demo/[slug]-vN.html`, `Game Demo/[slug]-GCD.md` |
| Add/modify UI/UX review | `agents/ui-ux-reviewer.md` + `skills/game-ui-ux-guide/` | Read-only review agent for `mockup.html`, `wireframe.html`, `ui-ux-spec.md`, `art-direction.md`; criteria in `references/` |
| Modify mockup generation | `agents/mockup-designer.md` + `references/mockup-review-criteria.md` | High-fi mockup with dom-grab component picker integration; reads `Game Demo/[slug]-vN.html` + `[slug]-GCD.md` |
| Modify wireframe generation | `agents/wireframe-designer.md` + `references/wireframe-overview-guide.md` | Single-page flowchart + component spec panels, 1:1 synced with mockup |
| Modify document writer behavior | `agents/document-writer.md` | Behavior-driven writing uses `references/gui-section-guide.md` and `references/gameplay-section-guide.md`; reads `Game Demo/[slug]-GCD.md` + `[slug]-vN.html`; `ui-ux-spec.md` additionally pulls from `mockup.html` + `wireframe.html` |
| Modify feedback routing | `agents/feedback-interpreter.md` | Routes balance/structural feedback to `game-prototype`, mockup-only to `mockup-designer`, wireframe-only to `wireframe-designer`, doc-only to `document-writer` |
| Modify the create pipeline | `commands/create.md` | Step 0 setup → Step 1 game-prototype skill (Phase 1+2+3) → Step 2 mockup → Step 3 wireframe → Step 4 feedback gate → Step 5+6 detail docs |
| Modify the iterate pipeline | `commands/iterate.md` | Same routing rules as feedback-interpreter |
| Restore legacy concept-design flow | `agents/concept-designer.md`, `agents/code-prototyper.md`, `agents/review-concept.md`, `skills/_deprecated/game-concept-design/` | Preserved for manual invocation; not on the active create route |

## CONVENTIONS

- **Files**: kebab-case. **Classes**: PascalCase. **Functions**: camelCase.
- **Lightweight GCD**: `projects/{project-name}/Game Demo/[slug]-GCD.md` must be written in **Vietnamese**, following `skills/game-prototype/references/gcd-output-template.md`. Sections derived directly from the approved `Game Demo/[slug]-vN.html` (no invented mechanics).
- **Versioned playable prototype**: `projects/{project-name}/Game Demo/[slug]-vN.html`. Each iteration writes a new version (`-v2.html`, `-v3.html`, …). **Never overwrite** older versions. Highest N is the current "approved" version.
- **Mini concept prototypes**: `projects/{project-name}/Game Demo/[slug]-concept-{A|B|C}.html`, ~300-500 lines each, written by `game-prototype` Phase 1 step 5b for user playtest comparison before picking 1 option.
- **Mockup**: Single `mockup.html` per project. Vanilla JS + `<script src="https://unpkg.com/dom-grab">` for component picker. All screens, high-fi visual, mobile viewport 390×844, sidebar nav. Every component has `data-component` attribute for picker context.
- **Wireframe Overview**: Single `wireframe.html` per project. Vanilla JS + inline SVG. Single-page flowchart of all screens with navigation wires + click-to-expand component detail panels. 1:1 synced with mockup (no ghost screens/components).
- **Pipeline ordering**: Step 0 setup + optional market research → Step 1 `game-prototype` skill (Phase 1 → Phase 2 with approval gate → Phase 3 with approval gate) → Step 2 Mockup → approve → Step 3 Wireframe → approve → Step 4 Feedback Gate → Step 5 detail-doc selection → Step 6 detail-doc generation.
- **Knowledge**: Served via Hindsight MCP (`game-knowledge` bank). No local knowledge processing.

## ANTI-PATTERNS (THIS PROJECT)

- **No framework deps in prototypes**. The `game-prototype` skill writes vanilla HTML/CSS/JS only (Canvas API or Three.js CDN allowed inside the prototype if the mechanic requires it).
- **No framework deps in mockup/wireframe** beyond `dom-grab` (mockup only, for picker). Vanilla JS + inline CSS/SVG.
- **Mockup MUST include component picker**. Mockup without `dom-grab` + `data-component` attrs is auto-REJECT.
- **Wireframe MUST be 1:1 with mockup**. Wireframe that invents screens or components not present in `mockup.html` is auto-REJECT.
- **Never overwrite an existing `Game Demo/[slug]-vN.html`**. Iteration always writes a new `[slug]-vN+1.html`.
- **Never invent mechanics in the lightweight GCD** that are not present in the approved `Game Demo/[slug]-vN.html`. The GCD is a 1:1 derivative of the playable file plus Phase 1 conversation context.
- **Never auto-apply feedback changes** — show diff preview first.
- **Never route active create/iterate work through legacy agents** (`concept-designer`, `code-prototyper`, `review-concept`) — those exist only for manual invocation.

## UNIQUE STYLES

- Commands and agents defined as **markdown files**, not code.
- Plugin uses `${CLAUDE_PLUGIN_ROOT}` env var for path resolution.
- Knowledge served via **Hindsight MCP** at `https://hindsight-api.zingplay.dev/mcp/game-knowledge/`. Agents use `recall`/`reflect`/`retain`.
- Early-pipeline phases owned by a single **skill** (`game-prototype`) rather than chained agents — keeps brainstorm + playable spike + lightweight GCD coherent inside one workflow.

## NOTES

- `HINDSIGHT_API_KEY` required — must be set in shell environment before launching Claude Code. `scripts/plugin-setup.sh` warns if missing at session start.
- No CI/CD pipeline, no Docker, no linter config.
- No pre-commit hooks.
- Pipeline references: `references/gui-section-guide.md`, `references/gameplay-section-guide.md`, `references/mockup-review-criteria.md`, `references/wireframe-overview-guide.md`, plus `skills/game-prototype/references/*` for the early-pipeline workflow (problem statement, 8 kinds of fun, gameplay suggestion rules, decisions guideline, decision-quality / experience-alignment / genre-faithfulness audits, prototype HTML template, GCD output template).
- The previous concept-design references (`concept-evaluation-criteria.md`, `concept-review-template.md`, `gdd-evaluation-criteria.md`, `gdd-expected-sections.md`, `gdd-review-template.md`) remain in `references/` for manual review use; they are no longer part of the active `/design-kit:create` route.
- Migration plan: `.omx/plans/replace-game-concept-design-by-game-prototype.md`.
