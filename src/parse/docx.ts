import mammoth from "mammoth";
import type { DocumentStructureNode, SourceDocument } from "../types";
import {
  createNode,
  createParserContext,
  createSourceDocument,
  getSectionPrefix,
  normaliseText,
  stripHtml,
  type ParsedDocument,
  type ParseSourceOptions,
} from "./shared";

type MammothMessage = {
  message?: string;
  type?: string;
};

type MammothResult = {
  messages?: MammothMessage[];
  value?: string;
};

type HtmlToken = {
  html: string;
  tag: "h1" | "h2" | "h3" | "h4" | "h5" | "h6" | "p" | "table";
};

export async function parseDocx(
  source: string,
  options: ParseSourceOptions = {},
): Promise<ParsedDocument> {
  const context = await createParserContext(source, options);
  const warnings: string[] = [];
  const nodes: DocumentStructureNode[] = [];
  let parseStatus: SourceDocument["parseStatus"] = "success";

  try {
    const result = (await mammoth.convertToHtml({
      path: context.source,
    })) as MammothResult;
    const html = typeof result.value === "string" ? result.value : "";
    const mammothWarnings = collectMammothWarnings(result.messages ?? []);
    warnings.push(...mammothWarnings);

    if (!html.trim()) {
      parseStatus = warnings.length > 0 ? "partial" : "failed";
    }

    nodes.push(...buildDocxNodes(context, html));
  } catch (error) {
    parseStatus = "failed";
    warnings.push(
      error instanceof Error ? `DOCX parsing failed: ${error.message}` : "DOCX parsing failed.",
    );
  }

  return {
    document: createSourceDocument(context, "docx", parseStatus, dedupe(warnings)),
    nodes,
  };
}

function buildDocxNodes(context: Awaited<ReturnType<typeof createParserContext>>, html: string) {
  const nodes: DocumentStructureNode[] = [];
  const paragraphCounts = new Map<string, number>();
  const tableCounts = new Map<string, number>();
  const headingStack: string[] = [];

  for (const token of tokenizeDocxHtml(html)) {
    if (token.tag === "p") {
      const text = stripHtml(token.html);

      if (!text) {
        continue;
      }

      const sectionPath = [...headingStack];
      const prefix = getSectionPrefix(sectionPath);
      const nextParagraphIndex = incrementCounter(paragraphCounts, prefix);

      nodes.push(
        createNode(context, "paragraph", text, `${prefix}>para:${nextParagraphIndex}`, {
          sectionPath,
        }),
      );
      continue;
    }

    if (token.tag === "table") {
      const sectionPath = [...headingStack];
      const prefix = getSectionPrefix(sectionPath);
      const tableIndex = incrementCounter(tableCounts, prefix);
      nodes.push(...buildTableNodes(context, token.html, prefix, tableIndex, sectionPath));
      continue;
    }

    const text = stripHtml(token.html);

    if (!text) {
      continue;
    }

    const level = Number.parseInt(token.tag.slice(1), 10);
    const parents = headingStack.slice(0, Math.max(0, level - 1));
    const sectionPath = [...parents, normaliseText(text)];

    headingStack.length = parents.length;
    headingStack.push(normaliseText(text));
    nodes.push(
      createNode(context, "section", text, getSectionPrefix(sectionPath), {
        sectionPath,
      }),
    );
  }

  return nodes;
}

function buildTableNodes(
  context: Awaited<ReturnType<typeof createParserContext>>,
  tableHtml: string,
  prefix: string,
  tableIndex: number,
  sectionPath: string[],
): DocumentStructureNode[] {
  const nodes: DocumentStructureNode[] = [];
  const tablePath = `${prefix}>table:${tableIndex}`;
  const rowMatches = Array.from(tableHtml.matchAll(/<tr\b[^>]*>([\s\S]*?)<\/tr>/gi));
  const tableRows: string[] = [];

  nodes.push(
    createNode(context, "table", stripHtml(tableHtml), tablePath, {
      sectionPath,
    }),
  );

  rowMatches.forEach((rowMatch, rowIndex) => {
    const rowHtml = rowMatch[1] ?? "";
    const cellMatches = Array.from(rowHtml.matchAll(/<t[dh]\b[^>]*>([\s\S]*?)<\/t[dh]>/gi));
    const cellTexts = cellMatches.map((cellMatch) => stripHtml(cellMatch[1] ?? ""));
    const rowText = cellTexts.filter(Boolean).join(" | ");
    const rowPath = `${tablePath}>row:${rowIndex + 1}`;

    tableRows.push(rowText);
    nodes.push(
      createNode(context, "row", rowText, rowPath, {
        sectionPath,
      }),
    );

    cellTexts.forEach((cellText, cellIndex) => {
      nodes.push(
        createNode(context, "cell", cellText, `${rowPath}>cell:${cellIndex + 1}`, {
          sectionPath,
        }),
      );
    });
  });

  nodes[0] = createNode(context, "table", tableRows.join("\n"), tablePath, {
    sectionPath,
  });

  return nodes;
}

function tokenizeDocxHtml(html: string): HtmlToken[] {
  const tokens: HtmlToken[] = [];
  let cursor = 0;

  while (cursor < html.length) {
    const nextMatch = html.slice(cursor).match(/<(table|h[1-6]|p)\b[^>]*>/i);

    if (!nextMatch || nextMatch.index === undefined) {
      break;
    }

    const startIndex = cursor + nextMatch.index;
    const tag = nextMatch[1].toLowerCase() as HtmlToken["tag"];
    const endTag = `</${tag}>`;
    const endIndex = html.toLowerCase().indexOf(endTag, startIndex);

    if (endIndex === -1) {
      break;
    }

    const blockEnd = endIndex + endTag.length;
    tokens.push({
      html: html.slice(startIndex, blockEnd),
      tag,
    });
    cursor = blockEnd;
  }

  return tokens;
}

function collectMammothWarnings(messages: MammothMessage[]): string[] {
  return dedupe(
    messages
      .map((message) => normaliseText(message.message ?? ""))
      .filter(Boolean)
      .map((message) => `DOCX warning: ${message}`),
  );
}

function incrementCounter(counters: Map<string, number>, key: string): number {
  const nextValue = (counters.get(key) ?? 0) + 1;
  counters.set(key, nextValue);
  return nextValue;
}

function dedupe(values: string[]): string[] {
  return [...new Set(values)];
}
