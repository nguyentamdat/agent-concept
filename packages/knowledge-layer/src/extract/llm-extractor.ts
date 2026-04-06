import { normalizeEntityName, DEDUP_SIMILARITY_THRESHOLD, entityNameSimilarity } from "../graph/dedup";
import type { GameEntity, GameRelation } from "../graph/types";
import type { KnowledgeChunk } from "../types";
import { type LLMProvider, LLMExtractionResponseSchema } from "./llm-types";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;

function hashString(value: string): string {
  let hash = FNV_OFFSET_BASIS;
  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }
  return hash.toString(16).padStart(8, "0");
}

export interface LLMExtractorOptions {
  llm: LLMProvider;
  batchSize?: number;
  maxConcurrency?: number;
  existingEntityNames?: string[];
}

export interface LLMExtractionResult {
  entities: GameEntity[];
  relations: GameRelation[];
  warnings: string[];
}

const SYSTEM_PROMPT = `You are a game design knowledge extraction expert. Given game design document chunks, extract:
1. ENTITIES: Named game systems, mechanics, features, currencies, constraints, patterns
2. RELATIONS: How entities connect

Entity types: game-system, mechanic, currency, feature, character-class, constraint, design-pattern, reference-game, misc
Relation types: depends_on, conflicts_with, synergizes_with, contains, balanced_by, feeds_into, inspired_by, supersedes, variant_of

Rules:
- Entity names should be canonical (e.g. "Combat System" not "the combat")
- Only extract entities that are concrete game design concepts
- Relations must have evidence in the text
- If unsure about entity type, use "misc"
- evidenceQuote must be an exact substring from the provided text

Return ONLY valid JSON matching this schema:
{
  "entities": [{ "name": string, "type": EntityType, "description": string, "aliases": string[], "evidenceQuote": string }],
  "relations": [{ "sourceName": string, "targetName": string, "type": RelationType, "description": string, "evidenceQuote": string }]
}`;

function buildUserPrompt(chunks: KnowledgeChunk[], existingEntityNames: string[]): string {
  const chunkTexts = chunks.map((c, i) => `[Chunk ${i + 1}]\n${c.text}`).join("\n\n");
  const existingHint =
    existingEntityNames.length > 0
      ? `\nExisting entities (merge if same concept): ${existingEntityNames.join(", ")}`
      : "";
  return `${chunkTexts}${existingHint}`;
}

function groupChunksBySection(chunks: KnowledgeChunk[], batchSize: number): KnowledgeChunk[][] {
  const bySection = new Map<string, KnowledgeChunk[]>();
  for (const chunk of chunks) {
    const sectionKey = chunk.sectionPath[0] ?? chunk.documentId;
    const group = bySection.get(sectionKey) ?? [];
    group.push(chunk);
    bySection.set(sectionKey, group);
  }

  const batches: KnowledgeChunk[][] = [];
  for (const group of bySection.values()) {
    for (let i = 0; i < group.length; i += batchSize) {
      batches.push(group.slice(i, i + batchSize));
    }
  }
  return batches;
}

