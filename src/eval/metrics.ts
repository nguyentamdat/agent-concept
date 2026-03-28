import type { SearchKnowledgeResult } from "../types";

type RankedResult = SearchKnowledgeResult["results"][number] | string;
type LatencySample = number | { timingMs: number };

export function recallAtK(results: RankedResult[], expected: string[], k: number): number {
  const expectedIds = new Set(expected);
  const topIds = getTopChunkIds(results, k);

  if (expectedIds.size === 0) {
    return topIds.length === 0 ? 1 : 0;
  }

  const hits = topIds.filter((chunkId) => expectedIds.has(chunkId));
  return new Set(hits).size / expectedIds.size;
}

export function mrr(results: RankedResult[], expected: string[], k: number): number {
  const expectedIds = new Set(expected);

  if (expectedIds.size === 0) {
    return getTopChunkIds(results, k).length === 0 ? 1 : 0;
  }

  const topIds = getTopChunkIds(results, k);

  for (let index = 0; index < topIds.length; index += 1) {
    if (expectedIds.has(topIds[index] ?? "")) {
      return 1 / (index + 1);
    }
  }

  return 0;
}

export function ndcgAtK(results: RankedResult[], expected: string[], k: number): number {
  const expectedIds = new Set(expected);
  const topIds = getTopChunkIds(results, k);

  if (expectedIds.size === 0) {
    return topIds.length === 0 ? 1 : 0;
  }

  const dcg = topIds.reduce((total, chunkId, index) => {
    if (!expectedIds.has(chunkId)) {
      return total;
    }

    return total + 1 / Math.log2(index + 2);
  }, 0);

  const idealResultCount = Math.min(expectedIds.size, k);
  const idealDcg = Array.from({ length: idealResultCount }).reduce<number>(
    (total, _value, index) => total + 1 / Math.log2(index + 2),
    0
  );

  if (idealDcg === 0) {
    return 0;
  }

  return dcg / idealDcg;
}

export function citationFidelityRate(results: RankedResult[], _expected: string[], k: number): number {
  const exactnessValues = results.slice(0, Math.max(0, k)).flatMap((result) => {
    if (typeof result === "string") {
      return [];
    }

    return [result.citation.exactness];
  });

  if (exactnessValues.length === 0) {
    return 1;
  }

  const validCitations = exactnessValues.filter(
    (exactness) => exactness === "exact" || exactness === "derived"
  );

  return validCitations.length / exactnessValues.length;
}

export function latencyP50(results: LatencySample[], _expected: string[], _k: number): number {
  return percentile(results, 0.5);
}

export function latencyP95(results: LatencySample[], _expected: string[], _k: number): number {
  return percentile(results, 0.95);
}

function getTopChunkIds(results: RankedResult[], k: number): string[] {
  return results
    .slice(0, Math.max(0, k))
    .flatMap((result) => {
      if (typeof result === "string") {
        return [result];
      }

      return [result.chunk.chunkId];
    });
}

function percentile(results: LatencySample[], percentileValue: number): number {
  const samples = results
    .flatMap((result) => {
      if (typeof result === "number") {
        return Number.isFinite(result) ? [result] : [];
      }

      return Number.isFinite(result.timingMs) ? [result.timingMs] : [];
    })
    .sort((left, right) => left - right);

  if (samples.length === 0) {
    return 0;
  }

  const index = Math.max(0, Math.ceil(samples.length * percentileValue) - 1);
  return samples[index] ?? 0;
}
