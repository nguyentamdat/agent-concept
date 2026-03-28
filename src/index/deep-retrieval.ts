import type { GraphStore } from "../graph/graph-store";
import type { GameEntity, GameRelation } from "../graph/types";
import type { LLMProvider } from "../extract/llm-types";
import type { KnowledgeIndex } from "./types";
import type { SearchKnowledgeResult } from "../types";

export interface DeepSearchOptions {
  llm: LLMProvider;
  topK?: number;
  maxSubQueries?: number;
  timeoutMs?: number;
}

export interface DeepSearchResult {
  chunks: SearchKnowledgeResult["results"];
  subQueries: string[];
  entities: GameEntity[];
  relationships: GameRelation[];
  synthesisContext: string;
}

const DECOMPOSE_SYSTEM_PROMPT = `You are a game design analyst. Decompose the given design question into 3-5 sub-queries that can be searched independently in a game design knowledge base.

Each sub-query should target a different aspect:
- What systems/mechanics are involved?
- What constraints or balance rules apply?
- What patterns or references exist?
- What are the dependencies between systems?
- What potential conflicts exist?

Return ONLY a JSON array of strings: ["sub-query 1", "sub-query 2", ...]`;

async function decomposeQuery(
  query: string,
  llm: LLMProvider,
  maxSubQueries: number
): Promise<string[]> {
  try {
    const raw = await llm.chat([
      { role: "system", content: DECOMPOSE_SYSTEM_PROMPT },
      { role: "user", content: `Decompose this game design question into ${maxSubQueries} sub-queries:\n${query}` },
    ]);

    const cleaned = raw.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    const parsed = JSON.parse(cleaned);

    if (Array.isArray(parsed) && parsed.every((item) => typeof item === "string")) {
      return parsed.slice(0, maxSubQueries);
    }
  } catch {
    // Fall back to simple decomposition
  }

  // Fallback: return original query + simple variants
  return [
    query,
    `${query} systems and mechanics`,
    `${query} constraints and balance`,
    `${query} dependencies`,
  ].slice(0, maxSubQueries);
}

function buildSynthesisContext(
  query: string,
  subQueries: string[],
  chunks: SearchKnowledgeResult["results"],
  entities: GameEntity[],
  relationships: GameRelation[],
  entityMap: Map<string, GameEntity>
): string {
  const lines: string[] = [];

  lines.push("## Relevant Facts");
  const topChunks = chunks.slice(0, 10);
  if (topChunks.length === 0) {
    lines.push("- No relevant facts found.");
  } else {
    for (const result of topChunks) {
      const citation = result.citation;
      const citationStr = citation.sectionPath
        ? ` *(${citation.sectionPath})*`
        : citation.pageStart !== undefined
        ? ` *(page ${citation.pageStart})*`
        : "";
      const snippet = result.chunk.text.slice(0, 200).replace(/\n/g, " ");
      lines.push(`- ${snippet}${citationStr}`);
    }
  }

  lines.push("");
  lines.push("## Entities Found");
  if (entities.length === 0) {
    lines.push("- No entities identified.");
  } else {
    for (const entity of entities.slice(0, 15)) {
      lines.push(`- **${entity.name}** (${entity.type}): ${entity.description.slice(0, 100)}`);
    }
  }

  lines.push("");
  lines.push("## Relationships");
  if (relationships.length === 0) {
    lines.push("- No relationships identified.");
  } else {
    for (const rel of relationships.slice(0, 15)) {
      const source = entityMap.get(rel.sourceEntityId)?.name ?? rel.sourceEntityId;
      const target = entityMap.get(rel.targetEntityId)?.name ?? rel.targetEntityId;
      const desc = rel.description ? ` — ${rel.description}` : "";
      lines.push(`- ${source} --[${rel.type}]--> ${target}${desc}`);
    }
  }

  lines.push("");
  lines.push("## Design Implications");
  lines.push(
    `Based on the knowledge above, the query "${query}" involves ${entities.length} entities and ${relationships.length} relationships.`
  );
  if (subQueries.length > 1) {
    lines.push(`Analysis covered: ${subQueries.join("; ")}`);
  }

  return lines.join("\n");
}

