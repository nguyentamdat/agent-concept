import { describe, expect, it } from "bun:test";
import { evaluateRetrieval, type GoldenQuery } from "../eval/index";
import { KnowledgeTool, type KnowledgeChunk, type SourceDocument } from "../index";

const FIXTURE_PATHS = {
  md: new URL("../../knowledge/fixtures/sample.md", import.meta.url).pathname,
  csv: new URL("../../knowledge/fixtures/sample.csv", import.meta.url).pathname,
  json: new URL("../../knowledge/fixtures/sample.json", import.meta.url).pathname,
  yaml: new URL("../../knowledge/fixtures/sample.yaml", import.meta.url).pathname,
} as const;

const PDF_PATH = new URL("../../knowledge/fixtures/sample.pdf", import.meta.url).pathname;
const DOCX_PATH = new URL("../../knowledge/fixtures/sample.docx", import.meta.url).pathname;

describe("e2e pipeline", () => {
  it("ingests all required fixture formats", async () => {
    const { tool } = await createToolWithFixtures();

    expect(tool.listDocuments().length).toBeGreaterThanOrEqual(4);
  });

  it("returns ranked search results with citations", async () => {
    const { tool } = await createToolWithFixtures();

    const result = tool.search({
      query: "core loop",
      topK: 5,
      retrievalMode: "lexical",
      includeRawText: true,
      includeStructured: false,
    });

    expect(result.results.length).toBeGreaterThanOrEqual(1);
    expect(result.results[0]?.citation).toBeDefined();
  });

  it("returns raw, normalized, structure, and chunk document views", async () => {
    const { tool, documents } = await createToolWithFixtures();
    const markdownDocument = getDocumentBySourceType(documents, "md");

    const rawView = tool.getDocument(markdownDocument.documentId, "raw");
    const normalizedView = tool.getDocument(markdownDocument.documentId, "normalized");
    const structureView = tool.getDocument(markdownDocument.documentId, "structure");
    const chunksView = tool.getDocument(markdownDocument.documentId, "chunks");

    expect(typeof rawView.data).toBe("string");
    expect(rawView.data.length).toBeGreaterThan(0);

    expect(typeof normalizedView.data).toBe("string");
    expect(normalizedView.data.length).toBeGreaterThan(0);

    expect(structureView.data.length).toBeGreaterThan(0);
    expect(chunksView.data.length).toBeGreaterThan(0);
  });

  it("produces evidence-backed extraction results", async () => {
    const { tool, documents } = await createToolWithFixtures();
    const markdownDocument = getDocumentBySourceType(documents, "md");

    const extraction = tool.extract(markdownDocument.documentId, "game-mechanics");

    expect(extraction.extractionStatus).not.toBe("failed");
    expect(extraction.evidence.length).toBeGreaterThan(0);
    expect(extraction.evidence[0]?.citation.exactness).toBeDefined();
  });

  it("meets evaluation acceptance thresholds on the ingested corpus", async () => {
    const { tool, documents } = await createToolWithFixtures();
    const chunks = documents.flatMap((document) => getDocumentChunks(tool, document.documentId));
    const dataset = buildEvaluationDataset(tool, documents);

    const report = await evaluateRetrieval({
      chunks,
      dataset,
    });

    expect(report["recall@5"]).toBeGreaterThanOrEqual(0.7);
    expect(report.citation_fidelity_rate).toBeGreaterThanOrEqual(0.9);
    expect(report.latency_p95_ms).toBeLessThan(500);
  });
});

async function createToolWithFixtures() {
  const tool = new KnowledgeTool();
  const paths = Object.values(FIXTURE_PATHS);
  
  await Promise.all(paths.map((filePath) => tool.ingest(filePath)));

  return {
    tool,
    documents: tool.listDocuments(),
  };
}

function buildEvaluationDataset(tool: KnowledgeTool, documents: SourceDocument[]): GoldenQuery[] {
  return [
    createGoldenQuery(
      "long-term goals sense of advancement",
      { sourceType: "md" },
      findChunkIdByPattern(tool, getDocumentBySourceType(documents, "md").documentId, /long-term goals/i)
    ),
    createGoldenQuery(
      "primary repeated action cycle medium high",
      { sourceType: "csv" },
      findChunkIdByPattern(tool, getDocumentBySourceType(documents, "csv").documentId, /primary repeated action cycle/i)
    ),
    createGoldenQuery(
      "turn-based combat enemy responds",
      { sourceType: "json" },
      findChunkIdByPattern(tool, getDocumentBySourceType(documents, "json").documentId, /enemy responds/i)
    ),
    createGoldenQuery(
      "action economy complexity high",
      { sourceType: "yaml" },
      findChunkIdByPattern(tool, getDocumentBySourceType(documents, "yaml").documentId, /action economy/i)
    ),
  ];
}

function createGoldenQuery(
  query: string,
  filters: GoldenQuery["filters"],
  expectedChunkId: string
): GoldenQuery {
  return {
    query,
    filters,
    topK: 5,
    expectedChunkIds: [expectedChunkId],
  };
}

function getDocumentBySourceType(
  documents: SourceDocument[],
  sourceType: SourceDocument["sourceType"]
): SourceDocument {
  const document = documents.find((entry) => entry.sourceType === sourceType);

  if (!document) {
    throw new Error(`Missing ingested document for source type: ${sourceType}`);
  }

  return document;
}

function getDocumentChunks(tool: KnowledgeTool, documentId: string): KnowledgeChunk[] {
  return tool.getDocument(documentId, "chunks").data;
}

function findChunkIdByPattern(tool: KnowledgeTool, documentId: string, pattern: RegExp): string {
  const chunk = getDocumentChunks(tool, documentId).find((entry) => pattern.test(entry.text));

  if (!chunk) {
    throw new Error(`Missing expected chunk for ${documentId} matching ${pattern}`);
  }

  return chunk.chunkId;
}
