import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { basename } from "node:path";
import type { DocumentStructureNode, SourceDocument } from "../types";

export interface ParsedDocument<TMetadata = Record<string, unknown>> {
  document: SourceDocument;
  nodes: DocumentStructureNode[];
  metadata?: TMetadata;
}

export type ParsedDocumentResult<TMetadata = Record<string, unknown>> = ParsedDocument<TMetadata> & {
  metadata: TMetadata;
};

export interface ParseSourceOptions {
  documentId?: string;
  uri?: string;
  displayTitle?: string;
  language?: string;
  ingestionVersion?: string;
  contentHash?: string;
}

export interface ParserContext {
  bytes: Uint8Array;
  contentHash: string;
  displayTitle: string;
  documentId: string;
  ingestionVersion: string;
  language?: string;
  source: string;
  uri: string;
}

interface CreateNodeInput {
  documentId: string;
  nodeType: DocumentStructureNode["nodeType"];
  text: string;
  path: string;
  sectionPath?: string[];
  pageNumber?: number;
  rowNumber?: number;
  columnName?: string;
}

type CreateNodeExtras = Omit<
  CreateNodeInput,
  "documentId" | "nodeType" | "text" | "path"
>;

export function countTokens(text: string): number {
  const normalized = text.trim();

  if (!normalized) {
    return 0;
  }

  return normalized.split(/\s+/u).length;
}

export function createNode(input: CreateNodeInput): DocumentStructureNode;
export function createNode(
  context: Pick<ParserContext, "documentId">,
  nodeType: DocumentStructureNode["nodeType"],
  text: string,
  path: string,
  extras?: CreateNodeExtras,
): DocumentStructureNode;
export function createNode(
  inputOrContext: CreateNodeInput | Pick<ParserContext, "documentId">,
  nodeType?: DocumentStructureNode["nodeType"],
  text?: string,
  path?: string,
  extras: CreateNodeExtras = {},
): DocumentStructureNode {
  const input =
    typeof nodeType === "string" && typeof text === "string" && typeof path === "string"
      ? {
          documentId: inputOrContext.documentId,
          nodeType,
          text,
          path,
          ...extras,
        }
      : (inputOrContext as CreateNodeInput);

  return {
    nodeId: `${input.documentId}:${input.nodeType}:${input.path}`,
    documentId: input.documentId,
    nodeType: input.nodeType,
    text: input.text,
    path: input.path,
    sectionPath: input.sectionPath,
    pageNumber: input.pageNumber,
    rowNumber: input.rowNumber,
    columnName: input.columnName,
    tokenCount: countTokens(input.text),
  };
}

export function buildHeadingPath(sectionPath: string[]): string {
  return `heading:${sectionPath.join(">")}`;
}

export function buildScopedPath(
  sectionPath: string[],
  leaf: string,
  fallbackPath: string
): string {
  if (!sectionPath.length) {
    return fallbackPath;
  }

  return `${buildHeadingPath(sectionPath)}>${leaf}`;
}

export function cloneDocument(
  document: SourceDocument,
  updates: Partial<SourceDocument>
): SourceDocument {
  return {
    ...document,
    ...updates,
    warnings: updates.warnings ?? document.warnings,
  };
}

export async function createParserContext(
  source: string,
  options: ParseSourceOptions = {}
): Promise<ParserContext> {
  const bytes = new Uint8Array(await readFile(source));
  const uri = options.uri ?? source;
  const displayTitle = options.displayTitle ?? basename(source);
  const contentHash =
    options.contentHash ?? createHash("sha256").update(bytes).digest("hex");

  return {
    bytes,
    contentHash,
    displayTitle,
    documentId:
      options.documentId ?? createHash("sha256").update(uri).digest("hex"),
    ingestionVersion: options.ingestionVersion ?? "1.0",
    language: options.language,
    source,
    uri,
  };
}

export function createSourceDocument(
  context: ParserContext,
  sourceType: SourceDocument["sourceType"],
  parseStatus: SourceDocument["parseStatus"],
  warnings: string[]
): SourceDocument {
  return {
    documentId: context.documentId,
    uri: context.uri,
    sourceType,
    contentHash: context.contentHash,
    displayTitle: context.displayTitle,
    language: context.language,
    ingestionVersion: context.ingestionVersion,
    parseStatus,
    warnings,
  };
}

export function normaliseText(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}

export function stripHtml(html: string): string {
  return normaliseText(
    html
      .replace(/<[^>]+>/gu, " ")
      .replace(/&nbsp;/gu, " ")
      .replace(/&amp;/gu, "&")
      .replace(/&lt;/gu, "<")
      .replace(/&gt;/gu, ">")
      .replace(/&quot;/gu, '"')
      .replace(/&#39;/gu, "'")
  );
}

export function toArrayBuffer(bytes: Uint8Array): ArrayBuffer {
  return bytes.buffer.slice(
    bytes.byteOffset,
    bytes.byteOffset + bytes.byteLength
  ) as ArrayBuffer;
}

export function getSectionPrefix(sectionPath: string[]): string {
  return sectionPath.length ? buildHeadingPath(sectionPath) : "heading:root";
}

export function serializeValue(value: unknown): string {
  if (typeof value === "string") {
    return value;
  }

  if (
    typeof value === "number" ||
    typeof value === "boolean" ||
    value === null
  ) {
    return String(value);
  }

  return JSON.stringify(value, null, 2);
}

export function formatContextText(
  label: string,
  value: unknown,
  parentContext: string[]
): string {
  const parentLabel = parentContext.length ? parentContext.join(" > ") : "root";

  return `${label}: ${serializeValue(value)}\nparent: ${parentLabel}`;
}
