import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { jsonDocumentFixture } from "../test-utils";
import { parseJson } from "./json";

describe("parseJson", () => {
  it("walks the json fixture into jsonpath-addressable nodes", async () => {
    const fixtureUrl = new URL("../../fixtures/sample.json", import.meta.url);
    const content = await readFile(fileURLToPath(fixtureUrl), "utf-8");
    const result = parseJson(jsonDocumentFixture, content);

    expect(result.document.parseStatus).toBe("success");
    expect(result.nodes.length).toBeGreaterThanOrEqual(10);
    expect(result.nodes.every((node) => node.path.length > 0)).toBe(true);
    expect(result.nodes.every((node) => node.path.startsWith("$"))).toBe(true);

    const subtreeNode = result.nodes.find(
      (node) => node.path === "$.game_design.core_loops.primary_loop"
    );
    expect(subtreeNode?.nodeType).toBe("rawBlock");
    expect(subtreeNode?.sectionPath).toEqual([
      "game_design",
      "core_loops",
      "primary_loop",
    ]);

    const scalarNode = result.nodes.find(
      (node) => node.path === "$.game_design.progression.level_system.max_level"
    );
    expect(scalarNode?.nodeType).toBe("keyValue");
    expect(scalarNode?.text).toContain("parent: game_design > progression > level_system > max_level");
  });
});
