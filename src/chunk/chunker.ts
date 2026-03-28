import { getTokenCount, normaliseText } from "../normalise";
import type { CitationRef, DocumentStructureNode, KnowledgeChunk, SourceDocument } from "../types";

export const DEFAULT_TARGET_TOKEN_COUNT = 500;
export const DEFAULT_MIN_TOKEN_COUNT = 400;
export const DEFAULT_MAX_TOKEN_COUNT = 600;
export const CHUNK_STRATEGY_VERSION = "1.0";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const SENTENCE_PATTERN = /[^.!?]+(?:[.!?]+|$)/gu;

type ChunkMetadataOverrides = Partial<
  Omit<KnowledgeChunk["metadata"], "sourceType" | "language">
>;

interface ChunkUnit {
  text: string;
  tokenCount: number;
  sourceNodeId: string;
  citation: CitationRef;
  sectionPath: string[];
}

export interface ChunkDocumentOptions {
  document: SourceDocument;
  nodes: DocumentStructureNode[];
  citations: CitationRef[];
  targetTokenCount?: number;
  minTokenCount?: number;
  maxTokenCount?: number;
  chunkStrategyVersion?: string;
  metadata?: ChunkMetadataOverrides;
}

export function createKnowledgeChunks({
  document,
  nodes,
  citations,
  targetTokenCount = DEFAULT_TARGET_TOKEN_COUNT,
  minTokenCount = DEFAULT_MIN_TOKEN_COUNT,
  maxTokenCount = DEFAULT_MAX_TOKEN_COUNT,
  chunkStrategyVersion = CHUNK_STRATEGY_VERSION,
  metadata,
}: ChunkDocumentOptions): KnowledgeChunk[] {
  if (nodes.length !== citations.length) {
    throw new Error("Nodes and citations must align one-to-one.");
  }

  if (nodes.length === 0) {
    return [];
  }

  const units = nodes.flatMap((node, index) =>
    createChunkUnits(node, citations[index], maxTokenCount)
  );

  if (units.length === 0) {
    return [];
  }

  const chunks: KnowledgeChunk[] = [];
  let currentUnits: ChunkUnit[] = [];
  let currentTokenCount = 0;

  for (const unit of units) {
    if (currentUnits.length === 0) {
      currentUnits = [unit];
      currentTokenCount = unit.tokenCount;
      continue;
    }

    const nextTokenCount = currentTokenCount + unit.tokenCount;

    if (nextTokenCount > maxTokenCount) {
      chunks.push(
        buildChunk(document, currentUnits, chunks.length, chunkStrategyVersion, metadata)
      );
      currentUnits = [unit];
      currentTokenCount = unit.tokenCount;
      continue;
    }

    currentUnits.push(unit);
    currentTokenCount = nextTokenCount;

    if (currentTokenCount >= targetTokenCount && currentTokenCount >= minTokenCount) {
      chunks.push(
        buildChunk(document, currentUnits, chunks.length, chunkStrategyVersion, metadata)
      );
      currentUnits = [];
      currentTokenCount = 0;
    }
  }

  if (currentUnits.length > 0) {
    chunks.push(buildChunk(document, currentUnits, chunks.length, chunkStrategyVersion, metadata));
  }

  return chunks;
}

function createChunkUnits(
  node: DocumentStructureNode,
  citation: CitationRef,
  maxTokenCount: number
): ChunkUnit[] {
  const text = normaliseText(node.text);

  if (!text) {
    return [];
  }

  const tokenCount = getTokenCount(text);
  const sectionPath = getUnitSectionPath(node, citation);

  if (tokenCount <= maxTokenCount) {
    return [
      {
        text,
        tokenCount,
        sourceNodeId: node.nodeId,
        citation: { ...citation },
        sectionPath,
      },
    ];
  }

  return splitOversizedNode(node.nodeId, text, citation, sectionPath, maxTokenCount);
}

function splitOversizedNode(
  nodeId: string,
  text: string,
  citation: CitationRef,
  sectionPath: string[],
  maxTokenCount: number
): ChunkUnit[] {
  const sentences = splitIntoSentences(text);
  const segments = sentences.length > 0 ? groupSentences(sentences, maxTokenCount) : [];
  const chunkTexts = segments.length > 0 ? segments : splitByWords(text, maxTokenCount);

  return chunkTexts.map((chunkText) => ({
    text: chunkText,
    tokenCount: getTokenCount(chunkText),
    sourceNodeId: nodeId,
    citation: { ...citation },
    sectionPath,
  }));
}

function groupSentences(sentences: string[], maxTokenCount: number): string[] {
  const chunks: string[] = [];
  let currentSentences: string[] = [];
  let currentTokenCount = 0;

  for (const sentence of sentences) {
    const sentenceTokenCount = getTokenCount(sentence);

    if (sentenceTokenCount > maxTokenCount) {
      if (currentSentences.length > 0) {
        chunks.push(currentSentences.join(" "));
        currentSentences = [];
        currentTokenCount = 0;
      }

      chunks.push(...splitByWords(sentence, maxTokenCount));
      continue;
    }

    if (currentSentences.length > 0 && currentTokenCount + sentenceTokenCount > maxTokenCount) {
      chunks.push(currentSentences.join(" "));
      currentSentences = [sentence];
      currentTokenCount = sentenceTokenCount;
      continue;
    }

    currentSentences.push(sentence);
    currentTokenCount += sentenceTokenCount;
  }

  if (currentSentences.length > 0) {
    chunks.push(currentSentences.join(" "));
  }

  return chunks.map(normaliseText).filter(Boolean);
}

