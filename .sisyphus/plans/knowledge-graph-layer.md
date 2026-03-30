# Knowledge Graph Layer — Implementation Plan

> Apply MiroFish patterns to transform flat chunk-based search into structured game design knowledge with entity-relationship graph, multi-level retrieval, and LLM-powered extraction.

## Problem Statement

Current `knowledge-layer` ingests game design documents and provides BM25 keyword search over chunks. This is insufficient for agents designing game features because:

1. **No entity awareness** — search returns text chunks, not "Combat System depends on Stamina System"
2. **No cross-document relationships** — can't discover that doc A's economy design conflicts with doc B's progression
3. **Single retrieval mode** — BM25 keyword only, no query decomposition for complex design questions
4. **Hard-coded extraction** — only 2 schemas (game-mechanics, economy), adding new domains requires code changes

## Solution: 3 Patterns from MiroFish

### Pattern A: Knowledge Graph on top of chunks
- Extract game design entities (systems, mechanics, currencies, features, constraints)
- Build relationships between entities (depends_on, conflicts_with, synergizes_with)
- Bidirectional links: entity ↔ source chunks (traceability)

### Pattern B: InsightForge-style multi-level retrieval
- `lexical` — existing BM25 (keep as-is)
- `focused` — BM25 + entity graph traversal for related concepts
- `deep` — separate async API: LLM query decomposition → multi-pass search → entity tracking → relationship chains

### Pattern C: Hybrid extraction (rule + LLM)
- Keep existing rule-based extraction for known schemas (fast, deterministic)
- Add LLM-powered extraction for entities, relations, and dynamic schemas

## Architecture

```
EXISTING (untouched):
  Parse → Normalise → Chunk → Orama BM25 Index → lexical search (sync)

NEW LAYERS:
  ┌───────────────────────────────────────────────────────────────┐
  │                       KnowledgeTool                           │
  │                                                               │
  │  ingest() ──→ chunks ──→ buildGraph(llm) ──→ GraphStore      │
  │                                │                              │
  │                      LLM Entity Extraction                    │
  │                      (from chunks, batch)                     │
  │                                │                              │
  │                      ┌─────────┴─────────┐                   │
  │                      │     GraphStore     │                   │
  │                      │  entities: Map     │                   │
  │                      │  relations: Map    │                   │
  │                      │  chunkLinks: Map   │                   │
  │                      └─────────┬─────────┘                   │
  │                                │                              │
  │  search(mode="lexical")  → existing sync BM25 (unchanged)    │
  │  search(mode="focused")  → sync BM25 + graph expansion       │
  │  deepSearch(query, llm)  → async: LLM decomp + multi-pass    │
  │                                                               │
  │  getEntity() / getSystemDependencies() / findConflicts()      │
  │  getFeatureContext(desc, llm?) → async agent context builder  │
  └───────────────────────────────────────────────────────────────┘
```

**Key API change:** `search()` stays sync for `lexical` and `focused` modes (graph traversal is pure in-memory, no async needed). A **new** `deepSearch()` method handles async LLM-dependent retrieval. This avoids breaking the existing sync `KnowledgeIndex` interface.

## File Structure (new files)

