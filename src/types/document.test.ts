import { describe, it, expect } from "bun:test";
import {
  SourceDocumentSchema,
  DocumentStructureNodeSchema,
} from "./document";

describe("SourceDocument", () => {
  it("validates a valid SourceDocument", () => {
    const doc = {
      documentId: "doc-123",
      uri: "file:///path/to/doc.pdf",
      sourceType: "pdf" as const,
      contentHash: "abc123def456",
      displayTitle: "Game Design Document",
      language: "en",
      ingestionVersion: "1.0",
      parseStatus: "success" as const,
      warnings: [],
    };
    expect(() => SourceDocumentSchema.parse(doc)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    const doc = {
      documentId: "doc-123",
      uri: "file:///path/to/doc.pdf",
      sourceType: "pdf" as const,
      contentHash: "abc123def456",
      displayTitle: "Game Design Document",
      // missing ingestionVersion
      parseStatus: "success" as const,
      warnings: [],
    };
    expect(() => SourceDocumentSchema.parse(doc)).toThrow();
  });

  it("rejects invalid sourceType", () => {
    const doc = {
      documentId: "doc-123",
      uri: "file:///path/to/doc.pdf",
      sourceType: "invalid" as unknown as "pdf" | "docx" | "md" | "txt" | "csv" | "json" | "yaml",
      contentHash: "abc123def456",
      displayTitle: "Game Design Document",
      ingestionVersion: "1.0",
      parseStatus: "success" as const,
      warnings: [],
    };
    expect(() => SourceDocumentSchema.parse(doc)).toThrow();
  });

  it("rejects invalid parseStatus", () => {
    const doc = {
      documentId: "doc-123",
      uri: "file:///path/to/doc.pdf",
      sourceType: "pdf" as const,
      contentHash: "abc123def456",
      displayTitle: "Game Design Document",
      ingestionVersion: "1.0",
      parseStatus: "invalid" as unknown as "success" | "partial" | "failed",
      warnings: [],
    };
    expect(() => SourceDocumentSchema.parse(doc)).toThrow();
  });

  it("allows optional language field", () => {
    const doc = {
      documentId: "doc-123",
      uri: "file:///path/to/doc.pdf",
      sourceType: "pdf" as const,
      contentHash: "abc123def456",
      displayTitle: "Game Design Document",
      ingestionVersion: "1.0",
      parseStatus: "success" as const,
      warnings: [],
    };
    expect(() => SourceDocumentSchema.parse(doc)).not.toThrow();
  });
});

describe("DocumentStructureNode", () => {
  it("validates a valid DocumentStructureNode", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "paragraph" as const,
      text: "This is a paragraph.",
      path: "page:1/block:0",
      tokenCount: 5,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "paragraph" as const,
      text: "This is a paragraph.",
      // missing path
      tokenCount: 5,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).toThrow();
  });

  it("rejects invalid nodeType", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "invalid" as unknown as "paragraph" | "heading" | "table" | "list" | "image" | "row" | "cell",
      text: "This is a paragraph.",
      path: "page:1/block:0",
      tokenCount: 5,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).toThrow();
  });

  it("allows optional pageNumber for PDF nodes", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "paragraph" as const,
      text: "This is a paragraph.",
      path: "page:1/block:0",
      pageNumber: 1,
      tokenCount: 5,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).not.toThrow();
  });

  it("allows optional sectionPath for DOCX nodes", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "paragraph" as const,
      text: "This is a paragraph.",
      path: "heading:Core Loops>para:3",
      sectionPath: ["Chapter 1", "Core Loops"],
      tokenCount: 5,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).not.toThrow();
  });

  it("allows optional rowNumber and columnName for CSV nodes", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "row" as const,
      text: "value1,value2,value3",
      path: "row:5",
      rowNumber: 5,
      columnName: "name",
      tokenCount: 3,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).not.toThrow();
  });

  it("rejects non-numeric tokenCount", () => {
    const node = {
      nodeId: "node-1",
      documentId: "doc-123",
      nodeType: "paragraph" as const,
      text: "This is a paragraph.",
      path: "page:1/block:0",
      tokenCount: "five" as unknown as number,
    };
    expect(() => DocumentStructureNodeSchema.parse(node)).toThrow();
  });
});
