import { describe, expect, it } from "bun:test";
import { csvDocumentFixture } from "../test-utils";
import { parseCsv } from "./csv";

describe("parseCsv", () => {
  it("parses the csv fixture into row and cell nodes", async () => {
    const fixtureUrl = new URL("../../knowledge/fixtures/sample.csv", import.meta.url);
    const content = await Bun.file(fixtureUrl).text();
    const result = parseCsv(csvDocumentFixture, content);

    expect(result.document.parseStatus).toBe("success");
    expect(result.metadata!.headers).toEqual([
      "mechanic_name",
      "mechanic_type",
      "description",
      "difficulty_impact",
      "engagement_impact",
    ]);
    expect(result.nodes.every((node) => node.path.length > 0)).toBe(true);

    const rowNode = result.nodes.find((node) => node.nodeType === "row" && node.rowNumber === 2);
    expect(rowNode?.path).toBe("row:2");
    expect(rowNode?.text).toContain("mechanic_name: Core Loop");

    const cellNode = result.nodes.find(
      (node) => node.nodeType === "cell" && node.rowNumber === 2 && node.columnName === "mechanic_name"
    );
    expect(cellNode?.path).toBe("row:2/column:mechanic_name");
    expect(cellNode?.text).toBe("Core Loop");
  });

  it("normalizes missing and duplicate headers and preserves multiline cells", () => {
    const content = [
      "name,,name",
      'Alpha,"Line 1\nLine 2",Omega',
    ].join("\n");
    const result = parseCsv(csvDocumentFixture, content);

    expect(result.metadata!.headers).toEqual(["name", "col_1", "name_2"]);
    expect(result.document.warnings).toContain(
      "CSV header 2 is missing and was renamed to col_1."
    );
    expect(result.document.warnings).toContain(
      "CSV header name is duplicated and was renamed to name_2."
    );

    const multilineCell = result.nodes.find(
      (node) => node.nodeType === "cell" && node.columnName === "col_1"
    );
    expect(multilineCell?.text).toBe("Line 1\nLine 2");
  });
});
