import { describe, expect, it } from "bun:test";
import { parsePdf } from "./pdf";

const pdfFixturePath = new URL("../../knowledge/fixtures/sample.pdf", import.meta.url).pathname;

describe("parsePdf", () => {
  it("parses the fixture by page with pageNumber metadata", async () => {
    const result = await parsePdf(pdfFixturePath);
    const pageNumbers = new Set(result.nodes.map((node) => node.pageNumber));
    const firstPageNodes = result.nodes.filter((node) => node.pageNumber === 1);

    expect(result.document.sourceType).toBe("pdf");
    expect(result.document.parseStatus).toBe("success");
    expect(Array.isArray(result.document.warnings)).toBe(true);
    expect(pageNumbers.size).toBe(19);
    expect(firstPageNodes.length).toBeGreaterThan(0);
    expect(firstPageNodes[0]?.text).toContain("Shared MIME-info Database");
    expect(firstPageNodes[0]?.path).toMatch(/^page:1\/block:\d+$/);
    expect(result.nodes.every((node) => (node.pageNumber ?? 0) >= 1)).toBe(true);
    expect(result.nodes.every((node) => /^page:\d+\/block:\d+$/.test(node.path))).toBe(true);
  });
});
