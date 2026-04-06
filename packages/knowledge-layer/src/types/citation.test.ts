import { describe, it, expect } from "vitest";
import { CitationRefSchema } from "./citation";

describe("CitationRef", () => {
  it("validates a valid page citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "page" as const,
      pageStart: 5,
      pageEnd: 5,
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates a valid section citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "section" as const,
      sectionPath: "Chapter 1 > Core Loops",
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates a valid row citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "row" as const,
      rowStart: 10,
      rowEnd: 10,
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates a valid jsonPath citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "jsonPath" as const,
      jsonPath: "$.combat.loops[0]",
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates a valid yamlPath citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "yamlPath" as const,
      yamlPath: "combat.loops[0].reward",
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates a valid lineRange citation", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "lineRange" as const,
      locatorText: "lines 10-15",
      exactness: "approximate" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("validates unavailable exactness", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "unknown" as const,
      exactness: "unavailable" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("rejects missing documentId", () => {
    const citation = {
      citationKind: "page" as const,
      pageStart: 5,
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).toThrow();
  });

  it("rejects missing exactness", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "page" as const,
      pageStart: 5,
    };
    expect(() => CitationRefSchema.parse(citation)).toThrow();
  });

  it("rejects invalid citationKind", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "invalid" as unknown as "page" | "section" | "row" | "jsonPath" | "yamlPath" | "lineRange" | "unknown",
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).toThrow();
  });

  it("rejects invalid exactness", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "page" as const,
      pageStart: 5,
      exactness: "invalid" as unknown as "exact" | "derived" | "approximate" | "unavailable",
    };
    expect(() => CitationRefSchema.parse(citation)).toThrow();
  });

  it("allows optional locatorText", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "page" as const,
      pageStart: 5,
      locatorText: "Page 5, first paragraph",
      exactness: "exact" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });

  it("allows derived exactness", () => {
    const citation = {
      documentId: "doc-123",
      citationKind: "section" as const,
      sectionPath: "Chapter 1",
      exactness: "derived" as const,
    };
    expect(() => CitationRefSchema.parse(citation)).not.toThrow();
  });
});
