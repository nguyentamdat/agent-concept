import { describe, it, expect } from "vitest";
import { KnowledgeChunkSchema } from "./chunk";

describe("KnowledgeChunk", () => {
  it("validates a valid KnowledgeChunk", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1", "node-2"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        pageEnd: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: ["Chapter 1"],
      metadata: {
        sourceType: "pdf",
        category: "mechanics",
        tags: ["combat", "core"],
        language: "en",
        topic: "game mechanics",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: ["Chapter 1"],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      // missing chunkStrategyVersion
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).toThrow();
  });

  it("requires primaryCitation with exactness", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        // missing exactness
      },
      secondaryCitations: [],
      sectionPath: ["Chapter 1"],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).toThrow();
  });

  it("allows empty secondaryCitations", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: [],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).not.toThrow();
  });

  it("allows multiple secondaryCitations", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1", "node-2"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [
        {
          documentId: "doc-123",
          citationKind: "page" as const,
          pageStart: 6,
          exactness: "exact" as const,
        },
      ],
      sectionPath: ["Chapter 1"],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).not.toThrow();
  });

  it("allows optional metadata fields", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: [],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).not.toThrow();
  });

  it("rejects non-boolean embeddingReady", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: [],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: 5,
      chunkStrategyVersion: "1.0",
      embeddingReady: "yes" as unknown as boolean,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).toThrow();
  });

  it("rejects non-numeric tokenCount", () => {
    const chunk = {
      chunkId: "chunk-abc123",
      documentId: "doc-123",
      text: "This is chunk content.",
      normalizedText: "this is chunk content",
      sourceNodeIds: ["node-1"],
      primaryCitation: {
        documentId: "doc-123",
        citationKind: "page" as const,
        pageStart: 5,
        exactness: "exact" as const,
      },
      secondaryCitations: [],
      sectionPath: [],
      metadata: {
        sourceType: "pdf",
      },
      tokenCount: "five" as unknown as number,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    };
    expect(() => KnowledgeChunkSchema.parse(chunk)).toThrow();
  });
});
