import { z } from "zod";
import { CitationRefSchema } from "./citation";

export const KnowledgeChunkSchema = z.object({
  chunkId: z
    .string()
    .describe("Stable: hash(documentId + path + chunkIndex)"),
  documentId: z.string(),
  text: z.string(),
  normalizedText: z.string(),
  sourceNodeIds: z.array(z.string()),
  primaryCitation: CitationRefSchema,
  secondaryCitations: z.array(CitationRefSchema),
  sectionPath: z.array(z.string()),
  metadata: z.object({
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sourceType: z.string(),
    language: z.string().optional(),
    topic: z.string().optional(),
  }),
  tokenCount: z.number(),
  chunkStrategyVersion: z.string(),
  embeddingReady: z.boolean().describe("False in MVP"),
});

export type KnowledgeChunk = z.infer<typeof KnowledgeChunkSchema>;
