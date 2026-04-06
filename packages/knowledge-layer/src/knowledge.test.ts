import { beforeEach, describe, expect, it } from "vitest";
import { fileURLToPath } from "node:url";
import {
  GetDocumentResultSchema,
  SearchKnowledgeResultSchema,
  SourceDocumentSchema,
  StructuredExtractionSchema,
} from "./types";
import { KnowledgeTool } from "./index";

const sampleMarkdownPath = fileURLToPath(new URL("../fixtures/sample.md", import.meta.url));

describe("KnowledgeTool", () => {
  let knowledgeTool: KnowledgeTool;

  beforeEach(() => {
    knowledgeTool = new KnowledgeTool();
  });

  it("ingests a document and returns ranked search results", async () => {
    const document = await knowledgeTool.ingest(sampleMarkdownPath, {
      metadata: {
        category: "design",
        tags: ["core-loop", "progression"],
        topic: "game-design",
      },
    });
    const result = knowledgeTool.search({
      query: "core loop",
      topK: 3,
      retrievalMode: "lexical",
      includeRawText: true,
      includeStructured: true,
    });

    expect(SourceDocumentSchema.safeParse(document).success).toBe(true);
    expect(SearchKnowledgeResultSchema.safeParse(result).success).toBe(true);
    expect(result.results.length).toBeGreaterThan(0);
    expect(result.results[0]?.chunk.documentId).toBe(document.documentId);
    expect(result.results[0]?.citation.documentId).toBe(document.documentId);
  });

  it("returns the requested document view", async () => {
    const document = await knowledgeTool.ingest(sampleMarkdownPath);
    const result = knowledgeTool.getDocument(document.documentId, "structure");

    expect(GetDocumentResultSchema.safeParse(result).success).toBe(true);
    expect(Array.isArray(result.data)).toBe(true);
    expect(result.data[0]?.path).toBe("heading:Game Design Fundamentals");
  });

  it("extracts structured records with evidence citations", async () => {
    const document = await knowledgeTool.ingest(sampleMarkdownPath);
    const extraction = knowledgeTool.extract(document.documentId, "game-mechanics");

    expect(StructuredExtractionSchema.safeParse(extraction).success).toBe(true);
    expect(extraction.records.length).toBeGreaterThan(0);
    expect(extraction.evidence.length).toBeGreaterThan(0);
    expect(extraction.evidence[0]?.citation.documentId).toBe(document.documentId);
    expect(extraction.evidence[0]?.citation.exactness).toBeDefined();
  });

  it("lists ingested documents", async () => {
    const document = await knowledgeTool.ingest(sampleMarkdownPath);
    const documents = knowledgeTool.listDocuments();

    expect(documents.length).toBeGreaterThan(0);
    expect(documents.map((entry) => entry.documentId)).toContain(document.documentId);
  });

  it("keeps internal modules out of the public barrel", async () => {
    const publicApi = await import("./index");

    expect(Object.keys(publicApi)).toEqual(["KnowledgeTool"]);
    expect("createKnowledgeIndex" in publicApi).toBe(false);
    expect("createKnowledgeChunks" in publicApi).toBe(false);
    expect("parseMarkdown" in publicApi).toBe(false);
    expect("extractFromChunks" in publicApi).toBe(false);
  });
});
