import { writeFile } from "node:fs/promises";
import type { KnowledgeChunk, SearchKnowledgeRequest, SearchKnowledgeResult } from "../types";
import { OramaIndex } from "../index/index";
import { getAllChunkFixtures } from "../test-utils";
import { DEFAULT_EVAL_TOP_K, GOLDEN_DATASET, type GoldenQuery } from "./golden-dataset";
import {
  citationFidelityRate,
  graphExpansionHitRate,
  latencyP50,
  latencyP95,
  mrr,
  ndcgAtK,
  recallAtK,
} from "./metrics";

export const DEFAULT_RETRIEVAL_EVAL_REPORT_PATH = ".sisyphus/evidence/retrieval-eval-report.json";

export interface EvaluatorQueryReport {
  query: string;
  expectedChunkIds: string[];
  returnedChunkIds: string[];
  filters?: GoldenQuery["filters"];
  topK: number;
  latencyMs: number;
  "recall@k": number;
  mrr: number;
  "ndcg@k": number;
  citation_fidelity_rate: number;
}

export interface RetrievalEvalReport {
  runAt: string;
  totalQueries: number;
  "recall@5": number;
  mrr: number;
  "ndcg@5": number;
  citation_fidelity_rate: number;
  latency_p50_ms: number;
  latency_p95_ms: number;
  graphExpansionHitRate: number;
  perQuery: EvaluatorQueryReport[];
}

export interface EvaluateRetrievalOptions {
  dataset?: GoldenQuery[];
  chunks?: KnowledgeChunk[];
  reportPath?: string;
  index?: OramaIndex;
}

export async function evaluateRetrieval(
  options: EvaluateRetrievalOptions = {}
): Promise<RetrievalEvalReport> {
  const dataset = options.dataset ?? GOLDEN_DATASET;
  const chunks = options.chunks ?? getAllChunkFixtures();
  const reportPath = options.reportPath ?? DEFAULT_RETRIEVAL_EVAL_REPORT_PATH;
  const index = options.index ?? new OramaIndex();

  await index.build(chunks);

  const evaluatedQueries = dataset.map((goldenQuery) => {
    const response = index.search(createSearchRequest(goldenQuery));
    return {
      goldenQuery,
      response,
    };
  });

  const perQuery = evaluatedQueries.map(({ goldenQuery, response }) =>
    createPerQueryReport(goldenQuery, response)
  );
  const latencies = evaluatedQueries.map(({ response }) => response.timingMs);
  const aggregateResults = evaluatedQueries.flatMap(({ response }) => response.results);

  // Compute graphExpansionHitRate: compare focused vs lexical on same queries
  const focusedChunkIdSets: string[][] = [];
  const lexicalChunkIdSets: string[][] = [];
  for (const { goldenQuery } of evaluatedQueries) {
    const focusedReq = { ...createSearchRequest(goldenQuery), retrievalMode: "focused" as const };
    const lexicalReq = createSearchRequest(goldenQuery);
    const focusedRes = index.search(focusedReq);
    const lexicalRes = index.search(lexicalReq);
    focusedChunkIdSets.push(focusedRes.results.map((r) => r.chunk.chunkId));
    lexicalChunkIdSets.push(lexicalRes.results.map((r) => r.chunk.chunkId));
  }

  const report: RetrievalEvalReport = {
    runAt: new Date().toISOString(),
    totalQueries: perQuery.length,
    "recall@5": roundMetric(
      average(perQuery.map((queryReport) => queryReport["recall@k"]))
    ),
    mrr: roundMetric(average(perQuery.map((queryReport) => queryReport.mrr))),
    "ndcg@5": roundMetric(average(perQuery.map((queryReport) => queryReport["ndcg@k"]))),
    citation_fidelity_rate: roundMetric(
      citationFidelityRate(aggregateResults, [], aggregateResults.length)
    ),
    latency_p50_ms: roundMetric(latencyP50(latencies, [], DEFAULT_EVAL_TOP_K)),
    latency_p95_ms: roundMetric(latencyP95(latencies, [], DEFAULT_EVAL_TOP_K)),
    graphExpansionHitRate: roundMetric(graphExpansionHitRate(focusedChunkIdSets, lexicalChunkIdSets)),
    perQuery,
  };

  await writeFile(reportPath, `${JSON.stringify(report, null, 2)}\n`);
  console.log(JSON.stringify(report, null, 2));

  return report;
}

function createSearchRequest(goldenQuery: GoldenQuery): SearchKnowledgeRequest {
  return {
    query: goldenQuery.query,
    filters: goldenQuery.filters,
    topK: goldenQuery.topK,
    retrievalMode: "lexical",
    includeRawText: true,
    includeStructured: false,
  };
}

function createPerQueryReport(
  goldenQuery: GoldenQuery,
  response: SearchKnowledgeResult
): EvaluatorQueryReport {
  return {
    query: goldenQuery.query,
    expectedChunkIds: [...goldenQuery.expectedChunkIds],
    returnedChunkIds: response.results.map((result) => result.chunk.chunkId),
    filters: goldenQuery.filters,
    topK: goldenQuery.topK,
    latencyMs: roundMetric(response.timingMs),
    "recall@k": roundMetric(recallAtK(response.results, goldenQuery.expectedChunkIds, goldenQuery.topK)),
    mrr: roundMetric(mrr(response.results, goldenQuery.expectedChunkIds, goldenQuery.topK)),
    "ndcg@k": roundMetric(ndcgAtK(response.results, goldenQuery.expectedChunkIds, goldenQuery.topK)),
    citation_fidelity_rate: roundMetric(
      citationFidelityRate(response.results, goldenQuery.expectedChunkIds, goldenQuery.topK)
    ),
  };
}

function average(values: number[]): number {
  if (values.length === 0) {
    return 0;
  }

  return values.reduce((total, value) => total + value, 0) / values.length;
}

function roundMetric(value: number): number {
  return Number(value.toFixed(4));
}

if (import.meta.main) {
  await evaluateRetrieval();
}
