import yaml from "js-yaml";
import type { DocumentStructureNode, SourceDocument } from "../types";
import {
  cloneDocument,
  createNode,
  formatContextText,
  type ParsedDocumentResult,
} from "./shared";

const YAML_COMMENT_WARNING = "YAML comments are not preserved after parsing.";

export function parseYaml(
  document: SourceDocument,
  content: string
): ParsedDocumentResult {
  try {
    const parsed = yaml.load(content);
    const nodes: DocumentStructureNode[] = [];

    walkYamlTree({
      documentId: document.documentId,
      value: parsed,
      path: "root",
      sectionPath: [],
      label: "root",
      nodes,
    });

    return {
      document: cloneDocument(document, {
        parseStatus: "success",
        warnings: [...document.warnings, YAML_COMMENT_WARNING],
      }),
      nodes,
      metadata: {},
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown YAML parse error.";

    return {
      document: cloneDocument(document, {
        parseStatus: "failed",
        warnings: [...document.warnings, YAML_COMMENT_WARNING, `YAML parsing failed: ${message}`],
      }),
      nodes: [],
      metadata: {},
    };
  }
}

export { YAML_COMMENT_WARNING };

function walkYamlTree(input: {
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
      const childPath = `${input.path}[${index}]`;

      walkYamlTree({
        documentId: input.documentId,
        value: entry,
        path: childPath,
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
    const childPath = input.path === "root" ? key : `${input.path}.${key}`;

    walkYamlTree({
      documentId: input.documentId,
      value,
      path: childPath,
      sectionPath: [...input.sectionPath, key],
      label: key,
      nodes: input.nodes,
    });
  });
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}
