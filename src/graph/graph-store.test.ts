import { describe, expect, it } from "bun:test";
import { createGraphStore, deserializeGraph } from "./graph-store";
import type { EntityType, GameEntity, GameRelation } from "./types";

function makeEntity(params: {
  id: string;
  name: string;
  type?: EntityType;
  aliases?: string[];
  chunkIds?: string[];
  documentIds?: string[];
  description?: string;
}): GameEntity {
  return {
    entityId: params.id,
    name: params.name,
    type: params.type ?? "misc",
    description: params.description ?? `${params.name} description`,
    aliases: params.aliases ?? [],
    sourceChunkIds: params.chunkIds ?? [],
    sourceDocumentIds: params.documentIds ?? ["doc-1"],
  };
}

function makeRelation(params: {
  relationId: string;
  sourceEntityId: string;
  targetEntityId: string;
  type: GameRelation["type"];
  description?: string;
}): GameRelation {
  return {
    relationId: params.relationId,
    sourceEntityId: params.sourceEntityId,
    targetEntityId: params.targetEntityId,
    type: params.type,
    description: params.description,
    evidenceChunkIds: ["chunk-evidence"],
  };
}

describe("GraphStore", () => {
  it("addEntity + getEntity round-trip", () => {
    const store = createGraphStore();
    const entity = makeEntity({ id: "e1", name: "Combat System", type: "game-system" });

    store.addEntity(entity);

    expect(store.getEntity("e1")).toEqual(entity);
  });

  it("findEntitiesByName('combat') finds entity named 'Combat System'", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "e1", name: "Combat System", type: "game-system" }));

    const matches = store.findEntitiesByName("combat");

    expect(matches.map(m => m.entityId)).toContain("e1");
  });

  it("findEntitiesByName('stamina') finds entity with alias 'stamina'", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "e1", name: "Endurance", aliases: ["stamina"] }));

    const matches = store.findEntitiesByName("stamina");

    expect(matches.map(m => m.entityId)).toContain("e1");
  });

  it("addRelation + getRelationsFrom + getRelationsTo", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));

    const relation = makeRelation({
      relationId: "r1",
      sourceEntityId: "a",
      targetEntityId: "b",
      type: "depends_on",
    });
    store.addRelation(relation);

    expect(store.getRelationsFrom("a")).toEqual([relation]);
    expect(store.getRelationsTo("b")).toEqual([relation]);
  });

  it("getRelationsBetween returns matching edge(s)", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));
    store.addEntity(makeEntity({ id: "c", name: "C" }));

    const ab = makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "contains" });
    const ac = makeRelation({ relationId: "r2", sourceEntityId: "a", targetEntityId: "c", type: "contains" });
    store.addRelation(ab);
    store.addRelation(ac);

    expect(store.getRelationsBetween("a", "b")).toEqual([ab]);
  });

  it("getNeighbors depth=1 returns direct neighbors", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));
    store.addEntity(makeEntity({ id: "c", name: "C" }));

    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));
    store.addRelation(makeRelation({ relationId: "r2", sourceEntityId: "c", targetEntityId: "a", type: "feeds_into" }));

    const neighbors = store.getNeighbors("a", 1).map(e => e.entityId);

    expect(neighbors).toContain("b");
    expect(neighbors).toContain("c");
    expect(neighbors).not.toContain("a");
  });

  it("getNeighbors depth=2 returns transitive neighbors", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));
    store.addEntity(makeEntity({ id: "c", name: "C" }));

    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));
    store.addRelation(makeRelation({ relationId: "r2", sourceEntityId: "b", targetEntityId: "c", type: "contains" }));

    const neighbors = store.getNeighbors("a", 2).map(e => e.entityId);

    expect(neighbors).toContain("b");
    expect(neighbors).toContain("c");
  });

  it("getDependencyChain follows only depends_on", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));
    store.addEntity(makeEntity({ id: "c", name: "C" }));

    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));
    store.addRelation(makeRelation({ relationId: "r2", sourceEntityId: "b", targetEntityId: "c", type: "depends_on" }));
    store.addRelation(makeRelation({ relationId: "r3", sourceEntityId: "a", targetEntityId: "c", type: "synergizes_with" }));

    const chain = store.getDependencyChain("a").map(e => e.entityId);

    expect(chain).toContain("b");
    expect(chain).toContain("c");
  });

  it("getDependencyChain is cycle-safe (A→B→A)", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A" }));
    store.addEntity(makeEntity({ id: "b", name: "B" }));

    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));
    store.addRelation(makeRelation({ relationId: "r2", sourceEntityId: "b", targetEntityId: "a", type: "depends_on" }));

    const chain = store.getDependencyChain("a").map(e => e.entityId);

    expect(chain).toEqual(["b"]);
  });

  it("getEntitiesForChunk / getChunksForEntity are bidirectional", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A", chunkIds: ["chunk-1", "chunk-2"] }));
    store.addEntity(makeEntity({ id: "b", name: "B", chunkIds: ["chunk-2"] }));

    const chunk2EntityIds = store.getEntitiesForChunk("chunk-2").map(e => e.entityId);
    const entityAChunks = store.getChunksForEntity("a");

    expect(chunk2EntityIds).toContain("a");
    expect(chunk2EntityIds).toContain("b");
    expect(entityAChunks).toContain("chunk-1");
    expect(entityAChunks).toContain("chunk-2");
  });

  it("stats() returns correct counts", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "A", type: "game-system" }));
    store.addEntity(makeEntity({ id: "b", name: "B", type: "mechanic" }));
    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));

    const result = store.stats();

    expect(result.entityCount).toBe(2);
    expect(result.relationCount).toBe(1);
    expect(result.entityTypeCounts["game-system"]).toBe(1);
    expect(result.entityTypeCounts.mechanic).toBe(1);
    expect(result.relationTypeCounts.depends_on).toBe(1);
  });

  it("serialize -> deserializeGraph preserves counts and stats", () => {
    const store = createGraphStore();
    store.addEntity(makeEntity({ id: "a", name: "Combat System", type: "game-system", chunkIds: ["chunk-1"] }));
    store.addEntity(makeEntity({ id: "b", name: "Stamina", type: "mechanic", chunkIds: ["chunk-2"] }));
    store.addRelation(makeRelation({ relationId: "r1", sourceEntityId: "a", targetEntityId: "b", type: "depends_on" }));

    const serialized = store.serialize();
    const restored = deserializeGraph(serialized);

    expect(restored.getAllEntities().length).toBe(2);
    expect(restored.getRelationsFrom("a").length).toBe(1);
    expect(restored.stats()).toEqual(store.stats());
  });
});
