import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { registerProjectTools } from "./project";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import yaml from "js-yaml";

const TEST_DIR = resolve(process.cwd(), "test-temp-projects");

class MockMcpServer {
  tools = new Map();
  
  registerTool(name: string, metadata: unknown, handler: unknown) {
    this.tools.set(name, { metadata, handler });
  }
}

describe("project tools", () => {
  let mockServer: MockMcpServer;
  let runtime: { projectsDir: string };

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    mockServer = new MockMcpServer();
    runtime = { projectsDir: TEST_DIR };
    registerProjectTools(mockServer as unknown as McpServer, runtime);
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("registerProjectTools", () => {
    it("should register project_create and project_list", () => {
      expect(mockServer.tools.has("project_create")).toBe(true);
      expect(mockServer.tools.has("project_list")).toBe(true);
    });
  });

  describe("project_create", () => {
    it("should create project directory structure", async () => {
      const tool = mockServer.tools.get("project_create");
      const result = await tool.handler({ name: "test-game" });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.projectDir).toContain("test-game");
      expect(parsed.specPath).toContain("spec.yaml");

      const entries = await readdir(resolve(TEST_DIR, "test-game"));
      expect(entries).toContain("spec-history");
      expect(entries).toContain("prototype");
      expect(entries).toContain("documents");
    });

    it("should create default spec.yaml", async () => {
      const tool = mockServer.tools.get("project_create");
      await tool.handler({ name: "my-game" });

      const specPath = resolve(TEST_DIR, "my-game", "spec.yaml");
      const specContent = await readFile(specPath, "utf-8");
      const spec = yaml.load(specContent) as { meta: { title: string; version: number } };
      
      expect(spec.meta.title).toBe("my-game");
      expect(spec.meta.version).toBe(1);
    });

    it("should handle nested paths correctly", async () => {
      const tool = mockServer.tools.get("project_create");
      const result = await tool.handler({ name: "nested/game" });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.projectDir).toContain(join("nested", "game"));
    });
  });

  describe("project_list", () => {
    it("should return empty list when no projects", async () => {
      const tool = mockServer.tools.get("project_list");
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.projects).toEqual([]);
    });

    it("should list all projects with valid specs", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "game-one" });
      await createTool.handler({ name: "game-two" });

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.projects).toHaveLength(2);
      
      const names = parsed.projects.map((p: { name: string }) => p.name);
      expect(names).toContain("game-one");
      expect(names).toContain("game-two");
    });

    it("should include spec version and lastUpdated", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "versioned-game" });

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "versioned-game");
      
      expect(project.specVersion).toBe(1);
      expect(project.lastUpdated).toBeDefined();
      expect(project.status).toBe("ready");
    });

    it("should mark projects with missing/invalid specs", async () => {
      await mkdir(resolve(TEST_DIR, "invalid-project"), { recursive: true });
      await writeFile(
        resolve(TEST_DIR, "invalid-project", "spec.yaml"),
        "invalid: yaml: content",
        "utf-8"
      );

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "invalid-project");
      
      expect(project.status).toBe("missing-or-invalid-spec");
      expect(project.specVersion).toBeNull();
    });

    it("should sort projects alphabetically", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "zebra-game" });
      await createTool.handler({ name: "alpha-game" });
      await createTool.handler({ name: "beta-game" });

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const names = parsed.projects.map((p: { name: string }) => p.name);
      
      expect(names).toEqual(["alpha-game", "beta-game", "zebra-game"]);
    });

    it("should create projectsDir if it does not exist", async () => {
      const newDir = resolve(process.cwd(), "test-new-projects-dir");
      await rm(newDir, { recursive: true, force: true });
      
      const newRuntime = { projectsDir: newDir };
      const newMockServer = new MockMcpServer();
      registerProjectTools(newMockServer as unknown as McpServer, newRuntime);

      const listTool = newMockServer.tools.get("project_list");
      await listTool.handler({});

      const entries = await readdir(newDir);
      expect(entries).toBeDefined();

      await rm(newDir, { recursive: true, force: true });
    });
  });
});

async function readFile(path: string, encoding: BufferEncoding): Promise<string> {
  const { readFile: rf } = await import("node:fs/promises");
  return rf(path, encoding);
}
