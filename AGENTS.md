# PROJECT KNOWLEDGE BASE

**Generated:** 2026-03-31
**Commit:** 65abcdf
**Branch:** master

## OVERVIEW

Claude Code plugin: AI game design pipeline (Concept > Prototype > Feedback > Documents). Knowledge layer library (BM25 + knowledge graph) + MCP server exposing tools to Claude.

## STRUCTURE

```
./
├── src/                      # Knowledge layer library (TypeScript)
│   ├── knowledge.ts          # Core KnowledgeTool class — main public API
│   ├── index.ts              # Public exports barrel
│   ├── cli.ts                # CLI entry (commander)
│   ├── parse/                # Multi-format doc parsing (PDF/DOCX/MD/TXT/CSV/JSON/YAML)
│   ├── normalise/            # Text normalization + citation building
│   ├── chunk/                # BM25-optimized chunking (~400-600 tokens, FNV hash IDs)
│   ├── index/                # Search: orama BM25, focused retrieval, deep retrieval
│   ├── graph/                # Knowledge graph: entities, relations, dedup (Jaccard >= 0.7)
│   ├── extract/              # Extraction: rule-based + LLM-powered (batched, retry)
│   ├── api/                  # High-level: document views, feature design context
│   ├── eval/                 # Eval framework: golden dataset, recall/MRR/NDCG metrics
│   ├── types/                # Zod schemas for all data types
│   └── test-utils/           # Fixtures (7 formats), FakeIndex, mock LLM helpers
├── mcp-server/               # MCP server — separate package (see mcp-server/AGENTS.md)
├── commands/                  # Slash commands (markdown definitions for Claude Code)
├── agents/                    # Role agents: concept-designer, code-prototyper, ui-ux-reviewer, etc.
│   └── ui-ux-reviewer.md      # Read-only UI/UX review agent (ui-ux-spec.md + art-direction.md)
├── skills/                    # Skill packages: game-concept-design, game-knowledge, game-ui-ux
│   └── game-ui-ux/            # Skill package (SKILL.md + references/ subdirectory)
├── references/                # Design templates + theory references + UI/UX & review guides
├── knowledge/                 # Source PDFs (5 books) + test fixtures
├── templates/                 # HTML5 prototype templates (Canvas/Three.js)
├── projects/                  # Generated game projects (gitignored output)
├── docs/                      # Architecture docs, pipeline plans
├── scripts/                   # setup-knowledge.ts, plugin-setup.sh
├── hooks/                     # SessionStart hook → plugin-setup.sh
├── .claude-plugin/            # plugin.json + marketplace.json
└── settings.json              # Plugin permission manifest
```

## WHERE TO LOOK

| Task | Location | Notes |
|------|----------|-------|
| Add/modify search behavior | `src/index/` | `orama-index.ts` (BM25), `focused-retrieval.ts` (graph expansion), `deep-retrieval.ts` (LLM decomposition) |
| Add document format | `src/parse/` | One file per format, returns `SourceDocument` + `DocumentStructureNode[]` |
| Modify graph extraction | `src/graph/graph-builder.ts` | LLM batched extraction; dedup in `dedup.ts` (Jaccard >= 0.7) |
| Add MCP tool | `mcp-server/src/tools/` | Register in `mcp-server/src/server.ts`, add to `settings.json` allowlist |
| Add slash command | `commands/` | Markdown file, referenced by `.claude-plugin/plugin.json` |
| Add agent role | `agents/` | Markdown persona, invoked by commands |
| Add/modify UI/UX review | `agents/ui-ux-reviewer.md` + `skills/game-ui-ux/` | Read-only review agent for `ui-ux-spec.md` + `art-direction.md`; all references consolidated in root `references/` |
| Modify document writer behavior | `agents/document-writer.md` | Behavior-driven writing uses `references/gui-section-guide.md` and `references/gameplay-section-guide.md` |
| Review concept quality | `agents/review-concept.md` | Criteria + template: `references/concept-evaluation-criteria.md`, `references/concept-review-template.md` |
| Review GDD quality | `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md` | Use to assess GDD structure, coverage, and review output |
| Add test fixtures | `src/test-utils/` | `document-fixtures.ts`, `chunk-fixtures.ts`, `citation-fixtures.ts` |
| Modify spec schema | `mcp-server/src/tools/spec.ts` | `GameSpecSchema` Zod definition inline |
| Prototype templates | `templates/` | Vanilla JS, Canvas API or Three.js CDN |

