import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { mdDocumentFixture } from "../test-utils";
import { parseMarkdown } from "./md";

describe("parseMarkdown", () => {
  it("parses the markdown fixture into section-aware nodes", async () => {
    const fixtureUrl = new URL("../../fixtures/sample.md", import.meta.url);
    const content = await readFile(fileURLToPath(fixtureUrl), "utf-8");
    const result = parseMarkdown(mdDocumentFixture, content);

    expect(result.document.parseStatus).toBe("success");
    expect(result.metadata!.frontmatter.title).toBe("Game Design Fundamentals");
    expect(result.nodes.length).toBeGreaterThanOrEqual(6);
    expect(result.nodes.every((node) => node.path.length > 0)).toBe(true);

    const sectionNode = result.nodes.find((node) => node.path === "heading:Game Design Fundamentals>Core Loops");
    expect(sectionNode?.nodeType).toBe("section");

    const paragraphNode = result.nodes.find((node) =>
      node.path.includes("heading:Game Design Fundamentals>Core Loops>Feedback Loops>para:")
    );
    expect(paragraphNode?.nodeType).toBe("paragraph");

    const tableNode = result.nodes.find((node) => node.nodeType === "table");
    expect(tableNode?.text).toContain("System Type");

    const rawBlockNode = result.nodes.find((node) => node.nodeType === "rawBlock");
    expect(rawBlockNode?.text).toContain("```yaml");
  });
});
