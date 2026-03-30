import { access, mkdir, readFile, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { resolve } from "node:path";
import { z } from "zod";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { KnowledgeTool, type KnowledgeIngestOptions } from "../../../src/knowledge";
import type { SearchKnowledgeRequest } from "../../../src/types";
import { deserializeGraph, type GraphStore } from "../../../src/graph/graph-store";
import type { SerializedGraph } from "../../../src/graph/types";

const INDEX_CACHE_FILE = "index.json";
const GRAPH_CACHE_FILE = "graph.json";

const CachedIngestedDocumentSchema = z.object({
  filePath: z.string(),
  metadata: z
    .object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      topic: z.string().optional(),
    })
    .optional(),
  documentId: z.string().optional(),
});

const CachedKnowledgeIndexSchema = z.object({
  version: z.literal(1),
  generatedAt: z.string(),
  ingestedDocuments: z.array(CachedIngestedDocumentSchema),
  documents: z.array(z.unknown()),
  chunksByDocument: z.record(z.string(), z.array(z.unknown())),
});

type CachedIngestedDocument = z.infer<typeof CachedIngestedDocumentSchema>;

type KnowledgeRuntime = {
  getKnowledge: () => Promise<KnowledgeTool>;
  saveKnowledgeCache: () => Promise<void>;
  addSourceRecord: (record: CachedIngestedDocument) => void;
};

export function setKnowledgeGraph(tool: KnowledgeTool, graph: GraphStore | null): void {
  (tool as unknown as { _graph: GraphStore | null })._graph = graph;
}

async function canRead(path: string): Promise<boolean> {
  try {
    await access(path, constants.R_OK);
    return true;
  } catch {
    return false;
  }
}

export async function loadKnowledgeCache(
  cacheDir: string,
  tool: KnowledgeTool,
  addSourceRecord: (record: CachedIngestedDocument) => void
): Promise<void> {
  const indexPath = resolve(cacheDir, INDEX_CACHE_FILE);
  const graphPath = resolve(cacheDir, GRAPH_CACHE_FILE);

  if (await canRead(indexPath)) {
    const raw = await readFile(indexPath, "utf-8");
    const parsed = CachedKnowledgeIndexSchema.parse(JSON.parse(raw));

    for (const source of parsed.ingestedDocuments) {
      if (!(await canRead(source.filePath))) {
        continue;
      }
      await tool.ingest(source.filePath, { metadata: source.metadata });
      addSourceRecord(source);
    }
  }

  if (await canRead(graphPath)) {
    const raw = await readFile(graphPath, "utf-8");
    const parsed = JSON.parse(raw) as SerializedGraph | null;

    if (parsed) {
      setKnowledgeGraph(tool, deserializeGraph(parsed));
    }
  }
}

export async function saveKnowledgeCache(
  cacheDir: string,
  tool: KnowledgeTool,
  sources: CachedIngestedDocument[]
): Promise<void> {
  await mkdir(cacheDir, { recursive: true });

  const documents = tool.listDocuments();
  const chunksByDocument: Record<string, unknown[]> = {};

  for (const document of documents) {
    const chunkView = tool.getDocument(document.documentId, "chunks");
    chunksByDocument[document.documentId] = chunkView.data;
  }

  const indexPayload = {
    version: 1 as const,
    generatedAt: new Date().toISOString(),
    ingestedDocuments: sources,
    documents,
    chunksByDocument,
  };

  await writeFile(resolve(cacheDir, INDEX_CACHE_FILE), JSON.stringify(indexPayload, null, 2), "utf-8");

  const graph = tool.graph ? tool.graph.serialize() : null;
  await writeFile(resolve(cacheDir, GRAPH_CACHE_FILE), JSON.stringify(graph, null, 2), "utf-8");
}

function buildStats(tool: KnowledgeTool): {
  documents: number;
  chunks: number;
  entities: number;
  relations: number;
  graphBuilt: boolean;
} {
  const documents = tool.listDocuments();
  let chunks = 0;

  for (const document of documents) {
    const chunkView = tool.getDocument(document.documentId, "chunks");
    chunks += Array.isArray(chunkView.data) ? chunkView.data.length : 0;
  }

  const graphStats = tool.graph?.stats();

  return {
    documents: documents.length,
    chunks,
    entities: graphStats?.entityCount ?? 0,
    relations: graphStats?.relationCount ?? 0,
    graphBuilt: Boolean(tool.graph),
  };
}

