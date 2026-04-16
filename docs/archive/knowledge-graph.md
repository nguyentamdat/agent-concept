# Knowledge Graph — In-Depth Guide

How the knowledge graph layer works, from document ingestion to agent-ready context.

**Source files:**
- Types: [`src/graph/types.ts`](../src/graph/types.ts)
- Store: [`src/graph/graph-store.ts`](../src/graph/graph-store.ts)
- Builder: [`src/graph/graph-builder.ts`](../src/graph/graph-builder.ts)
- Dedup: [`src/graph/dedup.ts`](../src/graph/dedup.ts)
- LLM Extractor: [`src/extract/llm-extractor.ts`](../src/extract/llm-extractor.ts)
- LLM Types: [`src/extract/llm-types.ts`](../src/extract/llm-types.ts)

---

## Overview

The knowledge graph adds a structured entity-relationship layer on top of the existing chunk-based search. It answers questions that flat text search can't:

| Question | BM25 Only | With Knowledge Graph |
|---|---|---|
| "What does Combat depend on?" | Random chunks containing "combat" | `Combat → depends_on → Stamina` |
| "What conflicts with Stealth?" | Chunks containing "stealth" | `Combat → conflicts_with → Stealth` |
| "What systems does PvP affect?" | Keyword matches | Graph traversal of all connected systems |

---

## Building the Graph

### Pipeline

```
All ingested chunks
    │
    ▼
1. Batch by section ──→ groups of 5 chunks sharing the same top-level section
    │
    ▼
2. LLM extraction ──→ entities + relations per batch (parallel, max 3 concurrent)
    │
    ▼
3. Anti-hallucination ──→ entity name must appear in source chunk text
    │
    ▼
4. Deduplication ──→ Jaccard similarity ≥ 0.7 → merge
    │
    ▼
5. Relation resolution ──→ map entity names → entity IDs
    │
    ▼
6. Validation ──→ orphaned relations removed with warning
    │
    ▼
GraphStore (in-memory Map-based adjacency list)
```

### Code

```typescript
import { KnowledgeTool } from "knowledge-layer";
import type { LLMProvider } from "knowledge-layer/extract/llm-types";

const tool = new KnowledgeTool();

// Ingest all documents first
await tool.ingest("docs/gdd.md");
await tool.ingest("docs/economy.pdf");

// Build graph with progress tracking
const stats = await tool.buildGraph({
  llm: myLLM,
  batchSize: 5,
  onProgress: (p) => {
    console.log(`[${p.phase}] ${p.current}/${p.total} — ${p.message}`);
  },
});

console.log(stats);
// { entityCount: 42, relationCount: 18, entityTypeCounts: { "game-system": 8, ... } }
```

---

## Entity Extraction

**Source:** [`src/extract/llm-extractor.ts`](../src/extract/llm-extractor.ts)

### How Extraction Works

1. Chunks are grouped by document + section (5 per batch by default)
2. Each batch is sent to LLM with a game-design-specific system prompt
3. LLM returns JSON with `entities[]` and `relations[]`
4. Each entity is validated:
   - Name must appear in source text (case-insensitive) — **anti-hallucination**
   - `evidenceQuote` must be a substring of the source text
   - Entities that fail are dropped with a warning
5. Relations are resolved by matching `sourceName`/`targetName` to extracted entities

### Failure Handling

| Failure Mode | Behavior |
|---|---|
| LLM call throws | Retry up to 3 times with 500ms/1000ms backoff |
| LLM returns invalid JSON | Add warning, return empty for this batch |
| LLM returns valid JSON with bad schema | Add warning, return empty for this batch |
| Individual entity hallucinated | Drop that entity, keep good ones, add warning |
| Relation references non-existent entity | Drop that relation, add warning |
| All batches fail | Return `{ entities: [], relations: [], warnings: [...] }` |

### LLM Prompt

The system prompt asks for:
- **Entities**: Named game systems, mechanics, features, currencies, constraints, patterns
- **Relations**: How entities connect (depends_on, conflicts_with, etc.)
- **Evidence**: Exact quotes from source text proving each entity/relation exists

---

## Entity Deduplication

**Source:** [`src/graph/dedup.ts`](../src/graph/dedup.ts)

### Algorithm

1. **Normalize names**: lowercase, strip suffixes (" system", " mechanic", " loop", etc.), collapse whitespace
2. **Tokenize**: split on non-alphanumeric characters
3. **Jaccard similarity**: `|intersection(tokens_A, tokens_B)| / |union(tokens_A, tokens_B)|`
4. **Threshold**: similarity ≥ 0.7 → entities are merged

### Merge Policy

| Field | Rule |
|---|---|
| `type` | Keep more specific (mechanic > game-system > feature > currency > ...) |
| `description` | Concatenate with ` \| ` separator if different |
| `aliases` | Union of both sets + both original names |
| `sourceChunkIds` | Union |
| `sourceDocumentIds` | Union |
| `entityId` | Keep existing entity's ID |

### Type Specificity Order

```
misc (0) < reference-game (1) < character-class (2) < design-pattern (3)
< constraint (4) < currency (5) < feature (6) < game-system (7) < mechanic (8)
```

