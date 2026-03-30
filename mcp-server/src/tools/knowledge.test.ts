import { describe, expect, it, beforeEach, afterEach } from "bun:test";
import { mkdir, writeFile, rm, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { loadKnowledgeCache, saveKnowledgeCache, registerKnowledgeTools, setKnowledgeGraph } from "./knowledge";
import { KnowledgeTool } from "../../../src/knowledge";
import type { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

const TEST_DIR = resolve(process.cwd(), "test-temp-knowledge");
const CACHE_DIR = resolve(TEST_DIR, "cache");
const FIXTURES_DIR = resolve(process.cwd(), "knowledge", "fixtures");

type SourceRecord = {
  filePath: string;
  metadata?: {
    category?: string;
    tags?: string[];
    topic?: string;
  };
  documentId?: string;
};

class MockMcpServer {
  tools = new Map();
  
  registerTool(name: string, metadata: unknown, handler: unknown) {
    this.tools.set(name, { metadata, handler });
  }
}

describe("knowledge tools", () => {
  let knowledgeTool: KnowledgeTool;
  let mockServer: MockMcpServer;
  let sources: SourceRecord[] = [];

  beforeEach(async () => {
    await mkdir(TEST_DIR, { recursive: true });
    await mkdir(CACHE_DIR, { recursive: true });
    knowledgeTool = new KnowledgeTool();
    mockServer = new MockMcpServer();
    sources = [];
  });

  afterEach(async () => {
    await rm(TEST_DIR, { recursive: true, force: true });
  });

  describe("loadKnowledgeCache", () => {
    it("should load from cache when index.json exists", async () => {
      const sampleDoc = resolve(FIXTURES_DIR, "sample.md");
      
      await knowledgeTool.ingest(sampleDoc);
      sources.push({ filePath: sampleDoc, metadata: { category: "test" } });
      await saveKnowledgeCache(CACHE_DIR, knowledgeTool, sources);

      const newTool = new KnowledgeTool();
      const newSources: SourceRecord[] = [];
      
      await loadKnowledgeCache(CACHE_DIR, newTool, (record) => newSources.push(record));
      
      expect(newSources.length).toBeGreaterThan(0);
      expect(newSources[0].filePath).toBe(sampleDoc);
    });

    it("should handle missing cache gracefully", async () => {
      const newTool = new KnowledgeTool();
      const newSources: SourceRecord[] = [];
      
      await loadKnowledgeCache(CACHE_DIR, newTool, (record) => newSources.push(record));
      
      expect(newSources.length).toBe(0);
    });
  });

  describe("saveKnowledgeCache", () => {
    it("should save index.json and graph.json", async () => {
      const sampleDoc = resolve(FIXTURES_DIR, "sample.md");
      await knowledgeTool.ingest(sampleDoc);
      sources.push({ filePath: sampleDoc });
      
      await saveKnowledgeCache(CACHE_DIR, knowledgeTool, sources);
      
      const indexPath = resolve(CACHE_DIR, "index.json");
      const indexContent = await readFile(indexPath, "utf-8");
      const index = JSON.parse(indexContent);
      
      expect(index.version).toBe(1);
      expect(index.ingestedDocuments).toHaveLength(1);
      expect(index.generatedAt).toBeDefined();
    });
  });

  describe("registerKnowledgeTools", () => {
    it("should register all knowledge tools", () => {
      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: (record: SourceRecord) => sources.push(record),
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      expect(mockServer.tools.has("knowledge_ingest")).toBe(true);
      expect(mockServer.tools.has("knowledge_search")).toBe(true);
      expect(mockServer.tools.has("knowledge_graph")).toBe(true);
      expect(mockServer.tools.has("knowledge_query_entity")).toBe(true);
      expect(mockServer.tools.has("knowledge_stats")).toBe(true);
    });

    it("knowledge_ingest should ingest document and return stats", async () => {
      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: (record: SourceRecord) => sources.push(record),
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      const sampleDoc = resolve(FIXTURES_DIR, "sample.md");
      const tool = mockServer.tools.get("knowledge_ingest");
      
      const result = await tool.handler({
        filePath: sampleDoc,
        category: "test",
        tags: ["sample"],
        topic: "game-design",
      });

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.documentId).toBeDefined();
      expect(parsed.sourceType).toBe("md");
      expect(parsed.chunkCount).toBeGreaterThan(0);
    });

    it("knowledge_search should return search results", async () => {
      const sampleDoc = resolve(FIXTURES_DIR, "sample.md");
      await knowledgeTool.ingest(sampleDoc);

      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: () => {},
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      const tool = mockServer.tools.get("knowledge_search");
      const result = await tool.handler({
        query: "core loop",
        mode: "lexical",
        topK: 5,
      });

      expect(result.content).toHaveLength(1);
      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.results).toBeDefined();
    });

    it("knowledge_stats should return document/chunk/graph stats", async () => {
      const sampleDoc = resolve(FIXTURES_DIR, "sample.md");
      await knowledgeTool.ingest(sampleDoc);

      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: () => {},
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      const tool = mockServer.tools.get("knowledge_stats");
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.documents).toBeGreaterThan(0);
      expect(parsed.chunks).toBeGreaterThan(0);
      expect(parsed.graphBuilt).toBe(false);
    });

    it("knowledge_graph should return not-built when graph is null", async () => {
      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: () => {},
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      const tool = mockServer.tools.get("knowledge_graph");
      const result = await tool.handler({});

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.graphBuilt).toBe(false);
      expect(parsed.todo).toContain("deferred");
    });

    it("knowledge_query_entity should return empty when graph is null", async () => {
      const runtime = {
        getKnowledge: async () => knowledgeTool,
        saveKnowledgeCache: async () => {},
        addSourceRecord: () => {},
      };

      registerKnowledgeTools(mockServer as unknown as McpServer, runtime);

      const tool = mockServer.tools.get("knowledge_query_entity");
      const result = await tool.handler({ name: "MDA", depth: 1 });

      const parsed = JSON.parse(result.content[0].text);
      expect(parsed.entity).toBeNull();
      expect(parsed.relations).toEqual([]);
    });
  });
});
