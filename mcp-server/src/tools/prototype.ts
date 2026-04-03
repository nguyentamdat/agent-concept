import { extname, resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { readFile, stat } from "node:fs/promises";

type PrototypeRuntime = {
  getPrototypeServer: () => Bun.Server<unknown> | null;
  setPrototypeServer: (server: Bun.Server<unknown> | null) => void;
};

const mimeByExt: Record<string, string> = {
  ".html": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
};

function contentType(path: string): string {
  return mimeByExt[extname(path).toLowerCase()] ?? "application/octet-stream";
}

function normalizedPath(urlPath: string): string {
  if (urlPath === "/") {
    return "index.html";
  }
  return urlPath.startsWith("/") ? urlPath.slice(1) : urlPath;
}

export function registerPrototypeTools(server: McpServer, runtime: PrototypeRuntime): void {
  server.registerTool(
    "prototype_serve",
    {
      title: "Serve prototype",
      description: "Serve a prototype directory over Bun static HTTP.",
      inputSchema: z.object({
        dir: z.string(),
        port: z.number().int().min(0).max(65535).default(0),
      }),
    },
    async ({ dir, port }: { dir: string; port: number }) => {
      const baseDir = resolve(dir);
      const directoryInfo = await stat(baseDir);
      if (!directoryInfo.isDirectory()) {
        throw new Error(`Prototype directory is not a directory: ${baseDir}`);
      }

      runtime.getPrototypeServer()?.stop(true);

      const bunServer = Bun.serve({
        port,
        fetch: async (request: Request): Promise<Response> => {
          const requestUrl = new URL(request.url);
          const relative = normalizedPath(requestUrl.pathname);
          const absolute = resolve(baseDir, relative);

          if (!absolute.startsWith(baseDir)) {
            return new Response("Forbidden", { status: 403 });
          }

          const file = Bun.file(absolute);
          if (!(await file.exists())) {
            return new Response("Not Found", { status: 404 });
          }

          return new Response(file, {
            headers: { "content-type": contentType(absolute) },
          });
        },
      });

      runtime.setPrototypeServer(bunServer);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ url: `http://localhost:${bunServer.port}`, port: bunServer.port }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "prototype_stop",
    {
      title: "Stop prototype server",
      description: "Stop currently running prototype HTTP server.",
      inputSchema: z.object({}),
    },
    async () => {
      const existing = runtime.getPrototypeServer();
      if (!existing) {
        return {
          content: [{ type: "text", text: JSON.stringify({ stopped: false }, null, 2) }],
        };
      }

      existing.stop(true);
      runtime.setPrototypeServer(null);
      return {
        content: [{ type: "text", text: JSON.stringify({ stopped: true }, null, 2) }],
      };
    }
  );

  server.registerTool(
    "prototype_validate",
    {
      title: "Validate prototype",
      description: "Check prototype HTML against design document for screen and mechanic references.",
      inputSchema: z.object({
        htmlPath: z.string(),
        designDocPath: z.string().describe("Path to GCD or concept-pitch.md"),
      }),
    },
    async ({ htmlPath, designDocPath }: { htmlPath: string; designDocPath: string }) => {
      const resolvedHtml = resolve(htmlPath);
      const resolvedDesignDoc = resolve(designDocPath);

      const [designDoc, html] = await Promise.all([
        readFile(resolvedDesignDoc, "utf-8"),
        readFile(resolvedHtml, "utf-8"),
      ]);

      const lowerHtml = html.toLowerCase();
      const issues: Array<{ type: string; message: string }> = [];

      // Extract screen-like references from design doc (markdown list: '- name screen:')
      const screenMatches = [...designDoc.matchAll(/^-\s+(\S+)\s+(?:screen|view|page|menu)\s*:/gim)];
      const screens = [...new Set(screenMatches.map((m) => m[1].toLowerCase()))];

      for (const screen of screens) {
        if (!lowerHtml.includes(screen.toLowerCase())) {
          issues.push({
            type: "screen-missing",
            message: `Screen/view '${screen}' referenced in design doc is not found in prototype HTML.`,
          });
        }
      }

      // Extract mechanic-like references (markdown list: '- name mechanic:')
      const mechanicMatches = [...designDoc.matchAll(/^-\s+(\S+)\s+(?:mechanic|action|feature)\s*:/gim)];
      const mechanics = [...new Set(mechanicMatches.map((m) => m[1].toLowerCase()))];

      for (const mechanic of mechanics) {
        if (!lowerHtml.includes(mechanic.toLowerCase())) {
          issues.push({
            type: "mechanic-missing",
            message: `Mechanic/feature '${mechanic}' referenced in design doc is not found in prototype HTML.`,
          });
        }
      }

      return {
        content: [{ type: "text", text: JSON.stringify({ valid: issues.length === 0, issues, screensChecked: screens.length, mechanicsChecked: mechanics.length }, null, 2) }],
      };
    }
  );
}
