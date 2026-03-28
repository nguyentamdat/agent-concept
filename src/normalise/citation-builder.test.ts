import { describe, expect, it } from "bun:test";
import {
  csvDocumentFixture,
  docxDocumentFixture,
  jsonDocumentFixture,
  mdDocumentFixture,
  pdfDocumentFixture,
  txtDocumentFixture,
  yamlDocumentFixture,
} from "../test-utils";
import type { DocumentStructureNode, SourceDocument } from "../types";
import { buildCitationRef, buildCitationRefs } from "./citation-builder";

describe("buildCitationRef", () => {
  it("builds exact PDF page citations without inventing page numbers", () => {
    const exactCitation = buildCitationRef(
      createNode(pdfDocumentFixture, {
        path: "page:3/block:1",
        pageNumber: 3,
      }),
      pdfDocumentFixture
    );

    const unavailableCitation = buildCitationRef(
      createNode(pdfDocumentFixture, {
        path: "block:1",
      }),
      pdfDocumentFixture
    );

    expect(exactCitation).toMatchObject({
      citationKind: "page",
      pageStart: 3,
      pageEnd: 3,
      exactness: "exact",
    });
    expect(unavailableCitation).toMatchObject({
      citationKind: "page",
      exactness: "unavailable",
    });
    expect(unavailableCitation.pageStart).toBeUndefined();
  });

  it("builds DOCX section citations with exact and derived exactness", () => {
    const exactCitation = buildCitationRef(
      createNode(docxDocumentFixture, {
        path: "heading:Chapter 1>Combat>para:1",
        sectionPath: ["Chapter 1", "Combat"],
      }),
      docxDocumentFixture
    );

    const derivedCitation = buildCitationRef(
      createNode(docxDocumentFixture, {
        path: "heading:Chapter 1>Combat>para:2",
      }),
      docxDocumentFixture
    );

    expect(exactCitation).toMatchObject({
      citationKind: "section",
      sectionPath: "Chapter 1 > Combat",
      exactness: "exact",
    });
    expect(derivedCitation).toMatchObject({
      citationKind: "section",
      sectionPath: "Chapter 1 > Combat",
      exactness: "derived",
    });
  });

  it("builds exact CSV row citations", () => {
    const citation = buildCitationRef(
      createNode(csvDocumentFixture, {
        path: "row:7",
        rowNumber: 7,
        nodeType: "row",
      }),
      csvDocumentFixture
    );

    expect(citation).toMatchObject({
      citationKind: "row",
      rowStart: 7,
      rowEnd: 7,
      exactness: "exact",
    });
  });

  it("builds exact JSON path citations", () => {
    const citation = buildCitationRef(
      createNode(jsonDocumentFixture, {
        path: "$.game_design.core_loops.primary_loop",
        nodeType: "keyValue",
      }),
      jsonDocumentFixture
    );

    expect(citation).toMatchObject({
      citationKind: "jsonPath",
      jsonPath: "$.game_design.core_loops.primary_loop",
      exactness: "exact",
    });
  });

  it("builds exact YAML path citations", () => {
    const citation = buildCitationRef(
      createNode(yamlDocumentFixture, {
        path: "game_design.core_mechanics[0].description",
        nodeType: "keyValue",
      }),
      yamlDocumentFixture
    );

    expect(citation).toMatchObject({
      citationKind: "yamlPath",
      yamlPath: "game_design.core_mechanics[0].description",
      exactness: "exact",
    });
  });

  it("builds derived Markdown section citations with line-range fallback", () => {
    const sectionCitation = buildCitationRef(
      createNode(mdDocumentFixture, {
        path: "heading:Game Design Fundamentals>Core Loops>para:1",
        sectionPath: ["Game Design Fundamentals", "Core Loops"],
      }),
      mdDocumentFixture
    );

    const fallbackCitation = buildCitationRef(
      createNode(mdDocumentFixture, {
        path: "line:14-18",
      }),
      mdDocumentFixture
    );

    expect(sectionCitation).toMatchObject({
      citationKind: "section",
      sectionPath: "Game Design Fundamentals > Core Loops",
      exactness: "derived",
    });
    expect(fallbackCitation).toMatchObject({
      citationKind: "lineRange",
      locatorText: "lines 14-18",
      exactness: "derived",
    });
  });

  it("builds approximate TXT line-range citations and never marks them exact", () => {
    const citation = buildCitationRef(
      createNode(txtDocumentFixture, {
        path: "line:9-13",
      }),
      txtDocumentFixture
    );

    expect(citation).toMatchObject({
      citationKind: "lineRange",
      locatorText: "lines 9-13",
      exactness: "approximate",
    });
    expect(citation.exactness).not.toBe("exact");
  });

  it("maps multiple nodes with buildCitationRefs", () => {
    const citations = buildCitationRefs(
      [
        createNode(pdfDocumentFixture, { path: "page:1/block:1", pageNumber: 1 }),
        createNode(pdfDocumentFixture, { path: "page:2/block:1", pageNumber: 2 }),
      ],
      pdfDocumentFixture
    );

    expect(citations).toHaveLength(2);
    expect(citations[0]).toMatchObject({ pageStart: 1, exactness: "exact" });
    expect(citations[1]).toMatchObject({ pageStart: 2, exactness: "exact" });
  });

  it("always sets exactness for every supported format", () => {
    const citations = [
      buildCitationRef(
        createNode(pdfDocumentFixture, { path: "page:1/block:1", pageNumber: 1 }),
        pdfDocumentFixture
      ),
      buildCitationRef(
        createNode(docxDocumentFixture, {
          path: "heading:Chapter 1>Combat>para:1",
          sectionPath: ["Chapter 1", "Combat"],
        }),
        docxDocumentFixture
      ),
      buildCitationRef(
        createNode(mdDocumentFixture, {
          path: "heading:Game Design Fundamentals>Core Loops>para:1",
          sectionPath: ["Game Design Fundamentals", "Core Loops"],
        }),
        mdDocumentFixture
      ),
      buildCitationRef(createNode(txtDocumentFixture, { path: "line:1-2" }), txtDocumentFixture),
      buildCitationRef(
        createNode(csvDocumentFixture, { path: "row:2", rowNumber: 2, nodeType: "row" }),
        csvDocumentFixture
      ),
      buildCitationRef(
        createNode(jsonDocumentFixture, {
          path: "$.game_design.progression.level_system",
          nodeType: "keyValue",
        }),
        jsonDocumentFixture
      ),
      buildCitationRef(
        createNode(yamlDocumentFixture, {
          path: "game_design.difficulty.curve",
          nodeType: "keyValue",
        }),
        yamlDocumentFixture
      ),
    ];

    expect(citations.every((citation) => typeof citation.exactness === "string")).toBe(true);
  });
});

function createNode(
  document: SourceDocument,
  overrides: Partial<DocumentStructureNode> = {}
): DocumentStructureNode {
  return {
    nodeId: `${document.documentId}:${overrides.path ?? "node"}`,
    documentId: document.documentId,
    nodeType: overrides.nodeType ?? "paragraph",
    text: overrides.text ?? "Sample text",
    path: overrides.path ?? "line:1-1",
    sectionPath: overrides.sectionPath,
    pageNumber: overrides.pageNumber,
    rowNumber: overrides.rowNumber,
    columnName: overrides.columnName,
    tokenCount: overrides.tokenCount ?? 0,
  };
}
