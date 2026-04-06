import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  GameSpecSchema,
  createDefaultGameSpec,
  readGameSpec,
  writeGameSpec,
  registerSpecTools,
  type GameSpec,
} from "./spec";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import yaml from "js-yaml";

const TEST_DIR = resolve(process.cwd(), "test-temp-spec");

class MockMcpServer {
  tools = new Map();
  
  registerTool(name: string, metadata: unknown, handler: unknown) {
    this.tools.set(name, { metadata, handler });
  }
}

describe("spec tools", () => {
  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("GameSpecSchema", () => {
    it("should validate a complete valid spec", () => {
      const validSpec = createDefaultGameSpec("Test Game");
      const result = GameSpecSchema.safeParse(validSpec);
      expect(result.success).toBe(true);
    });

    it("should reject invalid spec with missing required fields", () => {
      const invalidSpec = {
        meta: {
          title: "Test",
          version: 1,
        },
      };
      const result = GameSpecSchema.safeParse(invalidSpec);
      expect(result.success).toBe(false);
    });

    it("should reject negative version numbers", () => {
      const spec = createDefaultGameSpec("Test");
      spec.meta.version = -1;
      const result = GameSpecSchema.safeParse(spec);
      expect(result.success).toBe(false);
    });

    it("should reject invalid platform values", () => {
      const spec = createDefaultGameSpec("Test");
      spec.meta.platform = "invalid-platform" as unknown as GameSpec["meta"]["platform"];
      const result = GameSpecSchema.safeParse(spec);
      expect(result.success).toBe(false);
    });
  });

  describe("createDefaultGameSpec", () => {
    it("should create spec with provided title", () => {
      const spec = createDefaultGameSpec("My Game");
      expect(spec.meta.title).toBe("My Game");
    });

    it("should set version to 1", () => {
      const spec = createDefaultGameSpec("My Game");
      expect(spec.meta.version).toBe(1);
    });

    it("should set current timestamps", () => {
      const spec = createDefaultGameSpec("My Game");
      expect(spec.meta.createdAt).toBeDefined();
      expect(spec.meta.updatedAt).toBeDefined();
      expect(new Date(spec.meta.createdAt).getTime()).toBeGreaterThan(0);
    });

    it("should include initial history entry", () => {
      const spec = createDefaultGameSpec("My Game");
      expect(spec.history).toHaveLength(1);
      expect(spec.history[0].version).toBe(1);
    });
  });

  describe("readGameSpec", () => {
    it("should read and parse YAML spec file", async () => {
      const spec = createDefaultGameSpec("Test Game");
      const specPath = resolve(TEST_DIR, "spec.yaml");
      await writeGameSpec(specPath, spec);

      const read = await readGameSpec(specPath);
      expect(read.meta.title).toBe("Test Game");
      expect(read.meta.version).toBe(1);
    });

    it("should throw on invalid YAML", async () => {
      const specPath = resolve(TEST_DIR, "invalid.yaml");
      await writeFile(specPath, "invalid: yaml: content: [", "utf-8");

      await expect(readGameSpec(specPath)).rejects.toThrow();
    });
  });

  describe("writeGameSpec", () => {
    it("should write valid YAML", async () => {
      const spec = createDefaultGameSpec("Test Game");
      const specPath = resolve(TEST_DIR, "spec.yaml");
      await writeGameSpec(specPath, spec);

      const content = await readFile(specPath, "utf-8");
      expect(content).toContain("title: Test Game");
      expect(content).toContain("version: 1");
    });
  });

  describe("registerSpecTools", () => {
    let mockServer: MockMcpServer;

    beforeEach(() => {
      mockServer = new MockMcpServer();
      registerSpecTools(mockServer as unknown as McpServer);
    });

    it("should register all spec tools", () => {
      expect(mockServer.tools.has("spec_validate")).toBe(true);
      expect(mockServer.tools.has("spec_diff")).toBe(true);
      expect(mockServer.tools.has("spec_bump_version")).toBe(true);
    });

    describe("spec_validate", () => {
      it("should return valid: true for valid spec", async () => {
        const spec = createDefaultGameSpec("Valid Game");
        const specPath = resolve(TEST_DIR, "valid.yaml");
        await writeGameSpec(specPath, spec);

        const tool = mockServer.tools.get("spec_validate");
        const result = await tool.handler({ specPath });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.valid).toBe(true);
        expect(parsed.errors).toEqual([]);
      });

      it("should return validation errors for invalid spec", async () => {
        const specPath = resolve(TEST_DIR, "invalid.yaml");
        const invalidYaml = yaml.dump({ meta: { title: "Test", version: -1 } });
        await writeFile(specPath, invalidYaml, "utf-8");

        const tool = mockServer.tools.get("spec_validate");
        const result = await tool.handler({ specPath });

        expect(result.isError).toBe(true);
        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.valid).toBe(false);
        expect(parsed.errors.length).toBeGreaterThan(0);
      });

      it("should detect missing mechanic references", async () => {
        const spec = createDefaultGameSpec("Test Game");
        spec.prototypeScope.includedMechanics = ["non-existent-mechanic"];
        const specPath = resolve(TEST_DIR, "missing-mechanic.yaml");
        await writeGameSpec(specPath, spec);

        const tool = mockServer.tools.get("spec_validate");
        const result = await tool.handler({ specPath });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.warnings.length).toBeGreaterThan(0);
        expect(parsed.warnings[0].message).toContain("non-existent-mechanic");
      });
    });

    describe("spec_diff", () => {
      it("should detect changes between specs", async () => {
        const spec1 = createDefaultGameSpec("Game V1");
        spec1.meta.version = 1;
        const spec2 = createDefaultGameSpec("Game V2");
        spec2.meta.version = 2;

        const path1 = resolve(TEST_DIR, "spec1.yaml");
        const path2 = resolve(TEST_DIR, "spec2.yaml");
        await writeGameSpec(path1, spec1);
        await writeGameSpec(path2, spec2);

        const tool = mockServer.tools.get("spec_diff");
        const result = await tool.handler({ specPath1: path1, specPath2: path2 });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.changes.length).toBeGreaterThan(0);
      });

      it("should return empty changes for identical specs", async () => {
        const spec = createDefaultGameSpec("Same Game");
        const path1 = resolve(TEST_DIR, "same1.yaml");
        const path2 = resolve(TEST_DIR, "same2.yaml");
        await writeGameSpec(path1, spec);
        await writeGameSpec(path2, spec);

        const tool = mockServer.tools.get("spec_diff");
        const result = await tool.handler({ specPath1: path1, specPath2: path2 });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.changes).toEqual([]);
      });
    });

    describe("spec_bump_version", () => {
      it("should increment version and create history entry", async () => {
        const spec = createDefaultGameSpec("Test Game");
        spec.meta.version = 1;
        const specPath = resolve(TEST_DIR, "bump.yaml");
        await writeGameSpec(specPath, spec);

        const tool = mockServer.tools.get("spec_bump_version");
        const result = await tool.handler({
          specPath,
          changes: ["Added new mechanic", "Balanced economy"],
          source: "feedback",
        });

        const parsed = JSON.parse(result.content[0].text);
        expect(parsed.newVersion).toBe(2);
        expect(parsed.archivedTo).toContain("spec_v1.yaml");

        const updatedSpec = await readGameSpec(specPath);
        expect(updatedSpec.meta.version).toBe(2);
        expect(updatedSpec.history).toHaveLength(2);
        expect(updatedSpec.history[1].changes).toEqual(["Added new mechanic", "Balanced economy"]);
      });

      it("should create spec-history directory", async () => {
        const spec = createDefaultGameSpec("Test Game");
        const specPath = resolve(TEST_DIR, "history-test.yaml");
        await writeGameSpec(specPath, spec);

        const tool = mockServer.tools.get("spec_bump_version");
        await tool.handler({
          specPath,
          changes: ["Test change"],
          source: "test",
        });

        const historyDir = resolve(TEST_DIR, "spec-history");
        const historyFiles = await readFile(historyDir + "/spec_v1.yaml", "utf-8");
        expect(historyFiles).toContain("Test Game");
      });
    });
  });
});
