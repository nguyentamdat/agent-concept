export type { GraphStore } from "./graph-store";
export { createGraphStore, deserializeGraph } from "./graph-store";
export {
  EntityTypeEnum, GameEntitySchema, RelationTypeEnum, GameRelationSchema,
  type EntityType, type GameEntity, type RelationType, type GameRelation,
  type GraphStats, type SerializedGraph,
} from "./types";
export {
  normalizeEntityName, entityNameSimilarity, mergeEntities, DEDUP_SIMILARITY_THRESHOLD,
} from "./dedup";
export { buildGraphFromChunks, type GraphBuildOptions, type GraphBuildProgress, type GraphBuildResult } from "./graph-builder";
