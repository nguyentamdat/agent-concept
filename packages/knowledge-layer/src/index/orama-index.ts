import { create, insertMultiple, search, type AnyOrama } from "@orama/orama";
import * as oramaPersistence from "@orama/plugin-data-persistence";
import type { KnowledgeChunk, SearchKnowledgeRequest, SearchKnowledgeResult } from "../types";
import type { KnowledgeIndex, KnowledgeIndexStats } from "./types";

const FNV_OFFSET_BASIS = 0x811c9dc5;
const FNV_PRIME = 0x01000193;
const DEFAULT_BM25 = { k: 1.2, b: 0.75, d: 0.5 };

type IndexedChunk = {
  id: string;
  chunkId: string;
  text: string;
  normalizedText: string;
  category: string;
  tags: string[];
  sourceType: string;
  language: string;
};

export interface OramaIndexOptions {
  bm25?: {
    k?: number;
    b?: number;
    d?: number;
  };
  onSerializedSnapshot?: (snapshot: unknown) => void;
}

export class OramaIndex implements KnowledgeIndex {
  private db: AnyOrama | null = null;
  private readonly chunksById = new Map<string, KnowledgeChunk>();
  private readonly tokenCacheByChunkId = new Map<string, Map<string, number>>();
  private indexVersion = "";
  private snapshot: unknown = null;
  private readonly options: OramaIndexOptions;
  private statsSnapshot: KnowledgeIndexStats = {
    totalChunks: 0,
    categoryCounts: {},
    tagCounts: {},
  };

  private readonly bm25: { k: number; b: number; d: number };

  constructor(options: OramaIndexOptions = {}) {
    this.options = options;
    this.bm25 = {
      k: options.bm25?.k ?? DEFAULT_BM25.k,
      b: options.bm25?.b ?? DEFAULT_BM25.b,
      d: options.bm25?.d ?? DEFAULT_BM25.d,
    };
  }

  async build(chunks: KnowledgeChunk[]): Promise<void> {
    this.chunksById.clear();
    this.tokenCacheByChunkId.clear();

    const docs = chunks.map((chunk) => this.mapChunkToIndexedDocument(chunk));

    for (const chunk of chunks) {
      this.chunksById.set(chunk.chunkId, chunk);
    }

    this.statsSnapshot = this.buildStats(chunks);
    this.indexVersion = hashChunkIds(chunks.map((chunk) => chunk.chunkId));

    this.db = create({
      schema: {
        id: "string",
        chunkId: "string",
        text: "string",
        normalizedText: "string",
        category: "string",
        tags: "string[]",
        sourceType: "string",
        language: "string",
      },
    });

    if (docs.length > 0) {
      await insertMultiple(this.db, docs);
    }

    await this.capturePersistenceSnapshot();
  }

  search(req: SearchKnowledgeRequest): SearchKnowledgeResult {
    const start = performance.now();
    const query = normaliseQuery(req.query);

    if (!query || req.topK <= 0 || this.chunksById.size === 0) {
      return {
        results: [],
        timingMs: Math.max(0, performance.now() - start),
        indexVersion: this.indexVersion,
      };
    }

    const preFiltered = this.getPreFilteredChunks(req.filters);
    if (preFiltered.length === 0) {
      return {
        results: [],
        timingMs: Math.max(0, performance.now() - start),
        indexVersion: this.indexVersion,
      };
    }

    const minScore = req.minScore ?? Number.NEGATIVE_INFINITY;
    const fromOrama = this.searchWithOrama(query, req, preFiltered.length);
    const scored = (fromOrama ?? this.searchWithLocalBm25(query, preFiltered))
      .filter((result) => result.score >= minScore)
      .sort((left, right) => right.score - left.score)
      .slice(0, req.topK);

    return {
      results: scored,
      timingMs: Math.max(0, performance.now() - start),
      indexVersion: this.indexVersion,
    };
  }

  stats(): KnowledgeIndexStats {
    return {
      totalChunks: this.statsSnapshot.totalChunks,
      categoryCounts: { ...this.statsSnapshot.categoryCounts },
      tagCounts: { ...this.statsSnapshot.tagCounts },
    };
  }

