import { mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KnowledgeTool } from "../../src/knowledge";
import {
  loadKnowledgeCache,
  registerKnowledgeTools,
  saveKnowledgeCache,
} from "./tools/knowledge";
import { registerSpecTools } from "./tools/spec";
import { registerPrototypeTools } from "./tools/prototype";
import { registerProjectTools } from "./tools/project";
import { registerTemplateResources } from "./resources/templates";
import { registerSchemaResources } from "./resources/schemas";

type SourceRecord = {
  filePath: string;
  metadata?: {
    category?: string;
    tags?: string[];
    topic?: string;
  };
  documentId?: string;
};

const rootDir = process.cwd();
const knowledgeDir = resolve(rootDir, process.env.KNOWLEDGE_DIR ?? "knowledge");
const projectsDir = resolve(rootDir, process.env.PROJECTS_DIR ?? "projects");
const templatesDir = resolve(rootDir, process.env.TEMPLATES_DIR ?? "templates");
const cacheDir = resolve(rootDir, ".knowledge-cache");

let knowledgeTool: KnowledgeTool | null = null;
let knowledgeReady: Promise<KnowledgeTool> | null = null;
const sources = new Map<string, SourceRecord>();

let prototypeServer: Bun.Server<unknown> | null = null;

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
  version: "0.1.0",
});

registerKnowledgeTools(server, {
  getKnowledge,
  saveKnowledgeCache: persistKnowledgeCache,
  addSourceRecord,
});

registerSpecTools(server);
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
registerSchemaResources(server);

const transport = new StdioServerTransport();
await server.connect(transport);
