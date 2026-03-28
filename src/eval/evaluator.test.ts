import { describe, expect, it } from "bun:test";
import { GOLDEN_DATASET } from "./golden-dataset";
import {
  DEFAULT_RETRIEVAL_EVAL_REPORT_PATH,
  evaluateRetrieval,
} from "./evaluator";

describe("evaluateRetrieval", () => {
  it("writes a report with the required aggregate keys", async () => {
    const report = await evaluateRetrieval();
    const writtenReport = (await Bun.file(DEFAULT_RETRIEVAL_EVAL_REPORT_PATH).json()) as Record<
      string,
      unknown
    >;

    expect(report.totalQueries).toBe(GOLDEN_DATASET.length);
    expect(writtenReport).toHaveProperty("runAt");
    expect(writtenReport).toHaveProperty("totalQueries", GOLDEN_DATASET.length);
    expect(writtenReport).toHaveProperty("recall@5");
    expect(writtenReport).toHaveProperty("mrr");
    expect(writtenReport).toHaveProperty("ndcg@5");
    expect(writtenReport).toHaveProperty("citation_fidelity_rate");
    expect(writtenReport).toHaveProperty("latency_p50_ms");
    expect(writtenReport).toHaveProperty("latency_p95_ms");
    expect(writtenReport).toHaveProperty("perQuery");
    expect(Array.isArray(writtenReport.perQuery)).toBe(true);
  });
});
