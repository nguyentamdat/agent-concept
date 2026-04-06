import type { KnowledgeIndex, KnowledgeIndexStats } from "./types";
import { OramaIndex } from "./orama-index";

export type { KnowledgeIndex, KnowledgeIndexStats } from "./types";

export { OramaIndex } from "./orama-index";

export function createKnowledgeIndex(): KnowledgeIndex {
  return new OramaIndex();
}

export { focusedSearch, getRelatedEntities } from "./focused-retrieval";
export { deepSearch, type DeepSearchResult, type DeepSearchOptions } from "./deep-retrieval";