### Examples

| Entity A | Entity B | Similarity | Merged? |
|---|---|---|---|
| "Combat System" | "Combat" | 1.0 (normalized: "combat") | ✅ Yes |
| "Economy System" | "Economy" | 1.0 | ✅ Yes |
| "Economy" | "Combat" | 0.0 | ❌ No |
| "Core Loop" | "Core" | 1.0 (strip " loop") | ✅ Yes |

---

## Graph Store

**Source:** [`src/graph/graph-store.ts`](../src/graph/graph-store.ts)

### Data Structure

Plain `Map`-based adjacency list. No external graph library needed.

```
entities:         Map<entityId, GameEntity>
relationsFrom:    Map<entityId, GameRelation[]>     // outgoing
relationsTo:      Map<entityId, GameRelation[]>     // incoming
chunkToEntityIds: Map<chunkId, Set<entityId>>       // bidirectional links
```

### Key Operations

| Method | Complexity | Description |
|---|---|---|
| `getEntity(id)` | O(1) | Direct map lookup |
| `findEntitiesByName(query)` | O(n) | Fuzzy: normalized name/alias substring match |
| `findEntitiesByType(type)` | O(n) | Filter by entity type |
| `getNeighbors(id, depth)` | O(V+E) | BFS, cycle-safe (visited Set) |
| `getDependencyChain(id)` | O(V+E) | BFS following only `depends_on`, cycle-safe |
| `getEntitiesForChunk(chunkId)` | O(k) | k = entities linked to chunk |
| `getChunksForEntity(entityId)` | O(m) | m = chunks in chunkToEntityIds |

### Serialization

```typescript
const serialized = graph.serialize();  // → { entities, relations, chunkToEntityIds }
const restored = deserializeGraph(serialized);
```

JSON-serializable. Can persist to file and restore later.

---

## Retrieval Strategies

### Lexical (existing, unchanged)

**Source:** [`src/index/orama-index.ts`](../src/index/orama-index.ts)

BM25 keyword search. Fast, deterministic, no LLM needed.

### Focused (new, sync)

**Source:** [`src/index/focused-retrieval.ts`](../src/index/focused-retrieval.ts)

BM25 + entity graph expansion:

```
Query "combat"
    │
    ▼
BM25 top-K → [chunk_combat_1, chunk_combat_2]
    │
    ▼
Find entities in results → [Combat System]
    │
    ▼
Find entities by query terms → [Combat System]  (fuzzy name match)
    │
    ▼
Graph: getNeighbors(Combat, depth=1) → [Stamina System]
    │
    ▼
Get chunks for Stamina → [chunk_stamina_1]
    │
    ▼
Fetch chunks by ID (getChunkById, NOT re-search)
    │
    ▼
Score: entityBonus = 0.5 × 0.5^1 = 0.25
    │
    ▼
Merge + sort → [chunk_combat_1, chunk_combat_2, chunk_stamina_1]
```

**Falls back to lexical** if graph is null (not built yet).

### Deep (new, async)

**Source:** [`src/index/deep-retrieval.ts`](../src/index/deep-retrieval.ts)

LLM query decomposition + multi-pass + entity tracking:

```
Query "How should PvP economy interact with progression?"
    │
    ▼
LLM decomposes → ["PvP economy design", "progression rewards", "economy-progression balance"]
    │
    ├── BM25("PvP economy design") → chunks
    ├── BM25("progression rewards") → chunks        (parallel)
    └── BM25("economy-progression balance") → chunks
    │
    ▼
Deduplicate by chunkId (keep highest score)
    │
    ▼
If graph exists:
  → Find entities in result chunks
  → Get relationships between found entities
    │
    ▼
Build synthesisContext (markdown)
```

**Timeout:** Default 10s. On timeout, falls back to single-pass BM25 + entity lookup.

---

## Design Context for Agents

**Source:** [`src/api/design-context.ts`](../src/api/design-context.ts)

The highest-level API. Given a feature description, returns everything an agent needs to design it safely.

### Conflict Detection

```
Feature entities (from search results + description term matching)
    │
    ├── HIGH: entity → conflicts_with → target
    │         (direct conflict edge)
    │
    ├── MEDIUM: entity → depends_on chain (depth ≤ 2) → dep → conflicts_with → target
    │           (transitive dependency leads to conflict)
    │
    └── LOW: entity → synergizes_with → synergy → conflicts_with → target
              (synergy partner has conflict)
```

### contextString Format

Ready for direct injection into agent prompts:

```markdown
## Relevant Facts
- [evidence snippets from search results]

## Entities Found
- **Combat System** (game-system): Handles all combat interactions
- **Stealth System** (game-system): Handles stealth mechanics

## Relationships
- Combat System --[depends_on]--> Stamina System
- Combat System --[conflicts_with]--> Stealth System

## Conflicts
- [HIGH] Combat System directly conflicts with Stealth System

## Recommendations
- ⚠️ High-severity conflicts detected. Review before implementing.
- Relevant design patterns: Skill Tree, Battle Pass
- Reference games: Dark Souls
- Feature description: "Add PvP arena with combat and stealth mechanics"
```
