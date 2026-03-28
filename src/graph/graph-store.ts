import { normalizeEntityName } from "./dedup";
import type { EntityType, GameEntity, GameRelation, GraphStats, SerializedGraph } from "./types";

export interface GraphStore {
  addEntity(entity: GameEntity): void;
  getEntity(entityId: string): GameEntity | undefined;
  getAllEntities(): GameEntity[];
  findEntitiesByName(query: string): GameEntity[];
  findEntitiesByType(type: EntityType): GameEntity[];
  addRelation(relation: GameRelation): void;
  getRelationsFrom(entityId: string): GameRelation[];
  getRelationsTo(entityId: string): GameRelation[];
  getRelationsBetween(sourceEntityId: string, targetEntityId: string): GameRelation[];
  getNeighbors(entityId: string, depth?: number): GameEntity[];
  getDependencyChain(entityId: string): GameEntity[];
  getEntitiesForChunk(chunkId: string): GameEntity[];
  getChunksForEntity(entityId: string): string[];
  stats(): GraphStats;
  serialize(): SerializedGraph;
}

export function createGraphStore(): GraphStore {
  const entities = new Map<string, GameEntity>();
  const relationsFrom = new Map<string, GameRelation[]>();
  const relationsTo = new Map<string, GameRelation[]>();
  const chunkToEntityIds = new Map<string, Set<string>>();

  const addEntity = (entity: GameEntity): void => {
    entities.set(entity.entityId, entity);
    for (const chunkId of entity.sourceChunkIds) {
      const linked = chunkToEntityIds.get(chunkId) ?? new Set<string>();
      linked.add(entity.entityId);
      chunkToEntityIds.set(chunkId, linked);
    }
  };

  const getEntity = (entityId: string): GameEntity | undefined => entities.get(entityId);

  const getAllEntities = (): GameEntity[] => [...entities.values()];

  const findEntitiesByName = (query: string): GameEntity[] => {
    const normalizedQuery = normalizeEntityName(query);
    if (!normalizedQuery) {
      return [];
    }

    const matches: GameEntity[] = [];
    for (const entity of entities.values()) {
      const nameMatch = normalizeEntityName(entity.name).includes(normalizedQuery);
      const aliasMatch = entity.aliases.some(alias => normalizeEntityName(alias).includes(normalizedQuery));
      if (nameMatch || aliasMatch) {
        matches.push(entity);
      }
    }

    return matches;
  };

  const findEntitiesByType = (type: EntityType): GameEntity[] => {
    return [...entities.values()].filter((entity) => entity.type === type);
  };

  const addRelation = (relation: GameRelation): void => {
    const from = relationsFrom.get(relation.sourceEntityId) ?? [];
    from.push(relation);
    relationsFrom.set(relation.sourceEntityId, from);

    const to = relationsTo.get(relation.targetEntityId) ?? [];
    to.push(relation);
    relationsTo.set(relation.targetEntityId, to);
  };

  const getRelationsFrom = (entityId: string): GameRelation[] => relationsFrom.get(entityId) ?? [];

  const getRelationsTo = (entityId: string): GameRelation[] => relationsTo.get(entityId) ?? [];

  const getRelationsBetween = (sourceEntityId: string, targetEntityId: string): GameRelation[] => {
    const fromSource = relationsFrom.get(sourceEntityId) ?? [];
    return fromSource.filter(relation => relation.targetEntityId === targetEntityId);
  };

  const getNeighbors = (entityId: string, depth = 1): GameEntity[] => {
    if (depth < 1 || !entities.has(entityId)) {
      return [];
    }

    const visited = new Set<string>([entityId]);
    const discovered = new Set<string>();
    const queue: Array<{ id: string; distance: number }> = [{ id: entityId, distance: 0 }];

    while (queue.length > 0) {
      const current = queue.shift();
      if (!current) {
        break;
      }

      if (current.distance >= depth) {
        continue;
      }

      const outgoing = relationsFrom.get(current.id) ?? [];
      for (const relation of outgoing) {
        const nextId = relation.targetEntityId;
        if (visited.has(nextId)) {
          continue;
        }
        visited.add(nextId);
        discovered.add(nextId);
        queue.push({ id: nextId, distance: current.distance + 1 });
      }

      const incoming = relationsTo.get(current.id) ?? [];
      for (const relation of incoming) {
        const nextId = relation.sourceEntityId;
        if (visited.has(nextId)) {
          continue;
        }
        visited.add(nextId);
        discovered.add(nextId);
        queue.push({ id: nextId, distance: current.distance + 1 });
      }
    }

    return [...discovered]
      .map(id => entities.get(id))
      .filter((entity): entity is GameEntity => entity !== undefined);
  };

  const getDependencyChain = (entityId: string): GameEntity[] => {
    if (!entities.has(entityId)) {
      return [];
    }

    const visited = new Set<string>([entityId]);
    const chain = new Set<string>();
    const queue: string[] = [entityId];

    while (queue.length > 0) {
      const currentId = queue.shift();
      if (!currentId) {
        break;
      }

      const outgoing = relationsFrom.get(currentId) ?? [];
      for (const relation of outgoing) {
        if (relation.type !== "depends_on") {
          continue;
        }
        const nextId = relation.targetEntityId;
        if (visited.has(nextId)) {
          continue;
        }
        visited.add(nextId);
        chain.add(nextId);
        queue.push(nextId);
      }
    }

    return [...chain]
      .map(id => entities.get(id))
      .filter((entity): entity is GameEntity => entity !== undefined);
  };

  const getEntitiesForChunk = (chunkId: string): GameEntity[] => {
    const entityIds = chunkToEntityIds.get(chunkId);
    if (!entityIds) {
      return [];
    }

    return [...entityIds]
      .map(entityId => entities.get(entityId))
      .filter((entity): entity is GameEntity => entity !== undefined);
  };

  const getChunksForEntity = (entityId: string): string[] => {
    const chunks: string[] = [];
    for (const [chunkId, entityIds] of chunkToEntityIds.entries()) {
      if (entityIds.has(entityId)) {
        chunks.push(chunkId);
      }
    }
    return chunks;
  };

  const stats = (): GraphStats => {
    const allRelations = getAllRelations();
    const entityTypeCounts: Record<string, number> = {};
    const relationTypeCounts: Record<string, number> = {};

    for (const entity of entities.values()) {
      entityTypeCounts[entity.type] = (entityTypeCounts[entity.type] ?? 0) + 1;
    }

    for (const relation of allRelations) {
      relationTypeCounts[relation.type] = (relationTypeCounts[relation.type] ?? 0) + 1;
    }

    return {
      entityCount: entities.size,
      relationCount: allRelations.length,
      entityTypeCounts,
      relationTypeCounts,
    };
  };

  const getAllRelations = (): GameRelation[] => {
    const deduped = new Map<string, GameRelation>();
    for (const relationList of relationsFrom.values()) {
      for (const relation of relationList) {
        deduped.set(relation.relationId, relation);
      }
    }
    return [...deduped.values()];
  };

  const serialize = (): SerializedGraph => {
    const serializedChunkToEntityIds = Object.fromEntries(
      [...chunkToEntityIds.entries()].map(([chunkId, entityIds]) => [chunkId, [...entityIds]]),
    );

    return {
      entities: [...entities.values()],
      relations: getAllRelations(),
      chunkToEntityIds: serializedChunkToEntityIds,
    };
  };

  return {
    addEntity,
    getEntity,
    getAllEntities,
    findEntitiesByName,
    findEntitiesByType,
    addRelation,
    getRelationsFrom,
    getRelationsTo,
    getRelationsBetween,
    getNeighbors,
    getDependencyChain,
    getEntitiesForChunk,
    getChunksForEntity,
    stats,
    serialize,
  };
}

export function deserializeGraph(data: SerializedGraph): GraphStore {
  const store = createGraphStore();
  for (const entity of data.entities) {
    store.addEntity(entity);
  }
  for (const relation of data.relations) {
    store.addRelation(relation);
  }
  return store;
}