  getChunkById(chunkId: string): import("../types").KnowledgeChunk | undefined {
    return this.chunksById.get(chunkId);
  }

  private searchWithOrama(
    query: string,
    req: SearchKnowledgeRequest,
    fallbackLimit: number
  ): SearchKnowledgeResult["results"] | null {
    if (!this.db) {
      return null;
    }

    try {
      const response = search(this.db, {
        term: query,
        properties: ["normalizedText", "text"],
        where: buildOramaWhere(req.filters),
        limit: Math.max(req.topK * 4, fallbackLimit),
        threshold: 0,
        relevance: {
          k: this.bm25.k,
          b: this.bm25.b,
          d: this.bm25.d,
        },
      } as never) as {
        hits?: Array<{ id: string; score: number; document?: IndexedChunk }>;
      };

      if (!response?.hits || response.hits.length === 0) {
        return null;
      }

      const queryTerms = tokenize(query);
      const results: SearchKnowledgeResult["results"] = [];

      for (const hit of response.hits) {
        const chunkId = hit.document?.chunkId ?? hit.id;
        const chunk = this.chunksById.get(chunkId);

        if (!chunk) {
          continue;
        }

        const matchedTerms = queryTerms.filter((term) =>
          chunk.normalizedText.toLowerCase().includes(term)
        );

        results.push({
          chunk,
          score: hit.score,
          citation: chunk.primaryCitation,
          matchedTerms,
          scoreBreakdown: {
            bm25: hit.score,
          },
        });
      }

      return results;
    } catch {
      // Orama search unavailable — falls through to local BM25 fallback
      return null;
    }
  }

  private searchWithLocalBm25(
    query: string,
    chunks: KnowledgeChunk[]
  ): SearchKnowledgeResult["results"] {
    const queryTerms = tokenize(query);
    if (queryTerms.length === 0 || chunks.length === 0) {
      return [];
    }

    const averageLength =
      chunks.reduce((total, chunk) => total + this.getChunkTokenTotal(chunk), 0) / chunks.length;

    const documentFrequency = new Map<string, number>();

    for (const term of queryTerms) {
      let seenCount = 0;
      for (const chunk of chunks) {
        const termFrequency = this.getTermFrequency(chunk, term);
        if (termFrequency > 0) {
          seenCount += 1;
        }
      }
      documentFrequency.set(term, seenCount);
    }

    const results: SearchKnowledgeResult["results"] = [];

    for (const chunk of chunks) {
      const chunkLength = Math.max(1, this.getChunkTokenTotal(chunk));
      let score = 0;
      const matchedTerms: string[] = [];

      for (const term of queryTerms) {
        const tf = this.getTermFrequency(chunk, term);
        if (tf <= 0) {
          continue;
        }

        const df = documentFrequency.get(term) ?? 0;
        const idf = Math.log(1 + (chunks.length - df + 0.5) / (df + 0.5));

        const denominator =
          tf +
          this.bm25.k *
            (1 - this.bm25.b + this.bm25.b * (chunkLength / Math.max(1, averageLength)));
        const numerator = tf * (this.bm25.k + 1);

        score += idf * (numerator / denominator);
        matchedTerms.push(term);
      }

      if (score <= 0) {
        continue;
      }

      results.push({
        chunk,
        score,
        scoreBreakdown: { bm25: score },
        citation: chunk.primaryCitation,
        matchedTerms,
      });
    }

    return results;
  }

  private getPreFilteredChunks(filters: SearchKnowledgeRequest["filters"]): KnowledgeChunk[] {
    const requiredTags = filters?.tags?.map((tag) => tag.trim().toLowerCase()).filter(Boolean) ?? [];

    return [...this.chunksById.values()].filter((chunk) => {
      if (filters?.category && chunk.metadata.category !== filters.category) {
        return false;
      }

      if (filters?.sourceType && chunk.metadata.sourceType !== filters.sourceType) {
        return false;
      }

      if (filters?.language && chunk.metadata.language !== filters.language) {
        return false;
      }

      if (requiredTags.length > 0) {
        const chunkTags = new Set((chunk.metadata.tags ?? []).map((tag) => tag.toLowerCase()));
        for (const tag of requiredTags) {
          if (!chunkTags.has(tag)) {
            return false;
          }
        }
      }

      return true;
    });
  }