## CONVENTIONS

- **Runtime**: Bun only (not Node.js). All scripts use `bun run`, `bun test`, `bun build`.
- **Module system**: ESM (`"type": "module"` in package.json).
- **Files**: kebab-case. **Classes**: PascalCase. **Functions**: camelCase.
- **Tests**: Co-located `*.test.ts` alongside source. Uses `bun:test` — no external framework.
- **Validation**: Zod schemas for all data types. Strict TypeScript (`"strict": true`).
- **Search**: `search()` is sync (BM25 in-memory). `deepSearch()` is async (requires LLM).
- **Graph**: Opt-in via `buildGraph(llm)`. Focused search degrades to lexical without graph.
- **LLM**: BYOLLM via `LLMProvider` interface (`{ chat(messages): Promise<string> }`). Library bundles no LLM SDK.
- **Design docs**: `gcd.md` and `gcd-gameplay.md` must be written in **Vietnamese**.
- **Spec format**: YAML (`spec.yaml`). Validate with `spec_validate` after every edit. Bump version on behavior changes.
- **Prototypes**: Single `index.html` per project. Vanilla JS, geometric placeholders.
- **Dependencies**: All `"latest"` — no pinned versions.

## ANTI-PATTERNS (THIS PROJECT)

- **No `as any` / `@ts-ignore`**. Use proper typing or Zod.
- **No framework deps in prototypes**. Canvas API or Three.js CDN only.
- **No Node.js APIs**. Use Bun equivalents.
- **Never remove mechanics** from spec unless user explicitly requests.
- **Never edit spec without bumping version** (`spec_bump_version`).
- **Never auto-apply feedback changes** — show diff preview first.
- Existing unsafe `as unknown as` cast in `mcp-server/src/tools/knowledge.ts:43` — known tech debt, do not replicate.

## UNIQUE STYLES

- Commands and agents defined as **markdown files**, not code.
- Plugin uses `${CLAUDE_PLUGIN_ROOT}` env var for path resolution.
- Knowledge cache persisted to `.knowledge-cache/` (index.json + graph.json).
- Game design ontology: 9 entity types, 9 relation types (see `src/graph/types.ts`).
- Mock LLM pattern in tests: `{ chat: async () => jsonString }`.
- Fixtures cover all 7 doc formats with factories: `getDocumentFixtureByType()`, `getAllChunkFixtures()`.

## COMMANDS

```bash
bun run setup              # Full install + knowledge base ingestion
bun run setup:knowledge    # Ingest PDFs only
bun test                   # 232 tests (bun:test, co-located *.test.ts)
bun run typecheck          # tsc --noEmit
bun run build              # bun build (ESM) + tsc declarations
bun run mcp                # Start MCP server locally
bun run cli                # Run CLI tool
```

## NOTES

- `mcp-server/` is a separate package with its own `package.json` and `bun.lock`. Root `postinstall` runs `cd mcp-server && bun install`.
- YAML comments are **not preserved** after parsing (`src/parse/yaml.ts` — known limitation).
- `knowledge_graph` MCP tool is **stub only** — LLM provider integration deferred.
- No CI/CD pipeline, no Docker, no linter config. Testing is manual via `bun test`.
- No pre-commit hooks.
- Added pipeline docs and references for UI/UX review and GDD/concept evaluation: `references/gui-section-guide.md`, `references/gameplay-section-guide.md`, `references/concept-evaluation-criteria.md`, `references/concept-review-template.md`, `references/gdd-evaluation-criteria.md`, `references/gdd-expected-sections.md`, `references/gdd-review-template.md`.
