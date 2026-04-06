import { describe, it, expect } from "vitest";
import {
  getAllDocumentFixtures,
  getDocumentFixtureByType,
} from "./document-fixtures";
import {
  getAllChunkFixtures,
  getChunkFixtureByType,
} from "./chunk-fixtures";
import {
  getCitationFixturesByFormat,
  pdfCitationExact,
  docxCitationExact,
  csvCitationExact,
  jsonCitationExact,
  yamlCitationExact,
} from "./citation-fixtures";
import { SourceDocumentSchema, KnowledgeChunkSchema, CitationRefSchema } from "../types";

describe("Document Fixtures", () => {
  it("should have all 7 document fixtures", () => {
    const docs = getAllDocumentFixtures();
    expect(docs).toHaveLength(7);
  });

  it("should have one fixture per source type", () => {
    const sourceTypes: Array<"pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml"> = [
      "pdf",
      "docx",
      "md",
      "txt",
      "csv",
      "json",
      "yaml",
    ];
    for (const type of sourceTypes) {
      const doc = getDocumentFixtureByType(type);
      expect(doc.sourceType).toBe(type);
    }
  });

  it("should validate all documents against schema", () => {
    const docs = getAllDocumentFixtures();
    for (const doc of docs) {
      const result = SourceDocumentSchema.safeParse(doc);
      expect(result.success).toBe(true);
    }
  });

  it("should have unique documentIds", () => {
    const docs = getAllDocumentFixtures();
    const ids = docs.map((d) => d.documentId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have parseStatus success or partial", () => {
    const docs = getAllDocumentFixtures();
    const validStatuses = ["success", "partial", "failed"];
    for (const doc of docs) {
      expect(validStatuses).toContain(doc.parseStatus);
    }
  });

  it("should have non-empty displayTitle", () => {
    const docs = getAllDocumentFixtures();
    for (const doc of docs) {
      expect(doc.displayTitle.length).toBeGreaterThan(0);
    }
  });

  it("should throw for unknown source type", () => {
    expect(() => getDocumentFixtureByType("unknown" as unknown as "pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml")).toThrow();
  });
});

describe("Chunk Fixtures", () => {
  it("should have all 6 chunk fixtures", () => {
    const chunks = getAllChunkFixtures();
    expect(chunks).toHaveLength(6);
  });

  it("should have one fixture per major format", () => {
    const sourceTypes: Array<"pdf" | "docx" | "md" | "csv" | "json" | "yaml"> = [
      "pdf",
      "docx",
      "md",
      "csv",
      "json",
      "yaml",
    ];
    for (const type of sourceTypes) {
      const chunk = getChunkFixtureByType(type);
      expect(chunk.metadata.sourceType).toBe(type);
    }
  });

  it("should validate all chunks against schema", () => {
    const chunks = getAllChunkFixtures();
    for (const chunk of chunks) {
      const result = KnowledgeChunkSchema.safeParse(chunk);
      expect(result.success).toBe(true);
    }
  });

  it("should have unique chunkIds", () => {
    const chunks = getAllChunkFixtures();
    const ids = chunks.map((c) => c.chunkId);
    const uniqueIds = new Set(ids);
    expect(uniqueIds.size).toBe(ids.length);
  });

  it("should have non-empty text", () => {
    const chunks = getAllChunkFixtures();
    for (const chunk of chunks) {
      expect(chunk.text.length).toBeGreaterThan(0);
    }
  });

  it("should have primaryCitation with exactness", () => {
    const chunks = getAllChunkFixtures();
    const validExactness = ["exact", "derived", "approximate", "unavailable"];
    for (const chunk of chunks) {
      expect(chunk.primaryCitation).toBeDefined();
      expect(chunk.primaryCitation.exactness).toBeDefined();
      expect(validExactness).toContain(chunk.primaryCitation.exactness);
    }
  });

  it("should have embeddingReady false in MVP", () => {
    const chunks = getAllChunkFixtures();
    for (const chunk of chunks) {
      expect(chunk.embeddingReady).toBe(false);
    }
  });

  it("should have tokenCount > 0", () => {
    const chunks = getAllChunkFixtures();
    for (const chunk of chunks) {
      expect(chunk.tokenCount).toBeGreaterThan(0);
    }
  });

  it("should throw for unknown source type", () => {
    expect(() => getChunkFixtureByType("unknown" as unknown as "pdf" | "docx" | "md" | "csv" | "json" | "yaml")).toThrow();
  });
});

describe("Citation Fixtures", () => {
  it("should have citations for all 7 formats", () => {
    const formats: Array<"pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml"> = [
      "pdf",
      "docx",
      "md",
      "txt",
      "csv",
      "json",
      "yaml",
    ];
    for (const format of formats) {
      const citations = getCitationFixturesByFormat(format);
      expect(citations.exact).toBeDefined();
      expect(citations.unavailable).toBeDefined();
    }
  });

  it("should validate all citations against schema", () => {
    const formats: Array<"pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml"> = [
      "pdf",
      "docx",
      "md",
      "txt",
      "csv",
      "json",
      "yaml",
    ];
    for (const format of formats) {
      const citations = getCitationFixturesByFormat(format);
      const exactResult = CitationRefSchema.safeParse(citations.exact);
      const unavailableResult = CitationRefSchema.safeParse(citations.unavailable);
      expect(exactResult.success).toBe(true);
      expect(unavailableResult.success).toBe(true);
    }
  });

  it("should have exactness field on all citations", () => {
    const formats: Array<"pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml"> = [
      "pdf",
      "docx",
      "md",
      "txt",
      "csv",
      "json",
      "yaml",
    ];
    for (const format of formats) {
      const citations = getCitationFixturesByFormat(format);
      expect(citations.exact.exactness).toBeDefined();
      expect(citations.unavailable.exactness).toBeDefined();
    }
  });

  it("should have correct citationKind per format", () => {
    expect(pdfCitationExact.citationKind).toBe("page");
    expect(docxCitationExact.citationKind).toBe("section");
    expect(csvCitationExact.citationKind).toBe("row");
    expect(jsonCitationExact.citationKind).toBe("jsonPath");
    expect(yamlCitationExact.citationKind).toBe("yamlPath");
  });

  it("should have format-specific fields populated", () => {
    expect(pdfCitationExact.pageStart).toBeDefined();
    expect(docxCitationExact.sectionPath).toBeDefined();
    expect(csvCitationExact.rowStart).toBeDefined();
    expect(jsonCitationExact.jsonPath).toBeDefined();
    expect(yamlCitationExact.yamlPath).toBeDefined();
  });

  it("should throw for unknown format", () => {
    expect(() => getCitationFixturesByFormat("unknown" as unknown as "pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml")).toThrow();
  });
});

describe("Fixture Consistency", () => {
  it("should have matching documentIds between documents and chunks", () => {
    const docs = getAllDocumentFixtures();
    const chunks = getAllChunkFixtures();

    const docIds = new Set(docs.map((d) => d.documentId));
    for (const chunk of chunks) {
      expect(docIds.has(chunk.documentId)).toBe(true);
    }
  });

  it("should have matching documentIds between chunks and citations", () => {
    const chunks = getAllChunkFixtures();
    for (const chunk of chunks) {
      expect(chunk.primaryCitation.documentId).toBe(chunk.documentId);
    }
  });

  it("should have game-design related content", () => {
    const chunks = getAllChunkFixtures();
    const gameDesignKeywords = [
      "game",
      "loop",
      "progression",
      "mechanic",
      "design",
      "combat",
    ];

    for (const chunk of chunks) {
      const text = chunk.text.toLowerCase();
      const hasKeyword = gameDesignKeywords.some((kw) => text.includes(kw));
      expect(hasKeyword).toBe(true);
    }
  });
});
