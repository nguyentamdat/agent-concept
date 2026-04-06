import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { mkdir, writeFile, rm, readdir } from "node:fs/promises";
import { join, resolve } from "node:path";
import { registerProjectTools } from "./project";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

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

      const entries = await readdir(resolve(TEST_DIR, "test-game"));
      expect(entries).toContain("prototype");
      expect(entries).toContain("documents");
    });

    it("should NOT create spec.yaml", async () => {
      const tool = mockServer.tools.get("project_create");
      await tool.handler({ name: "my-game" });

      const entries = await readdir(resolve(TEST_DIR, "my-game"));
      expect(entries).not.toContain("spec.yaml");
      expect(entries).not.toContain("spec-history");
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

    it("should list all projects", async () => {
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

    it("should detect concept stage from concept-pitch.md", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "concept-game" });

      await writeFile(
        resolve(TEST_DIR, "concept-game", "concept-pitch.md"),
        "# Concept Pitch",
        "utf-8"
      );

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "concept-game");
      
      expect(project.status).toBe("concept");
      expect(project.lastUpdated).toBeDefined();
    });

    it("should detect design stage from gcd.md", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "design-game" });

      await writeFile(
        resolve(TEST_DIR, "design-game", "concept-pitch.md"),
        "# Concept Pitch",
        "utf-8"
      );
      await writeFile(
        resolve(TEST_DIR, "design-game", "gcd.md"),
        "# GCD",
        "utf-8"
      );

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "design-game");
      
      expect(project.status).toBe("design");
    });

    it("should detect prototype stage from index.html", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "proto-game" });

      await writeFile(
        resolve(TEST_DIR, "proto-game", "concept-pitch.md"),
        "# Concept Pitch",
        "utf-8"
      );
      await writeFile(
        resolve(TEST_DIR, "proto-game", "gcd.md"),
        "# GCD",
        "utf-8"
      );
      await writeFile(
        resolve(TEST_DIR, "proto-game", "index.html"),
        "<html></html>",
        "utf-8"
      );

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "proto-game");
      
      expect(project.status).toBe("prototype");
    });

    it("should show initialized status for empty projects", async () => {
      const createTool = mockServer.tools.get("project_create");
      await createTool.handler({ name: "fresh-game" });

      const listTool = mockServer.tools.get("project_list");
      const result = await listTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      const project = parsed.projects.find((p: { name: string }) => p.name === "fresh-game");
      
      expect(project.status).toBe("initialized");
      expect(project.lastUpdated).toBeDefined();
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