```
src/
├── graph/                          # NEW MODULE
│   ├── types.ts                    # Shared enums (EntityType, RelationType) + GameEntity, GameRelation Zod schemas
│   ├── graph-store.ts              # In-memory graph (Map-based adjacency list)
│   ├── graph-builder.ts            # Orchestrate: chunks → LLM extract → populate graph
│   ├── dedup.ts                    # Entity deduplication algorithm
│   └── index.ts                    # Barrel export
│
├── extract/
│   ├── schemas.ts                  # EXISTING (keep)
│   ├── extractor.ts                # EXISTING (keep)
│   ├── llm-extractor.ts            # NEW: LLM-powered entity/relation extraction
│   ├── llm-types.ts                # NEW: LLM extraction prompt, response Zod schema
│   └── index.ts                    # MODIFY: add llm exports
│
├── index/
│   ├── orama-index.ts              # EXISTING (keep)
│   ├── focused-retrieval.ts        # NEW: sync BM25 + graph traversal
│   ├── deep-retrieval.ts           # NEW: async InsightForge-style query decomposition
│   ├── types.ts                    # MODIFY: add FocusedResult, DeepSearchResult types
│   └── index.ts                    # MODIFY: add retrieval factories
│
├── api/
│   ├── document-access.ts          # EXISTING (keep)
│   ├── design-context.ts           # NEW: FeatureDesignContext agent API
│   └── index.ts                    # MODIFY: add design-context exports
│
├── types/
│   ├── api.ts                      # MODIFY: extend SearchKnowledgeRequest with "focused" mode
│   └── ...                         # EXISTING (keep)
│
├── eval/
│   ├── golden-dataset.ts           # MODIFY: add graph-aware golden queries
│   ├── metrics.ts                  # MODIFY: add entity/relation metrics
│   └── ...                         # EXISTING (keep)
│
├── knowledge.ts                    # MODIFY: extend KnowledgeTool with graph + deepSearch
└── index.ts                        # MODIFY: export new types
```

---

## Phase 1: Graph Types & Store

**Goal:** Data model for game design entities and relationships, plus in-memory graph.

**Depends on:** Nothing (first phase).

### 1.1 — `src/graph/types.ts`

Zod schemas for the game design knowledge graph. **This file is the shared foundation** — Phase 2 imports enums from here.

```typescript
// Entity types covering game design domain
const EntityTypeEnum = z.enum([
  "game-system",      // Combat, Economy, Progression, Social, Crafting
  "mechanic",         // Core Loop, Combo System, Dodge Roll, Cooldown
  "currency",         // Gold, Gems, Energy, Stamina, Experience
  "feature",          // PvP Arena, Guild Wars, Daily Quest, Gacha
  "character-class",  // Warrior, Mage, Rogue
  "constraint",       // Balance Rule, Level Cap, Rate Limit
  "design-pattern",   // Battle Pass, Skill Tree, Loot Box
  "reference-game",   // Games mentioned as reference/inspiration
  "misc",             // Fallback catch-all (MiroFish pattern)
]);

const GameEntitySchema = z.object({
  entityId: z.string(),                // stable hash(normalizedName + type)
  name: z.string(),
  type: EntityTypeEnum,
  description: z.string(),
  aliases: z.array(z.string()),        // alternative names for fuzzy matching
  sourceChunkIds: z.array(z.string()), // traceability → which chunks mentioned this
  sourceDocumentIds: z.array(z.string()),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});

// Relation types for game design domain
const RelationTypeEnum = z.enum([
  "depends_on",       // System A requires System B to function
  "conflicts_with",   // Increasing A reduces effectiveness of B
  "synergizes_with",  // A + B produces greater combined effect
  "contains",         // System contains sub-systems/mechanics
  "balanced_by",      // A is kept in check by B
  "feeds_into",       // Output of A is input of B (economy flow)
  "inspired_by",      // Feature takes inspiration from reference game
  "supersedes",       // New design replaces old design
  "variant_of",       // A is a variation of B
]);

const GameRelationSchema = z.object({
  relationId: z.string(),              // stable hash(source + target + type)
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  type: RelationTypeEnum,
  description: z.string().optional(),
  evidenceChunkIds: z.array(z.string()),
});

type GraphStats = {
  entityCount: number;
  relationCount: number;
  entityTypeCounts: Record<string, number>;
  relationTypeCounts: Record<string, number>;
};
```

**Removed from earlier draft:** `confidence` and `weight` fields (no consumer defined — YAGNI).

### 1.2 — `src/graph/graph-store.ts`

In-memory graph using Maps:

