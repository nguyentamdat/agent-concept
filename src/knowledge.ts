import { Buffer } from "node:buffer";
import { basename, extname } from "node:path";
import {
  type DocumentStore,
  type DocumentViewDataMap,
  type GetDocumentResultForView,
} from "./api/document-access";
import { buildFeatureDesignContext, type FeatureDesignContext } from "./api/design-context";
import { createKnowledgeChunks } from "./chunk";
import { extractFromChunks, type ExtractionSchemaName } from "./extract";
export type { DeepSearchOptions, DeepSearchResult } from "./index/index";
import { buildGraphFromChunks, type GraphBuildOptions, type GraphBuildResult } from "./graph/graph-builder";
import type { GameEntity, GameRelation, GraphStats } from "./graph/types";
export type { FeatureDesignContext } from "./api/design-context";
import type { GraphStore } from "./graph/graph-store";
import { createKnowledgeIndex, deepSearch, focusedSearch, type DeepSearchOptions, type DeepSearchResult, type KnowledgeIndex } from "./index/index";
import { buildCitationRefs, normaliseDocument } from "./normalise";
import { parseCsv } from "./parse/csv";
import { parseDocx } from "./parse/docx";
import { parseJson } from "./parse/json";
import { parseMarkdown } from "./parse/md";
import { parsePdf } from "./parse/pdf";
import { createParserContext, createSourceDocument, type ParseSourceOptions } from "./parse/shared";
import { parseText } from "./parse/txt";
import { parseYaml } from "./parse/yaml";
import {
  GetDocumentRequestSchema,
  GetDocumentResultSchema,
  SearchKnowledgeRequestSchema,
  SearchKnowledgeResultSchema,
  SourceDocumentSchema,
  StructuredExtractionSchema,
  type DocumentStructureNode,
  type GetDocumentRequest,
  type GetDocumentResult,
  type KnowledgeChunk,
  type SearchKnowledgeRequest,
  type SearchKnowledgeResult,
  type SourceDocument,
  type StructuredExtraction,
} from "./types";

const textDecoder = new TextDecoder();

const SOURCE_TYPE_BY_EXTENSION: Record<string, SourceDocument["sourceType"]> = {
  ".pdf": "pdf",
  ".docx": "docx",
  ".md": "md",
  ".markdown": "md",
  ".txt": "txt",
  ".csv": "csv",
  ".json": "json",
  ".yaml": "yaml",
  ".yml": "yaml",
};

const textSourceTypes = new Set<SourceDocument["sourceType"]>(["md", "txt", "csv", "json", "yaml"]);
const textEncoder = new TextEncoder();

const rawMimeTypeBySourceType: Record<SourceDocument["sourceType"], string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  yaml: "application/yaml",
};

export type KnowledgeDocumentView = GetDocumentRequest["view"];
export type KnowledgeExtractionSchemaName = ExtractionSchemaName;
export type {
  SearchKnowledgeRequest,
  SearchKnowledgeResult,
  GetDocumentResult,
  SourceDocument,
  StructuredExtraction,
  DocumentStructureNode,
  KnowledgeChunk,
};

export interface KnowledgeIngestOptions extends ParseSourceOptions {
  metadata?: {
    category?: string;
    tags?: string[];
    topic?: string;
  };
}

type ParsedKnowledgeDocument = {
  document: SourceDocument;
  nodes: DocumentStructureNode[];
  rawText: string;
};

export class KnowledgeTool {
  private readonly documentStore: DocumentStore = {};
  private readonly index: KnowledgeIndex;
  private _graph: GraphStore | null = null;
  constructor(index: KnowledgeIndex = createKnowledgeIndex()) {
    this.index = index;
  }

