import { mkdir, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { createDefaultGameSpec, readGameSpec, writeGameSpec } from "./spec";

type ProjectRuntime = {
  projectsDir: string;
};

export function registerProjectTools(server: McpServer, runtime: ProjectRuntime): void {
  server.registerTool(
    "project_create",
    {
      title: "Create project",
      description: "Create game design project folder structure with starter spec.",
      inputSchema: z.object({
        name: z.string().min(1),
      }),
    },
    async ({ name }: { name: string }) => {
      const projectDir = resolve(runtime.projectsDir, name);
      const specHistoryDir = resolve(projectDir, "spec-history");
      const prototypeDir = resolve(projectDir, "prototype");
      const documentsDir = resolve(projectDir, "documents");

      await mkdir(specHistoryDir, { recursive: true });
      await mkdir(prototypeDir, { recursive: true });
      await mkdir(documentsDir, { recursive: true });

      const specPath = resolve(projectDir, "spec.yaml");
      await writeGameSpec(specPath, createDefaultGameSpec(name));

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ projectDir, specPath }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "project_list",
    {
      title: "List projects",
      description: "List project directories and summarize their current spec status.",
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
        const specPath = resolve(projectDir, "spec.yaml");

        try {
          const [spec, metadata] = await Promise.all([readGameSpec(specPath), stat(specPath)]);
          projects.push({
            name: entry.name,
            path: projectDir,
            specVersion: spec.meta.version,
            lastUpdated: metadata.mtime.toISOString(),
            status: "ready",
          });
        } catch {
          projects.push({
            name: entry.name,
            path: projectDir,
            specVersion: null,
            lastUpdated: null,
            status: "missing-or-invalid-spec",
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
