import { KnowledgeChunk } from "../types";
import {
  pdfCitationExact,
  docxCitationExact,
  mdCitationExact,
  csvCitationExact,
  jsonCitationExact,
  yamlCitationExact,
} from "./citation-fixtures";

/**
 * Pre-built KnowledgeChunk fixtures for testing.
 * These represent typical chunks from each format.
 */

export const pdfChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-pdf-001",
  documentId: "doc-pdf-sample",
  text: "A core loop is the primary interaction cycle that players repeat throughout the game. It defines the moment-to-moment gameplay experience.",
  normalizedText:
    "A core loop is the primary interaction cycle that players repeat throughout the game. It defines the moment-to-moment gameplay experience.",
  sourceNodeIds: ["node-pdf-001"],
  primaryCitation: pdfCitationExact,
  secondaryCitations: [],
  sectionPath: ["Core Loops"],
  metadata: {
    category: "game-mechanics",
    tags: ["core-loop", "interaction"],
    sourceType: "pdf",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 28,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

export const docxChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-docx-001",
  documentId: "doc-docx-sample",
  text: "Feedback loops reinforce player actions with immediate consequences. Positive feedback rewards player skill, while negative feedback creates challenge and tension.",
  normalizedText:
    "Feedback loops reinforce player actions with immediate consequences. Positive feedback rewards player skill, while negative feedback creates challenge and tension.",
  sourceNodeIds: ["node-docx-001"],
  primaryCitation: docxCitationExact,
  secondaryCitations: [],
  sectionPath: ["Game Design Fundamentals", "Core Loops", "Feedback Loops"],
  metadata: {
    category: "game-mechanics",
    tags: ["feedback", "loops"],
    sourceType: "docx",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 26,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

export const mdChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-md-001",
  documentId: "doc-md-sample",
  text: "Progression systems provide long-term goals and a sense of advancement. They keep players engaged beyond the core loop by offering new challenges and rewards.",
  normalizedText:
    "Progression systems provide long-term goals and a sense of advancement. They keep players engaged beyond the core loop by offering new challenges and rewards.",
  sourceNodeIds: ["node-md-001"],
  primaryCitation: mdCitationExact,
  secondaryCitations: [],
  sectionPath: ["Core Loops", "Progression Systems"],
  metadata: {
    category: "game-mechanics",
    tags: ["progression", "advancement"],
    sourceType: "md",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 27,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

export const csvChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-csv-001",
  documentId: "doc-csv-sample",
  text: "Core Loop | Interaction | Primary repeated action cycle | Medium | High",
  normalizedText:
    "Core Loop | Interaction | Primary repeated action cycle | Medium | High",
  sourceNodeIds: ["node-csv-001"],
  primaryCitation: csvCitationExact,
  secondaryCitations: [],
  sectionPath: ["mechanics"],
  metadata: {
    category: "reference",
    tags: ["mechanics", "csv"],
    sourceType: "csv",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 12,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

export const jsonChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-json-001",
  documentId: "doc-json-sample",
  text: "Combat Loop: Player engages in turn-based combat with enemies. Steps: Select action, Execute action, Receive feedback, Enemy responds.",
  normalizedText:
    "Combat Loop: Player engages in turn-based combat with enemies. Steps: Select action, Execute action, Receive feedback, Enemy responds.",
  sourceNodeIds: ["node-json-001"],
  primaryCitation: jsonCitationExact,
  secondaryCitations: [],
  sectionPath: ["game_design", "core_loops"],
  metadata: {
    category: "game-mechanics",
    tags: ["combat", "loop"],
    sourceType: "json",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 24,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

export const yamlChunkFixture: KnowledgeChunk = {
  chunkId: "chunk-yaml-001",
  documentId: "doc-yaml-sample",
  text: "Combat System: Turn-based combat with action economy. Complexity: high. Progression System: Level-based character advancement. Complexity: medium.",
  normalizedText:
    "Combat System: Turn-based combat with action economy. Complexity: high. Progression System: Level-based character advancement. Complexity: medium.",
  sourceNodeIds: ["node-yaml-001"],
  primaryCitation: yamlCitationExact,
  secondaryCitations: [],
  sectionPath: ["game_design", "core_mechanics"],
  metadata: {
    category: "game-mechanics",
    tags: ["combat", "progression"],
    sourceType: "yaml",
    language: "en",
    topic: "game-design",
  },
  tokenCount: 25,
  chunkStrategyVersion: "1.0",
  embeddingReady: false,
};

/**
 * Get a chunk fixture by source type.
 */
export function getChunkFixtureByType(sourceType: string): KnowledgeChunk {
  switch (sourceType) {
    case "pdf":
      return pdfChunkFixture;
    case "docx":
      return docxChunkFixture;
    case "md":
      return mdChunkFixture;
    case "csv":
      return csvChunkFixture;
    case "json":
      return jsonChunkFixture;
    case "yaml":
      return yamlChunkFixture;
    default:
      throw new Error(`Unknown source type: ${sourceType}`);
  }
}

/**
 * Get all chunk fixtures.
 */
export function getAllChunkFixtures(): KnowledgeChunk[] {
  return [
    pdfChunkFixture,
    docxChunkFixture,
    mdChunkFixture,
    csvChunkFixture,
    jsonChunkFixture,
    yamlChunkFixture,
  ];
}
