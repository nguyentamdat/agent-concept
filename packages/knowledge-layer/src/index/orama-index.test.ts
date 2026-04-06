import { describe, expect, it } from "vitest";
import { getAllChunkFixtures, yamlChunkFixture } from "../test-utils";
import type { KnowledgeChunk, SearchKnowledgeRequest } from "../types";
import { OramaIndex } from "./orama-index";

describe("OramaIndex", () => {
  it("returns the expected top chunk for a known query", async () => {
    const index = new OramaIndex();
    await index.build(getAllChunkFixtures());

    const result = index.search(
      createRequest({
        query: "action economy complexity high",
        topK: 3,
      })
    );

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.chunk.chunkId).toBe(yamlChunkFixture.chunkId);
    expect(result.results[0]?.score).toBeGreaterThan(0);
    expect(result.results[0]?.citation.exactness).toBeDefined();
  });

  it("applies tag filters before ranking", async () => {
    const index = new OramaIndex();
    await index.build(getAllChunkFixtures());

    const result = index.search(
      createRequest({
        query: "loop progression",
        filters: { tags: ["progression"] },
      })
    );

    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results.every((item) => (item.chunk.metadata.tags ?? []).includes("progression"))).toBe(
      true
    );
  });

  it("filters out results below minScore", async () => {
    const index = new OramaIndex();
    await index.build(getAllChunkFixtures());

    const baseline = index.search(createRequest({ query: "core loop", topK: 5 }));
    expect(baseline.results.length).toBeGreaterThan(0);

    const strongestScore = baseline.results[0]?.score ?? 0;
    const filtered = index.search(
      createRequest({
        query: "core loop",
        topK: 5,
        minScore: strongestScore + 0.000001,
      })
    );

    expect(filtered.results).toHaveLength(0);
  });

  it("returns empty results for an empty query", async () => {
    const index = new OramaIndex();
    await index.build(getAllChunkFixtures());

    const result = index.search(createRequest({ query: "    " }));

    expect(result.results).toHaveLength(0);
    expect(result.timingMs).toBeGreaterThanOrEqual(0);
  });

  it("stays within local timing budget for a 100+ chunk fixture corpus", async () => {
    const index = new OramaIndex();
    await index.build(createExpandedFixtureCorpus(120));

    const result = index.search(
      createRequest({
        query: "turn-based combat feedback loops progression",
        topK: 10,
      })
    );

    expect(result.timingMs).toBeLessThan(200);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.indexVersion).toMatch(/^idx_[0-9a-f]{8}$/);
  });
});

function createRequest(overrides: Partial<SearchKnowledgeRequest>): SearchKnowledgeRequest {
  return {
    query: "core loop",
    topK: 10,
    retrievalMode: "lexical",
    includeRawText: true,
    includeStructured: false,
    ...overrides,
  };
}

function createExpandedFixtureCorpus(targetCount: number): KnowledgeChunk[] {
  const seeds = getAllChunkFixtures();
  const chunks: KnowledgeChunk[] = [];

  for (let index = 0; index < targetCount; index += 1) {
    const seed = seeds[index % seeds.length];
    const suffix = `${index + 1}`;

    chunks.push({
      ...seed,
      chunkId: `${seed.chunkId}-copy-${suffix}`,
      documentId: `${seed.documentId}-copy-${suffix}`,
      sourceNodeIds: seed.sourceNodeIds.map((id) => `${id}-copy-${suffix}`),
      text: `${seed.text} Copy ${suffix}.`,
      normalizedText: `${seed.normalizedText} copy ${suffix}.`,
      primaryCitation: {
        ...seed.primaryCitation,
        documentId: `${seed.primaryCitation.documentId}-copy-${suffix}`,
      },
      secondaryCitations: seed.secondaryCitations.map((citation) => ({
        ...citation,
        documentId: `${citation.documentId}-copy-${suffix}`,
      })),
    });
  }

  return chunks;
}