function splitIntoSentences(text: string): string[] {
  return Array.from(text.matchAll(SENTENCE_PATTERN), (match) => normaliseText(match[0] ?? "")).filter(
    Boolean
  );
}

function splitByWords(text: string, maxTokenCount: number): string[] {
  const words = text.split(/\s+/u).filter(Boolean);
  const chunks: string[] = [];
  let currentWords: string[] = [];

  for (const word of words) {
    const nextWords = [...currentWords, word];
    const nextText = nextWords.join(" ");

    if (currentWords.length > 0 && getTokenCount(nextText) > maxTokenCount) {
      chunks.push(currentWords.join(" "));
      currentWords = [word];
      continue;
    }

    currentWords = nextWords;
  }

  if (currentWords.length > 0) {
    chunks.push(currentWords.join(" "));
  }

  return chunks.map(normaliseText).filter(Boolean);
}

function buildChunk(
  document: SourceDocument,
  units: ChunkUnit[],
  chunkIndex: number,
  chunkStrategyVersion: string,
  metadataOverrides?: ChunkMetadataOverrides
): KnowledgeChunk {
  const text = units.map((unit) => unit.text).join("\n\n");
  const normalizedText = normaliseText(text);
  const citations = getUniqueCitations(units.map((unit) => unit.citation));
  const primaryCitation = citations[0];

  if (!primaryCitation) {
    throw new Error("Every chunk must have a primary citation.");
  }

  return {
    chunkId: buildStableChunkId(document.documentId, primaryCitation, chunkIndex),
    documentId: document.documentId,
    text,
    normalizedText,
    sourceNodeIds: getUniqueValues(units.map((unit) => unit.sourceNodeId)),
    primaryCitation,
    secondaryCitations: citations.slice(1),
    sectionPath: getSharedSectionPath(units, primaryCitation),
    metadata: {
      sourceType: document.sourceType,
      language: document.language,
      ...metadataOverrides,
    },
    tokenCount: getTokenCount(normalizedText),
    chunkStrategyVersion,
    embeddingReady: false,
  };
}

function getSharedSectionPath(units: ChunkUnit[], primaryCitation: CitationRef): string[] {
  const sectionPaths = units.map((unit) => unit.sectionPath).filter((sectionPath) => sectionPath.length > 0);

  if (sectionPaths.length === 0) {
    return splitCitationSectionPath(primaryCitation.sectionPath);
  }

  let sharedSectionPath = [...sectionPaths[0]];

  for (const sectionPath of sectionPaths.slice(1)) {
    let sharedLength = 0;

    while (
      sharedLength < sharedSectionPath.length &&
      sharedLength < sectionPath.length &&
      sharedSectionPath[sharedLength] === sectionPath[sharedLength]
    ) {
      sharedLength += 1;
    }

    sharedSectionPath = sharedSectionPath.slice(0, sharedLength);
  }

  return sharedSectionPath;
}

function getUnitSectionPath(node: DocumentStructureNode, citation: CitationRef): string[] {
  if (node.sectionPath && node.sectionPath.length > 0) {
    return [...node.sectionPath];
  }

  return splitCitationSectionPath(citation.sectionPath);
}

function splitCitationSectionPath(sectionPath?: string): string[] {
  return sectionPath?.split(">").map((segment) => normaliseText(segment)).filter(Boolean) ?? [];
}

function getUniqueCitations(citations: CitationRef[]): CitationRef[] {
  return getUniqueValues(citations, getCitationKey).map((citation) => ({ ...citation }));
}

function getCitationKey(citation: CitationRef): string {
  return [
    citation.documentId,
    citation.citationKind,
    citation.pageStart ?? "",
    citation.pageEnd ?? "",
    citation.sectionPath ?? "",
    citation.rowStart ?? "",
    citation.rowEnd ?? "",
    citation.jsonPath ?? "",
    citation.yamlPath ?? "",
    citation.locatorText ?? "",
    citation.exactness,
  ].join("|");
}

function buildStableChunkId(documentId: string, citation: CitationRef, chunkIndex: number): string {
  const locationKey = [citation.citationKind, citation.sectionPath, citation.pageStart, citation.rowStart]
    .filter((value) => value !== undefined && value !== "")
    .join(":") || citation.locatorText || "unknown";

  return `chunk_${hashString(`${documentId}:${locationKey}:${chunkIndex}`)}`;
}

function hashString(value: string): string {
  let hash = FNV_OFFSET_BASIS;

  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}

function getUniqueValues<T>(values: T[], keySelector?: (value: T) => string): T[] {
  const uniqueValues: T[] = [];
  const seen = new Set<string>();

  for (const value of values) {
    const key = keySelector ? keySelector(value) : String(value);

    if (seen.has(key)) {
      continue;
    }

    seen.add(key);
    uniqueValues.push(value);
  }

  return uniqueValues;
}
