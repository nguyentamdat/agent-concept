import type { GraphStore } from "../graph/graph-store";
import type { GameEntity } from "../graph/types";
import type { KnowledgeIndex } from "./types";
import type { SearchKnowledgeRequest, SearchKnowledgeResult } from "../types";

const ENTITY_BONUS = 0.5;
const ENTITY_DECAY = 0.5;

/**
 * Focused retrieval: BM25 + entity graph expansion.
 * Sync — graph traversal is pure in-memory Map lookups.
 * Falls back to lexical if graph is null.
 */
export function focusedSearch(
  request: SearchKnowledgeRequest,
  index: KnowledgeIndex,
  graph: GraphStore | null
): SearchKnowledgeResult {
  const start = performance.now();

  // Step 1: BM25 search
  const lexicalResult = index.search(request);

  if (!graph) {
    return lexicalResult;
  }

  // Step 2: Extract entity names from top results and find matching entities
  const topChunks = lexicalResult.results.map((r) => r.chunk);
  const matchedEntities = new Set<string>(); // entityIds

  for (const chunk of topChunks) {
    const entities = graph.getEntitiesForChunk(chunk.chunkId);
    for (const entity of entities) {
      matchedEntities.add(entity.entityId);
    }
  }

  // Also try name-based matching from query terms
  const queryTerms = request.query.toLowerCase().split(/\s+/).filter((t) => t.length > 2);
  for (const term of queryTerms) {
    const entities = graph.findEntitiesByName(term);
    for (const entity of entities) {
      matchedEntities.add(entity.entityId);
    }
  }

  if (matchedEntities.size === 0) {
    return lexicalResult;
  }

  // Step 3: Get neighbor entities (depth=1) for each matched entity
  const neighborEntityIds = new Set<string>();
  for (const entityId of matchedEntities) {
    const neighbors = graph.getNeighbors(entityId, 1);
    for (const neighbor of neighbors) {
      if (!matchedEntities.has(neighbor.entityId)) {
        neighborEntityIds.add(neighbor.entityId);
      }
    }
  }

  // Step 4: Get chunks linked to neighbor entities
  const expandedChunkIds = new Set<string>();
  for (const entityId of neighborEntityIds) {
    const chunkIds = graph.getChunksForEntity(entityId);
    for (const chunkId of chunkIds) {
      expandedChunkIds.add(chunkId);
    }
  }

  if (expandedChunkIds.size === 0) {
    return lexicalResult;
  }

  // Step 5: Directly fetch expanded chunks from index by chunkId
  // (BM25 re-search would miss chunks that don't match the query text)
  const seenChunkIds = new Set<string>(lexicalResult.results.map((r) => r.chunk.chunkId));
  const mergedResults: SearchKnowledgeResult["results"] = [...lexicalResult.results];

  for (const chunkId of expandedChunkIds) {
    if (seenChunkIds.has(chunkId)) continue;

    const chunk = index.getChunkById(chunkId);
    if (!chunk) continue;

    seenChunkIds.add(chunkId);

    const entityBonus = ENTITY_BONUS * ENTITY_DECAY; // depth=1 neighbors
    mergedResults.push({
      chunk,
      score: entityBonus,
      scoreBreakdown: { bm25: 0, entityBonus },
      citation: chunk.primaryCitation,
      matchedTerms: [],
    });
  }

  // Step 7: Sort by final score, return top-K
  mergedResults.sort((a, b) => b.score - a.score);
  const topResults = mergedResults.slice(0, request.topK);

  return {
    results: topResults,
    timingMs: Math.max(0, performance.now() - start),
    indexVersion: lexicalResult.indexVersion,
  };
}

export function getRelatedEntities(
  chunkIds: string[],
  graph: GraphStore
): GameEntity[] {
  const entityIds = new Set<string>();
  for (const chunkId of chunkIds) {
    const entities = graph.getEntitiesForChunk(chunkId);
    for (const entity of entities) {
      entityIds.add(entity.entityId);
    }
  }
  return [...entityIds]
    .map((id) => graph.getEntity(id))
    .filter((e): e is GameEntity => e !== undefined);
}