```typescript
interface GraphStore {
  // Entity CRUD
  addEntity(entity: GameEntity): void;
  getEntity(entityId: string): GameEntity | undefined;
  findEntitiesByName(name: string): GameEntity[];     // fuzzy match on name + aliases
  findEntitiesByType(type: EntityType): GameEntity[];
  getAllEntities(): GameEntity[];

  // Relation CRUD
  addRelation(relation: GameRelation): void;
  getRelationsFrom(entityId: string): GameRelation[];  // outgoing
  getRelationsTo(entityId: string): GameRelation[];    // incoming
  getRelationsBetween(sourceId: string, targetId: string): GameRelation[];

  // Graph traversal
  getNeighbors(entityId: string, depth?: number): GameEntity[];  // BFS up to depth
  getDependencyChain(entityId: string): GameEntity[];             // transitive depends_on

  // Chunk ↔ Entity bidirectional links
  getEntitiesForChunk(chunkId: string): GameEntity[];
  getChunksForEntity(entityId: string): string[];

  // Stats
  stats(): GraphStats;

  // Serialization
  serialize(): SerializedGraph;
}

// Standalone function (interfaces can't have static methods)
function deserializeGraph(data: SerializedGraph): GraphStore;
```

**Removed:** `findPath()` — no consumer in the plan (YAGNI).

### 1.3 — `src/graph/dedup.ts`

Entity deduplication algorithm (used by Phase 3):

```typescript
// Normalize: lowercase, strip common suffixes ("system", "mechanic", "feature"), collapse whitespace
function normalizeEntityName(name: string): string;

// Token Jaccard similarity: |intersection(tokens(a), tokens(b))| / |union(tokens(a), tokens(b))|
function entityNameSimilarity(a: string, b: string): number;

// Threshold: similarity >= 0.7 → considered same entity
const DEDUP_SIMILARITY_THRESHOLD = 0.7;

// Merge policy when types conflict: keep the MORE SPECIFIC type
// Specificity order: mechanic > game-system > feature > currency > constraint > design-pattern > character-class > reference-game > misc
// Descriptions: concatenate with " | " separator
// Aliases: union of both alias sets + both original names
function mergeEntities(existing: GameEntity, incoming: GameEntity): GameEntity;
```

### 1.4 — `src/graph/index.ts`

Barrel export: types + GraphStore + dedup utilities.

### Acceptance criteria (Phase 1):
- [x] All types have Zod schemas with strict validation
- [x] GraphStore passes unit tests: add/get entities, add/get relations, BFS traversal, dependency chain
- [x] Serialization round-trips cleanly (serialize → deserialize → same graph)
- [x] `findEntitiesByName("combat")` finds entity named "Combat System" (fuzzy match via dedup)
- [x] `mergeEntities()` correctly handles type conflicts, alias unions, description concatenation
- [x] `bun test src/graph` passes, `bun run typecheck` clean

**QA Scenario:**
```
Tool: Bash (bun test)
Steps:
  1. Create GraphStore instance
  2. addEntity({ entityId: "e1", name: "Combat System", type: "game-system", ... })
  3. addEntity({ entityId: "e2", name: "Stamina System", type: "game-system", ... })
  4. addRelation({ sourceEntityId: "e1", targetEntityId: "e2", type: "depends_on", ... })
  5. Assert: getNeighbors("e1", 1) includes "e2"
  6. Assert: getDependencyChain("e1") includes "e2"
  7. Assert: findEntitiesByName("combat") returns entity "e1"
  8. Assert: serialize() then deserializeGraph() produces identical graph
  9. Run: bun test src/graph/
Expected: All assertions pass, 0 failures
Evidence: .sisyphus/evidence/phase1-graph-store-tests.txt
```

---

## Phase 2: LLM-Powered Entity Extraction

**Goal:** Extract entities and relations from chunks using LLM, with graceful failure handling.

**Depends on:** Phase 1 (imports `EntityTypeEnum`, `RelationTypeEnum`, `GameEntitySchema` from `src/graph/types.ts`).

### 2.1 — `src/extract/llm-types.ts`

