import { z } from "zod";

export const EntityTypeEnum = z.enum([
  "game-system",
  "mechanic",
  "currency",
  "feature",
  "character-class",
  "constraint",
  "design-pattern",
  "reference-game",
  "misc",
]);
export type EntityType = z.infer<typeof EntityTypeEnum>;

export const GameEntitySchema = z.object({
  entityId: z.string(),
  name: z.string(),
  type: EntityTypeEnum,
  description: z.string(),
  aliases: z.array(z.string()),
  sourceChunkIds: z.array(z.string()),
  sourceDocumentIds: z.array(z.string()),
  attributes: z.record(z.string(), z.union([z.string(), z.number(), z.boolean()])).optional(),
});
export type GameEntity = z.infer<typeof GameEntitySchema>;

export const RelationTypeEnum = z.enum([
  "depends_on",
  "conflicts_with",
  "synergizes_with",
  "contains",
  "balanced_by",
  "feeds_into",
  "inspired_by",
  "supersedes",
  "variant_of",
]);
export type RelationType = z.infer<typeof RelationTypeEnum>;

export const GameRelationSchema = z.object({
  relationId: z.string(),
  sourceEntityId: z.string(),
  targetEntityId: z.string(),
  type: RelationTypeEnum,
  description: z.string().optional(),
  evidenceChunkIds: z.array(z.string()),
});
export type GameRelation = z.infer<typeof GameRelationSchema>;

export type GraphStats = {
  entityCount: number;
  relationCount: number;
  entityTypeCounts: Record<string, number>;
  relationTypeCounts: Record<string, number>;
};

export type SerializedGraph = {
  entities: GameEntity[];
  relations: GameRelation[];
  chunkToEntityIds: Record<string, string[]>;
};
