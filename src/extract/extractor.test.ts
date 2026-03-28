import { describe, expect, it } from "bun:test";
import { getAllChunkFixtures, pdfChunkFixture, yamlChunkFixture } from "../test-utils";
import type { KnowledgeChunk } from "../types";
import { extractFromChunks } from "./extractor";

describe("extractFromChunks", () => {
  it("extracts game mechanics records from the fixture corpus", () => {
    const extraction = extractFromChunks(getAllChunkFixtures(), "game-mechanics");

    expect(extraction.extractionStatus).toBe("success");
    expect(extraction.records.length).toBeGreaterThan(0);
    expect(extraction.records[0]).toMatchObject({
      name: "Core Loop",
      type: "core-loop",
      description:
        "A core loop is the primary interaction cycle that players repeat throughout the game.",
    });
    expect(extraction.evidence.length).toBeGreaterThan(0);
  });

  it("extracts a complete economy record when all required fields are present", () => {
    const chunk = createChunk({
      documentId: "doc-economy-complete",
      text: "Action economy. Currencies: Gold, Gems. Sources: quests, battles. Sinks: upgrades, shop.",
      normalizedText:
        "Action economy. Currencies: Gold, Gems. Sources: quests, battles. Sinks: upgrades, shop.",
      sectionPath: ["Economy"],
    });

    const extraction = extractFromChunks([chunk], "economy");

    expect(extraction.extractionStatus).toBe("success");
    expect(extraction.records).toEqual([
      {
        economyType: "Action Economy",
        currencies: ["Gold", "Gems"],
        sources: ["Quests", "Battles"],
        sinks: ["Upgrades", "Shop"],
      },
    ]);
  });

  it("returns partial status when required economy fields stay unmatched", () => {
    const chunk = createChunk({
      documentId: "doc-economy-partial",
      text: "Action economy rewards efficient turns and keeps combat pacing tight.",
      normalizedText: "Action economy rewards efficient turns and keeps combat pacing tight.",
      sectionPath: ["Economy"],
    });

    const extraction = extractFromChunks([chunk], "economy");

    expect(extraction.extractionStatus).toBe("partial");
    expect(extraction.records[0]).toMatchObject({ economyType: "Action Economy" });
    expect(extraction.warnings).toEqual(
      expect.arrayContaining([
        expect.stringContaining('"currencies"'),
        expect.stringContaining('"sources"'),
        expect.stringContaining('"sinks"'),
      ])
    );
  });

  it("tracks evidence recordIndex, fieldPath, and citation exactness", () => {
    const extraction = extractFromChunks(getAllChunkFixtures(), "game-mechanics");
    const nameEvidence = extraction.evidence.find(
      (entry) => entry.recordIndex === 0 && entry.fieldPath === "name"
    );

    expect(nameEvidence).toBeDefined();
    expect(nameEvidence?.citation).toEqual(pdfChunkFixture.primaryCitation);
    expect(nameEvidence?.citation.exactness).toBe("exact");
  });
});

function createChunk(overrides: Partial<KnowledgeChunk>): KnowledgeChunk {
  return {
    ...yamlChunkFixture,
    ...overrides,
    primaryCitation: {
      ...yamlChunkFixture.primaryCitation,
      documentId: overrides.documentId ?? yamlChunkFixture.primaryCitation.documentId,
    },
  };
}
