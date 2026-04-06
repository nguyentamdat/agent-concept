import { extractEntitiesFromChunks } from "../extract/llm-extractor";
import type { LLMProvider } from "../extract/llm-types";
import type { KnowledgeChunk } from "../types";
import { DEDUP_SIMILARITY_THRESHOLD, entityNameSimilarity, mergeEntities, normalizeEntityName } from "./dedup";
import { createGraphStore, type GraphStore } from "./graph-store";
import type { GameEntity, GraphStats } from "./types";

export interface GraphBuildProgress {
  phase: "extracting" | "deduplicating" | "linking" | "validating";
  current: number;
  total: number;
  message: string;
}

export interface GraphBuildOptions {
  llm: LLMProvider;
  batchSize?: number;
  onProgress?: (progress: GraphBuildProgress) => void;
}

export interface GraphBuildResult {
  graph: GraphStore;
  stats: GraphStats;
  warnings: string[];
}

function reportProgress(
  onProgress: ((p: GraphBuildProgress) => void) | undefined,
  phase: GraphBuildProgress["phase"],
  current: number,
  total: number,
  message: string
): void {
  onProgress?.({ phase, current, total, message });
}

export async function buildGraphFromChunks(
  chunks: KnowledgeChunk[],
  options: GraphBuildOptions
): Promise<GraphBuildResult> {
  const { llm, batchSize = 5, onProgress } = options;
  const warnings: string[] = [];

  if (chunks.length === 0) {
    const graph = createGraphStore();
    return { graph, stats: graph.stats(), warnings };
  }

  // Step 1: Extract entities + relations from all chunks
  reportProgress(onProgress, "extracting", 0, chunks.length, "Extracting entities from chunks...");

  const extractionResult = await extractEntitiesFromChunks(chunks, {
    llm,
    batchSize,
    maxConcurrency: 3,
  });

  warnings.push(...extractionResult.warnings);

  reportProgress(
    onProgress,
    "extracting",
    chunks.length,
    chunks.length,
    `Extracted ${extractionResult.entities.length} entities, ${extractionResult.relations.length} relations`
  );

  // Step 2: Deduplicate entities
  reportProgress(
    onProgress,
    "deduplicating",
    0,
    extractionResult.entities.length,
    "Deduplicating entities..."
  );

  const deduplicatedEntities = deduplicateEntities(extractionResult.entities);

  reportProgress(
    onProgress,
    "deduplicating",
    deduplicatedEntities.length,
    extractionResult.entities.length,
    `Deduplicated to ${deduplicatedEntities.length} unique entities`
  );

  // Step 3: Build graph store and populate entities
  reportProgress(onProgress, "linking", 0, deduplicatedEntities.length, "Building graph links...");

  const graph = createGraphStore();
  for (const entity of deduplicatedEntities) {
    graph.addEntity(entity);
  }

  // Step 4: Resolve relation references and add to graph
  const entityByNormalizedName = buildEntityNameIndex(deduplicatedEntities);
  let linkedRelations = 0;

  for (const rawRelation of extractionResult.relations) {
    const sourceEntity = resolveEntityByName(rawRelation.sourceEntityId, deduplicatedEntities, entityByNormalizedName);
    const targetEntity = resolveEntityByName(rawRelation.targetEntityId, deduplicatedEntities, entityByNormalizedName);

    if (!sourceEntity || !targetEntity) {
      warnings.push(
        `Orphaned relation ${rawRelation.relationId}: could not resolve source or target entity`
      );
      continue;
    }

    graph.addRelation({
      ...rawRelation,
      sourceEntityId: sourceEntity.entityId,
      targetEntityId: targetEntity.entityId,
    });
    linkedRelations++;
  }

  reportProgress(
    onProgress,
    "linking",
    linkedRelations,
    extractionResult.relations.length,
    `Linked ${linkedRelations} relations`
  );

  // Step 5: Validate
  reportProgress(onProgress, "validating", 0, 1, "Validating graph...");
  const stats = graph.stats();
  reportProgress(
    onProgress,
    "validating",
    1,
    1,
    `Graph complete: ${stats.entityCount} entities, ${stats.relationCount} relations`
  );

  return { graph, stats, warnings };
}

function deduplicateEntities(entities: GameEntity[]): GameEntity[] {
  const result: GameEntity[] = [];

  for (const incoming of entities) {
    let merged = false;

    for (let i = 0; i < result.length; i++) {
      const existing = result[i];
      if (!existing) continue;

      const similarity = entityNameSimilarity(existing.name, incoming.name);
      if (similarity >= DEDUP_SIMILARITY_THRESHOLD) {
        result[i] = mergeEntities(existing, incoming);
        merged = true;
        break;
      }

      // Also check aliases
      const aliasMatch = incoming.aliases.some(
        (alias) => entityNameSimilarity(existing.name, alias) >= DEDUP_SIMILARITY_THRESHOLD
      );
      if (aliasMatch) {
        result[i] = mergeEntities(existing, incoming);
        merged = true;
        break;
      }
    }

    if (!merged) {
      result.push({ ...incoming });
    }
  }

  return result;
}

function buildEntityNameIndex(entities: GameEntity[]): Map<string, GameEntity> {
  const index = new Map<string, GameEntity>();
  for (const entity of entities) {
    index.set(normalizeEntityName(entity.name), entity);
    for (const alias of entity.aliases) {
      index.set(normalizeEntityName(alias), entity);
    }
  }
  return index;
}

function resolveEntityByName(
  entityIdOrName: string,
  entities: GameEntity[],
  nameIndex: Map<string, GameEntity>
): GameEntity | undefined {
  // First try direct entityId lookup
  const byId = entities.find((e) => e.entityId === entityIdOrName);
  if (byId) return byId;

  // Then try normalized name lookup
  const normalized = normalizeEntityName(entityIdOrName);
  const byName = nameIndex.get(normalized);
  if (byName) return byName;

  // Finally try similarity search
  let best: GameEntity | undefined;
  let bestScore = 0;
  for (const entity of entities) {
    const score = entityNameSimilarity(entity.name, entityIdOrName);
    if (score > bestScore && score >= DEDUP_SIMILARITY_THRESHOLD) {
      bestScore = score;
      best = entity;
    }
  }
  return best;
}
