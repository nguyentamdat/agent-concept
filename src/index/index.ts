import type { KnowledgeIndex, KnowledgeIndexStats } from "./types";
import { OramaIndex } from "./orama-index";

export type { KnowledgeIndex, KnowledgeIndexStats } from "./types";

export { OramaIndex } from "./orama-index";

export function createKnowledgeIndex(): KnowledgeIndex {
  return new OramaIndex();
}
