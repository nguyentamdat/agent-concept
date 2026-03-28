import type {
  DocumentStructureNode,
  GetDocumentRequest,
  GetDocumentResult,
  KnowledgeChunk,
  SourceDocument,
} from "../types";

export type DocumentView = GetDocumentRequest["view"];

export type DocumentViewDataMap = {
  raw: string;
  normalized: string;
  structure: DocumentStructureNode[];
  chunks: KnowledgeChunk[];
};

export type GetDocumentResultForView<V extends DocumentView> = Omit<
  GetDocumentResult,
  "data"
> & {
  data: DocumentViewDataMap[V];
};

export interface StoredDocument {
  document: SourceDocument;
  rawText: string;
  normalizedText: string;
  nodes: DocumentStructureNode[];
  chunks: KnowledgeChunk[];
  rawMimeType?: string;
}

export interface DocumentStore {
  [documentId: string]: StoredDocument;
}

const RAW_MIME_TYPE_BY_SOURCE_TYPE: Record<SourceDocument["sourceType"], string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  md: "text/markdown",
  txt: "text/plain",
  csv: "text/csv",
  json: "application/json",
  yaml: "application/yaml",
};

const textEncoder = new TextEncoder();

function getStoredDocument(documentId: string, documentStore: DocumentStore): StoredDocument {
  const storedDocument = documentStore[documentId];

  if (!storedDocument) {
    throw new Error(`Document not found: ${documentId}`);
  }

  return storedDocument;
}

function getRawMimeType(storedDocument: StoredDocument): string {
  return (
    storedDocument.rawMimeType ??
    RAW_MIME_TYPE_BY_SOURCE_TYPE[storedDocument.document.sourceType]
  );
}

function getViewData<V extends DocumentView>(
  view: V,
  storedDocument: StoredDocument
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

function getSizeBytes(data: GetDocumentResult["data"]): number {
  const serializedData = typeof data === "string" ? data : JSON.stringify(data);
  return textEncoder.encode(serializedData).byteLength;
}

export function getDocument(
  documentId: string,
  view: "raw",
  documentStore: DocumentStore
): GetDocumentResultForView<"raw">;
export function getDocument(
  documentId: string,
  view: "normalized",
  documentStore: DocumentStore
): GetDocumentResultForView<"normalized">;
export function getDocument(
  documentId: string,
  view: "structure",
  documentStore: DocumentStore
): GetDocumentResultForView<"structure">;
export function getDocument(
  documentId: string,
  view: "chunks",
  documentStore: DocumentStore
): GetDocumentResultForView<"chunks">;
export function getDocument<V extends DocumentView>(
  documentId: string,
  view: V,
  documentStore: DocumentStore
): GetDocumentResultForView<V> {
  const storedDocument = getStoredDocument(documentId, documentStore);
  const data = getViewData(view, storedDocument);
  const result: GetDocumentResult = {
    document: storedDocument.document,
    data,
    rawMimeType: view === "raw" ? getRawMimeType(storedDocument) : undefined,
    sizeBytes: getSizeBytes(data),
  };

  return result as GetDocumentResultForView<V>;
}
