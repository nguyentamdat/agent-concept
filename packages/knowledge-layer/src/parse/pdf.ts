import * as unpdf from "unpdf";
import type { DocumentStructureNode, SourceDocument } from "../types";
import {
  createNode,
  createParserContext,
  createSourceDocument,
  normaliseText,
  type ParsedDocument,
  type ParseSourceOptions,
} from "./shared";

type UnpdfModule = {
  extractText?: (...args: unknown[]) => Promise<unknown>;
};

type PdfExtractionResult = {
  pages?: unknown;
  text?: unknown;
};

export async function parsePdf(
  source: string,
  options: ParseSourceOptions = {},
): Promise<ParsedDocument> {
  const context = await createParserContext(source, options);
  const warnings: string[] = [];
  const nodes: DocumentStructureNode[] = [];
  let parseStatus: SourceDocument["parseStatus"] = "success";

  try {
    const pages = await extractPdfPages(context.bytes);

    pages.forEach((pageText, pageIndex) => {
      const pageNumber = pageIndex + 1;
      const blocks = splitPdfBlocks(pageText);

      if (blocks.length === 0) {
        warnings.push(
          `PDF page ${pageNumber} has no extractable text layer; OCR is out of scope.`,
        );
        parseStatus = "partial";
        nodes.push(
          createNode(context, "rawBlock", "", `page:${pageNumber}/block:1`, {
            pageNumber,
          }),
        );
        return;
      }

      blocks.forEach((block, blockIndex) => {
        nodes.push(
          createNode(
            context,
            "paragraph",
            block,
            `page:${pageNumber}/block:${blockIndex + 1}`,
            { pageNumber },
          ),
        );
      });
    });
  } catch (error) {
    parseStatus = "failed";
    warnings.push(
      error instanceof Error ? `PDF parsing failed: ${error.message}` : "PDF parsing failed.",
    );
  }

  return {
    document: createSourceDocument(context, "pdf", parseStatus, warnings),
    nodes,
  };
}

async function extractPdfPages(bytes: Uint8Array): Promise<string[]> {
  const extractText = (unpdf as UnpdfModule).extractText;

  if (typeof extractText !== "function") {
    throw new Error("unpdf.extractText is unavailable.");
  }

  const attempts: Array<() => Promise<unknown>> = [
    () => extractText(bytes, { mergePages: false }),
    () => extractText({ data: bytes, mergePages: false }),
    () => extractText(bytes.buffer, { mergePages: false }),
    () => extractText({ data: bytes.buffer, mergePages: false }),
  ];

  let lastError: unknown;

  for (const attempt of attempts) {
    try {
      const result = await attempt();
      const pages = normalisePdfPages(result);

      if (pages.length > 0) {
        return pages;
      }
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError instanceof Error
    ? lastError
    : new Error("Unable to extract text from PDF.");
}

function normalisePdfPages(result: unknown): string[] {
  if (Array.isArray(result)) {
    return result.filter((value): value is string => typeof value === "string");
  }

  if (!result || typeof result !== "object") {
    return [];
  }

  const extraction = result as PdfExtractionResult;

  if (Array.isArray(extraction.text)) {
    return extraction.text.filter((value): value is string => typeof value === "string");
  }

  if (Array.isArray(extraction.pages)) {
    return extraction.pages.filter((value): value is string => typeof value === "string");
  }

  if (typeof extraction.text === "string") {
    return [extraction.text];
  }

  return [];
}

function splitPdfBlocks(pageText: string): string[] {
  const paragraphBlocks = pageText
    .split(/\n\s*\n+/)
    .map((block) => normaliseText(block))
    .filter(Boolean);

  if (paragraphBlocks.length > 0) {
    return paragraphBlocks;
  }

  const singleBlock = normaliseText(pageText);
  return singleBlock ? [singleBlock] : [];
}
