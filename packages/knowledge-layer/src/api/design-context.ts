import type { GraphStore } from "../graph/graph-store";
import type { GameEntity, GameRelation } from "../graph/types";
import type { KnowledgeChunk } from "../types";

export interface ConflictInfo {
  entity: GameEntity;
  relation: GameRelation;
  severity: "high" | "medium" | "low";
  explanation: string;
}

export interface FeatureDesignContext {
  affectedSystems: GameEntity[];
  dependencies: GameRelation[];
  conflicts: ConflictInfo[];
  relevantPatterns: GameEntity[];
  references: GameEntity[];
  evidenceChunks: KnowledgeChunk[];
  contextString: string;
}

export interface ConflictReport {
  conflicts: ConflictInfo[];
  summary: string;
}

/**
 * Determine conflict severity based on graph distance to conflicts_with edges.
 *
 * high:   direct conflicts_with edge between feature entities and existing entity
 * medium: feature entity A → depends_on (depth ≤ 2) → B → conflicts_with → C
 * low:    feature entity A → synergizes_with → B → conflicts_with → C
 */
function classifyConflicts(
  featureEntityIds: Set<string>,
  graph: GraphStore
): ConflictInfo[] {
  const conflicts: ConflictInfo[] = [];
  const seenRelationIds = new Set<string>();

  for (const entityId of featureEntityIds) {
    // HIGH: direct conflicts_with
    const outgoing = graph.getRelationsFrom(entityId);
    for (const rel of outgoing) {
      if (rel.type === "conflicts_with" && !seenRelationIds.has(rel.relationId)) {
        seenRelationIds.add(rel.relationId);
        const targetEntity = graph.getEntity(rel.targetEntityId);
        const sourceEntity = graph.getEntity(entityId);
        if (targetEntity && sourceEntity) {
          conflicts.push({
            entity: targetEntity,
            relation: rel,
            severity: "high",
            explanation: `${sourceEntity.name} directly conflicts with ${targetEntity.name}`,
          });
        }
      }
    }

    // HIGH: incoming conflicts_with (something conflicts with this feature entity)
    const incoming = graph.getRelationsTo(entityId);
    for (const rel of incoming) {
      if (rel.type === "conflicts_with" && !seenRelationIds.has(rel.relationId)) {
        seenRelationIds.add(rel.relationId);
        const sourceEntity = graph.getEntity(rel.sourceEntityId);
        const targetEntity = graph.getEntity(entityId);
        if (sourceEntity && targetEntity) {
          conflicts.push({
            entity: sourceEntity,
            relation: rel,
            severity: "high",
            explanation: `${sourceEntity.name} conflicts with ${targetEntity.name}`,
          });
        }
      }
    }

    // MEDIUM: depends_on chain (depth ≤ 2) → conflicts_with
    const depChain = graph.getDependencyChain(entityId);
    const depChainIds = new Set(depChain.map((e) => e.entityId));
    for (const depEntity of depChain) {
      const depOutgoing = graph.getRelationsFrom(depEntity.entityId);
      for (const rel of depOutgoing) {
        if (rel.type === "conflicts_with" && !seenRelationIds.has(rel.relationId)) {
          // Only include if target is NOT already a feature entity (would be high)
          if (!featureEntityIds.has(rel.targetEntityId)) {
            seenRelationIds.add(rel.relationId);
            const targetEntity = graph.getEntity(rel.targetEntityId);
            const sourceEntity = graph.getEntity(entityId);
            if (targetEntity && sourceEntity) {
              conflicts.push({
                entity: targetEntity,
                relation: rel,
                severity: "medium",
                explanation: `${sourceEntity.name} depends on ${depEntity.name} which conflicts with ${targetEntity.name}`,
              });
            }
          }
        }
      }
    }

    // LOW: synergizes_with → conflicts_with
    for (const rel of outgoing) {
      if (rel.type === "synergizes_with") {
        const synEntity = graph.getEntity(rel.targetEntityId);
        if (!synEntity) continue;
        const synOutgoing = graph.getRelationsFrom(synEntity.entityId);
        for (const synRel of synOutgoing) {
          if (synRel.type === "conflicts_with" && !seenRelationIds.has(synRel.relationId)) {
            if (!featureEntityIds.has(synRel.targetEntityId)) {
              seenRelationIds.add(synRel.relationId);
              const targetEntity = graph.getEntity(synRel.targetEntityId);
              const sourceEntity = graph.getEntity(entityId);
              if (targetEntity && sourceEntity) {
                conflicts.push({
                  entity: targetEntity,
                  relation: synRel,
                  severity: "low",
                  explanation: `${sourceEntity.name} synergizes with ${synEntity.name} which conflicts with ${targetEntity.name}`,
                });
              }
            }
          }
        }
      }
    }
  }

  return conflicts;
}

