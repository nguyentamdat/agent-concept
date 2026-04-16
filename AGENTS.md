# PROJECT KNOWLEDGE BASE

**Generated:** 2026-04-09
**Commit:** (pre-release)
**Branch:** master

## OVERVIEW

Claude Code plugin: AI game design pipeline (Concept > Prototype > Feedback > Documents). Agents organized in a 3-tier hierarchy (Director → Producers → Reviewers). Knowledge via Hindsight MCP (recall/reflect/retain). MCP server for prototypes + projects.

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
├── packages/
│   ├── knowledge-layer/      # Knowledge layer library (TypeScript)
│   │   ├── package.json       # name="knowledge-layer", workspace package
│   │   ├── tsconfig.json
│   │   ├── tsconfig.build.json
│   │   ├── fixtures/           # Test fixtures (7 formats)
│   │   └── src/
│   │       ├── knowledge.ts    # Core KnowledgeTool class — main public API
│   │       ├── index.ts        # Public exports barrel
│   │       ├── cli.ts          # CLI entry (commander)
│   │       ├── parse/          # Multi-format doc parsing (PDF/DOCX/MD/TXT/CSV/JSON/YAML)
│   │       ├── normalise/      # Text normalization + citation building
│   │       ├── chunk/          # BM25-optimized chunking (~400-600 tokens, FNV hash IDs)
│   │       ├── index/          # Search: orama BM25, focused retrieval, deep retrieval
│   │       ├── graph/          # Knowledge graph: entities, relations, dedup (Jaccard >= 0.7)
│   │       ├── extract/        # Extraction: rule-based + LLM-powered (batched, retry)
│   │       ├── api/            # High-level: document views, feature design context
│   │       ├── eval/           # Eval framework: golden dataset, recall/MRR/NDCG metrics
│   │       ├── types/          # Zod schemas for all data types
│   │       └── test-utils/     # FakeIndex, mock LLM helpers
│   └── mcp-server/            # MCP server — separate package (see packages/mcp-server/AGENTS.md)
│       ├── package.json       # depends on knowledge-layer via workspace:*
│       ├── tsconfig.json
│       └── src/
├── commands/                  # Slash commands (markdown definitions for Claude Code)
├── agents/                    # Role agents: creative-director, concept-designer, code-prototyper, wireframe-designer, etc.
│   └── (3-tier hierarchy: T1 Director + T2 Producers + T3 Reviewers)
├── skills/                    # Skill packages: game-concept-design, game-knowledge, game-ui-ux-guide
├── references/                # Design templates + theory references + UI/UX & review guides
├── knowledge/                 # Source PDFs (5 books)
├── templates/                 # HTML5 prototype templates (Canvas/Three.js)
├── projects/                  # Generated game projects (gitignored output)
├── docs/                      # Architecture docs, pipeline plans
├── scripts/                   # setup-knowledge.ts, plugin-setup.sh, push-knowledge.py
├── hooks/                     # SessionStart hook → plugin-setup.sh
├── .claude-plugin/            # plugin.json + marketplace.json
├── package.json               # Workspace root (npm workspaces)
└── settings.json              # Plugin permission manifest
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/modify search behavior | `packages/knowledge-layer/src/index/` | `orama-index.ts` (BM25), `focused-retrieval.ts` (graph expansion), `deep-retrieval.ts` (LLM decomposition) |
| Add document format | `packages/knowledge-layer/src/parse/` | One file per format, returns `SourceDocument` + `DocumentStructureNode[]` |
| Modify graph extraction | `packages/knowledge-layer/src/graph/graph-builder.ts` | LLM batched extraction; dedup in `dedup.ts` (Jaccard >= 0.7) |
| Add MCP tool | `packages/mcp-server/src/tools/` | Register in `packages/mcp-server/src/server.ts`, add to `settings.json` allowlist |
| Add slash command | `commands/` | Markdown file, referenced by `.claude-plugin/plugin.json` |
| Add agent role | `agents/` | Markdown persona, invoked by commands |
| Add/modify UI/UX review | `agents/ui-ux-reviewer.md` + `skills/game-ui-ux-guide/` | Read-only review agent for `ui-ux-spec.md` + `art-direction.md`; all references consolidated in root `references/` |
| Modify document writer behavior | `agents/document-writer.md` | Behavior-driven writing uses `references/gui-section-guide.md` and `references/gameplay-section-guide.md` |
| Review concept quality | `agents/review-concept.md` | Criteria + template: `references/concept-evaluation-criteria.md`, `references/concept-review-template.md` |
| Review GDD quality | `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md` | Use to assess GDD structure, coverage, and review output |
| Add test fixtures | `packages/knowledge-layer/src/test-utils/` | `document-fixtures.ts`, `chunk-fixtures.ts`, `citation-fixtures.ts` |
| Modify concept/pitch | `agents/concept-designer.md` | Generates Concept Pitch + GCD |
| Prototype templates | `templates/` | Vanilla JS, Canvas API or Three.js CDN |

