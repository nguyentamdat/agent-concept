import { z } from "zod";

export const SourceDocumentSchema = z.object({
  documentId: z.string().describe("Stable hash(uri)"),
  uri: z.string().describe("Document URI"),
  sourceType: z.enum(["pdf", "docx", "md", "txt", "csv", "json", "yaml"]),
  contentHash: z.string().describe("SHA-256 for change detection"),
  displayTitle: z.string(),
  language: z.string().optional(),
  ingestionVersion: z.string(),
  parseStatus: z.enum(["success", "partial", "failed"]),
  warnings: z.array(z.string()),
});

export type SourceDocument = z.infer<typeof SourceDocumentSchema>;

export const DocumentStructureNodeSchema = z.object({
  nodeId: z.string(),
  documentId: z.string(),
  nodeType: z.enum([
    "section",
    "paragraph",
    "table",
    "row",
    "cell",
    "list",
    "keyValue",
    "rawBlock",
  ]),
  text: z.string(),
  path: z.string().describe("Format-specific locator"),
  sectionPath: z
    .array(z.string())
    .optional()
    .describe("DOCX section ancestry"),
  pageNumber: z.number().optional().describe("PDF/DOCX"),
  rowNumber: z.number().optional().describe("CSV"),
  columnName: z.string().optional().describe("CSV"),
  tokenCount: z.number(),
});

export type DocumentStructureNode = z.infer<typeof DocumentStructureNodeSchema>;
