import { mkdir, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";


type ProjectRuntime = {
  projectsDir: string;
};

export function registerProjectTools(server: McpServer, runtime: ProjectRuntime): void {
  server.registerTool(
    "project_create",
    {
      title: "Create project",
      description: "Create game design project folder structure.",
      inputSchema: z.object({
        name: z.string().min(1),
      }),
    },
    async ({ name }: { name: string }) => {
      const projectDir = resolve(runtime.projectsDir, name);
      const prototypeDir = resolve(projectDir, "prototype");
      const documentsDir = resolve(projectDir, "documents");

      await mkdir(prototypeDir, { recursive: true });
      await mkdir(documentsDir, { recursive: true });

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ projectDir }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "project_list",
    {
      title: "List projects",
      description: "List project directories and summarize their current pipeline status.",
      inputSchema: z.object({}),
    },
    async () => {
      await mkdir(runtime.projectsDir, { recursive: true });
      const entries = await readdir(runtime.projectsDir, { withFileTypes: true });
      const projects: Array<Record<string, unknown>> = [];

      for (const entry of entries) {
        if (!entry.isDirectory()) {
          continue;
        }

        const projectDir = resolve(runtime.projectsDir, entry.name);

        // Check for pipeline artifacts to determine status
        const conceptPitchPath = resolve(projectDir, "concept-pitch.md");
        const gcdPath = resolve(projectDir, "gcd.md");
        const prototypePath = resolve(projectDir, "index.html");

        try {
          const [conceptPitch, gcd, prototype] = await Promise.all([
            stat(conceptPitchPath).catch(() => null),
            stat(gcdPath).catch(() => null),
            stat(prototypePath).catch(() => null),
          ]);

          let status = "initialized";
          let lastUpdated: Date | null = null;

          if (prototype) {
            status = "prototype";
            lastUpdated = prototype.mtime;
          } else if (gcd) {
            status = "design";
            lastUpdated = gcd.mtime;
          } else if (conceptPitch) {
            status = "concept";
            lastUpdated = conceptPitch.mtime;
          }

          // Use directory mtime as fallback
          if (!lastUpdated) {
            const dirStat = await stat(projectDir);
            lastUpdated = dirStat.mtime;
          }

          projects.push({
            name: entry.name,
            path: projectDir,
            status,
            lastUpdated: lastUpdated.toISOString(),
          });
        } catch {
          projects.push({
            name: entry.name,
            path: projectDir,
            status: "initialized",
            lastUpdated: null,
          });
        }
      }

      projects.sort((left, right) => String(left.name ?? "").localeCompare(String(right.name ?? "")));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ projects }, null, 2),
          },
        ],
      };
    }
  );
}