## CONVENTIONS

- **Runtime**: Node.js. Scripts use `npm run`, `npx tsx` for TypeScript execution.
- **Module system**: ESM (`"type": "module"` in package.json). npm workspaces monorepo.
- **Files**: kebab-case. **Classes**: PascalCase. **Functions**: camelCase.
- **Tests**: Co-located `*.test.ts` alongside source. Uses `vitest` — no external framework.
- **Validation**: Zod schemas for all data types. Strict TypeScript (`"strict": true`).
- **Search**: `search()` is sync (BM25 in-memory). `deepSearch()` is async (requires LLM).
- **Graph**: Opt-in via `buildGraph(llm)`. Focused search degrades to lexical without graph.
- **LLM**: BYOLLM via `LLMProvider` interface (`{ chat(messages): Promise<string> }`). Library bundles no LLM SDK.
- **Design docs**: `gcd.md` and `gcd-gameplay.md` must be written in **Vietnamese**.
- **Concept Pitch**: Structured concept document (`concept-pitch.md`). Generated in Step 4 of create pipeline. Core design reference for all downstream artifacts.
- **Prototypes**: Single `index.html` per project. Vanilla JS, geometric placeholders.
- **Dependencies**: All `"latest"` — no pinned versions.

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any` / `@ts-ignore`**. Use proper typing or Zod.
- **No framework deps in prototypes**. Canvas API or Three.js CDN only.
- **No Bun-specific APIs**. Use Node.js standard library only.
- **Never remove mechanics** from Concept Pitch or GCD unless user explicitly requests.
- **Never auto-apply feedback changes** — show diff preview first.
- **Never auto-apply feedback changes** — show diff preview first.
- Existing unsafe `as unknown as` cast in `packages/mcp-server/src/tools/knowledge.ts:43` — known tech debt, do not replicate.

## UNIQUE STYLES

- Commands and agents defined as **markdown files**, not code.
- Plugin uses `${CLAUDE_PLUGIN_ROOT}` env var for path resolution.
- Knowledge served via **Hindsight MCP** at `https://hindsight.zingplay.dev/mcp/game-knowledge/`. Agents use `recall`/`reflect`/`retain`.
- Game design ontology: 9 entity types, 9 relation types (see `packages/knowledge-layer/src/graph/types.ts`).
- Mock LLM pattern in tests: `{ chat: async () => jsonString }`.
- Fixtures cover all 7 doc formats with factories: `getDocumentFixtureByType()`, `getAllChunkFixtures()`.

## COMMANDS

```bash
npm run setup              # Full install + knowledge base ingestion
npm run setup:knowledge    # Ingest PDFs only
npm test                   # 281 tests (vitest, co-located *.test.ts)
npm run typecheck          # tsc --noEmit
npm run build              # tsup (ESM) + tsc declarations
npm run mcp                # Start MCP server locally
npm run cli                # Run CLI tool
```

## NOTES

- Monorepo with npm workspaces. `packages/knowledge-layer` and `packages/mcp-server` are workspace packages. `npm install` at root installs all deps.
- MCP server depends on knowledge-layer via npm workspace resolution.
- YAML comments are **not preserved** after parsing (`packages/knowledge-layer/src/parse/yaml.ts` — known limitation).
- Knowledge layer (`packages/knowledge-layer`) and MCP server (`packages/mcp-server`) still exist but agents now use **Hindsight MCP** for knowledge operations. The `game-design-kit` MCP provides prototype + project tools only.
- `HINDSIGHT_API_KEY` required — stored in `.env`, loaded by `scripts/plugin-setup.sh` at session start.
- No CI/CD pipeline, no Docker, no linter config. Testing is manual via `npm test`.
- No pre-commit hooks.
- Added pipeline docs and references for UI/UX review and GDD/concept evaluation: `references/gui-section-guide.md`, `references/gameplay-section-guide.md`, `references/concept-evaluation-criteria.md`, `references/concept-review-template.md`, `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md`.
