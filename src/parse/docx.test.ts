import { describe, expect, it } from "bun:test";
import { parseDocx } from "./docx";

const docxFixturePath = new URL("../../knowledge/fixtures/sample.docx", import.meta.url).pathname;

describe("parseDocx", () => {
  it("parses the fixture with section hierarchy, paragraph attribution, and table structure", async () => {
    const result = await parseDocx(docxFixturePath);
    const sections = result.nodes.filter((node) => node.nodeType === "section");
    const paragraphs = result.nodes.filter((node) => node.nodeType === "paragraph");
    const tables = result.nodes.filter((node) => node.nodeType === "table");
    const rows = result.nodes.filter((node) => node.nodeType === "row");
    const cells = result.nodes.filter((node) => node.nodeType === "cell");
    const nestedSection = sections.find((node) => (node.sectionPath?.length ?? 0) >= 2);
    const attributedParagraph = paragraphs.find((node) => (node.sectionPath?.length ?? 0) > 0);

    expect(result.document.sourceType).toBe("docx");
    expect(result.document.parseStatus).toBe("success");
    expect(Array.isArray(result.document.warnings)).toBe(true);
    expect(sections.length).toBeGreaterThan(0);
    expect(paragraphs.length).toBeGreaterThan(0);
    expect(tables.length).toBeGreaterThan(0);
    expect(rows.length).toBeGreaterThan(0);
    expect(cells.length).toBeGreaterThan(0);
    expect(nestedSection?.path).toMatch(/^heading:.+>.+$/);
    expect(attributedParagraph?.sectionPath?.length).toBeGreaterThan(0);
    expect(attributedParagraph?.path).toMatch(/^heading:.+>para:\d+$/);
    expect(tables.every((node) => /^heading:.+>table:\d+$/.test(node.path))).toBe(true);
    expect(rows.every((node) => /^heading:.+>table:\d+>row:\d+$/.test(node.path))).toBe(true);
    expect(cells.every((node) => /^heading:.+>table:\d+>row:\d+>cell:\d+$/.test(node.path))).toBe(true);
  });
});
