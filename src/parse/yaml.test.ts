import { describe, expect, it } from "bun:test";
import { yamlDocumentFixture } from "../test-utils";
import { parseYaml, YAML_COMMENT_WARNING } from "./yaml";

describe("parseYaml", () => {
  it("walks the yaml fixture into yaml-path nodes and documents comment loss", async () => {
    const fixtureUrl = new URL("../../knowledge/fixtures/sample.yaml", import.meta.url);
    const content = await Bun.file(fixtureUrl).text();
    const result = parseYaml(yamlDocumentFixture, content);

    expect(result.document.parseStatus).toBe("success");
    expect(result.document.warnings).toContain(YAML_COMMENT_WARNING);
    expect(result.nodes.length).toBeGreaterThanOrEqual(10);
    expect(result.nodes.every((node) => node.path.length > 0)).toBe(true);
    expect(result.nodes.every((node) => !node.path.startsWith("$"))).toBe(true);

    const subtreeNode = result.nodes.find(
      (node) => node.path === "game_design.core_mechanics[0]"
    );
    expect(subtreeNode?.nodeType).toBe("rawBlock");
    expect(subtreeNode?.sectionPath).toEqual(["game_design", "core_mechanics", "[0]"]);

    const scalarNode = result.nodes.find(
      (node) => node.path === "game_design.economy.currencies.gold.sources[0]"
    );
    expect(scalarNode?.nodeType).toBe("keyValue");
    expect(scalarNode?.text).toContain("enemy_drops");
  });
});