  async ingest(filePath: string, options: KnowledgeIngestOptions = {}): Promise<SourceDocument> {
    const parsed = await parseKnowledgeDocument(filePath, options);
    const normalised = normaliseDocument(parsed.document, parsed.nodes);
    const citations = buildCitationRefs(normalised.nodes, normalised.document);
    const chunks = createKnowledgeChunks({
      document: normalised.document,
      nodes: normalised.nodes,
      citations,
      metadata: options.metadata,
    });

    this.documentStore[normalised.document.documentId] = {
      document: normalised.document,
      rawText: parsed.rawText,
      normalizedText: normalised.normalizedText,
      nodes: normalised.nodes,
      chunks,
    };

    await this.index.build(this.getAllChunks());

    return SourceDocumentSchema.parse(normalised.document);
  }

  search(request: SearchKnowledgeRequest): SearchKnowledgeResult {
    const validatedRequest = SearchKnowledgeRequestSchema.parse(request);
    if (validatedRequest.retrievalMode === "focused") {
      return SearchKnowledgeResultSchema.parse(focusedSearch(validatedRequest, this.index, this._graph));
    }
    return SearchKnowledgeResultSchema.parse(this.index.search(validatedRequest));
  }

  async deepSearch(query: string, options: DeepSearchOptions): Promise<DeepSearchResult> {
    return deepSearch(query, this.index, this._graph, options);
  }

  getDocument<V extends KnowledgeDocumentView>(
    documentId: string,
    view: V
  ): GetDocumentResultForView<V> {
    GetDocumentRequestSchema.parse({ documentId, view });
    const storedDocument = this.getStoredDocument(documentId);
    const data = this.getViewData(view, storedDocument);

    return GetDocumentResultSchema.parse({
      document: storedDocument.document,
      data,
      rawMimeType: view === "raw" ? rawMimeTypeBySourceType[storedDocument.document.sourceType] : undefined,
      sizeBytes: getSizeBytes(data),
    }) as GetDocumentResultForView<V>;
  }

  extract(
    documentId: string,
    schemaName: KnowledgeExtractionSchemaName
  ): StructuredExtraction {
    const storedDocument = this.getStoredDocument(documentId);

    if (storedDocument.chunks.length === 0) {
      return StructuredExtractionSchema.parse({
        documentId,
        schemaName,
        records: [],
        evidence: [],
        extractionStatus: "failed",
        warnings: [`Document ${documentId} has no chunks available for extraction.`],
      });
    }

    return StructuredExtractionSchema.parse(
      extractFromChunks(storedDocument.chunks, schemaName)
    );
  }

  listDocuments(): SourceDocument[] {
    return Object.values(this.documentStore).map(({ document }) => SourceDocumentSchema.parse(document));
  }

  get graph(): GraphStore | null {
    return this._graph;
  }

  async buildGraph(options: GraphBuildOptions): Promise<GraphStats> {
    const chunks = this.getAllChunks();
    if (chunks.length === 0) {
      throw new Error("No documents ingested. Call ingest() before buildGraph().");
    }
    const result: GraphBuildResult = await buildGraphFromChunks(chunks, options);
    this._graph = result.graph;
    return result.stats;
  }

  getEntity(name: string): GameEntity | undefined {
    if (!this._graph) return undefined;
    const matches = this._graph.findEntitiesByName(name);
    return matches[0];
  }

  getEntityRelations(entityId: string): GameRelation[] {
    if (!this._graph) return [];
    return [
      ...this._graph.getRelationsFrom(entityId),
      ...this._graph.getRelationsTo(entityId),
    ];
  }

  getSystemDependencies(systemName: string): GameEntity[] {
    if (!this._graph) return [];
    const entity = this.getEntity(systemName);
    if (!entity) return [];
    return this._graph.getDependencyChain(entity.entityId);
  }

  async getFeatureContext(description: string, llm?: import("./extract/llm-types").LLMProvider): Promise<FeatureDesignContext> {
    let evidenceChunks: KnowledgeChunk[] = [];

    if (llm) {
      const deepResult = await deepSearch(description, this.index, this._graph, {
        llm,
        topK: 10,
      });
      evidenceChunks = deepResult.chunks.map((r) => r.chunk);
    } else {
      const focusedResult = focusedSearch(
        { query: description, topK: 10, retrievalMode: "focused", includeRawText: false, includeStructured: false },
        this.index,
        this._graph
      );
      evidenceChunks = focusedResult.results.map((r) => r.chunk);
    }

    return buildFeatureDesignContext(description, this._graph, evidenceChunks);
  }

