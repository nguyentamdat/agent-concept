import { z } from "zod";

export const CitationRefSchema = z.object({
  documentId: z.string(),
  citationKind: z.enum([
    "page",
    "section",
    "row",
    "jsonPath",
    "yamlPath",
    "lineRange",
    "unknown",
  ]),
  pageStart: z.number().optional(),
  pageEnd: z.number().optional(),
  sectionPath: z.string().optional(),
  rowStart: z.number().optional(),
  rowEnd: z.number().optional(),
  jsonPath: z.string().optional(),
  yamlPath: z.string().optional(),
  locatorText: z.string().optional().describe("Human-readable fallback"),
  exactness: z.enum(["exact", "derived", "approximate", "unavailable"]),
});

export type CitationRef = z.infer<typeof CitationRefSchema>;
