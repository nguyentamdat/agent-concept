import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { txtDocumentFixture } from "../test-utils";
import { parseText } from "./txt";

describe("parseText", () => {
  it("parses the text fixture into flat line-ranged paragraphs", async () => {
    const fixtureUrl = new URL("../../fixtures/sample.txt", import.meta.url);
    const content = await readFile(fileURLToPath(fixtureUrl), "utf-8");
    const result = parseText(txtDocumentFixture, content);

    expect(result.document.parseStatus).toBe("success");
    expect(result.nodes.length).toBeGreaterThanOrEqual(5);
    expect(result.nodes.every((node) => /^line:\d+-\d+$/u.test(node.path))).toBe(true);
    expect(result.nodes.every((node) => node.nodeType === "paragraph")).toBe(true);
    expect(result.nodes.every((node) => !node.sectionPath?.length)).toBe(true);
  });
});