  private getStoredDocument(documentId: string) {
    const storedDocument = this.documentStore[documentId];

    if (!storedDocument) {
      throw new Error(`Document not found: ${documentId}`);
    }

    return storedDocument;
  }

  private getAllChunks(): KnowledgeChunk[] {
    return Object.values(this.documentStore).flatMap(({ chunks }) => chunks);
  }

  private getViewData<V extends KnowledgeDocumentView>(
    view: V,
    storedDocument: DocumentStore[string]
  ): DocumentViewDataMap[V] {
    switch (view) {
      case "raw":
        return storedDocument.rawText as DocumentViewDataMap[V];
      case "normalized":
        return storedDocument.normalizedText as DocumentViewDataMap[V];
      case "structure":
        return storedDocument.nodes as DocumentViewDataMap[V];
      case "chunks":
        return storedDocument.chunks as DocumentViewDataMap[V];
    }
  }
}

async function parseKnowledgeDocument(
  filePath: string,
  options: KnowledgeIngestOptions
): Promise<ParsedKnowledgeDocument> {
  const sourceType = getSourceType(filePath);

  if (sourceType === "pdf") {
    const parsed = await parsePdf(filePath, buildParseOptions(filePath, options));
    return {
      document: parsed.document,
      nodes: parsed.nodes,
      rawText: await readRawContent(filePath, sourceType),
    };
  }

  if (sourceType === "docx") {
    const parsed = await parseDocx(filePath, buildParseOptions(filePath, options));
    return {
      document: parsed.document,
      nodes: parsed.nodes,
      rawText: await readRawContent(filePath, sourceType),
    };
  }

  const context = await createParserContext(filePath, buildParseOptions(filePath, options));
  const document = createSourceDocument(context, sourceType, "success", []);
  const rawText = textDecoder.decode(context.bytes);
  const parsed = parseTextDocument(sourceType, document, rawText);

  return {
    document: parsed.document,
    nodes: parsed.nodes,
    rawText,
  };
}

function parseTextDocument(
  sourceType: Exclude<SourceDocument["sourceType"], "pdf" | "docx">,
  document: SourceDocument,
  rawText: string
) {
  switch (sourceType) {
    case "md":
      return parseMarkdown(document, rawText);
    case "txt":
      return parseText(document, rawText);
    case "csv":
      return parseCsv(document, rawText);
    case "json":
      return parseJson(document, rawText);
    case "yaml":
      return parseYaml(document, rawText);
  }
}

function buildParseOptions(filePath: string, options: KnowledgeIngestOptions): ParseSourceOptions {
  return {
    ...options,
    displayTitle: options.displayTitle ?? basename(filePath),
    uri: options.uri ?? filePath,
  };
}

function getSourceType(filePath: string): SourceDocument["sourceType"] {
  const extension = extname(filePath).toLowerCase();
  const sourceType = SOURCE_TYPE_BY_EXTENSION[extension];

  if (!sourceType) {
    throw new Error(`Unsupported file type: ${extension || filePath}`);
  }

  return sourceType;
}

async function readRawContent(
  filePath: string,
  sourceType: SourceDocument["sourceType"]
): Promise<string> {
  const bytes = new Uint8Array(await Bun.file(filePath).arrayBuffer());

  if (textSourceTypes.has(sourceType)) {
    return textDecoder.decode(bytes);
  }

  return Buffer.from(bytes).toString("base64");
}

function getSizeBytes(data: GetDocumentResult["data"]): number {
  const serializedData = typeof data === "string" ? data : JSON.stringify(data);
  return textEncoder.encode(serializedData).byteLength;
}
