import { CitationRef } from "../types";

/**
 * Citation fixtures for testing all format types.
 * Each format has an exact citation and an unavailable citation.
 */

export const pdfCitationExact: CitationRef = {
  documentId: "doc-pdf-sample",
  citationKind: "page",
  pageStart: 1,
  pageEnd: 1,
  locatorText: "Core Loops section on page 1",
  exactness: "exact",
};

export const pdfCitationUnavailable: CitationRef = {
  documentId: "doc-pdf-sample",
  citationKind: "page",
  locatorText: "Unknown page reference",
  exactness: "unavailable",
};

export const docxCitationExact: CitationRef = {
  documentId: "doc-docx-sample",
  citationKind: "section",
  sectionPath: "Game Design Fundamentals > Core Loops",
  locatorText: "Core Loops section",
  exactness: "exact",
};

export const docxCitationUnavailable: CitationRef = {
  documentId: "doc-docx-sample",
  citationKind: "section",
  locatorText: "Unknown section",
  exactness: "unavailable",
};

export const mdCitationExact: CitationRef = {
  documentId: "doc-md-sample",
  citationKind: "section",
  sectionPath: "Core Loops > Feedback Loops",
  locatorText: "Feedback Loops subsection",
  exactness: "exact",
};

export const mdCitationDerived: CitationRef = {
  documentId: "doc-md-sample",
  citationKind: "lineRange",
  locatorText: "Lines 10-15",
  exactness: "derived",
};

export const txtCitationApproximate: CitationRef = {
  documentId: "doc-txt-sample",
  citationKind: "lineRange",
  locatorText: "Around line 5",
  exactness: "approximate",
};

export const txtCitationUnavailable: CitationRef = {
  documentId: "doc-txt-sample",
  citationKind: "lineRange",
  locatorText: "Unknown location",
  exactness: "unavailable",
};

export const csvCitationExact: CitationRef = {
  documentId: "doc-csv-sample",
  citationKind: "row",
  rowStart: 2,
  rowEnd: 2,
  locatorText: "Row 2: Core Loop mechanic",
  exactness: "exact",
};

export const csvCitationUnavailable: CitationRef = {
  documentId: "doc-csv-sample",
  citationKind: "row",
  locatorText: "Unknown row",
  exactness: "unavailable",
};

export const jsonCitationExact: CitationRef = {
  documentId: "doc-json-sample",
  citationKind: "jsonPath",
  jsonPath: "$.game_design.core_loops.primary_loop",
  locatorText: "Combat Loop definition",
  exactness: "exact",
};

export const jsonCitationUnavailable: CitationRef = {
  documentId: "doc-json-sample",
  citationKind: "jsonPath",
  jsonPath: "$.unknown.path",
  locatorText: "Unknown JSON path",
  exactness: "unavailable",
};

export const yamlCitationExact: CitationRef = {
  documentId: "doc-yaml-sample",
  citationKind: "yamlPath",
  yamlPath: "game_design.core_mechanics[0]",
  locatorText: "Combat System mechanic",
  exactness: "exact",
};

export const yamlCitationUnavailable: CitationRef = {
  documentId: "doc-yaml-sample",
  citationKind: "yamlPath",
  yamlPath: "game_design.unknown.path",
  locatorText: "Unknown YAML path",
  exactness: "unavailable",
};

/**
 * Get all citation fixtures for a given source type.
 */
export function getCitationFixturesByFormat(
  sourceType: string
): { exact: CitationRef; unavailable: CitationRef } {
  switch (sourceType) {
    case "pdf":
      return { exact: pdfCitationExact, unavailable: pdfCitationUnavailable };
    case "docx":
      return { exact: docxCitationExact, unavailable: docxCitationUnavailable };
    case "md":
      return { exact: mdCitationExact, unavailable: mdCitationDerived };
    case "txt":
      return { exact: txtCitationApproximate, unavailable: txtCitationUnavailable };
    case "csv":
      return { exact: csvCitationExact, unavailable: csvCitationUnavailable };
    case "json":
      return { exact: jsonCitationExact, unavailable: jsonCitationUnavailable };
    case "yaml":
      return { exact: yamlCitationExact, unavailable: yamlCitationUnavailable };
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}