  private getChunkTokenTotal(chunk: KnowledgeChunk): number {
    const cached = this.tokenCacheByChunkId.get(chunk.chunkId);
    if (cached?.has("__total__")) {
      return cached.get("__total__") ?? 1;
    }

    const tokens = tokenize(chunk.normalizedText.toLowerCase());
    const nextCache = cached ?? new Map<string, number>();

    for (const token of tokens) {
      nextCache.set(token, (nextCache.get(token) ?? 0) + 1);
    }

    nextCache.set("__total__", tokens.length || 1);
    this.tokenCacheByChunkId.set(chunk.chunkId, nextCache);
    return tokens.length || 1;
  }

  private getTermFrequency(chunk: KnowledgeChunk, term: string): number {
    this.getChunkTokenTotal(chunk);
    const cache = this.tokenCacheByChunkId.get(chunk.chunkId);
    return cache?.get(term) ?? 0;
  }

  private buildStats(chunks: KnowledgeChunk[]): KnowledgeIndexStats {
    const categoryCounts: Record<string, number> = {};
    const tagCounts: Record<string, number> = {};

    for (const chunk of chunks) {
      const category = chunk.metadata.category ?? "uncategorized";
      categoryCounts[category] = (categoryCounts[category] ?? 0) + 1;

      for (const tag of chunk.metadata.tags ?? []) {
        tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
      }
    }

    return {
      totalChunks: chunks.length,
      categoryCounts,
      tagCounts,
    };
  }

  private mapChunkToIndexedDocument(chunk: KnowledgeChunk): IndexedChunk {
    return {
      id: chunk.chunkId,
      chunkId: chunk.chunkId,
      text: chunk.text,
      normalizedText: chunk.normalizedText,
      category: chunk.metadata.category ?? "",
      tags: chunk.metadata.tags ?? [],
      sourceType: chunk.metadata.sourceType,
      language: chunk.metadata.language ?? "",
    };
  }

  private async capturePersistenceSnapshot(): Promise<void> {
    if (!this.db) {
      return;
    }

    const persistenceModule = oramaPersistence as Record<string, unknown>;
    const save =
      (typeof persistenceModule.save === "function" ? persistenceModule.save : null) ??
      (typeof persistenceModule.persist === "function" ? persistenceModule.persist : null);

    if (!save) {
      return;
    }

    try {
      this.snapshot = await (save as (db: AnyOrama) => Promise<unknown>)(this.db);
      this.options.onSerializedSnapshot?.(this.snapshot);
    } catch {
      // Persistence capture best-effort — index still functional without snapshot
      this.snapshot = null;
    }
  }
}

function buildOramaWhere(filters: SearchKnowledgeRequest["filters"]): Record<string, unknown> {
  const where: Record<string, unknown> = {};

  if (!filters) {
    return where;
  }

  if (filters.category) {
    where.category = filters.category;
  }

  if (filters.sourceType) {
    where.sourceType = filters.sourceType;
  }

  if (filters.language) {
    where.language = filters.language;
  }

  if (filters.tags && filters.tags.length > 0) {
    where.tags = filters.tags;
  }

  return where;
}

function normaliseQuery(query: string): string {
  return query.trim();
}

function tokenize(value: string): string[] {
  return value
    .toLowerCase()
    .split(/[^\p{L}\p{N}_]+/u)
    .map((token) => token.trim())
    .filter(Boolean);
}

function hashChunkIds(chunkIds: string[]): string {
  const sortedIds = [...chunkIds].sort();
  return `idx_${hashString(sortedIds.join("|"))}`;
}

function hashString(value: string): string {
  let hash = FNV_OFFSET_BASIS;

  for (const character of value) {
    hash ^= character.codePointAt(0) ?? 0;
    hash = Math.imul(hash, FNV_PRIME) >>> 0;
  }

  return hash.toString(16).padStart(8, "0");
}
