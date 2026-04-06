import { describe, expect, it } from "vitest";
import { extractEntitiesFromChunks } from "./llm-extractor";
import type { LLMProvider } from "./llm-types";
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
  return {
    chat: async () => response,
  };
}

const VALID_RESPONSE = JSON.stringify({
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

describe("extractEntitiesFromChunks", () => {
  it("extracts valid entities and relations from LLM response", async () => {
    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(VALID_RESPONSE),
    });

    expect(result.entities.length).toBe(2);
    expect(result.relations.length).toBe(1);
    expect(result.warnings.length).toBe(0);
    expect(result.entities.map((e) => e.name)).toContain("Combat System");
    expect(result.entities.map((e) => e.name)).toContain("Stamina System");
    expect(result.relations[0]?.type).toBe("depends_on");
  });

  it("drops hallucinated entity not found in source text", async () => {
    const responseWithHallucination = JSON.stringify({
      entities: [
        {
          name: "Combat System",
          type: "game-system",
          description: "Handles combat",
          aliases: [],
          evidenceQuote: "Combat System handles",
        },
        {
          name: "Totally Fake Dragon Boss",
          type: "misc",
          description: "Does not exist in text",
          aliases: [],
          evidenceQuote: "dragon boss appears",
        },
      ],
      relations: [],
    });

    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(responseWithHallucination),
    });

    expect(result.entities.length).toBe(1);
    expect(result.entities[0]?.name).toBe("Combat System");
    expect(result.warnings.some((w) => w.includes("Totally Fake Dragon Boss"))).toBe(true);
  });

  it("returns partial results when some entities fail validation", async () => {
    const partialResponse = JSON.stringify({
      entities: [
        {
          name: "Combat System",
          type: "game-system",
          description: "Handles combat",
          aliases: [],
          evidenceQuote: "Combat System handles",
        },
        // Missing required fields — but schema has defaults so this tests type mismatch
        {
          name: "Bad Entity",
          type: "INVALID_TYPE_XYZ",
          description: "bad",
          aliases: [],
          evidenceQuote: "bad",
        },
      ],
      relations: [],
    });

    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(partialResponse),
    });

    // Schema validation fails for the whole response when type is invalid
    // So we get 0 entities + a warning
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns empty result with warning when LLM returns invalid JSON", async () => {
    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM("this is not json at all!!!"),
    });

    expect(result.entities.length).toBe(0);
    expect(result.relations.length).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
  });

  it("returns empty result with warning when LLM call throws", async () => {
    const failingLLM: LLMProvider = {
      chat: async () => {
        throw new Error("LLM unavailable");
      },
    };

    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: failingLLM,
    });

    expect(result.entities.length).toBe(0);
    expect(result.warnings.length).toBeGreaterThan(0);
    expect(result.warnings[0]).toContain("LLM call failed");
  });

  it("returns empty result for empty chunks input", async () => {
    const result = await extractEntitiesFromChunks([], {
      llm: makeMockLLM(VALID_RESPONSE),
    });

    expect(result.entities.length).toBe(0);
    expect(result.relations.length).toBe(0);
    expect(result.warnings.length).toBe(0);
  });

  it("handles markdown-wrapped JSON response", async () => {
    const markdownWrapped = "```json\n" + VALID_RESPONSE + "\n```";

    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(markdownWrapped),
    });

    expect(result.entities.length).toBe(2);
  });

  it("entity sourceChunkIds link back to source chunks", async () => {
    const result = await extractEntitiesFromChunks(SAMPLE_CHUNKS, {
      llm: makeMockLLM(VALID_RESPONSE),
    });

    const combatEntity = result.entities.find((e) => e.name === "Combat System");
    expect(combatEntity).toBeDefined();
    expect(combatEntity?.sourceChunkIds.length).toBeGreaterThan(0);
  });
});
