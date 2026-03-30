# Game Design Kit

AI game design pipeline plugin for Claude Code. Concept → Prototype → Feedback → Documents.

## Quick Start

```bash
git clone <repo-url> game-design-kit
cd game-design-kit
bun install
```

Add your game design reference PDFs to `knowledge/`, then:

```bash
bun run setup:knowledge
claude
```

```
> /project:concept casual puzzle game with gardening theme for mobile
```

## Requirements

- [Bun](https://bun.sh/) v1.0+
- [Claude Code](https://docs.anthropic.com/en/docs/claude-code) CLI

## Pipeline

| Command | What it does |
|---|---|
| `/project:concept <idea>` | Phase A: brainstorm → outline → approve. Phase B: GCD + GCD-Gameplay + spec.yaml |
| `/project:prototype` | Generate playable HTML5 prototype (2D Canvas or 3D Three.js) |
| `/project:feedback <text>` | Process feedback → update spec → regenerate prototype |
| `/project:approve` | Approve spec → generate 7 detail design documents |
| `/project:status` | Show current project state |

Design documents (`gcd.md`, `gcd-gameplay.md`) are written in Vietnamese.

## Knowledge Base

Place these PDFs in `knowledge/`:
- The Art of Game Design (Schell)
- MDA: A Formal Approach (Hunicke, LeBlanc, Zubek)
- Hooked (Nir Eyal)
- A Theory of Fun (Raph Koster)
- Players Making Decisions (Zack Hiwiller)

---

Below is the original knowledge-layer library documentation.

## Table of Contents

- [Quick Start](#quick-start)
- [Architecture](#architecture)
- [API Reference](#api-reference)
  - [Ingest Documents](#ingest-documents)
  - [Search](#search)
  - [Knowledge Graph](#knowledge-graph)
  - [Deep Search](#deep-search)
  - [Feature Design Context](#feature-design-context)
  - [Document Views](#document-views)
  - [Structured Extraction](#structured-extraction)
- [Modules](#modules)
  - [Parse](#parse---srcparse)
  - [Normalise](#normalise---srcnormalise)
  - [Chunk](#chunk---srcchunk)
  - [Index](#index---srcindex)
  - [Graph](#graph---srcgraph)
  - [Extract](#extract---srcextract)
  - [API](#api---srcapi)
  - [Eval](#eval---srceval)
  - [Types](#types---srctypes)
- [LLMProvider Interface](#llmprovider-interface)
- [Game Design Ontology](#game-design-ontology)
- [Development](#development)

---

## Quick Start

```bash
bun install
```

```typescript
import { KnowledgeTool } from "knowledge-layer";

const tool = new KnowledgeTool();

// 1. Ingest documents (PDF, DOCX, MD, TXT, CSV, JSON, YAML)
await tool.ingest("docs/game-design-document.md");
await tool.ingest("docs/economy-design.pdf");
await tool.ingest("docs/mechanics-reference.csv");

// 2. Search (lexical BM25)
const results = tool.search({
  query: "combat stamina interaction",
  topK: 5,
  retrievalMode: "lexical",
  includeRawText: false,
  includeStructured: false,
});

// 3. Build knowledge graph (requires LLMProvider)
const stats = await tool.buildGraph({ llm: myLLM });
// → { entityCount: 42, relationCount: 18, ... }

// 4. Focused search (BM25 + entity graph expansion)
const focused = tool.search({
  query: "combat",
  topK: 5,
  retrievalMode: "focused",
  includeRawText: false,
  includeStructured: false,
});
// → finds "Stamina System" chunks via Combat→depends_on→Stamina graph traversal

// 5. Deep search (async, LLM query decomposition)
const deep = await tool.deepSearch(
  "How should PvP economy interact with progression?",
  { llm: myLLM }
);
// → { chunks, subQueries, entities, relationships, synthesisContext }

// 6. Feature design context for agents
const ctx = await tool.getFeatureContext(
  "Add PvP arena with combat and stealth mechanics",
  myLLM
);
// → { affectedSystems, dependencies, conflicts, contextString }
```

---

## Architecture

```
Document (PDF/DOCX/MD/TXT/CSV/JSON/YAML)
    │
    ▼
┌─────────┐     ┌───────────┐     ┌─────────┐     ┌─────────────┐
│  Parse   │ ──→ │ Normalise │ ──→ │  Chunk  │ ──→ │ Orama Index │
└─────────┘     └───────────┘     └─────────┘     └──────┬──────┘
                                                          │
                   search(mode="lexical") ◄───────────────┘  (sync, BM25)
                   search(mode="focused") ◄── BM25 + Graph expansion (sync)
                                                          │
                                        ┌─────────────────┘
                                        ▼
                                 ┌─────────────┐
                                 │ GraphStore   │ ◄── buildGraph(llm)
                                 │ (in-memory)  │
                                 │              │     LLM extracts entities
                                 │  entities    │     & relations from chunks
                                 │  relations   │
                                 │  chunk links │
                                 └──────┬──────┘
                                        │
                   deepSearch(llm)  ◄────┘  (async, LLM decomposition)
                   getFeatureContext(llm) ◄── conflict detection + context builder
```

**Key design decisions:**
- `search()` is **sync** — lexical and focused modes are pure in-memory
- `deepSearch()` is **async** — requires LLM for query decomposition
- `buildGraph()` is **opt-in** — existing pipeline works without LLM
- Graceful degradation: focused → lexical if no graph; deepSearch → multi-pass BM25 if no graph

---

## API Reference

### Ingest Documents

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.ingest()`

```typescript
await tool.ingest(filePath: string, options?: KnowledgeIngestOptions): Promise<SourceDocument>
```

| Param | Type | Description |
|---|---|---|
| `filePath` | `string` | Path to document file |
| `options.metadata` | `object` | Optional `{ category, tags, language, topic }` |

**Supported formats:** PDF, DOCX, Markdown, TXT, CSV, JSON, YAML

Returns [`SourceDocument`](src/types/document.ts) with `documentId`, `sourceType`, `parseStatus`, `warnings`.

---

### Search

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.search()`

```typescript
tool.search(request: SearchKnowledgeRequest): SearchKnowledgeResult
```

| Param | Type | Description |
|---|---|---|
| `query` | `string` | Search query |
| `topK` | `number` | Max results to return |
| `retrievalMode` | `"lexical" \| "focused"` | Search strategy |
| `filters` | `object` | Optional `{ category, tags, sourceType, language }` |
| `includeRawText` | `boolean` | Include raw text in results |
| `includeStructured` | `boolean` | Include structured data |
| `minScore` | `number` | Optional minimum score threshold |

**Retrieval modes:**

| Mode | Sync | Graph Required | Description |
|---|---|---|---|
| `lexical` | ✅ | No | BM25 keyword search over chunks |
| `focused` | ✅ | Optional | BM25 + entity graph expansion. Falls back to lexical if no graph. |

Returns [`SearchKnowledgeResult`](src/types/api.ts) with `results[]` (chunk + score + citation), `timingMs`, `indexVersion`.

Focused mode scoring: `finalScore = bm25Score + (ENTITY_BONUS × ENTITY_DECAY^graphDepth)`

Implementation: [`src/index/focused-retrieval.ts`](src/index/focused-retrieval.ts)

---

### Knowledge Graph

[`src/knowledge.ts`](src/knowledge.ts) — Graph methods on `KnowledgeTool`

#### Build Graph

```typescript
await tool.buildGraph(options: GraphBuildOptions): Promise<GraphStats>
```

Requires `LLMProvider`. Extracts entities and relations from all ingested chunks.

| Param | Type | Description |
|---|---|---|
| `options.llm` | [`LLMProvider`](src/extract/llm-types.ts) | LLM interface for extraction |
| `options.batchSize` | `number` | Chunks per LLM call (default: 5) |
| `options.onProgress` | `function` | Progress callback `(phase, current, total, message)` |

Pipeline: chunks → batch by section → LLM extraction → dedup (Jaccard ≥ 0.7) → link → validate

Returns [`GraphStats`](src/graph/types.ts): `{ entityCount, relationCount, entityTypeCounts, relationTypeCounts }`

Implementation: [`src/graph/graph-builder.ts`](src/graph/graph-builder.ts)

#### Query Graph

```typescript
tool.graph                                    // GraphStore | null
tool.getEntity(name: string)                  // GameEntity | undefined (fuzzy name match)
tool.getEntityRelations(entityId: string)     // GameRelation[] (all incoming + outgoing)
tool.getSystemDependencies(systemName: string) // GameEntity[] (transitive depends_on chain)
```

Graph store interface: [`src/graph/graph-store.ts`](src/graph/graph-store.ts)

Entity / relation types: [`src/graph/types.ts`](src/graph/types.ts)

Dedup algorithm: [`src/graph/dedup.ts`](src/graph/dedup.ts)

---

### Deep Search

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.deepSearch()`

```typescript
await tool.deepSearch(query: string, options: DeepSearchOptions): Promise<DeepSearchResult>
```

**Async. Requires LLMProvider.** Decomposes a complex question into sub-queries, runs multi-pass BM25, then tracks entities and relationships across results.

| Param | Type | Description |
|---|---|---|
| `query` | `string` | Complex design question |
| `options.llm` | [`LLMProvider`](src/extract/llm-types.ts) | LLM for query decomposition |
| `options.topK` | `number` | Max results (default: 10) |
| `options.maxSubQueries` | `number` | Max decomposed queries (default: 4) |
| `options.timeoutMs` | `number` | Timeout in ms (default: 10000) |

Returns [`DeepSearchResult`](src/index/deep-retrieval.ts):

```typescript
{
  chunks: SearchResult[];       // ranked chunks from all sub-queries
  subQueries: string[];         // decomposed queries
  entities: GameEntity[];       // entities found in result chunks
  relationships: GameRelation[]; // relationships between found entities
  synthesisContext: string;     // markdown-formatted context for agent prompts
}
```

`synthesisContext` format:
```markdown
## Relevant Facts
- [evidence snippets with citations]

## Entities Found
- **Combat System** (game-system): Handles all combat interactions

## Relationships
- Combat System --[depends_on]--> Stamina System

## Design Implications
Based on the knowledge above, the query involves N entities and M relationships.
```

Implementation: [`src/index/deep-retrieval.ts`](src/index/deep-retrieval.ts)

---

### Feature Design Context

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.getFeatureContext()`

```typescript
await tool.getFeatureContext(
  description: string,
  llm?: LLMProvider
): Promise<FeatureDesignContext>
```

Builds a structured context for agents designing new features. Identifies affected systems, dependencies, and **conflicts** with existing design.

| Param | Type | Description |
|---|---|---|
| `description` | `string` | Feature description in natural language |
| `llm` | [`LLMProvider`](src/extract/llm-types.ts) | Optional. Uses deepSearch if provided, focused search otherwise. |

Returns [`FeatureDesignContext`](src/api/design-context.ts):

```typescript
{
  affectedSystems: GameEntity[];    // systems this feature touches
  dependencies: GameRelation[];     // relations between affected systems
  conflicts: ConflictInfo[];        // severity: "high" | "medium" | "low"
  relevantPatterns: GameEntity[];   // design-pattern entities
  references: GameEntity[];         // reference-game entities
  evidenceChunks: KnowledgeChunk[]; // raw evidence for citation
  contextString: string;            // markdown ready for agent prompt injection
}
```

**Conflict severity rules:**

| Severity | Rule |
|---|---|
| **high** | Direct `conflicts_with` edge between feature entities |
| **medium** | Feature entity → `depends_on` chain (depth ≤ 2) → entity with `conflicts_with` |
| **low** | Feature entity → `synergizes_with` → entity with `conflicts_with` |

Implementation: [`src/api/design-context.ts`](src/api/design-context.ts)

---

### Document Views

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.getDocument()`

```typescript
tool.getDocument(documentId: string, view: "raw" | "normalized" | "structure" | "chunks")
```

| View | Returns |
|---|---|
| `raw` | Original document text |
| `normalized` | Cleaned, normalized text |
| `structure` | Array of [`DocumentStructureNode`](src/types/document.ts) |
| `chunks` | Array of [`KnowledgeChunk`](src/types/chunk.ts) |

---

### Structured Extraction

[`src/knowledge.ts`](src/knowledge.ts) — `KnowledgeTool.extract()`

```typescript
tool.extract(documentId: string, schemaName: "game-mechanics" | "economy"): StructuredExtraction
```

Rule-based extraction using predefined schemas. Returns [`StructuredExtraction`](src/types/extraction.ts) with `records`, `evidence`, and `warnings`.

Schemas: [`src/extract/schemas.ts`](src/extract/schemas.ts)

---

## Modules

### Parse — [`src/parse/`](src/parse/)

Multi-format document parsing.

| File | Format | Library |
|---|---|---|
| [`pdf.ts`](src/parse/pdf.ts) | PDF | `unpdf` |
| [`docx.ts`](src/parse/docx.ts) | DOCX | `mammoth` |
| [`md.ts`](src/parse/md.ts) | Markdown | Built-in |
| [`txt.ts`](src/parse/txt.ts) | Plain text | Built-in |
| [`csv.ts`](src/parse/csv.ts) | CSV | `csv-parse` |
| [`json.ts`](src/parse/json.ts) | JSON | Built-in |
| [`yaml.ts`](src/parse/yaml.ts) | YAML | `js-yaml` |

Output: [`SourceDocument`](src/types/document.ts) + [`DocumentStructureNode[]`](src/types/document.ts)

### Normalise — [`src/normalise/`](src/normalise/)

| File | Purpose |
|---|---|
| [`normalise.ts`](src/normalise/normalise.ts) | Text normalization (whitespace, encoding, structure cleanup) |
| [`citation-builder.ts`](src/normalise/citation-builder.ts) | Build [`CitationRef`](src/types/citation.ts) from document structure |

### Chunk — [`src/chunk/`](src/chunk/)

| File | Purpose |
|---|---|
| [`chunker.ts`](src/chunk/chunker.ts) | BM25-optimized chunking (~400-600 tokens per chunk, FNV hash for stable IDs) |

Output: [`KnowledgeChunk[]`](src/types/chunk.ts) with `primaryCitation`, `sectionPath`, `metadata`.

### Index — [`src/index/`](src/index/)

| File | Purpose |
|---|---|
| [`orama-index.ts`](src/index/orama-index.ts) | Orama-powered BM25 search with local fallback |
| [`focused-retrieval.ts`](src/index/focused-retrieval.ts) | Sync BM25 + entity graph expansion |
| [`deep-retrieval.ts`](src/index/deep-retrieval.ts) | Async LLM query decomposition + multi-pass search |
| [`types.ts`](src/index/types.ts) | `KnowledgeIndex` interface, `DeepSearchResult` type |

### Graph — [`src/graph/`](src/graph/)

In-memory knowledge graph for game design entities.

| File | Purpose |
|---|---|
| [`types.ts`](src/graph/types.ts) | `GameEntity`, `GameRelation` Zod schemas, `EntityType` / `RelationType` enums |
| [`graph-store.ts`](src/graph/graph-store.ts) | `GraphStore` interface + `createGraphStore()` factory (Map-based adjacency list) |
| [`graph-builder.ts`](src/graph/graph-builder.ts) | `buildGraphFromChunks()` — LLM extraction → dedup → graph construction |
| [`dedup.ts`](src/graph/dedup.ts) | Entity deduplication: `normalizeEntityName`, `entityNameSimilarity` (Jaccard ≥ 0.7), `mergeEntities` |

### Extract — [`src/extract/`](src/extract/)

| File | Purpose |
|---|---|
| [`schemas.ts`](src/extract/schemas.ts) | Rule-based extraction schemas (`game-mechanics`, `economy`) |
| [`extractor.ts`](src/extract/extractor.ts) | Rule-based extractor (keyword/regex matching) |
| [`llm-types.ts`](src/extract/llm-types.ts) | `LLMProvider` interface + `LLMExtractionResponseSchema` |
| [`llm-extractor.ts`](src/extract/llm-extractor.ts) | LLM-powered entity/relation extraction (batched, anti-hallucination, retry) |

### API — [`src/api/`](src/api/)

| File | Purpose |
|---|---|
| [`document-access.ts`](src/api/document-access.ts) | Document view access (raw, normalized, structure, chunks) |
| [`design-context.ts`](src/api/design-context.ts) | `FeatureDesignContext` builder + conflict severity detection |

### Eval — [`src/eval/`](src/eval/)

| File | Purpose |
|---|---|
| [`golden-dataset.ts`](src/eval/golden-dataset.ts) | Golden queries (16 lexical + 5 graph-aware) |
| [`metrics.ts`](src/eval/metrics.ts) | `recall@K`, `MRR`, `NDCG@K`, `citationFidelity`, `entityRecall@K`, `graphExpansionHitRate` |
| [`evaluator.ts`](src/eval/evaluator.ts) | Evaluation runner with JSON report output |

### Types — [`src/types/`](src/types/)

| File | Purpose |
|---|---|
| [`document.ts`](src/types/document.ts) | `SourceDocument`, `DocumentStructureNode` Zod schemas |
| [`chunk.ts`](src/types/chunk.ts) | `KnowledgeChunk` Zod schema |
| [`citation.ts`](src/types/citation.ts) | `CitationRef` Zod schema |
| [`api.ts`](src/types/api.ts) | `SearchKnowledgeRequest`, `SearchKnowledgeResult`, `GetDocumentRequest/Result` |
| [`extraction.ts`](src/types/extraction.ts) | `StructuredExtraction` Zod schema |

---

## LLMProvider Interface

[`src/extract/llm-types.ts`](src/extract/llm-types.ts)

Bring your own LLM. The library doesn't bundle any LLM SDK.

```typescript
interface LLMProvider {
  chat(messages: Array<{ role: "system" | "user"; content: string }>): Promise<string>;
}
```

Returns raw JSON string. The library handles Zod parsing internally.

**Example implementations:**

```typescript
// OpenAI
const openaiLLM: LLMProvider = {
  chat: async (messages) => {
    const res = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      response_format: { type: "json_object" },
    });
    return res.choices[0].message.content ?? "";
  },
};

// Anthropic
const anthropicLLM: LLMProvider = {
  chat: async (messages) => {
    const res = await anthropic.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: messages.find((m) => m.role === "system")?.content ?? "",
      messages: messages.filter((m) => m.role === "user"),
    });
    return res.content[0].type === "text" ? res.content[0].text : "";
  },
};

// Local (Ollama)
const localLLM: LLMProvider = {
  chat: async (messages) => {
    const res = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      body: JSON.stringify({ model: "qwen2.5", messages, format: "json" }),
    });
    const json = await res.json();
    return json.message.content;
  },
};
```

---

## Game Design Ontology

[`src/graph/types.ts`](src/graph/types.ts)

### Entity Types

| Type | Description | Examples |
|---|---|---|
| `game-system` | Top-level game systems | Combat, Economy, Progression, Social |
| `mechanic` | Specific gameplay mechanics | Core Loop, Dodge Roll, Combo System |
| `currency` | In-game currencies or resources | Gold, Gems, Energy, Stamina |
| `feature` | Distinct game features | PvP Arena, Guild Wars, Daily Quest |
| `character-class` | Player classes or archetypes | Warrior, Mage, Rogue |
| `constraint` | Balance rules and limits | Level Cap, Rate Limit, Anti-cheat |
| `design-pattern` | Known design patterns | Battle Pass, Skill Tree, Gacha |
| `reference-game` | Games referenced for inspiration | Dark Souls, Genshin Impact |
| `misc` | Catch-all fallback | Anything that doesn't fit above |

### Relation Types

| Type | Meaning | Example |
|---|---|---|
| `depends_on` | A requires B to function | Combat → Stamina |
| `conflicts_with` | Increasing A reduces B's effectiveness | Stealth ↔ Combat |
| `synergizes_with` | A + B > sum of parts | Combo System + Skill Tree |
| `contains` | A has B as sub-system | Combat → Dodge Roll |
| `balanced_by` | A is kept in check by B | DPS → Cooldowns |
| `feeds_into` | Output of A is input of B | Quest Rewards → Economy |
| `inspired_by` | Design inspired by reference | PvP Arena → Dark Souls |
| `supersedes` | New design replaces old | Skill Tree v2 → Skill Tree v1 |
| `variant_of` | A is a variation of B | Ranked PvP → PvP Arena |

---

## Development

```bash
# Install dependencies
bun install

# Run tests (232 tests)
bun test

# TypeScript check
bun run typecheck

# Build
bun run build

# Run evaluator
bun run src/eval/evaluator.ts
```

### Project Structure

```
src/
├── knowledge.ts              # Main entry: KnowledgeTool class
├── index.ts                  # Public exports
├── parse/                    # Multi-format document parsing
├── normalise/                # Text normalization + citation building
├── chunk/                    # BM25-optimized chunking
├── index/                    # Search indexes + retrieval strategies
│   ├── orama-index.ts        #   BM25 search (Orama)
│   ├── focused-retrieval.ts  #   BM25 + graph expansion
│   └── deep-retrieval.ts     #   LLM query decomposition
├── graph/                    # Knowledge graph
│   ├── types.ts              #   Entity/Relation Zod schemas
│   ├── graph-store.ts        #   In-memory graph store
│   ├── graph-builder.ts      #   LLM extraction → graph construction
│   └── dedup.ts              #   Entity deduplication (Jaccard)
├── extract/                  # Extraction (rule-based + LLM)
│   ├── schemas.ts            #   Rule-based schemas
│   ├── llm-types.ts          #   LLMProvider interface
│   └── llm-extractor.ts      #   LLM entity/relation extraction
├── api/                      # High-level APIs
│   ├── document-access.ts    #   Document view access
│   └── design-context.ts     #   Feature design context builder
├── eval/                     # Evaluation framework
│   ├── golden-dataset.ts     #   Golden queries (lexical + graph-aware)
│   ├── metrics.ts            #   recall@K, MRR, NDCG, entity metrics
│   └── evaluator.ts          #   Eval runner + JSON report
├── types/                    # Shared Zod schemas
│   ├── document.ts           #   SourceDocument, DocumentStructureNode
│   ├── chunk.ts              #   KnowledgeChunk
│   ├── citation.ts           #   CitationRef
│   ├── api.ts                #   Search/GetDocument request/result
│   └── extraction.ts         #   StructuredExtraction
└── knowledge/
    └── fixtures/             # Test fixtures (game design docs)
```

### Dependencies

| Package | Purpose |
|---|---|
| `@orama/orama` | BM25 search engine |
| `zod` | Schema validation |
| `unpdf` | PDF parsing |
| `mammoth` | DOCX parsing |
| `csv-parse` | CSV parsing |
| `js-yaml` | YAML parsing |
| `gpt-tokenizer` | Token counting |
| `commander` | CLI (future) |

Zero external dependencies for the graph layer — uses plain `Map`-based adjacency list.