```typescript
// Import shared enums from graph/types
import { EntityTypeEnum, RelationTypeEnum } from "../graph/types";

// LLM provider interface — consumers implement this
interface LLMProvider {
  // Returns raw JSON string. Caller does Zod validation.
  chat(messages: Array<{ role: "system" | "user"; content: string }>): Promise<string>;
}

// What LLM returns (strict JSON, validated by caller)
const LLMExtractionResponseSchema = z.object({
  entities: z.array(z.object({
    name: z.string(),
    type: EntityTypeEnum,
    description: z.string(),
    aliases: z.array(z.string()).default([]),
    evidenceQuote: z.string(),  // exact quote from source text proving entity exists
  })),
  relations: z.array(z.object({
    sourceName: z.string(),
    targetName: z.string(),
    type: RelationTypeEnum,
    description: z.string().default(""),
    evidenceQuote: z.string(),  // exact quote proving this relation
  })),
});
```

**Changed from earlier draft:** `LLMProvider.chat()` returns raw string (not generic `chatJSON<T>`). Zod parsing is done by the caller. This is simpler and works with any LLM API.

**Added:** `evidenceQuote` required on both entities AND relations (anti-hallucination).

### 2.2 — `src/extract/llm-extractor.ts`

```typescript
interface LLMExtractorOptions {
  llm: LLMProvider;
  batchSize?: number;        // chunks per LLM call (default: 5)
  maxConcurrency?: number;   // parallel LLM calls (default: 3)
  existingEntityNames?: string[]; // for deduplication hint to LLM
}

interface LLMExtractionResult {
  entities: GameEntity[];
  relations: GameRelation[];
  warnings: string[];        // partial failures, validation rejects
}

async function extractEntitiesFromChunks(
  chunks: KnowledgeChunk[],
  options: LLMExtractorOptions,
): Promise<LLMExtractionResult>;
```

Key design decisions:
- **Batch chunks** (5 per call, grouped by same `sectionPath[0]`)
- **Anti-hallucination:** After LLM returns, verify each entity `name` appears as substring in at least one source chunk (case-insensitive). Drop entities that fail this check, add to `warnings`.
- **Per-item validation:** Accept valid entities/relations individually, reject invalid ones with warnings (not all-or-nothing).
- **Retry on JSON parse failure:** Up to 2 retries with same prompt. After 3 failures, return empty + warning.
- **Temperature 0.2**

### 2.3 — Update `src/extract/index.ts`

Add LLM exports alongside existing rule-based exports.

### Acceptance criteria (Phase 2):
- [x] LLMProvider interface defined with `chat()` returning raw string
- [x] LLM extraction produces valid `GameEntity[]` + `GameRelation[]` from test chunks
- [x] Anti-hallucination: entity whose name doesn't appear in source text is dropped + warning added
- [x] Partial failure: if 1 of 5 entities fails Zod validation, the other 4 still returned
- [x] Total failure: if LLM returns garbage, result is `{ entities: [], relations: [], warnings: [...] }`
- [x] Unit tests with mocked LLMProvider returning known JSON
- [x] `bun test src/extract` passes, `bun run typecheck` clean

**QA Scenario:**
```
Tool: Bash (bun test)
Steps:
  1. Create mock LLMProvider that returns predefined JSON with 3 entities, 1 hallucinated
  2. Call extractEntitiesFromChunks(sampleChunks, { llm: mockLLM })
  3. Assert: result.entities.length === 2 (hallucinated one dropped)
  4. Assert: result.warnings includes message about dropped entity
  5. Create mock LLMProvider that returns invalid JSON
  6. Call extractEntitiesFromChunks(sampleChunks, { llm: brokenMockLLM })
  7. Assert: result.entities.length === 0
  8. Assert: result.warnings.length > 0
  9. Run: bun test src/extract/llm-extractor.test.ts
Expected: All assertions pass, 0 failures
Evidence: .sisyphus/evidence/phase2-llm-extractor-tests.txt
```

---

## Phase 3: Graph Building Pipeline

**Goal:** Wire extraction into KnowledgeTool. One call to build full knowledge graph.

**Depends on:** Phase 1 + Phase 2.

