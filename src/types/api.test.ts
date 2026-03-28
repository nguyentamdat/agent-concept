import { describe, it, expect } from "bun:test";
import {
  SearchKnowledgeRequestSchema,
  SearchKnowledgeResultSchema,
  GetDocumentRequestSchema,
  GetDocumentResultSchema,
  GetExtractionRequestSchema,
  GetExtractionResultSchema,
} from "./api";

describe("SearchKnowledgeRequest", () => {
  it("validates a valid request", () => {
    const req = {
      query: "combat mechanics",
      topK: 5,
      retrievalMode: "lexical" as const,
      includeRawText: true,
      includeStructured: false,
    };
    expect(() => SearchKnowledgeRequestSchema.parse(req)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    const req = {
      query: "combat mechanics",
      topK: 5,
      // missing retrievalMode
      includeRawText: true,
      includeStructured: false,
    };
    expect(() => SearchKnowledgeRequestSchema.parse(req)).toThrow();
  });

  it("allows optional filters", () => {
    const req = {
      query: "combat mechanics",
      filters: {
        category: "mechanics",
        tags: ["combat", "core"],
        sourceType: "pdf",
        language: "en",
      },
      topK: 5,
      retrievalMode: "lexical" as const,
      includeRawText: true,
      includeStructured: false,
    };
    expect(() => SearchKnowledgeRequestSchema.parse(req)).not.toThrow();
  });

  it("allows optional minScore", () => {
    const req = {
      query: "combat mechanics",
      topK: 5,
      retrievalMode: "lexical" as const,
      includeRawText: true,
      includeStructured: false,
      minScore: 0.5,
    };
    expect(() => SearchKnowledgeRequestSchema.parse(req)).not.toThrow();
  });

  it("rejects invalid retrievalMode", () => {
    const req = {
      query: "combat mechanics",
      topK: 5,
      retrievalMode: "vector" as unknown as "lexical" | "hybrid" | "semantic",
      includeRawText: true,
      includeStructured: false,
    };
    expect(() => SearchKnowledgeRequestSchema.parse(req)).toThrow();
  });
});

describe("SearchKnowledgeResult", () => {
  it("validates a valid result", () => {
    const result = {
      results: [
        {
          chunk: {
            chunkId: "chunk-1",
            documentId: "doc-123",
            text: "Combat mechanics",
            normalizedText: "combat mechanics",
            sourceNodeIds: ["node-1"],
            primaryCitation: {
              documentId: "doc-123",
              citationKind: "page" as const,
              pageStart: 5,
              exactness: "exact" as const,
            },
            secondaryCitations: [],
            sectionPath: [],
            metadata: { sourceType: "pdf" },
            tokenCount: 2,
            chunkStrategyVersion: "1.0",
            embeddingReady: false,
          },
          score: 0.95,
          citation: {
            documentId: "doc-123",
            citationKind: "page" as const,
            pageStart: 5,
            exactness: "exact" as const,
          },
        },
      ],
      timingMs: 45,
      indexVersion: "v1-abc123",
    };
    expect(() => SearchKnowledgeResultSchema.parse(result)).not.toThrow();
  });

  it("allows empty results", () => {
    const result = {
      results: [],
      timingMs: 10,
      indexVersion: "v1-abc123",
    };
    expect(() => SearchKnowledgeResultSchema.parse(result)).not.toThrow();
  });

  it("allows optional scoreBreakdown", () => {
    const result = {
      results: [
        {
          chunk: {
            chunkId: "chunk-1",
            documentId: "doc-123",
            text: "Combat mechanics",
            normalizedText: "combat mechanics",
            sourceNodeIds: ["node-1"],
            primaryCitation: {
              documentId: "doc-123",
              citationKind: "page" as const,
              pageStart: 5,
              exactness: "exact" as const,
            },
            secondaryCitations: [],
            sectionPath: [],
            metadata: { sourceType: "pdf" },
            tokenCount: 2,
            chunkStrategyVersion: "1.0",
            embeddingReady: false,
          },
          score: 0.95,
          scoreBreakdown: { bm25: 0.95, boost: 0.0 },
          citation: {
            documentId: "doc-123",
            citationKind: "page" as const,
            pageStart: 5,
            exactness: "exact" as const,
          },
        },
      ],
      timingMs: 45,
      indexVersion: "v1-abc123",
    };
    expect(() => SearchKnowledgeResultSchema.parse(result)).not.toThrow();
  });

  it("allows optional matchedTerms", () => {
    const result = {
      results: [
        {
          chunk: {
            chunkId: "chunk-1",
            documentId: "doc-123",
            text: "Combat mechanics",
            normalizedText: "combat mechanics",
            sourceNodeIds: ["node-1"],
            primaryCitation: {
              documentId: "doc-123",
              citationKind: "page" as const,
              pageStart: 5,
              exactness: "exact" as const,
            },
            secondaryCitations: [],
            sectionPath: [],
            metadata: { sourceType: "pdf" },
            tokenCount: 2,
            chunkStrategyVersion: "1.0",
            embeddingReady: false,
          },
          score: 0.95,
          citation: {
            documentId: "doc-123",
            citationKind: "page" as const,
            pageStart: 5,
            exactness: "exact" as const,
          },
          matchedTerms: ["combat", "mechanics"],
        },
      ],
      timingMs: 45,
      indexVersion: "v1-abc123",
    };
    expect(() => SearchKnowledgeResultSchema.parse(result)).not.toThrow();
  });
});

describe("GetDocumentRequest", () => {
  it("validates a valid request", () => {
    const req = {
      documentId: "doc-123",
      view: "raw" as const,
    };
    expect(() => GetDocumentRequestSchema.parse(req)).not.toThrow();
  });

  it("rejects invalid view", () => {
    const req = {
      documentId: "doc-123",
      view: "invalid" as unknown as "raw" | "normalized" | "structure" | "chunks",
    };
    expect(() => GetDocumentRequestSchema.parse(req)).toThrow();
  });

  it("allows all view types", () => {
    const views = ["raw", "normalized", "structure", "chunks"] as const;
    views.forEach((view) => {
      const req = {
        documentId: "doc-123",
        view,
      };
      expect(() => GetDocumentRequestSchema.parse(req)).not.toThrow();
    });
  });
});

describe("GetDocumentResult", () => {
  it("validates result with raw view", () => {
    const result = {
      document: {
        documentId: "doc-123",
        uri: "file:///path/to/doc.pdf",
        sourceType: "pdf" as const,
        contentHash: "abc123",
        displayTitle: "Test Doc",
        ingestionVersion: "1.0",
        parseStatus: "success" as const,
        warnings: [],
      },
      data: "raw file content",
      rawMimeType: "application/pdf",
      sizeBytes: 1024,
    };
    expect(() => GetDocumentResultSchema.parse(result)).not.toThrow();
  });

  it("validates result with structure view", () => {
    const result = {
      document: {
        documentId: "doc-123",
        uri: "file:///path/to/doc.pdf",
        sourceType: "pdf" as const,
        contentHash: "abc123",
        displayTitle: "Test Doc",
        ingestionVersion: "1.0",
        parseStatus: "success" as const,
        warnings: [],
      },
      data: [
        {
          nodeId: "node-1",
          documentId: "doc-123",
          nodeType: "paragraph" as const,
          text: "Test paragraph",
          path: "page:1/block:0",
          tokenCount: 2,
        },
      ],
    };
    expect(() => GetDocumentResultSchema.parse(result)).not.toThrow();
  });

  it("validates result with chunks view", () => {
    const result = {
      document: {
        documentId: "doc-123",
        uri: "file:///path/to/doc.pdf",
        sourceType: "pdf" as const,
        contentHash: "abc123",
        displayTitle: "Test Doc",
        ingestionVersion: "1.0",
        parseStatus: "success" as const,
        warnings: [],
      },
      data: [
        {
          chunkId: "chunk-1",
          documentId: "doc-123",
          text: "Test chunk",
          normalizedText: "test chunk",
          sourceNodeIds: ["node-1"],
          primaryCitation: {
            documentId: "doc-123",
            citationKind: "page" as const,
            pageStart: 1,
            exactness: "exact" as const,
          },
          secondaryCitations: [],
          sectionPath: [],
          metadata: { sourceType: "pdf" },
          tokenCount: 2,
          chunkStrategyVersion: "1.0",
          embeddingReady: false,
        },
      ],
    };
    expect(() => GetDocumentResultSchema.parse(result)).not.toThrow();
  });
});

describe("GetExtractionRequest", () => {
  it("validates a valid request", () => {
    const req = {
      documentId: "doc-123",
    };
    expect(() => GetExtractionRequestSchema.parse(req)).not.toThrow();
  });

  it("allows optional schemaName", () => {
    const req = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
    };
    expect(() => GetExtractionRequestSchema.parse(req)).not.toThrow();
  });

  it("rejects missing documentId", () => {
    const req = {
      schemaName: "game-mechanic",
    };
    expect(() => GetExtractionRequestSchema.parse(req)).toThrow();
  });
});