export async function deepSearch(
  query: string,
  index: KnowledgeIndex,
  graph: GraphStore | null,
  options: DeepSearchOptions
): Promise<DeepSearchResult> {
  const { llm, topK = 10, maxSubQueries = 4, timeoutMs = 10000 } = options;

  const timeoutPromise = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error("deepSearch timeout")), timeoutMs)
  );

  const searchPromise = performDeepSearch(query, index, graph, llm, topK, maxSubQueries);

  try {
    return await Promise.race([searchPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error && error.message === "deepSearch timeout") {
      // Return partial results: just multi-pass BM25 without LLM decomposition
      return performFallbackSearch(query, index, graph, topK);
    }
    throw error;
  }
}

async function performDeepSearch(
  query: string,
  index: KnowledgeIndex,
  graph: GraphStore | null,
  llm: LLMProvider,
  topK: number,
  maxSubQueries: number
): Promise<DeepSearchResult> {
  // Step 1: Decompose query
  const subQueries = await decomposeQuery(query, llm, maxSubQueries);

  // Step 2: BM25 search each sub-query in parallel
  const subResults = await Promise.all(
    subQueries.map((subQuery) =>
      Promise.resolve(
        index.search({
          query: subQuery,
          topK: Math.ceil(topK / subQueries.length) + 2,
          retrievalMode: "lexical",
          includeRawText: false,
          includeStructured: false,
        })
      )
    )
  );

  // Step 3: Deduplicate chunks by chunkId, keep highest score
  const chunkScoreMap = new Map<string, SearchKnowledgeResult["results"][number]>();
  for (const result of subResults) {
    for (const item of result.results) {
      const existing = chunkScoreMap.get(item.chunk.chunkId);
      if (!existing || item.score > existing.score) {
        chunkScoreMap.set(item.chunk.chunkId, item);
      }
    }
  }

  const deduplicatedChunks = [...chunkScoreMap.values()]
    .sort((a, b) => b.score - a.score)
    .slice(0, topK);

  // Step 4: Find entities from results (if graph exists)
  const entities: GameEntity[] = [];
  const relationships: GameRelation[] = [];
  const entityMap = new Map<string, GameEntity>();

  if (graph) {
    const entityIds = new Set<string>();

    for (const item of deduplicatedChunks) {
      const chunkEntities = graph.getEntitiesForChunk(item.chunk.chunkId);
      for (const entity of chunkEntities) {
        entityIds.add(entity.entityId);
      }
    }

    for (const entityId of entityIds) {
      const entity = graph.getEntity(entityId);
      if (entity) {
        entities.push(entity);
        entityMap.set(entityId, entity);
      }
    }

    // Step 5: Get relationship chains between found entities
    const relationIds = new Set<string>();
    for (const entityId of entityIds) {
      const rels = graph.getRelationsFrom(entityId);
      for (const rel of rels) {
        if (entityIds.has(rel.targetEntityId) && !relationIds.has(rel.relationId)) {
          relationIds.add(rel.relationId);
          relationships.push(rel);
        }
      }
    }
  }

  // Step 6: Build synthesis context
  const synthesisContext = buildSynthesisContext(
    query,
    subQueries,
    deduplicatedChunks,
    entities,
    relationships,
    entityMap
  );

  return {
    chunks: deduplicatedChunks,
    subQueries,
    entities,
    relationships,
    synthesisContext,
  };
}

function performFallbackSearch(
  query: string,
  index: KnowledgeIndex,
  graph: GraphStore | null,
  topK: number
): DeepSearchResult {
  const result = index.search({
    query,
    topK,
    retrievalMode: "lexical",
    includeRawText: false,
    includeStructured: false,
  });

  const entities: GameEntity[] = [];
  const entityMap = new Map<string, GameEntity>();

  if (graph) {
    for (const item of result.results) {
      const chunkEntities = graph.getEntitiesForChunk(item.chunk.chunkId);
      for (const entity of chunkEntities) {
        if (!entityMap.has(entity.entityId)) {
          entityMap.set(entity.entityId, entity);
          entities.push(entity);
        }
      }
    }
  }

  const synthesisContext = buildSynthesisContext(
    query,
    [query],
    result.results,
    entities,
    [],
    entityMap
  );

  return {
    chunks: result.results,
    subQueries: [query],
    entities,
    relationships: [],
    synthesisContext,
  };
}