### 3.1 — `src/graph/graph-builder.ts`

```typescript
interface GraphBuildOptions {
  llm: LLMProvider;
  batchSize?: number;
  onProgress?: (progress: GraphBuildProgress) => void;
}

interface GraphBuildProgress {
  phase: "extracting" | "deduplicating" | "linking" | "validating";
  current: number;
  total: number;
  message: string;
}

async function buildGraphFromChunks(
  chunks: KnowledgeChunk[],
  options: GraphBuildOptions,
): Promise<{ graph: GraphStore; warnings: string[] }>;
```

Pipeline steps:
1. **Batch chunks** — group by `documentId`, within each doc group by shared `sectionPath[0]`, then split into batches of `batchSize` (default 5)
2. **Extract entities + relations** — parallel LLM calls per batch (max concurrency 3)
3. **Deduplicate entities** — using `dedup.ts` algorithm: normalize names, Jaccard similarity ≥ 0.7 → merge
4. **Resolve relation references** — map source/target names → entity IDs via normalized name lookup
5. **Build chunk ↔ entity links** — bidirectional, based on entity `sourceChunkIds`
6. **Validate graph** — orphaned relations (referencing non-existent entities) are removed with warning, not thrown

### 3.2 — Extend `src/knowledge.ts`

```typescript
class KnowledgeTool {
  // EXISTING (unchanged — all sync, all passing tests)
  async ingest(...): Promise<SourceDocument>;
  search(...): SearchKnowledgeResult;              // sync, lexical + focused
  getDocument(...): GetDocumentResult;
  extract(...): StructuredExtraction;
  listDocuments(): SourceDocument[];

  // NEW (all graph-related)
  async buildGraph(options: GraphBuildOptions): Promise<GraphStats>;
  getEntity(name: string): GameEntity | undefined;
  getEntityRelations(entityId: string): GameRelation[];
  getSystemDependencies(systemName: string): GameEntity[];  // transitive depends_on chain
  readonly graph: GraphStore | null;  // null if not built yet
}
```

Graph building is **opt-in**. Call `buildGraph()` after ingesting docs. If called before ingest, throws clear error.

### Acceptance criteria (Phase 3):
- [x] `buildGraph()` produces populated GraphStore from ingested documents
- [x] Entity dedup merges "Combat" and "Combat System" (similarity ≥ 0.7)
- [x] Chunk ↔ entity links are bidirectional
- [x] Progress callback fires at each phase with correct counts
- [x] Orphaned relations produce warnings, not errors
- [x] `buildGraph()` before `ingest()` throws descriptive error
- [x] Existing `knowledge.test.ts` tests pass unchanged
- [x] `bun test` passes, `bun run typecheck` clean

**QA Scenario:**
```
Tool: Bash (bun test)
Steps:
  1. Create KnowledgeTool, ingest sample.md fixture
  2. Create mock LLMProvider returning entities: ["Combat System", "Progression System"] + relation: depends_on
  3. Call tool.buildGraph({ llm: mockLLM })
  4. Assert: tool.graph !== null
  5. Assert: tool.graph.stats().entityCount >= 2
  6. Assert: tool.getEntity("Combat System") returns entity with sourceChunkIds.length > 0
  7. Assert: tool.getEntityRelations(combatEntity.entityId) includes depends_on relation
  8. Assert: tool.getSystemDependencies("Combat System") includes "Progression System"
  9. Run existing tests: bun test src/knowledge.test.ts (must still pass)
  10. Run: bun test src/graph/graph-builder.test.ts
Expected: All assertions pass, existing tests unbroken
Evidence: .sisyphus/evidence/phase3-graph-builder-tests.txt
```

---

## Phase 4: Multi-Level Retrieval

**Goal:** Extend search with entity-aware mode (sync) and add separate async deep search.

**Depends on:** Phase 3.

### 4.1 — Update `src/types/api.ts`

```typescript
// Extend existing retrieval mode (stays sync-compatible)
retrievalMode: z.enum(["lexical", "focused"]);
// "deep" is NOT added here — it's a separate async method
```

