import { describe, expect, it } from "bun:test";
import { getTokenCount } from "../normalise";
import { KnowledgeChunkSchema, type CitationRef, type DocumentStructureNode } from "../types";
import { pdfDocumentFixture } from "../test-utils";
import {
  DEFAULT_MAX_TOKEN_COUNT,
  DEFAULT_MIN_TOKEN_COUNT,
  createKnowledgeChunks,
} from "./chunker";

describe("createKnowledgeChunks", () => {
  it("produces stable chunk IDs across re-ingests", () => {
    const fixture = createFixture(6);

    const firstPass = createKnowledgeChunks(fixture);
    const secondPass = createKnowledgeChunks({
      ...fixture,
      nodes: fixture.nodes.map((node) => ({ ...node })),
      citations: fixture.citations.map((citation) => ({ ...citation })),
    });

    expect(firstPass.map((chunk) => chunk.chunkId)).toEqual(
      secondPass.map((chunk) => chunk.chunkId)
    );
    expect(new Set(firstPass.map((chunk) => chunk.chunkId)).size).toBe(firstPass.length);
  });

  it("creates non-empty chunks without orphaning source nodes", () => {
    const fixture = createFixture(6);
    const chunks = createKnowledgeChunks(fixture);

    expect(chunks.length).toBeGreaterThan(0);
    expect(chunks.every((chunk) => chunk.text.trim().length > 0)).toBe(true);
    expect(chunks.every((chunk) => chunk.normalizedText.trim().length > 0)).toBe(true);

    const coveredNodeIds = new Set(chunks.flatMap((chunk) => chunk.sourceNodeIds));

    expect([...coveredNodeIds].sort()).toEqual(fixture.nodes.map((node) => node.nodeId).sort());
  });

  it("keeps structured chunks in the target token range and preserves citation exactness", () => {
    const fixture = createFixture(6);
    const chunks = createKnowledgeChunks(fixture);

    expect(chunks).toHaveLength(2);
    expect(chunks.every((chunk) => chunk.tokenCount >= DEFAULT_MIN_TOKEN_COUNT)).toBe(true);
    expect(chunks.every((chunk) => chunk.tokenCount <= DEFAULT_MAX_TOKEN_COUNT)).toBe(true);
    expect(chunks.every((chunk) => chunk.primaryCitation.exactness === "exact")).toBe(true);
    expect(chunks.every((chunk) => chunk.secondaryCitations.every((citation) => citation.exactness === "exact"))).toBe(
      true
    );
    expect(chunks[0]?.primaryCitation.pageStart).toBe(1);
    expect(chunks[0]?.secondaryCitations.map((citation) => citation.pageStart)).toEqual([2, 3]);

    for (const chunk of chunks) {
      expect(() => KnowledgeChunkSchema.parse(chunk)).not.toThrow();
    }
  });

  it("splits oversized nodes at sentence boundaries while keeping the primary citation exact", () => {
    const oversizedText = buildTokenSizedText("oversized", 720, 760);
    const node = createNode(1, oversizedText);
    const citation = createCitation(1);
    const chunks = createKnowledgeChunks({
      document: pdfDocumentFixture,
      nodes: [node],
      citations: [citation],
    });

    expect(getTokenCount(oversizedText)).toBeGreaterThan(DEFAULT_MAX_TOKEN_COUNT);
    expect(chunks.length).toBeGreaterThan(1);
    expect(chunks.every((chunk) => chunk.sourceNodeIds.length === 1)).toBe(true);
    expect(chunks.every((chunk) => chunk.sourceNodeIds[0] === node.nodeId)).toBe(true);
    expect(chunks.every((chunk) => chunk.primaryCitation.pageStart === 1)).toBe(true);
    expect(chunks.every((chunk) => chunk.primaryCitation.exactness === "exact")).toBe(true);
    expect(chunks.every((chunk) => chunk.text.trim().endsWith("."))).toBe(true);
    expect(chunks.every((chunk) => chunk.tokenCount <= DEFAULT_MAX_TOKEN_COUNT)).toBe(true);
  });
});

function createFixture(nodeCount: number): {
  document: typeof pdfDocumentFixture;
  nodes: DocumentStructureNode[];
  citations: CitationRef[];
} {
  const nodes = Array.from({ length: nodeCount }, (_, index) => {
    const pageNumber = index + 1;

    return createNode(pageNumber, buildTokenSizedText(`page-${pageNumber}`, 150, 170));
  });

  return {
    document: pdfDocumentFixture,
    nodes,
    citations: nodes.map((node) => createCitation(node.pageNumber ?? 1)),
  };
}

function createNode(pageNumber: number, text: string): DocumentStructureNode {
  return {
    nodeId: `${pdfDocumentFixture.documentId}:node:${pageNumber}`,
    documentId: pdfDocumentFixture.documentId,
    nodeType: "paragraph",
    text,
    path: `page:${pageNumber}/block:1`,
    sectionPath: ["Core Loops", `Page ${pageNumber}`],
    pageNumber,
    tokenCount: getTokenCount(text),
  };
}

function createCitation(pageNumber: number): CitationRef {
  return {
    documentId: pdfDocumentFixture.documentId,
    citationKind: "page",
    pageStart: pageNumber,
    pageEnd: pageNumber,
    locatorText: `page ${pageNumber}`,
    exactness: "exact",
  };
}

function buildTokenSizedText(label: string, minimumTokens: number, maximumTokens: number): string {
  const sentences: string[] = [];
  let text = "";
  let tokenCount = 0;
  let sentenceIndex = 1;

  while (tokenCount < minimumTokens) {
    const sentence = `${label} sentence ${sentenceIndex} explains combat pacing, rewards mastery, supports feedback loops, and clarifies resource tradeoffs for players.`;
    const candidate = [...sentences, sentence].join(" ");
    const candidateTokenCount = getTokenCount(candidate);

    if (sentences.length > 0 && candidateTokenCount > maximumTokens) {
      break;
    }

    sentences.push(sentence);
    text = candidate;
    tokenCount = candidateTokenCount;
    sentenceIndex += 1;
  }

  if (tokenCount < minimumTokens || tokenCount > maximumTokens) {
    throw new Error(`Unable to build text for token range ${minimumTokens}-${maximumTokens}.`);
  }

  return text;
}
