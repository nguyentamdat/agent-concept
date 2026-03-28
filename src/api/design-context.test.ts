import { describe, expect, it } from "bun:test";
import { buildFeatureDesignContext, buildConflictReport } from "./design-context";
import { createGraphStore } from "../graph/graph-store";
import type { KnowledgeChunk } from "../types";

function makeChunk(chunkId: string, text: string): KnowledgeChunk {
  return {
    chunkId,
    documentId: "doc-1",
    text,
    normalizedText: text.toLowerCase(),
    sourceNodeIds: [],
    primaryCitation: { documentId: "doc-1", citationKind: "section", exactness: "exact" },
    secondaryCitations: [],
    sectionPath: ["Section 1"],
    metadata: { sourceType: "md" },
    tokenCount: text.split(" ").length,
    chunkStrategyVersion: "1.0",
    embeddingReady: false,
  };
}

function buildTestGraph() {
  const graph = createGraphStore();

  graph.addEntity({
    entityId: "e-combat",
    name: "Combat System",
    type: "game-system",
    description: "Handles all combat interactions",
    aliases: ["combat"],
    sourceChunkIds: ["c1"],
    sourceDocumentIds: ["doc-1"],
  });

  graph.addEntity({
    entityId: "e-stamina",
    name: "Stamina System",
    type: "game-system",
    description: "Manages player stamina",
    aliases: ["stamina"],
    sourceChunkIds: ["c2"],
    sourceDocumentIds: ["doc-1"],
  });

  graph.addEntity({
    entityId: "e-stealth",
    name: "Stealth System",
    type: "game-system",
    description: "Handles stealth mechanics",
    aliases: ["stealth"],
    sourceChunkIds: ["c3"],
    sourceDocumentIds: ["doc-1"],
  });

  graph.addEntity({
    entityId: "e-pattern",
    name: "Skill Tree",
    type: "design-pattern",
    description: "Branching skill progression",
    aliases: [],
    sourceChunkIds: ["c4"],
    sourceDocumentIds: ["doc-1"],
  });

  graph.addEntity({
    entityId: "e-ref",
    name: "Dark Souls",
    type: "reference-game",
    description: "Reference game for combat design",
    aliases: [],
    sourceChunkIds: ["c5"],
    sourceDocumentIds: ["doc-1"],
  });

  // Combat depends on Stamina
  graph.addRelation({
    relationId: "r1",
    sourceEntityId: "e-combat",
    targetEntityId: "e-stamina",
    type: "depends_on",
    evidenceChunkIds: ["c1"],
  });

  // Combat conflicts with Stealth
  graph.addRelation({
    relationId: "r2",
    sourceEntityId: "e-combat",
    targetEntityId: "e-stealth",
    type: "conflicts_with",
    evidenceChunkIds: ["c1"],
  });

  return graph;
}

describe("buildFeatureDesignContext", () => {
  it("returns empty context when graph is null", () => {
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add PvP arena", null, chunks);

    expect(context.affectedSystems).toEqual([]);
    expect(context.conflicts).toEqual([]);
    expect(context.evidenceChunks).toEqual(chunks);
    expect(context.contextString).toContain("## Relevant Facts");
  });

  it("returns affected systems from evidence chunks", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add PvP arena with combat", graph, chunks);

    const systemNames = context.affectedSystems.map((e) => e.name);
    expect(systemNames).toContain("Combat System");
  });

  it("detects high-severity conflict (direct conflicts_with edge)", () => {
    const graph = buildTestGraph();
    const chunks = [
      makeChunk("c1", "Combat System handles combat"),
      makeChunk("c3", "Stealth System handles stealth"),
    ];
    const context = buildFeatureDesignContext("Add PvP arena with combat and stealth", graph, chunks);

    expect(context.conflicts.length).toBeGreaterThan(0);
    const highConflicts = context.conflicts.filter((c) => c.severity === "high");
    expect(highConflicts.length).toBeGreaterThan(0);
  });

  it("contextString includes ## Conflicts section", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add PvP arena", graph, chunks);

    expect(context.contextString).toContain("## Conflicts");
  });

  it("contextString includes ## Recommendations section", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add PvP arena", graph, chunks);

    expect(context.contextString).toContain("## Recommendations");
  });

  it("includes relevant design patterns", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add skill progression", graph, chunks);

    expect(context.relevantPatterns.map((p) => p.name)).toContain("Skill Tree");
  });

  it("includes reference games", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c1", "Combat System handles combat")];
    const context = buildFeatureDesignContext("Add combat system", graph, chunks);

    expect(context.references.map((r) => r.name)).toContain("Dark Souls");
  });

  it("graceful degradation: returns result with empty entities when no chunks match graph", () => {
    const graph = buildTestGraph();
    const chunks = [makeChunk("c-unknown", "Some unrelated text about weather")];
    const context = buildFeatureDesignContext("Add weather system", graph, chunks);

    // Should not throw, should return valid context
    expect(context.contextString).toContain("## Relevant Facts");
    expect(context.evidenceChunks).toEqual(chunks);
  });
});

describe("buildConflictReport", () => {
  it("returns empty report when graph is null", () => {
    const report = buildConflictReport(null, ["e-combat"]);
    expect(report.conflicts).toEqual([]);
    expect(report.summary).toContain("No graph");
  });

  it("returns empty report when no entity IDs provided", () => {
    const graph = buildTestGraph();
    const report = buildConflictReport(graph, []);
    expect(report.conflicts).toEqual([]);
  });

  it("detects direct conflicts_with as high severity", () => {
    const graph = buildTestGraph();
    const report = buildConflictReport(graph, ["e-combat"]);

    const highConflicts = report.conflicts.filter((c) => c.severity === "high");
    expect(highConflicts.length).toBeGreaterThan(0);
    expect(report.summary).toContain("high");
  });
});
