import { describe, expect, it } from "vitest";
import { entityNameSimilarity, mergeEntities, normalizeEntityName } from "./dedup";
import type { EntityType, GameEntity } from "./types";

function makeEntity(params: {
  id: string;
  name: string;
  type: EntityType;
  description?: string;
  aliases?: string[];
  chunkIds?: string[];
  documentIds?: string[];
}): GameEntity {
  return {
    entityId: params.id,
    name: params.name,
    type: params.type,
    description: params.description ?? `${params.name} description`,
    aliases: params.aliases ?? [],
    sourceChunkIds: params.chunkIds ?? [],
    sourceDocumentIds: params.documentIds ?? [],
  };
}

describe("dedup", () => {
  it("normalizeEntityName('Combat System') === 'combat'", () => {
    expect(normalizeEntityName("Combat System")).toBe("combat");
  });

  it("normalizeEntityName('Core Loop') === 'core'", () => {
    expect(normalizeEntityName("Core Loop")).toBe("core");
  });

  it("entityNameSimilarity('combat system', 'combat') >= 0.7", () => {
    expect(entityNameSimilarity("combat system", "combat")).toBeGreaterThanOrEqual(0.7);
  });

  it("entityNameSimilarity('economy', 'combat') < 0.7", () => {
    expect(entityNameSimilarity("economy", "combat")).toBeLessThan(0.7);
  });

  it("entityNameSimilarity('combat', 'combat') === 1", () => {
    expect(entityNameSimilarity("combat", "combat")).toBe(1);
  });

  it("mergeEntities keeps more specific type (mechanic > game-system)", () => {
    const existing = makeEntity({ id: "e1", name: "Combat", type: "game-system" });
    const incoming = makeEntity({ id: "e1", name: "Combat", type: "mechanic" });

    const merged = mergeEntities(existing, incoming);

    expect(merged.type).toBe("mechanic");
  });

  it("mergeEntities keeps same type when equal specificity", () => {
    const existing = makeEntity({ id: "e1", name: "Combat", type: "feature" });
    const incoming = makeEntity({ id: "e1", name: "Combat", type: "feature" });

    const merged = mergeEntities(existing, incoming);

    expect(merged.type).toBe("feature");
  });

  it("mergeEntities unions aliases (no duplicates)", () => {
    const existing = makeEntity({ id: "e1", name: "Combat", type: "feature", aliases: ["fight", "battle"] });
    const incoming = makeEntity({ id: "e1", name: "Combat System", type: "feature", aliases: ["battle", "duel"] });

    const merged = mergeEntities(existing, incoming);

    expect(merged.aliases).toContain("fight");
    expect(merged.aliases).toContain("battle");
    expect(merged.aliases).toContain("duel");
    expect(merged.aliases).toContain("Combat System");
    expect(new Set(merged.aliases).size).toBe(merged.aliases.length);
  });

  it("mergeEntities unions sourceChunkIds", () => {
    const existing = makeEntity({ id: "e1", name: "Combat", type: "feature", chunkIds: ["c1", "c2"] });
    const incoming = makeEntity({ id: "e1", name: "Combat", type: "feature", chunkIds: ["c2", "c3"] });

    const merged = mergeEntities(existing, incoming);

    expect(merged.sourceChunkIds).toEqual(["c1", "c2", "c3"]);
  });

  it("mergeEntities concatenates descriptions when different", () => {
    const existing = makeEntity({ id: "e1", name: "Combat", type: "feature", description: "desc one" });
    const incoming = makeEntity({ id: "e1", name: "Combat", type: "feature", description: "desc two" });

    const merged = mergeEntities(existing, incoming);

    expect(merged.description).toBe("desc one | desc two");
  });
});