async function extractBatch(
  batch: KnowledgeChunk[],
  llm: LLMProvider,
  existingEntityNames: string[]
): Promise<LLMExtractionResult> {
  const warnings: string[] = [];
  const batchText = batch.map((c) => c.text).join("\n\n");

  let rawResponse = "";
  let lastError: unknown;

  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      rawResponse = await llm.chat([
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: buildUserPrompt(batch, existingEntityNames) },
      ]);
      break;
    } catch (error) {
      lastError = error;
      if (attempt < 2) {
        await new Promise((resolve) => setTimeout(resolve, 500 * (attempt + 1)));
      }
    }
  }

  if (!rawResponse) {
    warnings.push(`LLM call failed after 3 attempts: ${String(lastError)}`);
    return { entities: [], relations: [], warnings };
  }

  let parsed: unknown;
  try {
    // Strip markdown code fences if present
    const cleaned = rawResponse.replace(/^```(?:json)?\n?/m, "").replace(/\n?```$/m, "").trim();
    parsed = JSON.parse(cleaned);
  } catch {
    warnings.push(`Failed to parse LLM JSON response: ${rawResponse.slice(0, 200)}`);
    return { entities: [], relations: [], warnings };
  }

  const validation = LLMExtractionResponseSchema.safeParse(parsed);
  if (!validation.success) {
    warnings.push(`LLM response failed schema validation: ${validation.error.message}`);
    return { entities: [], relations: [], warnings };
  }

  const response = validation.data;
  const entities: GameEntity[] = [];
  const rawRelations = response.relations;

  for (const rawEntity of response.entities) {
    // Anti-hallucination: entity name must appear in source text
    const nameInText = batchText.toLowerCase().includes(rawEntity.name.toLowerCase());
    const quoteInText = batchText.toLowerCase().includes(rawEntity.evidenceQuote.toLowerCase().slice(0, 30));
    if (!nameInText && !quoteInText) {
      warnings.push(`Dropped hallucinated entity "${rawEntity.name}" — not found in source text`);
      continue;
    }

    const chunkIds = batch
      .filter((c) => c.text.toLowerCase().includes(rawEntity.name.toLowerCase()))
      .map((c) => c.chunkId);

    const documentIds = [...new Set(batch.map((c) => c.documentId))];

    entities.push({
      entityId: hashString(`${normalizeEntityName(rawEntity.name)}:${rawEntity.type}`),
      name: rawEntity.name,
      type: rawEntity.type,
      description: rawEntity.description,
      aliases: rawEntity.aliases,
      sourceChunkIds: chunkIds.length > 0 ? chunkIds : batch.map((c) => c.chunkId),
      sourceDocumentIds: documentIds,
    });
  }

  // Build entity name → id map for relation resolution
  const entityByNormalizedName = new Map<string, GameEntity>();
  for (const entity of entities) {
    entityByNormalizedName.set(normalizeEntityName(entity.name), entity);
  }

  const relations: GameRelation[] = [];
  for (const rawRelation of rawRelations) {
    const sourceNorm = normalizeEntityName(rawRelation.sourceName);
    const targetNorm = normalizeEntityName(rawRelation.targetName);

    // Find best matching entity by normalized name similarity
    const findEntity = (normalizedName: string): GameEntity | undefined => {
      let best: GameEntity | undefined;
      let bestScore = 0;
      for (const [name, entity] of entityByNormalizedName) {
        const score = entityNameSimilarity(name, normalizedName);
        if (score > bestScore && score >= DEDUP_SIMILARITY_THRESHOLD) {
          bestScore = score;
          best = entity;
        }
      }
      return best;
    };

    const sourceEntity = findEntity(sourceNorm);
    const targetEntity = findEntity(targetNorm);

    if (!sourceEntity || !targetEntity) {
      warnings.push(
        `Dropped relation "${rawRelation.sourceName}" --[${rawRelation.type}]--> "${rawRelation.targetName}" — could not resolve entity IDs`
      );
      continue;
    }

    relations.push({
      relationId: hashString(`${sourceEntity.entityId}:${targetEntity.entityId}:${rawRelation.type}`),
      sourceEntityId: sourceEntity.entityId,
      targetEntityId: targetEntity.entityId,
      type: rawRelation.type,
      description: rawRelation.description || undefined,
      evidenceChunkIds: batch.map((c) => c.chunkId),
    });
  }

  return { entities, relations, warnings };
}

export async function extractEntitiesFromChunks(
  chunks: KnowledgeChunk[],
  options: LLMExtractorOptions
): Promise<LLMExtractionResult> {
  const { llm, batchSize = 5, maxConcurrency = 3, existingEntityNames = [] } = options;

  if (chunks.length === 0) {
    return { entities: [], relations: [], warnings: [] };
  }

  const batches = groupChunksBySection(chunks, batchSize);
  const allEntities: GameEntity[] = [];
  const allRelations: GameRelation[] = [];
  const allWarnings: string[] = [];

  // Process batches with limited concurrency
  for (let i = 0; i < batches.length; i += maxConcurrency) {
    const concurrentBatches = batches.slice(i, i + maxConcurrency);
    const results = await Promise.all(
      concurrentBatches.map((batch) => extractBatch(batch, llm, existingEntityNames))
    );

    for (const result of results) {
      allEntities.push(...result.entities);
      allRelations.push(...result.relations);
      allWarnings.push(...result.warnings);
    }
  }

  return { entities: allEntities, relations: allRelations, warnings: allWarnings };
}
