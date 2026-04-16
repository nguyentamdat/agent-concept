# Retrieval Modes — Comparison Guide

How to choose the right retrieval mode for your use case.

**Source files:**
- Lexical search: [`src/index/orama-index.ts`](../src/index/orama-index.ts)
- Focused search: [`src/index/focused-retrieval.ts`](../src/index/focused-retrieval.ts)
- Deep search: [`src/index/deep-retrieval.ts`](../src/index/deep-retrieval.ts)
- Search types: [`src/types/api.ts`](../src/types/api.ts)

---

## At a Glance

| | Lexical | Focused | Deep |
|---|---|---|---|
| **Method** | `search()` | `search()` | `deepSearch()` |
| **Sync/Async** | Sync | Sync | Async |
| **Requires LLM** | No | No | Yes |
| **Requires Graph** | No | Optional | Optional |
| **Latency** | < 5ms | < 10ms | 1-10s |
| **Best For** | Quick lookup, keyword search | Related concepts, dependencies | Complex design questions |

---

## Lexical

```typescript
tool.search({
  query: "combat stamina",
  topK: 5,
  retrievalMode: "lexical",
  includeRawText: false,
  includeStructured: false,
});
```

**How it works:** BM25 keyword matching via [Orama](https://docs.oramasearch.com/).

**When to use:**
- Known keyword search
- Fast lookups
- No graph built yet
- Simple term matching

**Limitations:**
- No understanding of relationships between concepts
- Can't find "Stamina System" when searching for "combat" (no shared keywords)
- No query decomposition

---

## Focused

```typescript
tool.search({
  query: "combat",
  topK: 5,
  retrievalMode: "focused",
  includeRawText: false,
  includeStructured: false,
});
```

**How it works:** BM25 + entity graph expansion (1-hop neighbors).

**When to use:**
- Want related concepts alongside direct matches
- Understanding dependencies ("what does X depend on?")
- Graph is built but don't want LLM at query time

**Graceful degradation:** Falls back to lexical if graph not built.

**Scoring formula:**
```
For BM25 results:     finalScore = bm25Score
For graph-expanded:   finalScore = 0.5 × 0.5^depth  (entity bonus × decay^hops)
```

**Example:** Search "combat" → BM25 finds combat chunks. Graph expansion finds Stamina System (via `depends_on` edge) and adds stamina chunks with entity bonus score.

---

## Deep

```typescript
const result = await tool.deepSearch(
  "How should PvP economy interact with progression?",
  { llm: myLLM, topK: 10, timeoutMs: 10000 }
);
```

**How it works:** LLM decomposes query → parallel multi-pass BM25 → entity tracking → relationship chains → markdown synthesis.

**When to use:**
- Complex design questions spanning multiple systems
- Agent needs structured context (entities, relationships, implications)
- Willing to pay LLM latency/cost for richer results

**Graceful degradation:**
- Graph null → still works (just no entity/relationship tracking)
- LLM timeout → falls back to single-pass BM25 + entity lookup
- LLM fails to decompose → fallback sub-queries used

**Result structure:**
```typescript
{
  chunks: [...],           // ranked search results
  subQueries: [...],       // decomposed queries
  entities: [...],         // GameEntity[] from result chunks
  relationships: [...],    // GameRelation[] between found entities
  synthesisContext: "...", // markdown ready for agent prompt
}
```

**Timeout:** Default 10s. Configurable via `timeoutMs`. On timeout, returns partial results from fallback search.

---

## Decision Flowchart

```
Need search results?
    │
    ├── Quick keyword lookup? ─────────── → lexical
    │
    ├── Want related concepts too? ────── → focused
    │   (graph built? yes → expansion)
    │   (graph built? no → falls back to lexical)
    │
    └── Complex multi-system question? ── → deepSearch
        (have LLM? yes → decomposition + entity tracking)
        (timeout? → fallback to lexical + entity lookup)
```

---

## Performance Characteristics

| Mode | Typical Latency | LLM Calls | Memory |
|---|---|---|---|
| Lexical | 0.1 - 1ms | 0 | Orama index |
| Focused | 1 - 10ms | 0 | Orama + GraphStore |
| Deep | 1 - 10s | 1 (decomposition) | Orama + GraphStore |

The graph is stored in-memory as plain Maps. For typical game design knowledge bases (100s of entities), memory overhead is negligible (< 1MB).
