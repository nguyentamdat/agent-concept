import { describe, expect, it } from "bun:test";
import { buildGraphFromChunks } from "./graph-builder";
import type { LLMProvider } from "../extract/llm-types";
import type { KnowledgeChunk } from "../types";

function makeChunk(params: {
  chunkId: string;
  text: string;
  documentId?: string;
  sectionPath?: string[];
}): KnowledgeChunk {
  return {
    chunkId: params.chunkId,
    documentId: params.documentId ?? "doc-1",
    text: params.text,
    normalizedText: params.text.toLowerCase(),
    sourceNodeIds: [],
    primaryCitation: {
      documentId: params.documentId ?? "doc-1",
      citationKind: "section",
      exactness: "exact",
    },
    secondaryCitations: [],
    sectionPath: params.sectionPath ?? ["Section 1"],
    metadata: { sourceType: "md" },
    tokenCount: params.text.split(" ").length,
    chunkStrategyVersion: "1.0",
    embeddingReady: false,
  };
}

function makeMockLLM(response: string): LLMProvider {
  return { chat: async () => response };
}

const SAMPLE_CHUNKS = [
  makeChunk({
    chunkId: "c1",
    text: "Combat System handles all combat interactions. Combat System depends on Stamina System.",
  }),
  makeChunk({
    chunkId: "c2",
    text: "Stamina System manages player stamina for all actions.",
  }),
];

const MOCK_LLM_RESPONSE = JSON.stringify({
  entities: [
    {
      name: "Combat System",
      type: "game-system",
      description: "Handles all combat interactions",
      aliases: ["combat"],
      evidenceQuote: "Combat System handles all combat",
    },
    {
      name: "Stamina System",
      type: "game-system",
      description: "Manages player stamina",
      aliases: [],
      evidenceQuote: "Stamina System manages player stamina",
    },
  ],
  relations: [
    {
      sourceName: "Combat System",
      targetName: "Stamina System",
      type: "depends_on",
      description: "Combat requires stamina",
      evidenceQuote: "Combat System depends on Stamina System",
    },
  ],
});

describe("buildGraphFromChunks", () => {
  it("produces a populated GraphStore from chunks", async () => {
    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
    });

    expect(result.graph).toBeDefined();
    expect(result.stats.entityCount).toBeGreaterThanOrEqual(2);
    expect(result.stats.relationCount).toBeGreaterThanOrEqual(1);
  });

  it("getEntity('Combat System') returns entity with sourceChunkIds", async () => {
    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
    });

    const entities = result.graph.findEntitiesByName("Combat System");
    expect(entities.length).toBeGreaterThan(0);
    expect(entities[0]?.sourceChunkIds.length).toBeGreaterThan(0);
  });

  it("getSystemDependencies returns transitive depends_on chain", async () => {
    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
    });

    const combatEntities = result.graph.findEntitiesByName("Combat System");
    const combatEntity = combatEntities[0];
    expect(combatEntity).toBeDefined();

    const chain = result.graph.getDependencyChain(combatEntity!.entityId);
    const chainNames = chain.map((e) => e.name);
    expect(chainNames.some((n) => n.toLowerCase().includes("stamina"))).toBe(true);
  });

  it("chunk-entity links are bidirectional", async () => {
    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
    });

    const combatEntities = result.graph.findEntitiesByName("Combat System");
    const combatEntity = combatEntities[0];
    expect(combatEntity).toBeDefined();

    const chunks = result.graph.getChunksForEntity(combatEntity!.entityId);
    expect(chunks.length).toBeGreaterThan(0);

    const entitiesForChunk = result.graph.getEntitiesForChunk(chunks[0]!);
    expect(entitiesForChunk.map((e) => e.entityId)).toContain(combatEntity!.entityId);
  });

  it("progress callback fires at each phase", async () => {
    const phases: string[] = [];

    await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
      onProgress: (p) => {
        if (!phases.includes(p.phase)) phases.push(p.phase);
      },
    });

    expect(phases).toContain("extracting");
    expect(phases).toContain("deduplicating");
    expect(phases).toContain("linking");
    expect(phases).toContain("validating");
  });

  it("orphaned relations produce warnings, not errors", async () => {
    const responseWithOrphan = JSON.stringify({
      entities: [
        {
          name: "Combat System",
          type: "game-system",
          description: "Handles combat",
          aliases: [],
          evidenceQuote: "Combat System handles",
        },
      ],
      relations: [
        {
          sourceName: "Combat System",
          targetName: "NonExistentSystem",
          type: "depends_on",
          description: "",
          evidenceQuote: "depends on NonExistentSystem",
        },
      ],
    });

    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(responseWithOrphan),
    });

    // Should not throw, should have warnings
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.stats.entityCount).toBeGreaterThanOrEqual(1);
  });

  it("returns empty graph for empty chunks", async () => {
    const result = await buildGraphFromChunks([], {
      llm: makeMockLLM(MOCK_LLM_RESPONSE),
    });

    expect(result.stats.entityCount).toBe(0);
    expect(result.stats.relationCount).toBe(0);
  });

  it("deduplicates 'Combat' and 'Combat System' as same entity", async () => {
    const responseWithDuplicates = JSON.stringify({
      entities: [
        {
          name: "Combat System",
          type: "game-system",
          description: "Handles combat",
          aliases: [],
          evidenceQuote: "Combat System handles",
        },
        {
          name: "Combat",
          type: "mechanic",
          description: "Combat mechanic",
          aliases: [],
          evidenceQuote: "Combat System handles",
        },
      ],
      relations: [],
    });

    const result = await buildGraphFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(responseWithDuplicates),
    });

    // Should be merged into 1 entity
    expect(result.stats.entityCount).toBe(1);
    // Should keep more specific type (mechanic > game-system)
    const entities = result.graph.getAllEntities();
    expect(entities[0]?.type).toBe("mechanic");
  });
});
