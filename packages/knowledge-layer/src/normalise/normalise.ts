import { encode } from "gpt-tokenizer";
import type { DocumentStructureNode, SourceDocument } from "../types";

const CONTROL_CHARACTER_PATTERN = /[\u0000-\u001F\u007F-\u009F]/gu;
const FORMAT_CHARACTER_PATTERN = /[\u200B-\u200D\u2060\uFEFF]/gu;
const SMART_PUNCTUATION_PATTERN = /[“”„‟«»‘’‚‛‹›–—―…]/gu;

const SMART_PUNCTUATION_MAP: Record<string, string> = {
  "“": '"',
  "”": '"',
  "„": '"',
  "‟": '"',
  "«": '"',
  "»": '"',
  "‘": "'",
  "’": "'",
  "‚": "'",
  "‛": "'",
  "‹": "'",
  "›": "'",
  "–": "-",
  "—": "-",
  "―": "-",
  "…": "...",
};

export interface NormalisedDocumentResult {
  document: SourceDocument;
  nodes: DocumentStructureNode[];
  normalizedText: string;
}

export function normaliseText(text: string): string {
  if (!text) {
    return "";
  }

  return collapseWhitespace(
    replaceSmartPunctuation(stripControlCharacters(text).normalize("NFKC"))
  );
}

export function getTokenCount(text: string): number {
  if (!text) {
    return 0;
  }

  return encode(text).length;
}

export function normaliseNode(node: DocumentStructureNode): DocumentStructureNode {
  const text = normaliseText(node.text);
  const sectionPath = normaliseSectionPath(node.sectionPath);
  const columnName = node.columnName ? normaliseText(node.columnName) : undefined;

  return {
    ...node,
    text,
    sectionPath,
    columnName,
    tokenCount: getTokenCount(text),
  };
}

export function normaliseDocument(
  document: SourceDocument,
  nodes: DocumentStructureNode[]
): NormalisedDocumentResult {
  const normalizedNodes = nodes.map(normaliseNode);
  const normalizedWarnings = [...new Set(document.warnings.map(normaliseText).filter(Boolean))];

  return {
    document: {
      ...document,
      displayTitle: normaliseText(document.displayTitle),
      warnings: normalizedWarnings,
    },
    nodes: normalizedNodes,
    normalizedText: normalizedNodes
      .map((node) => node.text)
      .filter(Boolean)
      .join("\n\n"),
  };
}

function normaliseSectionPath(sectionPath?: string[]): string[] | undefined {
  const normalizedSectionPath = sectionPath?.map(normaliseText).filter(Boolean) ?? [];

  return normalizedSectionPath.length > 0 ? normalizedSectionPath : undefined;
}

function stripControlCharacters(text: string): string {
  return text.replace(FORMAT_CHARACTER_PATTERN, "").replace(CONTROL_CHARACTER_PATTERN, " ");
}

function replaceSmartPunctuation(text: string): string {
  return text.replace(
    SMART_PUNCTUATION_PATTERN,
    (character) => SMART_PUNCTUATION_MAP[character] ?? character
  );
}

function collapseWhitespace(text: string): string {
  return text.replace(/\s+/gu, " ").trim();
}
