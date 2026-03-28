import type { SearchKnowledgeRequest } from "../types";

export const DEFAULT_EVAL_TOP_K = 5;

export interface GoldenQuery
  extends Pick<SearchKnowledgeRequest, "query" | "filters" | "topK"> {
  expectedChunkIds: string[];
}

export const GOLDEN_DATASET: GoldenQuery[] = [
  {
    query: "primary interaction cycle players repeat",
    expectedChunkIds: ["chunk-pdf-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "positive feedback rewards player skill",
    expectedChunkIds: ["chunk-docx-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "long-term goals sense of advancement",
    expectedChunkIds: ["chunk-md-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "primary repeated action cycle medium high",
    expectedChunkIds: ["chunk-csv-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "turn-based combat enemy responds",
    expectedChunkIds: ["chunk-json-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "action economy complexity high",
    expectedChunkIds: ["chunk-yaml-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "moment-to-moment gameplay experience",
    expectedChunkIds: ["chunk-pdf-001"],
    filters: { sourceType: "pdf" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "immediate consequences challenge tension",
    expectedChunkIds: ["chunk-docx-001"],
    filters: { sourceType: "docx" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "new challenges and rewards",
    expectedChunkIds: ["chunk-md-001"],
    filters: { sourceType: "md" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "row reference repeated action cycle",
    expectedChunkIds: ["chunk-csv-001"],
    filters: { sourceType: "csv" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "select action execute action receive feedback",
    expectedChunkIds: ["chunk-json-001"],
    filters: { sourceType: "json" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "level-based character advancement",
    expectedChunkIds: ["chunk-yaml-001"],
    filters: { sourceType: "yaml" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "plain text foundational design principles",
    expectedChunkIds: [],
    filters: { sourceType: "txt" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "core loop",
    expectedChunkIds: ["chunk-pdf-001", "chunk-csv-001", "chunk-json-001"],
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "turn-based combat",
    expectedChunkIds: ["chunk-json-001", "chunk-yaml-001"],
    filters: { category: "game-mechanics" },
    topK: DEFAULT_EVAL_TOP_K,
  },
  {
    query: "advancement rewards",
    expectedChunkIds: ["chunk-md-001", "chunk-yaml-001"],
    filters: { tags: ["progression"] },
    topK: DEFAULT_EVAL_TOP_K,
  },
];
