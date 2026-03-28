import { describe, it, expect } from "bun:test";
import { StructuredExtractionSchema } from "./extraction";

describe("StructuredExtraction", () => {
  it("validates a valid StructuredExtraction", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [
        {
          name: "Combat Loop",
          type: "core",
          description: "Main combat mechanics",
        },
      ],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            exactness: "exact" as const,
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "success" as const,
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("rejects missing required fields", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [{ name: "Combat Loop" }],
      evidence: [],
      // missing extractionStatus
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).toThrow();
  });

  it("allows empty records", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [],
      evidence: [],
      extractionStatus: "failed" as const,
      warnings: ["No records found"],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("allows partial extraction status", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [{ name: "Combat Loop" }],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            exactness: "derived" as const,
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "partial" as const,
      warnings: ["Missing description field"],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("requires evidence citations with exactness", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [{ name: "Combat Loop" }],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            // missing exactness
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "success" as const,
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).toThrow();
  });

  it("allows multiple evidence refs per record", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [
        {
          name: "Combat Loop",
          type: "core",
          description: "Main combat mechanics",
        },
      ],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            exactness: "exact" as const,
          },
          fieldPath: "name",
        },
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 2",
            exactness: "exact" as const,
          },
          fieldPath: "description",
        },
      ],
      extractionStatus: "success" as const,
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("rejects invalid extractionStatus", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [],
      evidence: [],
      extractionStatus: "invalid" as unknown as "success" | "partial" | "failed",
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).toThrow();
  });

  it("allows arbitrary record fields", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "economy-system",
      records: [
        {
          currencyName: "Gold",
          sinks: ["shop", "upgrades"],
          sources: ["enemies", "quests"],
          exchangeRate: 1.5,
          isActive: true,
        },
      ],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "jsonPath" as const,
            jsonPath: "$.economy.currencies[0]",
            exactness: "exact" as const,
          },
          fieldPath: "currencyName",
        },
      ],
      extractionStatus: "success" as const,
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("allows empty warnings array", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [{ name: "Combat Loop" }],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            exactness: "exact" as const,
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "success" as const,
      warnings: [],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });

  it("allows multiple warnings", () => {
    const extraction = {
      documentId: "doc-123",
      schemaName: "game-mechanic",
      records: [{ name: "Combat Loop" }],
      evidence: [
        {
          recordIndex: 0,
          citation: {
            documentId: "doc-123",
            citationKind: "section" as const,
            sectionPath: "Chapter 1",
            exactness: "exact" as const,
          },
          fieldPath: "name",
        },
      ],
      extractionStatus: "partial" as const,
      warnings: ["Missing description", "Missing type field"],
    };
    expect(() => StructuredExtractionSchema.parse(extraction)).not.toThrow();
  });
});
