import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { registerPrototypeTools } from "./prototype";
import { createDefaultGameSpec, writeGameSpec } from "./spec";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const TEST_DIR = resolve(process.cwd(), "test-temp-prototype");
const PROTOTYPE_DIR = resolve(TEST_DIR, "prototype");

class MockMcpServer {
  tools = new Map();
  
  registerTool(name: string, metadata: unknown, handler: unknown) {
    this.tools.set(name, { metadata, handler });
  }
}

class MockServerHolder {
  server: Bun.Server<unknown> | null = null;
  
  getPrototypeServer() {
    return this.server;
  }
  
  setPrototypeServer(s: Bun.Server<unknown> | null) {
    this.server = s;
  }
}

describe("prototype tools", () => {
  let mockServer: MockMcpServer;
  let serverHolder: MockServerHolder;

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await mkdir(PROTOTYPE_DIR, { recursive: true });
    mockServer = new MockMcpServer();
    serverHolder = new MockServerHolder();
    registerPrototypeTools(mockServer as unknown as McpServer, serverHolder);
  });

  afterEach(async () => {
    serverHolder.server?.stop(true);
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("registerPrototypeTools", () => {
    it("should register all prototype tools", () => {
      expect(mockServer.tools.has("prototype_serve")).toBe(true);
      expect(mockServer.tools.has("prototype_stop")).toBe(true);
      expect(mockServer.tools.has("prototype_validate")).toBe(true);
    });
  });

  describe("prototype_serve", () => {
    it("should start server and return URL", async () => {
      const htmlContent = "<html><body>Test</body></html>";
      await writeFile(resolve(PROTOTYPE_DIR, "index.html"), htmlContent, "utf-8");

      const tool = mockServer.tools.get("prototype_serve");
      const result = await tool.handler({ dir: PROTOTYPE_DIR, port: 9999 });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.url).toBe("http://localhost:9999");
      expect(parsed.port).toBe(9999);
    });

    it("should throw if directory does not exist", async () => {
      const tool = mockServer.tools.get("prototype_serve");
      
      await expect(
        tool.handler({ dir: resolve(TEST_DIR, "non-existent"), port: 9998 })
      ).rejects.toThrow();
    });

    it("should replace existing server", async () => {
      const html1 = "<html><body>First</body></html>";
      const html2 = "<html><body>Second</body></html>";
      
      await writeFile(resolve(PROTOTYPE_DIR, "index.html"), html1, "utf-8");
      
      const tool = mockServer.tools.get("prototype_serve");
      await tool.handler({ dir: PROTOTYPE_DIR, port: 9997 });
      
      const firstServer = serverHolder.server;
      
      await tool.handler({ dir: PROTOTYPE_DIR, port: 9996 });
      const secondServer = serverHolder.server;
      
      expect(firstServer).not.toBe(secondServer);
    });
  });

  describe("prototype_stop", () => {
    it("should stop running server", async () => {
      const html = "<html><body>Test</body></html>";
      await writeFile(resolve(PROTOTYPE_DIR, "index.html"), html, "utf-8");

      const serveTool = mockServer.tools.get("prototype_serve");
      await serveTool.handler({ dir: PROTOTYPE_DIR, port: 9995 });

      const stopTool = mockServer.tools.get("prototype_stop");
      const result = await stopTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stopped).toBe(true);
      expect(serverHolder.server).toBeNull();
    });

    it("should return stopped: false when no server running", async () => {
      const stopTool = mockServer.tools.get("prototype_stop");
      const result = await stopTool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.stopped).toBe(false);
    });
  });

  describe("prototype_validate", () => {
    it("should pass validation for complete prototype", async () => {
      const spec = createDefaultGameSpec("Test Game");
      spec.screens = [
        { id: "main-menu", name: "Main Menu", purpose: "Navigation", elements: ["start"], transitions: ["game"] },
        { id: "game-screen", name: "Game", purpose: "Core gameplay", elements: ["player"], transitions: ["pause"] },
      ];
      spec.mechanics = [
        { id: "move", name: "Movement", category: "action", description: "Move player", rules: [], controls: "WASD", feedbackSystems: [], interactsWith: [] },
      ];
      spec.prototypeScope.includedMechanics = ["move"];

      const specPath = resolve(TEST_DIR, "spec.yaml");
      await writeGameSpec(specPath, spec);

      const html = `
        <html>
          <body>
            <div id="main-menu">Main Menu</div>
            <div id="game-screen">Game Screen</div>
            <script>const move = true;</script>
          </body>
        </html>
      `;
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, specPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
      expect(parsed.issues).toEqual([]);
    });

    it("should detect missing screens", async () => {
      const spec = createDefaultGameSpec("Test Game");
      spec.screens = [
        { id: "missing-screen", name: "Missing", purpose: "Test", elements: [], transitions: [] },
      ];

      const specPath = resolve(TEST_DIR, "spec.yaml");
      await writeGameSpec(specPath, spec);

      const html = "<html><body>No screens here</body></html>";
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, specPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(false);
      expect(parsed.issues.length).toBeGreaterThan(0);
      expect(parsed.issues[0].type).toBe("screen-missing");
    });

    it("should detect missing mechanics", async () => {
      const spec = createDefaultGameSpec("Test Game");
      spec.mechanics = [
        { id: "jump", name: "Jump", category: "action", description: "Jump", rules: [], controls: "Space", feedbackSystems: [], interactsWith: [] },
      ];
      spec.prototypeScope.includedMechanics = ["jump"];

      const specPath = resolve(TEST_DIR, "spec.yaml");
      await writeGameSpec(specPath, spec);

      const html = "<html><body>No mechanics here</body></html>";
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, specPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(false);
      expect(parsed.issues.some((i: { type: string }) => i.type === "mechanic-missing")).toBe(true);
    });
  });
});