function buildContextString(
  description: string,
  affectedSystems: GameEntity[],
  dependencies: GameRelation[],
  conflicts: ConflictInfo[],
  relevantPatterns: GameEntity[],
  references: GameEntity[],
  evidenceChunks: KnowledgeChunk[],
  entityMap: Map<string, GameEntity>
): string {
  const lines: string[] = [];

  lines.push("## Relevant Facts");
  if (evidenceChunks.length === 0) {
    lines.push("- No relevant facts found.");
  } else {
    for (const chunk of evidenceChunks.slice(0, 8)) {
      const snippet = chunk.text.slice(0, 200).replace(/\n/g, " ");
      lines.push(`- ${snippet}`);
    }
  }

  lines.push("");
  lines.push("## Entities Found");
  if (affectedSystems.length === 0) {
    lines.push("- No entities identified.");
  } else {
    for (const entity of affectedSystems) {
      lines.push(`- **${entity.name}** (${entity.type}): ${entity.description.slice(0, 100)}`);
    }
  }

  lines.push("");
  lines.push("## Relationships");
  if (dependencies.length === 0) {
    lines.push("- No relationships identified.");
  } else {
    for (const rel of dependencies.slice(0, 10)) {
      const source = entityMap.get(rel.sourceEntityId)?.name ?? rel.sourceEntityId;
      const target = entityMap.get(rel.targetEntityId)?.name ?? rel.targetEntityId;
      lines.push(`- ${source} --[${rel.type}]--> ${target}`);
    }
  }

  lines.push("");
  lines.push("## Conflicts");
  if (conflicts.length === 0) {
    lines.push("- No conflicts detected.");
  } else {
    for (const conflict of conflicts) {
      lines.push(`- [${conflict.severity.toUpperCase()}] ${conflict.explanation}`);
    }
  }

  lines.push("");
  lines.push("## Recommendations");
  if (conflicts.some((c) => c.severity === "high")) {
    lines.push("- ⚠️ High-severity conflicts detected. Review before implementing.");
  }
  if (relevantPatterns.length > 0) {
    lines.push(`- Relevant design patterns: ${relevantPatterns.map((p) => p.name).join(", ")}`);
  }
  if (references.length > 0) {
    lines.push(`- Reference games: ${references.map((r) => r.name).join(", ")}`);
  }
  lines.push(`- Feature description: "${description}"`);

  return lines.join("\n");
}

export function buildFeatureDesignContext(
  description: string,
  graph: GraphStore | null,
  evidenceChunks: KnowledgeChunk[]
): FeatureDesignContext {
  if (!graph) {
    return {
      affectedSystems: [],
      dependencies: [],
      conflicts: [],
      relevantPatterns: [],
      references: [],
      evidenceChunks,
      contextString: buildContextString(description, [], [], [], [], [], evidenceChunks, new Map()),
    };
  }

  // Find entities mentioned in evidence chunks
  const featureEntityIds = new Set<string>();
  for (const chunk of evidenceChunks) {
    const entities = graph.getEntitiesForChunk(chunk.chunkId);
    for (const entity of entities) {
      featureEntityIds.add(entity.entityId);
    }
  }

  // Also search by description terms
  const descTerms = description.toLowerCase().split(/\s+/).filter((t) => t.length > 3);
  for (const term of descTerms) {
    const entities = graph.findEntitiesByName(term);
    for (const entity of entities) {
      featureEntityIds.add(entity.entityId);
    }
  }

  const affectedSystems: GameEntity[] = [];
  const entityMap = new Map<string, GameEntity>();
  for (const entityId of featureEntityIds) {
    const entity = graph.getEntity(entityId);
    if (entity) {
      affectedSystems.push(entity);
      entityMap.set(entityId, entity);
    }
  }

  // Collect all relations between affected entities
  const dependencies: GameRelation[] = [];
  const seenRelIds = new Set<string>();
  for (const entityId of featureEntityIds) {
    const rels = [
      ...graph.getRelationsFrom(entityId),
      ...graph.getRelationsTo(entityId),
    ];
    for (const rel of rels) {
      if (!seenRelIds.has(rel.relationId)) {
        seenRelIds.add(rel.relationId);
        dependencies.push(rel);
        // Add related entities to map
        const src = graph.getEntity(rel.sourceEntityId);
        const tgt = graph.getEntity(rel.targetEntityId);
        if (src) entityMap.set(src.entityId, src);
        if (tgt) entityMap.set(tgt.entityId, tgt);
      }
    }
  }

  const conflicts = classifyConflicts(featureEntityIds, graph);
  const relevantPatterns = graph.findEntitiesByType("design-pattern");
  const references = graph.findEntitiesByType("reference-game");

  const contextString = buildContextString(
    description,
    affectedSystems,
    dependencies,
    conflicts,
    relevantPatterns,
    references,
    evidenceChunks,
    entityMap
  );

  return {
    affectedSystems,
    dependencies,
    conflicts,
    relevantPatterns,
    references,
    evidenceChunks,
    contextString,
  };
}

export function buildConflictReport(
  graph: GraphStore | null,
  entityIds: string[]
): ConflictReport {
  if (!graph || entityIds.length === 0) {
    return { conflicts: [], summary: "No graph available or no entities specified." };
  }

  const featureEntityIds = new Set(entityIds);
  const conflicts = classifyConflicts(featureEntityIds, graph);

  const highCount = conflicts.filter((c) => c.severity === "high").length;
  const medCount = conflicts.filter((c) => c.severity === "medium").length;
  const lowCount = conflicts.filter((c) => c.severity === "low").length;

  const summary =
    conflicts.length === 0
      ? "No conflicts detected."
      : `Found ${conflicts.length} conflict(s): ${highCount} high, ${medCount} medium, ${lowCount} low.`;

  return { conflicts, summary };
}
