import type { SourceDocument } from "../types";
import { cloneDocument, createNode, type ParsedDocumentResult } from "./shared";

export function parseText(
  document: SourceDocument,
  content: string
): ParsedDocumentResult {
  const lines = content.split(/\r?\n/u);
  const nodes = [];
  let index = 0;

  while (index < lines.length) {
    if (!lines[index]?.trim()) {
      index += 1;
      continue;
    }

    const start = index;
    index += 1;

    while (index < lines.length && lines[index]?.trim()) {
      index += 1;
    }

    const text = lines
      .slice(start, index)
      .map((line) => line.trim())
      .join(" ")
      .trim();

    if (!text) {
      continue;
    }

    nodes.push(
      createNode({
        documentId: document.documentId,
        nodeType: "paragraph",
        text,
        path: `line:${start + 1}-${index}`,
      })
    );
  }

  return {
    document: cloneDocument(document, {
      parseStatus: "success",
      warnings: [...document.warnings],
    }),
    nodes,
    metadata: {},
  };
}
