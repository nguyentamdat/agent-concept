import type { DocumentStructureNode, SourceDocument } from "../types";
import {
  cloneDocument,
  createNode,
  formatContextText,
  type ParsedDocumentResult,
} from "./shared";

export function parseJson(
  document: SourceDocument,
  content: string
): ParsedDocumentResult {
  try {
    const parsed = JSON.parse(content) as unknown;
    const nodes: DocumentStructureNode[] = [];

    walkJsonTree({
      documentId: document.documentId,
      value: parsed,
      path: "$",
      sectionPath: [],
      label: "$",
      nodes,
    });

    return {
      document: cloneDocument(document, {
        parseStatus: "success",
        warnings: [...document.warnings],
      }),
      nodes,
      metadata: {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON parse error.";

    return {
      document: cloneDocument(document, {
        parseStatus: "failed",
        warnings: [...document.warnings, `JSON parsing failed: ${message}`],
      }),
      nodes: [],
      metadata: {},
    };
  }
}

function walkJsonTree(input: {
  documentId: string;
  value: unknown;
  path: string;
  sectionPath: string[];
  label: string;
  nodes: DocumentStructureNode[];
}): void {
  input.nodes.push(
    createNode({
      documentId: input.documentId,
      nodeType: Array.isArray(input.value) || isPlainObject(input.value) ? "rawBlock" : "keyValue",
      text: formatContextText(input.label, input.value, input.sectionPath),
      path: input.path,
      sectionPath: [...input.sectionPath],
    })
  );

  if (Array.isArray(input.value)) {
    input.value.forEach((entry, index) => {
      walkJsonTree({
        documentId: input.documentId,
        value: entry,
        path: `${input.path}[${index}]`,
        sectionPath: [...input.sectionPath, `[${index}]`],
        label: `[${index}]`,
        nodes: input.nodes,
      });
    });

    return;
  }

  if (!isPlainObject(input.value)) {
    return;
  }

  Object.entries(input.value).forEach(([key, value]) => {
    walkJsonTree({
      documentId: input.documentId,
      value,
      path: input.path === "$" ? `$.${key}` : `${input.path}.${key}`,
      sectionPath: [...input.sectionPath, key],
      label: key,
      nodes: input.nodes,
    });
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