describe("GetExtractionResult", () => {
  it("validates a valid result", () => {
    const result = {
      document: {
        documentId: "doc-123",
        uri: "file:///path/to/doc.pdf",
        sourceType: "pdf" as const,
        contentHash: "abc123",
        displayTitle: "Test Doc",
        ingestionVersion: "1.0",
        parseStatus: "success" as const,
        warnings: [],
      },
      extractions: [
        {
          documentId: "doc-123",
          schemaName: "game-mechanic",
          records: [{ name: "Combat Loop" }],
          evidence: [
            {
              recordIndex: 0,
              citation: {
                documentId: "doc-123",
                citationKind: "section" as const,
                sectionPath: "Chapter 1",
                exactness: "exact" as const,
              },
              fieldPath: "name",
            },
          ],
          extractionStatus: "success" as const,
          warnings: [],
        },
      ],
    };
    expect(() => GetExtractionResultSchema.parse(result)).not.toThrow();
  });

  it("allows empty extractions", () => {
    const result = {
      document: {
        documentId: "doc-123",
        uri: "file:///path/to/doc.pdf",
        sourceType: "pdf" as const,
        contentHash: "abc123",
        displayTitle: "Test Doc",
        ingestionVersion: "1.0",
        parseStatus: "success" as const,
        warnings: [],
      },
      extractions: [],
    };
    expect(() => GetExtractionResultSchema.parse(result)).not.toThrow();
  });
});