### 4.2 — `src/index/focused-retrieval.ts` (sync)

```
Input query ──→ BM25 top-K ──→ Extract entity names from top results (string matching against graph)
                                       │
                                       ▼
                                 Graph: getNeighbors(depth=1) for each matched entity
                                       │
                                       ▼
                                 Get chunks linked to neighbor entities
                                       │
                                       ▼
                                 Merge original + expanded chunks (deduplicate by chunkId)
                                       │
                                       ▼
                                 Score: finalScore = bm25Score + (ENTITY_BONUS * DECAY^graphDepth)
                                 where ENTITY_BONUS = 0.5, DECAY = 0.5
                                       │
                                       ▼
                                 Sort by finalScore, return top-K
```

This is **sync** — graph traversal is pure in-memory Map lookups. No async needed.

If `graph` is null (not built), falls back to pure lexical search silently.

### 4.3 — `src/index/deep-retrieval.ts` (async) + new `src/index/types.ts` additions

```typescript
// NEW type for deep search results
interface DeepSearchResult {
  chunks: SearchKnowledgeResult["results"];  // ranked chunks
  subQueries: string[];                       // decomposed queries
  entities: GameEntity[];                     // entities found across all sub-queries
  relationships: GameRelation[];              // relationships between found entities
  synthesisContext: string;                   // markdown-formatted context for agent prompts
}

interface DeepSearchOptions {
  llm: LLMProvider;
  topK?: number;           // default 10
  maxSubQueries?: number;  // default 4
  timeoutMs?: number;      // default 10000
}

async function deepSearch(
  query: string,
  index: KnowledgeIndex,
  graph: GraphStore | null,
  options: DeepSearchOptions,
): Promise<DeepSearchResult>;
```

Pipeline:
1. LLM decomposes query → 3-5 sub-queries (game-design aware prompt)
2. BM25 search each sub-query (parallel, using existing sync `index.search()`)
3. Deduplicate chunks by chunkId
4. If graph exists: find entities mentioned in results, get relationship chains
5. Build `synthesisContext`: markdown string with sections: `## Relevant Facts`, `## Entities`, `## Relationships`, `## Design Implications`

`synthesisContext` format:
```markdown
## Relevant Facts
- [fact from chunk 1 with citation]
- [fact from chunk 2 with citation]

## Entities Found
- **Combat System** (game-system): [description]
- **Stamina System** (game-system): [description]

## Relationships
- Combat System --[depends_on]--> Stamina System
- Combat System --[contains]--> Combo Mechanic

## Design Implications
Based on the knowledge above, the proposed feature interacts with N systems and M dependencies.
```

### 4.4 — Update `src/knowledge.ts`

```typescript
class KnowledgeTool {
  // EXISTING search() stays sync — now supports "focused" mode
  search(request: SearchKnowledgeRequest): SearchKnowledgeResult;

  // NEW async method — separate from sync search()
  async deepSearch(query: string, options: DeepSearchOptions): Promise<DeepSearchResult>;
}
```

### Acceptance criteria (Phase 4):
- [x] `search(mode="lexical")` works exactly as before (no regression, still sync)
- [x] `search(mode="focused")` returns related entities alongside chunks (sync)
- [x] `focused` mode silent fallback to lexical when graph is null
- [x] `deepSearch()` decomposes queries into sub-queries via LLM
- [x] `deepSearch()` returns `synthesisContext` in markdown format
- [x] `deepSearch()` respects `timeoutMs` — returns partial results if LLM slow
- [x] `deepSearch()` gracefully degrades if graph null (just multi-pass BM25, no entity tracking)
- [x] Existing tests pass unchanged
- [x] `bun test` passes, `bun run typecheck` clean

