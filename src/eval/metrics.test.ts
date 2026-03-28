import { describe, expect, it } from "bun:test";
import {
  docxChunkFixture,
  mdChunkFixture,
  pdfChunkFixture,
  mdCitationDerived,
} from "../test-utils";
import {
  citationFidelityRate,
  latencyP50,
  latencyP95,
  mrr,
  ndcgAtK,
  recallAtK,
} from "./metrics";

describe("eval metrics", () => {
  it("computes recall@k from the top ranked chunk ids", () => {
    const results = [
      createRankedResult(pdfChunkFixture),
      createRankedResult(docxChunkFixture),
      createRankedResult(mdChunkFixture),
    ];

    expect(recallAtK(results, [docxChunkFixture.chunkId, mdChunkFixture.chunkId], 2)).toBe(0.5);
  });

  it("computes reciprocal rank for the first relevant result", () => {
    const results = [
      createRankedResult(pdfChunkFixture),
      createRankedResult(docxChunkFixture),
      createRankedResult(mdChunkFixture),
    ];

    expect(mrr(results, [docxChunkFixture.chunkId, mdChunkFixture.chunkId], 3)).toBe(0.5);
  });

  it("computes ndcg@k for a perfect ordering", () => {
    const results = [createRankedResult(docxChunkFixture), createRankedResult(mdChunkFixture)];

    expect(ndcgAtK(results, [docxChunkFixture.chunkId, mdChunkFixture.chunkId], 2)).toBe(1);
  });

  it("counts exact and derived citations as faithful", () => {
    const results = [
      createRankedResult(pdfChunkFixture),
      createRankedResult(mdChunkFixture, mdCitationDerived),
      createRankedResult(docxChunkFixture, {
        ...docxChunkFixture.primaryCitation,
        exactness: "approximate",
      }),
    ];

    expect(citationFidelityRate(results, [], 3)).toBeCloseTo(2 / 3, 5);
  });

  it("computes latency percentiles with nearest-rank semantics", () => {
    const timings = [5, 10, 20, 40, 100];

    expect(latencyP50(timings, [], 5)).toBe(20);
    expect(latencyP95(timings, [], 5)).toBe(100);
  });
});

function createRankedResult(
  chunk: typeof pdfChunkFixture,
  citation = chunk.primaryCitation
) {
  return {
    chunk,
    score: 1,
    citation,
    matchedTerms: [],
    scoreBreakdown: { bm25: 1 },
  };
}