export function registerKnowledgeTools(server: McpServer, runtime: KnowledgeRuntime): void {
  server.registerTool(
    "knowledge_ingest",
    {
      title: "Ingest knowledge document",
      description: "Ingest one file into knowledge index and save cache.",
      inputSchema: z.object({
        filePath: z.string(),
        category: z.string().optional(),
        tags: z.array(z.string()).optional(),
        topic: z.string().optional(),
      }),
    },
    async ({ filePath, category, tags, topic }: { filePath: string; category?: string; tags?: string[]; topic?: string }) => {
      const tool = await runtime.getKnowledge();
      const metadata: KnowledgeIngestOptions["metadata"] = {
        category,
        tags,
        topic,
      };
      const absolutePath = resolve(filePath);
      const document = await tool.ingest(absolutePath, { metadata });
      runtime.addSourceRecord({ filePath: absolutePath, metadata, documentId: document.documentId });
      await runtime.saveKnowledgeCache();

      const chunkView = tool.getDocument(document.documentId, "chunks");

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                documentId: document.documentId,
                sourceType: document.sourceType,
                chunkCount: Array.isArray(chunkView.data) ? chunkView.data.length : 0,
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "knowledge_search",
    {
      title: "Search knowledge",
      description: "Search ingested knowledge via lexical/focused retrieval.",
      inputSchema: z.object({
        query: z.string(),
        mode: z.enum(["lexical", "focused"]).default("lexical"),
        topK: z.number().int().positive().max(50).default(5),
      }),
    },
    async ({ query, mode, topK }: { query: string; mode: "lexical" | "focused"; topK: number }) => {
      const tool = await runtime.getKnowledge();
      const request: SearchKnowledgeRequest = {
        query,
        topK,
        retrievalMode: mode,
        includeRawText: false,
        includeStructured: false,
      };

      const result = tool.search(request);
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(result, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "knowledge_graph",
    {
      title: "Get graph summary",
      description: "Return graph entities/relations summary. TODO: build_graph requires LLM provider.",
      inputSchema: z.object({}),
    },
    async () => {
      const tool = await runtime.getKnowledge();
      const graph = tool.graph;

      if (!graph) {
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(
                {
                  graphBuilt: false,
                  todo: "knowledge_build_graph is deferred until LLM provider wiring is added.",
                },
                null,
                2
              ),
            },
          ],
        };
      }

      const stats = graph.stats();
      return {
        content: [
          {
            type: "text",
            text: JSON.stringify(
              {
                graphBuilt: true,
                stats,
                entities: graph.getAllEntities().slice(0, 25),
              },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.registerTool(
    "knowledge_query_entity",
    {
      title: "Query graph entity",
      description: "Find an entity by name and include nearby relation context.",
      inputSchema: z.object({
        name: z.string(),
        depth: z.number().int().min(1).max(4).default(1),
      }),
    },
    async ({ name, depth }: { name: string; depth: number }) => {
      const tool = await runtime.getKnowledge();
      const graph = tool.graph;

      if (!graph) {
        return {
          content: [{ type: "text", text: JSON.stringify({ entity: null, relations: [] }, null, 2) }],
        };
      }

      const entity = graph.findEntitiesByName(name)[0];
      if (!entity) {
        return {
          content: [{ type: "text", text: JSON.stringify({ entity: null, relations: [] }, null, 2) }],
        };
      }

      const relations = [...graph.getRelationsFrom(entity.entityId), ...graph.getRelationsTo(entity.entityId)];
      const neighbors = graph.getNeighbors(entity.entityId, depth);

      return {
        content: [
          {
            type: "text",
            text: JSON.stringify({ entity, relations, neighbors }, null, 2),
          },
        ],
      };
    }
  );

  server.registerTool(
    "knowledge_stats",
    {
      title: "Knowledge stats",
      description: "Return document/chunk/graph stats for current knowledge cache.",
      inputSchema: z.object({}),
    },
    async () => {
      const tool = await runtime.getKnowledge();
      return {
        content: [{ type: "text", text: JSON.stringify(buildStats(tool), null, 2) }],
      };
    }
  );

}
