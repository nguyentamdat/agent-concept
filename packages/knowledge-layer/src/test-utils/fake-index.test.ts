import { describe, it, expect, beforeEach } from "vitest";
import { FakeIndex } from "./fake-index";
import {
  getAllChunkFixtures,
  pdfChunkFixture,
  csvChunkFixture,
  jsonChunkFixture,
} from "./chunk-fixtures";

describe("FakeIndex", () => {
  let index: FakeIndex;

  beforeEach(() => {
    index = new FakeIndex();
  });

  describe("build", () => {
    it("should build index from chunks", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const stats = index.stats();
      expect(stats.totalChunks).toBe(chunks.length);
    });

    it("should clear previous chunks on rebuild", () => {
      const chunks1 = [pdfChunkFixture];
      index.build(chunks1);
      expect(index.stats().totalChunks).toBe(1);

      const chunks2 = getAllChunkFixtures();
      index.build(chunks2);
      expect(index.stats().totalChunks).toBe(chunks2.length);
    });

    it("should generate index version", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const result = index.search({
        query: "test",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.indexVersion).toBeTruthy();
      expect(result.indexVersion).toMatch(/^v\d+-\d+$/);
    });
  });

  describe("search", () => {
    beforeEach(() => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);
    });

    it("should return empty results for no matches", () => {
      const result = index.search({
        query: "nonexistent-term-xyz",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.results).toHaveLength(0);
    });

    it("should find chunks matching query terms", () => {
      const result = index.search({
        query: "core loop",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].matchedTerms).toContain("core");
    });

    it("should respect topK limit", () => {
      const result = index.search({
        query: "game",
        topK: 2,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.results.length).toBeLessThanOrEqual(2);
    });

    it("should sort results by score descending", () => {
      const result = index.search({
        query: "game design",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      if (result.results.length > 1) {
        for (let i = 0; i < result.results.length - 1; i++) {
          expect(result.results[i].score).toBeGreaterThanOrEqual(
            result.results[i + 1].score
          );
        }
      }
    });

    it("should include matched terms in results", () => {
      const result = index.search({
        query: "progression",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].matchedTerms).toContain("progression");
    });

    it("should include citation in results", () => {
      const result = index.search({
        query: "core",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.results.length).toBeGreaterThan(0);
      expect(result.results[0].citation).toBeDefined();
      expect(result.results[0].citation.exactness).toBeDefined();
    });

    it("should measure timing", () => {
      const result = index.search({
        query: "game",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.timingMs).toBeGreaterThanOrEqual(0);
      expect(typeof result.timingMs).toBe("number");
    });
  });

  describe("filters", () => {
    beforeEach(() => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);
    });

    it("should filter by sourceType", () => {
      const result = index.search({
        query: "game",
        filters: { sourceType: "pdf" },
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      for (const item of result.results) {
        expect(item.chunk.metadata.sourceType).toBe("pdf");
      }
    });

    it("should filter by category", () => {
      const result = index.search({
        query: "game",
        filters: { category: "game-mechanics" },
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      for (const item of result.results) {
        expect(item.chunk.metadata.category).toBe("game-mechanics");
      }
    });

    it("should filter by tags", () => {
      const result = index.search({
        query: "game",
        filters: { tags: ["progression"] },
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      for (const item of result.results) {
        const tags = item.chunk.metadata.tags || [];
        expect(tags).toContain("progression");
      }
    });

    it("should apply minScore threshold", () => {
      const result = index.search({
        query: "game design",
        minScore: 2,
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      for (const item of result.results) {
        expect(item.score).toBeGreaterThanOrEqual(2);
      }
    });
  });

  describe("stats", () => {
    it("should return correct stats", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const stats = index.stats();

      expect(stats.totalChunks).toBe(chunks.length);
      expect(stats.categoryCounts).toBeDefined();
      expect(stats.tagCounts).toBeDefined();
    });

    it("should count categories correctly", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const stats = index.stats();

      // Most fixtures have "game-mechanics" category
      expect(stats.categoryCounts["game-mechanics"]).toBeGreaterThan(0);
    });

    it("should count tags correctly", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const stats = index.stats();

      // Check that tags are counted
      const totalTags = Object.values(stats.tagCounts).reduce((a, b) => a + b, 0);
      expect(totalTags).toBeGreaterThan(0);
    });
  });

  describe("getChunk", () => {
    beforeEach(() => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);
    });

    it("should retrieve chunk by ID", () => {
      const chunk = index.getChunk(pdfChunkFixture.chunkId);
      expect(chunk).toBeDefined();
      expect(chunk?.chunkId).toBe(pdfChunkFixture.chunkId);
    });

    it("should return undefined for missing chunk", () => {
      const chunk = index.getChunk("nonexistent-chunk-id");
      expect(chunk).toBeUndefined();
    });
  });

  describe("getAllChunks", () => {
    it("should return all chunks", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const allChunks = index.getAllChunks();
      expect(allChunks).toHaveLength(chunks.length);
    });

    it("should return empty array when index is empty", () => {
      const allChunks = index.getAllChunks();
      expect(allChunks).toHaveLength(0);
    });
  });

  describe("clear", () => {
    it("should clear all chunks", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);
      expect(index.stats().totalChunks).toBeGreaterThan(0);

      index.clear();
      expect(index.stats().totalChunks).toBe(0);
    });

    it("should reset index version", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      index.clear();

      const result = index.search({
        query: "test",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result.indexVersion).toBe("");
    });
  });

  describe("contract compliance", () => {
    it("should return SearchKnowledgeResult with all required fields", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const result = index.search({
        query: "game",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      expect(result).toHaveProperty("results");
      expect(result).toHaveProperty("timingMs");
      expect(result).toHaveProperty("indexVersion");
      expect(Array.isArray(result.results)).toBe(true);
    });

    it("should return chunks with primaryCitation.exactness", () => {
      const chunks = getAllChunkFixtures();
      index.build(chunks);

      const result = index.search({
        query: "game",
        topK: 10,
        retrievalMode: "lexical",
        includeRawText: true,
        includeStructured: false,
      });

      for (const item of result.results) {
        expect(item.chunk.primaryCitation.exactness).toBeDefined();
        expect(["exact", "derived", "approximate", "unavailable"]).toContain(
          item.chunk.primaryCitation.exactness
        );
      }
    });
  });
});
