import { z } from "zod";
import { CitationRefSchema } from "./citation";

export const StructuredExtractionSchema = z.object({
  documentId: z.string(),
  schemaName: z.string(),
  records: z.array(z.record(z.string(), z.any())),
  evidence: z.array(
    z.object({
      recordIndex: z.number(),
      citation: CitationRefSchema,
      fieldPath: z.string(),
    })
  ),
  extractionStatus: z.enum(["success", "partial", "failed"]),
  warnings: z.array(z.string()),
});

export type StructuredExtraction = z.infer<typeof StructuredExtractionSchema>;
