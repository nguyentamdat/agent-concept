import type { CitationRef, DocumentStructureNode, SourceDocument } from "../types";
import { normaliseText } from "./normalise";

const PAGE_PATTERN = /(?:^|>)page:(\d+)(?:$|[/>])/u;
const ROW_PATTERN = /(?:^|>)row:(\d+)(?:$|[/>])/u;
const LINE_RANGE_PATTERN = /line:(\d+)-(\d+)/u;
const STRUCTURAL_SEGMENT_PATTERN = /^(para|table|row|cell|list|raw|rawBlock):\d+$/u;

export function buildCitationRef(
  node: DocumentStructureNode,
  document: SourceDocument
): CitationRef {
  switch (document.sourceType) {
    case "pdf":
      return buildPdfCitation(node, document);
    case "docx":
      return buildDocxCitation(node, document);
    case "csv":
      return buildCsvCitation(node, document);
    case "json":
      return buildJsonCitation(node, document);
    case "yaml":
      return buildYamlCitation(node, document);
    case "md":
      return buildMarkdownCitation(node, document);
    case "txt":
      return buildTextCitation(node, document);
  }
}

export function buildCitationRefs(
  nodes: DocumentStructureNode[],
  document: SourceDocument
): CitationRef[] {
  return nodes.map((node) => buildCitationRef(node, document));
}

function buildPdfCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  const pageNumber = node.pageNumber ?? extractSingleNumber(node.path, PAGE_PATTERN);

  if (pageNumber !== undefined) {
    return {
      documentId: document.documentId,
      citationKind: "page",
      pageStart: pageNumber,
      pageEnd: pageNumber,
      locatorText: `page ${pageNumber}`,
      exactness: "exact",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "page",
    locatorText: toLocatorText(node.path),
    exactness: "unavailable",
  };
}

function buildDocxCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  const sectionPath = joinSectionPath(node.sectionPath);

  if (sectionPath) {
    return {
      documentId: document.documentId,
      citationKind: "section",
      sectionPath,
      locatorText: sectionPath,
      exactness: "exact",
    };
  }

  const derivedSectionPath = extractHeadingSectionPath(node.path);

  if (derivedSectionPath) {
    return {
      documentId: document.documentId,
      citationKind: "section",
      sectionPath: derivedSectionPath,
      locatorText: derivedSectionPath,
      exactness: "derived",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "section",
    locatorText: toLocatorText(node.path),
    exactness: "unavailable",
  };
}

function buildCsvCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  const rowNumber = node.rowNumber ?? extractSingleNumber(node.path, ROW_PATTERN);

  if (rowNumber !== undefined) {
    return {
      documentId: document.documentId,
      citationKind: "row",
      rowStart: rowNumber,
      rowEnd: rowNumber,
      locatorText: `row ${rowNumber}`,
      exactness: "exact",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "row",
    locatorText: toLocatorText(node.path),
    exactness: "unavailable",
  };
}

function buildJsonCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  if (node.path) {
    return {
      documentId: document.documentId,
      citationKind: "jsonPath",
      jsonPath: node.path,
      locatorText: node.path,
      exactness: "exact",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "jsonPath",
    exactness: "unavailable",
  };
}

function buildYamlCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  if (node.path) {
    return {
      documentId: document.documentId,
      citationKind: "yamlPath",
      yamlPath: node.path,
      locatorText: node.path,
      exactness: "exact",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "yamlPath",
    exactness: "unavailable",
  };
}

function buildMarkdownCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  const sectionPath = joinSectionPath(node.sectionPath) ?? extractHeadingSectionPath(node.path);

  if (sectionPath) {
    return {
      documentId: document.documentId,
      citationKind: "section",
      sectionPath,
      locatorText: sectionPath,
      exactness: "derived",
    };
  }

  const lineRange = extractLineRange(node.path);

  if (lineRange) {
    return {
      documentId: document.documentId,
      citationKind: "lineRange",
      locatorText: formatLineRange(lineRange),
      exactness: "derived",
    };
  }

  return {
    documentId: document.documentId,
    citationKind: "section",
    locatorText: toLocatorText(node.path),
    exactness: "unavailable",
  };
}

function buildTextCitation(node: DocumentStructureNode, document: SourceDocument): CitationRef {
  const lineRange = extractLineRange(node.path);

  return {
    documentId: document.documentId,
    citationKind: "lineRange",
    locatorText: lineRange ? formatLineRange(lineRange) : toLocatorText(node.path),
    exactness: "approximate",
  };
}

function joinSectionPath(sectionPath?: string[]): string | undefined {
  const normalizedSectionPath = sectionPath?.map(normaliseText).filter(Boolean) ?? [];

  return normalizedSectionPath.length > 0 ? normalizedSectionPath.join(" > ") : undefined;
}

function extractHeadingSectionPath(path: string): string | undefined {
  if (!path.startsWith("heading:")) {
    return undefined;
  }

  const segments = path
    .slice("heading:".length)
    .split(">")
    .map(normaliseText)
    .filter(Boolean);
  const sectionSegments: string[] = [];

  for (const segment of segments) {
    if (STRUCTURAL_SEGMENT_PATTERN.test(segment)) {
      break;
    }

    sectionSegments.push(segment);
  }

  return sectionSegments.length > 0 ? sectionSegments.join(" > ") : undefined;
}

function extractLineRange(path: string): { start: number; end: number } | undefined {
  const match = path.match(LINE_RANGE_PATTERN);

  if (!match) {
    return undefined;
  }

  return {
    start: Number.parseInt(match[1] ?? "", 10),
    end: Number.parseInt(match[2] ?? "", 10),
  };
}

function formatLineRange(lineRange: { start: number; end: number }): string {
  return `lines ${lineRange.start}-${lineRange.end}`;
}

function extractSingleNumber(path: string, pattern: RegExp): number | undefined {
  const match = path.match(pattern);

  if (!match) {
    return undefined;
  }

  return Number.parseInt(match[1] ?? "", 10);
}

function toLocatorText(path: string): string | undefined {
  const locatorText = normaliseText(path);

  return locatorText || undefined;
}
