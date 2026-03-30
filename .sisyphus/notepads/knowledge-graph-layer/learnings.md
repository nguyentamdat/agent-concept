# Knowledge Graph Layer — Learnings

## Project Stack
- Runtime: Bun
- Language: TypeScript (strict)
- Test runner: `bun test`
- Validation: Zod
- Search: Orama (BM25)
- No new runtime deps allowed

## Key Conventions (from existing code)
- All public types have Zod schemas (schema first, then `z.infer<>` for type)
- FNV hash used for stable IDs (see chunker.ts and orama-index.ts)
- Barrel exports via index.ts in each module
- Tests use `bun:test` (describe/it/expect pattern)
- `bun test <path>` to run specific tests
- `bun run typecheck` for TS check

## Architecture Decisions
- `search()` stays SYNC — lexical + focused modes are pure in-memory
- `deepSearch()` is NEW ASYNC method — LLM-dependent
- `buildGraph()` is opt-in — call after ingest()
- LLMProvider interface: `chat(messages): Promise<string>` — raw string, caller does Zod parse
- Graph is Map-based (no external graph lib)
- Entity dedup: Jaccard similarity >= 0.7 on normalized tokens

## File Locations
- Existing types: src/types/
- Existing extract: src/extract/
- Existing index: src/index/
- Existing api: src/api/
- New graph module: src/graph/
- Fixtures: knowledge/fixtures/

## [Phase 1 complete] Graph Types & Store
- Files created: src/graph/types.ts, graph-store.ts, dedup.ts, index.ts + tests
- Gotchas/decisions: graph traversal (`getNeighbors`) is cycle-safe BFS across both incoming and outgoing edges, while dependency traversal (`getDependencyChain`) is cycle-safe BFS restricted to outgoing `depends_on` edges only.


## Verification Notes (2026-03-28)
- Full suite passed: 232 tests, 0 failures (`bun test`).
- Knowledge graph coverage checks passed: required test files exist and targeted module run passed 57 tests across 6 files.
- Regression checks passed: `src/knowledge.test.ts`, `src/e2e/pipeline.test.ts`, and `src/eval/evaluator.test.ts` all passed (11 tests total).
- Eval output includes `graphExpansionHitRate`, confirming the graph expansion metric is surfaced in evaluator reporting.
