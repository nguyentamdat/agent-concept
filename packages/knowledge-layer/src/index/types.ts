import type { KnowledgeChunk, SearchKnowledgeRequest, SearchKnowledgeResult } from "../types";

export interface KnowledgeIndexStats {
  totalChunks: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
}

export interface KnowledgeIndex {
  build(chunks: KnowledgeChunk[]): Promise<void>;
  search(req: SearchKnowledgeRequest): SearchKnowledgeResult;
  getChunkById(chunkId: string): KnowledgeChunk | undefined;
  stats(): KnowledgeIndexStats;
}

export type { DeepSearchResult, DeepSearchOptions } from "./deep-retrieval";
