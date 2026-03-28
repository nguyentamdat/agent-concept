import yaml from "js-yaml";
import type { DocumentStructureNode, SourceDocument } from "../types";
import {
  buildHeadingPath,
  buildScopedPath,
  cloneDocument,
  createNode,
  type ParsedDocumentResult,
} from "./shared";

interface MarkdownMetadata {
  frontmatter: Record<string, unknown>;
}

interface MarkdownContextCounters {
  paragraph: number;
  table: number;
  list: number;
  rawBlock: number;
}

interface FrontmatterParseResult {
  metadata: Record<string, unknown>;
  bodyLines: string[];
  bodyLineOffset: number;
  warnings: string[];
}

export function parseMarkdown(
  document: SourceDocument,
  content: string
): ParsedDocumentResult<MarkdownMetadata> {
  const frontmatter = extractFrontmatter(content);
  const warnings = [...document.warnings, ...frontmatter.warnings];
  const nodes: DocumentStructureNode[] = [];
  const counters = new Map<string, MarkdownContextCounters>();
  const sectionPath: string[] = [];
  let index = 0;

  while (index < frontmatter.bodyLines.length) {
    const line = frontmatter.bodyLines[index] ?? "";
    const trimmed = line.trim();

    if (!trimmed) {
      index += 1;
      continue;
    }

    const absoluteLine = frontmatter.bodyLineOffset + index + 1;
    const headingMatch = trimmed.match(/^(#{1,6})\s+(.+)$/u);

    if (headingMatch) {
      const depth = headingMatch[1].length;
      const headingText = headingMatch[2].trim();

      sectionPath.splice(depth - 1);
      sectionPath[depth - 1] = headingText;

      nodes.push(
        createNode({
          documentId: document.documentId,
          nodeType: "section",
          text: headingText,
          path: buildHeadingPath(sectionPath),
          sectionPath: [...sectionPath],
        })
      );

      index += 1;
      continue;
    }

    if (/^```/u.test(trimmed)) {
      const start = index;
      index += 1;

      while (index < frontmatter.bodyLines.length) {
        const candidate = frontmatter.bodyLines[index]?.trim() ?? "";
        if (/^```/u.test(candidate)) {
          index += 1;
          break;
        }
        index += 1;
      }

      const blockLines = frontmatter.bodyLines.slice(start, index);
      const blockPath = buildScopedPath(
        sectionPath,
        `raw:${nextCounter(counters, sectionPath, "rawBlock")}`,
        `line:${absoluteLine}-${frontmatter.bodyLineOffset + index}`
      );

      nodes.push(
        createNode({
          documentId: document.documentId,
          nodeType: "rawBlock",
          text: blockLines.join("\n").trim(),
          path: blockPath,
          sectionPath: sectionPath.length ? [...sectionPath] : undefined,
        })
      );

      continue;
    }

    if (isTableStart(frontmatter.bodyLines, index)) {
      const start = index;
      index += 2;

      while (index < frontmatter.bodyLines.length && isTableRow(frontmatter.bodyLines[index])) {
        index += 1;
      }

      const tableLines = frontmatter.bodyLines.slice(start, index);
      const tablePath = buildScopedPath(
        sectionPath,
        `table:${nextCounter(counters, sectionPath, "table")}`,
        `line:${absoluteLine}-${frontmatter.bodyLineOffset + index}`
      );

      nodes.push(
        createNode({
          documentId: document.documentId,
          nodeType: "table",
          text: tableLines.join("\n").trim(),
          path: tablePath,
          sectionPath: sectionPath.length ? [...sectionPath] : undefined,
        })
      );

      continue;
    }

    if (isListItem(trimmed)) {
      const start = index;
      index += 1;

      while (index < frontmatter.bodyLines.length) {
        const candidate = frontmatter.bodyLines[index]?.trim() ?? "";
        if (!candidate || !isListItem(candidate)) {
          break;
        }
        index += 1;
      }

      const listLines = frontmatter.bodyLines
        .slice(start, index)
        .map((item) => item.trim())
        .join("\n");
      const listPath = buildScopedPath(
        sectionPath,
        `list:${nextCounter(counters, sectionPath, "list")}`,
        `line:${absoluteLine}-${frontmatter.bodyLineOffset + index}`
      );

      nodes.push(
        createNode({
          documentId: document.documentId,
          nodeType: "list",
          text: listLines,
          path: listPath,
          sectionPath: sectionPath.length ? [...sectionPath] : undefined,
        })
      );

      continue;
    }

    const start = index;
    index += 1;

    while (index < frontmatter.bodyLines.length) {
      const candidate = frontmatter.bodyLines[index] ?? "";
      const trimmedCandidate = candidate.trim();

      if (
        !trimmedCandidate ||
        trimmedCandidate.match(/^(#{1,6})\s+/u) ||
        /^```/u.test(trimmedCandidate) ||
        isListItem(trimmedCandidate) ||
        isTableStart(frontmatter.bodyLines, index)
      ) {
        break;
      }

      index += 1;
    }

    const paragraphText = frontmatter.bodyLines
      .slice(start, index)
      .map((item) => item.trim())
      .join(" ")
      .trim();

    if (!paragraphText) {
      continue;
    }

    const paragraphPath = buildScopedPath(
      sectionPath,
      `para:${nextCounter(counters, sectionPath, "paragraph")}`,
      `line:${absoluteLine}-${frontmatter.bodyLineOffset + index}`
    );

    nodes.push(
      createNode({
        documentId: document.documentId,
        nodeType: "paragraph",
        text: paragraphText,
        path: paragraphPath,
        sectionPath: sectionPath.length ? [...sectionPath] : undefined,
      })
    );
  }

  return {
    document: cloneDocument(document, {
      parseStatus: warnings.length ? "partial" : "success",
      warnings,
    }),
    nodes,
    metadata: { frontmatter: frontmatter.metadata },
  };
}

function extractFrontmatter(content: string): FrontmatterParseResult {
  const lines = content.split(/\r?\n/u);

  if (lines[0]?.trim() !== "---") {
    return {
      metadata: {},
      bodyLines: lines,
      bodyLineOffset: 0,
      warnings: [],
    };
  }

  const closingIndex = lines.findIndex((line, index) => index > 0 && line.trim() === "---");

  if (closingIndex === -1) {
    return {
      metadata: {},
      bodyLines: lines,
      bodyLineOffset: 0,
      warnings: ["Markdown frontmatter opening fence is missing a closing fence."],
    };
  }

  try {
    const rawFrontmatter = lines.slice(1, closingIndex).join("\n");
    const parsed = yaml.load(rawFrontmatter);
    const metadata = isPlainObject(parsed) ? parsed : {};

    return {
      metadata,
      bodyLines: lines.slice(closingIndex + 1),
      bodyLineOffset: closingIndex + 1,
      warnings: [],
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown frontmatter parse error.";

    return {
      metadata: {},
      bodyLines: lines.slice(closingIndex + 1),
      bodyLineOffset: closingIndex + 1,
      warnings: [`Markdown frontmatter could not be parsed: ${message}`],
    };
  }
}

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function getCounterBucket(
  counters: Map<string, MarkdownContextCounters>,
  sectionPath: string[]
): MarkdownContextCounters {
  const key = sectionPath.join(">") || "root";
  const current = counters.get(key);

  if (current) {
    return current;
  }

  const created: MarkdownContextCounters = {
    paragraph: 0,
    table: 0,
    list: 0,
    rawBlock: 0,
  };

  counters.set(key, created);

  return created;
}

function nextCounter(
  counters: Map<string, MarkdownContextCounters>,
  sectionPath: string[],
  key: keyof MarkdownContextCounters
): number {
  const bucket = getCounterBucket(counters, sectionPath);
  bucket[key] += 1;
  return bucket[key];
}

function isTableStart(lines: string[], index: number): boolean {
  return isTableRow(lines[index]) && isTableDivider(lines[index + 1]);
}

function isTableRow(line: string | undefined): boolean {
  if (!line) {
    return false;
  }

  return /^\s*\|.+\|\s*$/u.test(line);
}

function isTableDivider(line: string | undefined): boolean {
  if (!line) {
    return false;
  }

  return /^\s*\|?\s*[:\-]+(?:\s*\|\s*[:\-]+)+\s*\|?\s*$/u.test(line);
}

function isListItem(line: string): boolean {
  return /^[-*+]\s+/u.test(line);
}