**QA Scenario (focused):**
```
Tool: Bash (bun test)
Steps:
  1. Create KnowledgeTool, ingest fixtures, build graph with mock LLM
  2. search({ query: "combat", retrievalMode: "focused", topK: 5 })
  3. Assert: results include chunks about Stamina (via entity graph expansion from Combat→depends_on→Stamina)
  4. search({ query: "combat", retrievalMode: "lexical", topK: 5 })
  5. Assert: lexical results do NOT include Stamina chunks (no graph expansion)
  6. Compare: focused found at least 1 chunk that lexical missed
Expected: Focused mode discovers related content that lexical misses
Evidence: .sisyphus/evidence/phase4-focused-retrieval-tests.txt
```

**QA Scenario (deep):**
```
Tool: Bash (bun test)
Steps:
  1. Create mock LLM that returns decomposed sub-queries: ["combat mechanics", "stamina dependency", "balance rules"]
  2. Call tool.deepSearch("How should combat interact with stamina?", { llm: mockLLM, topK: 5 })
  3. Assert: result.subQueries.length >= 3
  4. Assert: result.entities.length > 0
  5. Assert: result.synthesisContext includes "## Relevant Facts"
  6. Assert: result.synthesisContext includes "## Relationships"
  7. Test timeout: create slow mock LLM (5s delay), set timeoutMs: 1000
  8. Assert: deepSearch returns partial results within timeout
Expected: Deep search produces structured multi-dimensional results
Evidence: .sisyphus/evidence/phase4-deep-retrieval-tests.txt
```

---

## Phase 5: Agent Context Builder

**Goal:** High-level API for agents designing game features.

**Depends on:** Phase 3 + Phase 4.

### 5.1 — `src/api/design-context.ts`

```typescript
interface FeatureDesignContext {
  affectedSystems: GameEntity[];
  dependencies: GameRelation[];
  conflicts: Array<{
    entity: GameEntity;
    relation: GameRelation;
    severity: "high" | "medium" | "low";
    explanation: string;
  }>;
  relevantPatterns: GameEntity[];   // type = "design-pattern"
  references: GameEntity[];         // type = "reference-game"
  evidenceChunks: KnowledgeChunk[];
  contextString: string;            // markdown, same format as synthesisContext
}
```

**Conflict severity rules (deterministic, no LLM):**
- `high`: direct `conflicts_with` edge between proposed feature's entities and existing entity
- `medium`: proposed feature touches entity A, which has `depends_on` chain (depth ≤ 2) to entity B that has `conflicts_with` to entity C
- `low`: proposed feature touches entity A that `synergizes_with` entity B that `conflicts_with` entity C

**`contextString` format:** Same markdown template as `deepSearch.synthesisContext`, with added `## Conflicts` and `## Recommendations` sections.

### 5.2 — Update `src/knowledge.ts`

```typescript
// New async methods on KnowledgeTool
async getFeatureContext(description: string, llm?: LLMProvider): Promise<FeatureDesignContext>;
// Without LLM: uses focused search for evidence gathering
// With LLM: uses deepSearch for richer context
```

### Acceptance criteria (Phase 5):
- [x] `getFeatureContext()` returns structured context with affected systems, dependencies, conflicts
- [x] Conflict severity follows defined rules (high/medium/low)
- [x] `contextString` is valid markdown with expected sections
- [x] Works without LLM (uses focused retrieval) — still returns systems/deps/conflicts from graph
- [x] Works better with LLM (uses deepSearch for richer evidence)
- [x] `bun test` passes, `bun run typecheck` clean

**QA Scenario:**
```
Tool: Bash (bun test)
Steps:
  1. Setup: ingest fixtures, build graph with entities: Combat, Stamina, Stealth where Combat conflicts_with Stealth
  2. Call tool.getFeatureContext("Add PvP arena with combat and stealth mechanics")
  3. Assert: affectedSystems includes Combat and Stealth
  4. Assert: conflicts.length > 0
  5. Assert: conflicts[0].severity === "high" (direct conflicts_with edge)
  6. Assert: contextString includes "## Conflicts"
  7. Call tool.getFeatureContext("Add PvP arena") without graph built
  8. Assert: returns result with empty entities/conflicts (graceful degradation)
Expected: Context builder surfaces real design conflicts
Evidence: .sisyphus/evidence/phase5-design-context-tests.txt
```

