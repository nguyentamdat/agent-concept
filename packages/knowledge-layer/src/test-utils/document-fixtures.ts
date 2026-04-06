import { SourceDocument } from "../types";

/**
 * SourceDocument fixtures for all supported formats.
 * These are minimal stubs for testing purposes.
 */

export const pdfDocumentFixture: SourceDocument = {
  documentId: "doc-pdf-sample",
  uri: "fixtures/sample.pdf",
  sourceType: "pdf",
  contentHash: "pdf-content-hash-abc123",
  displayTitle: "Game Design Fundamentals (PDF)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const docxDocumentFixture: SourceDocument = {
  documentId: "doc-docx-sample",
  uri: "fixtures/sample.docx",
  sourceType: "docx",
  contentHash: "docx-content-hash-def456",
  displayTitle: "Game Design Fundamentals (DOCX)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const mdDocumentFixture: SourceDocument = {
  documentId: "doc-md-sample",
  uri: "fixtures/sample.md",
  sourceType: "md",
  contentHash: "md-content-hash-ghi789",
  displayTitle: "Game Design Fundamentals (Markdown)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const txtDocumentFixture: SourceDocument = {
  documentId: "doc-txt-sample",
  uri: "fixtures/sample.txt",
  sourceType: "txt",
  contentHash: "txt-content-hash-jkl012",
  displayTitle: "Game Design Fundamentals (Text)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const csvDocumentFixture: SourceDocument = {
  documentId: "doc-csv-sample",
  uri: "fixtures/sample.csv",
  sourceType: "csv",
  contentHash: "csv-content-hash-mno345",
  displayTitle: "Game Mechanics Reference (CSV)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const jsonDocumentFixture: SourceDocument = {
  documentId: "doc-json-sample",
  uri: "fixtures/sample.json",
  sourceType: "json",
  contentHash: "json-content-hash-pqr678",
  displayTitle: "Game Design Data (JSON)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

export const yamlDocumentFixture: SourceDocument = {
  documentId: "doc-yaml-sample",
  uri: "fixtures/sample.yaml",
  sourceType: "yaml",
  contentHash: "yaml-content-hash-stu901",
  displayTitle: "Game Design Configuration (YAML)",
  language: "en",
  ingestionVersion: "1.0",
  parseStatus: "success",
  warnings: [],
};

/**
 * Get a document fixture by source type.
 */
export function getDocumentFixtureByType(sourceType: string): SourceDocument {
  switch (sourceType) {
    case "pdf":
      return pdfDocumentFixture;
    case "docx":
      return docxDocumentFixture;
    case "md":
      return mdDocumentFixture;
    case "txt":
      return txtDocumentFixture;
    case "csv":
      return csvDocumentFixture;
    case "json":
      return jsonDocumentFixture;
    case "yaml":
      return yamlDocumentFixture;
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

/**
 * Get all document fixtures.
 */
export function getAllDocumentFixtures(): SourceDocument[] {
  return [
    pdfDocumentFixture,
    docxDocumentFixture,
    mdDocumentFixture,
    txtDocumentFixture,
    csvDocumentFixture,
    jsonDocumentFixture,
    yamlDocumentFixture,
  ];
}
