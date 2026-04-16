import { mkdir } from "node:fs/promises";
import type { Server } from "node:http";
import { isAbsolute, resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeTool } from "knowledge-layer";
import {
  loadKnowledgeCache,
  registerKnowledgeTools,
  saveKnowledgeCache,
} from "./tools/knowledge";
import { registerPrototypeTools } from "./tools/prototype";
import { registerProjectTools } from "./tools/project";
import { registerTemplateResources } from "./resources/templates";

type SourceRecord = {
  filePath: string;
  metadata?: {
    category?: string;
    tags?: string[];
    topic?: string;
  };
  documentId?: string;
};

// Resolve a config path: absolute paths are used as-is,
// relative paths resolve from the workspace (cwd), not the plugin root.
function resolveConfigPath(rootDir: string, envValue: string | undefined, defaultRelative: string): string {
  const raw = envValue ?? defaultRelative;
  if (isAbsolute(raw)) return raw;
  return resolve(process.cwd(), raw);
}

const pluginRoot = process.env.CLAUDE_PLUGIN_ROOT ?? process.cwd();
const rootDir = pluginRoot;
const knowledgeDir = resolve(rootDir, process.env.KNOWLEDGE_DIR ?? "knowledge");
const projectsDir = resolveConfigPath(rootDir, process.env.PROJECTS_DIR, "projects");
const templatesDir = resolve(rootDir, process.env.TEMPLATES_DIR ?? "templates");
const cacheDir = resolve(process.env.CACHE_DIR ?? resolve(rootDir, ".knowledge-cache"));

let knowledgeTool: KnowledgeTool | null = null;
let knowledgeReady: Promise<KnowledgeTool> | null = null;
const sources = new Map<string, SourceRecord>();

let prototypeServer: Server | null = null;

async function getKnowledge(): Promise<KnowledgeTool> {
  if (knowledgeTool) {
    return knowledgeTool;
  }

  if (knowledgeReady) {
    return knowledgeReady;
  }

  knowledgeReady = (async () => {
    const instance = new KnowledgeTool();
    await mkdir(knowledgeDir, { recursive: true });
    await loadKnowledgeCache(cacheDir, instance, (record) => {
      sources.set(record.filePath, record);
    });
    knowledgeTool = instance;
    return instance;
  })();

  return knowledgeReady;
}

function addSourceRecord(record: SourceRecord): void {
  sources.set(record.filePath, record);
}

async function persistKnowledgeCache(): Promise<void> {
  const tool = await getKnowledge();
  await saveKnowledgeCache(cacheDir, tool, [...sources.values()]);
}

const server = new McpServer({
  name: "game-design-kit",
  version: "2.2.0",
});

registerKnowledgeTools(server, {
  getKnowledge,
  saveKnowledgeCache: persistKnowledgeCache,
  addSourceRecord,
});

registerPrototypeTools(server, {
  getPrototypeServer: () => prototypeServer,
  setPrototypeServer: (nextServer) => {
    prototypeServer = nextServer;
  },
});
registerProjectTools(server, {
  projectsDir,
});

registerTemplateResources(server, {
  templatesDir,
});

const transport = new StdioServerTransport();
await server.connect(transport);
