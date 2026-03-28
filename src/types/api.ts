import { z } from "zod";
import { KnowledgeChunkSchema } from "./chunk";
import { CitationRefSchema } from "./citation";
import { SourceDocumentSchema } from "./document";
import { DocumentStructureNodeSchema } from "./document";
import { StructuredExtractionSchema } from "./extraction";

export const SearchKnowledgeRequestSchema = z.object({
  query: z.string(),
  filters: z
    .object({
      category: z.string().optional(),
      tags: z.array(z.string()).optional(),
      sourceType: z.string().optional(),
      language: z.string().optional(),
    })
    .optional(),
  topK: z.number(),
  retrievalMode: z.enum(["lexical"]),
  includeRawText: z.boolean(),
  includeStructured: z.boolean(),
  minScore: z.number().optional(),
});

export type SearchKnowledgeRequest = z.infer<typeof SearchKnowledgeRequestSchema>;

export const SearchKnowledgeResultSchema = z.object({
  results: z.array(
    z.object({
      chunk: KnowledgeChunkSchema,
      score: z.number(),
      scoreBreakdown: z.record(z.string(), z.number()).optional(),
      citation: CitationRefSchema,
      matchedTerms: z.array(z.string()).optional(),
    })
  ),
  timingMs: z.number(),
  indexVersion: z.string(),
});

export type SearchKnowledgeResult = z.infer<typeof SearchKnowledgeResultSchema>;

export const GetDocumentRequestSchema = z.object({
  documentId: z.string(),
  view: z.enum(["raw", "normalized", "structure", "chunks"]),
});

export type GetDocumentRequest = z.infer<typeof GetDocumentRequestSchema>;

export const GetDocumentResultSchema = z.object({
  document: SourceDocumentSchema,
  data: z.union([
    z.string(),
    z.array(DocumentStructureNodeSchema),
    z.array(KnowledgeChunkSchema),
  ]),
  rawMimeType: z.string().optional(),
  sizeBytes: z.number().optional(),
});

export type GetDocumentResult = z.infer<typeof GetDocumentResultSchema>;

export const GetExtractionRequestSchema = z.object({
  documentId: z.string(),
  schemaName: z.string().optional(),
});

export type GetExtractionRequest = z.infer<typeof GetExtractionRequestSchema>;

export const GetExtractionResultSchema = z.object({
  document: SourceDocumentSchema,
  extractions: z.array(StructuredExtractionSchema),
});

export type GetExtractionResult = z.infer<typeof GetExtractionResultSchema>;
