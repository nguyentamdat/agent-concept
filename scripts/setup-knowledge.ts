import { mkdir, readdir } from "node:fs/promises";
import { extname, resolve } from "node:path";
import { KnowledgeTool } from "../packages/knowledge-layer/src/knowledge";
import { saveKnowledgeCache } from "../packages/mcp-server/src/tools/knowledge";

const rootDir = process.cwd();
const knowledgeDir = resolve(rootDir, process.env.KNOWLEDGE_DIR ?? "knowledge");
const cacheDir = resolve(rootDir, ".knowledge-cache");

const supported = new Set([".pdf", ".md", ".docx", ".csv", ".json", ".yaml", ".yml", ".txt"]);

async function main(): Promise<void> {
  await mkdir(knowledgeDir, { recursive: true });
  const entries = await readdir(knowledgeDir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => resolve(knowledgeDir, entry.name))
    .filter((filePath) => supported.has(extname(filePath).toLowerCase()));

  const tool = new KnowledgeTool();
  const sources: Array<{ filePath: string; metadata?: { category?: string; tags?: string[]; topic?: string } }> = [];

  for (const filePath of files) {
    await tool.ingest(filePath);
    sources.push({ filePath });
  }

  await saveKnowledgeCache(cacheDir, tool, sources);
}

await main();
