import { describe, expect, it } from "vitest";
import { focusedSearch } from "./focused-retrieval";
import { deepSearch } from "./deep-retrieval";
import { OramaIndex } from "./orama-index";
import { createGraphStore } from "../graph/graph-store";
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

const COMBAT_CHUNK = makeChunk({ chunkId: "c1", text: "Combat System handles all combat interactions and attacks." });
const STAMINA_CHUNK = makeChunk({ chunkId: "c2", text: "Stamina System manages player stamina for all actions." });
const ECONOMY_CHUNK = makeChunk({ chunkId: "c3", text: "Economy System handles gold and currency distribution." });

const ALL_CHUNKS = [COMBAT_CHUNK, STAMINA_CHUNK, ECONOMY_CHUNK];

async function buildIndex(chunks: KnowledgeChunk[]): Promise<OramaIndex> {
  const index = new OramaIndex();
  await index.build(chunks);
  return index;
}

describe("focusedSearch", () => {
  it("falls back to lexical when graph is null", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const result = focusedSearch(
      { query: "combat", topK: 3, retrievalMode: "focused", includeRawText: false, includeStructured: false },
      index,
      null
    );

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.chunk.chunkId).toBe("c1");
  });

  it("expands results via entity graph when graph is built", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const graph = createGraphStore();

    // Add entities linked to chunks
    graph.addEntity({
      entityId: "e-combat",
      name: "Combat System",
      type: "game-system",
      description: "Handles combat",
      aliases: ["combat"],
      sourceChunkIds: ["c1"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addEntity({
      entityId: "e-stamina",
      name: "Stamina System",
      type: "game-system",
      description: "Manages stamina",
      aliases: ["stamina"],
      sourceChunkIds: ["c2"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addRelation({
      relationId: "r1",
      sourceEntityId: "e-combat",
      targetEntityId: "e-stamina",
      type: "depends_on",
      evidenceChunkIds: ["c1"],
    });

    const result = focusedSearch(
      { query: "combat", topK: 5, retrievalMode: "focused", includeRawText: false, includeStructured: false },
      index,
      graph
    );

    const returnedChunkIds = result.results.map((r) => r.chunk.chunkId);
    // Should include c1 (direct match) and c2 (via entity graph expansion)
    expect(returnedChunkIds).toContain("c1");
    expect(returnedChunkIds).toContain("c2");
  });

  it("lexical mode does NOT expand via graph", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const graph = createGraphStore();

    graph.addEntity({
      entityId: "e-combat",
      name: "Combat System",
      type: "game-system",
      description: "Handles combat",
      aliases: [],
      sourceChunkIds: ["c1"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addEntity({
      entityId: "e-stamina",
      name: "Stamina System",
      type: "game-system",
      description: "Manages stamina",
      aliases: [],
      sourceChunkIds: ["c2"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addRelation({
      relationId: "r1",
      sourceEntityId: "e-combat",
      targetEntityId: "e-stamina",
      type: "depends_on",
      evidenceChunkIds: ["c1"],
    });

    // Use the index directly (lexical mode)
    const lexicalResult = index.search({
      query: "combat",
      topK: 3,
      retrievalMode: "lexical",
      includeRawText: false,
      includeStructured: false,
    });

    const lexicalChunkIds = lexicalResult.results.map((r) => r.chunk.chunkId);
    // Lexical should find c1 but NOT c2 (stamina not in query)
    expect(lexicalChunkIds).toContain("c1");
    expect(lexicalChunkIds).not.toContain("c2");
  });
});

describe("deepSearch", () => {
  it("decomposes query into sub-queries", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const mockLLM: LLMProvider = {
      chat: async (messages) => {
        const lastMsg = messages[messages.length - 1]?.content ?? "";
        if (lastMsg.includes("Decompose")) {
          return JSON.stringify(["combat mechanics", "stamina dependency", "balance rules"]);
        }
        return "[]";
      },
    };

    const result = await deepSearch("How should combat interact with stamina?", index, null, {
      llm: mockLLM,
      topK: 5,
    });

    expect(result.subQueries.length).toBeGreaterThanOrEqual(3);
    expect(result.synthesisContext).toContain("## Relevant Facts");
    expect(result.synthesisContext).toContain("## Relationships");
  });

  it("returns synthesisContext in markdown format", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const mockLLM: LLMProvider = {
      chat: async () => JSON.stringify(["combat", "stamina"]),
    };

    const result = await deepSearch("combat stamina interaction", index, null, {
      llm: mockLLM,
      topK: 3,
    });

    expect(result.synthesisContext).toContain("## Relevant Facts");
    expect(result.synthesisContext).toContain("## Entities Found");
    expect(result.synthesisContext).toContain("## Relationships");
    expect(result.synthesisContext).toContain("## Design Implications");
  });

  it("respects timeoutMs and returns partial results", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const slowLLM: LLMProvider = {
      chat: async () => {
        await new Promise((resolve) => setTimeout(resolve, 5000));
        return "[]";
      },
    };

    const start = Date.now();
    const result = await deepSearch("combat", index, null, {
      llm: slowLLM,
      topK: 3,
      timeoutMs: 500,
    });
    const elapsed = Date.now() - start;

    // Should return within ~1s (timeout + small buffer)
    expect(elapsed).toBeLessThan(2000);
    // Should still return something (fallback)
    expect(result.synthesisContext).toContain("## Relevant Facts");
  });

  it("gracefully degrades when graph is null (no entity tracking)", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const mockLLM: LLMProvider = {
      chat: async () => JSON.stringify(["combat", "stamina"]),
    };

    const result = await deepSearch("combat stamina", index, null, {
      llm: mockLLM,
      topK: 5,
    });

    expect(result.entities.length).toBe(0);
    expect(result.relationships.length).toBe(0);
    expect(result.chunks.length).toBeGreaterThan(0);
  });

  it("includes entities and relationships when graph is built", async () => {
    const index = await buildIndex(ALL_CHUNKS);
    const graph = createGraphStore();

    graph.addEntity({
      entityId: "e-combat",
      name: "Combat System",
      type: "game-system",
      description: "Handles combat",
      aliases: [],
      sourceChunkIds: ["c1"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addEntity({
      entityId: "e-stamina",
      name: "Stamina System",
      type: "game-system",
      description: "Manages stamina",
      aliases: [],
      sourceChunkIds: ["c2"],
      sourceDocumentIds: ["doc-1"],
    });
    graph.addRelation({
      relationId: "r1",
      sourceEntityId: "e-combat",
      targetEntityId: "e-stamina",
      type: "depends_on",
      evidenceChunkIds: ["c1"],
    });

    const mockLLM: LLMProvider = {
      chat: async () => JSON.stringify(["combat", "stamina"]),
    };

    const result = await deepSearch("combat stamina", index, graph, {
      llm: mockLLM,
      topK: 5,
    });

    expect(result.entities.length).toBeGreaterThan(0);
    expect(result.relationships.length).toBeGreaterThan(0);
  });
});
