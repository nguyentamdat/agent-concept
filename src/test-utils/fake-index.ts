import {
  KnowledgeChunk,
  SearchKnowledgeRequest,
  SearchKnowledgeResult,
} from "../types";

/**
 * FakeIndex: In-memory KnowledgeIndex implementation for testing.
 * Provides a minimal but functional search interface without external dependencies.
 */
export class FakeIndex {
  private chunks: Map<string, KnowledgeChunk> = new Map();
  private indexVersion: string = "";

  /**
   * Build the index from a set of chunks.
   */
  build(chunks: KnowledgeChunk[]): void {
    this.chunks.clear();
    chunks.forEach((chunk) => {
      this.chunks.set(chunk.chunkId, chunk);
    });
    // Simple version hash: count of chunks
    this.indexVersion = `v${chunks.length}-${Date.now()}`;
  }

  /**
   * Search the index with a simple lexical match.
   * Matches query terms against chunk text (case-insensitive).
   * Applies filters if provided.
   */
  search(req: SearchKnowledgeRequest): SearchKnowledgeResult {
    const startTime = Date.now();
    const results: SearchKnowledgeResult["results"] = [];

    const queryTerms = req.query.toLowerCase().split(/\s+/).filter(Boolean);

    // Iterate through chunks and score them
    for (const chunk of this.chunks.values()) {
      // Apply filters
      if (req.filters?.sourceType && chunk.metadata.sourceType !== req.filters.sourceType) {
        continue;
      }
      if (req.filters?.category && chunk.metadata.category !== req.filters.category) {
        continue;
      }
      if (req.filters?.tags && req.filters.tags.length > 0) {
        const chunkTags = chunk.metadata.tags || [];
        const hasMatchingTag = req.filters.tags.some((tag) => chunkTags.includes(tag));
        if (!hasMatchingTag) {
          continue;
        }
      }

      // Score based on term matches
      const chunkText = chunk.normalizedText.toLowerCase();
      let score = 0;
      const matchedTerms: string[] = [];

      for (const term of queryTerms) {
        if (chunkText.includes(term)) {
          score += 1;
          matchedTerms.push(term);
        }
      }

      // Only include chunks with at least one match
      if (score > 0) {
        const minScore = req.minScore ?? 0;
        if (score >= minScore) {
          results.push({
            chunk,
            score,
            scoreBreakdown: { termMatches: score },
            citation: chunk.primaryCitation,
            matchedTerms,
          });
        }
      }
    }

    // Sort by score descending
    results.sort((a, b) => b.score - a.score);

    // Limit to topK
    const topResults = results.slice(0, req.topK);

    const timingMs = Date.now() - startTime;

    return {
      results: topResults,
      timingMs,
      indexVersion: this.indexVersion,
    };
  }

  /**
   * Get index statistics.
   */
  stats(): {
    totalChunks: number;
    categoryCounts: Record<string, number>;
    tagCounts: Record<string, number>;
  } {
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const chunk of this.chunks.values()) {
      const category = chunk.metadata.category || "uncategorized";
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;

      const tags = chunk.metadata.tags || [];
      for (const tag of tags) {
        tagCounts[tag] = (tagCounts[tag] || 0) + 1;
      }
    }

    return {
      totalChunks: this.chunks.size,
      categoryCounts,
      tagCounts,
    };
  }

  /**
   * Get a chunk by ID.
   */
  getChunk(chunkId: string): KnowledgeChunk | undefined {
    return this.chunks.get(chunkId);
  }

  /**
   * Get all chunks.
   */
  getAllChunks(): KnowledgeChunk[] {
    return Array.from(this.chunks.values());
  }

  /**
   * Clear the index.
   */
  clear(): void {
    this.chunks.clear();
    this.indexVersion = "";
  }
}
