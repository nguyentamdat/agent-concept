import { describe, it, expect } from "vitest";
import {
  SourceDocumentSchema,
  DocumentStructureNodeSchema,
  CitationRefSchema,
  KnowledgeChunkSchema,
  StructuredExtractionSchema,
  SearchKnowledgeRequestSchema,
  SearchKnowledgeResultSchema,
  GetDocumentRequestSchema,
  GetDocumentResultSchema,
  GetExtractionRequestSchema,
  GetExtractionResultSchema,
} from "./index";

describe("Contract Integration", () => {
  it("all schemas are exported from barrel", () => {
    expect(SourceDocumentSchema).toBeDefined();
    expect(DocumentStructureNodeSchema).toBeDefined();
    expect(CitationRefSchema).toBeDefined();
    expect(KnowledgeChunkSchema).toBeDefined();
    expect(StructuredExtractionSchema).toBeDefined();
    expect(SearchKnowledgeRequestSchema).toBeDefined();
    expect(SearchKnowledgeResultSchema).toBeDefined();
    expect(GetDocumentRequestSchema).toBeDefined();
    expect(GetDocumentResultSchema).toBeDefined();
    expect(GetExtractionRequestSchema).toBeDefined();
    expect(GetExtractionResultSchema).toBeDefined();
  });

  it("complete workflow: document -> chunks -> search result", () => {
    const doc = SourceDocumentSchema.parse({
      documentId: "doc-1",
      uri: "file:///test.pdf",
      sourceType: "pdf",
      contentHash: "hash123",
      displayTitle: "Test",
      ingestionVersion: "1.0",
      parseStatus: "success",
      warnings: [],
    });

    const citation = CitationRefSchema.parse({
      documentId: doc.documentId,
      citationKind: "page",
      pageStart: 1,
      exactness: "exact",
    });

    const chunk = KnowledgeChunkSchema.parse({
      chunkId: "chunk-1",
      documentId: doc.documentId,
      text: "Test content",
      normalizedText: "test content",
      sourceNodeIds: ["node-1"],
      primaryCitation: citation,
      secondaryCitations: [],
      sectionPath: [],
      metadata: { sourceType: "pdf" },
      tokenCount: 2,
      chunkStrategyVersion: "1.0",
      embeddingReady: false,
    });

    const searchResult = SearchKnowledgeResultSchema.parse({
      results: [
        {
          chunk,
          score: 0.95,
          citation,
        },
      ],
      timingMs: 50,
      indexVersion: "v1",
    });

    expect(searchResult.results[0].chunk.documentId).toBe(doc.documentId);
    expect(searchResult.results[0].citation.exactness).toBe("exact");
  });

  it("extraction with evidence references", () => {
    const extraction = StructuredExtractionSchema.parse({
      documentId: "doc-1",
      schemaName: "game-mechanic",
      records: [
        {
          name: "Combat",
          type: "core",
        },
      ],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-1",
            citationKind: "section",
            sectionPath: "Chapter 1",
            exactness: "exact",
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "success",
      warnings: [],
    });

    expect(extraction.records[0].name).toBe("Combat");
    expect(extraction.evidence[0].citation.exactness).toBe("exact");
  });

  it("document access with all views", () => {
    const doc = SourceDocumentSchema.parse({
      documentId: "doc-1",
      uri: "file:///test.pdf",
      sourceType: "pdf",
      contentHash: "hash123",
      displayTitle: "Test",
      ingestionVersion: "1.0",
      parseStatus: "success",
      warnings: [],
    });

    const rawResult = GetDocumentResultSchema.parse({
      document: doc,
      data: "raw content",
      rawMimeType: "application/pdf",
    });

    const structureResult = GetDocumentResultSchema.parse({
      document: doc,
      data: [
        {
          nodeId: "node-1",
          documentId: doc.documentId,
          nodeType: "paragraph",
          text: "Test",
          path: "page:1/block:0",
          tokenCount: 1,
        },
      ],
    });

    const chunksResult = GetDocumentResultSchema.parse({
      document: doc,
      data: [
        {
          chunkId: "chunk-1",
          documentId: doc.documentId,
          text: "Test",
          normalizedText: "test",
          sourceNodeIds: ["node-1"],
          primaryCitation: {
            documentId: doc.documentId,
            citationKind: "page",
            pageStart: 1,
            exactness: "exact",
          },
          secondaryCitations: [],
          sectionPath: [],
          metadata: { sourceType: "pdf" },
          tokenCount: 1,
          chunkStrategyVersion: "1.0",
          embeddingReady: false,
        },
      ],
    });

    expect(typeof rawResult.data).toBe("string");
    expect(Array.isArray(structureResult.data)).toBe(true);
    expect(Array.isArray(chunksResult.data)).toBe(true);
  });
});
