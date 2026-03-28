import type { KnowledgeChunk, SearchKnowledgeRequest, SearchKnowledgeResult } from "../types";

export interface KnowledgeIndexStats {
  totalChunks: number;
  categoryCounts: Record<string, number>;
  tagCounts: Record<string, number>;
}

export interface KnowledgeIndex {
  build(chunks: KnowledgeChunk[]): Promise<void>;
  search(req: SearchKnowledgeRequest): SearchKnowledgeResult;
  stats(): KnowledgeIndexStats;
}
