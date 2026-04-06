import { describe, expect, it, beforeEach, afterEach } from "vitest";
import type { Server } from "node:http";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { registerPrototypeTools } from "./prototype";
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
  server: Server | null = null;
  
  getPrototypeServer() {
    return this.server;
  }
  
  setPrototypeServer(s: Server | null) {
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
    serverHolder.server?.close();
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
      const result = await tool.handler({ dir: PROTOTYPE_DIR, port: 0 });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.url).toMatch(/^http:\/\/localhost:\d+$/);
      expect(parsed.port).toBeGreaterThan(0);
    });

    it("should throw if directory does not exist", async () => {
      const tool = mockServer.tools.get("prototype_serve");
      
      await expect(
        tool.handler({ dir: resolve(TEST_DIR, "non-existent"), port: 0 })
      ).rejects.toThrow();
    });

    it("should replace existing server", async () => {
      const html1 = "<html><body>First</body></html>";
      const html2 = "<html><body>Second</body></html>";
      
      await writeFile(resolve(PROTOTYPE_DIR, "index.html"), html1, "utf-8");
      
      const tool = mockServer.tools.get("prototype_serve");
      await tool.handler({ dir: PROTOTYPE_DIR, port: 0 });
      
      const firstServer = serverHolder.server;
      
      await tool.handler({ dir: PROTOTYPE_DIR, port: 0 });
      const secondServer = serverHolder.server;
      
      expect(firstServer).not.toBe(secondServer);
    });
  });

  describe("prototype_stop", () => {
    it("should stop running server", async () => {
      const html = "<html><body>Test</body></html>";
      await writeFile(resolve(PROTOTYPE_DIR, "index.html"), html, "utf-8");

      const serveTool = mockServer.tools.get("prototype_serve");
      await serveTool.handler({ dir: PROTOTYPE_DIR, port: 0 });

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
      const designDoc = `
# Game Concept Document

## Screens
- main-menu screen: Navigation hub
- game-screen view: Core gameplay area
- pause menu: Game state management

## Mechanics
- move action: Player movement
      `;
      const designDocPath = resolve(TEST_DIR, "gcd.md");
      await writeFile(designDocPath, designDoc, "utf-8");

      const html = `
        <html>
          <body>
            <div id="main-menu">Main Menu</div>
            <div id="game-screen">Game Screen</div>
            <div id="pause-menu">Pause</div>
            <script>const move = true;</script>
          </body>
        </html>
      `;
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, designDocPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(true);
      expect(parsed.issues).toEqual([]);
    });

    it("should detect missing screens", async () => {
      const designDoc = `
# Game Concept Document

## Screens
- missing-screen view: Should be here
      `;
      const designDocPath = resolve(TEST_DIR, "gcd.md");
      await writeFile(designDocPath, designDoc, "utf-8");

      const html = "<html><body>No screens here</body></html>";
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, designDocPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(false);
      expect(parsed.issues.length).toBeGreaterThan(0);
      expect(parsed.issues[0].type).toBe("screen-missing");
    });

    it("should detect missing mechanics", async () => {
      const designDoc = `
# Game Concept Document

## Mechanics
- jump mechanic: Player jumps
- attack feature: Combat
      `;
      const designDocPath = resolve(TEST_DIR, "gcd.md");
      await writeFile(designDocPath, designDoc, "utf-8");

      const html = "<html><body>No mechanics here</body></html>";
      const htmlPath = resolve(PROTOTYPE_DIR, "index.html");
      await writeFile(htmlPath, html, "utf-8");

      const tool = mockServer.tools.get("prototype_validate");
      const result = await tool.handler({ htmlPath, designDocPath });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.valid).toBe(false);
      expect(parsed.issues.some((i: { type: string }) => i.type === "mechanic-missing")).toBe(true);
    });
  });
});
