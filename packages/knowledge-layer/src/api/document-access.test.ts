import { beforeEach, describe, expect, it } from "vitest";
import { pdfChunkFixture, pdfDocumentFixture } from "../test-utils";
import {
  GetDocumentResultSchema,
  type DocumentStructureNode,
  type KnowledgeChunk,
} from "../types";
import { getDocument, type DocumentStore } from "./index";

const pdfStructureNodes: DocumentStructureNode[] = [
  {
    nodeId: "node-pdf-section-001",
    documentId: pdfDocumentFixture.documentId,
    nodeType: "section",
    text: "Core Loops",
    path: "page:1/block:1",
    sectionPath: ["Core Loops"],
    pageNumber: 1,
    tokenCount: 2,
  },
  {
    nodeId: pdfChunkFixture.sourceNodeIds[0],
    documentId: pdfDocumentFixture.documentId,
    nodeType: "paragraph",
    text: pdfChunkFixture.text,
    path: "page:1/block:2",
    pageNumber: 1,
    tokenCount: pdfChunkFixture.tokenCount,
  },
];

const rawText = "Raw PDF content for game design fundamentals.";
const normalizedText = "Raw PDF content for game design fundamentals.";

describe("getDocument", () => {
  let documentStore: DocumentStore;

  beforeEach(() => {
    documentStore = {
      [pdfDocumentFixture.documentId]: {
        document: pdfDocumentFixture,
        rawText,
        normalizedText,
        nodes: pdfStructureNodes,
        chunks: [pdfChunkFixture],
      },
    };
  });

  it("returns the raw view", () => {
    const result = getDocument(pdfDocumentFixture.documentId, "raw", documentStore);
    const data: string = result.data;

    expect(result.document).toEqual(pdfDocumentFixture);
    expect(data).toBe(rawText);
    expect(result.rawMimeType).toBe("application/pdf");
    expect(result.sizeBytes).toBeGreaterThan(0);
    expect(GetDocumentResultSchema.safeParse(result).success).toBe(true);
  });

  it("returns the normalized view", () => {
    const result = getDocument(pdfDocumentFixture.documentId, "normalized", documentStore);
    const data: string = result.data;

    expect(result.document).toEqual(pdfDocumentFixture);
    expect(data).toBe(normalizedText);
    expect(result.rawMimeType).toBeUndefined();
    expect(GetDocumentResultSchema.safeParse(result).success).toBe(true);
  });

  it("returns the structure view", () => {
    const result = getDocument(pdfDocumentFixture.documentId, "structure", documentStore);
    const data: DocumentStructureNode[] = result.data;

    expect(data).toEqual(pdfStructureNodes);
    expect(data[0].path).toBe("page:1/block:1");
    expect(GetDocumentResultSchema.safeParse(result).success).toBe(true);
  });

  it("returns the chunks view", () => {
    const result = getDocument(pdfDocumentFixture.documentId, "chunks", documentStore);
    const data: KnowledgeChunk[] = result.data;

    expect(data).toEqual([pdfChunkFixture]);
    expect(data[0].primaryCitation.exactness).toBe("exact");
    expect(GetDocumentResultSchema.safeParse(result).success).toBe(true);
  });

  it("throws when the document is missing", () => {
    expect(() => getDocument("missing-document", "raw", documentStore)).toThrow(
      "Document not found: missing-document"
    );
  });
});
