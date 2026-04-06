import { describe, expect, it } from "vitest";
import { encode } from "gpt-tokenizer";
import { csvDocumentFixture } from "../test-utils";
import type { DocumentStructureNode } from "../types";
import { getTokenCount, normaliseDocument, normaliseText } from "./normalise";

describe("normaliseText", () => {
  it("strips control characters and normalises unicode, punctuation, and whitespace", () => {
    const text = "\u0000Cafe\u0301\u00A0ﬁle\u200B\n\t“smart” ‘quotes’…";

    expect(normaliseText(text)).toBe('Café file "smart" \'quotes\'...');
  });
});

describe("normaliseDocument", () => {
  it("normalises node text and recomputes token counts with gpt-tokenizer", () => {
    const nodes: DocumentStructureNode[] = [
      {
        nodeId: "node-1",
        documentId: csvDocumentFixture.documentId,
        nodeType: "row",
        text: "\u0007Core\u00A0ﬁle mechanic\n\twith   “quotes”",
        path: "row:2",
        rowNumber: 2,
        tokenCount: 999,
      },
      {
        nodeId: "node-2",
        documentId: csvDocumentFixture.documentId,
        nodeType: "cell",
        text: "  Reward\u200B sink  ",
        path: "row:2/column:description",
        rowNumber: 2,
        columnName: " description\u00A0name ",
        tokenCount: 999,
      },
    ];

    const result = normaliseDocument(
      {
        ...csvDocumentFixture,
        displayTitle: "  CSV\u00A0ﬁxture “title”  ",
        warnings: ["\u0000warning\tmessage", "warning\tmessage"],
      },
      nodes
    );

    expect(result.document.displayTitle).toBe('CSV fixture "title"');
    expect(result.document.warnings).toEqual(["warning message"]);
    expect(result.nodes[0]?.text).toBe('Core file mechanic with "quotes"');
    expect(result.nodes[0]?.tokenCount).toBe(encode('Core file mechanic with "quotes"').length);
    expect(result.nodes[1]?.text).toBe("Reward sink");
    expect(result.nodes[1]?.columnName).toBe("description name");
    expect(result.nodes[1]?.tokenCount).toBe(encode("Reward sink").length);
    expect(result.normalizedText).toBe('Core file mechanic with "quotes"\n\nReward sink');
  });
});

describe("getTokenCount", () => {
  it("returns zero for empty text", () => {
    expect(getTokenCount("")).toBe(0);
  });

  it("matches gpt-tokenizer output", () => {
    const text = "Core loop rewards mastery.";

    expect(getTokenCount(text)).toBe(encode(text).length);
  });
});