---

## Phase 6: Eval Extension

**Goal:** Validate that graph layer improves retrieval quality.

**Depends on:** Phase 4.

### 6.1 — Extend golden dataset in `src/eval/golden-dataset.ts`

```typescript
interface GraphGoldenQuery extends GoldenQuery {
  expectedEntityNames?: string[];
  expectedRelationTypes?: string[];
}
```

Add at least 5 graph-aware golden queries.

### 6.2 — New metrics in `src/eval/metrics.ts`

- `entityRecall@K` — what % of expected entities appear in focused/deep results
- `graphExpansionHitRate` — % of graph-aware queries where focused mode found a relevant chunk that lexical missed

### 6.3 — Comparative eval

The meaningful acceptance criterion: "focused mode returns at least 1 relevant chunk in top-5 that lexical does NOT return, for at least 3 of 5 graph-aware golden queries."

### Acceptance criteria (Phase 6):
- [x] Graph-aware golden dataset with ≥ 5 queries
- [x] `graphExpansionHitRate` ≥ 0.6 (focused finds new relevant chunks for 3/5 queries)
- [x] `entityRecall@K` ≥ 0.7 for deep mode on graph-aware queries
- [x] Eval report includes graph metrics alongside existing metrics
- [x] Existing eval metrics don't regress (lexical recall@5 unchanged)
- [x] `bun test src/eval` passes

**QA Scenario:**
```
Tool: Bash (bun test)
Steps:
  1. Run: bun test src/eval/evaluator.test.ts
  2. Assert: report includes graphExpansionHitRate metric
  3. Assert: graphExpansionHitRate >= 0.6
  4. Assert: existing recall@5 >= 0.7 (no regression)
Expected: Graph layer measurably improves retrieval
Evidence: .sisyphus/evidence/phase6-eval-report.json
```

---

## Dependency Chain

```
Phase 1 (Graph Types & Store)
    │
    └──→ Phase 2 (LLM Extraction) ← depends on Phase 1 for shared enums
              │
              ▼
         Phase 3 (Graph Building) ← needs Phase 1 + Phase 2
              │
              ├──→ Phase 4 (Multi-Level Retrieval)
              │         │
              │         ├──→ Phase 5 (Agent Context) ← needs Phase 3 + Phase 4
              │         │
              │         └──→ Phase 6 (Eval Extension) ← needs Phase 4
              │
              └──→ Phase 5 also directly needs Phase 3 (graph queries)
```

**Phase 1 → Phase 2 → Phase 3 → Phase 4 → Phase 5/6** (sequential chain, Phase 5 and 6 can be parallel).

## Key Design Constraints

1. **Local-first** — No cloud services. LLMProvider is an interface consumers implement.
2. **Opt-in graph** — Existing `ingest()` + `search(lexical)` works without LLM. Graph is additive.
3. **Sync search preserved** — `search()` stays sync for lexical and focused. New `deepSearch()` is async.
4. **Zod-validated** — Every new type has a Zod schema. Attributes constrained to string | number | boolean.
5. **Citation-tracked** — Every entity links back to source chunks. Every relation has evidenceQuote.
6. **Anti-hallucination** — Entities must have evidence in source text. No evidence = dropped + warning.
7. **Graceful degradation** — focused falls back to lexical if no graph. deepSearch falls back to multi-pass BM25 if no graph.
8. **No new runtime deps** — Graph is Map-based. LLM is an interface. Only Zod (already present).
9. **Existing tests untouched** — All current tests pass without modification.

## Out of Scope (explicitly)

- Embedding/vector search — keep lexical for now, embeddings are a separate concern
- Persistence to disk — in-memory with serialize/deserialize is sufficient
- Specific LLM SDK integration — consumers provide LLMProvider implementation
- UI/visualization — this is a library, not an app
- Real-time graph updates during agent usage — rebuild on demand
